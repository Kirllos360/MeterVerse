import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/server.js', () => ({ prisma }));
vi.mock('../../src/services/notification-engine.js', () => ({ processEvent: vi.fn().mockResolvedValue() }));

vi.mock('jsonwebtoken', async () => {
  const jwt = {
    sign: vi.fn(),
    verify: vi.fn(),
  };
  return { default: jwt };
});

const jwt = (await import('jsonwebtoken')).default;

process.env.JWT_SECRET = 'test-secret-key';

const {
  authenticate,
  requireRole,
  requirePermission,
  requireAreaAccess,
  filterByArea,
  auditLog,
  authenticateApiKey,
  requireAccess,
} = await import('../../src/middleware/security.js');

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function mockReq(overrides = {}) {
  return {
    headers: {},
    originalUrl: '/api/test',
    ip: '127.0.0.1',
    correlationId: 'corr-123',
    method: 'GET',
    query: {},
    params: {},
    body: {},
    user: { sub: 'user-1', email: 'user@test.com', role: 'admin' },
    ...overrides,
  };
}

describe('C12 security middleware', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should reject requests without Authorization header', () => {
      const req = mockReq({ headers: {} });
      const res = mockRes();
      const next = vi.fn();

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject non-Bearer Authorization header', () => {
      const req = mockReq({ headers: { authorization: 'Basic abc' } });
      const res = mockRes();
      const next = vi.fn();

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should accept a valid Bearer token and attach user', () => {
      jwt.verify.mockReturnValue({ sub: 'user-1', role: 'admin', email: 'u@t.com' });
      const req = mockReq({ headers: { authorization: 'Bearer valid-token' } });
      const res = mockRes();
      const next = vi.fn();

      authenticate(req, res, next);

      expect(jwt.verify).toHaveBeenCalled();
      expect(req.user).toEqual({ sub: 'user-1', role: 'admin', email: 'u@t.com' });
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 TOKEN_EXPIRED for expired token', () => {
      const err = new Error('expired');
      err.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => { throw err; });
      const req = mockReq({ headers: { authorization: 'Bearer expired' } });
      const res = mockRes();
      const next = vi.fn();

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'TOKEN_EXPIRED' }));
    });

    it('should return 401 INVALID_TOKEN for invalid token', () => {
      jwt.verify.mockImplementation(() => { throw new Error('bad signature'); });
      const req = mockReq({ headers: { authorization: 'Bearer bad' } });
      const res = mockRes();
      const next = vi.fn();

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'INVALID_TOKEN' }));
    });
  });

  describe('requireRole', () => {
    it('should allow matching role', () => {
      const req = mockReq({ user: { role: 'admin' } });
      const res = mockRes();
      const next = vi.fn();

      requireRole('admin', 'super_admin')(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny non-matching role with audit', () => {
      const req = mockReq({ user: { role: 'viewer' } });
      const res = mockRes();
      const next = vi.fn();
      prisma.auditEntry.create.mockResolvedValue({});

      requireRole('admin')(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny when user absent', () => {
      const req = mockReq({ user: null });
      const res = mockRes();
      const next = vi.fn();
      prisma.auditEntry.create.mockResolvedValue({});

      requireRole('admin')(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requirePermission', () => {
    it('should allow super_admin without DB check', async () => {
      const req = mockReq({ user: { role: 'super_admin' } });
      const res = mockRes();
      const next = vi.fn();

      await requirePermission('customers.list')(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(prisma.role.findFirst).not.toHaveBeenCalled();
    });

    it('should allow admin via hardcoded role permissions', async () => {
      const req = mockReq({ user: { role: 'admin' } });
      const res = mockRes();
      const next = vi.fn();

      await requirePermission('customers.list')(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny viewer without matching permission', async () => {
      const req = mockReq({ user: { role: 'viewer' } });
      const res = mockRes();
      const next = vi.fn();
      prisma.role.findFirst.mockResolvedValue(null);
      prisma.auditEntry.create.mockResolvedValue({});

      await requirePermission('customers.create')(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow viewer read permission', async () => {
      const req = mockReq({ user: { role: 'viewer' } });
      const res = mockRes();
      const next = vi.fn();

      await requirePermission('customers.read')(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow custom role via DB permission path', async () => {
      const req = mockReq({ user: { role: 'custom_role' } });
      const res = mockRes();
      const next = vi.fn();
      prisma.role.findFirst.mockResolvedValue({
        permissions: [{ permission: { name: 'customers.list' } }],
      });

      await requirePermission('customers.list')(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireAreaAccess', () => {
    it('should allow super_admin', () => {
      const req = mockReq({ user: { role: 'super_admin' }, query: { area: 'cairo' } });
      const res = mockRes();
      const next = vi.fn();

      requireAreaAccess(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow matching user area', () => {
      const req = mockReq({ user: { role: 'operator', area: 'cairo' }, query: { area: 'cairo' } });
      const res = mockRes();
      const next = vi.fn();

      requireAreaAccess(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny mismatched area', () => {
      const req = mockReq({ user: { role: 'operator', area: 'cairo' }, query: { area: 'alex' } });
      const res = mockRes();
      const next = vi.fn();
      prisma.auditEntry.create.mockResolvedValue({});

      requireAreaAccess(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'AREA_RESTRICTED' }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow area-all user', () => {
      const req = mockReq({ user: { role: 'operator', area: 'all' }, query: { area: 'cairo' } });
      const res = mockRes();
      const next = vi.fn();

      requireAreaAccess(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 401 when user absent', () => {
      const req = mockReq({ user: null });
      const res = mockRes();
      const next = vi.fn();

      requireAreaAccess(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('filterByArea', () => {
    it('should inject area filter for scoped user', () => {
      const req = mockReq({ user: { role: 'operator', area: 'cairo' }, query: {} });
      const next = vi.fn();

      filterByArea(req, {}, next);

      expect(req.query.area).toBe('cairo');
      expect(next).toHaveBeenCalled();
    });

    it('should not filter for super_admin', () => {
      const req = mockReq({ user: { role: 'super_admin' }, query: {} });
      const next = vi.fn();

      filterByArea(req, {}, next);

      expect(req.query.area).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('auditLog', () => {
    it('should write audit entry with correlation id', () => {
      prisma.auditEntry.create.mockResolvedValue({});
      const req = mockReq();

      auditLog(req, 'test.action', { key: 'value' });

      expect(prisma.auditEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'test.action',
            actor: 'user@test.com',
            actorId: 'user-1',
            correlationId: 'corr-123',
          }),
        })
      );
    });

    it('should mark failure status when details.error present', () => {
      prisma.auditEntry.create.mockResolvedValue({});
      const req = mockReq();

      auditLog(req, 'test.failure', { error: 'boom' });

      const call = prisma.auditEntry.create.mock.calls[0][0];
      expect(call.data.status).toBe('failure');
    });

    it('should not throw when prisma write fails', () => {
      prisma.auditEntry.create.mockRejectedValue(new Error('db down'));
      const req = mockReq();

      expect(() => auditLog(req, 'test.action')).not.toThrow();
    });
  });

  describe('authenticateApiKey', () => {
    it('should return 401 without api key or bearer', async () => {
      const req = mockReq({ headers: {} });
      const res = mockRes();
      const next = vi.fn();

      await authenticateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should allow through when Bearer present (falls back to JWT)', async () => {
      const req = mockReq({ headers: { authorization: 'Bearer token' } });
      const res = mockRes();
      const next = vi.fn();

      await authenticateApiKey(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject invalid api key', async () => {
      const req = mockReq({ headers: { 'x-api-key': 'bad-key' } });
      const res = mockRes();
      const next = vi.fn();
      prisma.apiKey.findFirst.mockResolvedValue(null);

      await authenticateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid API key' });
    });

    it('should accept valid api key and attach service user', async () => {
      const req = mockReq({ headers: { 'x-api-key': 'good-key' } });
      const res = mockRes();
      const next = vi.fn();
      prisma.apiKey.findFirst.mockResolvedValue({ id: 'key-1', key: 'good-key', name: 'svc' });
      prisma.apiKey.update.mockResolvedValue({});

      await authenticateApiKey(req, res, next);

      expect(req.user).toEqual(expect.objectContaining({ role: 'service', apiKey: true }));
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireAccess (object-level)', () => {
    it('should allow super_admin', async () => {
      const req = mockReq({ user: { role: 'super_admin' } });
      const res = mockRes();
      const next = vi.fn();

      const mw = await requireAccess('Meter', 'm-1');
      await mw(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 404 for missing resource', async () => {
      const req = mockReq({ user: { role: 'operator' } });
      const res = mockRes();
      const next = vi.fn();
      prisma.meter.findUnique.mockResolvedValue(null);

      const mw = await requireAccess('Meter', 'missing');
      await mw(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should allow when permission scoped to resource area', async () => {
      const req = mockReq({ user: { role: 'operator' } });
      const res = mockRes();
      const next = vi.fn();
      prisma.meter.findUnique.mockResolvedValue({ id: 'm-1', areaId: 'area-1' });
      prisma.role.findUnique.mockResolvedValue({ id: 'role-1' });
      prisma.permissionOnRole.findFirst.mockResolvedValue({ id: 'perm-1' });

      const mw = await requireAccess('Meter', 'm-1');
      await mw(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny when permission not scoped', async () => {
      const req = mockReq({ user: { role: 'operator' } });
      const res = mockRes();
      const next = vi.fn();
      prisma.meter.findUnique.mockResolvedValue({ id: 'm-1', areaId: 'area-1' });
      prisma.role.findUnique.mockResolvedValue({ id: 'role-1' });
      prisma.permissionOnRole.findFirst.mockResolvedValue(null);

      const mw = await requireAccess('Meter', 'm-1');
      await mw(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
