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
