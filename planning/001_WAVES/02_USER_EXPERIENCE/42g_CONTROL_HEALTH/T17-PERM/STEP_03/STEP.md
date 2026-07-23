# Step 3: PLAN

## Action
PLAN: Migration order — start with read-only routes, progress to mutation routes, end with admin.js (most complex)

## Gates
- D02: requirePermission() on every endpoint
- D12: Authorization checked on all endpoints
- D20: GATE_CHECK passes

## Evidence
- Permission test results per route
- Git diff showing requireRole → requirePermission across 13 files
