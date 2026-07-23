# Step 1: READ

## Action
READ: Audit all 21 route files — identify which use requireRole(), which use requirePermission(), which use neither

## Gates
- D02: requirePermission() on every endpoint
- D12: Authorization checked on all endpoints
- D20: GATE_CHECK passes

## Evidence
- Permission test results per route
- Git diff showing requireRole → requirePermission across 13 files
