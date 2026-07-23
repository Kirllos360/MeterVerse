# Step 5: IMPLEMENT

## Action
IMPLEMENT: Update ai.js, business.js, crud.js, domain.js, monitor.js, notifications.js, reports.js, security.js

## Gates
- D02: requirePermission() on every endpoint
- D12: Authorization checked on all endpoints
- D20: GATE_CHECK passes

## Evidence
- Permission test results per route
- Git diff showing requireRole → requirePermission across 13 files
