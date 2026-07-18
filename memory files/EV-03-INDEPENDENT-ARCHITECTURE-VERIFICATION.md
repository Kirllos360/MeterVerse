# EV-03 — Independent Enterprise Architecture Verification

**Verification Body:** Independent Enterprise Review Board  
**Methodology:** Source-code-based architecture audit — no prior certifications trusted  
**Date:** 2026-07-02  

---

## Executive Summary

**Certification: VERIFIED WITH CRITICAL OBSERVATIONS**

**Overall Architecture Score: 38%**

The codebase is structurally organized as a NestJS modular monolith with clear module boundaries. However, there is a **fundamental Clean Architecture violation**: 47.6% of controllers bypass the service layer and directly access the database via PrismaService. The domain layer is almost entirely dead code — all 13 domain exceptions and all 18 domain events are defined but never instantiated. Enterprise patterns (pipeline, service base class) exist but have 2% adoption.

---

## WP1 — Clean Architecture Layer Matrix

### Intended Architecture

```
Controller (routes)
    ↓
Service (business logic / application)
    ↓
Domain (entities, policies, events, exceptions)
    ↓
Infrastructure (Prisma, DB, external APIs)
```

### Actual Architecture

| Layer | Files | Description |
|---|---|---|
| **Controllers** | 42 files | Route handlers |
| **Services** | ~101 files | Business logic (Application layer) |
| **Domain** | 6 files | Policies, events, exceptions, context |
| **Infrastructure/Common** | ~30 files | DB, caching, config, logging, secrets |
| **Shared Modules** | ~10 files | Validation, events, observability |

### Layer Violation: Controllers Bypassing Service Layer

| Metric | Value |
|---|---|
| Total controllers | **42** |
| Controllers importing **PrismaService directly** | **20 (47.6%)** |
| Controllers using only services | **22 (52.4%)** |
| Controllers extending EnterpriseService | **0 (0%)** |

**Finding EV-03-001: 20 controllers directly access the database layer (CRITICAL)**

| Controller | Layer Violation |
|---|---|
| `admin.controller.ts` | PrismaService imported directly |
| `auth.controller.ts` | PrismaService imported directly |
| `bill-cycle.controller.ts` | PrismaService imported directly |
| `billing.controller.ts` | PrismaService imported directly |
| `chilled-water.controller.ts` | PrismaService imported directly |
| `collections.controller.ts` | PrismaService imported directly |
| `customer-search.controller.ts` | PrismaService imported directly |
| `customers.controller.ts` | PrismaService imported directly |
| `downloads.controller.ts` | PrismaService imported directly |
| `gas.controller.ts` | PrismaService imported directly |
| `invoices.controller.ts` | PrismaService imported directly |
| `meters.controller.ts` | PrismaService imported directly |
| `payments.controller.ts` | PrismaService imported directly |
| `portal.controller.ts` | PrismaService imported directly |
| `readings.controller.ts` | PrismaService imported directly |
| `search.controller.ts` | PrismaService imported directly |
| `settlement.controller.ts` | PrismaService imported directly |
| `sim-cards.controller.ts` | PrismaService imported directly |
| `solar.controller.ts` | PrismaService imported directly |
| `upload.controller.ts` | PrismaService imported directly |

---

## WP2 — Dependency Direction Violations

### Dependency Flow (Allowed)

```
Controller → Service → Domain → Infrastructure
```

### Detected Violations

| Violation | Count | Severity |
|---|---|---|
| Controller → Infrastructure (PrismaService) | **20 controllers** | CRITICAL |
| Controller → Domain (inline business logic) | **4 controllers** | HIGH |
| Service bypassing Enterprise abstraction | **99 services (98%)** | HIGH |

### Finding EV-03-002: Inline Business Logic in Controllers

- **Files:** `auth.controller.ts` (lockout logic 3/6/9 thresholds), `billing.controller.ts` (invoice state machine rules), `admin.controller.ts` (SQL whitelist logic), `chilled-water.controller.ts` (allocation rules)
- **Description:** Business rules implemented directly in controller methods instead of being in the service or domain layer
- **Evidence:** Lockout thresholds, invoice status transitions, SQL table whitelisting, and allocation calculations exist as inline code in controllers

---

## WP3 — Domain Layer Adoption (Critical)

### Domain Component Dead Code Analysis

| Component | Defined | Actually Used | Status |
|---|---|---|---|
| **Domain Exceptions** | **13 classes** | **0 thrown** | **100% DEAD** |
| **Domain Events** | **18 classes** | **0 instantiated** | **100% DEAD** |
| **OperationEngine** | 1 class | 0 references (outside own file) | **DEAD** |
| **BasePolicy** | Abstract class | Used by 8 policy classes | ✅ ALIVE |
| **PolicyEngine** | 1 class | Used by pipeline | ✅ ALIVE |
| **Enterprise Policies** | 8 classes | 2 evaluated (area, approval) | 75% DEAD |
| **OperationContext** | 1 class | Used by integrator + services | ✅ ALIVE |
| **OperationRegistry** | 23 operations | 3 called from code | 87% DEAD |

### Finding EV-03-003: Entire Domain Exception Layer Is Dead Code

- **Severity:** CRITICAL
- **Evidence:** All 13 domain exception classes (`MeterAlreadyAssignedException`, `MeterNotFoundException`, `CustomerNotFoundException`, etc.) are defined in `domain-exceptions.ts` but **thrown zero times** across the entire codebase.
- **Root Cause:** Architecture exists but was never wired. The services use generic HTTP exceptions instead.

### Finding EV-03-004: Entire Domain Event Layer Is Dead Code

- **Severity:** CRITICAL
- **Evidence:** All 18 domain event classes (`CustomerCreated`, `MeterInstalled`, `InvoiceGenerated`, etc.) are defined in `enterprise-events.ts` but **instantiated zero times**.
- **Root Cause:** Event-driven architecture was designed but never connected to runtime code.

### Finding EV-03-005: OperationEngine Is Dead Code

- **Severity:** HIGH
- **Evidence:** `OperationEngine` in `domain/operations/operation-engine.ts` is never imported or used by any service or controller.
- **Root Cause:** Superseded by EnterprisePipeline, but neither is actually used for real operations.

---

## WP4 — Business Rule Verification

### Centralized Business Rules

| Component | Status |
|---|---|
| `BusinessRuleService` | ✅ Active — used by 10+ files |
| `ValidationRuleService` | ✅ Active — 20 validators registered |
| `Domain validators` | ✅ Active — domain-validators.ts |

### Scattered Business Logic

| Location | Business Rule | Risk |
|---|---|---|
| `auth.controller.ts:85-101` | Progressive lockout (3/6/9 failures) | HIGH — in controller, not service |
| `billing.controller.ts:104` | Invoice status transition rules | HIGH — in controller, not domain |
| `admin.controller.ts:94` | SQL table whitelist | MEDIUM — in controller |
| `chilled-water.controller.ts` | Allocation rules | MEDIUM — in controller |

### Finding EV-03-006: Duplicate Lockout Logic

- **Severity:** MEDIUM
- **Evidence:** `PasswordPolicyService.MAX_ATTEMPTS = 5` uses 5-attempt window, while `auth.controller.ts` uses 3/6/9 thresholds for progressive lockout. Two competing lockout implementations exist. Neither references the other.

---

## WP5 — Enterprise Pattern Adoption

| Pattern | Exists | Actually Executed | Adoption |
|---|---|---|---|
| EnterpriseService | ✅ | For 2 services | **2%** |
| OperationIntegrator | ✅ | For 2 services | **2%** |
| EnterprisePipeline | ✅ | For 2 services | **2%** |
| OperationRegistry | ✅ | 23 defined, 3 called | **13%** |
| PolicyEngine | ✅ | 8 policies, 2 evaluated | **25%** |
| ValidationRuleService | ✅ | 20 validators | ✅ Active |
| Approval Engine | ✅ | 5 levels | **2%** |
| RuntimeCoordinator | ✅ | Exists | ❌ Not measured |
| Timeline Engine | ✅ | In pipeline | **2%** |
| Metrics Engine | ✅ | 21 metrics | **2%** |

### Finding EV-03-007: EnterprisePatterns — Architecture Exists But Never Executes

- **Severity:** CRITICAL
- **Description:** This is the single most pervasive pattern in the codebase — sophisticated enterprise abstractions exist (pipeline, events, exceptions, policies) but none of them execute for real operations (outside 2 test services).
- **Affected components:** EnterprisePipeline, OperationRegistry, 18 domain events, 13 domain exceptions, 6 unused policies, OperationEngine

---

## WP6 — Modularity Verification

### Module Cohesion

| Quality | Assessment |
|---|---|
| Module boundaries | ✅ Clear — each domain has its own module |
| Controller/Service separation | ✅ Most modules have separate controller + service |
| Shared infrastructure | ✅ Common module for cross-cutting |
| DTO isolation | ⚠️ Some DTOs live in modules, some inline |
| Module coupling | ⚠️ Some modules import from other modules directly |

### Bounded Context Integrity

| Bounded Context | Status |
|---|---|
| Customers | ✅ Clean — controller + service + DTOs |
| Meters | ⚠️ Controller bypass — prisma in controller |
| Billing | ⚠️ Large controller (18 endpoints) with inline logic |
| Payments | ⚠️ Minimal — controller has Prisma |
| Readings | ⚠️ Controller has Prisma + business logic |

---

## WP7 — Multi-Tenant Scalability Architecture

| Aspect | Status |
|---|---|
| Area isolation via schema | ✅ Designed — `@@schema("area")` |
| Area guard (tenant isolation) | ✅ Global guard active |
| Area schema template | ✅ Exists |
| Area replication (15 areas) | ❌ Not executed |
| Area indexes | ❌ Zero indexes on any area model |
| Cross-area queries | ⚠️ Not designed |

---

## WP8 — Technical Debt Inventory

### Dead Code Summary

| Category | Count |
|---|---|
| Unused domain exceptions | 13 |
| Unused domain events | 18 |
| Unused registry operations | 20/23 |
| Unused policies | 6/8 |
| **Total dead code components** | **57** |

### Architecture Debt

| Item | Severity |
|---|---|
| 20 controllers bypass service layer | CRITICAL |
| 99 services bypass enterprise pipeline | CRITICAL |
| Domain layer is 90% dead code | CRITICAL |
| Duplicate lockout logic | MEDIUM |
| Business rules in controllers | HIGH |

---

## WP9 — Enterprise Readiness Score

| Category | Score |
|---|---|
| Architecture Integrity | **35%** |
| Layer Isolation | **30%** |
| Domain Layer Usage | **5%** |
| Enterprise Pattern Adoption | **10%** |
| Pipeline Adoption | **2%** |
| Maintainability | **55%** |
| Extensibility | **60%** |
| Modularity | **65%** |
| Scalability (multi-tenant) | **40%** |
| Technical Debt | **30%** |

**Overall Architecture Score: 38%**

---

## WP10 — Findings Database

| ID | Category | Severity | Component | Description |
|---|---|---|---|---|
| EV-03-001 | Layer Violation | CRITICAL | 20 controllers | Controllers import PrismaService directly |
| EV-03-002 | Layer Violation | HIGH | 4 controllers | Business logic implemented in controllers |
| EV-03-003 | Dead Code | CRITICAL | `domain-exceptions.ts` | All 13 domain exceptions never thrown |
| EV-03-004 | Dead Code | CRITICAL | `enterprise-events.ts` | All 18 domain events never instantiated |
| EV-03-005 | Dead Code | HIGH | `operation-engine.ts` | OperationEngine never used |
| EV-03-006 | Duplicate Logic | MEDIUM | auth + password policy | Two competing lockout implementations |
| EV-03-007 | Pattern Gap | CRITICAL | Enterprise layer | Architecture exists, never executes for real ops |

---

## Priority Fix Roadmap

### Immediate (EV-03-R1)
1. Remove PrismaService from 20 controllers — route through services
2. Wire domain exceptions into services — replace generic HTTP exceptions
3. Wire domain events into write operations — publish events after mutations

### Short-term (EV-03-R2)
4. Migrate 10 additional services to EnterpriseService
5. Remove dead code (18 events, 13 exceptions, 20 registry operations, 6 policies)
6. Extract inline business logic from controllers into domain layer

### Long-term (EV-03-R3)
7. Implement repository pattern between services and Prisma
8. Make EnterprisePipeline the default execution path
9. Add architectural tests (dependency-cruise rules)

---

## Certification Decision

**VERIFIED WITH CRITICAL OBSERVATIONS**

**Overall Architecture Score: 38%**

The architecture has a solid NestJS modular monolith foundation with clear module boundaries and a well-structured `common/` infrastructure layer. However, the Clean Architecture is violated at the controller level (47.6% bypass the service layer), the entire domain layer is essentially dead code (31 components defined but never used), and enterprise patterns exist at the architecture level but do not execute for real production operations.

### Key Gap
The previous ECG certifications (03, 04, 05, 06, 07) claimed domain layer completion and pipeline adoption, but this independent audit found that the domain layer is 90% dead code and pipeline adoption is 2%. These certifications were based on architecture existence, not executable evidence.
