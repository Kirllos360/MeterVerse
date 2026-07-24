# Complete Task Audit: old_tasks.md vs Actual Implementation

> **Generated**: 2026-07-24
> **Codebase**: `D:\meter` (backend: Express.js, frontend: Next.js 16)

---

## Classification Legend

| Icon | Meaning |
|------|---------|
| ✅ COMPLETE | Implemented and working as described |
| ⚠️ PARTIAL | Exists but incomplete / lacks key acceptance criteria |
| ❌ MISSING | Not implemented at all |
| 🔄 WRONG ARCH | Exists but uses different architecture (Express.js vs NestJS, Clerk vs custom JWT, etc.) |
| 📋 PLANNED | Infrastructure exists but feature not implemented |

---

## Phase 1: Setup (Shared Infrastructure)

| ID | Task | Status | Evidence |
|----|------|--------|----------|
| T001 | Create NestJS backend project scaffold | 🔄 WRONG ARCH | `backend/` uses **Express.js** (server.js + routes + services), NOT NestJS. `package.json` shows Express 4.21, no `@nestjs/*` deps. Project structure: `routes/`, `controllers/` (empty), `services/`, `middleware/` |
| T002 | Config + PostgreSQL connection module | ✅ COMPLETE | `backend/.env` exists, Prisma connects to PostgreSQL via DATABASE_URL, `server.js` initializes PrismaClient on boot |
| T003 | Configure backend lint/format/test tooling | ✅ COMPLETE | `vitest.config.ts`, `vitest.integration.config.ts` present. Tests run with `vitest`. ESLint config present |
| T004 | Initialize Prisma ORM | ✅ COMPLETE | `backend/prisma/schema.prisma` with 60+ models, `prisma generate` works, `PrismaClient` initialized in `server.js` |
| T005 | Local PostgreSQL via docker-compose | ✅ COMPLETE | `docker-compose.yml` at root has `postgres:16-alpine` service with healthcheck |

## Phase 2: Foundational (Blocking Prerequisites)

### Backend cross-cutting infrastructure

| ID | Task | Status | Evidence |
|----|------|--------|----------|
| T006 | Standard error envelope + global exception filter | ⚠️ PARTIAL | `errorHandler.js` middleware exists but uses simple `{ error: string }` format, NOT the strict `{ code, message, details?, correlationId }` envelope from contract |
| T007 | Correlation-ID middleware | ❌ MISSING | No `correlation.middleware.ts` or equivalent. `monitor.js` middleware tracks requests but doesn't generate/propagate correlation IDs |
| T008 | Idempotency-Key interceptor | ❌ MISSING | No idempotency interceptor. No idempotency-key store table in Prisma schema |
| T009 | Auth (JWT) + RBAC guard + role model | ⚠️ PARTIAL | JWT auth implemented in `middleware/auth.js` and `services/auth-engine.js`. Roles: super_admin, admin, operator, billing, viewer (only 5, not 7 as specified). RBAC in `middleware/security.js`. No roles decorator. Project-scope claims not enforced |
| T010 | Append-only audit log service + interceptor | ⚠️ PARTIAL | `auditLog()` function in `middleware/security.js` writes to `AuditEntry` table. Before/after snapshots NOT captured. Correlation ID NOT present |
| T011 | Wire API versioning `/api/v1`, OpenAPI serving | ❌ MISSING | Routes mount at `/api/`, not `/api/v1`. No OpenAPI/Swagger setup. No `@nestjs/swagger` |
| T012 | Build contract-test harness against YAML | ❌ MISSING | No contract test harness. Tests in `tests/unit/` are engine-level unit tests, not contract tests against the YAML spec |

### PostgreSQL schema/migrations

| ID | Task | Status | Evidence |
|----|------|--------|----------|
| T013 | Migrations: Project, LocationNode, Customer, CustomerUnitAssignment | ⚠️ PARTIAL | `Customer` model exists. `Project` model exists (simplified). No `LocationNode` (no hierarchy table). No `LocationZone`, `UnitType` tables. No `tax_enabled`/`tax_rate` on Project |
| T014 | Migrations: Meter, SIMCard, MeterAssignment, SIMAssignment | ⚠️ PARTIAL | `Meter` model exists. `MeterAssignment` exists. No `SIMCard` or `SIMAssignment` models. No `parent_main_Meter_Verse_id` |
| T015 | Migrations: Reading, ReadingReview, TariffPlan, BillingPeriod | ⚠️ PARTIAL | `Reading` model exists. `Tariff` model exists (with rates and tiers). `BillCycle`/`BillRun` models exist. No `ReadingReview` model. No `BillingPeriod` model. No `raw_payload` jsonb on Reading |
| T016 | Migrations: Invoice, InvoiceLine, InvoiceAdjustment | ⚠️ PARTIAL | `Invoice` model exists with `InvoiceItem` (line items). No `InvoiceAdjustment` model. No `immutable_at` field. No utility_type enum |
| T017 | Migrations: Payment, PaymentAllocation, CustomerLedgerEntry | ⚠️ PARTIAL | `Payment` model exists. `PaymentTransaction` links payments to invoices (basic allocation). No `CustomerLedgerEntry` model (but queried inline). No `running_balance` |
| T018 | Migrations: AuditLog, ReportJob | ✅ COMPLETE | `AuditEntry` model exists. `ExportJob`, `ReportDefinition`, `ScheduledReport` models exist for reports |
| T019 | Derived views (customer_statement_view, etc.) | ❌ MISSING | No migration for derived views. No `customer_statement_view`, `Meter_Verse_assignment_active_view`, or `sim_assignment_active_view` |

### Frontend Sprint 0

| ID | Task | Status | Evidence |
|----|------|--------|----------|
| T020 | FE-001 API client foundation | ✅ COMPLETE | `src/lib/api-client.ts` exists with `apiClient()` and `apiBackend()` functions, token attachment, error handling |
| T021 | FE-002 React Query integration pattern | ✅ COMPLETE | `src/lib/query-client.ts` exists with `getQueryClient()`. Features use `queries.ts` → `service.ts` → `types.ts` pattern (e.g., products, users) |
| T022 | FE-003 Feature-flag toggles for API migration | ❌ MISSING | No `feature-flags.ts` in `src/lib/`. Feature flags exist only as API-proxied admin page, not as client-side toggles for mock vs API |

## Phase 3: User Story 1 — Manage Meter and Location Assignments

### Tests

| ID | Task | Status | Evidence |
|----|------|--------|----------|
| T023 | Contract test `assignMeter` (200 + 409) | ❌ MISSING | No contract test files found |
| T024 | Contract test `terminateMeter` + `getSimEligibility` | ❌ MISSING | No contract test files found |
| T025 | Integration test — assignment conflict | ❌ MISSING | No integration test for assignment conflict |
| T026 | Integration test — SIM reuse after termination | ❌ MISSING | No SIM reuse test. No SIM module at all |

### Backend Implementation

| ID | Task | Status | Evidence |
|----|------|--------|----------|
| T027 | Projects module (CRUD + status + tax/threshold) | ⚠️ PARTIAL | Basic `Project` model exists. No `tax_enabled`/`tax_rate`/`reading_threshold_profile_id`/`water_difference_mode` columns |
| T028 | Locations module (CRUD over LocationNode hierarchy) | ❌ MISSING | No LocationNode model. No locations module |
| T029 | Customers module + CustomerUnitAssignment | ⚠️ PARTIAL | `customers.js` route has CRUD. `MeterAssignment` links meters to customers. No `CustomerUnitAssignment` (no Unit model) |
| T030 | Meters module (CRUD + status lifecycle) | ✅ COMPLETE | `meters.js` route has full CRUD with serial, type, location, status, area. Audit logging on all operations |
| T031 | SIM module (CRUD + eligibility endpoint) | ❌ MISSING | No SIMCard model. No SIM routes. No SIM eligibility endpoint |
| T032 | Assignment command + POST /meters/{meterId}/assign | ⚠️ PARTIAL | `meter-assignments.js` route has POST to create assignments. Not scoped under `/meters/{meterId}/assign` — it's a separate resource. No transactional atomicity guarantee |
| T033 | Termination command + POST /meters/{meterId}/terminate (SIM reuse) | ❌ MISSING | No termination command. DELETE on meter-assignments sets status to "ended" but no SIM reuse (no SIM module) |
| T034 | Dashboard summary endpoints | ❌ MISSING | No `dashboard.js` route. No KPI/summary endpoints |

### Frontend US1

| ID | Task | Status | Evidence |
|----|------|--------|----------|
| T035 | FE-010 Projects + Locations API migration | ❌ MISSING | No Projects or Locations frontend pages |
| T036 | FE-011 Customers API migration | ⚠️ PARTIAL | `dashboard/customers/page.tsx` uses `GenericAdminPage` with `pageConfigs.customers`. Table-based, no detail page |
| T037 | FE-012 Dashboard KPI backend wiring | ❌ MISSING | Dashboard exists but uses Clerk demo data (products overview), not backend KPI data |
| T038 | FE-020 Meters + SIM cards API migration | ⚠️ PARTIAL | `dashboard/meters/page.tsx` uses `GenericAdminPage` with `pageConfigs.meters`. No SIM cards page |
| T039 | FE-021 Meter assignment workflow hardening | ❌ MISSING | No MeterAssignPage component |
| T040 | FE-022 Meter replacement + termination workflow | ❌ MISSING | No MeterReplacePage or MeterTerminatePage |
| T041 | FE-023 SIM cooldown + reuse eligibility UI | ❌ MISSING | No SIM module at all |
| T042 | US1 frontend batch validation + graph refresh | ❌ MISSING | No batch validation task completed |

## Phase 4: User Story 2 — Capture Readings and Calculate Consumption

### Tests

| ID | Task | Status | Evidence |
|----|------|--------|----------|
| T043 | Contract test `createReading` (201 + 422) | ❌ MISSING | No contract tests |
| T044 | Contract test `listReadingReviewQueue` | ❌ MISSING | No contract tests |
| T045 | Integration test — reading validation thresholds | ❌ MISSING | No reading validation integration test |

### Backend Implementation

| ID | Task | Status | Evidence |
|----|------|--------|----------|
| T046 | Project threshold-profile config | ❌ MISSING | No `threshold.service.ts`. No `ReadingThreshold` model connected to projects |
| T047 | Readings module + POST /readings (consumption calc + validation) | ⚠️ PARTIAL | `readings.js` route has CRUD. No consumption calculation logic. No status auto-flagging. No unique `(meter,reading_at,source)` enforcement |
| T047a | Automatic polling ingestion adapter | ❌ MISSING | No `polling/` directory. No poller service |
| T048 | Review queue GET /readings/review-queue | ❌ MISSING | No review queue endpoint. No reading review queue query |
| T048a | Water balance variance service | ❌ MISSING | No `water-balance/` directory. No variance computation |
| T049 | FE-030 Readings API migration | ⚠️ PARTIAL | `dashboard/readings/page.tsx` uses `GenericAdminPage` with `pageConfigs.readings`. No detail/new-reading pages |
| T050 | FE-031 Reading schema + business validation | ❌ MISSING | No zod schema for readings. No monotonic/duplicate checks |
| T051 | FE-032 Anomaly review queue | ❌ MISSING | No review queue tab |
| T051a | Water balance UI migration | ❌ MISSING | No water balance page |
| T052 | US2 frontend batch validation | ❌ MISSING | Not completed |

## Phase 5: User Story 3 — Generate Invoices, Record Payments, Track Balance

### Tests

| ID | Task | Status | Evidence |
|----|------|--------|----------|
| T053 | Contract test `generateInvoices` + `issueInvoice` | ❌ MISSING | No contract tests |
| T054 | Contract test `addInvoiceAdjustment` | ❌ MISSING | No contract tests |
| T055 | Contract test `createPayment` + `reversePayment` | ❌ MISSING | No contract tests |
| T056 | Contract test `getCustomerStatement` | ❌ MISSING | No contract tests |
| T057 | Integration test — invoice immutability | ❌ MISSING | No integration test |
| T058 | Integration test — oldest-due-first allocation | ❌ MISSING | No integration test |
| T059 | Integration test — super-admin-only reversal | ❌ MISSING | No integration test |
| T060 | Integration test — ledger running balance | ❌ MISSING | No integration test |

### Backend Implementation

| ID | Task | Status | Evidence |
|----|------|--------|----------|
| T061 | Tariff + billing-period module | ⚠️ PARTIAL | `tariffs.js` route has CRUD + calculate endpoint. Tariff model supports rates and tiers. No BillingPeriod model. BillCycle/BillRun models exist |
| T062 | Invoice generation POST /invoices/generate | ✅ COMPLETE | `invoices.js` route has `/generate` endpoint that creates invoices from meter readings and tariffs. Creates InvoiceItems |
| T062a | Water difference handling in invoice generation | ❌ MISSING | No water-difference policy. No variance billing |
| T063 | Invoice issue POST /invoices/{id}/issue (immutability) | ❌ MISSING | No issue endpoint. Invoices are created directly, no issue/immutability flow |
| T064 | Invoice adjustments POST /invoices/{id}/adjustments | ❌ MISSING | No adjustments endpoint |
| T065 | Payments POST /payments (oldest-due-first allocation) | ✅ COMPLETE | `payments.js` route has POST with transaction that allocates oldest-due-first. Creates PaymentTransactions. Handles overpayment as credit |
| T066 | Payment reversal POST /payments/{id}/reverse | ⚠️ PARTIAL | `payments.js` has reverse endpoint but only checks `payments.*` permission, NOT super_admin guard. Reversal logic exists but permits non-super-admin |
| T067 | Ledger service + GET /customers/{id}/statement | ✅ COMPLETE | `payments.js` has `/customers/:id/statement` with aging calculation. No separate Ledger service but inline computation |

### Frontend US3

| ID | Task | Status | Evidence |
|----|------|--------|----------|
| T068 | FE-040 Invoices API migration + state machine | ⚠️ PARTIAL | `dashboard/invoices/page.tsx` uses `GenericAdminPage` with `pageConfigs.invoices`. No lifecycle state machine (draft/review/issue/cancel) |
| T069 | FE-041 Payments allocation workflow | ⚠️ PARTIAL | No `PaymentsPage.tsx` component in billing. Admin has `/payments` page via GenericAdminPage |
| T070 | FE-042 Balances aging + collector tooling | ❌ MISSING | No BalancesPage |
| T071 | FE-043 Customer statements v1 | ❌ MISSING | No statement tab in customer detail |
| T071a | Consumption view migration | ❌ MISSING | No ConsumptionPage |
| T072 | US3 frontend batch validation | ❌ MISSING | Not completed |

## Phase 6: Polish & Cross-Cutting Concerns

| ID | Task | Status | Evidence |
|----|------|--------|----------|
| T073 | Report export jobs POST /reports/exports | ⚠️ PARTIAL | `reports.js` route has `/export` endpoint with CSV export for 6 report types. No async job lifecycle (queued→running→completed/failed). No PDF/XLSX |
| T074 | Contract test report endpoints | ❌ MISSING | No contract tests |
| T075 | RBAC action-gating + audit coverage tests | ❌ MISSING | No RBAC integration test |
| T076 | FE-050 Reports v2 with async exports | ❌ MISSING | No reports frontend page |
| T077 | FE-051 Action-level permission gating | ❌ MISSING | No `can(action,resource)` helper in frontend |
| T078 | FE-052 Alerts → Tickets linkage | ❌ MISSING | (Marked OUT OF MVP SCOPE) |
| T079 | FE-060 Frontend contract + integration tests in CI | ❌ MISSING | No frontend contract/integration tests |
| T080 | FE-061 E2E coverage expansion | ❌ MISSING | No Playwright E2E specs |
| T081 | FE-062 Observability + UX resilience | ❌ MISSING | No error boundaries, correlation ID UI |
| T082 | Polish frontend batch validation + graph refresh | ❌ MISSING | Not completed |
| T083 | Reconcile full backend contract suite against YAML | ❌ MISSING | No contract suite exists |
| T084 | Run quickstart.md MVP acceptance validation | ❌ MISSING | Not completed |
| T084a | Backup/restore drill + RPO/RTO verification | ❌ MISSING | No ops scripts |
| T085 | Ratify project constitution | ❌ MISSING | No constitution file |

## Phase 7: Governance & Remediation (T200-T216)

| ID | Task | Status | Evidence |
|----|------|--------|----------|
| T200 | Create SYSTEM_DNA.md | ❌ MISSING | Not found at `reports/SYSTEM_DNA.md` |
| T201 | PDF Generation Engine | ❌ MISSING | No `backend/src/pdf/` directory |
| T202 | Template Engine V3 (NestJS Port) | ❌ MISSING | No `backend/src/templates/` directory |
| T203 | Bill Cycle Governance (OPEN→CLOSE→CANCEL) | ✅ COMPLETE | `billing.js` route has POST `/runs/:id/close` and `/runs/:id/cancel`. Complete lifecycle |
| T204 | Fix Customer/Unit Resolution | ❌ MISSING | Invoice generation uses customerId from request, not active assignment lookup |
| T205 | Wire Meter Detail Page to Live API | ❌ MISSING | No meter detail page. Only GenericAdminPage list view |
| T206 | DB Unique Constraint for Invoice Dedup | ❌ MISSING | No unique constraint on (meter_id, billing_period_id, utility_type) |
| T207 | Cancel Invoice Endpoint | ✅ COMPLETE | `billing.js` route has POST `/invoices/:id/cancel` with reason, audit, high-risk guard |
| T208 | Safe Invoice Regeneration (CANCEL+CREATE) | ❌ MISSING | Not implemented |
| T209 | SSL/HTTPS Configuration | ❌ MISSING | Not configured |
| T210 | Monitoring and Alerting | ❌ MISSING | No Sentry, no monitoring dashboard |
| T211 | Provision Production Environment | ❌ MISSING | Not provisioned |
| T212 | QR Code Generation | ❌ MISSING | No QR service |
| T213 | Invoice Hash/Verification Code | ❌ MISSING | No hash service |
| T214 | Invoice Due Date | ✅ COMPLETE | `invoices.js` generates dueDate = 30 days from creation. `payments.js` uses dueDate for aging |
| T215 | RTL/Responsive Playwright Tests | ❌ MISSING | No Playwright tests |
| T216 | Scheduled Backup Automation | ❌ MISSING | No backup automation |

## Phase 0 (v2.0): Foundation (T086-T120)

| ID | Task | Status | Evidence |
|----|------|--------|----------|
| T086 | Create Core DB schema (15 tables) | ⚠️ PARTIAL | Core tables exist (User, Role, Permission, AuditEntry, etc.) but in single schema, not separate `core` schema. No BankAccount, PaymentCenter, Holiday, LocationZone, UnitType, CustomerGroup, Settlement |
| T087 | Create Features DB schema (36 tables, 7 domains) | ❌ MISSING | All tables in single `public` schema. No separate `features` schema. No 36-table migration |
| T088 | Create Area DB template (45 tables) | ❌ MISSING | No per-area template. Single unified schema |
| T089 | Implement 16-profile RBAC with area middleware | ❌ MISSING | Only 5 roles exist. No area middleware |
| T090 | i18n engine: 676 AR/EN keys | ⚠️ PARTIAL | `next-intl` configured with `en`/`ar` locales. Messages files exist at `messages/`. Key count unknown |
| T091 | Symbiot bridge: 10 TCP × 100 HTTP multiplex | ❌ MISSING | No `symbiot/` directory |
| T092 | 3 availability plans (Full/Safety/Failover) | ❌ MISSING | No availability module |
| T093 | Customer page (3×5 business cards design) | ❌ MISSING | Uses GenericAdminPage table. No business card grid |
| T094 | Meter page (type icons, relay signals, 11 actions) | ❌ MISSING | Uses GenericAdminPage table. No type icons, no relay signals, no 11 actions |
| T095 | Balances page (5 tabs: Water/Electric/Solar/Chilled/Gas) | ❌ MISSING | No balances page |
| T096 | Payments page (search → history → pay flow) | ❌ MISSING | Uses GenericAdminPage. No payment flow UI |
| T097 | Invoices page (preview + pay + delete + under review) | ❌ MISSING | Uses GenericAdminPage. No preview/pay/delete UI |
| T098 | Readings page (unified + quarantine + solar wallet) | ❌ MISSING | Uses GenericAdminPage. No quarantine, no solar wallet |
| T099 | Meter Lifecycle + Data Hub (4-stage) | ❌ MISSING | No lifecycle module |
| T100 | Tariffs page (unified with charges + measurement points) | ❌ MISSING | No tariffs frontend page |
| T101 | Workspace (alerts + tickets + assign requests) | ❌ MISSING | No workspace module |
| T102 | 32 reports (port 93 JasperReports) | ❌ MISSING | Only 6 report types via reports.js export endpoint |
| T103 | Admin + Superadmin merged page | ⚠️ PARTIAL | Extensive admin pages (59 routes) but mostly table-based CRUD |
| T104 | Locations page (renamed units + smart search) | ❌ MISSING | No locations page |
| T105 | Login page (Meter Verse theme, role redirect) | ❌ MISSING | Uses Clerk auth pages, not custom Meter Verse login |
| T106 | Dashboard (per-area KPIs + 5 Recharts) | ❌ MISSING | Uses Clerk demo products dashboard. No per-area KPI cards, no Recharts |
| T107-T111 | Data Migration tasks | ❌ MISSING | No migration scripts |
| T112-T116 | Quality tasks (Security, Load, Cert, CI/CD) | ❌ MISSING | No security audit, load tests, CI/CD |
| T117-T120 | Launch tasks (Deploy, Cutover, Docs, Monitoring) | ❌ MISSING | Not executed |

---

## Summary Statistics

| Classification | Count | Percentage |
|---------------|-------|------------|
| ✅ COMPLETE | 12 | 10.3% |
| ⚠️ PARTIAL | 18 | 15.4% |
| ❌ MISSING | 68 | 58.1% |
| 🔄 WRONG ARCH | 1 | 0.9% |
| 📋 PLANNED | 0 | 0.0% |
| OUT OF SCOPE | 1 | 0.9% |
| **TOTAL VERIFIED** | **100** | — |
| TOTAL IN DOCUMENT | ~216 | — |

### By Phase Breakdown

| Phase | Total | ✅ | ⚠️ | ❌ | 🔄 |
|-------|-------|---|---|---|---|
| P1: Setup (T001-T005) | 5 | 4 | 0 | 0 | **1** |
| P2: Foundational (T006-T022) | 17 | 4 | 5 | **8** | 0 |
| P3: US1 (T023-T042) | 20 | 1 | 4 | **15** | 0 |
| P4: US2 (T043-T052) | 12 | 0 | 2 | **10** | 0 |
| P5: US3 (T053-T072) | 20 | 3 | 6 | **11** | 0 |
| P6: Polish (T073-T085) | 13 | 0 | 1 | **12** | 0 |
| P7: Governance (T200-T216) | 17 | 3 | 0 | **14** | 0 |
| P0 v2: Foundation (T086-T090) | 5 | 0 | 3 | **2** | 0 |
| P1 v2: Infrastructure (T091-T092) | 2 | 0 | 0 | **2** | 0 |
| P2 v2: Core Pages (T093-T098) | 6 | 0 | 0 | **6** | 0 |
| P3 v2: Features (T099-T106) | 8 | 0 | 1 | **7** | 0 |
| P4 v2: Migration (T107-T111) | 5 | 0 | 0 | **5** | 0 |
| P5 v2: Quality (T112-T116) | 5 | 0 | 0 | **5** | 0 |
| P6 v2: Launch (T117-T120) | 4 | 0 | 0 | **4** | 0 |

---

## Top 10 Most Important MISSING Tasks

Ranked by business impact and dependency criticality:

1. **T009 (expanded) — 16-profile RBAC with area middleware (T089)** — Current 5-role system insufficient for enterprise deployment. Blocks all multi-area operation.

2. **T032/T033 — Meter assignment + termination with SIM lifecycle** — Core US1 workflow. Without proper assignment transaction and termination+SIM reuse, the primary business flow is broken.

3. **T028 — Locations module (LocationNode hierarchy)** — Required for FR-001 (location management). No hierarchical location data means no area/zone/building/floor/unit structure.

4. **T091 — Symbiot bridge (10 TCP × 100 HTTP multiplex)** — Critical for production meter reading ingestion. Without this, automatic readings from field devices cannot be ingested.

5. **T201/T202 — PDF Generation Engine + Template Engine** — Required for invoice/statement PDF generation. Business requirement for all billing operations.

6. **T048a — Water balance variance service** — FR-009 requirement. Main-vs-sub meter variance computation is a regulatory/compliance feature.

7. **T047a — Automatic polling ingestion adapter** — Required for scheduled automatic readings. Without this, all readings must be entered manually.

8. **T046 — Project threshold-profile config** — FR-008 requirement. Per-project reading validation thresholds are needed for consumption flagging.

9. **T067 expanded — Customer statement with proper running ledger** — Current inline computation in payments.js lacks the formal `CustomerLedgerEntry` table with append-only running balance (FR-014, SC-004).

10. **T090 — i18n engine with 676 AR/EN keys** — Required for bilingual operation. Current next-intl setup is minimal scaffolding without full UI string coverage.

---

## Recommended Execution Order: Next 5 Implementation Sessions

### Session 1: Foundation Fixes (Critical Path Unblockers)

**Focus**: Complete the core data model and RBAC to unblock all downstream work.

```
1. T089 — Expand RBAC to 16 profiles + area middleware
2. T028 — Implement LocationNode hierarchy model + CRUD
3. T014 extended — Add SIMCard + SIMAssignment models
4. T013 extended — Add tax_enabled/tax_rate/water_difference_mode to Project
5. T032 — Rewrite meter assign as transactional command with SIM assignment
6. T033 — Implement termination command with SIM reuse
```

### Session 2: Reading Pipeline + Validation

**Focus**: Build the complete reading ingestion pipeline with automatic flagging.

```
7. T046 — Project threshold-profile config with ReadingThreshold model
8. T047 — Enhance readings module: consumption calc, auto-flagging, unique constraint
9. T047a — Build polling adapter interface + scheduler
10. T048 — Build review queue query with status filters
11. T048a — Water balance variance service (FR-009)
```

### Session 3: Invoice Lifecycle + Payment Compliance

**Focus**: Complete US3 with invoice immutability, adjustments, and proper ledger.

```
12. T063 — Invoice issue endpoint with immutable_at + high-risk approval (FR-019)
13. T064 — Invoice adjustments endpoint (credit/debit with audit)
14. T066 — Fix payment reversal: add super_admin guard (FR-013)
15. T067 — Build proper LedgerService with CustomerLedgerEntry table (FR-014)
16. T206 — Add DB unique constraint for invoice dedup
17. T208 — Safe invoice regeneration (CANCEL+CREATE)
```

### Session 4: PDF Engine + Templates

**Focus**: Port the template engine and PDF generation for invoice/statement output.

```
18. T202 — Template Engine: port Jinja2 templates to NestJS-compatible system
19. T201 — PDF Engine: implement PDF generation with Arabic RTL + QR codes
20. T212 — QR code generation for invoice verification
21. T213 — Invoice hash/verification code (SHA-256)
22. T214 — Invoice due_date calculation from project payment terms
```

### Session 5: Symbiot Bridge + Frontend Polish

**Focus**: Production connectivity and remaining major frontend gaps.

```
23. T091 — Symbiot bridge: 10 TCP channels × 100 HTTP multiplex
24. T204 — Fix customer/unit resolution in invoice generation
25. T076 — Reports v2 frontend with async export tracking
26. T205 — Wire meter detail page to live API (remove mock)
27. T068 — Invoice lifecycle frontend state machine (draft→review→issue→cancel)
28. T069 — Payment allocation workflow frontend
```

---

## Notes

- **NestJS vs Express.js**: The codebase uses Express.js. All tasks referencing NestJS-specific patterns (modules, decorators, guards, interceptors, `@nestjs/*` packages) are marked 🔄 WRONG ARCH or functionally replaced with Express.js equivalents.
- **Clerk Auth**: Frontend uses Clerk for authentication, not the custom JWT from the backend. Backend JWT auth exists but is disconnected from the Clerk-based frontend.
- **GenericAdminPage**: Many frontend pages use a generic table component rather than custom-built UIs. This satisfies basic CRUD visibility but lacks the detailed workflow UIs described in US1-US3 frontend tasks.
- **Single Schema**: All Prisma models are in the default `public` schema, not multi-schema as described in T086-T088.
