# Step 1: READ

## Action
READ: Compare permissions.js and security.js — identify all duplicated code (ROUTE_PERMISSION_MAP, ROLE_PERMISSIONS)

## Gates
- D02: Follows existing patterns
- D14: DRY — reuse existing patterns

## Evidence
- Git diff showing dedup
- Controller files created
- All routes still functional
