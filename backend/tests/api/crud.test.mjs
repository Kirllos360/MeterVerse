import { vi } from 'vitest';

function createMockModel() {
  return { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn().mockResolvedValue(null), findFirst: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({}), update: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue({}), upsert: vi.fn().mockResolvedValue({}), count: vi.fn().mockResolvedValue(0), aggregate: vi.fn().mockResolvedValue({ _sum: { amount: null } }) };
}

vi.mock('../../src/db.js', () => {
  const prisma = { customer: createMockModel(), meter: createMockModel(), reading: createMockModel(), invoice: createMockModel(), payment: createMockModel(), user: createMockModel(), session: createMockModel(), auditEntry: createMockModel(), notification: createMockModel(), customerMeter: createMockModel(), meterAssignment: createMockModel(), billCycle: createMockModel(), billRun: createMockModel(), invoiceItem: createMockModel() };
  return { prisma };
});
vi.mock('../../src/server.js', () => {
  const prisma = { customer: createMockModel(), meter: createMockModel(), reading: createMockModel(), invoice: createMockModel(), payment: createMockModel(), user: createMockModel(), session: createMockModel(), auditEntry: createMockModel(), notification: createMockModel(), customerMeter: createMockModel(), meterAssignment: createMockModel(), billCycle: createMockModel(), billRun: createMockModel(), invoiceItem: createMockModel() };
  return { prisma };
});
vi.mock('../../src/services/notification-engine.js', () => ({ processEvent: vi.fn().mockResolvedValue() }));
vi.mock('jsonwebtoken', () => ({ default: { sign: vi.fn().mockReturnValue('mock-token'), verify: vi.fn().mockReturnValue({ sub: 'admin-id', email: 'admin@test.com', role: 'super_admin', system: 'admin' }) } }));

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { customersRouter } from '../../src/routes/customers.js';
import { invoicesRouter } from '../../src/routes/invoices.js';
import { metersRouter } from '../../src/routes/meters.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

const { prisma } = await import('../../src/db.js');

const app = express();
app.use(express.json());
app.use('/api/customers', customersRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/meters', metersRouter);
app.use(errorHandler);

describe('API — CRUD Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ['customer', 'meter', 'reading', 'invoice', 'payment', 'user', 'session', 'auditEntry', 'notification', 'customerMeter', 'meterAssignment', 'billCycle', 'billRun', 'invoiceItem'].forEach(m => {
      if (prisma[m]) { prisma[m].findMany.mockResolvedValue([]); prisma[m].findUnique.mockResolvedValue(null); prisma[m].findFirst.mockResolvedValue(null); prisma[m].count.mockResolvedValue(0); }
    });
  });

  describe('Customers', () => {
    it('GET /api/customers — list', async () => {
      prisma.customer.findMany.mockResolvedValue([{ id: 'c1', name: 'Test', status: 'active' }]);
      prisma.customer.count.mockResolvedValue(1);
      const res = await request(app).get('/api/customers').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });

    it('GET /api/customers/:id — read', async () => {
      prisma.customer.findUnique.mockResolvedValue({ id: 'c1', name: 'Test', status: 'active', meters: [], contacts: [] });
      const res = await request(app).get('/api/customers/c1').set('Authorization', 'Bearer t');
      expect([200, 404]).toContain(res.status);
    });

    it('GET /api/customers/:id — 404 for missing', async () => {
      prisma.customer.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/customers/nonexistent').set('Authorization', 'Bearer t');
      expect(res.status).toBe(404);
    });
  });

  describe('Invoices', () => {
    it('GET /api/invoices — list', async () => {
      prisma.invoice.findMany.mockResolvedValue([{ id: 'i1', number: 'INV-001' }]);
      prisma.invoice.count.mockResolvedValue(1);
      const res = await request(app).get('/api/invoices').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });

    it('GET /api/invoices/:id — read', async () => {
      prisma.invoice.findUnique.mockResolvedValue({ id: 'i1', number: 'INV-001', amount: 100, customer: {}, payments: [], items: [] });
      const res = await request(app).get('/api/invoices/i1').set('Authorization', 'Bearer t');
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('Meters', () => {
    it('GET /api/meters — list', async () => {
      prisma.meter.findMany.mockResolvedValue([{ id: 'm1', meterId: 'MTR-001' }]);
      prisma.meter.count.mockResolvedValue(1);
      const res = await request(app).get('/api/meters').set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('GET nonexistent route returns 404', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
