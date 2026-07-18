# ECG-01R-005 — Fix N+1 Query in Invoice Generation

**Platform:** Performance  
**Priority:** P1  
**Estimated Effort:** 2-3 days  
**Depends on:** None  

## Objective

Eliminate per-meter database roundtrips during invoice generation.

## Scope

### File: `src/billing/billing.controller.ts`

**Lines 159-226** — `generateInvoices()`:

1. **`invoice.count()` per meter (line 184)** — Replace with a single `GROUP BY meterId COUNT` query before the loop:
   ```typescript
   const existingCounts = await this.prisma.invoice.groupBy({
     by: ['meterId'],
     where: { projectId, billingPeriodId },
     _count: { id: true },
   });
   const countMap = new Map(existingCounts.map(c => [c.meterId, c._count.id]));
   ```

2. **`invoice.create()` per meter (line 189)** — Batch with `createMany()`:
   ```typescript
   const invoicesData = meters.map(m => ({ ... }));
   await this.prisma.invoice.createMany({ data: invoicesData });
   ```

3. **`invoiceLine.create()` per line (lines 208-209)** — Batch with `createMany()`:
   ```typescript
   await this.prisma.invoiceLine.createMany({ data: allLines });
   ```

4. **`waterDifferencePolicy.apply()` per water main meter (line 222)** — Batch water difference calculation with a single query.

## Verification

- `npx tsc --noEmit` — 0 errors
- Invoice generation for 1000 meters executes < 20 DB queries (down from 5000+)
- Test: generate for project with 50 meters, verify all invoices created correctly
- No regression in invoice content or amounts
