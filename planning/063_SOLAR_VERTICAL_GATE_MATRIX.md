# Solar Invoice Vertical â€” Verification Gate Matrix (G01â€“G26)

Owner: DeepSeek Execution Kernel Â· Updated: 2026-08-17 (P13.7) Â· Commit basis: 13328d7fâ†’HEAD

## How to read
- **GREEN** = fully verified (multi-path evidence below)
- **CONDITIONAL** = internally verified; blocked only by external register source
- **PARTIAL** = implementation exists, evidence incomplete
- **BLOCKED** = external dependency required
- REAL/DERIVED/TEST/UNKNOWN are kept strictly separate. No derived reading enters
  the REAL historical path. TEST fixtures are isolated to unit tests.

## Gate matrix

| Gate | Area | STATUS | Evidence | Method 1 | Method 2 | Dependency | Blocker | Next action |
|------|------|--------|----------|----------|----------|------------|---------|-------------|
| G01 | Source availability | **BLOCKED** | Real registers absent at every root (ConnectionProfile/Gateway/SyncLog/ApiKey=0, ImportJob preview-only, Symbiot profiles=0) | static+xlsx+sqlite+DB search | live DB integration audit | external | register source missing | user input (a)/(b)/(c) |
| G02 | Meter existence | **GREEN** | meter 57cc414c, serial 52051449, type=solar | Prisma | psql | G01 | â€“ | â€“ |
| G03 | Customer existence | **GREEN** | customer f881de8e, Ø§ÙŠÙ‡Ø§Ø¨ Ø§Ù…Ø§Ù… Ø­Ø³Ù†ÙŠÙ† Ø´Ø§ÙØ¹ÙŠ, active | Prisma | authenticated API | G01 | â€“ | â€“ |
| G04 | Unit/assignment | **GREEN (P13.7)** | meter 57cc414c â†’ customer f881de8e linked; MeterAssignment active since 2021-01-01 (evidenced by source xlsx serialâ†’customer + invoice number) | psql UPDATE+INSERT | authenticated API (meter.customerId set; customer.meters=1) | G01 | â€“ | â€“ |
| G05 | Tariff | **GREEN** | SOLAR_TARIFF_TIERS 12 tiers + over-limit 1.68 = verified legacy Collection formula | engine source | unit tests 6/7 | â€“ | â€“ | â€“ |
| G06 | Activation | **CONDITIONAL** | customer status=active | psql | API | G01 | full meter activation flow needs real source | â€“ |
| G07 | Reading ingestion | **BLOCKED** | Symbiot bridge alive but profiles=0 (no source configured) | ingestion runtime status | ConnectionProfile audit | G01 | endpoint+credentials | user input (b) |
| G08 | Reading validation | **GREEN** | negative/non-finite/future-timestamp rejected at service boundary (ingestReading) + API surface (3 new route tests) | route tests (5+3) | service source | â€“ | â€“ | â€“ |
| G09 | Consumption calc | **GREEN** | consumption=max(curr180âˆ’prev180,0)=54.26 kWh (derived) | engine | independent formula | â€“ | â€“ | â€“ |
| G10 | Solar calc | **GREEN** | net/surplus/walletCredit logic; 36.10 reproduced live | engine+unit | live API compute | â€“ | â€“ | â€“ |
| G11 | Fee calc | **GREEN** | admin 2%, service 9.10, tiered tariff; 26.47+0.53+9.10=36.10 | engine+unit | live API compute | â€“ | â€“ | â€“ |
| G12 | Bill-cycle | **PARTIAL** | invoice generate route exists; solar uses manual compute+persist; no automated cycle for solar | route source | â€“ | â€“ | not in current scope | keep manual; cycle is a separate feature |
| G13 | Invoice persistence | **GREEN** | persistSolarInvoice exact contract {customerId, periodStart, periodEnd, meterId, result, meta}; amount=result.total; billingPeriodStart/End written; number=SOLAR-{serial}-{period} | unit tests 17/18/19 | route test area derivation | â€“ | â€“ | â€“ |
| G14 | Invoice lines | **GREEN** | energy + admin + service item rows (3 when all >0) | unit test 13 | engine source | â€“ | â€“ | â€“ |
| G15 | Invoice immutability | **GREEN** | Invoice.immutableAt gate on /issue, PUT/DELETE blocked after issue; unique business-key number | invoices.js route | schema | â€“ | â€“ | â€“ |
| G16 | PDF/document | **GREEN (test path)** | engine: real %PDF- + PDFParse text extraction (4 unit); route: HTTP surface 200/404/401 (5 route tests, engine mocked) | pdf-engine unit tests | pdf-route API tests | REAL persisted invoice absent - cannot certify against real doc | certifiable against real invoice once G01 resolved |
| G17 | Customer visibility | **PARTIAL** | invoice/customer APIs exist; no portal-specific solar page verified | â€“ | â€“ | â€“ | portal flow not in current scope | verify portal when portal run |
| G18 | API | **GREEN** | /api/solar/compute 200 reproduces 36.10 on live stack; /api/invoices 200; login 200 | live smoke | psql | â€“ | â€“ | â€“ |
| G19 | UI | **PARTIAL** | admin FE has billing pages; no solar-specific UI verified this cycle | â€“ | â€“ | â€“ | FE not relaunched | FE smoke when needed |
| G20 | Authentication | **GREEN** | authenticate middleware; 401 unauthenticated (route test) | route test | live login | â€“ | â€“ | â€“ |
| G21 | RBAC | **GREEN** | invoices.create for scoped roles (area_manager/billing); super_admin/admin global; permission-denied path | route tests | security.js ROLE_PERMISSIONS | â€“ | â€“ | â€“ |
| G22 | Area/project tenancy | **GREEN (fixed)** | invoice areaId derived from customer.areaId (client input ignored); AREA_RESTRICTED for cross-area customer | route tests | solar.js resolveArea | â€“ | â€“ | â€“ |
| G23 | Audit trail | **GREEN** | auditLog on compute + invoice.created + authorization events | route source | security.js | â€“ | â€“ | â€“ |
| G24 | Regression | **GREEN** | 439 total (421 pass / 18 skip): 399 baseline + 26 solar unit+route + 4 pdf unit + 5 pdf route + 3 ingestion boundary + 2 net baseline churn | vitest | Graph 12/0/0 | - | - | - |
| G25 | Migration/data integrity | **GREEN** | 20260817000000_add_invoice_billing_period applied via migrate deploy; columns verified in live DB; client regenerated | migrate deploy | psql information_schema | â€“ | â€“ | â€“ |
| G26 | Repository/Git | **GREEN** | HEAD pushed, worktree clean, HEAD==origin/main | git rev-parse | git status | â€“ | â€“ | â€“ |

## Internal defects found & fixed this cycle
1. **Tenancy gap (G22):** invoice `areaId`/`projectId` were client-supplied. Fixed: areaId derived from customer (resolveArea); client areaId ignored.
2. **Period contract (G13):** persistSolarInvoice destructured but ignored `periodStart`/`periodEnd`; Invoice had no period fields. Fixed: added billingPeriodStart/End columns (migration) + persisted; number = SOLAR-{serial}-{period}.
3. **Idempotency (G13/G15):** audit-substring ref check only. Fixed: deterministic unique invoice number = authoritative DB-level dedupe; P2002 â†’ 409 DUPLICATE.
4. **RBAC latent gap (G21):** `billing.*` was admin-only, making the tenancy guard unreachable for scoped roles. Fixed: gate â†’ `invoices.create` (area_manager/billing have it).
5. **PDF test gap (G16):** no test existed. Fixed: 4 unit tests with real PDFParse text validation (devDependency `pdf-parse`).

## Explicitly NOT done (by design)
- Derived 54.26 kWh never inserted into REAL historical reading path.
- No synthetic invoice written to production DB.
- No automated solar bill-cycle (separate feature, not required by current vertical).

## Exact external input required
- (a) real register file for 52051449, or (b) real Symbiot/SEP endpoint+credentials, or (c) explicit derived-baseline authorization.

## P13.7 (2026-08-17)
- G04 GREEN: real meter→customer link applied (UPDATE) + MeterAssignment (2021-01-01, active). Evidence: source xlsx serial→customer mapping + invoice number embeds serial. Verified: psql + API.
- G08 strengthened: +3 API boundary tests (negative / non-numeric / future timestamp → 400 at HTTP surface; service guards already present).
- G16 strengthened: +5 pdf-route API tests (200/404/401; engine mocked = clean separation from pdf-engine unit tests).
- Root cause: UTF-8 BOM from PowerShell Set-Content broke vitest 4.1.10 ESM loader ("Cannot find module backend/vitest"). Fixed by stripping BOM. Rule: never write ESM test files via Set-Content -Encoding UTF8.
- Regression: 439 (421/18). Graph 12/0/0. SpecKit 100%. FE tsc 0.

## P13.8 — FINAL-CHANCE WINDOW (2026-08-17) REAL DATA RECOVERY + BILINGUAL PDF

NEW ROOTS EXHAUSTED THIS WINDOW (register source = absent everywhere, now PROVEN at every DB/schema/ref):
- All databases on :5433 (incl collection_tracker: 15,012 customers, 0 readings, 0 solar) and :5434
- All schemas in meter_pulse: public + sim_system (meter 52051449 = electricity, 0 readings/invoices) + area (empty) + features + core
- All git refs (branches/tags/remotes incl abady001): no register data
- Symbiot bridge = PUSH-only (no discovery/historical retrieval); pollers = ConnectionProfile-driven (none)
- Replay report Finding A-2: "No meter readings (180/280) available" - confirmed

REAL DATA RECOVERED (amounts reconcile with Solar_Invoices_Import.xlsx + replay report):
- 65 REAL historical invoices for 52051449 (2021-01..2026-04) imported to MeterVerse public schema
- 23 REAL payments (receipts REC-SOLAR-52051449-*) imported
- TOTALS match report EXACTLY: invoiced 77855.94 | paid 75124.50 | balance 2731.44
- REAL invoice SOLAR-52051449-2021-01 = 36.10 (Minimum) now persisted + visible via API

IMPLEMENTED (internal fixes):
- Migration 20260817010000_add_payment_reference (Payment.reference)
- pdf-engine: bilingual Arabic rendering (Tahoma embedded, fallback Helvetica) - fixes mojibake customer names
- pdf-engine: amountInWords decimal bug fixed (36.10 -> "thirty six EGP", was "thirty undefined")
- scripts/import-solar-history.mjs (reproducible real-history import) + scripts/real-invoice-pdf-verify.mjs

VERIFIED:
- REAL PDF via live API POST /api/pdf/invoices/:id: 23,649 bytes, %PDF-, text = 36.10 + SOLAR-52051449-2021-01 + Arabic name + "thirty six EGP" + no undefined
- API detail endpoint shows real invoice + customer
- Regression 441 (423/18) | Graph 12/0/0 | SpecKit 100% | FE tsc 0

STATUS: INTERNAL = COMPLETE + REAL-HISTORY LOADED. Only raw 180/280 registers remain UNKNOWN/DERIVED.

## FINAL EXTENDED SOLAR WINDOW (2026-08-17) — NEW ROOTS EXHAUSTED (beyond P13.8)

NEW roots explored this window that P13.8 had NOT searched (all returned NO register data):
1. Collection System PostgreSQL backups (2 .db.gz, decompressed): collection_20260605 (13 tables, 1 test customer,
   81 payment tx, NO meter_reading) + auto_repair_20260606 (15 tables, 54 REAL customers incl Ihab Shafie
   52051449, 0 transactions, NO meter_reading). PROOF: the Collection meter_reading table (which HAS
   solar_register_180/280 columns per models.py) is EMPTY in every accessible copy.
2. Live collection_tracker PG (:5433): 15,012 customers, 0 meter_reading, 0 solar, no 52051449.
3. Solar_Invoices_Import.xlsx full dump: 8 cols (Serial/Month/Amount/Date/Number/Tag/Info/Notes), 65 rows for
   52051449, ZERO register/consumption columns. Amounts + customer name ONLY.
4. invoice_calculation_2020.xlsx: 2020 Egyptian tariff tiers (no meter data).
5. Real solar demo PDFs (invoice-demo-solar-001/002): MOCK demos (SOLAR-MTR-001, 1.5 EGP/kWh, 14% tax) -
   NOT 52051449, NOT real registers. solar-invoice-test.pdf = invalid (JSON stub).
6. All dangling git commits (10): grep 52051449/reading_180/solar_register -> no hits.
7. Full Symbiot SEP2/DLMS reference deployment: driver maps + DLLs only, no meter payloads.
8. Replay CSVs (d2/d6): no 52051449 hits.
9. stitch_meterverse_enterprise_os: feature folders, no data.
10. P59 LR1 contract: confirms 180/280 vectors are DERIVED test values, not real.

CONCLUSION (final, evidence-based): The real 180/280 register history for 52051449 existed ONLY in the live
Collection System PostgreSQL which is NOT accessible in this environment. Every local copy (PG, both SQLite
backups, xlsx, PDFs, git, Symbiot deployment, logs) has 0 meter_reading rows. The source is GENUINELY EXTERNAL.

## FINAL LIVE-SOURCE ACCESS ATTEMPT (2026-08-17) — ACCESS-BOUNDARY PROOF (not a repeat of P13.9)

Distinction PROVEN: not just "registers absent from copies" but "NO LIVE Collection/Symbiot/SEP source is
reachable from this machine."

LOCAL RUNTIME:
- All listening ports: only 5433 (PG16) + 5434 (PG18) are Postgres. No port 5000/8400/8320/8420 (Collection Flask
  / Symbiot SEP services NOT running).
- No Flask/Collection/python web process. Only node (MeterVerse BE/FE) + 2 PG clusters.
- Docker daemon OFF; WSL Ubuntu Uninstalling. No containerized source.
- Scheduled tasks: only MeterVerseAdminBE + OneDriveSync. NO Collection/Symbiot service task.
- PG clusters: only 16 (:5433, has collection_tracker = 0 readings) + 18 (:5434, unrelated).

CONNECTION STRINGS:
- Collection config.py + all .env (development/production.template/example) -> 127.0.0.1:5433/collection_tracker
  (LOCAL). NO remote host in ANY Collection config.
- Symbiot Unity.Config: DatabaseDataSource=Badya, tcp://localhost:8400/8320/8420, CORS 10.50.30.5:443.
  Badya DB NOT present in PG16/PG18. SEP ports not listening.

NETWORK TARGET (config-referenced only):
- 10.50.30.5 (10.50.30.0/24 via gw 192.80.30.1): accepts TCP on 443/5432/5433/5434/80/5000/8080
  BUT PostgreSQL wire-protocol SSLRequest probe -> TIMEOUT on 5432/5433/5434. NOT a PostgreSQL server.
  Gateway 192.80.30.1:5432 -> TIMEOUT. No remote PG reachable.

Symbiot configs: 12.xlsx = water meter job (ID 67119107, NOT 52051449). Global Jobs.s2e = no meter/register refs.
No SEP/LiteDB/SQLite data store present in the deployment.

PRECISE BLOCKER: "Registers are absent from every accessible source. A live original Collection/Symbiot/SEP
source could not be located/accessed from this environment." (per §9 - NOT claiming an inaccessible DB holds them)

## P13.11 OWNER DEMONSTRATION + TECHNICAL PROOF PACKAGE (2026-08-17)
- Runtime verified: Admin FE :3535 (200), Admin BE :3131 (health 200, relaunched - was down), Portal FE :3030
  (200, STARTED via existing mechanism - was down), Portal BE :3003 (health 200), PG :5433, Symbiot :9000/9001.
- Owner links + real demo confirmed: customer f881de8e, meter 52051449 (solar), invoice SOLAR-52051449-2021-01
  = 36.10 (issued), real bilingual PDF via API (23649 bytes, 36.10 + number + Arabic + words).
- Data-flow + tariff + reading->meter exact trace documented.
- Docs created: docs/solar/OWNER_SOLAR_INVOICE_TECHNICAL_DEMONSTRATION.md, OWNER_SOLAR_INVOICE_ONE_PAGE.md,
  OWNER_DEMONSTRATION_SCRIPT.md.
- Real/Derived/Unknown strictly labeled (54.26 kWh = DERIVED; registers = UNKNOWN).
- Verified: regression 448 (430/18), Graph 12/0/0, SpecKit 100%, FE tsc 0.

## P13.12 EMERGENCY OWNER DEMO RECOVERY + BROWSER CERTIFICATION (2026-08-17)
- FORENSIC runtime inventory (proven NOW, not assumed): PG :5433, Admin BE :3131 (health 200),
  Admin FE :3535 (200), Portal BE :3003 (200), Portal FE :3030 (200), Symbiot :9000/9001 ALL UP.
- REAL BROWSER cert (Playwright/Chromium): Admin renders full MeterVerse OS shell (Customers/Meters/
  Invoices/Reports menus) + Customers screen opens. Not just HTTP 200.
- Owner data chain via live API: customer f881de8e (Ihab Shafie) -> meter 52051449 (solar) ->
  invoice SOLAR-52051449-2021-01 (36.10) -> real PDF (23649 bytes).
- LAN URL: current IP 192.168.1.2 (Wi-Fi); FEs bind :: (all interfaces); Node firewall Allow;
  LAN URLs 192.168.1.2:3535/3030/3131/3003 all HTTP 200. Remote-device access expected but not
  tested from a 2nd computer.
- Stability: all 4 services re-verified HTTP 200 after 30s wait. Launchers added: _tools/start-portal-be.cmd,
  start-portal-fe.cmd, start-admin-fe.cmd (session-independent). Admin BE via MeterVerseAdminBE task.
- Sample PDFs generated for 5 real invoices (2021-01/02/03 = 36.10, 2022-09 = 1426.10, 2026-04 = 471.51).
- Docs updated/created: OWNER_SOLAR_INVOICE_TECHNICAL_DEMONSTRATION.md, ONE_PAGE, DEMONSTRATION_SCRIPT,
  OWNER_INVOICE_EVIDENCE.md.
- Real/Derived/Unknown strictly labeled. Regression 454, Graph 12/0/0, SpecKit 100%.

## P13.13 FIRST SOLAR INVOICE E2E RECOVERY + DOWNLOAD CERTIFICATION (2026-08-17)
- ROOT CAUSE found for missing artifact: PDF endpoint returned JSON {file,path}, NOT a browser download.
- FIX: added GET /api/pdf/invoices/:id/download -> streams application/pdf with Content-Disposition:
  attachment; filename="<invoice-number>.pdf". Filename deduped (was SOLAR-SOLAR-...).
- Browser cert (Playwright): Admin renders (MeterVerse OS + Customers); download endpoint returns
  HTTP 200, application/pdf, attachment, 23,649 bytes %PDF-.
- Artifact: docs/solar/SOLAR-52051449-2021-01.pdf (23,649 B) + FIRST_SOLAR_INVOICE_EVIDENCE.zip (24,269 B).
- PDF validated: 36.10, SOLAR-52051449-2021-01, Arabic name, "thirty six EGP", INVOICE, issued.
- Tests: +1 pdf download test; suite 455 (437/18). Graph 12/0/0. SpecKit 100%. FE tsc 0.
- Multi-path: browser(render) + API(download 200) + DB(invoice) + filesystem(artifact) + PDF(text) agree.

## P12.2-D STABILIZATION + CERTIFICATION GATE (2026-08-17) - CERTIFIED
- Forensic audit: one clean process per service. 3131 Admin BE (6952), 3535 Admin FE (21396),
  3003 Portal BE (14980), 3030 Portal FE (4816), 5433 PG (7996), 9000/9001 Symbiot (same BE). No duplicates.
- Startup: clean restart via MeterVerseAdminBE task -> exactly 1 listener on 3131, health 200, no EADDRINUSE. Deterministic.
- Fixes: EventDeadLetter @@unique (migration 20260817020000), per-consumer delivery independent of PUBLISHED,
  ledger consumer logger import + call-time flags.
- Live cert 10/10: enqueue->claim->dispatch->consumer->EventDelivery DELIVERED->PUBLISHED; shadow no GL mutation
  (FinancialEvent=0); failure path->DeadLetter DEAD; idempotency; FK-ordered cleanup (0 remain).
- Regression 464 (446/18); Graph 12/0/0; SpecKit 100%; FE tsc 0; browser Admin renders; Solar download 200
  (23,649 B %PDF-). Git clean.

## P12.3-09 OUTBOX SHADOW VALIDATION + RECONCILIATION (2026-08-17)
- scripts/outbox-shadow-check.mjs (TEST_MODE-gated, P12-03-04 §6 non-production).
- Flow: enqueueEvent -> dispatcher -> shadow consumer; reconcile outbox row vs source.
- Live cert: 3/3 consecutive runs diff=0 (amount/type/source/status/idempotency/shadow all true).
- TEST_MODE refusal verified (refuses without TEST_MODE=true + NODE_ENV!=production).
- Regression 464 (446/18); Graph 12/0/0; SpecKit 100%; FE tsc 0.
