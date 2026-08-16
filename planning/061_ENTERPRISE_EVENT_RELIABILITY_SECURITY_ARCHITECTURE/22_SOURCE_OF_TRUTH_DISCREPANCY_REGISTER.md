# P12-02-22 — SOURCE-OF-TRUTH DISCREPANCY REGISTER (event/security scope)

§28 — compare docs vs Prisma vs backend vs frontend vs tests vs P09/P10/P11/P12-01. None silently corrected.

| # | Doc/claim | Actual | Discrepancy | Evidence | Status |
|---|-----------|--------|-------------|----------|--------|
| D-07 | P12-01 catalog: "webhook has retry" | webhook-dispatcher retry exists, NO dead-letter record | partial (no DLQ model) | dispatcher code + no EventDeadLetter | P12-02 designs EventDeadLetter (G-024) |
| D-08 | "event-bus durable" implied in older planning | in-proc, not durable | planning overstates | event-bus.js | P12-02 outbox corrects |
| D-09 | P12-01: "no idempotency models" | confirmed (no IdempotencyRecord) | none — accurate | schema | P12-02 adds model |
| D-10 | P12-01: "service auth gap" | confirmed (bridge no creds) | none — accurate | bridge code | P12-02 adds ServiceIdentity |
| D-11 | P12-01 traceability "~90%" | still accurate (collections/reports/ai lack dedicated API tests) | none | — | unchanged |
| D-12 | postEvent "posts to GL" | posting-engine emits INVOICE_ISSUED/PAYMENT_RECEIVED events (best-effort, in-proc) | GL posting is event-based, not direct | posting-engine.js | P12-02 makes it outbox-backed (18) |

## Note
- The P12-02 design introduces the outbox to **correct the event-durability discrepancy (D-08)** — this is an architectural correction, not a doc-rewrite.
- No other doc-vs-code conflict found in event/security scope.
