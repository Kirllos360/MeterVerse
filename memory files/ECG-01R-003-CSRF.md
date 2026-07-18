# ECG-01R-003 — Fix CSRF Token Security

**Platform:** Security (OWASP A05:2021)  
**Priority:** P0  
**Estimated Effort:** 2-3 days  
**Depends on:** None  

## Objective

Fix CSRF cookie security flags and implement server-side token validation.

## Scope

### File: `src/auth/auth.controller.ts`

**Line 210** — CSRF cookie generation:
- Change `httpOnly: false` → `httpOnly: true`
- Change `secure: false` → `secure: true` (production only, use `req.secure` or `NODE_ENV`)
- Remove `Date.now()` from token value — use `crypto.randomUUID()` only

### File: `src/common/http/csrf.guard.ts`

**Lines 17-22** — CSRF validation:
- Current: Only compares header to cookie. If cookie is missing, any header value passes.
- Fix: Store CSRF tokens server-side (in-memory cache with TTL). Validate header against stored token.
- Use `SecretCacheService` or dedicated `CsrfStoreService` with 1-hour TTL
- Implement token rotation (new token issued after each successful mutation)

### File: `src/auth/auth.controller.ts`

- Expose `GET /auth/csrf-token` endpoint that returns a server-stored token
- Guard should validate: header matches stored token AND token has not expired

## Verification

- `npx tsc --noEmit` — 0 errors
- CSRF cookie is `httpOnly: true, secure: true`
- Mutations without valid header → 403
- Mutations with missing cookie + arbitrary header → 403
- Token rotation works after mutation
