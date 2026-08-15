import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/server.js', () => ({ prisma }));
vi.mock('../../src/services/notification-engine.js', () => ({ processEvent: vi.fn().mockResolvedValue() }));
vi.mock('../../src/db.js', () => ({ prisma, default: prisma }));

const { createChequePayment, clearChequePayment, rejectChequePayment } = await import('../../src/services/cheque-engine.js');

describe('P59-C/LR-7 cheque engine (evidence-supported adaptation of legacy Cheque lifecycle)', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  it('creates a pending cheque payment with reference=cheque number + bank in notes', async () => {
    prisma.payment.create.mockResolvedValue({ id: 'p-1' });
    await createChequePayment({ customerId: 'c-1', amount: 100, chequeNumber: 'CHQ-001', bankName: 'NBE' });
    const data = prisma.payment.create.mock.calls[0][0].data;
    expect(data.method).toBe('cheque');
    expect(data.status).toBe('pending');
    expect(data.reference).toBe('CHQ-001');
    expect(data.notes).toContain('bank: NBE');
    expect(data.paidAt).toBeNull();
  });

  it('rejects a cheque payment without a cheque number', async () => {
    await expect(createChequePayment({ customerId: 'c-1', amount: 100 })).rejects.toThrow('chequeNumber is required');
  });

  it('clears a pending cheque (status -> completed, paidAt set)', async () => {
    prisma.payment.findUnique.mockResolvedValue({ id: 'p-1', method: 'cheque', status: 'pending' });
    prisma.payment.update.mockResolvedValue({ id: 'p-1', status: 'completed' });
    const r = await clearChequePayment('p-1');
    expect(prisma.payment.update.mock.calls[0][0].data.status).toBe('completed');
    expect(prisma.payment.update.mock.calls[0][0].data.paidAt).toBeInstanceOf(Date);
    expect(r.status).toBe('completed');
  });

  it('clear is idempotent (already completed returns as-is)', async () => {
    prisma.payment.findUnique.mockResolvedValue({ id: 'p-1', method: 'cheque', status: 'completed' });
    const r = await clearChequePayment('p-1');
    expect(r.status).toBe('completed');
    expect(prisma.payment.update).not.toHaveBeenCalled();
  });

  it('clear rejects non-cheque payments', async () => {
    prisma.payment.findUnique.mockResolvedValue({ id: 'p-1', method: 'cash', status: 'completed' });
    await expect(clearChequePayment('p-1')).rejects.toThrow('not a cheque');
  });

  it('rejects/bounces a cheque (status -> rejected with reason)', async () => {
    prisma.payment.findUnique.mockResolvedValue({ id: 'p-1', method: 'cheque', status: 'pending', notes: null });
    prisma.payment.update.mockResolvedValue({ id: 'p-1', status: 'rejected' });
    await rejectChequePayment('p-1', 'insufficient funds');
    const data = prisma.payment.update.mock.calls[0][0].data;
    expect(data.status).toBe('rejected');
    expect(data.notes).toContain('rejected: insufficient funds');
  });
});
