# Step 1: READ

## Action
READ: Find export endpoints — check which load all data into memory (not streamed)

## Gates
- D11: Export endpoints don't load all into memory
- D11: Pagination caps

## Evidence
- Memory usage before/after
- Export of 50K+ records succeeds
