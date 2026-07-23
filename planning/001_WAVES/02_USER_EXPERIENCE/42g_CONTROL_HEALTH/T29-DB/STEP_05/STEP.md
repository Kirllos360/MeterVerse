# Step 5: IMPLEMENT

## Action
IMPLEMENT: Audit all queries for N+1 patterns (use Prisma $queryRaw logging to detect), fix with include/select

## Gates
- D03: @@index on FKs, proper enums
- D11: Query limits prevent DB overload

## Evidence
- Migration output
- Seed data verification
- Query log showing no N+1
