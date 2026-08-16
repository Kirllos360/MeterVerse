# P12-01 — SECURITY / TENANCY INTEGRATION AUDIT

**Date:** 2026-08-15 · **Gate:** P12-01 · **Method:** code trace + P58 focus, UNVERIFIED where not provable

## Verified controls
| Control | Mechanism | Evidence | Verified |
|---------|-----------|----------|----------|
| Authentication | JWT (auth.js) + login | code + 401 live | A |
| Authorization (RBAC) | requirePermission (ROLE_PERMISSIONS + DB grants) | 49/49 tests | A |
| Resource tenancy | requireAccess fail-closed (NULL→DENY) | code + tests | A |
| List tenancy | scopeWhere | code | A |
| Query clamp | clampRequestedScope | code | A |
| P58 ingestion | meter-owned tenancy (payload can't override) | P60.6 test | A |
| Secret mgmt | credential-vault | code | A |
| Service-to-service | bridge (TCP/HTTP) has no auth — relies on network isolation | code | **C (gap)** |
| Token propagation | FE api-client getAuthHeaders | code | A |
| Replay protection | ingestion append + rate-limit | P60.7 | A (ingestion) |

## P58 horizontal-privilege — status
- **CLOSED for ingestion:** payload areaId/projectId ignored; meter-owned wins (test).
- **CLOSED for resource access:** requireAccess fail-closed (P59-B invariant).
- **UNVERIFIED live:** cross-tenant runtime tests (PG down) — recorded RUNTIME-GATED.

## Gaps
1. **G-017: Service-to-service auth** — the Symbiot TCP/HTTP bridge accepts connections without credentials (relies on network boundary). For production SEP, needs auth (evidence-gated, SEP spec).
2. **G-018: Webhook outbound auth** — webhook-dispatcher uses secret; verify secret rotation + signing.
3. **G-005/006 (from P60.7):** AI/ingestion cross-tenant live tests RUNTIME-GATED.
