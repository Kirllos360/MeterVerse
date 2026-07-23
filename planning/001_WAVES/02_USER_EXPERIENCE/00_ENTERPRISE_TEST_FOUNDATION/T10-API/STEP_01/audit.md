# T10 Step 01 — Audit: 21 Route Files & Existing Test Patterns

## Current State
- 21 route files in backend/src/routes/
- 8 use requirePermission(), 12 migrated to requirePermission() in T17, 1 (auth.js) uses authenticate only
- Existing test: `tests/integration.test.mjs` — 2 tests, fails because requires live server (no supertest)
- `tests/unit/` has 10 files but covers services only, not routes

## Route Categories for Testing

| Category | Routes | Est. Tests |
|----------|--------|:----------:|
| Auth | auth.js | 8 (login success/failure/lockout, me, refresh, MFA) |
| CRUD with requirePermission | customers.js, invoices.js, meters.js, payments.js, readings.js, tasks.js | 24 (6 routes × 4 tests: list/read/create/delete) |
| CRUD factory (domain.js) | domain.js | 8 (list/read/create/update/delete + idempotency) |
| Admin panel | admin.js | 6 (health, stats, user mgmt, roles, settings) |
| Other | ai.js, alerts.js, business.js, monitor.js, notifications.js, preferences.js, reports.js, search.js, security.js, services.js | 20 (2 per route: auth + basic operation) |
| Permission tests | all routes | 10 (unauthorized → 401/403) |
| **Total** | **21 routes** | **~76 tests** |

## Testing Approach
- Use **supertest** to test Express routes directly (no live server needed)
- Import the Express app, mock authentication, test against the actual route handlers
- Reuse `mock-prisma.js` from unit tests for database mocking
