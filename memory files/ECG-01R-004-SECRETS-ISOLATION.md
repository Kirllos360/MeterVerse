# ECG-01R-004 — Add Area Isolation to SecretsService

**Platform:** Security / Area Isolation  
**Priority:** P1  
**Estimated Effort:** 3 days  
**Depends on:** None  

## Objective

Prevent cross-tenant secret access. Area A's code must not read Area B's database credentials.

## Scope

### File: `src/common/secrets/secrets.service.ts`

**Lines 52-80** — Area-scoped methods:
- Add `validateAreaAccess(areaCode: string)` method that checks the caller's `ValidationContext.areaId` against the requested area
- `getAreaSecrets(areaCode)` — inject `areaId` check
- `getSymbiotCredentials(areaCode)` — inject `areaId` check
- `getSBillCredentials(areaCode)` — inject `areaId` check
- `getTcpEndpoint(areaCode)` — inject `areaId` check
- `getAllAreaSecretKeys(areaCode)` — inject `areaId` check

### File: `src/common/secrets/secret-resolver.service.ts`

- Same area validation for `resolve()` calls that are area-scoped

### ValidationContext Integration

The `SecretsService` needs access to the current `ValidationContext`. Options:
1. Inject `REQUEST` (like `EnhancedValidationPipe` does) and read `request.validationContext.areaId`
2. Use `AsyncContextService.get('areaId')` from the logging context

### Remove dead imports

- Remove unused `ForbiddenException` import from both files (or use it now that we're throwing it)

## Verification

- `npx tsc --noEmit` — 0 errors
- Area 1 code calling `getSymbiotCredentials('2')` → throws `PlatformException(AUTH_AREA_DENIED)`
- Area 1 code calling `getSymbiotCredentials('1')` → works
- All existing sync/Symbiot flows continue working
