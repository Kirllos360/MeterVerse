# Billing Domain

**File:** `02_BILLING_FINANCE/billing/DOMAIN.md`
**Domain ID:** MV-DOM-009
**Priority:** P0 — Critical Path
**Status:** Draft — Enterprise Planning Phase

---

## Business Purpose
The Billing domain orchestrates the end-to-end process of calculating consumption from readings, applying tariffs, generating invoices, and managing the billing lifecycle across multiple utilities, areas, and customer segments.

## Business Owner
Chief Financial Officer / Billing Operations Director

## Capabilities

| Capability | Sub-capabilities | Status |
|-----------|------------------|--------|
| Bill Run | Create, Schedule, Execute, Close | ✅ Live |
| Consumption Calculation | Reading diff, Interval aggregation, Estimation | ✅ Live |
| Tariff Application | Flat rate, Tiered, Time-of-use, Demand | ✅ Live |
| Charge Calculation | Fixed charges, Variable charges, Pro-ration | ✅ Live |
| Invoice Generation | PDF, Email, Portal, Print | ✅ Live |
| Invoice Lifecycle | Draft, Approve, Issue, Cancel, Credit note | ✅ Live |
| Invoice History | Amendments, Adjustments, Regeneration | ✅ Live |
| Bulk Billing | Batch invoice generation, Multi-meter | ✅ Live |
| Water Difference Mode | Report-only, Warn, Block | ✅ Live |

## Business Rules
| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BIL-001 | Bill run cannot overlap with existing run for same period | Application guard |
| BIL-002 | Consumption = Reading(current) - Reading(previous) | Calculation rule |
| BIL-003 | Zero consumption is valid (no usage in period) | Validation rule |
| BIL-004 | Negative consumption = flagged for review | Validation rule |
| BIL-005 | Invoices are immutable after issue (immutableAt) | Database constraint |
| BIL-006 | Invoice cancellation requires reason and audit trail | Workflow rule |
| BIL-007 | Credit notes cannot exceed original invoice amount | Business rule |

## Lifecycle
```
DRAFT → PENDING_APPROVAL → APPROVED → ISSUED → PAID → ARCHIVED
                                              → CANCELLED → CREDIT_NOTE
```

## API Endpoints
| Method | Path | Status |
|--------|------|--------|
| POST | `/api/billing/runs` | ✅ Live |
| GET | `/api/billing/runs` | ✅ Live |
| GET | `/api/billing/runs/:id` | ✅ Live |
| POST | `/api/billing/runs/:id/generate` | ✅ Live |
| POST | `/api/billing/runs/:id/close` | ✅ Live |
| POST | `/api/billing/runs/:id/cancel` | ✅ Live |
| POST | `/api/business/pipeline/execute` | ✅ Live |
| POST | `/api/invoices/generate` | ✅ Live |
| POST | `/api/invoices/:id/issue` | ✅ Live |
| POST | `/api/invoices/:id/cancel` | ✅ Live |
| POST | `/api/invoices/:id/adjustments` | ✅ Live |

**Priority:** P0 — Critical | **Wave:** 03 | **Sessions:** 20

## Definition of Done
Billing domain fully implemented with bill run, tariff application, and invoice generation.

## Acceptance Criteria
Bill runs execute correctly. Tariffs applied accurately. Invoices generated without errors.
