# Root Fix Plan — Prioritized Architectural Corrections

**Date:** 2026-07-03  
**Purpose:** Eliminate every architectural problem permanently  

---

## Priority 0 — Immediate (Must Fix Now)

| # | Fix | Effort | Risk | Dependencies |
|---|-----|--------|------|-------------|
| F-01 | **Start the NestJS backend** — compile and run `dist/src/main.js` on port 3001 | 5 min | LOW | Build must succeed |
| F-02 | **Stop Odoo MCP on port 3001** — release port for NestJS | 1 min | LOW | None |
| F-03 | **Stop legacy admin-portal on port 6262** — stop PID 15696 | 1 min | LOW | Must coordinate with team |
| F-04 | **Serve Frontend on port 6262** — run `cd Frontend && PORT=6262 bun run dev` | 2 min | LOW | Frontend must compile |

## Priority 1 — Critical Architecture

| # | Fix | Effort | Wave |
|---|-----|--------|------|
| F-05 | **Consolidate PostgreSQL instances** — pick one primary (native or Docker) | 1 hr | W05 |
| F-06 | **Configure Docker Compose Redis to match native config** — ensure port 6380 consistency | 30 min | W05 |
| F-07 | **Eliminate duplicate admin applications** — deprecate `admin-portal/` and `admin-console/` | 1 day | W05 |

## Priority 2 — Runtime Integration

| # | Fix | Effort | Wave |
|---|-----|--------|------|
| F-08 | **Wire Control Center to use port 6262** — configure Frontend to default to 6262 | 30 min | W05 |
| F-09 | **Connect legacy Express routes to NestJS** — or recreate needed routes in NestJS | 3 days | W05/W06 |
| F-10 | **Add start script for full stack** — create a single command that starts everything | 1 hr | W05 |

## Priority 3 — Architecture Debt

| # | Fix | Effort | Wave |
|---|-----|--------|------|
| F-11 | **EnterpriseService adoption** — 6/106 → target 30 | 30 days | W06 |
| F-12 | **Repository pattern rollout** — 4/20+ modules → target 12 | 20 days | W06 |
| F-13 | **Domain events wiring** — publish 22 defined events | 10 days | W06 |
| F-14 | **Remove legacy admin-portal code** — archive after migration | 1 day | W06 |

---

*Fix plan — 2026-07-03*
