# P58 — RISK & CONCERNS REGISTER
**Date:** 2026-08-12

## CONCERNS (documented facts)
| ID | Concern | Evidence | Impact |
|----|---------|----------|--------|
| C-01 | Horizontal privilege escalation live (no data scoping) | viewer reads all areas | **P0 — blocks Wave 4 + kirllos wiring** |
| C-02 | 22 mock/static admin pages + 10 half-wired | report 10 | UI certifies features that don't persist |
| C-03 | C13-W05 bank recon 0% | schema | C13 "complete" claim false |
| C-04 | GL 21 models unmigrated | OBS-054/055 | migrate-deploy mismatch risk |
| C-05 | Tracker coverage undercounts (C26 0% vs org exists) | planning matrix | planning/reality drift |
| C-06 | Dev-only `X-Dev-Mode` bypass | auth.js | footgun if NODE_ENV gate weakens |
| C-07 | Hardcoded mock creds (gated) | auth-service.ts | cleanup needed |

## FEARS (probability × impact)
| ID | Fear | Prob | Impact | Detection | Prevention/Mitigation |
|----|------|------|--------|-----------|------------------------|
| F-01 | Two profiles share authorization | Low | High | RBAC tests | role + system claim separation (verified) |
| F-02 | Portal gains admin access | Very Low | Critical | gating tests | PORTAL_MODE gate + admin route 404 (verified) |
| F-03 | Admin unintended portal mutation | Med | High | audit trail | deny-by-default grants + requireAccess |
| F-04 | Data-scope regression reintroduced | Med | Critical | tenancy suite (Phase 4) | automated G2 gate |
| F-05 | Trailing-space launcher bug returns | Med | High | launcher scan | CI regression check (REC-06) |
| F-06 | Permission drift (204 vs new routes) | Med | Medium | perm-count check | seed audit in CI |
| F-07 | Stale env/ports | Low | High | runtime matrix | launcher + config scan |
| F-08 | Mock UI certified real | High | High | mock/static audit | G3 gate (0 mock pages) |
| F-09 | False certification (test pass, browser fail) | Med | Critical | multi-evidence rule | §29 10-evidence gate |
| F-10 | Untracked modifications / generated committed | Med | Medium | git status pre-commit | P58 §32 protocol |
| F-11 | Database split-brain (two DBs drift) | Low | High | single-DB decision | Decision 1 (Option A) |
| F-12 | Legacy credentials leaked from reference | Low | Critical | secret scan | never inherit (SEC-04) |
| F-13 | Future migration breaks current data | Med | High | migrate-dry-run in CI | Phase 2 migration baseline |

## TOP-3 MUST-MITIGATE
1. F-04/F-01/F-02 (data + auth boundary) → REC-01 tenancy enforcement (P0)
2. F-08 (mock UI) → REC-02 wire/remove (P1)
3. F-05 (launcher bug class) → REC-06 CI scan (P2)
