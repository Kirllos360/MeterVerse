# P12-02-07 — EVENT SECURITY THREAT MODEL

## Threats (§11)
| Threat | Vector | Mitigation | Trust boundary |
|--------|--------|-----------|----------------|
| Event spoofing | attacker publishes fake event | service auth (06) + eventType allowlist + producer signature | producer→outbox |
| Tenant spoofing | payload areaId override | areaId from aggregate (server-side); consumer scope check | outbox→consumer |
| Actor spoofing | payload actorId forged | actorId from authenticated user/service (server-set) | API→service |
| Replay | re-send old event | nonce (service) + idempotencyKey (consumer) + timestamp window | transport |
| Duplicate delivery | retry redelivers | consumer idempotency (04) | dispatcher→consumer |
| Payload tampering | modify event body | HMAC signature (service); outbox rows are DB-append-only | producer→DB |
| Unauthorized publish | rogue service writes outbox | only known producers via service auth + outbox INSERT via guarded helper | service→outbox |
| Unauthorized consume | rogue consumer reads events | consumer must present service identity with events:read scope; row-level tenant filter | outbox→consumer |
| Privilege escalation | service claims user role | service identity is NEVER user; RBAC separate | — |
| Sensitive payload exposure | PII/credentials in event | event payload schema strips secrets; sensitive flag; encryption at rest (PG) | storage |
| Event poisoning | malformed payload breaks consumer | schema-versioned payload + validation before process; poison → DEAD not infinite retry | consumer |
| Oversized payload | huge event | payload size limit (64KB default) → reject at producer | producer |

## Trust boundaries
```
[External/Client] → TLS → [API + user auth] → [service layer + service auth]
  → [Prisma/DB] → [outbox] → [dispatcher (service auth)] → [consumer (service auth, tenant-scoped)]
  → [external (TLS + service key)]
```

## P58/P59/P60 preservation
- Tenancy is derived from the **aggregate's stored areaId** (never the event payload).
- Consumers filter by areaId/projectId (scopeWhere pattern).
- Fail-closed: missing tenant context → event held (RETRY with "missing scope") → not processed cross-tenant.
