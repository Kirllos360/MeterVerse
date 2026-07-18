# Legacy Removal Plan — Meter Verse

**Date:** 2026-07-03  

---

## Legacy Components

| # | Component | Reason | Replacement | Migration | Risk | Removal Order |
|---|-----------|--------|-------------|-----------|------|---------------|
| L-01 | Express Admin Portal (`backend/admin-portal/`) | Port 6262 conflict | Enterprise Control Center (Next.js) | Stop process, archive folder | LOW | 1 |
| L-02 | Express Admin Console (`backend/admin-console/`) | Port 4002, unused | N/A — functionality absorbed by NestJS | Archive folder | LOW | 2 |
| L-03 | Docker PostgreSQL instance | Duplicate of native PG16 | Use native PG16 only | Stop container `meter-verse-db` | MEDIUM | 3 |
| L-04 | DatabaseAdminPage (`Frontend/src/components/admin/`) | Direct DB access | Removed — not part of Control Center | Delete file | LOW | 4 |
| L-05 | 6 legacy dashboards under `Frontend/src/components/dashboard/` | Pre-runtime, direct API calls | Control Center runtime dashboards | Archive or delete | LOW | 5 |
| L-06 | Odoo MCP on port 3001 | AI tool, occupies backend port | Run on different port or stop | Stop process | LOW | 1 |

## Removal Order

```
Phase 1 (Immediate):
  1. Stop legacy admin-portal (PID 15696) — frees port 6262
  2. Stop Odoo MCP (PID 19084) — frees port 3001

Phase 2 (After verification):
  3. Archive admin-portal/ directory
  4. Archive admin-console/ directory

Phase 3 (After Control Center verification):
  5. Archive legacy dashboard components
  6. Remove DatabaseAdminPage

Phase 4 (After DB consolidation):
  7. Stop Docker PostgreSQL container
  8. Verify native PG16 works correctly
```

## Deprecation Notices

All legacy components MUST be archived, not deleted — in case rollback is needed. Archive to `D:\meter\archived\` with timestamp.
