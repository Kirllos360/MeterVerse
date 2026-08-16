# P12-03-03 — PRODUCER INTEGRATION (enqueueEvent)

## 1. Single entry point (P12-02 D-09)
`enqueueEvent({ sourceType, sourceId, eventType, amount, description, context })` — wraps postEvent:

```
async function enqueueEvent(input, { tx = prisma } = {}) {
  // SHADOW/DUAL phase:
  //   1) write OutboxEvent (same tx as the caller's domain mutation)  [outbox]
  //   2) call postEvent (existing GL path)                            [dual-publish]
  // AFTER cutover:
  //   write OutboxEvent only; postEvent side-effect replaced by pilot consumer
}
```

## 2. Call-site changes (pilot)
| File | Call | Change |
|------|------|--------|
| routes/invoices.js:163 | postEvent(INVOICE_ISSUED) | → enqueueEvent |
| routes/payments.js:51,89 | postEvent(PAYMENT_RECEIVED) | → enqueueEvent |
| routes/financial-integration.js:135,160 | postEvent (all 5 types) | → enqueueEvent |

- `enqueueEvent` is feature-flag aware: OUTBOX_ENABLED=true writes outbox; FINANCIAL_POSTING_ENABLED controls legacy postEvent side-effect.
- Correlation: enqueueEvent reads correlationId from request context (P12-02 §5) and stamps the OutboxEvent.

## 3. Transactionality (critical)
- The OutboxEvent INSERT happens in the SAME `prisma.$transaction` as the invoice/payment mutation → **atomic** (P12-02 §2/§6): event cannot be lost after commit.
- If outbox INSERT fails → tx rolls back → no event, no mutation (safe).

## 4. Idempotency at producer
- The producer derives the idempotencyKey from sourceId + eventType + issuedAt (P12-02 §4) — so re-delivery/replay is deduped at the consumer.

## 5. Rollback
- Flip OUTBOX_ENABLED=false → producers stop writing outbox; legacy postEvent path remains (until cutover flag) → no behavior change.
