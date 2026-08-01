import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/server.js', () => ({ prisma }));
vi.mock('../../src/db.js', () => ({ prisma, default: prisma }));
vi.mock('../../src/services/notification-engine.js', () => ({ processEvent: vi.fn().mockResolvedValue() }));
vi.mock('jsonwebtoken', async () => {
  const jwt = { sign: vi.fn(), verify: vi.fn() };
  return { default: jwt };
});
const jwt = (await import('jsonwebtoken')).default;

process.env.JWT_SECRET = 'test-secret-key';

import request from 'supertest';
import express from 'express';
import { tariffEngineRouter } from '../../src/routes/tariff-engine.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/api/tariff-engine', tariffEngineRouter);
app.use(errorHandler);

function auth() { return { Authorization: 'Bearer t' }; }

describe('C13 Tariff Engine routes', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
    jwt.verify.mockReturnValue({ sub: 'user-1', email: 'admin@test.com', role: 'super_admin', system: 'admin' });
    prisma.auditEntry.create.mockResolvedValue({});
  });

  describe('Versions', () => {
    it('lists versions for a tariff', async () => {
      prisma.tariffVersion.findMany.mockResolvedValue([{ id: 'v-1', versionNumber: 1, status: 'ACTIVE' }]);
      const res = await request(app).get('/api/tariff-engine/t-1/versions').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.versions).toHaveLength(1);
    });

    it('creates a version', async () => {
      prisma.tariff.findUnique.mockResolvedValue({ id: 't-1', name: 'Residential' });
      prisma.tariffVersion.count.mockResolvedValue(1);
      prisma.tariffVersion.create.mockImplementation(async ({ data }) => ({ id: 'v-2', versionNumber: data.versionNumber, status: 'DRAFT', rates: data.rates?.create || [], tiers: data.tiers?.create || [] }));
      const res = await request(app)
        .post('/api/tariff-engine/t-1/versions')
        .set(auth())
        .send({ label: 'v2', effectiveFrom: '2026-09-01', tiers: [{ name: 'Tier1', minValue: 0, maxValue: 100, rate: 1.5, priority: 1 }], rates: [{ name: 'flat', rate: 2.0 }] });
      expect(res.status).toBe(201);
      expect(res.body.version.versionNumber).toBe(2);
    });

    it('returns 404 for missing tariff', async () => {
      prisma.tariff.findUnique.mockResolvedValue(null);
      const res = await request(app).post('/api/tariff-engine/t-x/versions').set(auth()).send({});
      expect(res.status).toBe(404);
    });

    it('activates a version and supersedes the previous', async () => {
      prisma.tariffVersion.findUnique.mockResolvedValueOnce({ id: 'v-2', tariffId: 't-1', versionNumber: 2, status: 'DRAFT' });
      prisma.tariffVersion.updateMany.mockResolvedValue({ count: 1 });
      prisma.tariffVersion.update.mockResolvedValue({ id: 'v-2', status: 'ACTIVE' });
      prisma.tariffVersion.findUnique.mockResolvedValueOnce({ id: 'v-2', tariffId: 't-1', versionNumber: 2, status: 'ACTIVE', rates: [], tiers: [], touSchedules: [], demandRates: [], fixedCharges: [], taxes: [] });
      const res = await request(app).post('/api/tariff-engine/t-1/versions/v-2/activate').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.version.status).toBe('ACTIVE');
    });

    it('gets a single version with components', async () => {
      prisma.tariffVersion.findUnique.mockResolvedValue({ id: 'v-1', rates: [], tiers: [], touSchedules: [], demandRates: [], fixedCharges: [], taxes: [], changeLogs: [] });
      const res = await request(app).get('/api/tariff-engine/versions/v-1').set(auth());
      expect(res.status).toBe(200);
    });
  });

  describe('Assignments', () => {
    it('creates a customer-tariff assignment', async () => {
      prisma.customer.findUnique.mockResolvedValue({ id: 'c-1', name: 'ACME' });
      prisma.tariffVersion.findUnique.mockResolvedValue({ id: 'v-1', versionNumber: 1 });
      prisma.customerTariff.updateMany.mockResolvedValue({ count: 1 });
      prisma.customerTariff.create.mockResolvedValue({ id: 'a-1', customerId: 'c-1', tariffVersionId: 'v-1', status: 'ACTIVE' });
      const res = await request(app)
        .post('/api/tariff-engine/assignments')
        .set(auth())
        .send({ customerId: 'c-1', tariffVersionId: 'v-1' });
      expect(res.status).toBe(201);
    });

    it('rejects assignment when customer or version missing', async () => {
      prisma.customer.findUnique.mockResolvedValue(null);
      prisma.tariffVersion.findUnique.mockResolvedValue(null);
      const res = await request(app).post('/api/tariff-engine/assignments').set(auth()).send({ customerId: 'c-1', tariffVersionId: 'v-1' });
      expect(res.status).toBe(404);
    });
  });

  describe('Calculate', () => {
    it('calculates by active version', async () => {
      prisma.tariffVersion.findFirst.mockResolvedValue({ id: 'v-1', rates: [{ name: 'flat', rate: 2 }], tiers: [], touSchedules: [], demandRates: [], fixedCharges: [], taxes: [] });
      const res = await request(app).post('/api/tariff-engine/calculate').set(auth()).send({ tariffId: 't-1', consumption: 100 });
      expect(res.status).toBe(200);
      expect(res.body.totalCharge).toBe(200);
    });

    it('calculates by explicit versionId', async () => {
      prisma.tariffVersion.findUnique.mockResolvedValue({ id: 'v-1', rates: [], tiers: [{ name: 'T', minValue: 0, maxValue: 50, rate: 1 }, { name: 'T2', minValue: 50, maxValue: null, rate: 2 }], touSchedules: [], demandRates: [], fixedCharges: [], taxes: [] });
      const res = await request(app).post('/api/tariff-engine/calculate').set(auth()).send({ versionId: 'v-1', consumption: 100 });
      expect(res.status).toBe(200);
      expect(res.body.totalCharge).toBe(150);
    });

    it('calculates tiered correctly (50@1 + 50@2 = 150)', async () => {
      const { calculateTariff } = await import('../../src/services/tariff-engine.js');
      const result = calculateTariff({ rates: [], tiers: [{ name: 'T1', minValue: 0, maxValue: 50, rate: 1 }, { name: 'T2', minValue: 50, maxValue: null, rate: 2 }], touSchedules: [], demandRates: [], fixedCharges: [], taxes: [] }, { consumption: 100 });
      expect(result.totalCharge).toBe(150);
    });

    it('applies ToU when hour matches schedule', async () => {
      const { calculateTariff } = await import('../../src/services/tariff-engine.js');
      const result = calculateTariff({ rates: [], tiers: [], touSchedules: [{ name: 'Peak', dayOfWeek: 'ALL', startHour: 18, endHour: 22, rate: 3 }], demandRates: [], fixedCharges: [], taxes: [] }, { consumption: 50, hour: 19 });
      expect(result.totalCharge).toBe(150);
      expect(result.lineItems[0].type).toBe('tou');
    });

    it('skips ToU when hour is outside schedule', async () => {
      const { calculateTariff } = await import('../../src/services/tariff-engine.js');
      const result = calculateTariff({ rates: [{ name: 'offpeak', rate: 1 }], tiers: [], touSchedules: [{ name: 'Peak', dayOfWeek: 'ALL', startHour: 18, endHour: 22, rate: 3 }], demandRates: [], fixedCharges: [], taxes: [] }, { consumption: 50, hour: 10 });
      expect(result.totalCharge).toBe(50);
    });

    it('applies demand charges over threshold', async () => {
      const { calculateTariff } = await import('../../src/services/tariff-engine.js');
      const result = calculateTariff({ rates: [], tiers: [], touSchedules: [], demandRates: [{ name: 'PeakDemand', rate: 10, threshold: 20 }], fixedCharges: [], taxes: [] }, { consumption: 0, demand: 30 });
      expect(result.totalCharge).toBe(100);
    });

    it('applies fixed charges and percentage tax', async () => {
      const { calculateTariff } = await import('../../src/services/tariff-engine.js');
      const result = calculateTariff({ rates: [{ name: 'flat', rate: 2 }], tiers: [], touSchedules: [], demandRates: [], fixedCharges: [{ name: 'Admin', amount: 10, frequency: 'MONTHLY' }], taxes: [{ name: 'VAT', rate: 14, type: 'PERCENTAGE' }] }, { consumption: 100, periods: 1 });
      expect(result.subtotal).toBe(210);
      expect(result.taxTotal).toBe(29.4);
      expect(result.totalCharge).toBe(239.4);
    });
  });

  describe('Simulate', () => {
    it('simulates with inline version components', async () => {
      const res = await request(app)
        .post('/api/tariff-engine/simulate')
        .set(auth())
        .send({ versionComponents: { rates: [{ name: 'flat', rate: 3 }] }, consumption: 200 });
      expect(res.status).toBe(200);
      expect(res.body.totalCharge).toBe(600);
    });

    it('simulates against an existing active version', async () => {
      prisma.tariffVersion.findFirst.mockResolvedValue({ id: 'v-1', rates: [{ name: 'flat', rate: 4 }], tiers: [], touSchedules: [], demandRates: [], fixedCharges: [], taxes: [] });
      const res = await request(app).post('/api/tariff-engine/simulate').set(auth()).send({ tariffId: 't-1', consumption: 50 });
      expect(res.status).toBe(200);
      expect(res.body.totalCharge).toBe(200);
    });
  });
});

describe('Tariff engine service', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  it('resolves the active version for a tariff', async () => {
    prisma.tariffVersion.findFirst.mockResolvedValue({ id: 'v-3', versionNumber: 3, status: 'ACTIVE', rates: [], tiers: [], touSchedules: [], demandRates: [], fixedCharges: [], taxes: [] });
    const { resolveActiveVersion } = await import('../../src/services/tariff-engine.js');
    const v = await resolveActiveVersion('t-1');
    expect(v.id).toBe('v-3');
  });

  it('calculates for a customer via their assignment', async () => {
    prisma.customerTariff.findFirst.mockResolvedValue({ id: 'a-1', tariffVersion: { id: 'v-1', rates: [{ name: 'flat', rate: 5 }], tiers: [], touSchedules: [], demandRates: [], fixedCharges: [], taxes: [] } });
    const { calculateForCustomer } = await import('../../src/services/tariff-engine.js');
    const result = await calculateForCustomer('c-1', { consumption: 20 });
    expect(result.ok).toBe(true);
    expect(result.totalCharge).toBe(100);
  });

  it('returns error when customer has no assignment', async () => {
    prisma.customerTariff.findFirst.mockResolvedValue(null);
    const { calculateForCustomer } = await import('../../src/services/tariff-engine.js');
    const result = await calculateForCustomer('c-9', { consumption: 20 });
    expect(result.ok).toBe(false);
  });
});
