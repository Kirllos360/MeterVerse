# SCADA Domain

**File:** `07_INTEGRATION/scada/DOMAIN.md`
**Domain ID:** MV-DOM-044
**Priority:** P2 | **Status:** Draft

---

## Business Purpose
Integrate with Supervisory Control and Data Acquisition systems for real-time monitoring.

## Business Owner
Integration Director

## Enterprise Scope
Real-time meter data acquisition from SCADA systems via OPC/Modbus protocols.

## Capabilities
| Dashboard | Overview and monitoring |
| Management | CRUD operations |
| Configuration | Settings and parameters |

## Lifecycle States
ACTIVE → ARCHIVED → RETIRED

## Actors
| **Admin** | System administrator |
| **Operator** | Daily operator |
| **Viewer** | Read-only access |

## Permissions
admin.*, operator.*, viewer.*

## Dependencies
Integration (MV-DOM-040), Reading (MV-DOM-002)

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

## Implementation Priority: P2
**Wave:** 06 | **Sessions:** 6
**Definition of Done:** Domain fully implemented with CRUD APIs, DB schema, and UI pages.
**Acceptance Criteria:** All capabilities operational. Tests passing. Documentation complete.
---
