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
import { readingsRouter } from '../../src/routes/readings.js';
import { invoicesRouter } from '../../src/routes/invoices.js';
import { paymentsRouter } from '../../src/routes/payments.js';
import { authRouter } from '../../src/routes/auth.js';
import { tariffsRouter } from '../../src/routes/tariffs.js';
import { simRouter } from '../../src/routes/sim.js';
import { errorHandler, correlationMiddleware } from '../../src/middleware/errorHandler.js';

const AUTH = 'Bearer test-token';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(correlationMiddleware);
  app.use('/api/auth', authRouter);
  app.use('/api/customers', customersRouter);
  app.use('/api/meters', metersRouter);
  app.use('/api/readings', readingsRouter);
  app.use('/api/invoices', invoicesRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/tariffs', tariffsRouter);
  app.use('/api/sim', simRouter);
  app.use(errorHandler);
  return app;
}

describe('Contract Tests — OpenAPI Validation', () => {
  let app;
  beforeEach(() => { vi.clearAllMocks(); app = createApp(); });

  it('should have valid OpenAPI spec', () => {
    expect(swaggerSpec).toBeDefined();
    expect(swaggerSpec.openapi).toBe('3.0.0');
    expect(Object.keys(swaggerSpec.paths || {}).length).toBeGreaterThan(5);
  });

  describe('Auth', () => {
    it('POST /api/auth/login — 200 with token', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: '1', email: 'admin@test.com', password: '$2b$10$hash', role: 'admin', name: 'Admin' });
      const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'pass123' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
    });
    it('POST /api/auth/login — 401 for wrong credentials', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      const res = await request(app).post('/api/auth/login').send({ email: 'x@x.com', password: 'wrong' });
      expect(res.status).toBe(401);
    });
  });

  describe('Customers', () => {
    it('GET /api/customers — 200 with paginated list', async () => {
      prisma.customer.findMany.mockResolvedValue([{ id: '1', name: 'Test', email: 't@t.com', status: 'active', createdAt: new Date(), phone: null, address: null, area: null }]);
      prisma.customer.count.mockResolvedValue(1);
      const res = await request(app).get('/api/customers').set('Authorization', AUTH).set('X-Dev-Mode', 'true');
      expect(res.status).toBe(200);
      expect(res.body.customers).toHaveLength(1);
    });
    it('GET /api/customers/:id — 200 with detail', async () => {
      prisma.customer.findFirst.mockResolvedValue({ id: '1', name: 'Test', email: 't@t.com', status: 'active', createdAt: new Date(), meters: [], invoices: [] });
      const res = await request(app).get('/api/customers/1').set('Authorization', AUTH).set('X-Dev-Mode', 'true');
      expect(res.status).toBe(200);
      expect(res.body.customer.name).toBe('Test');
    });
    it('GET /api/customers/:id — 404 for missing', async () => {
      prisma.customer.findFirst.mockResolvedValue(null);
      const res = await request(app).get('/api/customers/999').set('Authorization', AUTH).set('X-Dev-Mode', 'true');
      expect(res.status).toBe(404);
    });
    it('POST /api/customers — 201 on create', async () => {
      prisma.customer.create.mockResolvedValue({ id: '2', name: 'New', email: 'n@n.com', status: 'active' });
      const res = await request(app).post('/api/customers').set('Authorization', AUTH).set('X-Dev-Mode', 'true').send({ name: 'New', email: 'n@n.com' });
      expect(res.status).toBe(201);
    });
    it('POST /api/customers — 400 on validation fail', async () => {
      const res = await request(app).post('/api/customers').set('Authorization', AUTH).set('X-Dev-Mode', 'true').send({ email: 'x@x.com' });
      expect(res.status).toBe(400);
    });
  });

  describe('Meters', () => {
    it('GET /api/meters — 200 with list', async () => {
      prisma.meter.findMany.mockResolvedValue([{ id: '1', serial: 'MTR-001', type: 'electric', status: 'active', location: null, area: null }]);
      prisma.meter.count.mockResolvedValue(1);
      const res = await request(app).get('/api/meters').set('Authorization', AUTH).set('X-Dev-Mode', 'true');
      expect(res.status).toBe(200);
      expect(res.body.meters).toHaveLength(1);
    });
    it('POST /api/meters — 201 on create', async () => {
      prisma.meter.create.mockResolvedValue({ id: '2', serial: 'MTR-002', type: 'water', status: 'active' });
      const res = await request(app).post('/api/meters').set('Authorization', AUTH).set('X-Dev-Mode', 'true').send({ serial: 'MTR-002', type: 'water' });
      expect(res.status).toBe(201);
    });
    it('POST /api/meters — 400 on validation fail', async () => {
      const res = await request(app).post('/api/meters').set('Authorization', AUTH).set('X-Dev-Mode', 'true').send({ type: 'water' });
      expect(res.status).toBe(400);
    });
  });

  describe('Readings (T043-T045, T048)', () => {
    it('GET /api/readings — 200 with list', async () => {
      prisma.reading.findMany.mockResolvedValue([{ id: '1', meterId: 'm1', value: 100, unit: 'kWh', status: 'valid' }]);
      prisma.reading.count.mockResolvedValue(1);
      const res = await request(app).get('/api/readings').set('Authorization', AUTH).set('X-Dev-Mode', 'true');
      expect(res.status).toBe(200);
      expect(res.body.readings).toBeDefined();
    });
    it('POST /api/readings — 201 create reading (T043)', async () => {
      prisma.reading.findFirst.mockResolvedValue(null);
      prisma.reading.findMany.mockResolvedValue([]);
      prisma.reading.create.mockResolvedValue({ id: 'r1', meterId: 'm1', value: 100, unit: 'kWh', status: 'valid' });
      prisma.validationResult.create.mockResolvedValue({});
      const res = await request(app).post('/api/readings').set('Authorization', AUTH).set('X-Dev-Mode', 'true').send({ meterId: 'm1', value: 100 });
      expect(res.status).toBe(201);
    });
    it('POST /api/readings — 409 duplicate reading (T043)', async () => {
      prisma.reading.findFirst.mockResolvedValue({ id: 'existing', meterId: 'm1', value: 100 });
      const res = await request(app).post('/api/readings').set('Authorization', AUTH).set('X-Dev-Mode', 'true').send({ meterId: 'm1', value: 100 });
      expect(res.status).toBe(409);
    });
    it('POST /api/readings — 400 validation fail (T043)', async () => {
      const res = await request(app).post('/api/readings').set('Authorization', AUTH).set('X-Dev-Mode', 'true').send({ meterId: 'm1' });
      expect(res.status).toBe(400);
    });
    it('GET /api/readings/review-queue — 200 with flagged readings (T044, T048)', async () => {
      prisma.reading.findMany.mockResolvedValue([{ id: 'r1', meterId: 'm1', value: 100, status: 'flagged' }]);
      prisma.reading.count.mockResolvedValue(1);
      const res = await request(app).get('/api/readings/review-queue').set('Authorization', AUTH).set('X-Dev-Mode', 'true');
      expect(res.status).toBe(200);
      expect(res.body.readings).toBeDefined();
    });
  });

  describe('Invoices', () => {
    it('GET /api/invoices — 200 with list', async () => {
      prisma.invoice.findMany.mockResolvedValue([{ id: '1', number: 'INV-001', amount: 100, status: 'pending' }]);
      prisma.invoice.count.mockResolvedValue(1);
      const res = await request(app).get('/api/invoices').set('Authorization', AUTH).set('X-Dev-Mode', 'true');
      expect(res.status).toBe(200);
      expect(res.body.invoices).toBeDefined();
    });
    it('POST /api/invoices — 201 on create', async () => {
      prisma.invoice.create.mockResolvedValue({ id: '1', number: 'INV-001', amount: 100, customerId: 'c1', status: 'pending' });
      const res = await request(app).post('/api/invoices').set('Authorization', AUTH).set('X-Dev-Mode', 'true').send({ number: 'INV-001', customerId: 'c1', amount: 100 });
      expect(res.status).toBe(201);
    });
  });

  describe('Payments', () => {
    it('POST /api/payments — 201 with allocation', async () => {
      prisma.payment.create.mockResolvedValue({ id: '1', amount: 100, method: 'bank', status: 'completed' });
      prisma.invoice.findMany.mockResolvedValue([{ id: 'i1', amount: 100, paid: 0, dueDate: new Date(), status: 'pending' }]);
      prisma.invoice.update.mockResolvedValue({});
      prisma.customerLedgerEntry.create.mockResolvedValue({});
      prisma.paymentTransaction.create.mockResolvedValue({});
      const res = await request(app).post('/api/payments').set('Authorization', AUTH).set('X-Dev-Mode', 'true').send({ customerId: 'c1', amount: 100, method: 'bank', invoiceIds: ['i1'] });
      expect(res.status).toBe(201);
    });
  });

  describe('Tariffs', () => {
    it('GET /api/tariffs — 200 with list', async () => {
      prisma.tariff.findMany.mockResolvedValue([{ id: '1', name: 'Standard', status: 'active' }]);
      const res = await request(app).get('/api/tariffs').set('Authorization', AUTH).set('X-Dev-Mode', 'true');
      expect(res.status).toBe(200);
      expect(res.body.tariffs).toBeDefined();
    });
  });

  describe('SIM', () => {
    it('GET /api/sim — 200 with list', async () => {
      prisma.sIMCard.findMany.mockResolvedValue([]);
      prisma.sIMCard.count.mockResolvedValue(0);
      const res = await request(app).get('/api/sim').set('Authorization', AUTH).set('X-Dev-Mode', 'true');
      expect(res.status).toBe(200);
      expect(res.body.sims).toBeDefined();
    });
  });

  describe('Meter Assignment (T023-T026)', () => {
    it('POST /api/meter-assignments — 201 assign meter to customer', async () => {
      prisma.meterAssignment.create.mockResolvedValue({ id: 'a1', meterId: 'm1', customerId: 'c1', status: 'active', startDate: new Date() });
      prisma.meter.update.mockResolvedValue({});
      const res = await request(app).post('/api/meter-assignments').set('Authorization', AUTH).set('X-Dev-Mode', 'true').send({ meterId: 'm1', customerId: 'c1' });
      expect(res.status).toBe(201);
    });

    it('POST /api/meter-assignments — 409 conflict for active assignment', async () => {
      prisma.meterAssignment.findFirst.mockResolvedValue({ id: 'a1', status: 'active' });
      const res = await request(app).post('/api/meter-assignments').set('Authorization', AUTH).set('X-Dev-Mode', 'true').send({ meterId: 'm1', customerId: 'c1' });
      expect(res.status).toBe(409);
    });

    it('POST /api/meters/:id/terminate — 200 terminate meter', async () => {
      prisma.meter.findUnique.mockResolvedValue({ id: 'm1', serial: 'MTR-001', status: 'active' });
      prisma.meter.update.mockResolvedValue({ id: 'm1', status: 'retired' });
      prisma.meterAssignment.findFirst.mockResolvedValue({ id: 'a1', status: 'active' });
      prisma.meterAssignment.update.mockResolvedValue({});
      prisma.meterEvent.create.mockResolvedValue({});
      prisma.reading.create.mockResolvedValue({});
      const res = await request(app).post('/api/meters/m1/terminate').set('Authorization', AUTH).set('X-Dev-Mode', 'true').send({ reason: 'Retired' });
      expect(res.status).toBe(200);
    });
  });

  describe('Locations (T028)', () => {
    it('GET /api/locations/zones — 200 with list', async () => {
      prisma.zone.findMany.mockResolvedValue([{ id: 'z1', name: 'Zone A', code: 'Z-A', projectId: 'p1', _count: { units: 5 }, project: { name: 'Project X' } }]);
      const res = await request(app).get('/api/locations/zones').set('Authorization', AUTH).set('X-Dev-Mode', 'true');
      expect(res.status).toBe(200);
      expect(res.body.zones).toHaveLength(1);
    });
    it('GET /api/locations/units — 200 with list', async () => {
      prisma.unit.findMany.mockResolvedValue([{ id: 'u1', name: 'Unit 1', code: 'U-1', zoneId: 'z1', type: 'residential', status: 'active', zone: { name: 'Zone A', code: 'Z-A' }, customer: { id: 'c1', name: 'Customer' } }]);
      const res = await request(app).get('/api/locations/units').set('Authorization', AUTH).set('X-Dev-Mode', 'true');
      expect(res.status).toBe(200);
      expect(res.body.units).toHaveLength(1);
    });
  });

  describe('Security & Headers', () => {
    it('should return X-Correlation-ID header', async () => {
      prisma.customer.findMany.mockResolvedValue([{ id: '1', name: 'T', email: 't@t.com', status: 'active', createdAt: new Date(), phone: null, address: null, area: null }]);
      prisma.customer.count.mockResolvedValue(1);
      const res = await request(app).get('/api/customers').set('Authorization', AUTH).set('X-Dev-Mode', 'true');
      expect(res.headers['x-correlation-id']).toBeDefined();
    });
    it('should reject unauthenticated with 401', async () => {
      const res = await request(app).get('/api/customers');
      expect(res.status).toBe(401);
    });
  });
});
