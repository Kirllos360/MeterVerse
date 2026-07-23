# Step 7: TEST

## Action
TEST: Test every updated route with authorized user (gets 200) and unauthorized user (gets 403)

## Gates
- D02: requirePermission() on every endpoint
- D12: Authorization checked on all endpoints
- D20: GATE_CHECK passes

## Evidence
- Permission test results per route
- Git diff showing requireRole → requirePermission across 13 files
