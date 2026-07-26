# BTU Domain

**File:** `03_UTILITY_ENERGY/btu/DOMAIN.md`
**Domain ID:** MV-DOM-025
**Priority:** P1 | **Status:** Draft

---

## Business Purpose
Manage British Thermal Unit (BTU) metering for district cooling and heating systems.

## Business Owner
Utility Director

## Enterprise Scope
BTU metering for centralized HVAC systems in district cooling/heating networks.

## Capabilities
| Consumption | BTU consumption tracking |
| Efficiency | System efficiency monitoring |

## Lifecycle States
ACTIVE → ARCHIVED → RETIRED

## Actors
| **Admin** | System administrator |
| **Operator** | Daily operator |
| **Viewer** | Read-only access |

## Permissions
admin.*, operator.*, viewer.*

## Dependencies
Meter (MV-DOM-001), Reading (MV-DOM-002)

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
**Wave:** 05 | **Sessions:** 2
**Definition of Done:** Domain fully implemented with CRUD APIs, DB schema, and UI pages.
**Acceptance Criteria:** All capabilities operational. Tests passing. Documentation complete.
---
