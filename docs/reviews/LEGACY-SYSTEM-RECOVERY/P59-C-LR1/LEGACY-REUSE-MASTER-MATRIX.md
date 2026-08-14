# LEGACY REUSE MASTER MATRIX — P59-C/LR-1

**Date:** 2026-08-14
**Baseline:** d84af62c
**Principle:** MeterVerse is the architectural master; legacy = source material. Reuse value, not architecture.

## Classification Legend
A = DIRECT REUSE · B = ADAPT/PORT · C = EXTRACT BUSINESS RULE ONLY · D = REFERENCE ONLY · E = REJECT · F = NEEDS MORE EVIDENCE

| # | Legacy Capability | Source (System/File) | Evidence | MeterVerse Equivalent | Existing? | Classification | Reuse Type | Adaptation | Risk | Time Saved | Priority |
|---|-------------------|----------------------|----------|----------------------|-----------|----------------|------------|------------|------|------------|----------|
| 1 | **Solar wallet / net metering** | Collection `routes_admin.py:630-697`, `models.py` (SolarWalletTransaction, solar_register_180/280) | Exact runtime algorithm captured | None (no SolarWallet/Solar register) | **MISSING** | **B ADAPT** | Port algorithm to MeterVerse | Medium | Medium | High | **P1** |
| 2 | **Settlement engine (FIXED/PERCENT/ONE_TIME)** | Collection `charge_engine.py:74-112`, `models.py` (Settlement) | Full function + model | None (no Settlement entity) | **MISSING** | **B ADAPT** | Port logic to InvoiceItem pipeline | Small | Low | High | **P1** |
| 3 | **Charge types STATIC/PER_UNIT/ZERO** | Collection `charge_engine.py:45-58` | Full logic | `ChargeRule` (fixed/rate_based only) | **PARTIAL** | **B ADAPT** | Extend ChargeRule types | Small | Low | Medium | **P2** |
| 4 | **Charge types STEPS/FLAT** | Collection `charge_engine.py:23-43` | Full logic | `applyTariff` tiers+rates (`business-engine.js:56-86`) | **ALREADY PRESENT** | **E REJECT (reuse none)** | — | None | None | — | — |
| 5 | **Solar Excel import templates** | Collection `Solar_*_Import.xlsx` (Customers 55×25, Invoices 2797×6, Payments 964×6) | Columns captured | `ImportJob`/`ExcelJob` | PARTIAL | **A DIRECT REUSE** | Adopt XLSX schemas | Low | Low | Medium | **P2** |
| 6 | **Cheque processing** | Collection `models.py` (Cheque) | Model present (fields not fully read) | None | **MISSING** | **F NEEDS EVIDENCE** | Read Cheque model + lifecycle | Medium | Medium | Medium | P3 |
| 7 | **POS terminals** | Collection `models.py` (POSTerminal) | Model present | None | **MISSING** | **F NEEDS EVIDENCE** | Read model + workflow | Medium | Medium | Medium | P3 |
| 8 | **Payment centers / bank accounts** | Collection `models.py` (PaymentCenter, BankAccount) | Models present | None | **MISSING** | **F NEEDS EVIDENCE** | Read models | Medium | Medium | Medium | P3 |
| 9 | **Chilled-water settlement** | Collection `models.py` (ChilledWaterConfig/Settlement), `tests/test_chilled_settlement.py` | Business rules + tests captured | None (no chilled-water module) | **MISSING** | **F NEEDS EVIDENCE** | Business scope + design | High | High | Medium | P3 |
| 10 | **Symbiot AMI/MDM protocol inventory** | New folder 2 (`all-last-update/sys_n/`, 5,952 files, 25+ protocols) | sys_n README + structure | `gateways`, SEP bridge (planned) | PARTIAL | **C EXTRACT RULES** | Extract protocol/OBIS knowledge | Medium | Medium | High | **P2** |
| 11 | **SBill tax/fee rules (15%/1%/14%)** | SBill `architecture/01-legacy-core-architecture-report.md` | Documented rates | `TariffTax`, `InvoiceTax` | PARTIAL | **C EXTRACT RULES** | Seed tax configs | Low | Low | Medium | P2 |
| 12 | **SBill historical data (PalmHills/Energy360_V4)** | SBill SQL Server (analyzed) | db report | `meter_pulse` | — | **B ADAPT (migrate)** | Data migration | High | High | High | P3 |
| 13 | **Reading review / thresholds** | Collection `models.py` (ReadingReview, ReadingThreshold) | Models present | `Reading.status`, `ValidationRule` | ALREADY PRESENT | **E REJECT** | — | None | None | — | — |
| 14 | **Customer ledger** | Collection `CustomerLedgerEntry` | Model | `CustomerLedgerEntry` | ALREADY PRESENT | **E REJECT** | — | — | — | — | — |
| 15 | **Journal / GL** | Collection `JournalEntry(+Detail)` | Model | `JournalEntry`, `GeneralLedgerEntry`, `JournalLineItem` | ALREADY PRESENT (richer) | **E REJECT** | — | — | — | — | — |
| 16 | **RBAC (flask-login)** | Collection `routes_api.py` | require_role | `Role/Permission/PermissionOnRole` (JWT) | ALREADY PRESENT (better) | **E REJECT** | — | — | — | — | — |
| 17 | **Reports (fpdf2/Excel)** | Collection | requirements | `reporting-engine` | ALREADY PRESENT (better) | **E REJECT** | — | — | — | — | — |
| 18 | **IMS UI pages** | IMS HTML | file inventory | MeterVerse shadcn/ui pages | ALREADY PRESENT (better) | **E REJECT** | — | — | — | — | — |
| 19 | **Energy360 portal** | New folder 2 | SBill report | `customer-portal` routes | PARTIAL | **D REFERENCE** | UX patterns | — | — | — | P4 |
| 20 | **Fawry payments** | Energy360 | SBill report | `PaymentGateway` | PARTIAL | **C EXTRACT** | Gateway config | Low | Low | Medium | P2 |
| 21 | **Water balance** | Collection `WaterBalance` | Model | `Consumption` | PARTIAL | **D REFERENCE** | — | — | — | — | P4 |
| 22 | **Bill cycle / active cycle lookup** | Collection `charge_engine.py:125-136` | Function | `BillCycle` | ALREADY PRESENT | **E REJECT** | — | — | — | — | — |
| 23 | **Notification queue** | Collection `NotificationQueue/History` | Models | `Notification`, `EmailLog`, `SmsLog`, `PushNotification` | ALREADY PRESENT (richer) | **E REJECT** | — | — | — | — | — |
| 24 | **Test knowledge (chilled settlement carry-forward)** | Collection `tests/test_chilled_settlement.py` | Test captured | (no chilled module) | MISSING | **C EXTRACT** | Reuse test design | Low | Low | Medium | P3 |

## Summary
- **ALREADY PRESENT (reject legacy code):** #4, 13, 14, 15, 16, 17, 18, 22, 23
- **MISSING — genuine recovery candidates:** #1 solar, #2 settlements, #6/7/8 cheque/POS/payment-center, #9 chilled water
- **PARTIAL — adapt/extract:** #3 charge types, #5 templates, #10 Symbiot protocols, #11 SBill taxes, #20 Fawry
- **Data migration:** #12 SBill SQL Server
- **Needs more evidence:** #6, 7, 8, 9 (models exist; lifecycle/rules need full read)
