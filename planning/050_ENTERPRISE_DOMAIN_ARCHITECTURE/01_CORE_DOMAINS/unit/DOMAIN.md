# Unit Domain

**File:** `01_CORE_DOMAINS/unit/DOMAIN.md`
**Domain ID:** MV-DOM-005
**Priority:** P1 | **Status:** Draft

---

## Business Purpose
Manage individual units (apartments, offices, lots) within zones, including type classification, customer assignment, and status tracking.

## Business Owner
Operations Director

## Enterprise Scope
Unit registration, type classification (residential/commercial/industrial), customer assignment, and status lifecycle across all zones and projects.

## Capabilities
| Registration | Register units with type, area, and zone assignment |
| Classification | Categorize by type (residential/commercial/industrial) |
| Assignment | Link to customer |
| StatusTracking | Active/vacant/maintenance lifecycle |

## Lifecycle States
VACANT → OCCUPIED → MAINTENANCE → VACANT

## Actors
| **Admin** | System administrator |
| **Operator** | Daily operator |
| **Viewer** | Read-only access |

## Permissions
admin.*, operator.*, viewer.*

## Dependencies
None

## API Endpoints
CRUD via /api/locations/units

## Database Tables
Unit, Zone

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
**Wave:** 01 | **Sessions:** 2
**Definition of Done:** Domain fully implemented with CRUD APIs, DB schema, and UI pages.
**Acceptance Criteria:** All capabilities operational. Tests passing. Documentation complete.
---
