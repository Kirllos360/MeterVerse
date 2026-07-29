# C13-W03 — Enterprise Tariff Intelligence & Advanced Billing Engine
## Blueprint

**Version:** 1.0.0  
**Status:** READ ONLY — GOVERNANCE PLANNING ONLY — NOT IMPLEMENTED  
**Date:** 2026-07-29  
**Program:** C13 Enterprise Financial & Billing Intelligence Platform  
**Wave:** W03 (Tariff Intelligence — builds on W01+W02 billing and revenue foundation)  

---

## PART 1: CURRENT STATE AUDIT

### 1.1 Existing Tariff Infrastructure

| Component | Location | Status | Capability |
|-----------|----------|--------|------------|
| **Tariff** model | `schema.prisma:1088` | ✅ Complete | name, code, type, effectiveFrom/To, status, currency, unit |
| **TariffRate** model | `schema.prisma:1107` | ✅ Complete | name, rate, unit, validFrom/To, priority |
| **TariffTier** model | `schema.prisma:1123` | ✅ Complete | minValue, maxValue, rate, unit, priority |
| **ChargeRule** model | `schema.prisma:1186` | ✅ Complete | formula-based charges with priority |
| **ChargeOverride** model | `schema.prisma:1203` | ✅ Complete | per-customer/contract overrides |
| **DiscountRule** model | `schema.prisma:1256` | ✅ Complete | discount definitions |
| **GroupPricing** model | `schema.prisma:1533` | ✅ Complete | customer group → tariff + discount |
| **BillCycle** model | `schema.prisma:1139` | ✅ Complete | frequency, billingDay, dueDay, cutOffDay |
| **Tariff routes** | `routes/tariffs.js` | ✅ Complete | CRUD + /calculate endpoint |
| **Billing engine** | `services/billing-engine.js` | ⚠️ Basic | Flat-rate only — reads `rates[0].rate` |

### 1.2 Current Tariff Route Capabilities

```
GET    /tariffs          → List tariffs (filter by status, type, effective date)
GET    /tariffs/:id      → Get tariff with rates + tiers
POST   /tariffs          → Create tariff with rates + tiers
PUT    /tariffs/:id      → Update tariff (replace rates + tiers)
POST   /tariffs/calculate → Calculate charge for given consumption
```

All routes have Zod validation, RBAC, and audit logging.

### 1.3 Current Billing Engine Capabilities

```javascript
// billing-engine.js — COMPLETE CURRENT CODE:
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
- ❌ No customer-to-tariff resolution (always picks first active tariff)
- ❌ No tariff type checking (flat/tiered/tou/demand)
- ❌ No ToU schedules
- ❌ No demand charge
- ❌ No fixed/standing charges
- ❌ No tax calculation
- ❌ No discount application
- ❌ No charge rule evaluation
- ❌ No meter type → tariff mapping
- ❌ No pro-ration
- ❌ No versioning/draft lifecycle
- ❌ No simulation/preview
- ❌ No audit history for changes

### 1.4 Existing Data Flows to Integrate

```
Meter Reading Pipeline (exists)       → consumption data
W01 FinancialEvent (planned)           → revenue events
W02 Revenue Assurance (planned)        → tariff validation rules
Account Mapping (planned in W01)       → tariff → GL accounts
Invoice Generation (exists)            → uses tariff rates
Customer Group (exists)                → group-based pricing
ChargeRule + ChargeOverride (exists)   → formula charges
DiscountRule (exists)                  → discounts
BillCycle (exists)                     → billing frequency
```

---

## PART 2: ENTERPRISE TARIFF ARCHITECTURE

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                          TARIFF INTELLIGENCE PLATFORM                                          │
│                                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  TARIFF DEFINITION LAYER                                                                │    │
│  │                                                                                        │    │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌─────────────────────┐  │    │
│  │  │ Flat Rate  │ │  Tiered    │ │  Time-of-  │ │  Demand    │ │  Fixed + Variable   │  │    │
│  │  │ Tariff     │ │  Pricing   │ │  Use (ToU) │ │  Charges   │ │  Charges            │  │    │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘ └─────────────────────┘  │    │
│  │                                                                                        │    │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌─────────────────────┐  │    │
│  │  │ Taxes &    │ │  Fees &    │ │  Discounts │ │  Subsidies │ │  Customer Group     │  │    │
│  │  │ Surcharges │ │  Levies    │ │            │ │            │ │  Assignment          │  │    │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘ └─────────────────────┘  │    │
│  └──────────────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  TARIFF LIFECYCLE LAYER                                                                │    │
│  │                                                                                        │    │
│  │  DRAFT → PENDING_APPROVAL → APPROVED → ACTIVE → SUPERSEDED (by new version)           │    │
│  │                                                                                        │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────────────┐  │    │
│  │  │ Versioning: V1 (2025-01-01), V2 (2025-07-01), V3 (2026-01-01)                    │  │    │
│  │  │ Each version has: effectiveFrom, effectiveTo, status, changeReason, approvedBy   │  │    │
│  │  └─────────────────────────────────────────────────────────────────────────────────┘  │    │
│  └──────────────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  TARIFF EXECUTION LAYER                                                                │    │
│  │                                                                                        │    │
│  │  ┌───────────────────────────────────────────────────────────────────────────────┐    │    │
│  │  │  TariffEngine.resolve(customerId, meterId, periodStart, periodEnd) → Tariff    │    │    │
│  │  │    1. Check customer group → tariff assignment                                  │    │    │
│  │  │    2. Check contract → specific tariff/pricing                                 │    │    │
│  │  │    3. Check meter type → applicable tariff                                     │    │    │
│  │  │    4. Resolve effective date → correct version                                 │    │    │
│  │  │    5. Return resolved tariff + rates + tiers + schedule                        │    │    │
│  │  └───────────────────────────────────────────────────────────────────────────────┘    │    │
│  │                                                                                        │    │
│  │  ┌───────────────────────────────────────────────────────────────────────────────┐    │    │
│  │  │  TariffEngine.calculate(tariff, readings, period) → ChargeResult               │    │    │
│  │  │    1. Calculate consumption from readings                                      │    │    │
│  │  │    2. Apply tiered pricing (if tariff has tiers)                               │    │    │
│  │  │    3. Apply ToU pricing (if tariff has schedule)                               │    │    │
│  │  │    4. Apply demand charges (if tariff has demand rates)                        │    │    │
│  │  │    5. Apply fixed charges + variable charges                                   │    │    │
│  │  │    6. Apply charge rules + overrides                                           │    │    │
│  │  │    7. Apply discounts                                                          │    │    │
│  │  │    8. Calculate taxes + fees + levies                                          │    │    │
│  │  │    9. Apply subsidies                                                          │    │    │
│  │  │   10. Return ChargeResult { lineItems[], totalBeforeTax, tax, totalAfterTax } │    │    │
│  │  └───────────────────────────────────────────────────────────────────────────────┘    │    │
│  └──────────────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  INTEGRATION LAYER                                                                     │    │
│  │                                                                                        │    │
│  │  BillRun → TariffEngine.resolve() → TariffEngine.calculate() → Invoice.create()       │    │
│  │  Simulation → same pipeline but no persistence                                         │    │
│  │  Revenue Assurance → tariff validation rules on resolved tariff                       │    │
│  │  PostingEngine → debit/credit accounts from tariff line items                         │    │
│  └──────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  AI TARIFF OPTIMIZATION AGENT                                                          │    │
│  │                                                                                        │    │
│  │  • Detect tariff anomalies (under/over charging)                                      │    │
│  │  • Recommend optimal tariff for customer segment                                      │    │
│  │  • Forecast revenue impact of tariff changes                                          │    │
│  │  • Flag expiring tariffs before effectiveTo                                          │    │
│  └──────────────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
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
  
  6. NO TARIFF FOUND → ERROR: "No active tariff found for customer/meter"
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

// ── STEP 1: Calculate consumption from readings ──
  totalConsumption = SUM(readings, value)
  byDate = GROUP readings BY timestamp.date  // for ToU

// ── STEP 2: Time-of-Use calculation ──
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
      charge = readingGroup.consumption × rate
      chargeLines.push({ type: "tou", window: window.name, consumption, rate, charge })
      totalVariable += charge

// ── STEP 3: Tiered pricing calculation ──
  ELSE IF tariff.tiers.length > 0:
    sortedTiers = tariff.tiers.sort(priority)
    remaining = totalConsumption
    FOR each tier IN sortedTiers:
      max = tier.maxValue ?? remaining
      min = tier.minValue ?? 0
      tierConsumption = MIN(remaining, MAX(0, max - min))
      IF tierConsumption <= 0: CONTINUE
      charge = tierConsumption × tier.rate
      chargeLines.push({ type: "tier", name: tier.name, consumption: tierConsumption, rate: tier.rate, charge })
      totalVariable += charge
      remaining -= tierConsumption
      IF remaining <= 0: BREAK

// ── STEP 4: Flat rate calculation ──
  ELSE IF tariff.rates.length > 0:
    FOR each rate IN tariff.rates:
      charge = totalConsumption × rate.rate
      chargeLines.push({ type: "rate", name: rate.name, consumption: totalConsumption, rate: rate.rate, charge })
      totalVariable += charge

// ── STEP 5: Demand charge calculation ──
  IF tariff.hasDemandCharge:
    maxDemand = MAX(readings, demand)  // highest kW/kVA in period
    demandRate = TariffDemandRate.findFirst({ tariffId: tariff.id, active: true })
    demandCharge = maxDemand × demandRate.rate
    chargeLines.push({ type: "demand", name: "Demand Charge", demand: maxDemand, rate: demandRate.rate, charge: demandCharge })
    totalVariable += demandCharge

// ── STEP 6: Fixed / standing charges ──
  fixedCharges = TariffFixedCharge.findMany({ tariffId: tariff.id, active: true })
  FOR each fc IN fixedCharges:
    amount = fc.monthlyRate × (periodDays / daysInMonth)  // pro-rated
    chargeLines.push({ type: "fixed", name: fc.name, charge: amount })
    totalFixed += amount

// ── STEP 7: Charge rules + overrides ──
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

// ── STEP 8: Discounts ──
  groupPricing = GroupPricing.findFirst({ customerGroupId: customer.groupId })
  IF groupPricing AND groupPricing.discountRate > 0:
    discountAmount = (totalFixed + totalVariable) × groupPricing.discountRate
    chargeLines.push({ type: "discount", name: "Group Discount", rate: groupPricing.discountRate, charge: -discountAmount })
    totalDiscount = discountAmount

// ── STEP 9: Taxes, fees, subsidies ──
  IF tariff.hasTax:
    taxRules = TariffTax.findMany({ tariffId: tariff.id, active: true })
    FOR each tax IN taxRules:
      taxAmount = (totalFixed + totalVariable - totalDiscount) × tax.rate
      chargeLines.push({ type: "tax", name: tax.name, rate: tax.rate, charge: taxAmount })
      totalTax += taxAmount

// ── STEP 10: Assemble result ──
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

### 3.1 Tariff Version (NEW — enhanced lifecycle)

**Purpose:** Track each version of a tariff through its lifecycle. Replaces simple status field with full versioning.

**Status:** ❌ Not built — NEW model for W03

```
TariffVersion
├── id: String (UUID, PK)
├── tariffId: String                ← FK → Tariff (parent tariff)
├── versionNumber: Int              ← Auto-incremented per tariff
├── name: String                    ← Snapshot of tariff name at this version
├── description: String?
├── status: String                  ← DRAFT | PENDING_APPROVAL | APPROVED | ACTIVE | SUPERSEDED
├── effectiveFrom: DateTime
├── effectiveTo: DateTime?
├── changeReason: String            ← Why this version was created
├── changeType: String              ← RATE_CHANGE | STRUCTURE_CHANGE | NEW_TARIFF | RENEWAL
├── approvedBy: String?             ← FK → User
├── approvedAt: DateTime?
├── activatedAt: DateTime?          ← When status → ACTIVE
├── supersededByVersion: Int?       ← Which version replaced this one
├── supersededAt: DateTime?
├── createdBy: String?              ← FK → User
├── createdAt: DateTime
├── archivedAt: DateTime?

Indexes:
  @@unique([tariffId, versionNumber])
  @@index([tariffId, status])
  @@index([effectiveFrom, effectiveTo])
  @@index([status, effectiveFrom])

Relations:
  tariff → Tariff
  versionRates → TariffVersionRate[]
  versionTiers → TariffVersionTier[]
  versionToUSchedules → TariffToUSchedule[]
  versionDemandRates → TariffDemandRate[]
  versionFixedCharges → TariffFixedCharge[]
  versionTaxes → TariffTax[]
```

### 3.2 Tariff Version Rate (NEW — snapshot of rates at version)

```
TariffVersionRate
├── id, tariffVersionId (FK), name, rate, unit, priority, validFrom, validTo
├── createdAt, archivedAt
```

### 3.3 Tariff Version Tier (NEW — snapshot of tiers at version)

```
TariffVersionTier
├── id, tariffVersionId (FK), name, priority, minValue, maxValue, rate, unit
├── createdAt, archivedAt
```

### 3.4 TariffToUSchedule (NEW)

**Purpose:** Define time-of-use windows for each tariff version.

**Status:** ❌ Not built — NEW model for W03

```
TariffToUSchedule
├── id: String (UUID, PK)
├── tariffVersionId: String         ← FK → TariffVersion
├── name: String                    ← "Peak", "Off-Peak", "Shoulder"
├── dayOfWeek: Int                  ← 0=Sun, 1=Mon, ...6=Sat  (or -1 for all)
├── startMinute: Int                ← 0-1439 (minutes from midnight)
├── endMinute: Int                  ← 0-1439 (exclusive)
├── rate: Float                     ← Rate per unit during this window
├── priority: Int                   ← Lower = higher priority (for overlapping windows)
├── active: Boolean                 ← Default true
├── season: String?                 ← "summer" | "winter" | null (all year)
├── createdAt: DateTime
├── archivedAt: DateTime?

Indexes:
  @@index([tariffVersionId, active])
  @@index([tariffVersionId, dayOfWeek, startMinute])

Relations:
  tariffVersion → TariffVersion

Validation:
  startMinute < endMinute (window must have positive duration)
  0 <= startMinute, endMinute <= 1439
```

### 3.5 TariffDemandRate (NEW)

**Purpose:** Define demand-based charges (kW/kVA) for each tariff version.

**Status:** ❌ Not built

```
TariffDemandRate
├── id: String (UUID, PK)
├── tariffVersionId: String
├── name: String                    ← "Demand Charge", "Excess Demand"
├── demandType: String              ← kW | kVA
├── rate: Float                     ← Rate per unit of demand
├── threshold: Float?               ← Optional: charges apply above threshold
├── interval: String                ← MONTHLY | DAILY | ROLLING_30
├── active: Boolean
├── createdAt, archivedAt

Indexes:
  @@index([tariffVersionId, active])
```

### 3.6 TariffFixedCharge (NEW)

**Purpose:** Define standing/fixed charges per period.

**Status:** ❌ Not built

```
TariffFixedCharge
├── id: String (UUID, PK)
├── tariffVersionId: String
├── name: String                    ← "Service Charge", "Meter Rental"
├── type: String                    ← MONTHLY | DAILY | ONE_TIME
├── amount: Float                   ← Charge amount
├── proRata: Boolean                ← Default true (pro-rate for mid-period changes)
├── active: Boolean
├── createdAt, archivedAt

Indexes:
  @@index([tariffVersionId, active])
```

### 3.7 TariffTax (NEW)

**Purpose:** Define taxes, surcharges, fees, and levies applied per tariff.

**Status:** ❌ Not built

```
TariffTax
├── id: String (UUID, PK)
├── tariffVersionId: String
├── name: String                    ← "VAT 14%", "Service Fee 2%"
├── type: String                    ← PERCENTAGE | FIXED_AMOUNT
├── rate: Float                     ← Percentage (0.14 for 14%) or fixed amount
├── appliesTo: String               ← CONSUMPTION | TOTAL | FIXED_CHARGES
├── taxCode: String?                ← Tax authority code for reporting
├── active: Boolean
├── createdAt, archivedAt

Indexes:
  @@index([tariffVersionId, active])
```

### 3.8 TariffChangeLog (NEW)

**Purpose:** Full audit trail for every tariff version change approval.

```
TariffChangeLog
├── id, tariffVersionId (FK)
├── action: String                  ← CREATED | SUBMITTED | APPROVED | REJECTED | ACTIVATED | SUPERSEDED
├── performedBy: String             ← FK → User
├── comment: String?
├── createdAt: DateTime

Index:
  @@index([tariffVersionId, createdAt])
```

### 3.9 CustomerTariff (NEW — explicit link)

**Purpose:** Explicit customer-to-tariff assignment (overrides group and defaults).

```
CustomerTariff
├── id: String (UUID, PK)
├── customerId: String              ← FK → Customer
├── tariffVersionId: String         ← FK → TariffVersion
├── contractId: String?             ← FK → Contract (optional link)
├── assignedBy: String?             ← FK → User
├── assignedAt: DateTime
├── validFrom: DateTime
├── validTo: DateTime?
├── status: String                  ← ACTIVE | SUPERSEDED
├── createdAt, archivedAt

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
| 9 | CustomerTariff | ~15 | Customer→tariff assignment |

---

## PART 4: MULTI-UTILITY TARIFF STRUCTURES

### 4.1 Electricity Tariff Structure

```
ELECTRICITY TARIFF
├── Fixed Charges:
│   ├── Service Charge          monthly  EGP 25.00
│   ├── Meter Rental            monthly  EGP 10.00
│   └── Infrastructure Fee      monthly  EGP 5.00
│
├── Variable Charges (kWh):
│   ├── Tier 1: 0-100 kWh       EGP 0.50/kWh
│   ├── Tier 2: 101-300 kWh     EGP 0.75/kWh
│   ├── Tier 3: 301-600 kWh     EGP 1.25/kWh
│   ├── Tier 4: 601-1000 kWh    EGP 2.00/kWh
│   └── Tier 5: 1000+ kWh       EGP 2.50/kWh
│
├── Time-of-Use (optional):
│   ├── Peak (5-11 PM)          × 1.5 multiplier
│   ├── Off-Peak (11 PM-5 PM)   × 0.8 multiplier
│   └── Weekends                × 0.7 multiplier
│
├── Demand Charges (commercial):
│   └── Demand Charge           EGP 50.00/kVA/month
│
├── Taxes:
│   ├── VAT                     14% of total
│   └── Service Fee             2% of variable
│
└── Discounts:
    └── Early Payment Discount  2% if paid within 10 days
```

### 4.2 Water Tariff Structure

```
WATER TARIFF
├── Fixed Charges:
│   ├── Connection Fee          monthly  EGP 15.00
│   └── Meter Maintenance       monthly  EGP 8.00
│
├── Variable Charges (m³):
│   ├── Tier 1: 0-30 m³         EGP 1.50/m³
│   ├── Tier 2: 31-60 m³        EGP 3.00/m³
│   ├── Tier 3: 61-100 m³       EGP 5.00/m³
│   └── Tier 4: 100+ m³         EGP 8.00/m³
│
├── Sewage Surcharge:
│   └── Sewage Fee              60% of water charges
│
├── Taxes:
│   └── VAT                     14% of total
│
└── Subsidies (residential only):
    └── Social Subsidy          -EGP 10.00/month (if consumption < 30 m³)
```

### 4.3 Gas Tariff Structure

```
GAS TARIFF
├── Fixed Charges:
│   ├── Safety Inspection       monthly  EGP 12.00
│   └── Pipeline Fee            monthly  EGP 7.00
│
├── Variable Charges (BTU/Therm):
│   ├── Tier 1: 0-50 Therms     EGP 8.00/Therm
│   ├── Tier 2: 51-150 Therms   EGP 12.00/Therm
│   └── Tier 3: 150+ Therms     EGP 18.00/Therm
│
├── Taxes:
│   └── VAT                     14% of total
│
└── Seasonal Adjustment:
    └── Winter Surcharge        +15% (December-February)
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

→ Response:
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
                  ┌─────────────────────────────────────────────────────┐
                  │              TARIFF VERSION LIFECYCLE                 │
                  └─────────────────────────────────────────────────────┘

CREATE (Tariff Admin)
    │
    ▼
┌─────────┐
│  DRAFT   │──→ Edit rates, tiers, schedules, charges (no effect on billing)
└────┬─────┘
     │
     │ SUBMIT FOR APPROVAL
     ▼
┌──────────────────┐
│ PENDING_APPROVAL  │──→ Notification sent to approver(s)
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│APPROVED│ │REJECTED│──→ Returned to DRAFT with reason
└───┬────┘ └────────┘
    │
    │ ACTIVATE (scheduled or immediate)
    ▼
┌────────┐
│ ACTIVE  │──→ Affects billing from effectiveFrom date
└───┬────┘
    │
    │ NEW VERSION CREATED
    ▼
┌───────────┐
│ SUPERSEDED │──→ Previous version archived for audit
└───────────┘
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
  → Notify approver: "Tariff {name} v{version} submitted by {user}"
  → Include: rate change summary, effective dates, revenue impact forecast

On APPROVE:
  → Notify creator: "Tariff {name} v{version} approved by {approver}"
  → Auto-schedule activation at effectiveFrom date

On REJECT:
  → Notify creator: "Tariff {name} v{version} rejected by {approver}"
  → Include reason: {comment}
  → Return to DRAFT state

On ACTIVATE:
  → Notify billing team: "Tariff {name} v{version} now active"
  → Notify revenue assurance: new tariff active — validation rules updated
```

---

## PART 7: INTEGRATION WITH EXISTING SYSTEMS

### 7.1 Integration Map

```
Bill Run (existing routes/billing.js)
    │
    └──→ W03: TariffEngine.resolve() per customer
         → W03: TariffEngine.calculate() per meter
         → W03: Generate InvoiceItem[] from ChargeResult
         → existing: Invoice.create()
         → W01: FinancialEvent INVOICE_ISSUED
         → W02: RevenueRuleEngine pre-bill validation

Invoice Issue (existing routes/invoices.js)
    │
    └──→ W03: Store tariffSnapshotId on invoice
         → W01: FinancialEvent + GL posting
         → W02: Post-bill validation (tariff check)

Tariff Simulation (NEW)
    │
    └──→ W03: TariffSimulationEngine.simulate()
         → Shows impact preview before approval
         → Used by W04: Collection optimization

Revenue Assurance (W02)
    │
    └──→ W03: Tariff validation rules (RA-005: misapplication)
         → W03: Consumption anomaly detection
         → W03: Rate change monitoring

PostingEngine (W01)
    │
    └──→ W03: AccountMapping resolves tariff type → GL accounts

AccountMapping (W01)
    │
    └──→ W03: Each tariff line item maps to correct GL account
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
**Autonomy Level:** ⚡ Semi-autonomous  
**Human Approval Required:** All tariff structure changes  

### 8.2 Agent Capabilities

| Capability | Description | Autonomy |
|------------|-------------|----------|
| **Anomaly Detection** | Detect under/over charging vs peers | ✅ Full (read-only) |
| **Optimization Suggestion** | Recommend tariff changes per segment | ⚡ Requires approval |
| **Revenue Impact Forecast** | Forecast revenue effect of proposed change | ✅ Full (read-only) |
| **Expiry Alert** | Flag tariffs approaching effectiveTo | ✅ Full (auto-notify) |
| **Competitive Analysis** | Compare rates against market benchmarks | ✅ Full (read-only) |
| **Customer Impact Report** | Show how proposed change affects each segment | ✅ Full (read-only) |

### 8.3 Detection Algorithms

**Tariff Anomaly Detection:**
```
ALGORITHM: detectTariffAnomalies()
  1. For each customer:
     a. Get current tariff and consumption
     b. Calculate expected charge with current tariff
     c. Compare with peers (same segment, same consumption tier)
     d. IF charge > avg + 2σ → FLAG: "Customer may be overpaying"
     e. IF charge < avg - 2σ → FLAG: "Customer may be underpaying"
  
  2. For each tariff:
     a. Get all customers on this tariff
     b. Calculate revenue per customer
     c. IF avg revenue declining → FLAG: "Tariff revenue declining"
  
  3. For each area:
     a. Compare revenue/consumption ratio across areas
     b. IF significant variance → FLAG: "Area revenue variance detected"
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
┌────────────────────────────────────────────────────────────────────────────────────┐
│ TARIFF INTELLIGENCE DASHBOARD                                                        │
│                                                                                      │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐        │
│ │ Active       │ │ Pending      │ │ Revenue      │ │ Upcoming Changes     │        │
│ │ Tariffs      │ │ Approvals    │ │ at Risk      │ │                      │        │
│ │        12    │ │         3    │ │   EGP 125K   │ │ TieredRate v2 → Aug  │        │
│ │ ─ Electricity │ │ ─── ToU v2   │ │ ────         │ │ ToU v2 → Sep         │        │
│ │ ── Water      │ │ ─── Tier v3  │ │  ↓ 8% from  │ │ CommRate v4 → Oct    │        │
│ │ ── Gas        │ │ ─── Comm v4  │ │    target   │ │                      │        │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────────────┘        │
│                                                                                      │
│ ┌──────────────────────────────────────────────────────────────────────────────┐    │
│ │ TARIFF LIST (12 active)                                SEARCH: _________    │    │
│ │ ┌──────┬────────────┬──────────┬──────────┬──────────┬──────────┬────────┐ │    │
│ │ │ Code │ Name       │ Type     │ Version  │ Rate     │ Customers│ Status │ │    │
│ │ ├──────┼────────────┼──────────┼──────────┼──────────┼──────────┼────────┤ │    │
│ │ │ EL-1 │ Residential│ Electric │ v3       │ Tiered   │  12,450  │ ACTIVE │ │    │
│ │ │ EL-2 │ Commercial │ Electric │ v2       │ ToU+Dem  │   3,200  │ ACTIVE │ │    │
│ │ │ WT-1 │ Residential│ Water    │ v4       │ Tiered   │  11,800  │ ACTIVE │ │    │
│ │ │ GS-1 │ Residential│ Gas      │ v1       │ Tiered   │   5,600  │ ACTIVE │ │    │
│ │ │ EL-3 │ Industrial │ Electric │ v2       │ ToU+Dem  │     450  │ ACTIVE │ │    │
│ │ └──────┴────────────┴──────────┴──────────┴──────────┴──────────┴────────┘ │    │
│ └──────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│ ┌─────────────────────────────┐ ┌───────────────────────────────────────────────┐   │
│ │ REVENUE BY TARIFF TYPE      │ │ TARIFF ANOMALIES                               │   │
│ │                             │ │                                                 │   │
│ │ Tiered:        62% ███████  │ │ ⚠ 3 customers overpaying on TieredElectric    │   │
│ │ ToU+Demand:    23% ███      │ │ ⚠ Water Tier v3 expiring in 45 days          │   │
│ │ Flat Rate:     10% ██       │ │ ⚠ Commercial rate variance > 15% in Cairo    │   │
│ │ Fixed Charge:   5% █        │ │ ⚠ Industrial customers with no demand charge │   │
│ └─────────────────────────────┘ └───────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Tariff Detail Page

**Location:** `/admin/tariff-intelligence/:id`

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ TARIFF: Residential Electric (EL-1)                                                  │
│                                                                                      │
│ ┌──────────────────────────────────────────────────────────────────────────────┐    │
│ │ VERSION HISTORY                                                               │    │
│ │ ┌──────────┬────────────┬──────────┬──────────┬──────────┬─────────────────┐ │    │
│ │ │ Version  │ Status     │ Eff From │ Eff To   │ Change   │ Approved By     │ │    │
│ │ ├──────────┼────────────┼──────────┼──────────┼──────────┼─────────────────┤ │    │
│ │ │ v3       │ ACTIVE     │ 2026-01  │ —        │ Rate +8% │ Finance Mgr     │ │    │
│ │ │ v2       │ SUPERSEDED │ 2025-07  │ 2025-12  │ Tier add │ Billing Mgr     │ │    │
│ │ │ v1       │ SUPERSEDED │ 2025-01  │ 2025-06  │ New      │ Finance Mgr     │ │    │
│ │ └──────────┴────────────┴──────────┴──────────┴──────────┴─────────────────┘ │    │
│ └──────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│ ┌─────────────── CURRENT STRUCTURE (v3 ACTIVE) ─────────────────────────────────┐  │
│ │ Fixed: Service Charge EGP 25.00/mo  Meter Rental EGP 10.00/mo                  │  │
│ │ Tiers: 0-100 @ 0.50 | 101-300 @ 0.75 | 301-600 @ 1.25 | 600+ @ 2.00           │  │
│ │ Tax: VAT 14% | Service Fee 2%                                                  │  │
│ │ Customers: 12,450 | Avg Monthly Bill: EGP 185.00                               │  │
│ └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│ ┌────────────────── ACTIONS ─────────────────────────────────────────────────────┐  │
│ │ [ Create New Version ]  [ Simulate Change ]  [ View Customers ]  [ Deactivate ] │  │
│ └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 10: TESTING STRATEGY — W03 (100 Tests)

### 10.1 Tariff Resolution Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Customer with contract tariff → contract tariff used | Contract overrides group |
| 2 | Customer with group pricing → group tariff used | Group overrides default |
| 3 | No contract, no group → default utility tariff | Falls back to type match |
| 4 | No tariff of matching type → error | Clear error message |
| 5 | Multiple active tariffs → highest priority wins | Priority respected |
| 6 | Tariff outside effectiveFrom → not resolved | Date guard |
| 7 | Tariff past effectiveTo → not resolved | Date guard |
| 8 | Expired contract tariff → falls through to group | Graceful degradation |
| 9 | Disabled tariff → not resolved | Status check |
| 10 | Archived tariff → not resolved | archivedAt check |

### 10.2 Flat Rate Calculation (10)

| # | Test | Expect |
|---|------|--------|
| 1 | 100 kWh × EGP 2.50 = EGP 250 | Correct amount |
| 2 | 0 kWh → EGP 0 | Zero consumption |
| 3 | Multiple rates → all applied | Sum of rates |
| 4 | Rate with priority → higher priority first | Order respected |
| 5 | Rate outside validFrom → skipped | Date guard |

### 10.3 Tiered Pricing Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | 50 kWh in tier 1 (0-100) → tier 1 rate | Single tier |
| 2 | 150 kWh spans tiers 1+2 → both tiers | Cross-tier |
| 3 | 500 kWh spans 3 tiers → all applicable | Multi-tier |
| 4 | Consumption at exactly tier boundary → correct | Boundary |
| 5 | Zero consumption → no tier charge | Zero |
| 6 | Tier with null maxValue → absorbs remainder | Open-ended |
| 7 | Disordered tiers → sorted by priority | Sort |
| 8 | Overlapping tiers → higher priority wins | Precedence |

### 10.4 Time-of-Use Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Reading in peak window → peak rate | Window match |
| 2 | Reading in off-peak → off-peak rate | Window match |
| 3 | Reading at window boundary → correct window | Boundary |
| 4 | Multiple readings across all windows → all applied | Window switching |
| 5 | No schedule for day of week → default rate | Fallback |
| 6 | Weekend schedule → weekend rate | Day matching |
| 7 | Season-based schedule → correct season | Season matching |
| 8 | Overlapping windows → higher priority wins | Precedence |
| 9 | Schedule with no matching window → error | Missing window |
| 10 | Invalid startMinute > endMinute → validation error | Schema validation |

### 10.5 Demand Charge Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | 50 kVA demand × EGP 50 = EGP 2,500 | Correct charge |
| 2 | Demand below threshold → no charge | Threshold |
| 3 | Multiple demand rates → all applied | Multiple |
| 4 | No readings with demand data → no charge | Missing data |
| 5 | Demand charge with ToU → independent calculation | Decoupled |

### 10.6 Fixed Charge + Tax Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Monthly fixed charge → applied once | Monthly |
| 2 | Daily pro-rated for 15 days → half charge | Pro-ration |
| 3 | Multiple fixed charges → all applied | Stacking |
| 4 | VAT 14% on total → correct amount | Percentage tax |
| 5 | Fixed amount tax → exact amount | Fixed tax |
| 6 | Tax on consumption only → not applied to fixed | appliesTo filter |
| 7 | Multiple taxes → all applied | Stacking |
| 8 | Discount before tax → correct base | Order of ops |
| 9 | Tax with zero rate → zero | Zero rate |
| 10 | Tax exemption for group → not applied | Exemption |

### 10.7 Simulation Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | Compare current vs proposed → correct difference | Difference |
| 2 | Batch simulation for 10 customers → 10 results | Batch |
| 3 | Revenue forecast → annual projection | Forecast |
| 4 | Simulation with no changes → zero difference | Baseline |
| 5 | Simulation with new tariff → all results | New tariff |

### 10.8 Version Lifecycle Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Create version → status DRAFT | Initial state |
| 2 | Submit for approval → PENDING_APPROVAL | Status change |
| 3 | Approve → APPROVED | Status change |
| 4 | Activate → ACTIVE | Status change |
| 5 | Reject → back to DRAFT with reason | With reason |
| 6 | New version → previous SUPERSEDED | Version chain |
| 7 | Cannot edit ACTIVE version → error | Guard |
| 8 | Cannot delete APPROVED version → error | Guard |
| 9 | Version history preserved → all states logged | Audit |
| 10 | Activation schedules at effectiveFrom → scheduled | Date-based |

### 10.9 Multi-Utility Tests (5)

| # | Test | Expect |
|---|------|--------|
| 1 | Electric tariff → kWh consumption | Correct unit |
| 2 | Water tariff → m³ consumption | Correct unit |
| 3 | Gas tariff → BTU/Therm consumption | Correct unit |
| 4 | Mixed utility customer → correct per meter | Independent |
| 5 | Solar tariff → net consumption | Net metering |

---

## PART 11: W03 DEFINITION OF DONE

```
W03 — TARIFF INTELLIGENCE & ADVANCED BILLING ENGINE
CERTIFICATION CHECKLIST

□ CORE DATA MODELS — 9 NEW
   □ TariffVersion (versioned lifecycle)
   □ TariffVersionRate (rate snapshot)
   □ TariffVersionTier (tier snapshot)
   □ TariffToUSchedule (time-of-use windows)
   □ TariffDemandRate (demand charges)
   □ TariffFixedCharge (standing charges)
   □ TariffTax (taxes, fees, levies)
   □ TariffChangeLog (change approval audit)
   □ CustomerTariff (customer→tariff assignment)

□ EXISTING MODELS ENHANCED
   □ Tariff: category, utilityType, eligibleCustomerTypes
   □ GroupPricing: tariffVersionId link
   □ Invoice: tariffSnapshotId

□ TARIFF ENGINE
   □ TariffEngine.resolve() — customer→meter→tariff resolution
   □ TariffEngine.calculate() — full calculation pipeline
   □ Flat rate calculation
   □ Tiered pricing (multi-tier, cross-boundary)
   □ Time-of-Use (peak/off-peak/shoulder, seasonal)
   □ Demand charges (kW/kVA, threshold)
   □ Fixed charges (monthly, daily, pro-rated)
   □ Variable charges
   □ Taxes, fees, levies (percentage + fixed)
   □ Discounts (percentage, early payment, group)
   □ Charge rules + overrides
   □ Pro-ration (mid-period changes)

□ TARIFF LIFECYCLE — FULLY VERSIONED
   □ DRAFT → PENDING_APPROVAL → APPROVED → ACTIVE → SUPERSEDED
   □ Version history preserved
   □ Change reason required
   □ Approval workflow with role-based gates
   □ Scheduled activation at effectiveFrom
   □ Previous version auto-superseded

□ SIMULATION ENGINE
   □ What-if analysis (current vs proposed)
   □ Batch simulation (customer segment)
   □ Revenue impact forecast
   □ Customer-level breakdown

□ BILLING ENGINE INTEGRATION
   □ Billing engine uses TariffEngine for all calculations
   □ Per-meter tariff resolution
   □ Per-charge-line invoice items
   □ Historical tariff snapshot on invoice
   □ Flat rate → full tariff pipeline migration

□ AI TARIFF OPTIMIZATION AGENT
   □ Anomaly detection (under/over charging)
   □ Revenue impact forecasting
   □ Expiry alerting
   □ Competitive analysis
   □ Customer impact reporting
   □ C12 AIRecommendation integration

□ DASHBOARD
   □ Tariff Intelligence Dashboard at /admin/tariff-intelligence
   □ Tariff list with filters (type, status, utility)
   □ Tariff detail with version history
   □ Version comparison view
   □ Simulation UI
   □ Revenue by tariff type chart

□ SECURITY
   □ RBAC: Tariff Admin, Tariff Approver, Tariff Viewer
   □ Segregation: create ≠ approve ≠ activate
   □ ACTIVE/APPROVED versions immutable
   □ Change log append-only
   □ All mutations audited

□ TESTS — 100 PASSING
   □ Tariff resolution: 20 tests
   □ Flat rate: 10 tests
   □ Tiered pricing: 15 tests
   □ Time-of-Use: 10 tests
   □ Demand charge: 5 tests
   □ Fixed + tax: 15 tests
   □ Simulation: 10 tests
   □ Version lifecycle: 15 tests

W03 STATUS: □ NOT IMPLEMENTED
All items above are DESIGN-COMPLETE but not executed.
```

---

## APPENDIX A: W03 DEPENDENCY GRAPH

```
W01 (Billing-to-GL) ──────┐
W02 (Revenue Assurance) ───┤
Tariff (existing models) ──┤
Billing engine (exist) ────┤
Customer group (exist) ────┤
ChargeRule (existing) ─────┤
GroupPricing (existing) ───┤
BillCycle (existing) ──────┤
                            ▼
                 ┌─────────────────────┐
                 │  W03 TARIFF ENGINE   │
                 └─────────────────────┘
                       │
                       ├──→ TariffEngine.resolve() + calculate()
                       ├──→ TariffVersion lifecycle
                       ├──→ ToU / Tiered / Demand calculators
                       ├──→ TariffSimulationEngine
                       ├──→ Tariff Optimization AI Agent
                       ├──→ tariff-intelligence dashboard
                       └──→ Invoice tariff snapshots
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
*C13-W03 — Tariff Intelligence & Advanced Billing Engine. READ ONLY. GOVERNANCE PLANNING ONLY.*
