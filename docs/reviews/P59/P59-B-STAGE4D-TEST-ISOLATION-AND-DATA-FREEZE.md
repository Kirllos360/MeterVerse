# P59-B STAGE 4D — PRODUCTION-DATABASE TEST ISOLATION + POPULATION FREEZE

**Date:** 2026-08-14
**Phase:** P59-B Stage 4D (test isolation + data freeze — no business repair)
**Baseline commit:** 3c4d66bd → this stage's commit (see git log)
**Security:** requireAccess NULL-scope fail-closed = ACTIVE; P0 tenancy = CONDITIONAL PASS

---

## 1. Executive Summary

The Stage 4C finding was confirmed and PROVEN: the contract/live test suite was writing
NULL-scope test records directly into the **production database** (`meter_pulse`), making
forensic counts unstable (Invoice 108→116, Customer 194→218, etc.).

Stage 4D delivered a **fail-closed test-isolation architecture**:

1. **`backend/src/db-guard.js`** — a dedicated test-mode guard: any process started with
   `TEST_MODE=1` that resolves its database to `meter_pulse` refuses to start (exit 1)
   before Prisma connects.
2. **`backend/src/db.js`** — invokes the guard at module load.
3. **Live-suite guard** — contract (`live-api.test.mjs`, `persistence.test.mjs`) and
   integration suites now **SKIP** (fail-closed) unless `CONTRACT_BASE_URL` points to a
   dedicated test backend. Default run no longer mutates production.
4. **`meter_pulse_test`** — a dedicated test database (187 tables, schema-cloned) on the
   same native PG instance (low-memory friendly — no container stack).
5. **End-to-end proof** — the exact contract suite (56 tests) + integration suite (31 tests)
   that previously polluted production now run against `meter_pulse_test` and **production
   row counts are byte-identical before and after**.

**Frozen authoritative baseline captured:** 635 unique affected records
(285 root + 350 dependent). See §7.

---

## 2. Database Baseline (zero-trust snapshot)

- **PostgreSQL:** 16.4 (native, Visual C++ build 1940, 64-bit)
- **Database:** meter_pulse · **Host:** ::1 · **Port:** 5433
- **Captured:** 2026-08-14 07:06 + re-frozen 07:24 (post-isolation)
- **Git SHA at capture:** 3c4d66bd

| Table | Total | areaId NULL | projectId NULL |
|-------|-------|------------|----------------|
| Customer | 218 | 54 | n/a |
| Meter | 272 | 212 | n/a |
| Reading | 361 | 304 | 361 |
| Invoice | 116 | 16 | 116 |
| InvoiceItem | 56 | n/a | n/a |
| Payment | 53 | 8 | 53 |
| Consumption | 0 | — | — |
| Area | 3 | 0 | n/a |
| Project | 14 | 14 | n/a |
| Zone | 0 | — | — |
| Unit | 0 | — | — |
| User | 7 | — | — |

---

## 3. Stage 4C Count Reproduction

Stage 4C reported 277 root / 350 dependent / 627 total. Reproduction on the live DB at
07:24 shows **the population grew +8** (root 285, dependent 350, total 635) between Stage 4C
and the Stage 4D freeze. Root cause: residual contract-test pollution that landed during
earlier suite runs (before the guard) plus background writers; all such writes are now
blocked from production.

**This is exactly why isolation was mandatory before any business repair.**

---

## 4. Test Database Audit — Suite Matrix

| Suite | Tool | DB | Environment | Mutating? | Isolation (before) | Isolation (after) | Safe now? |
|-------|------|----|------------|-----------|--------------------|--------------------|-----------|
| Unit (tests/unit) | Vitest | **none** (mocked Prisma) | NODE_ENV=test | No | mock-prisma.js | mock-prisma.js (unchanged) | ✅ |
| API (tests/api) | Vitest | **none** (mocked Prisma) | NODE_ENV=test | No | mock-prisma.js | mock-prisma.js (unchanged) | ✅ |
| Contract (tests/contract) | Vitest | **meter_pulse** ← **meter_pulse_test** | NODE_ENV=test | **Yes** | hit :3131 (prod) | CONTRACT_BASE_URL → test BE :3901 | ✅ |
| Integration (tests/integration) | Vitest | **meter_pulse** ← **meter_pulse_test** | NODE_ENV=test | **Yes** | hit :3131 (prod) | CONTRACT_BASE_URL → test BE :3901 | ✅ |
| E2E (Frontend/tests) | Playwright | app-level | dev servers | Mostly no | — | unchanged | ✅ |
| Seed (scripts/seed.js) | Node | configurable | — | Yes (roles/perms) | — | must run with TEST_DATABASE_URL for test DBs | ⚠️ explicit |

---

## 5. Exact Contamination Source (evidence)

**File:** `backend/tests/contract/live-api.test.mjs`
- Header states: *"Tests hit the ACTUAL running backend (port 3002) with real data. No mocks. No stubs. Real requests, real responses, real database."*
- `:256-257` (T023): `POST /api/customers` + `POST /api/meters` — **creates a customer + meter in the live DB** (no cleanup)
- `:270-271` (T023): second POST pair
- `:286` (T024): `POST /api/meters` with `serial: 'T024-MTR-' + Date.now()`
- Evidence rows: customers named `Test Customer` (createdAt 04:14–04:17), meters with `TST-1786679961912` (Date.now()-embedded serials)

**Also:** `backend/tests/integration.test.mjs` (T025) POSTs customers/meters/assignments; `backend/tests/contract/persistence.test.mjs` POSTs + deletes (delete exists but partial).

**Root cause:** suite defaults `BASE = http://localhost:3131` (production backend) with no
transaction rollback, no test-DB requirement, no cleanup for the T023/T024/T025 records.

---

## 6. Production DB Safety Risk

- **HIGH/P0 before this stage:** security + forensic tests mutated production-like data;
  counts unstable; business decisions would be made against contaminated data; repeated runs
  manufactured new ambiguous records.
- **Mitigated now:** live suites skip without an explicit test backend; a test backend cannot
  start against `meter_pulse` in `TEST_MODE=1`; production non-mutation is proven.

---

## 7. Isolation Architecture

Compared: A (dedicated PG test DB) · B (dedicated schema) · C (transaction rollback) ·
D (ephemeral container) · E (fixture DB).

**Selected: Option A — dedicated database `meter_pulse_test` on the same native PG instance.**

Rationale:
- **Real, not nominal isolation** (separate catalog; B is weaker).
- **Low-memory friendly** (no container stack — satisfies 8GB rule; D rejected).
- **Compatible with the existing native PG16** (§9 of spec: prefer a second DB when sufficient).
- **Works with the current architecture** (backend is DB-agnostic via DATABASE_URL).
- C rejected: Prisma has no built-in per-test transaction rollback; risky with server-pool.
- E rejected: would require a full copy anyway and risks fixture drift.

---

## 8. Guard Implementation

### `backend/src/db-guard.js` (new, pure + testable)
- `databaseNameFromUrl(url)` — parses DB name from a postgres URL.
- `isTestMode(env)` — true ONLY on explicit `TEST_MODE=1` (NODE_ENV=test alone is NOT
  sufficient because vitest sets it for ALL tests including mocked ones).
- `assertSafeTestDatabase(env)` — returns an error string if test-mode resolves to
  `meter_pulse`; otherwise null.

### `backend/src/db.js` (modified)
- Calls `assertSafeTestDatabase(process.env)` at module load; `process.exit(1)` on violation,
  BEFORE `new PrismaClient()`.

### Live-suite guard (contract + integration)
- `backend/tests/helpers/live-guard.js` (new): `CONTRACT_BASE_URL` must be explicitly set
  for live suites to run; otherwise they SKIP.
- Applied to `live-api.test.mjs`, `persistence.test.mjs`, `integration.test.mjs`.

### Guard unit tests (new)
- `backend/tests/unit/db-guard.test.mjs` — 6 tests (URL parse, test-mode detection,
  forbidden prod, forbidden via TEST_DATABASE_URL, allowed test DB, allowed normal boot).

---

## 9. Isolation Validation

1. **Guard, 3 live cases:**
   - `TEST_MODE=1` + `meter_pulse` → **exit 1, FATAL** ✅
   - `TEST_MODE=1` + `meter_pulse_test` → **loads** ✅
   - normal boot + `meter_pulse` → **loads** ✅
2. **Unit guard tests:** 6/6 pass.
3. **Contract suite WITHOUT CONTRACT_BASE_URL:** **56 skipped** (fail-closed, no mutation) ✅
4. **Integration suite WITHOUT CONTRACT_BASE_URL:** **31 skipped** ✅
5. **Full positive path:** test BE started :3901 (TEST_MODE + meter_pulse_test, health 200);
   contract 56/56 + integration 31/31 pass against it.

---

## 10. Production Non-Mutation Proof

| Suite run | Before (prod) | After (prod) | Test DB after |
|-----------|--------------|--------------|----------------|
| Contract (56) vs :3901 | 218/272/361/116/53 | **218/272/361/116/53 (identical)** | 5 customers, 5 meters, 1 reading |
| Integration (31) vs :3901 | 218/272/361/116/53 | **218/272/361/116/53 (identical)** | (test rows only) |

The exact suites that previously polluted production now write **only** to `meter_pulse_test`.

---

## 11. Frozen Data Baseline (authoritative, post-isolation)

Freeze timestamp: 2026-08-14 07:24 · Git SHA: (this stage's commit) · DB: meter_pulse

**Mutually-exclusive classification (SQL-reproducible):**

| Class | Count |
|-------|-------|
| C_UNDET_NOMETER (NULL-area customers) | 54 |
| M_A_DERIV (null meter, customer has area) | 57 |
| M_B_NOCUST (null meter, no customer) | 133 |
| M_D_CONFLICT (meter ≠ customer area) | 41 |
| **ROOT total** | **285** |
| M_B_ON_NULLCUST (dependent meters) | 22 |
| NULL_READINGS | 304 |
| NULL_INVOICES | 16 |
| NULL_PAYMENTS | 8 |
| **DEPENDENT total** | **350** |
| **GRAND TOTAL** | **635** |

Reproducible via the SQL in `docs/reviews/P59/P59-B-STAGE4C-BUSINESS-RESOLUTION-WORKSHEET.md` §3
re-run against `meter_pulse` (current counts supersede the 4C numbers; 4C totals were stale
due to then-active pollution).

---

## 12. Stakeholder Decision Register

| # | Decision | Status | Notes |
|---|----------|--------|-------|
| 1 | Test hygiene / production DB isolation | **IMPLEMENTED** (this stage) | guard + test DB + skip-by-default |
| 2 | 57 M_A meters → customer.areaId | **PENDING** | no stakeholder approval exists |
| 3 | 41 M_D conflict direction | **PENDING** | which source is authoritative? |
| 4 | 129 unassigned meters (now 133 M_B) | **PENDING** | mapping source required |
| 5 | 50→54 NULL customers (test vs real) | **PENDING** | classify before mapping |
| 6 | 16 invoices + 8 payments | **PENDING** | follow customer resolution vs review |

No stakeholder approval is invented; all business decisions remain PENDING.

---

## 13. User.area Audit

- `User.area`/`User.project` = `text NOT NULL`, no FK/constraint.
- 2 test viewers hold valid Area UUIDs; 5 production users hold `''` (empty).
- No area names in use. Empty area on area_manager/billing/viewer = silent fail-closed
  availability risk (not a leak).
- **Separate P1 recommendation:** defensive UUID-or-empty validation; do not mix with
  business mapping. Not changed this stage.

---

## 14. Project Tenancy Status

**Strictly DEFERRED.** Project.areaId 14/14 NULL, Zone/Unit empty, Customer/Meter lack
projectId. projectId never populated/authorizing. Unchanged.

---

## 15. Historical Billing Protection

No business repair performed this stage. For Stage 4E the invariant holds: correcting
current tenancy must not rewrite historical billing meaning; ambiguous historical records
are marked for business review.

---

## 16. Repairs Performed (this stage)

- Added `db-guard.js` (production-DB test guard).
- Modified `db.js` (invoke guard at load).
- Added `tests/helpers/live-guard.js`.
- Modified `live-api.test.mjs`, `persistence.test.mjs`, `integration.test.mjs` (skip unless
  CONTRACT_BASE_URL set).
- Added `tests/unit/db-guard.test.mjs` (6 tests).
- Created `meter_pulse_test` DB (schema clone) + seeded it (admin/roles/perms).
- **NO business data changed in production.**

---

## 17. Tests

- 311/311 unit+api (305 baseline + 6 guard tests) ✅
- 56/56 contract vs isolated test BE (:3901) ✅
- 31/31 integration vs isolated test BE (:3901) ✅
- FE tsc 0 ✅
- Production non-mutation proven (before/after identical) ✅

---

## 18. Stage 4E Prerequisites

1. Freeze confirmed (population is now stable — no automated test can write to production).
2. Decision 2 (57 M_A) APPROVED → backfill areaId=customer.areaId.
3. Decision 3 (41 M_D) resolved (direction).
4. Decision 4 (133 M_B) mapping source.
5. Decision 5 (54 NULL customers) test-vs-real classification.
6. Decision 6 (16 invoices + 8 payments) disposition.
7. Then: dependency-driven repair (root → dependents) with per-class approval, re-attack,
   lineage re-check, full regression, certification.
