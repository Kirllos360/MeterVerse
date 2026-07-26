# Tariff Domain

**File:** `02_BILLING_FINANCE/tariff/DOMAIN.md`
**Domain ID:** MV-DOM-012
**Priority:** P0 | **Status:** Draft

---

## Business Purpose
Manage rate structures including flat rates, tiered pricing, time-of-use, and demand charges for all utility types.

## Business Owner
Billing Director

## Enterprise Scope
Tariff definition with rates, tiers, time-of-use schedules, and effective date management.

## Capabilities
| FlatRate | Single rate per unit |
| Tiered | Volume-based pricing tiers |
| TimeOfUse | Peak/off-peak scheduling |
| Demand | Demand-based charges |

## Lifecycle States
DRAFT → ACTIVE → INACTIVE → ARCHIVED

## Actors
| **Admin** | System administrator |
| **Operator** | Daily operator |
| **Viewer** | Read-only access |

## Permissions
admin.*, operator.*, viewer.*

## Dependencies
Meter Type (MV-DOM-001), Billing (MV-DOM-009)

## API Endpoints
CRUD via /api/tariffs + POST /api/tariffs/calculate

## Database Tables
Tariff, TariffRate, TariffTier

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
**Wave:** 03 | **Sessions:** 6
**Definition of Done:** Domain fully implemented with CRUD APIs, DB schema, and UI pages.
**Acceptance Criteria:** All capabilities operational. Tests passing. Documentation complete.
---
