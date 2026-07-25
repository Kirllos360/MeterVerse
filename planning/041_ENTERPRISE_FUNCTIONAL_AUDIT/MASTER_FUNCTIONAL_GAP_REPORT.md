# Enterprise Functional Gap Report

## Planning vs Implementation Comparison
**Generated:** 2026-07-26
**Methodology:** Cross-referenced METERVERSE_UNIFIED_PLAN.md, ULTIMATE_AUDIT_LOOP.md, and IMPLEMENTATION_PLAYBOOK.md against actual codebase at D:\meter

## Critical Status: Planning is STALE

The planning documents have NOT been updated to reflect the current implementation state. Key discrepancies:

| Claim in Planning | Planning Value | Actual Value | Status |
|:-----------------|:--------------:|:------------:|:------:|
| Test coverage | 0% | 113 tests (82 unit + 31 integration) | ❌ STALE |
| API endpoints | 179 | 100+ routes, 34 files | ❌ STALE |
| Prisma models | 78 | 86 | ❌ STALE |
| CI pipeline | No | GitHub Actions (ci.yml + deploy.yml) | ❌ STALE |
| Playwright tests | None | e2e/admin-projects.spec.mjs | ❌ STALE |
| requireRole usage | 13/21 routes | 0 routes (all requirePermission) | ❌ STALE |
| domain.js bug | Present | Fixed | ❌ STALE |
| CSRF protection | Missing | CORS + X-CSRF-Token header | ❌ STALE |
| JWT refresh | Missing | 24h expiry, X-Dev-Mode dev bypass | ❌ STALE |
| Brute force protection | Missing | Rate limiting (20 req/15min) | ❌ STALE |
| Unit test coverage | 0% | 82 tests, 13 files | ❌ STALE |

## Actual Gaps (Verified Against Code)

### Critical Gaps (0 remaining after security fixes)
All previously identified critical gaps have been resolved:
- [x] JWT fallback secret removed
- [x] Dead xlsx dependency removed (0 vulns)
- [x] Stack traces hidden in production
- [x] CSP strict in production
- [x] Rate limiting on all auth routes
- [x] HSTS + HTTPS redirect
- [x] Pino structured logging
- [x] File upload limits (10MB + magic bytes)

### Remaining High-Priority Gaps
1. **No MFA/TOTP** (mentioned in planning but not implemented)
2. **No database migration rollback** (prisma db push instead of migrate)
3. **No real-time meter dashboard** (WebSocket exists but not wired to meters)
4. **No automated invoice email delivery** (PDF + email engines exist but not connected)
5. **No batch operations UI** (backend endpoints exist, frontend missing)
6. **No customer self-service portal** (all APIs exist, no restricted frontend)

### Planning Integrity Issues
1. **PROJECT_STATUS.yaml** reports FROZEN status but implementation is actively changing
2. **Wave_01** marked 100% complete but Phase 42d/42e/42f tasks still have steps in progress
3. **Multiple empty directories** in planning (Checklists, Dependencies, Specs, Templates)
4. **AI_EXECUTION_CONTRACT.md** prohibits planning changes without Architect approval — but planning is known stale
