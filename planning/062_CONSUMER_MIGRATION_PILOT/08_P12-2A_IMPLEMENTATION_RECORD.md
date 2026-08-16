# P12.2-A — IMPLEMENTATION RECORD (executed)

**Date:** 2026-08-16 · **HEAD:** 1474ac7b → (P12.2-A commit) · **Mode:** EXECUTION (P12-02 architecture, implemented)

## What was implemented (real repository change)
1. **Prisma schema** — 6 new models added (schema.prisma):
   - `OutboxEvent` (eventType, eventVersion, aggregateType/Id, tenantId/areaId/projectId, correlationId NOT NULL, causationId, idempotencyKey, payload String, metadata, sourceService, actorId, occurredAt, status PENDING, attemptCount, nextRetryAt, lockedAt/By, deadLetteredAt; 5 indexes)
   - `EventDelivery` (unique [eventId, consumerKey]; per-consumer ack)
   - `EventDeadLetter` (reason, replayed, replayedAt)
   - `IdempotencyRecord` (unique [scope, areaId, operation, key]; requestHash, responseBody, status IN_PROGRESS/COMPLETED, expiresAt)
   - `ServiceIdentity` (name unique, scopes, areaScope, active)
   - `ServiceCredential` (keyHash, keyPrefix unique, issuedAt/expiresAt/revokedAt)
2. **Versioned migration** `20260816000000_add_event_reliability_foundation/migration.sql` — additive (0 DROP, 3 FK ALTER on new tables, 6 CREATE TABLE, 9 CREATE INDEX).
3. **Tests** — `tests/unit/event-reliability.test.mjs` (12 tests): event identity, idempotency (first/duplicate/conflict/tenant-isolated), correlation/causation, tenancy (P58), delivery states, financial safety.
4. **Test helper** — mock-prisma.js registers the 6 new models.

## Reconciliation with P12-02 (documented, NOT silently changed)
- P12-02 designed `payload Json`; **project convention is JSON-as-String** (41 existing fields use String with JSON comments; Prisma Json unused) → **String @default("{}")** used. Recorded.
- AuditEntry.correlationId **already existed** (since 00001_init) → not re-added; P12.2-B writes it.

## Verification (multi-pass)
- prisma validate: PASS (exit 0)
- prisma generate: PASS (client regenerated with 6 models)
- P12.2-A unit tests: **12/12 PASS**
- Full regression: **417 (399 pass / 18 skip)** — up from 405, no regression
- FE tsc: **0** · Graph: **12/0/0** · SpecKit: **100%**
- Adversarial: migration non-destructive (0 DROP), correlation NOT NULL, tenancy area-scoped unique, replay financial-safe (key contract)

## Runtime status
- **PostgreSQL :5433 BLOCKED_ENVIRONMENTAL** — migration NOT applied to a live DB (test or prod). Static validation + client generation + unit tests completed offline. Apply when PG available: `prisma migrate deploy` (test DB) then verify fingerprint.

## Gap register update
| Gap | Status |
|-----|--------|
| G-016 (outbox) | **PARTIAL** — schema implemented; dispatcher/producer P12.2-D/E pending |
| G-015 (idempotency) | **PARTIAL** — schema implemented; helper wiring P12.2-C pending |
| G-014 (correlation) | **PARTIAL** — schema column exists (OutboxEvent + AuditEntry); middleware P12.2-B pending |
| G-017 (service auth) | **PARTIAL** — ServiceIdentity/Credential schema; auth middleware P12.2-G pending |

## Next (P12.2-B)
Correlation + request identity middleware (writes AuditEntry.correlationId + OutboxEvent.correlationId from request context).
