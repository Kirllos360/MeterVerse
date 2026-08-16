# P12-03-01 — CONSUMER MIGRATION & PILOT (MASTER)

**Date:** 2026-08-15 · **Gate:** P12-03 · **HEAD:** 4b0ac321 · **Depends on:** P12-02 (outbox/idempotency/correlation/service-auth designs)
**Package:** planning/062_CONSUMER_MIGRATION_PILOT/

## 1. Objective
Execute the P12-02 foundation for a **pilot set of consumers** (financial events), proving the outbox→dispatcher→idempotent-consumer pipeline in shadow then cutover — without regressing existing `postEvent` behavior.

## 2. Scope (pilot)
- **Producers:** invoices.js (INVOICE_ISSUED), payments.js (PAYMENT_RECEIVED), financial-integration.js (all 5 financial event types).
- **Pilot consumer:** the GL/ledger integration path (posting-engine destination) — consume outbox events idempotently.
- **NOT in pilot:** notifications, workflow, solar (later waves per P12-02 §23).

## 3. Current truth (verified)
- `postEvent` (posting-engine.js) = the financial event producer; called from invoices.js:163, payments.js:51/89, financial-integration.js:135/160.
- Feature-flag guarded: `FINANCIAL_POSTING_ENABLED !== "false"`.
- EventBus = runtime signal bus only (runtime-manager `component: "runtime"`), NOT the financial domain bus. Financial events flow via postEvent (which internally writes GL entries / enqueues).
- Existing observability: /api/observability/events + /stats (runtime.eventBus).

## 4. Migration design (P12-02 §15, §16 applied)
```
Phase 0  (this gate): design + validation scripts (non-prod)
Phase 1: outbox schema (P12-02 models) on test DB (PG-gated)
Phase 2: correlation middleware + AuditEntry.correlationId
Phase 3: IdempotencyRecord helper wired into postEvent path
Phase 4: enqueueEvent (writes outbox in same tx as postEvent) - SHADOW
Phase 5: dual-publish (outbox + existing postEvent) - validate
Phase 6: pilot consumer (ledger) consumes outbox idempotently; postEvent disabled for pilot types
```

## 5. Shadow-mode pilot (the core of P12-03)
1. `enqueueEvent` wraps postEvent: writes OutboxEvent (same tx) AND calls existing postEvent (dual-publish).
2. Dispatcher publishes outbox events to the pilot consumer in **shadow** (log-only, no mutation) — validate payloads match.
3. Compare shadow consumer output vs existing postEvent output (reconciliation check).
4. On match: pilot consumer switches to **active** (idempotent, guarded); postEvent for pilot types disabled via flag.
5. Rollback: re-enable postEvent flag; pilot consumer to shadow.

## 6. Safety (P12-02 §18)
- Financial events (INVOICE_ISSUED/PAYMENT_RECEIVED) REQUIRE IdempotencyRecord in the pilot consumer.
- financialReplayGuard: replay without record → DEAD + operator.
- No duplicate GL entry (idempotency key = sourceId + eventType + issuedAt).

## 7. Success criteria (P12-02 §24 applied)
- 100% of pilot financial events land in outbox (reconciliation: outbox count == postEvent count).
- Shadow consumer output matches postEvent output (diff = 0).
- Cutover: pilot consumer active; no regression in existing 405 tests.
- Rollback verified (flag flip restores postEvent).

## 8. Deliverables (this package)
01 master (this) · 02 pilot consumer design · 03 producer integration · 04 shadow validation · 05 task list · 06 acceptance · 07 certification.
