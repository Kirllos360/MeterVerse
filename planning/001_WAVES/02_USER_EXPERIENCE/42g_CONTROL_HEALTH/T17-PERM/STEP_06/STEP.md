# Step 6: IMPLEMENT

## Action
IMPLEMENT: Update meter-assignments.js, services.js, preferences.js, search.js — 13 routes total

## Gates
- D02: requirePermission() on every endpoint
- D12: Authorization checked on all endpoints
- D20: GATE_CHECK passes

## Evidence
- Permission test results per route
- Git diff showing requireRole → requirePermission across 13 files
