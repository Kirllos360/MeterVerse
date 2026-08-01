<!-- Status Block
====================================================================
Design: [x] Complete | Implementation: [ ] In Progress (Tariff/Rate/Tier exist) | Certification: [ ] Not Certified | Wave: W2 | Commit: 97f299aa
====================================================================
-->

# C13-W03 â€” Enterprise Tariff Intelligence & Advanced Billing Engine
## Blueprint

**Version:** 1.0.0  
**Status:** READ ONLY â€” GOVERNANCE PLANNING ONLY â€” NOT IMPLEMENTED  
**Date:** 2026-07-29  
**Program:** C13 Enterprise Financial & Billing Intelligence Platform  
**Wave:** W03 (Tariff Intelligence â€” builds on W01+W02 billing and revenue foundation)  

---

## PART 1: CURRENT STATE AUDIT

### 1.1 Existing Tariff Infrastructure

| Component | Location | Status | Capability |
|-----------|----------|--------|------------|
| **Tariff** model | `schema.prisma:1088` | âœ… Complete | name, code, type, effectiveFrom/To, status, currency, unit |
| **TariffRate** model | `schema.prisma:1107` | âœ… Complete | name, rate, unit, validFrom/To, priority |
| **TariffTier** model | `schema.prisma:1123` | âœ… Complete | minValue, maxValue, rate, unit, priority |
| **ChargeRule** model | `schema.prisma:1186` | âœ… Complete | formula-based charges with priority |
| **ChargeOverride** model | `schema.prisma:1203` | âœ… Complete | per-customer/contract overrides |
| **DiscountRule** model | `schema.prisma:1256` | âœ… Complete | discount definitions |
| **GroupPricing** model | `schema.prisma:1533` | âœ… Complete | customer group â†’ tariff + discount |
| **BillCycle** model | `schema.prisma:1139` | âœ… Complete | frequency, billingDay, dueDay, cutOffDay |
| **Tariff routes** | `routes/tariffs.js` | âœ… Complete | CRUD + /calculate endpoint |
| **Billing engine** | `services/billing-engine.js` | âš ï¸ Basic | Flat-rate only â€” reads `rates[0].rate` |

### 1.2 Current Tariff Route Capabilities

```
GET    /tariffs          â†’ List tariffs (filter by status, type, effective date)
GET    /tariffs/:id      â†’ Get tariff with rates + tiers
POST   /tariffs          â†’ Create tariff with rates + tiers
PUT    /tariffs/:id      â†’ Update tariff (replace rates + tiers)
POST   /tariffs/calculate â†’ Calculate charge for given consumption
```

All routes have Zod validation, RBAC, and audit logging.

### 1.3 Current Billing Engine Capabilities

```javascript
// billing-engine.js â€” COMPLETE CURRENT CODE:
export async function generateInvoice(customerId, periodStart, periodEnd) {
  const readings = await prisma.reading.findMany({
    where: { meter: { customerId }, timestamp: { gte: periodStart, lte: periodEnd } },
    include: { meter: true },
  })
  const totalKwh = readings.reduce((s, r) => s + r.value, 0)
  const tariff = await prisma.tariff.findFirst({ where: { status: "active" }, include: { rates: true } })
  const rate = tariff?.rates?.[0]?.rate || 0.5
  const amount = totalKwh * rate

  const invoice = await prisma.invoice.create({
    data: { number: "INV-" + Date.now(), customerId, amount, status: "pending", ... }
  })
  return invoice
}
```

**Gaps:**
- âŒ No customer-to-tariff resolution (always picks first active tariff)
- âŒ No tariff type checking (flat/tiered/tou/demand)
- âŒ No ToU schedules
- âŒ No demand charge
- âŒ No fixed/standing charges
- âŒ No tax calculation
- âŒ No discount application
- âŒ No charge rule evaluation
- âŒ No meter type â†’ tariff mapping
- âŒ No pro-ration
- âŒ No versioning/draft lifecycle
- âŒ No simulation/preview
- âŒ No audit history for changes

### 1.4 Existing Data Flows to Integrate

```
Meter Reading Pipeline (exists)       â†’ consumption data
W01 FinancialEvent (planned)           â†’ revenue events
W02 Revenue Assurance (planned)        â†’ tariff validation rules
Account Mapping (planned in W01)       â†’ tariff â†’ GL accounts
Invoice Generation (exists)            â†’ uses tariff rates
Customer Group (exists)                â†’ group-based pricing
ChargeRule + ChargeOverride (exists)   â†’ formula charges
DiscountRule (exists)                  â†’ discounts
BillCycle (exists)                     â†’ billing frequency
```

---

## PART 2: ENTERPRISE TARIFF ARCHITECTURE

### 2.1 High-Level Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                          TARIFF INTELLIGENCE PLATFORM                                          â”‚
â”‚                                                                                               â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  TARIFF DEFINITION LAYER                                                                â”‚    â”‚
â”‚  â”‚                                                                                        â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚    â”‚
â”‚  â”‚  â”‚ Flat Rate  â”‚ â”‚  Tiered    â”‚ â”‚  Time-of-  â”‚ â”‚  Demand    â”‚ â”‚  Fixed + Variable   â”‚  â”‚    â”‚
â”‚  â”‚  â”‚ Tariff     â”‚ â”‚  Pricing   â”‚ â”‚  Use (ToU) â”‚ â”‚  Charges   â”‚ â”‚  Charges            â”‚  â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚    â”‚
â”‚  â”‚                                                                                        â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚    â”‚
â”‚  â”‚  â”‚ Taxes &    â”‚ â”‚  Fees &    â”‚ â”‚  Discounts â”‚ â”‚  Subsidies â”‚ â”‚  Customer Group     â”‚  â”‚    â”‚
â”‚  â”‚  â”‚ Surcharges â”‚ â”‚  Levies    â”‚ â”‚            â”‚ â”‚            â”‚ â”‚  Assignment          â”‚  â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                    â”‚                                                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  TARIFF LIFECYCLE LAYER                                                                â”‚    â”‚
â”‚  â”‚                                                                                        â”‚    â”‚
â”‚  â”‚  DRAFT â†’ PENDING_APPROVAL â†’ APPROVED â†’ ACTIVE â†’ SUPERSEDED (by new version)           â”‚    â”‚
â”‚  â”‚                                                                                        â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚    â”‚
â”‚  â”‚  â”‚ Versioning: V1 (2025-01-01), V2 (2025-07-01), V3 (2026-01-01)                    â”‚  â”‚    â”‚
â”‚  â”‚  â”‚ Each version has: effectiveFrom, effectiveTo, status, changeReason, approvedBy   â”‚  â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                    â”‚                                                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  TARIFF EXECUTION LAYER                                                                â”‚    â”‚
â”‚  â”‚                                                                                        â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚    â”‚
â”‚  â”‚  â”‚  TariffEngine.resolve(customerId, meterId, periodStart, periodEnd) â†’ Tariff    â”‚    â”‚    â”‚
â”‚  â”‚  â”‚    1. Check customer group â†’ tariff assignment                                  â”‚    â”‚    â”‚
â”‚  â”‚  â”‚    2. Check contract â†’ specific tariff/pricing                                 â”‚    â”‚    â”‚
â”‚  â”‚  â”‚    3. Check meter type â†’ applicable tariff                                     â”‚    â”‚    â”‚
â”‚  â”‚  â”‚    4. Resolve effective date â†’ correct version                                 â”‚    â”‚    â”‚
â”‚  â”‚  â”‚    5. Return resolved tariff + rates + tiers + schedule                        â”‚    â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚    â”‚
â”‚  â”‚                                                                                        â”‚    â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚    â”‚
â”‚  â”‚  â”‚  TariffEngine.calculate(tariff, readings, period) â†’ ChargeResult               â”‚    â”‚    â”‚
â”‚  â”‚  â”‚    1. Calculate consumption from readings                                      â”‚    â”‚    â”‚
â”‚  â”‚  â”‚    2. Apply tiered pricing (if tariff has tiers)                               â”‚    â”‚    â”‚
â”‚  â”‚  â”‚    3. Apply ToU pricing (if tariff has schedule)                               â”‚    â”‚    â”‚
â”‚  â”‚  â”‚    4. Apply demand charges (if tariff has demand rates)                        â”‚    â”‚    â”‚
â”‚  â”‚  â”‚    5. Apply fixed charges + variable charges                                   â”‚    â”‚    â”‚
â”‚  â”‚  â”‚    6. Apply charge rules + overrides                                           â”‚    â”‚    â”‚
â”‚  â”‚  â”‚    7. Apply discounts                                                          â”‚    â”‚    â”‚
â”‚  â”‚  â”‚    8. Calculate taxes + fees + levies                                          â”‚    â”‚    â”‚
â”‚  â”‚  â”‚    9. Apply subsidies                                                          â”‚    â”‚    â”‚
â”‚  â”‚  â”‚   10. Return ChargeResult { lineItems[], totalBeforeTax, tax, totalAfterTax } â”‚    â”‚    â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                    â”‚                                                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  INTEGRATION LAYER                                                                     â”‚    â”‚
â”‚  â”‚                                                                                        â”‚    â”‚
â”‚  â”‚  BillRun â†’ TariffEngine.resolve() â†’ TariffEngine.calculate() â†’ Invoice.create()       â”‚    â”‚
â”‚  â”‚  Simulation â†’ same pipeline but no persistence                                         â”‚    â”‚
â”‚  â”‚  Revenue Assurance â†’ tariff validation rules on resolved tariff                       â”‚    â”‚
â”‚  â”‚  PostingEngine â†’ debit/credit accounts from tariff line items                         â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                                                               â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  AI TARIFF OPTIMIZATION AGENT                                                          â”‚    â”‚
â”‚  â”‚                                                                                        â”‚    â”‚
â”‚  â”‚  â€¢ Detect tariff anomalies (under/over charging)                                      â”‚    â”‚
â”‚  â”‚  â€¢ Recommend optimal tariff for customer segment                                      â”‚    â”‚
â”‚  â”‚  â€¢ Forecast revenue impact of tariff changes                                          â”‚    â”‚
â”‚  â”‚  â€¢ Flag expiring tariffs before effectiveTo                                          â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.2 Tariff Resolution Algorithm

```
TariffEngine.resolve(customerId, meterId, billingDate):
  1. LOAD customer + meter + contract
     customer = Customer.findUnique(customerId)
     meter = Meter.findUnique(meterId)
     contract = Contract.findFirst({ customerId, status: "active" })
  
  2. CHECK contract-based pricing
     IF contract AND contract.tariffId:
       tariff = Tariff.findUnique(contract.tariffId)
       WHERE effectiveFrom <= billingDate
       AND (effectiveTo IS NULL OR effectiveTo >= billingDate)
       AND status = "ACTIVE"
       IF tariff: RETURN tariff
  
  3. CHECK customer group pricing
     groupPricing = GroupPricing.findFirst({
       customerGroupId: customer.groupId,
       validFrom <= billingDate,
       (validTo IS NULL OR validTo >= billingDate)
     })
     IF groupPricing AND groupPricing.tariffId:
       tariff = Tariff.findUnique(groupPricing.tariffId)
       WHERE effectiveFrom <= billingDate
       AND (effectiveTo IS NULL OR effectiveTo >= billingDate)
       AND status = "ACTIVE"
       IF tariff: RETURN tariff + discountRate
  
  4. CHECK meter type default
     meterType = MeterType.findUnique(meter.typeId)
     tariff = Tariff.findFirst({
       WHERE type = meterType.utilityType  // Electricity, Water, etc.
       AND status = "ACTIVE"
       AND effectiveFrom <= billingDate
       AND (effectiveTo IS NULL OR effectiveTo >= billingDate)
     })
     IF tariff: RETURN tariff
  
  5. DEFAULT: first active tariff
     tariff = Tariff.findFirst({ status: "ACTIVE", effectiveFrom <= billingDate })
     IF tariff: RETURN tariff
  
  6. NO TARIFF FOUND â†’ ERROR: "No active tariff found for customer/meter"
```

### 2.3 Tariff Calculation Algorithm

```
TariffEngine.calculate(tariff, context, billingDate):
  context = { meterId, customerId, periodStart, periodEnd, readings[] }
  chargeLines = []
  totalFixed = 0
  totalVariable = 0
  totalTax = 0
  totalDiscount = 0

// â”€â”€ STEP 1: Calculate consumption from readings â”€â”€
  totalConsumption = SUM(readings, value)
  byDate = GROUP readings BY timestamp.date  // for ToU

// â”€â”€ STEP 2: Time-of-Use calculation â”€â”€
  IF tariff.hasToUSchedule:
    schedule = TariffToUSchedule.findMany({ tariffId: tariff.id })
    FOR each readingGroup IN byDate:
      dayOfWeek = readingGroup.date.getDay()
      timeOfDay = readingGroup.date.getHours() * 60 + readingGroup.date.getMinutes()
      window = schedule.find(w =>
        w.dayOfWeek == dayOfWeek
        AND timeOfDay >= w.startMinute
        AND timeOfDay < w.endMinute
      )
      rate = window ? window.rate : tariff.defaultRate
      charge = readingGroup.consumption Ã— rate
      chargeLines.push({ type: "tou", window: window.name, consumption, rate, charge })
      totalVariable += charge

// â”€â”€ STEP 3: Tiered pricing calculation â”€â”€
  ELSE IF tariff.tiers.length > 0:
    sortedTiers = tariff.tiers.sort(priority)
    remaining = totalConsumption
    FOR each tier IN sortedTiers:
      max = tier.maxValue ?? remaining
      min = tier.minValue ?? 0
      tierConsumption = MIN(remaining, MAX(0, max - min))
      IF tierConsumption <= 0: CONTINUE
      charge = tierConsumption Ã— tier.rate
      chargeLines.push({ type: "tier", name: tier.name, consumption: tierConsumption, rate: tier.rate, charge })
      totalVariable += charge
      remaining -= tierConsumption
      IF remaining <= 0: BREAK

// â”€â”€ STEP 4: Flat rate calculation â”€â”€
  ELSE IF tariff.rates.length > 0:
    FOR each rate IN tariff.rates:
      charge = totalConsumption Ã— rate.rate
      chargeLines.push({ type: "rate", name: rate.name, consumption: totalConsumption, rate: rate.rate, charge })
      totalVariable += charge

// â”€â”€ STEP 5: Demand charge calculation â”€â”€
  IF tariff.hasDemandCharge:
    maxDemand = MAX(readings, demand)  // highest kW/kVA in period
    demandRate = TariffDemandRate.findFirst({ tariffId: tariff.id, active: true })
    demandCharge = maxDemand Ã— demandRate.rate
    chargeLines.push({ type: "demand", name: "Demand Charge", demand: maxDemand, rate: demandRate.rate, charge: demandCharge })
    totalVariable += demandCharge

// â”€â”€ STEP 6: Fixed / standing charges â”€â”€
  fixedCharges = TariffFixedCharge.findMany({ tariffId: tariff.id, active: true })
  FOR each fc IN fixedCharges:
    amount = fc.monthlyRate Ã— (periodDays / daysInMonth)  // pro-rated
    chargeLines.push({ type: "fixed", name: fc.name, charge: amount })
    totalFixed += amount

// â”€â”€ STEP 7: Charge rules + overrides â”€â”€
  chargeRules = ChargeRule.findMany({ active: true, effectiveFrom <= billingDate })
  FOR each rule IN chargeRules:
    IF rule.appliesTo == "all" OR rule.appliesTo == tariff.type:
      result = EVALUATE rule.formula WITH { consumption: totalConsumption, fixed: totalFixed }
      chargeLines.push({ type: "rule", name: rule.name, charge: result })
      totalVariable += result

    override = ChargeOverride.findFirst({
      chargeRuleId: rule.id,
      customerId: customerId,
      validFrom <= billingDate,
      (validTo IS NULL OR validTo >= billingDate)
    })
    IF override: apply override value instead

// â”€â”€ STEP 8: Discounts â”€â”€
  groupPricing = GroupPricing.findFirst({ customerGroupId: customer.groupId })
  IF groupPricing AND groupPricing.discountRate > 0:
    discountAmount = (totalFixed + totalVariable) Ã— groupPricing.discountRate
    chargeLines.push({ type: "discount", name: "Group Discount", rate: groupPricing.discountRate, charge: -discountAmount })
    totalDiscount = discountAmount

// â”€â”€ STEP 9: Taxes, fees, subsidies â”€â”€
  IF tariff.hasTax:
    taxRules = TariffTax.findMany({ tariffId: tariff.id, active: true })
    FOR each tax IN taxRules:
      taxAmount = (totalFixed + totalVariable - totalDiscount) Ã— tax.rate
      chargeLines.push({ type: "tax", name: tax.name, rate: tax.rate, charge: taxAmount })
      totalTax += taxAmount

// â”€â”€ STEP 10: Assemble result â”€â”€
  RETURN {
    consumption: totalConsumption,
    chargeLines,
    subtotal: totalFixed + totalVariable,
    discount: totalDiscount,
    taxableAmount: totalFixed + totalVariable - totalDiscount,
    totalTax,
    totalCharge: totalFixed + totalVariable - totalDiscount + totalTax,
    breakdownByType: { fixed: totalFixed, variable: totalVariable, discount: totalDiscount, tax: totalTax }
  }
```

---

## PART 3: DATA MODEL DESIGN

### 3.1 Tariff Version (NEW â€” enhanced lifecycle)

**Purpose:** Track each version of a tariff through its lifecycle. Replaces simple status field with full versioning.

**Status:** âŒ Not built â€” NEW model for W03

```
TariffVersion
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ tariffId: String                â† FK â†’ Tariff (parent tariff)
â”œâ”€â”€ versionNumber: Int              â† Auto-incremented per tariff
â”œâ”€â”€ name: String                    â† Snapshot of tariff name at this version
â”œâ”€â”€ description: String?
â”œâ”€â”€ status: String                  â† DRAFT | PENDING_APPROVAL | APPROVED | ACTIVE | SUPERSEDED
â”œâ”€â”€ effectiveFrom: DateTime
â”œâ”€â”€ effectiveTo: DateTime?
â”œâ”€â”€ changeReason: String            â† Why this version was created
â”œâ”€â”€ changeType: String              â† RATE_CHANGE | STRUCTURE_CHANGE | NEW_TARIFF | RENEWAL
â”œâ”€â”€ approvedBy: String?             â† FK â†’ User
â”œâ”€â”€ approvedAt: DateTime?
â”œâ”€â”€ activatedAt: DateTime?          â† When status â†’ ACTIVE
â”œâ”€â”€ supersededByVersion: Int?       â† Which version replaced this one
â”œâ”€â”€ supersededAt: DateTime?
â”œâ”€â”€ createdBy: String?              â† FK â†’ User
â”œâ”€â”€ createdAt: DateTime
â”œâ”€â”€ archivedAt: DateTime?

Indexes:
  @@unique([tariffId, versionNumber])
  @@index([tariffId, status])
  @@index([effectiveFrom, effectiveTo])
  @@index([status, effectiveFrom])

Relations:
  tariff â†’ Tariff
  versionRates â†’ TariffVersionRate[]
  versionTiers â†’ TariffVersionTier[]
  versionToUSchedules â†’ TariffToUSchedule[]
  versionDemandRates â†’ TariffDemandRate[]
  versionFixedCharges â†’ TariffFixedCharge[]
  versionTaxes â†’ TariffTax[]
```

### 3.2 Tariff Version Rate (NEW â€” snapshot of rates at version)

```
TariffVersionRate
â”œâ”€â”€ id, tariffVersionId (FK), name, rate, unit, priority, validFrom, validTo
â”œâ”€â”€ createdAt, archivedAt
```

### 3.3 Tariff Version Tier (NEW â€” snapshot of tiers at version)

```
TariffVersionTier
â”œâ”€â”€ id, tariffVersionId (FK), name, priority, minValue, maxValue, rate, unit
â”œâ”€â”€ createdAt, archivedAt
```

### 3.4 TariffToUSchedule (NEW)

**Purpose:** Define time-of-use windows for each tariff version.

**Status:** âŒ Not built â€” NEW model for W03

```
TariffToUSchedule
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ tariffVersionId: String         â† FK â†’ TariffVersion
â”œâ”€â”€ name: String                    â† "Peak", "Off-Peak", "Shoulder"
â”œâ”€â”€ dayOfWeek: Int                  â† 0=Sun, 1=Mon, ...6=Sat  (or -1 for all)
â”œâ”€â”€ startMinute: Int                â† 0-1439 (minutes from midnight)
â”œâ”€â”€ endMinute: Int                  â† 0-1439 (exclusive)
â”œâ”€â”€ rate: Float                     â† Rate per unit during this window
â”œâ”€â”€ priority: Int                   â† Lower = higher priority (for overlapping windows)
â”œâ”€â”€ active: Boolean                 â† Default true
â”œâ”€â”€ season: String?                 â† "summer" | "winter" | null (all year)
â”œâ”€â”€ createdAt: DateTime
â”œâ”€â”€ archivedAt: DateTime?

Indexes:
  @@index([tariffVersionId, active])
  @@index([tariffVersionId, dayOfWeek, startMinute])

Relations:
  tariffVersion â†’ TariffVersion

Validation:
  startMinute < endMinute (window must have positive duration)
  0 <= startMinute, endMinute <= 1439
```

### 3.5 TariffDemandRate (NEW)

**Purpose:** Define demand-based charges (kW/kVA) for each tariff version.

**Status:** âŒ Not built

```
TariffDemandRate
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ tariffVersionId: String
â”œâ”€â”€ name: String                    â† "Demand Charge", "Excess Demand"
â”œâ”€â”€ demandType: String              â† kW | kVA
â”œâ”€â”€ rate: Float                     â† Rate per unit of demand
â”œâ”€â”€ threshold: Float?               â† Optional: charges apply above threshold
â”œâ”€â”€ interval: String                â† MONTHLY | DAILY | ROLLING_30
â”œâ”€â”€ active: Boolean
â”œâ”€â”€ createdAt, archivedAt

Indexes:
  @@index([tariffVersionId, active])
```

### 3.6 TariffFixedCharge (NEW)

**Purpose:** Define standing/fixed charges per period.

**Status:** âŒ Not built

```
TariffFixedCharge
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ tariffVersionId: String
â”œâ”€â”€ name: String                    â† "Service Charge", "Meter Rental"
â”œâ”€â”€ type: String                    â† MONTHLY | DAILY | ONE_TIME
â”œâ”€â”€ amount: Float                   â† Charge amount
â”œâ”€â”€ proRata: Boolean                â† Default true (pro-rate for mid-period changes)
â”œâ”€â”€ active: Boolean
â”œâ”€â”€ createdAt, archivedAt

Indexes:
  @@index([tariffVersionId, active])
```

### 3.7 TariffTax (NEW)

**Purpose:** Define taxes, surcharges, fees, and levies applied per tariff.

**Status:** âŒ Not built

```
TariffTax
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ tariffVersionId: String
â”œâ”€â”€ name: String                    â† "VAT 14%", "Service Fee 2%"
â”œâ”€â”€ type: String                    â† PERCENTAGE | FIXED_AMOUNT
â”œâ”€â”€ rate: Float                     â† Percentage (0.14 for 14%) or fixed amount
â”œâ”€â”€ appliesTo: String               â† CONSUMPTION | TOTAL | FIXED_CHARGES
â”œâ”€â”€ taxCode: String?                â† Tax authority code for reporting
â”œâ”€â”€ active: Boolean
â”œâ”€â”€ createdAt, archivedAt

Indexes:
  @@index([tariffVersionId, active])
```

### 3.8 TariffChangeLog (NEW)

**Purpose:** Full audit trail for every tariff version change approval.

```
TariffChangeLog
â”œâ”€â”€ id, tariffVersionId (FK)
â”œâ”€â”€ action: String                  â† CREATED | SUBMITTED | APPROVED | REJECTED | ACTIVATED | SUPERSEDED
â”œâ”€â”€ performedBy: String             â† FK â†’ User
â”œâ”€â”€ comment: String?
â”œâ”€â”€ createdAt: DateTime

Index:
  @@index([tariffVersionId, createdAt])
```

### 3.9 CustomerTariff (NEW â€” explicit link)

**Purpose:** Explicit customer-to-tariff assignment (overrides group and defaults).

```
CustomerTariff
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ customerId: String              â† FK â†’ Customer
â”œâ”€â”€ tariffVersionId: String         â† FK â†’ TariffVersion
â”œâ”€â”€ contractId: String?             â† FK â†’ Contract (optional link)
â”œâ”€â”€ assignedBy: String?             â† FK â†’ User
â”œâ”€â”€ assignedAt: DateTime
â”œâ”€â”€ validFrom: DateTime
â”œâ”€â”€ validTo: DateTime?
â”œâ”€â”€ status: String                  â† ACTIVE | SUPERSEDED
â”œâ”€â”€ createdAt, archivedAt

Indexes:
  @@index([customerId, status])
  @@index([tariffVersionId])
  
Unique: [customerId, status] WHERE status = "ACTIVE"
```

### 3.10 Existing Model Enhancement Summary

| Existing Model | New Fields | Purpose |
|----------------|------------|---------|
| **Tariff** | Add `category` (STANDARD | CONTRACT | PROMOTIONAL) | Classification |
| **Tariff** | Add `utilityType` (ELECTRICITY | WATER | GAS | SOLAR | BTU) | Multi-utility |
| **Tariff** | Add `eligibleCustomerTypes` (JSON array) | Tariff eligibility rules |
| **Tariff** | Add `minConsumption`, `maxConsumption` | Usage range limits |
| **Tariff** | Add `currency` | Already exists |
| **Tariff** | Keep `status` but deprecate for versioned lifecycle | Backward compat |
| **GroupPricing** | Add `tariffVersionId` | Link to versioned tariff |
| **ChargeRule** | Add `tariffId` | Link to specific tariff |
| **Invoice** (existing) | Add `tariffSnapshotId` | Snapshot of tariff used at billing |

### 3.11 New Models Summary (8 models)

| # | Model | Lines | Purpose |
|---|-------|-------|---------|
| 1 | TariffVersion | ~35 | Versioned tariff lifecycle |
| 2 | TariffVersionRate | ~12 | Snapshot of rates at version |
| 3 | TariffVersionTier | ~12 | Snapshot of tiers at version |
| 4 | TariffToUSchedule | ~20 | Time-of-use windows |
| 5 | TariffDemandRate | ~15 | Demand-based charges |
| 6 | TariffFixedCharge | ~15 | Standing/fixed charges |
| 7 | TariffTax | ~18 | Taxes, fees, levies |
| 8 | TariffChangeLog | ~10 | Change approval audit |
| 9 | CustomerTariff | ~15 | Customerâ†’tariff assignment |

---

## PART 4: MULTI-UTILITY TARIFF STRUCTURES

### 4.1 Electricity Tariff Structure

```
ELECTRICITY TARIFF
â”œâ”€â”€ Fixed Charges:
â”‚   â”œâ”€â”€ Service Charge          monthly  EGP 25.00
â”‚   â”œâ”€â”€ Meter Rental            monthly  EGP 10.00
â”‚   â””â”€â”€ Infrastructure Fee      monthly  EGP 5.00
â”‚
â”œâ”€â”€ Variable Charges (kWh):
â”‚   â”œâ”€â”€ Tier 1: 0-100 kWh       EGP 0.50/kWh
â”‚   â”œâ”€â”€ Tier 2: 101-300 kWh     EGP 0.75/kWh
â”‚   â”œâ”€â”€ Tier 3: 301-600 kWh     EGP 1.25/kWh
â”‚   â”œâ”€â”€ Tier 4: 601-1000 kWh    EGP 2.00/kWh
â”‚   â””â”€â”€ Tier 5: 1000+ kWh       EGP 2.50/kWh
â”‚
â”œâ”€â”€ Time-of-Use (optional):
â”‚   â”œâ”€â”€ Peak (5-11 PM)          Ã— 1.5 multiplier
â”‚   â”œâ”€â”€ Off-Peak (11 PM-5 PM)   Ã— 0.8 multiplier
â”‚   â””â”€â”€ Weekends                Ã— 0.7 multiplier
â”‚
â”œâ”€â”€ Demand Charges (commercial):
â”‚   â””â”€â”€ Demand Charge           EGP 50.00/kVA/month
â”‚
â”œâ”€â”€ Taxes:
â”‚   â”œâ”€â”€ VAT                     14% of total
â”‚   â””â”€â”€ Service Fee             2% of variable
â”‚
â””â”€â”€ Discounts:
    â””â”€â”€ Early Payment Discount  2% if paid within 10 days
```

### 4.2 Water Tariff Structure

```
WATER TARIFF
â”œâ”€â”€ Fixed Charges:
â”‚   â”œâ”€â”€ Connection Fee          monthly  EGP 15.00
â”‚   â””â”€â”€ Meter Maintenance       monthly  EGP 8.00
â”‚
â”œâ”€â”€ Variable Charges (mÂ³):
â”‚   â”œâ”€â”€ Tier 1: 0-30 mÂ³         EGP 1.50/mÂ³
â”‚   â”œâ”€â”€ Tier 2: 31-60 mÂ³        EGP 3.00/mÂ³
â”‚   â”œâ”€â”€ Tier 3: 61-100 mÂ³       EGP 5.00/mÂ³
â”‚   â””â”€â”€ Tier 4: 100+ mÂ³         EGP 8.00/mÂ³
â”‚
â”œâ”€â”€ Sewage Surcharge:
â”‚   â””â”€â”€ Sewage Fee              60% of water charges
â”‚
â”œâ”€â”€ Taxes:
â”‚   â””â”€â”€ VAT                     14% of total
â”‚
â””â”€â”€ Subsidies (residential only):
    â””â”€â”€ Social Subsidy          -EGP 10.00/month (if consumption < 30 mÂ³)
```

### 4.3 Gas Tariff Structure

```
GAS TARIFF
â”œâ”€â”€ Fixed Charges:
â”‚   â”œâ”€â”€ Safety Inspection       monthly  EGP 12.00
â”‚   â””â”€â”€ Pipeline Fee            monthly  EGP 7.00
â”‚
â”œâ”€â”€ Variable Charges (BTU/Therm):
â”‚   â”œâ”€â”€ Tier 1: 0-50 Therms     EGP 8.00/Therm
â”‚   â”œâ”€â”€ Tier 2: 51-150 Therms   EGP 12.00/Therm
â”‚   â””â”€â”€ Tier 3: 150+ Therms     EGP 18.00/Therm
â”‚
â”œâ”€â”€ Taxes:
â”‚   â””â”€â”€ VAT                     14% of total
â”‚
â””â”€â”€ Seasonal Adjustment:
    â””â”€â”€ Winter Surcharge        +15% (December-February)
```

### 4.4 Tariff Eligibility Rules

| Customer Type | Eligible Utility Types | Default Tariff |
|---------------|----------------------|----------------|
| RESIDENTIAL | Electric, Water, Gas | Residential Flat Rate |
| COMMERCIAL_SMALL | Electric, Water | Commercial Tiered |
| COMMERCIAL_LARGE | Electric, Water, Gas | Commercial ToU + Demand |
| INDUSTRIAL | Electric | Industrial ToU + Demand |
| GOVERNMENT | Electric, Water, Gas | Government Fixed |
| AGRICULTURAL | Electric, Water | Agricultural Subsidized |

---

## PART 5: TARIFF SIMULATION ENGINE

### 5.1 Simulation Capabilities

| Feature | Description |
|---------|-------------|
| **What-if analysis** | Compare current tariff vs proposed tariff for same consumption |
| **Impact preview** | Show billing impact before tariff change is activated |
| **Batch simulation** | Run simulation across a customer segment |
| **Revenue forecasting** | Estimate revenue change from proposed tariff |
| **Customer impact report** | Per-customer before/after comparison |

### 5.2 Simulation API

```
POST /api/tariffs/simulate
{
  "tariffVersionId": "new-tariff-version-id",
  "customerIds": ["c1", "c2"],          // or "segment": "all_residential"
  "periodStart": "2026-08-01",
  "periodEnd": "2026-08-31",
  "compareWithCurrent": true
}

â†’ Response:
{
  "simulationId": "sim-001",
  "period": { "start": "2026-08-01", "end": "2026-08-31" },
  "customers": {
    "count": 2,
    "currentTotal": EGP 5,250.00,
    "proposedTotal": EGP 4,800.00,
    "difference": -EGP 450.00 (-8.6%),
    "affected": [
      {
        "customerId": "c1",
        "currentCharges": EGP 3,200.00,
        "proposedCharges": EGP 2,900.00,
        "difference": -EGP 300.00,
        "changePct": -9.4%
      },
      ...
    ]
  },
  "revenueForecast": {
    "currentAnnualRunRate": EGP 63,000.00,
    "proposedAnnualRunRate": EGP 57,600.00,
    "annualImpact": -EGP 5,400.00
  },
  "aggregateImpact": {
    "avgBillChange": -8.6%,
    "customersWithIncrease": 0,
    "customersWithDecrease": 2,
    "customersUnaffected": 0
  }
}
```

### 5.3 Simulation Engine Design

```
TariffSimulationEngine.simulate(tariffVersionId, customerIds, period):
  1. LOAD proposed tariff version
     tariffVersion = TariffVersion.findUnique(tariffVersionId)
       WITH versionRates, versionTiers, toUSchedules, demandRates,
            fixedCharges, taxes
  
  2. FOR each customer:
     a. LOAD current tariff for customer (via TariffEngine.resolve)
     b. LOAD historical consumption for period
     
     c. CALCULATE with current tariff
        currentResult = TariffEngine.calculate(currentTariff, readings, period)
     
     d. CALCULATE with proposed tariff
        proposedResult = TariffEngine.calculate(proposedTariff, readings, period)
     
     e. STORE comparison
        customerResults.push({
          customerId, customerName,
          currentCharges: currentResult.totalCharge,
          proposedCharges: proposedResult.totalCharge,
          difference: proposedResult.totalCharge - currentResult.totalCharge,
          changePct: difference / currentResult.totalCharge * 100,
          breakdown: {
            current: currentResult.breakdownByType,
            proposed: proposedResult.breakdownByType,
          }
        })
  
  3. AGGREGATE results
     return {
       simulationId,
       period,
       customerCount,
       currentTotal, proposedTotal, difference,
       revenueForecast,
       customerResults[]
     }
```

---

## PART 6: TARIFF CHANGE APPROVAL WORKFLOW

### 6.1 Tariff Version Lifecycle

```
                  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                  â”‚              TARIFF VERSION LIFECYCLE                 â”‚
                  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

CREATE (Tariff Admin)
    â”‚
    â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  DRAFT   â”‚â”€â”€â†’ Edit rates, tiers, schedules, charges (no effect on billing)
â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜
     â”‚
     â”‚ SUBMIT FOR APPROVAL
     â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ PENDING_APPROVAL  â”‚â”€â”€â†’ Notification sent to approver(s)
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚
    â”Œâ”€â”€â”€â”€â”´â”€â”€â”€â”€â”
    â”‚         â”‚
    â–¼         â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚APPROVEDâ”‚ â”‚REJECTEDâ”‚â”€â”€â†’ Returned to DRAFT with reason
â””â”€â”€â”€â”¬â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”˜
    â”‚
    â”‚ ACTIVATE (scheduled or immediate)
    â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ACTIVE  â”‚â”€â”€â†’ Affects billing from effectiveFrom date
â””â”€â”€â”€â”¬â”€â”€â”€â”€â”˜
    â”‚
    â”‚ NEW VERSION CREATED
    â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ SUPERSEDED â”‚â”€â”€â†’ Previous version archived for audit
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 6.2 Approval Rules

| Rule | Condition | Approver |
|------|-----------|----------|
| Standard tariff change | Rate change < 10% | Billing Manager |
| Major rate change | Rate change 10-25% | Finance Manager |
| Critical rate change | Rate change > 25% | CFO |
| New tariff creation | Any new tariff | Finance Manager |
| Tariff retirement | Any tariff deactivation | CFO |
| Promotional tariff | Discount > 20% | Finance Manager |

### 6.3 Approval Notifications

```
On SUBMIT:
  â†’ Notify approver: "Tariff {name} v{version} submitted by {user}"
  â†’ Include: rate change summary, effective dates, revenue impact forecast

On APPROVE:
  â†’ Notify creator: "Tariff {name} v{version} approved by {approver}"
  â†’ Auto-schedule activation at effectiveFrom date

On REJECT:
  â†’ Notify creator: "Tariff {name} v{version} rejected by {approver}"
  â†’ Include reason: {comment}
  â†’ Return to DRAFT state

On ACTIVATE:
  â†’ Notify billing team: "Tariff {name} v{version} now active"
  â†’ Notify revenue assurance: new tariff active â€” validation rules updated
```

---

## PART 7: INTEGRATION WITH EXISTING SYSTEMS

### 7.1 Integration Map

```
Bill Run (existing routes/billing.js)
    â”‚
    â””â”€â”€â†’ W03: TariffEngine.resolve() per customer
         â†’ W03: TariffEngine.calculate() per meter
         â†’ W03: Generate InvoiceItem[] from ChargeResult
         â†’ existing: Invoice.create()
         â†’ W01: FinancialEvent INVOICE_ISSUED
         â†’ W02: RevenueRuleEngine pre-bill validation

Invoice Issue (existing routes/invoices.js)
    â”‚
    â””â”€â”€â†’ W03: Store tariffSnapshotId on invoice
         â†’ W01: FinancialEvent + GL posting
         â†’ W02: Post-bill validation (tariff check)

Tariff Simulation (NEW)
    â”‚
    â””â”€â”€â†’ W03: TariffSimulationEngine.simulate()
         â†’ Shows impact preview before approval
         â†’ Used by W04: Collection optimization

Revenue Assurance (W02)
    â”‚
    â””â”€â”€â†’ W03: Tariff validation rules (RA-005: misapplication)
         â†’ W03: Consumption anomaly detection
         â†’ W03: Rate change monitoring

PostingEngine (W01)
    â”‚
    â””â”€â”€â†’ W03: AccountMapping resolves tariff type â†’ GL accounts

AccountMapping (W01)
    â”‚
    â””â”€â”€â†’ W03: Each tariff line item maps to correct GL account
         (e.g., Water Revenue, Electric Revenue, Tax Payable)
```

### 7.2 Billing Engine Rewrite

The existing `billing-engine.js` is replaced with the full TariffEngine pipeline:

```javascript
// NEW: services/tariff-engine.js (replaces billing-engine.js)

export async function generateInvoice(customerId, periodStart, periodEnd) {
  // 1. Load customer + meters
  const customer = await prisma.customer.findUnique({ where: { id: customerId } })
  const assignments = await prisma.meterAssignment.findMany({
    where: { customerId, endAt: null },
    include: { meter: { include: { type: true } } },
  })

  let totalAmount = 0
  const invoiceItems = []

  for (const assignment of assignments) {
    // 2. Resolve tariff for this meter/customer
    const resolved = await resolveTariff(customer, assignment.meter, periodStart)
    const tariff = resolved.tariff
    const discountRate = resolved.discountRate || 0

    // 3. Load readings for period
    const readings = await prisma.reading.findMany({
      where: { meterId: assignment.meterId, timestamp: { gte: periodStart, lte: periodEnd }, status: "valid" },
      orderBy: { timestamp: "asc" },
    })

    // 4. Calculate charges
    const result = await calculateCharges(tariff, readings, periodStart, periodEnd, discountRate)
    totalAmount += result.totalCharge

    // 5. Create invoice items for each charge line
    for (const line of result.chargeLines) {
      invoiceItems.push({
        type: line.type,
        description: line.name,
        quantity: line.consumption || line.demand || 1,
        unitPrice: line.rate || line.charge,
        amount: line.charge,
        total: line.charge,
        tariffSnapshotId: tariff.id,
      })
    }
  }

  // 6. Create invoice
  const invoice = await prisma.invoice.create({
    data: {
      number: generateInvoiceNumber(),
      customerId,
      amount: totalAmount,
      status: "pending",
      periodStart,
      periodEnd,
      dueDate: calculateDueDate(customer.billCycleId, periodEnd),
      invoiceItems: { create: invoiceItems },
    },
  })

  return invoice
}
```

---

## PART 8: AI TARIFF OPTIMIZATION AGENT

### 8.1 Agent Design

**Agent Name:** Tariff Optimization Agent  
**Framework:** C12-W07 Operational Intelligence (AIRecommendation model)  
**Autonomy Level:** âš¡ Semi-autonomous  
**Human Approval Required:** All tariff structure changes  

### 8.2 Agent Capabilities

| Capability | Description | Autonomy |
|------------|-------------|----------|
| **Anomaly Detection** | Detect under/over charging vs peers | âœ… Full (read-only) |
| **Optimization Suggestion** | Recommend tariff changes per segment | âš¡ Requires approval |
| **Revenue Impact Forecast** | Forecast revenue effect of proposed change | âœ… Full (read-only) |
| **Expiry Alert** | Flag tariffs approaching effectiveTo | âœ… Full (auto-notify) |
| **Competitive Analysis** | Compare rates against market benchmarks | âœ… Full (read-only) |
| **Customer Impact Report** | Show how proposed change affects each segment | âœ… Full (read-only) |

### 8.3 Detection Algorithms

**Tariff Anomaly Detection:**
```
ALGORITHM: detectTariffAnomalies()
  1. For each customer:
     a. Get current tariff and consumption
     b. Calculate expected charge with current tariff
     c. Compare with peers (same segment, same consumption tier)
     d. IF charge > avg + 2Ïƒ â†’ FLAG: "Customer may be overpaying"
     e. IF charge < avg - 2Ïƒ â†’ FLAG: "Customer may be underpaying"
  
  2. For each tariff:
     a. Get all customers on this tariff
     b. Calculate revenue per customer
     c. IF avg revenue declining â†’ FLAG: "Tariff revenue declining"
  
  3. For each area:
     a. Compare revenue/consumption ratio across areas
     b. IF significant variance â†’ FLAG: "Area revenue variance detected"
```

**Revenue Impact Forecast:**
```
ALGORITHM: forecastRevenueImpact(tariffVersion)
  1. Get all customers who would use this tariff
     (by customer type, group, or explicit assignment)
  
  2. For each customer:
     a. Get historical consumption (last 12 months)
     b. Calculate current charge with current tariff
     c. Calculate proposed charge with proposed tariff
     d. Project annual difference
     e. Aggregate: total expected revenue change
  
  3. RETURN {
       totalCurrentAnnualRevenue,
       totalProposedAnnualRevenue,
       annualDifference,
       customersWithIncrease,
       customersWithDecrease,
       maxIncrease, maxDecrease,
       segmentBreakdown: { by customer type }
     }
```

---

## PART 9: ENTERPRISE TARIFF DASHBOARD

### 9.1 Dashboard Page

**Location:** `/admin/tariff-intelligence`

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ TARIFF INTELLIGENCE DASHBOARD                                                        â”‚
â”‚                                                                                      â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”‚
â”‚ â”‚ Active       â”‚ â”‚ Pending      â”‚ â”‚ Revenue      â”‚ â”‚ Upcoming Changes     â”‚        â”‚
â”‚ â”‚ Tariffs      â”‚ â”‚ Approvals    â”‚ â”‚ at Risk      â”‚ â”‚                      â”‚        â”‚
â”‚ â”‚        12    â”‚ â”‚         3    â”‚ â”‚   EGP 125K   â”‚ â”‚ TieredRate v2 â†’ Aug  â”‚        â”‚
â”‚ â”‚ â”€ Electricity â”‚ â”‚ â”€â”€â”€ ToU v2   â”‚ â”‚ â”€â”€â”€â”€         â”‚ â”‚ ToU v2 â†’ Sep         â”‚        â”‚
â”‚ â”‚ â”€â”€ Water      â”‚ â”‚ â”€â”€â”€ Tier v3  â”‚ â”‚  â†“ 8% from  â”‚ â”‚ CommRate v4 â†’ Oct    â”‚        â”‚
â”‚ â”‚ â”€â”€ Gas        â”‚ â”‚ â”€â”€â”€ Comm v4  â”‚ â”‚    target   â”‚ â”‚                      â”‚        â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â”‚
â”‚                                                                                      â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚ â”‚ TARIFF LIST (12 active)                                SEARCH: _________    â”‚    â”‚
â”‚ â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚    â”‚
â”‚ â”‚ â”‚ Code â”‚ Name       â”‚ Type     â”‚ Version  â”‚ Rate     â”‚ Customersâ”‚ Status â”‚ â”‚    â”‚
â”‚ â”‚ â”œâ”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”¤ â”‚    â”‚
â”‚ â”‚ â”‚ EL-1 â”‚ Residentialâ”‚ Electric â”‚ v3       â”‚ Tiered   â”‚  12,450  â”‚ ACTIVE â”‚ â”‚    â”‚
â”‚ â”‚ â”‚ EL-2 â”‚ Commercial â”‚ Electric â”‚ v2       â”‚ ToU+Dem  â”‚   3,200  â”‚ ACTIVE â”‚ â”‚    â”‚
â”‚ â”‚ â”‚ WT-1 â”‚ Residentialâ”‚ Water    â”‚ v4       â”‚ Tiered   â”‚  11,800  â”‚ ACTIVE â”‚ â”‚    â”‚
â”‚ â”‚ â”‚ GS-1 â”‚ Residentialâ”‚ Gas      â”‚ v1       â”‚ Tiered   â”‚   5,600  â”‚ ACTIVE â”‚ â”‚    â”‚
â”‚ â”‚ â”‚ EL-3 â”‚ Industrial â”‚ Electric â”‚ v2       â”‚ ToU+Dem  â”‚     450  â”‚ ACTIVE â”‚ â”‚    â”‚
â”‚ â”‚ â””â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚    â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                                                      â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚ â”‚ REVENUE BY TARIFF TYPE      â”‚ â”‚ TARIFF ANOMALIES                               â”‚   â”‚
â”‚ â”‚                             â”‚ â”‚                                                 â”‚   â”‚
â”‚ â”‚ Tiered:        62% â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ  â”‚ â”‚ âš  3 customers overpaying on TieredElectric    â”‚   â”‚
â”‚ â”‚ ToU+Demand:    23% â–ˆâ–ˆâ–ˆ      â”‚ â”‚ âš  Water Tier v3 expiring in 45 days          â”‚   â”‚
â”‚ â”‚ Flat Rate:     10% â–ˆâ–ˆ       â”‚ â”‚ âš  Commercial rate variance > 15% in Cairo    â”‚   â”‚
â”‚ â”‚ Fixed Charge:   5% â–ˆ        â”‚ â”‚ âš  Industrial customers with no demand charge â”‚   â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 9.2 Tariff Detail Page

**Location:** `/admin/tariff-intelligence/:id`

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ TARIFF: Residential Electric (EL-1)                                                  â”‚
â”‚                                                                                      â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚ â”‚ VERSION HISTORY                                                               â”‚    â”‚
â”‚ â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚    â”‚
â”‚ â”‚ â”‚ Version  â”‚ Status     â”‚ Eff From â”‚ Eff To   â”‚ Change   â”‚ Approved By     â”‚ â”‚    â”‚
â”‚ â”‚ â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤ â”‚    â”‚
â”‚ â”‚ â”‚ v3       â”‚ ACTIVE     â”‚ 2026-01  â”‚ â€”        â”‚ Rate +8% â”‚ Finance Mgr     â”‚ â”‚    â”‚
â”‚ â”‚ â”‚ v2       â”‚ SUPERSEDED â”‚ 2025-07  â”‚ 2025-12  â”‚ Tier add â”‚ Billing Mgr     â”‚ â”‚    â”‚
â”‚ â”‚ â”‚ v1       â”‚ SUPERSEDED â”‚ 2025-01  â”‚ 2025-06  â”‚ New      â”‚ Finance Mgr     â”‚ â”‚    â”‚
â”‚ â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚    â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                                                      â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ CURRENT STRUCTURE (v3 ACTIVE) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ Fixed: Service Charge EGP 25.00/mo  Meter Rental EGP 10.00/mo                  â”‚  â”‚
â”‚ â”‚ Tiers: 0-100 @ 0.50 | 101-300 @ 0.75 | 301-600 @ 1.25 | 600+ @ 2.00           â”‚  â”‚
â”‚ â”‚ Tax: VAT 14% | Service Fee 2%                                                  â”‚  â”‚
â”‚ â”‚ Customers: 12,450 | Avg Monthly Bill: EGP 185.00                               â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                                      â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ ACTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ [ Create New Version ]  [ Simulate Change ]  [ View Customers ]  [ Deactivate ] â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## PART 10: TESTING STRATEGY â€” W03 (100 Tests)

### 10.1 Tariff Resolution Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Customer with contract tariff â†’ contract tariff used | Contract overrides group |
| 2 | Customer with group pricing â†’ group tariff used | Group overrides default |
| 3 | No contract, no group â†’ default utility tariff | Falls back to type match |
| 4 | No tariff of matching type â†’ error | Clear error message |
| 5 | Multiple active tariffs â†’ highest priority wins | Priority respected |
| 6 | Tariff outside effectiveFrom â†’ not resolved | Date guard |
| 7 | Tariff past effectiveTo â†’ not resolved | Date guard |
| 8 | Expired contract tariff â†’ falls through to group | Graceful degradation |
| 9 | Disabled tariff â†’ not resolved | Status check |
| 10 | Archived tariff â†’ not resolved | archivedAt check |

### 10.2 Flat Rate Calculation (10)

| # | Test | Expect |
|---|------|--------|
| 1 | 100 kWh Ã— EGP 2.50 = EGP 250 | Correct amount |
| 2 | 0 kWh â†’ EGP 0 | Zero consumption |
| 3 | Multiple rates â†’ all applied | Sum of rates |
| 4 | Rate with priority â†’ higher priority first | Order respected |
| 5 | Rate outside validFrom â†’ skipped | Date guard |

### 10.3 Tiered Pricing Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | 50 kWh in tier 1 (0-100) â†’ tier 1 rate | Single tier |
| 2 | 150 kWh spans tiers 1+2 â†’ both tiers | Cross-tier |
| 3 | 500 kWh spans 3 tiers â†’ all applicable | Multi-tier |
| 4 | Consumption at exactly tier boundary â†’ correct | Boundary |
| 5 | Zero consumption â†’ no tier charge | Zero |
| 6 | Tier with null maxValue â†’ absorbs remainder | Open-ended |
| 7 | Disordered tiers â†’ sorted by priority | Sort |
| 8 | Overlapping tiers â†’ higher priority wins | Precedence |

### 10.4 Time-of-Use Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Reading in peak window â†’ peak rate | Window match |
| 2 | Reading in off-peak â†’ off-peak rate | Window match |
| 3 | Reading at window boundary â†’ correct window | Boundary |
| 4 | Multiple readings across all windows â†’ all applied | Window switching |
| 5 | No schedule for day of week â†’ default rate | Fallback |
| 6 | Weekend schedule â†’ weekend rate | Day matching |
| 7 | Season-based schedule â†’ correct season | Season matching |
| 8 | Overlapping windows â†’ higher priority wins | Precedence |
| 9 | Schedule with no matching window â†’ error | Missing window |
| 10 | Invalid startMinute > endMinute â†’ validation error | Schema validation |

### 10.5 Demand Charge Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | 50 kVA demand Ã— EGP 50 = EGP 2,500 | Correct charge |
| 2 | Demand below threshold â†’ no charge | Threshold |
| 3 | Multiple demand rates â†’ all applied | Multiple |
| 4 | No readings with demand data â†’ no charge | Missing data |
| 5 | Demand charge with ToU â†’ independent calculation | Decoupled |

### 10.6 Fixed Charge + Tax Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Monthly fixed charge â†’ applied once | Monthly |
| 2 | Daily pro-rated for 15 days â†’ half charge | Pro-ration |
| 3 | Multiple fixed charges â†’ all applied | Stacking |
| 4 | VAT 14% on total â†’ correct amount | Percentage tax |
| 5 | Fixed amount tax â†’ exact amount | Fixed tax |
| 6 | Tax on consumption only â†’ not applied to fixed | appliesTo filter |
| 7 | Multiple taxes â†’ all applied | Stacking |
| 8 | Discount before tax â†’ correct base | Order of ops |
| 9 | Tax with zero rate â†’ zero | Zero rate |
| 10 | Tax exemption for group â†’ not applied | Exemption |

### 10.7 Simulation Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | Compare current vs proposed â†’ correct difference | Difference |
| 2 | Batch simulation for 10 customers â†’ 10 results | Batch |
| 3 | Revenue forecast â†’ annual projection | Forecast |
| 4 | Simulation with no changes â†’ zero difference | Baseline |
| 5 | Simulation with new tariff â†’ all results | New tariff |

### 10.8 Version Lifecycle Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Create version â†’ status DRAFT | Initial state |
| 2 | Submit for approval â†’ PENDING_APPROVAL | Status change |
| 3 | Approve â†’ APPROVED | Status change |
| 4 | Activate â†’ ACTIVE | Status change |
| 5 | Reject â†’ back to DRAFT with reason | With reason |
| 6 | New version â†’ previous SUPERSEDED | Version chain |
| 7 | Cannot edit ACTIVE version â†’ error | Guard |
| 8 | Cannot delete APPROVED version â†’ error | Guard |
| 9 | Version history preserved â†’ all states logged | Audit |
| 10 | Activation schedules at effectiveFrom â†’ scheduled | Date-based |

### 10.9 Multi-Utility Tests (5)

| # | Test | Expect |
|---|------|--------|
| 1 | Electric tariff â†’ kWh consumption | Correct unit |
| 2 | Water tariff â†’ mÂ³ consumption | Correct unit |
| 3 | Gas tariff â†’ BTU/Therm consumption | Correct unit |
| 4 | Mixed utility customer â†’ correct per meter | Independent |
| 5 | Solar tariff â†’ net consumption | Net metering |

---

## PART 11: W03 DEFINITION OF DONE

```
W03 â€” TARIFF INTELLIGENCE & ADVANCED BILLING ENGINE
CERTIFICATION CHECKLIST

â–¡ CORE DATA MODELS â€” 9 NEW
   â–¡ TariffVersion (versioned lifecycle)
   â–¡ TariffVersionRate (rate snapshot)
   â–¡ TariffVersionTier (tier snapshot)
   â–¡ TariffToUSchedule (time-of-use windows)
   â–¡ TariffDemandRate (demand charges)
   â–¡ TariffFixedCharge (standing charges)
   â–¡ TariffTax (taxes, fees, levies)
   â–¡ TariffChangeLog (change approval audit)
   â–¡ CustomerTariff (customerâ†’tariff assignment)

â–¡ EXISTING MODELS ENHANCED
   â–¡ Tariff: category, utilityType, eligibleCustomerTypes
   â–¡ GroupPricing: tariffVersionId link
   â–¡ Invoice: tariffSnapshotId

â–¡ TARIFF ENGINE
   â–¡ TariffEngine.resolve() â€” customerâ†’meterâ†’tariff resolution
   â–¡ TariffEngine.calculate() â€” full calculation pipeline
   â–¡ Flat rate calculation
   â–¡ Tiered pricing (multi-tier, cross-boundary)
   â–¡ Time-of-Use (peak/off-peak/shoulder, seasonal)
   â–¡ Demand charges (kW/kVA, threshold)
   â–¡ Fixed charges (monthly, daily, pro-rated)
   â–¡ Variable charges
   â–¡ Taxes, fees, levies (percentage + fixed)
   â–¡ Discounts (percentage, early payment, group)
   â–¡ Charge rules + overrides
   â–¡ Pro-ration (mid-period changes)

â–¡ TARIFF LIFECYCLE â€” FULLY VERSIONED
   â–¡ DRAFT â†’ PENDING_APPROVAL â†’ APPROVED â†’ ACTIVE â†’ SUPERSEDED
   â–¡ Version history preserved
   â–¡ Change reason required
   â–¡ Approval workflow with role-based gates
   â–¡ Scheduled activation at effectiveFrom
   â–¡ Previous version auto-superseded

â–¡ SIMULATION ENGINE
   â–¡ What-if analysis (current vs proposed)
   â–¡ Batch simulation (customer segment)
   â–¡ Revenue impact forecast
   â–¡ Customer-level breakdown

â–¡ BILLING ENGINE INTEGRATION
   â–¡ Billing engine uses TariffEngine for all calculations
   â–¡ Per-meter tariff resolution
   â–¡ Per-charge-line invoice items
   â–¡ Historical tariff snapshot on invoice
   â–¡ Flat rate â†’ full tariff pipeline migration

â–¡ AI TARIFF OPTIMIZATION AGENT
   â–¡ Anomaly detection (under/over charging)
   â–¡ Revenue impact forecasting
   â–¡ Expiry alerting
   â–¡ Competitive analysis
   â–¡ Customer impact reporting
   â–¡ C12 AIRecommendation integration

â–¡ DASHBOARD
   â–¡ Tariff Intelligence Dashboard at /admin/tariff-intelligence
   â–¡ Tariff list with filters (type, status, utility)
   â–¡ Tariff detail with version history
   â–¡ Version comparison view
   â–¡ Simulation UI
   â–¡ Revenue by tariff type chart

â–¡ SECURITY
   â–¡ RBAC: Tariff Admin, Tariff Approver, Tariff Viewer
   â–¡ Segregation: create â‰  approve â‰  activate
   â–¡ ACTIVE/APPROVED versions immutable
   â–¡ Change log append-only
   â–¡ All mutations audited

â–¡ TESTS â€” 100 PASSING
   â–¡ Tariff resolution: 20 tests
   â–¡ Flat rate: 10 tests
   â–¡ Tiered pricing: 15 tests
   â–¡ Time-of-Use: 10 tests
   â–¡ Demand charge: 5 tests
   â–¡ Fixed + tax: 15 tests
   â–¡ Simulation: 10 tests
   â–¡ Version lifecycle: 15 tests

W03 STATUS: â–¡ NOT IMPLEMENTED
All items above are DESIGN-COMPLETE but not executed.
```

---

## APPENDIX A: W03 DEPENDENCY GRAPH

```
W01 (Billing-to-GL) â”€â”€â”€â”€â”€â”€â”
W02 (Revenue Assurance) â”€â”€â”€â”¤
Tariff (existing models) â”€â”€â”¤
Billing engine (exist) â”€â”€â”€â”€â”¤
Customer group (exist) â”€â”€â”€â”€â”¤
ChargeRule (existing) â”€â”€â”€â”€â”€â”¤
GroupPricing (existing) â”€â”€â”€â”¤
BillCycle (existing) â”€â”€â”€â”€â”€â”€â”¤
                            â–¼
                 â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                 â”‚  W03 TARIFF ENGINE   â”‚
                 â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                       â”‚
                       â”œâ”€â”€â†’ TariffEngine.resolve() + calculate()
                       â”œâ”€â”€â†’ TariffVersion lifecycle
                       â”œâ”€â”€â†’ ToU / Tiered / Demand calculators
                       â”œâ”€â”€â†’ TariffSimulationEngine
                       â”œâ”€â”€â†’ Tariff Optimization AI Agent
                       â”œâ”€â”€â†’ tariff-intelligence dashboard
                       â””â”€â”€â†’ Invoice tariff snapshots
```

## APPENDIX B: W03 FILE MANIFEST

| # | File | Action | Lines |
|---|------|--------|-------|
| 1 | `backend/prisma/schema.prisma` | MODIFY | +180 lines (9 new models) |
| 2 | Migration: tariff_intelligence | CREATE | Standard |
| 3 | `backend/src/services/tariff-engine.js` | **CREATE** | ~350 lines (resolve + calculate) |
| 4 | `backend/src/services/tariff-simulator.js` | **CREATE** | ~150 lines (simulation) |
| 5 | `backend/src/services/tariff-version.js` | **CREATE** | ~120 lines (lifecycle) |
| 6 | `backend/src/services/tariff-to-calculator.js` | **CREATE** | ~80 lines (ToU) |
| 7 | `backend/src/services/tariff-tier-calculator.js` | **CREATE** | ~60 lines (tiered) |
| 8 | `backend/src/services/tariff-demand-calculator.js` | **CREATE** | ~50 lines (demand) |
| 9 | `backend/src/services/billing-engine.js` | **REWRITE** | Replace flat-rate with TariffEngine |
| 10 | `backend/src/routes/tariffs.js` | **REWRITE** | Add version lifecycle, simulation, approval |
| 11 | `backend/src/routes/billing.js` | MODIFY | Use new billing engine |
| 12 | `backend/src/server.js` | MODIFY | Route registration |
| 13 | `backend/src/services/ai-engine.js` | MODIFY | Add Tariff Optimization Agent |
| 14 | `Frontend/src/app/admin/tariff-intelligence/page.tsx` | **CREATE** | ~350 lines (dashboard) |
| 15 | `Frontend/src/app/admin/tariff-intelligence/[id]/page.tsx` | **CREATE** | ~250 lines (detail) |
| 16 | `Frontend/src/app/admin/tariff-intelligence/simulate/page.tsx` | **CREATE** | ~200 lines (simulation) |

**Total estimated new code:** ~2,200 lines
**Total estimated tests:** 100 tests
**Cumulative C13 (W01-W03):** 85 + 95 + 100 = 280 tests

---

*This document is a planning artifact only. No code, no implementation, no database migration.*
*C13-W03 â€” Tariff Intelligence & Advanced Billing Engine. READ ONLY. GOVERNANCE PLANNING ONLY.*

