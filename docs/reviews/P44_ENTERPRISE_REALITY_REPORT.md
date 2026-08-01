# P44 — Enterprise Reality Assessment & Implementation Recalibration

**Date:** 2026-08-01
**Method:** Repository truth only. Every claim verified against source. No assumptions.
**Report type:** Discovery / Assessment (no code was written or modified)

---

## Executive Summary

MeterVerse is **not at 20% of a finished platform — it is at ~20% of an architecturally-planned 10-wave enterprise program, with a very large, mature, and partially-disconnected codebase already in the repository.**

The platform already contains **168 database models, 570 backend API endpoints across 61 route files, 42 services, 165 frontend pages, 348 backend tests, and 10 migration batches.** This is a substantial enterprise foundation — but the majority of it is **disconnected**: frontend pages render hardcoded/mock data instead of calling the backend, half the models have no relations, and the newest programs (C13) exist only server-side with no UI wiring.

The working-position note in the P44 brief ("Current Working Position: Step 2.6 / C13 Collection Intelligence") is **stale** — the repository is actually at **Wave 2 complete (Step 2.8, commit `ba55dff6`)**. Step 2.6 was completed and pushed (commit `97499880`). This discrepancy is itself a governance finding.

---

## 1. Enterprise Reality Report

### 1.1 Verified execution position

| Item | Verified value | Evidence |
|---|---|---|
| Latest commit | `ba55dff6` — "Wave 2 Step 2.8: implement C13 Financial AI — Wave 2 COMPLETE" | `git log -3` |
| Wave 2 steps | Steps 2.1–2.8 all committed + pushed | commits `d2b83894`…`ba55dff6` |
| Step 2.6 status | ✅ Complete (commit `97499880`) | git log |
| P44 brief working position | "Step 2.6" — **stale / superseded** | mismatch vs git log |
| Current overall | **20%** (per `P40_EXECUTION_TRACKER.md`) | tracker line 153 |
| Missing planning files | `START_POINT.md`, `IMPLEMENTATION_STATUS.md`, `CURRENT_WAVE.md`, P01–P39, P44 → **absent** | filesystem check |

### 1.2 What exists

- **Database:** 168 Prisma models, 8 enums, Postgres datasource. 61 tables added by additive Aug-2026 migrations.
- **Backend API:** 570 method endpoints (259 GET / 232 POST / 37 PUT / 6 PATCH / 36 DELETE) in 61 route files; mounted at both `/api` and `/api/v1`.
- **Services:** 42 service modules (auth, billing, posting, tariff, collections, reporting, financial-AI, runtime, scheduler, failover, metrics, etc.).
- **Frontend:** 165 pages, 63+ shadcn/ui components, 10 themes, Zustand + React Query, 118 BFF route handlers.
- **Tests:** 348 backend tests (102 unit + 165 api + 48 contract + 31 integration + 2 misc); 69 frontend test declarations; 5 CI workflows.
- **Migration batches:** B-01…B-09 (13 migration dirs) created; B-02…B-09 additive.

### 1.3 What exists but is disconnected (biggest category)

| Gap | Evidence |
|---|---|
| Frontend renders mock/hardcoded data, not backend | `admin/collections/page.tsx`, `admin/accounting/trial-balance/page.tsx` = framer-motion + hardcoded arrays, zero `fetch`/`apiBackend`; GenericAdminPage fetches via React Query but many admin pages use static arrays |
| C13 has zero frontend wiring | No `/api/financial-*`, `/api/revenue-*`, `/api/tariff-engine`, `/api/collections`, `/api/financial-ai` route handlers in `Frontend/src/app/api/` |
| Auth falls back to mock users | `identity/auth/api/auth-service.ts`: tries `NEXT_PUBLIC_API_URL` (default `localhost:3001`, not the real `3002`), else `MOCK_USERS` |
| Dev bypasses auth | `DevAuthInit.tsx` auto-authenticates as `super_admin` on mount |
| 11 nav items are `#` placeholders | `nav-config.ts` (Tariffs, Reports, Financial Reports, Monitoring, Alerts, etc.) |
| Accounting frontend pages disconnected | `admin/accounting/trial-balance` uses static arrays; no `/api/accounting` BFF handler |

### 1.4 What exists but is hidden

| Component | Evidence |
|---|---|
| 10 orphan services never imported | `alert-engine`, `billing-engine`, `cache-engine`, `circuit-breaker`, `polling-ingestion`, `sms-engine`, `validation-engine`, `water-balance`, `webhook-dispatcher`, `workflow-engine` |
| 2 dead route files | `routes/index.js` (imports 8 non-existent modules → guaranteed crash if wired); `routes/admin/users.js` (duplicates inline `admin.js` logic) |
| Dual PrismaClient singletons | `server.js` `export const prisma = new PrismaClient()` (used by 52 routes) **and** `db.js` singleton (used by 17 services + 1 route) → two connection pools |
| Schema artifacts outside migrations | `prisma/dev.db` (SQLite 64KB), `prisma/views.sql` (3 views) |
| `backend/coverage/` committed to git | coverage HTML artifacts are tracked |

### 1.5 What exists but is incomplete

| Component | Evidence |
|---|---|
| Coverage thresholds are minimal | lines 46 / functions 48 / branches 36 / statements 43 (backend); frontend vitest has **no thresholds** |
| Frontend test coverage thin | 69 declarations for a 165-page app; `ci.yml` tsc is `continue-on-error` |
| Visual regression is non-blocking | `visual-regression.yml` failure = warning |
| Deploy workflow is a stub | `deploy.yml` echo-only, no real target |
| `docs/screenshots/diff/` referenced but missing | CI upload path does not exist on disk |
| Contract surface thin | 1 live contract file (48 tests) vs 570 endpoints; no generated client |

### 1.6 What exists but is duplicated

| Duplicate pair | Evidence |
|---|---|
| Init migrations ×3 | `00001_init` (86 tables) ⊇ `20260723000000_init_schema` (78 tables); `00001_initial` (0 SQL, note only) |
| Old tariff vs new tariff | `TariffRate`/`TariffTier` vs `TariffVersionRate`/`TariffVersionTier`/`TariffToUSchedule`/etc. |
| Legacy workflow vs C23 BPM | `WorkflowState`/`WorkflowTransition` vs 8-model C23 cluster |
| `authenticate`/`requireRole` in two middleware | `middleware/auth.js` and `middleware/security.js` (security.js impl unused) |
| `/admin` mounted twice | `adminRouter` (admin.js) + `configRouter` (config-center.js) |
| `/monitor` mounted twice | `/monitor` + `/monitoring` (same router) |
| `GovernanceException` vs `GovernanceWaiver` | near-identical shape |
| `ExportJob` vs `ExportLog`, `ReportDefinition` vs `ScheduledReport` vs `ReportSchedule`, `AuditEntry` vs `ActivityStream` | overlapping purpose |
| PROJECT_STATE in 3 locations | `.ai/memory/`, `AI/`, `AI/00_CONSTITUTION/` |

### 1.7 What only exists in planning

| Program | Evidence (plan exists, impl not) |
|---|---|
| C26 MDM | 0% impl, plan exists |
| C16 Asset & Field Ops | 0% impl |
| C28 Digital Twin | 0% impl |
| C30 Compliance | 0% impl |
| C32 Product Lifecycle | 0% impl |
| C33 Engagement | 0% impl |
| C35 ESG & Carbon | 0% impl |
| C37 Privacy & Data Protection | 0% impl |
| C38 Workforce & HR | 0% impl |
| Planning waves W3–W10 | `001_WAVES` only has W1–W6 folders |

### 1.8 What is completely missing

- Frontend wiring for **all C13 Wave-2 domains** (financial-integration, revenue-assurance, tariff-engine, collections, financial-reports, financial-ai, tenants, workflows).
- `START_POINT.md`, `IMPLEMENTATION_STATUS.md`, `CURRENT_WAVE.md`, P01–P39, P44 planning file.
- Real deployment target (deploy.yml is a stub).
- Bank reconciliation (C13-W05) — listed in plan, not implemented.
- Frontend coverage thresholds.

---

## 2. Implementation Coverage Matrix

Legend: **A** Fully Operational · **B** Partially Wired · **C** Backend Only · **D** Frontend Only · **E** DB Only · **F** Hidden · **G** Duplicate · **H** Planning Only · **I** Missing

| Domain | Class | Backend | Frontend | DB | Migration | Tests | Completion % | Evidence |
|---|---|---|---|---|---|---|---|---|
| Auth/Identity | **B** | routes/auth.js, auth-engine | login page + AuthRuntime | User/Session/ApiKey | 00001 | 13 unit + route | 70% | auth falls back to mock; DevAuthInit bypass |
| RBAC/Permissions | **B** | security.js, permissions.test | PermissionGate, use-nav | Role/Permission/PermissionOnRole | 00001 | 31 unit | 70% | seeded hardcoded roles; custom roles need seed |
| Organizations/Companies | **B** | domain.js | — | Organization | 00001 | route | 40% | backend only, no UI |
| Tenants (C22) | **C** | tenants.js (292 lines) | none | 6 models | B-02 | 15 api | 45% | **no frontend** |
| Areas/Governorates | **B** | locations.js | admin/areas | Area/Governorate | 00001 | — | 40% | backend + page, static |
| Projects | **B** | projects.js | admin/projects | Project/Zone | 00001 | — | 40% | page static |
| Locations/Buildings/Units | **B** | locations.js | admin/locations/units | Building/Floor/Unit | 00001 | — | 40% | pages static |
| Customers/Groups | **B** | customers.js | dashboard + admin | Customer/CustomerGroup | 00001 | 6 api | 60% | page uses GenericAdminPage |
| Meters/Types/Assignments | **B** | meters.js, meter-assignments.js | admin/meters | Meter/MeterType/MeterAssignment | 00001 | — | 55% | assignments live, some pages static |
| Communication/Gateway/SIM | **B** | gateways.js, sim.js, connection-profiles.js | admin/sim, admin/sync | Gateway/SIMCard/ConnectionProfile | 00001 | — | 40% | config backend live, SIM page static |
| TCP/Polling Ingestion | **F** | polling-ingestion.js (orphan) | — | — | 00001 | — | 10% | **service never imported** |
| Reading Engine | **B** | readings.js + business-engine | admin/readings | Reading | 00001 | 4 api | 55% | validation split across engines |
| Validation | **G** | validation-engine.js + business-engine.validateReading | — | ValidationRule/Result | 00001 | 2 unit | 50% | **duplicate implementations** |
| Billing/BillRun | **B** | billing.js, billing-engine (orphan) | dashboard/billing | BillCycle/BillRun | 00001 | 1 unit + route | 45% | billing-engine orphan |
| Tariffs (legacy) | **B** | tariffs.js | admin/tariffs | Tariff/Rate/Tier | 00001 | route | 40% | page static |
| Tariff Engine (C13) | **C** | tariff-engine.js | none | 9 models | B-06 | 19 api | 60% | **no frontend** |
| Invoices | **B** | invoices.js | admin/invoices | Invoice/Item/Tax | 00001 | route | 60% | page uses GenericAdminPage |
| Payments | **B** | payments.js | admin/payments | Payment/Transaction | 00001 | route | 60% | page static |
| Ledger/CustomerLedger | **B** | accounting.js, posting-engine | — | GeneralLedgerEntry/Journal | 00001 | 16 api | 55% | **no frontend GL** |
| Financial Integration (C13) | **C** | financial-integration.js, posting-engine | none | 2 models | B-04 | 16 api | 50% | **no frontend** |
| Collection Intelligence (C13) | **C** | collections.js, collections-engine | admin/collections (mock) | 8 models | B-07 | 19 api | 55% | page hardcoded |
| Accounting | **B** | accounting.js | admin/accounting/* (mock) | Account/Journal/GL/Period | 00001 | 16 api | 50% | page static |
| Reporting | **C** | financial-reports.js, reporting-engine | admin/reporting | 8 models | B-08 | 16 api | 60% | **no live frontend** |
| Analytics/Dashboards | **B** | kpi-engine | dashboard/overview | KpiDefinition/Snapshot | 00001 | 2 unit | 40% | dashboard static |
| AI | **B** | ai-engine (9 fns) | admin/ai | — | 00001 | 20 unit | 35% | rule-based; no C18 agents |
| Notifications | **B** | notifications.js, notification-engine | admin/notifications | Notification | 00001 | route | 45% | engine wired |
| Workflow/BPM (C23) | **C** | workflows.js | admin/workflows (mock) | 8 models | B-03 | 17 api | 40% | page static |
| Approvals (C23) | **C** | workflows.js | — | ApprovalRequest/Decision | B-03 | 17 api | 40% | no frontend |
| Audit Logs | **B** | auditLog/auditMiddleware | admin/audit | AuditEntry | 00001 | 31 unit | 55% | live middleware |
| Activity Logs | **B** | — | — | ActivityStream | 00001 | — | 30% | model only, no service |
| Import/Export | **B** | crud-service, importJob/exportJob | admin/migration-uploads | ImportJob/ExportJob | 00001 | 17 unit | 40% | partial |
| Template Engine | **B** | template-engine | — | NotificationTemplate | 00001 | — | 35% | orphan-ish |
| Settings/Config | **A** | admin-settings.js, config-center.js | admin/settings | SystemSetting/FeatureFlag | 00001 | — | 60% | live |
| Runtime Engine | **A** | runtime-manager | admin/runtime | — | inline | — | 60% | live |
| Workspace/Navigation | **A** | — | workspace/ + admin shell | — | — | 5 playwright | 70% | client-side |
| Admin Portal | **A** | — | admin/ (107 pages) | — | — | 10 playwright | 65% | pages exist but many static |
| User Portal | **B** | — | user/ (5 pages) | — | — | — | 30% | minimal |
| Theme Engine | **A** | — | 10 themes + design-system | — | — | 4 test | 80% | complete client-side |
| API Gateway | **B** | server.js mounts + swagger | api-client | — | — | 48 contract | 50% | dual-prefix, no rate-limit split |
| Scheduler/Jobs | **A** | scheduler-engine | admin/scheduler | ScheduledTask/QueueJob | 00001 | — | 55% | live |
| Caching | **F** | cache-engine (orphan) | data-engine | CacheEntry | 00001 | — | 10% | orphan |
| Monitoring | **A** | monitor.js, metrics-collector, health-monitor | admin/monitoring | — | 00001 | — | 55% | live + double-mounted |
| Deployment | **H/I** | — | — | — | — | — | 0% | deploy.yml stub |

---

## 3. Missing Core Matrix (prioritized)

### Critical Missing Core (blocks any real enterprise demo / production)
1. **Frontend → Backend wiring for all C13 Wave-2 domains** (financial-integration, revenue-assurance, tariff-engine, collections, financial-reports, financial-ai, tenants, workflows). Backend fully implemented; frontend renders mock data.
2. **Real auth path** — default `NEXT_PUBLIC_API_URL` points to `:3001` (backend is `:3002`); mock-user fallback and `DevAuthInit` auto-login mean the demo would be simulated, not real.
3. **Unify PrismaClient** — dual singletons (server.js vs db.js) → inconsistent behavior/mocking.
4. **Init migration conflict** — 3 overlapping init migrations (`00001_init` ⊇ `20260723000000_init_schema`); fresh deploy fails if both run.

### High Priority
5. **Remove/repair dead `routes/index.js`** (imports 8 missing modules).
6. **Delete orphan services or wire them** (polling-ingestion especially — real meter reading needs it).
7. **Wire OR remove frontend accounting/collections/reporting pages to real endpoints.**
8. **Resolve `/admin` and `/monitor` double mounts.**

### Medium
9. Resolve duplicate middleware `authenticate`/`requireRole`.
10. Prune overlapping init migration history (`00001_initial`, `20260723000000_init_schema`).
11. Add frontend coverage thresholds; make tsc gate non-optional in CI.
12. Create `docs/screenshots/diff/` or fix workflow upload path.

### Low
13. Remove `backend/coverage/` from git; add to `.gitignore`.
14. Consolidate duplicate model families (legacy vs versioned).
15. Remove `prisma/dev.db`, formalize `views.sql` into migrations.

### Future (Waves 3–10)
16. All 0%-impl programs: C26, C16, C28, C30, C32, C33, C35, C37, C38.
17. C13-W05 Bank Reconciliation; C18 ML model agents; real deploy target.

---

## 4. Wiring Matrix (both sides exist → wire only, never rewrite)

| From | To | Status | Action |
|---|---|---|---|
| Frontend `admin/accounting/*` | Backend `/api/accounting` | Both exist | Wire pages to endpoints (currently static) |
| Frontend collections page | Backend `/api/collections` | Both exist | Wire page to endpoints (currently mock) |
| Frontend workflows page | Backend `/api/workflows` | Both exist | Wire page to endpoints |
| Frontend `admin/reporting` | Backend `/api/financial-reports` | Both exist | Wire page to endpoints |
| Frontend tariff pages | Backend `/api/tariff-engine` | Both exist | Wire page to endpoints |
| Frontend `admin/tariffs` | Backend `/api/tariffs` | Both exist | Wire (currently static) |
| Frontend meters/payments/invoices | Backend `/api/meters`, `/api/payments`, `/api/invoices` | Both exist | Wire GenericAdminPage configs where static |
| Auth service | Backend `/api/auth` (`:3002`) | Both exist | Fix `NEXT_PUBLIC_API_URL` to 3002; remove mock fallback for demo |
| `polling-ingestion` service | meters/readings ingestion | Service exists, orphan | Wire into server startup + readings flow |
| `billing-engine` | `business-engine` | Both exist, duplicated | Merge or delegate |
| `workflow-engine` | C23 `workflows.js` | Both exist, duplicated | Adapter or deprecate legacy |
| Legacy `tariffs.js` calculate | `tariff-engine.js` | Both exist, duplicated | Deprecate legacy calculate, point UI to tariff-engine |
| Users ↔ Roles ↔ Permissions | RBAC | Backend seeded; custom roles need PermissionOnRole seed | Wire permission seed for custom roles |
| Areas ↔ Projects ↔ Meters | CRUD | Backend relations exist | Wire to pages |
| Readings → Billing | business-engine pipeline | Exists | Wire end-to-end; resolve engine duplication |
| Billing → Collections | collections-engine | Exists | Wire invoice→case flow |
| Collections → Accounting | posting-engine + GL | Exists | Wire case resolution → GL |
| Accounting → Reports | financial-reporting-engine | Exists | Wire snapshot to dashboard |
| Reports → AI | financial-ai-engine | Exists | Wire board dashboard |

---

## 5. Dependency Matrix (key)

```
Auth/JWT ──► RBAC ──► all routes (requirePermission)
Organizations/Areas ──► Projects ──► Locations/Units ──► Customers/Meters
Meters ──► MeterAssignment ──► Readings (polling-ingestion/connection-profiles)
Readings ──► Validation ──► Billing (business-engine) ──► Invoices
Invoices ──► Payments ──► Collections (risk/dunning/PTP) ──► PostingEngine ──► GL
GL ──► Financial Reporting (P&L/BS/CF) ──► Financial AI (forecast/scenario)
Tariff Engine (versioned) ──► Billing ──► Revenue Assurance (leakage checks)
Tenants (C22) ──► isolation ──► all domains
Workflow/BPM (C23) ──► Approvals ──► Collections write-off / governance
```

**Modules that cannot function today (not connected):**
- Financial AI health/forecast (no GL data in DB — only 2 ASSET accounts seeded; verified live: revenue=0).
- Revenue assurance findings on real data (no revenue accounts/postings).
- Frontend demo of any C13 domain (no wiring).

**Modules that exist but are NOT connected (wire, don't rewrite):**
- All C13 backend domains → their frontends (listed in §4).
- Orphan services (§1.4).

---

## 6. Duplicate Detection Report

| # | Duplicate | Location(s) | Recommendation |
|---|---|---|---|
| 1 | Init migrations | `00001_init` (86) / `00001_initial` (0) / `20260723000000_init_schema` (78) | Keep `00001_init`; delete the other two (or keep only as documentation) |
| 2 | PrismaClient | `server.js` / `db.js` | Make `db.js` the single canonical export; update ~52 route imports |
| 3 | authenticate/requireRole | `middleware/auth.js` / `middleware/security.js` | Remove security.js duplicate |
| 4 | Tariff engines | `tariffs.js`+`TariffRate/Tier` / `tariff-engine.js`+`TariffVersion*` | Deprecate legacy calculate; route UI to tariff-engine |
| 5 | Workflow engines | `workflow-engine.js` / `workflows.js` C23 cluster | Adapter or deprecate legacy |
| 6 | Validation | `validation-engine.js` / `business-engine.validateReading` | Consolidate to one |
| 7 | Billing | `billing-engine.js` (orphan) / `business-engine` | Merge |
| 8 | Admin users CRUD | `routes/admin/users.js` (dead) / `admin.js` inline | Delete dead file |
| 9 | /admin mount | `admin.js` / `config-center.js` | Namespace config under `/admin/config` |
| 10 | /monitor mount | `/monitor` + `/monitoring` | Keep one alias |
| 11 | GovernanceException vs Waiver | schema | Consider merging |
| 12 | ExportJob vs ExportLog; ReportDefinition vs ScheduledReport vs ReportSchedule; AuditEntry vs ActivityStream | schema | Audit and consolidate |
| 13 | PROJECT_STATE | `.ai/memory/` / `AI/` / `AI/00_CONSTITUTION/` | Canonicalize to `.ai/memory/` |

---

## 7. Implementation Risk Report

| Risk | Severity | Evidence | Mitigation |
|---|---|---|---|
| Demo would be **simulated**, not real | **Critical** | mock auth fallback + DevAuthInit + static pages | Wire frontend to real backend; disable mock fallback; fix API URL |
| Dual PrismaClient | High | server.js vs db.js | Unify singleton |
| Init migration collision | High | 3 overlapping init migrations | Prune to one baseline |
| Dead route file crash risk | High | index.js imports 8 missing modules | Delete or repair |
| C13 backend unexercised in production path | High | no frontend wiring; no GL data | Wire + seed demo accounts/periods |
| Frontend tsc not gating | Medium | ci.yml continue-on-error | Make gating |
| No frontend coverage thresholds | Medium | vitest config | Add thresholds |
| Visual regression non-blocking | Medium | workflow warning-only | Promote to gate for demo-critical paths |
| Orphan services = dead code weight | Medium | 10 services unused | Wire or remove |
| Deploy stub | Medium | deploy.yml echo | Real target or mark HOLD |

---

## 8. Enterprise Demo Readiness Report

**Verdict: NOT READY for a fully-real enterprise demo.** Everything below must persist real data — nothing simulated.

| Demo requirement | Current status | Needed |
|---|---|---|
| Admin Login | ⚠️ Partially | Real backend login at `:3002`; remove mock fallback; disable DevAuthInit for demo |
| User Login | ⚠️ Partially | Same; provision real users |
| Role Management | ✅ Backend live (admin.js + security.js) | Use admin UI (verify wired) |
| Permission Management | ✅ Backend live | Seed custom roles via PermissionOnRole |
| User Management | ✅ Backend live (admin.js /users) | Frontend page wire |
| Area Management | ✅ Backend + page | Wire page to `/api/locations` or `/api/admin` areas |
| Project Management | ✅ Backend + page | Wire page |
| Location Management | ✅ Backend + page | Wire page |
| Connection Configuration | ✅ Backend live (connection-profiles.js) | Wire to admin/connection-settings page |
| TCP Communication | ⚠️ Backend bridge exists; ingestion orphan | Wire `polling-ingestion` + `symbiot-bridge`; live TCP adapter needed |
| Meter Registration | ✅ Backend (meters.js) | Wire admin/meters page |
| Real Reading Reception | ⚠️ Backend readings + business-engine | Complete ingestion path (polling) + live connection |
| Audit Logs | ✅ Live middleware (auditLog) | Verify admin/audit page reads AuditEntry |
| Activity Timeline | ⚠️ Model only | Service + page |
| Real DB Persistence | ✅ Postgres live | — |
| Navigation/Workspace | ✅ Client-side | — |
| Dashboard | ✅ Pages exist | Wire to real metrics (currently static) |
| Reports | ⚠️ Backend reports + financial-reports | Wire report pages to endpoints |

**Blocking items for demo:** (1) frontend→backend wiring for meters/billing/accounting, (2) real auth, (3) live TCP/polling reading path, (4) seeded real GL/tariff data, (5) audit/activity pages on real endpoints.

---

## 9. Optimized Remaining Execution Order

**Principle: wire before build; reuse before create; delete duplicates; then continue waves.**

### Phase 0 — De-risk (no new features)
1. Unify PrismaClient (`db.js` canonical); fix ~52 route imports + test mocks.
2. Prune init migrations to one baseline; formalize `views.sql`.
3. Delete dead `routes/index.js` + `routes/admin/users.js`; resolve `/admin`, `/monitor` double mounts.
4. Resolve duplicate `authenticate`/`requireRole`.
5. Remove `backend/coverage/` from git.

### Phase 1 — Demo-critical wiring (make the demo real)
6. Fix `NEXT_PUBLIC_API_URL` → `:3002`; gate mock fallback behind a feature flag.
7. Disable/flag `DevAuthInit` for demo.
8. Wire C13 frontends: financial-integration, revenue-assurance, tariff-engine, collections, financial-reports, financial-ai (pages exist as shells).
9. Wire accounting pages (accounts/ledger/journal/trial-balance) to `/api/accounting`.
10. Wire reporting/analytics dashboard to real KPIs.
11. Complete live TCP/polling reading path (wire `polling-ingestion` + `symbiot-bridge` + connection-profiles).
12. Seed demo data: accounts (all types), financial period, tariff version, GL postings, customers/meters.

### Phase 2 — Consolidate
13. Merge `billing-engine`→`business-engine`; `validation-engine`→one; deprecate legacy tariff/workflow engines via adapter.
14. Wire or remove the remaining 8 orphan services.
15. Add frontend coverage thresholds; make tsc gating; promote visual regression for demo-critical routes.

### Phase 3 — Certify Wave 2 (P44 gate)
16. Run C20 full gates (tsc 0, vitest, coverage, contract, integration) + C21 governance checkpoint against the wired demo.
17. Produce Wave-2 certification report.

### Phase 4 — Continue roadmap
18. Wave 3 (C24 Documents/Records, C25 Communication, C14 Customer Experience) → Wave 4 … per P40 §3.3–3.10.

---

## 10. Definition of Done — before continuing beyond Wave 2 / C13 Collection Intelligence

The P44 brief asked for DoD "before continuing beyond Step 2.6." Since the repo is actually at Wave-2 complete (Step 2.8), the DoD applies to **Wave 2 certification** and to any step beyond:

1. **No simulated data** — every demo screen reads a live backend endpoint (auth, meters, readings, invoices, payments, accounting, collections, reporting).
2. **Auth is real** — login against `:3002`, no mock-user fallback, no DevAuthInit auto-login in demo mode.
3. **Single PrismaClient** — one import path for `prisma` across all routes + services; tests use the same singleton.
4. **Fresh deploy works** — one clean init migration + additive B-02…B-09 apply cleanly on empty DB (`prisma migrate deploy` verified).
5. **No duplicate executables** — dead route files removed; orphan services wired or removed; duplicate middleware resolved.
6. **C20 gates pass** — tsc 0 (gating), vitest green, coverage thresholds met (backend), contract (48) + integration (31) green, frontend coverage thresholds added.
7. **C21 governance checkpoint passes** — tracker accurate (Step 2.6 vs 2.8 mismatch resolved), observations recorded, status blocks current.
8. **Wave-2 certification report produced** and committed to `docs/certification/`.
9. **Demo seed data script exists** — creates accounts (all 5 types), financial period, tariff version, GL entries, customers, meters with readings.
10. **CI green on `main`** — ci.yml backend + frontend + contract + integration all pass on the latest commit.

---

## Appendix — Verification Log

- `git log` confirmed Wave-2 complete at `ba55dff6`; Step 2.6 at `97499880`.
- `server.js` `export const prisma = new PrismaClient()` confirmed; `rg` counts 52 routes → server.js, 17 services → db.js.
- `routes/index.js` imports `./root.js`…`./upload.js` — all 8 `Test-Path` = False.
- `mount("/admin", adminRouter)` + `mount("/admin", configRouter)`; `mount("/monitor")` + `mount("/monitoring")` confirmed.
- Migrations list: 3 init artifacts + 10 additive batches (B-02…B-09 + governance).
- `prisma/dev.db` (65,536 B) + `prisma/views.sql` exist.
- Frontend: no `/api/financial-*` BFF handlers; `admin/collections` + `admin/accounting/trial-balance` = framer-motion static pages.
- Auth: `API_BASE = NEXT_PUBLIC_API_URL || "http://localhost:3001"`, `MOCK_USERS` fallback, `DevAuthInit.tsx` exists.
- Test inventory: 348 backend / 69 frontend declarations; thresholds lines46/fn48/br36/st43.
- `deploy.yml` echo stub; `visual-regression.yml` warning-only; `docs/screenshots/diff/` missing.

---

*Report generated by the autonomous engineering agent per P44. All findings verified against repository state at commit `ba55dff6`.*
