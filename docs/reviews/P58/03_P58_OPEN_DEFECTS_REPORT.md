# P58 — OPEN DEFECTS REPORT
**Date:** 2026-08-12 · **Severity:** P0 Blocker → P4 Low

## CRITICAL — P0 BLOCKERS

| ID | Defect | Evidence | Impact | Recommendation |
|----|--------|----------|--------|----------------|
| OD-01 | **Area/project data scoping NOT enforced** — `requireAccess` defined but **0 uses** across 63 route files; no route scopes queries by `req.user.area`/`req.user.project` | Verified live: viewer role (no area scope) `GET /api/customers` → 200 with customers from ALL areas | **Horizontal privilege escalation is possible today** — any role with `*.read` reads all areas/projects. Violates §34 stop condition "user/area/project scope is insecure". **BLOCKS Wave 4 + kirllos wiring** | Apply `requireAccess` on detail/update/delete routes; scope list queries by user's area/project from PermissionOnRole scopeType/scopeId. See 17_P58_EXECUTION_BLUEPRINT.md Phase 3-4 |
| OD-02 | **22 admin pages MOCK/STATIC/UNWIRED** (9 mock + 11 static + 2 demo) + 10 half-wired settings pages | Verified per-page: upload (fake Browse), sync (fake Trigger), database (mock CRUD as "DB browser"), database-management ("simulated" SQL), 11 empty apiEndpoint configs, etc. | UI claims features that don't persist — a page certified "operational" that isn't. Violates §12 HARD requirement | Wire to real endpoints or remove from nav. See 10_P58_MOCK_STATIC_FUNCTION_REPORT.md |

## HIGH — P1

| ID | Defect | Evidence | Impact | Recommendation |
|----|--------|----------|--------|----------------|
| OD-03 | C13-W05 Bank Reconciliation & Cash Management = **0%** (9 planned models absent: BankStatement, BankReconciliation, ExchangeRate, etc.) | schema.prisma grep | C13 "complete" claim false; cash/bank domain unusable | Model W05 (Wave 2.5 scope) before C13 full certification |
| OD-04 | GL foundation **21 models unmigrated** (no migration table; fresh `migrate deploy` → ~147 tables vs 187 models) | P41/OBS-054-055 evidence | migration-based deploys (deploy-prod.sh uses `prisma migrate deploy`) would fail/mismatch | Align migrations: `prisma migrate diff` + baseline |
| OD-05 | **Hardcoded mock creds** in `auth-service.ts` (admin/admin, operator/operator) | verified source | gated behind `NEXT_PUBLIC_ALLOW_MOCK_AUTH=true` (off), but present in code | Remove or move to env-only; keep gated |

## MEDIUM — P2

| ID | Defect | Evidence | Impact | Recommendation |
|----|--------|----------|--------|----------------|
| OD-06 | `GitPush.cmd` blind `git add -A; git commit -m "Update..."` | toolchain audit | can commit generated/secrets if run carelessly | Add `git status` review + secret scan before push |
| OD-07 | `Meter/reference/all-last-update` — disguised file vault with hardcoded credentials in README | legacy reconciliation | security hazard if copied | REJECT; never inherit |
| OD-08 | C13 tariff engine does NOT replicate Egyptian fee chain (Labour 15% → Tax 1% → VAT 14% on base+labour+tax) | legacy sbill analysis vs tariff-engine.js | billing totals may be wrong vs canonical source | Verify against sbill formulas (OBS-024 follow-up) |

## LOW — P3/P4

| ID | Defect | Evidence | Impact | Recommendation |
|----|--------|----------|--------|----------------|
| OD-09 | `Meter/` 24.9 GB nested clone on disk | verified 268k files, gitignored | disk bloat | backup in progress → delete on user decision |
| OD-10 | ~17 dead files + 47 pageMap-only routes without nav | duplication audit | maintenance noise | cleanup campaign |
| OD-11 | AdminLayout default export named `SystemLayout` (88% similar twin) | duplication audit | confusing | rename/deprecate one |
| OD-12 | `phase-h0-certification.py` + `migration_engine.py` orphaned (reference old NestJS arch + Meter/ paths) | verified self-referenced only | stale; would break if run | retire or update |
| OD-13 | C20/C28/C30/C32/C33/C35/C37/C38 = 0% (133+ approved models unbuilt) | planning matrix | future waves | roadmap, not defect |

## VERIFIED CLOSED THIS PHASE
- OD-closed: all 11 P57 defects (see 02_P58_P57_REVALIDATION_REPORT.md)
- OD-closed: NEXT_PUBLIC_API_URL/NODE_ENV/JWT_SECRET/CORS_ORIGIN/PORT trailing-space (Start/MainControl/StressTest)
- OD-closed: /api/auth/me mock-only BFF
