# P12-03-06 — ACCEPTANCE CRITERIA

Measurable Definition of Done (P12-02 §24 style).

| Component | Acceptance |
|-----------|-----------|
| Schema (P12.3-01) | migrate deploy succeeds on test DB; models match P12-02 doc 10 exactly; rollback (drop new tables) verified |
| Correlation (02) | every request produces correlationId; spoof (invalid UUID) → regenerated; AuditEntry rows carry correlationId |
| Idempotency (03) | same-key-same-payload → COMPLETED (persisted response); same-key-diff-payload → CONFLICT; 2 parallel same-key → 1 processed |
| enqueueEvent (04) | outbox INSERT atomic with domain tx (outbox fail → domain rolls back); 100% pilot events in outbox |
| Dispatcher (05) | no double-dispatch under 2 instances; lease reclaim ≤30s; throughput ≥100 events/s (test DB) |
| Pilot consumer (06) | financialReplayGuard enforced (no record → DEAD); duplicate delivery → skip; GL entry exactly once |
| Producers (07) | INVOICE_ISSUED + PAYMENT_RECEIVED land in outbox; legacy postEvent side-effect preserved until cutover flag |
| Replay guard (08) | replay without idempotency → BLOCKED + audit; dry-run produces no mutation |
| Shadow (09) | outbox count == postEvent count; shadow output == postEvent output (diff 0) for 10 consecutive runs |
| Cutover (10) | pilot consumer active, no regression (405 baseline green), rollback flag verified |

## Global
- Full suite grows 405 → ≥430 (≥25 new tests).
- Graph 12/0/0, SpecKit 100%, FE tsc 0.
- No production data mutation (all on test DB).
