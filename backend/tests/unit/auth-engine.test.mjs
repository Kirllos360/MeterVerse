import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/db.js', () => ({ prisma }));
vi.mock('speakeasy', async () => ({ default: { generateSecret: vi.fn(), totp: { verify: vi.fn() } }, generateSecret: vi.fn(), totp: { verify: vi.fn() } }));

vi.mock('jsonwebtoken', async () => {
  const jwt = {
    sign: vi.fn(),
    verify: vi.fn(),
  };
  return { default: jwt };
});

vi.mock('bcryptjs', async () => ({
  default: { compare: vi.fn() },
  compare: vi.fn(),
}));

// Must mock db.js AFTER the other mocks to ensure they exist when db.js is evaluated
vi.mock('../../src/db.js', () => ({ prisma }));

const jwt = (await import('jsonwebtoken')).default;
const bcryptMod = await import('bcryptjs');
const bcrypt = bcryptMod.default || bcryptMod;

process.env.JWT_SECRET = 'test-secret-key';

const { authenticateUser, verifyToken, verifyMfa } = await import('../../src/services/auth-engine.js');

const mockUser = {
  id: 'user-1',
  email: 'admin@meterverse.com',
  password: '$2a$10$hashedpassword',
  name: 'Admin User',
  role: 'super_admin',
  area: 1,
  project: null,
  tenant: null,
  language: 'en',
  theme: 'light',
  mfaEnabled: false,
  loginAttempts: 0,
  lockedUntil: null,
  lastLoginAt: null,
  lastFailedAt: null,
};

describe('auth-engine', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
  });

  describe('authenticateUser', () => {
    it('should login successfully with valid credentials (admin)', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-token');
      prisma.session.create.mockResolvedValue({ id: 'session-1' });

      const result = await authenticateUser('admin@meterverse.com', 'correct-password', 'admin');

      expect(result.success).toBe(true);
      expect(result.accessToken).toBe('mock-token');
      expect(result.user.role).toBe('super_admin');
      expect(result.user.permissions).toContain('all');
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ loginAttempts: 0, lockedUntil: null }),
        })
      );
    });

    it('should login successfully with valid credentials (user)', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, role: 'viewer' });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-token');
      prisma.session.create.mockResolvedValue({ id: 'session-2' });

      const result = await authenticateUser('user@test.com', 'correct-password', 'user');

      expect(result.success).toBe(true);
      expect(result.system).toBe('user');
      expect(result.redirect).toBe('/dashboard');
      expect(result.user).not.toHaveProperty('permissions');
    });

    it('should return 401 for unknown email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await authenticateUser('unknown@test.com', 'any-password');

      expect(result.success).toBe(false);
      expect(result.status).toBe(401);
      expect(result.error).toBe('Invalid credentials');
    });

    it('should return 401 for invalid password and increment attempts', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, loginAttempts: 2 });
      bcrypt.compare.mockResolvedValue(false);

      const result = await authenticateUser('admin@meterverse.com', 'wrong-password');

      expect(result.success).toBe(false);
      expect(result.status).toBe(401);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ loginAttempts: 3 }),
        })
      );
    });

    it('should lock account after 5 failed attempts', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, loginAttempts: 4 });
      bcrypt.compare.mockResolvedValue(false);

      const result = await authenticateUser('admin@meterverse.com', 'wrong-password');

      expect(result.success).toBe(false);
      expect(result.status).toBe(401);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ loginAttempts: 5, lockedUntil: expect.any(Date) }),
        })
      );
    });

    it('should return 429 for locked account', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        lockedUntil: new Date(Date.now() + 600000),
      });

      const result = await authenticateUser('admin@meterverse.com', 'any-password');

      expect(result.success).toBe(false);
      expect(result.status).toBe(429);
      expect(result.error).toContain('Account locked');
    });

    it('should require MFA when user has it enabled', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, mfaEnabled: true });
      bcrypt.compare.mockResolvedValue(true);

      const result = await authenticateUser('admin@meterverse.com', 'correct-password');

      expect(result.success).toBe(true);
      expect(result.mfaRequired).toBe(true);
      expect(result).not.toHaveProperty('accessToken');
    });

    it('should return 400 for invalid system type', async () => {
      const result = await authenticateUser('admin@test.com', 'password', 'invalid-system');

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.error).toBe('Invalid system type');
    });
  });

  describe('verifyToken', () => {
    it('should return valid for a correct token', () => {
      jwt.verify.mockReturnValue({ sub: 'user-1', email: 'admin@test.com', system: 'admin' });

      const result = verifyToken('valid-token');

      expect(result.valid).toBe(true);
      expect(result.user.email).toBe('admin@test.com');
    });

    it('should return 403 for wrong system type', () => {
      jwt.verify.mockReturnValue({ sub: 'user-1', system: 'mobile' });

      const result = verifyToken('mobile-token', ['admin']);

      expect(result.valid).toBe(false);
      expect(result.status).toBe(403);
      expect(result.error).toBe('Token not valid for this system');
    });

    it('should return 401 for expired token', () => {
      const err = new Error('jwt expired');
      err.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => { throw err; });

      const result = verifyToken('expired-token');

      expect(result.valid).toBe(false);
      expect(result.status).toBe(401);
      expect(result.error).toBe('Token expired');
    });

    it('should return 401 for invalid token', () => {
      jwt.verify.mockImplementation(() => { throw new Error('invalid signature'); });

      const result = verifyToken('bad-token');

      expect(result.valid).toBe(false);
      expect(result.status).toBe(401);
      expect(result.error).toBe('Invalid token');
    });
  });

  describe('verifyMfa', () => {
    it('should return error if MFA not configured', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', mfaSecret: null });
      const result = await verifyMfa('user-1', '123456');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('MFA not configured');
    });
  });
});
