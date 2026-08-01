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
process.env.FINANCIAL_POSTING_ENABLED = 'true';

import request from 'supertest';
import express from 'express';
import { financialIntegrationRouter } from '../../src/routes/financial-integration.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/api/financial-integration', financialIntegrationRouter);
app.use(errorHandler);

function auth() { return { Authorization: 'Bearer t' }; }

describe('C13 Financial Integration routes', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
    jwt.verify.mockReturnValue({ sub: 'user-1', email: 'admin@test.com', role: 'super_admin', system: 'admin' });
    prisma.auditEntry.create.mockResolvedValue({});
  });

  describe('AccountMappings', () => {
    it('lists account mappings', async () => {
      prisma.accountMapping.findMany.mockResolvedValue([{ id: 'm-1', transactionType: 'INVOICE_ISSUED' }]);
      const res = await request(app).get('/api/financial-integration/account-mappings').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.mappings).toHaveLength(1);
    });

    it('creates an account mapping', async () => {
      prisma.account.findUnique.mockImplementation(async ({ where }) => ({ id: where.id, code: 'A', name: 'Account' }));
      prisma.accountMapping.create.mockResolvedValue({ id: 'm-1', transactionType: 'INVOICE_ISSUED', debitAccountId: 'a-1', creditAccountId: 'a-2' });
      const res = await request(app)
        .post('/api/financial-integration/account-mappings')
        .set(auth())
        .send({ name: 'Invoice AR', transactionType: 'INVOICE_ISSUED', debitAccountId: 'a-1', creditAccountId: 'a-2' });
      expect(res.status).toBe(201);
      expect(prisma.accountMapping.create).toHaveBeenCalled();
    });

    it('rejects create when account does not exist', async () => {
      prisma.account.findUnique.mockResolvedValue(null);
      const res = await request(app)
        .post('/api/financial-integration/account-mappings')
        .set(auth())
        .send({ name: 'Bad', transactionType: 'INVOICE_ISSUED', debitAccountId: 'a-1', creditAccountId: 'a-2' });
      expect(res.status).toBe(400);
    });

    it('archives an account mapping', async () => {
      prisma.accountMapping.update.mockResolvedValue({ id: 'm-1' });
      const res = await request(app).delete('/api/financial-integration/account-mappings/m-1').set(auth());
      expect(res.status).toBe(200);
    });
  });

  describe('FinancialEvents', () => {
    it('lists events', async () => {
      prisma.financialEvent.findMany.mockResolvedValue([{ id: 'e-1', eventType: 'INVOICE_ISSUED', status: 'POSTED' }]);
      prisma.financialEvent.count.mockResolvedValue(1);
      const res = await request(app).get('/api/financial-integration/events').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.events).toHaveLength(1);
    });

    it('posts an event via the engine', async () => {
      prisma.financialEvent.findUnique.mockResolvedValue(null);
      prisma.financialPeriod.findFirst.mockResolvedValue({ id: 'p-1', year: 2026, month: 8 });
      prisma.accountMapping.findMany.mockResolvedValue([{ id: 'm-1', debitAccountId: 'a-1', creditAccountId: 'a-2', priority: 100, condition: null }]);
      prisma.journalEntry.count.mockResolvedValue(0);
      prisma.journalEntry.create.mockResolvedValue({
        id: 'j-1', entryNumber: 'JE-202608-0001', status: 'POSTED',
        lines: [{ accountId: 'a-1', debitAmount: 100, creditAmount: 0 }, { accountId: 'a-2', debitAmount: 0, creditAmount: 100 }],
      });
      prisma.generalLedgerEntry.findUnique.mockResolvedValue(null);
      prisma.generalLedgerEntry.findFirst.mockResolvedValue(null);
      prisma.generalLedgerEntry.create.mockResolvedValue({ id: 'gl-1' });
      prisma.financialEvent.update.mockResolvedValue({ id: 'e-1', status: 'POSTED', journalEntryId: 'j-1' });

      const res = await request(app)
        .post('/api/financial-integration/events/post')
        .set(auth())
        .send({ sourceType: 'INVOICE', sourceId: 'inv-1', eventType: 'INVOICE_ISSUED', amount: 100, description: 'Invoice issued' });
      expect(res.status).toBe(201);
      expect(res.body.event.status).toBe('POSTED');
    });

    it('returns 400 when no account mapping exists', async () => {
      prisma.financialEvent.findUnique.mockResolvedValue(null);
      prisma.financialPeriod.findFirst.mockResolvedValue({ id: 'p-1' });
      prisma.accountMapping.findMany.mockResolvedValue([]);
      prisma.financialEvent.create.mockResolvedValue({ id: 'e-1', status: 'FAILED' });

      const res = await request(app)
        .post('/api/financial-integration/events/post')
        .set(auth())
        .send({ sourceType: 'INVOICE', sourceId: 'inv-2', eventType: 'INVOICE_ISSUED', amount: 50 });
      expect(res.status).toBe(400);
    });

    it('skips duplicate events', async () => {
      prisma.financialEvent.findUnique.mockResolvedValue({ id: 'e-dup', status: 'POSTED', sourceType: 'INVOICE', sourceId: 'inv-3' });
      const res = await request(app)
        .post('/api/financial-integration/events/post')
        .set(auth())
        .send({ sourceType: 'INVOICE', sourceId: 'inv-3', eventType: 'INVOICE_ISSUED', amount: 10 });
      expect(res.status).toBe(400);
      expect(res.body.skipped).toBe(true);
    });

    it('retries a failed event', async () => {
      prisma.financialEvent.findUnique.mockResolvedValue({ id: 'e-f', sourceType: 'PAYMENT', sourceId: 'pay-1', eventType: 'PAYMENT_RECEIVED', amount: 20, description: 'Pay', status: 'FAILED', metadata: null });
      prisma.financialPeriod.findFirst.mockResolvedValue({ id: 'p-1' });
      prisma.accountMapping.findMany.mockResolvedValue([{ id: 'm-1', debitAccountId: 'a-1', creditAccountId: 'a-2', priority: 100, condition: null }]);
      prisma.journalEntry.count.mockResolvedValue(1);
      prisma.journalEntry.create.mockResolvedValue({ id: 'j-2', entryNumber: 'JE-202608-0002', status: 'POSTED', lines: [{ accountId: 'a-1', debitAmount: 20, creditAmount: 0 }, { accountId: 'a-2', debitAmount: 0, creditAmount: 20 }] });
      prisma.generalLedgerEntry.findUnique.mockResolvedValue(null);
      prisma.generalLedgerEntry.findFirst.mockResolvedValue(null);
      prisma.generalLedgerEntry.create.mockResolvedValue({ id: 'gl-2' });
      prisma.financialEvent.update.mockResolvedValue({ id: 'e-f', status: 'POSTED', journalEntryId: 'j-2' });

      const res = await request(app).post('/api/financial-integration/events/e-f/retry').set(auth());
      expect(res.status).toBe(200);
    });

    it('does not retry an already posted event', async () => {
      prisma.financialEvent.findUnique.mockResolvedValue({ id: 'e-p', status: 'POSTED' });
      const res = await request(app).post('/api/financial-integration/events/e-p/retry').set(auth());
      expect(res.status).toBe(400);
    });
  });

  describe('Audit trail and summary', () => {
    it('returns audit trail events', async () => {
      prisma.financialEvent.findMany.mockResolvedValue([{ id: 'e-1', sourceType: 'INVOICE', sourceId: 'inv-1' }]);
      prisma.financialEvent.count.mockResolvedValue(1);
      const res = await request(app).get('/api/financial-integration/audit-trail').set(auth());
      expect(res.status).toBe(200);
    });

    it('returns summary counts', async () => {
      prisma.financialEvent.count.mockResolvedValue(3);
      prisma.accountMapping.count.mockResolvedValue(2);
      const res = await request(app).get('/api/financial-integration/summary').set(auth());
      expect(res.status).toBe(200);
      expect(res.body.activeMappings).toBe(2);
    });
  });
});

describe('C13 PostingEngine service', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
  });

  it('posts a balanced journal entry and updates GL', async () => {
    vi.resetModules();
    prisma.financialEvent.findUnique.mockResolvedValue(null);
    prisma.financialPeriod.findFirst.mockResolvedValue({ id: 'p-1' });
    prisma.accountMapping.findMany.mockResolvedValue([{ id: 'm-1', debitAccountId: 'a-1', creditAccountId: 'a-2', priority: 100, condition: null }]);
    prisma.journalEntry.count.mockResolvedValue(0);
    prisma.journalEntry.create.mockResolvedValue({
      id: 'j-1', entryNumber: 'JE-202608-0001', status: 'POSTED',
      lines: [{ accountId: 'a-1', debitAmount: 100, creditAmount: 0 }, { accountId: 'a-2', debitAmount: 0, creditAmount: 100 }],
    });
    prisma.generalLedgerEntry.findUnique.mockResolvedValue(null);
    prisma.generalLedgerEntry.findFirst.mockResolvedValue(null);
    prisma.generalLedgerEntry.create.mockResolvedValue({ id: 'gl-1' });
    prisma.financialEvent.update.mockResolvedValue({ id: 'e-1', status: 'POSTED', journalEntryId: 'j-1' });

    const { postEvent } = await import('../../src/services/posting-engine.js');
    const result = await postEvent({ sourceType: 'INVOICE', sourceId: 'inv-x', eventType: 'INVOICE_ISSUED', amount: 100 });
    expect(result.ok).toBe(true);
    expect(prisma.journalEntry.create).toHaveBeenCalled();
    expect(prisma.generalLedgerEntry.create).toHaveBeenCalled();
  });

  it('fails when no open financial period exists', async () => {
    prisma.financialEvent.findUnique.mockResolvedValue(null);
    prisma.financialPeriod.findFirst.mockResolvedValue(null);
    prisma.financialEvent.create.mockResolvedValue({ id: 'e-f', status: 'FAILED' });
    const { postEvent } = await import('../../src/services/posting-engine.js');
    const result = await postEvent({ sourceType: 'PAYMENT', sourceId: 'pay-x', eventType: 'PAYMENT_RECEIVED', amount: 10 });
    expect(result.ok).toBe(false);
  });

  it('fails when no mapping exists', async () => {
    prisma.financialEvent.findUnique.mockResolvedValue(null);
    prisma.financialPeriod.findFirst.mockResolvedValue({ id: 'p-1' });
    prisma.accountMapping.findMany.mockResolvedValue([]);
    prisma.financialEvent.create.mockResolvedValue({ id: 'e-f', status: 'FAILED' });
    const { postEvent } = await import('../../src/services/posting-engine.js');
    const result = await postEvent({ sourceType: 'INVOICE', sourceId: 'inv-y', eventType: 'INVOICE_ADJUSTED', amount: 10 });
    expect(result.ok).toBe(false);
  });

  it('skips already-processed events', async () => {
    prisma.financialEvent.findUnique.mockResolvedValue({ id: 'e-dup', sourceType: 'INVOICE', sourceId: 'inv-z', status: 'POSTED' });
    const { postEvent } = await import('../../src/services/posting-engine.js');
    const result = await postEvent({ sourceType: 'INVOICE', sourceId: 'inv-z', eventType: 'INVOICE_ISSUED', amount: 10 });
    expect(result.ok).toBe(false);
    expect(result.skipped).toBe(true);
  });
});
