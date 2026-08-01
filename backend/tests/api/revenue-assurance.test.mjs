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
import { revenueAssuranceRouter } from '../../src/routes/revenue-assurance.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/api/revenue-assurance', revenueAssuranceRouter);
app.use(errorHandler);

function auth() { return { Authorization: 'Bearer t' }; }

describe('C13 Revenue Assurance routes', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
    jwt.verify.mockReturnValue({ sub: 'user-1', email: 'admin@test.com', role: 'super_admin', system: 'admin' });
    prisma.auditEntry.create.mockResolvedValue({});
  });

  describe('Rules', () => {
    it('lists rules', async () => {
      prisma.revenueRule.findMany.mockResolvedValue([{ id: 'r-1', code: 'POST_INVOICE_ZERO_AMOUNT', category: 'POST_BILL' }]);
      const res = await request(app).get('/api/revenue-assurance/rules').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.rules).toHaveLength(1);
    });

    it('creates a rule', async () => {
      prisma.revenueRule.findUnique.mockResolvedValue(null);
      prisma.revenueRule.create.mockResolvedValue({ id: 'r-2', code: 'MY_RULE' });
      const res = await request(app)
        .post('/api/revenue-assurance/rules')
        .set(auth())
        .send({ name: 'Test rule', code: 'MY_RULE', category: 'POST_BILL', entityType: 'invoice', condition: '{"field":"amount","op":"eq","value":0}' });
      expect(res.status).toBe(201);
    });

    it('rejects duplicate rule code', async () => {
      prisma.revenueRule.findUnique.mockResolvedValue({ id: 'r-1', code: 'MY_RULE' });
      const res = await request(app)
        .post('/api/revenue-assurance/rules')
        .set(auth())
        .send({ name: 'Test', code: 'MY_RULE', condition: '{}' });
      expect(res.status).toBe(409);
    });

    it('seeds the 15 default rules', async () => {
      prisma.revenueRule.findUnique.mockResolvedValue(null);
      prisma.revenueRule.create.mockImplementation(async ({ data }) => ({ id: `seed-${data.code}`, code: data.code }));
      prisma.revenueRule.count.mockResolvedValue(15);
      const res = await request(app).post('/api/revenue-assurance/rules/seed').set(auth());
      expect(res.status).toBe(201);
      expect(res.body.count).toBe(15);
    });
  });

  describe('Findings', () => {
    it('lists findings with scores', async () => {
      prisma.revenueLeakageFinding.findMany.mockResolvedValue([{ id: 'f-1', severity: 'high', varianceAmount: 500, status: 'OPEN' }]);
      prisma.revenueLeakageFinding.count.mockResolvedValue(1);
      const res = await request(app).get('/api/revenue-assurance/findings').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.findings[0].score).toBeGreaterThan(0);
    });

    it('gets a single finding', async () => {
      prisma.revenueLeakageFinding.findUnique.mockResolvedValue({ id: 'f-1', severity: 'critical', status: 'OPEN', varianceAmount: 1000 });
      const res = await request(app).get('/api/revenue-assurance/findings/f-1').set(auth());
      expect(res.status).toBe(200);
    });

    it('updates finding status', async () => {
      prisma.revenueLeakageFinding.update.mockResolvedValue({ id: 'f-1', status: 'CONFIRMED' });
      const res = await request(app).patch('/api/revenue-assurance/findings/f-1/status').set(auth()).send({ status: 'CONFIRMED', resolutionNote: 'verified' });
      expect(res.status).toBe(200);
      expect(res.body.finding.status).toBe('CONFIRMED');
    });
  });

  describe('Investigations', () => {
    it('creates an investigation from a finding', async () => {
      prisma.revenueLeakageFinding.findUnique.mockResolvedValue({ id: 'f-1', status: 'OPEN' });
      prisma.revenueInvestigation.create.mockResolvedValue({ id: 'inv-1', findingId: 'f-1' });
      prisma.revenueLeakageFinding.update.mockResolvedValue({ id: 'f-1', status: 'INVESTIGATING' });
      const res = await request(app)
        .post('/api/revenue-assurance/findings/f-1/investigations')
        .set(auth())
        .send({ title: 'Investigate zero invoice', priority: 'high' });
      expect(res.status).toBe(201);
    });

    it('updates investigation and resolves finding', async () => {
      prisma.revenueInvestigation.update.mockResolvedValue({ id: 'inv-1', findingId: 'f-1', status: 'RESOLVED' });
      prisma.revenueLeakageFinding.update.mockResolvedValue({ id: 'f-1', status: 'RESOLVED' });
      const res = await request(app).patch('/api/revenue-assurance/investigations/inv-1').set(auth()).send({ status: 'RESOLVED', outcome: 'FIXED', resolution: 'corrected' });
      expect(res.status).toBe(200);
    });
  });

  describe('Run + summary', () => {
    it('runs assurance checks', async () => {
      prisma.revenueRule.findUnique.mockResolvedValue(null);
      prisma.revenueRule.create.mockImplementation(async ({ data }) => ({ id: `r-${data.code}`, code: data.code }));
      prisma.revenueRule.findMany.mockResolvedValue([]);
      prisma.invoice.findMany.mockResolvedValue([]);
      const res = await request(app).post('/api/revenue-assurance/run').set(auth()).send({ category: 'POST_BILL' });
      expect(res.status).toBe(200);
      expect(res.body.checks).toBe(0);
    });

    it('returns summary counts', async () => {
      prisma.revenueLeakageFinding.count.mockResolvedValue(3);
      prisma.revenueLeakageFinding.aggregate.mockResolvedValue({ _sum: { varianceAmount: 2500 } });
      prisma.revenueRule.count.mockResolvedValue(15);
      const res = await request(app).get('/api/revenue-assurance/summary').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.activeRules).toBe(15);
    });
  });
});

describe('Revenue Assurance engine', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
  });

  it('detects zero-amount invoice leakage', async () => {
    prisma.revenueRule.findUnique.mockResolvedValue(null);
    prisma.revenueRule.create.mockImplementation(async ({ data }) => ({ id: `r-${data.code}`, code: data.code }));
    prisma.revenueRule.findMany.mockResolvedValue([{ id: 'r-zero', code: 'POST_INVOICE_ZERO_AMOUNT', name: 'Zero amount', category: 'POST_BILL', entityType: 'invoice', severity: 'high', condition: '{"field":"amount","op":"eq","value":0}', expectedValue: 0, tolerance: null }]);
    prisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1', number: 'INV-001', amount: 0, customerId: 'c-1', issuedAt: new Date() }]);
    prisma.invoiceItem.findMany.mockResolvedValue([]);
    prisma.invoiceTax.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
    prisma.invoice.count.mockResolvedValue(0);
    prisma.revenueLeakageFinding.findFirst.mockResolvedValue(null);
    prisma.revenueLeakageFinding.create.mockResolvedValue({ id: 'f-1', status: 'OPEN' });

    const { runRevenueAssurance } = await import('../../src/services/revenue-assurance-engine.js');
    const result = await runRevenueAssurance({ category: 'POST_BILL' });
    expect(result.findings).toBe(1);
    expect(result.checks).toBe(1);
  });

  it('does not flag a healthy invoice', async () => {
    prisma.revenueRule.findUnique.mockResolvedValue(null);
    prisma.revenueRule.create.mockImplementation(async ({ data }) => ({ id: `r-${data.code}`, code: data.code }));
    prisma.revenueRule.findMany.mockResolvedValue([{ id: 'r-zero', code: 'POST_INVOICE_ZERO_AMOUNT', name: 'Zero amount', category: 'POST_BILL', entityType: 'invoice', severity: 'high', condition: '{"field":"amount","op":"eq","value":0}', expectedValue: 0, tolerance: null }]);
    prisma.invoice.findMany.mockResolvedValue([{ id: 'inv-2', number: 'INV-002', amount: 1500, customerId: 'c-1', issuedAt: new Date() }]);
    prisma.invoiceItem.findMany.mockResolvedValue([]);
    prisma.invoiceTax.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
    prisma.invoice.count.mockResolvedValue(0);
    prisma.revenueLeakageFinding.findFirst.mockResolvedValue(null);
    prisma.revenueLeakageFinding.create.mockResolvedValue({ id: 'f-2', status: 'OPEN' });

    const { runRevenueAssurance } = await import('../../src/services/revenue-assurance-engine.js');
    const result = await runRevenueAssurance({ category: 'POST_BILL' });
    expect(result.findings).toBe(0);
  });

  it('scores findings by severity and impact', () => {
    const { scoreFinding } = require('../../src/services/revenue-assurance-engine.js');
    expect(scoreFinding({ severity: 'critical', varianceAmount: 5000 })).toBeGreaterThan(90);
    expect(scoreFinding({ severity: 'low', varianceAmount: 0 })).toBeLessThanOrEqual(50);
  });

  it('dedupes open findings for the same entity', async () => {
    prisma.revenueRule.findUnique.mockResolvedValue(null);
    prisma.revenueRule.create.mockImplementation(async ({ data }) => ({ id: `r-${data.code}`, code: data.code }));
    prisma.revenueRule.findMany.mockResolvedValue([{ id: 'r-zero', code: 'POST_INVOICE_ZERO_AMOUNT', name: 'Zero amount', category: 'POST_BILL', entityType: 'invoice', severity: 'high', condition: '{"field":"amount","op":"eq","value":0}', expectedValue: 0, tolerance: null }]);
    prisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1', number: 'INV-001', amount: 0, customerId: 'c-1', issuedAt: new Date() }]);
    prisma.invoiceItem.findMany.mockResolvedValue([]);
    prisma.invoiceTax.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
    prisma.invoice.count.mockResolvedValue(0);
    prisma.revenueLeakageFinding.findFirst.mockResolvedValue({ id: 'f-existing', status: 'OPEN' });

    const { runRevenueAssurance } = await import('../../src/services/revenue-assurance-engine.js');
    const result = await runRevenueAssurance({ category: 'POST_BILL' });
    expect(result.findings).toBe(0);
  });
});
