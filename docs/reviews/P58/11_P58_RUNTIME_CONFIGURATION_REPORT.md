# P58 — RUNTIME CONFIGURATION REPORT
**Date:** 2026-08-12 · **All independently verified (not trusted from docs)**

## SERVICE RUNTIME MATRIX (live)
| Service | Port | PID | Process | Env | Profile | DB | Health |
|---------|------|-----|---------|-----|---------|----|--------|
| Admin Backend | 3131 | 2872 | node src/server.js | NODE_ENV=development, PORT=3131 | admin | connected | ready · diagnostics 24/24 |
| Portal Backend | 3003 | 7856 | node src/server.js | PORT=3003, PORTAL_MODE=1 | portal | connected | ready |
| Admin Frontend | 3535 | 7176 | next dev -p 3535 | NEXT_PUBLIC_API_URL=http://localhost:3131 | admin (data-profile=admin) | — | 200 |
| Portal Frontend | 3030 | 21148 | next dev -p 3030 | PORTAL_MODE=1, NEXT_PUBLIC_API_URL=:3003 | portal (data-profile=portal) | — | 200 |
| PostgreSQL | 5433 | — | native service | — | meter_pulse | — | up |

## CONFIG FILES
| File | Key values | Verified |
|------|-----------|----------|
| backend/.env | DATABASE_URL ...@localhost:**5433**/meter_pulse · PORT=3131 · JWT_SECRET=... · CORS_ORIGIN=http://localhost:3030,http://localhost:3535 | ✅ |
| Frontend/.env.local | NEXT_PUBLIC_API_URL=http://localhost:3131 | ✅ |
| _tools/config.cmd | ADMIN_BE=3131, ADMIN_FE=3535, PORTAL_BE=3003, PORTAL_FE=3030, DB_PORT=**5433** | ✅ |
| scripts/start-all.mjs | same ports, DB 5433 | ✅ |
| docker-compose.yml | host 5433:5432, container-internal 5432 | ✅ |
| next.config.ts | distDir .next/.next-portal; rewrite /api/* → backend port | ✅ |

## PROFILE / AUTH
- Profile detection: port-based (layout.tsx host header 3030→portal else admin; page.tsx window.location.port) — **permanent, cannot conflict**
- Login: shared /login; system_type derived from request port (3030→user else admin) — **verified both profiles**
- Session restore: /api/auth/me now proxies backend — **verified (P58 fix)**
- Sign-out: /login + session revoke — **verified (refresh→401)**

## P58 FIXED (runtime)
- NEXT_PUBLIC_API_URL / NODE_ENV / JWT_SECRET / CORS_ORIGIN / PORT trailing-space in Start.cmd, MainControl.cmd, StressTest.cmd → `set X=value&&`
- /api/auth/me mock-only BFF → real proxy

## REMAINING NOTES
- Turbopack dev-cache corruption (`.next`/`.next-portal` types) — known dev fragility; clean + restart. Observed + fixed this phase.
- `X-Dev-Mode: true` header bypass in auth middleware is dev-only (NODE_ENV guard) — confirm stripped in prod.
- Production deploy (deploy-prod.sh) now uses PORT=3131 (P57 fix) — verified.
