import { vi } from 'vitest';

function createMockModel() {
  return { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn().mockResolvedValue(null), findFirst: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({}), update: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue({}), upsert: vi.fn().mockResolvedValue({}), count: vi.fn().mockResolvedValue(0), aggregate: vi.fn().mockResolvedValue({ _sum: { amount: null } }) };
}

vi.mock('../../src/db.js', () => {
  const prisma = { customer: createMockModel(), meter: createMockModel(), reading: createMockModel(), invoice: createMockModel(), payment: createMockModel(), user: createMockModel(), session: createMockModel(), auditEntry: createMockModel(), notification: createMockModel(), customerMeter: createMockModel(), meterAssignment: createMockModel(), billCycle: createMockModel(), billRun: createMockModel(), invoiceItem: createMockModel(), customerLedgerEntry: createMockModel(), paymentTransaction: createMockModel() };
  prisma.$transaction = vi.fn((cb) => cb(prisma));
  return { prisma };
});
vi.mock('../../src/server.js', () => {
  const prisma = { customer: createMockModel(), meter: createMockModel(), reading: createMockModel(), invoice: createMockModel(), payment: createMockModel(), user: createMockModel(), session: createMockModel(), auditEntry: createMockModel(), notification: createMockModel(), customerMeter: createMockModel(), meterAssignment: createMockModel(), billCycle: createMockModel(), billRun: createMockModel(), invoiceItem: createMockModel(), customerLedgerEntry: createMockModel(), paymentTransaction: createMockModel() };
  prisma.$transaction = vi.fn((cb) => cb(prisma));
  return { prisma };
});
vi.mock('../../src/services/notification-engine.js', () => ({ processEvent: vi.fn().mockResolvedValue() }));
vi.mock('jsonwebtoken', () => ({ default: { sign: vi.fn().mockReturnValue('mock-token'), verify: vi.fn().mockReturnValue({ sub: 'admin-id', email: 'admin@test.com', role: 'super_admin', system: 'admin' }) } }));

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { paymentsRouter } from '../../src/routes/payments.js';
import { readingsRouter } from '../../src/routes/readings.js';
import { prisma as prismaMock } from '../helpers/mock-prisma.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

const { prisma } = await import('../../src/db.js');

const app = express();
app.use(express.json());
app.use('/api/payments', paymentsRouter);
app.use('/api/readings', readingsRouter);
app.use(errorHandler);

describe('API — Payments, Readings, Tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ['payment', 'reading', 'task', 'customer', 'meter', 'invoice', 'user', 'session', 'auditEntry', 'notification', 'customerLedgerEntry', 'paymentTransaction'].forEach(m => {
      if (prisma[m]) { prisma[m].findMany.mockResolvedValue([]); prisma[m].findUnique.mockResolvedValue(null); prisma[m].findFirst.mockResolvedValue(null); prisma[m].count.mockResolvedValue(0); }
    });
  });

  it('GET /api/payments — list', async () => {
    prisma.payment.findMany.mockResolvedValue([{ id: 'p1', amount: 100, status: 'completed', customerId: 'c1', method: 'cash', reference: null, notes: null, transactions: [] }]);
    prisma.payment.count.mockResolvedValue(1);
    const res = await request(app).get('/api/payments').set('Authorization', 'Bearer t');
    expect(res.status).toBe(200);
  });

  it('GET /api/readings — list', async () => {
    prisma.reading.findMany.mockResolvedValue([{ id: 'r1', value: 1500, status: 'valid' }]);
    prisma.reading.count.mockResolvedValue(1);
    const res = await request(app).get('/api/readings').set('Authorization', 'Bearer t');
    expect(res.status).toBe(200);
  });


});
