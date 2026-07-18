# Blockers — Preventing Complete Understanding

**Date:** 2026-07-03  

---

## Active Blockers

| # | Blocker | Severity | Impact | Resolution |
|---|---------|----------|--------|------------|
| B-01 | **NestJS Backend is NOT running** | CRITICAL | Runtime Dashboard API (port 3001) unavailable. Control Center pages show no data. | Run `cd backend && npm run build && npm run start:dev` or ensure `dist/src/main.js` exists and starts |
| B-02 | **Port 3001 occupied by wrong process** | CRITICAL | Odoo MCP occupies the port that should serve the NestJS backend | Stop the Odoo MCP process (PID 19084) or reconfigure port mapping |
| B-03 | **Dual PostgreSQL instances** | HIGH | Two PG16 instances (native 5433, Docker 5434). Unclear which is authoritative | Verify .env DATABASE_URL and ensure only one instance is primary |
| B-04 | **Docker Compose Redis not running** | MEDIUM | Redis Docker container (port 6379) is not started; native Redis on 6380 used instead | Ensure Redis configuration matches between Docker and native |
| B-05 | **Legacy Express app on Port 6262** | MEDIUM | Masks the absence of the real Control Center | Stop admin-portal process and serve Next.js on 6262 (or proxy) |

## Environmental Constraints

| # | Constraint | Impact |
|---|-----------|--------|
| EC-01 | Windows 11 Pro host — not Linux production target | Some scripts/commands may differ in production |
| EC-02 | Node v24.15.0 — may not match production runtime | Production may use older LTS version |
| EC-03 | npm 11.12.1 — bun also available for frontend | Two package managers may cause lockfile confusion |

---

*Blockers documented — 2026-07-03*
