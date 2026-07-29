# C13-W01 — Financial Integration Foundation
## Billing-to-GL Enterprise Blueprint

**Version:** 1.0.0  
**Status:** READ ONLY — GOVERNANCE PLANNING ONLY — NOT IMPLEMENTED  
**Date:** 2026-07-29  
**Program:** C13 Enterprise Financial & Billing Intelligence Platform  
**Wave:** W01 (Foundation — connects existing billing → existing accounting engine)

---

## PART 1: CURRENT STATE AUDIT

### 1.1 Existing Invoice Lifecycle

**Status:** Fully implemented with the following state machine:

```
                    ┌──────────┐
                    │  pending │ (initial state after generation)
                    └────┬─────┘
                         │
                    ┌────▼──────┐
                    │pending_   │ (awaiting approval)
                    │ approval  │
                    └────┬──────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
         ┌────▼───┐ ┌───▼────┐ ┌───▼─────┐
         │approved│ │rejected│ │cancelled│
         └────┬───┘ └───┬────┘ └─────────┘
              │         │
         ┌────▼───┐    └──→ back to pending
         │ issued  │
         └────┬───┘
              │
        ┌─────┴──────┐
        │            │
   ┌────▼───┐   ┌────▼───┐
   │  paid   │   │overdue │
   └─────────┘   └────────┘
```

**Current behavior at Issue (integration gap):**
```
POST /invoices/:id/issue
  → updates status to "issued"
  → sets immutableAt (timestamp)
  → returns updated invoice
  ❌ NO journal entry created
  ❌ NO GL posting
  ❌ NO revenue recognition
  ❌ NO period assignment
```

**Current behavior at Cancel (integration gap):**
```
POST /invoices/:id/cancel
  → validates not paid/already cancelled
  → high-risk guard (>10K or overdue → super_admin only)
  → updates status to "cancelled"
  ❌ NO reversal journal entry
  ❌ NO GL reversal
  ❌ NO audit of accounting impact
```

### 1.2 Existing Payment Lifecycle

**Status:** Fully implemented with auto-allocation:

```
Payment Created (POST /payments)
  → uses $transaction:
    → creates Payment record (status: "completed")
    → finds overdue invoices (oldest-first)
    → allocates payment across invoices
    → creates PaymentTransaction per allocation
    → updates Invoice.paidAmount + status ("paid"|"partial")
    → remainder → CustomerLedgerEntry (overpayment)
  ❌ NO journal entry for Cash DR
  ❌ NO journal entry for AR CR
  ❌ NO GL posting
  ❌ NO period assignment

Payment Reversed (POST /payments/:id/reverse)
  → uses $transaction:
    → decrements Invoice.paidAmount for each allocation
    → updates Payment status to "reversed"
  ❌ NO reversal journal for Cash CR
  ❌ NO reversal journal for AR DR
  ❌ NO audit of accounting impact
```

### 1.3 Existing Billing Engine

**Status:** Basic calculation engine in `services/billing-engine.js`:

```
generateInvoice(customerId, periodStart, periodEnd):
  → reads readings for customer's meters in period
  → sums total consumption (kWh)
  → finds active tariff
  → multiplies consumption × rate
  → creates Invoice record
  ❌ NO tarifff intelligence (flat rate only)
  ❌ NO consumption validation
  ❌ NO revenue event creation
```

**Bill Run workflow** in `routes/billing.js`:
```
POST /runs           → creates run
POST /runs/:id/generate → iterates customers + meters → creates invoices
POST /runs/:id/close → marks run complete
POST /runs/:id/cancel → cancels run
```

### 1.4 Existing Meter Reading Validation

**Status:** Basic reading pipeline exists but no pre-billing validation:
- Readings stored with `status: "valid"`
- Bill run uses readings where `status: "valid"`
- No validation that readings are complete
- No estimation rules for missing readings
- No spike/anomaly detection before billing

### 1.5 Existing Tariff Calculation

**Status:** Flat-rate only:
- Tariff model with TariffRate and TariffTier (defined but flat-only in billing engine)
- Simple: `consumption × rate.rate`
- No Time-of-Use, no tiered, no demand charge, no pro-ration

### 1.6 Existing Accounting Engine

**Status:** Fully implemented — the bridge endpoint is missing, not the bridge itself:

| Component | Status | Lines of Code |
|-----------|--------|---------------|
| Account model (hierarchical CoA) | ✅ Complete | ~25 lines |
| Account CRUD routes | ✅ Complete | ~80 lines |
| JournalEntry model | ✅ Complete | ~25 lines |
| JournalEntry routes (create, update, post, reverse) | ✅ Complete | ~250 lines |
| JournalLineItem model | ✅ Complete | ~15 lines |
| GeneralLedgerEntry model + route | ✅ Complete | ~80 lines |
| Trial Balance route | ✅ Complete | ~60 lines |
| FinancialPeriod model | ✅ Complete | ~20 lines |
| FinancialPeriod routes (create, close) | ✅ Complete | ~120 lines |
| Auto-closing entries (period close) | ✅ Complete | ~100 lines |
| Zod validation | ✅ Complete | All routes |
| RBAC enforcement | ✅ Complete | All routes |
| Audit logging | ✅ Complete | All routes |
| Soft delete with guard clauses | ✅ Complete | All routes |

**The accounting engine is ready to receive events from billing. It just has no listener.**

### 1.7 Integration Gap Summary

| Gap | Source | Target | Impact |
|-----|--------|--------|--------|
| Invoice issue → no journal | `invoices.js:146-158` | Accounting engine | Revenue not recorded |
| Payment complete → no journal | `payments.js:18-53` | Accounting engine | Cash not recorded in GL |
| Invoice cancel → no reversal | `billing.js:124-145` | Accounting engine | Revenue overstated |
| Payment reverse → no reversal | `payments.js:55-77` | Accounting engine | Cash overstated |
| Invoice adjustment → no journal | `invoices.js:179-206` | Accounting engine | AR not adjusted |
| No period assignment on invoices | Invoice model | FinancialPeriod | Cannot reconcile by period |
| No revenue recognition date | Invoice model | RevenueTransaction | Accrual tracking missing |
| No account mapping config | None | CoA | Unknown which accounts to post to |

---

## PART 2: BILLING-TO-GL ARCHITECTURE

### 2.1 End-to-End Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                       BILLING-TO-GL PIPELINE (W01 Scope)                              │
│                                                                                       │
│  METER READING                                                                       │
│       │                                                                              │
│       ▼                                                                              │
│  CONSUMPTION CALCULATION                                                             │
│       │                                                                              │
│       ▼                                                                              │
│  INVOICE GENERATION  ──→  Invoice record created (status: pending)                  │
│       │                                                                              │
│       ▼                                                                              │
│  INVOICE APPROVAL WORKFLOW                                                           │
│       │  pending → pending_approval → approved                                       │
│       ▼                                                                              │
│  INVOICE ISSUE                                                                       │
│       │                                                                              │
│       ├──→ 1. Update invoice status to "issued"                                     │
│       ├──→ 2. Assign invoice to OPEN FinancialPeriod                                │
│       ├──→ 3. CREATE FinancialEvent (INVOICE_ISSUED)                                │
│       └──→ 4. CREATE + POST Journal Entry via PostingEngine                        │
│               │                                                                      │
│               ├──→ DR: Accounts Receivable (account 1201-XX)                        │
│               ├──→ CR: Revenue - Service (account 4001-XX)                          │
│               └──→ [If tax: CR: Tax Payable (2101-XX)]                              │
│                       │                                                              │
│                       ▼                                                              │
│                  GENERAL LEDGER                                                      │
│                   (GeneralLedgerEntry updated: opening + activity = closing)          │
│                       │                                                              │
│                       ▼                                                              │
│                  FINANCIAL REPORTS                                                    │
│                   (P&L includes revenue, BS includes AR)                             │
│                                                                                       │
│                                                                                       │
│  PAYMENT RECEIVED                                                                     │
│       │                                                                              │
│       ├──→ 1. Allocate to invoices (existing logic)                                  │
│       ├──→ 2. Assign payment to OPEN FinancialPeriod                                │
│       ├──→ 3. CREATE FinancialEvent (PAYMENT_RECEIVED)                              │
│       └──→ 4. CREATE + POST Journal Entry via PostingEngine                        │
│               │                                                                      │
│               ├──→ DR: Bank/Cash (account 1001-XX)                                  │
│               ├──→ CR: Accounts Receivable (account 1201-XX)                        │
│               └──→ [If gateway fee: DR: Bank Charges (5105-XX)]                     │
│                                                                                       │
│                                                                                       │
│  INVOICE CANCELLED / ADJUSTED / REGENERATED                                          │
│       │                                                                              │
│       ├──→ 1. CREATE FinancialEvent (INVOICE_CANCELLED)                             │
│       ├──→ 2. CREATE reversal Journal Entry via PostingEngine                       │
│       │       (negated amounts, references original entry)                           │
│       └──→ 3. POST reversal entry                                                   │
│                                                                                       │
│                                                                                       │
│  PAYMENT REVERSED / REFUNDED                                                         │
│       │                                                                              │
│       ├──→ 1. CREATE FinancialEvent (PAYMENT_REVERSED)                              │
│       ├──→ 2. CREATE reversal Journal Entry via PostingEngine                       │
│       │       (negated amounts, references original entry)                           │
│       └──→ 3. POST reversal entry                                                   │
│                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Event Types

| Event Type | Source | Trigger | Journal Impact |
|------------|--------|---------|----------------|
| `INVOICE_ISSUED` | Invoice Issue | Status → "issued" | DR: AR, CR: Revenue |
| `INVOICE_CANCELLED` | Invoice Cancel | Status → "cancelled" | Full reversal of original |
| `INVOICE_ADJUSTED` | Invoice Adjustment | New InvoiceItem created | DR/CR: AR, CR/DR: Revenue/Expense |
| `INVOICE_REGENERATED` | Invoice Regenerate | Old cancelled, new created | Reversal + new entry |
| `PAYMENT_RECEIVED` | Payment Create | Payment completed | DR: Cash, CR: AR |
| `PAYMENT_REVERSED` | Payment Reverse | Status → "reversed" | Full reversal of original |
| `PAYMENT_REFUNDED` | Payment Refund | Refund processed | DR: Expense, CR: Cash |

### 2.3 Posting Rules

| Rule | Description | Enforcement |
|------|-------------|-------------|
| **PR-001** | Every FinancialEvent creates exactly one balanced JournalEntry | Application rule in PostingEngine |
| **PR-002** | Total debits MUST equal total credits (tolerance: 0.001) | Zod validation on JournalEntry lines |
| **PR-003** | Journal entries MUST reference source event | FinancialEvent.eventId stored as JournalEntry.source → referenceId |
| **PR-004** | Period must be OPEN at time of posting | Route-level check against FinancialPeriod.status |
| **PR-005** | Reversal entries must reference original JournalEntry number | `referenceId`, `referenceType: "REVERSAL"` |
| **PR-006** | Reversal amounts must be the exact negation of original | Engine computes from original lines |
| **PR-007** | DRAFT entries can be modified; POSTED entries are immutable | Application guard |
| **PR-008** | POSTED entries can only be modified via reversal | Separate reversal flow |
| **PR-009** | Every posting is audited to AuditEntry | Middleware auditLog() |

### 2.4 Journal Generation Rules

| Business Event | Account Mapping Strategy | Line Generation |
|----------------|------------------------|-----------------|
| Invoice Issued (Water) | DR: AR-Water (1201-01), CR: Revenue-Water (4001-01) | Amount = invoice.amount |
| Invoice Issued (Electric) | DR: AR-Electric (1201-02), CR: Revenue-Electric (4001-02) | Amount = invoice.amount |
| Invoice Issued (Gas) | DR: AR-Gas (1201-03), CR: Revenue-Gas (4001-03) | Amount = invoice.amount |
| Invoice with Tax | Same + CR: Tax Payable (2101-01) | Amount = invoice.taxAmount |
| Payment Received (Cash) | DR: Cash (1001-01), CR: AR (1201-XX) | Amount = payment.amount |
| Payment Received (Bank Transfer) | DR: Bank-Current (1002-01), CR: AR (1201-XX) | Amount = payment.amount |
| Payment with Gateway Fee | DR: Bank (net), DR: Bank Charges (5105-01), CR: AR (full) | net = amount - fee |
| Invoice Cancelled | Full reversal of original posting | Copied with debit/credit swapped |
| Payment Reversed | Full reversal of original posting | Copied with debit/credit swapped |
| Invoice Adjustment (Credit) | DR: Revenue, CR: AR | Amount = adjustment.amount |
| Invoice Adjustment (Surcharge) | DR: AR, CR: Revenue | Amount = adjustment.amount |

### 2.5 Error Handling

| Scenario | Detection | Recovery |
|----------|-----------|----------|
| Period not OPEN for posting | Route checks FinancialPeriod.status | Return 400: "Financial period is not OPEN. Current: [status]" |
| Journal unbalanced | Zod validation fails (debit ≠ credit) | Return 400: "Total debits must equal total credits" with amounts |
| Account not found/deactivated | Prisma FK constraint | Return 400: "Account [id] not found or inactive" |
| Duplicate source event | Unique constraint on FinancialEvent.sourceType + sourceId | Return 409: "Financial event already exists for this source" |
| Reversal on non-POSTED entry | Route checks JournalEntry.status | Return 400: "Only POSTED entries can be reversed" |
| Reversal already done | Route checks JournalEntry.reversedAt | Return 400: "Entry has already been reversed" |
| Account has no mapping rule | AccountMapping table lookup | Return 500: "No account mapping found for transaction type [type]" |
| Database transaction failure | Prisma $transaction rollback | Full rollback — no partial postings |
| FinancialPeriod missing for date | Lookup by year/month | Auto-create period if within configured range, else error |

### 2.6 Reconciliation Process

**Daily:**
```
1. Sum all JournalEntries created today
2. Group by source (INVOICE, PAYMENT)
3. Compare invoice total vs revenue journal total
4. Compare payment total vs cash journal total
5. Flag any discrepancy > 0.01
6. Log reconciliation result to AuditEntry
```

**Monthly (at Period Close):**
```
1. Verify every invoice in period has matching JournalEntry
2. Verify every payment in period has matching JournalEntry
3. Verify every cancellation has matching reversal JournalEntry
4. Verify every reversal has matching original JournalEntry
5. Run Trial Balance — must balance
6. Compare AR account balance vs sum of unpaid invoices
7. Compare Revenue account balance vs sum of issued invoices
8. Lock period (prevent new postings)
```

---

## PART 3: FINANCIAL EVENT MODEL DESIGN

### 3.1 FinancialEvent (New Entity)

**Purpose:** Record every billing/payment event that has accounting impact. Acts as the integration contract between billing and accounting domains.

**Status:** ❌ Not built — NEW model for W01

```
FinancialEvent
├── id: String (UUID, PK)
├── sourceType: String            ← INVOICE | PAYMENT | ADJUSTMENT | REVERSAL
├── sourceId: String              ← FK to the source record (Invoice.id, Payment.id)
├── eventType: String             ← INVOICE_ISSUED | PAYMENT_RECEIVED | etc.
├── periodId: String              ← FK → FinancialPeriod (assigned at event creation)
├── period: FinancialPeriod       ← Relation
├── journalEntryId: String?       ← FK → JournalEntry (set after posting)
├── journalEntry: JournalEntry?   ← Relation
├── amount: Float                 ← Total amount of the event (always positive)
├── currency: String              ← Default "EGP"
├── description: String           ← Human-readable description
├── metadata: String?             ← JSON blob for additional context (tariff breakdown, meter IDs, etc.)
├── status: String                ← PENDING | POSTED | FAILED
│   Default: "PENDING"
├── postedAt: DateTime?           ← When the journal was posted
├── errorMessage: String?         ← If POSTING_FAILED, why
├── createdAt: DateTime           ← When event was created
└── archivedAt: DateTime?         ← Soft delete

Indexes:
  @@unique([sourceType, sourceId])  ← One event per source action
  @@index([periodId, status])
  @@index([eventType, createdAt])
  @@index([journalEntryId])
```

### 3.2 Event Lifecycle

```
SOURCE ACTION (Invoice issued, Payment received, etc.)
       │
       ▼
┌──────────────────┐
│ 1. FinancialEvent│
│    CREATED        │
│    status: PENDING│
│    periodId: set  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 2. PostingEngine │
│    run            │
│    - validate     │
│    - map accounts │
│    - create JE    │
│    - post JE      │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│ SUCCESS│ │  FAILURE  │
│ status:│ │ status:   │
│ POSTED │ │ FAILED    │
│ JE ref │ │ errorMsg  │
│ set    │ │           │
└───┬────┘ └──────────┘
    │
    ▼
┌──────────────────┐
│ 3. Audit Logged  │
│    + GL updated   │
└──────────────────┘
```

### 3.3 Event Types (Detailed)

| Event | Source | Trigger Condition | Period Assignment | Posting Action |
|-------|--------|-------------------|-------------------|----------------|
| `INVOICE_ISSUED` | Invoice.id | `invoice.status → "issued"` | invoice.issuedAt → find OPEN period | Create + post revenue + AR journal |
| `PAYMENT_RECEIVED` | Payment.id | `payment.status → "completed"` | payment.paidAt → find OPEN period | Create + post cash + AR journal |
| `PAYMENT_ALLOCATED` | PaymentTransaction.id | PaymentTransaction created | Same as parent payment | No separate entry (included in PAYMENT_RECEIVED) |
| `INVOICE_ADJUSTED` | Invoice.id | New InvoiceItem added to issued invoice | adjustment createdAt → find OPEN period | Create + post AR + revenue adjustment |
| `INVOICE_CANCELLED` | Invoice.id | `invoice.status → "cancelled"` | cancellation timestamp → find OPEN period | Create reversal of original invoice JE |
| `PAYMENT_REVERSED` | Payment.id | `payment.status → "reversed"` | reversal timestamp → find OPEN period | Create reversal of original payment JE |
| `PAYMENT_REFUNDED` | Payment.id | Refund processed | refund timestamp → find OPEN period | Create expense + cash journal |
| `WRITE_OFF_CREATED` | CollectionCase.id | Write-off approved | write-off timestamp → find OPEN period | Create bad debt expense + AR reduction |
| `PERIOD_CLOSED` | FinancialPeriod.id | `period.status → "CLOSED"` | Period itself | Already handled by existing period close logic |

### 3.4 Audit Requirements

Every FinancialEvent must:
1. Be logged to AuditEntry on creation (action: `financial.event.created`)
2. Be logged to AuditEntry on posting (action: `financial.event.posted` or `financial.event.failed`)
3. Carry the original request's correlationId
4. Be immutable after POSTED status (status changes only from PENDING → POSTED or PENDING → FAILED)
5. Support full traceability: Invoice/Payment ID → FinancialEvent ID → JournalEntry ID → GeneralLedgerEntry

### 3.5 Period Assignment Strategy

```
On FinancialEvent creation:
  sourceTimestamp = event's business timestamp
    (invoice.issuedAt for INVOICE_ISSUED,
     payment.paidAt for PAYMENT_RECEIVED,
     etc.)
  
  period = FinancialPeriod.findFirst({
    where: {
      startDate: { lte: sourceTimestamp },
      endDate: { gte: sourceTimestamp },
      status: "OPEN",
      archivedAt: null,
    }
  })
  
  if (!period) → ERROR: "No open financial period for {sourceTimestamp}"
  if (period.status !== "OPEN") → ERROR: "Financial period {period.year}-{period.month} is not OPEN"
  if (period.archivedAt) → ERROR: "Financial period {period.id} is archived"
  
  FinancialEvent.periodId = period.id
```

---

## PART 4: ACCOUNT MAPPING FRAMEWORK

### 4.1 AccountMapping Model (New)

**Purpose:** Define which accounts are debited/credited for each business transaction type. Enables configurable account mapping without code changes.

**Status:** ❌ Not built — NEW model for W01

```
AccountMapping
├── id: String (UUID, PK)
├── name: String                    ← Human-readable name
├── transactionType: String         ← INVOICE_ISSUED | PAYMENT_RECEIVED | etc.
├── debitAccountId: String          ← FK → Account (default DR account)
├── debitAccount: Account           ← Relation
├── creditAccountId: String         ← FK → Account (default CR account)
├── creditAccount: Account          ← Relation
├── condition: String?              ← Optional JSON condition for overrides
├── priority: Int                   ← Lower = higher priority
├── active: Boolean                 ← Default true
├── effectiveFrom: DateTime
├── effectiveTo: DateTime?
├── createdBy: String?
└── audit: createdAt, archivedAt, updatedAt

Indexes:
  @@index([transactionType, active])
```

### 4.2 Base Account Mappings

These mappings define the default accounting treatment for each business transaction. They follow standard utility accounting practice (SAP IS-U aligned).

| Transaction Type | Debit Account | Credit Account | When |
|-----------------|---------------|----------------|------|
| **INVOICE_ISSUED (Water)** | 1201-01 — Customer Receivables — Water | 4001-01 — Revenue — Water Service | Invoice issued for water consumption |
| **INVOICE_ISSUED (Electric)** | 1201-02 — Customer Receivables — Electric | 4001-02 — Revenue — Electric Service | Invoice issued for electric consumption |
| **INVOICE_ISSUED (Gas)** | 1201-03 — Customer Receivables — Gas | 4001-03 — Revenue — Gas Service | Invoice issued for gas consumption |
| **INVOICE_TAX** | 1201-01 — Customer Receivables — Water (included in total) | 2101-01 — Tax Payable — VAT | Tax portion of invoice |
| **PAYMENT_RECEIVED (Cash)** | 1001-01 — Cash on Hand | 1201-XX — Customer Receivables (matching AR account) | Payment received in cash |
| **PAYMENT_RECEIVED (Bank)** | 1002-01 — Bank — Current Account | 1201-XX — Customer Receivables (matching AR account) | Payment received via bank transfer |
| **PAYMENT_RECEIVED (Card)** | 1003-01 — Bank — Card Settlement | 1201-XX — Customer Receivables (matching AR account) | Payment received via card |
| **PAYMENT_GATEWAY_FEE** | 5105-01 — Bank Charges & Fees | 1003-01 — Bank — Card Settlement | Gateway fee deducted from settlement |
| **INVOICE_CANCELLED** | 4001-XX — Revenue (reversal) | 1201-XX — Customer Receivables (reversal) | Full reversal of original invoice |
| **PAYMENT_REVERSED** | 1201-XX — Customer Receivables (reversal) | 100X-XX — Bank/Cash (reversal) | Full reversal of original payment |
| **INVOICE_ADJUSTMENT (Credit)** | 4001-XX — Revenue (decrease) | 1201-XX — Customer Receivables (decrease) | Credit note to customer |
| **INVOICE_ADJUSTMENT (Surcharge)** | 1201-XX — Customer Receivables (increase) | 4001-XX — Revenue (increase) | Additional charge |
| **WRITE_OFF** | 6101-01 — Bad Debt Expense | 1201-XX — Customer Receivables | Uncollectible debt write-off |
| **REFUND** | 6102-01 — Customer Refunds | 100X-XX — Bank/Cash | Refund to customer |

### 4.3 Account Mapping Resolution Algorithm

```
function resolveAccountMapping(transactionType, context):
  1. Find all ACTIVE AccountMappings for transactionType
     ordered by priority ASC
  
  2. For each mapping:
     a. If mapping has no condition → use as base mapping (lowest priority)
     b. If mapping has condition, evaluate against context:
        - context = { customerType, utilityType, areaId, projectId, amount }
        - condition = { "field": "utilityType", "op": "eq", "value": "WATER" }
     c. If condition matches → use this mapping (higher priority)
  
  3. If no mapping found → ERROR: "No account mapping for {transactionType}"
  
  4. Return { debitAccountId, creditAccountId }
```

### 4.4 Suggested Chart of Accounts (New Accounts)

The existing Account model supports hierarchical CoA but needs seed data for standard utility accounts. These are the minimum accounts required for billing-to-GL integration:

| Code | Name | Type | Parent | Description |
|------|------|------|--------|-------------|
| 1000 | Current Assets | ASSET | — | Root asset account |
| 1001 | Cash on Hand | ASSET | 1000 | Physical cash |
| 1002 | Bank Accounts | ASSET | 1000 | Bank current accounts |
| 1002-01 | Bank — Current Account (NBE) | ASSET | 1002 | National Bank of Egypt |
| 1003 | Bank — Card Settlement | ASSET | 1000 | Card payment settlement account |
| 1200 | Accounts Receivable | ASSET | 1000 | Customer receivables root |
| 1201-01 | AR — Water Customers | ASSET | 1200 | Water utility receivables |
| 1201-02 | AR — Electric Customers | ASSET | 1200 | Electric utility receivables |
| 1201-03 | AR — Gas Customers | ASSET | 1200 | Gas utility receivables |
| 2100 | Current Liabilities | LIABILITY | — | Root liability account |
| 2101-01 | Tax Payable — VAT | LIABILITY | 2100 | VAT collected from customers |
| 3000 | Equity | EQUITY | — | Root equity account |
| 3001 | Retained Earnings | EQUITY | 3000 | Accumulated earnings (used by period close) |
| 4000 | Revenue | REVENUE | — | Root revenue account |
| 4001-01 | Revenue — Water Service | REVENUE | 4000 | Water utility revenue |
| 4001-02 | Revenue — Electric Service | REVENUE | 4000 | Electric utility revenue |
| 4001-03 | Revenue — Gas Service | REVENUE | 4000 | Gas utility revenue |
| 5000 | Operating Expenses | EXPENSE | — | Root expense account |
| 5105-01 | Bank Charges & Fees | EXPENSE | 5000 | Payment gateway/processing fees |
| 6101-01 | Bad Debt Expense | EXPENSE | 5000 | Write-off expenses |
| 6102-01 | Customer Refunds | EXPENSE | 5000 | Refunds to customers |

**Seeding Strategy:**
```
W01 implementation includes a seed script that creates these accounts
if they don't already exist. The script is idempotent (checks code uniqueness).
```

---

## PART 5: POSTING ENGINE GOVERNANCE

### 5.1 PostingEngine Design

The PostingEngine is the central service that converts FinancialEvents into JournalEntries. It lives in `services/posting-engine.js`.

**Input:** FinancialEvent
**Output:** JournalEntry (status: POSTED) + GeneralLedgerEntry updates

**Algorithm:**
```
async function postEvent(event):
  1. BEGIN transaction
  
  2. VALIDATE event:
     - event.status must be "PENDING"
     - event.period.status must be "OPEN"
     - No existing JournalEntry for this event (guard)
  
  3. RESOLVE account mapping:
     mapping = resolveAccountMapping(event.eventType, context)
  
  4. BUILD journal lines:
     lines = [
       { accountId: mapping.debitAccountId, debitAmount: event.amount, creditAmount: 0 },
       { accountId: mapping.creditAccountId, debitAmount: 0, creditAmount: event.amount },
     ]
     (Add tax line if applicable)
  
  5. GENERATE entry number:
     entryNumber = "JE-{YYYYMM}-{NNNN}"
  
  6. CREATE JournalEntry (DRAFT):
     entry = JournalEntry.create({
       entryNumber,
       description: event.description,
       entryDate: event.createdAt,
       periodId: event.periodId,
       source: event.eventType,
       referenceId: event.sourceId,
       referenceType: event.sourceType,
       totalDebit,
       totalCredit,
       createdBy: system,
       status: "DRAFT",
     })
     Create JournalLineItems for each line
  
  7. POST the entry:
     — Update status to "POSTED"
     — Update postedAt
     — Upsert GeneralLedgerEntry for each account
       (existing logic from accounting.js posting route)
  
  8. UPDATE event:
     — status = "POSTED"
     — journalEntryId = entry.id
     — postedAt = now
  
  9. COMMIT transaction
  
  10. AUDIT:
      auditLog("financial.event.posted", { eventId, entryId, entryNumber })
  
  11. RETURN entry
```

**Error Recovery:**
- If step 3 fails (no mapping) → event.status = "FAILED", errorMessage set, return error
- If step 4 fails (unbalanced) → event.status = "FAILED", errorMessage set, return error
- If step 5 fails (entry number collision) → retry with next sequence number
- If step 6-8 fails → transaction ROLLBACK — no partial state
- If step 10 fails (audit) → warning logged, but entry is already posted

### 5.2 Posting Approval Workflow

The existing accounting engine already supports DRAFT → POSTED with separate roles. The PostingEngine can be configured in two modes:

**Mode 1: Auto-Post (default for W01)**
```
FinancialEvent CREATED
  → PostingEngine.postEvent() called synchronously
  → JournalEntry created and immediately POSTED
  → Event status = "POSTED"
  → No human approval needed (system-level posting)
  
Use case: Standard invoice issue, payment receipt
Governance: Audit trail captures every auto-posting
```

**Mode 2: Draft-Review-Post (for sensitive events)**
```
FinancialEvent CREATED
  → PostingEngine.createDraftEvent() called
  → JournalEntry created with status "DRAFT"
  → Human reviewer checks the entry
  → Reviewer approves → entry is posted
  → Event status = "POSTED"
  
Use case: Write-offs, large adjustments, manual corrections
Governance: Segregation of duties enforced
```

**Mode selection is determined by:**
```
if (event.amount > config.autoPostThreshold) → use Mode 2
if (event.eventType in config.reviewRequiredEvents) → use Mode 2
else → use Mode 1

config.autoPostThreshold = 100,000 EGP (configurable)
config.reviewRequiredEvents = ["WRITE_OFF_CREATED", "INVOICE_CANCELLED"]
```

### 5.3 Governance Rules Summary

| Rule | ID | Enforcement | Mode |
|------|----|-------------|------|
| No unbalanced journal | GOV-001 | JournalEntry route + PostingEngine | All |
| No posting into CLOSED period | GOV-002 | Period status check in PostingEngine | All |
| Every posting has source reference | GOV-003 | FinancialEvent.journalEntryId + referenceId | All |
| Every correction creates reversal | GOV-004 | PostingEngine reversal flow | All |
| POSTED journals are immutable | GOV-005 | Application guard in route | All |
| Reversal references original | GOV-006 | referenceId + referenceType enforced | All |
| Auto-post for standard events | GOV-007 | PostingEngine auto-posting | Mode 1 |
| Review required for high-risk events | GOV-008 | Mode 2 with human approval | Mode 2 |
| System-level postings are audited | GOV-009 | AuditEntry on every posting | All |
| PostingEngine is idempotent | GOV-010 | Unique constraint on (sourceType, sourceId) | All |

### 5.4 Correction Workflow

```
ERROR DISCOVERED (wrong amount, wrong account, duplicate)
       │
       ▼
┌──────────────────────────────────────────────┐
│ 1. Identify error                            │
│    - Which invoice/payment?                  │
│    - Which FinancialEvent?                   │
│    - Which JournalEntry?                     │
│    - What is the correct state?              │
└──────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ 2. Create Corrective Event                   │
│    - If invoice was wrongly issued:          │
│      Cancel original → new FinancialEvent    │
│      PostingEngine reverses original JE      │
│    - If invoice amount wrong:                │
│      Create adjustment → new FinancialEvent  │
│      PostingEngine creates correction JE     │
│    - If payment wrongly allocated:           │
│      Reverse payment → new FinancialEvent    │
│      PostingEngine reverses original JE      │
└──────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│ 3. Verify                                    │
│    - Trial Balance still balances            │
│    - AR account = sum of unpaid invoices     │
│    - Revenue account correct for period      │
│    - Audit trail shows all corrections       │
└──────────────────────────────────────────────┘
```

---

## PART 6: RECONCILIATION FRAMEWORK

### 6.1 Reconciliation Layers

```
Layer 1: Transaction — Per-event reconciliation
  Every FinancialEvent has a matching JournalEntry
  Every JournalEntry references back to source event
  → Verified at creation time (GOV-003)

Layer 2: Period — Aggregate reconciliation
  Monthly (at period close):
  ┌─────────────────────────────────────────────────────────────────┐
  │ RECONCILIATION CHECKLIST                                        │
  │                                                                 │
  │ □ 1. Sum of all Invoice amounts in period                      │
  │    = Sum of Revenue journal entries for period                  │
  │    (allowing for cancellations and adjustments)                 │
  │                                                                 │
  │ □ 2. Sum of all Payment amounts in period                      │
  │    = Sum of Cash journal entries for period                     │
  │    (allowing for reversals and refunds)                         │
  │                                                                 │
  │ □ 3. AR account closing balance                                │
  │    = Sum of all unpaid Invoice amounts                          │
  │    (where status in: issued, overdue, partial)                 │
  │                                                                 │
  │ □ 4. Total Credits = Total Debits in Trial Balance             │
  │                                                                 │
  │ □ 5. Revenue account balance                                   │
  │    = Sum of issued invoices - sum of cancelled invoices        │
  │                                                                 │
  │ □ 6. Cash/Bank account balance                                 │
  │    = Sum of payments received - sum of refunds                 │
  └─────────────────────────────────────────────────────────────────┘

Layer 3: System — Automated daily check
  A scheduled job runs every 24 hours:
  1. Count FinancialEvents with status = PENDING (unposted)
  2. Flag any event PENDING > 1 hour (stuck in posting)
  3. Compare daily invoice total vs daily revenue journal total
  4. Compare daily payment total vs daily cash journal total
  5. Alert if any discrepancy > automated threshold
```

### 6.2 Exception Handling

| Exception | Detection | Resolution |
|-----------|-----------|------------|
| Posting failed (FinancialEvent FAILED) | Event.status = "FAILED" | Read errorMessage, fix root cause, retry via admin UI |
| Journal entry unbalanced | PostingEngine validation | Reject event, log error, alert accounting team |
| Period not found | No OPEN period for timestamp | Create FinancialPeriod or adjust event date |
| Account mapping missing | resolveAccountMapping returns empty | Add AccountMapping record |
| Duplicate event | Unique constraint violation | Reject — event already processed |
| Period closed but event backdated | Period.status = "CLOSED" | Create correcting entry in current period |
| Auto-posting failed | Transaction rollback | Event remains PENDING, retry mechanism picks it up |

### 6.3 Reconciliation Report (per Period Close)

```
┌────────────────────────────────────────────────────────────────────┐
│  PERIOD RECONCILIATION REPORT                                       │
│  Period: 2026-07 (July 2026)                                        │
│  Generated: 2026-08-01 00:00:00                                     │
│                                                                      │
│  INVOICES:                                                          │
│    Total invoiced:          1,250,000.00 EGP                         │
│    Total cancelled:           -25,000.00 EGP                         │
│    Net invoiced:            1,225,000.00 EGP                         │
│                                                                      │
│  REVENUE JOURNAL:                                                    │
│    Total DR (AR):           1,225,000.00 EGP                         │
│    Total CR (Revenue):      1,225,000.00 EGP                         │
│    ✅ Balanced: YES                                                  │
│    ✅ Matches net invoiced: YES                                      │
│                                                                      │
│  PAYMENTS:                                                           │
│    Total received:            875,000.00 EGP                         │
│    Total reversed:            -12,000.00 EGP                         │
│    Net received:              863,000.00 EGP                         │
│                                                                      │
│  CASH JOURNAL:                                                       │
│    Total DR (Cash):           863,000.00 EGP                         │
│    Total CR (AR):             863,000.00 EGP                         │
│    ✅ Balanced: YES                                                  │
│    ✅ Matches net received: YES                                      │
│                                                                      │
│  AR BALANCE:                                                         │
│    GL account 1201 closing:    362,000.00 EGP                        │
│    Unpaid invoices total:       362,000.00 EGP                        │
│    ✅ Reconciled: YES                                                │
│                                                                      │
│  STATUS: ✅ RECONCILED                                               │
└────────────────────────────────────────────────────────────────────┘
```

---

## PART 7: SECURITY & GOVERNANCE

### 7.1 Role-Based Access Control

The existing RBAC system from C12 will be extended with financial-specific permissions.

| Role | Permissions | Can View | Can Create | Can Approve | Can Post |
|------|-------------|----------|------------|-------------|----------|
| **Billing Operator** | billing.* | Invoice, Payment, BillRun | Invoice, BillRun | ❌ | ❌ |
| **Accountant** | accounting.*, financial-event.view | All financial data | Journal Entry (DRAFT) | ❌ | ❌ |
| **Finance Reviewer** | accounting.journal.approve, financial-event.* | All financial data | ❌ | Journal Entry ✅ | ❌ |
| **Finance Admin** | accounting.*, financial-event.* | All financial data | All | All | All |
| **Auditor** | audit.view, financial-event.view, accounting.reports.* | Read-only all | ❌ | ❌ | ❌ |

### 7.2 Segregation of Duties

**Create ≠ Approve ≠ Post** — enforced at route level:

| Operation | Billing Operator | Accountant | Finance Reviewer | Finance Admin |
|-----------|:----------------:|:----------:|:----------------:|:-------------:|
| Create Invoice | ✅ | ❌ | ❌ | ✅ |
| Issue Invoice | ✅ | ❌ | ❌ | ✅ |
| Create Payment | ✅ | ❌ | ❌ | ✅ |
| Reverse Payment | ❌ | ❌ | ✅ | ✅ |
| Cancel Invoice | ❌ | ❌ | ✅ | ✅ |
| Create Journal | ❌ | ✅ | ❌ | ✅ |
| Post Journal | ❌ | ❌ | ✅ | ✅ |
| Reverse Journal | ❌ | ❌ | ✅ | ✅ |
| Close Period | ❌ | ❌ | ❌ | ✅ |
| Override Period | ❌ | ❌ | ❌ | ✅ (CFO only) |

### 7.3 Security Controls

| Control | Mechanism | Implementation |
|---------|-----------|----------------|
| Financial event access scoped by area | areaId on Invoice/Payment → filtered by user area | Prisma where clause in route |
| Journal entry immutability after POSTED | Status guard in route | accounting.js route check |
| Period lock after close | Period status check | accounting.js period check |
| No hard delete on any financial record | archivedAt pattern | All models |
| Every financial mutation audited | auditLog() middleware | All routes |
| Sensitive amount display limited | Role-based field filtering | Middleware |
| PostingEngine idempotency | Unique (sourceType, sourceId) | DB constraint |
| API rate limiting on financial endpoints | express-rate-limit | Existing middleware |

---

## PART 8: TESTING STRATEGY — W01 (85 Tests)

### 8.1 Invoice Posting Tests (20)

| # | Test | Expected | 
|---|------|----------|
| 1 | Issue invoice → FinancialEvent INVOICE_ISSUED created | Event status PENDING |
| 2 | Issue invoice → JournalEntry auto-created + posted | Entry status POSTED |
| 3 | Issue invoice → DR: AR, CR: Revenue correct amounts | Lines match invoice.amount |
| 4 | Issue invoice → GeneralLedgerEntry updated | GL balance changes correctly |
| 5 | Issue invoice → period assigned correctly | Period matches invoice.issuedAt |
| 6 | Issue multiple invoices → multiple separate JEs | 1:1 mapping |
| 7 | Issue invoice with tax → CR: Tax Payable included | Tax line exists |
| 8 | Cancel invoice → FinancialEvent INVOICE_CANCELLED | Event created |
| 9 | Cancel invoice → reversal JE created + posted | Reversal references original |
| 10 | Cancel invoice → GL balances reversed | AR/Revenue back to pre-issue |
| 11 | Cancel non-existent invoice → 404 | Proper error |
| 12 | Cancel already cancelled invoice → 400 | Proper error |
| 13 | Cancel paid invoice → 400 | Proper error |
| 14 | Adjust issued invoice → FinancialEvent INVOICE_ADJUSTED | Event created |
| 15 | Adjust invoice → correction JE created | Amount matches adjustment |
| 16 | Re-generate invoice → cancel old + create new | Both events generated |
| 17 | Issue invoice in CLOSED period → error | Period check blocks |
| 18 | Issue invoice with no OPEN period → error | No period found |
| 19 | Issue invoice → audit log created | AuditEntry has action |
| 20 | Issue invoice → correlationId traced | Audit chain complete |

### 8.2 Payment Posting Tests (20)

| # | Test | Expected |
|---|------|----------|
| 1 | Receive payment → FinancialEvent PAYMENT_RECEIVED created | Event status PENDING |
| 2 | Receive payment → JournalEntry auto-created + posted | Entry status POSTED |
| 3 | Receive payment → DR: Cash, CR: AR correct amounts | Lines match payment.amount |
| 4 | Receive payment → AR GL balance decreases | GL updated |
| 5 | Receive payment → Cash GL balance increases | GL updated |
| 6 | Pay with gateway fee → fee line created | DR: Bank Charges included |
| 7 | Pay full invoice → invoice status = "paid" | Existing + new JE |
| 8 | Pay partial invoice → invoice status = "partial" | Existing + new JE |
| 9 | Reverse payment → FinancialEvent PAYMENT_REVERSED | Event created |
| 10 | Reverse payment → reversal JE created + posted | References original |
| 11 | Reverse payment → AR balance increases back | GL restored |
| 12 | Reverse payment → Cash balance decreases | GL restored |
| 13 | Reverse non-existent payment → 404 | Proper error |
| 14 | Reverse already reversed payment → 400 | Proper error |
| 15 | Refund payment → FinancialEvent PAYMENT_REFUNDED | Event created |
| 16 | Refund payment → expense + cash JE | DR: Refund Expense, CR: Cash |
| 17 | Pay in CLOSED period → error | Period check blocks |
| 18 | Pay with no OPEN period → error | No period found |
| 19 | Pay → audit log created with amounts | AuditEntry has action |
| 20 | Pay → correlationId traced | Audit chain complete |

### 8.3 Journal Balancing Tests (15)

| # | Test | Expected |
|---|------|----------|
| 1 | PostingEngine ensures debit = credit | Always balanced |
| 2 | Debit total mismatches credit by 0.001 → error | Validation catches |
| 3 | Debit total mismatches credit by 0.01 → error | Validation catches |
| 4 | Debit total mismatches credit by 1000 → error | Validation catches |
| 5 | Single-line journal (only DR) → error | Invalid |
| 6 | Single-line journal (only CR) → error | Invalid |
| 7 | Multi-line journal (many DR, many CR) → balanced | Passes |
| 8 | Three-line journal (2 DR, 1 CR) → balanced | Passes |
| 9 | Reversal auto-computes negated amounts | Balances |
| 10 | Reversal of multi-line entry → all lines negated | Balances |
| 11 | Entry with zero amount → error | Validation |
| 12 | Entry with negative amounts → error | Zod rejects |
| 13 | Entry with 500 lines → passes | Max limit OK |
| 14 | Entry with 501 lines → error | Max limit exceeded |
| 15 | Duplicate line accounts → still balances | Passes |

### 8.4 Period Lock Tests (10)

| # | Test | Expected |
|---|------|----------|
| 1 | Post to OPEN period → passes | Period accepted |
| 2 | Post to CLOSED period → blocked | Error returned |
| 3 | Close period with posted entries → passes | Close succeeds |
| 4 | Close period with DRAFT entries → blocked | Error returned |
| 5 | Close period with no entries → passes | Close succeeds |
| 6 | Re-open closed period → admin only | Guard enforced |
| 7 | Create period for existing year/month → 409 | Duplicate blocked |
| 8 | FinancialEvent auto-assigns correct period | Date-based match |
| 9 | Event at period boundary → assigned to correct period | Edge case |
| 10 | Event with no matching period → clear error | Error message |

### 8.5 Reversal Tests (10)

| # | Test | Expected |
|---|------|----------|
| 1 | Reverse POSTED entry → reversal created | New entry with negated lines |
| 2 | Reverse POSTED entry → original marked reversed | reversedAt set |
| 3 | Reversal auto-posts | Reversal status = POSTED |
| 4 | Reverse DRAFT entry → error | Only POSTED reversible |
| 5 | Reverse already reversed entry → error | reversedAt check |
| 6 | Reverse non-existent entry → 404 | Proper error |
| 7 | Reversal GL impact = original negated | GL restored |
| 8 | Reversal references original entry number | referenceId set |
| 9 | Original entry number visible in reversal description | Description contains "Reversal of JE-..." |
| 10 | Multiple reversals of same entry blocked | Guard |

### 8.6 Audit Trace Tests (5)

| # | Test | Expected |
|---|------|----------|
| 1 | Complete trace: Invoice → FinancialEvent → JE → GL | All links present |
| 2 | Complete trace: Payment → FinancialEvent → JE → GL | All links present |
| 3 | Complete trace: Cancellation → FinancialEvent → reversal JE → GL | All links present |
| 4 | FinancialEvent has correlationId from originating request | Traceable |
| 5 | AuditEntry captures every financial event creation + posting | Two entries per event |

### 8.7 Reconciliation Tests (5)

| # | Test | Expected |
|---|------|----------|
| 1 | Invoice total = Revenue journal total for period | Match |
| 2 | Payment total = Cash journal total for period | Match |
| 3 | AR GL balance = Sum of unpaid invoices | Match |
| 4 | Trial Balance balances after all postings | Balanced |
| 5 | Reconciliation report generates (mock data) | All checks pass or fail clearly |

---

## PART 9: W01 IMPLEMENTATION ARCHITECTURE

### 9.1 Files to Create vs Modify

**NEW files (4):**
| File | Purpose |
|------|---------|
| `backend/prisma/migrations/W01_financial_integration/` | Migration: FinancialEvent + AccountMapping models + fields on Invoice/Payment |
| `backend/src/services/posting-engine.js` | Central PostingEngine service (event→journal) |
| `backend/src/routes/financial-events.js` | FinancialEvent CRUD + monitoring routes |
| `backend/src/services/account-mapping.js` | AccountMapping resolution service |

**MODIFIED files (5):**
| File | Change |
|------|--------|
| `backend/prisma/schema.prisma` | Add FinancialEvent + AccountMapping models, Invoice.periodId, Payment.periodId |
| `backend/src/routes/invoices.js` | INJECT posting: after `status → "issued"`, call PostingEngine.postEvent() |
| `backend/src/routes/payments.js` | INJECT posting: after payment completed, call PostingEngine.postEvent() |
| `backend/src/routes/billing.js` | INJECT reversal: on invoice cancel, create FinancialEvent + call reversal |
| `backend/src/server.js` | Register financial-events route |

### 9.2 Integration Point — Invoice Issue (invoices.js)

**Current (line 146-158):**
```javascript
router.post("/:id/issue", ..., async (req, res, next) => {
  const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } })
  if (!invoice) return res.status(404).json({ error: "Invoice not found" })
  if (invoice.immutableAt) return res.status(400).json({ error: "Invoice already issued" })
  const issued = await prisma.invoice.update({
    where: { id: req.params.id },
    data: { status: "issued", issuedAt: new Date(), immutableAt: new Date() },
  })
  auditLog(req, "invoice.issued", { invoiceId: invoice.id, number: invoice.number })
  res.json({ invoice: issued })
})
```

**After W01:**
```javascript
router.post("/:id/issue", ..., async (req, res, next) => {
  // ... existing validation ...
  const issued = await prisma.$transaction(async (tx) => {
    const inv = await tx.invoice.update({
      where: { id: req.params.id },
      data: { status: "issued", issuedAt: new Date(), immutableAt: new Date() },
    })
    // W01: Create + post financial event
    await postingEngine.postEvent({
      sourceType: "INVOICE",
      sourceId: inv.id,
      eventType: "INVOICE_ISSUED",
      amount: inv.amount,
      description: `Invoice ${inv.number} issued - ${inv.amount} EGP`,
      metadata: { customerId: inv.customerId, areaId: inv.areaId },
      tx,
    })
    return inv
  })
  auditLog(req, "invoice.issued", { invoiceId: issued.id, number: issued.number })
  res.json({ invoice: issued })
})
```

### 9.3 Integration Point — Payment Create (payments.js)

**Current (line 18-53):**
Creates payment, allocates to invoices, handles overpayment. All in `$transaction`.

**After W01:** Inject `postingEngine.postEvent()` inside the same transaction, after allocation loop.

```javascript
await postingEngine.postEvent({
  sourceType: "PAYMENT",
  sourceId: p.id,
  eventType: "PAYMENT_RECEIVED",
  amount: data.amount,
  description: `Payment ${p.id} - ${data.amount} EGP from customer ${data.customerId}`,
  metadata: { customerId: data.customerId, method: data.method },
  tx,
})
```

### 9.4 Integration Point — Invoice Cancel (billing.js)

**Current (line 124-145):**
Sets status to "cancelled", creates history entry.

**After W01:** Create FinancialEvent INVOICE_CANCELLED → PostingEngine creates reversal.

### 9.5 FinancialEvent Model (Prisma)

```prisma
model FinancialEvent {
  id              String          @id @default(uuid())
  sourceType      String          // INVOICE | PAYMENT
  sourceId        String          // FK to source record
  eventType       String          // INVOICE_ISSUED | PAYMENT_RECEIVED | etc.
  periodId        String
  period          FinancialPeriod @relation(fields: [periodId], references: [id])
  journalEntryId  String?         // Set after successful posting
  journalEntry    JournalEntry?   @relation(fields: [journalEntryId], references: [id])
  amount          Float
  currency        String          @default("EGP")
  description     String
  metadata        String?         // JSON
  status          String          @default("PENDING")  // PENDING | POSTED | FAILED
  postedAt        DateTime?
  errorMessage    String?
  createdAt       DateTime        @default(now())
  archivedAt      DateTime?

  @@unique([sourceType, sourceId])
  @@index([periodId, status])
  @@index([eventType, createdAt])
  @@index([journalEntryId])
}
```

### 9.6 AccountMapping Model (Prisma)

```prisma
model AccountMapping {
  id                String      @id @default(uuid())
  name              String
  transactionType   String      // INVOICE_ISSUED | PAYMENT_RECEIVED | etc.
  debitAccountId    String
  debitAccount      Account     @relation("DebitAccount", fields: [debitAccountId], references: [id])
  creditAccountId   String
  creditAccount     Account     @relation("CreditAccount", fields: [creditAccountId], references: [id])
  condition         String?     // JSON: { field, op, value }
  priority          Int         @default(100)
  active            Boolean     @default(true)
  effectiveFrom     DateTime
  effectiveTo       DateTime?
  createdBy         String?
  createdAt         DateTime    @default(now())
  archivedAt        DateTime?

  @@index([transactionType, active])
}
```

### 9.7 Invoice/Payment Enhancements

```prisma
// Add to Invoice model:
  periodId          String?     // FK → FinancialPeriod
  period            FinancialPeriod? @relation(fields: [periodId], references: [id])

// Add to Payment model:
  periodId          String?     // FK → FinancialPeriod
  period            FinancialPeriod? @relation(fields: [periodId], references: [id])
```

---

## PART 10: W01 DEFINITION OF DONE

```
W01 — FINANCIAL INTEGRATION FOUNDATION
CERTIFICATION CHECKLIST
═════════════════════════════════════════════════════

□ FINANCIAL EVENT MODEL
   □ FinancialEvent Prisma model created with all fields
   □ FinancialEvent migrations applied
   □ FinancialEvent CRUD routes operational
   □ FinancialEvent unique constraint on (sourceType, sourceId)
   □ FinancialEvent status lifecycle: PENDING → POSTED | FAILED

□ ACCOUNT MAPPING
   □ AccountMapping Prisma model created
   □ AccountMapping CRUD routes operational
   □ Seed AccountMapping records for base transaction types:
     - INVOICE_ISSUED (Water/Electric/Gas)
     - PAYMENT_RECEIVED (Cash/Bank/Card)
     - INVOICE_CANCELLED
     - PAYMENT_REVERSED
     - INVOICE_ADJUSTED
   □ AccountMapping resolution service operational
   □ Condition-based mapping (utility type) operational

□ POSTING ENGINE
   □ PostingEngine service created
   □ postEvent() creates FinancialEvent + JournalEntry
   □ Debit = credit enforced on every posting
   □ Period OPEN check before posting
   □ Auto-post or draft-review-post mode selectable
   □ Idempotency guard (no duplicate postings)
   □ Error handling: no partial state (transaction rollback)
   □ Reversal flow: creates negated JournalEntry

□ INVOICE ISSUE INTEGRATION
   □ Invoice issue → FinancialEvent.created
   □ FinancialEvent → PostingEngine.postEvent()
   □ JournalEntry: DR: AR, CR: Revenue (amount = invoice.amount)
   □ GeneralLedgerEntry updated for both accounts
   □ Invoice.periodId set to matched FinancialPeriod
   □ Existing invoice functionality preserved
   □ Error handling: invoice issued but no journal = FAILED event

□ PAYMENT CREATE INTEGRATION
   □ Payment create → FinancialEvent.created
   □ FinancialEvent → PostingEngine.postEvent()
   □ JournalEntry: DR: Cash, CR: AR (amount = payment.amount)
   □ GeneralLedgerEntry updated for both accounts
   □ Payment.periodId set to matched FinancialPeriod
   □ Gateway fee handling: separate fee line in journal
   □ Existing payment allocation preserved

□ INVOICE CANCEL INTEGRATION
   □ Invoice cancel → FinancialEvent INVOICE_CANCELLED
   → PostingEngine creates reversal JournalEntry
   □ Reversal references original JournalEntry
   □ GL balances reversed to pre-issue state
   □ High-risk guard (amount > 10K or overdue) preserved

□ PAYMENT REVERSE INTEGRATION
   □ Payment reverse → FinancialEvent PAYMENT_REVERSED
   → PostingEngine creates reversal JournalEntry
   □ Reversal references original JournalEntry
   □ GL balances restored

□ FINANCIAL PERIOD ASSIGNMENT
   □ Invoice issue → period auto-assigned by issuedAt date
   □ Payment complete → period auto-assigned by paidAt date
   □ No OPEN period → clear error message
   □ CLOSED period → blocked with error message

□ AUDIT & GOVERNANCE
   □ Every FinancialEvent creation logged to AuditEntry
   □ Every FinancialEvent posting logged to AuditEntry
   □ Every FinancialEvent failure logged to AuditEntry
   □ Correlation ID propagated from request → event → journal
   □ RBAC permissions for financial-event.* routes
   □ Segregation of duties: create ≠ post

□ RECONCILIATION
   □ Daily reconciliation job definition
   □ Monthly reconciliation checklist
   □ AR balance vs unpaid invoices comparison query
   □ Trial Balance verification after all postings

□ DATA INTEGRITY
   □ Seed script for Chart of Accounts (if not exist)
   □ Seed script for AccountMappings (base types)
   □ Migration rollback script defined
   □ Feature flag to toggle auto-posting

□ TESTS — 85 PASSING
   □ Invoice posting: 20 tests
   □ Payment posting: 20 tests
   □ Journal balancing: 15 tests
   □ Period locking: 10 tests
   □ Reversal: 10 tests
   □ Audit trace: 5 tests
   □ Reconciliation: 5 tests

═════════════════════════════════════════════════════
W01 STATUS: □ NOT IMPLEMENTED
All items above are DESIGN-COMPLETE but not executed.
═════════════════════════════════════════════════════
```

---

## APPENDIX A: W01 FILE MANIFEST

| # | File | Action | Lines (est.) |
|---|------|--------|--------------|
| 1 | `backend/prisma/schema.prisma` | MODIFY | +60 lines (FinancialEvent, AccountMapping, Invoice.periodId, Payment.periodId) |
| 2 | `backend/prisma/migrations/*_financial_integration/` | CREATE | Migration file |
| 3 | `backend/src/services/posting-engine.js` | **CREATE** | ~200 lines (core service) |
| 4 | `backend/src/services/account-mapping.js` | **CREATE** | ~80 lines (mapping resolution) |
| 5 | `backend/src/routes/financial-events.js` | **CREATE** | ~150 lines (CRUD + monitoring) |
| 6 | `backend/src/routes/invoices.js` | MODIFY | +15 lines (posting hook after issue) |
| 7 | `backend/src/routes/payments.js` | MODIFY | +15 lines (posting hook after create) |
| 8 | `backend/src/routes/billing.js` | MODIFY | +15 lines (posting hook after cancel) |
| 9 | `backend/src/server.js` | MODIFY | +2 lines (route registration) |
| 10 | `backend/scripts/seed-financial-accounts.js` | **CREATE** | ~60 lines (chart of accounts + mappings) |
| 11 | `backend/src/services/reconciliation.js` | **CREATE** | ~100 lines (daily check, period report) |

**Total estimated new code:** ~700 lines
**Total estimated tests:** 85 tests

## APPENDIX B: W01 DEPENDENCY GRAPH

```
schema.prisma (add FinancialEvent + AccountMapping)
    │
    ├──→ Migration
    │
    ├──→ posting-engine.js ──→ account-mapping.js
    │         │
    │         ├──→ invoices.js (hook after issue)
    │         ├──→ payments.js (hook after create)
    │         └──→ billing.js (hook after cancel)
    │
    ├──→ financial-events.js (CRUD + monitoring routes)
    │
    ├──→ seed-financial-accounts.js (idempotent)
    │
    └──→ reconciliation.js (scheduled + period-end)
```

## APPENDIX C: ROLLBACK STRATEGY

| Scenario | Rollback Action |
|----------|-----------------|
| PostingEngine has a bug | Disable auto-posting via feature flag → revert to current state (no GL impact) |
| Account mapping is wrong | Update AccountMapping records (no code change needed) |
| FinancialEvent gets stuck in PENDING | Admin retry UI → repost failed events |
| Migration causes DB issues | `prisma migrate down` → removes FinancialEvent + AccountMapping tables |
| Wrong account seed data | Delete accounts manually via API (soft delete with guard) |
| Posting causes GL imbalance | Manual reversal of posted entries via existing accounting routes |

**Feature flag:**
```javascript
// config/feature-flags.js
{
  "financialAutoPosting": { enabled: false, description: "Toggle billing-to-GL auto-posting" }
}
// When disabled, FinancialEvents are still created with status PENDING
// but PostingEngine does not auto-post — admin must manually trigger
```

---

*This document is a planning artifact only. No code, no implementation, no database migration.*
*C13-W01 — Financial Integration Foundation. READ ONLY. GOVERNANCE PLANNING ONLY.*
