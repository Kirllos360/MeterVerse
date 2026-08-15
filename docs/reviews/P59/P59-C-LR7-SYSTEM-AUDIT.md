# METERVERSE — SYSTEM OPERATING AUDIT (2026-08-15)

**Triggered by:** launch/blank-screen investigation + "very bad/bad feedback, no good points" request.

## 1. Launch & Runtime (verified live)
- **Launcher:** `_tools/StartAll.ps1` (detached, survives close) + `_tools/StartAll.cmd` + `MeterVerse.cmd`.
- **Services:** Admin BE :3131, Admin FE :3535, Portal BE :3003, Portal FE :3030 — all 200, survive 25s+ detached.
- **DB:** NATIVE PostgreSQL :5433 (Windows services postgresql + postgresql-x64-18, Running+Automatic). **Docker is DOWN** (all containers exited, daemon unreachable). Docker was only ever a *parallel* compose stack that competed for :5433 — not the source of truth.
- **Data:** login OK, customers 212, meters 277, invoices 116, readings 361, payments 53 = the real native DB.

## 2. BAD / VERY-BAD FINDINGS (no good points, as requested)

### A. CODE COMPILATION / TOOLING
1. **BAD — `_tools/config.cmd` had a UTF-8 BOM** (fixed): produced `'@echo' is not recognized` on every launch; cosmetic but confusing.
2. **BAD — Frontend `tsconfig` includes `.next-portal/types`** — generated Turbopack cache corrupts tsc; pre-commit fails intermittently. Mitigation: delete `.next-portal` before commit (not a durable fix).
3. **VERY BAD — `backend/.env` has `PORT=PORT=3131`** (double-assignment). Server falls back correctly only because server.js defaults; a misread env could bind wrong port.
4. **BAD — Turbopack dev cache corruption** (`.sst` SST errors) crashes `next dev` for portal; forced production `next start`. Root fix incomplete.

### B. DATABASE CONNECTIVITY
5. **VERY BAD — Port 5433 split-brain risk:** root `docker-compose.yml` maps `5433:5432` (Docker) while native PG also binds :5433. If Docker starts, it fails (port busy) OR both fight. The native path is correct but the compose is a landmine.
6. **BAD — Two native PG services** (`postgresql` + `postgresql-x64-18`) both configured; only one owns :5433; the other is idle but could conflict on restart.

### C. DATA LEAKAGE / TENANCY / RBAC
7. **VERY BAD — 639 P59-B records still unscoped** (56 NULL customers, 135 M_B, 41 M_D conflicts, 304 NULL readings, 16 NULL invoices, 8 NULL payments). Fail-closed requires `areaId` — these records are **invisible to area-scoped users** (availability gap) and only protected from *leak* by the fail-closed deny.
8. **BAD — Cross-project import leak (code):** `backend/src/routes/intelligence.js` imports `../../../src/intelligence/...` = **D:\meter\src** (a SEPARATE root project). Backend depends on an unrelated folder. `MODULE_TYPELESS` warning + functional coupling.
9. **BAD — `X-Dev-Mode` header still used** in `ListGridPage.tsx` (frontend) and `ConfigCenterPage.tsx` — gated behind `ALLOW_DEV_BYPASS=true` but if that env is ever set true in prod, it's a bypass.
10. **VERY BAD — Project tenancy absent:** 14 projects, all `areaId` NULL, no projectId on Customer/Meter. Cross-project isolation is **not enforced** — only area. A future project-scoped requirement would be unprotected.
11. **BAD — Ledger (`GeneralLedgerEntry`) has no area/project lineage** — global financial records visible to admin only, but not area-auditable.

### D. LOGIC / ANOMALIES / BACKDOOR-LIKE
12. **VERY BAD — `requireAccess` FAIL-OPEN was only recently fixed** (P59-B 4B) for NULL areaId — the class of bug (skip-on-NULL) could recur in any new route that doesn't use requireAccess. Import/settlement/cheque/solar routes must each re-prove tenancy.
13. **BAD — `X-Dev-Mode: true` header** in FE data layer = a potential bypass vector if `ALLOW_DEV_BYPASS` misconfigured.
14. **BAD — Idempotency for solar invoice** relies on an `auditEntry.details` string `contains` match (`"ref":"..."`) — brittle; a ref string appearing in another invoice's notes could false-positive 409.
15. **BAD — Cheque engine** maps to `Payment.reference`/`notes` (string) — no structured cheque_number/bank/cleared columns; reconciliation requires parsing strings.

### E. COMPONENT GAPS (physical/logical connection)
16. **BAD — No real-time health/readiness endpoint** per service beyond `/api/health`; the tool's "Ready in 410ms" logs but no readiness gate.
17. **BAD — No backup verification** — `_tools/backups` created a 4.3MB dump but restore is never tested in CI.
18. **VERY BAD — Graph control is documentation-only:** `validate-graph.mjs` validates the .dot files, but **no code enforces** the graph (a change can violate tenancy rules without the graph blocking it).

## 3. Naming (MeterVerse)
- User-facing = **MeterVerse OS** (login, layout, title, description, API) — confirmed in browser.
- Legacy names (SBill/Collection/IMS/Meter Pulse/October Billing) = **`reference/` research folders only** (historical evidence) + internal comments. Kept intentionally.
- "Symbiot" = legitimate SEP/meter-integration feature name (functional), not legacy branding.

## 4. Weaknesses summary (worst → least)
1. 639 unscoped records (tenancy data gap — P59-B blocked).
2. Backend → `D:\meter\src` cross-project import (architecture leak).
3. Port-5433 Docker/native split-brain risk.
4. Project tenancy absent (14 projects unenforced).
5. `X-Dev-Mode` bypass header latent.
6. Idempotency/cheque string-based (brittle).
7. Turbopack/tsc cache fragility.
8. Graph = advisory, not enforced.
9. `PORT=PORT=3131` env typo.
