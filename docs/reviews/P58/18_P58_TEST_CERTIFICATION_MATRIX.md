# P58 — TEST & CERTIFICATION MATRIX
**Date:** 2026-08-12

## CURRENT TEST BASELINE (verified this phase)
| Suite | Count | Status |
|-------|-------|--------|
| Backend unit+API (vitest) | 292 | ✅ PASS |
| Backend integration | 31 | ✅ PASS |
| Backend contract | 56 | ✅ PASS |
| Frontend vitest | 44 | ✅ PASS |
| Frontend TypeScript | 0 errors | ✅ PASS |
| Frontend production build | — | ✅ PASS |
| Browser (Playwright specs) | ~64 blocks in 5 specs | ⚠️ NOT RE-RUN this phase (dev servers up; specs target stale ports per earlier P53 — verify) |

## TARGET MATRIX (future, per P58 §28)
| Category | Current | Target | When |
|----------|---------|--------|------|
| UNIT | 292 | ≥350 (add tenancy, tariff-fee-chain tests) | Phase 2-4 |
| API | (in 292) | keep + scoping tests | Phase 4 |
| CONTRACT | 56 | 60+ | Phase 2 |
| INTEGRATION | 31 | 45+ | Phase 2-4 |
| DATABASE | manual | migration-baseline test | Phase 2 |
| SECURITY | ad-hoc | automated scan (gitleaks) + DAST | Phase 1 |
| RBAC | manual (403 matrix) | automated role-isolation suite | Phase 3 |
| **TENANCY (horizontal escalation)** | **NONE** | **automated: User A→B data must 403** | **Phase 4 (P0)** |
| E2E | Playwright specs | full journeys per profile | Phase 6 |
| BROWSER | — | per-page render+console | Phase 5-6 |
| VISUAL | manual | Playwright screenshots | Phase 5 |
| ACCESSIBILITY | — | axe-core | Phase 5 |
| PERFORMANCE | ad-hoc | Lighthouse in CI (lighthouseci configured) | Phase 8 |
| STARTUP | manual | launcher regression scan (trailing-space + ports) | Phase 0 |
| FAILURE RECOVERY | manual | automated (kill backend → heal) | Phase 8 |
| DISASTER RECOVERY | manual | restore drill | Phase 8 |
| DATA INTEGRITY | manual | seed-count assertions | Phase 9 |
| MIGRATION | — | migrate deploy dry-run in CI | Phase 2 |
| REGRESSION | full suite | run after every phase | every |

## CERTIFICATION GATES
- **G1** Phase 0: launcher scan green, clean tree
- **G2** Phase 4: **tenancy suite green (P0 GATE — WAVE 4 BLOCKED until pass)**
- **G3** Phase 5/6: 0 mock/static pages
- **G4** Phase 9: full matrix + build + browser + security
- **G5** Phase 10: Wave 4 readiness

## MULTI-EVIDENCE RULE (§29)
Every gate = source + static + API + DB + browser + console + network + test + build + runtime evidence.
