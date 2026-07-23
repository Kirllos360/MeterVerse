# Step 3: PLAN

## Action
PLAN: Batch routes by complexity. Start with simple routes (notifications.js, services.js), end with complex (crud.js, domain.js)

## Gates
- D02: auditLog() on all mutations
- D09: Entity operations are audited

## Evidence
- Audit log entries for each route
- Git diff showing auditLog calls added
