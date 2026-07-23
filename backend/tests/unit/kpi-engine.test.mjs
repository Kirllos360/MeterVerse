import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/db.js', () => ({ prisma }));

const { seedKPIDefinitions, recordKPISnapshot } = await import('../../src/services/kpi-engine.js');

describe('kpi-engine', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  it('should seed KPI definitions', async () => {
    prisma.kpiDefinition.upsert.mockResolvedValue({ id: 'kpi-1' });
    await expect(seedKPIDefinitions()).resolves.toBeUndefined();
    expect(prisma.kpiDefinition.upsert).toHaveBeenCalledTimes(6);
  });

  it('should record KPI snapshot', async () => {
    prisma.kpiDefinition.findMany.mockResolvedValue([
      { id: 'kpi-1', name: 'Total Customers', target: 10000 },
      { id: 'kpi-2', name: 'Active Meters', target: 15000 },
    ]);
    prisma.customer.count.mockResolvedValue(100);
    prisma.meter.count.mockResolvedValue(200);
    prisma.kpiSnapshot.create.mockResolvedValue({ id: 'snap-1' });
    prisma.kpiDefinition.update.mockResolvedValue({ id: 'kpi-1' });

    await expect(recordKPISnapshot()).resolves.toBeUndefined();
    expect(prisma.kpiSnapshot.create).toHaveBeenCalledTimes(2);
    expect(prisma.kpiDefinition.update).toHaveBeenCalledTimes(2);
  });
});
