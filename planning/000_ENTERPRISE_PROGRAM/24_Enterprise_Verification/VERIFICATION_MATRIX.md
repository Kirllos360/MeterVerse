# Enterprise Verification Matrix

**Purpose:** Every feature must pass ALL verification steps before closure.

## Verification Chain

```
Compile → Type Check → Lint → Unit Test → Integration Test → Workflow Test → Performance Test → Accessibility → Security → Graph Compare → Spec Compare → Architecture Compare → Business Rule Compare → UI Compare → Screenshot Compare → Evidence → Git → Done
```

## Verification Requirements by Feature Type

| Feature Type | Required Verifications |
|-------------|----------------------|
| New API endpoint | Compile, Unit, Integration, Security, Graph Compare, Spec Compare, Evidence |
| New UI page | Compile, Type Check, Accessibility, UI Compare, Screenshot Compare, Evidence |
| Database migration | Compile, Integration, Rollback Test, Graph Compare, Evidence |
| Business rule change | Unit, Integration, Business Rule Compare, Evidence |
| AI model | Unit, Performance, Accuracy Test, Evidence |
| Infrastructure change | Compile, Deployment Test, Rollback Test, Security, Evidence |

## Blocking Rules
1. Any verification failure blocks step completion
2. Security failures block ALL progress until resolved
3. Graph Compare failures require ADR update before proceeding
4. Evidence missing = step NOT complete
