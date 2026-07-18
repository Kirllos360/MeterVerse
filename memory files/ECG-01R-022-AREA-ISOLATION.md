# ECG-01R-022 — Add Row-Level Area Data Isolation

**Platform:** Area Isolation  
**Priority:** P2  
**Estimated Effort:** 3-5 days  
**Depends on:** None  

## Objective

Ensure every database query is automatically scoped to the requesting area. Prevent cross-area data leakage at the query level.

## Scope

### Create `AreaFilterInterceptor`

Create `src/common/interceptors/area-filter.interceptor.ts`:
- Read `request.areaId` from `ValidationContext`
- Inject `areaId` into the query context for all Prisma queries
- For super_admin users, skip filtering (they can see all areas)
- For area-scoped users, automatically append `where: { areaId: request.areaId }` to all queries

### Option A: Prisma Middleware (recommended)

Add Prisma middleware in `PrismaService` that automatically appends area filters:

```typescript
this.$use(async (params, next) => {
  const areaId = AsyncContextService.get('areaId');
  if (areaId && params.args?.where) {
    params.args.where.areaId = areaId;
  }
  return next(params);
});
```

This requires:
- All models must have an `areaId` field
- The middleware must know which models are area-scoped and which are global
- Super_admin bypass

### Option B: Service-level helper (less risky)

Create a reusable `requireAreaScope(entity, projectId)` helper:
- Called after every `findUnique` / `findFirst` / `findMany`
- Throws `PlatformException(AUTH_AREA_DENIED)` if entity's area doesn't match request's area
- Current pattern (already used in meters/customers/sim-cards/payments/readings) formalized into single helper

### Audit existing project-scoping

The 13 instances of `if (projectId && entity.projectId !== projectId)` across 7 files should be:
1. Standardized to use the new helper
2. Extended to check `areaId` if `projectId` is not available

## Verification

- `npx tsc --noEmit` — 0 errors
- Area 1 user querying "all meters" only sees Area 1 meters
- Super_admin user sees all areas
- Cross-area ID enumeration returns empty/denied (not "not found" — avoids confirming existence)
