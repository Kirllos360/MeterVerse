# P12-02-12 — DISPATCHER WORKER ARCHITECTURE

## 1. Role (§19)
The outbox dispatcher reads PENDING/RETRY OutboxEvents and delivers them to consumers (in-process EventBus + future broker adapter), with per-consumer delivery tracking.

## 2. Design (implementation-ready)
```
Dispatcher loop (setInterval, configurable, default 1s):
  for batch in fetchBatch():
    for event in batch:
      claim(event)      // lockedAt/lockedBy, lease 30s (SKIP LOCKED)
      deliver(event)    // upsert EventDelivery + publish to each consumer
      ackOrRetry(event) // per-consumer result aggregated

fetchBatch():
  SELECT * FROM OutboxEvent
  WHERE status IN ('PENDING','RETRY') AND nextRetryAt <= now()
  ORDER BY (aggregateType, aggregateId, occurredAt)
  LIMIT batchSize   -- default 50
  FOR UPDATE SKIP LOCKED   -- row-level claim, no double-dispatch
```

## 3. Concurrency / locking
- `SKIP LOCKED` prevents two dispatcher instances claiming the same event.
- Lease duration 30s; a crashed dispatcher's claim expires (lockedAt older than lease → reclaimable).
- Global concurrency limit 5 batches; per-consumer semaphore 2.

## 4. Crash recovery
- Dispatcher crash mid-batch: claimed rows' lease expires → re-claimable; consumers that received the event but never acked → redelivered → idempotent (04).
- Process restart: dispatcher resumes from DB state (no in-memory loss).

## 5. Retry
- Transient consumer failure → attempts++, nextRetryAt=backoff (08), status=RETRY.
- Permanent/poison → EventDeadLetter insert, status=DEAD.

## 6. Graceful shutdown
- SIGTERM/SIGINT: stop claiming, finish in-flight batch, release leases (best-effort), exit.

## 7. Health + metrics
- Exposes /api/events/health (dispatcher alive, last poll, pending count) + Prometheus metrics (13_OBSERVABILITY).

## 8. Backpressure
- If pending > threshold (e.g. 10k) or lag > 5min → log alert + optionally reduce batch size (self-throttle).
- One poisoned event cannot block the batch (per-event try/catch).

## 9. Integration points
- Started by ingestion-runtime-style bootstrapping (runtime-manager) alongside existing services.
- Reuses existing logger, health-monitor, metrics-collector.
