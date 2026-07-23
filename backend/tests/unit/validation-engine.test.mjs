import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/db.js', () => ({ prisma }));

const { validateReading } = await import('../../src/services/validation-engine.js');

describe('validation-engine', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  it('should validate reading against rules', async () => {
    prisma.validationRule.findMany.mockResolvedValue([
      { id: 'vr1', name: 'Max Value', entityType: 'reading', active: true, action: 'reject', condition: '{"maxValue":5000}' },
    ]);
    prisma.validationResult.create.mockResolvedValue({ id: 'res-1', status: 'passed' });

    const result = await validateReading({ value: 1000 });
    expect(result).toBeDefined();
    expect(prisma.validationRule.findMany).toHaveBeenCalled();
  });
});
