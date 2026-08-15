# P60 — DEEP FORENSIC VALIDATION + COLLECTION-BACKEND REUSE DECISION

**Date:** 2026-08-15 · **HEAD:** 9bdcf3fd · **Mode:** forensic, repository-first, runtime-verified

---

## 1. COLLECTION BACKEND REUSE DECISION

**SELECTED: C — HYBRID REUSE (keep MeterVerse backend, reuse Collection business LOGIC)**

**WHY (evidence):**
- Collection System = Python 3 + Flask + SQLAlchemy + Redis + fpdf2 (19 routes, 58 models, 3 smoke tests).
- MeterVerse = Node.js + Express + Prisma + PostgreSQL (48 services, 67 routes, 189 models, 41 test files, 368 tests passing, live-browser-verified, JWT/RBAC/tenancy/solar/settlement/import built).
- **A Python Flask backend cannot serve a Next.js+Prisma frontend** (API contracts, JWT-vs-flask-login, ORM, data model all differ).
- The **valuable Collection business logic is ALREADY recovered** into MeterVerse-native services:
  - `settlement-engine.js` (FIXED/PERCENTAGE/ONE_TIME) ✅
  - `solar-wallet-engine.js` (net metering) ✅
  - `cheque-engine.js` (cheque lifecycle) ✅
  - `import-engine.js` (solar Excel) ✅
  - charge rule types (per_unit/zero) ✅
- **Not yet recovered (evidence-gated, LR-1/5):** chilled-water settlement, CurrencyType, POSTerminal.

**Classification (per Collection component):**

| Collection Component | Classification | Evidence | MeterVerse Equivalent |
|---------------------|----------------|----------|----------------------|
| Flask backend framework | REJECT | Python/Flask incompatible with Node/Express | Express backend |
| SQLAlchemy models | REJECT (logic reused) | ORM differs | Prisma models |
| charge_engine.py (6 charge types) | ADAPTED ✅ | per_unit/zero in business-engine | Tariff + ChargeRule |
| settlement engine (FIXED/PERCENT/ONE_TIME) | ADAPTED ✅ | settlement-engine.js | Settlement/InvoiceSettlement |
| solar wallet (net metering) | ADAPTED ✅ | solar-wallet-engine.js | CustomerLedgerEntry + Invoice |
| cheque lifecycle | ADAPTED ✅ | cheque-engine.js | Payment (method=cheque) |
| solar Excel import | ADAPTED ✅ | import-engine.js | ImportJob |
| chilled-water settlement | MISSING (evidence-gated) | ChilledWaterConfig/Settlement | none — needs business decision |
| CurrencyType / POSTerminal | MISSING (evidence-gated) | models.py | none |
| flask-login auth | REJECT | session-based vs JWT | JWT + RBAC |
| fpdf2 reports | REJECT | older | pdf-engine (pdfkit) |

**TIME ADVANTAGE:** Reuse already done (LR-1..7). Remaining Collection recoveries (chilled/currency/POS) are small, evidence-gated additions — NOT a backend swap.
**RISK:** LOW (no migration). **MIGRATION COST:** 0 (no migration). **DB IMPACT:** none. **API IMPACT:** none. **SOLAR/BILLING/COLLECTION IMPACT:** preserved. **CRITICAL:** Do NOT swap the backend — it would destroy 368 passing tests + verified solar/settlement/tenancy.

---

## 2. FAILURE-FAMILY ANALYSIS (why runtime issues weren't caught earlier)

| Issue | First Introduced | Why Not Caught Earlier | Missing Check | Permanent Prevention |
|-------|-----------------|------------------------|---------------|----------------------|
| FE→BE wrong API base (:3131 vs :3003) | build-time env | no browser/network assertion in gates | API-route assertion per profile | Playwright asserts portal calls only :3003 |
| stale .next/.next-portal chunks | incremental builds | no build-integrity check | verify baked API base after build | post-build chunk scan for wrong port |
| first-render profile ambiguity | P57 root page | only API-level tests, no SSR render check | browser first-paint test | assert data-profile on first render |
| auth 401 after login | token not persisted | no browser login-flow test | browser auth test | Playwright login + data-fetch test |
| services killed with tool process | cmd `start` child | no persistence test | process-survival test | Boot.cmd (WMI detach) + 60s survival check |
| portal areas 404 | portal mounts missing /locations | no portal route coverage | portal endpoint test | Playwright portal + full endpoint list |
| fake "RUNNING" banner | MeterVerse.cmd | banner without probe | health-probe gate | Boot.cmd probes before OK |

**PERMANENT CORRECTION RULE (add to AI_MAIN_MEMORY):** Every FE/BE integration milestone must include a Playwright browser test that (1) logs in, (2) captures API call statuses, (3) asserts no 4xx/5xx, (4) verifies the API base is profile-correct (portal→:3003, admin→:3131), and (5) survives a page reload. Every runtime tool must PROBE before claiming RUNNING.

---

## 3. VERIFIED CURRENT STATE (P60 baseline)

- **Services:** Admin BE:3131, Admin FE:3535, Portal BE:3003, Portal FE:3030 — all UP, **persist 60s+ detached** (Boot.cmd).
- **Browser:** Admin = 13 API OK / 0 err · Portal = 7 API OK / 0 err (SITE OK both).
- **Data:** 223 customers, 277 meters, 361 readings, 116 invoices, 53 payments (P59-B 639 frozen untouched).
- **Tests:** 368 backend (350 pass/18 skip) · FE tsc 0 · Graph 12/0/0 · SpecKit 19/19.
- **Collection decision:** C — HYBRID REUSE (logic recovered; backend NOT swapped).
- **Git:** main @ 9bdcf3fd, clean, pushed, GitHub-confirmed.

## 4. KNOWN REMAINING BLOCKERS
- OBIS approval (STATE 2) · Import EXECUTE (STATE 2) · P59-B #2–#6 (STATE 2) · Wave 4 LOCKED.
- Chilled-water/CurrencyType/POS = evidence-gated recoveries (not blocked by approvals).
- Project tenancy absent (14 projects unenforced) · backend→D:\meter\src cross-project import (documented, functional).
