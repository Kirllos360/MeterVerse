# P49.5 — Missing Capability Report

**Date:** 2026-08-01 · For every capability MeterVerse lacks, explains importance, source, why needed, and future phase. **No implementation in this mission.**

---

## 1. Settlement & Wallet Management (HIGH)

- **Importance:** Operators settle with utilities/partners (SODIC, EBY, etc.); solar/wallet balances are real business revenue streams.
- **Source:** `Mete` — `features` schema: SettlementConfig/Rule/Period/Transaction/Allocation; WalletAccount/Transaction/Balance/Allocation/Transfer; controllers `settlement/`, `wallet/`, `solar/`, `chilled-water/`, `gas/`.
- **Why MeterVerse needs it:** MeterVerse has billing→GL→collections but no settlement reconciliation or solar/wallet/chilled-water/gas modules. These are distinct revenue lines a utility operator must manage.
- **Future phase:** Wave 5+ (or C13 follow-on). Extract models + services from Mete.

## 2. Tickets / Support / Claims (HIGH)

- **Importance:** Customer complaints/tickets are a core ops surface; C14 user portal needs a real ticket workflow.
- **Source:** `Mete` (Ticket, Claim models; `tickets/`, `support/` controllers); `Abady001/Meter-` (Ticket/Support pages).
- **Why:** MeterVerse's `admin/tickets` is a hardcoded placeholder (P47 finding). Users need create→assign→resolve, backend-persisted.
- **Future phase:** **C14 Wave 3** (customer experience portal).

## 3. Invoice Hash / QR Immutability (HIGH)

- **Importance:** Regulatory + fraud control: issued invoices must be tamper-evident.
- **Source:** `Mete` — InvoiceHash, InvoiceQRCode models, `immutableAt`, `signedDocumentHash`.
- **Why:** MeterVerse marks invoices immutable on issue but lacks a verifiable hash/QR. Adds integrity.
- **Future phase:** Wave 3 (C13 hardening or C24 records).

## 4. Robust Excel Import/Export (MEDIUM)

- **Importance:** Data migrations & daily ops depend on reliable bulk import (meters, readings, customers, payments).
- **Source:** `collection-tracker` — `routes_import.py` (60 KB) with all-or-nothing validation, required-column rules, templates download/upload; `Mete` UploadCenter.
- **Why:** MeterVerse has crud-service import/export but not the validated template-based flows.
- **Future phase:** Wave 3/4 (C24 documents + C15 integration).

## 5. JasperReports Template Library (MEDIUM)

- **Importance:** 60+ ready report definitions (invoices, receipts, consumption, aging, financial).
- **Source:** `Mete` — `templates/*.jrxml` (60+ files).
- **Why:** MeterVerse has `jasper-bridge.js` but few templates. Reuse saves report-building effort.
- **Future phase:** Wave 3 (C13 reporting / C17 analytics).

## 6. OpenAPI Contract (MEDIUM)

- **Importance:** API governance, client generation, contract tests.
- **Source:** `Abady001/Meter-` — `specs/001-metering-billing-platform/contracts/meter-pulse-api.yaml` (563 lines).
- **Why:** MeterVerse has swagger.js (partial); a full contract enables generated clients + contract-first development.
- **Future phase:** Wave 3 (C20 quality).

## 7. Collection KPIs (collection-rate, top-debtors) (MEDIUM)

- **Importance:** Management visibility into collections effectiveness.
- **Source:** `collection-tracker` — `routes_reports.py` (collection rate, total invoiced vs collected, top-50 debtors, kashier report).
- **Why:** Enriches MeterVerse C13 collections dashboard.
- **Future phase:** Wave 3 (C13 collections).

## 8. Bank Reconciliation (C13-W05) (MEDIUM — already planned)

- **Importance:** Cash management, GL accuracy.
- **Source:** No repo has it; `C13-W05_Bank_Reconciliation_Cash_Management.md` plans 9 models.
- **Why:** Completes the C13 financial spine.
- **Future phase:** C13-W05 (post-Wave-3 or Wave 4).

## 9. Password Policy Service (LOW)

- **Importance:** Security hardening.
- **Source:** `Abady001/Meter-` — `auth/password-policy.service.ts`.
- **Why:** MeterVerse has lockout but not policy (min length/rotation).
- **Future phase:** Wave 3 (C12 hardening).

---

## Wave 3 Impact

| Wave-3 program | Missing capability to include | Source |
|---|---|---|
| **C14 Customer Experience** | Tickets/support/claims, user notifications, documents | Mete, Abady001 |
| **C24 Documents & Records** | Invoice hash/QR, robust import/export, document templates | Mete, collection-tracker |
| **C25 Communication** | Real email/SMS delivery (from placeholder), notifications inbox | all |
| **C13 (follow-on)** | Settlement/wallet/chilled-water/gas, bank reconciliation, collection KPIs | Mete, collection-tracker |

**No implementation performed.** These are documented for future-phase extraction.
