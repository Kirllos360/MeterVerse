# Permissions

## Current Knowledge
**What exists:**
- 57 permission keys seeded in database
- requirePermission() middleware with role-based wildcard matching
- 5 user roles: super_admin, admin, operator, billing, viewer
- PermissionOnRole join table
- Only 8/21 route files currently use requirePermission()

**Operation types needed (from user):**
- View element
- Add element
- Edit element
- Activate element
- Deactivate element
- Terminate element
- Archive element
- Delete element
- Future operations

## Unknown
- Whether permissions should be per-user or per-role or both
- Custom role creation workflow
- Whether area-based permissions are needed (user sees only their area)

## Assumptions
- 9 operation types × entity count = 500+ permission keys needed
- Custom roles will be needed
- Area-based data visibility will be needed

## Confidence
- Current permission system: 95% (built and tested)
- Coverage completeness: 30% (only 8/21 routes use it)

## Need User Confirmation
- [ ] Confirm all operation types needed
- [ ] Confirm custom role requirements
- [ ] Confirm area-based permissions
