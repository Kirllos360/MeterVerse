import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { swaggerSpec } from '../../src/swagger.js';

vi.mock('../../src/db.js', async () => {
  const { prisma } = await import('../helpers/mock-prisma.js');
  prisma.$transaction = vi.fn((cb) => cb(prisma));
  return { prisma };
});
vi.mock('../../src/server.js', async () => {
  const { prisma } = await import('../helpers/mock-prisma.js');
  prisma.$transaction = vi.fn((cb) => cb(prisma));
  return { prisma };
});
vi.mock('../../src/services/notification-engine.js', () => ({ processEvent: vi.fn().mockResolvedValue() }));
vi.mock('jsonwebtoken', () => ({ default: { sign: vi.fn().mockReturnValue('mock-token'), verify: vi.fn().mockReturnValue({ sub: 'admin-id', email: 'admin@test.com', role: 'super_admin', system: 'admin' }) } }));

import { prisma } from '../helpers/mock-prisma.js';
import express from 'express';
import { customersRouter } from '../../src/routes/customers.js';
import { metersRouter } from '../../src/routes/meters.js';
import { authRouter } from '../../src/routes/auth.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/customers', customersRouter);
app.use('/api/meters', metersRouter);
app.use(errorHandler);

const AUTH = 'Bearer test-token';

describe('Contract Tests — OpenAPI Validation', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should have valid OpenAPI spec with required fields', () => {
    expect(swaggerSpec).toBeDefined();
    expect(swaggerSpec.info.title).toBe('MeterVerse API');
    expect(swaggerSpec.openapi).toBe('3.0.0');
    expect(swaggerSpec.paths).toBeDefined();
  });

  it('POST /api/auth/login should return 401 with bad credentials', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const res = await request(app).post('/api/auth/login').send({ email: 'bad@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('GET /api/customers should return 200 with auth', async () => {
    prisma.customer.findMany.mockResolvedValue([]);
    prisma.customer.count.mockResolvedValue(0);
    const res = await request(app).get('/api/customers').set('Authorization', AUTH);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('customers');
  });

  it('GET /api/customers/:id should return 404 for missing customer', async () => {
    prisma.customer.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/api/customers/bad-id').set('Authorization', AUTH);
    expect(res.status).toBe(404);
  });

  it('GET /api/meters should return 200 with auth', async () => {
    prisma.meter.findMany.mockResolvedValue([]);
    prisma.meter.count.mockResolvedValue(0);
    const res = await request(app).get('/api/meters').set('Authorization', AUTH);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('meters');
  });

  it('should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/customers');
    expect(res.status).toBe(401);
  });
});
