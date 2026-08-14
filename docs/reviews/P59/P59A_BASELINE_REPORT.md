# P59-A — LIGHTWEIGHT ENTERPRISE REDISCOVERY BASELINE REPORT
**Date:** 2026-08-13 · **Mode:** LOW-MEMORY / SEQUENTIAL / READ-ONLY (8GB RAM constraint)
**Scope:** DISCOVER → SEARCH → COMPARE → CLASSIFY → REPORT → STOP. No implementation, no fixes.

---

## 01 MEMORY / CONTINUITY INDICATOR
- **Current project phase:** P59-A (lightweight baseline). P59 (P0 tenancy implementation) was completed and committed.
- **Previous certified phase:** P58 (10.9.0-P58-BLUEPRINT, CONDITIONAL GO). P57 certified GO.
- **Current blocker:** P0 tenancy was FIXED + CERTIFIED at code/test level (P59), but **LIVE ACTIVATION PENDING** — running backends need an elevated admin restart. Wave 4 BLOCKED until live browser/API verification.
- **Current architecture:** One Next.js FE source, two runtime profiles (Admin red :3535, Portal green :3030); one Express backend, two profiles (Admin API :3131, Portal API :3003); one native PostgreSQL 16 (:5433).
- **Current ports:** 3535 / 3131 / 3030 / 3003 / 5433.
- **Current database:** native PostgreSQL 16 on :5433, `meter_pulse`.
- **Current toolchain:** `_tools/MeterVerse.cmd` (unified 11-mode) + `config.cmd` + `SafetyCheck.cmd` (consolidation verified REAL).
- **Main tools used this phase:** bash, read, grep/Select-String, git (git grep), filesystem, Test-NetConnection.
- **Governance files discovered:** `.ai/memory/{AI_BIBLE,ARCHITECTURE_RULES,PROJECT_STATE,P00_CONSTITUTION,CURRENT_SPRINT,DESIGN_RULES,SPRINT_PROTOCOL,CHAT_HISTORY}.md`, `configs/{tools-manifest,tool-usage-log,mcp-registry}.json/md`.

## 02 CURRENT GIT STATE
- Branch `main`, HEAD `728039a9`, clean working tree, **in sync** with origin/main (both = 728039a9).
- Recent commits: `728039a9` (P59 master prompt), `817ee055` (P59 governance), `8b69a3f5` (P59 reports), `8aa2afaf` (effective-perm/project-areaId/areas-code/logs), `a7239fd5` (7 escalation tests).
- **Finding:** PROJECT_STATE header still reads `P58 / 10.9.0-P58-BLUEPRINT` (last updated 2026-08-12) — the P59 section was appended but the header/version not bumped. **Documentation lag** (do not fix in P59-A).

## 03 CURRENT RUNTIME ARCHITECTURE (CONFIRMED)
- Shared single database (`meter_pulse`) for both profiles — **CONFIRMED** (backend/.env: localhost:5433).
- Shared authentication (JWT + DB session) — CONFIRMED (auth-engine.js).
- Shared login UI (/login, profile-aware system_type) — CONFIRMED.
- Profile detection: **port-based** (layout.tsx host-port, page.tsx window.location.port) — CONFIRMED (permanent).
- Role detection: JWT `role` claim + DB roleId — CONFIRMED.
- Permission enforcement: backend `requirePermission` (hardcoded role map + DB PermissionOnRole fallback) — CONFIRMED.
- Area/project scoping: **JWT area/project claim + scopeWhere/clampRequestedScope/requireAccess** — CONFIRMED PRESENT (P59).
- API boundary: Portal BE (:3003) gates admin routes (404); BFF rewrite /api/* → backend — CONFIRMED.
- Frontend boundary: port-based profile + nav filtering — UX only (not security).

## 04 PORT CONFIGURATION MAP (ALL CONSISTENT — CONFIRMED)
| Service | Expected | Configured | Launcher | Env Var | Evidence | Status |
|---------|----------|-----------|----------|---------|----------|--------|
| Admin FE | 3535 | 3535 | package.json admin:frontend, start-all.mjs, config.cmd | next dev -p | next.config / package.json | ✅ |
| Admin BE | 3131 | 3131 | package.json admin:backend, config.cmd, .env | PORT=3131 | backend/.env | ✅ |
| Portal FE | 3030 | 3030 | package.json portal:frontend, start-all.mjs | PORTAL_MODE=1 | next.config rewrite 3003 | ✅ |
| Portal BE | 3003 | 3003 | package.json portal:backend, config.cmd | PORT=3003 PORTAL_MODE=1 | .env | ✅ |
| DB | 5433 | 5433 | config.cmd DB_PORT, start-all.mjs, .env | DATABASE_URL | backend/.env | ✅ |
- **No stale 5432/3002/7400 in live configs.** docker-compose `5433:5432` (host:container) correct + documented.
- **Live runtime at audit:** only DB :5433 up; the 4 app services DOWN (elevated backends were stopped). Services not running at audit time.

## 05 TOOLCHAIN STATUS (consolidation VERIFIED REAL)
- **Actual files:** `MeterVerse.cmd` (16.7KB), `config.cmd`, `SafetyCheck.cmd`, `README.md`, `backups/` — 3 .cmd remain.
- **Tracked in git:** all 4 files.
- **MeterVerse.cmd functional:** 11 modes (START/STOP/STATUS/MONITOR/TEST/DEPLOY/BACKUP/RESTORE/GIT/VIEWLOG/HELP) + KILL_ALL + GET_PSQL/PGDUMP (native PG16 :5433, first-match-wins). **CONFIRMED functional.**
- **Deleted-tool references:** only historical (CURRENT_SPRINT, PROJECT_STATE, C19/C20 planning, P40 tracker, CHATGPT_REVIEW_PACKAGE) — NOT live launcher references. MeterVerse.cmd mentions them only in its "Merged from" comment.
- **config.cmd / SafetyCheck.cmd required:** YES — MeterVerse.cmd calls both.

## 06 AUTHENTICATION BASELINE (CONFIRMED)
- /login page exists + BFF route (`app/api/auth/login/route.ts`) — CONFIRMED.
- Sign-out: `AuthRuntime.logout` → `window.location.href = "/login"` (AuthRuntime.ts:117) + session revoke — CONFIRMED.
- /me BFF proxies to backend (P58 fix) — CONFIRMED.
- admin login stub redirects to /login — CONFIRMED.
- Profile is **server-trusted** (JWT + backend system_type) — CONFIRMED.
- Cross-profile: portal token → admin API blocked by backend (portal gating + requirePermission) — CONFIRMED (code).

## 07 AUTHORIZATION BASELINE (CONFIRMED — P59 model in place)
- `requirePermission` on core routes (hardcoded role map + DB PermissionOnRole fallback).
- `admin-settings.js` now has `router.use(requirePermission("admin.*"))` (P59 RBAC gap closed) — CONFIRMED (line 11).
- diagnostics + locations GETs requirePermission — CONFIRMED (P59).
- Effective-permission resolver `/api/auth/permissions` + /me uses it — CONFIRMED (auth.js:111,123,128).
- `X-Dev-Mode` super_admin bypass gated behind `ALLOW_DEV_BYPASS=true` (off) — CONFIRMED (auth.js:14).

## 08 TENANCY/P0 BASELINE (FIXED in code — LIVE PENDING)
- `requireAccess` fixed (sync-return) + wired into **5 routes** (customers, invoices, meters, payments, readings) — CONFIRMED.
- `scopeWhere` (fail-closed: empty-scope → `id:"__denied__"`) + `clampRequestedScope` (deny cross-area/project) — CONFIRMED (security.js:123,147).
- JWT carries `area`/`project` claims — CONFIRMED (auth-engine.js).
- customers list/export/stats/detail all apply scope — CONFIRMED (customers.js:25,29,44,46,58).
- Payments export permission fixed (payments.export) — CONFIRMED.
- **⚠️ LIVE:** backends not running at audit; once restarted, the fix activates. Until then the running instance (if any) is pre-P59. **Wave 4 remains BLOCKED.**

## 09 ADMIN ACTIVATION BASELINE (core governance REAL)
| Function | Page | API | DB | Status |
|----------|------|-----|----|--------|
| Users | users | /api/admin/users | User | REAL |
| Roles | roles | /api/admin/roles | Role | REAL |
| Permissions | permissions | /api/admin/permissions | Permission | REAL |
| Areas | areas | /api/locations/areas | Area | REAL (create needs name+code — code field added P59) |
| Projects | projects | /api/admin/projects | Project | REAL (areaId accepted P59) |
| Audit | audit | /api/admin/audit | AuditEntry | REAL |
| System health | health | /api/admin/health | — | REAL |
| Config | settings | /api/admin/settings | SystemSetting | REAL |
| Security | security | /api/security/* | — | REAL |
| **Logs** | logs | /api/admin/logs | — | **REAL (endpoint fixed P59)** |

## 10 MOCK/STATIC PAGE BASELINE (P58 inventory still valid)
- **12 empty-apiEndpoint configs in system.ts** (STATIC) + ~3 in utility.ts — CONFIRMED.
- **MOCK pages confirmed in source:** accounting/accounts (ACCOUNT_TREE:23,121), sync (MOCK_STATUS:26,55), upload (MOCK_UPLOADS:20), database-management ("simulated":104) + documents, balances, bill-cycle, monitoring, database, workflows.
- **Priority:** core admin governance (Users/Roles/Permissions/Areas/Projects/Settings/Audit/Health/Logs/Security) is **REAL** — the mock/static pages are peripheral (P2).

## 11 PLANNING VS IMPLEMENTATION GAPS (classify)
- Auth (A): IMPLEMENTED · Authorization (B): IMPLEMENTED (P59) · Tenancy (C): IMPLEMENTED-code/LIVE-PENDING · Admin/Portal separation (D): IMPLEMENTED · Areas (E): PARTIAL (search/restore missing) · Projects (F): PARTIAL (areaId now, restore present) · Users (G): PARTIAL (API supports area/project/roleId; UI form missing) · Roles (H): IMPLEMENTED · Permissions (I): IMPLEMENTED · Launch/runtime (J): IMPLEMENTED (MeterVerse.cmd) · Tools (K): IMPLEMENTED (consolidated).

## 12 P57/P58 REVALIDATION
- P57 11 defects: VERIFIED ROOT FIXED (re-checked: portal gating, auth $Matches, diagnostics, login, etc. all present/fixed).
- P58: revalidated — 20 reports present; mock/static inventory CONFIRMED; tenancy P0 → now fixed in code.
- **New doc-lag:** PROJECT_STATE header not bumped to P59 (still 10.9.0-P58).

## 13 NEW FINDINGS (this phase)
- NF-1: PROJECT_STATE header stale (P58, not P59) — documentation lag.
- NF-2: All 4 app services DOWN at audit time (only DB up) — runtime state; not a defect.
- NF-3: Static-config count = 12 in system.ts (+ utility) — slightly lower than P58's 15; likely a config count vs pages nuance.

## 14 RISKS
- R-1: Live tenancy not browser-verified until elevated restart (Wave 4 blocked).
- R-2: User UI form cannot set roleId/area/project (P1 gap from P59 audit).
- R-3: Duplicate Project routers (projects.js + admin.js) — drift risk.
- R-4: AdminLayout default export named SystemLayout (twin) — confusion risk.

## 15 CONCERNS
- The 9 mock pages could be "certified operational" by mistake (P58 rule). Core governance is real; peripheral pages are mock.
- Old docs reference deleted tools (no live impact, but could mislead).

## 16 FEARS
- F-1: If someone restarts backends non-elevated, the fix may not load or processes may not persist.
- F-2: A viewer with an assigned area could still access data if areaId isn't set on a resource (now mitigated by backfill).
- F-3: Wave 4 could be started before live tenancy verification (against the stop condition).

## 17 RECOMMENDATIONS (for next phase, NOT this phase)
- P0.10: elevated restart → live-verify viewer escalation blocked (browser + API + DB).
- P1: user management form (roleId/area/project); merge duplicate Project routers; rename/merge AdminLayout/SystemLayout.
- P2: wire 6 mock pages with existing backends (accounting, bill-cycle, documents, upload, monitoring); point static configs at real endpoints.
- Governance: bump PROJECT_STATE to P59.

## 18 WHAT MUST NOT BE CHANGED YET
- Do NOT weaken tenancy enforcement (scopeWhere/clamp/requireAccess).
- Do NOT change ports (3535/3131/3030/3003/5433).
- Do NOT remove _tools files (consolidation is correct).
- Do NOT start Wave 4.
- Do NOT implement anything in P59-A.

## 19 REQUIRED NEXT PHASE
P59-B: Live tenancy activation + verification (elevated restart) → P1 admin-user form + router merges → P2 mock-page wiring. Only after live tenancy browser/API/DB evidence passes → Wave 4 readiness re-evaluation.

## 20 DEEPSEEK EXECUTION SELF-EVALUATION
- **What I searched:** governance files, git state, _tools reality, port configs (5 sources), tenancy code (security.js, routes, auth-engine), mock-page source, login/sign-out/auth BFF, RBAC gates, effective-perms.
- **What I did NOT search:** full repo scan, all 94 pages, full test run, browser matrix — **excluded deliberately** (8GB RAM + P59-A lightweight scope).
- **Why not:** memory constraint + "one heavy process at a time" + read-only mandate.
- **Tools used:** bash, read, Select-String/git-grep, git, Test-NetConnection, filesystem.
- **Tools not used:** Playwright (no heavy browser), postgres-MCP (psql not needed for config audit), build/test (excluded).
- **Tool limitation:** non-admin shell (could not start/verify live services); elevated processes were already down anyway.
- **Possible false positive:** none identified in this read-only pass.
- **Possible false negative:** live runtime behavior not re-verified (services down); mock-page count may vary with exact config filenames.
- **Assumptions:** "PROJECT_STATE 10.9.0-P58-BLUEPRINT" confirmed as the header; assumed P57/P58 fixes persist (verified by git grep).
- **Uncertainty:** whether a non-elevated restart can activate the tenancy fix reliably (depends on how processes are launched).
- **Self-review of prior phases:** P58/P59 earlier phases did **overclaim some things** (e.g., "certified" before live restart; harness "57/57" used probe paths later corrected). This phase corrects toward evidence-only status. No symptom-fixing was done this phase (read-only).

---

**END P59-A — STOP. No files modified. Awaiting next-phase instruction.**
