# ERP-00 — Enterprise Recovery Planning & Governance

**Status:** APPROVED — Master Implementation Contract  
**Date:** 2026-07-02  
**Governs:** All future implementation waves for the EOX Enterprise Platform  
**Authority:** Enterprise Verification Program (EV-01 through EV-13)  

---

## Executive Summary

This document is the **single authoritative implementation contract** for the EOX Enterprise Recovery Program. Every future code change must conform to this plan. Nothing may be implemented outside this plan.

The recovery program consists of **8 implementation waves** that transform the platform from 36% to 82% enterprise maturity. The first wave (Wave-01) requires **5 file changes in approximately 2 days** and eliminates **17 verified findings**. The complete program eliminates ~92 actionable findings by addressing 4 root causes.

### Recovery Commitment

| Metric | Current | Target | After Wave |
|---|---|---|---|
| Enterprise Maturity | 36% | 82% | Wave-08 |
| Pipeline Adoption | 2% | 50%+ | Wave-04 |
| Controllers with PrismaService | 20 | 0 | Wave-03 |
| Validator Pipeline Working | 0% | 100% | Wave-01 |
| RBAC Enforcement | 0% | 100% | Wave-01 |
| Area Schema Indexes | 0 | 100+ | Wave-02 |
| Redis Infrastructure | None | Full | Wave-02 |
| Response Envelope | None | Standard | Wave-05 |
| Dead Code Components | 85 | 0 | Wave-04 |
| Domain Events Published | 0 | 18 | Wave-04 |

---

## WP1 — Recovery Manifest

### Wave Overview

| Wave | Name | Duration | Root Causes | Findings Eliminated | Score Gain |
|---|---|---|---|---|---|
| **01** | Configuration & Coordination | 2 days | RC-B, RC-C | ~17 | 36% → 42% |
| **02** | Infrastructure Foundation | 3 weeks | RC-D | ~22 | 42% → 58% |
| **03** | Controller Recovery | 2 weeks | RC-A | ~15 | 58% → 62% |
| **04** | Enterprise Adoption | 6 weeks | RC-P | ~40 | 62% → 72% |
| **05** | EOS Backend Contracts | 2 weeks | RC-D (contracts) | ~6 | 72% → 76% |
| **06** | Production Hardening | 3 weeks | Residual | ~5 | 76% → 78% |
| **07** | Performance & Scale | 3 weeks | Residual | ~3 | 78% → 80% |
| **08** | Enterprise Certification | 1 week | Verification | — | 80% → 82% |

### Detailed Wave Manifest

#### Wave-01: Configuration & Coordination

| Field | Value |
|---|---|
| **Objective** | Fix configuration omissions and coordination errors that block fundamental security and validation |
| **Root Causes** | RC-B (Config Omissions), RC-C (Coordination Errors) |
| **Reports affected** | EV-01, EV-04, EV-05, EV-10, EV-11 |
| **Score increase** | 36% → 42% (+6%) |
| **Duration** | 2 days |
| **Regression risk** | MINIMAL — all changes are additive (no existing behavior changes) |
| **Verification required** | `npx tsc --noEmit`, eslint, validation tests, auth tests, `npx jest test/validation/ test/errors/` |
| **Dependencies** | None |
| **Exit criteria** | All verification passes. 17 findings confirmed eliminated. |

#### Wave-02: Infrastructure Foundation

| Field | Value |
|---|---|
| **Objective** | Add missing enterprise infrastructure: Redis caching/queue, database indexes, connection pooling |
| **Root Causes** | RC-D (Infrastructure Gaps) |
| **Reports affected** | EV-02, EV-06, EV-09 |
| **Score increase** | 42% → 58% (+16%) |
| **Duration** | 3 weeks |
| **Regression risk** | MODERATE — Redis replaces in-memory stores; indexes require migration |
| **Verification required** | Full test suite, integration tests, manual testing of CSRF/queue/metrics |
| **Dependencies** | Wave-01 (ESM uuid fix needed for test validation) |
| **Exit criteria** | All 6 in-memory stores replaced with Redis. All 63 area models indexed. Connection pool configured. 22 findings confirmed eliminated. |

#### Wave-03: Controller Recovery

| Field | Value |
|---|---|
| **Objective** | Remove PrismaService from all 20 controllers. Route all DB access through service layer. |
| **Root Causes** | RC-A (Controller Bypass) |
| **Reports affected** | EV-03, EV-07, EV-10 |
| **Score increase** | 58% → 62% (+4%) |
| **Duration** | 2 weeks |
| **Regression risk** | MODERATE — refactoring 20 controllers requires careful testing |
| **Verification required** | Full test suite, per-controller manual testing, architecture diff review |
| **Dependencies** | Wave-02 (Redis for queue required for background job controllers) |
| **Exit criteria** | Zero controllers import PrismaService. 15 findings confirmed eliminated. |

#### Wave-04: Enterprise Adoption

| Field | Value |
|---|---|
| **Objective** | Migrate 10 key services to EnterpriseService. Wire domain events, exceptions, policies into runtime. |
| **Root Causes** | RC-P (Architecture Parallelism) |
| **Reports affected** | EV-04, EV-05, EV-10, EV-11 |
| **Score increase** | 62% → 72% (+10%) |
| **Duration** | 6 weeks |
| **Regression risk** | HIGH — pipeline adoption changes fundamental execution paths |
| **Verification required** | Pipeline tests, integration tests, per-service end-to-end tests, architecture verification |
| **Dependencies** | Wave-02 (Redis for pipeline metrics/queue), Wave-03 (controllers must be clean first) |
| **Exit criteria** | Pipeline adoption >= 15%. Domain events published for 5+ operations. Domain exceptions thrown in 10+ paths. Dead code removed. 40 findings confirmed eliminated. |

#### Wave-05: EOS Backend Contracts

| Field | Value |
|---|---|
| **Objective** | Add standardized response envelope, pagination metadata, correlation ID headers, risk level exposure |
| **Root Causes** | RC-D (contract portion) |
| **Reports affected** | EV-07, EV-11 |
| **Score increase** | 72% → 76% (+4%) |
| **Duration** | 2 weeks |
| **Regression risk** | MODERATE — response format changes may break existing frontend integrations |
| **Verification required** | Frontend smoke tests, API contract tests per endpoint |
| **Dependencies** | Wave-04 (operation metadata needed from pipeline) |
| **Exit criteria** | All endpoints return standardized envelope. Pagination metadata present. X-Correlation-Id in all responses. 6 findings confirmed eliminated. |

#### Wave-06: Production Hardening

| Field | Value |
|---|---|
| **Objective** | Write comprehensive tests for enterprise runtime, integration tests, delete dead code |
| **Reports affected** | EV-10 |
| **Score increase** | 76% → 78% (+2%) |
| **Duration** | 3 weeks |
| **Regression risk** | LOW — tests are additive |
| **Dependencies** | Wave-04 (tests must cover pipeline code) |
| **Exit criteria** | Pipeline test coverage >= 70%. Integration tests >= 20 passing. 85 dead code components removed. |

#### Wave-07: Performance & Scale

| Field | Value |
|---|---|
| **Objective** | Performance benchmarks, load testing, connection pool tuning, query optimization |
| **Reports affected** | EV-09 |
| **Score increase** | 78% → 80% (+2%) |
| **Duration** | 3 weeks |
| **Regression risk** | LOW — optimization only |
| **Dependencies** | Wave-02 (infrastructure must be in place to benchmark) |
| **Exit criteria** | Load test: 1,000 concurrent requests with < 500ms p95 latency. Zero full table scans. |

#### Wave-08: Enterprise Certification

| Field | Value |
|---|---|
| **Objective** | Independent re-verification of all EV findings, updated enterprise score, final certification |
| **Reports affected** | All EV reports |
| **Score increase** | 80% → 82%（+2%) |
| **Duration** | 1 week |
| **Regression risk** | NONE — verification only |
| **Dependencies** | All previous waves complete |
| **Exit criteria** | EV-14 (Post-Recovery Verification) report confirms target scores achieved. |

---

## WP2 — Recovery Governance

### Mandatory Implementation Lifecycle

Every wave MUST follow this lifecycle. No wave may skip any stage.

```
┌─────────────────────────────────────────────────────────────┐
│  STAGE 1: PLANNING                                          │
│  Approve scope, identify files, estimate effort              │
│  Output: Wave Implementation Plan                            │
├─────────────────────────────────────────────────────────────┤
│  STAGE 2: IMPLEMENTATION                                     │
│  Write code. Follow ERP enterprise rules.                    │
│  Output: Code changes                                         │
├─────────────────────────────────────────────────────────────┤
│  STAGE 3: ADOPTION VALIDATION                                │
│  Verify new code is actually used, not just present.         │
│  Count: adoptions, usages, executions.                       │
│  Output: Adoption metrics report                              │
├─────────────────────────────────────────────────────────────┤
│  STAGE 4: INDEPENDENT VERIFICATION                           │
│  Run all tests. Verify no regressions.                       │
│  Output: Test results                                         │
├─────────────────────────────────────────────────────────────┤
│  STAGE 5: REGRESSION VERIFICATION                            │
│  Verify no previous EV finding has re-emerged.               │
│  Output: Regression report                                    │
├─────────────────────────────────────────────────────────────┤
│  STAGE 6: WAVE CERTIFICATION                                  │
│  Update findings database. Update enterprise score.          │
│  Output: Wave completion report                               │
└─────────────────────────────────────────────────────────────┘
```

### Governance Rules

| Rule | Description | Enforcement |
|---|---|---|
| **GOV-01** | No wave may begin until its dependencies are certified complete | ERP program manager |
| **GOV-02** | No implementation may proceed outside ERP scope | Code review rejection |
| **GOV-03** | All changes must pass `npx tsc --noEmit` with 0 errors | CI gate |
| **GOV-04** | All changes must pass eslint with 0 errors | CI gate |
| **GOV-05** | All changes must pass existing tests | CI gate |
| **GOV-06** | New code must have >= 80% test coverage | Code review gate |
| **GOV-07** | No controller may import PrismaService | Architecture review gate |
| **GOV-08** | No new service may bypass EnterpriseService | Architecture review gate |
| **GOV-09** | Every new operation must define validators, policies, approvals | Architecture review gate |
| **GOV-10** | Every wave must produce an adoption metrics report | Wave certification gate |

---

## WP3 — Enterprise Adoption Policy

### Permanent Engineering Rules

These rules become the permanent engineering standards for EOX. Violations must fail code review.

#### Rule 1: Service Layer Mandatory

```
FORBIDDEN:           Controller → PrismaService directly
                     Controller → Repository directly
                     Controller → Query builder directly

REQUIRED:            Controller → Service → (optionally → EnterpriseService → Pipeline → Prisma)
```

#### Rule 2: Pipeline Execution Mandatory

```
Every business operation must execute through EnterprisePipeline.

Each operation MUST define:
  • validators[]    — at least 1 domain validator
  • policies[]      — at least 1 policy
  • approvals       — appropriate approval level
  • riskScore       — 1-10 based on business impact
  • auditLevel      — 'full' for mutations
```

#### Rule 3: Domain Event Publishing

```
Every write operation (create, update, delete, assign, transfer)
MUST publish at least 1 domain event after successful execution.
```

#### Rule 4: Domain Exception Usage

```
Services MUST throw domain exceptions (not generic HTTP errors).
Controllers MUST NOT catch domain exceptions — exception filter handles them.
```

#### Rule 5: Response Contract

```
Every endpoint MUST return responses in the standardized envelope:
  { data, error, meta }

Every list endpoint MUST support:
  ?page=&pageSize=&sort=&filter=&q=

Every list response MUST include:
  meta: { page, pageSize, total, totalPages }
```

#### Rule 6: Transaction Boundary

```
Every write operation affecting multiple tables MUST use prisma.$transaction().
The EnterprisePipeline automatically wraps high-risk (riskScore >= 5) operations.
```

#### Rule 7: Dead Code Prohibition

```
No unused code may remain in the codebase for more than one wave.
Dead code detection is mandatory before every wave certification.
```

---

## WP4 — Recovery Success Metrics

### Measurable KPIs

| KPI | Current | Target | Measurement Method |
|---|---|---|---|
| **Pipeline Adoption %** | 2% | 50%+ | Count services extending EnterpriseService / total services |
| **Controller Compliance %** | 52% | 100% | Count controllers WITHOUT PrismaService / total controllers |
| **Domain Event Usage %** | 0% | 100% | Count operations publishing events / total write operations |
| **Policy Execution %** | 25% | 100% | Count policies evaluated / total registered policies |
| **Approval Coverage %** | 0% | 100% | Count operations with approval / total operations requiring approval |
| **Validator Pipeline %** | 0% | 100% | Count validator lookups that succeed / total validator lookups |
| **Transaction Coverage %** | ~1% | 100% | Count operations using $transaction / total high-risk operations |
| **Runtime Timeline %** | 2% | 50%+ | Count operations with timeline record / total operations |
| **EOS Contract Coverage %** | 10% | 100% | Count endpoints with standardized envelope / total endpoints |
| **Dead Code %** | ~12% | 0% | Count dead components / total components |
| **RBAC Enforcement %** | 0% | 100% | Count endpoints with @Roles() enforced / total protected endpoints |
| **Prisma Controller Count** | 20 | 0 | Count controllers importing PrismaService |
| **Area Index Count** | 0 | 100+ | Count @@index annotations in area schema |
| **Integration Test Pass Rate** | 0% | 100% | Count passing integration tests / total integration tests |

### KPI Dashboard Format

Each wave completion report MUST include:
```
ERP Scorecard — Wave-[N]

Pipeline Adoption:     XX% (target: YY%)
Controller Compliance: XX% (target: YY%)
[All KPIs listed]

Score improved: +ZZ%
Remaining findings: WW
```

---

## WP5 — Wave Definitions

### Wave-01: Configuration & Coordination

#### Scope

| Change | File | Description |
|---|---|---|
| 1 | `backend/src/app.module.ts` | Add `{ provide: APP_GUARD, useClass: RolesGuard }` |
| 2 | `backend/src/app.module.ts` | Add `{ provide: APP_GUARD, useClass: PermissionsGuard }` |
| 3 | `backend/src/enterprise/registry/operation-registry.ts` | Fix 8 validator class names → dot-notation names |
| 4 | `backend/jest.config.ts` | Add `transformIgnorePatterns` for ESM uuid |
| 5 | `backend/docker-compose.yml` | Remove hardcoded JWT_SECRET and ADMIN_PASS |

#### Risk Assessment

| Risk | Probability | Mitigation |
|---|---|---|
| RolesGuard breaks public endpoints | LOW | `@Public()` decorator already bypasses GlobalAuthGuard |
| Validator name change misses a case | LOW | 8 specific changes — verify each against domain-validators.ts |
| Jest config change breaks other transforms | LOW | Test-specific change |
| docker-compose secrets needed locally | MEDIUM | Add `.env.example` file with placeholders |

#### Rollback Plan

Each change is independent. Rollback individually by reverting the specific file change.

#### Acceptance Criteria

- [ ] `npx tsc --noEmit` — 0 errors
- [ ] `npx eslint --quiet .` — 0 errors
- [ ] Auth tests — all pass
- [ ] Validation tests (101) — all pass
- [ ] Error tests (43) — all pass
- [ ] Audit tests — all pass
- [ ] RBAC enforced: endpoint without matching role returns 403
- [ ] Pipeline validation: validator with matching name executes correctly
- [ ] At least 5 previously failing integration tests now pass

---

### Wave-02: Infrastructure Foundation

#### Scope

| Change | Description |
|---|---|
| 1 | Add Redis container to docker-compose.yml |
| 2 | Create Redis-backed CsrfStoreService |
| 3 | Create Redis-backed WorkerQueueService |
| 4 | Connect RuntimeMetricsEngine to Prometheus export |
| 5 | Generate Prisma migration adding @@index to all 63 area models |
| 6 | Configure Prisma connection pool: `?connection_limit=20&pool_timeout=30` |
| 7 | Add SecretCacheService Redis backend (optional) |

#### Risk Assessment

| Risk | Probability | Mitigation |
|---|---|---|
| Redis dependency adds operational complexity | MEDIUM | Managed Redis (Upstash/ElastiCache) reduces ops burden |
| Index migration locks large tables | HIGH | Run as background migration, use CONCURRENTLY where possible |
| Metrics export format change | LOW | Prometheus format is standard |

#### Rollback Plan

- Redis: Revert to in-memory implementations (keep Redis modules as fallback)
- Indexes: Generate down-migration
- Connection pool: Revert DATABASE_URL

#### Acceptance Criteria

- [ ] Horizontal scaling: 2 backend instances share CSRF/queue state
- [ ] WorkerQueue: jobs survive container restart
- [ ] Area queries: `EXPLAIN ANALYZE` shows index scans, not sequential scans
- [ ] Metrics: Prometheus scrape target responds
- [ ] Connection pool: 20 connections confirmed

---

### Wave-03: Controller Recovery

#### Scope

Remove PrismaService from these 20 controllers:

| Priority | Controller | Current Lines | Strategy |
|---|---|---|---|
| HIGH | `billing.controller.ts` | 481 | Route through BillingApplicationService |
| HIGH | `readings.controller.ts` | 376 | Route through ReadingsService |
| HIGH | `customers.controller.ts` | 260 | Route through CustomersService |
| HIGH | `meters.controller.ts` | 183 | Route through MetersService |
| HIGH | `invoices.controller.ts` | 197 | Route through InvoiceQueryService |
| MEDIUM | `auth.controller.ts` | 222 | Route through AuthService (already partially) |
| MEDIUM | `collections.controller.ts` | 153 | Add CollectionsService methods |
| MEDIUM | `payments.controller.ts` | 106 | Route through PaymentsService |
| MEDIUM | 12 remaining smaller controllers | varies | Add service methods as needed |

#### Acceptance Criteria

- [ ] Zero controllers import PrismaService
- [ ] All existing functionality preserved
- [ ] All existing tests pass
- [ ] Per-controller manual testing of 3 endpoints minimum

---

### Wave-04: Enterprise Adoption

#### Scope

| Phase | Change | Services |
|---|---|---|
| 4a | Extend EnterpriseService | Add missing pipeline services: billing, invoice, payment operations |
| 4b | Migrate customers | CustomersService → extends EnterpriseService |
| 4c | Migrate meters | MetersService → extends EnterpriseService |
| 4d | Migrate billing | BillingApplicationService → extends EnterpriseService |
| 4e | Migrate readings | ReadingsService → extends EnterpriseService |
| 4f | Wire domain events | Publish events in 5+ write operations |
| 4g | Wire domain exceptions | Replace generic HTTP exceptions in 10+ paths |
| 4h | Write pipeline tests | 10+ tests covering all 12 lifecycle stages |
| 4i | Delete dead code | Remove 85 unused components |
| 4j | Expose timeline API | GET /enterprise/operations/recent endpoint |

#### Acceptance Criteria

- [ ] Pipeline adoption >= 15% (15+ services)
- [ ] Domain events published for 5+ operations
- [ ] Domain exceptions thrown in 10+ code paths
- [ ] Pipeline test coverage >= 70%
- [ ] Dead code components removed: 85 → 0
- [ ] Operation timeline API returns real data
- [ ] 40+ findings confirmed eliminated

---

### Wave-05: EOS Backend Contracts

#### Scope

| Change | Description |
|---|---|
| 1 | Create global response envelope interceptor: `{ data, error, meta }` |
| 2 | Add pagination metadata helper |
| 3 | Apply pagination metadata to all list endpoints |
| 4 | Return `X-Correlation-Id` response header |
| 5 | Expose `riskScore` from operation metadata in responses |
| 6 | Add `GET /enterprise/operations/recent` for Command Center |

#### Acceptance Criteria

- [ ] All endpoints return standardized envelope
- [ ] All list endpoints include `meta: { page, pageSize, total }`
- [ ] All list endpoints support `?page=&pageSize=&sort=&filter=`
- [ ] X-Correlation-Id header present in all responses
- [ ] EOS-001, EOS-002, EOS-003, EOS-009, EOS-015 confirmed eliminated

---

### Wave-06: Production Hardening

#### Scope

| Change | Description |
|---|---|
| 1 | Pipeline unit tests (10+ tests, 12 lifecycle stages) |
| 2 | Domain event integration tests |
| 3 | Policy evaluation tests |
| 4 | Approval flow tests |
| 5 | Transaction boundary tests |
| 6 | End-to-end operation tests (3+ full flows) |

#### Acceptance Criteria

- [ ] Pipeline tests: 10+ passing
- [ ] Integration tests: 20+ passing
- [ ] Domain event tests: 5+ passing
- [ ] Test coverage: pipeline >= 80%

---

### Wave-07: Performance & Scale

#### Scope

| Change | Description |
|---|---|
| 1 | Load test script (k6/artillery) |
| 2 | Benchmark: 100 concurrent users |
| 3 | Benchmark: 1,000 concurrent users |
| 4 | Identify and optimize top 3 slowest queries |
| 5 | Connection pool tuning |
| 6 | Response compression (if not yet configured) |

#### Acceptance Criteria

- [ ] 100 concurrent: p95 < 200ms
- [ ] 1,000 concurrent: p95 < 500ms
- [ ] Zero full table scans in area queries
- [ ] Connection pool: optimal size determined by load test

---

### Wave-08: Enterprise Certification

#### Scope

| Change | Description |
|---|---|
| 1 | Re-run all EV verification checks |
| 2 | Measure all KPIs |
| 3 | Compare scores against targets |
| 4 | Generate EV-14 — Post-Recovery Enterprise Verification |
| 5 | Update enterprise score to final value |
| 6 | Certify Enterprise Recovery complete |

#### Acceptance Criteria

- [ ] Enterprise score >= 80%
- [ ] All KPIs meet or exceed targets
- [ ] EV-14 report confirms recovery
- [ ] All previous EV findings addressed

---

## WP6 — Recovery Dependency Graph

```
Wave-01: Config & Coordination
  ├── No dependencies
  ├── Required by: ALL subsequent waves
  └── Unlocks: RBAC, validation, tests

Wave-02: Infrastructure Foundation
  ├── Depends on: Wave-01 (test results needed)
  ├── Required by: Wave-04, Wave-07
  └── Unlocks: horizontal scaling, queue persistence, DB performance

Wave-03: Controller Recovery
  ├── Depends on: Wave-02 (queue for background jobs)
  ├── Required by: Wave-04 (clean controllers before pipeline adoption)
  └── Unlocks: clean architecture, centralized error handling

Wave-04: Enterprise Adoption
  ├── Depends on: Wave-02 (Redis), Wave-03 (clean controllers)
  ├── Required by: Wave-05 (pipeline data for contracts), Wave-06 (pipeline code for tests)
  └── Unlocks: ALL enterprise features — events, exceptions, policies, timeline, metrics

Wave-05: EOS Backend Contracts
  ├── Depends on: Wave-04 (operation metadata from pipeline)
  ├── Required by: Wave-08 (EOS readiness verification)
  └── Unlocks: standardized frontend contracts

Wave-06: Production Hardening
  ├── Depends on: Wave-04 (pipeline code to test)
  ├── Required by: Wave-08 (test coverage verification)
  └── Unlocks: reliable test suite

Wave-07: Performance & Scale
  ├── Depends on: Wave-02 (infrastructure to benchmark)
  ├── Required by: Wave-08 (performance verification)
  └── Unlocks: validated production scalability

Wave-08: Enterprise Certification
  └── Depends on: ALL previous waves
      └── Output: Final certified enterprise platform
```

### Automatic Finding Elimination Map

```
Wave-01 fixes → 17 findings automatically eliminated
  ├── EV-01-003 (RolesGuard not global) → RBAC enforcement ✅
  ├── EV-01-004 (PermissionsGuard not global) → Permission enforcement ✅
  ├── EV-01-009 (6 controllers without roles) → Now covered by APP_GUARD ✅
  ├── EV-04-004 (Validator naming mismatch) → Validation pipeline works ✅
  ├── EV-05-002 (Validation pipeline broken) → Fixed by naming alignment ✅
  ├── EOS-007 (No validation state) → Now available from pipeline ✅
  ├── EV-10-009 (18 tests broken) → ESM uuid fixed ✅
  └── 10 more findings indirectly resolved

Wave-02 fixes → 22 findings automatically eliminated
  ├── EV-02-003 (No caching) → Redis cache ✅
  ├── EV-02-004 (In-memory queue) → Redis queue ✅
  ├── EV-02-008 (4 in-memory stores) → Now 6 of 7 resolved ✅
  ├── EV-06-006 (Zero area indexes) → All indexed ✅
  ├── EV-09-003 (Full table scans) → Index scans ✅
  ├── EV-09-006 (Unbounded memory) → Redis-backed bounded queue ✅
  ├── EV-09-007 (Scaling blocked) → Stateless possible ✅
  └── 15 more findings indirectly resolved
```

---

## WP7 — Verification Strategy

### Per-Wave Verification Requirements

| Wave | Unit Tests | Integration Tests | Architecture | Security | Performance | Regression | Adoption | Enterprise |
|---|---|---|---|---|---|---|---|---|
| **01** | ✅ Required | — | ✅ | ✅ | — | ✅ | ✅ | — |
| **02** | ✅ Required | ✅ Required | ✅ | — | ✅ | ✅ | — | — |
| **03** | ✅ Required | ✅ Required | ✅ | — | — | ✅ | ✅ | — |
| **04** | ✅ Required | ✅ Required | ✅ | ✅ | — | ✅ | ✅ | ✅ |
| **05** | — | ✅ Required | ✅ | — | — | ✅ | ✅ | — |
| **06** | ✅ Required | ✅ Required | — | — | — | ✅ | — | — |
| **07** | — | — | — | — | ✅ | ✅ | — | — |
| **08** | — | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Mandatory Test Commands

Every wave implementation must run and pass:

```bash
# TypeScript compilation
npx tsc --noEmit

# Linting
npx eslint --quiet .

# Test suites (wave-dependent)
npx jest --no-cache test/validation/
npx jest --no-cache test/audit/
npx jest --no-cache test/errors/
npx jest --no-cache test/auth/
npx jest --no-cache test/events/

# After Wave-01 (ESM fix): full suite
npx jest --no-cache

# Prisma validation
npx prisma validate
```

---

## WP8 — Recovery Documentation

### ERP Document Index

| Document | Location | Description |
|---|---|---|
| **ERP-00** | `ERP-00-ENTERPRISE-RECOVERY-PLAN.md` | **This document** — Master implementation contract |
| EV-01 | `EV-01-INDEPENDENT-SECURITY-VERIFICATION.md` | Security findings |
| EV-02 | `EV-02-INDEPENDENT-INFRASTRUCTURE-VERIFICATION.md` | Infrastructure findings |
| EV-03 | `EV-03-INDEPENDENT-ARCHITECTURE-VERIFICATION.md` | Architecture findings |
| EV-04 | `EV-04-INDEPENDENT-DOMAIN-VERIFICATION.md` | Domain findings |
| EV-05 | `EV-05-RUNTIME-EXECUTION-VERIFICATION.md` | Runtime findings |
| EV-06 | `EV-06-INDEPENDENT-DATABASE-VERIFICATION.md` | Database findings |
| EV-07 | `EV-07-INDEPENDENT-API-VERIFICATION.md` | API findings |
| EV-09 | `EV-09-INDEPENDENT-PERFORMANCE-VERIFICATION.md` | Performance findings |
| EV-10 | `EV-10-INDEPENDENT-MAINTAINABILITY-VERIFICATION.md` | Maintainability findings |
| EV-11 | `EV-11-EOS-FRONTEND-READINESS-VERIFICATION.md` | EOS readiness findings |
| EV-12 | `EV-12-ENTERPRISE-MASTER-CERTIFICATION.md` | Root cause consolidation |
| EV-13 | `EV-13-ROOT-CAUSE-MASTER-REPORT.md` | Remediation planning |
| **ERP-00** | **`ERP-00-ENTERPRISE-RECOVERY-PLAN.md`** | **Master implementation contract** |

### Architecture Documentation to Update

After each wave, the following documentation should be updated to reflect the new state:

| Document | Update Trigger |
|---|---|
| `README.md` | After every wave — update architecture diagram, scores, status |
| `ROUTE_OF_DATA.md` | After Wave-04 — update data flow through pipeline |
| `AGENTS.md` | After Wave-01 — update governance rules |
| `docs/architecture/` | After Wave-03 — update controller architecture |
| `docs/main-plan/06-tasks.md` | After every wave — mark tasks complete |

---

## Final Recommendation

### Start With Wave-01: Configuration & Coordination

Wave-01 is the single highest-impact-per-effort wave in the entire recovery program.

```
5 file changes
~2 days of work
~17 findings eliminated
+6% enterprise score
Unlocks ALL subsequent waves
Zero regression risk
```

Wave-01 changes are:
1. **Additive** — no existing behavior is modified
2. **Independent** — no dependencies on other work
3. **Reversible** — each change can be rolled back individually
4. **Verifiable** — existing tests confirm correctness

**No other wave should begin until Wave-01 is certified complete.**

### ERP Governance Seal

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   ENTERPRISE RECOVERY PROGRAM — ERP-00                                ║
║   Master Implementation Contract                                      ║
║                                                                      ║
║   Status: ACTIVE                                                      ║
║   Governing Body: Enterprise Verification Board                       ║
║   Scope: All EOX Platform implementation work                         ║
║   Authority: EV-01 through EV-13 evidence                             ║
║                                                                      ║
║   "Nothing may be implemented outside this plan."                     ║
║   "The architecture is valid. The adoption is what's missing."        ║
║   "Start with Wave-01. Five changes, two days, seventeen findings."   ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```
