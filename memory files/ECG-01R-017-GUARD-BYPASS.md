# ECG-01R-017 — Fix AreaGuard/ProjectAccessGuard Bypass

**Platform:** Security / Area Isolation  
**Priority:** P2  
**Estimated Effort:** 0.5 day  
**Depends on:** None  

## Objective

Remove silent bypass paths in `AreaGuard` and `ProjectAccessGuard` that allow requests through without any area/project enforcement.

## Scope

### `src/auth/area.guard.ts`

**Line 22**: `if (!user) return true;`
- Change to: if no user is present, the request has no identity → should `throw new UnauthorizedException()` or at minimum, not silently pass
- Add a log warning when this path is triggered
- If anonymous access to certain endpoints is intentional, those endpoints should have `@Public()` and bypass the AreaGuard at the class level, not via a silent `return true`

### `src/auth/project-access.guard.ts`

**Line 23**: `if (!user) return true;`
- Same fix as AreaGuard

**Line 31**: `if (!projectId) return true;`
- If no projectId is provided but the route requires project scope, this silently bypasses project enforcement
- Options:
  1. Throw if the route has projectId in params/query and none was provided
  2. Log a warning when bypassing
  3. For routes that legitimately don't require project scope, exclude them from the guard class-level application

## Verification

- `npx tsc --noEmit` — 0 errors
- Requests without user context are rejected (401) unless `@Public()`
- Project-scoped routes without projectId either reject or log warning
- All existing working flows continue working
