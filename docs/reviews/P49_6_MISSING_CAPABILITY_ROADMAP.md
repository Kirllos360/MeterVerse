# P49.6 — Missing Capability Roadmap

**Date:** 2026-08-01 · For each missing capability: business purpose, source, required entities, workflows, APIs, UI, testing, future phase.

---

## 1. Tickets / Support / Claims — HIGH (fold into C14)

- **Business purpose:** Customer complaints, support tickets, claims — core self-service surface.
- **Source:** `Mete` (Ticket, Claim), `Abady001/Meter-` (Tickets/Support pages).
- **Entities:** Ticket, TicketMessage, Claim, ServiceRequest (C14), ServiceRequestMessage (C14).
- **Workflows:** create → assign → investigate → resolve → close; claim → review → approve/reject.
- **APIs:** `/api/portal/tickets` CRUD + messages; `/api/tickets/*` admin.
- **UI:** user create/view tickets; admin workbench.
- **Testing:** +15 unit, +5 contract.
- **Phase:** **C14 Wave 3.**

## 2. Settlement / Wallet / Chilled-Water / Gas — HIGH (deferred)

- **Business purpose:** Operator settlement with partners; solar wallet; chilled-water BTU allocation; gas metering.
- **Source:** `Mete` — features schema (SettlementConfig/Rule/Period/Transaction/Allocation, WalletAccount/Transaction/Balance/Allocation/Transfer, ChilledWater*, Gas*).
- **Entities:** ~30 models from Mete features schema.
- **Workflows:** settlement period open → allocations → reconcile → close; wallet deposit/withdraw/transfer.
- **APIs:** `/api/settlement/*`, `/api/wallet/*`, `/api/chilled-water/*`, `/api/gas/*`.
- **UI:** admin finance + operations apps.
- **Testing:** +40 unit, +10 contract.
- **Phase:** **Wave 5** (or C13 follow-on).

## 3. Invoice Hash / QR Immutability — HIGH (fold into C24/C13)

- **Business purpose:** Tamper-evident invoices for regulatory/fraud control.
- **Source:** `Mete` — InvoiceHash, InvoiceQRCode models.
- **Entities:** InvoiceHash, InvoiceQRCode (or fields on Invoice).
- **Workflows:** on issue → compute hash + QR → store → verify on view.
- **APIs:** extend `/api/invoices/:id` with hash + verify endpoint.
- **UI:** invoice detail shows hash + QR (existing qr-engine.js reusable).
- **Testing:** +8 unit.
- **Phase:** **C24 Wave 3** (or C13 hardening).

## 4. Robust Excel Import/Export — MEDIUM (fold into C24)

- **Business purpose:** Reliable bulk data operations (meters, readings, customers, payments).
- **Source:** `collection-tracker` — routes_import.py (all-or-nothing validation, required columns, template download).
- **Entities:** none new (ImportJob/ExportJob exist); add validation config.
- **Workflows:** download template → upload → validate (all-or-nothing) → preview → commit → audit.
- **APIs:** `/api/import/*` templates + upload; `/api/export/*`.
- **UI:** import center (admin) — enhance existing migration-uploads.
- **Testing:** +12 unit, +5 contract.
- **Phase:** **C24 Wave 3.**

## 5. JasperReports Template Library — MEDIUM (fold into C13/C17)

- **Business purpose:** Ready report definitions (invoices, receipts, consumption, aging, financial).
- **Source:** `Mete` — 60+ `.jrxml`.
- **Entities:** ReportDefinition (exists); add template files.
- **Workflows:** report selection → render (jasper-bridge) → export PDF/CSV.
- **APIs:** `/api/reports/jasper/*` (bridge exists).
- **UI:** reporting studio picks templates.
- **Testing:** +6 contract.
- **Phase:** **C13/C17 (Wave 3 or 4).**

## 6. OpenAPI Contract — MEDIUM (fold into C20)

- **Business purpose:** API governance, client generation, contract-first development.
- **Source:** `Abady001/Meter-` — meter-pulse-api.yaml (563 lines).
- **Entities:** none.
- **Workflows:** generate client → contract tests (supertest against spec).
- **APIs:** publish `/api-docs` (exists) + versioned contract.
- **UI:** none.
- **Testing:** +10 contract.
- **Phase:** **C20 (ongoing / Wave 3).**

## 7. Collection KPIs — MEDIUM (fold into C13)

- **Business purpose:** Management visibility into collections effectiveness.
- **Source:** `collection-tracker` — collection rate, top-debtors, kashier.
- **Entities:** none new.
- **Workflows:** compute rate = collected/invoiced; top-N debtors; per-area.
- **APIs:** extend `/api/collections/summary` + `/reports/collections`.
- **UI:** collections dashboard KPIs.
- **Testing:** +6 unit.
- **Phase:** **C13 (Wave 3).**

## 8. Bank Reconciliation (C13-W05) — MEDIUM (already planned)

- **Business purpose:** Cash management, GL accuracy.
- **Source:** none (C13-W05 blueprint).
- **Entities:** 9 planned models (BankAccount, BankStatement, BankTransaction, ReconciliationException, PaymentGatewaySettlement, SuspenseTransaction, CashForecast, ExchangeRate, ReturnedPayment).
- **Workflows:** statement import → auto-match → exceptions → settle.
- **APIs:** `/api/bank-reconciliation/*`.
- **UI:** admin cash/reconciliation.
- **Testing:** +20 unit.
- **Phase:** **C13-W05 (post-Wave-3 / Wave 4).**

## 9. Password Policy Service — LOW (fold into C12)

- **Business purpose:** Security hardening (min length, rotation).
- **Source:** `Abady001/Meter-` — password-policy.service.ts.
- **Entities:** none.
- **Workflows:** policy check on create/change.
- **APIs:** extend `/api/auth/*`.
- **UI:** admin security settings.
- **Testing:** +6 unit.
- **Phase:** **C12 (Wave 3 hardening).**
