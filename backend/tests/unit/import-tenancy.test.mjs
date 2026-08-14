import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/server.js', () => ({ prisma }));
vi.mock('../../src/services/notification-engine.js', () => ({ processEvent: vi.fn().mockResolvedValue() }));
vi.mock('../../src/db.js', () => ({ prisma, default: prisma }));

const { requirePermission } = await import('../../src/middleware/security.js');

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('P59-C/LR-4 tenancy/permission gating on import + settlement routes', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  it('documents.* permission required for import access (fail-closed for non-permissioned roles)', async () => {
    // viewer has only *.read/*.list -> documents.export etc are denied; documents.* admin-only
    const req = { user: { role: 'viewer', area: 'area-a' }, query: {}, params: {}, body: {}, headers: {}, ip: '127.0.0.1', method: 'GET', originalUrl: '/api/imports/types' };
    const res = mockRes();
    const next = vi.fn();
    prisma.role.findFirst.mockResolvedValue(null); // no DB custom role
    prisma.auditEntry.create.mockResolvedValue({});

    await requirePermission('documents.*')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('admin has documents.* permission (global), allowed', async () => {
    const req = { user: { role: 'admin' }, query: {}, params: {}, body: {} };
    const res = mockRes();
    const next = vi.fn();
    await requirePermission('documents.*')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('requireAccess still denies NULL-area resource for scoped user (import EXECUTE writes must respect tenancy later)', async () => {
    // Import EXECUTE will write Customer/Meter/Invoice/Payment - these must pass through
    // the same requireAccess fail-closed guard that protects the frozen population.
    const { requireAccess } = await import('../../src/middleware/security.js');
    const req = { user: { role: 'viewer', area: 'area-a', project: '' }, params: { id: 'inv-1' }, query: {} };
    const res = mockRes();
    const next = vi.fn();
    prisma.invoice.findUnique.mockResolvedValue({ id: 'inv-1', areaId: null }); // NULL-area invoice
    const mw = await requireAccess('Invoice', 'inv-1');
    await mw(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
