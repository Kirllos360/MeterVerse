# P59-B STAGE 4E — BUSINESS DECISION REGISTER + REPAIR READINESS GATE

**Date:** 2026-08-14
**Phase:** P59-B Stage 4E (decision closure + repair readiness — NO business repair performed)
**Baseline commit (start):** a4df3856
**Freeze status:** RE-FROZEN at 07:40 (see §2 freeze violation note)

---

## 1. Executive Summary

This is a **decision-closure / repair-readiness gate**, NOT a repair gate. All 5 pending
business decisions (#2–#6) were analyzed at row level against the live (frozen) database.
Every record is classified with a proposed resolution, confidence, risk, and approval state.

**Critical STOP event handled:** the 635 baseline was violated at gate start (+1 customer,
+1 meter — residual T023/T024 test pollution from the pre-isolation window committing late).
Per the stop rule, the violation was investigated, root-caused, documented, and the baseline
**re-frozen at 637** (stable across repeated 15s counts; no active writer). No production
data was modified.

---

## 2. Frozen Baseline (authoritative, re-frozen 07:40)

| Metric | Count |
|--------|-------|
| Customer | 219 (55 NULL area) |
| Meter | 273 (213 NULL area) |
| Reading | 361 (304 NULL area) |
| Invoice | 116 (16 NULL area) |
| InvoiceItem | 56 |
| Payment | 53 (8 NULL area) |
| Consumption | 0 |
| Area | 3 |
| Project | 14 (14 NULL area) |
| Zone / Unit | 0 / 0 |
| User | 7 |
| **ROOT backlog** | **287** (55 C + 57 M_A + 134 M_B + 41 M_D) |
| **DEPENDENT backlog** | **350** (22 meters + 304 readings + 16 invoices + 8 payments) |
| **TOTAL** | **637** |

**Freeze violation record:** Stage 4D freeze = 635 (Customer 218/Meter 272). At Stage 4E start,
counts were Customer 219 / Meter 273 (+1 each). New records: customer `625c8df7-fa93-44cd-a769-5c786e081f6c`
("Test Customer", 04:26:22) + meter `f9251d7a-cff2-44ce-8abe-5e09cafb6f6b` (`TST-1786681583217`, 04:26:23).
Both carry deterministic T023/T024 contract-test signatures created during the pre-isolation
window (04:14–04:26) that committed late. Counts verified stable over 15s × 2. No active
writer; isolation guard verified still blocking (TEST_MODE+meter_pulse → exit 1).

---

## 3. Decision Register — ROOT RECORDS

### DECISION #2 — 57 M_A meters (null area, customer has area) → **PENDING**

| Field | Evidence |
|-------|----------|
| Exact count | 57 |
| Serial pattern | `P5-MTR-*` (seed-generated) |
| Candidate area | customer.areaId (authoritative parent) |
| Downstream | 90 readings, 40 invoices, 20 payments |
| Evidence of ownership | Customer.areaId is set and matches P5 seed areas (Oct/NC/SODIC) |
| Confidence | HIGH (deterministic via Customer→Area parent) |
| Proposed action | backfill meter.areaId = customer.areaId |
| Approval required | **YES — PENDING** |
| Historical risk | LOW (no existing meter area to overwrite; NULL → set) |

### DECISION #3 — 41 M_D conflicts (meter ≠ customer area) → **PENDING**

| Field | Evidence |
|-------|----------|
| Exact count | 41 |
| Serial pattern | `P50-OPER-M-*` (operational seed) |
| Customer type | REAL names (Mariam Ibrahim, Hossam Mahmoud, Laila Mostafa, Tamer Fathy, Omar Khaled, Sara Adel …) — NOT test data |
| Directions | Oct→NC 8, NC→Oct 11, other 22 (incl. SODIC) |
| Downstream | 123 readings, 102 invoices, 41 payments |
| Root cause | P50 seed assigned meter.areaId and customer.areaId independently |
| Which is authoritative | **UNKNOWN — cannot assume either** (Stage 4C proved meter≠customer is possible) |
| Recommended | business resolution per record (customer assignment vs meter physical location) |
| Confidence | NONE (conflicting by definition) |
| Approval required | **YES — PENDING** |
| Historical risk | HIGH — billing mis-attribution if wrong direction chosen |

### DECISION #4 — 134 M_B meters (no customer) → **PENDING**

| Field | Evidence |
|-------|----------|
| Exact count | 134 |
| Serial split | 41 `TST-*`, 82 `T0-*`, 11 other |
| Test signatures | **123/134 (92%) carry TST/T0 test serials** → TEST-POLLUTION candidates |
| With readings | 34 meters / 55 readings (operational-but-unassigned) |
| Candidate area | none determinable without customer/assignment |
| Recommended | split: test-pollution meters (TST/T0) → TEST-POLLUTION disposition; 11 other + 34-with-readings → BUSINESS-MAPPING-REQUIRED |
| Confidence | HIGH for test classification (serial signature); LOW for real meters |
| Approval required | **YES — PENDING** |
| Historical risk | MEDIUM (unassigned meters; 34 have readings) |

### DECISION #5 — 55 NULL-area customers → **PENDING**

| Field | Evidence |
|-------|----------|
| Exact count | 55 |
| Name split | 13 `Test*`, 16 `P5-Customer-*`, 26 other (mostly `T023`/`T025`/`Contract Test` test names) |
| Test signatures | **~52/55 (95%) carry deterministic test names** → TEST-POLLUTION candidates |
| Real business customers | ~3 possible (non-test-named) — low confidence |
| Downstream | 22 meters, 36 readings, 16 invoices, 8 payments |
| Recommended | split: test-named → TEST-POLLUTION (cleanup candidate); P5 + any real → BUSINESS-MAPPING-REQUIRED |
| Confidence | HIGH for test classification (name signature); LOW for real |
| Approval required | **YES — PENDING** |
| Historical risk | MEDIUM (16 invoices + 8 payments depend on these) |

## 4. Decision Register — DEPENDENT RECORDS

| Class | Count | Root dependency | Resolution after root | Status |
|-------|-------|-----------------|----------------------|--------|
| M_B-on-NULL-customer meters | 22 | 55 NULL customers | customer.areaId once set | PENDING (dep on #5) |
| Readings | 304 | meters/customers above | parent area once set | PENDING (dep on #2/#3/#4/#5) |
| Invoices | 16 | NULL customers (14 P5 + 2 T025) | customer.areaId once set | PENDING (dep on #5) |
| Payments | 8 | NULL customers (all P5) | customer.areaId once set | PENDING (dep on #5) |

**No dependent record may be resolved while its root is unresolved.** Dependency graph is
root-first: #5 customers → #2 M_A → #3 M_D → #4 M_B → then dependents.

---

## 5. Integrity / Consistency Checks (all pass)

| Check | Result |
|-------|--------|
| Orphans (invoice/payment/reading) | 0 |
| Invalid area refs (Customer/Meter/Reading/Invoice/Payment) | 0 |
| Reading↔Meter area mismatch | 0 |
| Invoice↔Customer area mismatch | 0 |
| Payment↔Customer area mismatch | 0 |
| Duplicate/double-count in classification | 0 (mutually exclusive) |
| Test-signature meters | 146 |
| Test-signature customers | 164 |

---

## 6. Executive Decision Table

| # | Decision | Records | Proposed Resolution | Confidence | Risk | Approval | Status |
|---|----------|---------|---------------------|------------|------|----------|--------|
| 2 | 57 M_A meters | 57 meters (90 reads, 40 inv, 20 pay) | areaId = customer.areaId | HIGH | LOW | Required | **PENDING** |
| 3 | 41 M_D conflicts | 41 meters (123 reads, 102 inv, 41 pay) | business direction per record | NONE | HIGH | Required | **PENDING** |
| 4 | 134 M_B meters | 134 (55 reads) | 123 test → TEST-POLLUTION; 11+34 → mapping | HIGH(test)/LOW(real) | MED | Required | **PENDING** |
| 5 | 55 NULL customers | 55 (22 meters, 36 reads, 16 inv, 8 pay) | ~52 test → TEST-POLLUTION; ~3 real → mapping | HIGH(test)/LOW(real) | MED | Required | **PENDING** |
| 6 | 16 inv + 8 pay | 24 financial records | all follow customer resolution (#5) | HIGH | MED | Required | **PENDING** |

**FACT vs INFERENCE vs RECOMMENDATION vs APPROVAL — clearly separated:**
- **FACT:** counts, serials, names, downstream counts (SQL-verified, §5).
- **INFERENCE:** test-pollution classification from name/serial signatures (deterministic patterns).
- **RECOMMENDATION:** proposed resolutions in the table above.
- **APPROVAL:** **NONE granted.** All 5 decisions remain PENDING stakeholder approval.

---

## 7. Repair Readiness Assessment

| Readiness condition | Status |
|---------------------|--------|
| Frozen baseline reproduced | ✅ (re-frozen 637, stable) |
| Test isolation still proven | ✅ (contract 56 skipped; guard exit 1 on prod) |
| All 637 rows classified | ✅ (§3–§4) |
| All 5 pending decision categories represented | ✅ |
| Root/dependent dependency graph validated | ✅ (root-first enforced) |
| Historical billing risks identified | ✅ (M_D = HIGH; invoices/payments depend on #5) |
| Every proposed repair has explicit approval state | ✅ (all PENDING — none fabricated) |
| No unresolved root silently repaired | ✅ |
| No project tenancy invented | ✅ |
| No security weakening | ✅ (fail-closed intact) |

---

## 8. Historical Billing Protection

- 16 invoices + 8 payments are **dependent-only** — no independent disposition invented.
- M_D conflicts: 102 invoices + 41 payments affected — marked **HISTORICAL-PROTECTED / business review**
  because changing direction could re-interpret billing history.
- No historical record was modified.

---

## 9. Repairs Performed

**NONE — decision gate only.** No production data changed. The +2 test records were
investigated and left in place (deletion requires a separate approved gate).

---

## 10. Tests / Validation Performed

- DB fingerprint + classification reproduction (re-frozen 637)
- Duplicate/orphan/invalid-ref/mismatch checks (all 0)
- Test-signature scans (146 meters, 164 customers)
- Contract suite skip-by-default verified (56 skipped)
- db-guard enforcement verified (TEST_MODE+meter_pulse → exit 1)
- Git baseline + diff review

---

## 11. Next Gate

**Stakeholder approval closure** — decisions #2–#6 must be explicitly APPROVED before
Stage 4E-B (business repair execution). Repair (when approved) will be dependency-driven:
roots first (#5 → #2 → #3 → #4), then dependents, with backup → dry-run → transactional
repair → lineage validation → security re-attack → 311/56/31 regression → tsc → E2E → cert.
