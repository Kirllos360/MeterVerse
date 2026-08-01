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
import { financialReportsRouter } from '../../src/routes/financial-reports.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/api/financial-reports', financialReportsRouter);
app.use(errorHandler);

function auth() { return { Authorization: 'Bearer t' }; }
function emptyLedgers() {
  prisma.account.findMany.mockResolvedValue([{ id: 'a-1', code: '4000', name: 'Revenue', type: 'REVENUE' }]);
  prisma.generalLedgerEntry.findMany.mockResolvedValue([]);
}

describe('C13 Financial Reporting routes', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
    jwt.verify.mockReturnValue({ sub: 'user-1', email: 'admin@test.com', role: 'super_admin', system: 'admin' });
    prisma.auditEntry.create.mockResolvedValue({});
  });

  describe('Statements', () => {
    it('builds P&L', async () => {
      emptyLedgers();
      const res = await request(app).get('/api/financial-reports/pnl?periodKey=2026-08').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.periodKey).toBe('2026-08');
    });

    it('builds balance sheet', async () => {
      emptyLedgers();
      const res = await request(app).get('/api/financial-reports/balance-sheet?periodKey=2026-08').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.totalAssets).toBe(0);
    });

    it('builds cash flow', async () => {
      prisma.journalEntry.findMany.mockResolvedValue([]);
      const res = await request(app).get('/api/financial-reports/cash-flow?periodKey=2026-08').set(auth());
      expect(res.status).toBe(200);
    });

    it('builds AR aging', async () => {
      prisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1', number: 'INV-1', amount: 100, paidAmount: 50, customer: { id: 'c-1', name: 'ACME' }, dueDate: new Date(Date.now() - 100 * 86400000) }]);
      const res = await request(app).get('/api/financial-reports/aging').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.totals['90+']).toBe(50);
    });
  });

  describe('Snapshots', () => {
    it('captures a snapshot', async () => {
      prisma.account.findMany.mockResolvedValue([]);
      prisma.generalLedgerEntry.findMany.mockResolvedValue([]);
      prisma.journalEntry.findMany.mockResolvedValue([]);
      prisma.invoice.findMany.mockResolvedValue([]);
      prisma.budget.findMany.mockResolvedValue([]);
      prisma.budgetVsActual.create.mockResolvedValue({ id: 'bva-1' });
      prisma.financialRatio.upsert.mockResolvedValue({ id: 'r-1' });
      prisma.financialSnapshot.upsert.mockResolvedValue({ id: 'snap-1', periodKey: '2026-08' });
      const res = await request(app).post('/api/financial-reports/snapshots').set(auth()).send({ periodKey: '2026-08' });
      expect(res.status).toBe(201);
    });

    it('lists snapshots', async () => {
      prisma.financialSnapshot.findMany.mockResolvedValue([{ id: 'snap-1', periodKey: '2026-08' }]);
      const res = await request(app).get('/api/financial-reports/snapshots').set(auth());
      expect(res.status).toBe(200);
    });
  });

  describe('Budgets + BvA', () => {
    it('creates a budget', async () => {
      prisma.budget.create.mockResolvedValue({ id: 'b-1' });
      const res = await request(app).post('/api/financial-reports/budgets').set(auth()).send({ name: 'Ops Budget', periodKey: '2026-08', category: 'OPERATING', amount: 100000 });
      expect(res.status).toBe(201);
    });

    it('returns budget-vs-actual rows', async () => {
      prisma.budgetVsActual.findMany.mockResolvedValue([{ id: 'bva-1', periodKey: '2026-08', budgetAmount: 100, actualAmount: 90 }]);
      const res = await request(app).get('/api/financial-reports/budget-vs-actual').set(auth());
      expect(res.status).toBe(200);
    });
  });

  describe('Notes, schedules, IFRS', () => {
    it('creates a note', async () => {
      prisma.financialNote.create.mockResolvedValue({ id: 'n-1' });
      const res = await request(app).post('/api/financial-reports/notes').set(auth()).send({ reportType: 'PNL', periodKey: '2026-08', title: 'Note', content: 'Content' });
      expect(res.status).toBe(201);
    });

    it('creates a schedule', async () => {
      prisma.reportSchedule.create.mockResolvedValue({ id: 's-1' });
      const res = await request(app).post('/api/financial-reports/schedules').set(auth()).send({ name: 'Monthly P&L', reportType: 'PNL' });
      expect(res.status).toBe(201);
    });

    it('creates an IFRS mapping', async () => {
      prisma.iFRSMapping.create.mockResolvedValue({ id: 'i-1', ifrsCode: 'IFRS15' });
      const res = await request(app).post('/api/financial-reports/ifrs').set(auth()).send({ ifrsCode: 'IFRS15', description: 'Revenue recognition', category: 'REVENUE' });
      expect(res.status).toBe(201);
    });

    it('lists segments', async () => {
      prisma.segmentPerformance.findMany.mockResolvedValue([{ id: 'seg-1', segmentType: 'AREA', segmentKey: 'Cairo' }]);
      const res = await request(app).get('/api/financial-reports/segments').set(auth());
      expect(res.status).toBe(200);
    });
  });
});

describe('Financial reporting engine', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  it('classifies P&L lines by account type', async () => {
    prisma.account.findMany.mockResolvedValue([
      { id: 'a-rev', code: '4000', name: 'Sales', type: 'REVENUE' },
      { id: 'a-exp', code: '5000', name: 'Opex', type: 'EXPENSE' },
    ]);
    prisma.generalLedgerEntry.findMany.mockResolvedValue([
      { accountId: 'a-rev', account: { type: 'REVENUE' }, totalDebit: 0, totalCredit: 0, closingBalance: -1000, openingBalance: 0 },
      { accountId: 'a-exp', account: { type: 'EXPENSE' }, totalDebit: 0, totalCredit: 0, closingBalance: 400, openingBalance: 0 },
    ]);
    const { buildPnl } = await import('../../src/services/financial-reporting-engine.js');
    const pnl = await buildPnl('2026-08');
    expect(pnl.totalRevenue).toBe(1000);
    expect(pnl.totalExpenses).toBe(400);
    expect(pnl.netIncome).toBe(600);
  });

  it('builds balanced balance sheet', async () => {
    prisma.account.findMany.mockResolvedValue([
      { id: 'a-asset', code: '1000', name: 'Cash', type: 'ASSET' },
      { id: 'a-liab', code: '2000', name: 'AP', type: 'LIABILITY' },
    ]);
    prisma.generalLedgerEntry.findMany.mockResolvedValue([
      { accountId: 'a-asset', account: { type: 'ASSET' }, totalDebit: 0, totalCredit: 0, closingBalance: 500, openingBalance: 0 },
      { accountId: 'a-liab', account: { type: 'LIABILITY' }, totalDebit: 0, totalCredit: 0, closingBalance: -500, openingBalance: 0 },
    ]);
    const { buildBalanceSheet } = await import('../../src/services/financial-reporting-engine.js');
    const bs = await buildBalanceSheet('2026-08');
    expect(bs.totalAssets).toBe(500);
    expect(bs.totalLiabilities).toBe(500);
    expect(bs.balanceCheck).toBe(0);
  });

  it('computes ratios', async () => {
    prisma.account.findMany.mockResolvedValue([]);
    prisma.generalLedgerEntry.findMany.mockResolvedValue([]);
    prisma.financialRatio.upsert.mockResolvedValue({ id: 'r-1' });
    const { computeRatios } = await import('../../src/services/financial-reporting-engine.js');
    const result = await computeRatios('2026-08');
    expect(result.ratios).toHaveProperty('netMargin');
    expect(result.ratios).toHaveProperty('currentRatio');
  });

  it('captures snapshot with all statements', async () => {
    prisma.account.findMany.mockResolvedValue([]);
    prisma.generalLedgerEntry.findMany.mockResolvedValue([]);
    prisma.journalEntry.findMany.mockResolvedValue([]);
    prisma.invoice.findMany.mockResolvedValue([]);
    prisma.budget.findMany.mockResolvedValue([]);
    prisma.budgetVsActual.create.mockResolvedValue({ id: 'bva-1' });
    prisma.financialRatio.upsert.mockResolvedValue({ id: 'r-1' });
    prisma.financialSnapshot.upsert.mockResolvedValue({ id: 'snap-1', data: '{}' });
    const { captureSnapshot } = await import('../../src/services/financial-reporting-engine.js');
    const snap = await captureSnapshot('2026-08');
    expect(snap.id).toBe('snap-1');
  });
});
