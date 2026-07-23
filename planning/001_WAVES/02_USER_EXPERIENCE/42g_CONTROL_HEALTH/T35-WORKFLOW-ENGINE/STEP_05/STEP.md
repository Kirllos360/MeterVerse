# Step 5: IMPLEMENT

## Action
IMPLEMENT: Integrate engine into route handlers (customers.js, invoices.js, meters.js) — replace ad-hoc state logic

## Gates
- D06: Workflow has centralized engine
- D06: State transitions are valid (no illegal transitions)

## Evidence
- workflow-engine.js code
- Transition validation tests
- Audit log entries for state changes
