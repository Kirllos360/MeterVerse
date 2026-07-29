# C13-W02 — Enterprise Revenue Assurance Intelligence Engine
## Blueprint

**Version:** 1.0.0  
**Status:** READ ONLY — GOVERNANCE PLANNING ONLY — NOT IMPLEMENTED  
**Date:** 2026-07-29  
**Program:** C13 Enterprise Financial & Billing Intelligence Platform  
**Wave:** W02 (Revenue Assurance — builds on W01 billing-to-GL foundation)  

---

## PART 1: EXISTING FOUNDATION AUDIT

### 1.1 What Already Exists

| Component | File | Status | Utility for W02 |
|-----------|------|--------|-----------------|
| `ValidationRule` model | `schema.prisma:1324` | ✅ Complete | Reusable — entityType, condition (JSON), severity, priority |
| `ValidationResult` model | `schema.prisma:1341` | ✅ Complete | Reusable — status, resolvedAt/by, message |
| `validation-engine.js` | `services/validation-engine.js` | ✅ Basic | Currently only validates reading values (min/max) |
| `AlertRule` model | `schema.prisma:1610` | ✅ Complete | Reusable — entityType, condition, severity, cooldown |
| `Alert` model | `schema.prisma:1625` | ✅ Complete | Reusable — fingerprint (dedup), status, acknowledgedAt |
| `KpiDefinition` + `KpiSnapshot` | `schema.prisma:716-738` | ✅ Complete | Reusable for revenue KPI tracking |
| `ai-engine.js` — `aiReadingValidator` | `services/ai-engine.js:83` | ✅ Basic | Checks reading spikes against threshold |
| `ai-engine.js` — `aiBillingAssistant` | `services/ai-engine.js:197` | ✅ Basic | Generates revenue summary |
| `Invoice` model | `schema.prisma:985` | ✅ Complete | Has amount, status, paidAmount, periodStart/End |
| `BillRun` model | `schema.prisma:1154` | ✅ Complete | Has periodStart, periodEnd, status, totalAmount |
| `MeterReading` | `schema.prisma` | ✅ Complete | Has value, timestamp, status, meterId |
| `Tariff` + `TariffRate` + `TariffTier` | `schema.prisma:1088-1153` | ✅ Complete | Flat rate CRUD, tier structure defined |
| `FinancialEvent` model | Planned in W01 | ❌ W01 | Post-W01: source for leakage analysis |
| `AccountMapping` model | Planned in W01 | ❌ W01 | Post-W01: tariff → account mapping |

### 1.2 Existing Validation Pipeline

```
Meter Reading Created
    → validation-engine.js:validateReading()
        → Loads all active ValidationRules WHERE entityType="reading"
        → Evaluates each rule's condition JSON against reading data
        → Creates ValidationResult (passed/failed)
        → Returns results array
    → If failed → reading status can be flagged
    ❌ No pre-bill validation pipeline
    ❌ No invoice-level validation
    ❌ No consumption-to-bill reconciliation
    ❌ No tariff application validation
    ❌ No revenue-level rules
```

### 1.3 Gap Analysis

| Capability | Current State | W02 Target |
|------------|---------------|------------|
| Reading-level validation | ✅ Basic min/max | ✅ Enhanced with trend/spike/pattern detection |
| Pre-bill validation | ❌ Missing | ✅ 15 rules blocking/pre-flagging before invoice generation |
| Invoice anomaly detection | ❌ Missing | ✅ 10 anomaly detectors on invoice issue |
| Consumption-to-bill reconciliation | ❌ Missing | ✅ Automated comparison: readings × tariff = invoice |
| Tariff application validation | ❌ Missing | ✅ Verify correct tariff applied per customer type |
| Revenue leakage detection | ❌ Missing | ✅ 8 leakage patterns detected |
| Missing revenue identification | ❌ Missing | ✅ Unbilled consumption, unissued invoices |
| Duplicate billing prevention | ❌ Missing | ✅ Duplicate detection at bill run + invoice level |
| Unbilled consumption detection | ❌ Missing | ✅ Active meter + no invoice = alert |
| Risk scoring | ❌ Missing | ✅ Risk score per finding, customer, area |
| Investigation workflow | ❌ Missing | ✅ Assign, investigate, resolve, prevent |
| Evidence collection | ❌ Missing | ✅ Auto-collect relevant records for each finding |
| AI Revenue Agent | ❌ Missing | ✅ Semi-autonomous agent with governance |
| Revenue dashboard | ❌ Missing | ✅ KPIs, trends, open findings, leakage by category |

---

## PART 2: REVENUE ASSURANCE ARCHITECTURE

### 2.1 End-to-End Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                      REVENUE ASSURANCE PIPELINE                                        │
│                                                                                       │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │  STAGE 1: PRE-BILL VALIDATION (runs before invoice generation)                │    │
│  │                                                                                │    │
│  │  For each customer/meter in bill run:                                         │    │
│  │   1. Check reading completeness  ──missing→ FLAG: MissingReadings             │    │
│  │   2. Check consumption trend     ──spike/drop→ FLAG: ConsumptionAnomaly      │    │
│  │   3. Check meter status          ──inactive→ FLAG: InactiveMeterActiveBill   │    │
│  │   4. Check tariff validity       ──mismatch→ FLAG: TariffMisapplication      │    │
│  │   5. Check previous period billed──duplicate→ FLAG: DuplicatePeriod          │    │
│  │   6. Check customer status       ──suspended→ FLAG: SuspendedCustomerBill    │    │
│  │                                                                                │    │
│  │  RESULT: PASS (continue) or BLOCK (flag + notify) or WARN (flag + continue)   │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                  │
│                                    ▼                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │  STAGE 2: BILLING CALCULATION                                                  │    │
│  │                                                                                │    │
│  │  consumption = Σ(readings)                                                    │    │
│  │  invoice_amount = tariff.apply(consumption)                                   │    │
│  │  expected_amount = consumption × tariff_rate                                  │    │
│  │                                                                                │    │
│  │  ┌── DEVIATION CHECK ──────────────────────────────────────────────┐          │    │
│  │  │  IF |invoice_amount - expected_amount| / expected_amount > 0.01 │          │    │
│  │  │  THEN FLAG: BillingCalculationDiscrepancy                       │          │    │
│  │  └─────────────────────────────────────────────────────────────────┘          │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                  │
│                                    ▼                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │  STAGE 3: POST-BILL VALIDATION (runs after invoice generation)                │    │
│  │                                                                                │    │
│  │  For each generated invoice:                                                  │    │
│  │   1. Check invoice amount vs 6-month average  ──> 2x → FLAG                   │    │
│  │   2. Check invoice amount vs prior period      ──> 50% change → FLAG          │    │
│  │   3. Check line items sum = invoice total      ──> mismatch → ERROR            │    │
│  │   4. Check tax calculation                     ──> wrong rate → FLAG           │    │
│  │   5. Check customer has active contract        ──> expired → FLAG              │    │
│  │   6. Cross-check: Σ(invoices) = Σ(readings × tariff) → FLAG                   │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                  │
│                                    ▼                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │  STAGE 4: CONTINUOUS MONITORING (scheduled daily)                             │    │
│  │                                                                                │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │    │
│  │  │ UNBILLED CONSUMPTION                                                    │  │    │
│  │  │  SELECT meters WHERE status=ACTIVE AND last_bill_date < period_end      │  │    │
│  │  │  AND no invoice exists for the period                                   │  │    │
│  │  │  → FLAG: UnbilledConsumption                                            │  │    │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │    │
│  │                                                                                │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │    │
│  │  │ REVENUE TREND ANALYSIS                                                  │  │    │
│  │  │  Compare daily/weekly/monthly revenue against forecast                  │  │    │
│  │  │  IF actual < forecast - 3σ → FLAG: RevenueDrop                         │  │    │
│  │  │  IF actual > forecast + 3σ → FLAG: RevenueSpike                        │  │    │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │    │
│  │                                                                                │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │    │
│  │  │ DUPLICATE DETECTION                                                      │  │    │
│  │  │  SELECT invoices WHERE same customer + same period + same amount        │  │    │
│  │  │  AND status != cancelled                                                │  │    │
│  │  │  → FLAG: DuplicateInvoice                                               │  │    │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │    │
│  │                                                                                │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │    │
│  │  │ GL RECONCILIATION                                                       │  │    │
│  │  │  Σ(invoice amounts) vs Σ(revenue journal entries) for same period       │  │    │
│  │  │  IF mismatch > threshold → FLAG: RevenueGLMismatch                      │  │    │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                  │
│                                    ▼                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │  STAGE 5: INVESTIGATION & RESOLUTION                                          │    │
│  │                                                                                │    │
│  │  Finding Created (status: OPEN)                                               │    │
│  │    → Auto-collect evidence (readings, invoices, tariff, history)             │    │
│  │    → Assign risk score (0-100)                                                │    │
│  │    → Auto-assign to team (billing | meter | customer)                        │    │
│  │    → Notify assignee                                                          │    │
│  │                                                                                │    │
│  │  Investigation:                                                               │    │
│  │    → Review evidence                                                          │    │
│  │    → Determine root cause                                                     │    │
│  │    → Estimate financial impact                                                │    │
│  │    → Propose correction action                                                │    │
│  │                                                                                │    │
│  │  Resolution:                                                                  │    │
│  │    → Approve correction                                                       │    │
│  │    → Execute (re-bill, adjust, cancel, write-off)                             │    │
│  │    → Verify correction                                                        │    │
│  │    → Close finding                                                            │    │
│  │    → Update LearnedPattern (AI learning)                                      │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │  DASHBOARD & REPORTING                                                        │    │
│  │                                                                                │    │
│  │  ┌─────────────────────┐  ┌────────────────────┐  ┌────────────────────────┐  │    │
│  │  │ Revenue Leakage     │  │ Open Findings       │  │ Risk Heatmap          │  │    │
│  │  │ Total: X EGP        │  │ Critical: X         │  │ Customer, Area,       │  │    │
│  │  │ Recovered: Y EGP    │  │ High: Y             │  │ Project, Utility      │  │    │
│  │  │ At Risk: Z EGP      │  │ Medium: Z           │  │ ┌──┐ ┌──┐ ┌──┐ ┌──┐  │  │    │
│  │  │ Trend: ↑↓→          │  │ Low: W              │  │ │H │ │M │ │L │ │C │  │  │    │
│  │  └─────────────────────┘  └────────────────────┘  │ └──┘ └──┘ └──┘ └──┘  │  │    │
│  │                                                     └────────────────────────┘  │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Detection Rules — Master List (15 Rules)

| ID | Rule | Stage | Severity | Action | Auto-Resolvable |
|----|------|-------|----------|--------|-----------------|
| RA-001 | **Missing Readings** — Meter has no readings for billing period | Pre-bill | ERROR | BLOCK invoice generation | ❌ |
| RA-002 | **Consumption Spike** — Current period > 3× 6-month avg | Pre-bill | WARNING | FLAG + allow | ❌ |
| RA-003 | **Consumption Drop** — Current period < 10% of 6-month avg | Pre-bill | WARNING | FLAG + allow | ❌ |
| RA-004 | **Inactive Meter Active Bill** — Meter status ≠ ACTIVE but billed | Pre-bill | ERROR | BLOCK | ❌ |
| RA-005 | **Tariff Misapplication** — Customer type ≠ tariff eligibility | Pre-bill | ERROR | BLOCK | ✅ (auto-correct) |
| RA-006 | **Duplicate Period** — Customer already billed for same period | Pre-bill | ERROR | BLOCK | ✅ |
| RA-007 | **Suspended Customer Bill** — Customer status = suspended | Pre-bill | ERROR | BLOCK | ❌ |
| RA-008 | **Billing Calculation Discrepancy** — Invoice ≠ expected | Post-bill | ERROR | FLAG | ❌ |
| RA-009 | **Amount Spike** — Invoice amount > 2× 6-month avg | Post-bill | WARNING | FLAG | ❌ |
| RA-010 | **Line Item Mismatch** — Σ(items) ≠ invoice.total | Post-bill | ERROR | FLAG | ✅ (auto-recalc) |
| RA-011 | **Tax Mismatch** — Tax rate ≠ customer's applicable rate | Post-bill | WARNING | FLAG | ✅ (auto-correct) |
| RA-012 | **Expired Contract** — Customer contract expired at billing date | Post-bill | WARNING | FLAG | ❌ |
| RA-013 | **Unbilled Consumption** — Active meter + no invoice ≥ 45 days | Continuous | WARNING | FLAG | ❌ |
| RA-014 | **Duplicate Invoice** — Same customer + period + amount | Continuous | ERROR | FLAG | ✅ (auto-cancel) |
| RA-015 | **GL Revenue Mismatch** — Σ(invoices) ≠ Σ(revenue JE) for period | Continuous | CRITICAL | FLAG | ❌ |

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
├── id: String (UUID, PK)
├── ruleId: String                   ← FK → RevenueRule (or ValidationRule)
├── findingType: String              ← consumption_spike | tariff_mismatch | unbilled | duplicate | etc.
├── severity: String                 ← INFO | WARNING | ERROR | CRITICAL
├── status: String                   ← OPEN | INVESTIGATING | RESOLVED | DISMISSED
│   Default: "OPEN"
├── description: String              ← Human-readable finding description
├── affectedEntityType: String       ← INVOICE | METER | CUSTOMER | BILL_RUN | READING
├── affectedEntityId: String         ← FK to the affected record
├── customerId: String?              ← FK → Customer
├── areaId: String?                  ← For filtering/scoping
├── projectId: String?
├── periodId: String?                ← FK → FinancialPeriod (if applicable)
├── invoiceId: String?               ← FK → Invoice (if invoice-level)
├── meterId: String?                 ← FK → Meter (if meter-level)
├── readingId: String?               ← FK → Reading (if reading-level)
├── expectedValue: Float?            ← What the value should be
├── actualValue: Float?              ← What the value actually was
├── variance: Float?                 ← |expected - actual|
├── variancePct: Float?              ← variance / expected × 100
├── estimatedImpact: Float?          ← EGP impact estimate
├── recoveredAmount: Float?          ← EGP recovered after correction
├── riskScore: Float?                ← Computed score (0-100)
├── evidence: String?                ← JSON array of evidence records
├── assignedTo: String?              ← FK → User
├── assignedAt: DateTime?
├── startedAt: DateTime?             ← When investigation started
├── resolvedAt: DateTime?            ← When resolved
├── resolvedBy: String?              ← FK → User (who resolved)
├── resolutionType: String?          ← CORRECTED | REBILLED | WRITTEN_OFF | DISMISSED
├── resolutionNote: String?          ← How it was resolved
├── correctionJournalId: String?     ← FK → JournalEntry (if correction posted)
├── rootCause: String?               ← CAPTURED root cause analysis
├── preventedBy: String?             ← What changed to prevent recurrence
├── createdAt: DateTime
├── archivedAt: DateTime?

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
├── id: String (UUID, PK)
├── findingId: String                ← FK → RevenueLeakageFinding
├── action: String                   ← REVIEWED | CONTACTED_CUSTOMER | REQUESTED_DATA |
│                                        CHECKED_METER | ANALYZED_READINGS | PROPOSED_CORRECTION
├── description: String
├── performedBy: String              ← FK → User
├── evidenceSnapshot: String?        ← JSON of evidence at time of action
├── createdAt: DateTime
├── archivedAt: DateTime?

Index:
  @@index([findingId, createdAt])
```

### 3.3 RevenueRule (NEW — or extend ValidationRule)

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
├── id, code, name, description
├── category: PRE_BILL | POST_BILL | CONTINUOUS
├── severity: INFO | WARNING | ERROR | CRITICAL
├── action: BLOCK | FLAG | NOTIFY
├── condition: String (JSON evaluable)
├── autoResolvable: Boolean
├── cooldown: Int
├── active: Boolean
├── priority: Int
├── effectiveFrom: DateTime
├── effectiveTo: DateTime?
├── metadata: String? (JSON)
├── createdBy: String?
├── createdAt, archivedAt, updatedAt
├── findings RevenueLeakageFinding[]
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
| `leakage_by_category` | revenue | EGP | — | Daily |

---

## PART 4: AI REVENUE ASSURANCE AGENT

### 4.1 Agent Design

**Agent Name:** Revenue Leakage Detection Agent  
**Framework:** C12-W07 Operational Intelligence (AIRecommendation model, governance rules)  
**Autonomy Level:** ⚡ Semi-autonomous  
**Human Approval:** Required for: correction actions, write-offs, re-billing  
**No Approval Needed For:** Flagging findings, assigning severity, collecting evidence  

### 4.2 Agent Capabilities

| Capability | Description | Autonomy |
|------------|-------------|----------|
| Rule evaluation | Run all 15 detection rules on schedule | ✅ Full |
| Evidence collection | Auto-gather readings, invoices, history for findings | ✅ Full |
| Severity assignment | Score findings by risk/impact | ✅ Full |
| Root cause suggestion | NLP on finding context → suggest probable cause | ✅ Full |
| Correction proposal | Recommend corrective action (re-bill, adjust, cancel) | ⚡ Requires approval |
| Resolution verification | Verify correction was applied correctly | ✅ Full |
| Pattern learning | Update LearnedPattern with finding outcomes | ✅ Full |

### 4.3 Integration with C12-W07

```
Revenue Leakage Detection Agent
    │
    ├──→ AIRecommendation (C12 model)
    │     agentType: "revenue_leakage_detection"
    │     inputSummary: finding description + evidence
    │     output: corrective action proposal
    │     confidence: score (0-1)
    │     status: pending → approved | rejected | modified
    │
    ├──→ LearnedPattern (C12 model)
    │     Pattern: type of leakage detected
    │     Resolution: how it was fixed
    │     Effectiveness: did it prevent recurrence?
    │     Frequency: how often does this pattern repeat?
    │
    └──→ AuditEntry (C12 model)
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
     IF zScore > 3.0 → CRITICAL spike
     IF zScore > 2.0 → WARNING spike
     IF zScore > 1.5 → INFO increase
     ELSE → normal
  
  5. If flagged: create RevenueLeakageFinding
     findingType: "consumption_spike"
     expectedValue: avgConsumption
     actualValue: currentConsumption
     variance: currentConsumption - avgConsumption
     variancePct: (variance / avgConsumption) × 100
     riskScore: MIN(zScore × 25, 100)
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
     IF "all" IN eligibleTypes → pass (no check needed)
     IF customer.type NOT IN eligibleTypes → MISMATCH
  
  4. If mismatch:
     correctTariff = Tariff.findFirst({
       where: { eligibleCustomerTypes: { has: customer.type }, status: "active" }
     })
     IF correctTariff → suggest correction
     ELSE → flag for manual review
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
       riskScore: daysWithoutBill / 45 × 100
     )
```

---

## PART 5: INVESTIGATION & RESOLUTION WORKFLOW

### 5.1 Finding Lifecycle

```
OPEN (auto-detected)
  │
  ├──→ ASSIGNED (to billing/meter/customer team)
  │       │
  │       ▼
  │   INVESTIGATING
  │       │
  │       ├──→ Evidence reviewed
  │       ├──→ Root cause identified
  │       ├──→ Financial impact estimated
  │       └──→ Correction proposed
  │           │
  │           ▼
  │       AWAITING_APPROVAL
  │           │
  │      ┌────┴────┐
  │      │         │
  │      ▼         ▼
  │  APPROVED   REJECTED
  │      │         │
  │      ▼         ▼
  │  CORRECTING  DISMISSED
  │      │
  │      ▼
  │  VERIFIED
  │      │
  │      ▼
  │  RESOLVED
  │
  └──→ DISMISSED (false positive)
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
riskScore = severity_weight × impact_factor × recurrence_factor

severity_weight:
  CRITICAL = 1.0
  ERROR    = 0.7
  WARNING  = 0.4
  INFO     = 0.1

impact_factor:
  estimatedImpact / 100000  (capped at 1.0, 100K+ EGP = max)

recurrence_factor:
  same customer same type in last 90 days? × 1.5
  same area same type in last 30 days? × 1.3
  first occurrence = 1.0

Priority Buckets:
  CRITICAL: score > 70  → immediate assignment, notify manager
  HIGH:     score 40-70 → assign within 4 hours
  MEDIUM:   score 15-40 → assign within 24 hours
  LOW:      score < 15  → assign within 72 hours
```

### 5.4 Escalation

| Time Since Open | Priority | Escalation Action |
|----------------|----------|-------------------|
| ≥ 24h | CRITICAL | Notify Revenue Assurance Manager |
| ≥ 48h | HIGH | Notify Finance Director |
| ≥ 72h | CRITICAL | Notify CFO |
| ≥ 7 days | Any | Weekly report to executive team |

---

## PART 6: INTEGRATION STRATEGY

### 6.1 Integration Points

| Integration | Direction | Mechanism | Data Flow |
|-------------|-----------|-----------|-----------|
| **Bill Run** (W01 billing.js) | Hook into generate | RevenueRuleEngine.evaluateAll(preBill) | Bill run → pre-bill validation → block/flag/continue |
| **Invoice Issue** (W01 invoices.js) | Hook after issue | RevenueRuleEngine.evaluateAll(postBill) | Invoice → post-bill validation → flag |
| **Invoice Cancel** (W01 billing.js) | Hook after cancel | RevenueRuleEngine.updateFindings() | Cancel → close related findings |
| **Payment** (W01 payments.js) | Hook after create | RevenueRuleEngine.checkGLMatch() | Payment → check revenue match |
| **Meter Reading** (existing validation-engine.js) | Extend | Enhanced validation rules | Reading → enhanced validation |
| **General Ledger** (existing accounting.js) | Query | GL balance queries | Daily GL vs invoice comparison |
| **Alert System** (existing Alert/AlertRule) | Create alerts from findings | Auto-create Alert for CRITICAL/HIGH findings | Finding → Alert |
| **KPI System** (existing KpiDefinition) | Update KPIs | KpiSnapshot.create() for each revenue KPI | Finding statistics → KPI |
| **C12 AI Framework** (C12-W07) | Recommendations | AIRecommendation.create() | Analysis → recommendation |
| **C12 Knowledge** (C12-W07 LearnedPattern) | Pattern learning | LearnedPattern.upsert() | Resolution → pattern |
| **C12 Audit** (C12 AuditEntry) | Audit actions | auditLog() on every mutation | All revenue events → audit |

### 6.2 Pre-Bill Integration (Bill Run)

```
POST /api/billing/runs/:id/generate (existing)
    │
    ├──→ For each customer:
    │     ├──→ RevenueRuleEngine.evaluateAll("pre_bill", context)
    │     │       │
    │     │       ├──→ PASS → continue invoice generation
    │     │       ├──→ WARN → flag + continue (findings created)
    │     │       └──→ BLOCK → skip customer + create finding
    │     │
    │     └──→ Generate invoice (existing logic)
    │
    └──→ RevenueRuleEngine.evaluateAll("post_bill", context)
            for each generated invoice
```

### 6.3 Post-Bill Integration (Invoice Issue)

```
POST /api/invoices/:id/issue (existing, modified by W01)
    │
    ├──→ Existing: update status, set immutableAt
    ├──→ W01: create FinancialEvent + post to GL
    └──→ W02: RevenueRuleEngine.evaluateAll("post_bill", {
              invoice, customer, readings, tariff
            })
              │
              ├──→ PASS → continue
              └──→ FLAG → create RevenueLeakageFinding
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
┌─────────────────────────────────────────────────────────────────────────────┐
│ REVENUE ASSURANCE DASHBOARD                                                  │
│                                                                              │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐    │
│ │ Revenue       │ │ Open Findings │ │ Recovery Rate │ │ Avg Resolution│    │
│ │ Leakage Total │ │        12     │ │       94%     │ │     36 hrs    │    │
│ │ EGP 247,500   │ │ ┃━┃━┃━┃━┃━   │ │ ━━━━━━━━━━━━  │ │    ↓ 12%      │    │
│ │   ↓ 8% MoM   │ │ 3 Critical    │ │ Target: >90%  │ │ Target: <48h  │    │
│ └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘    │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ OPEN FINDINGS (12)                                  FILTER: All │ │ │
│ │ ┌────┬────────────────────────┬───────┬──────┬──────┬────────────┐   │ │
│ │ │ #  │ Finding               │ Sev   │Risk  │Area  │ Age        │   │ │
│ │ ├────┼────────────────────────┼───────┼──────┼──────┼────────────┤   │ │
│ │ │ 1  │ Unbilled Consumption  │ 🔴 C  │ 89   │ Oct  │ 12 days    │   │ │
│ │ │ 2  │ Tariff Misapplication │ 🟠 E  │ 72   │ NC   │ 3 days     │   │ │
│ │ │ 3  │ Consumption Spike     │ 🟡 W  │ 45   │ SOD  │ 1 day      │   │ │
│ │ │ 4  │ GL Mismatch -0.5%     │ 🔴 C  │ 82   │ Oct  │ 6 hours    │   │ │
│ │ └────┴────────────────────────┴───────┴──────┴──────┴────────────┘   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌─────────────────┐ ┌────────────────────────────────────────────────────┐  │
│ │ LEAKAGE BY TYPE  │ │ FINDINGS TREND (Last 30 Days)                      │  │
│ │                   │ │                                                    │  │
│ │ Unbilled   42%   │ │  📈                                                  │  │
│ │ Spike      18%   │ │  │  ██                                              │  │
│ │ Tariff     15%   │ │  │  ██ ██                                           │  │
│ │ Duplicate  12%   │ │  │  ██ ██ ██ ██                                     │  │
│ │ Other      13%   │ │  │  ██ ██ ██ ██ ██ ██                               │  │
│ │                   │ │  └───────────────────────────                       │  │
│ └─────────────────┘ └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Finding Detail Page

**Location:** `/admin/revenue-assurance/findings/:id`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ FINDING #RA-2026-0742                                                         │
│                                                                              │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐    │
│ │ Status: OPEN   │ │ Severity: 🔴  │ │ Risk Score:   │ │ EGP Impact:   │    │
│ │               │ │ CRITICAL      │ │ 89/100        │ │ EGP 45,200    │    │
│ └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘    │
│                                                                              │
│ Type: Unbilled Consumption | Area: October | Meter: MTR-4512                │
│ Detected: 2026-07-28 14:32 | Last Activity: 2026-07-28 16:00                │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ DESCRIPTION                                                              │ │
│ │ Meter MTR-4512 (Customer: EgyptAir Tower) has readings for July 2026    │ │
│ │ but no invoice was generated. Last invoice: June 2026.                   │ │
│ │ Consumption: 18,080 kWh × Tariff: EGP 2.50 = EGP 45,200 unbilled.      │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌────────── EVIDENCE ─────────────────────────────────────────────────────┐ │
│ │ Readings (last 3 months):      │ Invoice History:                        │ │
│ │  May:     14,200 kWh           │  May 2026: INV-2026-0512 → EGP 35,500  │ │
│ │  Jun:     16,500 kWh           │  Jun 2026: INV-2026-0618 → EGP 41,250  │ │
│ │  Jul:     18,080 kWh           │  Jul 2026: (NO INVOICE)                 │ │
│ │                                                                          │ │
│ │ Meter Status: ACTIVE  │  Last Sync: 2026-07-28 12:00  │  No error events│ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌────────── INVESTIGATION LOG ────────────────────────────────────────────┐ │
│ │ 2026-07-28 14:32 │ System        │ Finding auto-created                 │ │
│ │ 2026-07-28 14:33 │ System        │ Evidence auto-collected (8 records)  │ │
│ │ 2026-07-28 15:00 │ Sarah (Bil.)  │ Assigned — reviewing bill run logs   │ │
│ │ 2026-07-28 15:30 │ Sarah (Bil.)  │ Bill run #BR-2026-07 skipped meter  │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌────────── ACTIONS ──────────────────────────────────────────────────────┐ │
│ │ [ Generate Missing Invoice ]  [ Mark as False Positive ]  [ Dismiss ]   │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 8: SECURITY & GOVERNANCE

### 8.1 Role Access

| Role | View Findings | Investigate | Propose Correction | Approve Correction | Dismiss |
|------|:------------:|:-----------:|:------------------:|:------------------:|:-------:|
| **Billing Operator** | Own area only | ✅ | ✅ | ❌ | ❌ |
| **Revenue Analyst** | All | ✅ | ✅ | ❌ | ❌ |
| **Revenue Manager** | All | ✅ | ✅ | ✅ | ✅ |
| **Finance Admin** | All | ✅ | ✅ | ✅ | ✅ |
| **Auditor** | All (read-only) | ❌ | ❌ | ❌ | ❌ |

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

## PART 9: TESTING STRATEGY — W02 (95 Tests)

### 9.1 Pre-Bill Validation Tests (25)

| # | Test | Expect |
|---|------|--------|
| 1 | Missing readings → BLOCK invoice | Rule RA-001 fires |
| 2 | Complete readings → PASS | No finding |
| 3 | Consumption spike > 3× avg → FLAG | Rule RA-002 fires, warning |
| 4 | Normal consumption → PASS | No finding |
| 5 | Inactive meter billed → BLOCK | Rule RA-004 fires, error |
| 6 | Active meter billed → PASS | No finding |
| 7 | Customer type ≠ tariff eligibility → BLOCK | Rule RA-005 fires |
| 8 | Customer type = tariff eligibility → PASS | No finding |
| 9 | Auto-correct tariff → correct tariff applied | Rule RA-005 auto-corrects |
| 10 | Duplicate period → BLOCK | Rule RA-006 fires |
| 11 | Unique period → PASS | No finding |
| 12 | Suspended customer → BLOCK | Rule RA-007 fires |
| 13 | Active customer → PASS | No finding |
| 14 | Multiple rules fail → all findings created | All applicable rules fire |
| 15 | Multiple rules pass → no findings | Clean pass |
| 16 | Rule with priority order → evaluated correctly | Higher priority first |
| 17 | Disabled rule → not evaluated | No finding created |
| 18 | Rule with future effectiveFrom → not evaluated | Date guard |
| 19 | Rule with past effectiveTo → not evaluated | Date guard |
| 20 | Blocked customer → error message clear | Human-readable |
| 21 | Blocked customer → bill run continues for others | Partial success |
| 22 | All customers blocked → bill run fails | Complete failure |
| 23 | Meter with no historical data → uses default baseline | Fallback |
| 24 | New customer (first bill) → no historical comparison | Bypass |
| 25 | Consumption exactly at threshold → boundary test | Correct classification |

### 9.2 Post-Bill Validation Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Invoice = expected → PASS | No finding |
| 2 | Invoice ≠ expected (> 1%) → FLAG | Rule RA-008 fires |
| 3 | Invoice amount > 2× avg → WARNING | Rule RA-009 fires |
| 4 | Invoice amount normal → PASS | No finding |
| 5 | Line items sum = invoice total → PASS | Rule RA-010 passes |
| 6 | Line items sum ≠ invoice total → ERROR | Rule RA-010 fires |
| 7 | Auto-recalculate line total → corrected | Rule RA-010 auto-corrects |
| 8 | Tax rate = customer's rate → PASS | Rule RA-011 passes |
| 9 | Tax rate ≠ customer's rate → WARNING | Rule RA-011 fires |
| 10 | Auto-correct tax rate → correct | Rule RA-011 auto-corrects |
| 11 | Customer has active contract → PASS | Rule RA-012 passes |
| 12 | Customer contract expired → WARNING | Rule RA-012 fires |
| 13 | Invoice issued → post-bill rules run automatically | Integration |
| 14 | Invoice issued manually (not via bill run) → rules still run | API hook |
| 15 | Bulk invoice issue (100) → all validated | Performance |
| 16 | Rule error during evaluation → finding not created | Graceful failure |
| 17 | Rule timeout (slow query) → skip + log | Graceful failure |
| 18 | Invoice with zero amount → special handling | Zero boundary |
| 19 | Invoice with negative amount → ERROR | Negative boundary |
| 20 | Invoice with 10000+ line items → performance check | Scale test |

### 9.3 Continuous Monitoring Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Active meter + no invoice > 45 days → FLAG | Rule RA-013 fires |
| 2 | Active meter + recent invoice → PASS | No finding |
| 3 | Inactive meter → skipped | Not evaluated |
| 4 | Same customer + period + amount → DUPLICATE | Rule RA-014 fires |
| 5 | Same customer + period + different amount → NOT duplicate | No finding |
| 6 | Auto-cancel duplicate → old invoice cancelled | Rule RA-014 auto-corrects |
| 7 | Σ(invoices) = Σ(GL revenue) → PASS | Rule RA-015 passes |
| 8 | Σ(invoices) ≠ Σ(GL revenue) > 0.1% → FLAG | Rule RA-015 fires |
| 9 | Continuous monitoring runs on schedule | 6-hour interval |
| 10 | Multiple findings for same issue → deduplicated by fingerprint | Fingerprint match |
| 11 | Finding fingerprint prevents duplicate alerts | Cooldown respected |
| 12 | Continuous job processes 10K meters < 5 minutes | Performance |
| 13 | Job failure → retry 3 times | Resilience |
| 14 | Job failure after 3 retries → alert operator | Escalation |
| 15 | Job processes incrementally (last_run timestamp) | Idempotency |

### 9.4 Investigation Workflow Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Finding created → status = OPEN | Initial state |
| 2 | Assign finding → status = ASSIGNED | Assignment |
| 3 | Start investigation → status = INVESTIGATING | Status change |
| 4 | Add investigation log → entry created | Append-only |
| 5 | Propose correction → status = AWAITING_APPROVAL | Status change |
| 6 | Approve correction → status = CORRECTING | Status change |
| 7 | Reject correction → status = INVESTIGATING | Status change |
| 8 | Verify correction → status = VERIFIED | Status change |
| 9 | Complete correction → status = RESOLVED | Terminal state |
| 10 | Dismiss finding → status = DISMISSED | Terminal state |
| 11 | Cannot re-open RESOLVED finding | Immutability |
| 12 | Cannot re-open DISMISSED finding | Immutability |
| 13 | Evidence auto-collected on creation | 5+ evidence records |
| 14 | Evidence includes all required types | Per finding type |
| 15 | Risk score calculated on creation | 0-100 range |

### 9.5 Risk Scoring Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | CRITICAL severity + high impact → score > 70 | Critical bucket |
| 2 | ERROR severity + medium impact → score 40-70 | High bucket |
| 3 | WARNING severity + low impact → score 15-40 | Medium bucket |
| 4 | INFO severity + minimal impact → score < 15 | Low bucket |
| 5 | Recurring customer issue → score multiplied | 1.5× factor |
| 6 | Recurring area issue → score multiplied | 1.3× factor |
| 7 | First occurrence → no multiplier | Baseline |
| 8 | Very large impact (500K+) → capped at 100 | Max score |
| 9 | Zero-impact finding → minimum score | Floor |
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
W02 — REVENUE ASSURANCE INTELLIGENCE ENGINE
CERTIFICATION CHECKLIST

□ CORE INFRASTRUCTURE
   □ RevenueLeakageFinding model created (full schema)
   □ RevenueInvestigation model created
   □ RevenueRule engine operational (or extended ValidationRule)
   □ RevenueRuleEngine service created
   □ Evidence collection service created
   □ Risk scoring service created

□ DETECTION RULES — ALL 15 OPERATIONAL
   □ RA-001: Missing Readings (pre-bill, BLOCK)
   □ RA-002: Consumption Spike (pre-bill, FLAG)
   □ RA-003: Consumption Drop (pre-bill, FLAG)
   □ RA-004: Inactive Meter Billed (pre-bill, BLOCK)
   □ RA-005: Tariff Misapplication (pre-bill, BLOCK + auto-correct)
   □ RA-006: Duplicate Period (pre-bill, BLOCK)
   □ RA-007: Suspended Customer Billed (pre-bill, BLOCK)
   □ RA-008: Billing Calculation Discrepancy (post-bill, FLAG)
   □ RA-009: Amount Spike (post-bill, FLAG)
   □ RA-010: Line Item Mismatch (post-bill, FLAG + auto-correct)
   □ RA-011: Tax Mismatch (post-bill, FLAG + auto-correct)
   □ RA-012: Expired Contract (post-bill, FLAG)
   □ RA-013: Unbilled Consumption (continuous, FLAG)
   □ RA-014: Duplicate Invoice (continuous, FLAG + auto-cancel)
   □ RA-015: GL Revenue Mismatch (continuous, FLAG)

□ INTEGRATIONS
   □ Pre-bill validation injected into Bill Run generate
   □ Post-bill validation injected into Invoice Issue
   □ Continuous monitoring scheduled (every 6 hours)
   □ GL reconciliation scheduled (daily)
   □ Evidence collection auto-runs on finding creation
   □ Alerts created for CRITICAL findings (existing Alert model)
   □ KPIs updated on finding lifecycle events

□ AI REVENUE ASSURANCE AGENT
   □ Agent operational (C12-W07 AIRecommendation framework)
   □ Detects anomalies with confidence scoring
   □ Proposes corrections with evidence
   □ Requires human approval for corrections
   □ Updates LearnedPattern on resolution
   □ All agent actions audited

□ INVESTIGATION WORKFLOW
   □ Full lifecycle: OPEN → ASSIGNED → INVESTIGATING → AWAITING_APPROVAL →
     CORRECTING → VERIFIED → RESOLVED | DISMISSED
   □ Evidence collection: auto on creation
   □ Risk scoring: auto on creation
   □ Assignment: auto or manual
   □ Investigation log: append-only
   □ Resolution: requires approval

□ SECURITY
   □ RBAC for revenue roles (Billing Operator, Revenue Analyst, Revenue Manager)
   □ Segregation of duties: detect ≠ correct ≠ approve
   □ RESOLVED/DISMISSED findings immutable
   □ Investigation log append-only
   □ All mutations audited

□ DASHBOARD
   □ Revenue Assurance Dashboard page at /admin/revenue-assurance
   □ Finding list with filters (severity, status, area, type)
   □ Finding detail page with evidence, investigation log, actions
   □ KPI widgets: leakage total, open count, recovery rate, avg resolution
   □ Charts: leakage by type, findings trend

□ TESTS — 95 PASSING
   □ Pre-bill validation: 25 tests
   □ Post-bill validation: 20 tests
   □ Continuous monitoring: 15 tests
   □ Investigation workflow: 15 tests
   □ Risk scoring: 10 tests
   □ AI agent: 5 tests
   □ Dashboard: 5 tests

W02 STATUS: □ NOT IMPLEMENTED
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
W01 (Billing-to-GL) ────┐
                         │
Bill Run (existing) ─────┤
Invoice routes ──────────┤
ValidationRule (exist) ──┤
AlertRule/Alert (exist) ─┤
KPI (existing) ──────────┤
AI Engine (existing) ────┤
C12 AIRecommendation ────┤
                         ▼
              ┌─────────────────────┐
              │  W02 REVENUE        │
              │  ASSURANCE ENGINE   │
              └─────────────────────┘
                    │
                    ├──→ revenue-engine.js (core)
                    ├──→ revenue-evidence.js (collection)
                    ├──→ revenue-scoring.js (risk)
                    ├──→ revenue-investigation.js (workflow)
                    ├──→ revenue-assurance routes
                    └──→ Revenue Assurance Dashboard
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
*C13-W02 — Revenue Assurance Intelligence Engine. READ ONLY. GOVERNANCE PLANNING ONLY.*
