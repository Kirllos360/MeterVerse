import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/db.js', () => ({ prisma, default: prisma }));
vi.mock('../../src/services/posting-engine.js', () => ({
  postEvent: vi.fn().mockResolvedValue({ ok: true, id: 'gl-1' }),
}));

const { enqueueEvent, deriveIdempotencyKey, OUTBOX_ENABLED, FINANCIAL_POSTING_ENABLED } = await import('../../src/services/outbox-producer.js');

describe('P12.2-C enqueueEvent outbox producer (P12-03-03)', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  it('1. derives a deterministic idempotency key from source+type+amount+desc', () => {
    const a = deriveIdempotencyKey({ sourceId: 'inv-1', eventType: 'INVOICE_ISSUED', amount: 100, description: 'x' });
    const b = deriveIdempotencyKey({ sourceId: 'inv-1', eventType: 'INVOICE_ISSUED', amount: 100, description: 'x' });
    expect(a).toBe(b);
    expect(a).toHaveLength(64); // sha256 hex
    const c = deriveIdempotencyKey({ sourceId: 'inv-1', eventType: 'INVOICE_ISSUED', amount: 101, description: 'x' });
    expect(c).not.toBe(a);
  });

  it('2. writes an OutboxEvent with correlation + causation + idempotency when outbox enabled', async () => {
    const saved = process.env.OUTBOX_ENABLED;
    process.env.OUTBOX_ENABLED = 'true';
    prisma.outboxEvent.create.mockResolvedValue({ id: 'out-1' });
    try {
      const r = await enqueueEvent(
        { sourceType: 'INVOICE', sourceId: 'inv-1', eventType: 'INVOICE_ISSUED', amount: 100, description: 'issued', context: { areaId: 'a1', projectId: 'p1', correlationId: 'c1' } },
        { correlationId: 'c1', causationId: 'ca1', actorId: 'u1' }
      );
      expect(r.outboxId).toBe('out-1');
      expect(r.outboxEnabled).toBe(true);
      expect(prisma.outboxEvent.create).toHaveBeenCalledTimes(1);
      const data = prisma.outboxEvent.create.mock.calls[0][0].data;
      expect(data.eventType).toBe('INVOICE_ISSUED');
      expect(data.aggregateType).toBe('INVOICE');
      expect(data.aggregateId).toBe('inv-1');
      expect(data.correlationId).toBe('c1');
      expect(data.causationId).toBe('ca1');
      expect(data.idempotencyKey).toHaveLength(64);
      expect(data.areaId).toBe('a1');
      expect(data.projectId).toBe('p1');
    } finally {
      if (saved === undefined) delete process.env.OUTBOX_ENABLED; else process.env.OUTBOX_ENABLED = saved;
    }
  });

  it('3. does NOT write outbox when OUTBOX_ENABLED is false (rollback-safe)', async () => {
    const saved = process.env.OUTBOX_ENABLED;
    process.env.OUTBOX_ENABLED = 'false';
    try {
      const r = await enqueueEvent({ sourceType: 'INVOICE', sourceId: 'inv-1', eventType: 'INVOICE_ISSUED', amount: 100, description: 'x' });
      expect(prisma.outboxEvent.create).not.toHaveBeenCalled();
      expect(r.outboxId).toBeNull();
    } finally {
      if (saved === undefined) delete process.env.OUTBOX_ENABLED; else process.env.OUTBOX_ENABLED = saved;
    }
  });

  it('4. uses the provided tx (same transaction as the domain mutation)', async () => {
    const saved = process.env.OUTBOX_ENABLED;
    process.env.OUTBOX_ENABLED = 'true';
    prisma.outboxEvent.create.mockResolvedValue({ id: 'out-1' });
    const fakeTx = { outboxEvent: { create: vi.fn().mockResolvedValue({ id: 'out-tx' }) } };
    try {
      await enqueueEvent({ sourceType: 'INVOICE', sourceId: 'inv-1', eventType: 'X', amount: 1 }, { tx: fakeTx });
      expect(fakeTx.outboxEvent.create).toHaveBeenCalledTimes(1);
      expect(prisma.outboxEvent.create).not.toHaveBeenCalled();
    } finally {
      if (saved === undefined) delete process.env.OUTBOX_ENABLED; else process.env.OUTBOX_ENABLED = saved;
    }
  });

  it('5. calls legacy postEvent only when FINANCIAL_POSTING_ENABLED', async () => {
    const savedFin = process.env.FINANCIAL_POSTING_ENABLED;
    const savedOut = process.env.OUTBOX_ENABLED;
    process.env.OUTBOX_ENABLED = 'false';
    process.env.FINANCIAL_POSTING_ENABLED = 'true';
    const { postEvent } = await import('../../src/services/posting-engine.js');
    try {
      await enqueueEvent({ sourceType: 'INVOICE', sourceId: 'inv-1', eventType: 'INVOICE_ISSUED', amount: 100, description: 'x' });
      expect(postEvent).toHaveBeenCalledTimes(1);
      expect(postEvent.mock.calls[0][0].sourceId).toBe('inv-1');
    } finally {
      if (savedFin === undefined) delete process.env.FINANCIAL_POSTING_ENABLED; else process.env.FINANCIAL_POSTING_ENABLED = savedFin;
      if (savedOut === undefined) delete process.env.OUTBOX_ENABLED; else process.env.OUTBOX_ENABLED = savedOut;
    }
  });

  it('6. returns ok with outbox+legacy result', async () => {
    const savedOut = process.env.OUTBOX_ENABLED;
    process.env.OUTBOX_ENABLED = 'true';
    prisma.outboxEvent.create.mockResolvedValue({ id: 'out-1' });
    try {
      const r = await enqueueEvent({ sourceType: 'INVOICE', sourceId: 'inv-1', eventType: 'E', amount: 5, description: 'd' });
      expect(r.ok).toBe(true);
      expect(r.outboxId).toBe('out-1');
      expect(r.legacy).toBeTruthy();
    } finally {
      if (savedOut === undefined) delete process.env.OUTBOX_ENABLED; else process.env.OUTBOX_ENABLED = savedOut;
    }
  });
});
