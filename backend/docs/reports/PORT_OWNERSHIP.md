# Port Ownership Table — Canonical

**Date:** 2026-07-03  
**Authority:** EOX Enterprise  

---

## Canonical Port Assignments

| Port | Owner | Application | Status | Conflict? |
|------|-------|-------------|--------|-----------|
| **3000** | Frontend | Next.js 16 (bun run dev) | ✅ RUNNING | No |
| **3001** | Backend | NestJS 10 API | ❌ WRONG PROCESS | **YES — Odoo MCP occupies this** |
| **5433** | Database | PostgreSQL 16 (native) | ✅ RUNNING | No |
| **5434** | Database | PostgreSQL 16 (Docker) | ✅ RUNNING | **Duplicate — same data** |
| **6262** | Control Center | Next.js (or NestJS admin) | ❌ WRONG PROCESS | **YES — Legacy Express occupies this** |
| **6380** | Cache | Redis (native) | ✅ RUNNING | No |
| **9000** | Infra | Portainer (Docker UI) | ✅ RUNNING | No |

## Ports to Eliminate

| Port | App | Action | Reason |
|------|-----|--------|--------|
| 5434 | Docker PostgreSQL | Stop container | Native PG16 on 5433 is canonical |
| 3001 (Odoo) | Odoo MCP | Stop process | AI tool, not system service |

## Ownership Rules

1. Port 3000 → Frontend only
2. Port 3001 → NestJS Backend only
3. Port 5433 → PostgreSQL primary
4. Port 6262 → Enterprise Control Center
5. Port 6380 → Redis
6. No external process may occupy these ports
7. MCP servers run on ephemeral ports only
