# Solar Invoice Vertical — Verification Gate Matrix (G01–G26)

Owner: DeepSeek Execution Kernel · Updated: 2026-08-17 (P13.6) · Commit basis: 66dfb747→HEAD

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
| G02 | Meter existence | **GREEN** | meter 57cc414c, serial 52051449, type=solar | Prisma | psql | G01 | – | – |
| G03 | Customer existence | **GREEN** | customer f881de8e, ايهاب امام حسنين شافعي, active | Prisma | authenticated API | G01 | – | – |
| G04 | Unit/assignment | **PARTIAL** | meter has no customerId link; no MeterAssignment for 52051449 | psql | – | G01 | data relationship not yet modeled | link meter→customer (real data op) |
| G05 | Tariff | **GREEN** | SOLAR_TARIFF_TIERS 12 tiers + over-limit 1.68 = verified legacy Collection formula | engine source | unit tests 6/7 | – | – | – |
| G06 | Activation | **CONDITIONAL** | customer status=active | psql | API | G01 | full meter activation flow needs real source | – |
| G07 | Reading ingestion | **BLOCKED** | Symbiot bridge alive but profiles=0 (no source configured) | ingestion runtime status | ConnectionProfile audit | G01 | endpoint+credentials | user input (b) |
| G08 | Reading validation | **GREEN** | negative/future/non-finite rejected (P60.7 §6) | route tests | zod schema | – | – | – |
| G09 | Consumption calc | **GREEN** | consumption=max(curr180−prev180,0)=54.26 kWh (derived) | engine | independent formula | – | – | – |
| G10 | Solar calc | **GREEN** | net/surplus/walletCredit logic; 36.10 reproduced live | engine+unit | live API compute | – | – | – |
| G11 | Fee calc | **GREEN** | admin 2%, service 9.10, tiered tariff; 26.47+0.53+9.10=36.10 | engine+unit | live API compute | – | – | – |
| G12 | Bill-cycle | **PARTIAL** | invoice generate route exists; solar uses manual compute+persist; no automated cycle for solar | route source | – | – | not in current scope | keep manual; cycle is a separate feature |
| G13 | Invoice persistence | **GREEN** | persistSolarInvoice exact contract {customerId, periodStart, periodEnd, meterId, result, meta}; amount=result.total; billingPeriodStart/End written; number=SOLAR-{serial}-{period} | unit tests 17/18/19 | route test area derivation | – | – | – |
| G14 | Invoice lines | **GREEN** | energy + admin + service item rows (3 when all >0) | unit test 13 | engine source | – | – | – |
| G15 | Invoice immutability | **GREEN** | Invoice.immutableAt gate on /issue, PUT/DELETE blocked after issue; unique business-key number | invoices.js route | schema | – | – | – |
| G16 | PDF/document | **GREEN (test path)** | real %PDF- output, PDFParse text extraction (36.10, SOLAR number, customer name, statement) | pdf-engine unit tests (4) | file header+size | – | REAL persisted invoice absent → cannot certify against real doc | certifiable against real invoice once G01 resolved |
| G17 | Customer visibility | **PARTIAL** | invoice/customer APIs exist; no portal-specific solar page verified | – | – | – | portal flow not in current scope | verify portal when portal run |
| G18 | API | **GREEN** | /api/solar/compute 200 reproduces 36.10 on live stack; /api/invoices 200; login 200 | live smoke | psql | – | – | – |
| G19 | UI | **PARTIAL** | admin FE has billing pages; no solar-specific UI verified this cycle | – | – | – | FE not relaunched | FE smoke when needed |
| G20 | Authentication | **GREEN** | authenticate middleware; 401 unauthenticated (route test) | route test | live login | – | – | – |
| G21 | RBAC | **GREEN** | invoices.create for scoped roles (area_manager/billing); super_admin/admin global; permission-denied path | route tests | security.js ROLE_PERMISSIONS | – | – | – |
| G22 | Area/project tenancy | **GREEN (fixed)** | invoice areaId derived from customer.areaId (client input ignored); AREA_RESTRICTED for cross-area customer | route tests | solar.js resolveArea | – | – | – |
| G23 | Audit trail | **GREEN** | auditLog on compute + invoice.created + authorization events | route source | security.js | – | – | – |
| G24 | Regression | **GREEN** | 428 total (399 baseline + 26 solar + 4 pdf − 1 consolidated) — see run | vitest | Graph 12/0/0 | – | – | – |
| G25 | Migration/data integrity | **GREEN** | 20260817000000_add_invoice_billing_period applied via migrate deploy; columns verified in live DB; client regenerated | migrate deploy | psql information_schema | – | – | – |
| G26 | Repository/Git | **GREEN** | HEAD pushed, worktree clean, HEAD==origin/main | git rev-parse | git status | – | – | – |

## Internal defects found & fixed this cycle
1. **Tenancy gap (G22):** invoice `areaId`/`projectId` were client-supplied. Fixed: areaId derived from customer (resolveArea); client areaId ignored.
2. **Period contract (G13):** persistSolarInvoice destructured but ignored `periodStart`/`periodEnd`; Invoice had no period fields. Fixed: added billingPeriodStart/End columns (migration) + persisted; number = SOLAR-{serial}-{period}.
3. **Idempotency (G13/G15):** audit-substring ref check only. Fixed: deterministic unique invoice number = authoritative DB-level dedupe; P2002 → 409 DUPLICATE.
4. **RBAC latent gap (G21):** `billing.*` was admin-only, making the tenancy guard unreachable for scoped roles. Fixed: gate → `invoices.create` (area_manager/billing have it).
5. **PDF test gap (G16):** no test existed. Fixed: 4 unit tests with real PDFParse text validation (devDependency `pdf-parse`).

## Explicitly NOT done (by design)
- Derived 54.26 kWh never inserted into REAL historical reading path.
- No synthetic invoice written to production DB.
- No automated solar bill-cycle (separate feature, not required by current vertical).

## Exact external input required
- (a) real register file for 52051449, or (b) real Symbiot/SEP endpoint+credentials, or (c) explicit derived-baseline authorization.
