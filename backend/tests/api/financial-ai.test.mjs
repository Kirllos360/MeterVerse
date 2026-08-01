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
import { financialAiRouter } from '../../src/routes/financial-ai.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/api/financial-ai', financialAiRouter);
app.use(errorHandler);

function auth() { return { Authorization: 'Bearer t' }; }

// Reusable mocks for the financial reporting deps used by the AI engine
function mockPnlDeps() {
  prisma.account.findMany.mockResolvedValue([
    { id: 'a-rev', code: '4000', name: 'Sales', type: 'REVENUE' },
    { id: 'a-exp', code: '5000', name: 'Opex', type: 'EXPENSE' },
  ]);
  prisma.generalLedgerEntry.findMany.mockResolvedValue([
    { accountId: 'a-rev', account: { type: 'REVENUE' }, totalDebit: 0, totalCredit: 0, closingBalance: -10000, openingBalance: 0 },
    { accountId: 'a-exp', account: { type: 'EXPENSE' }, totalDebit: 0, totalCredit: 0, closingBalance: 6000, openingBalance: 0 },
  ]);
}

describe('C13 Financial AI routes', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
    jwt.verify.mockReturnValue({ sub: 'user-1', email: 'admin@test.com', role: 'super_admin', system: 'admin' });
    prisma.auditEntry.create.mockResolvedValue({});
  });

  describe('Forecasting', () => {
    it('forecasts with historical data', async () => {
      prisma.invoice.findMany.mockResolvedValue([
        { amount: 1000, issuedAt: new Date(2026, 6, 15) },
        { amount: 1200, issuedAt: new Date(2026, 7, 15) },
      ]);
      prisma.financialForecast.create.mockImplementation(async ({ data }) => ({ id: 'fc-1', ...data }));
      const res = await request(app).post('/api/financial-ai/forecast').set(auth()).send({ metric: 'REVENUE', horizon: 3 });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.projected).toHaveLength(3);
    });

    it('handles insufficient data', async () => {
      prisma.invoice.findMany.mockResolvedValue([{ amount: 100, issuedAt: new Date(2026, 7, 15) }]);
      prisma.financialForecast.create.mockImplementation(async ({ data }) => ({ id: 'fc-2', ...data }));
      const res = await request(app).post('/api/financial-ai/forecast').set(auth()).send({ metric: 'REVENUE' });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(false);
    });
  });

  describe('Monte Carlo', () => {
    it('runs Monte Carlo simulation', async () => {
      prisma.invoice.findMany.mockResolvedValue([
        { amount: 1000, issuedAt: new Date(2026, 5, 15) },
        { amount: 1100, issuedAt: new Date(2026, 6, 15) },
        { amount: 1200, issuedAt: new Date(2026, 7, 15) },
      ]);
      prisma.monteCarloResult.create.mockImplementation(async ({ data }) => ({ id: 'mc-1', ...data }));
      const res = await request(app).post('/api/financial-ai/monte-carlo').set(auth()).send({ metric: 'REVENUE', iterations: 500 });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.mean).toBeGreaterThan(0);
    });
  });

  describe('Scenarios', () => {
    it('creates a scenario with adjustments', async () => {
      mockPnlDeps();
      prisma.financialScenario.create.mockImplementation(async ({ data }) => ({ id: 'sc-1', ...data }));
      const res = await request(app).post('/api/financial-ai/scenarios').set(auth()).send({ name: 'Revenue +20%', scenarioType: 'OPTIMISTIC', adjustments: { revenue: 1.2 } });
      expect(res.status).toBe(201);
      expect(res.body.results.adjusted.revenue).toBeGreaterThan(10000);
    });
  });

  describe('Health + insights', () => {
    it('computes health score', async () => {
      mockPnlDeps();
      prisma.generalLedgerEntry.findMany.mockResolvedValue([
        { accountId: 'a-rev', account: { type: 'REVENUE' }, totalDebit: 0, totalCredit: 0, closingBalance: -10000, openingBalance: 0 },
        { accountId: 'a-exp', account: { type: 'EXPENSE' }, totalDebit: 0, totalCredit: 0, closingBalance: 6000, openingBalance: 0 },
        { accountId: 'a-asset', account: { type: 'ASSET' }, totalDebit: 0, totalCredit: 0, closingBalance: 5000, openingBalance: 0 },
      ]);
      prisma.invoice.findMany.mockResolvedValue([]);
      prisma.businessHealthScore.upsert.mockImplementation(async ({ create }) => ({ id: 'hs-1', ...create }));
      const res = await request(app).post('/api/financial-ai/health').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.overall).toBeGreaterThanOrEqual(0);
      expect(res.body.overall).toBeLessThanOrEqual(100);
    });

    it('generates insights', async () => {
      mockPnlDeps();
      prisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1', amount: 100, paidAmount: 50, status: 'overdue', customer: { name: 'ACME' }, dueDate: new Date(Date.now() - 100 * 86400000) }]);
      prisma.executiveInsight.create.mockImplementation(async ({ data }) => ({ id: 'ins-1', ...data }));
      const res = await request(app).post('/api/financial-ai/insights/generate').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.insights.length).toBeGreaterThan(0);
    });

    it('creates + updates a recommendation log', async () => {
      prisma.aiRecommendationLog.create.mockResolvedValue({ id: 'rec-1', status: 'PENDING' });
      const c = await request(app).post('/api/financial-ai/recommendations').set(auth()).send({ recommendation: 'Increase dunning frequency' });
      expect(c.status).toBe(201);
      prisma.aiRecommendationLog.update.mockResolvedValue({ id: 'rec-1', status: 'APPLIED' });
      const u = await request(app).patch('/api/financial-ai/recommendations/rec-1').set(auth()).send({ status: 'APPLIED' });
      expect(u.status).toBe(200);
    });
  });

  describe('Board + models', () => {
    it('returns board summary', async () => {
      prisma.businessHealthScore.findFirst.mockResolvedValue({ overall: 72 });
      prisma.financialForecast.findFirst.mockResolvedValue({ forecastType: 'REVENUE', confidence: 'medium', values: '[]' });
      prisma.aiRecommendationLog.count.mockResolvedValue(2);
      prisma.executiveInsight.count.mockResolvedValue(1);
      const res = await request(app).get('/api/financial-ai/board').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.overallHealth).toBe(72);
    });

    it('registers a model version', async () => {
      prisma.aiModelVersion.create.mockResolvedValue({ id: 'm-1', modelKey: 'forecast-v1' });
      const res = await request(app).post('/api/financial-ai/models').set(auth()).send({ modelKey: 'forecast-v1', version: '1.0.0' });
      expect(res.status).toBe(201);
    });
  });
});

describe('Financial AI engine internals', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  it('fits a linear trend', async () => {
    const { forecast } = await import('../../src/services/financial-ai-engine.js');
    prisma.invoice.findMany.mockResolvedValue([
      { amount: 100, issuedAt: new Date(2026, 4, 15) },
      { amount: 200, issuedAt: new Date(2026, 5, 15) },
      { amount: 300, issuedAt: new Date(2026, 6, 15) },
      { amount: 400, issuedAt: new Date(2026, 7, 15) },
    ]);
    prisma.financialForecast.create.mockImplementation(async ({ data }) => ({ id: 'fc-1', ...data }));
    const result = await forecast('REVENUE', 2);
    expect(result.ok).toBe(true);
    expect(result.projected[1].value).toBeGreaterThan(result.projected[0].value);
  });
});
