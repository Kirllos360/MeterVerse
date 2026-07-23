import { vi } from 'vitest';

function createMockModel() {
  return { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn().mockResolvedValue(null), findFirst: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({}), update: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue({}), upsert: vi.fn().mockResolvedValue({}), count: vi.fn().mockResolvedValue(0), aggregate: vi.fn().mockResolvedValue({ _sum: { amount: null } }) };
}

vi.mock('../../src/db.js', () => {
  const prisma = { user: createMockModel(), meter: createMockModel(), reading: createMockModel(), invoice: createMockModel(), customer: createMockModel(), payment: createMockModel(), session: createMockModel(), auditEntry: createMockModel(), notification: createMockModel() };
  return { prisma };
});
vi.mock('../../src/server.js', () => {
  const prisma = { user: createMockModel(), meter: createMockModel(), reading: createMockModel(), invoice: createMockModel(), customer: createMockModel(), payment: createMockModel(), session: createMockModel(), auditEntry: createMockModel(), notification: createMockModel() };
  return { prisma };
});
vi.mock('../../src/services/notification-engine.js', () => ({ processEvent: vi.fn().mockResolvedValue() }));
vi.mock('jsonwebtoken', () => ({ default: { sign: vi.fn().mockReturnValue('mock-token'), verify: vi.fn().mockReturnValue({ sub: 'admin-id', email: 'admin@test.com', role: 'super_admin', system: 'admin' }) } }));

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { authRouter } from '../../src/routes/auth.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

// Re-import mocked prisma from db
const { prisma } = await import('../../src/db.js');

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use(errorHandler);

describe('API — Auth Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-set findUnique for the default null return
    prisma.user.findUnique.mockResolvedValue(null);
  });

  it('should return Zod validation error without credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(500);
    expect(res.text).toContain('invalid_type');
  });

  it('should return 401 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@test.com', password: 'x' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('GET /api/auth/me — unauthorized without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
