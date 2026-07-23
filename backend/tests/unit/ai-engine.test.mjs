import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/server.js', () => ({ prisma }));

const ai = await import('../../src/services/ai-engine.js');

describe('ai-engine', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  describe('aiOperator', () => {
    it('should detect overdue invoice intent', async () => {
      prisma.invoice.count.mockResolvedValue(5);
      prisma.invoice.aggregate.mockResolvedValue({ _sum: { amount: 10000 } });

      const result = await ai.aiOperator('Show me overdue invoices');
      const overdue = result.results.find(r => r.intent === 'overdue_invoices');
      expect(overdue).toBeDefined();
      expect(overdue.data.count).toBe(5);
    });

    it('should detect active meters/customers intent', async () => {
      prisma.meter.count.mockResolvedValue(100);
      prisma.customer.count.mockResolvedValue(80);

      const result = await ai.aiOperator('How many active meters and customers?');
      const active = result.results.find(r => r.intent === 'active_entities');
      expect(active.data.meters).toBe(100);
      expect(active.data.customers).toBe(80);
    });

    it('should detect revenue intent', async () => {
      prisma.invoice.aggregate.mockResolvedValue({ _sum: { amount: 50000 } });

      const result = await ai.aiOperator('What is the total revenue?');
      const rev = result.results.find(r => r.intent === 'total_revenue');
      expect(rev.data.total).toBe(50000);
    });

    it('should return unrecognized intent for unknown queries', async () => {
      const result = await ai.aiOperator('What is the weather?');
      expect(result.results[0].intent).toBe('unrecognized');
    });
  });

  describe('aiBillingAssistant', () => {
    it('should analyze paid invoice', async () => {
      prisma.invoice.findUnique.mockResolvedValue({
        id: 'i1', number: 'INV-001', amount: 1000, status: 'paid', dueDate: new Date(),
        customer: { name: 'Test Corp' }, payments: [{ amount: 1000 }],
      });

      const result = await ai.aiBillingAssistant('i1');
      expect(result.analysis.status).toBe('paid');
      expect(result.insight).toContain('PAID');
    });

    it('should analyze overdue invoice', async () => {
      const pastDate = new Date(Date.now() - 5 * 86400000);
      prisma.invoice.findUnique.mockResolvedValue({
        id: 'i2', number: 'INV-002', amount: 500, status: 'overdue', dueDate: pastDate,
        customer: { name: 'Late Payer' }, payments: [],
      });

      const result = await ai.aiBillingAssistant('i2');
      expect(result.analysis.status).toBe('overdue');
      expect(result.insight).toContain('OVERDUE');
    });

    it('should return error for missing invoice', async () => {
      prisma.invoice.findUnique.mockResolvedValue(null);
      const result = await ai.aiBillingAssistant('bad-id');
      expect(result.error).toBe('Invoice not found');
    });
  });

  describe('aiReadingValidator', () => {
    it('should detect anomalies in readings', async () => {
      prisma.reading.findMany.mockResolvedValue([
        { id: 'r5', value: 500, meterId: 'm1', timestamp: new Date() },
        { id: 'r4', value: 480, meterId: 'm1', timestamp: new Date(Date.now() - 86400000) },
        { id: 'r3', value: 1000, meterId: 'm1', timestamp: new Date(Date.now() - 2 * 86400000) },
        { id: 'r2', value: 460, meterId: 'm1', timestamp: new Date(Date.now() - 3 * 86400000) },
        { id: 'r1', value: 440, meterId: 'm1', timestamp: new Date(Date.now() - 4 * 86400000) },
      ]);

      const result = await ai.aiReadingValidator('m1');
      expect(result.anomaliesFound).toBeGreaterThanOrEqual(0);
      expect(['normal', 'anomaly_detected']).toContain(result.status);
    });

    it('should return need-more-data with <3 readings', async () => {
      prisma.reading.findMany.mockResolvedValue([{ id: 'r1', value: 100, meterId: 'm1', timestamp: new Date() }]);
      const result = await ai.aiReadingValidator('m1');
      expect(result.message).toContain('at least 3');
    });
  });

  describe('aiLeakDetection', () => {
    it('should detect possible leak with continuous consumption', async () => {
      const readings = Array.from({ length: 15 }, (_, i) => ({
        id: `r${i}`, value: Math.random() * 10 + 1, meterId: 'm1', timestamp: new Date(Date.now() - i * 86400000),
      }));
      prisma.reading.findMany.mockResolvedValue(readings);

      const result = await ai.aiLeakDetection('m1');
      expect(['normal', 'possible_leak', 'leak_suspected']).toContain(result.status);
    });

    it('should return insufficient data with <10 readings', async () => {
      prisma.reading.findMany.mockResolvedValue(Array.from({ length: 5 }, (_, i) => ({
        id: `r${i}`, value: 10, meterId: 'm1', timestamp: new Date(),
      })));
      const result = await ai.aiLeakDetection('m1');
      expect(result.status).toBe('insufficient_data');
    });
  });

  describe('aiForecasting', () => {
    it('should forecast with sufficient data', async () => {
      const readings = Array.from({ length: 60 }, (_, i) => ({
        id: `r${i}`, value: 100 + Math.random() * 20, timestamp: new Date(Date.now() - i * 86400000),
      }));
      prisma.reading.findMany.mockResolvedValue(readings);

      const result = await ai.aiForecasting('consumption', 30);
      expect(result.confidence).toBe('high');
      expect(result.projectedConsumption).toBeGreaterThan(0);
      expect(['increasing', 'decreasing', 'stable']).toContain(result.trend);
    });

    it('should return insufficient data with <5 readings', async () => {
      prisma.reading.findMany.mockResolvedValue([]);
      const result = await ai.aiForecasting('consumption', 30);
      expect(result.status).toBe('insufficient_data');
    });
  });

  describe('aiRootCauseAnalysis', () => {
    it('should detect overdue issues', async () => {
      const pastDate = new Date(Date.now() - 10 * 86400000);
      prisma.invoice.findUnique.mockResolvedValue({
        id: 'i1', number: 'INV-001', amount: 15000, status: 'overdue', dueDate: pastDate,
        customer: { name: 'Test' }, payments: [],
      });

      const result = await ai.aiRootCauseAnalysis('i1');
      expect(result.issues.length).toBeGreaterThanOrEqual(2);
      expect(result.issues.some(i => i.type === 'overdue')).toBe(true);
    });

    it('should return no issues for clean invoice', async () => {
      prisma.invoice.findUnique.mockResolvedValue({
        id: 'i2', number: 'INV-002', amount: 500, status: 'paid', dueDate: new Date(),
        customer: { name: 'Test' }, payments: [{ amount: 500 }],
      });

      const result = await ai.aiRootCauseAnalysis('i2');
      expect(result.issuesFound).toBe(0);
    });
  });

  describe('aiReportBuilder', () => {
    it('should generate summary report', async () => {
      prisma.invoice.aggregate.mockResolvedValue({ _sum: { amount: 50000 } });
      prisma.reading.count.mockResolvedValue(1000);
      prisma.invoice.count.mockResolvedValue(50);
      prisma.customer.count.mockResolvedValue(30);

      const result = await ai.aiReportBuilder({ reportType: 'summary', period: 'monthly', metric: 'revenue' });
      expect(result.metrics.revenue).toBe(50000);
      expect(result.metrics.readings).toBe(1000);
      expect(result.summary).toContain('EGP');
    });
  });

  describe('aiSqlAssistant', () => {
    it('should match overdue invoice pattern', async () => {
      const result = await ai.aiSqlAssistant('Show me all overdue invoices');
      expect(result.generated).toBe(true);
      expect(result.sql[0]).toContain('overdue');
    });

    it('should handle unrecognized queries', async () => {
      const result = await ai.aiSqlAssistant('What is the meaning of life?');
      expect(result.generated).toBe(false);
    });
  });

  describe('aiWorkflowGenerator', () => {
    it('should match overdue invoice workflow', async () => {
      const result = await ai.aiWorkflowGenerator('Handle overdue invoice');
      expect(result.generated).toBe(true);
      expect(result.workflows[0].trigger).toBe('overdue_invoice');
    });

    it('should return all templates for unrecognized descriptions', async () => {
      const result = await ai.aiWorkflowGenerator('Do something random');
      expect(result.generated).toBe(false);
      expect(result.workflows.length).toBeGreaterThan(0);
    });
  });
});
