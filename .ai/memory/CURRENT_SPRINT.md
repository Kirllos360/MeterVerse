# MeterVerse — Current Sprint

## P12-02 Enterprise Event, Outbox, Idempotency, Correlation & Service Security Foundation (2026-08-15)

**Goal:** Implementation-ready architecture for transactional outbox, idempotency, correlation, service-to-service auth.  
**Status:** Complete — 30 docs + 12 diagrams; CONDITIONALLY CERTIFIED (architecture-ready)

| Item | Result |
|------|--------|
| Truth verification | All P12-01 gaps confirmed real (in-proc EventBus, no outbox/idempotency/service-auth models, correlation only in symbiot) |
| Architecture decision | **OPTION A: Postgres transactional outbox + in-proc EventBus** (evidence: 8GB RAM, single-process, no broker feasible) |
| Delivery semantics | At-least-once + consumer idempotency = effectively-once (never claim exactly-once) |
| Design | OutboxEvent/EventDelivery/EventDeadLetter/IdempotencyRecord/ServiceIdentity/Credential + AuditEntry.correlationId (additive migration) |
| Safety | Financial replay controlled (idempotency mandatory, dry-run, admin.ops); financialReplayGuard |
| Solar/Symbiot | Additive only (idempotency + service auth + READING.INGESTED); P60.6/7 behavior preserved |
| **Package** | **30 P12-02_*.md + 12 D-P12-02-*.svg** in planning/061_ENTERPRISE_EVENT_RELIABILITY_SECURITY_ARCHITECTURE/ |
| Waves | P12.2-A..L (12 waves, ~23 days) |
| Verdict | CONDITIONALLY CERTIFIED (architecture-ready; PG runtime + OBIS/SEP evidence gate implementation) |
