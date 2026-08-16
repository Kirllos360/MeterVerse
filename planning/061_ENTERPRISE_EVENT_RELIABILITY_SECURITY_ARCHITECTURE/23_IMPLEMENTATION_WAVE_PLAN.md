# P12-02-23 — IMPLEMENTATION WAVE PLAN

§33 — executable roadmap (another engineer can run task-by-task).

| Wave | Name | Deliverables | Depends | Est. effort |
|------|------|--------------|---------|-------------|
| P12.2-A | Foundation schema + contracts | Prisma models (10) + additive migration + event schema registry | PG (test DB) | 2d |
| P12.2-B | Correlation + request identity | request middleware, logger correlationId, AuditEntry.correlationId | A | 1d |
| P12.2-C | Idempotency | IdempotencyRecord helper + wire payments/ingestion/cheque/import | A | 2d |
| P12.2-D | Transactional outbox | enqueueEvent (atomic) + producer integration | A,C | 2d |
| P12.2-E | Dispatcher + delivery | dispatcher worker (SKIP LOCKED, lease, EventDelivery) | D | 2d |
| P12.2-F | Retry + dead-letter | backoff, DLQ, replay API | E | 2d |
| P12.2-G | Service-to-service security | ServiceIdentity/Credential + auth middleware + bridge dual-mode | A | 2d |
| P12.2-H | Observability | metrics + logs + alerts | E,F | 1d |
| P12.2-I | Pilot consumers | READING.INGESTED + NOTIFICATION (shadow → cutover) | E,F | 2d |
| P12.2-J | Financial-safe integration | PAYMENT.RECEIVED/INVOICE.ISSUED via outbox + financial replay guard | C,D,F,I | 3d |
| P12.2-K | Migration/compatibility | dual-publish + per-consumer cutover + drain old postEvent | I,J | 2d |
| P12.2-L | Certification | full suite, E2E, failure injection, perf, security | all | 2d |

**Total est. ~23 days** (single engineer). **Blocked by:** PG test-DB runtime (G-001) for A/L integration + E2E; core design (this package) is complete.

## Task granularity
Each wave decomposes into tasks per §34 (see 24_ACCEPTANCE + this package's task-level specs in 10-13). Example task (P12.2-A-01):
- TITLE: Create OutboxEvent + EventDelivery + EventDeadLetter + IdempotencyRecord + ServiceIdentity/Credential Prisma models
- FILES: backend/prisma/schema.prisma + migration
- DB IMPACT: additive tables + AuditEntry.correlationId
- TESTS: schema validation, prisma generate
- ACCEPTANCE: models match 10_DATABASE_SCHEMA_DESIGN exactly; migrate deploy on test DB succeeds
- VERIFY: npx prisma migrate deploy + validate
