# EV-04 — Independent Domain & Business Logic Verification

**Verification Body:** Independent Enterprise Review Board  
**Methodology:** Source-code-based audit — no prior certifications trusted  
**Date:** 2026-07-02  

---

## Executive Summary

**Certification: NOT VERIFIED — CRITICAL FAILURES DETECTED**

**Overall Domain Maturity Score: 12%**

The Enterprise Domain layer is almost entirely architectural — components are defined but do not execute. The most critical finding is that **the validation pipeline is completely non-functional due to a naming mismatch between the operation registry and validator registration.** No validator can ever be found by the pipeline. Additionally, all 13 domain exceptions and all 18 domain events are dead code, 6 of 8 policies never evaluate, and the entire domain layer has near-zero adoption.

---

## WP1 — Domain Model Audit

### Domain Component Inventory

| Category | Defined | Actually Used | Status |
|---|---|---|---|
| **Domain Exceptions** | 13 classes | **0 thrown** | 100% DEAD |
| **Domain Events** | 18 classes | **0 instantiated** | 100% DEAD |
| **Enterprise Policies** | 8 classes | **2 evaluated** | 75% DEAD |
| **Domain Validators** | 20 classes | **20 registered, 0 match registry** | 100% BROKEN |
| **Business Rules** | 12 rules | 12 registered | ✅ Active |
| **OperationEngine** | 1 class | 0 used | 100% DEAD |
| **OperationRegistry** | 23 ops | **3 called** | 87% DEAD |
| **OperationContext** | 1 class | Used by 2 services | ✅ Active |
| **PolicyEngine** | 1 class | Used by pipeline | ✅ Active |

---

## WP2 — Business Rule Audit ⚠️

### Centralized Business Rules (BusinessRuleService)

| Rule | Registered | Used By | Status |
|---|---|---|---|
| RequiredFieldRule | ✅ | Various | ✅ |
| PaymentStatusRule | ✅ | BillingApplicationService | ✅ |
| OwnershipTransferRule | ✅ | Not explicitly verified | ⚠️ |
| SufficientBalanceRule | ✅ | Wallet | ✅ |
| PeriodOverlapRule | ✅ | Not referenced outside own file | ⚠️ Dead? |
| TariffOverlapRule | ✅ | Not referenced outside own file | ⚠️ Dead? |
| MeterAssignmentRule | ✅ | Not referenced outside own file | ⚠️ Dead? |
| MeterTerminationRule | ✅ | Not referenced outside own file | ⚠️ Dead? |
| ImportTypeRule | ✅ | Import service | ✅ |
| InvoiceReversibleRule | ✅ | Billing controller | ✅ |
| MeterTransitionRule | ✅ | Not referenced outside own file | ⚠️ Dead? |
| MeterActivationRule | ✅ | Not referenced outside own file | ⚠️ Dead? |

### Finding EV-04-001: 5 of 12 Business Rules Are Potentially Dead

- **Severity:** MEDIUM
- **Description:** Rules `PeriodOverlapRule`, `TariffOverlapRule`, `MeterAssignmentRule`, `MeterTerminationRule`, `MeterActivationRule` are registered but never explicitly referenced outside their declaration file.

### Business Rules Duplicated in Policies

| Business Rule | In BusinessRules | In Policies | Duplicate? |
|---|---|---|---|
| Meter status transitions | `MeterTransitionRule` | `MeterPolicy.transition` | ✅ DUPLICATED |
| Invoice status validation | `InvoiceReversibleRule` | `BillingPolicy` | ✅ DUPLICATED |
| Customer ownership transfer | `OwnershipTransferRule` | `CustomerPolicy` | ✅ DUPLICATED |

### Finding EV-04-002: Duplicated Meter State Machine

- **Severity:** HIGH
- **Evidence:** The exact same meter state transition table (`available→assigned`, `assigned→active/terminated`, etc.) exists in TWO places:
  1. `business-rules.ts` lines 165-172 (`MeterTransitionRule.VALID_TRANSITIONS`)
  2. `enterprise-policies.ts` lines 45-52 (`MeterPolicy.validTransitions`)
- **Risk:** Divergent behavior if one is updated and the other is not

---

## WP3 — Policy Verification ⚠️⚠️⚠️

### Policy Execution Matrix

| Policy | Registered | Actually Evaluated | Where |
|---|---|---|---|
| **BillingPolicy** | ✅ | ❌ Never evaluated | Dead |
| **CustomerPolicy** | ✅ | ❌ Never evaluated | Dead |
| **MeterPolicy** | ✅ | ❌ Never evaluated | Dead |
| **PaymentPolicy** | ✅ | ❌ Never evaluated | Dead |
| **CollectionPolicy** | ✅ | ❌ Never evaluated | Dead |
| **TariffPolicy** | ✅ | ❌ Never evaluated | Dead |
| **AreaPolicy** | ✅ | ⚠️ Evaluated by AreasService | 2% adoption |
| **ApprovalPolicy** | ✅ | ⚠️ Evaluated by AreasService | 2% adoption |

### Finding EV-04-003: 6 of 8 Policies Never Execute

- **Severity:** CRITICAL
- **Evidence:** `BillingPolicy`, `CustomerPolicy`, `MeterPolicy`, `PaymentPolicy`, `CollectionPolicy`, and `TariffPolicy` are registered in `PolicyEngine` but never requested by any operation. Only `AreaPolicy` and `ApprovalPolicy` are referenced in the `operation-registry.ts` policies arrays.
- **Root Cause:** The policy names in `operation-registry.ts` match the actual policy names (`'billing'`, `'customer'`, etc.), but no operation that uses them actually executes through the pipeline (since only `area.*` operations from AreasService have pipeline adoption).

### Contradiction with ECG-05
ECG-05 certified "8 policies, 17 events, 14 exceptions, OperationContext." This audit found:
- **8 policies** → ✅ confirmed defined, ❌ 6 never execute
- **17 events** → ✅ 18 found, ❌ 0 ever used
- **14 exceptions** → ✅ 13 found, ❌ 0 ever used
- **OperationContext** → ✅ used by 2 services (2% adoption)

---

## WP4 — Validation Audit ⚠️⚠️⚠️

### Finding EV-04-004: CRITICAL — Validator Naming Mismatch Breaks Entire Validation Pipeline

- **Severity:** CRITICAL
- **File:** `operation-registry.ts` ↔ `domain-validators.ts`
- **Description:** The operation registry references validators by class name (e.g., `'MeterExistsValidator'`), but `ValidationRuleService` registers validators by their `.name` property (e.g., `'meter.exists'`). The pipeline calls `validatorService.getRule('MeterExistsValidator')` which returns `undefined` because no rule is registered with that name.
- **Evidence:**

| Registry Name | Actual .name | Match? |
|---|---|---|
| `'MeterExistsValidator'` | `'meter.exists'` | ❌ |
| `'MeterStatusValidator'` | `'meter.status'` | ❌ |
| `'MeterDuplicateValidator'` | `'meter.duplicate'` | ❌ |
| `'CustomerExistsValidator'` | `'customer.exists'` | ❌ |
| `'CustomerStatusValidator'` | `'customer.status'` | ❌ |
| `'BillingPeriodOpenValidator'` | `'billing.periodOpen'` | ❌ |
| `'InvoiceStatusValidator'` | `'invoice.status'` | ❌ |
| `'PaymentAmountValidator'` | `'payment.amount'` | ❌ |

- **Business Impact:** The pipeline silently generates a warning `"Validator 'X' not registered"` for every validator and continues execution without any validation. **No validation ever blocks an operation.**
- **Root Cause:** The registry was written with TypeScript class names while the validators use dot-notation names.

### Validation Coverage (Actual)

| Metric | Value |
|---|---|
| Total validators defined | 20 |
| Validators that can be found by pipeline | **0** |
| Working validator pipeline coverage | **0%** |
| Validation through DTOs (class-validator) | ✅ Active via EnhancedValidationPipe |

---

## WP5 — Approval Audit ⚠️

### Approval Coverage

| Aspect | Status |
|---|---|
| Approval levels defined (5) | ✅ NONE, MANAGER, FINANCE, SECURITY, MULTI |
| Role map defined | ✅ `APPROVAL_ROLE_MAP` |
| Approval evaluates in pipeline | ✅ Code path exists |
| Operations requiring approval | 13 operations (riskScore >= MANAGER) |
| Operations actually checked | **None** (pipeline not used for real ops) |

### Finding EV-04-005: Zero Operations Have Approval Enforced

- **Severity:** CRITICAL
- **Description:** 13 operations in the registry require approval (MANAGER, FINANCE, SECURITY, or MULTI level), but none of these operations actually execute through the pipeline. The operations that DO execute through the pipeline (`user.*`, `area.*`) have NONE approval level.
- **Contradiction with ECG-06:** ECG-06 certified "23 operations registered, PolicyEngine." This audit confirmed 23 registered, but only 3 are actually called, and none require approval.

---

## WP6 — Dependency Engine Audit

| Component | Exists | Used |
|---|---|---|
| `OperationDependency` interface | ✅ | Never populated in registry |
| `OperationDefinition` interface | ✅ | Never instantiated |
| `OperationEngine` class | ✅ | Never imported |
| `affectedEntities` in OperationRecord | ✅ | Never populated by pipeline |
| Rollback metadata | ✅ | `rollbackSupported` flag exists |

### Finding EV-04-006: Dependency Engine Is Entirely Dead Code

- **Severity:** HIGH
- **Description:** `OperationEngine`, `OperationDependency`, and `OperationDefinition` are defined but never used anywhere in the application code.

---

## WP7 — Business Logic Distribution

| Layer | Logic Type | Percentage |
|---|---|---|
| **Controllers** | Business rules, validation, DB access | ~40% |
| **Services** | Application logic, DB queries | ~50% |
| **Policies** | Business rules (dead) | ~5% |
| **Validators** | Business validation (broken) | ~5% |

### Violations

| Finding | Location |
|---|---|
| Lockout thresholds (3/6/9) | `auth.controller.ts` — should be in service |
| Invoice state machine | `billing.controller.ts` — should be in policy |
| SQL whitelist | `admin.controller.ts` — should be in service |
| Meter state transitions (duplicate) | `business-rules.ts` + `enterprise-policies.ts` |

---

## WP8 — Enterprise Readiness Scores

| Category | Score |
|---|---|
| Business Rule Centralization | **35%** (12 rules defined, some duplicated in policies) |
| Policy Adoption | **5%** (2 of 8 policies evaluated) |
| Validation Coverage | **0%** (naming mismatch breaks pipeline) |
| Approval Coverage | **0%** (no real operation requires approval) |
| Domain Exception Usage | **0%** (13 defined, 0 thrown) |
| Domain Event Usage | **0%** (18 defined, 0 published) |
| Business Consistency | **20%** (duplication between rules and policies) |

**Overall Domain Maturity Score: 12%**

---

## WP9 — Dead Business Components Summary

| Component | Count | Status |
|---|---|---|
| Unused domain exceptions | 13 | DEAD |
| Unused domain events | 18 | DEAD |
| Unused policies | 6 | DEAD |
| Unused validators (pipeline) | 20 | BROKEN (naming mismatch) |
| Unused registry operations | 20 | DEAD |
| Unused dependency engine | 1 | DEAD |
| Unused OperationEngine | 1 | DEAD |
| **Total dead components** | **79** | |

---

## WP10 — Findings Database

| ID | Category | Severity | Component | Description |
|---|---|---|---|---|
| EV-04-001 | Dead Code | MEDIUM | business-rules.ts | 5 of 12 business rules are never referenced |
| EV-04-002 | Duplication | HIGH | policies + rules | Meter state machine duplicated in 2 places |
| EV-04-003 | Policy Gap | CRITICAL | 6 enterprise policies | Never evaluated by any operation |
| EV-04-004 | **Broken Pipeline** | **CRITICAL** | registry ↔ validators | **Validator naming mismatch — NO validator can ever be found by the pipeline. Validation is completely non-functional.** |
| EV-04-005 | Approval Gap | CRITICAL | All operations | Zero operations have real approval enforcement |
| EV-04-006 | Dead Code | HIGH | OperationEngine | Entire dependency engine never used |

---

## Certification Decision

**NOT VERIFIED — CRITICAL FAILURES DETECTED**

### Contradictions with Previous Certifications

| ECG Claim | EV-04 Finding |
|---|---|
| ECG-05: "Domain Layer is complete" | Domain layer is 88% dead code |
| ECG-05: "8 policies active" | 6 of 8 policies never execute |
| ECG-05: "17 events" | 18 events defined, 0 used |
| ECG-05: "14 exceptions" | 13 exceptions, 0 thrown |
| ECG-06: "23 operations registered" | 23 registered, 3 called |
| ECG-06: "PolicyEngine" | Policies are registered but never evaluated for real ops |
| ECG-04: "Zero Prisma in controllers" | 20 controllers (47.6%) import PrismaService |
| ECG-09D: "Pipeline complete" | Pipeline validation is broken (naming mismatch) |

### Critical Path Forward

1. **Fix the naming mismatch** in `operation-registry.ts`: Change `'MeterExistsValidator'` → `'meter.exists'` (and all others)
2. **Wire domain exceptions** into services — replace generic HTTP exceptions
3. **Publish domain events** after write operations
4. **Remove dead code** (79 components)
5. **Remove duplicated business rules** from either `business-rules.ts` or `enterprise-policies.ts`
