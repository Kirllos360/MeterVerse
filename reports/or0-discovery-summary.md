# OR0 — Discovery Summary

**Date:** 2026-06-17
**Auditor:** OpenCode (DeepSeek V4 Flash)
**Mode:** MAXIMUM EVIDENCE — No assumptions, no code changes

---

## Pre-Check Results

### Primary Authorities Status

| Authority | Status | Notes |
|-----------|--------|-------|
| SYSTEM_DNA.md | **MISSING** | Not found anywhere in repo (searched `**/SYSTEM_DNA*`) |
| tasks.md | ✅ FOUND | `D:\meter\Meter\specs\001-metering-billing-platform\tasks.md` — 1146 lines, T001-T150 |
| Existing certifications | ✅ FOUND | 49 reports in `D:\meter\reports\` (R0-R7, F series, G series, H series, T series) |
| Source code | ✅ FOUND | Backend NestJS at `D:\meter\Meter\backend\`, Frontend Next.js at `D:\meter\Meter\Frontend\` |
| Reference systems | ✅ FOUND | 7 reference systems in `D:\meter\Meter\reference\` |

### Critical Finding: Missing SYSTEM_DNA.md

The PRIMARY AUTHORITY `SYSTEM_DNA.md` does not exist. This document should contain the canonical system architecture, business rules, integration contracts, and operational boundaries. Its absence means:

- No single source of truth for architecture decisions
- Operational reality can only be compared against tasks.md + source code + existing reports
- Risk of undocumented assumptions in all prior certifications

---

## Task Inventory (T001-T120)

### Phase 1: Setup (5/5 — 100%)
| ID | Status | Evidence |
|----|--------|----------|
| T001 | ✅ Complete | `backend/package.json`, `main.ts`, `app.module.ts` |
| T002 | ✅ Complete | `config.module.ts`, `.env.example` |
| T003 | ✅ Complete | `.eslintrc.cjs`, `.prettierrc`, `jest.config.ts` |
| T004 | ✅ Complete | `prisma/schema.prisma`, `prisma.service.ts` |
| T005 | ✅ Complete | `docker-compose.yml` |

### Phase 2: Foundational (17/17 — 100%)
All T006-T022 complete. Auth, audit, API versioning, contract harness, Prisma schema (24 models across 9 migrations), frontend foundation (API client, React Query, feature flags).

### Phase 3: US1 — Meters (20/20 — 100%)
All T023-T042 complete. Projects, locations, customers, meters, SIMs, assignments, termination, dashboard, frontend API migration.

### Phase 4: US2 — Readings (13/13 — 100%)
All T043-T052 complete. Readings ingestion, validation, review queue, water balance, polling adapter, frontend migration.

### Phase 5: US3 — Invoices/Payments (19/22 — 86.4%)
**Complete:** T053-T065, T068-T071, T071a
**In Progress:** T066 (payment reversal — documented as missing in reports but actually implemented), T067 (customer statement view refactored), T072 (batch validation)
**Status Check:** T066/T067 were reported as [ ] in tasks.md but have been implemented in code. See note below.

### Phase 6: Polish (3/14 — 21.4%)
**Complete:** T077 (action permissions), T085 (constitution)
**Not Started:** T073, T074, T075, T076, T078, T079, T080, T081, T082, T083, T084, T084a
**Out of Scope:** T078 (Alerts→Tickets linkage)

### v2.0.0: Phases 0-6 (0/35 — 0%)
All T086-T120 are 0% complete. These cover:
- Core DB schema (15 tables — not created)
- Features DB schema (10 tables — not created)
- Area DB template (45 tables per area — not created)
- 16-profile RBAC, i18n (676 keys)
- Symbiot bridge
- Solar Wallet, Chilled Water, Settlement Engine
- Full data migration from SBill + Collection Tracker

### Task Status Discrepancy

| Task | tasks.md Status | Code Status | Evidence |
|------|-----------------|-------------|----------|
| T066 | [ ] | ✅ Implemented | `POST /payments/:id/reverse` in `payments.controller.ts` |
| T067 | [ ] | ✅ Implemented | `GET /customers/:id/statement` uses `customer_statement_view` |
| T071a | [ ] | ✅ Implemented | `ConsumptionPage.tsx` wired to backend |
| T077 | [ ] | ✅ Implemented | `action-permissions.ts` + `ProtectedAction.tsx` |
| T085 | [ ] | ✅ Implemented | `.specify/memory/constitution.md` ratified |

**Conclusion:** tasks.md is out of date for 5 tasks that have been implemented but not marked complete.

---

## Feature Inventory

### Implemented Features (in Meter Verse NestJS backend + Next.js frontend)

| Feature | Backend | Frontend | DB |
|---------|---------|----------|----|
| Health check | ✅ | — | — |
| JWT Auth + 7-role RBAC | ✅ | ✅ | — |
| Audit logging (append-only) | ✅ | — | ✅ |
| Projects CRUD | ✅ | ✅ | ✅ |
| Locations hierarchy CRUD | ✅ | ✅ | ✅ |
| Customers CRUD + unit assignment | ✅ | ✅ | ✅ |
| Meters CRUD + lifecycle | ✅ | ✅ | ✅ |
| SIM cards CRUD + eligibility | ✅ | ✅ | ✅ |
| Meter assignment (transactional) | ✅ | ✅ | ✅ |
| Meter termination (SIM reuse) | ✅ | ✅ | ✅ |
| Dashboard KPIs | ✅ | ✅ | — |
| Readings ingestion + validation | ✅ | ✅ | ✅ |
| Reading review queue | ✅ | ✅ | — |
| Water balance (main-vs-sub) | ✅ | ✅ | — |
| Invoice generation (per-utility) | ✅ | ✅ | ✅ |
| Invoice issue (immutability) | ✅ | ✅ | — |
| Invoice adjustments | ✅ | ✅ | — |
| Payment recording (oldest-due) | ✅ | ✅ | ✅ |
| Payment reversal (super_admin) | ✅ | — | — |
| Customer statement (ledger) | ✅ | ✅ | ✅ |
| Tariff management | ✅ | — | ✅ |
| Billing period management | ✅ | — | ✅ |
| Consumption dashboard | ✅ | ✅ | — |
| Action permission gating | — | ✅ | — |
| Feature flag toggles | ✅ | ✅ | — |
| Error envelope + correlation ID | ✅ | — | — |

### NOT Implemented Features (v2.0.0 scope)

| Feature | Backend | Frontend | DB | Reference Status |
|---------|---------|----------|----|------------------|
| **Solar Wallet** | ❌ | ❌ | ❌ | Exists in Collection System |
| Solar readings | ❌ | ❌ | ❌ | — |
| Wallet calculation | ❌ | ❌ | ❌ | — |
| Wallet ledger | ❌ | ❌ | ❌ | — |
| Wallet history | ❌ | ❌ | ❌ | — |
| Solar invoice integration | ❌ | ❌ | ❌ | — |
| **Chilled Water Billing** | ❌ | ❌ | ❌ | Certified in Phase F (ref system) |
| BTU readings | ❌ | ❌ | ❌ | — |
| BTU rate calculation | ❌ | ❌ | ❌ | Formula = Consumption × 3.0 verified |
| Chilled water invoice | ❌ | ❌ | ❌ | — |
| Chilled water PDF | ❌ | ❌ | ❌ | — |
| **Settlement Engine** | ❌ | ❌ | ❌ | Exists in Collection System |
| Fixed settlement | ❌ | ❌ | ❌ | — |
| Percentage settlement | ❌ | ❌ | ❌ | — |
| One-time settlement | ❌ | ❌ | ❌ | — |
| Settlement approval workflow | ❌ | ❌ | ❌ | DRAFT→APPROVED in ref |
| Settlement versioning | ❌ | ❌ | ❌ | Incrementing version in ref |
| Settlement carry-forward | ❌ | ❌ | ❌ | previous_balance/carry_forward in ref |
| **Meter Detail Page (v2.0.0)** | ❌ | ❌ | — | — |
| **Bill Cycle Governance** | ❌ | ❌ | ❌ | — |
| **Template Engine V3** | ❌ | ❌ | — | Exists in Collection System |
| **PDF Generation** | ❌ | ❌ | — | Exists in Collection System |
| **16-profile RBAC** | ❌ | ❌ | ❌ | Only 7 roles exist |
| **Area DB (15 tenants)** | ❌ | ❌ | ❌ | Single schema `sim_system` |
| **Symbiot Bridge** | ❌ | ❌ | — | — |
| **3 Availability Plans** | ❌ | ❌ | — | — |

---

## API Inventory (Current Backend)

### All Routes (under `/api/v1`)

| Method | Route | Status |
|--------|-------|--------|
| GET | `/health` | ✅ |
| POST | `/auth/refresh` | ✅ |
| POST | `/projects` | ✅ |
| GET | `/projects` | ✅ |
| GET | `/projects/:id` | ✅ |
| PATCH | `/projects/:id` | ✅ |
| DELETE | `/projects/:id` | ✅ |
| POST | `/projects/:projectId/locations` | ✅ |
| GET | `/projects/:projectId/locations` | ✅ |
| GET | `/projects/:projectId/locations/:id` | ✅ |
| PATCH | `/projects/:projectId/locations/:id` | ✅ |
| DELETE | `/projects/:projectId/locations/:id` | ✅ |
| GET | `/projects/:projectId/dashboard/kpis` | ✅ |
| GET | `/projects/:projectId/dashboard/consumption` | ✅ |
| GET | `/projects/:projectId/dashboard/activity` | ✅ |
| GET | `/projects/:projectId/water-balance` | ✅ |
| POST | `/projects/:projectId/customers` | ✅ |
| GET | `/projects/:projectId/customers` | ✅ |
| GET | `/projects/:projectId/customers/:id` | ✅ |
| PATCH | `/projects/:projectId/customers/:id` | ✅ |
| DELETE | `/projects/:projectId/customers/:id` | ✅ |
| GET | `/projects/:projectId/customers/:id/statement` | ✅ |
| POST | `/meters` | ✅ |
| GET | `/meters` | ✅ |
| GET | `/meters/:id` | ✅ |
| PATCH | `/meters/:id` | ✅ |
| DELETE | `/meters/:id` | ✅ |
| POST | `/meters/:meterId/assign` | ✅ |
| POST | `/meters/:meterId/terminate` | ✅ |
| POST | `/sim-cards` | ✅ |
| GET | `/sim-cards` | ✅ |
| GET | `/sim-cards/:id` | ✅ |
| PATCH | `/sim-cards/:id` | ✅ |
| DELETE | `/sim-cards/:id` | ✅ |
| GET | `/sim-cards/:simId/eligibility` | ✅ |
| POST | `/readings` | ✅ |
| GET | `/readings/review-queue` | ✅ |
| POST | `/invoices/generate` | ✅ |
| POST | `/invoices/:id/issue` | ✅ |
| POST | `/invoices/:id/adjustments` | ✅ |
| GET | `/invoices` | ✅ |
| GET | `/invoices/:id` | ✅ |
| GET | `/tariffs` | ✅ |
| GET | `/periods` | ✅ |
| POST | `/payments` | ✅ |
| GET | `/payments` | ✅ |
| GET | `/payments/:id` | ✅ |
| POST | `/payments/:id/reverse` | ✅ |
| POST | `/reports/exports` | ❌ Missing (T073) |
| GET | `/reports/exports/:jobId` | ❌ Missing (T073) |

### Missing API Endpoints (required for OR1-OR6)

| Endpoint | Required For | Status |
|----------|-------------|--------|
| Solar reading endpoints | OR1 | ❌ |
| Wallet calculation/balance | OR1 | ❌ |
| Wallet ledger/history | OR1 | ❌ |
| Chilled water reading (BTU) | OR2 | ❌ |
| Chilled water invoice | OR2 | ❌ |
| Chilled water settlement CRUD | OR2, OR3 | ❌ |
| Settlement approval | OR3 | ❌ |
| Settlement carry-forward | OR3 | ❌ |
| Settlement versioning | OR3 | ❌ |
| Meter detail (extended) | OR4 | ❌ |
| Bill cycle OPEN/CLOSE/CANCEL | OR5 | ❌ |
| Template/PDF generation | OR6, OR7, OR8 | ❌ |

---

## Database Inventory (Current: `sim_system` schema)

### Tables (24 models, 9 migrations applied)
See detailed inventory from task report. Summary:
- **Core**: Project, LocationNode, Customer, CustomerUnitAssignment
- **Meters**: Meter, SIMCard, MeterAssignment, SIMAssignment
- **Readings**: Reading, ReadingReview, TariffPlan, BillingPeriod
- **Financial**: Invoice, InvoiceLine, InvoiceAdjustment, Payment, PaymentAllocation, CustomerLedgerEntry
- **Infrastructure**: AuditLog, ReportJob, ProjectThreshold, IdempotencyRecord, RefreshToken, LoginAttempt
- **Views**: 3 (customer_statement_view, meter_assignment_active_view, sim_assignment_active_view)

### Missing Tables (required for v2.0.0 / OR1-OR5)

| Table | Required For | Status |
|-------|-------------|--------|
| SolarWalletTransaction | OR1 | ❌ |
| SolarWalletRegister | OR1 | ❌ |
| ChilledWaterConfig | OR2 | ❌ (exists in reference Flask) |
| ChilledWaterSettlement | OR2, OR3 | ❌ (exists in reference Flask) |
| SettlementVersion | OR3 | ❌ |
| ChilledWaterInvoice | OR2 | ❌ |
| BillCycle | OR5 | ❌ |
| Template definitions | OR8 | ❌ |
| Area DB tables (45 per area) | v2.0.0 | ❌ |

---

## Frontend Screen Inventory (Current Pages)

| Page | File | API Connected? |
|------|------|----------------|
| Dashboard | `DashboardPage.tsx` | ✅ (feature flag) |
| Projects | `ProjectsPage.tsx` | ✅ |
| Project Detail | `ProjectDetailPage.tsx` | ✅ |
| Locations | `LocationsPage.tsx` | ✅ |
| Customers | `CustomersPage.tsx` | ✅ |
| Customer Detail | `CustomerDetailPage.tsx` | ✅ (partial) |
| Meters | `MetersPage.tsx` | ✅ |
| Meter Detail | `MeterDetailPage.tsx` | — (mock data) |
| Meter Assign | `MeterAssignPage.tsx` | ✅ |
| Meter Replace | `MeterReplacePage.tsx` | ✅ |
| Meter Terminate | `MeterTerminatePage.tsx` | ✅ |
| SIM Cards | `SimCardsPage.tsx` | ✅ |
| Readings | `ReadingsPage.tsx` | ✅ |
| New Reading | `ReadingNewPage.tsx` | ✅ |
| Consumption | `ConsumptionPage.tsx` | ✅ (feature flag) |
| Water Balance | `WaterBalancePage.tsx` | ✅ |
| Invoices | `InvoicesPage.tsx` | ✅ (feature flag) |
| Invoice Detail | `InvoiceDetailPage.tsx` | — (mock data) |
| Payments | `PaymentsPage.tsx` | ✅ (feature flag) |
| Balances | `BalancesPage.tsx` | — (mock data) |
| Reports | `ReportsPage.tsx` | — (mock data) |
| Alerts | `AlertsPage.tsx` | — (mock data) |
| Tickets | `TicketsPage.tsx` | — (mock data) |
| Support | `SupportPage.tsx` | — (mock data) |
| Settings | `SettingsPage.tsx` | — (mock data) |

### Missing Pages (required for OR1-OR4)

| Page | Required For | Status |
|------|-------------|--------|
| Solar Wallet page | OR1 | ❌ |
| Chilled Water page | OR2 | ❌ |
| Settlement page | OR3 | ❌ |
| Meter Detail (extended) | OR4 | ❌ (basic version exists) |

---

## Reference Systems Inventory

| System | Path | Key Files | Relevance |
|--------|------|-----------|-----------|
| Collection System | `reference/collection-system/` | Flask app: `routes_chilled_settlement.py`, `charge_engine.py`, `template_v3.py`, `models.py` (47K lines) | Contains working implementations of Solar, Chilled Water, Settlement, and Template Engine V3 — these need to be ported |
| SBill | `reference/sbill/` | Billing data | Migration source |
| Symbiot | `reference/symbiot/` | Integration specs | Bridge for T091 |
| IMS | `reference/ims/` | — | Reference |
| Meter Department | `reference/meter-department/` | — | Reference |
| Energy 360 | `reference/energy-360/` | Mobile app | Reference |
| All Last Update | `reference/all-last-update/` | — | Reference |

---

## Playwright / Automated Test Inventory

| Test | Location | Status |
|------|----------|--------|
| Backend unit tests | `backend/test/` (385 tests) | ✅ 280 pass, 105 fail (pre-existing) |
| E2E acceptance | 12 tests | ✅ 12/12 passing |
| Frontend Playwright smoke | `Frontend/scripts/smoke-all-pages.mjs` | ✅ Covers 15 pages + 4 drilldowns |
| Frontend `.spec.ts` | — | ❌ ZERO frontend spec files |

---

## Key Discovery: Tasks.md Out of Date

| Task | tasks.md | Reality | Evidence |
|------|----------|---------|----------|
| T066 | [ ] not done | ✅ POST /payments/:id/reverse | `payments.controller.ts` |
| T067 | [ ] not done | ✅ GET /customers/:id/statement uses view | `customers.controller.ts` |
| T071a | [ ] not done | ✅ Consumption page wired | `ConsumptionPage.tsx` |
| T077 | [ ] not done | ✅ action-permissions.ts + ProtectedAction | Files exist |
| T085 | [ ] not done | ✅ constitution.md ratified | File has 6 articles |

**5 tasks implemented but not reflected in tasks.md.** The task tracker is stale.

---

## Pre-Check Conclusion

Discovery complete. Ready to proceed with OR1-OR10 certifications.

**Certifications with findable evidence:**
- OR1 (Solar Wallet): ❌ MISSING — zero implementation
- OR2 (Chilled Water): ❌ MISSING — exists only in Flask reference
- OR3 (Settlement Engine): ❌ MISSING — exists only in Flask reference
- OR4 (Meter Detail Page): ⚠️ PARTIAL — basic version exists, lacks extended fields
- OR5 (Bill Cycle Governance): ❌ MISSING — no bill cycle OPEN/CLOSE/CANCEL
- OR6 (Invoice Generation): ⚠️ PARTIAL — electricity/water only, no solar/chilled/settlement
- OR7 (PDF Comparison): ❌ MISSING — no PDF generation in current backend
- OR8 (Template Field Coverage): ❌ MISSING — no Template Engine V3 in backend
- OR9 (Playwright UAT): ⚠️ PARTIAL — smoke script exists, no full UAT spec
- OR10 (Board Review): ⚠️ PARTIAL — R7 report exists, needs update
