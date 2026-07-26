# Project Domain

**File:** `01_CORE_DOMAINS/project/DOMAIN.md`
**Domain ID:** MV-DOM-006
**Priority:** P1 | **Status:** Draft

---

## Business Purpose
Manage organizational projects (developments, districts, compounds) that group zones and units for operational management.

## Business Owner
Operations Director

## Enterprise Scope
Project creation, status tracking, organization assignment, and zone grouping.

## Capabilities
| Creation | Create projects within organizations |
| Organization | Assign to organization |
| Status | Active/inactive lifecycle |

## Lifecycle States
PLANNING → ACTIVE → COMPLETED → ARCHIVED

## Actors
| **Admin** | System administrator |
| **Operator** | Daily operator |
| **Viewer** | Read-only access |

## Permissions
admin.*, operator.*, viewer.*

## Dependencies
None

## API Endpoints
CRUD via /api/projects, /api/admin/projects

## Database Tables
Project, Organization

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
