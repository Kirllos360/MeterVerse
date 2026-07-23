# Domain.js Root Cause Diagnosis

**Date:** 2026-07-23
**Phase:** 42a, Task: T02, Step: S01
**Status:** COMPLETE

## Root Causes (4 issues)

### Issue 1: Circular ES Module Dependency (BLOCKER)
- `domain.js` imports `prisma` from `server.js` (line 3)
- `server.js` imports `domainRouter` from `domain.js` (line 16)
- ES module spec: all imports resolve BEFORE any module body executes
- Result: `prisma` is `undefined` when domain.js's top-level `crud()` calls execute (lines 69-168)
- Fix: extract `prisma` to a separate module (`db.js`) to break the cycle

### Issue 2: `model.update` instead of `model().update`
- domain.js line 53: `const item = await model.update(...)` 
- `model` is `() => prisma[modelName]` (a factory function)
- Should be `model().update(...)` — missing parentheses
- This causes a runtime error: `model.update is not a function`

### Issue 3: Domain route disabled in server.js
- Line: `// app.use('/api/domain', domainRouter) // disabled`
- 18 domain entities (contracts, tariffs, bill-cycles, etc.) have no API access

### Issue 4: PrismaClient instantiation order
- `export const prisma = new PrismaClient()` at server.js line 27
- All route imports (including domain.js) at lines 1-20
- Even without circular import, the timing is fragile

## Affected Entities (18)
contracts, tariffs, tariff-rates, tariff-tiers, bill-cycles, bill-runs, charge-rules, invoice-items, meter-assignments, meter-events, validation-rules, workflow-states, collection-cases, payment-gateways, payment-transactions, customer-groups, slas, alert-rules, escalation-policies

## Fix Strategy
1. Create `src/db.js` — dedicated PrismaClient module
2. Update `domain.js` to import from `db.js` instead of `server.js`
3. Fix `model.update` → `model().update`
4. Uncomment domain route in `server.js`
5. Update other route files that import prisma from server.js (for consistency)
