# P12-02-11 — API CONTRACTS

## API categories (§18)
**Public** (authenticated users) · **Internal** (service-to-service, service keys) · **Admin** (admin.*) · **Operational** (admin.ops)

### Public/Admin — event operations (admin.ops)
| Method | Path | Purpose | Auth | Tenancy | Response |
|--------|------|---------|------|---------|----------|
| GET | /api/events/outbox?status&areaId&limit | outbox monitoring | admin.ops | area filter | { events, total } |
| GET | /api/events/outbox/:id | single event | admin.ops | area match | { event } |
| GET | /api/events/dead-letters?areaId | DLQ list | admin.ops | area filter | { deadLetters } |
| POST | /api/events/replay | replay (see body) | admin.ops | area scope | { job, count } |
| POST | /api/events/replay/:id | single-event replay | admin.ops | area match | { event } |
| GET | /api/idempotency/:key | idempotency inspection | admin.ops | area bound | { record } |
| GET | /api/events/deliveries?eventId | delivery status | admin.ops | area | { deliveries } |

Replay body: `{ scope: "single"|"aggregate"|"range"|"tenant"|"type"|"deadletter", eventId?, aggregateType?, aggregateId?, from?, to?, areaId?, eventType?, dryRun: bool }`. Error: 403 (no admin.ops), 400 (invalid scope), 409 (financial event without idempotency — blocked).

### Internal — service auth (service keys)
| Method | Path | Purpose | Auth | Tenancy |
|--------|------|---------|------|---------|
| POST | /internal/service/verify | verify service key+signature+nonce (internal only) | key | scope check |
| POST | /internal/events/publish | service publishes an event (writes outbox via guarded helper) | service key | payload areaId must ⊆ service areaScope |

### Operational — health/metrics
| Method | Path | Auth |
|--------|------|------|
| GET | /api/events/health | monitor.* |
| GET | /api/events/metrics/prometheus | monitor.* (existing metrics endpoint extended) |

### Service credential management (admin)
| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| POST | /api/services | register ServiceIdentity | admin.* |
| POST | /api/services/:id/credentials | issue ServiceCredential | admin.* |
| POST | /api/services/:id/credentials/:cid/revoke | revoke | admin.* |
| GET | /api/services | list | admin.* |

## Endpoint conventions
- Auth: authenticate (user JWT) OR authenticateService (service key) depending on category.
- Permission: requirePermission as specified.
- Tenancy: clampRequestedScope + area match on event rows.
- Error behavior: 400 validation / 401 unauth / 403 permission-or-scope / 404 / 409 conflict.
- Idempotency: replay + publish use IdempotencyRecord.
- Audit: auditLog on all mutations (replay, revoke, issue, publish).
- Rate limiting: admin.ops endpoints 120/min; internal publish 300/min.
