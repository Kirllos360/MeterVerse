# Step 1: READ

## Action
READ: Review 17_Enterprise_State_Machine/ for Customer, Invoice, Meter state machines. Review WorkflowState and WorkflowTransition models in schema.prisma

## Gates
- D06: Workflow has centralized engine
- D06: State transitions are valid (no illegal transitions)

## Evidence
- workflow-engine.js code
- Transition validation tests
- Audit log entries for state changes
