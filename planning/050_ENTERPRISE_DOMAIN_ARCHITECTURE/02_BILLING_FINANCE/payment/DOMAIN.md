# Payment Domain

**File:** `02_BILLING_FINANCE/payment/DOMAIN.md`
**Domain ID:** MV-DOM-011
**Priority:** P0 | **Status:** Draft

---

## Business Purpose
Manage payment recording, allocation, refunds, and reconciliation across all channels.

## Business Owner
Finance Director

## Enterprise Scope
Payment lifecycle from registration through allocation to reconciliation. Supports cash, card, bank transfer, and wallet payments.

## Capabilities
| Registration | Record payments from all channels |
| Allocation | Auto-allocate to invoices (oldest first) |
| Refunds | Process refunds and reversals |
| Reconciliation | Match with bank statements |
| Reporting | Daily/monthly payment reports |

## Lifecycle States
PENDING → COMPLETED → ALLOCATED → REVERSED → REFUNDED

## Actors
| **Admin** | System administrator |
| **Operator** | Daily operator |
| **Viewer** | Read-only access |

## Permissions
admin.*, operator.*, viewer.*

## Dependencies
Customer (MV-DOM-003), Invoice (MV-DOM-010), Accounting (MV-DOM-013), Gateway (MV-DOM-027)

## API Endpoints
POST /api/payments, POST /api/payments/:id/reverse, POST /api/payments/:id/refund, GET /api/payments/customers/:id/statement

## Database Tables
Payment, PaymentTransaction, GatewayLog

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
**Wave:** 02 | **Sessions:** 5
**Definition of Done:** Domain fully implemented with CRUD APIs, DB schema, and UI pages.
**Acceptance Criteria:** All capabilities operational. Tests passing. Documentation complete.
---
