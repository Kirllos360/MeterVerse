# Customer Domain

**File:** `01_CORE_DOMAINS/customer/DOMAIN.md`
**Domain ID:** MV-DOM-003
**Priority:** P0 — Critical Path
**Status:** Draft — Enterprise Planning Phase

---

## Business Purpose
The Customer domain manages all person, organization, and entity records that receive utility services. Customers are the central business entity linking meters, contracts, invoices, payments, and communications.

## Business Owner
Chief Customer Officer / CRM Director

## Capabilities

| Capability | Sub-capabilities | Status |
|-----------|------------------|--------|
| Customer Registration | Individual, Corporate, Government, Bulk import | ✅ Live |
| Customer Groups | Segmentation, Group pricing, SLA assignment | ✅ Live |
| Customer Contacts | Multiple contacts per customer, Roles | 🔲 Planned |
| Customer Communications | Call log, Email log, SMS log, Visit log | 🔲 Planned |
| Customer Statements | Balance, Aging, Transaction history | ✅ Live |
| Customer Portals | Self-service, Bill view, Payment, Submit reading | 🔲 Planned |
| Dispute Management | Invoice disputes, Adjustments, Resolution | 🔲 Planned |

## Business Rules
| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| CST-001 | Customer cannot be deleted with active meters | Soft delete guard |
| CST-002 | Customer cannot be deleted with unpaid invoices | Soft delete guard |
| CST-003 | Email must be unique across active customers | Application rule |
| CST-004 | Corporate customers require tax ID | Validation rule |

## Lifecycle
```
LEAD → PROSPECT → ACTIVE → SUSPENDED → CLOSED → ARCHIVED
```

## Dependencies
| Domain | Type | Description |
|--------|------|-------------|
| Meter | Dependent | Meters assigned to customer |
| Contract | Required | Service contract binds customer to terms |
| Invoice | Dependent | Invoices issued to customer |
| Payment | Dependent | Payments received from customer |
| Collection | Dependent | Collection actions on delinquent customer |

## API Endpoints
| Method | Path | Status |
|--------|------|--------|
| GET | `/api/customers` | ✅ Live |
| GET | `/api/customers/:id` | ✅ Live |
| POST | `/api/customers` | ✅ Live |
| PUT | `/api/customers/:id` | ✅ Live |
| DELETE | `/api/customers/:id` | ✅ Live |
| POST | `/api/customers/:id/restore` | ✅ Live |
| GET | `/api/customers/:id/statement` | ✅ Live |
| GET | `/api/customers/:id/aging` | ✅ Live |

**Priority:** P0 — Critical | **Wave:** 01 | **Sessions:** 10

## Definition of Done
Customer domain fully implemented with registration, groups, contacts, and statements.

## Acceptance Criteria
Customer CRUD operational. Group management functional. Statements accurate.
