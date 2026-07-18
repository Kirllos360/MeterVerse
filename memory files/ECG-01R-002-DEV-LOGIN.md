# ECG-01R-002 — Fix Dev-Login Public Endpoint

**Platform:** Security (OWASP A01 / A07)  
**Priority:** P0  
**Estimated Effort:** 1 day  
**Depends on:** None  

## Objective

Remove unauthenticated JWT minting from the dev-login endpoint.

## Scope

### File: `src/auth/auth.controller.ts`

**Lines 166-182** — `@Post('dev-login')`:
1. Remove `@Public()` decorator
2. Gate behind `NODE_ENV !== 'production'` check at the class level (not just method body)
3. Require authentication even in dev mode (JWT token for an authorized dev user)
4. Remove the `role` parameter — use the authenticated user's actual role
5. Add IP allowlist check (dev subnet only)
6. Log all dev-login attempts at WARN level

## Verification

- `npx tsc --noEmit` — 0 errors
- No unauthenticated endpoint exists that can mint JWTs
- Dev-login works only with valid auth + dev IP + non-production
- Test: attempt without auth → 401
- Test: attempt in production → 403
