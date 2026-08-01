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
import { collectionsRouter } from '../../src/routes/collections.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/api/collections', collectionsRouter);
app.use(errorHandler);

function auth() { return { Authorization: 'Bearer t' }; }

describe('C13 Collections Intelligence routes', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
    jwt.verify.mockReturnValue({ sub: 'user-1', email: 'admin@test.com', role: 'super_admin', system: 'admin' });
    prisma.auditEntry.create.mockResolvedValue({});
  });

  describe('Risk profiles', () => {
    it('lists risk profiles', async () => {
      prisma.customerRiskProfile.findMany.mockResolvedValue([{ id: 'rp-1', riskBand: 'HIGH', riskScore: 80 }]);
      const res = await request(app).get('/api/collections/risk-profiles').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.profiles).toHaveLength(1);
    });

    it('computes risk profiles', async () => {
      prisma.customer.findMany.mockResolvedValue([{ id: 'c-1', name: 'ACME' }]);
      prisma.invoice.findMany.mockResolvedValue([]);
      prisma.promiseToPay.findMany.mockResolvedValue([]);
      prisma.payment.findFirst.mockResolvedValue(null);
      prisma.customerRiskProfile.findUnique.mockResolvedValue(null);
      prisma.customerRiskProfile.create.mockResolvedValue({ id: 'rp-1' });
      const res = await request(app).post('/api/collections/risk-profiles/compute').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.updated).toBe(1);
    });
  });

  describe('Dunning', () => {
    it('creates a dunning rule', async () => {
      prisma.dunningRule.create.mockResolvedValue({ id: 'd-1', code: 'DUN_1' });
      const res = await request(app).post('/api/collections/dunning-rules').set(auth()).send({ name: 'Reminder', code: 'DUN_1', stage: 1, minDays: 1, maxDays: 15 });
      expect(res.status).toBe(201);
    });

    it('runs the dunning engine', async () => {
      prisma.dunningRule.findMany.mockResolvedValue([{ id: 'd-1', stage: 1, minDays: 1, maxDays: 15, action: 'REMINDER' }]);
      prisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1', customerId: 'c-1', amount: 100, paidAmount: 0, dueDate: new Date(Date.now() - 5 * 86400000) }]);
      prisma.collectionCase.findFirst.mockResolvedValue(null);
      prisma.collectionCase.create.mockResolvedValue({ id: 'cc-1' });
      const res = await request(app).post('/api/collections/dunning/run').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.planned).toHaveLength(1);
    });
  });

  describe('Promise-to-pay', () => {
    it('creates a PTP', async () => {
      prisma.collectionCase.findUnique.mockResolvedValue({ id: 'cc-1' });
      prisma.promiseToPay.create.mockResolvedValue({ id: 'p-1' });
      const res = await request(app).post('/api/collections/cases/cc-1/promise').set(auth()).send({ promisedDate: '2026-08-15', promisedAmount: 500 });
      expect(res.status).toBe(201);
    });

    it('updates a PTP status', async () => {
      prisma.promiseToPay.update.mockResolvedValue({ id: 'p-1', status: 'kept' });
      const res = await request(app).patch('/api/collections/promises/p-1').set(auth()).send({ status: 'kept' });
      expect(res.status).toBe(200);
    });
  });

  describe('Installment plans', () => {
    it('creates a plan with installments', async () => {
      prisma.customer.findUnique.mockResolvedValue({ id: 'c-1', name: 'ACME' });
      prisma.installmentPlan.create.mockResolvedValue({ id: 'pl-1' });
      prisma.planInstallment.create.mockResolvedValue({ id: 'pi-1' });
      prisma.installmentPlan.findUnique.mockResolvedValue({ id: 'pl-1', planInstallments: [{ id: 'pi-1', amount: 100 }] });
      const res = await request(app).post('/api/collections/customers/c-1/plans').set(auth()).send({ totalAmount: 300, downPayment: 0, installments: 3, frequencyDays: 30 });
      expect(res.status).toBe(201);
      expect(prisma.planInstallment.create).toHaveBeenCalledTimes(3);
    });

    it('records an installment payment', async () => {
      prisma.planInstallment.findUnique.mockResolvedValue({ id: 'pi-1', planId: 'pl-1', amount: 100, paidAmount: 0 });
      prisma.planInstallment.update.mockResolvedValue({ id: 'pi-1', paidAmount: 100, status: 'PAID' });
      prisma.planInstallment.aggregate.mockResolvedValue({ _sum: { paidAmount: 100 } });
      prisma.installmentPlan.update.mockResolvedValue({ id: 'pl-1', paidAmount: 100 });
      const res = await request(app).post('/api/collections/plans/pl-1/pay').set(auth()).send({ installmentId: 'pi-1', amount: 100 });
      expect(res.status).toBe(200);
    });
  });

  describe('Disputes', () => {
    it('creates a dispute', async () => {
      prisma.customer.findUnique.mockResolvedValue({ id: 'c-1' });
      prisma.dispute.create.mockResolvedValue({ id: 'd-1', status: 'OPEN' });
      const res = await request(app).post('/api/collections/customers/c-1/disputes').set(auth()).send({ reason: 'overbilled', amount: 50 });
      expect(res.status).toBe(201);
    });

    it('updates a dispute', async () => {
      prisma.dispute.update.mockResolvedValue({ id: 'd-1', status: 'APPROVED' });
      const res = await request(app).patch('/api/collections/disputes/d-1').set(auth()).send({ status: 'APPROVED' });
      expect(res.status).toBe(200);
    });
  });

  describe('Provisions + write-offs', () => {
    it('creates a provision rule', async () => {
      prisma.provisionRule.create.mockResolvedValue({ id: 'pr-1' });
      const res = await request(app).post('/api/collections/provision-rules').set(auth()).send({ name: '90d', code: 'PROV_90', bucketDays: 90, provisionPct: 30 });
      expect(res.status).toBe(201);
    });

    it('computes provisions', async () => {
      prisma.provisionRule.findMany.mockResolvedValue([]);
      prisma.provisionRule.create.mockImplementation(async ({ data }) => ({ id: data.code, ...data }));
      prisma.invoice.findMany.mockResolvedValue([]);
      prisma.badDebtProvision.create.mockResolvedValue({ id: 'bd-1', amount: 0 });
      const res = await request(app).post('/api/collections/provisions/compute').set(auth());
      expect(res.status).toBe(200);
    });

    it('creates a write-off request', async () => {
      prisma.writeOffRequest.create.mockResolvedValue({ id: 'wo-1', status: 'PENDING' });
      const res = await request(app).post('/api/collections/write-offs').set(auth()).send({ amount: 100, reason: 'uncollectible' });
      expect(res.status).toBe(201);
    });

    it('executes a write-off and marks invoice', async () => {
      prisma.writeOffRequest.findUnique.mockResolvedValue({ id: 'wo-1', status: 'APPROVED', invoiceId: 'inv-1' });
      prisma.writeOffRequest.update.mockResolvedValue({ id: 'wo-1', status: 'EXECUTED' });
      prisma.invoice.update.mockResolvedValue({ id: 'inv-1', status: 'written_off' });
      const res = await request(app).patch('/api/collections/write-offs/wo-1').set(auth()).send({ status: 'EXECUTED' });
      expect(res.status).toBe(200);
      expect(prisma.invoice.update).toHaveBeenCalled();
    });
  });

  describe('Summary', () => {
    it('returns workbench summary', async () => {
      prisma.collectionCase.count.mockResolvedValue(5);
      prisma.customerRiskProfile.count.mockResolvedValue(3);
      prisma.installmentPlan.count.mockResolvedValue(2);
      prisma.writeOffRequest.count.mockResolvedValue(1);
      prisma.dispute.count.mockResolvedValue(4);
      prisma.invoice.aggregate.mockResolvedValue({ _sum: { amount: 5000 } });
      const res = await request(app).get('/api/collections/summary').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.openCases).toBe(5);
    });
  });
});

describe('Collections engine', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  it('computes risk scores', () => {
    const { computeRiskScore, riskBandFromScore } = require('../../src/services/collections-engine.js');
    expect(computeRiskScore({ agingDays: 180, totalOwing: 10000, overdueCount: 3, promiseKeptRate: 0.2 })).toBeGreaterThan(60);
    expect(riskBandFromScore(85)).toBe('CRITICAL');
    expect(riskBandFromScore(45)).toBe('MEDIUM');
    expect(riskBandFromScore(10)).toBe('LOW');
  });

  it('seeds dunning ladder when no rules exist', async () => {
    prisma.dunningRule.findMany.mockResolvedValue([]);
    prisma.dunningRule.create.mockImplementation(async ({ data }) => ({ id: data.code, ...data }));
    prisma.invoice.findMany.mockResolvedValue([]);
    const { runDunning } = await import('../../src/services/collections-engine.js');
    const result = await runDunning();
    expect(result.scanned).toBe(0);
    expect(prisma.dunningRule.create).toHaveBeenCalledTimes(4);
  });

  it('seeds provision buckets and computes total', async () => {
    prisma.provisionRule.findMany.mockResolvedValue([]);
    prisma.provisionRule.create.mockImplementation(async ({ data }) => ({ id: data.code, ...data }));
    prisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1', amount: 1000, paidAmount: 0, dueDate: new Date(Date.now() - 200 * 86400000) }]);
    prisma.badDebtProvision.create.mockResolvedValue({ id: 'bd-1', amount: 1000 });
    const { computeProvisions } = await import('../../src/services/collections-engine.js');
    const result = await computeProvisions();
    expect(result.total).toBe(1000);
  });

  it('resolves the highest applicable dunning stage', async () => {
    const { resolveDunningStage } = await import('../../src/services/collections-engine.js');
    const rules = [{ stage: 1, minDays: 1, maxDays: 15 }, { stage: 2, minDays: 16, maxDays: 30 }, { stage: 3, minDays: 31, maxDays: null }];
    const r1 = await resolveDunningStage(10, rules);
    expect(r1.stage).toBe(1);
    const r2 = await resolveDunningStage(45, rules);
    expect(r2.stage).toBe(3);
  });
});
