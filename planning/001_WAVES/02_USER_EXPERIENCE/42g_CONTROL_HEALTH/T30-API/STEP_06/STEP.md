# Step 6: IMPLEMENT

## Action
IMPLEMENT: Generate OpenAPI/Swagger docs from Zod schemas (zod-to-openapi or similar)

## Gates
- D02: DELETE idempotency, Zod validation
- D04: OpenAPI/Swagger compatible structure
- D10: Input validation at API layer

## Evidence
- Test showing 404 on double-delete (before: 500, after: 404)
- Zod schema files for 6 routes
- Swagger docs at /api/docs
