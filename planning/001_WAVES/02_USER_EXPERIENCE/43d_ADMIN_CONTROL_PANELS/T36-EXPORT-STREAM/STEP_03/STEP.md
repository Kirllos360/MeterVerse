# Step 3: PLAN

## Action
PLAN: Design streaming export — use Prisma cursor pagination, stream rows, cap at 10K per export

## Gates
- D11: Export endpoints don't load all into memory
- D11: Pagination caps

## Evidence
- Memory usage before/after
- Export of 50K+ records succeeds
