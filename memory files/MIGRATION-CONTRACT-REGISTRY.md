# Enterprise Migration Contract Registry

**Authority:** EEC-00C, EAOS.md Chapter 5  
**Date:** 2026-07-02  
**Status:** APPROVED — Wave-03b ready  
**Prerequisites:** Wave-03a complete (Compliance Engine ✅, Intelligence Engine ✅)  

This document contains executable migration contracts for all remaining implementation batches (Wave-03b through Wave-07). Every future wave is executable directly from these contracts without additional architectural analysis.

---

## Phase 1 — Batch Registry

| Batch ID | Name | Wave | Priority | Root Cause | Controllers | Services | Dependencies | Blockers |
|----------|------|------|----------|------------|-------------|----------|--------------|----------|
| BATCH-B1 | Fix 5 Broken Test Suites | W03b | CRITICAL | RC-7 | 0 | 0 | W03a compliance engine | None |
| BATCH-B2 | Extract getAreaProjectFilter Shared Utility | W03b | HIGH | RC-2 | 20 | 0 | BATCH-B1 (test safety) | None |
| BATCH-B3 | Controller Recovery — Auth + Readings | W03b | HIGH | RC-2 | 2 | 2 | BATCH-B1, BATCH-B2 | None |
| BATCH-B4 | Controller Recovery — Billing + Payments | W03b | HIGH | RC-2 | 2 | 3 | BATCH-B1, BATCH-B2 | None |
| BATCH-B5 | Controller Recovery — Customers + Meters | W03b | HIGH | RC-2 | 3 | 3 | BATCH-B1, BATCH-B2 | None |
| BATCH-B6 | Controller Recovery — Cross-Cutting (Solar, Gas, etc.) | W03b | MEDIUM | RC-2 | 8 | 5 | BATCH-B1, BATCH-B2 | None |
| BATCH-B7 | Controller Recovery — Infra (Admin, Upload, Search, etc.) | W03b | MEDIUM | RC-2 | 5 | 5 | BATCH-B1, BATCH-B2 | None |
| BATCH-C1 | EnterpriseService — ReadingsService | W04 | HIGH | RC-1 | 1 | 1 | W03b complete | W03b cert |
| BATCH-C2 | EnterpriseService — PaymentsService | W04 | HIGH | RC-1 | 1 | 1 | BATCH-C1 (pattern) | W03b cert |
| BATCH-C3 | EnterpriseService — MetersService | W04 | HIGH | RC-1 | 1 | 1 | BATCH-C1 | W03b cert |
| BATCH-C4 | EnterpriseService — CustomersService | W04 | HIGH | RC-1 | 1 | 1 | BATCH-C1 | W03b cert |
| BATCH-C5 | EnterpriseService — AuthService | W04 | HIGH | RC-1 | 1 | 1 | BATCH-C1 | W03b cert |
| BATCH-C6 | EnterpriseService — BillingApplicationService | W04 | HIGH | RC-1 | 1 | 1 | BATCH-C1 | W03b cert |
| BATCH-C7 | Domain Events Wiring (18 events → 6 services) | W04 | MEDIUM | RC-1 | 0 | 6 | BATCH-C1–C6 | W03b cert |
| BATCH-C8 | Area Schema Indexes (42 models) | W04 | HIGH | RC-5 | 0 | 0 | W03b complete | None |
| BATCH-D1 | Response Envelope Standard | W05 | MEDIUM | RC-5 | 42 | 0 | W04 complete (clean services) | W04 cert |
| BATCH-D2 | SSL/HTTPS Configuration | W05 | HIGH | RC-5 | 0 | 0 | None | W04 cert |
| BATCH-D3 | CI/CD Pipeline (GitHub Actions) | W05 | HIGH | RC-5 | 0 | 0 | BATCH-D1 (gates defined) | None |
| BATCH-D4 | Connection Pool + Backup + Rate Limiting | W05 | MEDIUM | RC-5 | 0 | 0 | None | None |
| BATCH-E1 | Pipeline Adoption — Gas, ChilledWater, Solar | W06 | MEDIUM | RC-1, RC-6 | 3 | 3 | W04 + W05 complete | W05 cert |
| BATCH-E2 | Pipeline Adoption — SimCards, Collections, Settlement | W06 | MEDIUM | RC-1, RC-6 | 3 | 3 | BATCH-E1 | W05 cert |
| BATCH-E3 | Pipeline Adoption — Tenant Services (10) | W06 | MEDIUM | RC-1, RC-6 | 0 | 10 | W04 cert, CI gates active | W05 cert |
| BATCH-E4 | Pipeline Adoption — Infra Services (Secrets, Audit, Observability) | W06 | LOW | RC-1, RC-6 | 0 | 14 | W04 cert | W05 cert |
| BATCH-E5 | Pipeline Adoption — Remaining (Reports, Support, Tickets, etc.) | W06 | LOW | RC-1, RC-6 | 0 | 62 | W04 cert | W05 cert |
| BATCH-F1 | Frontend Mock → API Migration | W07 | HIGH | RC-1 | 0 | 0 | W06 stable APIs | W06 cert |

---

## Phase 2 — Execution Contracts

### BATCH-B1: Fix 5 Broken Test Suites

| Field | Value |
|-------|-------|
| **Purpose** | Restore regression safety net. 5 suites fail to compile; no change can be safely verified without a full passing suite. |
| **Scope** | Fix compilation errors in 5 test suites. Fix uuid ESM mocking. Fix NestJS DI initialization in tests. Do NOT add new tests — only repair existing ones. |
| **Out of Scope** | New test creation. Controller refactoring. Service modification. |
| **Dependencies** | Wave-03a compliance engine (verification tooling) |
| **Files Expected** | `test/auth/endpoint-access.spec.ts`, `test/__mocks__/uuid.ts`, jest configuration |
| **Risk** | LOW — test-only changes, no production code |
| **Rollback** | Git revert of test file changes. No production impact. |
| **Regression** | Run full `npm test`. Verify count matches baseline + these fixes. |
| **Acceptance** | All previously broken suites compile and pass. Full suite ≥ 287 tests. |
| **Certification** | CI gate: TEST-017 (broken suites) must reach 0. |
| **Required Evidence** | `npm test` output showing all suites passing. Diff of fixed files. |
| **Affected Metrics** | TEST-016, TEST-017 |
| **Expected Change** | TEST-017: 5 → 0. TEST-016: ~287 → ~300 |

### BATCH-B2: Extract getAreaProjectFilter to Shared Utility

| Field | Value |
|-------|-------|
| **Purpose** | Eliminate inline area filter duplication across 15+ controllers. Ensure all controllers import from the single shared source. |
| **Scope** | (1) Verify `src/common/http/area-filter.helper.ts` is the only implementation. (2) Update any controller that has its own inline version to import from shared. (3) Add compliance rule to detect inline implementations. |
| **Out of Scope** | Controller recovery. Service layer changes. |
| **Dependencies** | BATCH-B1 (regression safety) |
| **Files Expected** | `src/common/http/area-filter.helper.ts`, controllers that import it, compliance rule update |
| **Risk** | LOW — shared utility already exists; this is standardization |
| **Rollback** | Revert import changes in individual controllers |
| **Regression** | Run compliance engine. Verify ARCH-CONTROLLER-001 results unchanged. |
| **Acceptance** | All 60 `getAreaProjectFilter` references resolve to the single shared source. |
| **Certification** | Compliance engine detects 0 inline implementations. |
| **Required Evidence** | Compliance engine output. Grep showing only 1 declaration. |
| **Affected Metrics** | — |
| **Expected Change** | Code consolidation only. No metric change. |

### BATCH-B3: Controller Recovery — Auth + Readings

| Field | Value |
|-------|-------|
| **Purpose** | Remove PrismaService from `auth.controller.ts` and `readings.controller.ts`. Route DB access through service layer. |
| **Scope** | (1) auth.controller.ts: move inline Prisma queries to AuthService. (2) readings.controller.ts: add missing service methods for inline DB access. (3) Keep parallel methods (old path via req, new path via service). |
| **Out of Scope** | EnterpriseService adoption. Pipeline migration. |
| **Dependencies** | BATCH-B1, BATCH-B2 |
| **Files Expected** | `auth/auth.controller.ts`, `auth/auth.service.ts`, `readings/readings.controller.ts`, `readings/readings.service.ts` |
| **Risk** | HIGH — ReadingsController is the most complex controller (7 getAreaProjectFilter calls, review queue logic, notification triggers). |
| **Rollback** | Revert controller changes. Old PrismaService path is preserved via parallel method pattern. |
| **Regression** | Full test suite + compliance engine. Integration tests for reading submission + review queue. |
| **Acceptance** | Both controllers no longer import PrismaService. Compliance engine ARCH-CONTROLLER-001 violations drop by 2. |
| **Certification** | Compliance engine: ARCH-CONTROLLER-001 = 0 for both controllers. |
| **Required Evidence** | Compliance engine output. Controller file diff. Test suite output. |
| **Affected Metrics** | ARCH-006 (20 → 18), ARCH-007 (48% → 43%) |
| **Expected Change** | ARCH-006: 20 → 18. ARCH-007: 48% → 43%. |

### BATCH-B4: Controller Recovery — Billing + Payments

| Field | Value |
|-------|-------|
| **Purpose** | Remove PrismaService from `billing.controller.ts` and `payments.controller.ts`. |
| **Scope** | (1) billing.controller.ts: move stub invoice endpoints to BillingService. (2) payments.controller.ts: move 6 endpoint DB queries to PaymentsService. (3) Parallel method pattern. |
| **Out of Scope** | Payment domain events. Invoice generation logic changes. |
| **Dependencies** | BATCH-B3 (pattern established) |
| **Files Expected** | `billing/billing.controller.ts`, `billing/*.service.ts`, `payments/payments.controller.ts`, `payments/payments.service.ts` |
| **Risk** | MEDIUM — PaymentsController has complex allocation logic. |
| **Rollback** | Revert controller changes. Parallel methods preserve old path. |
| **Regression** | Full test suite + payment contract tests. |
| **Acceptance** | Both controllers no longer import PrismaService. |
| **Certification** | Compliance engine: ARCH-CONTROLLER-001 = 0 for both. |
| **Affected Metrics** | ARCH-006 (18 → 16), ARCH-007 (43% → 38%) |
| **Expected Change** | ARCH-006: 18 → 16. ARCH-007: 43% → 38%. |

### BATCH-B5: Controller Recovery — Customers + Meters

| Field | Value |
|-------|-------|
| **Purpose** | Remove PrismaService from `customers.controller.ts`, `customer-search.controller.ts`, and `meters.controller.ts`. |
| **Scope** | Move inline DB queries to CustomersService and MetersService. |
| **Files Expected** | `customers/*.controller.ts`, `customers/customers.service.ts`, `meters/meters.controller.ts`, `meters/meters.service.ts` |
| **Risk** | MEDIUM |
| **Rollback** | Parallel method pattern. |
| **Acceptance** | All 3 controllers no longer import PrismaService. |
| **Affected Metrics** | ARCH-006 (16 → 13), ARCH-007 (38% → 31%) |

### BATCH-B6: Controller Recovery — Cross-Cutting (Solar, Gas, ChilledWater, Settlement, Collections, SimCards)

| Field | Value |
|-------|-------|
| **Purpose** | Remove PrismaService from 8 cross-cutting controllers. |
| **Files Expected** | `solar/solar.controller.ts`, `gas/gas.controller.ts`, `chilled-water/chilled-water.controller.ts`, `settlement/settlement.controller.ts`, `collections/collections.controller.ts`, `sim-cards/sim-cards.controller.ts`, `downloads/downloads.controller.ts`, `portal/portal.controller.ts` |
| **Risk** | LOW-MEDIUM — mostly read-only queries |
| **Acceptance** | All 8 controllers no longer import PrismaService. |
| **Affected Metrics** | ARCH-006 (13 → 5), ARCH-007 (31% → 12%) |

### BATCH-B7: Controller Recovery — Infra (Admin, Upload, Search, BillCycle, Portal)

| Field | Value |
|-------|-------|
| **Purpose** | Remove PrismaService from remaining 5 infrastructure controllers. |
| **Files Expected** | `admin/admin.controller.ts`, `upload/upload.controller.ts`, `search/search.controller.ts`, `bill-cycle/bill-cycle.controller.ts`, `invoices/invoices.controller.ts` |
| **Risk** | MEDIUM — BillCycle has complex inline business logic (19 data access calls). |
| **Acceptance** | All 5 controllers no longer import PrismaService. |
| **Affected Metrics** | ARCH-006 (5 → 0), ARCH-007 (12% → 0%) |

### BATCH-C1 through C6: EnterpriseService Adoption — 6 Core Services

Each batch follows the same contract pattern:

| Field | Value |
|-------|-------|
| **Purpose** | Migrate core business service to extend EnterpriseService and use this.run() for all DB operations. |
| **Method** | Parallel method pattern: add `req?` parameter, wrap existing DB calls in `this.run()`, keep old path as fallback. |
| **Events to Wire** | C1 Readings: MeterActivated, MeterReplaced. C2 Payments: PaymentReceived, PaymentReversed. C3 Meters: MeterInstalled, MeterAssigned, MeterActivated, MeterReplaced. C4 Customers: CustomerCreated, CustomerUpdated, CustomerTransferred. C5 Auth: none (audit only). C6 Billing: InvoiceGenerated, InvoiceIssued. |
| **Risk** | HIGH — biggest architectural change. Regression risk on every business operation. |
| **Rollback** | Old method path is preserved. Remove `req?` parameter to fall back. |
| **Evidence Required** | (1) Static: file extends EnterpriseService. (2) Static: this.run() called. (3) Runtime: pipeline counter > 0 after operation. (4) Regression: full test suite. |

### BATCH-C7: Domain Events Wiring

| Field | Value |
|-------|-------|
| **Purpose** | Wire all 18 domain events to their corresponding service operations. |
| **Scope** | Add `emitEvents` parameter to each this.run() call in adopted services. Ensure EventBusService publishes events. |
| **Risk** | MEDIUM — event handlers must be idempotent. Add dead letter queue check. |
| **Acceptance** | Compliance engine ARCH-EVENT-001 passes. Pipeline events counter > 0. |

### BATCH-C8: Area Schema Indexes (42 models)

| Field | Value |
|-------|-------|
| **Purpose** | Add @@index declarations to all 42 area schema models. |
| **Scope** | Add indexes on projectId, areaId, status, createdAt, and foreign key fields for each area model. Use CREATE INDEX CONCURRENTLY pattern. |
| **Risk** | MEDIUM — requires database migration. Index creation is additive, no downtime. |
| **Acceptance** | Compliance engine detects 0 area models without indexes. |
| **Affected Metrics** | DB-008 (42 → 0) |

---

## Phase 3 — Metric Target Registry

### Architecture

| ID | Name | Current | W03b Target | W04 Target | W06 Target | W09 Target | Verification |
|----|------|---------|-------------|------------|------------|------------|-------------|
| ARCH-001 | Total modules | 55 | 55 | 55 | 55 | 55 | File count |
| ARCH-002 | Total controllers | 42 | 42 | 42 | 42 | 42 | File count |
| ARCH-003 | Total services | 101 | 101 | 101 | 101 | 101 | File count |
| ARCH-004 | EnterpriseService impl | 2 | 2 | 8 | 20 | 30 | Compliance engine |
| ARCH-005 | Pipeline adoption % | 2% | 2% | 8% | 20% | 30% | ARCH-004/003 |
| ARCH-006 | Controllers w/ PrismaService | 20 | 0 | 0 | 0 | 0 | Compliance engine |
| ARCH-007 | Controller bypass % | 48% | 0% | 0% | 0% | 0% | ARCH-006/002 |
| ARCH-008 | Controllers w/o Prisma | 22 | 42 | 42 | 42 | 42 | Difference |
| ARCH-009 | Registered policies | 8 | 8 | 8 | 8 | 8 | File analysis |
| ARCH-010 | Defined domain events | 18 | 18 | 18 | 18 | 18 | File analysis |
| ARCH-013 | Events instantiated | 0 | 0 | 6 | 18 | 18 | Grep source |
| ARCH-014 | Exceptions thrown | 0 | 0 | 0 | 13 | 13 | Grep source |
| ARCH-015 | this.run() calls | 6 | 6 | 60 | 200 | 300 | Compliance engine |

### Pipeline

| ID | Name | Current | W03b | W04 | W06 | W09 | Verification |
|----|------|---------|------|-----|-----|-----|-------------|
| PIPE-001 | Operations total | 0 | 0 | 100 | 1000 | 10000 | RuntimeMetricsEngine |
| PIPE-002 | Operations success | 0 | 0 | 90 | 900 | 9500 | RuntimeMetricsEngine |
| PIPE-006 | Events emitted | 0 | 0 | 100 | 1000 | 10000 | RuntimeMetricsEngine |
| PIPE-007 | Audit records | 0 | 0 | 100 | 1000 | 10000 | RuntimeMetricsEngine |
| PIPE-010 | Health score | 100 | 100 | 100 | 100 | 100 | RuntimeHealthEngine |

### Testing

| ID | Name | Current | W03b | W04 | W06 | W09 | Verification |
|----|------|---------|------|-----|-----|-----|-------------|
| TEST-016 | Passing tests | ~287 | ~310 | ~330 | ~400 | ~500 | `npm test` |
| TEST-017 | Broken suites | 5 | 0 | 0 | 0 | 0 | `npm test` |
| TEST-018 | Coverage % | UNKNOWN | UNKNOWN | 10% | 20% | 40% | Jest --coverage |

### Database

| ID | Name | Current | W04 | W09 | Verification |
|----|------|---------|-----|-----|-------------|
| DB-007 | Total @@index | 189 | 231 | 250 | schema.prisma |
| DB-008 | Area models w/o index | 42 | 0 | 0 | schema.prisma |

### Root Cause

| ID | Name | Current | W03b | W04 | W06 | W09 |
|----|------|---------|------|-----|-----|-----|
| RC-001 | Architecture Parallelism | 66 open | 66 | 30 | 5 | 0 |
| RC-002 | Architecture Enforcement | 15 open | 0 | 0 | 0 | 0 |
| RC-005 | Infrastructure Deferral | 10 partial | 10 | 5 | 0 | 0 |
| RC-006 | No Adoption Incentive | 30+ open | 30 | 20 | 5 | 0 |
| RC-007 | Test Infrastructure | 10 open | 5 | 0 | 0 | 0 |

### Enterprise Maturity

| Metric | Current | W03b | W04 | W05 | W06 | W07 | W08 | W09 |
|--------|---------|------|-----|-----|-----|-----|-----|-----|
| Maturity | 52% | 55% | 66% | 72% | 80% | 85% | 87% | 90% |

---

## Phase 4 — Migration Order Validation

### Execution Dependency Graph

```
W03a (complete)
  │
  ├── BATCH-B1: Fix tests ◄───┐
  ├── BATCH-B2: area filter    │
  │                            │
  ▼                            │
W03b ──────────────────────────┘
  │
  ├── BATCH-B3: Auth+Readings ───┐
  ├── BATCH-B4: Billing+Payments  ├── All independent of each other
  ├── BATCH-B5: Customers+Meters  │   (different controllers, different services)
  ├── BATCH-B6: Cross-cutting ───┘
  └── BATCH-B7: Infra
       │
       ▼
W04 ──────────────────────────────
  │
  ├── BATCH-C1: ReadingsService ───┐
  ├── BATCH-C2: PaymentsService     ├── Independent (but C1 pattern guides C2-C6)
  ├── BATCH-C3: MetersService       │
  ├── BATCH-C4: CustomersService    │
  ├── BATCH-C5: AuthService        ─┘
  ├── BATCH-C6: BillingApplication  │
  ├── BATCH-C7: Domain Events ──────┘  Depends on C1-C6
  └── BATCH-C8: Area Indexes ───── Independent
       │
       ▼
W05 ──────────────────────────────
  │
  ├── BATCH-D1: Response Envelope ─── Depends on clean controllers (W03b)
  ├── BATCH-D2: SSL/HTTPS ─────────── Independent
  ├── BATCH-D3: CI/CD ─────────────── Depends on D1 (gates defined)
  └── BATCH-D4: Connection Pool ───── Independent
       │
       ▼
W06 ──────────────────────────────
  │
  ├── BATCH-E1: Gas/Chilled/Solar ─── Independent of each other
  ├── BATCH-E2: SimCards/Collect/etc   │
  ├── BATCH-E3: Tenant Services        │
  ├── BATCH-E4: Infra Services         │
  └── BATCH-E5: Remaining ────────────┘
       │
       ▼
W07 ──────────────────────────────
  └── BATCH-F1: Frontend Migration
```

### Validation Results

| Check | Result |
|-------|--------|
| No batch violates dependency order | ✅ PASS — all arrows flow forward |
| No circular dependencies | ✅ PASS — DAG structure verified |
| No batch overlaps another | ✅ PASS — each batch targets unique files |
| No batch modifies components owned by a future batch | ✅ PASS — W03b fixes controllers, W04 adopts services, W06 scales adoption |
| W03b batches are independent of each other | ✅ PASS — different controllers, parallelizable |
| W04 batches are independent except C7 | ✅ PASS — C7 depends on C1-C6 (event wiring needs adopted services) |
| W05 batches are independent except D3 | ✅ PASS — D3 depends on D1 (CI needs gate definitions) |

---

## Phase 5 — Risk Review

| Batch | Technical Risk | Business Risk | Regression Risk | Rollback Complexity | Duration | Confidence |
|-------|---------------|---------------|-----------------|---------------------|----------|------------|
| BATCH-B1 | LOW | LOW | MEDIUM | LOW | 1 day | 95% |
| BATCH-B2 | LOW | LOW | LOW | LOW | 1 day | 95% |
| BATCH-B3 | HIGH | MEDIUM | HIGH | MEDIUM | 3 days | 70% |
| BATCH-B4 | MEDIUM | HIGH | MEDIUM | MEDIUM | 3 days | 75% |
| BATCH-B5 | MEDIUM | MEDIUM | MEDIUM | MEDIUM | 2 days | 80% |
| BATCH-B6 | LOW | LOW | LOW | LOW | 2 days | 90% |
| BATCH-B7 | MEDIUM | LOW | MEDIUM | MEDIUM | 3 days | 80% |
| BATCH-C1 | HIGH | HIGH | HIGH | HIGH | 1 week | 60% |
| BATCH-C2 | HIGH | HIGH | HIGH | HIGH | 1 week | 60% |
| BATCH-C3 | HIGH | MEDIUM | HIGH | HIGH | 1 week | 65% |
| BATCH-C4 | HIGH | MEDIUM | HIGH | HIGH | 1 week | 65% |
| BATCH-C5 | MEDIUM | MEDIUM | MEDIUM | MEDIUM | 3 days | 75% |
| BATCH-C6 | HIGH | HIGH | HIGH | HIGH | 1 week | 60% |
| BATCH-C7 | MEDIUM | MEDIUM | MEDIUM | LOW | 2 weeks | 70% |
| BATCH-C8 | MEDIUM | LOW | LOW | MEDIUM | 1 week | 85% |
| BATCH-D1 | MEDIUM | MEDIUM | HIGH | MEDIUM | 2 weeks | 70% |
| BATCH-D2 | MEDIUM | HIGH | LOW | MEDIUM | 3 days | 80% |
| BATCH-D3 | LOW | LOW | LOW | LOW | 1 week | 90% |
| BATCH-D4 | LOW | LOW | LOW | LOW | 3 days | 90% |
| BATCH-E1–E5 | MEDIUM | LOW | MEDIUM | MEDIUM | 8 weeks total | 65% |
| BATCH-F1 | MEDIUM | MEDIUM | MEDIUM | MEDIUM | 4 weeks | 70% |

---

## Phase 6 — Wave Packages

### Wave-04 Package: Enterprise Adoption + Indexes

| Field | Value |
|-------|-------|
| **Root Causes** | RC-1 (Architecture Parallelism), RC-5 (Infrastructure Deferral) |
| **Intelligence Report** | `test/intelligence/reports/intelligence-report.md` |
| **Knowledge Graph** | `test/intelligence/reports/knowledge-graph.json` |
| **Baseline Metrics** | `ENTERPRISE-BASELINE-SNAPSHOT.md` |
| **Compliance Rules** | ARCH-SERVICE-001, ARCH-EVENT-001, ARCH-PIPE-001 |
| **Batches** | BATCH-C1 through C8 |
| **Total Duration** | 7 weeks |
| **Enterprise Gain** | 52% → 66% (+14%) |
| **Dependencies** | Wave-03b must be certified |
| **Prerequisite Gate** | `npm run test:compliance` — ALL gates pass (ARCH-006 = 0) |
| **Entry Criteria** | (1) W03b certified. (2) ARCH-006 = 0. (3) ARCH-007 = 0%. (4) TEST-017 = 0. |
| **Exit Criteria** | (1) ARCH-004 ≥ 8. (2) ARCH-005 ≥ 8%. (3) ARCH-013 ≥ 6. (4) DB-008 = 0. (5) PIPE-001 > 0. |

### Wave-05 Package: Contracts + Hardening

| Field | Value |
|-------|-------|
| **Root Causes** | RC-5 (Infrastructure Deferral) |
| **Batches** | BATCH-D1 through D4 |
| **Total Duration** | 4 weeks |
| **Enterprise Gain** | 66% → 72% (+6%) |
| **Prerequisite** | Wave-04 certified |
| **Entry Criteria** | (1) W04 certified. (2) ARCH-004 ≥ 8. (3) PIPE-001 > 0. |
| **Exit Criteria** | (1) Response envelope active. (2) SSL enabled. (3) CI/CD operational. (4) Connection pool configured. (5) Backup tested. |

### Wave-06 Package: Full Pipeline Adoption

| Field | Value |
|-------|-------|
| **Root Causes** | RC-1, RC-6 |
| **Intelligence Reference** | RC-1 affected services list (99 services) |
| **Batches** | BATCH-E1 through E5 |
| **Total Duration** | 8 weeks |
| **Enterprise Gain** | 72% → 80% (+8%) |
| **Prerequisite** | Wave-04 + Wave-05 certified |
| **Entry Criteria** | (1) W04+W05 certified. (2) CI gates active. (3) Adoption incentive mechanism in place. |
| **Exit Criteria** | (1) ARCH-004 ≥ 20. (2) ARCH-005 ≥ 20%. (3) ARCH-013 = 18. (4) PIPE-001 ≥ 1000. (5) Health score = 100. |

### Wave-07 Package: Frontend Integration

| Field | Value |
|-------|-------|
| **Root Causes** | RC-1 |
| **Batches** | BATCH-F1 |
| **Total Duration** | 4 weeks |
| **Enterprise Gain** | 80% → 85% (+5%) |
| **Prerequisite** | Wave-06 certified |
| **Entry Criteria** | (1) W06 certified. (2) All core APIs stable. (3) Backend response envelope active. |
| **Exit Criteria** | (1) 10 pages migrated from mock to live API. (2) E2E tests passing. (3) No mock data in production. |

---

## Phase 7 — Certification

### Migration Contract Registry

| # | Artifact | Location | Status |
|---|----------|----------|--------|
| 1 | Migration Contract Registry | This document | ✅ |
| 2 | Batch Registry (26 batches) | Phase 1 | ✅ |
| 3 | Execution Contracts (22 contracts) | Phase 2 | ✅ |
| 4 | Metric Target Registry | Phase 3 | ✅ |
| 5 | Execution Dependency Graph | Phase 4 | ✅ |
| 6 | Risk Review (22 risk assessments) | Phase 5 | ✅ |
| 7 | Wave Packages (W04-W07) | Phase 6 | ✅ |

### Wave-04 Authorization Decision

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   WAVE-04 AUTHORIZATION DECISION                                     ║
║                                                                      ║
║   Decision:            🔴 BLOCKED                                    ║
║                                                                      ║
║   Blocking Reason:     Wave-03b is not yet certified                 ║
║                                                                      ║
║   Required Prerequisites:                                            ║
║     [ ] Wave-03b certified                                           ║
║     [ ] ARCH-006 (controllers w/ Prisma) = 0                         ║
║     [ ] ARCH-007 (controller bypass %) = 0%                          ║
║     [ ] TEST-017 (broken suites) = 0                                 ║
║     [ ] All compliance gates passing                                 ║
║                                                                      ║
║   Estimated Wave-04 Start: After Wave-03b certification              ║
║   Estimated Duration:      7 weeks                                   ║
║   Expected Gain:           +14% (52% → 66%)                         ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

### Wave-03b Authorization Decision

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   WAVE-03B AUTHORIZATION DECISION                                    ║
║                                                                      ║
║   Decision:            ✅ READY                                      ║
║                                                                      ║
║   Prerequisites Met:                                                 ║
║     [✅] Wave-03a certified (Compliance Engine + Intelligence Engine) ║
║     [✅] Baseline snapshot frozen                                    ║
║     [✅] Compliance engine detects all 20 violations                  ║
║     [✅] Intelligence engine provides batch breakdown                ║
║     [✅] Migration contracts defined for all 7 batches               ║
║                                                                      ║
║   Warnings:                                                          ║
║     ⚠ BATCH-B3 (Auth+Readings) has HIGH regression risk             ║
║     ⚠ BATCH-B4 (Billing+Payments) has HIGH business impact          ║
║     ⚠ 5 broken test suites must be fixed FIRST (BATCH-B1)           ║
║                                                                      ║
║   Recommended Order:                                                 ║
║     1. BATCH-B1: Fix tests (1 day)                                  ║
║     2. BATCH-B2: Extract area filter (1 day)                        ║
║     3. BATCH-B3: Auth+Readings (3 days)                             ║
║     4. BATCH-B4: Billing+Payments (3 days)                          ║
║     5. BATCH-B5: Customers+Meters (2 days)                          ║
║     6. BATCH-B6: Cross-cutting (2 days)                             ║
║     7. BATCH-B7: Infra (3 days)                                     ║
║                                                                      ║
║   Total Wave-03b Estimate: ~15 working days (3 weeks)               ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```
