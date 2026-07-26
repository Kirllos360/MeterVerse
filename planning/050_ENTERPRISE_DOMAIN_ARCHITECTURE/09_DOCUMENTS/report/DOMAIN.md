# Report Domain

**File:** `09_DOCUMENTS/report/DOMAIN.md`
**Domain ID:** MV-DOM-062
**Priority:** P0 | **Status:** Draft

---

## Business Purpose
Manage report generation, scheduling, distribution, and template management.

## Business Owner
Reporting Director

## Enterprise Scope
Report definition, generation via JasperReports/Playwright, scheduling, and multi-format export.

## Capabilities
| Generation | Report generation (PDF, Excel, CSV) |
| Scheduling | Automated report delivery |
| Templates | Report template management |
| Export | Multi-format export support |

## Lifecycle States
ACTIVE → ARCHIVED → RETIRED

## Actors
| **Admin** | System administrator |
| **Operator** | Daily operator |
| **Viewer** | Read-only access |

## Permissions
admin.*, operator.*, viewer.*

## Dependencies
All domains (data sources), Document (MV-DOM-059)

## API Endpoints
POST /api/reports/export, POST /api/reports/jasper/generate, GET /api/reports/types

## Database Tables
ReportDefinition, ScheduledReport, ExportJob, ExportLog

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
