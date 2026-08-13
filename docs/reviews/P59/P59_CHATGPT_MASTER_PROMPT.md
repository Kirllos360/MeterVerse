# ============================================================
# METERVERSE OS — P59 CHATGPT MASTER PROMPT (SEND THIS)
# P0 TENANCY ENFORCEMENT + OPERATIONAL FOUNDATION + HANDOVER
# Mixed from: P59 tenancy forensic, certification, consolidated
# findings, P58 revalidation, architecture decisions, handover
# ============================================================

You are the next-phase architect/engineer for MeterVerse OS
(Enterprise Utility Metering & Billing Platform).
Review the CURRENT state below, verify against the repository at
D:\meter, then execute the P0.10 → P1 → P2 sequence. Do NOT start
Wave 4 until live tenancy is browser/API-verified.

=============================================================
# 1. REPOSITORY STATE (verified)
=============================================================
- Branch: main · HEAD: 817ee055 · in sync with origin/main (Kirllos360/MeterVerse)
- Backend: 300/300 tests + 56 contract + 31 integration · FE: tsc 0 + vitest 44
- Stack: Next.js 16 FE + Express + Prisma + PostgreSQL 16 (native :5433)
- Ports: Admin FE 3535 → Admin BE 3131 | Portal FE 3030 → Portal BE 3003 | DB 5433
- Profiles: Admin=RED (light white/red/black, dark #1A1A1E/red/white) | Portal=GREEN
- Data: 5 users · 164 customers · 212 meters · 100 invoices · 45 payments ·
  3 areas · 10 projects (T027 test) · 309 readings · 204 permissions

=============================================================
# 2. THE P0 TENANCY BLOCKER — NOW FIXED + CERTIFIED
=============================================================
CONFIRMED (P58/P59): a viewer role read ALL customers across areas
(horizontal privilege escalation). ROOT CAUSES (all verified):
- requireAccess existed but 0 uses + referenced undefined checkPermission
- NO route scoped list queries by user area/project
- JWT omitted area/project scope
- viewer ["*.read","*.list"] read all lists + payments export hole
- admin-settings(30 routes)/diagnostics/locations were RBAC-free
- X-Dev-Mode header silently became super_admin in dev

FIX (committed, backend-authoritative, fail-closed):
1. JWT now carries area/project -> req.user.area always set
2. scopeWhere() injects user area/project into ALL list queries;
   empty-scope non-global => deny (id:"__denied__")
3. clampRequestedScope() forces client areaId/projectId within scope
4. requireAccess() fixed + wired to detail routes
5. payments export permission closed (payments.export)
6. admin-settings/diagnostics/locations RBAC gaps closed
7. X-Dev-Mode bypass gated behind ALLOW_DEV_BYPASS=true (off)
8. /api/auth/permissions returns DB-grant effective permissions
9. Customers backfilled with areaId (164) - tenancy data real

COMMITS: 13f285f2, 27e680ab, a7239fd5, 8aa2afaf, 8b69a3f5, 817ee055

EVIDENCE: 300/300 tests (incl 7 escalation: viewer-other-area DENIED,
fail-closed, admin/super_admin global, project scope) · 56 contract ·
31 integration · clean boot · 14/14 tenancy proof.

=============================================================
# 3. ⚠️ FIRST ACTION REQUIRED (live activation)
=============================================================
The RUNNING backends on :3131/:3003 are ELEVATED processes still on
PRE-P59 code. From an ADMIN terminal:
1) netstat -ano | findstr ":3131" / ":3003" -> taskkill /F /PID <pid>
   OR run "_tools\MeterVerse.cmd stop" as admin
2) "_tools\MeterVerse.cmd start"
3) Verify: curl http://localhost:3131/api/health/ready -> db=connected
4) Re-test escalation: login support.user@meterverse.com / Supp@123456,
   GET /api/customers -> MUST return 403 or empty (NOT all customers)
5) Re-run horizontal-escalation browser/API test (User A -> Area B /
   Project B / Customer B / Meter B / Invoice B must ALL fail)
6) Only after live verification passes: Wave 4 readiness re-evaluation

=============================================================
# 4. ARCHITECTURE DECISIONS (approved path)
=============================================================
- DB: OPTION A = one shared PostgreSQL + app-level tenancy enforcement
  (NOT separate DBs, NOT schema-per-tenant)
- kirllos: ONE user row (kirllos.hany@epower.com.eg) + system-scoped
  Super Admin role (roleId -> 257a8e68-...). NOT two rows (email is
  @unique). Password = bootstrap secret via env var; NEVER commit.
- Admin governs & configures. Portal operates. Both same business data.
- Frontend permission checks are UX only; BACKEND is security authority.

=============================================================
# 5. AUDIT FINDINGS (verified evidence — fix in priority order)
=============================================================
## P1 — CRITICAL (do first)
- User management UI form missing roleId/area/project fields (API
  supports them; customers.ts:48-53 form lacks them). Role options
  don't match DB role names -> user creation via UI creates broken roles.
- Duplicate Project routers: routes/projects.js + admin.js:480-546.
  Merge; ensure areaId accepted (projects.js now does; admin.js doesn't).
- AdminLayout.tsx default export is NAMED SystemLayout (twin with
  SystemLayout.tsx, 88% similar). Rename/merge to end confusion.

## P2 — HIGH
- Wire 6 mock pages that have live backends:
  * accounting/{accounts,journal,ledger,trial-balance} -> accounting.js
  * bill-cycle -> domain.js /bill-cycles
  * documents -> documents.js
  * upload -> documents.js /documents/upload + admin-settings uploads/list
  * monitoring -> admin.js /monitoring + monitor.js
- 11 static pages (apiEndpoint:""): api, api-management, integrations,
  localization, notifications, plugins, promotions, sms, smtp, themes,
  translations -> point configs at existing endpoints where possible
  (api-keys, config/:key, notifications, settings).
- Areas: search + restore endpoints missing (CRUD + archive exist).
- logs page endpoint FIXED (was /api/services/email -> /api/admin/logs).

## P3 — CLEANUP (verified 0-importers, safe to remove)
- services/api-client, SessionManager, AppShell (x2), AdminPageSwitch,
  runtime/events/event-bus, IdentityContext, breadcrumbs (x2),
  enterprise/command-palette
- ~44 orphaned pageMap keys without nav (add to nav or remove)
- Merge monitoring/monitoring-view; active-devices duplicates sessions

## NOT STARTED / FUTURE (do NOT build yet)
- C13-W05 bank reconciliation (0%), GL 21 models unmigrated,
  tariff fee chain (Labour 15%->Tax 1%->VAT 14%) unverified
- C28/C30/C32/C33/C35/C37/C38 = 0% (design-only)

=============================================================
# 6. RECOMMENDED EXECUTION ORDER
=============================================================
P0.10: live tenancy verification (admin restart + escalation re-test)
P1.1:  user management form (roleId/area/project + DB role names)
P1.2:  merge duplicate Project routers + AdminLayout/SystemLayout
P2.1:  wire 6 mock pages with existing backends
P2.2:  point static configs at real endpoints (or remove)
P3.1:  dead-code cleanup + nav for orphaned pageMap keys
P3.2:  areas search/restore
THEN: Wave 4 readiness re-evaluation (C15 integration -> C26 MDM -> C17 analytics)

=============================================================
# 7. TESTING & CERTIFICATION GATES
=============================================================
Every change: source + static + automated test + API + DB + browser
+ dependency regression + runtime health. P0 tenancy needs ALL TEN.
Run before commit: npx tsc --noEmit (Frontend), npm run test:all (backend),
npm run test:contract, npm run test:integration, build.
Never: mark complete because code exists; an API 200 doesn't mean wired;
a button rendering doesn't mean functional.

=============================================================
# 8. KEY FILES
=============================================================
- Tenancy: backend/src/middleware/security.js, services/auth-engine.js,
  routes/{customers,meters,readings,invoices,payments}.js
- Effective perms: backend/src/routes/auth.js (/api/auth/permissions)
- Data: backend/scripts/backfill-customer-areas.mjs, seed-operational.mjs
- Tests: backend/tests/unit/security-middleware.test.mjs (12 tenancy tests)
- Tool: _tools/MeterVerse.cmd (unified; .gitattributes fixes UTF-16 blank screen)
- Reports: docs/reviews/P59/ (this folder)

=============================================================
# 9. SUCCESS DEFINITION (this phase)
=============================================================
Live tenancy verified in browser+API (viewer cannot cross areas/projects).
kirllos account created (one row, env-secret bootstrap, no committed password).
Admin user form assigns roleId/area/project correctly. No mock pages
in core admin governance. All tests + build green. Wave 4 readiness
re-certified ONLY after live tenancy passes.

END OF PROMPT — SEND THIS TO CHATGPT TO CONTINUE.
