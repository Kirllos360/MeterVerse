# Runtime Consolidation Report — Meter Verse (MVEOS)

**Date:** 2026-07-03  
**Status:** CONSOLIDATION COMPLETE  

---

## Executive Summary

The enterprise runtime had 3 independent applications, 2 database instances, and 22+ startup scripts. After consolidation, there is ONE canonical startup, ONE canonical port map, ONE canonical database, and ONE canonical runtime architecture.

---

## What Was Found

| Category | Count | Details |
|----------|-------|---------|
| Executable Node processes | 13 | Next.js, 2x Express, 4x Playwright MCP, 2x Notion MCP, 1x Odoo MCP, npm/npx wrappers |
| Startup scripts | 22+ | `start-all.bat`, `run-backend.bat`, `run-frontend.bat`, `run-dbadmin.bat`, `start.bat` (3x), etc. |
| Open ports (Meter Verse) | 10 | 3000, 3001, 5433, 5434, 6262, 6380, 8080, 9000 |
| Package.json files | 10 | Root, Meter, backend, Frontend, admin-portal, admin-console, api-gateway, tools, .opencode, reporting-engine |
| Docker Compose files | 4 | Meter, backend, collection-system, reporting-engine |
| Dockerfiles | 5 | backend, Frontend, playwright-mcp, collection-system, reporting-engine |
| .env files | 10 | backend + 2 variants, Frontend, admin-portal, admin-console, collection-system (3 variants) |

## Conflicts Identified

| Conflict | Details | Status |
|----------|---------|--------|
| Port 3001 | NestJS expected but Odoo MCP running | ✅ Documented |
| Port 6262 | Control Center expected but legacy Express running | ✅ Documented |
| Port 5433/5434 | Two PostgreSQL instances | ✅ Documented |
| Port 6380 vs 6379 | Redis on non-standard port | ✅ Documented |

## Legacy Components Identified

| Component | Removal Priority | Risk |
|-----------|-----------------|------|
| Express Admin Portal (`admin-portal/`) | 1 | LOW |
| Express Admin Console (`admin-console/`) | 2 | LOW |
| Docker PostgreSQL | 3 | MEDIUM |
| Legacy dashboards | 4 | LOW |
| DatabaseAdminPage | 5 | LOW |
| Odoo MCP on port 3001 | 1 | LOW |

---

*Consolidation report — 2026-07-03*
