# P12-03-02 — PILOT CONSUMER DESIGN (ledger/GL)

## 1. Consumer contract
```
Consumes: INVOICE_ISSUED, PAYMENT_RECEIVED, INVOICE_CANCELLED, PAYMENT_REVERSED, INVOICE_ADJUSTED
From: OutboxEvent (via dispatcher, P12-02 §12)
Idempotency: IdempotencyRecord key = sha256(scope:area:financial:sourceId+eventType+issuedAt)
Guard: financialReplayGuard (P12-02 §18) — replay without record → DEAD
Tenancy: areaId from the source aggregate (never payload); scopeWhere filter
```

## 2. Processing
```
receive(event) →
  idempotency lookup
  ├─ COMPLETED → ack (skip)
  ├─ CONFLICT  → DEAD (alert)
  └─ new → financialReplayGuard(event)
            ├─ no record → DEAD (missing-idempotency)
            └─ ok → post GL/ledger (via posting-engine) idempotently
                 → IdempotencyRecord COMPLETED (response persisted)
                 → ack delivery
```

## 3. Shadow mode
- In shadow: the consumer validates the payload (parse, version check, tenancy check, financial-rule check) and logs "SHADOW: would post" — **no mutation**.
- Shadow results compared to existing postEvent output (reconciliation, 04).

## 4. Cutover
- `CONSUMER_LEDGER_OUTBOX=true` enables active mode.
- `FINANCIAL_POSTING_ENABLED=false` (for pilot types) disables the legacy direct postEvent side-effect.
- Rollback: flip both flags back.

## 5. Error/failure (P12-02 §14 matrix)
- Transient (5xx/timeout/DB) → RETRY with backoff.
- Permanent (validation/4xx) → DEAD.
- Poison (bad version/payload) → DEAD immediately.
- Duplicate delivery → idempotency COMPLETED (skip).

## 6. Observability (P12-02 §13)
- metrics: meterverse_consumer_ledger_* (success, duplicate, conflict, dead, shadow_match).
- log: every event with correlationId + eventId.
- alert: conflict>10/h, shadow-mismatch>0 (blocking cutover).
