# Step 03 — PLAN: Test Structure Design

## Test Directory Structure

```
backend/
├── tests/
│   ├── unit/
│   │   ├── ai-engine.test.mjs
│   │   ├── auth-engine.test.mjs
│   │   ├── business-engine.test.mjs
│   │   ├── crud-service.test.mjs
│   │   ├── notification-engine.test.mjs
│   │   ├── websocket-gateway.test.mjs
│   │   ├── alert-engine.test.mjs
│   │   ├── billing-engine.test.mjs
│   │   ├── email-engine.test.mjs
│   │   ├── kpi-engine.test.mjs
│   │   ├── sms-engine.test.mjs
│   │   └── validation-engine.test.mjs
│   ├── helpers/
│   │   ├── mock-prisma.js
│   │   └── test-utils.js
│   ├── integration.test.mjs        (existing)
│   ├── notification-engine.test.mjs (existing — move to unit/)
│   ├── test-exports.mjs            (existing)
│   ├── test-notifications-api.mjs  (existing)
│   ├── verify-templates.mjs        (existing)
│   └── wire-events-test.mjs        (existing)
```

## Mocking Strategy

### Prisma Mock (mock-prisma.js)
Create a shared mock that stubs all Prisma client methods with vitest.fn():
```js
export const prisma = {
  customer: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
  meter: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
  reading: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), count: vi.fn() },
  invoice: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
  // ... all 78 models
}
```

### Module-Level Mock Pattern
Each test file:
1. Mock db.js or server.js to return the shared mock-prisma
2. Use vi.mock() to replace module imports
3. Test each exported function with controlled mock returns
4. Assert expected Prisma calls were made

## Coverage Threshold

Set to 80% in vitest.config.ts:
```ts
test: {
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    thresholds: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
}
```

## Implementation Order

1. Create mock-prisma.js helper
2. Create test-utils.js (common test data factories)
3. Write tests for Priority 1 services (ai-engine, auth-engine, business-engine, crud-service)
4. Write tests for Priority 2 services (notification-engine, websocket-gateway)
5. Write tests for Priority 3 services (remaining 6)
6. Update vitest.config.ts with coverage threshold
7. Run full suite, fix failures, verify 80%+ coverage

## Minimum Test Count

- Priority 1 (4 services): 4 tests each = 16 minimum
- Priority 2 (2 services): 3 tests each = 6 minimum
- Priority 3 (6 services): 2 tests each = 12 minimum
- **Total minimum: 34 tests**
