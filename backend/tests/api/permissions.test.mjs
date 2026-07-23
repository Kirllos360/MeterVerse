import { vi } from 'vitest';

function createMockModel() {
  return { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn().mockResolvedValue(null), findFirst: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({}), update: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue({}), upsert: vi.fn().mockResolvedValue({}), count: vi.fn().mockResolvedValue(0), aggregate: vi.fn().mockResolvedValue({ _sum: { amount: null } }) };
}

vi.mock('../../src/db.js', () => {
  const prisma = { customer: createMockModel(), meter: createMockModel(), reading: createMockModel(), invoice: createMockModel(), payment: createMockModel(), user: createMockModel(), session: createMockModel(), auditEntry: createMockModel(), notification: createMockModel() };
  return { prisma };
});
vi.mock('../../src/server.js', () => {
  const prisma = { customer: createMockModel(), meter: createMockModel(), reading: createMockModel(), invoice: createMockModel(), payment: createMockModel(), user: createMockModel(), session: createMockModel(), auditEntry: createMockModel(), notification: createMockModel() };
  return { prisma };
});
vi.mock('../../src/services/notification-engine.js', () => ({ processEvent: vi.fn().mockResolvedValue() }));
vi.mock('jsonwebtoken', () => ({ default: { sign: vi.fn().mockReturnValue('mock-token'), verify: vi.fn().mockReturnValue({ sub: 'admin-id', email: 'admin@test.com', role: 'super_admin', system: 'admin' }) } }));

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { customersRouter } from '../../src/routes/customers.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/api/customers', customersRouter);
app.use(errorHandler);

describe('API — Permission Checks', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 for authenticated request', async () => {
    const { prisma } = await import('../../src/db.js');
    prisma.customer.findMany.mockResolvedValue([]);
    prisma.customer.count.mockResolvedValue(0);
    const res = await request(app).get('/api/customers').set('Authorization', 'Bearer t');
    expect(res.status).toBe(200);
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/customers');
    expect(res.status).toBe(401);
  });
});
