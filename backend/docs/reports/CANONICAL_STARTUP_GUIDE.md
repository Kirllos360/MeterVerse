# Canonical Startup Guide — Meter Verse (MVEOS)

**Version:** 1.0  
**Status:** CANONICAL — All other startup methods are deprecated  

---

## Prerequisites

| Service | Check | Expected |
|---------|-------|----------|
| Node.js | `node --version` | v24.15.0 |
| npm | `npm --version` | 11.12.1 |
| PostgreSQL | Port 5433 responding | ✅ |
| Redis | Port 6380 responding | ✅ |
| Docker | `docker ps` | Running |

## Canonical Startup Sequence

```bash
# Step 1: Database (verify already running)
netstat -ano | findstr ":5433"

# Step 2: Redis (verify already running)
netstat -ano | findstr ":6380"

# Step 3: Start NestJS Backend (port 3001)
cd D:\meter\Meter\backend
npm run build
npm run start:dev
# Verify: curl http://localhost:3001/api/v1/health

# Step 4: Start Frontend (port 3000)
cd D:\meter\Meter\Frontend
bun run dev
# Verify: http://localhost:3000

# Step 5: Start Control Center (port 6262) — Option A: Serve Frontend
cd D:\meter\Meter\Frontend
PORT=6262 bun run dev
# Verify: http://localhost:6262/control-center

# Step 5: Start Control Center (port 6262) — Option B: NestJS serves it
# Configure NestJS to serve static Frontend build on port 6262
```

## Port Verification

```bash
curl http://localhost:3000           # Should return HTML
curl http://localhost:3001/api/v1/health  # Should return {"status":"ok"}
curl http://localhost:6262/control-center  # Should render Control Center
curl http://localhost:3001/api/v1/dashboard/overview  # Should return JSON
```

## One-Command Start (Recommended)

```bash
cd D:\meter\Meter\backend && npm run start:dev
```
Then in another terminal:
```bash
cd D:\meter\Meter\Frontend && bun run dev
```

## Startup Order

```
1. PostgreSQL (native, port 5433) — WINDOWS SERVICE, auto-starts
2. Redis (native, port 6380) — WINDOWS SERVICE, auto-starts
3. NestJS Backend (port 3001) — MANUAL
4. Next.js Frontend (port 3000) — MANUAL
5. Control Center (port 6262) — MANUAL (optional, shares Frontend)
```

## Health Endpoints

| Service | Endpoint | Expected |
|---------|----------|----------|
| Backend | `GET /api/v1/health` | `{"status":"ok"}` |
| Backend | `GET /api/v1/observability/health` | Component status |
| Frontend | `GET /` | HTML page |
| Control Center | `GET /control-center` | Dashboard page |
| Dashboard API | `GET /api/v1/dashboard/overview` | JSON health data |

---

*Canonical startup — 2026-07-03*
