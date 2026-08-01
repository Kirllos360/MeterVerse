<!-- Status Block
====================================================================
Design: [x] Complete | Implementation: [ ] Not Started | Certification: [ ] Not Certified | Wave: W2 | Commit: 41270f36
====================================================================
-->

# P43 â€” Wave 2 Implementation Execution Plan (Billing & Finance Foundation)

**Version:** 1.0.0  
**Status:** READ ONLY â€” EXECUTION PLANNING â€” NO CODE / NO SCHEMA CHANGES  
**Date:** 2026-08-01  
**Baseline:** P40 (Wave 2 = C22, C23, C13), P41 (readiness), P42 (Wave 1 GO)  
**Scope:** C22 SaaS foundation, C23 BPM foundation, C13 Financial foundation  

---

## Executive Summary

Wave 2 implements the **Billing & Finance Foundation** per P40: C22 (SaaS tenancy), C23 (Workflow/BPM), and C13 (Financial Intelligence) foundations. Audit confirms strong prerequisites: the C13 accounting backend (Account, JournalEntry, GeneralLedgerEntry, FinancialPeriod, Trial Balance, period close) is **already implemented and live**; billing routes (BillRun, invoice lifecycle) and payment/invoice/tariff models exist; C23 has the persisted workflow state machines; C22 has Organization/Country/License seeds. Wave 2 adds the missing SaaS tenancy, BPM runtime, and financial integration layers on top â€” no architecture redesign.

**Expected coverage increase: ~12% â†’ ~22%** (Wave 2 = 10 points across three programs).

---

## 1. Wave 2 Dependency Validation

### Prerequisite audit (from live repo)

| Prerequisite | Status | Evidence |
|---|---|---|
| C12 Identity & Zero Trust | âœ… Complete (Wave 1) | auth-engine, security middleware (31 tests), JWT/RBAC/MFA/area-scope |
| C19 Platform Admin & DevSecOps | âœ… Complete (Wave 1) | 5 CI workflows, config-center, health, Symbiot isolation |
| C20 Quality Gates | âœ… Complete (Wave 1) | contract+integration CI gate, coverage thresholds 46/36/48/43 |
| C21 Governance | âœ… Complete (Wave 1) | governance registries (10 models, 30 routes), RBAC `governance.*` |
| Existing billing modules | âœ… Present | `routes/billing.js` (BillRun CRUD, invoice approve/reject/cancel), `services/billing-engine.js` |
| Accounting backend | âœ… Present | `routes/accounting.js` (accounts, journal entries, GL, trial balance, periods), 5 models live |
| Customer/Meter/Invoice/Payment models | âœ… Present | Customer, Meter, Invoice, Payment, InvoiceItem, InvoiceTax, Tariff, TariffRate, TariffTier |
| Workflow engine | âœ… Present | `workflow-engine.js` (customer/invoice/meter state machines), WorkflowState/Transition persisted |
| C22 seeds | âš ï¸ Partial | Organization, Country, License exist; Tenant/Subscription/Plan/UsageMeter missing |

### Conclusion
All Wave-2 prerequisites are satisfied. Missing models are the **implementation targets** (not missing prerequisites).

---

## 2. Implementation Order

```
C22 Tenant Foundation
        â†“
C23 Workflow Foundation
        â†“
C13 Financial Integration (billing â†’ GL)
        â†“
C13 Revenue Intelligence
        â†“
C13 Tariff Engine
        â†“
C13 Collection Intelligence
        â†“
C13 Financial Reporting
        â†“
C13 Financial AI
```

### Step 2.1 â€” C22 Tenant Foundation

| Aspect | Detail |
|---|---|
| **Objective** | SaaS tenancy: Tenant model + isolation strategy + subscription/plan seeds |
| **Dependencies** | C12 identity, C21 governance, C19 config |
| **Database impact** | New models: `Tenant`, `TenantSetting`, `SubscriptionPlan`, `TenantSubscription`, `UsageMeter`, `EnvironmentProfile` (additive); `tenantId` nullable-added to User/Customer/Meter (backfill later) |
| **API impact** | `/api/tenants` CRUD, `/api/subscriptions` plans+lifecycle, tenant-scope middleware (C22 TenantGuard) |
| **Frontend impact** | Tenant admin page (web), subscription console |
| **Tests required** | Tenant CRUD (10), isolation (10), subscription lifecycle (10), usage metering (8) |

### Step 2.2 â€” C23 Workflow Foundation

| Aspect | Detail |
|---|---|
| **Objective** | BPM runtime above existing state machines: WorkflowDefinition/Version/Instance, ApprovalRequest/Decision |
| **Dependencies** | C22 tenant scope, C12 RBAC/audit |
| **Database impact** | New models: `WorkflowDefinition`, `WorkflowVersion`, `WorkflowNode`, `WorkflowEdge`, `WorkflowInstance`, `WorkflowTask`, `ApprovalRequest`, `ApprovalDecision` (additive; existing WorkflowState/Transition preserved) |
| **API impact** | `/api/workflows` definitions+instances, `/api/approvals` engine |
| **Frontend impact** | Workflow designer (web, visual), approval inbox |
| **Tests required** | Definition lifecycle (10), instance execution (12), approval modes (10), permission/audit (8) |

### Step 2.3 â€” C13 Financial Integration (billing â†’ GL)

| Aspect | Detail |
|---|---|
| **Objective** | FinancialEvent bridge: invoice issue/payment â†’ journal â†’ GL auto-posting |
| **Dependencies** | C13 accounting backend (live), C23 approvals, C22 tenant |
| **Database impact** | New models: `FinancialEvent`, `AccountMapping` (additive); Invoice/Payment add `periodId` + `journalEntryId` (nullable, backfill later) |
| **API impact** | `services/posting-engine.js` + hooks in invoices.js/payments.js/billing.js (â‰¤15 lines each) |
| **Frontend impact** | Journal/GL view (reuse existing accounting pages) |
| **Tests required** | Invoice posting (20), payment posting (20), balancing (15), period lock (10), reversal (10) |

### Step 2.4 â€” C13 Revenue Intelligence

| Aspect | Detail |
|---|---|
| **Objective** | Revenue assurance: 15 rules (pre-bill/post-bill/continuous), leakage detection |
| **Dependencies** | Step 2.3 (financial events), C21 governance |
| **Database impact** | New models: `RevenueRule` (extend ValidationRule pattern), `RevenueLeakageFinding`, `RevenueInvestigation` |
| **API impact** | `/api/revenue-assurance` findings/investigation, hooks in BillRun/Invoice |
| **Frontend impact** | Revenue Assurance dashboard + finding detail |
| **Tests required** | Pre-bill (25), post-bill (20), continuous (15), investigation (15), scoring (10) |

### Step 2.5 â€” C13 Tariff Engine

| Aspect | Detail |
|---|---|
| **Objective** | Enterprise tariff: versioned lifecycle, ToU/tiered/demand, simulation |
| **Dependencies** | C13 existing Tariff/TariffRate/TariffTier, C22 tenant |
| **Database impact** | New models: `TariffVersion`, `TariffVersionRate`, `TariffVersionTier`, `TariffToUSchedule`, `TariffDemandRate`, `TariffFixedCharge`, `TariffTax`, `TariffChangeLog`, `CustomerTariff` (additive) |
| **API impact** | `/api/tariffs` version lifecycle + calculate; `/api/tariffs/simulate` |
| **Frontend impact** | Tariff Intelligence dashboard, tariff manager, simulation UI |
| **Tests required** | Resolution (20), flat (10), tiered (15), ToU (15), demand (10), fixed+tax (15), simulation (10), version lifecycle (15) |

### Step 2.6 â€” C13 Collection Intelligence

| Aspect | Detail |
|---|---|
| **Objective** | Dunning automation, PTP/installments, AI prioritization |
| **Dependencies** | Step 2.5, C23 approvals, C25 (later wave) |
| **Database impact** | New models: `CustomerRiskProfile`, `DunningRule`, `InstallmentPlan`, `PlanInstallment`, `Dispute`, `ProvisionRule`, `BadDebtProvision`, `WriteOffRequest` (additive); CollectionCase + PromiseToPay enhanced (nullable fields) |
| **API impact** | `/api/collections` workbench, dunning engine, PTP, installments |
| **Frontend impact** | Collector workbench, supervisor + executive dashboards |
| **Tests required** | Aging (15), strategy (15), dunning (20), PTP (15), installment (15), dispute (10), provision (10), write-off (10) |

### Step 2.7 â€” C13 Financial Reporting

| Aspect | Detail |
|---|---|
| **Objective** | P&L, Balance Sheet, Cash Flow, Budget vs Actual from GL data |
| **Dependencies** | Steps 2.3-2.6 (GL data), C17 (later wave, use direct queries now) |
| **Database impact** | New models: `FinancialSnapshot`, `Budget`, `BudgetVsActual`, `FinancialRatio`, `ReportSchedule`, `FinancialNote`, `IFRSMapping`, `SegmentPerformance` |
| **API impact** | `/api/financial-reports` statements + BvA + ratios |
| **Frontend impact** | CFO/Executive/Operations finance dashboards |
| **Tests required** | Statements (25), snapshots (15), BvA (15), ratios (15), segments (10), IFRS (10) |

### Step 2.8 â€” C13 Financial AI

| Aspect | Detail |
|---|---|
| **Objective** | Forecasting, scenario/Monte Carlo, health score, executive recommendations |
| **Dependencies** | Steps 2.3-2.7 (data), C18 AI (later wave â€” use rule-based + C12-W07 patterns now) |
| **Database impact** | New models: `FinancialForecast`, `FinancialScenario`, `MonteCarloResult`, `BusinessHealthScore`, `ExecutiveInsight`, `AiModelVersion`, `AiRecommendationLog` (reuse C21 governance models where possible) |
| **API impact** | `/api/financial-ai` forecasts, scenarios, health |
| **Frontend impact** | CFO Decision Center, AI Ops dashboard |
| **Tests required** | Forecasting (25), scenario (20), Monte Carlo (15), health (15), recommendations (15), board (10) |

---

## 3. Database Migration Plan

### Batches (P40 B-series policy: additive-first, down-script-backed)

| Batch | Step | Models | Compatibility | Rollback |
|---|---|---|---|---|
| B-02 | C22 | Tenant, TenantSetting, SubscriptionPlan, TenantSubscription, UsageMeter, EnvironmentProfile | Additive (new tables) | Down script |
| B-03 | C22 â†’ C23 | WorkflowDefinition, WorkflowVersion, WorkflowNode, WorkflowEdge, WorkflowInstance, WorkflowTask, ApprovalRequest, ApprovalDecision | Additive | Down script |
| B-04 | C13 Fin | FinancialEvent, AccountMapping; Invoice/Payment +periodId +journalEntryId | Additive; new fields nullable first | Down + flag |
| B-05 | C13 Rev | RevenueRule, RevenueLeakageFinding, RevenueInvestigation | Additive | Down |
| B-06 | C13 Tariff | TariffVersion, TariffVersionRate, TariffVersionTier, TariffToUSchedule, TariffDemandRate, TariffFixedCharge, TariffTax, TariffChangeLog, CustomerTariff | Additive | Down |
| B-07 | C13 Coll | CustomerRiskProfile, DunningRule, InstallmentPlan, PlanInstallment, Dispute, ProvisionRule, BadDebtProvision, WriteOffRequest; CollectionCase/PromiseToPay +fields | Additive; new fields nullable | Down + flag |
| B-08 | C13 Rpt | FinancialSnapshot, Budget, BudgetVsActual, FinancialRatio, ReportSchedule, FinancialNote, IFRSMapping, SegmentPerformance | Additive | Down |
| B-09 | C13 AI | FinancialForecast, FinancialScenario, MonteCarloResult, BusinessHealthScore, ExecutiveInsight, AiModelVersion, AiRecommendationLog | Additive | Down |

### Strategy
- Every batch additive-only (new tables / nullable columns); no alter/drop on existing schema.
- `tenantId` additions nullable â†’ backfill from Organization â†’ required at later wave.
- Invoice/Payment `periodId`/`journalEntryId` nullable â†’ backfilled by posting engine.
- Migration policy decision (P42 High #1) resolved at Wave-2 start: adopt `db push` + drift-check OR rebuild `_prisma_migrations`; validate each batch on clean staging.

---

## 4. Backend Implementation Plan

| Concern | Wave 2 actions |
|---|---|
| **Modules** | `services/tenant-service.js`, `services/workflow-runtime.js`, `services/posting-engine.js`, `services/revenue-engine.js`, `services/tariff-engine.js`, `services/collection-engine.js`, `services/financial-report.js`, `services/financial-ai.js` |
| **Services** | Implement above; reuse existing billing-engine, accounting routes, workflow-engine |
| **Repositories** | Continue service-direct-Prisma pattern (Wave 1); formal repository layer deferred to treatment phase |
| **Events** | Emit domain events (invoice.issued, payment.received) via EventBus; posting engine consumes |
| **Queues** | QueueJob for async posting/reconciliation/forecast jobs |
| **Permissions** | New namespaces: `tenant.*`, `workflow.*`, `billing.*` (extend), `revenue.*`, `tariff.*`, `collections.*`, `finance.*`; add to admin role + seed |
| **Audit** | Every mutation via `auditLog()`; FinancialEvent + ApprovalRequest immutable history |

---

## 5. Frontend Implementation Plan (Web Only)

| Step | Pages / Dashboards | Responsive |
|---|---|---|
| C22 | Tenant admin, subscription console | Desktop/tablet/mobile-browser |
| C23 | Workflow designer (visual), approval inbox | Desktop-first, tablet ok |
| C13 Fin | Journal/GL view (reuse existing accounting), posting status | Responsive |
| C13 Rev | Revenue Assurance dashboard + finding detail | Responsive |
| C13 Tariff | Tariff Intelligence dashboard, tariff manager, simulation | Desktop-first |
| C13 Coll | Collector workbench, supervisor + executive dashboards | Desktop-first, tablet ok |
| C13 Rpt | CFO/Executive/Operations finance dashboards | Responsive |
| C13 AI | CFO Decision Center, AI Ops | Desktop-first |

No native mobile application. All pages use existing design tokens + DESIGN_RULES.md.

---

## 6. Testing Plan (C20 gates per step)

| Step | Unit | Integration | Contract | DB | Playwright | Security | Regression |
|---|---|---|---:|---:|---:|---:|---:|---:|
| C22 | 38 | 10 | 8 | 6 | 3 | 8 | 8 |
| C23 | 40 | 12 | 8 | 6 | 4 | 10 | 8 |
| C13 Fin | 75 | 15 | 10 | 10 | 3 | 12 | 12 |
| C13 Rev | 85 | 12 | 8 | 8 | 3 | 10 | 10 |
| C13 Tariff | 100 | 12 | 8 | 8 | 4 | 10 | 10 |
| C13 Coll | 105 | 12 | 8 | 8 | 4 | 10 | 10 |
| C13 Rpt | 90 | 10 | 8 | 8 | 4 | 8 | 10 |
| C13 AI | 90 | 10 | 6 | 8 | 3 | 10 | 10 |
| **Total** | **623** | **93** | **64** | **62** | **28** | **78** | **78** |

Every step must pass: tsc 0, vitest all, coverage thresholds, contract suite, pre-commit hooks.

---

## 7. AI Governance Check (C13 AI capabilities)

| Capability | Allowed actions | Confidence threshold | Human approval points | Audit |
|---|---|---|---|---|
| Revenue leakage detection | Flag/assign findings | â‰¥0.7 auto-flag; <0.7 review | Correction actions, write-off | Full |
| Collection prioritization | Score/rank | â‰¥0.8 auto-rank; <0.8 review | Dunning actions, PTP changes | Full |
| Revenue forecast | Read-only projection | â‰¥0.6 present; <0.6 suppress | None (read-only) | Full |
| Invoice anomaly | Flag anomalies | â‰¥0.7 auto-flag; <0.7 review | Block/issue decisions | Full |
| Financial classification | Suggest account codes | â‰¥0.9 auto-suggest; 0.7-0.9 review; <0.7 manual | Journal posting | Full |
| Scenario/forecast | Read-only simulation | â‰¥0.6 present | Any production action | Full |

**No autonomous financial mutation.** All financial actions require C23 approval workflow + C21 governance.

---

## 8. Wave 2 Execution Tracker

| Milestone | Tasks | Completion criteria | Coverage impact |
|---|---|---|---|
| M1: C22 Tenant Foundation | 8 tasks | Tenant CRUD + isolation + subscriptions live, 38 unit tests | +2% |
| M2: C23 Workflow Foundation | 8 tasks | BPM runtime + approvals live, 40 unit tests | +2% |
| M3: C13 Financial Integration | 8 tasks | Invoiceâ†’GL auto-posting verified, 75 unit tests | +2% |
| M4: C13 Revenue Intelligence | 8 tasks | 15 rules + findings + dashboard, 85 unit tests | +2% |
| M5: C13 Tariff Engine | 8 tasks | Versioned tariff + simulation, 100 unit tests | +1% |
| M6: C13 Collection Intelligence | 8 tasks | Dunning + PTP + installments, 105 unit tests | +1% |
| M7: C13 Financial Reporting | 7 tasks | P&L/BS/CF + BvA, 90 unit tests | +1% |
| M8: C13 Financial AI | 7 tasks | Forecasts + scenarios + health, 90 unit tests | +1% |

**Wave 2 total: ~62 tasks, ~623 unit tests + integration/contract/Playwright/security/regression. Estimated coverage: 12% â†’ 22%.**

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Migration policy unresolved (P42 High #1) | Medium | High | Decide db-push vs migrate at Wave-2 start; validate B-02 on staging |
| Billing regression on live data | Medium | Critical | Feature flags, dual-run, C20 regression suite |
| tenantId backfill complexity | Medium | High | Nullable-first; backfill in dedicated step |
| Posting engine imbalance | Low | Critical | Debit=credit enforcement (0.001) + reversal tests |
| AI governance violation | Low | Critical | Confidence gates + human approval (Section 7) |
| Tariff version migration of existing tariffs | Medium | Medium | Adapter: seed version 1 from existing Tariff records |

---

## Wave 2 Definition of Done

```
â–¡ C22: Tenant CRUD + isolation + subscription lifecycle live; tenant-scope enforced on new routes.
â–¡ C23: Workflow definitions/versions/instances + approval engine live above existing state machines.
â–¡ C13: Invoice/payment â†’ FinancialEvent â†’ Journal â†’ GL auto-posting verified (debit=credit, period lock, reversal).
â–¡ C13: 15 revenue assurance rules active; findings + investigation workflow + dashboard.
â–¡ C13: Versioned tariff engine (lifecycle, ToU/tiered/demand) + simulation.
â–¡ C13: Dunning/PTP/installment collection intelligence + workbench dashboards.
â–¡ C13: P&L, Balance Sheet, Cash Flow, Budget vs Actual from GL.
â–¡ C13: Forecasts, scenarios, Monte Carlo, business health score; no autonomous financial mutation.
â–¡ All steps pass C20 gates (tsc 0, vitest, coverage, contract, Playwright, security, regression).
â–¡ All migrations additive; down scripts verified; validated on clean staging.
â–¡ P40 execution tracker updated; Wave 2 coverage 12% â†’ 22%.
```

---

## Success Criteria

```
â–¡ Wave 2 certified per P42-style gate (GO) before Wave 3.
â–¡ All Wave-2 unit tests (623) + integration (93) + contract (64) + Playwright (28) pass.
â–¡ No regression in Wave 1 (C12/C19/C20/C21) or live C01-C10 connectivity.
â–¡ Billingâ†’GL chain fully traced: invoice â†’ event â†’ journal â†’ GL â†’ report.
â–¡ No autonomous financial mutation; all AI financial actions governed.
â–¡ Repository pushed to Kirllos360/MeterVerse after each milestone.
```

---

*This is an execution planning artifact only. No code, schema change, or implementation is included.*
*P43 â€” Wave 2 Implementation Execution Plan (Billing & Finance Foundation). READ ONLY.*

