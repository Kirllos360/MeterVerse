# Step 2: UNDERSTAND

## Action
UNDERSTAND: Export pattern — currently reads ALL rows, formats, sends as JSON/CSV. Must be cursor-based or streamed.

## Gates
- D11: Export endpoints don't load all into memory
- D11: Pagination caps

## Evidence
- Memory usage before/after
- Export of 50K+ records succeeds
