# Charge Domain

**File:** `02_BILLING_FINANCE/charge/DOMAIN.md`
**Domain ID:** MV-DOM-018
**Priority:** P0 | **Status:** Draft

---

## Business Purpose
Manage charge rules for fixed and variable fees applied during billing.

## Business Owner
Billing Director

## Enterprise Scope
Charge rule definition with formulas, priorities, effective dates, and customer overrides.

## Capabilities
| RuleDefinition | Define charge rules with formulas |
| Prioritization | Order-of-operations for multiple charges |
| Overrides | Customer-specific charge overrides |

## Lifecycle States
ACTIVE → ARCHIVED → RETIRED

## Actors
| **Admin** | System administrator |
| **Operator** | Daily operator |
| **Viewer** | Read-only access |

## Permissions
admin.*, operator.*, viewer.*

## Dependencies
Billing (MV-DOM-009), Customer (MV-DOM-003), Contract (MV-DOM-004)

## API Endpoints
CRUD via /api/domain/charge-rules, /api/domain/charge-overrides

## Database Tables
ChargeRule, ChargeOverride

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
**Wave:** 03 | **Sessions:** 3
**Definition of Done:** Domain fully implemented with CRUD APIs, DB schema, and UI pages.
**Acceptance Criteria:** All capabilities operational. Tests passing. Documentation complete.
---
