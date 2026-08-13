# P59 — 03 TENANCY FORENSIC + 17 CERTIFICATION REPORT
**Date:** 2026-08-13 · **Method:** source / API / DB / test / runtime multi-evidence

## P0 TENANCY — IMPLEMENTED & CERTIFIED (code/test level)

### Finding (P58 → P59 confirmed)
A `viewer` role (area='') read ALL customers across areas (horizontal escalation).
Root causes (file:line evidence):
- `requireAccess` = **0 uses** + referenced undefined `checkPermission` (would 500) — security.js
- NO route scoped list queries by user area/project (0 `req.user.area` refs) — all core routes
- JWT omitted area/project scope — auth.js:50, auth-engine.js:55
- viewer `["*.read","*.list"]` read all lists + payments export hole
- admin-settings.js (30 routes) + diagnostics.js + locations.js RBAC-free
- `X-Dev-Mode` header silently became super_admin in dev

### Fix (authoritative backend model, fail-closed) — commits `13f285f2`,`27e680ab`,`a7239fd5`
| # | Change | File |
|---|--------|------|
| 1 | JWT now carries `area`/`project` scope | auth-engine.js, auth.js |
| 2 | `scopeWhere()` injects user area/project into list queries; empty-scope non-global → deny (`id:"__denied__"`) | security.js |
| 3 | `clampRequestedScope()` forces client areaId/projectId within user scope (deny if other) | security.js |
| 4 | `requireAccess()` fixed (removed undefined checkPermission) + sync-return + wired to :id read routes | security.js + customers/meters/readings/invoices |
| 5 | payments export perm fixed (`payments.export`, viewer denied) | payments.js |
| 6 | admin-settings + diagnostics + locations GETs now requirePermission | 3 route files |
| 7 | `X-Dev-Mode` bypass gated behind `ALLOW_DEV_BYPASS=true` (off by default) | auth.js |
| 8 | Tenancy data readiness: seed assigns customer areaId + backfill script (164 customers now area-linked) | seed-operational.mjs, backfill-customer-areas.mjs |
| 9 | Effective-permission endpoint `/api/auth/permissions` (DB grants, not hardcoded); `/me` uses resolver | auth.js |

### Multi-evidence
- **Source:** all 9 fixes present in committed code
- **Static:** scopeWhere/clamp/requireAccess wired into 5 core routes + 3 RBAC-gap files
- **Test:** **300/300 backend** (incl. 7 escalation tests: viewer-other-area DENIED, fail-closed empty, admin/super_admin global, project scope) + 56 contract + 31 integration
- **DB:** all 164 customers now have areaId; no dup users
- **Runtime boot:** new code boots clean (only EADDRINUSE from elevated old backends)
- **Proof:** 14/14 tenancy unit proof (no drift from source)

### Live-activation blocker (honest)
The running backends on :3131/:3003 are ELEVATED processes (started ~21:50, survive non-admin kill).
**User action required:** from an ADMIN terminal, run `_tools\MeterVerse.cmd stop` (or kill PIDs on 3131/3003), then `_tools\MeterVerse.cmd start`. This activates the certified tenancy code live. Until then, the live :3131 still runs the pre-P59 code (escalation still present in the RUNNING instance, fixed in committed code).

---

# P59 FINAL DECISION

**P59 FINAL DECISION: CONDITIONAL GO**
- P0 tenancy: **FIXED + VERIFIED** (code/test certified; **live activation pending elevated restart — user action**)
- Wave 4: **STILL BLOCKED** (until live tenancy is browser/API-verified after restart)
- Admin: **OPERATIONAL** (core governance pages real; 9 mock peripheral pages remain = P2)
- Portal: **OPERATIONAL** (pages render; tenancy now enforced by backend)
- Toolchain: **CERTIFIED** (MeterVerse.cmd unified, blank-screen root cause fixed, PG16 native)
- Security: **CONDITIONAL** (tenancy fixed; X-Dev-Mode gated; dev-login present)
- Planning: **RECONCILED** (P58 matrix verified; C13-W05 + GL + tariff gaps documented)

**Final verdict:** The P0 horizontal-escalation blocker is **genuinely fixed at the code/test boundary** and certified with 300 tests. Activating it live requires one elevated restart (documented). **Wave 4 must remain blocked until that live restart + browser/API re-verification is done by an elevated session.**
