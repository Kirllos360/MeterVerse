# Water Domain

**File:** `03_UTILITY_ENERGY/water/DOMAIN.md`
**Domain ID:** MV-DOM-022
**Priority:** P0 | **Status:** Draft

---

## Business Purpose
Manage water metering including consumption, leak detection, flow monitoring, and quality.

## Business Owner
Utility Director

## Enterprise Scope
Water metering with special handling for difference modes, leak detection, and conservation programs.

## Capabilities
| Consumption | m³ consumption tracking |
| LeakDetection | Continuous flow monitoring |
| DifferenceMode | Report/warn/block on variance |

## Lifecycle States
ACTIVE → ARCHIVED → RETIRED

## Actors
| **Admin** | System administrator |
| **Operator** | Daily operator |
| **Viewer** | Read-only access |

## Permissions
admin.*, operator.*, viewer.*

## Dependencies
Meter (MV-DOM-001), Reading (MV-DOM-002), Leak Detection (P-020)

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
