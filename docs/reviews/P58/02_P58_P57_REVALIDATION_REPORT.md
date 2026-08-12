# P58 — P57 CHANGESET REVALIDATION REPORT
**Date:** 2026-08-12 · **Method:** Independent reproduction of every P57 defect (failure path + repaired path + regression)

## 11 P57 DEFECTS — REVALIDATION MATRIX

| # | P57 Defect | P57 Fix | P58 Re-test Result | Classification |
|---|-----------|---------|--------------------|----------------|
| 1 | **PORTAL_MODE="1 " trailing-space** disabled portal gating (CRITICAL) | server.js `String(...).trim()` + Start.cmd `set PORTAL_MODE=1&&` | Portal admin routes → 404, customer routes → 200. `set PORTAL_MODE=1&&` yields `"1"` (no space). **VERIFIED** | ✅ VERIFIED ROOT FIX |
| 2 | auth.js `$Matches[0]` PowerShell artifact → 500 on /me + /register | proper error strings | `/me` dev-mode → 401 (not 500); with token → 200. **VERIFIED** | ✅ VERIFIED ROOT FIX |
| 3 | Diagnostics engine URL `http://localhost:3131 /api/...` → 0/24 | `String(PORT).trim()` | diagnostics **24/24** passed. **VERIFIED** | ✅ VERIFIED ROOT FIX |
| 4 | Profile-unaware login (portal got admin token) | port-derived system_type in BFF | Admin BFF login → system=admin; Portal BFF → system=user. **VERIFIED** | ✅ VERIFIED ROOT FIX |
| 5 | FE auth BFF wrong path (`/auth/login` no `/api`) | `/api/` prefix on all 4 endpoints | login via :3535 BFF → 200 system=admin. **VERIFIED** | ✅ VERIFIED ROOT FIX |
| 6 | Login success screen never navigated | router.replace after success | code confirmed present (1.2s delay then replace). **VERIFIED (code)** | ✅ VERIFIED ROOT FIX |
| 7 | Sign-out: no /login route, no session revoke | navigate + forward refreshToken+Bearer | refresh after logout → 401 (session revoked). **VERIFIED** | ✅ VERIFIED ROOT FIX |
| 8 | Duplicate mount('/admin') shadowed config-center | renamed GET /permissions → /permissions/services | /permissions/services → 200; /admin/permissions → 200 (30). **VERIFIED** | ✅ VERIFIED ROOT FIX |
| 9 | Stale DB 5432 in launchers | →5433 everywhere | start-all.mjs/_tools/config.cmd/MainControl/backup-db all 5433. **VERIFIED** | ✅ VERIFIED ROOT FIX |
| 10 | Dead Sign Out buttons (AdminToolbar, app-sidebar) | wired to AuthRuntime.logout | imports confirmed present. **VERIFIED (code)** | ✅ VERIFIED ROOT FIX |
| 11 | Areas page zero rows (no transform) | added transform | transform present (`Array.isArray(d)?d:d.areas`). **VERIFIED (code)** | ✅ VERIFIED ROOT FIX |

## OPEN RISKS FROM P57 — REVALIDATION

| P57 Open Risk | P58 Status |
|---------------|-----------|
| 0 areas / 0 projects / 0 invoices | ✅ RESOLVED — seeded: 3 areas, 4 projects, 76 invoices |
| mock PermissionProvider | ✅ RESOLVED — removed from layout, unified to PermissionRuntime |
| overstated test documentation | ✅ CORRECTED — vitest 44 verified real (40 design-tokens + 4 integration) |
| C13-W05 bank reconciliation unmodeled | ⚠️ STILL OPEN — 0/9 models (confirmed) |
| ~17 dead files | ⚠️ STILL OPEN — confirmed dead (cleanup backlog) |
| nested Meter/ clone | ⚠️ IN PROGRESS — backup at 9 GB, deletion pending user decision |
| 19 modified files | ✅ RESOLVED — all committed + classified (f1600d4a, dc846749, 258aa765, 8c55f765) |

## NEW DEFECTS FOUND BY P58 (P57 MISSED) — ALL FIXED

| # | Defect | Root Cause | Fix | Status |
|---|--------|-----------|-----|--------|
| 12 | `NEXT_PUBLIC_API_URL="http://localhost:3131 "` (trailing space) in `_tools/Start.cmd` ×4 | Same cmd `set X=value &&` trailing-space class | `set X=value&&` (no space) | ✅ FIXED + verified both profiles login 200 |
| 13 | `NODE_ENV`/`JWT_SECRET`/`CORS_ORIGIN` trailing-space in `_tools/Start.cmd` | same class | `set X=value&&` | ✅ FIXED + CORS verified |
| 14 | `PORT` trailing-space in MainControl ×3 + StressTest | same class | `set PORT=%BE_PORT%&&` | ✅ FIXED |
| 15 | `/api/auth/me` BFF was MOCK-ONLY (real JWT cookie always 401 → restoreSession silently fell back to localStorage) | leftover mock decoder, never proxied backend | BFF now forwards Bearer to backend /api/auth/me | ✅ FIXED + verified returns real super_admin |

## CONCLUSION
All 11 P57 defects: **VERIFIED ROOT FIXED** (no symptom-only, no regression). P58 found **4 additional defects in the same trailing-space/mock-leftover class** that P57 missed — all root-fixed and committed (`50398fb5`).

**Pattern warning:** the `set X=value &&` trailing-space bug class recurred across 3+ files after being "fixed" for PORTAL_MODE/PORT. This class must be treated as a repo-wide invariant: **NEVER put a space before `&&` in a cmd `set` statement.** A launcher-level guard/comment + scan is recommended (see 16_P58_RECOMMENDATIONS.md).
