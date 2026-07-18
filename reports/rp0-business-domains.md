# RP0-A — Business Domain Extraction

**Date:** 2026-06-17
**Source:** tasks.md, Prisma schema (24 models, 9 migrations), OR0-OR11 reports, Phase D-H reports, Flask Collection System reference
**Mode:** DISCOVERY ONLY — No Implementation

---

## Domain Index

| # | Domain | Status | Schema Tables | API Routes | Frontend Pages | Reference Source |
|---|--------|--------|---------------|------------|----------------|-----------------|
| 1 | **Authentication & Authorization** | ✅ IMPLEMENTED | 4 (auth-related) | 2 | Login page (existing) | tasks.md T009 |
| 2 | **RBAC (Role-Based Access Control)** | ⚠️ PARTIAL (7/16 roles) | Role enum | Roles guard | navigation.ts | tasks.md T009, T089 |
| 3 | **Audit Logging** | ✅ IMPLEMENTED | AuditLog | AuditInterceptor | — | tasks.md T010 |
| 4 | **Projects** | ✅ IMPLEMENTED | Project | 5 routes | ProjectsPage, ProjectDetailPage | tasks.md T027 |
| 5 | **Location Hierarchy** | ✅ IMPLEMENTED | LocationNode | 5 routes | LocationsPage | tasks.md T028 |
| 6 | **Customers** | ✅ IMPLEMENTED | Customer, CustomerUnitAssignment | 6 routes | CustomersPage, CustomerDetailPage | tasks.md T029 |
| 7 | **Meters** | ✅ IMPLEMENTED | Meter | 6 routes | MetersPage, MeterDetailPage | tasks.md T030 |
| 8 | **SIM Cards** | ✅ IMPLEMENTED | SIMCard | 6 routes | SimCardsPage | tasks.md T031 |
| 9 | **Meter Assignment** | ✅ IMPLEMENTED | MeterAssignment | 2 routes (assign/terminate) | MeterAssignPage, MeterTerminatePage | tasks.md T032-T033 |
| 10 | **SIM Assignment** | ✅ IMPLEMENTED | SIMAssignment | (part of meter assign) | (part of meter pages) | tasks.md T032 |
| 11 | **Dashboard** | ✅ IMPLEMENTED | — (aggregation queries) | 3 KPI routes | DashboardPage | tasks.md T034 |
| 12 | **Readings (Manual/Import)** | ✅ IMPLEMENTED | Reading | 2 routes (+ review-queue) | ReadingsPage, ReadingNewPage | tasks.md T047 |
| 13 | **Reading Validation** | ✅ IMPLEMENTED | ProjectThreshold | (threshold service) | — | tasks.md T046 |
| 14 | **Reading Review Queue** | ✅ IMPLEMENTED | ReadingReview | 1 route (GET only) | ReadingsPage (review tab) | tasks.md T048 |
| 15 | **Automatic Polling** | ✅ IMPLEMENTED | (uses Reading) | PollerService (toggle-gated) | — | tasks.md T047a |
| 16 | **Water Balance (Main-vs-Sub)** | ✅ IMPLEMENTED | — (computed) | 1 route | WaterBalancePage | tasks.md T048a, T062a |
| 17 | **Tariffs** | ✅ IMPLEMENTED | TariffPlan | 1 route (GET) | — | tasks.md T061 |
| 18 | **Billing Periods** | ⚠️ PARTIAL | BillingPeriod (status enum only) | 1 route (GET) | — | tasks.md T061, G007 |
| 19 | **Invoice Generation (Elec/Water)** | ⚠️ PARTIAL | Invoice, InvoiceLine | 3 routes (generate/issue/adjust) | InvoicesPage, InvoiceDetailPage | tasks.md T062-T064 |
| 20 | **Invoice Issue (Immutability)** | ✅ IMPLEMENTED | (immutableAt field) | 1 route | — | tasks.md T063 |
| 21 | **Invoice Adjustments** | ✅ IMPLEMENTED | InvoiceAdjustment | 1 route | — | tasks.md T064 |
| 22 | **Payments** | ✅ IMPLEMENTED | Payment | 4 routes (create/list/detail/reverse) | PaymentsPage | tasks.md T065 |
| 23 | **Payment Allocation** | ✅ IMPLEMENTED | PaymentAllocation | (part of payment creation) | (part of payments) | tasks.md T065 |
| 24 | **Payment Reversal** | ✅ IMPLEMENTED | (uses Payment) | 1 route | — | tasks.md T066 |
| 25 | **Customer Ledger** | ✅ IMPLEMENTED | CustomerLedgerEntry | 1 route (statement) | CustomerDetailPage (statement tab) | tasks.md T067 |
| 26 | **Consumption View** | ✅ IMPLEMENTED | (computed from readings) | (part of dashboard) | ConsumptionPage | tasks.md T071a |
| 27 | **Action Permission Gating** | ✅ IMPLEMENTED | — (frontend lib) | — | ProtectedAction component | tasks.md T077 |
| 28 | **Feature Flags** | ✅ IMPLEMENTED | — (frontend lib) | 1 route (GET /api/features) | (all pages) | tasks.md T022 |
| 29 | **Idempotency** | ✅ IMPLEMENTED | IdempotencyRecord | Interceptor | — | tasks.md T008 |
| 30 | **Error Envelope** | ✅ IMPLEMENTED | — | Exception filter | api/errors.ts | tasks.md T006 |
| 31 | **Correlation ID** | ✅ IMPLEMENTED | — | Middleware | — | tasks.md T007 |
| 32 | **Throttling** | ✅ IMPLEMENTED | — | ThrottlerGuard | — | app.module.ts |
| 33 | **Report Jobs** | ❌ NOT STARTED | ReportJob (table exists) | 0 routes | ReportsPage (mock data only) | tasks.md T073 |
| 34 | **Frontend Contract Tests** | ❌ NOT STARTED | — | — | — | tasks.md T079 |
| 35 | **Frontend E2E Tests** | ⚠️ PARTIAL | — | — | smoke-all-pages.mjs (25 views) | tasks.md T080 |
| 36 | **CI/CD Pipeline** | ❌ NOT STARTED | — | — | — | tasks.md T116 |
| 37 | **Solar Wallet** | ❌ MISSING | 0 tables | 0 routes | 0 pages | tasks.md T107, Flask reference |
| 38 | **Solar Readings** | ❌ MISSING | (no solar Reading model) | 0 routes | — | Flask reference |
| 39 | **Solar Register (180/280)** | ❌ MISSING | 0 tables | 0 routes | — | Flask reference |
| 40 | **Solar Invoice** | ❌ MISSING | (no solar UtilityType) | 0 routes | — | Flask reference |
| 41 | **Chilled Water (BTU) Meter** | ❌ MISSING | 0 tables | 0 routes | 0 pages | Flask reference, Phase F cert |
| 42 | **Chilled Water Reading** | ❌ MISSING | (no BTU Reading model) | 0 routes | — | Flask reference |
| 43 | **Chilled Water Config** | ❌ MISSING | 0 tables | 0 routes | — | Flask reference |
| 44 | **Chilled Water Settlement** | ❌ MISSING | 0 tables | 0 routes | 0 pages | Flask reference, Phase F cert |
| 45 | **Settlement Engine** | ❌ MISSING | 0 tables | 0 routes | 0 pages | Flask reference |
| 46 | **Settlement Approval Workflow** | ❌ MISSING | — | — | — | Flask reference |
| 47 | **Settlement Versioning** | ❌ MISSING | — | — | — | Flask reference |
| 48 | **Settlement Carry-Forward** | ❌ MISSING | — | — | — | Flask reference |
| 49 | **Bill Cycle Governance** | ❌ MISSING | BillingPeriod (status enum, no logic) | 0 governance routes | 0 pages | — |
| 50 | **Template Engine V3** | ❌ MISSING | 0 tables | 0 routes | — | Flask reference (template_v3.py) |
| 51 | **PDF Generation** | ❌ MISSING | 0 libraries | 0 routes | — | Flask reference |
| 52 | **QR Code Generation** | ❌ MISSING | 0 libraries | 0 routes | — | Flask reference |
| 53 | **Invoice Hash/Verification** | ❌ MISSING | (no hash field on Invoice) | 0 routes | — | — |
| 54 | **Amount in Words (Arabic)** | ❌ MISSING | — | — | — | Flask reference |
| 55 | **16-Profile RBAC** | ❌ MISSING | (only 7 roles exist) | — | — | tasks.md T089 |
| 56 | **i18n (676 AR/EN Keys)** | ❌ MISSING | — | — | — | tasks.md T090 |
| 57 | **15 Area Databases** | ❌ MISSING | (single sim_system schema) | — | — | tasks.md T088 |
| 58 | **Symbiot Bridge** | ❌ MISSING | 0 modules | 0 routes | — | tasks.md T091 |
| 59 | **3 Availability Plans** | ❌ MISSING | — | — | — | tasks.md T092 |
| 60 | **Meter Lifecycle (4-Stage)** | ❌ MISSING | (status enum exists, no workflow) | — | — | tasks.md T099 |
| 61 | **5 Utility Types** | ⚠️ PARTIAL | 2/5 exist (electricity, water) | — | — | — |
| 62 | **5 Charge Modes** | ❌ MISSING | (only flat ratePerUnit exists) | — | — | tasks.md T100 |
| 63 | **3 Settlement Types** | ❌ MISSING | — | — | — | Flask reference |
| 64 | **32 Reports (from Jasper)** | ❌ MISSING | ReportJob (table exists) | 0 routes | ReportsPage (mock only) | tasks.md T102 |
| 65 | **Security Audit** | ❌ NOT STARTED | — | — | — | tasks.md T112 |
| 66 | **Load Testing** | ❌ NOT STARTED | — | — | — | tasks.md T113 |
| 67 | **SSL/HTTPS** | ❌ NOT STARTED | — | — | — | G019 |
| 68 | **Production Environment** | ❌ NOT STARTED | — | — | — | G021 |
| 69 | **Monitoring/Alerting** | ❌ NOT STARTED | — | — | — | G020 |
| 70 | **Backup Automation** | ❌ NOT STARTED | — | — | — | G032 |
| 71 | **Constitution (Governance)** | ✅ IMPLEMENTED | — | — | — | tasks.md T085 |
| 72 | **Data Migration Scripts** | ❌ MISSING | — | — | — | tasks.md T107-T110 |

---

## Domain Classification Summary

| Classification | Count | Domains |
|---------------|-------|---------|
| ✅ IMPLEMENTED (complete) | 28 | Auth, Audit, Projects, Locations, Customers, Meters, SIMs, Assignment, Dashboard, Readings (manual), Validation, Review Queue, Auto Polling, Water Balance, Tariffs, Invoice Issue, Adjustments, Payments, Allocation, Reversal, Ledger, Consumption View, Action Gating, Feature Flags, Idempotency, Error Envelope, Correlation ID, Throttling, Constitution |
| ⚠️ PARTIAL (partially implemented) | 6 | RBAC (7/16 roles), Billing Periods (no governance), Invoice Generation (elec/water only), E2E Tests (25 views, no mutations), 5 Utility Types (2/5), 5 Charge Modes (flat rate only) |
| ❌ MISSING (not implemented but exists in reference) | 16 | Solar Wallet, Solar Readings, Solar Registers, Solar Invoices, Chilled Water, BTU Readings, Chilled Water Config, Chilled Water Settlement, Settlement Engine, Settlement Approval, Settlement Versioning, Settlement Carry-Forward, Template Engine V3, PDF Generation, QR Generation, 3 Settlement Types |
| ❌ NOT STARTED (planned but not begun) | 13 | Report Jobs, Frontend Contracts, CI/CD, i18n, 16-Profile RBAC, 15 Area DBs, Symbiot Bridge, Availability Plans, Meter Lifecycle, 32 Reports, Security Audit, Load Test, Data Migration, SSL, Production Env, Monitoring, Backup Automation |

## Source Systems Boundary

| System | Role | Status in Meter Verse |
|--------|------|----------------------|
| **NestJS Backend** (current) | Core billing API — electricity/water | ✅ 28 domains operational |
| **Next.js Frontend** (current) | UI — 25 pages | ✅ 15 pages API-connected, 10 on mock |
| **Flask Collection System** (reference) | Legacy system — solar/chilled/settlement/templates | ❌ Not ported (5 priority features pending) |
| **SBill** (reference) | Legacy billing data source | ❌ Not migrated (T108-T109) |
| **Symbiot** (reference) | Meter communication bridge | ❌ Not built (T091) |
