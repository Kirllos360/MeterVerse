# SIM Domain

**File:** `04_COMMUNICATION/sim/DOMAIN.md`
**Domain ID:** MV-DOM-026
**Priority:** P0 | **Status:** Draft

---

## Business Purpose
Manage SIM card lifecycle including inventory, assignment to meters, carrier management, and status tracking.

## Business Owner
Communication Manager

## Enterprise Scope
SIM card inventory, assignment lifecycle, carrier relationships, and APN configuration.

## Capabilities
| Inventory | SIM card stock management |
| Assignment | Assign/release from meters |
| Carrier | Multi-carrier support |
| Status | Active/faulty/retired tracking |

## Lifecycle States
AVAILABLE → ASSIGNED → ACTIVE → FAULTY → RETIRED

## Actors
| **Admin** | System administrator |
| **Operator** | Daily operator |
| **Viewer** | Read-only access |

## Permissions
admin.*, operator.*, viewer.*

## Dependencies
Meter (MV-DOM-001)

## API Endpoints
CRUD via /api/sim + POST /api/sim/:id/assign, POST /api/sim/:id/release, GET /api/sim/:id/eligibility

## Database Tables
SIMCard, SIMAssignment

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
**Wave:** 02 | **Sessions:** 3
**Definition of Done:** Domain fully implemented with CRUD APIs, DB schema, and UI pages.
**Acceptance Criteria:** All capabilities operational. Tests passing. Documentation complete.
---
