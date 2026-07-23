# Step 2: UNDERSTAND

## Action
UNDERSTAND: Map each requireRole() call to its equivalent requirePermission() key. Check if missing keys need creation

## Gates
- D02: requirePermission() on every endpoint
- D12: Authorization checked on all endpoints
- D20: GATE_CHECK passes

## Evidence
- Permission test results per route
- Git diff showing requireRole → requirePermission across 13 files
