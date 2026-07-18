# ECG-01R-006 — Add Missing Database Indexes

**Platform:** Performance  
**Priority:** P1  
**Estimated Effort:** 2 days  
**Depends on:** None  

## Objective

Add `@@index` annotations to 71 database models missing critical indexes.

## Scope

### File: `prisma/schema.prisma`

Add indexes to all models currently missing them. Priority order:

**Priority 1 — Foreign keys on high-volume tables:**
- `Meter`: add `@@index([projectId])`, `@@index([locationId])`, `@@index([status])`
- `MeterAssignment`: add `@@index([meterId])`, `@@index([customerId])`, `@@index([status])`, `@@index([startAt, endAt])`
- `SIMAssignment`: add `@@index([simId])`, `@@index([meterId])`, `@@index([status])`
- `InvoiceLine`: add `@@index([invoiceId])`
- `TariffPlan`: add `@@index([projectId])`, `@@index([meterType])`, `@@index([status])`

**Priority 2 — Status/date queries:**
- `BillingPeriod`: add `@@index([status])`
- `BillingCycle`: add `@@index([status])`
- `CoreUser`: add `@@index([status])`
- `SIMCard`: add `@@index([status])`

**Priority 3 — Core schema foreign keys:**
- `CoreUserRoleAssignment`: add `@@index([userId])`, `@@index([roleId])`
- `CoreRolePermission`: add `@@index([roleId])`, `@@index([permissionId])`
- All remaining models without indexes

### Generate migration

- Run `npx prisma migrate dev --name add_missing_indexes`
- Verify migration SQL creates only `CREATE INDEX CONCURRENTLY` statements

## Verification

- `npx prisma validate` — valid
- Migration applies cleanly
- Query plans improve for all indexed fields
- No downtime (use `CONCURRENTLY` for production)
