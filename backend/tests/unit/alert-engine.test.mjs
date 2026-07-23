import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/db.js', () => ({ prisma }));

const { evaluateAlerts } = await import('../../src/services/alert-engine.js');

describe('alert-engine', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  it('should evaluate alerts and create them on match', async () => {
    prisma.alertRule.findMany.mockResolvedValue([
      { id: 'ar1', name: 'High Consumption', entityType: 'reading', condition: '{"maxValue":5000}', severity: 'high', active: true },
    ]);
    prisma.alert.create.mockResolvedValue({ id: 'alert-1' });

    const result = await evaluateAlerts('reading', 'r1', { value: 6000 });
    expect(result).toBeDefined();
  });

  it('should evaluate alerts with no match', async () => {
    prisma.alertRule.findMany.mockResolvedValue([]);
    const result = await evaluateAlerts('reading', 'r1', { value: 100 });
    expect(result).toEqual([]);
  });
});
