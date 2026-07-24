# MeterVerse — Unified Enterprise Plan v2

**Generated:** 2026-07-24
**Repository:** https://github.com/Kirllos360/MeterVerse (branch: clean-main)
**Planning OS:** v3.0.0 (Final Architecture — FROZEN)

---

## COMPARISON REPORT: old_tasks.md vs Current Implementation

### Found in old_tasks.md but MISSING from our implementation:

| ID | Task | Priority | Notes |
|:--:|------|:--------:|-------|
| T069 | FE-041 Payments allocation workflow | HIGH | Not implemented |
| T070 | FE-042 Balances aging + collector tooling | HIGH | Not implemented |
| T071 | FE-043 Customer statements v1 | HIGH | Not implemented |
| T073 | Report export jobs (async) | MEDIUM | Not implemented |
| T075 | RBAC action-gating + audit coverage tests | MEDIUM | Partially done (T17+T21) |
| T076 | FE-050 Reports v2 with async exports | MEDIUM | Not implemented |
| T077 | FE-051 Action-level permission gating | MEDIUM | Not implemented |
| T082 | Polish frontend batch validation | LOW | Not implemented |
| T083 | Reconcile contract suite vs API YAML | LOW | Not implemented |
| T084 | Quickstart MVP acceptance validation | MEDIUM | Not implemented |
| T200-T216 | Governance (PDF engine, templates, bill cycle, QR, etc.) | HIGH | Symbiot, PDF, i18n, backup |
| T086-T120 | v2.0.0 (data migration, Symbiot bridge, deployment) | HIGH | Future scope |

### Tasks in old_tasks.md that are COVERED by our implementation:

| Our Task | Corresponding Old Task | Status |
|----------|:----------------------:|:------:|
| T09-T12 (Unit/API/Playwright tests) | T012+T079+T080 | ✅ |
| T17 (Permission enforcement) | T009 | ✅ |
| T21 (Audit coverage) | T010 | ✅ |
| T30 (API hardening) | T006 | ✅ |
| T35 (Workflow engine) | T099 (partial) | ✅ |
| T36 (Export streaming) | T073 (partial) | ✅ |
| T41 (MFA) | T105 (partial) | ✅ |
| Phase 43c (Documents) | T202 (partial) | ✅ |

### Tasks in old_tasks.md we DO NOT NEED (architectural difference):

| Old Task | Why not needed |
|:--------:|---------------|
| T001-T005 | NestJS scaffold — we use Express.js |
| T007 | Correlation ID middleware — not in our architecture |
| T008 | Idempotency key — not required |
| T011 | API versioning — we don't use /api/v1 |
| T013-T019 | Schema migrations — already have 78 models |
| T027-T034 | NestJS modules — different architecture |
| T043-T052 | US2 reading validation — Express version |
| T061-T067 | US3 billing — Express version |

---

## PLANNING FILE INVENTORY — All planning files in project

| File | Purpose | Status |
|------|---------|:------:|
| `planning/VERSION` | Planning OS version + freeze rules | ✅ ACTIVE |
| `planning/IMPLEMENTATION_PLAYBOOK.md` | 13-stage lifecycle | ✅ ACTIVE |
| `planning/ULTIMATE_AUDIT_LOOP.md` | 21-dimension SUPERLOOP | ✅ ACTIVE |
| `planning/METERVERSE_UNIFIED_PLAN.md` | Merged wave plan | ✅ THIS FILE |
| `planning/PROJECT_METRICS.yaml` | Machine-readable dashboard | ✅ ACTIVE |
| `planning/PROJECT_HEALTH.yaml` | Dependency health + risk aging | ✅ ACTIVE |
| `planning/000_ENTERPRISE_PROGRAM/` | 41 governance layers | ✅ FROZEN |
| `planning/001_WAVES/` | Wave implementation directories | ✅ ACTIVE |
| `planning/EXECUTION/` | Session lifecycle (9 files) | ✅ ACTIVE |
| `planning/AUDIT_ENGINE/` | 6-level audit templates | ✅ ACTIVE |
| `planning/LEARNING_ENGINE/` | Continuous improvement (8 files) | ✅ ACTIVE |
| `planning/KNOWLEDGE_BASE/` | Knowledge bridge | ✅ ACTIVE |

---

## WAVE 01 — Enterprise Hardening ✅ COMPLETE

### Phase 420 — Shared Auth & Permissions
- **T009 (equivalent)**: Shared authentication layer, JWT with bcrypt
- **T017 (equivalent)**: Role-based access control with 57 permission keys
- **Dependencies**: None
- **Validation**: 21/21 routes use requirePermission(), 0 requireRole calls
- **Checkpoint**: ✅ Auth + permissions foundation complete

### Phase 42a — Indexes & Domain
- **Task**: Database indexes on all foreign keys (68 indexes)
- **Task**: Domain model consolidation
- **Dependencies**: Phase 420
- **Validation**: 78 Prisma models with @@index on FKs

### Phase 42b — Notifications & Export
- **Task**: Notification engine with in_app/email/sms/push channels
- **Task**: CSV/JSON export endpoints with 10K row cap
- **Dependencies**: Phase 420
- **Validation**: Email engine logs, SMS placeholder, export streaming capped

### Phase 42c — Detail Pages + ErrorBoundary
- **Task**: 7 [id] detail pages (customers, meters, invoices, payments, readings, contracts, meter-assignments)
- **Task**: ErrorBoundary on admin layout (59 pages protected)
- **Dependencies**: Phase 422
- **Validation**: Build succeeds, TypeScript passes, all pages render

### Phase 42d — QA & Tooling
- **Task**: Gate check scripts, final verification scripts (85 tests)
- **Task**: 24 Playwright specs (5 auth + 19 pages)
- **Dependencies**: Phase 42c
- **Validation**: 85/85 backend tests, 24 Playwright specs all pass

### Phase 42e — Enterprise Controls
- **T35**: Workflow engine with 3 state machines (customer: 7 states, invoice: 8 states, meter: 7 states)
- **T21**: Audit engine with auditLog middleware (75+ calls across 10 files)
- **T17**: Permission engine (57 keys, 5 roles, glob matching)
- **Dependencies**: Phase 420
- **Validation**: Workflow transitions validated, audit trail created, permissions enforced

### Phase 42f — Communication & Billing
- **Task**: WebSocket gateway (Socket.IO with JWT auth, user/role rooms)
- **Task**: Basic billing/invoice generation
- **Dependencies**: Phase 42e
- **Validation**: WebSocket connects, invoice generates

---

## WAVE 02 — User Experience & Communication ✅ COMPLETE

### Phase 00 — Enterprise Test Foundation
- **T09**: Unit tests — 71 tests across 12 services, 87.79% coverage
  - **Dependencies**: None
  - **Area/Files**: `backend/tests/unit/*.test.mjs`, `backend/tests/helpers/mock-prisma.js`
  - **Acceptance**: 12 services covered, 80%+ coverage threshold
  - **Validation**: `npm test` passes, `npm run test:coverage` shows >80%
  - **Risk**: Mock-prisma must stay in sync with schema changes

- **T10**: API tests — 14 tests across 5 route files (auth, CRUD, payments, readings, permissions)
  - **Dependencies**: T09
  - **Area/Files**: `backend/tests/api/*.test.mjs`, `supertest`
  - **Acceptance**: Auth flow, CRUD operations, permission checks tested
  - **Validation**: `npm test` includes API tests
  - **Risk**: Route changes may break tests; update tests with routes

- **T11**: Playwright auth tests — 5 tests
  - **Dependencies**: Frontend login page exists
  - **Area/Files**: `Frontend/tests/auth-flow.spec.ts`
  - **Acceptance**: Login page renders, form fields present, redirect works
  - **Validation**: `npx playwright test` with frontend running

- **T12**: Playwright page tests — 19 tests (11 admin + 6 dashboard + 2 error + 4 perf)
  - **Dependencies**: Frontend admin pages exist
  - **Area/Files**: `Frontend/tests/admin-pages.spec.ts`
  - **Acceptance**: All key pages render without console errors
  - **Validation**: `npx playwright test` passes

- **Checkpoint**: ✅ 85 backend tests + 24 Playwright specs, all passing

### Phase 42g — Enterprise Control Health ✅ COMPLETE
- **T17**: 12 routes migrated from requireRole to requirePermission (21/21)
- **T21**: 75+ auditLog calls across 10 route files
- **T29**: 9 Prisma enums added (EntityStatus, InvoiceStatus, MeterStatus, etc.)
- **T30**: domain.js DELETE idempotency fixed (15 entities), Zod on 6 routes
- **T31**: permissions.js deleted, console.log removed, 22 routes scanned clean
- **T34**: Graphiti manifest (366 entries) path-corrected
- **T35**: Workflow engine — 3 state machines (customer, invoice, meter)

### Phase 43c — Documents & Files ✅ COMPLETE
- **Task**: Document upload API with multer (10MB limit, POST/GET/DELETE)
- **Task**: Document templates CRUD (using NotificationTemplate model)
- **Dependencies**: StoredFile model exists in Prisma
- **Validation**: 85/85 tests still pass

### Phase 43d — Admin Control Panels ✅ COMPLETE
- 56 admin pages via GenericAdminPage + 7 [id] detail pages
- T32: ErrorBoundary on admin layout
- T36: Export streaming fix (10K row cap)
- Monitoring page API paths fixed

### Phase 43b — Communication ❌ PENDING (blocked)
- **T06**: Email delivery — engine exists, SMTP credentials needed
- **T07**: SMS service — placeholder, Twilio/Vonage needed
- **T08**: Push notifications — not built, Firebase needed
- **Blocker**: External provider credentials not provided

### Phase 43e — SYMBIOT Integration ❌ PENDING (blocked)
- **Task**: SYMBIOT API integration for meter data
- **Task**: Reading pipeline automation
- **Blocker**: SYMBIOT API documentation not provided

---

## WAVE 03 — Enterprise Billing & Tariff 🔄 IN PROGRESS

### Phase 44a — Tariff Engine 🔄 RUNNING
- **Task**: Tariff CRUD API (GET list, GET detail, POST create)
- **Task**: Calculate endpoint (tiered pricing + flat rate)
- **Dependencies**: Tariff/TariffRate/TariffTier models exist in Prisma
- **Area/Files**: `backend/src/routes/tariffs.js`
- **Acceptance**: Create tariff with nested rates/tiers, calculate charge for consumption
- **Validation**: 85/85 tests pass
- **Risk**: Tiered pricing logic must match business-engine calculation

### Phase 44b — Billing Pipeline ❌ PLANNING
- **Task**: Bill run generation, cycle management
- **Task**: Invoice batch generation per utility type
- **Dependencies**: Phase 44a (Tariff Engine)

### Phase 44c — Collections & Payments ❌ PLANNING
- **Task**: Payment recording, allocation (oldest-due-first)
- **Task**: Invoice adjustment, credit/debit notes
- **Dependencies**: Phase 44b

### Phase 44d — Billing Compliance ❌ PLANNING
- **Task**: Approval workflows for high-risk invoices
- **Task**: Audit trail for all billing operations
- **Dependencies**: Phase 44c

---

## WAVE 04 — Platform Hardening & Scale ✅ COMPLETE

### Phase 45a — Performance Hardening ✅ COMPLETE
- **T37**: Pagination caps — Math.min(100, limit) on alerts.js, reports.js (5 endpoints)
- **T38**: Circuit breaker — CircuitBreaker class (closed/half-open/open)
- **T39**: Cache engine — in-memory Map with TTL (300s) + pattern invalidation
- **T40**: Graceful degradation — ai-engine wrapped with try/catch, 15 services audited

### Phase 45b — Security Hardening ✅ COMPLETE
- **T41**: MFA — speakeasy TOTP integration (setupMfa + verifyMfa)
- **T42**: CSRF — mitigated (JWT-in-header pattern)
- **T43**: IP blocking — mitigated (express-rate-limit: 200 global, 20 auth)
- **T44**: DDoS — mitigated (rate limiting + 1mb body limits)
- **T45**: Security scan — npm audit in CI
- **T46**: CORS/Helmet — verified properly configured

### Phase 45f — CI/CD Pipeline ✅ COMPLETE
- **T13**: CI test pipeline — GitHub Actions (backend tests, frontend build, Graphiti validation)
- **T47**: Graphiti CI validation — manifest path verification
- **T48**: Deployment pipeline — GitHub Actions deploy (triggers after CI success)

---

## WAVE 05 — AI Intelligence 🔒 LOCKED
- **Phase 46a**: AI engine (forecasting, anomaly detection)
- **Phase 46b**: Analytics dashboards
- **Phase 46c**: Automation
- **Phase 46d**: Integrations

## WAVE 06 — Mobile & Enterprise Release 🔒 LOCKED
- **Phase 47a**: Mobile API
- **Phase 47b**: Enterprise release
- **Phase 47c**: Post-launch

## WAVES 07-10 — Future Scope ❌ NOT YET PLANNED
- **W07**: Enterprise Financials (Customer/Accountant Ledger, Payment Center, Collection Automation)
- **W08**: Meter Infrastructure (SYMBIOT Full Integration, Meter Control Center, SIM Card Management)
- **W09**: Multi-Area Platform (Arabic/English UI, Area-Specific Configuration, Cross-Area Reporting)
- **W10**: Enterprise Intelligence (Smart Alert System, Chat Engine, Predictive Analytics, Digital Twin)

---

## MATERIAL GAPS (from old_tasks.md not in our implementation)

### HIGH Priority — Should implement before Wave 03

| Gap | Source | Effort |
|-----|:------:|:------:|
| T069 Payments allocation workflow (old_tasks.md) | old_tasks.md T069 | 2-3 sessions |
| T070 Balances aging + collector tooling | old_tasks.md T070 | 2-3 sessions |
| T071 Customer statements | old_tasks.md T071 | 2-3 sessions |
| T073 Report export jobs (async) | old_tasks.md T073 | 2-3 sessions |

### MEDIUM Priority — After Wave 03

| Gap | Source | Effort |
|-----|:------:|:------:|
| T075 RBAC action-gating audit tests | old_tasks.md T075 | 1 session |
| T077 Action-level permission gating UI | old_tasks.md T077 | 1-2 sessions |
| T083 Contract/API reconciliation | old_tasks.md T083 | 1 session |
| T200 PDF Generation Engine | old_tasks.md T200 | 3-4 sessions |
| T203 Bill Cycle Governance | old_tasks.md T203 | 2 sessions |

### LOW Priority — Deferred

| Gap | Source | Effort |
|-----|:------:|:------:|
| T076 Reports v2 with async exports | old_tasks.md T076 | 2 sessions |
| T210 Monitoring and Alerting | old_tasks.md T210 | 1 session |
| T214 Invoice Due Date logic | old_tasks.md T214 | 1 session |
| T215 RTL/Responsive Playwright Tests | old_tasks.md T215 | 1 session |
| T086-T120 v2.0.0 features | old_tasks.md T086-T120 | Entire Wave 07-10 scope |

---

## SUMMARY

| Wave | Old Plan Tasks | Our Tasks | Status |
|:----:|:--------------:|:---------:|:------:|
| 01 | T001-T011, T013-T019 | 7 phases | ✅ Complete |
| 02 | T020-T042, T069-T071 | 4 phases | ⏳ 43b+43e blocked |
| 03 | T043-T072 | 1 phase started | 🔄 Phase 44a running |
| 04 | T073-T085, T200-T216 | 3 phases | ✅ Complete |
| 05-10 | T086-T120 | None | ❌ Future |

**Gaps identified from old_tasks.md: 20 tasks not yet implemented**

---

*Comparison generated from: old_tasks.md (1277 lines, 120 tasks) vs METERVERSE_UNIFIED_PLAN.md (160 lines, 41 tasks)*
