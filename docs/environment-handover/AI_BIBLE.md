# MeterVerse — AI BIBLE (Consolidated Operating Constitution)

**Purpose:** The single authoritative operating constitution for any AI agent (and human) working on MeterVerse. It consolidates AGENTS.md, the Master DeepSeek Execution Protocol, and all governance/memory rules into one portable document for the environment migration.

**Last updated:** 2026-08-17 (migration handover). Source of truth remains `.ai/memory/*`, `AGENTS.md`, `configs/*` in the repo — this is the portable/consolidated copy.

---

## PART I — THE SYSTEM

### I.1 What MeterVerse is
MeterVerse OS = Enterprise utility metering & billing platform. One PostgreSQL database, four surfaces:
- **Admin Console** (FE :3535) + **Admin API** (BE :3131)
- **Customer Portal** (FE :3030) + **Portal API** (BE :3003)
- Shared `Frontend/` Next.js source with deployable profiles (`PORTAL_MODE=1` for portal).
- **Symbiot** ingestion bridge (:9000 TCP / :9001 HTTP) runs inside the Admin BE.
- **PostgreSQL 16 on :5433** = the only authoritative DB (`meter_pulse`). Docker OFF. PG18 :5434 unrelated — never use it.

### I.2 Non-negotiables
1. **Native PG16 :5433 only.** Never start PG18 for MeterVerse. Never depend on Docker for the DB.
2. **REAL / DERIVED / UNKNOWN data separation.** Never fabricate readings/invoices; never silently promote derived (54.26 kWh) to real; never write synthetic data into production without TEST_MODE isolation.
3. **Verify from evidence, not claims.** No-trust mode. Multi-path verification (browser + API + DB + filesystem + tests) before declaring anything done.
4. **`**/*.pdf` is gitignored** — `git add -f` for deliverable PDFs.
5. **`next-env.d.ts` is shared** between Admin (`.next`) and Portal (`.next-portal`); Admin rebuild overwrites the Portal reference — restore after Admin build.
6. **Node session-reaping:** launched node dies when its shell closes. Use scheduled task `MeterVerseAdminBE` / `start /b`.

---

## PART II — THE EXECUTION PROTOCOL (apply to EVERY task)

### II.1 Start indicator (every task begins with)
```
CONTINUITY | TASK | PREVIOUS STATE | TOOLS/MCPs | KNOWLEDGE SOURCES | ENVIRONMENT/REPO | MODE
```

### II.2 Mandatory lifecycle
LOAD → DISCOVER → SEARCH → UNDERSTAND → PLAN → IMPLEMENT → INTEGRATE → TEST → DEBUG → FIX → RETEST → DEPENDENCY CHECK → COMPATIBILITY → SECURITY → REGRESSION → DOCUMENT → COMMIT → FINAL VERIFY → REPORT

### II.3 Rules
- **Continuity:** never abandon unfinished prior work; load PROJECT_STATE + CURRENT_SPRINT + memory first; never assume a prior claim is true without repo evidence.
- **Repository-first:** search before create. Reuse correct code, extend incomplete, repair broken, create only when proven absent. No duplicate implementations.
- **Multi-perspective verification:** architecture, backend, frontend, database, business, security, testing, operations, compatibility, documentation.
- **Dependency-root analysis:** trace UI→API→service→domain→DB→integration before patching symptoms.
- **Blocker rule:** exhaust repository/tools/dependency analysis before asking the user; when asking, give BLOCKER / ROOT CAUSE / TRIED / EVIDENCE / EXACT DECISION.
- **Completion rule:** never say DONE without all gates; use PARTIAL / BLOCKED / CONDITIONAL PASS otherwise.
- **Memory/state:** update PROJECT_STATE, CURRENT_SPRINT, gate matrix, tool-usage-log after material changes. Report MEMORY/STATE/TOOLS/GOVERNANCE update status.
- **Git/GitHub:** check repo/branch/worktree before; review diff, run tests, verify, update state, commit, verify commit+remote+clean. Target `Kirllos360/MeterVerse`. Never commit secrets.
- **Max progress per prompt** but do not over-expand scope.

---

## PART III — PROJECT LAYOUT & KEY PATHS

| Path | Purpose |
|------|---------|
| `backend/` | Express API (Admin :3131, Portal :3003 via PORTAL_MODE). Prisma schema + migrations. |
| `backend/src/services/` | Domain engines: solar-wallet-engine.js, pdf-engine.js, outbox-producer.js, outbox-dispatcher.js, ledger-consumer.js, posting-engine.js, symbiot-bridge.js, ingestion-runtime.js |
| `backend/src/routes/` | solar.js, invoices.js, pdf.js, ingestion.js, cheque.js, + many |
| `backend/prisma/schema.prisma` + `migrations/` | DB schema (additive migrations only, via `prisma migrate`) |
| `backend/tests/` | vitest unit + api tests |
| `Frontend/` | Next.js 16 shared source (Admin + Portal profiles) |
| `apps/`, `packages/` | workspace profiles + shared packages |
| `Meter/` | Legacy reference repo (Collection System Flask, Symbiot SEP, SBill, tariffs, IMS) — READ-ONLY reference |
| `docs/solar/` | Owner demo docs + the real PDF artifact (`SOLAR-52051449-2021-01.pdf`) |
| `planning/` | P12/P13 enterprise + solar planning/certification packages |
| `_tools/` | Runtime control plane (MeterVerse.cmd, Runtime.cmd, start-*.cmd, config.cmd) |
| `configs/` | tools-manifest, mcp-registry, tool-usage-log |
| `.ai/memory/` | PROJECT_STATE, CURRENT_SPRINT, AI_BIBLE, ARCHITECTURE_RULES, DESIGN_RULES, P00_CONSTITUTION, SPRINT_PROTOCOL |
| `.opencode/` | MCP config, plugins, rules |
| `docs/environment-handover/` | THIS migration package |

---

## PART IV — BUSINESS RULES (verified, do not re-derive blindly)

### IV.1 Solar billing (Collection-verified)
```
consumption = max(curr180 − prev180, 0)
production  = max(curr280 − prev280, 0)
net         = max(consumption − production, 0)
surplus     = max(production − consumption, 0)  → wallet credit
amount      = tiered tariff(net)   # SOLAR_TARIFF_TIERS: (50,.48)..(1000,1.58), >1000 @1.68
adminFee    = round2(amount × 0.02)
serviceFee  = 9.10
total       = round2(amount + adminFee + serviceFee)
```
Golden check: curr180=100, prev180=45.74 → net=54.26 kWh → amount=26.47 + 0.53 + 9.10 = **36.10**.

### IV.2 Real solar data (do not touch/recreate)
- Customer `f881de8e` · Meter `52051449` (solar, `57cc414c`) · Assignment active 2021-01-01
- Invoice `SOLAR-52051449-2021-01` = 36.10 (id `22cc2e45…`) + 65 invoices / 23 payments (totals: 77,855.94 / 75,124.50 / 2,731.44)
- Download endpoint: `GET /api/pdf/invoices/:id/download`
- **Blocked:** raw 180/280 registers (external). Do not fabricate.

### IV.3 Enterprise event pipeline (P12, done + certified)
- Correlation (B) → enqueueEvent producer (C) → dispatcher + ledger consumer (D, certified 10/10) → shadow reconciliation (P12.3-09). Test suite baseline: **464 (446/18)**.

---

## PART V — SECURITY / TENANCY PRINCIPLES

- JWT auth on all routes; unauthenticated → 401.
- RBAC permissions (`invoices.create`, `documents.*`, etc.); solar gate = `invoices.create`.
- **Invoice areaId is DERIVED from the customer** (never client-supplied) — horizontal-privilege protection.
- Object-level `requireAccess` for scoped roles; fail-closed.
- Audit log with `correlationId`; server-authoritative correlation (spoof-proof UUID).
- Outbox events carry areaId/projectId/tenant from the aggregate (never payload).

---

## PART VI — QUALITY GATES (run before declaring completion)

1. `cd backend && npx vitest run tests/unit tests/api` (baseline 464: 446/18)
2. `cd Frontend && npx tsc --noEmit` (0 errors)
3. `node docs/architecture/graph/validate-graph.mjs` (12/0/0)
4. `node speckit/validator.mjs` (100%)
5. `npx prisma migrate deploy` + `npx prisma validate` + `npx prisma generate`
6. Runtime health (all 4 services + Symbiot)
7. Real Solar download endpoint (200, application/pdf)
8. Browser render (Playwright) where UI is touched
9. Git clean + pushed

---

*This is the portable constitution. The authoritative live files live in the repo — keep them current, and re-export this document if the constitution changes materially.*