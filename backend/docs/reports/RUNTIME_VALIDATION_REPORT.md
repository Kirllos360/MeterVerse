# Runtime Validation Report

**Date:** 2026-07-03  

---

## Required Health Checks

| Check | Command | Success | Failure | Recovery |
|-------|---------|---------|---------|----------|
| PostgreSQL | `curl -s http://localhost:3001/api/v1/health` | Status ok | 5s timeout → retry | Restart PostgreSQL service |
| Redis | `redis-cli -p 6380 ping` | PONG | Connection refused | Start Redis service (redisratelimit) |
| NestJS | `curl -s http://localhost:3001/api/v1/health` | `{"status":"ok"}` | Connection refused | `npm run start:dev` |
| Dashboard API | `curl -s http://localhost:3001/api/v1/dashboard/overview` | JSON with health | Connection refused | Ensure backend running |
| Gateway | `curl -s http://localhost:3001/api/v1/gateway/health` | JSON | Not found | Ensure RuntimeGateway started |
| Frontend | `curl -s http://localhost:3000` | HTML | Connection refused | `bun run dev` |
| Control Center | `curl -s http://localhost:3000/control-center` | HTML with dashboard | 404 | Ensure routes exist |
| Event Bus | Dashboard API returns events data | eventsPerSecond >= 0 | Error | Restart RuntimeEventBus |
| Graph Engine | Dashboard API returns diagnostics | graph.nodes >= 0 | Error | Restart GraphEngine |
| Docker | `docker ps` | Containers listed | Cannot connect | Start Docker Desktop |

## Port Validation

| Port | Expected Owner | Validation |
|------|---------------|------------|
| 3000 | Next.js Frontend | `netstat -ano \| findstr ":3000"` → PID should be node.exe from Frontend |
| 3001 | NestJS Backend | `netstat -ano \| findstr ":3001"` → PID should be node.exe from dist/src/main.js |
| 5433 | PostgreSQL native | `netstat -ano \| findstr ":5433"` → PID should be postgres.exe |
| 6380 | Redis native | `netstat -ano \| findstr ":6380"` → PID should be redis-server.exe |
| 6262 | (should be free) | `netstat -ano \| findstr ":6262"` → NO process should listen (legacy removed) |

## Runtime API Endpoints

| Endpoint | Expected | Purpose |
|----------|----------|---------|
| `GET /api/v1/health` | `{"status":"ok"}` | Core health |
| `GET /api/v1/observability/health` | Component list | Component health |
| `GET /api/v1/dashboard/overview` | JSON stats | Dashboard data |
| `GET /api/v1/dashboard/status` | Component status | Runtime status |
| `GET /api/v1/dashboard/services` | Service list | Services |
| `GET /api/v1/dashboard/workspaces` | Workspace list | Workspaces |
| `GET /api/v1/dashboard/events` | Event data | Event Bus |
| `GET /api/v1/dashboard/intelligence` | Intelligence data | Intelligence |
| `GET /api/v1/dashboard/graph/:type` | Graph data | Graph Engine |
| `GET /api/v1/dashboard/security` | Security data | Security |
| `GET /api/v1/dashboard/navigation` | Navigation tree | Navigation |
| `GET /api/v1/gateway/health` | Gateway status | Gateway |
