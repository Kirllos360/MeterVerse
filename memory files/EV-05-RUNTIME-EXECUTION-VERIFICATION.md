# EV-05 — Independent Enterprise Runtime Execution Verification

**Verification Body:** Independent Enterprise Review Board  
**Methodology:** Source-code-level execution path tracing — no prior certifications trusted  
**Previous EV phases:** EV-01 (Security), EV-02 (Infrastructure), EV-03 (Architecture), EV-04 (Domain)  
**Date:** 2026-07-02  

---

## Executive Summary

**Certification: NOT VERIFIED — RUNTIME DOES NOT EXECUTE FOR PRODUCTION OPERATIONS**

**Overall Runtime Integrity Score: 4%**

The Enterprise Runtime (pipeline, validators, policies, approvals, domain events, domain exceptions, transactions, metrics timeline) **exists architecturally but does not execute for any production operation.** Out of ~42 controllers and ~101 services, exactly **2 services** (AreasService, UsersService) route through the EnterprisePipeline — representing less than 2% of all operations.

Furthermore, **even for the 2 services that use the pipeline, the validation stage is completely broken** due to a naming mismatch between the operation registry (which uses class names like `'MeterExistsValidator'`) and validator registration (which uses dot-notation names like `'meter.exists'`). The pipeline emits a warning for every validator lookup and continues without validation.

---

## WP1 — Runtime Flow Maps (8 Major Operations)

### 1. User Creation (`POST /users`)

```
Request
  → GlobalAuthGuard (JWT) ✅
  → RolesGuard (but NOT global — only via @UseGuards) ⚠️
  → UsersController.create()
    → UsersService.create() extends EnterpriseService
      → OperationIntegrator.run('user.create')
        → EnterprisePipeline.execute(config, ctx, handler)
          → Lifecycle.start()                           ✅
          → Validators [] (none configured)              N/A
          → Policies [] (none configured)                N/A
          → Approval NONE                                N/A
          → Transaction (riskScore 0, no $transaction)  ❌
          → Handler → prisma.coreUser.create()           ✅
          → Events [] (none emitted)                     ❌
          → Audit (auditData param missing)              ❌
          → Metrics.increment()                          ✅
          → Lifecycle.complete()                         ✅
          → Health.report()                              ✅
  → Response
```

**Pipeline used: YES** | **Validators: N/A** | **Policies: N/A** | **Approval: NONE** | **Transaction: NO** | **Events: NO** | **Audit: NO** (service doesn't pass auditData)

### 2. Area Creation (`POST /areas`)

```
Request
  → GlobalAuthGuard ✅
  → RolesGuard ⚠️ (class-level @UseGuards)
  → AreasController.create()
    → AreasService.create() extends EnterpriseService
      → OperationIntegrator.run('area.create')
        → EnterprisePipeline.execute(config, ctx, handler)
          → Lifecycle.start()                           ✅
          → Validators [] (none configured)              N/A
          → Policies ['area', 'approval']                ✅
          → Approval MULTI → super_admin check           ✅
          → Transaction (riskScore 8 → $transaction)     ✅
          → Handler → prisma.coreArea.create()           ✅
          → Events [] (none emitted)                     ❌
          → Audit (resourceType: 'area')                 ✅
          → Metrics                                      ✅
          → Lifecycle.complete()                         ✅
          → Health.report()                              ✅
  → Response
```

**Pipeline used: YES** | **This is the MOST COMPLETE runtime execution in the entire codebase.**

### 3. Customer Creation (`POST /projects/:id/customers`)

```
Request
  → AuthGuard('jwt') + RolesGuard ⚠️
  → CustomersController.create()
    → PrismaService.customer.create() DIRECTLY ❌❌❌
    → NotificationsService.create() fire-and-forget
  → Response
```

**Pipeline: BYPASSED** | **Validators: BYPASSED** | **Policies: BYPASSED** | **Approval: BYPASSED** | **Transaction: BYPASSED** | **Audit: BYPASSED** | **Metrics: BYPASSED**

### 4. Meter Assignment (`POST /meters/:id/assign`)

```
Request
  → AuthGuard('jwt') + RolesGuard ⚠️
  → MetersController.assign()
    → PrismaService.meterAssignment.create() DIRECTLY ❌❌❌
    → NotificationsService.create() fire-and-forget
  → Response
```

**Pipeline: BYPASSED** | **All runtime stages: BYPASSED**

### 5. Invoice Generation (`POST /invoices/generate`)

```
Request
  → AuthGuard('jwt') + RolesGuard ⚠️
  → BillingController.generate()
    → Multiple services + PrismaService DIRECTLY ❌❌❌
    → Validators called inline (not through pipeline)
    → BusinessRuleService called inline
  → Response
```

**Pipeline: BYPASSED** | Business rules called directly (good), but pipeline completely bypassed

### 6. Payment Processing (`POST /payments`)

```
Request
  → AuthGuard('jwt') + RolesGuard ⚠️
  → PaymentsController (via inline handler)
    → PrismaService.payment.create() DIRECTLY ❌❌❌
  → Response
```

**Pipeline: BYPASSED**

### 7. Reading Submission (`POST /readings`)

```
Request
  → AuthGuard('jwt') + RolesGuard ⚠️
  → ReadingsController.create()
    → Validators called inline: MeterExistsValidator, MeterStatusValidator, etc. ✅
    → PrismaService.reading.create() DIRECTLY ❌❌❌
    → NotificationsService fire-and-forget
  → Response
```

**Pipeline: BYPASSED** | Validators called directly (good but outside pipeline context)

### 8. Login (`POST /auth/login`)

```
Request
  → @Public() — bypasses auth
  → AuthController.login()
    → AuthService.findUserByUsername() → PrismaService.coreUser.findFirst()
    → bcrypt.compare() inline
    → JWT creation inline
    → Audit(@Audit('auth', 'login')) ✅
    → Event(EmitEvent('auth.login')) ✅
  → Response
```

**Public endpoint** | **Audit: YES** | **Event: YES** | **Pipeline: BYPASSED** (correctly, since auth should be public)

---

## WP2 — Pipeline Execution Coverage

| Metric | Value |
|---|---|
| Services using pipeline | **2 of 101 (2%)** |
| Controllers using pipeline (via service) | **2 of 42 (5%)** |
| Operations registered in registry | **23** |
| Operations actually called from code | **~3 (user.*, area.*)** |
| Pipeline operations that fire events | **0** |
| Pipeline operations that pass auditData | **2** |
| Pipeline operations with transaction | **1 (area.create — riskScore 8)** |
| Pipeline operations with validators | **0** (none configured) |
| Pipeline operations with policies | **1 (area.create)** |

### Finding EV-05-001: Pipeline Executes for 2% of Operations

- **Severity:** CRITICAL
- **Evidence:** Only AreasService and UsersService extend EnterpriseService. All other 99 services bypass the pipeline entirely.

---

## WP3 — Validator Runtime Audit

### Finding EV-05-002: Validation Pipeline Is Completely Broken (Confirmed from EV-04)

- **Severity:** CRITICAL
- **Evidence:** The operation registry uses TypeScript class names (`'MeterExistsValidator'`) while `ValidationRuleService` registers by `.name` property (`'meter.exists'`). `getRule()` never finds a match.
- **Even for the 2 services that DO use the pipeline, no validators are configured in their operation definitions** (user.* and area.* have empty validators arrays).

### Execution Paths for Validation

| Validator Invocation | Method | Executes? |
|---|---|---|
| Pipeline validators[] loop | `validatorService.getRule()` → always undefined | ❌ BROKEN |
| Direct validator injection in controller | `await meterExists.validate(id)` | ✅ Works (but outside pipeline) |
| DTO validation (class-validator) | Global ValidationPipe | ✅ Works |

---

## WP4 — Policy Runtime Audit

### Finding EV-05-003: 6 of 8 Policies Never Execute (Confirmed from EV-04)

- **Severity:** CRITICAL
- **Only 2 policies ever evaluate:** AreaPolicy + ApprovalPolicy (via AreasService pipeline)
- **6 dead policies:** BillingPolicy, CustomerPolicy, MeterPolicy, PaymentPolicy, CollectionPolicy, TariffPolicy

### Policy Execution Paths

| Policy | Requested | Evaluated | Result |
|---|---|---|---|
| BillingPolicy | Never | Never | DEAD |
| CustomerPolicy | Never | Never | DEAD |
| MeterPolicy | Never | Never | DEAD |
| PaymentPolicy | Never | Never | DEAD |
| CollectionPolicy | Never | Never | DEAD |
| TariffPolicy | Never | Never | DEAD |
| AreaPolicy | area.create | ✅ Evaluated | ALIVE (2%) |
| ApprovalPolicy | area.create | ✅ Evaluated | ALIVE (2%) |

---

## WP5 — Approval Runtime Audit

### Finding EV-05-004: Approval Is Decorative — Zero Production Operations Enforce It

- **Severity:** CRITICAL
- **Evidence:** 13 operations require approval (MANAGER, FINANCE, SECURITY, or MULTI level). None execute through the pipeline. The one operation that DOES execute through the pipeline with MULTI approval (`area.create`) is the ONLY approval enforcement point in the entire codebase.
- **Operations like `payment.reverse` (MULTI approval, riskScore 9) have ZERO enforcement** — the controller directly calls Prisma.

---

## WP6 — Transaction Runtime Audit

### Finding EV-05-005: Database Transactions Are Not Used (Confirmed from EV-02)

- **Severity:** CRITICAL
- **Evidence:** `prisma.$transaction()` is only called in `enterprise-pipeline.ts` for operations with riskScore >= 5. Since only 2 services use the pipeline, and only `area.create` has riskScore 8 (triggering transaction), **exactly one operation in the entire codebase uses database transactions.**
- **All write operations (customer create, meter assign, invoice generate, payment record, reading submit) have NO transaction boundary.** Partial failures can leave inconsistent data.

---

## WP7 — Domain Runtime Audit

### Finding EV-05-006: Domain Layer Is 95% Dead at Runtime

| Component | Runtime Status |
|---|---|
| **Domain Events** | **0 of 18 instantiated** — no operation publishes domain events |
| **Domain Exceptions** | **0 of 13 thrown** — services use generic HTTP exceptions |
| **OperationContext** | Created for 2 pipeline operations ✅ |
| **OperationMetadata** | 23 defined, 3 used |
| **Dependency Engine** | 0 operations populate dependencies |
| **Operation Timeline** | Records created for 2 pipeline ops only |

---

## WP8 — Observability Runtime Audit

| Component | Coverage | Evidence |
|---|---|---|
| **GlobalAuthGuard** | ~95% | APP_GUARD, all endpoints unless @Public() |
| **RolesGuard** | **~0% enforcement** | Not APP_GUARD — only works where @UseGuards added |
| **AreaGuard** | ~95% | APP_GUARD — tenant isolation active |
| **CsrfGuard** | ~100% | APP_GUARD |
| **AuditInterceptor** | ~100% | APP_INTERCEPTOR — catches all POST/PUT/PATCH/DELETE |
| **@Audit() decorator** | ~20% | ~50/250 endpoints have it |
| **ObservabilityInterceptor** | ~100% | APP_INTERCEPTOR — HTTP metrics |
| **Health checks** | 5 indicators | ✅ Active |
| **Rate limiting** | 100 req/min global | ✅ Active |
| **Correlation IDs** | All requests | ✅ Active |

---

## WP9 — Runtime Integrity Score

| Component | Weight | Score | Weighted |
|---|---|---|---|
| Pipeline Adoption | 20% | 2% | 0.4 |
| Validation Execution | 15% | 0% | 0.0 |
| Policy Execution | 15% | 2% | 0.3 |
| Approval Enforcement | 15% | 0% | 0.0 |
| Transaction Usage | 10% | 1% | 0.1 |
| Domain Events | 5% | 0% | 0.0 |
| Domain Exceptions | 5% | 0% | 0.0 |
| Audit Coverage | 5% | 60% | 3.0 |
| Auth Enforcement | 5% | 50% | 2.5 |
| Metrics Collection | 5% | 80% | 4.0 |

**Overall Runtime Integrity Score: 4.0%**

---

## WP10 — Contradiction Analysis

### ECG-04: "Zero Prisma in controllers"
**CONTRADICTED** — 20 of 42 controllers (47.6%) import PrismaService directly. Source: `customers.controller.ts:27`, `meters.controller.ts:25`, `billing.controller.ts:32`, `payments.controller.ts:13`, `readings.controller.ts:38`, and 15 more.

### ECG-05: "Domain Layer complete — 8 policies, 17 events, 14 exceptions"
**CONTRADICTED** — 8 policies exist but 6 never evaluate. 18 events exist but 0 are published. 13 exceptions exist but 0 are thrown. The domain layer is 95% dead at runtime.

### ECG-06: "23 operations registered, PolicyEngine, OperationContext"
**PARTIALLY CONTRADICTED** — 23 operations registered but only 3 are called. PolicyEngine is used but for 2% of operations. OperationContext is alive.

### ECG-07: "57 services, 143 ops, 1% pipeline adoption"
**CORROBORATED** — EV-05 measured 2% adoption (2 of 101 services). The 1%→2% improvement from ECG-07 to now is marginal.

### ECG-09B: "Wave 1 — 2 services migrated"
**CORROBORATED** — AreasService and UsersService are the only pipeline adopters. This confirms ECG-09B Wave 1 is complete but Waves 2+ were never started.

### ECG-09D: "Pipeline complete, 100% runtime coverage"
**CONTRADICTED** — The pipeline code is structurally complete, but:
1. Validation is broken (naming mismatch)
2. 98% of operations bypass the pipeline
3. All 21 metrics counters are at zero
4. No domain events publish
5. No domain exceptions throw

### ECG-09E: "Certified with Critical Observations, 16.5% score"
**CORROBORATED** — EV-05's 4% runtime integrity score confirms the trend. The previous 16.5% score was already critical, and this deeper analysis shows the actual runtime integrity is even lower.

---

## Root Cause Analysis

### Pattern 1: Architecture Exists But Never Executes
This is the single dominant pattern across the entire codebase:
- **Pipeline**: Full execution flow coded, used by 2% of operations
- **Validators**: 20 defined, 0 reachable via pipeline
- **Policies**: 8 defined, 2 evaluated (both by same 1 operation)
- **Domain Events**: 18 defined, 0 published
- **Domain Exceptions**: 13 defined, 0 thrown
- **Transaction**: Full support coded, used by 1 operation

### Pattern 2: Bypass of Enterprise Layer
- 20 controllers bypass services → Prisma directly
- 99 services bypass pipeline → direct Prisma
- Controllers import validators directly instead of going through pipeline

### Pattern 3: Broken Wiring (Naming Mismatch)
- Validator registry names don't match validator `.name` properties
- This single bug makes the entire pipeline validation stage non-functional

---

## Priority Fix Order

| Order | Fix | Impact |
|---|---|---|
| 1 | **Fix validator naming mismatch** in operation-registry.ts | Unblocks pipeline validation for all 23 operations |
| 2 | **Remove PrismaService from 20 controllers** — route through services | Stops the service layer bypass |
| 3 | **Register RolesGuard as APP_GUARD** | Enables RBAC enforcement across all endpoints |
| 4 | **Migrate 10 key services** to EnterpriseService (customers, meters, billing, readings, payments, invoices, tickets, collections, notifications, support) | Increases pipeline adoption from 2% to ~15% |
| 5 | **Wire domain events** into write operations | Enables event-driven architecture |
| 6 | **Add transactions** to all multi-table write operations | Ensures data integrity |
| 7 | **Wire domain exceptions** into services | Replaces generic HTTP errors with domain-specific ones |

---

## Final Certification

**NOT VERIFIED — RUNTIME DOES NOT EXECUTE FOR PRODUCTION OPERATIONS**

The Enterprise Runtime is architecturally defined but executes for less than 2% of production operations. The pipeline validation stage is broken by a naming bug. The single most complete runtime execution (`area.create`) demonstrates the architecture works — it just wasn't adopted.

**Overall Runtime Integrity Score: 4%**

| Component | Status |
|---|---|
| Pipeline executes | ❌ 2% adoption |
| Validators execute | ❌ 0% (broken naming) |
| Policies execute | ❌ 25% (2/8) |
| Approval enforces | ❌ 0% |
| Transactions active | ❌ 1 operation |
| Domain events live | ❌ 0% |
| Domain exceptions used | ❌ 0% |
| Audit coverage | ✅ 100% interceptor |
| Metrics collection | ✅ 100% interceptor |
| Auth enforcement | ⚠️ 95% JWT, 0% RBAC |
