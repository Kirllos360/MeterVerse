# ECG-01R-018 — Add Error Boundaries to Frontend

**Platform:** Frontend Readiness  
**Priority:** P2  
**Estimated Effort:** 1-2 days  
**Depends on:** None  

## Objective

Add error boundaries and error pages to the frontend to prevent silent failures and broken UI.

## Scope

### Create `Frontend/src/app/error.tsx`
- Root error boundary for the app
- Display user-friendly error message with correlation ID
- Include "Try Again" and "Go Home" buttons
- Log error details to console for debugging

### Create `Frontend/src/app/global-error.tsx`
- Global error boundary (catches errors in root layout)
- Same pattern as above

### Create `Frontend/src/components/shared/ErrorBoundary.tsx`
- Reusable React Error Boundary component
- Props: `fallback?`, `onError?`, `resetKeys?`
- Wrap QueryBoundary and page content in this boundary

### Audit existing error handling
- Replace the 5 `catch(() => [])` patterns (SettlementPage, UtilityDashboard, SolarDashboard, SettingsPage, etc.) with proper error handling
- Each should: show error state UI, log the error, and optionally retry

### Add loading states
- Audit pages that use inline `useQuery()` without loading/error handling
- Add loading skeletons for pages missing them

## Verification

- `bun run build` — 0 errors
- Uncaught errors in page components show error UI instead of blank page
- error.tsx renders for route-level errors
- global-error.tsx renders for layout-level errors
- Console has structured error logging
