# Runtime Ownership Report — Meter Verse (MVEOS)

**Date:** 2026-07-03  
**Status:** CANONICAL  

---

## Runtime Ownership Matrix

| # | Component | Type | Port | PID | Status | Classification | Owner |
|---|-----------|------|------|-----|--------|---------------|-------|
| 1 | PostgreSQL 16 (native) | Database | 5433 | 6624 | ✅ Running | **CANONICAL** | System |
| 2 | PostgreSQL 16 (Docker) | Database | 5434 | 7120 | ✅ Running | **DUPLICATE** | Remove |
| 3 | Redis (native) | Cache | 6380 | 4920 | ✅ Running | **CANONICAL** | System |
| 4 | Next.js Frontend | Web UI | 3000 | 18532 | ✅ Running | **CANONICAL** | Frontend |
| 5 | NestJS Backend | API | 3001 | — | ❌ Not running | **CANONICAL** | Backend |
| 6 | Legacy Express Admin | Web UI | 6262 | 15696 | ✅ Running | **LEGACY** | Remove |
| 7 | Portainer (Docker) | Infra UI | 9000 | — | ✅ Running | **EXPERIMENTAL** | Dev |
| 8 | Odoo MCP | AI Tool | 3001 | 19084 | ✅ Running | **DEPRECATED** | Dev |

## Runtime Dependency Graph

```
User Browser
  ├── Port 3000 ──→ Next.js Frontend ──→ Port 3001 ──→ NestJS Backend
  │                                                    ├── Port 5433 ──→ PostgreSQL
  │                                                    └── Port 6380 ──→ Redis
  └── Port 6262 ──→ Legacy Express (TO BE REMOVED)
```

## Runtime Startup Graph

```
1. PostgreSQL (native, port 5433) — WINDOWS SERVICE — auto-starts
2. Redis (native, port 6380) — WINDOWS SERVICE — auto-starts
3. NestJS Backend (port 3001) — MANUAL via npm run start:dev
4. Next.js Frontend (port 3000) — MANUAL via bun run dev
5. (Optional) Control Center — served by Frontend at /control-center
```

## Classification Definitions

| Classification | Meaning |
|---------------|---------|
| CANONICAL | Official, supported, maintained — MUST be running |
| LEGACY | Previous version — has replacement, scheduled for removal |
| DEPRECATED | No longer supported — may be removed without notice |
| DUPLICATE | Same function as another instance — one must be removed |
| EXPERIMENTAL | Testing/development use only — not for production |
