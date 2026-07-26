# Journal Domain

**File:** `02_BILLING_FINANCE/journal/DOMAIN.md`
**Domain ID:** MV-DOM-015
**Priority:** P0 — Critical Path (MISSING — Must Build)
**Status:** 🔴 NOT IMPLEMENTED — Enterprise Planning Phase

---

## Business Purpose
The Journal domain provides all operational, financial, and analytical journals required to track, report, and audit daily business transactions across the enterprise. Journals are the bridge between operational transactions and the General Ledger.

## Capabilities
| Capability | Description | Status |
|-----------|-------------|--------|
| Customer Journal | Per-customer transaction history (invoices, payments, adjustments) | 🔴 Missing |
| Payment Journal | Daily payment records by method, area, collector | 🔴 Missing |
| Sales Journal | Daily invoice/Revenue records | 🔴 Missing |
| Purchase Journal | Daily procurement/expense records | 🔴 Missing |
| Cash Journal | Daily cash receipts and disbursements | 🔴 Missing |
| Collection Journal | Daily collection actions and results | 🔴 Missing |
| Adjustment Journal | Credit notes, debit notes, write-offs | 🔴 Missing |
| General Journal | Miscellaneous double-entry adjustments | 🔴 Missing |

## Business Rules
| Rule ID | Rule |
|---------|------|
| JRN-001 | All journals must balance to zero (total debits = total credits) |
| JRN-002 | Journals are immutable after period close |
| JRN-003 | Each journal entry must reference a source document |
| JRN-004 | Customer journal is read-only (auto-generated from transactions) |

## User Stories
- As an accountant, I want to view the payment journal filtered by date range, area, and payment method
- As a collections manager, I want to see the daily collection journal with aging analysis
- As a CFO, I want monthly journal summaries with period-over-period comparison
- As an auditor, I want to trace any journal entry back to its source transaction

## UI Requirements
| View | Filter | Aggregation |
|------|--------|-------------|
| Customer Journal | Customer, Date range, Transaction type | Running balance |
| Payment Journal | Date, Method, Area, Collector | Daily total, Method summary |
| Collection Journal | Date, Collector, Area, Status | Daily count, Amount collected |
| Daily Summary | Date | Totals by journal type |
| Monthly Summary | Month | Period comparison |
| Quarterly Summary | Quarter | Trend analysis |
| Yearly Summary | Year | YoY comparison |

## API Endpoints Required
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/journals/customer/:customerId` | Customer journal |
| GET | `/api/journals/payments` | Payment journal (filtered) |
| GET | `/api/journals/collections` | Collection journal |
| GET | `/api/journals/summary/daily` | Daily summary |
| GET | `/api/journals/summary/monthly` | Monthly summary |
| GET | `/api/journals/summary/quarterly` | Quarterly summary |
| GET | `/api/journals/summary/yearly` | Yearly summary |

**Priority:** P0 — Critical | **Wave:** 07 | **Sessions:** 15 | **Dependencies:** Accounting, Payment, Collection, Invoice
