# P12-02-03 — EVENT LIFECYCLE STATE MACHINE

## States (OutboxEvent.status)
```
PENDING → DISPATCHED → ACKED (terminal success)
PENDING → RETRY → PENDING (backoff)   [≤ maxAttempts]
RETRY → DEAD (terminal, manual replay)
DISPATCHED → RETRY (consumer failure / ack lost)
DEAD → PENDING (manual replay, audited)
```

## Transitions (§6)
| Transition | Actor | Failure | Retry | Timeout | Tx boundary | Idempotency |
|-----------|-------|---------|-------|---------|-------------|-------------|
| PENDING→DISPATCHED | dispatcher | claim lock lost → re-claim | — | lease (30s) | claim UPDATE only | delivery upsert (unique eventId+consumer) |
| DISPATCHED→ACKED | consumer | consumer never acks → lease expiry → RETRY | — | ack TTL (60s) | ack UPDATE | consumer dedup by idempotencyKey |
| →RETRY | dispatcher/consumer | transient (5xx, timeout, network) | backoff (see 08) | — | — | same event re-delivered, consumer dedups |
| RETRY→DEAD | dispatcher | maxAttempts exceeded or permanent (4xx, validation) | no | — | — | DLQ record |
| DEAD→PENDING | operator | replay fails | manual | — | audited UPDATE | replay idempotency (see 08/14) |

## Lifecycle (end-to-end)
```
Business tx (domain mutation + outbox INSERT atomically)
→ dispatcher poll [status IN (PENDING,RETRY) AND nextRetryAt<=now] SKIP LOCKED
→ claim (lockedAt/lockedBy, lease 30s)
→ for each consumer: upsert EventDelivery(eventId, consumerKey, PENDING)
→ publish (in-proc EventBus + future broker)
→ consumer: idempotency check → process → ACK (delivery status SUCCESS)
→ OutboxEvent.status=ACKED when all consumers done
→ on failure: attempts++, nextRetryAt=backoff, status=RETRY
→ attempts>max: EventDeadLetter insert, status=DEAD
→ operator: replay (audited) → status=PENDING
```

## Guarantees
- **No event lost** after DB commit (outbox atomic with domain tx).
- **No event processed twice as a side-effect** (consumer idempotency).
- **Every transition audited** (AuditEntry + EventDelivery history).
- **Ordering:** scoped per aggregate (see 09_EVENT_ORDERING).
