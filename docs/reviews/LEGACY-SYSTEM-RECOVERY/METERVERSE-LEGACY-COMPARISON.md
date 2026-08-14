# METERVERSE ↔ LEGACY SYSTEM COMPARISON

**Current MeterVerse authoritative.** Legacy systems are source material only.

---

## 1. Component Matrix

| Legacy Component | Legacy System | Current MeterVerse Equivalent | Status | Recommendation |
|------------------|---------------|------------------------------|--------|----------------|
| Customer management | Collection / SBill / IMS | `Customer` model + routes | Already present | Keep current |
| Meter management | Collection / SBill / IMS | `Meter`, `MeterType` | Already present | Keep current |
| Meter assignment | Collection (`CustomerMeter`) | `MeterAssignment` + history | Already present | Keep current |
| Readings + validation | Collection (`ReadingReview/Threshold`) | `Reading`, `ValidationRule`, `ValidationResult` | Already present | Keep current |
| Tiered/FLAT tariff engine | Collection (`charge_engine`) | `Tariff`, `TariffRate`, `TariffTier`, `TariffVersion*` | Partially present (STATIC/PER_UNIT/ZERO?) | **Clone behavior** (verify charge types) |
| **Settlement engine (FIXED/PERCENT/ONE_TIME)** | Collection | **none** | **Missing** | **Clone** |
| **Solar wallet / net metering** | Collection (`SolarWalletTransaction`) | **none** | **Missing** | **Clone** |
| **Chilled-water settlement** | Collection | **none** | **Missing** | **Business review / clone** |
| **Cheque processing** | Collection (`Cheque`) | **none** | **Missing** | **Clone/adapt** |
| **POS terminals** | Collection (`POSTerminal`) | **none** | **Missing** | **Adapt** |
| Payment channels/allocations | Collection (`PaymentChannel/PaymentAllocation`) | `Payment`, `PaymentTransaction`, `PaymentGateway` | Partially present | Compare allocation logic |
| Ledger | Collection (`JournalEntry`) | `JournalEntry`, `GeneralLedgerEntry`, `CustomerLedgerEntry` | Already present (richer) | Keep current |
| Customer ledger | Collection (`CustomerLedgerEntry`) | `CustomerLedgerEntry` | Already present | Keep current |
| Water balance | Collection (`WaterBalance`) | `Consumption` | Partially present | Reference |
| SIM management | Collection (`SIMCard`) | `SIMCard`, `SIMAssignment` | Already present | Keep current |
| Approvals/workflows | Collection (`Approval`) | `ApprovalRequest`, `WorkflowDefinition*` | Already present (richer) | Keep current |
| Trouble tickets | Collection (`TroubleTicket`) | `Ticket`, `Incident`, `ServiceRequest` | Already present (richer) | Keep current |
| Notifications | Collection (`NotificationQueue`) | `Notification`, `NotificationTemplate`, `EmailLog`, `SmsLog` | Already present (richer) | Keep current |
| RBAC | Collection (flask-login roles) | `Role`, `Permission`, `PermissionOnRole` (JWT) | Already present (better) | Keep current |
| Reporting | Collection (fpdf2/Excel) | `reporting-engine`, `ReportDefinition`, `ScheduledReport` | Already present (better) | Keep current |
| Import/export (Excel) | Collection (Solar XLSX templates) | `ImportJob`, `ExportJob`, `ExcelJob` | Already present | **Adapt** Solar templates |
| Energy360 portal | SBill/Energy360 | `customer-portal` routes | Partially present | Reference |
| Fawry payments | Energy360 | `PaymentGateway` | Partially present | **Adapt** (gateway config) |
| Symbiot SEP integration | SBill/Symbiot | `gateways`, `sim`, SEP modules | Partially present | **Adapt** from Symbiot resource |
| Solar invoicing/payments | Collection (CR 2047) | **none** | **Missing** | **Clone** |
| Chilled-water invoices | Collection | **none** | **Missing** | **Business review** |
| MDM/protocol layer | Symbiot | `gateways` (planned) | Missing (planned) | Reference for bridge |
| Multi-area DB model | SBill (per-area DBs) | `Area` + tenancy | Already present (logical) | Keep current |

## 2. Missing-in-MeterVerse Gaps (from legacy)

1. **Settlement engine** (FIXED/PERCENTAGE/ONE_TIME invoice surcharges)
2. **Solar wallet / net metering** (prepaid credit, surplus carry)
3. **Chilled-water billing module**
4. **Cheque / POS processing**
5. **Solar invoice/payment Excel import templates**

## 3. Better-in-Legacy Items (candidates to recover)

| Item | Legacy evidence |
|------|-----------------|
| Solar wallet algorithm | CR 2047 Excel formulas + business-rule-discovery.md |
| Settlement rule engine | charge_engine.py |
| Cheque processing models | models.py (`Cheque`) |
| Chilled-water settlement workflow | ChilledWaterConfig/Settlement + operational PDFs |
| Symbiot protocol/MDM inventory | sys_n (5,952 files) |

## 4. Better-in-MeterVerse (no action)

Dashboard/KPI UI · RBAC (JWT+permissions) · Reporting engine · Notifications · Ledger (GL) · Workflows/approvals · Documents · AI/incident/knowledge modules.
