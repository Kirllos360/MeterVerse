# Z4 — Repository Structure Audit

**Date**: 2026-06-17
**Mode**: Read-Only Audit
**Status**: ⚠️ Issues found — see details

---

## 1. Top-Level Directory Audit

| Directory | Purpose | Status | Issues |
|---|---|---|---|
| `.github/` | CI/CD workflows | ✅ | Present but starter workflows present |
| `.husky/` | Git hooks | ✅ | Present |
| `.opencode/` | AI config | ✅ | Present |
| `.specify/` | SpecKit governance | ✅ | Present |
| `backend/` | NestJS API | ✅ | Complete |
| `ci-cd/` | CI/CD configs | ⚠️ | Duplicates `.github/` — consolidate |
| `docs/` | Planning docs | ✅ | v2.0.0 planning documents |
| `documentation/` | Multi-format docs | ⚠️ | Duplicates `docs/` — consolidate |
| `Frontend/` | Next.js app | ✅ | Complete |
| `graphify-out/` | Graph analysis | ✅ | Generated artifacts |
| `logs/` | Runtime logs | ✅ | Should be gitignored |
| `reference/` | Reference systems | ✅ | 7 reference system directories |
| `reports/` | Audit reports | ⚠️ | 100+ reports, many stale |
| `scripts/` | Utility scripts | ✅ | Migration + validation |
| `specs/` | Spec docs | ✅ | 4 spec directories |
| `tools/` | Playwright MCP | ✅ | Present |
| `backup files/` | Session backups | ⚠️ | 2 backup directories — should be outside repo |
| `restore-point-*/` | AI restore points | ⚠️ | 2 restore point directories — should be outside repo |
| `test-agent/` | Unknown | ⚠️ | Unidentified purpose |
| `.venv/` | Python venv | ⚠️ | Should be gitignored |

## 2. Root-Level Files Audit

| File | Status | Note |
|---|---|---|
| `SYSTEM_DNA_DRAFT.md` | ✅ | Present (144KB) — should be promoted to SYSTEM_DNA.md |
| `SYSTEM_DNA.md` | ❌ MISSING | Required by Governance Rule 1 |
| `AGENTS.md` | ✅ | Present (modified) |
| `AI_HANDOFF.md` | ✅ | Present (modified) |
| `PROJECT_TREE.md` | ✅ | Present (modified) |
| `certification_log.md` | ⚠️ | New file — purpose unclear |
| `FULL_PROMPT_XFER.md` | ⚠️ | New untracked file — agent transfer doc |

## 3. Duplicate/Obsolescence Detection

| Duplicate Group | Files | Remediation |
|---|---|---|
| `docs/` vs `documentation/` | Both contain planning/architecture docs | Consolidate into `docs/` |
| `.github/` vs `ci-cd/` | Both contain CI configs | Consolidate into `.github/` |
| `backup files/` + `restore-point-*/` | Session backups inside repo | Move to `C:\Users\EPower\AppData\Local\Temp\opencode\` |
| `reports/` at root vs `reports/` in Meter/ | Reports in 2 locations | Clarify; root `reports/` is the active one |

## 4. Stale Reports Detection

In `D:\meter\reports\`:
- 100+ reports from prior governance phases (B0-B3, G-series, H-series, OR-series, RP-series)
- Many reference resolved issues or pre-v2.0.0 state
- **Recommendation**: Archive reports > 2 phases old to `reports/archive/`

## 5. Temporary/Generated Artifacts

| Path | Type | Recommendation |
|---|---|---|
| `graphify-out/` | Generated | Keep (regenerated per task) |
| `logs/` | Runtime | Add to .gitignore |
| `Frontend/.next/` | Build | Already gitignored |
| `node_modules/` | Dependencies | Already gitignored |
| `.venv/` | Python venv | Add to .gitignore |

## 6. Naming Convention Audit

| Convention | Status | Issues |
|---|---|---|
| Migration naming | ✅ | Consistent: `YYYYMMDDHHMMSS_description` |
| Task IDs in filenames | ✅ | Consistent across specs/ |
| Branch naming | ⚠️ | Mix of `feature/tXXX-*` and `feature/TXXX-*` |
| Report filenames | ✅ | Consistent phase prefix (z0-, g0-, rp0-, etc.) |
| Schema model naming | ✅ | CoreXxx for core, no prefix for sim_system |
| File casing | ⚠️ | Mix of PascalCase, camelCase, and kebab-case |

## 7. Summary

| Category | Score |
|---|---|
| Directory structure | ⚠️ 3/5 — duplicates need consolidation |
| File organization | ⚠️ 3/5 — backup files in repo |
| Naming consistency | ✅ 4/5 — minor branch naming inconsistency |
| Git hygiene | ⚠️ 2/5 — .venv, logs not gitignored |
| Report management | ⚠️ 2/5 — 100+ stale reports |
| **Total** | **14/25 (56%)** |

**Critical for T088**: No blockers. Cleanup is desirable but not blocking.
