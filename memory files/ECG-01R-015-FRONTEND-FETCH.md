# ECG-01R-015 — Replace Direct fetch() Calls With API Client

**Platform:** Frontend  
**Priority:** P2  
**Estimated Effort:** 2 days  
**Depends on:** None  

## Objective

Replace all 37 ad-hoc `fetch()` calls with the centralized `apiGet`/`apiPost` client.

## Scope

### Files to modify (9 components, ~37 calls):

| Component File | Lines | Replace With |
|---|---|---|
| `Frontend/src/app/login/page.tsx` | 28, 53 | `apiGet('/areas')`, `apiPost('/auth/dev-login')` |
| `Frontend/src/app/register/page.tsx` | 23 | `apiPost('/auth/register')` |
| `Frontend/src/components/layout/AreaProjectSwitcher.tsx` | 30-31 | `apiGet('/areas')`, `apiGet('/projects')` |
| `Frontend/src/components/meters/MetersPage.tsx` | 53, 69, 76 | `apiGet('/areas')`, `apiGet('/sync/status')`, `apiGet('/sync/meters')` |
| `Frontend/src/components/meters/MeterDetailPage.tsx` | 86, 94 | `apiGet('/areas')`, `apiGet('/sync/meters')` |
| `Frontend/src/components/reports/ReportsPage.tsx` | 89, 101 | `apiPost('/reports/generate')` |
| `Frontend/src/components/upload/UploadCenterPage.tsx` | 145 | `apiGet('/upload/template')` |
| `Frontend/src/components/sync/SyncGatewayPage.tsx` | 48, 57 | `apiGet` for health endpoints |
| `Frontend/src/components/readings/ReadingsPage.tsx` | 39, 50 | `apiGet('/areas')`, `apiGet('/sync/meters')` |
| `Frontend/src/lib/mock-auth.ts` | 48, 72, 98 | `apiPost` for auth endpoints |

For each replacement:
- Remove `fetch()` call + `.then()` / `.catch()` chain
- Use the typed `apiGet<T>()` / `apiPost<T>()` from `@/lib/api/index.ts`
- The API client handles: auth headers, correlation IDs, CSRF tokens, base URL, error envelo

## Verification

- `bun run build` — 0 errors
- `bun run lint` — 0 errors
- Zero `fetch(` calls remain outside `@/lib/api/client.ts`
- All pages function identically
- Network requests include correlation IDs and CSRF tokens
