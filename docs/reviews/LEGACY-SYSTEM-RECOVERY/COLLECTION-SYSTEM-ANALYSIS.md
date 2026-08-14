# LEGACY COLLECTION SYSTEM — DEEP ANALYSIS

**Source:** `D:\meter\Meter\reference\collection-system\` (extracted counterpart of `D:\Collection System.rar`)
**System name:** "Collection Tracker v1.2.1" (per business-rule-discovery.md)
**Date:** 2026-08-14

---

## 1. SYSTEM PROFILE

| Field | Value | Evidence |
|-------|-------|----------|
| Name | Collection Tracker v1.2.1 | business-rule-discovery.md |
| Purpose | Payment collection / billing operations platform (utilities) | app structure, routes |
| Stack | Python 3, Flask ≥3.0, Flask-SQLAlchemy ≥3.1, Flask-Login, Flask-WTF, Flask-Limiter, openpyxl, pandas, fpdf2, waitress, cryptography, requests, schedule, alembic, psutil, redis | requirements.txt |
| DB | PostgreSQL (alembic) + SQLite stubs (october.db, sodic_ednc.db) | DBS/, alembic.ini |
| Auth | flask-login + role hierarchy (require_role) + login_attempt + AuditLog | routes_api.py, models.py |
| Reports | fpdf2 (PDF), openpyxl (Excel), legacy JRXML refs (44 files per discovery doc) | docs/specs |
| Scheduler | `schedule` (cron-like jobs) | requirements.txt |
| Modules | 20 route modules | app/routes_*.py |

## 2. ENTITY / MODEL INVENTORY (~60 models in models.py, 844 lines)

Core domain:
- User, CustomRole, Group, Project, CustomerGroup, UnitType
- Area, LocationZone, Customer, CustomerMeter, CustomerExtra
- MeterReading, ReadingReview, ReadingThreshold
- Tariff, TariffCharge, TariffChargeDetail, TariffVersion
- BillCycle, InvoiceDetail, CancelledInvoice, InvoiceAdjustment
- Transaction, PaymentAllocation, PaymentChannel, PaymentFee, OnlinePaymentLog, Cheque, POSTerminal
- CustomerLedgerEntry, JournalEntry, JournalEntryDetail
- Settlement, ChilledWaterSettlement, ChilledWaterConfig
- SolarWalletTransaction
- WaterBalance, SIMCard, SEPJob
- Approval, Task, TroubleTicket, ContractualRequest, ReportJob
- AuditLog, ErrorLog, LoginAttempt, SystemConfig, NotificationQueue, NotificationHistory
- BankAccount, PaymentCenter, Holiday, RunningActivity, CurrencyType, Attachment, Alert, ChatMessage

## 3. BUSINESS MODULES (from routes + models)

1. **Customer management** (routes_customers) — CRUD, groups, extras
2. **Meter management** — CustomerMeter, SIMCard
3. **Readings** (routes_readings) — MeterReading, ReadingReview, ReadingThreshold, validation
4. **Billing** — Tariff versions, BillCycle, InvoiceDetail, charge_engine (6 charge types)
5. **Payments / Collection** (routes_transactions) — Transaction, PaymentAllocation, PaymentChannel, Cheque, OnlinePaymentLog
6. **Ledger** — CustomerLedgerEntry, JournalEntry(+Detail)
7. **Settlements** — FIXED / PERCENTAGE / ONE_TIME (+ chilled water settlement)
8. **Solar wallet** — net metering wallet algorithm (SolarWalletTransaction)
9. **Chilled water** — ChilledWaterConfig + settlement (17 settlements, 31 invoices per docs)
10. **Approvals / Tasks / Trouble tickets / Contractual requests**
11. **Superadmin / Admin** (routes_superadmin, routes_admin)
12. **Reports** (routes_reports) — PDF/Excel, ReportJob
13. **Import** (routes_import) — Excel-based (Solar invoices/payments templates)
14. **Symbiot integration** (routes_symbiot) — SEP integration
15. **Energy360 integration** (routes_energy360) — customer portal sync
16. **Chilled settlement** (routes_chilled_settlement)
17. **Attachments, Chat, Metrics, Workplace**

## 4. EXTRACTED BUSINESS RULES (evidence-based)

### R1. Tariff charge types (charge_engine.py)
```
STEPS   = tiered (TariffChargeDetail order by from_value, tier_units * rate)
FLAT    = consumption * flat_rate
STATIC  = fixed amount
PER_UNIT= consumption * per_unit_rate (capped)
ZERO    = zero-reading handling
```
Source: `app/charge_engine.py:1-50` — Confidence: HIGH

### R2. Settlement types (charge_engine.py:74-112)
```
FIXED      = adds fixed amount
PERCENTAGE = adds % of subtotal (ROUND_HALF_UP, 0.01)
ONE_TIME   = adds amount once (guarded by existing Transaction with matching description)
```
Source: `app/charge_engine.py:74-112` — Confidence: HIGH

### R3. Solar wallet / net metering algorithm (business-rule-discovery.md)
```
consumption = reading_180_current - reading_180_previous
production  = reading_280_current - reading_280_previous
net       = max(consumption - production, 0)
surplus   = max(production - consumption, 0)
wallet_credit = min(wallet_previous, net)
billed_kwh = max(net - wallet_credit, 0)
amount     = billed_kwh * 2.23 EGP/kWh
new_wallet = wallet_previous + surplus - wallet_credit
total      = amount + fees + service_charge + taxes + adjustments
```
Source: `docs/specs/business-rule-discovery.md` (CR 2047 Excel reconstruction) — Confidence: HIGH

### R4. Payment allocation / transaction rules (routes_transactions)
Rule: payments allocate against customer account with ledger entries; multiple allocation methods (PaymentAllocation entity). Confidence: MEDIUM (detailed allocation formula in code not fully traced in this gate).

### R5. Reading validation / thresholds (ReadingReview, ReadingThreshold)
Rule: readings above configured thresholds route to review queue. Confidence: MEDIUM.

### R6. Chilled water settlement (ChilledWaterConfig, 17 settlements/31 invoices in operational PDFs)
Rule: chilled-water consumption settlement with its own config + settlement workflow. Confidence: MEDIUM.

## 5. GAP ANALYSIS ALREADY PRESENT

`docs/specs/COLLECTION_SYSTEM_GAP_ANALYSIS.md` (2026-06-13) already compares Collection vs SBill PH / SBill Estates / MeterVerse page-by-page. Key finding: MeterVerse dashboard/UI is **richer** (8 stat cards, animated counters, area charts, doughnut status distribution) but Collection System has **operational depth** (solar wallet, chilled water, cheque/POS processing) that the gap doc flags.

## 6. REUSE CLASSIFICATION (preliminary — final in REUSE-AND-CLONE-CANDIDATES.md)

| Capability | Classification |
|-----------|---------------|
| Solar wallet / net metering | **C. CLONE** — behavior valuable; Python/Flask incompatible with Node/NestJS MeterVerse |
| Chilled water settlement | **B. ADAPTABLE** — config+settlement entities map well; business rules in PDFs |
| Cheque / POS / payment channels | **B. ADAPTABLE** — PaymentChannel/Cheque/POSTerminal models |
| Tiered charge engine (6 types) | **C. CLONE** — logic directly portable to MeterVerse Tariff engine |
| Settlement engine (FIXED/PERCENT/ONE_TIME) | **C. CLONE** — portable |
| Reading review / thresholds | **D. REFERENCE** — MeterVerse has ValidationRule/Reading review already |
| Auth/RBAC (flask-login) | **E. OBSOLETE** — MeterVerse has JWT+RBAC |
| Report generation (fpdf2) | **D. REFERENCE** — MeterVerse has reporting-engine |
| Excel import templates | **B. ADAPTABLE** — Solar invoice/payment XLSX templates |
| Energy360 / Symbiot integrations | **C. CLONE** — MeterVerse has gateway/symbiot modules (partial) |
