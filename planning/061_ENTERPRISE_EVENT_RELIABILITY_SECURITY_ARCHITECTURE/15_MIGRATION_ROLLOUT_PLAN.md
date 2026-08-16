# P12-02-15 — MIGRATION ROLLOUT PLAN

## From: in-process EventBus (current) → To: persistent transactional outbox + reliable dispatch
Backward-compatible, incremental, rollback-safe (§22).

## Phases
| Phase | Scope | Change | Rollback |
|-------|-------|--------|----------|
| Phase 0 | Additive schema | new tables (OutboxEvent, EventDelivery, EventDeadLetter, IdempotencyRecord, ServiceIdentity, ServiceCredential) + AuditEntry.correlationId | drop tables (safe, no prod dep) |
| Phase 1 | Correlation | request middleware + logger correlationId; AuditEntry.correlationId written | remove middleware (no behavior change) |
| Phase 2 | Idempotency | IdempotencyRecord helper + wire into payments/ingestion/cheque/import | remove helper calls |
| Phase 3 | Outbox producer | guarded `enqueueEvent` helper writes outbox in same tx (used by new producers only) | feature-flag OUTBOX_ENABLED=false |
| Phase 4 | Dispatcher | dispatcher worker reads outbox → publishes to existing EventBus (dual-mode: in-proc consumers unchanged) | stop dispatcher; in-proc path remains |
| Phase 5 | Dual-publish + drain | producers write outbox AND call postEvent (existing) — shadow/dual; dispatcher acks | disable dispatcher, keep postEvent (old path) |
| Phase 6 | Cutover | consumers migrate to consume-from-outbox (idempotent); postEvent disabled per-consumer | per-consumer flag rollback |

## Rules
- **No big-bang.** Each phase is independently reversible.
- Phase 3-6 gated by env flags (OUTBOX_ENABLED, CONSUMER_X_OUTBOX=true).
- **Shadow mode:** Phase 5 producers write outbox AND postEvent; outbox consumers run in audit-only (log only) to validate — then cut over.
- Existing in-proc EventBus consumers keep working through Phase 6 (backward compat, 16).

## Rollback-safety
- Every phase: reverse the flag/commit (no data loss; outbox is additive; in-proc path intact until cutover).
- Financial consumers cut over LAST (highest safety requirement — see 18).
