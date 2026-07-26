# Collection Domain

**File:** `02_BILLING_FINANCE/collection/DOMAIN.md`
**Domain ID:** MV-DOM-016
**Priority:** P0 | **Status:** Draft

---

## Business Purpose
Manage debt collection including case assignment, field visits, payment promises, escalations, and write-offs.

## Business Owner
Collection Director

## Enterprise Scope
Collection case lifecycle from overdue invoice through assignment, visit, resolution, or escalation.

## Capabilities
| CaseCreation | Auto-create from overdue invoices |
| Assignment | Route to collectors |
| Visits | Field visit management |
| Promises | Payment promise tracking |
| Escalation | Time-based escalation |
| WriteOff | Bad debt write-off |

## Lifecycle States
OPEN → IN_PROGRESS → CONTACTED → PROMISE_TO_PAY → PAID → ESCALATED → CLOSED

## Actors
| **Admin** | System administrator |
| **Operator** | Daily operator |
| **Viewer** | Read-only access |

## Permissions
admin.*, operator.*, viewer.*

## Dependencies
Customer (MV-DOM-003), Invoice (MV-DOM-010), Payment (MV-DOM-011)

## API Endpoints
CRUD via /api/domain/collection-cases

## Database Tables
CollectionCase, CollectionAction, PromiseToPay

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
**Wave:** 03 | **Sessions:** 5
**Definition of Done:** Domain fully implemented with CRUD APIs, DB schema, and UI pages.
**Acceptance Criteria:** All capabilities operational. Tests passing. Documentation complete.
---
