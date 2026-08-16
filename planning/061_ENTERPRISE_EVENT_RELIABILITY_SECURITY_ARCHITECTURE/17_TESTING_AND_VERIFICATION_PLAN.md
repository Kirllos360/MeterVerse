# P12-02-17 — TESTING AND VERIFICATION PLAN

## Unit (§24)
- ID generation (requestId/correlationId/causationId/eventId)
- Idempotency: same-key-same-payload → COMPLETED; same-key-diff-payload → CONFLICT; concurrency (ON CONFLICT)
- Event serialization + version validation
- Retry backoff calc (exp + jitter, max attempts, max age)
- Service auth: key verify, nonce replay, timestamp skew, scope, rotation

## Integration (DB + dispatcher + consumer)
- DB tx + outbox insert atomic (outbox fails → domain rolls back)
- Dispatcher claim (SKIP LOCKED, no double-dispatch), lease expiry reclaim
- Consumer idempotency: duplicate delivery → no double-apply
- Dead-letter: max-attempts → DEAD; poison → DEAD; replay → PENDING (idempotent)
- Tenancy: consumer scope filter; spoofed areaId rejected
- Service auth: valid/expired/revoked/forged key; nonce replay blocked

## E2E (§24)
- Meter reading → outbox → consumer → billing (idempotent)
- Payment → outbox → ledger + notification (no duplicate ledger)
- Invoice → outbox → report
- Settlement → outbox → accounting
- Solar reading → outbox → wallet
- External webhook → outbox → webhook-dispatcher (retry, dead-letter)

## Failure injection (§24)
- Kill dispatcher mid-batch → lease reclaim → redeliver (idempotent)
- DB down → dispatcher backoff, no loss
- Network timeout → retry → dead-letter
- Duplicate event → idempotent skip
- External API timeout → retry → DEAD → manual replay

## Performance (§24)
- Throughput: >100 events/sec (target), latency p95 <500ms, backlog drain, concurrency 5 dispatcher, large tenant (10k events) no degradation

## Security (§24)
- Spoofing (payload tenant), replay (nonce), cross-tenant, unauthorized publisher, unauthorized consumer — all negative tests

## Test tooling
- vitest (existing) + mocked prisma for unit; integration uses test DB (meter_pulse_test, db-guard).
- Migration adds ~40-60 new tests across unit/integration/E2E.

## Verification commands
```
npx vitest run tests/unit tests/api
npx prisma migrate deploy   (test DB)
npx tsc --noEmit
node docs/architecture/graph/validate-graph.mjs
node speckit/validator.mjs
```
