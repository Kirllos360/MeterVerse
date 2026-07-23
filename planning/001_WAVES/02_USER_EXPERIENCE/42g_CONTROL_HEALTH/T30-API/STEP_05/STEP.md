# Step 5: IMPLEMENT

## Action
IMPLEMENT: Add Zod validation schemas to alerts.js, monitor.js, preferences.js, search.js, security.js, services.js

## Gates
- D02: DELETE idempotency, Zod validation
- D04: OpenAPI/Swagger compatible structure
- D10: Input validation at API layer

## Evidence
- Test showing 404 on double-delete (before: 500, after: 404)
- Zod schema files for 6 routes
- Swagger docs at /api/docs
