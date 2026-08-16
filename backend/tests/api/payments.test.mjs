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
process.env.FINANCIAL_POSTING_ENABLED = 'false';

import request from 'supertest';
import express from 'express';
import { paymentsRouter } from '../../src/routes/payments.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/api/payments', paymentsRouter);
app.use(errorHandler);

function auth() { return { Authorization: 'Bearer t' }; }

function txMock() {
  prisma.$transaction.mockImplementation(async (fn) => fn(prisma));
}

describe('P60.4 payment route (Collection-derived financial scenarios, DB-mocked)', () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
    jwt.verify.mockReturnValue({ sub: 'user-1', email: 'admin@test.com', role: 'super_admin', system: 'admin' });
  });

  it('§17.1 full payment against one invoice', async () => {
    txMock();
    prisma.customer.findUnique.mockResolvedValue({ id: 'c-1' });
    prisma.payment.create.mockResolvedValue({ id: 'p-1', customerId: 'c-1', amount: 100, method: 'cash' });
    prisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1', amount: 100, paidAmount: 0, dueDate: '2026-01-01', status: 'overdue' }]);
    const res = await request(app).post('/api/payments').set(auth()).send({ customerId: 'c-1', amount: 100, method: 'cash' });
    expect(res.status).toBe(201);
    expect(prisma.paymentTransaction.create).toHaveBeenCalledTimes(1);
    const alloc = prisma.paymentTransaction.create.mock.calls[0][0].data;
    expect(alloc.amount).toBe(100);
    expect(alloc.invoiceId).toBe('inv-1');
  });

  it('§17.2 partial payment leaves invoice partial', async () => {
    txMock();
    prisma.customer.findUnique.mockResolvedValue({ id: 'c-1' });
    prisma.payment.create.mockResolvedValue({ id: 'p-1' });
    prisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1', amount: 100, paidAmount: 0, dueDate: '2026-01-01', status: 'overdue' }]);
    await request(app).post('/api/payments').set(auth()).send({ customerId: 'c-1', amount: 40, method: 'cash' });
    const alloc = prisma.paymentTransaction.create.mock.calls[0][0].data;
    expect(alloc.amount).toBe(40);
    const invUpdate = prisma.invoice.update.mock.calls[0][0].data;
    expect(invUpdate.status).toBe('partial');
  });

  it('§17.3 one payment allocated across multiple invoices (oldest due first)', async () => {
    txMock();
    prisma.customer.findUnique.mockResolvedValue({ id: 'c-1' });
    prisma.payment.create.mockResolvedValue({ id: 'p-1' });
    prisma.invoice.findMany.mockResolvedValue([
      { id: 'inv-old', amount: 60, paidAmount: 0, dueDate: '2026-01-01', status: 'overdue' },
      { id: 'inv-new', amount: 80, paidAmount: 0, dueDate: '2026-02-01', status: 'pending' },
    ]);
    await request(app).post('/api/payments').set(auth()).send({ customerId: 'c-1', amount: 100, method: 'cash' });
    const calls = prisma.paymentTransaction.create.mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[0][0].data.amount).toBe(60); // oldest invoice fully paid
    expect(calls[0][0].data.invoiceId).toBe('inv-old');
    expect(calls[1][0].data.amount).toBe(40); // remainder to second
    expect(calls[1][0].data.invoiceId).toBe('inv-new');
  });

  it('§17.4 multiple payments against one invoice accumulate', async () => {
    txMock();
    prisma.customer.findUnique.mockResolvedValue({ id: 'c-1' });
    prisma.payment.create.mockResolvedValue({ id: 'p-1' });
    prisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1', amount: 100, paidAmount: 60, dueDate: '2026-01-01', status: 'partial' }]);
    await request(app).post('/api/payments').set(auth()).send({ customerId: 'c-1', amount: 40, method: 'cash' });
    const alloc = prisma.paymentTransaction.create.mock.calls[0][0].data;
    expect(alloc.amount).toBe(40); // only the remaining due
    expect(alloc.invoiceId).toBe('inv-1');
  });

  it('§17.5 overpayment creates customer ledger credit', async () => {
    txMock();
    prisma.customer.findUnique.mockResolvedValue({ id: 'c-1' });
    prisma.payment.create.mockResolvedValue({ id: 'p-1' });
    prisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1', amount: 60, paidAmount: 0, dueDate: '2026-01-01', status: 'overdue' }]);
    await request(app).post('/api/payments').set(auth()).send({ customerId: 'c-1', amount: 100, method: 'cash' });
    expect(prisma.customerLedgerEntry.create).toHaveBeenCalledTimes(1);
    const ledger = prisma.customerLedgerEntry.create.mock.calls[0][0].data;
    expect(ledger.amount).toBe(40); // 100 - 60 allocated
    expect(ledger.type).toBe('credit');
  });

  it('§17.6 duplicate payment attempt is not silently double-counted (allocation capped to due)', async () => {
    txMock();
    prisma.customer.findUnique.mockResolvedValue({ id: 'c-1' });
    prisma.payment.create.mockResolvedValue({ id: 'p-1' });
    prisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1', amount: 100, paidAmount: 100, dueDate: '2026-01-01', status: 'paid' }]);
    await request(app).post('/api/payments').set(auth()).send({ customerId: 'c-1', amount: 50, method: 'cash' });
    expect(prisma.paymentTransaction.create).not.toHaveBeenCalled(); // nothing due
    expect(prisma.customerLedgerEntry.create).toHaveBeenCalledTimes(1); // becomes credit
  });

  it('§17.16 unauthorized payment access is rejected (401)', async () => {
    const res = await request(app).get('/api/payments');
    expect(res.status).toBe(401);
  });

  it('§17.17 cross-customer statement computes balance + aging correctly', async () => {
    prisma.customer.findUnique.mockResolvedValue({ id: 'c-1', name: 'Customer A' });
    prisma.invoice.findMany.mockResolvedValue([
      { id: 'inv-1', amount: 100, paidAmount: 60, status: 'partial', dueDate: new Date(Date.now() - 45 * 86400000).toISOString() },
      { id: 'inv-2', amount: 50, paidAmount: 50, status: 'paid', dueDate: new Date(Date.now() - 10 * 86400000).toISOString() },
    ]);
    prisma.payment.findMany.mockResolvedValue([{ id: 'p-1', amount: 110, status: 'completed' }]);
    const res = await request(app).get('/api/payments/customers/c-1/statement').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.totalInvoiced).toBe(150);
    expect(res.body.totalPaid).toBe(110);
    expect(res.body.balance).toBe(40);
    expect(res.body.aging['31-60']).toBe(40); // the partial 40-owing invoice at 45 days
  });
});
