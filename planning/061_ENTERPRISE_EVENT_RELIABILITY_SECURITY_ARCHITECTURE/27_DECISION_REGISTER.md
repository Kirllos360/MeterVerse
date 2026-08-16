# P12-02-27 — DECISION REGISTER

| ID | Decision | Option chosen | Alternatives rejected | Evidence | Rationale |
|----|----------|---------------|-----------------------|----------|-----------|
| D-01 | Event architecture | **OPTION A: Postgres transactional outbox + in-proc EventBus** | B broker, C dedicated broker, D hybrid-now | 8GB RAM, single-process, native PG, no Docker runtime | env-infeasible to add broker; A is reliable + additive |
| D-02 | Delivery semantics | **At-least-once + consumer idempotency (effectively-once)** | exactly-once | distributed systems theory | exactly-once unprovable without distributed tx |
| D-03 | Outbox dispatch | **Polling + SKIP LOCKED** | broker-based relay, DB-trigger | Postgres-native, multi-instance safe | simplest reliable claim |
| D-04 | Idempotency | **DB unique key (ON CONFLICT)** | external cache (Redis) | no Redis, RAM-constrained | DB is source of truth |
| D-05 | Correlation authority | **Server-authoritative (validated/regenerated)** | trust client | P58 spoofing lesson | client cannot forge trace chain |
| D-06 | Service auth | **HMAC service keys + nonce + timestamp** | mTLS, JWT client-creds, OAuth2 | single-process, no cross-host | mTLS overkill; HMAC simplest safe |
| D-07 | Financial replay | **Controlled (idempotency mandatory, dry-run, admin.ops)** | free auto-replay | accounting immutability | prevents duplicate journal |
| D-08 | Ordering | **Per-aggregate scoped** | global sequence | single-process | global would bottleneck |
| D-09 | Producer integration | **enqueueEvent single entry (dual-publish during migration)** | direct outbox writes everywhere | backward compat | one call site, flag-gated |
| D-10 | Dispatcher target | **in-proc EventBus now; broker adapter later** | broker now | scale | hybrid-ready, no infra today |

## Open decisions (require operator/owner)
| ID | Item | Needed for |
|----|------|-----------|
| O-01 | OUTBOX_ACK_RETENTION_DAYS (default 90) confirm | archival policy |
| O-02 | SYMBIOT_REQUIRE_AUTH cutover date | bridge security rollout |
| O-03 | Payload size limit (64KB) confirm | producer contract |
