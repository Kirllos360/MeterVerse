# Step 3: PLAN

## Action
PLAN: Read 6 routes with missing Zod (alerts.js, monitor.js, preferences.js, search.js, security.js, services.js). Define schemas.

## Gates
- D02: DELETE idempotency, Zod validation
- D04: OpenAPI/Swagger compatible structure
- D10: Input validation at API layer

## Evidence
- Test showing 404 on double-delete (before: 500, after: 404)
- Zod schema files for 6 routes
- Swagger docs at /api/docs
