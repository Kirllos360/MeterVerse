# OR5 — Bill Cycle Governance Certification

**Date:** 2026-06-17
**Classification:** ❌ MISSING

---

## Required Verification

| Item | Status | Evidence |
|------|--------|----------|
| OPEN (bill cycle) | ❌ | No `BillCycle` model. BillingPeriod has status enum (`active, closed, cancelled`) but no governance workflow around OPEN/CLOSE/CANCELLED. |
| CLOSED | ❌ | Same — no bill cycle closure process. `BillingPeriod` status can be set but without approval workflow. |
| CANCELLED | ❌ | Same — no cancellation governance. |
| Approval | ❌ | No workflow approval step for bill cycle operations. |
| Audit | ❌ | No bill-cycle-specific audit events. |
| Versioning | ❌ | No bill cycle versioning. |
| Duplicate Prevention | ⚠️ PARTIAL | Invoice generation has unique `(meter, billing_period, utility_type)` enforced in business logic (controller deletes existing invoices). But no DB-level unique constraint preventing double-generation for same period. |
| Same Month Prevention | ❌ | No guard preventing two bill cycles in same month for same meter. |
| Same Service Prevention | ❌ | No guard for duplicate service types in same cycle. |
| Same Meter Type Prevention | ❌ | No guard for duplicate meter type billing in same cycle. |

## Detailed Evidence

### Database
```
-- BillingPeriod model:
model BillingPeriod {
  id           String   @id @default(uuid())
  projectId    String
  periodCode   String   // unique per project
  startDate    DateTime
  endDate      DateTime
  status       BillingPeriodStatus @default(active)
  ...
}

-- BillingPeriodStatus enum:
'enum BillingPeriodStatus {
  active
  closed
  cancelled
}'

-- No BillCycle model exists
-- No approval/versioning columns on BillingPeriod
```
Source: `backend/prisma/schema.prisma`

### API
```
No bill cycle management endpoints:
- No POST /bill-cycles
- No POST /bill-cycles/:id/close
- No POST /bill-cycles/:id/cancel
- No bill cycle approval endpoints
```
Source: All controllers in `backend/src/`

### Invoice Generation Protection
The current invoice generation in `billing.controller.ts` has:
```typescript
// Deletes existing invoices for same meter+period+utility before regenerating
await this.prisma.invoiceLine.deleteMany({ where: { invoice: { meterId, billingPeriodId } } });
await this.prisma.invoice.deleteMany({ where: { meterId, billingPeriodId, utilityType } });
```
This prevents duplicates but by deletion, not by governance. A proper bill cycle governance would block generation for a CLOSED period rather than silently delete prior invoices.

## Classification

| Criterion | Result |
|-----------|--------|
| Bill cycle OPEN/CLOSE/CANCEL | ❌ MISSING |
| Approval workflow | ❌ MISSING |
| Duplicate prevention | ⚠️ PARTIAL (soft via pre-delete, no DB constraint) |
| Same month/service/meter-type prevention | ❌ MISSING |
| Audit/versioning | ❌ MISSING |

**Verdict: MISSING — No bill cycle governance exists. BillingPeriod has basic status (active/closed/cancelled) but no OPEN/CLOSE/CANCEL workflow, no approval gate, no governance around duplicate prevention, no versioning. Current invoice generation avoids duplicates by deleting prior invoices — this is destructive, not governed.**
