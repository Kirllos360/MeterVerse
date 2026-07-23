# Step 4: IMPLEMENT

## Action
IMPLEMENT: Create enums, generate migration, run migration, update seed data for all 5 reference tables

## Gates
- D03: @@index on FKs, proper enums
- D11: Query limits prevent DB overload

## Evidence
- Migration output
- Seed data verification
- Query log showing no N+1
