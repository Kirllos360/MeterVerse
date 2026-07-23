import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/server.js', () => ({ prisma }));

const biz = await import('../../src/services/business-engine.js');

const mockReading = { id: 'r1', value: 1500, meterId: 'm1', timestamp: new Date('2026-07-15'), status: 'valid', meter: { id: 'm1' } };
const prevReading = { id: 'r0', value: 1200, meterId: 'm1', timestamp: new Date('2026-07-01'), status: 'valid' };

describe('business-engine', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  describe('validateReading', () => {
    it('should pass reading that satisfies all rules', async () => {
      prisma.reading.findUnique.mockResolvedValue(mockReading);
      prisma.validationRule.findMany.mockResolvedValue([
        { id: 'rule1', name: 'Max 5000', entityType: 'reading', active: true, action: 'reject', condition: '{"maxValue":5000}' },
      ]);
      prisma.validationResult.create.mockResolvedValue({ id: 'vr1', status: 'passed' });
      prisma.reading.update.mockResolvedValue(mockReading);

      const result = await biz.validateReading('r1');
      expect(result.status).toBe('valid');
    });

    it('should fail reading that violates a reject rule', async () => {
      prisma.reading.findUnique.mockResolvedValue(mockReading);
      prisma.validationRule.findMany.mockResolvedValue([
        { id: 'rule1', name: 'Max 1000', entityType: 'reading', active: true, action: 'reject', condition: '{"maxValue":1000}' },
      ]);
      prisma.validationResult.create.mockResolvedValue({ id: 'vr1', status: 'failed' });
      prisma.reading.update.mockResolvedValue({ ...mockReading, status: 'rejected' });

      const result = await biz.validateReading('r1');
      expect(result.status).toBe('rejected');
    });

    it('should throw for missing reading', async () => {
      prisma.reading.findUnique.mockResolvedValue(null);
      await expect(biz.validateReading('bad-id')).rejects.toThrow('not found');
    });
  });

  describe('calculateConsumption', () => {
    it('should calculate consumption from two readings', async () => {
      prisma.reading.findMany.mockResolvedValue([prevReading, mockReading]);

      const result = await biz.calculateConsumption('m1', '2026-07-01', '2026-07-31');
      expect(result.consumption).toBe(300);
      expect(result.readingCount).toBe(2);
    });

    it('should return error with fewer than 2 readings', async () => {
      prisma.reading.findMany.mockResolvedValue([mockReading]);
      const result = await biz.calculateConsumption('m1', '2026-07-01', '2026-07-31');
      expect(result.error).toContain('at least 2');
    });

    it('should not return negative consumption', async () => {
      prisma.reading.findMany.mockResolvedValue([
        { ...mockReading, value: 1200, timestamp: new Date('2026-07-01') },
        { ...prevReading, value: 500, timestamp: new Date('2026-07-15') },
      ]);
      const result = await biz.calculateConsumption('m1', '2026-07-01', '2026-07-31');
      expect(result.consumption).toBe(0);
      expect(result.readingCount).toBe(2);
    });
  });

  describe('applyTariff', () => {
    it('should apply tiered rates correctly', async () => {
      prisma.tariff.findUnique.mockResolvedValue({
        id: 't1', name: 'Standard', rates: [], tiers: [
          { name: 'Tier 1', priority: 1, minValue: 0, maxValue: 100, rate: 1.0 },
          { name: 'Tier 2', priority: 2, minValue: 100, maxValue: null, rate: 1.5 },
        ],
      });

      const result = await biz.applyTariff('t1', 250, '2026-07-01', '2026-07-31');
      expect(result.totalConsumption).toBe(250);
      expect(result.totalCharge).toBe(100 * 1.0 + 50 * 1.5);
      expect(result.appliedCharges).toHaveLength(2);
    });

    it('should apply flat rates', async () => {
      prisma.tariff.findUnique.mockResolvedValue({
        id: 't1', name: 'Standard', rates: [{ name: 'Service Fee', rate: 0.1 }], tiers: [],
      });

      const result = await biz.applyTariff('t1', 200, '2026-07-01', '2026-07-31');
      expect(result.totalCharge).toBe(20);
    });

    it('should throw for missing tariff', async () => {
      prisma.tariff.findUnique.mockResolvedValue(null);
      await expect(biz.applyTariff('bad-id', 100, 'd1', 'd2')).rejects.toThrow('not found');
    });
  });

  describe('assembleInvoice', () => {
    it('should create invoice with correct calculations', async () => {
      prisma.customer.findUnique.mockResolvedValue({ id: 'c1', name: 'Test' });
      prisma.invoice.count.mockResolvedValue(5);
      prisma.invoice.create.mockResolvedValue({ id: 'i1', number: 'INV-000006', amount: 114, status: 'pending' });

      const charges = [{ total: 50 }, { total: 50 }];
      const result = await biz.assembleInvoice('c1', 'd1', 'd2', charges, null);
      expect(result.subtotal).toBe(100);
      expect(result.taxAmount).toBeCloseTo(14, 10);
      expect(result.total).toBeCloseTo(114, 10);
      expect(result.invoiceNumber).toBe('INV-000006');
    });
  });

  describe('postToLedger', () => {
    it('should create ledger entry', async () => {
      prisma.auditEntry.create.mockResolvedValue({ id: 'l1' });

      const result = await biz.postToLedger('i1', 500);
      expect(result.account).toBe('accounts_receivable');
      expect(result.amount).toBe(500);
      expect(result.type).toBe('debit');
    });
  });

  describe('executePipeline', () => {
    it('should run full pipeline successfully', async () => {
      prisma.reading.findMany.mockResolvedValue([prevReading, mockReading]);
      prisma.tariff.findUnique.mockResolvedValue({
        id: 't1', name: 'Standard', rates: [{ name: 'Base', rate: 0.5 }], tiers: [],
      });
      prisma.billCycle.findFirst.mockResolvedValue({ id: 'bc1', status: 'active' });
      prisma.billRun.create.mockResolvedValue({ id: 'br1' });
      prisma.invoice.create.mockResolvedValue({ id: 'i1', number: 'INV-test', amount: 150 });
      prisma.chargeRule.findMany.mockResolvedValue([]);
      prisma.auditEntry.create.mockResolvedValue({ id: 'l1' });
      prisma.billRun.update.mockResolvedValue({ id: 'br1', status: 'completed' });

      const result = await biz.executePipeline('m1', 'c1', 't1', '2026-07-01', '2026-07-31');
      expect(result.success).toBe(true);
      expect(result.steps.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle pipeline failures gracefully', async () => {
      prisma.reading.findMany.mockResolvedValue([mockReading]);
      const result = await biz.executePipeline('m1', 'c1', 't1', 'd1', 'd2');
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
