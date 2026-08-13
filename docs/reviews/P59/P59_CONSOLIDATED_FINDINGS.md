# P59 — CONSOLIDATED FINDINGS (Sections 01-16, 19-30)
**Date:** 2026-08-13 · Evidence-based

## 01 DISCOVERY (current system map)
- FE: Next.js 16 (admin :3535 red, portal :3030 green) · BE: Express+Prisma (3131 admin, 3003 portal) · DB: PostgreSQL 16 native :5433 (meter_pulse)
- 187 Prisma models · 63 routes · 43 services · 6 middleware · 94 admin pages · 5 users · 164 customers · 212 meters · 3 areas · 10 projects
- Toolchain: unified `_tools/MeterVerse.cmd` + config.cmd + SafetyCheck.cmd (.gitattributes fixed UTF-16 blank screen)

## 02 P58 REVALIDATION (spot)
- P58 "22 mock/static pages" → **confirmed** (9 MOCK + 11 STATIC + 2 demo), + corrections: workflows is also MOCK; `database` config orphaned
- P58 "0 areas/0 projects/0 invoices" → **now populated** (3 areas, 10 projects, 100 invoices)
- P58 tenancy P0 → **this phase fixed** (see 03 report)

## 04 STARTUP DEPENDENCY GRAPH (verified)
DB(:5433) → backend config(.env) → Admin BE(3131) + Portal BE(3003) → Admin FE(3535) + Portal FE(3030) → BFF rewrite (/api/*→backend) → auth → RBAC → **tenancy** → business → observability
- `_tools/MeterVerse.cmd start` enforces DB check → BE → FE → health-wait order (correct)

## 06 TENANCY MODEL DECISION
**Option A: ONE shared DB + app-level enforcement** (approved). User.area/project are strings + JWT claims; PermissionOnRole supports scopeType/scopeId (multi-area limitation noted: @@unique[roleId,permissionId]).

## 07 requireAccess — INVESTIGATED
Was 0 uses + broken (undefined checkPermission). **Now fixed + wired** to detail routes. Single authoritative model: backend JWT-scope + scopeWhere/clamp on queries + requirePermission for role. Frontend checks = UX only.

## 09 SECURITY TEST MATRIX (designed + partially executed)
- Created test identities: viewer (support.user), operator, billing, super_admin (admin@meterverse.com)
- **Escalation tests (7) in security-middleware.test.mjs:** viewer-other-area DENIED, empty-scope fail-closed, admin/super_admin global, project-scope → ALL PASS
- Live re-run pending elevated restart (old backends still pre-P59 code)

## 10 DB VALIDATION
- No duplicate users · 0 customers without areaId (after backfill) · 3 areas · 10 projects (T027 test projects, no areaId)
- **Found:** Project.areaId exists in schema but no router accepted it → **fixed** (projects.js now accepts areaId)

## 11 DATA LINEAGE
Customer→Meter→Reading→Invoice→Payment chain present with areaId; AuditEntry has actor/action/resource/before/after/correlationId. Effective-permission endpoint now resolves DB grants.

## 12 ADMIN FUNCTIONAL AUDIT (key results)
- **REAL (A):** users, roles, permissions, areas(partial), projects(partial), zones, units, customers, meters, invoices, payments, readings, tariffs, sim, audit, settings, health, api-keys, sessions, webhooks, backups, cache, queue, scheduler, storage, license, branding, feature-flags, organizations, security, accounting(main)
- **MOCK (F):** upload, documents, sync, balances, bill-cycle, monitoring, accounting/{accounts,journal,ledger,trial-balance}, database, database-management, workflows
- **STATIC:** api, api-management, integrations, localization, notifications, plugins, promotions, sms, smtp, themes, translations
- **BROKEN:** logs (was /api/services/email → **fixed** to /api/admin/logs)
- **Orphaned:** ~44 pageMap keys without nav

## 13-15 AREA/PROJECT/USER/ROLE/PERMISSION
- Area: full CRUD + archive ✓ (search/restore missing)
- Project: full CRUD ✓ + **areaId now accepted** (fixed)
- User: create with area/project/roleId at API ✓, but UI form missing these fields (P1)
- Role/Permission: CRUD ✓, PermissionOnRole grants ✓
- **Effective-permission resolver: NEW** /api/auth/permissions (was missing)

## 16 KIRLLOS
- kirllos.hany@epower.com.eg **does NOT exist** (verified DB)
- **Recommendation:** ONE user row + roleId→Super Admin (257a8e68-…), system-scoped. Password via env-secret bootstrap (never commit).

## 17 SHARED LOGIN
- Shared /login UI; profile-aware system_type (admin/user); session revoke works; BFF routing verified. Tenancy now enforced per-request.

## 18 PORT SEPARATION (verified repo-wide earlier)
- Admin 3535→3131, Portal 3030→3003, DB 5433. No cross-wiring found.

## 19-20 BROWSER / VISUAL
- 94/94 admin pages + 16/16 portal pages render 200 (P58 evidence). Visual palette verified (admin red, portal green, dark #1A1A1E). Browser tenancy re-test pending elevated restart.

## 21 MOCK PAGE → BACKEND MAP (for wiring)
| Page | Backend exists? |
|---|---|
| accounting/{accounts,journal,ledger,trial-balance} | YES (accounting.js) |
| bill-cycle | YES (domain.js bill-cycles) |
| documents | YES (documents.js) |
| upload | YES (documents.js /documents/upload + admin-settings uploads/list) |
| monitoring | YES (admin.js /monitoring + monitor.js) |
| sync / balances / database / database-management | NO backend (build or remove) |
| 11 static | point configs at existing endpoints where possible (api-keys, config/:key, notifications, settings) |

## 22-23 WIRING / API
Core CRUD pages wired (GenericAdminPage → live endpoints). Mock pages = frontend-only (see 21). BFF rewrite + apiClient verified.

## 24 DUPLICATION (verified importers)
REMOVE (0 importers): services/api-client, SessionManager, AppShell×2, AdminPageSwitch, runtime/events/event-bus, IdentityContext, breadcrumbs×2, enterprise/command-palette.
MERGE: AdminLayout/SystemLayout (twin, same default-export name), projects.js + admin.js project routers, monitoring/monitoring-view.

## 25 PLANNING vs IMPLEMENTATION
C13 ~85% (W05 bank recon 0%) · C14-C18, C20, C22-C27, C29, C31, C34, C36 PARTIAL · C28, C30, C32, C33, C35, C37, C38 NOT STARTED. Tracker undercounts (187 models vs claimed 12-20%).

## 26 TOOL SAFETY (verified)
MeterVerse.cmd: no blind kill-all-node (safety check), push mode reviews+confirms (no blind add -A), backup/restore native PG with confirmation. .gitattributes prevents UTF-16.

## 27 BACKUP (verified)
Native pg_dump :5433 → `_tools/backups/meterverse_YYYYMMDD.sql` (real, non-empty). PG16 psql/pg_dump matched (fixes \restrict issue). Meter/ backup complete (17.2 GB zip, 295k entries).

## 28 SECURITY
No hardcoded secrets in committed source (.env gitignored). X-Dev-Mode now gated. dev-login present (NODE_ENV-gated). CORS localhost-only. Audit present.

## 29 PERFORMANCE
List endpoints use pagination + select. No obvious N+1 in core lists. (Full perf run pending live restart.)

## 30 OBSERVABILITY
runtime/status, health/scores, observability/metrics, scheduler/stats, ingestion/status all live. AuditEntry has correlationId. Request logging present.
