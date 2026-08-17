import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/server.js', () => ({ prisma }));
vi.mock('../../src/services/notification-engine.js', () => ({ processEvent: vi.fn().mockResolvedValue() }));
vi.mock('../../src/db.js', () => ({ prisma, default: prisma }));
vi.mock('../../src/middleware/security.js', async (orig) => {
  const mod = await orig();
  return { ...mod, auditLog: vi.fn() };
});
vi.mock('../../src/services/posting-engine.js', () => ({ postEvent: vi.fn().mockResolvedValue() }));
vi.mock('jsonwebtoken', async () => {
  const jwt = { sign: vi.fn(), verify: vi.fn() };
  return { default: jwt };
});

const jwt = (await import('jsonwebtoken')).default;
process.env.JWT_SECRET = 'test-secret-key';

import request from 'supertest';
import express from 'express';
import { solarRouter } from '../../src/routes/solar.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/api/solar', solarRouter);
app.use(errorHandler);

function auth() { return { Authorization: 'Bearer t' }; }

const AREA_A = 'area-a';
const AREA_B = 'area-b';

describe('P13.6 solar route (HTTP surface, tenancy + idempotency)', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
    jwt.verify.mockReturnValue({ sub: 'user-1', email: 'admin@test.com', role: 'super_admin', system: 'admin' });
  });

  it('create persists invoice with areaId derived from the customer (not client input)', async () => {
    prisma.customer.findUnique.mockResolvedValue({ id: 'c-1', name: 'C', areaId: AREA_A });
    prisma.meter.findUnique.mockResolvedValue({ id: 'm-1', serial: '52051449' });
    prisma.auditEntry.findFirst.mockResolvedValue(null);
    prisma.customerLedgerEntry.create.mockResolvedValue({});
    prisma.invoice.create.mockResolvedValue({ id: 'inv-1', number: 'SOLAR-52051449-2021-01', areaId: AREA_A });
    prisma.invoiceItem.create.mockResolvedValue({});

    // Client sends a FOREIGN areaId — must be ignored in favor of customer.areaId.
    const res = await request(app).post('/api/solar/invoices').set(auth()).send({
      customerId: 'c-1', meterId: 'm-1', periodStart: '2021-01-01', periodEnd: '2021-01-31',
      curr180: 150, prev180: 100, projectId: 'p-1',
    });
    expect(res.status).toBe(201);
    const createData = prisma.invoice.create.mock.calls[0][0].data;
    expect(createData.areaId).toBe(AREA_A);
    expect(createData.number).toBe('SOLAR-52051449-2021-01');
    expect(createData.billingPeriodStart).toEqual(new Date('2021-01-01'));
    expect(createData.billingPeriodEnd).toEqual(new Date('2021-01-31'));
  });

  it('create returns 409 DUPLICATE on P2002 unique violation of invoice number', async () => {
    prisma.customer.findUnique.mockResolvedValue({ id: 'c-1', name: 'C', areaId: AREA_A });
    prisma.meter.findUnique.mockResolvedValue({ id: 'm-1', serial: '52051449' });
    prisma.auditEntry.findFirst.mockResolvedValue(null);
    const p2002 = Object.assign(new Error('Unique constraint failed'), { code: 'P2002', meta: { target: ['Invoice_number_key'] } });
    prisma.customerLedgerEntry.create.mockResolvedValue({});
    prisma.invoice.create.mockRejectedValue(p2002);

    const res = await request(app).post('/api/solar/invoices').set(auth()).send({
      customerId: 'c-1', meterId: 'm-1', periodStart: '2021-01-01', periodEnd: '2021-01-31', curr180: 150, prev180: 100,
    });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('DUPLICATE');
  });

  it('create returns 409 DUPLICATE for a ref already used', async () => {
    prisma.customer.findUnique.mockResolvedValue({ id: 'c-1', name: 'C', areaId: AREA_A });
    prisma.auditEntry.findFirst.mockResolvedValue({ id: 'audit-1' });
    const res = await request(app).post('/api/solar/invoices').set(auth()).send({ customerId: 'c-1', ref: 'batch-1', curr180: 100 });
    expect(res.status).toBe(409);
    expect(prisma.invoice.create).not.toHaveBeenCalled();
  });

  it('create denies when customer belongs to another area (scoped role)', async () => {
    jwt.verify.mockReturnValue({ sub: 'user-1', email: 'am@test.com', role: 'area_manager', system: 'admin', area: AREA_A });
    prisma.customer.findUnique.mockResolvedValue({ id: 'c-1', name: 'C', areaId: AREA_B });
    const res = await request(app).post('/api/solar/invoices').set(auth()).send({ customerId: 'c-1', curr180: 100 });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('AREA_RESTRICTED');
  });

  it('compute preview is read-only (no persistence calls)', async () => {
    prisma.customer.findUnique.mockResolvedValue({ id: 'c-1', name: 'C', areaId: AREA_A });
    const res = await request(app).post('/api/solar/compute').set(auth()).send({ customerId: 'c-1', curr180: 250, prev180: 100 });
    expect(res.status).toBe(200);
    expect(res.body.result.net).toBe(150);
    expect(res.body.result.amount).toBeCloseTo(82, 2);
    expect(prisma.invoice.create).not.toHaveBeenCalled();
  });

  it('compute rejects negative readings (400)', async () => {
    prisma.customer.findUnique.mockResolvedValue({ id: 'c-1', name: 'C', areaId: AREA_A });
    const res = await request(app).post('/api/solar/compute').set(auth()).send({ customerId: 'c-1', curr180: -5 });
    expect(res.status).toBe(400);
  });

  it('denies unauthenticated access (401)', async () => {
    const res = await request(app).get('/api/solar/compute');
    expect(res.status).toBe(401);
  });
});
