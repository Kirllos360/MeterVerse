# ECG-01R-012 — Wire BusinessRuleService Into 8 Services

**Platform:** Validation Platform (Phase 3)  
**Priority:** P2  
**Estimated Effort:** 4-5 days  
**Depends on:** None  

## Objective

Inject `BusinessRuleService` into every service that currently performs inline business logic.

## Scope

### 1. `src/projects/locations/locations.service.ts`
- Inject `BusinessRuleService`
- `assignMeter()`: call `BusinessRuleService.evaluate()` with `MeterAssignmentRule` before creating assignment
- `replaceMeter()`: call `MeterTerminationRule` before deactivating, `MeterTransitionRule` before status change
- `disconnectMeter()`: call `MeterTerminationRule` before ending assignment
- `closeUnit()`: call `MeterTerminationRule` before cascading closures

### 2. `src/sim-cards/sim-cards.service.ts`
- Inject `BusinessRuleService`
- `getEligibility()`: create `SimEligibilityRule` in `business-rules.ts`, call via `evaluate()`
- Migrate 3 inline checks into the rule

### 3. `src/readings/readings.service.ts`
- Inject `BusinessRuleService`
- `createReading()`: create `ReadingAnomalyRule` wrapping the 4 anomaly checks (negative, zero, high, spike)
- Add `ReadingThresholdRule` for profile-based threshold comparisons

### 4. `src/auth/auth.controller.ts`
- Inject `BusinessRuleService`
- Create `AccountLockoutRule` and `LoginThrottleRule` for progressive lockout policy
- Move 3 status checks + 4 lockout thresholds into rules

### 5. `src/sync/sync-orchestrator.service.ts`
- Inject `BusinessRuleService`
- `canActivateMeter()`: replace with `MeterActivationRule` call via `evaluate()` — removes third duplicate

### 6. `src/bill-cycle/bill-cycle.controller.ts`
- Inject `BusinessRuleService`
- Create `BillingCycleTransitionRule` for OPEN/LOCKED/APPROVED/CLOSED/CANCELLED transitions

### 7. `src/registration/registration.controller.ts`
- Inject `BusinessRuleService`
- Create `RegistrationRequestRule` for pending/approved/rejected status validation

### 8. `src/billing/billing.controller.ts`
- Already injects `BusinessRuleService` — remove the inline `requireInvoiceStatus()` and use `InvoiceStatusValidator` directly instead

## Verification

- `npx tsc --noEmit` — 0 errors
- All 8 services/controllers inject `BusinessRuleService`
- No meter activation logic is duplicated (MeterStateService + sync-orchestrator removed)
- All existing business behavior preserved
