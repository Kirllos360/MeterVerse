# MeterVerse — MEMORY (Complete Project State for Migration Handover)

**This is the consolidated memory the new environment starts with. Full authoritative detail lives in `.ai/memory/PROJECT_STATE.md` (67 KB) and `planning/` — read those too.**

**Last updated:** 2026-08-17 · **Current HEAD:** `9dec6600` · **Branch:** main · **Repo:** Kirllos360/MeterVerse

---

## 1. PROJECT IDENTITY
- **MeterVerse OS** — enterprise utility metering & billing platform.
- **Stack:** Node 24 + Express backend · Next.js 16 + React 19 + TS + Tailwind v4 frontend · PostgreSQL 16 · Prisma ORM · Vitest · Playwright.
- **Four surfaces:** Admin FE :3535 / Admin BE :3131 / Portal FE :3030 / Portal BE :3003.
- **Legacy reference** (read-only): `Meter/` (Collection System Flask, Symbiot SEP2/DLMS, SBill, tariffs, IMS).

## 2. RUNTIME STATE (last verified 2026-08-17)
- PG16 :5433 UP (`meter_pulse`) · Admin BE :3131 UP (health 200) · Admin FE :3535 UP · Portal BE :3003 UP · Portal FE :3030 UP · Symbiot :9000/9001 (in Admin BE).
- **Admin login:** admin@meterverse.com / Admin@123 · DB: postgres/postgres · JWT: dev_secret_meter_pulse_2026.
- **Startup truth:** `schtasks /Run /TN "MeterVerseAdminBE"` (via `_tools/experiment-be.cmd`) is the reliable BE launch; node dies if its shell closes.

## 3. SOLAR VERTICAL (the business priority — state as of the handover)

### 3.1 Real data (REAL — do not fabricate/recreate)
- Customer `f881de8e-5d61-4b93-bbdc-ffb70fac4441` = **ايهاب امام حسنين شافعي** (Ihab Shafie), active
- Meter `52051449` (id `57cc414c-15da-41b1-9b34-a9af414d0580`), type **solar**, linked to customer, active MeterAssignment 2021-01-01
- Real historical invoice **SOLAR-52051449-2021-01 = 36.10 EGP** (issued, id `22cc2e45-d615-4f98-90d4-76098fea2aac`)
- **65 real invoices** (2021-01→2026-04) + **23 real payments** (REC-SOLAR-52051449-*); totals reconcile EXACTLY: invoiced 77,855.94 / paid 75,124.50 / balance 2,731.44
- Source provenance: Collection export `Solar_Invoices_Import.xlsx` + `solar-wallet-replay-report.md`

### 3.2 Implemented & certified
- **Engine:** `backend/src/services/solar-wallet-engine.js` (`computeSolar`, `persistSolarInvoice`, `SOLAR_TARIFF_TIERS`)
- **PDF:** `backend/src/services/pdf-engine.js` (pdfkit, bilingual Tahoma Arabic, amountInWords fix)
- **Download:** `GET /api/pdf/invoices/:id/download` → application/pdf attachment (real browser download)
- **Artifact:** `docs/solar/SOLAR-52051449-2021-01.pdf` (23,649 B, %PDF-, validated)
- **UI:** "Download Invoice" button on Admin invoice detail page
- **Tenancy/RBAC:** invoice areaId derived from customer; solar gate = `invoices.create`
- **Owner docs:** `docs/solar/` (TECHNICAL_DEMONSTRATION, ONE_PAGE, DEMONSTRATION_SCRIPT, INVOICE_EVIDENCE)

### 3.3 Blocked (EXTERNAL — proven exhaustively)
- **Raw 180/280 register readings for 52051449 are ABSENT** from every accessible source: all DBs (incl `collection_tracker` PG, meter_pulse all schemas incl `sim_system`), both SQLite backups, all files/xlsx, git history, Symbiot SEP2/DLMS deployment. No live Collection/Symbiot/SEP source is reachable.
- The 36.10 invoice amount is REAL historical (solar minimum). Do NOT fabricate registers; the derived 54.26 kWh must never be promoted to real.
- **Exact input required (one of):** (a) real reading export for 52051449, (b) live Symbiot/SEP endpoint+credentials, (c) explicit authorization to use DERIVED baseline (labeled).

## 4. ENTERPRISE FOUNDATION (P12/P13 — done)
| Item | Status |
|------|--------|
| P12.2-A event schema + migrations | applied live |
| P12.2-B server-authoritative correlation middleware | certified (7 tests) |
| P12.2-C enqueueEvent outbox producer | certified (6 tests) |
| P12.2-D outbox dispatcher + ledger consumer | **certified** (9 tests, live 10/10) |
| P12.3-09 shadow validation/reconciliation (TEST_MODE-gated) | certified (3/3 diff=0) |
| P13.11–13.13 owner demo + first real download | certified (commit 9dec6600) |

## 5. DATABASE (meter_pulse :5433, public schema)
- **Counts:** 224 customers, 278 meters (incl 1 solar), 116 baseline invoices + 65 solar invoices, 56 invoice items, 23 solar payments; `collection_tracker` = 15,012 Collection customers.
- **Key models:** Customer, Meter, MeterAssignment, Reading, Invoice, InvoiceItem, Payment, Tariff, AuditEntry, OutboxEvent, EventDelivery, EventDeadLetter, IdempotencyRecord.
- **Migration discipline:** additive migrations via `prisma migrate deploy` (baseline + P12.2-A + billing period + payment reference + deadletter unique). Never `db push` for production.

## 6. TESTS & QUALITY BASELINES
- Backend suite: **464 tests (446 pass / 18 skip)** via `npx vitest run tests/unit tests/api`
- FE typecheck: **0 errors** (`npx tsc --noEmit`)
- Graph: **12/0/0** · SpecKit: **100%**
- Playwright + Chromium available (ms-playwright chromium builds installed)

## 7. OPEN ITEMS / NEXT WORK (do not start until continuity verified)
1. **Solar 180/280 registers** — EXTERNAL blocker (see 3.3). Needs user input.
2. **Admin Invoices UI** — list/detail uses mock data + `[id]` route 307-redirects (pre-existing gap). Wiring the list to real `/api/invoices` is a legitimate next UI task.
3. **P12.3-08** (financial replay guard + replay API) and **P12.3-10** (cutover runbook) — next documented enterprise tasks.

## 8. ENVIRONMENT MIGRATION (see `docs/environment-handover/`)
- Read `ENVIRONMENT_SETUP_GUIDE.md` for the full tool/library/MCP inventory + setup.
- Run the post-move verification checklist (services + tests + download).
- Give the fresh AI `prompts/FULL_HANDOVER_PROMPT.md` verbatim.
- `AI_BIBLE.md` is the portable operating constitution.