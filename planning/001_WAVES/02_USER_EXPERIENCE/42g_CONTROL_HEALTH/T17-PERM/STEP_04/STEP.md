# Step 4: IMPLEMENT

## Action
IMPLEMENT: Update admin.js — replace all requireRole("admin","super_admin") with requirePermission("admin.*")

## Gates
- D02: requirePermission() on every endpoint
- D12: Authorization checked on all endpoints
- D20: GATE_CHECK passes

## Evidence
- Permission test results per route
- Git diff showing requireRole → requirePermission across 13 files
