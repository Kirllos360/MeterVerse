# ECG-01R-016 — Add RolesGuard to Missing Controllers

**Platform:** Security (OWASP A01:2021)  
**Priority:** P2  
**Estimated Effort:** 1 day  
**Depends on:** None  

## Objective

Add `RolesGuard` and `@Roles()` decorators to controllers currently missing role-based access control.

## Scope

### `src/solar/solar.controller.ts`
**Line 17**: Currently uses only `@UseGuards(GlobalAuthGuard)`
- Add: `@UseGuards(AuthGuard('jwt'), RolesGuard)` and appropriate `@Roles()` decorator per method

### `src/gas/gas.controller.ts`  
**Line 23**: Currently uses only `@UseGuards(GlobalAuthGuard)`
- Add: same pattern

### `src/chilled-water/chilled-water.controller.ts`
**Line 22**: Currently uses only `@UseGuards(GlobalAuthGuard)`
- Add: same pattern

### Role assignment determination

Review each controller's operations and assign minimum roles:
- Read operations (list, get): `Role.OPERATOR` or `Role.TECHNICIAN`
- Write operations (create, update): `Role.OPERATOR` or `Role.ADMIN`
- Delete/admin operations: `Role.ADMIN` or `Role.SUPER_ADMIN`

## Verification

- `npx tsc --noEmit` — 0 errors
- All 3 controllers reject requests from unauthorized roles with 403
- All authorized role requests succeed
- Existing calls from authorized users continue working
