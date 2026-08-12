# P58 — RECOMMENDATIONS (RANKED P0-P4)
**Date:** 2026-08-12

## P0 — BLOCKERS
| ID | Finding | Evidence | Recommended solution | Cost | Regression risk |
|----|---------|----------|----------------------|------|-----------------|
| REC-01 | Area/project data scoping NOT enforced (horizontal escalation live) | viewer reads ALL customers; requireAccess 0 uses | Wire requireAccess on detail/update/delete + scope list queries by user area/project (PermissionOnRole scopeType/scopeId) | Medium | High if done wrong → test thoroughly |
| REC-02 | 22 mock/static admin pages | report 10 | Wire to real endpoints OR remove from nav (9 MOCK first) | Medium | Low |

## P1 — CRITICAL
| ID | Finding | Evidence | Recommended solution | Cost | Regression risk |
|----|---------|----------|----------------------|------|-----------------|
| REC-03 | C13-W05 bank reconciliation 0% | schema grep | Model W05 (Wave 2.5) before C13 full cert | Medium | Low |
| REC-04 | GL 21 models unmigrated | P41/OBS-054-055 | prisma migrate diff + baseline | Low | Medium (migration) |
| REC-05 | Egyptian tariff fee chain not verified | legacy sbill vs tariff-engine | Unit-test tariff-engine vs sbill formulas + seed real per-area tariffs | Medium | Low |

## P2 — HIGH
| ID | Finding | Evidence | Recommended solution | Cost | Regression risk |
|----|---------|----------|----------------------|------|-----------------|
| REC-06 | Launcher trailing-space class recurred | P57→P58 found 3 batches | Add launcher regression scan (pattern + stale ports) in CI | Low | Low |
| REC-07 | GitPush.cmd blind add -A | toolchain | Add git status + secret scan gate | Low | Low |
| REC-08 | Mock creds in auth-service.ts | source | Remove or strictly env-gated (keep gate) | Low | Low |
| REC-09 | Tracker coverage undercounts reality | C26 0% vs org exists; 187 models | Re-baseline P40 tracker coverage | Low | Low |

## P3 — MEDIUM
| ID | Finding | Evidence | Recommended solution | Cost | Regression risk |
|----|---------|----------|----------------------|------|-----------------|
| REC-10 | ~17 dead files + 47 nav-less routes | report 09 | Dead-code cleanup campaign | Low | Low |
| REC-11 | AdminLayout/SystemLayout twin | report 09 | Rename AdminLayout export; merge/deprecate | Low | Medium |
| REC-12 | /dashboard starter island duplicates admin console | report 09 | Choose canonical; move to demo | Low | Medium |
| REC-13 | AuditEntry lacks areaId/projectId scope | data lineage | Add scope columns for per-area audit | Low | Low |
| REC-14 | Tariff prorating/adjustments/retroactive/min-charge | report 14 | Add in tariff engine | Medium | Medium |

## P4 — LOW
| ID | Finding | Evidence | Recommended solution | Cost | Regression risk |
|----|---------|----------|----------------------|------|-----------------|
| REC-15 | Meter/ 24.9GB clone | verified | Finish backup → delete (user decision) | Low | None (gitignored) |
| REC-16 | phase-g/h0/migration_engine orphaned scripts | self-referenced | Retire or update to current ports/paths | Low | Low |
| REC-17 | X-Dev-Mode bypass | auth.js | Verify NODE_ENV gate strips in prod | Low | Low |
| REC-18 | C20/C28/C30/C32/C33/C35/C37/C38 unbuilt | planning matrix | Roadmap (future waves), not urgent | — | — |

## PRIORITY EXECUTION SNAPSHOT
1. **REC-01** (P0 tenancy) → 2. **REC-02** (mock pages) → 3. **REC-03/04** (C13 completeness) → 4. **REC-05** (tariff verification) → 5. **REC-06** (launcher guard) → then Wave 4 (C15→C26→C17).
