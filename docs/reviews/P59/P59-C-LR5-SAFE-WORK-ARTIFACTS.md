# P59-C/LR-5 — SAFE WORK ARTIFACTS (no approval fabricated)

**Date:** 2026-08-14 · **Decision gate:** STATE 2 — OBIS + Import EXECUTE approvals are REQUESTS only; no actual approval exists. All work below is approval-independent.

---

## 1. LANE B — SOLAR WALLET ENGINE (IMPLEMENTED + TESTED — no schema change)

- **File:** `backend/src/services/solar-wallet-engine.js`
- **Status:** IMPLEMENTED + TESTED (16 unit tests) — PURE compute + persistence via EXISTING CustomerLedgerEntry/InvoiceItem/Invoice.
- **OBIS boundary respected:** the engine takes resolved directional inputs (`curr180/prev180/curr280/prev280`); capturing/storing registers on `Reading` is NOT done (OBIS-gated).
- **Verified runtime evidence (NOT the 2.23 myth):** tiered tariff `[(50,0.48)..(1000,1.58)]` + `>1000 @1.68`; admin fee 2%; service fee 9.10.
- **Tier quirk (evidence-first):** legacy `chunk=min(remaining, limit)` against cumulative limits → 150 units = 50@0.48 + 100@0.58 = 82 (not band-perfect 87). Engine reproduces the PROVEN runtime exactly.

### Test vectors (16 cases, all passing)
import only · export only · import>export · export>import · equal · tariff boundary (50) · multi-tier (150=82) · zero · deterministic repeat · wallet credit=surplus · negative clamp · ledger credit persist · invoice itemization · missing readings default 0 · tier table bounded · service fee constant.

## 2. LANE C — IMPORT EXECUTE (mechanism VERIFIED in isolation — still gated in production)

- Uploaded real legacy `Solar_Invoices_Template.xlsx` to isolated test backend (:3901, meter_pulse_test) → preview **2796 valid / 0 invalid**.
- EXECUTE → **processed=0, failed=2796** (all "meter not found" — correct guard: no orphan invoices created on unknown meters).
- **Idempotency proven:** re-execute → **409**.
- **Production EXECUTE remains GATED** (no approval) — only the mechanism was tested in the isolated DB.

## 3. LANE D — CHEQUE / POS EVIDENCE (CLASSIFIED — no implementation)

Legacy `Cheque` model (models.py):
- Fields: payment_id FK, cheque_number, bank_name, cheque_date, amount, **status (default PENDING)**, cleared_date, notes.
- Lifecycle evidence: PENDING → (cleared_date set) → CLEARED. Linked to a payment (payment_id → Transaction).
- Also present: `CurrencyType` (multi-currency, is_main, rate) + `PaymentFee` (fee_type, fee_amount).

**Classification vs MeterVerse:**
| Component | Classification | Notes |
|-----------|---------------|-------|
| Cheque model | **ADAPT** | add `method="cheque"` + cheque_number/bank/cleared fields to `Payment` (or a Cheque child) |
| Cheque lifecycle | **ADAPT** | PENDING→CLEARED states; cleared_date |
| CurrencyType | **MISSING** | multi-currency support — needs business decision |
| PaymentFee | **ADAPT** | map to InvoiceItem type="fee" or Payment.fee |
| POS terminal | **NEEDS EVIDENCE** | POSTerminal model exists in legacy; full lifecycle not yet read |

**Do NOT implement in this gate** — cheque/POS is a separate, evidence-complete lane (no solar dependency).

## 4. LANE A — OBIS MIGRATION-READY PACKAGE (no schema change applied)

Pending approval only. When OBIS Option A is approved:
1. `ALTER TABLE "Reading" ADD COLUMN "obis180" DOUBLE PRECISION, ADD COLUMN "obis280" DOUBLE PRECISION;` (additive, nullable).
2. Update `Reading` Prisma model + migration.
3. `solar-wallet-engine` already accepts directional inputs — wire reading capture on approval.
4. Tests: reading-capture integration (directional → computeSolar → persistSolarInvoice).

Option E (long-term): combined + directional; requires more design. **No choice is made silently.**

## 5. PENDING DECISIONS (unchanged)

- OBIS Option A/E — PENDING (approval request in P59-C-LR4-APPROVAL-CLOSURE.md)
- Import EXECUTE — PENDING (mechanism verified in isolation only)
- P59-B #2–#6 — PENDING (639 frozen untouched)
