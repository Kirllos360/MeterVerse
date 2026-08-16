# P12-02-25 — SECURITY REVIEW

## Controls summary (§11 + §17)
| Control | Design | Verified in design |
|---------|--------|--------------------|
| Event spoofing | service auth + producer allowlist + HMAC | 06,07 |
| Tenant spoofing | areaId from aggregate, consumer scope filter | 07 |
| Actor spoofing | actorId server-set | 07 |
| Replay | service nonce + consumer idempotency | 06,04 |
| Duplicate delivery | idempotency key | 04 |
| Payload tampering | HMAC signature + DB append-only | 06,02 |
| Unauthorized publish/consume | service identity + scope | 06 |
| Privilege escalation | service never user; RBAC separate | 06 |
| Sensitive payload | schema strips secrets; size limit 64KB | 07 |
| Poison | versioned payload, DEAD quarantine | 07,08 |
| Oversized | 64KB reject at producer | 07 |

## Attack-surface review
- **Outbox rows** carry areaId/projectId; consumers use scopeWhere — cross-tenant read blocked (P58).
- **Replay API** requires admin.ops + audit + dry-run (no anonymous).
- **Service credentials** stored as HMAC hash (never plaintext); rotation + revocation.
- **Bridge** dual-mode auth: until SYMBIOT_REQUIRE_AUTH=true, insecure mode is explicit (env flag) — never silent.

## Threat model summary (STRIDE)
- Spoofing: service keys + signatures. Tampering: HMAC + DB. Repudiation: audit. Info disclosure: scope + encryption. DoS: rate-limit + backpressure + size limit. Elevation: service≠user + scope checks.

## Residual risks (accepted, documented)
1. Insecure bridge mode during rollout (explicit flag, short window).
2. mTLS not used (single-process; future cross-host → re-evaluate).
3. OAuth2 for external partners deferred (adapter later).

## Security acceptance (from 24)
All negative tests pass: forged key, nonce replay, cross-tenant, spoofed payload, unauthorized publisher/consumer.
