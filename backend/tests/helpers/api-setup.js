import { vi } from 'vitest';
import { prisma } from './mock-prisma.js';

vi.mock('../../src/db.js', () => ({ prisma }));
vi.mock('../../src/server.js', () => ({ prisma }));
vi.mock('jsonwebtoken', async () => {
  const jwt = { sign: vi.fn(), verify: vi.fn() };
  return { default: jwt };
});
vi.mock('bcryptjs', async () => ({ default: { compare: vi.fn() }, compare: vi.fn() }));

// Default mock: valid admin token
const jwt = (await import('jsonwebtoken')).default;
jwt.verify.mockReturnValue({
  sub: 'admin-id',
  email: 'admin@test.com',
  role: 'super_admin',
  system: 'admin',
});
jwt.sign.mockReturnValue('mock-jwt-token');

export { default as app } from './test-app.js';
export { prisma } from './mock-prisma.js';
export const mockAdminUser = {
  sub: 'admin-id',
  email: 'admin@test.com',
  role: 'super_admin',
  system: 'admin',
};
