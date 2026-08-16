# P12-01 — API INTEGRATION MATRIX

**Date:** 2026-08-15 · **Gate:** P12-01 · **Evidence:** route scan (139 endpoints across 18 key modules; ~200+ total across 69 files)

## Key module endpoint counts (verified)
| Module | Endpoints | Consumer | Auth | Tenancy | Tests | Class |
|--------|-----------|----------|------|---------|-------|-------|
| auth | 13 | FE login/session | JWT issue | — | — | A |
| customers | 10 | admin FE | customers.* | requireAccess | yes | A |
| meters | 7 | admin FE | meters.* | requireAccess | yes | A |
| readings | 10 | admin FE | readings.* | scopeWhere | yes | A |
| invoices | 10 | admin FE | invoices.* | scope | yes | A |
| payments | 7 | admin FE | payments.* | clamp | 8 tests | A |
| settlements | 5 | admin FE | billing.* | scope | 7 tests | A |
| cheque | 4 | admin FE | payments.* | clamp | 8 tests | A |
| solar | 2 | admin FE | billing.* | scope | 16 (engine) | A |
| imports | 5 | upload FE | documents.* | scope | 15 tests | A |
| templates | 4 | upload FE | documents.* | scope | 3 tests | A |
| ingestion | 2 | bridge/ops | monitor/admin.* | meter-owned | 5 tests | A |
| collections | 18 | admin FE | collections.* | scope | — | B |
| tariffs | 5 | admin FE | tariffs.* | scope | — | B |
| billing | 9 | admin FE | billing.* | scope | — | B |
| notifications | 8 | FE | — | — | — | B |
| reports | 11 | FE/export | reports.* | scope | — | B |
| ai | 9 | FE | RBAC | scope | — | B |

## Findings
1. **Duplicate/conflicting routes:** NONE found (each module mounted once; verified via server.js mounts).
2. **Obsolete endpoints:** none identified in the 18 sampled; the `apiClient` double-prefix (`/api/api`) is a **hygiene debt** (tolerated by backend path-strip) — recorded G-debt.
3. **Undocumented endpoints:** reports, ai, collections have no dedicated API test files (class B — partially verified).
4. **Tenancy behavior:** requireAccess/scopeWhere/clamp verified across core modules; collections/ai/reports rely on same middleware (code-verified, test-gap noted).
5. **Pagination/idempotency:** pagination standard (page/limit); explicit idempotency on import execute (status-guard) + cheque clear (idempotent) + payment alloc (cap).
