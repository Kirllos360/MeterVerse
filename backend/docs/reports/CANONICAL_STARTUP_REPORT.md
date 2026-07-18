# Canonical Startup Report — Meter Verse

**Date:** 2026-07-03  
**Version:** 2.0 (replaces all previous startup methods)  

---

## Single Canonical Startup Procedure

```bash
# ────────────────────────────────────────────────────
# METER VERSE — CANONICAL STARTUP (only supported method)
# ────────────────────────────────────────────────────

## Prerequisites (auto-verified)
# - PostgreSQL running on port 5433 ✓
# - Redis running on port 6380 ✓
# - Node.js v24+ installed ✓
# - npm/bun available ✓

## Step 1: Start Backend (NestJS, port 3001)
cd D:\meter\Meter\backend
npm run start:dev
# Verify: curl http://localhost:3001/api/v1/health → {"status":"ok"}

## Step 2: Start Frontend (Next.js, port 3000)
cd D:\meter\Meter\Frontend
bun run dev
# Verify: http://localhost:3000 loads

## Step 3: Access Control Center
# http://localhost:3000/control-center/
```

## Startup Dependency Order

```
        PostgreSQL (5433)
              │
          Redis (6380)
              │
        ┌─────┴─────┐
        │           │
   NestJS (3001)    │
        │           │
   Next.js (3000)   │
        │           │
   ┌────┴────┐      │
   │         │      │
  Main UI   CC      │
  (3000)   /cc      │
        │           │
        └────┬──────┘
             │
      Backend Healthy
```

## Runtime Validation Matrix (pre-startup)

| Check | Command | Pass Condition | Fail Action |
|-------|---------|---------------|-------------|
| PostgreSQL | `netstat -ano \| findstr ":5433"` | LISTENING | STOP — start PostgreSQL service |
| Redis | `netstat -ano \| findstr ":6380"` | LISTENING | STOP — start Redis service |
| Port 3001 free | `netstat -ano \| findstr ":3001"` | No process OR NestJS PID | STOP — kill conflicting process |
| Port 3000 free | `netstat -ano \| findstr ":3000"` | No process OR Next.js PID | STOP — kill conflicting process |
| Node.js | `node --version` | v24+ | STOP — install Node.js |
| Backend build | `Test-Path dist/src/main.js` | File exists | RUN `npm run build` |

## Deprecated Startup Methods (DO NOT USE)

| Script | Reason |
|--------|--------|
| `start-all.bat` | Legacy — starts deprecated admin-portal on port 6262 |
| `run-backend.bat` | Legacy — embedded admin credentials |
| `run-frontend.bat` | Legacy — duplicated by bun run dev |
| `admin-portal/start.bat` | Legacy — starts Express admin |
| `admin-console/start.bat` | Legacy — unused |
| `docker-compose up` | Infra only — DB/Redis (if not native) |
