# Prompt Library

Standard prompts for AI agents working on MeterVerse:

## New Feature
"Implement [feature] following the existing [entity] pattern. Include:
- Zod validation schema
- RBAC with requirePermission
- auditLog on all mutations
- Error handling consistent with existing routes
- Evidence in docs/reviews/"

## Bug Fix
"Investigate [issue]. Steps:
1. Check error handler catches this case
2. Check validation covers edge case
3. Check permission key exists
4. Write test that reproduces bug
5. Fix and verify test passes"

## Database Change
"Add [field/table] to Prisma schema:
1. npx prisma db push — test locally
2. Create migration with npx prisma migrate dev
3. Rollback script at [path]
4. Update affected services and routes"
