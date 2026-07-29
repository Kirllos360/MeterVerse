# C13-W04 — Enterprise Collection Intelligence & Receivables Management Engine
## Blueprint

**Version:** 1.0.0  
**Status:** READ ONLY — GOVERNANCE PLANNING ONLY — NOT IMPLEMENTED  
**Date:** 2026-07-29  
**Program:** C13 Enterprise Financial & Billing Intelligence Platform  
**Wave:** W04 (Collection Intelligence — builds on W01-W03 billing, revenue, and tariff foundation)  

---

## PART 1: CURRENT STATE AUDIT

### 1.1 Existing Collections Infrastructure

| Component | Location | Status | Capability |
|-----------|----------|--------|------------|
| **CollectionCase** model | `schema.prisma:1386` | ✅ Complete | customerId, invoiceId, status, priority, totalAmount, paidAmount, assignedTo |
| **CollectionAction** model | `schema.prisma:1412` | ✅ Complete | type, result, notes, actedBy |
| **PromiseToPay** model | `schema.prisma:1427` | ✅ Complete | promisedDate, promisedAmount, status (pending/kept) |
| **CustomerLedgerEntry** model | `schema.prisma:1493` | ✅ Complete | Overpayments, credits, refunds |
| **SLA** model | `schema.prisma:1549` | ✅ Complete | responseTime, resolutionTime |
| **SLABreach** model | `schema.prisma:1566` | ✅ Complete | Breach tracking |
| **SLAEscalation** model | `schema.prisma:1582` | ✅ Complete | Escalation levels |
| **EscalationPolicy** + **EscalationStep** | `schema.prisma:1646-1675` | ✅ Complete | Policy + step definitions |
| **collection-cases CRUD** | `routes/domain.js:139` | ✅ Complete | Generic CRUD via factory |
| **customer aging** | `routes/payments.js:101-108` | ✅ Basic | Per-customer invoice-level aging |
| **aging report** | `routes/reports.js:41-49` | ✅ Basic | Top-level outstanding per customer |
| **W01 FinancialEvent** | Planned | ❌ W01 | Revenue event for collection linking |
| **W02 Revenue Rules** | Planned | ❌ W02 | Scoring for collection priority |
| **W03 Tariff Intelligence** | Planned | ❌ W03 | Usage data for customer profiling |

### 1.2 Current Collection Case Lifecycle

```
CollectionCase (status field):
  "open" → "in_progress" → "resolved" → "closed"
```

**Current:** Simple status-based lifecycle with no stages, no escalation automation, no AI.

### 1.3 Current Aging Capability

```javascript
// payments.js:101 — GET /customers/:id/aging
// Returns per-invoice: daysOverdue, outstanding, dueDate
→ No aggregation by aging bucket
→ No portfolio-level view
→ No trend analysis
→ No segmentation
```

### 1.4 Current Dunning Capability

**None.** Collection actions are manual (log entries via CollectionAction). No automated dunning, no multi-channel orchestration, no escalation engine.

### 1.5 Gap Summary

| Capability | Current | W04 Target |
|------------|---------|------------|
| Case lifecycle | 4 states | 12-state lifecycle with stages |
| Aging engine | Per-customer basic | Multi-dimensional, real-time |
| Dunning automation | ❌ None | 7-stage multi-channel engine |
| Payment probability | ❌ None | AI scoring 0-100 |
| Collection priority | Manual priority field | AI-driven priority score |
| Promise-to-Pay | Basic create/track | Full lifecycle with reminders |
| Installment plans | ❌ None | Full plan management |
| Dispute management | ❌ None | Full dispute workflow |
| Bad debt provisioning | ❌ None | Automated provision calculation |
| Write-off governance | ❌ None | Approval workflow |
| Collector workbench | ❌ None | Full frontend workbench |
| AI Collection Agent | ❌ None | Next-best-action recommendations |
| Performance KPIs | ❌ None | Collector + portfolio metrics |

---

## PART 2: ENTERPRISE RECEIVABLES ARCHITECTURE

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                    COLLECTION INTELLIGENCE PLATFORM                                            │
│                                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  RECEIVABLES INTELLIGENCE LAYER                                                         │    │
│  │                                                                                        │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │    │
│  │  │ Aging Engine │  │ Risk Scoring │  │ Payment      │  │ Collection Strategy       │   │    │
│  │  │ (real-time)  │  │ (AI-driven)  │  │ Probability  │  │ Engine (segment-based)   │   │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────────────┘   │    │
│  └──────────────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  COLLECTION OPERATIONS LAYER                                                            │    │
│  │                                                                                        │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │    │
│  │  │ Dunning      │  │ Promise-to-  │  │ Installment  │  │ Payment      │  │ Dispute  │ │    │
│  │  │ Engine       │  │ Pay Engine   │  │ Plan Engine  │  │ Arrangement  │  │ Workflow │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘ │    │
│  │                                                                                        │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │ Escalation   │  │ Campaign     │  │ Bad Debt     │  │ Write-off    │               │    │
│  │  │ Engine       │  │ Management   │  │ Provisioning │  │ Governance   │               │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘               │    │
│  └──────────────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  COLLECTOR WORKBENCH & DASHBOARDS                                                      │    │
│  │                                                                                        │    │
│  │  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────────┐    │    │
│  │  │ Collector Workbench  │  │ Supervisor Dashboard │  │ Executive Dashboard       │    │    │
│  │  │ (my cases, actions)  │  │ (team perf, queue)   │  │ (portfolio, trends, KPIs) │    │    │
│  │  └──────────────────────┘  └──────────────────────┘  └──────────────────────────┘    │    │
│  └──────────────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  AI COLLECTION INTELLIGENCE AGENT                                                        │    │
│  │                                                                                        │    │
│  │  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────────┐    │    │
│  │  │ Next-Best-Action     │  │ Payment Probability  │  │ Churn Prediction         │    │    │
│  │  │ Recommendation       │  │ Scoring              │  │ (collection-related)     │    │    │
│  │  └──────────────────────┘  └──────────────────────┘  └──────────────────────────┘    │    │
│  │                                                                                        │    │
│  │  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────────┐    │    │
│  │  │ Revenue Recovery     │  │ Collection Strategy  │  │ Performance               │    │    │
│  │  │ Forecasting          │  │ Optimization         │  │ Analytics                 │    │    │
│  │  └──────────────────────┘  └──────────────────────┘  └──────────────────────────┘    │    │
│  └──────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  INTEGRATION LAYER                                                                      │    │
│  │                                                                                        │    │
│  │  Invoice ──→ Auto-create collection case when overdue                                  │    │
│  │  Payment ──→ Update collection case when payment received                             │    │
│  │  W01 GL ───→ Bad debt provision journal entries                                       │    │
│  │  W02 Rev ──→ Revenue assurance flags priority cases                                   │    │
│  │  W03 Tariff─→ Usage data for customer profiling                                       │    │
│  │  C12-W07 ──→ AIRecommendation + LearnedPattern integration                           │    │
│  │  Notifications → Multi-channel reminders (Email/SMS/WhatsApp/Push)                   │    │
│  └──────────────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Collection Case Lifecycle — 12 States

```
INVOICE OVERDUE (by 1 day past dueDate)
    │
    ▼
┌──────────────┐
│  AUTO_CREATED  │  System creates CollectionCase automatically
│  (Stage 0)    │  Priority assigned, risk scored
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  OPEN         │  Case ready for assignment
│  (Stage 1)    │  Can be self-assigned or auto-assigned
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  IN_PROGRESS  │  Collector actively working the case
│  (Stage 2)    │  Actions logged, PTP may be created
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  CONTACTED    │  Customer reached — discussing resolution
│  (Stage 3)    │  Outcome: PTP | Arrangement | Dispute | No response
└──────┬───────┘
       │
  ┌────┴──────────────────────────────────────────┐
  │                    │                           │
  ▼                    ▼                           ▼
┌──────────┐   ┌──────────────┐           ┌──────────────┐
│ PTP_SET  │   │ ARRANGEMENT  │           │  DISPUTED    │
│ (Stage 4)│   │ (Stage 4)    │           │ (Stage 4)    │
│ Promise  │   │ Installment  │           │ Customer     │
│ to pay   │   │ plan created │           │ disputes inv │
└────┬─────┘   └──────┬───────┘           └──────┬───────┘
     │                │                          │
     ▼                ▼                          │
┌──────────┐    ┌──────────┐                     │
│ PTP_KEPT │    │ PLAN_ACT │                     │
│ (Stage 5)│    │ (Stage 5)│                     │
│ Paid!    │    │ Paying   │                     │
└────┬─────┘    └────┬─────┘                     │
     │                │                          │
     ▼                ▼                          │
┌──────────┐    ┌──────────┐                     │
│ RESOLVED │    │ RESOLVED │                     │
│ (Stage 6)│    │ (Stage 6)│                     │
└──────────┘    └──────────┘                     │
                                                  │
             ┌────────────────────────────────────┘
             │              │               │
             ▼              ▼               ▼
      ┌──────────┐   ┌──────────┐    ┌──────────────┐
      │ PTP_MISS │   │ PLAN_DEF │    │ DISPUTE_DONE │
      │ (Escalate)│  │ (Escalate)│   │ (resolve)    │
      └──────────┘   └──────────┘    └──────┬───────┘
             │              │               │
             └──────┬───────┘               │
                    ▼                       │
             ┌──────────────┐               │
             │ AUTO_ESCALATE │              │
             │ (Stage +1)   │              │
             │ Dunning fires │              │
             └──────┬───────┘              │
                    │                       │
                    ▼                       ▼
             ┌──────────────┐        ┌──────────────┐
             │ More stages... │        │  RESOLVED    │
             │ (up to 6)    │        └──────────────┘
             └──────┬───────┘
                    │
               ┌────┴────┐
               │         │
               ▼         ▼
        ┌──────────┐ ┌──────────┐
        │ WRITE_OFF│ │ RECOVERY │
        │ (Stage 7)│ │ (Stage 7)│
        │ Approved │ │ Post-WO  │
        └──────────┘ └──────────┘
```

### 2.3 Aging Engine Design

```
AgingEngine.getAging(customerId):
  1. LOAD all invoices for customer
     WHERE archivedAt IS NULL
     AND status IN ("issued", "overdue", "partial")
  
  2. FOR each invoice:
     daysOverdue = TODAY - invoice.dueDate
     outstanding = invoice.amount - invoice.paidAmount
     bucket = classify(daysOverdue)
     
     RETURN bucket
    
  3. AGGREGATE by bucket:
     current:   daysOverdue <= 0      (not yet due)
     bucket_30: daysOverdue 1-30
     bucket_60: daysOverdue 31-60
     bucket_90: daysOverdue 61-90
     bucket_120: daysOverdue 91-120
     bucket_120plus: daysOverdue > 120

  4. COMPUTE metrics:
     totalOutstanding = SUM(all buckets)
     agingPercentByBucket = bucketAmount / totalOutstanding × 100
     weightedAvgDays = SUM(daysOverdue × outstanding) / totalOutstanding
     collectionEffectiveness = totalPaidLastMonth / totalDueLastMonth × 100

AgingEngine.portfolioAging(filters):
  → Same logic but aggregated across all customers
  → Supports filters: areaId, projectId, customerGroup, collectorId
  → Returns: portfolio summary + per-bucket breakdown + trend data
```

### 2.4 Aging Bucket Classification

```javascript
function classify(daysOverdue) {
  if (daysOverdue <= 0)    return { key: "current",     label: "Current",        maxDays: 0 }
  if (daysOverdue <= 30)   return { key: "bucket_30",   label: "1-30 Days",     maxDays: 30 }
  if (daysOverdue <= 60)   return { key: "bucket_60",   label: "31-60 Days",    maxDays: 60 }
  if (daysOverdue <= 90)   return { key: "bucket_90",   label: "61-90 Days",    maxDays: 90 }
  if (daysOverdue <= 120)  return { key: "bucket_120",  label: "91-120 Days",   maxDays: 120 }
  return                       { key: "bucket_120plus", label: "120+ Days",     maxDays: Infinity }
}
```

---

## PART 3: DATA MODEL DESIGN

### 3.1 Enhanced CollectionCase (NEW fields on existing model)

| New Field | Type | Purpose |
|-----------|------|---------|
| `stage` | Int @default(0) | Current dunning stage (0-7) |
| `dunningLastAt` | DateTime? | Last dunning action |
| `nextDunningAt` | DateTime? | Next scheduled dunning |
| `paymentProbability` | Float? | AI score 0.0-1.0 |
| `priorityScore` | Float? | AI score 0-100 |
| `riskBucket` | String? | LOW | MEDIUM | HIGH | CRITICAL |
| `collectorId` | String? | FK → User (assigned collector) |
| `collectionStrategy` | String? | SOFT | STANDARD | AGGRESSIVE | LEGAL |
| `expectedResolutionDate` | DateTime? | Target resolution |
| `lastContactAt` | DateTime? | Last customer contact |
| `contactMethod` | String? | EMAIL | SMS | CALL | WHATSAPP | VISIT |
| `ptpCount` | Int @default(0) | Number of PTPs on this case |
| `missedPtpCount` | Int @default(0) | Consecutive missed PTPs |
| `disputeReason` | String? | If disputed, why |
| `disputeStatus` | String? | OPEN | INVESTIGATING | RESOLVED |
| `writeOffAmount` | Float? | Amount written off |
| `writeOffReason` | String? | Reason for write-off |
| `writeOffApprovedBy` | String? | FK → User |
| `writeOffApprovedAt` | DateTime? | |

### 3.2 CustomerRiskProfile (NEW)

**Purpose:** Store AI-computed risk and payment behavior profile per customer.

```
CustomerRiskProfile
├── id: String (UUID, PK)
├── customerId: String (FK, UNIQUE)
├── paymentProbability: Float?          ← AI score 0.0-1.0
├── riskScore: Float?                   ← 0-100
├── riskBucket: String?                 ← LOW | MEDIUM | HIGH | CRITICAL
├── avgPaymentDays: Int?                ← Avg days to pay after due date
├── onTimePaymentRate: Float?           ← % of payments made on time
├── totalPaidLast12Months: Float?
├── totalBilledLast12Months: Float?
├── missedPtpCount: Int @default(0)     ← Lifetime missed PTPs
├── keptPtpCount: Int @default(0)       ← Lifetime kept PTPs
├── ptpReliability: Float?              ← kept / (kept + missed)  [0-1]
├── lastRiskCalculatedAt: DateTime?
├── lastPaymentAt: DateTime?
├── createdAt, updatedAt

Relations:
  customer → Customer
```

### 3.3 DunningRule (NEW — or reuse existing EscalationStep)

**Purpose:** Define dunning escalation rules by customer segment and overdue stage.

```
DunningRule
├── id: String (UUID, PK)
├── name: String
├── customerSegment: String             ← ALL | RESIDENTIAL | COMMERCIAL | GOVERNMENT
├── triggerDaysOverdue: Int             ← Days past due to trigger this stage
├── stage: Int                          ← 0-7
├── action: String                      ← SEND_NOTIFICATION | ASSIGN_COLLECTOR | ESCALATE
├── channel: String                     ← EMAIL | SMS | WHATSAPP | PUSH | CALL | LETTER | VISIT
├── templateId: String?                 ← FK → NotificationTemplate
├── priority: Int @default(0)           ← Lower = higher priority
├── active: Boolean @default(true)
├── createdAt, archivedAt
```

### 3.4 InstallmentPlan (NEW)

**Purpose:** Manage payment installment plans.

```
InstallmentPlan
├── id: String (UUID, PK)
├── collectionCaseId: String (FK)
├── customerId: String (FK)
├── totalAmount: Float
├── downPayment: Float @default(0)
├── installmentCount: Int
├── installmentAmount: Float            ← (totalAmount - downPayment) / installmentCount
├── frequency: String                   ← WEEKLY | BIWEEKLY | MONTHLY
├── firstDueDate: DateTime
├── status: String                      ← PENDING | ACTIVE | COMPLETED | DEFAULTED
├── missedInstallments: Int @default(0)
├── createdAt, archivedAt, updatedAt

Relations:
  collectionCase → CollectionCase
  customer → Customer
  installments → PlanInstallment[]
```

### 3.5 PlanInstallment (NEW)

```
PlanInstallment
├── id, planId (FK), dueDate: DateTime, amount: Float
├── status: String                      ← PENDING | PAID | MISSED | WAIVED
├── paidAt: DateTime?
├── paidAmount: Float?
├── paymentId: String?                  ← FK → Payment (when paid)
├── createdAt

Unique: [planId, dueDate]
```

### 3.6 Dispute (NEW)

```
Dispute
├── id: String (UUID, PK)
├── collectionCaseId: String? (FK)
├── invoiceId: String (FK)
├── customerId: String (FK)
├── reason: String                      ← BILLING_ERROR | METER_ERROR | TARIFF_DISPUTE |
│                                           SERVICE_QUALITY | FINANCIAL_HARDSHIP | OTHER
├── description: String
├── status: String                      ← OPEN | INVESTIGATING | RESOLVED | REJECTED
├── evidence: String? (JSON)
├── resolution: String?
├── resolvedAt: DateTime?
├── resolvedBy: String?
├── createdAt, archivedAt, updatedAt
```

### 3.7 ProvisionRule (NEW)

**Purpose:** Define bad debt provisioning rules per aging bucket.

```
ProvisionRule
├── id: String (UUID, PK)
├── name: String
├── agingBucket: String                 ← current | bucket_30 | bucket_60 | bucket_90 | bucket_120 | bucket_120plus
├── provisionRate: Float                ← 0.02 for 2%
├── active: Boolean @default(true)
├── createdAt, archivedAt
```

### 3.8 BadDebtProvision (NEW)

```
BadDebtProvision
├── id: String (UUID, PK)
├── periodId: String (FK → FinancialPeriod)
├── totalOutstanding: Float
├── totalProvision: Float
├── provisions: String (JSON)           ← [{ bucket, outstanding, rate, provision }]
├── journalEntryId: String? (FK → JournalEntry)
├── status: String                      ← DRAFT | POSTED
├── createdAt, archivedAt

Relations:
  period → FinancialPeriod
  journalEntry → JournalEntry
```

### 3.9 WriteOffRequest (NEW)

**Purpose:** Governed write-off approval workflow.

```
WriteOffRequest
├── id: String (UUID, PK)
├── collectionCaseId: String (FK)
├── customerId: String (FK)
├── amount: Float
├── reason: String
├── status: String                      ← PENDING | APPROVED | REJECTED
├── requestedBy: String (FK → User)
├── reviewedBy: String? (FK → User)
├── reviewedAt: DateTime?
├── rejectReason: String?
├── journalEntryId: String? (FK → JournalEntry)  ← Write-off JE posted on approval
├── createdAt, archivedAt
```

### 3.10 New Models Summary

| # | Model | Lines | Purpose |
|---|-------|-------|---------|
| 1 | CustomerRiskProfile | ~18 | AI-computed payment behavior profile |
| 2 | DunningRule | ~14 | Dunning escalation rules |
| 3 | InstallmentPlan | ~18 | Payment installment plans |
| 4 | PlanInstallment | ~10 | Individual installments |
| 5 | Dispute | ~18 | Invoice/case dispute management |
| 6 | ProvisionRule | ~10 | Bad debt provision rates |
| 7 | BadDebtProvision | ~14 | Period-end provisions |
| 8 | WriteOffRequest | ~16 | Write-off approval |
| **Total** | **8 new models** | **~118 lines** | |

**Enhanced existing:** CollectionCase (~20 new fields), PromiseToPay (~5 new fields)

---

## PART 4: COLLECTION STRATEGY FRAMEWORK

### 4.1 Customer Segmentation for Collections

| Segment | Criteria | Strategy | Dunning Tone |
|---------|----------|----------|-------------|
| **Premium** | Government, Corporate Large, High-value residential | SOFT — personalized outreach, relationship management | Polite reminder, account manager CC'd |
| **Standard** | Corporate Small, Residential standard | STANDARD — automated dunning, self-service options | Firm but professional |
| **At Risk** | Low payment probability (< 0.4), missed PTPs | AGGRESSIVE — intensive dunning, field visit, escalation | Urgent, escalating |
| **Hardship** | Disputed invoice, financial hardship case | SOFT — payment arrangement, installment plan | Supportive, flexible |
| **Legal** | High amount (> 100K), 120+ days, no contact | LEGAL — final notice, legal proceedings | Legal warning |

### 4.2 Strategy Engine

```
CollectionStrategyEngine.getStrategy(customer, case):
  1. LOAD CustomerRiskProfile for customer
  2. CHECK paymentProbability:
     IF probability < 0.2 → "AGGRESSIVE"
     IF probability < 0.4 → "STANDARD"
  
  3. CHECK dispute status:
     IF case.disputeStatus == "OPEN" → "HARDSHIP"
  
  4. CHECK amount + aging:
     IF case.totalAmount > 100000 AND stage >= 5 → "LEGAL"
  
  5. CHECK customer segment:
     IF segment == "GOVERNMENT" AND probability > 0.6 → "SOFT"
  
  6. DEFAULT: "STANDARD"
  
  7. RETURN strategy name + dunning rules for that segment
```

### 4.3 Dunning Escalation — 7 Stages

```
STAGE 0: DAY 1 (overdue by 1 day)
  Channel: Email
  Template: Payment reminder — polite
  Action: Auto-send
  PTP: Optional

STAGE 1: DAY 7
  Channel: SMS + Email
  Template: Overdue notice — firm
  Action: Auto-send
  PTP: Encouraged

STAGE 2: DAY 15
  Channel: SMS + Email + WhatsApp
  Template: Second notice — urgent
  Action: Auto-send
  PTP: Requested

STAGE 3: DAY 30
  Channel: SMS + Email + WhatsApp + Call
  Template: Final notice
  Action: Auto-send + collector assigned
  PTP: Required to proceed
  Escalation: Case assigned to collector

STAGE 4: DAY 45
  Channel: Letter (registered mail) + Call
  Template: Pre-disconnection warning
  Action: Collector dispatches field visit
  PTP: Required — missed PTP → escalate
  Escalation: Supervisor notified

STAGE 5: DAY 60
  Channel: Letter + Field Visit
  Template: Disconnection notice
  Action: Field visit by technician
  PTP: Final opportunity
  Escalation: Manager approval required for next stage

STAGE 6: DAY 75+
  Channel: Legal notice (registered mail)
  Template: Legal proceedings warning
  Action: Prepare write-off or legal case
  PTP: N/A
  Escalation: CFO/legal team
```

### 4.4 Dunning Rule Evaluation

```
DunningEngine.evaluate():
  1. FOR each active CollectionCase:
     a. SKIP if status == RESOLVED or WRITE_OFF or CLOSED
     b. SKIP if has active InstallmentPlan (plan handles comms)
     
     c. daysOverdue = TODAY - dueDate (from linked invoice)
     d. currentStage = case.stage
     
     e. Find matching DunningRule:
        WHERE customerSegment == customer.segment
        AND triggerDaysOverdue <= daysOverdue
        AND stage > currentStage
        ORDER BY triggerDaysOverdue ASC
        LIMIT 1
     
     f. IF rule found:
        - Execute action (send notification via channel)
        - Update case: stage, dunningLastAt, nextDunningAt
        - Log CollectionAction: type = "dunning_auto", result = "sent"
     
     g. IF rule.action == "ASSIGN_COLLECTOR":
        - Auto-assign to available collector (round-robin or least-loaded)
     
     h. IF rule.action == "ESCALATE":
        - Notify supervisor
        - Log SLA escalation event

  2. SCHEDULE: Run every 6 hours (or configurable interval)
```

---

## PART 5: AI COLLECTION INTELLIGENCE AGENT

### 5.1 Agent Design

**Agent Name:** Collection Intelligence Agent  
**Framework:** C12-W07 Operational Intelligence (AIRecommendation model)  
**Autonomy Level:** ⚡ Semi-autonomous  

| Capability | Autonomy | Human Approval |
|------------|----------|----------------|
| Payment probability scoring | ✅ Full | None (read-only score) |
| Next-best-action recommendation | ⚡ Semi | Required for execution |
| Collection priority scoring | ✅ Full | None (read-only score) |
| Churn prediction | ✅ Full | None (alert only) |
| Strategy optimization | ⚡ Semi | Recommended strategies |
| Revenue recovery forecasting | ✅ Full | None (forecast only) |

### 5.2 Payment Probability Scoring

```
ALGORITHM: scorePaymentProbability(customerId):
  profile = CustomerRiskProfile.findUnique(customerId)
  
  // Factors:
  score = 0.5  // base
  
  // 1. Payment history weight: 30%
  IF profile.onTimePaymentRate > 0.8:      score += 0.15
  ELSE IF profile.onTimePaymentRate > 0.6:  score += 0.10
  ELSE IF profile.onTimePaymentRate > 0.4:  score += 0.05
  ELSE:                                      score -= 0.10
  
  // 2. PTP reliability weight: 20%
  IF profile.ptpReliability > 0.8:          score += 0.10
  ELSE IF profile.ptpReliability > 0.5:     score += 0.05
  ELSE IF profile.ptpReliability < 0.3:     score -= 0.10
  
  // 3. Customer tenure weight: 10%
  daysSinceCreation = TODAY - customer.createdAt
  IF daysSinceCreation > 730:               score += 0.05      // 2+ years
  ELSE IF daysSinceCreation > 365:           score += 0.02      // 1+ year
  ELSE IF daysSinceCreation < 90:            score -= 0.05      // new customer
  
  // 4. Invoice amount vs historical weight: 15%
  avgInvoice = profile.totalBilledLast12Months / 12
  currentInvoiceRelative = currentAmount / MAX(avgInvoice, 1)
  IF currentInvoiceRelative > 3:             score -= 0.10      // unusually high
  ELSE IF currentInvoiceRelative > 2:        score -= 0.05
  
  // 5. Recent contact weight: 10%
  daysSinceLastContact = TODAY - case.lastContactAt
  IF daysSinceLastContact < 7:               score += 0.05      // recently contacted
  ELSE IF daysSinceLastContact > 30:          score -= 0.03      // no recent contact
  
  // 6. Seasonality weight: 5%
  // (Historical pattern for this month)
  
  // 7. Dispute weight: 10%
  IF case.disputeStatus == "OPEN":           score -= 0.10
  
  // Normalize: 0.0 - 1.0
  score = Math.max(0, Math.min(1, score))
  
  RETURN score
```

### 5.3 Next-Best-Action Recommendations

```
ALGORITHM: recommendNextAction(case):
  probability = case.paymentProbability
  strategy = CollectionStrategyEngine.getStrategy(customer, case)
  stage = case.stage
  amount = case.totalAmount
  
  IF probability > 0.7:
    RETURN { action: "SEND_REMINDER", channel: "EMAIL", urgency: "LOW",
             reason: "High probability — simple reminder sufficient" }
  
  IF probability > 0.5 AND probability <= 0.7:
    IF stage < 2:
      RETURN { action: "SEND_REMINDER", channel: "SMS+EMAIL", urgency: "MEDIUM",
               reason: "Moderate probability — standard dunning" }
    ELSE:
      RETURN { action: "REQUEST_PTP", channel: "CALL", urgency: "MEDIUM",
               reason: "Moderate probability — PTP may resolve" }
  
  IF probability > 0.3 AND probability <= 0.5:
    IF !case.assignedTo:
      RETURN { action: "ASSIGN_COLLECTOR", urgency: "HIGH",
               reason: "Low probability — needs collector intervention" }
    ELSE:
      RETURN { action: "FIELD_VISIT", urgency: "HIGH",
               reason: "Low probability — field visit recommended" }
  
  IF probability <= 0.3:
    IF amount > 10000:
      RETURN { action: "ESCALATE_TO_MANAGER", urgency: "CRITICAL",
               reason: "Very low probability + high amount — escalate" }
    ELSE:
      RETURN { action: "PREPARE_WRITE_OFF", urgency: "HIGH",
               reason: "Very low probability — consider write-off" }
  
  IF disputeStatus == "OPEN":
    RETURN { action: "REVIEW_DISPUTE", urgency: "HIGH",
             reason: "Active dispute — resolve before collection" }
```

### 5.4 Churn Prediction

```
ALGORITHM: predictChurnRisk(customerId):
  profile = CustomerRiskProfile.findUnique(customerId)
  
  riskFactors = []
  
  // 1. Payment behavior
  IF profile.missedPtpCount > 3:
    riskFactors.push({ factor: "REPEATED_MISSED_PTPS", weight: 0.3 })
  IF profile.onTimePaymentRate < 0.5:
    riskFactors.push({ factor: "LOW_ON_TIME_RATE", weight: 0.25 })
  
  // 2. Aging trend
  cases = CollectionCase.findMany({ customerId })
  IF cases.some(c => c.stage > 4):
    riskFactors.push({ factor: "DEEP_AGING", weight: 0.2 })
  
  // 3. Dispute activity
  disputes = Dispute.findMany({ customerId })
  IF disputes.length > 2:
    riskFactors.push({ factor: "MULTIPLE_DISPUTES", weight: 0.15 })
  
  // 4. Communication
  IF !profile.lastPaymentAt OR profile.lastPaymentAt < 90 days ago:
    riskFactors.push({ factor: "NO_RECENT_PAYMENT", weight: 0.1 })
  
  churnScore = SUM(riskFactors.weight) // 0.0 - 1.0
  
  RETURN {
    churnProbability: churnScore,
    riskFactors: riskFactors.sort(weight DESC),
    recommendation: churnScore > 0.5 ? "RETENTION_CAMPAIGN" : "MONITOR"
  }
```

---

## PART 6: DISPUTE MANAGEMENT WORKFLOW

### 6.1 Dispute Lifecycle

```
DISPUTE CREATED (by customer via portal/phone/email)
    │
    ▼
┌─────────┐
│  OPEN    │  Initial state
└────┬─────┘
     │
     │ ASSIGN
     ▼
┌──────────────┐
│ INVESTIGATING │  Collector/analyst reviews
└──────┬───────┘
       │
   ┌───┴───────────────┐
   │                   │
   ▼                   ▼
┌────────┐       ┌──────────┐
│RESOLVED│       │ REJECTED │  (if no merit)
└───┬────┘       └──────────┘
    │
    ├──→ Correction applied if billing error
    ├──→ Collection case updated
    └──→ Customer notified
```

### 6.2 Dispute Types and Resolution

| Dispute Type | Common Cause | Resolution | Impact on Collections |
|-------------|-------------|------------|----------------------|
| BILLING_ERROR | Wrong tariff, wrong consumption, duplicate | Cancel invoice, regenerate | Pause dunning during investigation |
| METER_ERROR | Faulty meter, wrong reading | Schedule meter check, adjust reading | Pause dunning |
| TARIFF_DISPUTE | Customer claims wrong tariff applied | Review tariff assignment, adjust if needed | Pause dunning |
| SERVICE_QUALITY | Poor voltage, frequent outages | Log service complaint, compensate | May offer discount |
| FINANCIAL_HARDSHIP | Job loss, medical emergency | Offer installment plan, defer payment | Switch to HARDSHIP strategy |
| OTHER | Various | Investigate case-by-case | Case-by-case |

---

## PART 7: BAD DEBT PROVISIONING & WRITE-OFF GOVERNANCE

### 7.1 Provision Calculation

```
ProvisionEngine.calculate(periodId):
  1. LOAD all outstanding invoices by aging bucket
     current:     EGP 500,000   × 0.5%  = EGP 2,500
     bucket_30:   EGP 350,000   × 2%    = EGP 7,000
     bucket_60:   EGP 200,000   × 10%   = EGP 20,000
     bucket_90:   EGP 100,000   × 25%   = EGP 25,000
     bucket_120:  EGP 50,000    × 50%   = EGP 25,000
     bucket_120+: EGP 25,000    × 80%   = EGP 20,000
     ─────────────────────────────────────────────
     TOTAL:                     EGP 99,500
  
  2. CREATE BadDebtProvision:
     totalOutstanding = EGP 1,225,000
     totalProvision = EGP 99,500
     provisions = [{ bucket: "current", outstanding, rate, provision }, ...]
  
  3. GENERATE journal entry (via W01 PostingEngine):
     DR: Bad Debt Expense (6101-01)        EGP 99,500
     CR: Allowance for Doubtful Accounts   EGP 99,500
  
  4. RETURN BadDebtProvision
```

### 7.2 Write-Off Approval Workflow

```
Write-off Initiated (Collector recommends)
    │
    ▼
┌─────────────┐
│  PENDING    │  Request created — awaiting review
└──────┬──────┘
       │
   ┌───┴───────────┐
   │               │
   ▼               ▼
┌──────────┐  ┌──────────┐
│ APPROVED │  │ REJECTED │  ← Back to collection
└────┬─────┘  └──────────┘
     │
     ▼
┌──────────┐
│  EXECUTE │  Post journals, close case, update customer
└────┬─────┘
     │
     ▼
┌───────────┐
│  RECOVERY │  (if payment received after write-off)
└───────────┘
```

**Approval Rules:**
| Amount | Approver |
|--------|----------|
| < 5,000 EGP | Collection Supervisor |
| 5,000 - 25,000 EGP | Collection Manager |
| 25,000 - 100,000 EGP | Finance Manager |
| > 100,000 EGP | CFO |

---

## PART 8: DASHBOARDS & WORKBENCH

### 8.1 Collector Workbench (`/admin/collections/my-cases`)

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ MY COLLECTION CASES (24)                               FILTER: All │ Priority v    │
│                                                                                       │
│ ┌────┬─────────────────┬──────────┬──────┬────────┬─────────┬──────────┬──────────┐  │
│ │ #  │ Customer        │ Amount   │ Days │ Stage  │ Prob.   │ Last Act │ Action   │  │
│ │ 1  │ EgyptAir Tower  │ EGP 45K  │ 78   │ ██ 5   │ 0.25 🔴 │ 2d ago   │ [Visit]  │  │
│ │ 2  │ Nile Corp       │ EGP 12K  │ 34   │ ██ 3   │ 0.45 🟡 │ 1d ago   │ [Call]   │  │
│ │ 3  │ Mohamed Ali     │ EGP 3.2K │ 12   │ ██ 1   │ 0.72 🟢 │ Auto     │ [Remind] │  │
│ │ 4  │ Heliopolis Co   │ EGP 28K  │ 56   │ ██ 4   │ 0.31 🔴 │ 5d ago   │ [PTP]    │  │
│ └────┴─────────────────┴──────────┴──────┴────────┴─────────┴──────────┴──────────┘  │
│                                                                                       │
│ ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│ │ TODAY'S ACTIONS (5)                                                                │  │
│ │ ☐ Call EgyptAir Tower — Stage 5 overdue for field visit                          │  │
│ │ ☐ Send PTP reminder to Heliopolis Co — promised yesterday                       │  │
│ │ ☐ Review dispute — Nile Corp invoice INV-2026-0712                               │  │
│ │ ☐ Approve write-off — Small Customer #C-451 (EGP 1,200)                         │  │
│ │ ☐ Close case — Mohamed Ali (paid in full)                                        │  │
│ └──────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Supervisor Dashboard (`/admin/collections/supervisor`)

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ COLLECTION SUPERVISOR DASHBOARD                                                         │
│                                                                                       │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ Open Cases   │ │ Assigned     │ │ Unassigned   │ │ Avg Age      │ │ Collector    │ │
│ │       312    │ │       245    │ │        67    │ │      34d     │ │ Eff: 78%    │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ │
│                                                                                       │
│ ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│ │ TEAM PERFORMANCE                                                                   │  │
│ │ ┌──────────┬────────┬────────┬────────┬────────┬────────┬────────┐               │  │
│ │ │ Collector│ Cases  │ Resolv │ PTP    │ Field  │ Avg    │ Eff.   │               │  │
│ │ │          │ Assignd│ /Month │ Kept%  │ Visits │ Resp.  │ Rate   │               │  │
│ │ │ Sarah    │ 42     │ 28     │ 74%    │ 12     │ 2.1d   │ 82%    │               │  │
│ │ │ Ahmed    │ 38     │ 31     │ 81%    │ 8      │ 1.8d   │ 89%    │ ▲              │  │
│ │ │ Mariam   │ 36     │ 22     │ 65%    │ 15     │ 3.2d   │ 71%    │ ▼              │  │
│ │ └──────────┴────────┴────────┴────────┴────────┴────────┴────────┘               │  │
│ └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                       │
│ ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│ │ UNASSIGNED CASES (67) — Prioritized by AI Score                                    │  │
│ │ ⚠ EgyptAir Tower    EGP 45K  Score: 89    Days: 78    [Assign]                   │  │
│ │ ⚠ Industrial Zone 3 EGP 28K  Score: 76    Days: 45    [Assign]                   │  │
│ │ ⚠ New Cairo School  EGP 12K  Score: 64    Days: 34    [Assign]                   │  │
│ └──────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

### 8.3 Executive Dashboard (`/admin/collections/executive`)

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ EXECUTIVE COLLECTIONS DASHBOARD                                                         │
│                                                                                       │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │
│ │ Total AR         │ │ Overdue AR       │ │ Collection       │ │ Avg Days to     │  │
│ │ EGP 8.2M         │ │ EGP 3.1M (38%)   │ │ Effectiveness    │ │ Pay             │  │
│ │                  │ │                  │ │       76%        │ │       42 days   │  │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘  │
│                                                                                       │
│ ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│ │ AGING BUCKETS (EGP)                                                                │  │
│ │                                                                                   │  │
│ │ Current    ████████████████████████████████████████████            EGP 5.1M (62%) │  │
│ │ 1-30       ████████████████                                     EGP 1.2M (15%) │  │
│ │ 31-60      ███████████                                           EGP 0.8M (10%) │  │
│ │ 61-90      ██████                                                EGP 0.5M (6%)  │  │
│ │ 91-120     ████                                                  EGP 0.3M (4%)  │  │
│ │ 120+       ███                                                   EGP 0.3M (3%)  │  │
│ │                                                                                   │  │
│ │ Provision Required: EGP 245K │ Already Provided: EGP 200K │ Gap: EGP 45K        │  │
│ └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                       │
│ ┌──────────────────────────────┐ ┌──────────────────────────────────────────────┐    │
│ │ COLLECTION TREND (12 months) │ │ RECOVERY FORECAST (Next Quarter)              │    │
│ │                              │ │                                                 │    │
│ │  Jan ████████ 78%            │ │ Expected Recovery:     EGP 1.8M                │    │
│ │  Feb █████████ 82%           │ │ At Risk:               EGP 0.6M                │    │
│ │  Mar ████████ 76%            │ │ Write-off Forecast:    EGP 0.2M                │    │
│ │  Apr ████████ 79%            │ │ Best Case:             EGP 2.1M                │    │
│ │  May █████████ 84% ▲         │ │ Worst Case:            EGP 1.4M                │    │
│ │  Jun ████████ 80%            │ └──────────────────────────────────────────────┘    │
│ └──────────────────────────────┘                                                      │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 9: INTEGRATION STRATEGY

### 9.1 Integration Points

| Source | Trigger | W04 Action | Timing |
|--------|---------|------------|--------|
| **Invoice** | Status → "overdue" (dueDate passed) | Auto-create CollectionCase | Daily job |
| **Payment** | Status → "completed" | Update case paidAmount, close if fully paid | Immediate |
| **Payment** | Payment allocated to case invoice | Reduce case outstanding | Immediate |
| **W01 GL** | Period-end close | Trigger BadDebtProvision calculation | Monthly |
| **W02 Revenue** | Revenue finding on customer | Flag case — increase priority | Immediate |
| **W03 Tariff** | Tariff change | Recalculate customer risk profile | On change |
| **C12-W07 AI** | AIRecommendation approved | Execute recommended action | On approval |
| **Notifications** | DunningEngine send | Send via Email/SMS/WhatsApp/Push | Per schedule |
| **Audit** | Every collection mutation | Log to AuditEntry | Always |

### 9.2 Auto-Creation of Collection Cases

```
Daily job — CollectionCaseAutoCreator.run():
  1. FIND overdue invoices
     WHERE dueDate < TODAY
     AND status IN ("issued", "partial")
     AND archivedAt IS NULL
  
  2. FOR each invoice:
     EXISTING = CollectionCase.findFirst({ invoiceId })
     IF EXISTING: SKIP (already has case)
     
     customer = Customer.findUnique(invoice.customerId)
     
     profile = CustomerRiskProfile.upsert({ customerId })
     paymentProb = AI_Score.paymentProbability(customerId)
     
     CollectionCase.create({
       customerId: invoice.customerId,
       invoiceId: invoice.id,
       status: "open",
       stage: 0,
       totalAmount: invoice.amount,
       paidAmount: invoice.paidAmount,
       priority: calculatePriority(invoice.amount, paymentProb),
       paymentProbability: paymentProb,
       riskBucket: classifyRisk(paymentProb),
     })
     
     Log: CollectionAction.create({ type: "auto_created", result: "system" })
```

---

## PART 10: TESTING STRATEGY — W04 (105 Tests)

### 10.1 Aging Engine Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Invoice due today → bucket "current" | Current bucket |
| 2 | Invoice due 15 days ago → bucket "30" | Correct bucket |
| 3 | Invoice due 45 days ago → bucket "60" | Correct bucket |
| 4 | Invoice due 90 days ago → bucket "120" | Maximum boundary |
| 5 | Invoice due 150 days ago → bucket "120+" | Beyond maximum |
| 6 | Multi-invoice aging → correct aggregation | Sum across buckets |
| 7 | Partially paid invoice → outstanding only | Correct remaining |
| 8 | Paid invoice → excluded from aging | Filtered |
| 9 | Cancelled invoice → excluded | Filtered |
| 10 | Portfolio aging for area → correct bucket sums | Area filter |

### 10.2 Collection Strategy Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | High probability → SOFT strategy | Correct strategy |
| 2 | Low probability → AGGRESSIVE strategy | Correct strategy |
| 3 | Medium probability → STANDARD strategy | Correct strategy |
| 4 | Open dispute → HARDSHIP strategy | Override |
| 5 | High amount + deep aging → LEGAL strategy | Override |
| 6 | Government customer → SOFT (if high prob) | Segment override |
| 7 | Strategy changes when probability changes | Re-evaluation |
| 8 | No CustomerRiskProfile → default STANDARD | Fallback |

### 10.3 Dunning Engine Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Stage 0 trigger (day 1) → email sent | Auto-dunning fires |
| 2 | Stage 1 trigger (day 7) → SMS+Email sent | Multi-channel |
| 3 | Stage 3 trigger (day 30) → collector assigned | Auto-assignment |
| 4 | Stage 5 trigger (day 60) → field visit | Visit scheduled |
| 5 | Case resolved → no further dunning | Stops |
| 6 | Active installment plan → no dunning | Paused |
| 7 | PTP kept → stage resets | Reset |
| 8 | PTP missed → stage escalates | Escalate |
| 9 | No matching rule for segment → skip | Graceful |
| 10 | Dunning runs on schedule → all evaluated | Batch processing |

### 10.4 PTP Engine Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Create PTP → status "pending" | Correct initial |
| 2 | Fulfill PTP → status "kept", case updated | Success path |
| 3 | Miss PTP → status "missed", case escalates | Failure path |
| 4 | Multiple PTPs on same case → all tracked | History |
| 5 | PTP reminder fires before promisedDate | Auto-reminder |
| 6 | PTP after write-off → rejected | State guard |
| 7 | PTP amount > outstanding → rejected | Validation |

### 10.5 Installment Plan Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Create plan → installments generated | Correct count |
| 2 | Down payment → first installment reduced | Correct split |
| 3 | Installment paid → status "paid" | Success path |
| 4 | Installment missed → plan "defaulted" | Failure path |
| 5 | All installments paid → plan "completed" | Completion |
| 6 | Early payment → remaining installments closed | Early closure |
| 7 | Plan during dispute → allowed | Compatibility |

### 10.6 Dispute Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | Create dispute → status "open" | Correct initial |
| 2 | Resolve dispute → dunning resumes | Integration |
| 3 | Reject dispute → dunning continues | Integration |
| 4 | Multiple disputes same invoice → all tracked | History |
| 5 | Dispute with billing error → correction flow | Correction |

### 10.7 Bad Debt Provision Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | Calculate provision → correct rates applied | Rate match |
| 2 | Provision journal entry posted → GL updated | Integration with W01 |
| 3 | Multiple periods → separate provisions | Per-period |
| 4 | Zero outstanding → zero provision | Empty state |
| 5 | Provision rule changes → recalculated | On change |

### 10.8 Write-Off Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | Request write-off → status "pending" | Initial state |
| 2 | Approve write-off → case closed | Success path |
| 3 | Reject write-off → case continues | Failure path |
| 4 | Approve write-off → journal entry posted | GL integration |
| 5 | Write-off amount > outstanding → rejected | Validation |

### 10.9 AI Agent Tests (5)

| # | Test | Expect |
|---|------|--------|
| 1 | Payment probability 0-1 range | Valid range |
| 2 | Next-best-action relevant to state | Appropriate |
| 3 | Churn prediction factors correct | Explainable |
| 4 | Agent does not auto-execute actions | Governance |
| 5 | Agent recommendations audited | Audit trail |

---

## PART 11: W04 DEFINITION OF DONE

```
W04 — COLLECTION INTELLIGENCE & RECEIVABLES MANAGEMENT ENGINE
CERTIFICATION CHECKLIST

□ CORE DATA MODELS — 8 NEW
   □ CustomerRiskProfile (AI payment behavior)
   □ DunningRule (escalation rules per segment)
   □ InstallmentPlan (payment installment plans)
   □ PlanInstallment (individual installments)
   □ Dispute (invoice/case disputes)
   □ ProvisionRule (bad debt provision rates)
   □ BadDebtProvision (period-end provisions)
   □ WriteOffRequest (write-off approval)
   □ CollectionCase enhanced (+20 new fields)
   □ PromiseToPay enhanced (+5 new fields)

□ AGING ENGINE
   □ Per-customer aging (current, 30, 60, 90, 120, 120+)
   □ Portfolio aging with filters (area, segment, collector)
   □ Aging trend (month-over-month comparison)
   □ Weighted average days overdue

□ COLLECTION STRATEGY
   □ 5 strategies: SOFT, STANDARD, AGGRESSIVE, HARDSHIP, LEGAL
   □ Segment-based strategy selection
   □ Strategy override for disputes/hardship
   □ DunningRule engine (7 escalation stages)

□ AUTOMATED DUNNING
   □ 7-stage escalation pipeline
   □ Multi-channel: Email, SMS, WhatsApp, Push, Call, Letter, Field Visit
   □ Auto-assignment of collectors at stage 3+
   □ PTP creation and tracking
   □ PTP reminders (before promised date)
   □ PTP missed escalation
   □ Configurable per customer segment

□ INSTALLMENT PLANS
   □ Plan creation with down payment
   □ Auto-generated installment schedule
   □ Payment tracking per installment
   □ Default detection and escalation

□ DISPUTE MANAGEMENT
   □ 5 dispute types
   □ Full lifecycle: OPEN → INVESTIGATING → RESOLVED | REJECTED
   □ Evidence collection
   □ Pause dunning during active dispute

□ BAD DEBT PROVISIONING
   ✅ Provision rates per aging bucket
   ✅ Auto-calculation at period end
   ✅ Journal entry creation (via W01 PostingEngine)

□ WRITE-OFF GOVERNANCE
   □ 4-level approval threshold
   □ Write-off journal entry on approval
   □ Recovery tracking post write-off

□ AI COLLECTION INTELLIGENCE AGENT
   □ Payment probability scoring (0.0-1.0)
   □ Next-best-action recommendation
   □ Churn prediction
   □ Revenue recovery forecasting
   □ C12 AIRecommendation integration

□ DASHBOARDS
   □ Collector Workbench (/admin/collections/my-cases)
   □ Supervisor Dashboard (/admin/collections/supervisor)
   □ Executive Dashboard (/admin/collections/executive)

□ INTEGRATIONS
   □ Invoice overdue → auto-create CollectionCase
   □ Payment received → update case
   □ W01 GL → provision journal entry
   □ W02 Revenue → priority flagging
   □ W03 Tariff → risk profile
   □ C12-W07 AI → recommendations + patterns
   □ Notification Center → multi-channel dunning
   □ Audit → every mutation logged

□ SECURITY
   □ RBAC: Collector, Supervisor, Manager, Executive, Auditor
   □ Segregation: collector ≠ supervisor ≠ approver
   □ Write-off multi-level approval
   □ Investigation log append-only
   □ All mutations audited

□ TESTS — 105 PASSING
   □ Aging engine: 15 tests
   □ Collection strategy: 15 tests
   □ Dunning engine: 20 tests
   □ PTP engine: 15 tests
   □ Installment plan: 10 tests
   □ Dispute: 10 tests
   □ Bad debt provision: 10 tests
   □ Write-off: 10 tests
   □ AI agent: 5 tests

W04 STATUS: □ NOT IMPLEMENTED
All items above are DESIGN-COMPLETE but not executed.
```

---

## APPENDIX A: W04 DEPENDENCY GRAPH

```
W01 (Billing-to-GL) ──────────┐
W02 (Revenue Assurance) ──────┤
W03 (Tariff Intelligence) ────┤
Invoice + Payment (existing) ─┤
CollectionCase (existing) ────┤
PromiseToPay (existing) ──────┤
SLA/Escalation (existing) ────┤
Notification Center (exist) ──┤
C12-W07 AI Framework ─────────┤
                               ▼
                    ┌──────────────────────┐
                    │  W04 COLLECTION       │
                    │  INTELLIGENCE ENGINE  │
                    └──────────────────────┘
                          │
                          ├──→ AgingEngine
                          ├──→ DunningEngine
                          ├──→ StrategyEngine
                          ├──→ PTPEngine
                          ├──→ InstallmentEngine
                          ├──→ ProvisionEngine
                          ├──→ WriteOffEngine
                          ├──→ AI Collection Agent
                          ├──→ 3 frontend dashboards
                          └──→ Integration hooks
```

## APPENDIX B: W04 FILE MANIFEST

| # | File | Action | Lines |
|---|------|--------|-------|
| 1 | `backend/prisma/schema.prisma` | MODIFY | +120 lines (8 new models + enhanced fields) |
| 2 | Migration: collection_intelligence | CREATE | Standard |
| 3 | `backend/src/services/aging-engine.js` | **CREATE** | ~150 lines |
| 4 | `backend/src/services/collection-strategy.js` | **CREATE** | ~100 lines |
| 5 | `backend/src/services/dunning-engine.js` | **CREATE** | ~200 lines |
| 6 | `backend/src/services/ptp-engine.js` | **CREATE** | ~120 lines |
| 7 | `backend/src/services/installment-engine.js` | **CREATE** | ~120 lines |
| 8 | `backend/src/services/provision-engine.js` | **CREATE** | ~80 lines |
| 9 | `backend/src/services/write-off-engine.js` | **CREATE** | ~80 lines |
| 10 | `backend/src/services/collection-ai.js` | **CREATE** | ~150 lines |
| 11 | `backend/src/routes/collections.js` | **CREATE** | ~300 lines |
| 12 | `backend/src/services/billing-engine.js` | MODIFY | +5 lines (auto-create case on overdue) |
| 13 | `backend/src/services/posting-engine.js` | MODIFY | +3 lines (provision JE type) |
| 14 | `backend/src/server.js` | MODIFY | +2 lines |
| 15 | `Frontend/src/app/admin/collections/my-cases/page.tsx` | **CREATE** | ~300 lines |
| 16 | `Frontend/src/app/admin/collections/supervisor/page.tsx` | **CREATE** | ~250 lines |
| 17 | `Frontend/src/app/admin/collections/executive/page.tsx` | **CREATE** | ~250 lines |
| 18 | `Frontend/src/app/admin/collections/[id]/page.tsx` | **CREATE** | ~200 lines |

**Total estimated new code:** ~2,500 lines
**Total estimated tests:** 105 tests
**Cumulative C13 (W01-W04):** 85 + 95 + 100 + 105 = 385 tests

---

*This document is a planning artifact only. No code, no implementation, no database migration.*
*C13-W04 — Collection Intelligence & Receivables Management Engine. READ ONLY. GOVERNANCE PLANNING ONLY.*
