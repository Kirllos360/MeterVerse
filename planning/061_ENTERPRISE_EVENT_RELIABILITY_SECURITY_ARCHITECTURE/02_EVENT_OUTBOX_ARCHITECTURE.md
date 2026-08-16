# P12-02-02 — EVENT OUTBOX ARCHITECTURE

## 1. Pattern
Transactional outbox: within the SAME DB transaction as the domain mutation, INSERT an OutboxEvent row. A dispatcher later publishes it. Guarantees: event cannot be lost after commit; at-least-once.

## 2. OutboxEvent model (§5, §17)
```
model OutboxEvent {
  id            String   @id @default(uuid())      // event identity
  eventType     String                              // e.g. "PAYMENT.RECEIVED"
  eventVersion  Int      @default(1)                // schema version
  aggregateType String                              // "Payment", "Invoice", "Reading"
  aggregateId   String                               // domain entity id
  tenantId      String?                              // tenant scope (future)
  areaId        String?                              // tenancy (P59-B)
  projectId     String?                              // subordinate
  correlationId String                               // enterprise trace (server-authoritative)
  causationId   String?                              // parent event (replay/derivation)
  idempotencyKey String?                             // consumer dedup (nullable: derived from event)
  payload       Json                                 // event body
  metadata      Json?                                // source service, actor, extra
  occurredAt    DateTime                             // business time
  createdAt     DateTime @default(now())             // record time
  availableAt   DateTime @default(now())             // dispatch gate (retry delay)
  publishedAt   DateTime?                            // first dispatch
  status        String   @default("PENDING")         // PENDING|DISPATCHED|ACKED|RETRY|DEAD
  attemptCount  Int      @default(0)
  lastAttemptAt DateTime?
  nextRetryAt   DateTime?
  lastError     String?
  lockedAt      DateTime?                            // dispatcher claim
  lockedBy      String?                              // dispatcher instance id
  deadLetterAt  DateTime?                            // terminal
  sourceService String?                              // producer service
  actorId       String?                              // acting user (or service)
  @@index([status, nextRetryAt])
  @@index([aggregateType, aggregateId])
  @@index([correlationId])
  @@index([areaId])
  @@index([eventType, status])
}
```
**Mandatory:** id, eventType, aggregateType, aggregateId, correlationId, payload, occurredAt, status. **Nullable:** tenantId/projectId/metadata/causationId/idempotencyKey/dates.

## 3. Indexes / uniqueness / retention
- Composite `[status, nextRetryAt]` — dispatcher poll (WHERE status IN (PENDING,RETRY) AND nextRetryAt <= now).
- `[aggregateType, aggregateId]` — replay-by-aggregate + ordering scoping.
- `[correlationId]` — trace. `[areaId]` — tenant replay.
- **Uniqueness:** no global unique (events are append-only). Optional partial unique `(aggregateType, aggregateId, idempotencyKey)` if dedup-at-source required (default: consumer-side dedup).
- **Retention:** ACKED events archived after N days (config: OUTBOX_ACK_RETENTION_DAYS=90); DEAD retained (financial audit) 365d.
- **Partitioning:** not required at current scale; the `[status,nextRetryAt]` index suffices. Partition-by-date documented as scale option.
- **Tenant isolation:** rows carry areaId/projectId; consumers filter by scope; no cross-tenant read (P58).

## 4. EventDelivery / EventDeadLetter (§17)
```
model EventDelivery {
  id           String   @id @default(uuid())
  eventId      String                                  // FK OutboxEvent
  consumerKey  String                                  // e.g. "ledger", "notification"
  status       String   @default("PENDING")            // PENDING|SUCCESS|FAILED|DEAD
  attempts     Int      @default(0)
  lastError    String?
  deliveredAt  DateTime?
  createdAt    DateTime @default(now())
  @@unique([eventId, consumerKey])                     // one delivery per consumer per event
}
model EventDeadLetter {
  id          String   @id @default(uuid())
  eventId     String
  consumerKey String
  reason      String                                    // maxAttempts | permanentFailure
  lastError   String?
  createdAt   DateTime @default(now())
  replayed    Boolean  @default(false)
  replayedAt  DateTime?
}
```
- EventDelivery: tracks per-consumer delivery (idempotent publish — unique eventId+consumerKey).
- EventDeadLetter: terminal after retry exhaustion; manual replay allowed (audited).

## 5. Why these tables exist
- OutboxEvent: the durable event source (reliability, replay, financial audit).
- EventDelivery: per-consumer ack tracking (know who got what).
- EventDeadLetter: retry-exhausted events (no silent loss).
- (IdempotencyRecord, ServiceIdentity, ServiceCredential in docs 04/06.)

## 6. Producer contract
```
await prisma.$transaction(async (tx) => {
  // 1) domain mutation (payment.create, invoice.update...)
  // 2) tx.outboxEvent.create({ data: {...} })   // same tx = atomic
})
```
If outbox insert fails → tx rolls back → domain mutation not committed → **no event-loss window**.
