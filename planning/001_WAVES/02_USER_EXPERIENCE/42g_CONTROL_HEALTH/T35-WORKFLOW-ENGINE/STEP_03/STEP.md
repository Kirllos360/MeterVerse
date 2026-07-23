# Step 3: PLAN

## Action
PLAN: Design workflow-engine.js API — getValidTransitions(), transition(entityType, entityId, toState, actor), validateTransition()

## Gates
- D06: Workflow has centralized engine
- D06: State transitions are valid (no illegal transitions)

## Evidence
- workflow-engine.js code
- Transition validation tests
- Audit log entries for state changes
