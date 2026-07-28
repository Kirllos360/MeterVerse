# Independent Verification Package — Runtime Certification

**Date:** 2026-07-03  
**Verifier:** Independent Verification Engineer (to be filled)  

---

## Verification Steps

### Step 1: Verify Port Ownership

```bash
netstat -ano | findstr ":3000"
netstat -ano | findstr ":3001"
netstat -ano | findstr ":5433"
netstat -ano | findstr ":6380"
netstat -ano | findstr ":6262"   # Should be FREE
```

Expected:
- Port 3000 → node.exe (Next.js Frontend)
- Port 3001 → node.exe (NestJS Backend)
- Port 5433 → postgres.exe
- Port 6380 → redis-server.exe
- Port 6262 → NOT LISTENING

### Step 2: Verify Processes

```bash
Get-Process node   # Should show: Next.js, NestJS. Should NOT show: admin-portal
Get-Service postgresql, redisratelimit  # Both Running
docker ps   # Should only show portainer (meter-verse-db stopped)
```

### Step 3: Verify API Health

```bash
curl http://localhost:3001/api/v1/health
# Expected: {"status":"ok"}
```

### Step 4: Verify Dashboard API

```bash
curl http://localhost:3001/api/v1/dashboard/overview
# Expected: JSON with systemHealth, platform, uptime
```

### Step 5: Verify Control Center

```bash
curl http://localhost:3000/control-center/
# Expected: HTML page with dashboard content
```

### Step 6: Verify No Legacy Endpoints

```bash
curl http://localhost:6262  # Should FAIL (connection refused)
```

### Step 7: Verify Startup Script

Verify `start-all.bat` no longer references `admin-portal`.

### Step 8: Verify Backend Tests

```bash
cd backend && npm test
# Expected: All tests pass (or known pre-existing failures only)
```

## Verification Results

| Step | Check | Result | Verifier Notes |
|------|-------|--------|----------------|
| 1 | Port ownership | ⬜ | |
| 2 | Processes | ⬜ | |
| 3 | API health | ⬜ | |
| 4 | Dashboard API | ⬜ | |
| 5 | Control Center | ⬜ | |
| 6 | No legacy | ⬜ | |
| 7 | Startup script | ⬜ | |
| 8 | Backend tests | ⬜ | |

---

*IV Package — 2026-07-03*
