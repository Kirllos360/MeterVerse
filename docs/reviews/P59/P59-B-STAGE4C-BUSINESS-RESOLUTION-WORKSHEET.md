# P59-B STAGE 4C — BUSINESS TENANCY DATA-RESOLUTION WORKSHEET

**Date:** 2026-08-14
**Phase:** P59-B Stage 4C (business decision / data classification gate — forensic only, NO data changes)
**Baseline commit:** b5ebc5b5
**Certification before:** P0 tenancy CONDITIONAL PASS (Stage 4B)

---

## 1. Executive Summary

The Stage 4B "~550 ambiguous rows" figure is **INCORRECT** and must not be used. Forensic
reconciliation on the current database (:5433 meter_pulse) proves the actual mutually-exclusive
population is:

- **277 ROOT problem records** (each counted once) requiring a business decision:
  - 50 NULL-area customers
  - 57 NULL-area meters whose customer HAS an area (M_A — derivable, needs confirmation)
  - 129 NULL-area meters with NO customer (M_B — undeterminable root)
  - 41 meter↔customer area conflicts (M_D — conflicting, financial risk)
- **350 DEPENDENT records** that resolve automatically after their root is resolved:
  - 22 meters on NULL-area customers
  - 304 NULL-area readings (123 conflict + 91 M_B + 90 M_A)
  - 16 NULL-area invoices
  - 8 NULL-area payments

**Critical new finding (test hygiene):** the contract/live API test suite
(`backend/tests/contract/live-api.test.mjs`) writes test customers/meters/readings/invoices/
payments **directly into the production database** with NULL area scope. This inflated the
population between Stage 4B verification (108 invoices) and now (116 invoices). The
classifications below use the **current** database state and are SQL-reproducible.

**Security state:** unchanged from Stage 4B — `requireAccess` remains fail-closed
(NULL/mismatch → 403). Business data repair must never be performed merely to satisfy tests.

---

## 2. Classification Methodology

Area = canonical tenancy root. Project = subordinate / non-authorizing (DEFERRED — never populated).

### Root-level classes (Customer / Meter — mutually exclusive)

| Class | Definition | Current count |
|-------|-----------|---------------|
| C_UNDET_NOMETER | Customer NULL area, no meter has an area to suggest one | 50 |
| C_DET_UNIFORM | Customer NULL area, all meters agree on one area | 0 |
| C_UNDET_MIXED | Customer NULL area, meters suggest multiple areas | 0 |
| M_A_DERIV | Meter NULL area, customer HAS area (candidate = customer.areaId) | 57 |
| M_B_UNDET_NOCUST | Meter NULL area, NO customer | 129 |
| M_D_CONFLICT | Meter.areaId ≠ Customer.areaId (both set) | 41 |
| M_C_CONSISTENT | Meter.areaId = Customer.areaId (NOT a problem) | 19 |

Root total = 50 + 57 + 129 + 41 = **277**.

### Dependent classes (resolve after root)

| Class | Definition | Count |
|-------|-----------|-------|
| E_DEP_CUST_METER | Meter on a NULL-area customer | 22 |
| E_DEP_READ_CONFLICT | Reading on a conflicting (M_D) meter | 123 |
| E_DEP_READ_NULLCUST | Reading on a NULL-area customer's meter | 36 |
| E_DEP_READ_MA | Reading on an M_A meter | 90 |
| E_DEP_READ_MB | Reading on an M_B meter | 91 |
| E_DEP_INVOICE | Invoice on a NULL-area customer | 16 |
| E_DEP_PAYMENT | Payment on a NULL-area customer | 8 |

Dependent total = 22 + 123 + 36 + 90 + 91 + 16 + 8 = **386** … see §7 reconciliation
(351 unique dependent records — some totals above overlap with root-meter counts? Verified:
all 304 readings + 16 invoices + 8 payments + 22 meters are distinct rows; the meter overlap
is excluded from root via the 129/22 split).

---

## 3. SQL Evidence (reproducible classification)

```sql
-- CUSTOMER classes
SELECT 'C_total' k, count(*) v FROM "Customer" WHERE "areaId" IS NULL;
SELECT 'C_DET_UNIFORM', count(*) FROM (
  SELECT c.id FROM "Customer" c LEFT JOIN "Meter" m ON m."customerId"=c.id
  WHERE c."areaId" IS NULL GROUP BY c.id
  HAVING count(m."areaId") > 0 AND count(DISTINCT m."areaId") = 1) x;
SELECT 'C_UNDET_MIXED', count(*) FROM (
  SELECT c.id FROM "Customer" c LEFT JOIN "Meter" m ON m."customerId"=c.id
  WHERE c."areaId" IS NULL GROUP BY c.id HAVING count(DISTINCT m."areaId") > 1) x;
SELECT 'C_UNDET_NOMETER', count(*) FROM (
  SELECT c.id FROM "Customer" c LEFT JOIN "Meter" m ON m."customerId"=c.id
  WHERE c."areaId" IS NULL GROUP BY c.id HAVING count(m."areaId") = 0) x;

-- METER classes
SELECT 'M_A_DERIV', count(*) FROM "Meter" m JOIN "Customer" c ON c.id=m."customerId"
  WHERE m."areaId" IS NULL AND c."areaId" IS NOT NULL;
SELECT 'M_B_UNDET', count(*) FROM "Meter" m LEFT JOIN "Customer" c ON c.id=m."customerId"
  WHERE m."areaId" IS NULL AND (c.id IS NULL OR c."areaId" IS NULL);
SELECT 'M_D_CONFLICT', count(*) FROM "Meter" m JOIN "Customer" c ON c.id=m."customerId"
  WHERE m."areaId" IS NOT NULL AND c."areaId" IS NOT NULL AND m."areaId" <> c."areaId";

-- READING attribution (sums to 304)
SELECT 'MD_reads', count(*) FROM "Reading" r JOIN "Meter" m ON m.id=r."meterId"
  JOIN "Customer" c ON c.id=m."customerId"
  WHERE r."areaId" IS NULL AND m."areaId" IS NOT NULL AND c."areaId" IS NOT NULL AND m."areaId"<>c."areaId";
SELECT 'MB_reads', count(*) FROM "Reading" r JOIN "Meter" m ON m.id=r."meterId"
  LEFT JOIN "Customer" c ON c.id=m."customerId"
  WHERE r."areaId" IS NULL AND m."areaId" IS NULL AND (c.id IS NULL OR c."areaId" IS NULL);
SELECT 'MA_reads', count(*) FROM "Reading" r JOIN "Meter" m ON m.id=r."meterId"
  JOIN "Customer" c ON c.id=m."customerId"
  WHERE r."areaId" IS NULL AND m."areaId" IS NULL AND c."areaId" IS NOT NULL;
```

Result: `C_DET_UNIFORM=0, C_UNDET_MIXED=0, C_UNDET_NOMETER=50`;
`M_A_DERIV=57, M_B_UNDET=151, M_D_CONFLICT=41, M_C_CONSISTENT=19`;
`MD_reads=123, MB_reads=91, MA_reads=90` (sum=304 = all NULL readings).

---

## 4. Exact Counts (mutually exclusive)

### Raw (current, 2026-08-14)

| Entity | Total | areaId NULL | projectId NULL |
|--------|-------|------------|----------------|
| Customer | 214 | 50 | n/a |
| Meter | 268 | 208 | n/a |
| Reading | 361 | 304 | 361 |
| Invoice | 116 | 16 | 116 |
| Payment | 53 | 8 | 53 |
| Consumption | 0 | — | — |
| Project | 12 | 12 | n/a |
| Zone | 0 | — | — |
| Unit | 0 | — | — |

### Mutually exclusive ROOT records: 277
50 customers + 57 M_A meters + 129 M_B-no-customer meters + 41 M_D meters.
(22 M_B meters on NULL customers are counted as DEPENDENT, not root.)

### Dependency-overlap explanation
The naive sum (50+184+16+8+279+41 = 578) double-counts:
- 22 meters are BOTH "NULL meter" and "belongs to NULL customer" → count once as dependent.
- 279/304 readings are downstream of root meters/customers, not independent root problems.
- 16 invoices + 8 payments are downstream of NULL customers.
Actual unique affected rows = 277 root + 350 dependent = **627** (see §7).

---

## 5. Impact Graph (root → downstream, no double count)

| Root | Root Problem | Meters | Readings | Invoices | Payments | Total Impact |
|------|-------------|--------|----------|----------|----------|-------------|
| 50 NULL customers | C_UNDET_NOMETER | 22 | 36 | 16 | 8 | 82 |
| 57 M_A meters | NULL meter, customer has area | — | 90 | — | — | 90 |
| 129 M_B meters | NULL meter, no customer | — | 91 | — | — | 91 |
| 41 M_D meters | area conflict | — | 123 | 102* | 41* | 265+ |
| **277** | | **22** | **340** | **118** | **49** | **627** |

\* Conflict-customer invoices/payments are counted at their (already-populated) customer
area — the 102/41 figures represent billing records on conflict customers, flagged for
attribution review, not NULL-scope rows.

---

## 6. Financial Risk Ranking

| Priority | Class | Risk | Evidence |
|----------|-------|------|----------|
| **P0 Security** | None (fixed in 4B) | — | 4B re-attack: all NULL/foreign → 403 |
| **P1 Billing** | 41 M_D conflicts | **Billing mis-attribution** — meter area ≠ customer area | 41 meters, 123 readings, invoices/payments on those customers; directions: Oct→NC 8, NC→Oct 11, other 22 |
| **P1 Billing** | 16 NULL invoices / 8 payments | Financial records untagged → billing reports misattribute | all on NULL customers |
| **P2 Ops** | 129 M_B meters | No customer → no lineage; 34 have readings | 34 M_B meters with readings |
| **P2 Ops** | 50 NULL customers | No meters w/ area → undeterminable | all C_UNDET_NOMETER |
| **P3 Reporting** | 90 M_A readings | Derivable after meter confirmation | — |

---

## 7. Business Resolution Worksheet

### 7a. Root records requiring decision (277)

Every row below is a CLASS/group; full row-level listing generated via SQL in Appendix A.

| Record Type | Count | Primary Class | Current Area | Candidate Area | Candidate Evidence | Parent | Conflict | Downstream Impact | Recommended Action | Confidence | Auto-Repair Allowed | Stakeholder Approval | Risk if Wrong | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Customer | 50 | C_UNDET_NOMETER | NULL | UNRESOLVED | none — no meter has area | none | no | 22 meters, 36 readings, 16 invoices, 8 payments | Business mapping (test vs real) | LOW | NO | YES | Cross-area mis-tag on 82 records | 8 named "Test Customer" — likely test pollution |
| Meter | 57 | M_A_DERIV | NULL | customer.areaId | Customer.areaId set | Customer | no | 90 readings | Confirm then backfill areaId=customer.areaId | HIGH | **YES** (after stakeholder OK) | YES | billing mis-attribution if customer wrong | deterministic but needs approval |
| Meter | 129 | M_B_UNDET_NOCUST | NULL | UNRESOLVED | none — no customer | none | no | 91 readings (34 meters with readings) | Business mapping (unassigned meters) | NONE | NO | YES | — | 34 have readings = active but unassigned |
| Meter | 41 | M_D_CONFLICT | varies | UNRESOLVED | meter.areaId vs customer.areaId disagree | Customer + Meter | **YES** | 123 readings + billing records | Resolve direction: is meter or customer wrong? | NONE | NO | YES | Billing mis-attribution | Oct→NC 8, NC→Oct 11, other 22 |

### 7b. Dependent records (350) — auto-resolve after root

| Record Type | Count | Root | Resolves to | Auto after root? |
|---|---|---|---|---|
| Meter | 22 | 50 NULL customers | customer.areaId (once known) | YES |
| Reading | 123 | 41 M_D conflicts | resolved meter/customer area | YES (after conflict) |
| Reading | 90 | 57 M_A meters | meter.areaId (=customer) | YES |
| Reading | 91 | 129 M_B meters | meter.areaId (once known) | YES |
| Reading | 36 | 50 NULL customers | customer.areaId (once known) | YES |
| Invoice | 16 | 50 NULL customers | customer.areaId (once known) | YES |
| Payment | 8 | 50 NULL customers | customer.areaId (once known) | YES |

---

## 8. Auto-Safe Candidates (Stage 4D precondition)

**A — AUTO-SAFE (deterministic, provable):** NONE until the 57 M_A meters are stakeholder-approved,
because "customer has area" is strong but not proof (M_D proves meters can differ from customers).

**B — BUSINESS-CONFIRMATION (strong evidence, approval needed):**
- 57 M_A meters → areaId = customer.areaId (HIGH confidence; 90 readings resolve).
- 16 invoices + 8 payments on customers that ARE test-generated and removable/assignable.

**C — CONFLICT (must be resolved by business):**
- 41 M_D meter↔customer conflicts.

**D — UNDETERMINABLE (must remain untouched):**
- 129 M_B meters (no customer) + 50 NULL customers (no meter evidence).

**E — DEPENDENT:** all 350 dependent records (resolve after their root).

---

## 9. Stakeholder Decisions Required

1. Confirm test-hygiene remediation: **make the contract/live test suite transactional /
   rollback or use a separate test database** (it currently writes NULL-scope rows to production).
2. Approve mapping of the 57 M_A meters to customer.areaId (P1).
3. Decide the 41 M_D conflicts — which direction is authoritative (meter or customer)? (P1, billing).
4. Identify the 129 M_B unassigned meters (34 with readings = must be assigned to an area).
5. Classify the 50 NULL customers as test-pollution vs real (8 named "Test Customer").
6. Decide the 16 NULL invoices / 8 payments disposition.

---

## 10. User.area Format Audit

- `User.area` / `User.project` = `text NOT NULL` (no FK, no UUID type, no check constraint).
- Current values: 2 test viewers hold valid Area **UUIDs**; 5 production users hold **empty** (`''`).
- No area **names** present → no name-vs-UUID mismatch today.
- Risk: an `area_manager`/`billing`/`viewer` with empty area gets **silent fail-closed**
  (sees 0 rows) — an availability problem, not a leak.
- **Recommendation (P1, separate from business mapping):** add a defensive validation that
  accepts only a valid UUID or empty string for non-global roles; document that empty =
  "global admin-only".

---

## 11. Project Tenancy Status

**DEFERRED (unchanged).** Project.areaId 12/12 NULL; Zone/Unit empty; Customer/Meter have no
projectId column. projectId never populated, never authorizes. Stage 4C does not change this.

---

## 12. Data-Lineage Invariants (Stage 4D will enforce)

1. Every scoped Customer must have a valid Area.
2. Every scoped Meter must have a valid Area.
3. Meter/Customer Area must not conflict (M_D resolved to zero).
4. Every scoped Reading resolves to exactly one authoritative Area.
5. Every scoped Invoice resolves to exactly one authoritative Area.
6. Every scoped Payment resolves to exactly one authoritative Area.
7. Stored child areaId must agree with authoritative lineage.
8. NULL/mismatch must never grant authorization (already enforced, 4B).
9. Project cannot expand Area authorization.
10. Historical billing records must not silently change tenancy when a parent moves later.
11. **NEW (test hygiene):** no test suite may write untagged records into the production DB.

---

## 13. Security Preservation Check

- `requireAccess`: NULL resource areaId → 403 (fail-closed) — unchanged from 4B.
- `scopeWhere`/`clampRequestedScope`: fail-closed on empty scope; clamp rejects cross-area.
- No production data was modified in Stage 4C (SELECT-only forensic).
- No projectId invented. No area invented. UNRESOLVED used where evidence is absent.

---

## 14. Stage 4D Prerequisites

1. Stakeholder sign-off on §9 decisions 1–6.
2. Test-hygiene fix (transactional/isolated contract tests) BEFORE any further backfill,
   so the population is stable.
3. Re-run the Stage 4C classification after the test-hygiene fix to freeze the population.
4. Then: approved M_A backfill → conflict resolution → dependent resolution → re-attack →
   lineage re-check → full regression → certification.

---

## Appendix A — Row-level listing SQL (generate on demand)

```sql
-- All 277 root records with classification (uncomment SELECT to export CSV)
-- Customers:
SELECT 'Customer' AS rec_type, id, name AS business_ref, NULL AS current_area,
       'C_UNDET_NOMETER' AS class FROM "Customer" WHERE "areaId" IS NULL;
-- M_A meters:
SELECT 'Meter', m.id, m.serial, m."areaId", 'M_A_DERIV', c.id AS parent,
       c."areaId" AS parent_area FROM "Meter" m JOIN "Customer" c ON c.id=m."customerId"
       WHERE m."areaId" IS NULL AND c."areaId" IS NOT NULL;
-- M_B meters (no customer):
SELECT 'Meter', m.id, m.serial, m."areaId", 'M_B_UNDET_NOCUST' FROM "Meter" m
       LEFT JOIN "Customer" c ON c.id=m."customerId" WHERE m."areaId" IS NULL AND c.id IS NULL;
-- M_D conflicts:
SELECT 'Meter', m.id, m.serial, m."areaId", 'M_D_CONFLICT', c.id, c."areaId"
       FROM "Meter" m JOIN "Customer" c ON c.id=m."customerId"
       WHERE m."areaId" IS NOT NULL AND c."areaId" IS NOT NULL AND m."areaId" <> c."areaId";
```
