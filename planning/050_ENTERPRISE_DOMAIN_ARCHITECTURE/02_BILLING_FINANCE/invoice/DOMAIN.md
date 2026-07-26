# Invoice Domain

**File:** `02_BILLING_FINANCE/invoice/DOMAIN.md`
**Domain ID:** MV-DOM-010
**Priority:** P0 | **Status:** Draft

---

## Business Purpose
Manage the complete invoice lifecycle including generation, approval, distribution, adjustments, and payment tracking.

## Business Owner
Billing Director

## Enterprise Scope
Invoice from draft through issued, paid, and archived. Supports credit notes, debit notes, and adjustments.

## Capabilities
| Generation | Auto-generate from bill runs |
| Approval | Review and approve workflow |
| Distribution | Portal, email, SMS, print |
| Adjustments | Credit notes, debit notes, corrections |
| Lifecycle | Draft→Approved→Issued→Paid→Archived |

## Lifecycle States
DRAFT → PENDING_APPROVAL → APPROVED → ISSUED → PAID → PARTIALLY_PAID → OVERDUE → ARCHIVED

## Actors
| **Admin** | System administrator |
| **Operator** | Daily operator |
| **Viewer** | Read-only access |

## Permissions
admin.*, operator.*, viewer.*

## Dependencies
Customer (MV-DOM-003), Billing (MV-DOM-009), Tariff (MV-DOM-012), Payment (MV-DOM-011)

## API Endpoints
Full CRUD + POST /api/invoices/generate, POST /api/invoices/:id/issue, POST /api/invoices/:id/adjustments

## Database Tables
Invoice, InvoiceItem, InvoiceTax, DiscountRule

## Security Requirements
Standard RBAC authentication. All mutations audited.

## Compliance Requirements
Standard data retention and audit compliance.

## Performance Requirements
< 500ms for read operations, < 2s for write operations

## Availability Requirements
99.9% uptime

## Scalability Requirements
Horizontal scaling supported

## Future Expansion
Standard domain evolution

## Known Risks
Data consistency, performance under load

## Implementation Priority: P0
**Wave:** 03 | **Sessions:** 8
**Definition of Done:** Domain fully implemented with CRUD APIs, DB schema, and UI pages.
**Acceptance Criteria:** All capabilities operational. Tests passing. Documentation complete.
---
