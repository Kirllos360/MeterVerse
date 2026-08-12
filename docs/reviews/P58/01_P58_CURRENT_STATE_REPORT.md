# P58 — CURRENT STATE REPORT
**Status:** POST-P57 revalidation · Date: 2026-08-12

## ACTUAL CURRENT ARCHITECTURE (independently verified)

| Service | Port | PID | Profile | Env | DB | Health |
|---------|------|-----|---------|-----|----|--------|
| Admin Backend | 3131 | 2872 | admin | NODE_ENV=development | connected | ready 24/24 |
| Portal Backend | 3003 | 7856 | portal (PORTAL_MODE=1) | development | connected | ready |
| Admin Frontend | 3535 | 7176 | admin (data-profile=admin) | NEXT_PUBLIC_API_URL=:3131 | — | 200 |
| Portal Frontend | 3030 | 21148 | portal (data-profile=portal) | PORTAL_MODE=1, URL=:3003 | — | 200 |
| PostgreSQL | 5433 | — | — | DATABASE_URL in .env | meter_pulse | up |

**CORS:** `http://localhost:3030,http://localhost:3535` (verified Access-Control-Allow-Origin matches)
**DB data:** 5 users · 4 roles · 204 perms · 3 areas · 4 projects · 96 customers · 132 meters · 76 invoices · 33 payments · 234 readings

## REPOSITORY
- Branch `main`, clean tree, HEAD `50398fb5`, in sync with origin/main
- 18,934 tracked files · 187 Prisma models · 63 route files · 43 services · 6 middleware · 97 admin page dirs · 4 packages · 4 apps

## PROFILE SEPARATION (verified live)
- Admin :3535 → `data-profile="admin"` (red, full nav)
- Portal :3030 → `data-profile="portal"` (green, user nav)
- Portal API gates admin routes: /api/admin/* → 404; customer routes → 200
- PORTAL_MODE trailing-space bug (P57 CRITICAL) → VERIFIED ROOT FIXED

## CRITICAL CURRENT FINDINGS (summary)
1. **Area/project data scoping NOT enforced** — `requireAccess` defined but 0 uses; viewer can read all areas' data (horizontal privilege escalation live)
2. **22 admin pages are MOCK/STATIC/UNWIRED** (9 mock + 11 static + 2 demo) + 10 half-wired settings pages
3. **C13-W05 Bank Reconciliation = 0%** despite C13 at ~85%
4. **Wave 7-9 programs (C32/C33/C35/C37/C38) = 133 approved models, 0 implemented**
5. **GL foundation unmigrated** (21 models have no migration table)

## VERIFIED FIXED (P57 + P58)
- Portal gating security, auth.js 500, diagnostics 24/24, login profile-aware, sign-out, /me BFF, duplicate /admin mount, stale ports, split-brain auth/perm, 204 perms, trailing-space env class (NOW COMPLETE)
