# P12-02-01 — MASTER ARCHITECTURE

**Date:** 2026-08-15 · **Gate:** P12-02 · **HEAD:** 3bc93213 · **Package:** planning/061_ENTERPRISE_EVENT_RELIABILITY_SECURITY_ARCHITECTURE/

## 1. Objective
Design the enterprise foundation for: persistent transactional outbox, reliable event dispatch, universal idempotency, correlation/causation/traceability, and service-to-service authentication — implementable without another architecture meeting.

## 2. Architecture decision (§4) — OPTION A (chosen, evidence-based)
**PostgreSQL transactional outbox + existing in-process EventBus + dispatcher worker.**

| Criterion | Evidence | Verdict |
|-----------|----------|---------|
| Current scale | single Express process, 48 services, 405 tests | A sufficient |
| Deployment | native PG :5433, no Docker runtime, 8GB RAM host | A (no broker install) |
| Team complexity | 1-codebase monolith | A (no new infra) |
| RAM/env | 1MB free — adding broker (Redis/Kafka) is infeasible now | A (Postgres-only) |
| Reliability | transactional outbox = exactly the financial-safe pattern | A |
| Tenant isolation | outbox rows carry tenant/area/project (row-level) | A |
| Future scale | outbox dispatcher can later publish to a broker (dual-path) | A (hybrid-ready) |
| Existing tech | Prisma + Postgres + in-proc EventBus | A (reuse) |
| Risk | LOW (additive, no new infra) | A |

**Rejected:** B (broker now — env-infeasible), C (dedicated broker — overkill), D (hybrid now — deferred; design allows later broker adapter).

## 3. Foundation components (§3)
| # | Foundation | Design doc |
|---|-----------|-----------|
| 1-2 | Persistent Domain Event Outbox + delivery tracking | 02_EVENT_OUTBOX_ARCHITECTURE |
| 3-4 | Event publication reliability + retry/dead-letter | 08_RETRY_DEAD_LETTER_REPLAY |
| 5 | Idempotency | 04_IDEMPOTENCY_ARCHITECTURE |
| 6-8 | Correlation/causation/trace + request propagation | 05_CORRELATION_CAUSATION_ARCHITECTURE |
| 9 | Service-to-service authentication | 06_SERVICE_TO_SERVICE_SECURITY |
| 10-17 | Replay, ordering, consistency, audit, observability, failure, tenancy, external | 07,09,13,14,19,20,21,28 |
| 18 | Financial safety | 18_ACCOUNTING_SAFETY_MODEL |

## 4. Delivery semantics (§7) — **AT-LEAST-ONCE** (enterprise-safe)
- Producer: DB tx commits outbox row atomically → at-least-once guaranteed (event cannot be lost after commit).
- Consumer: idempotency makes duplicates harmless → **effectively-once** for consumers.
- **Exactly-once is NOT claimed** (not provable across network + crash without distributed tx).
- Duplicates possible (retry/redelivery); handled by idempotency keys + consumer dedup.

## 5. Layered integration with existing system
```
Existing business tx (prisma.$transaction)
  ├─ domain mutation (payment, invoice, reading...)
  ├─ outbox row INSERT (same tx)
  └─ (optional) postEvent for existing in-proc consumers (dual-publish during migration)
Dispatcher worker (poll SKIP LOCKED, claim, publish)
  ├─ in-process EventBus (backward compat)
  └─ (future) broker adapter
Consumer → idempotency check → process → ack (delivery row)
```

## 6. Traceability anchor
Business req → domain → process → model → API → event → security → consumer → test → acceptance (see 29_TRACEABILITY_MATRIX).
