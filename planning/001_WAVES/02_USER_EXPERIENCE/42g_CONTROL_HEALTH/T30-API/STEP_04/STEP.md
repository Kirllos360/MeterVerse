# Step 4: IMPLEMENT

## Action
IMPLEMENT: Fix domain.js DELETE — add findUnique check before delete (or catch P2025 → 404) for all 15 entities

## Gates
- D02: DELETE idempotency, Zod validation
- D04: OpenAPI/Swagger compatible structure
- D10: Input validation at API layer

## Evidence
- Test showing 404 on double-delete (before: 500, after: 404)
- Zod schema files for 6 routes
- Swagger docs at /api/docs
