# P58 — ARCHITECTURE DECISION REPORT
**Date:** 2026-08-12 · **Status:** DECISIONS REQUIRED — awaiting review/approval

## DECISION 1 — DATABASE / DATA ARCHITECTURE

**Options evaluated:**
- A. One shared PostgreSQL DB + strict authorization/tenancy
- B. Separate DBs per system
- C. One DB, separated schemas/tenants
- D. Hybrid

**EVIDENCE:** Schema already has `PermissionOnRole(scopeType, scopeId, grant, override_hierarchy)` — a tenancy-ready model. `requireAccess` object-level enforcement exists (defined, currently 0 uses). Single DB currently shared by admin+portal backends (:3131 and :3003 both hit `meter_pulse`).

**RECOMMENDATION: OPTION A — One shared DB + enforced tenancy.**
- Reasons: single source of truth (reporting, audit, cross-system consistency), no split-brain risk, schema already supports scoping, admin must monitor/control portal without escalation
- The model ALREADY exists (`PermissionOnRole.scopeType/scopeId` + `requireAccess`); the work is **enforcement**, not new schema
- Alternatives rejected: B (split-brain, duplicate data, harder reporting), C (schema-per-tenant overkill for 3 areas), D (premature complexity)

**RISK:** if enforcement isn't applied, the shared DB is a shared vulnerability (any read permission = all areas). **Mitigation:** OD-01 fix (P0) before any user-facing tenancy feature.

## DECISION 2 — AUTHENTICATION ARCHITECTURE

**"Same login appearance" ≠ "same auth infra" ≠ "same DB connectivity" — these are now cleanly separated:**
- Same login UI: shared `/login` page (both profiles) ✅
- Same auth infrastructure: single `AuthRuntime` (zustand) + single backend auth-engine ✅
- Same DB connectivity: yes (single DB) — acceptable under Decision 1

**RECOMMENDATION:** Keep unified auth (JWT access + refresh + DB session + MFA + lockout), with **profile-aware system_type** (admin vs user) enforced by the backend `system` claim in the JWT + `verifyToken(allowedSystems)`. Verified working. Add: token revocation on password change, session hardening.

## DECISION 3 — SUPER-ADMIN ACCOUNT (kirllos)

**Requested:** two identities (admin + portal) both `kirllos / kirllos.hany@epower.com.eg`.

**SECURITY RULE (from prompt):** password is a BOOTSTRAP SECRET — never commit to code/git/seed/logs/screenshots.

**RECOMMENDATION:**
1. **Two DISTINCT user records** in the single DB (one `role=super_admin` scoped to admin system, one `role=super_admin` scoped to portal system) OR **one user record with system-scoped role mapping** — requires the identity model decision (below)
2. Bootstrap: create via `env`-provided secret + `bcrypt` hash (seed reads from `process.env.KIRLLOS_BOOTSTRAP_PASSWORD`, never hardcoded)
3. Enforce: forced password change on first login, MFA enrollment, audit every login, emergency recovery via env secret not account reset
4. Never log the password; mask in audit

**Identity model decision (needed):** Given both systems share one DB + one email, the clean model is **ONE user row** with a **system-scoped role binding** (User → role per system_type via PermissionOnRole.scopeType='system'), OR two rows distinguished by `tenant`/`area` field. **Recommended:** one row + system-scoped role; avoids email-unique collision (User.email is @unique).

## DECISION 4 — AREA / PROJECT / USER / ROLE / PERMISSION MODEL

**Current model (verified):** User(area:String, project:String, tenant:String, role:String, roleId FK) → Role → PermissionOnRole(scopeType, scopeId, grant) → Permission. `requireAccess` enforces object-level area scope (currently unused).

**Recommended model (matches existing schema):**
```
User ── roleId ──> Role ── PermissionOnRole ──> Permission
                       (scopeType: null|area|project, scopeId, grant, override_hierarchy)
```
- User→area/project: migrate from string fields to proper relation OR use PermissionOnRole scoping. **Recommend:** keep User.area/project as denormalized defaults + enforce via PermissionOnRole scopes.
- Multi-area/project: supported via multiple PermissionOnRole rows with different scopeId
- Role differs by project: yes, via scopeType='project' + scopeId
- Custom permission override: yes, via grant=true/false + override_hierarchy
- Admin grant/revoke: yes, via admin routes (permissions.js)
- Time-limited access: NOT currently modeled — flag for future (expiresAt on PermissionOnRole)

**CRITICAL:** horizontal escalation is LIVE today (OD-01). Test vectors User A→Project B / Area B / Customer B must ALL be impossible once `requireAccess` + list-scoping are applied.

## DECISION 5 — ADMIN/PORTAL BOUNDARY (see 07_P58_ADMIN_PORTAL_BOUNDARY_REPORT.md)
ADMIN = govern & configure. PORTAL = operate.

## REQUIRED APPROVAL
All 5 decisions above require your review. **Decision 1 (single DB + enforce tenancy) and Decision 3 (identity model) are the gate for the kirllos/area/project wiring.** Do not begin large implementation until approved.
