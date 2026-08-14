import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/server.js', () => ({ prisma }));
vi.mock('../../src/services/notification-engine.js', () => ({ processEvent: vi.fn().mockResolvedValue() }));
vi.mock('../../src/db.js', () => ({ prisma, default: prisma }));

const { generateCharges } = await import('../../src/services/business-engine.js');

describe('P59-C/LR-2 charge rule types (recovered from legacy charge_engine.py)', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  it('rate_based (unlimited): amount = consumption x rate', async () => {
    prisma.chargeRule.findMany.mockResolvedValue([{ id: 'r1', name: 'energy', type: 'rate_based', formula: '0.5', upperLimit: null, priority: 1, active: true }]);
    prisma.invoiceItem.create.mockResolvedValue({});
    await generateCharges('c1', 'inv1', 100, null, null);
    expect(prisma.invoiceItem.create.mock.calls[0][0].data.amount).toBe(50);
  });

  it('per_unit with upperLimit: capped at the limit', async () => {
    prisma.chargeRule.findMany.mockResolvedValue([{ id: 'r2', name: 'demand', type: 'per_unit', formula: '0.9', upperLimit: 50, priority: 1, active: true }]);
    prisma.invoiceItem.create.mockResolvedValue({});
    await generateCharges('c1', 'inv1', 100, null, null);
    expect(prisma.invoiceItem.create.mock.calls[0][0].data.amount).toBe(50); // capped
  });

  it('per_unit under the cap: not capped', async () => {
    prisma.chargeRule.findMany.mockResolvedValue([{ id: 'r2', name: 'demand', type: 'per_unit', formula: '0.9', upperLimit: 200, priority: 1, active: true }]);
    prisma.invoiceItem.create.mockResolvedValue({});
    await generateCharges('c1', 'inv1', 100, null, null);
    expect(prisma.invoiceItem.create.mock.calls[0][0].data.amount).toBe(90);
  });

  it('per_unit boundary: amount exactly at cap is allowed', async () => {
    prisma.chargeRule.findMany.mockResolvedValue([{ id: 'r2', name: 'demand', type: 'per_unit', formula: '0.5', upperLimit: 50, priority: 1, active: true }]);
    prisma.invoiceItem.create.mockResolvedValue({});
    await generateCharges('c1', 'inv1', 100, null, null);
    expect(prisma.invoiceItem.create.mock.calls[0][0].data.amount).toBe(50);
  });

  it('zero type: applies only when consumption is 0', async () => {
    prisma.chargeRule.findMany.mockResolvedValue([{ id: 'r3', name: 'zero-charge', type: 'zero', formula: '5', upperLimit: null, priority: 1, active: true }]);
    prisma.invoiceItem.create.mockResolvedValue({});
    await generateCharges('c1', 'inv1', 0, null, null);
    expect(prisma.invoiceItem.create).toHaveBeenCalledTimes(1);
    expect(prisma.invoiceItem.create.mock.calls[0][0].data.amount).toBe(5);
  });

  it('zero type: does NOT apply when consumption > 0', async () => {
    prisma.chargeRule.findMany.mockResolvedValue([{ id: 'r3', name: 'zero-charge', type: 'zero', formula: '5', upperLimit: null, priority: 1, active: true }]);
    await generateCharges('c1', 'inv1', 10, null, null);
    expect(prisma.invoiceItem.create).not.toHaveBeenCalled();
  });

  it('negative consumption yields no positive charge line', async () => {
    prisma.chargeRule.findMany.mockResolvedValue([{ id: 'r1', name: 'energy', type: 'rate_based', formula: '0.5', upperLimit: null, priority: 1, active: true }]);
    await generateCharges('c1', 'inv1', -5, null, null);
    expect(prisma.invoiceItem.create).not.toHaveBeenCalled();
  });
});
