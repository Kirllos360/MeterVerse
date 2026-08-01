<!-- Status Block
====================================================================
Design: [x] Complete | Implementation: [ ] Not Started | Certification: [ ] Not Certified | Wave: W2 | Commit: 67cab1af
====================================================================
-->

# C13-W02 â€” Enterprise Revenue Assurance Intelligence Engine
## Blueprint

**Version:** 1.0.0  
**Status:** READ ONLY â€” GOVERNANCE PLANNING ONLY â€” NOT IMPLEMENTED  
**Date:** 2026-07-29  
**Program:** C13 Enterprise Financial & Billing Intelligence Platform  
**Wave:** W02 (Revenue Assurance â€” builds on W01 billing-to-GL foundation)  

---

## PART 1: EXISTING FOUNDATION AUDIT

### 1.1 What Already Exists

| Component | File | Status | Utility for W02 |
|-----------|------|--------|-----------------|
| `ValidationRule` model | `schema.prisma:1324` | âœ… Complete | Reusable â€” entityType, condition (JSON), severity, priority |
| `ValidationResult` model | `schema.prisma:1341` | âœ… Complete | Reusable â€” status, resolvedAt/by, message |
| `validation-engine.js` | `services/validation-engine.js` | âœ… Basic | Currently only validates reading values (min/max) |
| `AlertRule` model | `schema.prisma:1610` | âœ… Complete | Reusable â€” entityType, condition, severity, cooldown |
| `Alert` model | `schema.prisma:1625` | âœ… Complete | Reusable â€” fingerprint (dedup), status, acknowledgedAt |
| `KpiDefinition` + `KpiSnapshot` | `schema.prisma:716-738` | âœ… Complete | Reusable for revenue KPI tracking |
| `ai-engine.js` â€” `aiReadingValidator` | `services/ai-engine.js:83` | âœ… Basic | Checks reading spikes against threshold |
| `ai-engine.js` â€” `aiBillingAssistant` | `services/ai-engine.js:197` | âœ… Basic | Generates revenue summary |
| `Invoice` model | `schema.prisma:985` | âœ… Complete | Has amount, status, paidAmount, periodStart/End |
| `BillRun` model | `schema.prisma:1154` | âœ… Complete | Has periodStart, periodEnd, status, totalAmount |
| `MeterReading` | `schema.prisma` | âœ… Complete | Has value, timestamp, status, meterId |
| `Tariff` + `TariffRate` + `TariffTier` | `schema.prisma:1088-1153` | âœ… Complete | Flat rate CRUD, tier structure defined |
| `FinancialEvent` model | Planned in W01 | âŒ W01 | Post-W01: source for leakage analysis |
| `AccountMapping` model | Planned in W01 | âŒ W01 | Post-W01: tariff â†’ account mapping |

### 1.2 Existing Validation Pipeline

```
Meter Reading Created
    â†’ validation-engine.js:validateReading()
        â†’ Loads all active ValidationRules WHERE entityType="reading"
        â†’ Evaluates each rule's condition JSON against reading data
        â†’ Creates ValidationResult (passed/failed)
        â†’ Returns results array
    â†’ If failed â†’ reading status can be flagged
    âŒ No pre-bill validation pipeline
    âŒ No invoice-level validation
    âŒ No consumption-to-bill reconciliation
    âŒ No tariff application validation
    âŒ No revenue-level rules
```

### 1.3 Gap Analysis

| Capability | Current State | W02 Target |
|------------|---------------|------------|
| Reading-level validation | âœ… Basic min/max | âœ… Enhanced with trend/spike/pattern detection |
| Pre-bill validation | âŒ Missing | âœ… 15 rules blocking/pre-flagging before invoice generation |
| Invoice anomaly detection | âŒ Missing | âœ… 10 anomaly detectors on invoice issue |
| Consumption-to-bill reconciliation | âŒ Missing | âœ… Automated comparison: readings Ã— tariff = invoice |
| Tariff application validation | âŒ Missing | âœ… Verify correct tariff applied per customer type |
| Revenue leakage detection | âŒ Missing | âœ… 8 leakage patterns detected |
| Missing revenue identification | âŒ Missing | âœ… Unbilled consumption, unissued invoices |
| Duplicate billing prevention | âŒ Missing | âœ… Duplicate detection at bill run + invoice level |
| Unbilled consumption detection | âŒ Missing | âœ… Active meter + no invoice = alert |
| Risk scoring | âŒ Missing | âœ… Risk score per finding, customer, area |
| Investigation workflow | âŒ Missing | âœ… Assign, investigate, resolve, prevent |
| Evidence collection | âŒ Missing | âœ… Auto-collect relevant records for each finding |
| AI Revenue Agent | âŒ Missing | âœ… Semi-autonomous agent with governance |
| Revenue dashboard | âŒ Missing | âœ… KPIs, trends, open findings, leakage by category |

---

## PART 2: REVENUE ASSURANCE ARCHITECTURE

### 2.1 End-to-End Pipeline

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                      REVENUE ASSURANCE PIPELINE                                        â”‚
â”‚                                                                                       â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  STAGE 1: PRE-BILL VALIDATION (runs before invoice generation)                â”‚    â”‚
â”‚  â”‚                                                                                â”‚    â”‚
â”‚  â”‚  For each customer/meter in bill run:                                         â”‚    â”‚
â”‚  â”‚   1. Check reading completeness  â”€â”€missingâ†’ FLAG: MissingReadings             â”‚    â”‚
â”‚  â”‚   2. Check consumption trend     â”€â”€spike/dropâ†’ FLAG: ConsumptionAnomaly      â”‚    â”‚
â”‚  â”‚   3. Check meter status          â”€â”€inactiveâ†’ FLAG: InactiveMeterActiveBill   â”‚    â”‚
â”‚  â”‚   4. Check tariff validity       â”€â”€mismatchâ†’ FLAG: TariffMisapplication      â”‚    â”‚
â”‚  â”‚   5. Check previous period billedâ”€â”€duplicateâ†’ FLAG: DuplicatePeriod          â”‚    â”‚
â”‚  â”‚   6. Check customer status       â”€â”€suspendedâ†’ FLAG: SuspendedCustomerBill    â”‚    â”‚
â”‚  â”‚                                                                                â”‚    â”‚
â”‚  â”‚  RESULT: PASS (continue) or BLOCK (flag + notify) or WARN (flag + continue)   â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                    â”‚                                                  â”‚
â”‚                                    â–¼                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  STAGE 2: BILLING CALCULATION                                                  â”‚    â”‚
â”‚  â”‚                                                                                â”‚    â”‚
â”‚  â”‚  consumption = Î£(readings)                                                    â”‚    â”‚
â”‚  â”‚  invoice_amount = tariff.apply(consumption)                                   â”‚    â”‚
â”‚  â”‚  expected_amount = consumption Ã— tariff_rate                                  â”‚    â”‚
â”‚  â”‚                                                                                â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€ DEVIATION CHECK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”          â”‚    â”‚
â”‚  â”‚  â”‚  IF |invoice_amount - expected_amount| / expected_amount > 0.01 â”‚          â”‚    â”‚
â”‚  â”‚  â”‚  THEN FLAG: BillingCalculationDiscrepancy                       â”‚          â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜          â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                    â”‚                                                  â”‚
â”‚                                    â–¼                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  STAGE 3: POST-BILL VALIDATION (runs after invoice generation)                â”‚    â”‚
â”‚  â”‚                                                                                â”‚    â”‚
â”‚  â”‚  For each generated invoice:                                                  â”‚    â”‚
â”‚  â”‚   1. Check invoice amount vs 6-month average  â”€â”€> 2x â†’ FLAG                   â”‚    â”‚
â”‚  â”‚   2. Check invoice amount vs prior period      â”€â”€> 50% change â†’ FLAG          â”‚    â”‚
â”‚  â”‚   3. Check line items sum = invoice total      â”€â”€> mismatch â†’ ERROR            â”‚    â”‚
â”‚  â”‚   4. Check tax calculation                     â”€â”€> wrong rate â†’ FLAG           â”‚    â”‚
â”‚  â”‚   5. Check customer has active contract        â”€â”€> expired â†’ FLAG              â”‚    â”‚
â”‚  â”‚   6. Cross-check: Î£(invoices) = Î£(readings Ã— tariff) â†’ FLAG                   â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                    â”‚                                                  â”‚
â”‚                                    â–¼                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  STAGE 4: CONTINUOUS MONITORING (scheduled daily)                             â”‚    â”‚
â”‚  â”‚                                                                                â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚    â”‚
â”‚  â”‚  â”‚ UNBILLED CONSUMPTION                                                    â”‚  â”‚    â”‚
â”‚  â”‚  â”‚  SELECT meters WHERE status=ACTIVE AND last_bill_date < period_end      â”‚  â”‚    â”‚
â”‚  â”‚  â”‚  AND no invoice exists for the period                                   â”‚  â”‚    â”‚
â”‚  â”‚  â”‚  â†’ FLAG: UnbilledConsumption                                            â”‚  â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚    â”‚
â”‚  â”‚                                                                                â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚    â”‚
â”‚  â”‚  â”‚ REVENUE TREND ANALYSIS                                                  â”‚  â”‚    â”‚
â”‚  â”‚  â”‚  Compare daily/weekly/monthly revenue against forecast                  â”‚  â”‚    â”‚
â”‚  â”‚  â”‚  IF actual < forecast - 3Ïƒ â†’ FLAG: RevenueDrop                         â”‚  â”‚    â”‚
â”‚  â”‚  â”‚  IF actual > forecast + 3Ïƒ â†’ FLAG: RevenueSpike                        â”‚  â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚    â”‚
â”‚  â”‚                                                                                â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚    â”‚
â”‚  â”‚  â”‚ DUPLICATE DETECTION                                                      â”‚  â”‚    â”‚
â”‚  â”‚  â”‚  SELECT invoices WHERE same customer + same period + same amount        â”‚  â”‚    â”‚
â”‚  â”‚  â”‚  AND status != cancelled                                                â”‚  â”‚    â”‚
â”‚  â”‚  â”‚  â†’ FLAG: DuplicateInvoice                                               â”‚  â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚    â”‚
â”‚  â”‚                                                                                â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚    â”‚
â”‚  â”‚  â”‚ GL RECONCILIATION                                                       â”‚  â”‚    â”‚
â”‚  â”‚  â”‚  Î£(invoice amounts) vs Î£(revenue journal entries) for same period       â”‚  â”‚    â”‚
â”‚  â”‚  â”‚  IF mismatch > threshold â†’ FLAG: RevenueGLMismatch                      â”‚  â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                    â”‚                                                  â”‚
â”‚                                    â–¼                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  STAGE 5: INVESTIGATION & RESOLUTION                                          â”‚    â”‚
â”‚  â”‚                                                                                â”‚    â”‚
â”‚  â”‚  Finding Created (status: OPEN)                                               â”‚    â”‚
â”‚  â”‚    â†’ Auto-collect evidence (readings, invoices, tariff, history)             â”‚    â”‚
â”‚  â”‚    â†’ Assign risk score (0-100)                                                â”‚    â”‚
â”‚  â”‚    â†’ Auto-assign to team (billing | meter | customer)                        â”‚    â”‚
â”‚  â”‚    â†’ Notify assignee                                                          â”‚    â”‚
â”‚  â”‚                                                                                â”‚    â”‚
â”‚  â”‚  Investigation:                                                               â”‚    â”‚
â”‚  â”‚    â†’ Review evidence                                                          â”‚    â”‚
â”‚  â”‚    â†’ Determine root cause                                                     â”‚    â”‚
â”‚  â”‚    â†’ Estimate financial impact                                                â”‚    â”‚
â”‚  â”‚    â†’ Propose correction action                                                â”‚    â”‚
â”‚  â”‚                                                                                â”‚    â”‚
â”‚  â”‚  Resolution:                                                                  â”‚    â”‚
â”‚  â”‚    â†’ Approve correction                                                       â”‚    â”‚
â”‚  â”‚    â†’ Execute (re-bill, adjust, cancel, write-off)                             â”‚    â”‚
â”‚  â”‚    â†’ Verify correction                                                        â”‚    â”‚
â”‚  â”‚    â†’ Close finding                                                            â”‚    â”‚
â”‚  â”‚    â†’ Update LearnedPattern (AI learning)                                      â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                                                       â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  DASHBOARD & REPORTING                                                        â”‚    â”‚
â”‚  â”‚                                                                                â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚    â”‚
â”‚  â”‚  â”‚ Revenue Leakage     â”‚  â”‚ Open Findings       â”‚  â”‚ Risk Heatmap          â”‚  â”‚    â”‚
â”‚  â”‚  â”‚ Total: X EGP        â”‚  â”‚ Critical: X         â”‚  â”‚ Customer, Area,       â”‚  â”‚    â”‚
â”‚  â”‚  â”‚ Recovered: Y EGP    â”‚  â”‚ High: Y             â”‚  â”‚ Project, Utility      â”‚  â”‚    â”‚
â”‚  â”‚  â”‚ At Risk: Z EGP      â”‚  â”‚ Medium: Z           â”‚  â”‚ â”Œâ”€â”€â” â”Œâ”€â”€â” â”Œâ”€â”€â” â”Œâ”€â”€â”  â”‚  â”‚    â”‚
â”‚  â”‚  â”‚ Trend: â†‘â†“â†’          â”‚  â”‚ Low: W              â”‚  â”‚ â”‚H â”‚ â”‚M â”‚ â”‚L â”‚ â”‚C â”‚  â”‚  â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚ â””â”€â”€â”˜ â””â”€â”€â”˜ â””â”€â”€â”˜ â””â”€â”€â”˜  â”‚  â”‚    â”‚
â”‚  â”‚                                                     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.2 Detection Rules â€” Master List (15 Rules)

| ID | Rule | Stage | Severity | Action | Auto-Resolvable |
|----|------|-------|----------|--------|-----------------|
| RA-001 | **Missing Readings** â€” Meter has no readings for billing period | Pre-bill | ERROR | BLOCK invoice generation | âŒ |
| RA-002 | **Consumption Spike** â€” Current period > 3Ã— 6-month avg | Pre-bill | WARNING | FLAG + allow | âŒ |
| RA-003 | **Consumption Drop** â€” Current period < 10% of 6-month avg | Pre-bill | WARNING | FLAG + allow | âŒ |
| RA-004 | **Inactive Meter Active Bill** â€” Meter status â‰  ACTIVE but billed | Pre-bill | ERROR | BLOCK | âŒ |
| RA-005 | **Tariff Misapplication** â€” Customer type â‰  tariff eligibility | Pre-bill | ERROR | BLOCK | âœ… (auto-correct) |
| RA-006 | **Duplicate Period** â€” Customer already billed for same period | Pre-bill | ERROR | BLOCK | âœ… |
| RA-007 | **Suspended Customer Bill** â€” Customer status = suspended | Pre-bill | ERROR | BLOCK | âŒ |
| RA-008 | **Billing Calculation Discrepancy** â€” Invoice â‰  expected | Post-bill | ERROR | FLAG | âŒ |
| RA-009 | **Amount Spike** â€” Invoice amount > 2Ã— 6-month avg | Post-bill | WARNING | FLAG | âŒ |
| RA-010 | **Line Item Mismatch** â€” Î£(items) â‰  invoice.total | Post-bill | ERROR | FLAG | âœ… (auto-recalc) |
| RA-011 | **Tax Mismatch** â€” Tax rate â‰  customer's applicable rate | Post-bill | WARNING | FLAG | âœ… (auto-correct) |
| RA-012 | **Expired Contract** â€” Customer contract expired at billing date | Post-bill | WARNING | FLAG | âŒ |
| RA-013 | **Unbilled Consumption** â€” Active meter + no invoice â‰¥ 45 days | Continuous | WARNING | FLAG | âŒ |
| RA-014 | **Duplicate Invoice** â€” Same customer + period + amount | Continuous | ERROR | FLAG | âœ… (auto-cancel) |
| RA-015 | **GL Revenue Mismatch** â€” Î£(invoices) â‰  Î£(revenue JE) for period | Continuous | CRITICAL | FLAG | âŒ |

### 2.3 Rule Evaluation Engine

```
RevenueRule (extends existing ValidationRule concept):

  RevenueRule {
    id, code, name, description,
    category: "pre_bill" | "post_bill" | "continuous",
    severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL",
    action: "BLOCK" | "FLAG" | "NOTIFY",
    condition: JSON (evaluable expression),
    autoResolvable: Boolean,
    cooldown: Int (seconds, prevent repeat alerts),
    active: Boolean,
    priority: Int (evaluation order),
    effectiveFrom: DateTime,
    effectiveTo: DateTime?,
    metadata: JSON (custom params per rule type)
  }

  Evaluation:
    RevenueRuleEngine.evaluate(rule, context):
      context = {
        customer, meter, readings, tariff,
        invoice, period, consumption,
        historicalAverages, customerType
      }
      
      switch rule.category:
        "pre_bill": evaluate BEFORE invoice generation
        "post_bill": evaluate AFTER invoice generation
        "continuous": evaluate on schedule (cron)
      
      return {
        passed: Boolean,
        finding: RevenueLeakageFinding? (if failed),
        score: Float (0-100, severity-weighted)
      }
```

---

## PART 3: DATA MODEL DESIGN

### 3.1 RevenueLeakageFinding (NEW)

**Purpose:** Record every revenue assurance finding with full traceability, evidence, and resolution workflow.

```
RevenueLeakageFinding
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ ruleId: String                   â† FK â†’ RevenueRule (or ValidationRule)
â”œâ”€â”€ findingType: String              â† consumption_spike | tariff_mismatch | unbilled | duplicate | etc.
â”œâ”€â”€ severity: String                 â† INFO | WARNING | ERROR | CRITICAL
â”œâ”€â”€ status: String                   â† OPEN | INVESTIGATING | RESOLVED | DISMISSED
â”‚   Default: "OPEN"
â”œâ”€â”€ description: String              â† Human-readable finding description
â”œâ”€â”€ affectedEntityType: String       â† INVOICE | METER | CUSTOMER | BILL_RUN | READING
â”œâ”€â”€ affectedEntityId: String         â† FK to the affected record
â”œâ”€â”€ customerId: String?              â† FK â†’ Customer
â”œâ”€â”€ areaId: String?                  â† For filtering/scoping
â”œâ”€â”€ projectId: String?
â”œâ”€â”€ periodId: String?                â† FK â†’ FinancialPeriod (if applicable)
â”œâ”€â”€ invoiceId: String?               â† FK â†’ Invoice (if invoice-level)
â”œâ”€â”€ meterId: String?                 â† FK â†’ Meter (if meter-level)
â”œâ”€â”€ readingId: String?               â† FK â†’ Reading (if reading-level)
â”œâ”€â”€ expectedValue: Float?            â† What the value should be
â”œâ”€â”€ actualValue: Float?              â† What the value actually was
â”œâ”€â”€ variance: Float?                 â† |expected - actual|
â”œâ”€â”€ variancePct: Float?              â† variance / expected Ã— 100
â”œâ”€â”€ estimatedImpact: Float?          â† EGP impact estimate
â”œâ”€â”€ recoveredAmount: Float?          â† EGP recovered after correction
â”œâ”€â”€ riskScore: Float?                â† Computed score (0-100)
â”œâ”€â”€ evidence: String?                â† JSON array of evidence records
â”œâ”€â”€ assignedTo: String?              â† FK â†’ User
â”œâ”€â”€ assignedAt: DateTime?
â”œâ”€â”€ startedAt: DateTime?             â† When investigation started
â”œâ”€â”€ resolvedAt: DateTime?            â† When resolved
â”œâ”€â”€ resolvedBy: String?              â† FK â†’ User (who resolved)
â”œâ”€â”€ resolutionType: String?          â† CORRECTED | REBILLED | WRITTEN_OFF | DISMISSED
â”œâ”€â”€ resolutionNote: String?          â† How it was resolved
â”œâ”€â”€ correctionJournalId: String?     â† FK â†’ JournalEntry (if correction posted)
â”œâ”€â”€ rootCause: String?               â† CAPTURED root cause analysis
â”œâ”€â”€ preventedBy: String?             â† What changed to prevent recurrence
â”œâ”€â”€ createdAt: DateTime
â”œâ”€â”€ archivedAt: DateTime?

Indexes:
  @@index([status, severity])
  @@index([customerId, status])
  @@index([ruleId, createdAt])
  @@index([areaId, status])
  @@index([findingType, severity])
  @@index([createdAt])
```

### 3.2 RevenueInvestigation (NEW)

**Purpose:** Track investigation actions on revenue findings.

```
RevenueInvestigation
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ findingId: String                â† FK â†’ RevenueLeakageFinding
â”œâ”€â”€ action: String                   â† REVIEWED | CONTACTED_CUSTOMER | REQUESTED_DATA |
â”‚                                        CHECKED_METER | ANALYZED_READINGS | PROPOSED_CORRECTION
â”œâ”€â”€ description: String
â”œâ”€â”€ performedBy: String              â† FK â†’ User
â”œâ”€â”€ evidenceSnapshot: String?        â† JSON of evidence at time of action
â”œâ”€â”€ createdAt: DateTime
â”œâ”€â”€ archivedAt: DateTime?

Index:
  @@index([findingId, createdAt])
```

### 3.3 RevenueRule (NEW â€” or extend ValidationRule)

Rather than creating a new model from scratch, W02 can extend the existing `ValidationRule` model with revenue-specific fields, OR create a `RevenueRule` model. The cleanest approach is to use the existing `ValidationRule` (which already has entityType, condition, severity, priority, active) and add a migration with new fields:

**Strategy: Extend existing ValidationRule**

| New Field | Type | Purpose |
|-----------|------|---------|
| `category` extension | Add "pre_bill", "post_bill", "continuous" to entityType | Determines when rule runs |
| `autoResolvable` | Boolean @default(false) | Can AI auto-resolve? |
| `cooldown` | Int @default(3600) | Seconds between repeat alerts |
| `metadata` | String? (JSON) | Rule-specific params |

**OR if cleaner separation preferred:**

```
RevenueRule (new standalone model)
â”œâ”€â”€ id, code, name, description
â”œâ”€â”€ category: PRE_BILL | POST_BILL | CONTINUOUS
â”œâ”€â”€ severity: INFO | WARNING | ERROR | CRITICAL
â”œâ”€â”€ action: BLOCK | FLAG | NOTIFY
â”œâ”€â”€ condition: String (JSON evaluable)
â”œâ”€â”€ autoResolvable: Boolean
â”œâ”€â”€ cooldown: Int
â”œâ”€â”€ active: Boolean
â”œâ”€â”€ priority: Int
â”œâ”€â”€ effectiveFrom: DateTime
â”œâ”€â”€ effectiveTo: DateTime?
â”œâ”€â”€ metadata: String? (JSON)
â”œâ”€â”€ createdBy: String?
â”œâ”€â”€ createdAt, archivedAt, updatedAt
â”œâ”€â”€ findings RevenueLeakageFinding[]
```

### 3.4 KPI Enhancements (extend existing KpiDefinition)

New revenue-specific KPIs to be tracked via existing `KpiDefinition` + `KpiSnapshot`:

| KPI Name | Category | Unit | Target | Refresh |
|----------|----------|------|--------|---------|
| `revenue_leakage_rate` | revenue | percentage | < 0.5% | Daily |
| `open_findings_count` | revenue | count | < 10 | Real-time |
| `critical_findings_count` | revenue | count | 0 | Real-time |
| `avg_resolution_time` | revenue | hours | < 48 | Weekly |
| `recovery_rate` | revenue | percentage | > 90% | Weekly |
| `unbilled_meters_count` | revenue | count | 0 | Daily |
| `billing_accuracy` | revenue | percentage | > 99.5% | Monthly |
| `pre_bill_block_rate` | revenue | percentage | < 5% | Monthly |
| `revenue_at_risk` | revenue | EGP | trending down | Daily |
| `leakage_by_category` | revenue | EGP | â€” | Daily |

---

## PART 4: AI REVENUE ASSURANCE AGENT

### 4.1 Agent Design

**Agent Name:** Revenue Leakage Detection Agent  
**Framework:** C12-W07 Operational Intelligence (AIRecommendation model, governance rules)  
**Autonomy Level:** âš¡ Semi-autonomous  
**Human Approval:** Required for: correction actions, write-offs, re-billing  
**No Approval Needed For:** Flagging findings, assigning severity, collecting evidence  

### 4.2 Agent Capabilities

| Capability | Description | Autonomy |
|------------|-------------|----------|
| Rule evaluation | Run all 15 detection rules on schedule | âœ… Full |
| Evidence collection | Auto-gather readings, invoices, history for findings | âœ… Full |
| Severity assignment | Score findings by risk/impact | âœ… Full |
| Root cause suggestion | NLP on finding context â†’ suggest probable cause | âœ… Full |
| Correction proposal | Recommend corrective action (re-bill, adjust, cancel) | âš¡ Requires approval |
| Resolution verification | Verify correction was applied correctly | âœ… Full |
| Pattern learning | Update LearnedPattern with finding outcomes | âœ… Full |

### 4.3 Integration with C12-W07

```
Revenue Leakage Detection Agent
    â”‚
    â”œâ”€â”€â†’ AIRecommendation (C12 model)
    â”‚     agentType: "revenue_leakage_detection"
    â”‚     inputSummary: finding description + evidence
    â”‚     output: corrective action proposal
    â”‚     confidence: score (0-1)
    â”‚     status: pending â†’ approved | rejected | modified
    â”‚
    â”œâ”€â”€â†’ LearnedPattern (C12 model)
    â”‚     Pattern: type of leakage detected
    â”‚     Resolution: how it was fixed
    â”‚     Effectiveness: did it prevent recurrence?
    â”‚     Frequency: how often does this pattern repeat?
    â”‚
    â””â”€â”€â†’ AuditEntry (C12 model)
          Every agent action logged
```

### 4.4 Detection Algorithm Examples

**Consumption Spike Detection:**
```
ALGORITHM: detectConsumptionSpike(meterId, periodStart, periodEnd)
  1. Get current period consumption
     currentConsumption = SUM(readings WHERE meterId AND timestamp IN period)
  
  2. Get historical baseline (last 6 complete periods)
     historicalReadings = SUM(readings for each of last 6 periods)
     avgConsumption = AVG(historicalReadings)
     stdDev = STDDEV(historicalReadings)
  
  3. Compute z-score
     zScore = (currentConsumption - avgConsumption) / MAX(stdDev, 0.01)
  
  4. Classify
     IF zScore > 3.0 â†’ CRITICAL spike
     IF zScore > 2.0 â†’ WARNING spike
     IF zScore > 1.5 â†’ INFO increase
     ELSE â†’ normal
  
  5. If flagged: create RevenueLeakageFinding
     findingType: "consumption_spike"
     expectedValue: avgConsumption
     actualValue: currentConsumption
     variance: currentConsumption - avgConsumption
     variancePct: (variance / avgConsumption) Ã— 100
     riskScore: MIN(zScore Ã— 25, 100)
```

**Tariff Misapplication Detection:**
```
ALGORITHM: detectTariffMisapplication(customerId, tariffId)
  1. Get customer type
     customer = Customer.findUnique(customerId)
  
  2. Get tariff eligibility
     tariff = Tariff.findUnique(tariffId)
     eligibleTypes = tariff.eligibleCustomerTypes || ["all"]
  
  3. Check match
     IF "all" IN eligibleTypes â†’ pass (no check needed)
     IF customer.type NOT IN eligibleTypes â†’ MISMATCH
  
  4. If mismatch:
     correctTariff = Tariff.findFirst({
       where: { eligibleCustomerTypes: { has: customer.type }, status: "active" }
     })
     IF correctTariff â†’ suggest correction
     ELSE â†’ flag for manual review
```

**Unbilled Consumption Detection:**
```
ALGORITHM: detectUnbilledConsumption()
  1. Find meters with readings but no bill
     meters = prisma.$queryRaw`
       SELECT m.id, m.serial, MAX(r.timestamp) as last_reading_at
       FROM Meter m
       JOIN Reading r ON r.meter_id = m.id
       LEFT JOIN Invoice i ON i.customer_id = m.customer_id 
         AND i.period_end >= r.timestamp
       WHERE m.status = 'ACTIVE'
         AND m.archived_at IS NULL
       GROUP BY m.id, m.serial
       HAVING MAX(r.timestamp) < NOW() - INTERVAL '45 days'
         OR COUNT(i.id) = 0
     `
  
  2. For each meter without recent invoice:
     create RevenueLeakageFinding(
       findingType: "unbilled_consumption",
       meterId: meter.id,
       estimatedImpact: estimateRevenue(meter),
       riskScore: daysWithoutBill / 45 Ã— 100
     )
```

---

## PART 5: INVESTIGATION & RESOLUTION WORKFLOW

### 5.1 Finding Lifecycle

```
OPEN (auto-detected)
  â”‚
  â”œâ”€â”€â†’ ASSIGNED (to billing/meter/customer team)
  â”‚       â”‚
  â”‚       â–¼
  â”‚   INVESTIGATING
  â”‚       â”‚
  â”‚       â”œâ”€â”€â†’ Evidence reviewed
  â”‚       â”œâ”€â”€â†’ Root cause identified
  â”‚       â”œâ”€â”€â†’ Financial impact estimated
  â”‚       â””â”€â”€â†’ Correction proposed
  â”‚           â”‚
  â”‚           â–¼
  â”‚       AWAITING_APPROVAL
  â”‚           â”‚
  â”‚      â”Œâ”€â”€â”€â”€â”´â”€â”€â”€â”€â”
  â”‚      â”‚         â”‚
  â”‚      â–¼         â–¼
  â”‚  APPROVED   REJECTED
  â”‚      â”‚         â”‚
  â”‚      â–¼         â–¼
  â”‚  CORRECTING  DISMISSED
  â”‚      â”‚
  â”‚      â–¼
  â”‚  VERIFIED
  â”‚      â”‚
  â”‚      â–¼
  â”‚  RESOLVED
  â”‚
  â””â”€â”€â†’ DISMISSED (false positive)
```

### 5.2 Evidence Collection

On finding creation, the system auto-collects:

| Finding Type | Evidence Collected |
|--------------|-------------------|
| Consumption Spike | Last 6 periods' readings, meter events in period, historical avg/stddev |
| Missing Readings | Meter reading schedule, last reading date, gateway sync logs |
| Tariff Misapplication | Customer type, tariff eligibility, available tariffs for customer type |
| Unbilled Consumption | Last invoice date, meter readings since last invoice, meter status |
| Duplicate Invoice | Both invoices, customer contract, period definition |
| Amount Spike | Last 6 invoices for customer, tariff changes, meter changes |
| GL Mismatch | Invoice sum query, GL entry query, period details |

**Evidence Record Format:**
```json
{
  "evidence": [
    {
      "type": "reading",
      "id": "rdg-001",
      "timestamp": "2026-07-01T00:00:00Z",
      "value": 150.5,
      "meterId": "mtr-001"
    },
    {
      "type": "invoice",
      "id": "inv-001",
      "amount": 1250.00,
      "period": "2026-06",
      "status": "issued"
    },
    {
      "type": "tariff",
      "id": "trf-001",
      "name": "Residential Flat Rate",
      "rate": 2.50,
      "eligibleTypes": ["residential"]
    }
  ]
}
```

### 5.3 Risk Scoring

```
riskScore = severity_weight Ã— impact_factor Ã— recurrence_factor

severity_weight:
  CRITICAL = 1.0
  ERROR    = 0.7
  WARNING  = 0.4
  INFO     = 0.1

impact_factor:
  estimatedImpact / 100000  (capped at 1.0, 100K+ EGP = max)

recurrence_factor:
  same customer same type in last 90 days? Ã— 1.5
  same area same type in last 30 days? Ã— 1.3
  first occurrence = 1.0

Priority Buckets:
  CRITICAL: score > 70  â†’ immediate assignment, notify manager
  HIGH:     score 40-70 â†’ assign within 4 hours
  MEDIUM:   score 15-40 â†’ assign within 24 hours
  LOW:      score < 15  â†’ assign within 72 hours
```

### 5.4 Escalation

| Time Since Open | Priority | Escalation Action |
|----------------|----------|-------------------|
| â‰¥ 24h | CRITICAL | Notify Revenue Assurance Manager |
| â‰¥ 48h | HIGH | Notify Finance Director |
| â‰¥ 72h | CRITICAL | Notify CFO |
| â‰¥ 7 days | Any | Weekly report to executive team |

---

## PART 6: INTEGRATION STRATEGY

### 6.1 Integration Points

| Integration | Direction | Mechanism | Data Flow |
|-------------|-----------|-----------|-----------|
| **Bill Run** (W01 billing.js) | Hook into generate | RevenueRuleEngine.evaluateAll(preBill) | Bill run â†’ pre-bill validation â†’ block/flag/continue |
| **Invoice Issue** (W01 invoices.js) | Hook after issue | RevenueRuleEngine.evaluateAll(postBill) | Invoice â†’ post-bill validation â†’ flag |
| **Invoice Cancel** (W01 billing.js) | Hook after cancel | RevenueRuleEngine.updateFindings() | Cancel â†’ close related findings |
| **Payment** (W01 payments.js) | Hook after create | RevenueRuleEngine.checkGLMatch() | Payment â†’ check revenue match |
| **Meter Reading** (existing validation-engine.js) | Extend | Enhanced validation rules | Reading â†’ enhanced validation |
| **General Ledger** (existing accounting.js) | Query | GL balance queries | Daily GL vs invoice comparison |
| **Alert System** (existing Alert/AlertRule) | Create alerts from findings | Auto-create Alert for CRITICAL/HIGH findings | Finding â†’ Alert |
| **KPI System** (existing KpiDefinition) | Update KPIs | KpiSnapshot.create() for each revenue KPI | Finding statistics â†’ KPI |
| **C12 AI Framework** (C12-W07) | Recommendations | AIRecommendation.create() | Analysis â†’ recommendation |
| **C12 Knowledge** (C12-W07 LearnedPattern) | Pattern learning | LearnedPattern.upsert() | Resolution â†’ pattern |
| **C12 Audit** (C12 AuditEntry) | Audit actions | auditLog() on every mutation | All revenue events â†’ audit |

### 6.2 Pre-Bill Integration (Bill Run)

```
POST /api/billing/runs/:id/generate (existing)
    â”‚
    â”œâ”€â”€â†’ For each customer:
    â”‚     â”œâ”€â”€â†’ RevenueRuleEngine.evaluateAll("pre_bill", context)
    â”‚     â”‚       â”‚
    â”‚     â”‚       â”œâ”€â”€â†’ PASS â†’ continue invoice generation
    â”‚     â”‚       â”œâ”€â”€â†’ WARN â†’ flag + continue (findings created)
    â”‚     â”‚       â””â”€â”€â†’ BLOCK â†’ skip customer + create finding
    â”‚     â”‚
    â”‚     â””â”€â”€â†’ Generate invoice (existing logic)
    â”‚
    â””â”€â”€â†’ RevenueRuleEngine.evaluateAll("post_bill", context)
            for each generated invoice
```

### 6.3 Post-Bill Integration (Invoice Issue)

```
POST /api/invoices/:id/issue (existing, modified by W01)
    â”‚
    â”œâ”€â”€â†’ Existing: update status, set immutableAt
    â”œâ”€â”€â†’ W01: create FinancialEvent + post to GL
    â””â”€â”€â†’ W02: RevenueRuleEngine.evaluateAll("post_bill", {
              invoice, customer, readings, tariff
            })
              â”‚
              â”œâ”€â”€â†’ PASS â†’ continue
              â””â”€â”€â†’ FLAG â†’ create RevenueLeakageFinding
```

### 6.4 Scheduled Jobs

| Job | Schedule | Function |
|-----|----------|----------|
| Continuous monitoring | Every 6 hours | Run continuous rules (RA-013 to RA-015) |
| Daily reconciliation | Every 24 hours at 02:00 | Compare invoice total vs GL revenue total |
| Unbilled detection | Every 24 hours at 03:00 | Detect active meters without recent invoices |
| Duplicate detection | Every 24 hours at 04:00 | Detect duplicate invoices |
| KPI refresh | Every 24 hours at 05:00 | Update revenue KPIs |

---

## PART 7: DASHBOARD & REPORTING

### 7.1 Revenue Assurance Dashboard (Frontend Page)

**Location:** `/admin/revenue-assurance`

**Widgets:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ REVENUE ASSURANCE DASHBOARD                                                  â”‚
â”‚                                                                              â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚ â”‚ Revenue       â”‚ â”‚ Open Findings â”‚ â”‚ Recovery Rate â”‚ â”‚ Avg Resolutionâ”‚    â”‚
â”‚ â”‚ Leakage Total â”‚ â”‚        12     â”‚ â”‚       94%     â”‚ â”‚     36 hrs    â”‚    â”‚
â”‚ â”‚ EGP 247,500   â”‚ â”‚ â”ƒâ”â”ƒâ”â”ƒâ”â”ƒâ”â”ƒâ”   â”‚ â”‚ â”â”â”â”â”â”â”â”â”â”â”â”  â”‚ â”‚    â†“ 12%      â”‚    â”‚
â”‚ â”‚   â†“ 8% MoM   â”‚ â”‚ 3 Critical    â”‚ â”‚ Target: >90%  â”‚ â”‚ Target: <48h  â”‚    â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                                              â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ OPEN FINDINGS (12)                                  FILTER: All â”‚ â”‚ â”‚
â”‚ â”‚ â”Œâ”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚ â”‚
â”‚ â”‚ â”‚ #  â”‚ Finding               â”‚ Sev   â”‚Risk  â”‚Area  â”‚ Age        â”‚   â”‚ â”‚
â”‚ â”‚ â”œâ”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤   â”‚ â”‚
â”‚ â”‚ â”‚ 1  â”‚ Unbilled Consumption  â”‚ ðŸ”´ C  â”‚ 89   â”‚ Oct  â”‚ 12 days    â”‚   â”‚ â”‚
â”‚ â”‚ â”‚ 2  â”‚ Tariff Misapplication â”‚ ðŸŸ  E  â”‚ 72   â”‚ NC   â”‚ 3 days     â”‚   â”‚ â”‚
â”‚ â”‚ â”‚ 3  â”‚ Consumption Spike     â”‚ ðŸŸ¡ W  â”‚ 45   â”‚ SOD  â”‚ 1 day      â”‚   â”‚ â”‚
â”‚ â”‚ â”‚ 4  â”‚ GL Mismatch -0.5%     â”‚ ðŸ”´ C  â”‚ 82   â”‚ Oct  â”‚ 6 hours    â”‚   â”‚ â”‚
â”‚ â”‚ â””â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                                              â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ LEAKAGE BY TYPE  â”‚ â”‚ FINDINGS TREND (Last 30 Days)                      â”‚  â”‚
â”‚ â”‚                   â”‚ â”‚                                                    â”‚  â”‚
â”‚ â”‚ Unbilled   42%   â”‚ â”‚  ðŸ“ˆ                                                  â”‚  â”‚
â”‚ â”‚ Spike      18%   â”‚ â”‚  â”‚  â–ˆâ–ˆ                                              â”‚  â”‚
â”‚ â”‚ Tariff     15%   â”‚ â”‚  â”‚  â–ˆâ–ˆ â–ˆâ–ˆ                                           â”‚  â”‚
â”‚ â”‚ Duplicate  12%   â”‚ â”‚  â”‚  â–ˆâ–ˆ â–ˆâ–ˆ â–ˆâ–ˆ â–ˆâ–ˆ                                     â”‚  â”‚
â”‚ â”‚ Other      13%   â”‚ â”‚  â”‚  â–ˆâ–ˆ â–ˆâ–ˆ â–ˆâ–ˆ â–ˆâ–ˆ â–ˆâ–ˆ â–ˆâ–ˆ                               â”‚  â”‚
â”‚ â”‚                   â”‚ â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€                       â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 7.2 Finding Detail Page

**Location:** `/admin/revenue-assurance/findings/:id`

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ FINDING #RA-2026-0742                                                         â”‚
â”‚                                                                              â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚ â”‚ Status: OPEN   â”‚ â”‚ Severity: ðŸ”´  â”‚ â”‚ Risk Score:   â”‚ â”‚ EGP Impact:   â”‚    â”‚
â”‚ â”‚               â”‚ â”‚ CRITICAL      â”‚ â”‚ 89/100        â”‚ â”‚ EGP 45,200    â”‚    â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                                              â”‚
â”‚ Type: Unbilled Consumption | Area: October | Meter: MTR-4512                â”‚
â”‚ Detected: 2026-07-28 14:32 | Last Activity: 2026-07-28 16:00                â”‚
â”‚                                                                              â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ DESCRIPTION                                                              â”‚ â”‚
â”‚ â”‚ Meter MTR-4512 (Customer: EgyptAir Tower) has readings for July 2026    â”‚ â”‚
â”‚ â”‚ but no invoice was generated. Last invoice: June 2026.                   â”‚ â”‚
â”‚ â”‚ Consumption: 18,080 kWh Ã— Tariff: EGP 2.50 = EGP 45,200 unbilled.      â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                                              â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ EVIDENCE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ Readings (last 3 months):      â”‚ Invoice History:                        â”‚ â”‚
â”‚ â”‚  May:     14,200 kWh           â”‚  May 2026: INV-2026-0512 â†’ EGP 35,500  â”‚ â”‚
â”‚ â”‚  Jun:     16,500 kWh           â”‚  Jun 2026: INV-2026-0618 â†’ EGP 41,250  â”‚ â”‚
â”‚ â”‚  Jul:     18,080 kWh           â”‚  Jul 2026: (NO INVOICE)                 â”‚ â”‚
â”‚ â”‚                                                                          â”‚ â”‚
â”‚ â”‚ Meter Status: ACTIVE  â”‚  Last Sync: 2026-07-28 12:00  â”‚  No error eventsâ”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                                              â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ INVESTIGATION LOG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ 2026-07-28 14:32 â”‚ System        â”‚ Finding auto-created                 â”‚ â”‚
â”‚ â”‚ 2026-07-28 14:33 â”‚ System        â”‚ Evidence auto-collected (8 records)  â”‚ â”‚
â”‚ â”‚ 2026-07-28 15:00 â”‚ Sarah (Bil.)  â”‚ Assigned â€” reviewing bill run logs   â”‚ â”‚
â”‚ â”‚ 2026-07-28 15:30 â”‚ Sarah (Bil.)  â”‚ Bill run #BR-2026-07 skipped meter  â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                                              â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ ACTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ [ Generate Missing Invoice ]  [ Mark as False Positive ]  [ Dismiss ]   â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## PART 8: SECURITY & GOVERNANCE

### 8.1 Role Access

| Role | View Findings | Investigate | Propose Correction | Approve Correction | Dismiss |
|------|:------------:|:-----------:|:------------------:|:------------------:|:-------:|
| **Billing Operator** | Own area only | âœ… | âœ… | âŒ | âŒ |
| **Revenue Analyst** | All | âœ… | âœ… | âŒ | âŒ |
| **Revenue Manager** | All | âœ… | âœ… | âœ… | âœ… |
| **Finance Admin** | All | âœ… | âœ… | âœ… | âœ… |
| **Auditor** | All (read-only) | âŒ | âŒ | âŒ | âŒ |

### 8.2 Segregation of Duties

| Action | Detector | Corrector | Approver |
|--------|----------|-----------|----------|
| Flag finding | System (auto) | N/A | N/A |
| Invoice correction | Revenue Analyst | Billing Operator | Revenue Manager |
| Tariff correction | Revenue Analyst | Config Admin | Revenue Manager |
| Write-off | Revenue Analyst | Finance Admin | CFO |
| Dismiss finding | N/A | Revenue Analyst | Revenue Manager |

### 8.3 Immutability

- Once a finding is RESOLVED or DISMISSED, it cannot be re-opened
- A new finding can be created if issue reoccurs
- Investigation log entries are append-only (immutable)
- Evidence snapshots are immutable

---

## PART 9: TESTING STRATEGY â€” W02 (95 Tests)

### 9.1 Pre-Bill Validation Tests (25)

| # | Test | Expect |
|---|------|--------|
| 1 | Missing readings â†’ BLOCK invoice | Rule RA-001 fires |
| 2 | Complete readings â†’ PASS | No finding |
| 3 | Consumption spike > 3Ã— avg â†’ FLAG | Rule RA-002 fires, warning |
| 4 | Normal consumption â†’ PASS | No finding |
| 5 | Inactive meter billed â†’ BLOCK | Rule RA-004 fires, error |
| 6 | Active meter billed â†’ PASS | No finding |
| 7 | Customer type â‰  tariff eligibility â†’ BLOCK | Rule RA-005 fires |
| 8 | Customer type = tariff eligibility â†’ PASS | No finding |
| 9 | Auto-correct tariff â†’ correct tariff applied | Rule RA-005 auto-corrects |
| 10 | Duplicate period â†’ BLOCK | Rule RA-006 fires |
| 11 | Unique period â†’ PASS | No finding |
| 12 | Suspended customer â†’ BLOCK | Rule RA-007 fires |
| 13 | Active customer â†’ PASS | No finding |
| 14 | Multiple rules fail â†’ all findings created | All applicable rules fire |
| 15 | Multiple rules pass â†’ no findings | Clean pass |
| 16 | Rule with priority order â†’ evaluated correctly | Higher priority first |
| 17 | Disabled rule â†’ not evaluated | No finding created |
| 18 | Rule with future effectiveFrom â†’ not evaluated | Date guard |
| 19 | Rule with past effectiveTo â†’ not evaluated | Date guard |
| 20 | Blocked customer â†’ error message clear | Human-readable |
| 21 | Blocked customer â†’ bill run continues for others | Partial success |
| 22 | All customers blocked â†’ bill run fails | Complete failure |
| 23 | Meter with no historical data â†’ uses default baseline | Fallback |
| 24 | New customer (first bill) â†’ no historical comparison | Bypass |
| 25 | Consumption exactly at threshold â†’ boundary test | Correct classification |

### 9.2 Post-Bill Validation Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Invoice = expected â†’ PASS | No finding |
| 2 | Invoice â‰  expected (> 1%) â†’ FLAG | Rule RA-008 fires |
| 3 | Invoice amount > 2Ã— avg â†’ WARNING | Rule RA-009 fires |
| 4 | Invoice amount normal â†’ PASS | No finding |
| 5 | Line items sum = invoice total â†’ PASS | Rule RA-010 passes |
| 6 | Line items sum â‰  invoice total â†’ ERROR | Rule RA-010 fires |
| 7 | Auto-recalculate line total â†’ corrected | Rule RA-010 auto-corrects |
| 8 | Tax rate = customer's rate â†’ PASS | Rule RA-011 passes |
| 9 | Tax rate â‰  customer's rate â†’ WARNING | Rule RA-011 fires |
| 10 | Auto-correct tax rate â†’ correct | Rule RA-011 auto-corrects |
| 11 | Customer has active contract â†’ PASS | Rule RA-012 passes |
| 12 | Customer contract expired â†’ WARNING | Rule RA-012 fires |
| 13 | Invoice issued â†’ post-bill rules run automatically | Integration |
| 14 | Invoice issued manually (not via bill run) â†’ rules still run | API hook |
| 15 | Bulk invoice issue (100) â†’ all validated | Performance |
| 16 | Rule error during evaluation â†’ finding not created | Graceful failure |
| 17 | Rule timeout (slow query) â†’ skip + log | Graceful failure |
| 18 | Invoice with zero amount â†’ special handling | Zero boundary |
| 19 | Invoice with negative amount â†’ ERROR | Negative boundary |
| 20 | Invoice with 10000+ line items â†’ performance check | Scale test |

### 9.3 Continuous Monitoring Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Active meter + no invoice > 45 days â†’ FLAG | Rule RA-013 fires |
| 2 | Active meter + recent invoice â†’ PASS | No finding |
| 3 | Inactive meter â†’ skipped | Not evaluated |
| 4 | Same customer + period + amount â†’ DUPLICATE | Rule RA-014 fires |
| 5 | Same customer + period + different amount â†’ NOT duplicate | No finding |
| 6 | Auto-cancel duplicate â†’ old invoice cancelled | Rule RA-014 auto-corrects |
| 7 | Î£(invoices) = Î£(GL revenue) â†’ PASS | Rule RA-015 passes |
| 8 | Î£(invoices) â‰  Î£(GL revenue) > 0.1% â†’ FLAG | Rule RA-015 fires |
| 9 | Continuous monitoring runs on schedule | 6-hour interval |
| 10 | Multiple findings for same issue â†’ deduplicated by fingerprint | Fingerprint match |
| 11 | Finding fingerprint prevents duplicate alerts | Cooldown respected |
| 12 | Continuous job processes 10K meters < 5 minutes | Performance |
| 13 | Job failure â†’ retry 3 times | Resilience |
| 14 | Job failure after 3 retries â†’ alert operator | Escalation |
| 15 | Job processes incrementally (last_run timestamp) | Idempotency |

### 9.4 Investigation Workflow Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Finding created â†’ status = OPEN | Initial state |
| 2 | Assign finding â†’ status = ASSIGNED | Assignment |
| 3 | Start investigation â†’ status = INVESTIGATING | Status change |
| 4 | Add investigation log â†’ entry created | Append-only |
| 5 | Propose correction â†’ status = AWAITING_APPROVAL | Status change |
| 6 | Approve correction â†’ status = CORRECTING | Status change |
| 7 | Reject correction â†’ status = INVESTIGATING | Status change |
| 8 | Verify correction â†’ status = VERIFIED | Status change |
| 9 | Complete correction â†’ status = RESOLVED | Terminal state |
| 10 | Dismiss finding â†’ status = DISMISSED | Terminal state |
| 11 | Cannot re-open RESOLVED finding | Immutability |
| 12 | Cannot re-open DISMISSED finding | Immutability |
| 13 | Evidence auto-collected on creation | 5+ evidence records |
| 14 | Evidence includes all required types | Per finding type |
| 15 | Risk score calculated on creation | 0-100 range |

### 9.5 Risk Scoring Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | CRITICAL severity + high impact â†’ score > 70 | Critical bucket |
| 2 | ERROR severity + medium impact â†’ score 40-70 | High bucket |
| 3 | WARNING severity + low impact â†’ score 15-40 | Medium bucket |
| 4 | INFO severity + minimal impact â†’ score < 15 | Low bucket |
| 5 | Recurring customer issue â†’ score multiplied | 1.5Ã— factor |
| 6 | Recurring area issue â†’ score multiplied | 1.3Ã— factor |
| 7 | First occurrence â†’ no multiplier | Baseline |
| 8 | Very large impact (500K+) â†’ capped at 100 | Max score |
| 9 | Zero-impact finding â†’ minimum score | Floor |
| 10 | Risk score consistency across similar findings | Deterministic |

### 9.6 AI Agent Tests (5)

| # | Test | Expect |
|---|------|--------|
| 1 | Agent detects consumption anomaly | Confidence > 0.8 |
| 2 | Agent proposes correct correction | Relevant proposal |
| 3 | Agent collects correct evidence | All required evidence types |
| 4 | Agent respects governance (no auto-execute) | Requires approval |
| 5 | Agent updates LearnedPattern after resolution | Pattern persisted |

### 9.7 Dashboard & Reporting Tests (5)

| # | Test | Expect |
|---|------|--------|
| 1 | Dashboard shows correct KPIs | Real-time data |
| 2 | Finding list filters by severity/status/area | Accurate filtering |
| 3 | Finding detail shows all evidence | Complete display |
| 4 | Excel/PDF report generates | Export works |
| 5 | KPI data matches underlying queries | Verified accuracy |

---

## PART 10: W02 DEFINITION OF DONE

```
W02 â€” REVENUE ASSURANCE INTELLIGENCE ENGINE
CERTIFICATION CHECKLIST

â–¡ CORE INFRASTRUCTURE
   â–¡ RevenueLeakageFinding model created (full schema)
   â–¡ RevenueInvestigation model created
   â–¡ RevenueRule engine operational (or extended ValidationRule)
   â–¡ RevenueRuleEngine service created
   â–¡ Evidence collection service created
   â–¡ Risk scoring service created

â–¡ DETECTION RULES â€” ALL 15 OPERATIONAL
   â–¡ RA-001: Missing Readings (pre-bill, BLOCK)
   â–¡ RA-002: Consumption Spike (pre-bill, FLAG)
   â–¡ RA-003: Consumption Drop (pre-bill, FLAG)
   â–¡ RA-004: Inactive Meter Billed (pre-bill, BLOCK)
   â–¡ RA-005: Tariff Misapplication (pre-bill, BLOCK + auto-correct)
   â–¡ RA-006: Duplicate Period (pre-bill, BLOCK)
   â–¡ RA-007: Suspended Customer Billed (pre-bill, BLOCK)
   â–¡ RA-008: Billing Calculation Discrepancy (post-bill, FLAG)
   â–¡ RA-009: Amount Spike (post-bill, FLAG)
   â–¡ RA-010: Line Item Mismatch (post-bill, FLAG + auto-correct)
   â–¡ RA-011: Tax Mismatch (post-bill, FLAG + auto-correct)
   â–¡ RA-012: Expired Contract (post-bill, FLAG)
   â–¡ RA-013: Unbilled Consumption (continuous, FLAG)
   â–¡ RA-014: Duplicate Invoice (continuous, FLAG + auto-cancel)
   â–¡ RA-015: GL Revenue Mismatch (continuous, FLAG)

â–¡ INTEGRATIONS
   â–¡ Pre-bill validation injected into Bill Run generate
   â–¡ Post-bill validation injected into Invoice Issue
   â–¡ Continuous monitoring scheduled (every 6 hours)
   â–¡ GL reconciliation scheduled (daily)
   â–¡ Evidence collection auto-runs on finding creation
   â–¡ Alerts created for CRITICAL findings (existing Alert model)
   â–¡ KPIs updated on finding lifecycle events

â–¡ AI REVENUE ASSURANCE AGENT
   â–¡ Agent operational (C12-W07 AIRecommendation framework)
   â–¡ Detects anomalies with confidence scoring
   â–¡ Proposes corrections with evidence
   â–¡ Requires human approval for corrections
   â–¡ Updates LearnedPattern on resolution
   â–¡ All agent actions audited

â–¡ INVESTIGATION WORKFLOW
   â–¡ Full lifecycle: OPEN â†’ ASSIGNED â†’ INVESTIGATING â†’ AWAITING_APPROVAL â†’
     CORRECTING â†’ VERIFIED â†’ RESOLVED | DISMISSED
   â–¡ Evidence collection: auto on creation
   â–¡ Risk scoring: auto on creation
   â–¡ Assignment: auto or manual
   â–¡ Investigation log: append-only
   â–¡ Resolution: requires approval

â–¡ SECURITY
   â–¡ RBAC for revenue roles (Billing Operator, Revenue Analyst, Revenue Manager)
   â–¡ Segregation of duties: detect â‰  correct â‰  approve
   â–¡ RESOLVED/DISMISSED findings immutable
   â–¡ Investigation log append-only
   â–¡ All mutations audited

â–¡ DASHBOARD
   â–¡ Revenue Assurance Dashboard page at /admin/revenue-assurance
   â–¡ Finding list with filters (severity, status, area, type)
   â–¡ Finding detail page with evidence, investigation log, actions
   â–¡ KPI widgets: leakage total, open count, recovery rate, avg resolution
   â–¡ Charts: leakage by type, findings trend

â–¡ TESTS â€” 95 PASSING
   â–¡ Pre-bill validation: 25 tests
   â–¡ Post-bill validation: 20 tests
   â–¡ Continuous monitoring: 15 tests
   â–¡ Investigation workflow: 15 tests
   â–¡ Risk scoring: 10 tests
   â–¡ AI agent: 5 tests
   â–¡ Dashboard: 5 tests

W02 STATUS: â–¡ NOT IMPLEMENTED
All items above are DESIGN-COMPLETE but not executed.
```

---

## APPENDIX A: W02 FILE MANIFEST

| # | File | Action | Lines (est.) |
|---|------|--------|--------------|
| 1 | `backend/prisma/schema.prisma` | MODIFY | +80 lines (RevenueLeakageFinding, RevenueInvestigation, RevenueRule) |
| 2 | Migration: revenue_assurance | CREATE | Standard migration |
| 3 | `backend/src/services/revenue-engine.js` | **CREATE** | ~250 lines (core engine: detect, evaluate, score) |
| 4 | `backend/src/services/revenue-evidence.js` | **CREATE** | ~120 lines (evidence collection per finding type) |
| 5 | `backend/src/services/revenue-scoring.js` | **CREATE** | ~80 lines (risk scoring algorithm) |
| 6 | `backend/src/services/revenue-investigation.js` | **CREATE** | ~150 lines (workflow lifecycle) |
| 7 | `backend/src/routes/revenue-assurance.js` | **CREATE** | ~200 lines (findings CRUD, investigation, dashboard data) |
| 8 | `backend/src/routes/billing.js` | MODIFY | +30 lines (pre-bill validation hook) |
| 9 | `backend/src/routes/invoices.js` | MODIFY | +15 lines (post-bill validation hook) |
| 10 | `backend/src/services/ai-engine.js` | MODIFY | +80 lines (Revenue Agent capabilities) |
| 11 | `backend/src/server.js` | MODIFY | +3 lines (route registration) |
| 12 | `Frontend/src/app/admin/revenue-assurance/page.tsx` | **CREATE** | ~300 lines (dashboard) |
| 13 | `Frontend/src/app/admin/revenue-assurance/findings/[id]/page.tsx` | **CREATE** | ~200 lines (detail page) |

**Total estimated new code:** ~1,500 lines
**Total estimated tests:** 95 tests
**Total W01+W02 cumulative tests:** 85 + 95 = 180 tests

## APPENDIX B: W02 DEPENDENCY GRAPH

```
W01 (Billing-to-GL) â”€â”€â”€â”€â”
                         â”‚
Bill Run (existing) â”€â”€â”€â”€â”€â”¤
Invoice routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
ValidationRule (exist) â”€â”€â”¤
AlertRule/Alert (exist) â”€â”¤
KPI (existing) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
AI Engine (existing) â”€â”€â”€â”€â”¤
C12 AIRecommendation â”€â”€â”€â”€â”¤
                         â–¼
              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
              â”‚  W02 REVENUE        â”‚
              â”‚  ASSURANCE ENGINE   â”‚
              â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                    â”‚
                    â”œâ”€â”€â†’ revenue-engine.js (core)
                    â”œâ”€â”€â†’ revenue-evidence.js (collection)
                    â”œâ”€â”€â†’ revenue-scoring.js (risk)
                    â”œâ”€â”€â†’ revenue-investigation.js (workflow)
                    â”œâ”€â”€â†’ revenue-assurance routes
                    â””â”€â”€â†’ Revenue Assurance Dashboard
```

## APPENDIX C: ROLLBACK STRATEGY

| Scenario | Rollback |
|----------|----------|
| Pre-bill rules blocking valid invoices | Disable individual rules via RevenueRule.active = false |
| Post-bill rules creating false positives | Lower severity or disable specific rules |
| Performance impact on bill run | Feature flag: `revenuePreBillValidation: false` |
| AI agent proposing wrong corrections | Set agent confidence threshold higher |
| Wrong risk scoring | Adjust scoring parameters in service config |
| Migration issue | `prisma migrate down` for revenue models |

---

*This document is a planning artifact only. No code, no implementation, no database migration.*
*C13-W02 â€” Revenue Assurance Intelligence Engine. READ ONLY. GOVERNANCE PLANNING ONLY.*

