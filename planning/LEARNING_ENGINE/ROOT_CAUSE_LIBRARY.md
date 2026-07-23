# Root Cause Library

**Purpose:** Detailed root cause analysis of every significant failure.
**Updates:** After every bug fix or rollback.

| ID | Date | Failure | Root Cause | Impact | Fix | Verification | Related Ticket |
|:--:|:----:|---------|:----------:|:------:|:---:|:------------:|:--------------:|
| RC-001 | 2026-07-23 | domain.js DELETE returns 500 instead of 404 | CRUD factory calls prisma.model.delete without pre-check. 15 entities affected. | HIGH — double-delete crashes with 500 | Add findUnique check before delete | T30 API Hardening | EXEC-0002 |
| RC-002 | 2026-07-23 | permissions.js/security.js code duplication | Both files define identical ROUTE_PERMISSION_MAP and ROLE_PERMISSIONS | MEDIUM — maintenance hazard, permissions can silently diverge | Consolidate into security.js | T31 Codebase Consolidation | EXEC-0003 |
| RC-003 | 2026-07-23 | Graphiti graph built from wrong path | graphify run from D:\meter\Meter-\ instead of D:\meter | MEDIUM — stale graph, unreliable D05 validation | Rebuild from correct path | T34 Graphiti Rebuild | EXEC-0004 |
