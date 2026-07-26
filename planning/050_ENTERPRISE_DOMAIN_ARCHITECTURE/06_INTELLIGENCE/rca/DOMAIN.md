# RCA Domain

**File:** `06_INTELLIGENCE/rca/DOMAIN.md`
**Domain ID:** MV-DOM-039
**Priority:** P1 | **Status:** Draft

---

## Business Purpose
Manage root cause analysis for meter anomalies using AI-powered investigation.

## Business Owner
AI Platform Director

## Enterprise Scope
RCA case lifecycle from creation through evidence collection, AI analysis, human review, and resolution learning.

## Capabilities
| CaseCreation | Create RCA cases from meter issues |
| Evidence | Auto-collect meter evidence |
| Analysis | AI-powered 5-whys analysis |
| Learning | Resolution pattern learning |

## Lifecycle States
NEW → INVESTIGATING → AI_ANALYSIS_READY → HUMAN_REVIEW → APPROVED → RESOLVED → LEARNED

## Actors
| **Admin** | System administrator |
| **Operator** | Daily operator |
| **Viewer** | Read-only access |

## Permissions
admin.*, operator.*, viewer.*

## Dependencies
Meter (MV-DOM-001), Reading (MV-DOM-002), AI (MV-DOM-037), Knowledge (MV-DOM-038)

## API Endpoints
Full lifecycle: POST /api/rca/cases, POST /api/rca/cases/:id/auto-analyze, GET /api/rca/patterns/similar

## Database Tables
RCACaseEngine (in-memory Map), ResolutionLearner (file-based JSON)

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
**Wave:** 04 | **Sessions:** 6
**Definition of Done:** Domain fully implemented with CRUD APIs, DB schema, and UI pages.
**Acceptance Criteria:** All capabilities operational. Tests passing. Documentation complete.
---
