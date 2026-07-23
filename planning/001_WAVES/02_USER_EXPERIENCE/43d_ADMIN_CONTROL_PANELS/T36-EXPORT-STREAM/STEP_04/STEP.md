# Step 4: IMPLEMENT

## Action
IMPLEMENT: Rewrite exportData() in crud-service.js and export endpoints to use streaming, add 10K row cap

## Gates
- D11: Export endpoints don't load all into memory
- D11: Pagination caps

## Evidence
- Memory usage before/after
- Export of 50K+ records succeeds
