# H0-I: Rollback Certification
**Phase**: H0-I  
**Date**: 2026-06-17 09:54:52  
**Certification Level**: PRODUCTION CUTOVER READINESS  
**Stop Rule**: Critical/High > 0 or Data Loss > 0 or Variance > 0 → HALT

---

## 1. Asset Inventory for Rollback

### Legacy Assets (Always Available)
| Asset | Location | Size |
|---|---|---|
| XLSX Files | D:\meter\ | 1,921 files |
| Flask Collection | reference/collection-system/ | Full billing system |
| SBill Reference | reference/sbill/ | Legacy billing reference |

### New Assets (Meter Verse)
| Asset | Location | Rollback Strategy |
|---|---|---|
| PostgreSQL DB | localhost:5432 | pg_dump before cutover, pg_restore to revert |
| Docker Containers | docker-compose | docker compose down, restore from backup |
| Frontend (Next.js) | Frontend/ | git checkout previous, bun run build |
| Backend (NestJS) | backend/ | git checkout previous, npm run build |
| Playwright MCP | tools/ | docker compose down |

## 2. Rollback Procedures

### Rollback: Database
```bash
pg_restore -h localhost -p 5432 -U meter_pulse -d meter_pulse backup_before_cutover.dump
```

### Rollback: Application
```bash
git checkout <pre-cutover-tag>
npm run build && npm run start:prod
```

### Rollback: Full System
```bash
docker compose -f docker-compose.yml down
docker compose -f docker-compose.previous.yml up -d
```

## 3. Rollback Readiness
| Component | Backup Available | Restore Procedure | Status |
|---|---|---|---|
| Database | ❌ No backup taken | pg_restore | ⚠️ Procedure documented but no backup |
| Legacy Files | ✅ Original preserved | File copy | ✅ No data loss risk |
| Application Code | ✅ Git history | git checkout | ✅ 54+ commits available |
| Docker State | ❌ No snapshot | docker compose | ⚠️ No pre-cutover compose snapshot |
| Configuration | ✅ .env files | File restore | ✅ Backend .env documented |

