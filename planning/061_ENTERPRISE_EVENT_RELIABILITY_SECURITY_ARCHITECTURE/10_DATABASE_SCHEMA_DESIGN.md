# P12-02-10 — DATABASE SCHEMA DESIGN

## Consolidated new models (Prisma-level, implementation-ready)
All additive (new tables; no change to existing models except AuditEntry + correlationId column). Migration impact: 1 additive migration (P12.2-A).

### 1. OutboxEvent (doc 02)
Full model in 02_EVENT_OUTBOX_ARCHITECTURE.md §2. Mandatory: id, eventType, eventVersion, aggregateType, aggregateId, correlationId, payload, occurredAt, status.

### 2. EventDelivery (doc 02 §4)
Unique [eventId, consumerKey]. Tracks per-consumer ack.

### 3. EventDeadLetter (doc 02 §4)
Terminal record with reason + replayed flag.

### 4. IdempotencyRecord (doc 04)
Unique [scope, areaId, operation, key]. requestHash, status, responseBody, expiresAt.

### 5. ServiceIdentity + ServiceCredential (doc 06)
ServiceIdentity: name unique, scopes Json, areaScope, active.
ServiceCredential: keyHash (HMAC, never plaintext), keyPrefix unique, issuedAt/expiresAt/revokedAt.

### 6. AuditEntry extension
Add `correlationId String?` column (nullable, indexed) — trace joins.

## Field conventions
| Aspect | Convention |
|--------|-----------|
| IDs | uuid (Prisma @default(uuid())) |
| Timestamps | DateTime @default(now()) |
| Tenancy | areaId/projectId nullable String? (P59-B) on OutboxEvent/IdempotencyRecord |
| Soft-delete | not needed (append-only event tables) |
| Json payload | Prisma Json (validated at producer) |
| Enum | stored as String (project uses string enums, e.g. status) |

## Indexes (consolidated)
| Table | Index | Purpose |
|-------|-------|---------|
| OutboxEvent | [status, nextRetryAt] | dispatcher poll |
| OutboxEvent | [aggregateType, aggregateId] | scoped ordering + aggregate replay |
| OutboxEvent | [correlationId] | trace |
| OutboxEvent | [areaId] | tenant replay |
| EventDelivery | unique [eventId, consumerKey] | idempotent delivery |
| IdempotencyRecord | unique [scope, areaId, operation, key] | dedup |
| IdempotencyRecord | [expiresAt] | sweeper |
| ServiceCredential | unique [keyPrefix] | lookup |
| AuditEntry | [correlationId] | trace join |

## Retention / archival
- OutboxEvent ACKED → archive after OUTBOX_ACK_RETENTION_DAYS (default 90) to an archive table (or partition).
- DEAD → retain 365d (financial audit).
- IdempotencyRecord → TTL per operation class (24h-30d), sweeper job.
- No partitioning at current scale; documented as scale option.

## Migration safety
- Additive-only migration (no data change to existing tables).
- Rollback: drop new tables (safe — no production dependency yet).
- Applied via `prisma migrate deploy` (P60.7 toolchain).
