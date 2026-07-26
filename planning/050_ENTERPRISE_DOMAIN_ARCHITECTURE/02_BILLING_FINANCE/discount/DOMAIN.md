# Discount Domain

**File:** `02_BILLING_FINANCE/discount/DOMAIN.md`
**Domain ID:** MV-DOM-019
**Priority:** P1 | **Status:** Draft

---

## Business Purpose
Manage discount rules for promotional, loyalty, and early payment discounts.

## Business Owner
Billing Director

## Enterprise Scope
Discount rule creation, approval, application, and rollback.

## Capabilities
| Creation | Create discount rules |
| Approval | Approve before application |
| Application | Apply to invoice generation |

## Lifecycle States
ACTIVE → ARCHIVED → RETIRED

## Actors
| **Admin** | System administrator |
| **Operator** | Daily operator |
| **Viewer** | Read-only access |

## Permissions
admin.*, operator.*, viewer.*

## Dependencies
Billing (MV-DOM-009), Customer Group

## API Endpoints
Standard CRUD: GET, POST, PUT, DELETE

## Database Tables
Standard entity tables with archivedAt

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

## Implementation Priority: P1
**Wave:** 05 | **Sessions:** 3
**Definition of Done:** Domain fully implemented with CRUD APIs, DB schema, and UI pages.
**Acceptance Criteria:** All capabilities operational. Tests passing. Documentation complete.
---
