# Solar Domain

**File:** `03_UTILITY_ENERGY/solar/DOMAIN.md`
**Domain ID:** MV-DOM-024
**Priority:** P1 | **Status:** Draft

---

## Business Purpose
Manage solar generation metering including production tracking, net metering, and feed-in tariff application.

## Business Owner
Renewable Energy Director

## Enterprise Scope
Solar PV generation metering with bi-directional energy tracking and feed-in tariff calculation.

## Capabilities
| GenerationTracking | kWh production monitoring |
| NetMetering | Import/export tracking |
| FeedInTariff | FIT calculation and crediting |
| Wallet | Solar credit wallet |

## Lifecycle States
ACTIVE → ARCHIVED → RETIRED

## Actors
| **Admin** | System administrator |
| **Operator** | Daily operator |
| **Viewer** | Read-only access |

## Permissions
admin.*, operator.*, viewer.*

## Dependencies
Meter (MV-DOM-001), Reading (MV-DOM-002), Energy (MV-DOM-021), Wallet (MV-DOM-020)

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
**Wave:** 05 | **Sessions:** 5
**Definition of Done:** Domain fully implemented with CRUD APIs, DB schema, and UI pages.
**Acceptance Criteria:** All capabilities operational. Tests passing. Documentation complete.
---
