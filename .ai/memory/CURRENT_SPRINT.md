# MeterVerse - Current Sprint

## P12.2-C enqueueEvent Outbox Producer (2026-08-17)

**Goal:** transactional outbox producer (P12-03-03) over the P12.2-A schema.  
**Status:** COMPLETE — 6 tests + live certified

| Item | Result |
|------|--------|
| Producer | `backend/src/services/outbox-producer.js` `enqueueEvent` — writes OutboxEvent (same-tx), dual-publishes to legacy postEvent; feature-flag aware (OUTBOX_ENABLED / FINANCIAL_POSTING_ENABLED read at call time) |
| Idempotency | sha256(sourceId:eventType:amount:desc) deterministic key (64 hex) |
| Correlation | stamps correlationId/causationId/actorId from request context |
| Integration | `routes/invoices.js` INVOICE_ISSUED → `enqueueEvent` (removed dead postEvent import) |
| Tests | +6 unit; suite 454 (436/18) |
| Live cert | OUTBOX row written for real invoice (INVOICE_ISSUED, corr stamped, idem 64, PENDING); proof cleaned |
| Next | P12.2-D (outbox dispatcher/consumer) or Solar register input |
| Solar (P13.11) | Owner demo complete: runtime verified (Admin 3535 + Portal 3030 + BEs), real invoice+PDF; registers external |


