# P12-02-16 — BACKWARD COMPATIBILITY PLAN

## Goal: existing in-proc EventBus consumers keep working during and after migration (§23)

## Mechanisms
| Option | Used? | Why |
|--------|-------|-----|
| Dual-publishing (outbox + postEvent) | **YES (Phase 5)** | existing consumers (ledger, notification, workflow) unchanged until cutover |
| Event adapter / wrapper around EventBus | **YES (Phase 3-4)** | `enqueueEvent()` writes outbox AND (in dual mode) calls `eventBus.emit()` — single call site, no consumer change |
| Feature flag (OUTBOX_ENABLED) | **YES** | instant on/off |
| Shadow / audit-only mode | **YES (Phase 5)** | outbox consumers log-only, validate before cutover |
| Gradual consumer migration | **YES (Phase 6)** | per-consumer flag `CONSUMER_X_OUTBOX=true`, cutover one consumer at a time |

## Safe path
1. `enqueueEvent` = new single entry point. In dual mode: writes outbox + calls existing `eventBus.emit` (in-proc consumers unaffected).
2. Dispatcher consumes outbox → delivers via EventBus (so even outbox-path deliveries reach existing listeners).
3. Consumers migrate one-by-one to idempotent outbox consumption; each verified in shadow first.
4. In-proc `eventBus.emit` calls outside `enqueueEvent` (legacy direct emits) remain functional — wrapped later.

## Guarantee
- **Zero consumer downtime.** Existing `on('PAYMENT_RECEIVED', ...)` listeners work unchanged through the migration.
- Idempotency added on the consumer side makes redelivery from the new path harmless.
