# LEGACY RECOVERY RECOMMENDATION

**Date:** 2026-08-14
**Gate:** P59-B / Pre-Repair — Legacy Asset Discovery (read-only)
**Baseline commit:** 41338a9e

---

## 1. Executive Summary

The three encrypted RAR archives (`Collection System.rar`, `IMS.rar`, `New folder (2).rar`) were
verified as password-protected and **not extracted directly** (per safety rules). However, their
**full extracted counterparts already exist on disk** under `D:\meter\Meter\reference\`, enabling a
complete evidence-based discovery of all three systems.

**Systems identified:**
1. **Collection Tracker v1.2.1** (Flask/PG) — the "Collection System" the user remembers. Operational collection/billing system with **unique capabilities MeterVerse lacks**: solar wallet/net metering, settlement engine, cheque/POS, chilled-water settlement.
2. **IMS** (static HTML/JS) — UI-only prototype. **No backend value.**
3. **"New folder (2)"** — mixed resource archive: Symbiot AMI/MDM protocol inventory (.NET), SBill/October Billing + Energy360 (SQL Server), debug snapshots.

## 2. What We Already Have

MeterVerse (200+ models, Node/Next.js/NestJS + PG16) already **surpasses** legacy in: RBAC/JWT, reporting, notifications, ledger (GL/AR), approvals/workflows, documents, AI/revenue-assurance, governance, dashboard UI, tenancy. **The three legacy systems are NOT needed to fill these.**

## 3. What We Can Recover (the genuine opportunities)

| Priority | Capability | Source | Reuse Type | Effort vs Rebuild |
|----------|-----------|--------|------------|-------------------|
| 1 | **Solar wallet / net metering algorithm** | Collection | CLONE | Fast — exact formulas documented (CR 2047) |
| 2 | **Settlement engine** (FIXED/PERCENTAGE/ONE_TIME) | Collection | CLONE | Fast — 40-line function, portable |
| 3 | **Charge-type coverage** (STATIC/PER_UNIT/ZERO) | Collection | CLONE | Fast — verify/extend MeterVerse Tariff |
| 4 | **Cheque / POS / payment-center models** | Collection | ADAPT | Medium |
| 5 | **Solar invoice/payment Excel templates** | Collection | ADAPT | Fast — direct asset reuse |
| 6 | **Symbiot protocol/MDM inventory** | New folder (2) | ADAPT | Medium — SEP bridge design input |
| 7 | **SBill tax rules + data migration** | SBill | MIGRATE | Long — already planned |
| 8 | **Chilled-water settlement** | Collection | BUSINESS REVIEW | Medium — confirm scope first |

## 4. What We Should Reject

- IMS UI code (MeterVerse pages superior)
- Collection flask-login RBAC, fpdf2 reporting (MeterVerse superior)
- SQLite stubs (empty)
- **Any direct merge of 1.8.0/2.8.0 OBIS reading model into MeterVerse 5.8.0** (conflicting business meaning)

## 5. Top 10 Fastest High-Value Time-Saving Opportunities

1. Solar wallet algorithm clone (exact formulas, ~1 dev-day to implement+test)
2. Settlement engine clone (FIXED/PERCENT/ONE_TIME, ~0.5 day)
3. Tariff charge-type gap verification (STATIC/PER_UNIT/ZERO, ~0.5 day)
4. Solar XLSX import template reuse (~0.5 day)
5. Symbiot protocol inventory → SEP bridge design doc (~1 day)
6. Cheque/POS model + workflow adapt (~2 days)
7. Payment allocation comparison (legacy vs MeterVerse) (~1 day)
8. Reading review-queue UX reference (~0.5 day)
9. SBill migration plan refresh (data source inventory) (~1 day)
10. Chilled-water business-scope confirmation (~0.5 day, business)

## 6. Architecture Governance

- **MeterVerse remains authoritative.** No legacy framework/language is imported.
- Every recovery is a **behavior clone into the current Node/NestJS + PG16 stack** — never a code merge.
- **No production DB change, no tenancy change, no business repair** occurred or is authorized by this gate.
- OBIS model conflict (1.8.0/2.8.0 vs 5.8.0) requires explicit business decision before any solar module design.

## 7. Recommended Next Gate

**NEXT GATE = "LEGACY RECOVERY — SOLAR + SETTLEMENT DESIGN (P59-C/LR-1)"** — a design-only gate that
produces a MeterVerse-native specification for the two highest-value clones (solar wallet algorithm
and settlement engine) mapped to existing models (`Tariff*`, `InvoiceItem`, `CustomerLedgerEntry`),
plus an explicit decision record for the OBIS measurement-model conflict. It does NOT implement code.

Rationale: solar wallet + settlements are (a) genuinely missing from MeterVerse, (b) fully documented
business behavior, (c) low-risk, high-value, fast to clone — they save the most development time.
Chilled-water and cheque/POS require business scope confirmation first and should follow in a second
gate. IMS contributes nothing.

## 8. STOP

Discovery complete. No implementation performed. No production change. Stage 4E-B and Wave 4 remain locked (P59-B tenancy decisions #2–#6 still PENDING).
