import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/db.js', () => ({ prisma, default: prisma }));
vi.mock('../../src/services/logger.js', () => ({ default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('../../src/services/posting-engine.js', () => ({ postEvent: vi.fn().mockResolvedValue({ ok: true, id: 'gl-1' }) }));

const {
  registerConsumer, runDispatchCycle, DISPATCH_LIMIT, MAX_ATTEMPTS,
} = await import('../../src/services/outbox-dispatcher.js');
const { ledgerConsumer, deriveIdempotencyKey, startLedgerConsumer } = await import('../../src/services/ledger-consumer.js');

const EV = (over = {}) => ({
  id: 'evt-1', eventType: 'INVOICE_ISSUED', eventVersion: 1, aggregateType: 'INVOICE', aggregateId: 'inv-1',
  areaId: 'a1', projectId: 'p1', correlationId: 'c1', causationId: null, idempotencyKey: 'k1',
  payload: JSON.stringify({ sourceType: 'INVOICE', sourceId: 'inv-1', eventType: 'INVOICE_ISSUED', amount: 100, description: 'x', context: { customerId: 'cust-1' } }),
  occurredAt: new Date('2026-08-17T00:00:00.000Z'), createdAt: new Date('2026-08-17T00:00:00.000Z'), availableAt: new Date('2026-08-17T00:00:00.000Z'), publishedAt: null, status: 'PENDING',
  attemptCount: 0, lastError: null, ...over,
});

describe('P12.2-D outbox dispatcher (P12-03-02)', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  it('1. claims PENDING events and increments attempt count', async () => {
    prisma.$transaction = vi.fn(async (fn) => fn(prisma));
    prisma.outboxEvent.findMany.mockResolvedValue([EV()]);
    prisma.outboxEvent.updateMany.mockResolvedValue({ count: 1 });
    prisma.outboxEvent.update.mockResolvedValue({});
    prisma.eventDelivery.upsert.mockResolvedValue({ id: 'd-1', status: 'PENDING', attempts: 0 });
    registerConsumer('noop', async () => ({ ok: true }));
    const n = await runDispatchCycle('w1');
    expect(n).toBe(1);
    expect(prisma.outboxEvent.findMany).toHaveBeenCalled();
    expect(prisma.outboxEvent.updateMany).toHaveBeenCalled();
  });

  it('2. marks event PUBLISHED when consumer ok (at-least-once ack)', async () => {
    prisma.$transaction = vi.fn(async (fn) => fn(prisma));
    prisma.outboxEvent.findMany.mockResolvedValue([EV()]);
    prisma.outboxEvent.updateMany.mockResolvedValue({});
    prisma.outboxEvent.update.mockResolvedValue({ status: 'PUBLISHED' });
    prisma.eventDelivery.upsert.mockResolvedValue({ id: 'd-1', status: 'PENDING', attempts: 0 });
    prisma.eventDelivery.update.mockResolvedValue({ status: 'DELIVERED' });
    registerConsumer('ok', async () => ({ ok: true }));
    await runDispatchCycle('w1');
    expect(prisma.eventDelivery.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'DELIVERED' }) }));
  });

  it('3. moves to DEAD + DeadLetter after max attempts', async () => {
    prisma.$transaction = vi.fn(async (fn) => fn(prisma));
    prisma.outboxEvent.findMany.mockResolvedValue([EV({ attemptCount: MAX_ATTEMPTS })]);
    prisma.outboxEvent.updateMany.mockResolvedValue({});
    prisma.outboxEvent.update.mockResolvedValue({});
    prisma.eventDelivery.upsert.mockResolvedValue({ id: 'd-1', status: 'PENDING', attempts: MAX_ATTEMPTS });
    prisma.eventDelivery.update.mockResolvedValue({ status: 'DEAD' });
    prisma.eventDeadLetter.upsert.mockResolvedValue({ id: 'dl-1' });
    registerConsumer('fail', async () => { throw new Error('boom'); });
    await runDispatchCycle('w1');
    expect(prisma.eventDeadLetter.upsert).toHaveBeenCalled();
    expect(prisma.eventDelivery.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'DEAD' }) }));
  });

  it('4. ledger consumer is idempotent (COMPLETED -> skip)', async () => {
    prisma.idempotencyRecord.findUnique.mockResolvedValue({ status: 'COMPLETED' });
    const r = await ledgerConsumer(EV());
    expect(r.ok).toBe(true);
    expect(r.skipped).toBe(true);
  });

  it('5. ledger consumer shadow mode does NOT mutate (no postEvent)', async () => {
    const savedShadow = process.env.CONSUMER_LEDGER_SHADOW;
    process.env.CONSUMER_LEDGER_SHADOW = 'true';
    process.env.CONSUMER_LEDGER_OUTBOX = 'false';
    const { postEvent } = await import('../../src/services/posting-engine.js');
    prisma.idempotencyRecord.findUnique.mockResolvedValue(null);
    prisma.financialEvent.findUnique.mockResolvedValue(null);
    try {
      const r = await ledgerConsumer(EV());
      expect(r.ok).toBe(true);
      expect(r.shadow).toBe(true);
      expect(postEvent).not.toHaveBeenCalled();
    } finally {
      if (savedShadow === undefined) delete process.env.CONSUMER_LEDGER_SHADOW; else process.env.CONSUMER_LEDGER_SHADOW = savedShadow;
      process.env.CONSUMER_LEDGER_OUTBOX = 'false';
    }
  });

  it('6. ledger consumer replay guard: GL posted but no idempotency -> DEAD', async () => {
    const savedActive = process.env.CONSUMER_LEDGER_OUTBOX;
    process.env.CONSUMER_LEDGER_OUTBOX = 'true';
    prisma.idempotencyRecord.findUnique.mockResolvedValue(null);
    prisma.financialEvent.findUnique.mockResolvedValue({ status: 'POSTED' });
    try {
      const r = await ledgerConsumer(EV());
      expect(r.ok).toBe(false);
      expect(r.error).toContain('missing-idempotency');
    } finally {
      if (savedActive === undefined) delete process.env.CONSUMER_LEDGER_OUTBOX; else process.env.CONSUMER_LEDGER_OUTBOX = savedActive;
    }
  });

  it('7. ledger consumer active mode posts + records idempotency COMPLETED', async () => {
    const savedActive = process.env.CONSUMER_LEDGER_OUTBOX;
    process.env.CONSUMER_LEDGER_OUTBOX = 'true';
    const { postEvent } = await import('../../src/services/posting-engine.js');
    prisma.idempotencyRecord.findUnique.mockResolvedValue(null);
    prisma.financialEvent.findUnique.mockResolvedValue(null);
    prisma.idempotencyRecord.create.mockResolvedValue({ id: 'i-1', status: 'COMPLETED' });
    postEvent.mockResolvedValue({ ok: true, id: 'gl-1' });
    try {
      const r = await ledgerConsumer(EV());
      expect(r.ok).toBe(true);
      expect(postEvent).toHaveBeenCalledTimes(1);
      expect(prisma.idempotencyRecord.create).toHaveBeenCalledTimes(1);
    } finally {
      if (savedActive === undefined) delete process.env.CONSUMER_LEDGER_OUTBOX; else process.env.CONSUMER_LEDGER_OUTBOX = savedActive;
    }
  });

  it('8. idempotency key is deterministic (same event -> same key)', () => {
    const a = deriveIdempotencyKey(EV());
    const b = deriveIdempotencyKey(EV());
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });

  it('9. startLedgerConsumer registers with the dispatcher', () => {
    const r = startLedgerConsumer();
    expect(r.consumerKey).toBe('ledger');
    expect(r.supportedTypes).toContain('INVOICE_ISSUED');
  });
});
