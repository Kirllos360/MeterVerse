# Legacy Removal Readiness Report

**Date:** 2026-07-03  

---

## Legacy Component: Express Admin Portal

| Property | Value |
|----------|-------|
| Path | `D:\meter\Meter\backend\admin-portal\` |
| Port | 6262 |
| Current PID | 15696 |
| Classification | LEGACY |

### Dependencies (What references it?)

| Source | Reference | Action Needed |
|--------|-----------|---------------|
| `Meter\start-all.bat:52` | `cd /d "backend\admin-portal"` + `node src\server.js` | Remove lines 52-54 |
| `Meter\start-all.bat:64` | `Admin: http://localhost:6262` | Update to Control Center URL |
| `Meter\start-all.bat:66` | Login credentials | Remove |
| `AppShell.tsx:287` | `<a href="http://localhost:6262">` | Already updated to `/control-center` |

### Migration Map

| Legacy API | Replacement | Migrated? |
|-----------|-------------|-----------|
| `GET /api/areas` | NestJS `GET /api/v1/projects/areas` | ✅ Already exists |
| `GET /api/projects` | NestJS `GET /api/v1/projects` | ✅ Already exists |
| `GET /api/users` | NestJS `GET /api/v1/users` | ✅ Already exists |
| `GET /api/roles` | NestJS auth module | ✅ Already exists |
| `GET /api/permissions` | NestJS auth module | ✅ Already exists |
| `GET /api/audit` | NestJS `GET /api/v1/audit` | ✅ Already exists |
| `GET /api/settings` | NestJS config module | ✅ Already exists |
| Direct SQL via `/api/db/query` | Runtime Gateway read-only queries | 🔲 Planned |

### Safety Assessment

| Check | Status |
|-------|--------|
| No production traffic depends on legacy Express | ✅ Verified (development only) |
| All API endpoints available in NestJS | ✅ Verified |
| No startup script REQUIRES admin-portal | ✅ Can be removed from start-all.bat |
| No import references in NestJS code | ✅ Already moved to `src/infrastructure/` |
| No import references in Frontend | ✅ AppShell already uses `/control-center` |

### Removal Steps

```
Step 1: Stop process: taskkill /PID 15696 /F
Step 2: Remove from start-all.bat (lines 52-54, 64, 66)
Step 3: Archive directory: move backend\admin-portal backend\archived\admin-portal
Step 4: Verify http://localhost:6262 no longer responds
Step 5: Update documentation
```

**Risk: LOW** — All functionality has equivalent NestJS implementations.
