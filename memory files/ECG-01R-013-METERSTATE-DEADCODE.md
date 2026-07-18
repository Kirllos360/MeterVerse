# ECG-01R-013 — Remove/Refactor MeterStateService Dead Code

**Platform:** Validation Platform (Phase 5)  
**Priority:** P2  
**Estimated Effort:** 1 day  
**Depends on:** ECG-01R-012 (BusinessRuleService wiring)  

## Objective

Eliminate the duplicated state machine logic in `MeterStateService`.

## Scope

### File: `src/meters/meter-state.service.ts` (entire file)

**Option A — Delete the file** (preferred if no callers exist):
- Remove `meter-state.service.ts`
- Remove from `meters.module.ts` providers
- Remove injection from `meters.service.ts` line 22
- Remove import from `meters.service.ts` line 5

**Option B — Refactor to thin wrapper** (if future state machine logic is expected):
- Replace `validateTransition()` body with: `return this.businessRuleService.evaluate({ currentStatus, newStatus }, [MeterTransitionRule])`
- Replace `canActivate()` body with: `return this.businessRuleService.evaluate({ ...meter, newStatus: 'active' }, [MeterActivationRule])`
- Inject `BusinessRuleService` instead of maintaining duplicate maps

### File: `src/sync/sync-orchestrator.service.ts`

**Lines 234-250** — `canActivateMeter()`:
- Replace entire method body with call to `BusinessRuleService.evaluate()` using `MeterActivationRule`
- This eliminates the **third copy** of activation precondition logic

### File: `src/meters/meters.service.ts`

- If Option A: remove `MeterStateService` injection, remove unused `meterState` property
- Verify all meter transitions go through `BusinessRuleService.evaluate()` with `MeterTransitionRule` and `MeterActivationRule`

## Verification

- `npx tsc --noEmit` — 0 errors
- Meter transitions work identically
- Only one source of truth for transition rules (business-rules.ts)
- Only one source of truth for activation rules (business-rules.ts)
