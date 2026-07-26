# Energy Domain

**File:** `03_UTILITY_ENERGY/energy/DOMAIN.md`
**Domain ID:** MV-DOM-021
**Priority:** P0 | **Status:** Draft

---

## Business Purpose
Manage electric energy metering including consumption, demand, power quality, and net metering.

## Business Owner
Utility Director

## Enterprise Scope
Electric metering for residential, commercial, and industrial customers with support for net metering and solar.

## Capabilities
| Consumption | kWh consumption tracking |
| Demand | Peak demand monitoring |
| Quality | Power quality monitoring |
| NetMetering | Bi-directional energy flow |

## Lifecycle States
ACTIVE → ARCHIVED → RETIRED

## Actors
| **Admin** | System administrator |
| **Operator** | Daily operator |
| **Viewer** | Read-only access |

## Permissions
admin.*, operator.*, viewer.*

## Dependencies
Meter (MV-DOM-001), Reading (MV-DOM-002), Tariff (MV-DOM-012), Solar (MV-DOM-024)

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

## Implementation Priority: P0
**Wave:** 01 | **Sessions:** 3
**Definition of Done:** Domain fully implemented with CRUD APIs, DB schema, and UI pages.
**Acceptance Criteria:** All capabilities operational. Tests passing. Documentation complete.
---
