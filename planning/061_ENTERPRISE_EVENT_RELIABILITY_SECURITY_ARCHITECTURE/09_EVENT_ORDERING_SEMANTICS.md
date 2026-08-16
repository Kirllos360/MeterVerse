# P12-02-09 — EVENT ORDERING SEMANTICS

## 1. Does MeterVerse require ordering? (§13)
**Scoped ordering, NOT global ordering.** Analysis:

| Stream | Ordering required? | Ordering key |
|--------|--------------------|--------------|
| Meter readings | YES (chronological per meter) | meterId + timestamp |
| Invoice lifecycle | YES (per invoice) | invoiceId |
| Payments | YES (per customer/invoice) | customerId + createdAt |
| Settlements | YES (per invoice) | invoiceId |
| Customer ledger | YES (per customer) | customerId |
| Accounting journal | YES (per period/account) | period + account |
| Solar wallet | YES (per meter) | meterId |
| Synchronization | loose | meterId |
| Notifications | no | — |

## 2. Ordering key (§13)
- **Scoped sequence:** per `aggregateType + aggregateId`, events ordered by `occurredAt` then `createdAt`.
- Implement via: dispatcher polls events ordered by `(aggregateType, aggregateId, occurredAt)` per aggregate; consumers apply sequence guard (consumer stores last-processed eventId per aggregate; event N+1 before N → hold in retry until N acked).

## 3. Out-of-order handling (N+1 arrives before N)
| Case | Behavior |
|------|----------|
| Same aggregate, out of order | consumer holds (status PENDING, delayed retry with backoff) until predecessor ACKED; deadlock timeout (30s) → re-queue |
| Different aggregates | independent, no ordering constraint |
| Cross-aggregate dependency | use causationId/aggregate reference; consumer waits for referenced aggregate event (eventual) |

## 4. Not global (§13)
- No global sequence number — would bottleneck and is unnecessary (single-process, scoped ordering sufficient).
- Dispatcher claim order is per-aggregate, not global FIFO.

## 5. Duplicate/ordering interaction
- Idempotency (04) ensures a re-delivered out-of-order event doesn't double-apply even if order temporarily wrong; ordering guard ensures correctness, idempotency ensures safety.
