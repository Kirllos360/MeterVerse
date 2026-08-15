# P61 — COLLECTION SYSTEM CONVERGENCE: FORENSIC COMPARISON + ARCHITECTURAL DECISION

**Date:** 2026-08-15 · **HEAD:** bb74c045 → (P61 commits) · **Mode:** forensic, dependency-aware, runtime-certified

---

## 1. CONTINUITY

- Previous gate: P60 (C-Hybrid reuse decision) → P61 (execution acceleration + convergence + runtime cert)
- All 4 services UP: admin BE:3131, admin FE:3535, portal BE:3003, portal FE:3030

## 2. THE ARCHITECTURAL QUESTION (answered with repository evidence)

> "Use the Collection System backend/business implementation as the functional backend foundation while using the MeterVerse Next.js frontend and MeterVerse enterprise experience."

**ANSWER: NO — the Collection System backend cannot be the functional foundation. PARTIAL — its business logic can (and has been) reused through adapters.**

### Evidence (from forensic inventory):

| Question | Evidence | Verdict |
|----------|----------|---------|
| Can Collection backend logic run independently? | Flask 3.x + SQLAlchemy app factory (`create_app`), 15 registered route modules | YES (it runs standalone) |
| Can its database layer be separated? | SQLAlchemy models tightly coupled to `db` (flask_sqlalchemy); 57 models; no repository layer | **NO — ORM-bound** |
| Can its business services be exposed via MeterVerse APIs? | `charge_engine.py`, template import logic, solar wallet = pure-ish modules, but reachable only through Flask views; no service layer abstraction | PARTIAL — needs extraction |
| Can MeterVerse frontend consume them safely? | MeterVerse FE is Next.js → calls JSON REST (Express :3131/:3003). Flask returns Jinja HTML pages + some JSON (`/api/v1`); **MeterVerse FE would need a Flask JSON bridge** | PARTIAL — would add a second backend contract |
| Shared tables? | **NONE.** Collection uses `collection_tracker` DB with `area_october`/`area_new_cairo`/`area_sodic_*` schemas; MeterVerse uses `meter_pulse` with single Prisma schema | NO shared tables |
| Conflicting tables? | Same logical entities (Customer, Meter/Transaction, Reading, Invoice) but **different physical schemas, column names, PKs (UUID vs int), no FK on CustomerMeter.customer_id** | HIGH conflict — would require full migration |
| Identity/auth conflicts? | Collection: flask-login **session cookies** + X-API-Key + TOTP MFA. MeterVerse: **JWT Bearer + RBAC + area scoping** | **INCOMPATIBLE** |
| RBAC conflicts? | Collection: ROLE_HIERARCHY (6 levels) + 27 features + groups + custom roles. MeterVerse: requirePermission + RBAC roles | Different models; MeterVerse is the stronger/safer gate |
| Tenancy conflicts? | Collection: `area` string + 8 per-area schemas (`SET search_path`). MeterVerse: `areaId` FK + `requireAccess` fail-closed (P59-B 4A/4B) | **Incompatible; MeterVerse scoping is stricter** |
| Migrations required? | Single alembic (destructive/drop-heavy) + runtime `db.create_all()` + schema cloning; MeterVerse uses Prisma migrations | Full rewrite-level migration |
| Legacy deps? | pandas, openpyxl, fpdf2, flask-login, redis, psycopg2, pyotp, qrcode, nssm, waitress | Python stack isolated from Node |
| Flask/Python deps isolatable behind adapters? | YES for pure logic (`charge_engine`, import parsing) — but ONLY as extracted JS/TS or a Python microservice | PARTIAL |
| Would using them create debt? | **YES — dual-backend (Express + Flask), dual-auth, dual-DB, dual-schema** = permanent parallel maintenance | HIGH DEBT |
| Would it accelerate delivery? | **NO — the Collection business logic is ALREADY ported** (P59-C LR-1..LR-7: settlement, solar wallet, cheque, import-engine with solar_customers/solar_invoices/solar_payments, charge types per_unit/zero) | NO acceleration gain |
| Reduce or increase risk? | **INCREASE** — two auth systems, two tenancy models, two DBs = new attack surface | INCREASE |
| Incremental? | No clean seam (ORM + Jinja + session auth coupled) | NO |
| Rollback? | Would require dropping/restoring the Flask stack + migrated data | Complex |
| Both systems coexist? | YES today (Collection reference is read-only; MeterVerse is the live system) | Coexist fine |
| Collection backend as a domain service? | Only if extracted as isolated Python microservice (SEP/settlement) behind a thin bridge — NOT "the functional foundation" | Possible, not now |
| MeterVerse progressively replace Collection FE? | **Already done** — MeterVerse IS the replacement (real data, live browser-certified) | DONE |

### CONCLUSION (Decision: **C — HYBRID REUSE, already in-flight**)
- **REJECT** the Flask backend as the foundation (dual-stack debt, incompatible auth/tenancy/DB).
- **REUSE** proven Collection business LOGIC via the already-built MeterVerse-native services.
- Collection-specific components still worth extracting (evidence-gated): chilled-water settlement, CurrencyType/POSTerminal, template system parity.

## 3. COMPONENT CLASSIFICATION (all 6 categories used)

| Component | Collection location | MeterVerse equivalent | Classification | Reason | Evidence |
|-----------|--------------------|----------------------|----------------|--------|----------|
| Flask app factory / Jinja views | app/__init__.py, templates/ (79) | Next.js App Router pages | **REJECT** | Server-rendered HTML vs Next.js SPA/SSR; dual-frontend debt | routes return HTML |
| SQLAlchemy models (57) | app/models.py | Prisma schema (189 models) | **REJECT** (logic reused) | ORM-bound, no repo layer | CustomerMeter no FK, Transaction-as-invoice |
| charge_engine.py (STEPS/FLAT/STATIC/PER_UNIT/ZERO) | app/charge_engine.py | business-engine.js (per_unit/zero) | **REUSE WITH ADAPTER** | Pure tariff math, already ported | P59-C tests, business-engine.js |
| settlement engine (FIXED/PERCENTAGE/ONE_TIME) | app/charge_engine.py | settlement-engine.js | **REUSE WITH ADAPTER** | Pure math, already ported | settlement-engine.js + tests |
| solar wallet (CREDIT/DEBIT/ADJUSTMENT, 1.8.0/2.8.0) | SolarWalletTransaction, Customer.solar_balance | solar-wallet-engine.js | **REUSE WITH ADAPTER** | Already ported | solar-wallet-engine.js |
| solar invoice calc (tariff table, admin fee 2%, service fee 9.10) | routes_admin.py /solar | solar.js /compute + /invoices | **REUSE WITH ADAPTER** | Already ported | solar.js |
| cheque lifecycle | Cheque model | cheque-engine.js | **REUSE WITH ADAPTER** | Already ported | cheque-engine.js |
| template upload/download (invoice/meter/readings/payment/customer) | routes_import.py | templates.js + imports.js + import-engine.js | **MIGRATE** | Parsing logic reusable; storage currently in-memory only | import-engine.js solar_customers/invoices/payments |
| solar Excel import | routes_import.py /solar/upload + templates | import-engine.js (solar_customers/invoices/payments) | **MIGRATE** | Already ported with integrity/tests | LR-5/LR-6 |
| customer→meter view | routes_customers.py /customers/<id>/monthly | customers.js GET /:id + meter-assignments.js | **REUSE WITH ADAPTER** | Same business intent; MeterVerse uses FK-based assignment | customers.js + meter-assignments.js |
| add-data one-by-one hub | routes_add_data.py (9 actions) | meters.js POST / + readings.js POST / + solar.js | **REIMPLEMENT (cleaner)** | Collection stores readings as notes-embedded Transactions (hazard); MeterVerse has structured Reading rows | add_data_handle stores notes |
| add meter / add reading / add solar reading | routes_add_data.py | meters.js POST, readings.js POST, solar.js /compute | **REIMPLEMENT (already done)** | MeterVerse has proper CRUD + RBAC + tenancy | routes verified |
| invoice generation (auto-invoice) | routes_readings.py .../invoice | billing.js + settlements.js + invoices.js | **REUSE WITH ADAPTER** | Same charge+settlement math; MeterVerse has structured Invoice | invoices.js |
| invoice PDF | fpdf2 (routes_transactions.py) | pdf.js (pdfkit/pdf-engine) | **REUSE WITH ADAPTER** | MeterVerse pdf-engine generates PDFs; Collection fpdf2 rejected | pdf.js, pdf-engine.js |
| auth (flask-login session) | extensions.py + routes_auth.py | auth.js (JWT + RBAC) | **REJECT** | Session vs JWT; MeterVerse stricter | auth.js |
| RBAC (27 features) | User.get_effective_permissions | requirePermission + roles | **REUSE WITH ADAPTER** | Concept reused; MeterVerse implementation stronger | security.js |
| tenancy (area schemas) | AREA_SCHEMAS + search_path | areaId FK + requireAccess | **REJECT** | MeterVerse fail-closed tenancy wins (P59-B) | security.js requireAccess |
| audit logging | AuditLog + routes_auth | audit middleware (AuditEntry) | **REUSE WITH ADAPTER** | Already present, stronger | server.js, P59-B |
| Excel export | openpyxl (routes_reports.py) | reports.js + export routes | **REUSE WITH ADAPTER** | Already present | reports.js |
| chilled-water settlement | ChilledWaterConfig/Settlement + test_chilled_settlement.py | none (NEEDS EVIDENCE) | **NEEDS EVIDENCE** | Evidence-gated (LR-1); requires business decision | test_chilled_settlement.py |
| CurrencyType / POSTerminal | CurrencyType, POSTerminal models | none | **NEEDS EVIDENCE** | Evidence-gated; needs schema decision | models.py |
| water balance (main/child diff) | WaterBalance model | (not seen) | **NEEDS EVIDENCE** | Verify MeterVerse equivalent before class | schema |
| SIM lifecycle | SIMCard model | sim.js + sim-assignment | **REUSE WITH ADAPTER** | Already present | sim.js |
| template parsing bilingual fallback | routes_import.py row.get(AR,EN) | import-engine.js column spec | **REUSE WITH ADAPTER** | Porting pattern confirmed | import-engine.js |

## 4. SMALLEST SAFE REUSE UNIT

The smallest proven reusable units are the **calculation/parsing engines** (charge, settlement, solar wallet, import) — NOT the Flask architecture. These are already in MeterVerse as JS services. The only remaining **safe extraction candidate** is the **chilled-water settlement calculation** (pure math, evidence-gated).

## 5. WHAT IS NOT YET IN METERVERSE (genuine gaps from this forensic pass)

1. **Chilled-water settlement** (Config + DRAFT/APPROVED/PAID + carry-forward + versioned edit + blocked-if-invoice) — NOT in MeterVerse. Evidence: `test_chilled_settlement.py` documents the exact algorithm.
2. **Template parity** — Collection has 9 downloadable fillable templates (customer/payment/solar/chilled/invoice/meter/readings); MeterVerse has imports/upload + templates.js (key-value templates) but **not** a downloadable-fillable-template generator set.
3. **Water balance (main/child meter differential)** — model exists in Collection; MeterVerse equivalent unverified.
4. **Reading-as-notes legacy (Transaction notes `1.8.0:`/`2.8.0:`)** — Collection hazard pattern; MeterVerse intentionally does NOT copy this (structured Reading). Good.

---

*(Next sections: runtime certification, tests, graph/speckit, git, governance — appended during execution)*

## 6. RUNTIME CERTIFICATION (P61 execution)

| Workflow | Before | After (P61) | Evidence |
|----------|--------|-------------|----------|
| Add Data page | MOCK (setTimeout, "Alpha/Beta/Gamma" entities) | **REAL** — live entity search, real forms, real submit → DB | Browser: 13 API OK/0 err; reading 9988.5 persisted (Reading 361→362) |
| Upload Center | static drop-zone only | **REAL** — import type picker (solar_customers/invoices/payments), file upload → preview (valid/invalid), recent jobs list | Browser: 9 API OK/0 err; 422 on wrong-template = correct validation |
| Upload auth | FormData fetch sent no Bearer → 401 | **FIXED** — exported getAuthHeaders, attached to upload fetch | 401 gone; upload reaches backend |
| customer→meter view | live | live (verified) | customer detail returns meters[] via assignment |
| template import types | live (backend) | live (FE now exposes) | imports/types = solar_customers/invoices/payments |
| execute import | — | BLOCKED (P59-B Import EXECUTE approval) | approval-gated |

## 7. TEST RESULTS (P61 gate)

- Backend: 368 (350 pass / 18 skip)
- FE tsc: 0 errors
- Graph: 12 pass / 0 fail / 0 warn
- SpecKit: all checks passed
- Browser: Admin 13 API OK / 0 err; Portal SITE OK / 0 err
- DB safety: P59-B fingerprint intact (223/277/116/53 + Settlement 3 + ImportJob 2); Reading 361→362 = single controlled add-data test record

## 8. GIT
- Commits: [P61 commits]
- HEAD = origin/main, clean

## 9. FINAL CERTIFICATION
- **CERTIFIED — NO KNOWN UNRESOLVED FAILURE WITHIN THE TESTED SCOPE**
- Known blockers (approval-gated, NOT failures): Import EXECUTE, OBIS, P59-B #2–#6, Wave 4
- Known debt (documented, separate from blockers): chilled-water settlement, CurrencyType/POSTerminal, downloadable fillable templates parity (Collection had 9; MeterVerse has upload+preview not download-fillable), water-balance model unverified
- UNKNOWN/NOT TESTED: full import execute (approval-gated), solar compute invoice generation in UI, PDF download flow in UI
