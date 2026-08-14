import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/server.js', () => ({ prisma }));
vi.mock('../../src/services/notification-engine.js', () => ({ processEvent: vi.fn().mockResolvedValue() }));
vi.mock('../../src/db.js', () => ({ prisma, default: prisma }));

const { calculateSettlements, applySettlementsToInvoice, materializeSettlementItems } = await import('../../src/services/settlement-engine.js');

describe('P59-C/LR-2 settlement engine (recovered from legacy Collection System)', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  const mkSettlement = (type, overrides = {}) => ({
    id: 'stl-' + type, name: type, nameAr: type + '-ar', type,
    amount: 10, percentage: 5, active: true, archivedAt: null,
    ...overrides,
  });

  it('FIXED: adds the fixed amount to subtotal', async () => {
    prisma.settlement.findMany.mockResolvedValue([mkSettlement('fixed')]);
    const r = await calculateSettlements(100, 'cust-1');
    expect(r).toEqual([{ settlementId: 'stl-fixed', name: 'fixed', nameAr: 'fixed-ar', type: 'fixed', amount: 10 }]);
  });

  it('PERCENTAGE: adds % of subtotal rounded to 2dp', async () => {
    prisma.settlement.findMany.mockResolvedValue([mkSettlement('percentage', { percentage: 12.5 })]);
    const r = await calculateSettlements(100.5, 'cust-1');
    expect(r[0].amount).toBeCloseTo(12.56, 2); // 100.5 * 0.125 = 12.5625 -> 12.56
  });

  it('PERCENTAGE: skips when amount rounds to zero', async () => {
    prisma.settlement.findMany.mockResolvedValue([mkSettlement('percentage', { percentage: 0.01 })]);
    const r = await calculateSettlements(1, 'cust-1');
    expect(r).toEqual([]);
  });

  it('ONE_TIME: applied only once per customer (guarded by InvoiceSettlement reference)', async () => {
    prisma.settlement.findMany.mockResolvedValue([mkSettlement('one_time')]);
    prisma.invoiceSettlement.findFirst.mockResolvedValue(null); // not yet applied
    let r = await calculateSettlements(100, 'cust-1');
    expect(r).toHaveLength(1);

    prisma.invoiceSettlement.findFirst.mockResolvedValue({ id: 'applied-1', invoice: { customerId: 'cust-1' } });
    r = await calculateSettlements(100, 'cust-1');
    expect(r).toEqual([]);
  });

  it('inactive settlements are excluded', async () => {
    prisma.settlement.findMany.mockResolvedValue([mkSettlement('fixed', { active: false })]);
    const r = await calculateSettlements(100, 'cust-1');
    expect(r).toEqual([]);
  });

  it('applySettlementsToInvoice records InvoiceSettlement rows and sums amount', async () => {
    prisma.settlement.findMany.mockResolvedValue([mkSettlement('fixed'), mkSettlement('percentage', { percentage: 10 })]);
    prisma.invoiceSettlement.create.mockResolvedValue({});
    const r = await applySettlementsToInvoice('inv-1', 'cust-1', 100);
    expect(r.settlements).toHaveLength(2);
    expect(r.totalSettlementAmount).toBe(20); // 10 fixed + 10% of 100
    expect(prisma.invoiceSettlement.create).toHaveBeenCalledTimes(2);
  });

  it('materializeSettlementItems is idempotent (no duplicate lines)', async () => {
    prisma.invoiceItem.findMany.mockResolvedValue([{ referenceId: 'stl-fixed' }]);
    prisma.invoiceItem.create.mockResolvedValue({ id: 'new-item' });
    const items = await materializeSettlementItems('inv-1', [
      { settlementId: 'stl-fixed', name: 'f', type: 'fixed', amount: 10 },
      { settlementId: 'stl-pct', name: 'p', type: 'percentage', amount: 5 },
    ]);
    expect(items).toHaveLength(1); // only stl-pct inserted; stl-fixed skipped
  });
});
