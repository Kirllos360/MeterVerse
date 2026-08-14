# LEGACY ↔ METERVERSE DATABASE COMPARISON

**No schema changes made. Comparison only.**

---

## 1. Databases Found

| System | Engine | DB Name | Evidence |
|--------|--------|---------|----------|
| Collection System | PostgreSQL (+SQLite stubs) | (alembic-managed) / `october.db`, `sodic_ednc.db` stubs | alembic.ini, DBS/ |
| SBill / October Billing | SQL Server | `PalmHills_Billing`, `Energy360_V4` | sbill database-analysis report |
| Energy360 | SQL Server | `Energy360_V4` | sbill report |
| Symbiot | MSSQL (per AMI/MDM) | (not inspected — resource inventory) | sys_n README |
| MeterVerse | PostgreSQL 16 | `meter_pulse` | live |

## 2. Collection System → MeterVerse Table Mapping

### EXISTS IN BOTH (concept)

| Collection System | MeterVerse | Notes |
|-------------------|------------|-------|
| Customer | Customer | ✓ |
| CustomerMeter | MeterAssignment | ✓ |
| MeterReading | Reading | ✓ |
| Tariff / TariffVersion / TariffCharge | Tariff / TariffVersion / TariffCharge? | MeterVerse uses TariffRate/TariffTier/TariffVersion* |
| InvoiceDetail | Invoice + InvoiceItem | ✓ |
| Transaction / PaymentAllocation | Payment + PaymentTransaction | allocation differs |
| CustomerLedgerEntry | CustomerLedgerEntry | ✓ |
| JournalEntry | JournalEntry + GeneralLedgerEntry | ✓ |
| SIMCard | SIMCard + SIMAssignment | ✓ |
| BillCycle | BillCycle | ✓ |
| AuditLog | AuditEntry | ✓ |
| Approval | ApprovalRequest | ✓ |
| Area / Project | Area / Project | ✓ |

### LEGACY HAS / METERVERSE DOES NOT (gaps)

| Collection System | Notes |
|-------------------|-------|
| Settlement | invoice surcharge engine |
| SolarWalletTransaction | net-metering wallet |
| ChilledWaterConfig / ChilledWaterSettlement | chilled-water billing |
| Cheque | cheque processing |
| POSTerminal | POS cash collection |
| PaymentCenter / BankAccount | collection centers |
| WaterBalance | water meter balance |
| ReadingThreshold / ReadingReview | reading validation queue |
| PaymentFee / PaymentChannel | fee/collection channel config |
| CancelledInvoice / InvoiceAdjustment | invoice lifecycle events |

### METERVERSE HAS / LEGACY DOES NOT

CollectionCase / CollectionAction / PromiseToPay · SLA / escalation · Governance suite · AI models (revenue leakage, forecasting) · Financial period/budget/forecast/IFRS · Document management · Workflow engine · Incident/knowledge/learned-patterns · Tenant subscription · Dunning/installments/disputes · Bad-debt provisioning · KPI/health/business-intelligence

### SAME CONCEPT, DIFFERENT MODEL

| Concept | Legacy | MeterVerse |
|---------|--------|------------|
| Tariff charges | TariffCharge (5 types) | TariffRate/TariffTier/TariffFixedCharge/TariffDemandRate |
| Payments | Transaction + PaymentAllocation | Payment + PaymentTransaction + PaymentGateway |
| Readings | MeterReading (single table) | Reading + Consumption + Result/MPRTFk (5.8.0 combined) |
| RBAC | flask-login roles | Role/Permission/PermissionOnRole (JWT) |

### POSSIBLE LEGACY DATA MIGRATION SOURCE

- SBill `PalmHills_Billing` / `Energy360_V4` (SQL Server) → MeterVerse (already planned per sbill migration-plan docs)
- Collection System SQLite/PostgreSQL operational data → not yet mapped (business-decision pending)

### CONFLICTING BUSINESS MEANING

- **Solar meter readings:** Collection uses 1.8.0/2.8.0 OBIS codes (consumption/production). MeterVerse uses 5.8.0 combined (Import+Export) per AGENTS.md. **These are different OBIS/measurement models — must NOT be merged blindly.**
- Payment allocation semantics differ between `PaymentAllocation` (legacy) and `PaymentTransaction` (MeterVerse).

## 3. Summary

- 20+ concepts exist in both (safe to compare/migrate).
- 11 legacy-only entities are candidate **clone/recovery** targets (Settlement, SolarWallet, ChilledWater, Cheque, POS, PaymentCenter/BankAccount, WaterBalance, ReadingThreshold/Review, PaymentFee/Channel, CancelledInvoice/Adjustment).
- 25+ MeterVerse-only entities confirm MeterVerse is architecturally ahead (finance/AI/governance).
- OBIS model difference (1.8.0/2.8.0 vs 5.8.0) is a **conflicting business meaning** — flagged, not resolved.
