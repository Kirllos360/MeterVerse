import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/db.js', () => ({ prisma }));

const { generateInvoice } = await import('../../src/services/billing-engine.js');

describe('billing-engine', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  it('should generate invoice from readings', async () => {
    prisma.reading.findMany.mockResolvedValue([
      { id: 'r1', value: 1000, timestamp: new Date('2026-07-01'), meterId: 'm1' },
      { id: 'r2', value: 1500, timestamp: new Date('2026-07-31'), meterId: 'm1' },
    ]);
    prisma.tariff.findFirst.mockResolvedValue({
      id: 't1', name: 'Standard', rates: [], tiers: [],
    });
    prisma.invoice.create.mockResolvedValue({
      id: 'i1', number: 'INV-000001', customerId: 'c1', amount: 0, status: 'pending',
    });

    const result = await generateInvoice('c1', '2026-07-01', '2026-07-31');
    expect(result).toBeDefined();
    expect(prisma.reading.findMany).toHaveBeenCalled();
  });
});
