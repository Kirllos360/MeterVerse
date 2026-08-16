# P12-03-04 — SHADOW VALIDATION & RECONCILIATION

## 1. Shadow-run protocol (the proof the pipeline works before cutover)
```
1. Enable OUTBOX_ENABLED=true (dual-publish: outbox + postEvent) on test DB
2. Dispatcher publishes outbox events to pilot consumer in SHADOW (log-only)
3. Existing postEvent runs normally (GL writes as before)
4. Reconciliation job compares:
     outbox events (pilot types)      vs   postEvent records
     shadow-consumer validation output vs   actual postEvent output
5. Diff must be 0 for N consecutive runs (e.g. 10) before cutover
```

## 2. Reconciliation key
```
match = (sourceType, sourceId, eventType, amount, issuedAt)
```

## 3. Shadow validation checks (per event)
- payload parses, eventVersion supported
- tenancy present (areaId from aggregate) — fail-closed if missing
- financial rule: invoice exists / payment exists / amounts consistent
- idempotency key derivable
- output equals what postEvent would produce (GL line, amount, period)

## 4. Cutover gate
- Diff == 0 across 10 shadow runs AND all acceptance criteria (06) met AND graph/speckit/tests green.
- Then: pilot consumer ACTIVE + `FINANCIAL_POSTING_ENABLED=false` (pilot types).

## 5. Rollback gate
- Any diff > 0 or alert (shadow-mismatch) → hold cutover, investigate, fix, re-run shadow.
- Post-cutover regression → flip flags back (producers stop outbox, postEvent resumes).

## 6. Non-production validation script (isolated, test DB only)
- A script that: seeds test invoice/payment → runs enqueueEvent → runs dispatcher (shadow) → asserts outbox row == expected + shadow output == postEvent output.
- Stored under `backend/scripts/` gated to TEST_MODE (never prod) — satisfies P12-02 §38 "small non-production validation script" allowance.
