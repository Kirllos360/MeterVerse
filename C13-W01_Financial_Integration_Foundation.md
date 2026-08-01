<!-- Status Block
====================================================================
Design: [x] Complete | Implementation: [ ] Not Started | Certification: [ ] Not Certified | Wave: W2 | Commit: e625819d
====================================================================
-->

# C13-W01 â€” Financial Integration Foundation
## Billing-to-GL Enterprise Blueprint

**Version:** 1.0.0  
**Status:** READ ONLY â€” GOVERNANCE PLANNING ONLY â€” NOT IMPLEMENTED  
**Date:** 2026-07-29  
**Program:** C13 Enterprise Financial & Billing Intelligence Platform  
**Wave:** W01 (Foundation â€” connects existing billing â†’ existing accounting engine)

---

## PART 1: CURRENT STATE AUDIT

### 1.1 Existing Invoice Lifecycle

**Status:** Fully implemented with the following state machine:

```
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚  pending â”‚ (initial state after generation)
                    â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜
                         â”‚
                    â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”
                    â”‚pending_   â”‚ (awaiting approval)
                    â”‚ approval  â”‚
                    â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜
                         â”‚
              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
              â”‚          â”‚          â”‚
         â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â” â”Œâ”€â”€â”€â–¼â”€â”€â”€â”€â” â”Œâ”€â”€â”€â–¼â”€â”€â”€â”€â”€â”
         â”‚approvedâ”‚ â”‚rejectedâ”‚ â”‚cancelledâ”‚
         â””â”€â”€â”€â”€â”¬â”€â”€â”€â”˜ â””â”€â”€â”€â”¬â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
              â”‚         â”‚
         â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”    â””â”€â”€â†’ back to pending
         â”‚ issued  â”‚
         â””â”€â”€â”€â”€â”¬â”€â”€â”€â”˜
              â”‚
        â”Œâ”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”
        â”‚            â”‚
   â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”
   â”‚  paid   â”‚   â”‚overdue â”‚
   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Current behavior at Issue (integration gap):**
```
POST /invoices/:id/issue
  â†’ updates status to "issued"
  â†’ sets immutableAt (timestamp)
  â†’ returns updated invoice
  âŒ NO journal entry created
  âŒ NO GL posting
  âŒ NO revenue recognition
  âŒ NO period assignment
```

**Current behavior at Cancel (integration gap):**
```
POST /invoices/:id/cancel
  â†’ validates not paid/already cancelled
  â†’ high-risk guard (>10K or overdue â†’ super_admin only)
  â†’ updates status to "cancelled"
  âŒ NO reversal journal entry
  âŒ NO GL reversal
  âŒ NO audit of accounting impact
```

### 1.2 Existing Payment Lifecycle

**Status:** Fully implemented with auto-allocation:

```
Payment Created (POST /payments)
  â†’ uses $transaction:
    â†’ creates Payment record (status: "completed")
    â†’ finds overdue invoices (oldest-first)
    â†’ allocates payment across invoices
    â†’ creates PaymentTransaction per allocation
    â†’ updates Invoice.paidAmount + status ("paid"|"partial")
    â†’ remainder â†’ CustomerLedgerEntry (overpayment)
  âŒ NO journal entry for Cash DR
  âŒ NO journal entry for AR CR
  âŒ NO GL posting
  âŒ NO period assignment

Payment Reversed (POST /payments/:id/reverse)
  â†’ uses $transaction:
    â†’ decrements Invoice.paidAmount for each allocation
    â†’ updates Payment status to "reversed"
  âŒ NO reversal journal for Cash CR
  âŒ NO reversal journal for AR DR
  âŒ NO audit of accounting impact
```

### 1.3 Existing Billing Engine

**Status:** Basic calculation engine in `services/billing-engine.js`:

```
generateInvoice(customerId, periodStart, periodEnd):
  â†’ reads readings for customer's meters in period
  â†’ sums total consumption (kWh)
  â†’ finds active tariff
  â†’ multiplies consumption Ã— rate
  â†’ creates Invoice record
  âŒ NO tarifff intelligence (flat rate only)
  âŒ NO consumption validation
  âŒ NO revenue event creation
```

**Bill Run workflow** in `routes/billing.js`:
```
POST /runs           â†’ creates run
POST /runs/:id/generate â†’ iterates customers + meters â†’ creates invoices
POST /runs/:id/close â†’ marks run complete
POST /runs/:id/cancel â†’ cancels run
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
- Simple: `consumption Ã— rate.rate`
- No Time-of-Use, no tiered, no demand charge, no pro-ration

### 1.6 Existing Accounting Engine

**Status:** Fully implemented â€” the bridge endpoint is missing, not the bridge itself:

| Component | Status | Lines of Code |
|-----------|--------|---------------|
| Account model (hierarchical CoA) | âœ… Complete | ~25 lines |
| Account CRUD routes | âœ… Complete | ~80 lines |
| JournalEntry model | âœ… Complete | ~25 lines |
| JournalEntry routes (create, update, post, reverse) | âœ… Complete | ~250 lines |
| JournalLineItem model | âœ… Complete | ~15 lines |
| GeneralLedgerEntry model + route | âœ… Complete | ~80 lines |
| Trial Balance route | âœ… Complete | ~60 lines |
| FinancialPeriod model | âœ… Complete | ~20 lines |
| FinancialPeriod routes (create, close) | âœ… Complete | ~120 lines |
| Auto-closing entries (period close) | âœ… Complete | ~100 lines |
| Zod validation | âœ… Complete | All routes |
| RBAC enforcement | âœ… Complete | All routes |
| Audit logging | âœ… Complete | All routes |
| Soft delete with guard clauses | âœ… Complete | All routes |

**The accounting engine is ready to receive events from billing. It just has no listener.**

### 1.7 Integration Gap Summary

| Gap | Source | Target | Impact |
|-----|--------|--------|--------|
| Invoice issue â†’ no journal | `invoices.js:146-158` | Accounting engine | Revenue not recorded |
| Payment complete â†’ no journal | `payments.js:18-53` | Accounting engine | Cash not recorded in GL |
| Invoice cancel â†’ no reversal | `billing.js:124-145` | Accounting engine | Revenue overstated |
| Payment reverse â†’ no reversal | `payments.js:55-77` | Accounting engine | Cash overstated |
| Invoice adjustment â†’ no journal | `invoices.js:179-206` | Accounting engine | AR not adjusted |
| No period assignment on invoices | Invoice model | FinancialPeriod | Cannot reconcile by period |
| No revenue recognition date | Invoice model | RevenueTransaction | Accrual tracking missing |
| No account mapping config | None | CoA | Unknown which accounts to post to |

---

## PART 2: BILLING-TO-GL ARCHITECTURE

### 2.1 End-to-End Data Flow

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                       BILLING-TO-GL PIPELINE (W01 Scope)                              â”‚
â”‚                                                                                       â”‚
â”‚  METER READING                                                                       â”‚
â”‚       â”‚                                                                              â”‚
â”‚       â–¼                                                                              â”‚
â”‚  CONSUMPTION CALCULATION                                                             â”‚
â”‚       â”‚                                                                              â”‚
â”‚       â–¼                                                                              â”‚
â”‚  INVOICE GENERATION  â”€â”€â†’  Invoice record created (status: pending)                  â”‚
â”‚       â”‚                                                                              â”‚
â”‚       â–¼                                                                              â”‚
â”‚  INVOICE APPROVAL WORKFLOW                                                           â”‚
â”‚       â”‚  pending â†’ pending_approval â†’ approved                                       â”‚
â”‚       â–¼                                                                              â”‚
â”‚  INVOICE ISSUE                                                                       â”‚
â”‚       â”‚                                                                              â”‚
â”‚       â”œâ”€â”€â†’ 1. Update invoice status to "issued"                                     â”‚
â”‚       â”œâ”€â”€â†’ 2. Assign invoice to OPEN FinancialPeriod                                â”‚
â”‚       â”œâ”€â”€â†’ 3. CREATE FinancialEvent (INVOICE_ISSUED)                                â”‚
â”‚       â””â”€â”€â†’ 4. CREATE + POST Journal Entry via PostingEngine                        â”‚
â”‚               â”‚                                                                      â”‚
â”‚               â”œâ”€â”€â†’ DR: Accounts Receivable (account 1201-XX)                        â”‚
â”‚               â”œâ”€â”€â†’ CR: Revenue - Service (account 4001-XX)                          â”‚
â”‚               â””â”€â”€â†’ [If tax: CR: Tax Payable (2101-XX)]                              â”‚
â”‚                       â”‚                                                              â”‚
â”‚                       â–¼                                                              â”‚
â”‚                  GENERAL LEDGER                                                      â”‚
â”‚                   (GeneralLedgerEntry updated: opening + activity = closing)          â”‚
â”‚                       â”‚                                                              â”‚
â”‚                       â–¼                                                              â”‚
â”‚                  FINANCIAL REPORTS                                                    â”‚
â”‚                   (P&L includes revenue, BS includes AR)                             â”‚
â”‚                                                                                       â”‚
â”‚                                                                                       â”‚
â”‚  PAYMENT RECEIVED                                                                     â”‚
â”‚       â”‚                                                                              â”‚
â”‚       â”œâ”€â”€â†’ 1. Allocate to invoices (existing logic)                                  â”‚
â”‚       â”œâ”€â”€â†’ 2. Assign payment to OPEN FinancialPeriod                                â”‚
â”‚       â”œâ”€â”€â†’ 3. CREATE FinancialEvent (PAYMENT_RECEIVED)                              â”‚
â”‚       â””â”€â”€â†’ 4. CREATE + POST Journal Entry via PostingEngine                        â”‚
â”‚               â”‚                                                                      â”‚
â”‚               â”œâ”€â”€â†’ DR: Bank/Cash (account 1001-XX)                                  â”‚
â”‚               â”œâ”€â”€â†’ CR: Accounts Receivable (account 1201-XX)                        â”‚
â”‚               â””â”€â”€â†’ [If gateway fee: DR: Bank Charges (5105-XX)]                     â”‚
â”‚                                                                                       â”‚
â”‚                                                                                       â”‚
â”‚  INVOICE CANCELLED / ADJUSTED / REGENERATED                                          â”‚
â”‚       â”‚                                                                              â”‚
â”‚       â”œâ”€â”€â†’ 1. CREATE FinancialEvent (INVOICE_CANCELLED)                             â”‚
â”‚       â”œâ”€â”€â†’ 2. CREATE reversal Journal Entry via PostingEngine                       â”‚
â”‚       â”‚       (negated amounts, references original entry)                           â”‚
â”‚       â””â”€â”€â†’ 3. POST reversal entry                                                   â”‚
â”‚                                                                                       â”‚
â”‚                                                                                       â”‚
â”‚  PAYMENT REVERSED / REFUNDED                                                         â”‚
â”‚       â”‚                                                                              â”‚
â”‚       â”œâ”€â”€â†’ 1. CREATE FinancialEvent (PAYMENT_REVERSED)                              â”‚
â”‚       â”œâ”€â”€â†’ 2. CREATE reversal Journal Entry via PostingEngine                       â”‚
â”‚       â”‚       (negated amounts, references original entry)                           â”‚
â”‚       â””â”€â”€â†’ 3. POST reversal entry                                                   â”‚
â”‚                                                                                       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.2 Event Types

| Event Type | Source | Trigger | Journal Impact |
|------------|--------|---------|----------------|
| `INVOICE_ISSUED` | Invoice Issue | Status â†’ "issued" | DR: AR, CR: Revenue |
| `INVOICE_CANCELLED` | Invoice Cancel | Status â†’ "cancelled" | Full reversal of original |
| `INVOICE_ADJUSTED` | Invoice Adjustment | New InvoiceItem created | DR/CR: AR, CR/DR: Revenue/Expense |
| `INVOICE_REGENERATED` | Invoice Regenerate | Old cancelled, new created | Reversal + new entry |
| `PAYMENT_RECEIVED` | Payment Create | Payment completed | DR: Cash, CR: AR |
| `PAYMENT_REVERSED` | Payment Reverse | Status â†’ "reversed" | Full reversal of original |
| `PAYMENT_REFUNDED` | Payment Refund | Refund processed | DR: Expense, CR: Cash |

### 2.3 Posting Rules

| Rule | Description | Enforcement |
|------|-------------|-------------|
| **PR-001** | Every FinancialEvent creates exactly one balanced JournalEntry | Application rule in PostingEngine |
| **PR-002** | Total debits MUST equal total credits (tolerance: 0.001) | Zod validation on JournalEntry lines |
| **PR-003** | Journal entries MUST reference source event | FinancialEvent.eventId stored as JournalEntry.source â†’ referenceId |
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
| Journal unbalanced | Zod validation fails (debit â‰  credit) | Return 400: "Total debits must equal total credits" with amounts |
| Account not found/deactivated | Prisma FK constraint | Return 400: "Account [id] not found or inactive" |
| Duplicate source event | Unique constraint on FinancialEvent.sourceType + sourceId | Return 409: "Financial event already exists for this source" |
| Reversal on non-POSTED entry | Route checks JournalEntry.status | Return 400: "Only POSTED entries can be reversed" |
| Reversal already done | Route checks JournalEntry.reversedAt | Return 400: "Entry has already been reversed" |
| Account has no mapping rule | AccountMapping table lookup | Return 500: "No account mapping found for transaction type [type]" |
| Database transaction failure | Prisma $transaction rollback | Full rollback â€” no partial postings |
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
5. Run Trial Balance â€” must balance
6. Compare AR account balance vs sum of unpaid invoices
7. Compare Revenue account balance vs sum of issued invoices
8. Lock period (prevent new postings)
```

---

## PART 3: FINANCIAL EVENT MODEL DESIGN

### 3.1 FinancialEvent (New Entity)

**Purpose:** Record every billing/payment event that has accounting impact. Acts as the integration contract between billing and accounting domains.

**Status:** âŒ Not built â€” NEW model for W01

```
FinancialEvent
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ sourceType: String            â† INVOICE | PAYMENT | ADJUSTMENT | REVERSAL
â”œâ”€â”€ sourceId: String              â† FK to the source record (Invoice.id, Payment.id)
â”œâ”€â”€ eventType: String             â† INVOICE_ISSUED | PAYMENT_RECEIVED | etc.
â”œâ”€â”€ periodId: String              â† FK â†’ FinancialPeriod (assigned at event creation)
â”œâ”€â”€ period: FinancialPeriod       â† Relation
â”œâ”€â”€ journalEntryId: String?       â† FK â†’ JournalEntry (set after posting)
â”œâ”€â”€ journalEntry: JournalEntry?   â† Relation
â”œâ”€â”€ amount: Float                 â† Total amount of the event (always positive)
â”œâ”€â”€ currency: String              â† Default "EGP"
â”œâ”€â”€ description: String           â† Human-readable description
â”œâ”€â”€ metadata: String?             â† JSON blob for additional context (tariff breakdown, meter IDs, etc.)
â”œâ”€â”€ status: String                â† PENDING | POSTED | FAILED
â”‚   Default: "PENDING"
â”œâ”€â”€ postedAt: DateTime?           â† When the journal was posted
â”œâ”€â”€ errorMessage: String?         â† If POSTING_FAILED, why
â”œâ”€â”€ createdAt: DateTime           â† When event was created
â””â”€â”€ archivedAt: DateTime?         â† Soft delete

Indexes:
  @@unique([sourceType, sourceId])  â† One event per source action
  @@index([periodId, status])
  @@index([eventType, createdAt])
  @@index([journalEntryId])
```

### 3.2 Event Lifecycle

```
SOURCE ACTION (Invoice issued, Payment received, etc.)
       â”‚
       â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ 1. FinancialEventâ”‚
â”‚    CREATED        â”‚
â”‚    status: PENDINGâ”‚
â”‚    periodId: set  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚
         â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ 2. PostingEngine â”‚
â”‚    run            â”‚
â”‚    - validate     â”‚
â”‚    - map accounts â”‚
â”‚    - create JE    â”‚
â”‚    - post JE      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚
    â”Œâ”€â”€â”€â”€â”´â”€â”€â”€â”€â”
    â”‚         â”‚
    â–¼         â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ SUCCESSâ”‚ â”‚  FAILURE  â”‚
â”‚ status:â”‚ â”‚ status:   â”‚
â”‚ POSTED â”‚ â”‚ FAILED    â”‚
â”‚ JE ref â”‚ â”‚ errorMsg  â”‚
â”‚ set    â”‚ â”‚           â”‚
â””â”€â”€â”€â”¬â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
    â”‚
    â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ 3. Audit Logged  â”‚
â”‚    + GL updated   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 3.3 Event Types (Detailed)

| Event | Source | Trigger Condition | Period Assignment | Posting Action |
|-------|--------|-------------------|-------------------|----------------|
| `INVOICE_ISSUED` | Invoice.id | `invoice.status â†’ "issued"` | invoice.issuedAt â†’ find OPEN period | Create + post revenue + AR journal |
| `PAYMENT_RECEIVED` | Payment.id | `payment.status â†’ "completed"` | payment.paidAt â†’ find OPEN period | Create + post cash + AR journal |
| `PAYMENT_ALLOCATED` | PaymentTransaction.id | PaymentTransaction created | Same as parent payment | No separate entry (included in PAYMENT_RECEIVED) |
| `INVOICE_ADJUSTED` | Invoice.id | New InvoiceItem added to issued invoice | adjustment createdAt â†’ find OPEN period | Create + post AR + revenue adjustment |
| `INVOICE_CANCELLED` | Invoice.id | `invoice.status â†’ "cancelled"` | cancellation timestamp â†’ find OPEN period | Create reversal of original invoice JE |
| `PAYMENT_REVERSED` | Payment.id | `payment.status â†’ "reversed"` | reversal timestamp â†’ find OPEN period | Create reversal of original payment JE |
| `PAYMENT_REFUNDED` | Payment.id | Refund processed | refund timestamp â†’ find OPEN period | Create expense + cash journal |
| `WRITE_OFF_CREATED` | CollectionCase.id | Write-off approved | write-off timestamp â†’ find OPEN period | Create bad debt expense + AR reduction |
| `PERIOD_CLOSED` | FinancialPeriod.id | `period.status â†’ "CLOSED"` | Period itself | Already handled by existing period close logic |

### 3.4 Audit Requirements

Every FinancialEvent must:
1. Be logged to AuditEntry on creation (action: `financial.event.created`)
2. Be logged to AuditEntry on posting (action: `financial.event.posted` or `financial.event.failed`)
3. Carry the original request's correlationId
4. Be immutable after POSTED status (status changes only from PENDING â†’ POSTED or PENDING â†’ FAILED)
5. Support full traceability: Invoice/Payment ID â†’ FinancialEvent ID â†’ JournalEntry ID â†’ GeneralLedgerEntry

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
  
  if (!period) â†’ ERROR: "No open financial period for {sourceTimestamp}"
  if (period.status !== "OPEN") â†’ ERROR: "Financial period {period.year}-{period.month} is not OPEN"
  if (period.archivedAt) â†’ ERROR: "Financial period {period.id} is archived"
  
  FinancialEvent.periodId = period.id
```

---

## PART 4: ACCOUNT MAPPING FRAMEWORK

### 4.1 AccountMapping Model (New)

**Purpose:** Define which accounts are debited/credited for each business transaction type. Enables configurable account mapping without code changes.

**Status:** âŒ Not built â€” NEW model for W01

```
AccountMapping
â”œâ”€â”€ id: String (UUID, PK)
â”œâ”€â”€ name: String                    â† Human-readable name
â”œâ”€â”€ transactionType: String         â† INVOICE_ISSUED | PAYMENT_RECEIVED | etc.
â”œâ”€â”€ debitAccountId: String          â† FK â†’ Account (default DR account)
â”œâ”€â”€ debitAccount: Account           â† Relation
â”œâ”€â”€ creditAccountId: String         â† FK â†’ Account (default CR account)
â”œâ”€â”€ creditAccount: Account          â† Relation
â”œâ”€â”€ condition: String?              â† Optional JSON condition for overrides
â”œâ”€â”€ priority: Int                   â† Lower = higher priority
â”œâ”€â”€ active: Boolean                 â† Default true
â”œâ”€â”€ effectiveFrom: DateTime
â”œâ”€â”€ effectiveTo: DateTime?
â”œâ”€â”€ createdBy: String?
â””â”€â”€ audit: createdAt, archivedAt, updatedAt

Indexes:
  @@index([transactionType, active])
```

### 4.2 Base Account Mappings

These mappings define the default accounting treatment for each business transaction. They follow standard utility accounting practice (SAP IS-U aligned).

| Transaction Type | Debit Account | Credit Account | When |
|-----------------|---------------|----------------|------|
| **INVOICE_ISSUED (Water)** | 1201-01 â€” Customer Receivables â€” Water | 4001-01 â€” Revenue â€” Water Service | Invoice issued for water consumption |
| **INVOICE_ISSUED (Electric)** | 1201-02 â€” Customer Receivables â€” Electric | 4001-02 â€” Revenue â€” Electric Service | Invoice issued for electric consumption |
| **INVOICE_ISSUED (Gas)** | 1201-03 â€” Customer Receivables â€” Gas | 4001-03 â€” Revenue â€” Gas Service | Invoice issued for gas consumption |
| **INVOICE_TAX** | 1201-01 â€” Customer Receivables â€” Water (included in total) | 2101-01 â€” Tax Payable â€” VAT | Tax portion of invoice |
| **PAYMENT_RECEIVED (Cash)** | 1001-01 â€” Cash on Hand | 1201-XX â€” Customer Receivables (matching AR account) | Payment received in cash |
| **PAYMENT_RECEIVED (Bank)** | 1002-01 â€” Bank â€” Current Account | 1201-XX â€” Customer Receivables (matching AR account) | Payment received via bank transfer |
| **PAYMENT_RECEIVED (Card)** | 1003-01 â€” Bank â€” Card Settlement | 1201-XX â€” Customer Receivables (matching AR account) | Payment received via card |
| **PAYMENT_GATEWAY_FEE** | 5105-01 â€” Bank Charges & Fees | 1003-01 â€” Bank â€” Card Settlement | Gateway fee deducted from settlement |
| **INVOICE_CANCELLED** | 4001-XX â€” Revenue (reversal) | 1201-XX â€” Customer Receivables (reversal) | Full reversal of original invoice |
| **PAYMENT_REVERSED** | 1201-XX â€” Customer Receivables (reversal) | 100X-XX â€” Bank/Cash (reversal) | Full reversal of original payment |
| **INVOICE_ADJUSTMENT (Credit)** | 4001-XX â€” Revenue (decrease) | 1201-XX â€” Customer Receivables (decrease) | Credit note to customer |
| **INVOICE_ADJUSTMENT (Surcharge)** | 1201-XX â€” Customer Receivables (increase) | 4001-XX â€” Revenue (increase) | Additional charge |
| **WRITE_OFF** | 6101-01 â€” Bad Debt Expense | 1201-XX â€” Customer Receivables | Uncollectible debt write-off |
| **REFUND** | 6102-01 â€” Customer Refunds | 100X-XX â€” Bank/Cash | Refund to customer |

### 4.3 Account Mapping Resolution Algorithm

```
function resolveAccountMapping(transactionType, context):
  1. Find all ACTIVE AccountMappings for transactionType
     ordered by priority ASC
  
  2. For each mapping:
     a. If mapping has no condition â†’ use as base mapping (lowest priority)
     b. If mapping has condition, evaluate against context:
        - context = { customerType, utilityType, areaId, projectId, amount }
        - condition = { "field": "utilityType", "op": "eq", "value": "WATER" }
     c. If condition matches â†’ use this mapping (higher priority)
  
  3. If no mapping found â†’ ERROR: "No account mapping for {transactionType}"
  
  4. Return { debitAccountId, creditAccountId }
```

### 4.4 Suggested Chart of Accounts (New Accounts)

The existing Account model supports hierarchical CoA but needs seed data for standard utility accounts. These are the minimum accounts required for billing-to-GL integration:

| Code | Name | Type | Parent | Description |
|------|------|------|--------|-------------|
| 1000 | Current Assets | ASSET | â€” | Root asset account |
| 1001 | Cash on Hand | ASSET | 1000 | Physical cash |
| 1002 | Bank Accounts | ASSET | 1000 | Bank current accounts |
| 1002-01 | Bank â€” Current Account (NBE) | ASSET | 1002 | National Bank of Egypt |
| 1003 | Bank â€” Card Settlement | ASSET | 1000 | Card payment settlement account |
| 1200 | Accounts Receivable | ASSET | 1000 | Customer receivables root |
| 1201-01 | AR â€” Water Customers | ASSET | 1200 | Water utility receivables |
| 1201-02 | AR â€” Electric Customers | ASSET | 1200 | Electric utility receivables |
| 1201-03 | AR â€” Gas Customers | ASSET | 1200 | Gas utility receivables |
| 2100 | Current Liabilities | LIABILITY | â€” | Root liability account |
| 2101-01 | Tax Payable â€” VAT | LIABILITY | 2100 | VAT collected from customers |
| 3000 | Equity | EQUITY | â€” | Root equity account |
| 3001 | Retained Earnings | EQUITY | 3000 | Accumulated earnings (used by period close) |
| 4000 | Revenue | REVENUE | â€” | Root revenue account |
| 4001-01 | Revenue â€” Water Service | REVENUE | 4000 | Water utility revenue |
| 4001-02 | Revenue â€” Electric Service | REVENUE | 4000 | Electric utility revenue |
| 4001-03 | Revenue â€” Gas Service | REVENUE | 4000 | Gas utility revenue |
| 5000 | Operating Expenses | EXPENSE | â€” | Root expense account |
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
     â€” Update status to "POSTED"
     â€” Update postedAt
     â€” Upsert GeneralLedgerEntry for each account
       (existing logic from accounting.js posting route)
  
  8. UPDATE event:
     â€” status = "POSTED"
     â€” journalEntryId = entry.id
     â€” postedAt = now
  
  9. COMMIT transaction
  
  10. AUDIT:
      auditLog("financial.event.posted", { eventId, entryId, entryNumber })
  
  11. RETURN entry
```

**Error Recovery:**
- If step 3 fails (no mapping) â†’ event.status = "FAILED", errorMessage set, return error
- If step 4 fails (unbalanced) â†’ event.status = "FAILED", errorMessage set, return error
- If step 5 fails (entry number collision) â†’ retry with next sequence number
- If step 6-8 fails â†’ transaction ROLLBACK â€” no partial state
- If step 10 fails (audit) â†’ warning logged, but entry is already posted

### 5.2 Posting Approval Workflow

The existing accounting engine already supports DRAFT â†’ POSTED with separate roles. The PostingEngine can be configured in two modes:

**Mode 1: Auto-Post (default for W01)**
```
FinancialEvent CREATED
  â†’ PostingEngine.postEvent() called synchronously
  â†’ JournalEntry created and immediately POSTED
  â†’ Event status = "POSTED"
  â†’ No human approval needed (system-level posting)
  
Use case: Standard invoice issue, payment receipt
Governance: Audit trail captures every auto-posting
```

**Mode 2: Draft-Review-Post (for sensitive events)**
```
FinancialEvent CREATED
  â†’ PostingEngine.createDraftEvent() called
  â†’ JournalEntry created with status "DRAFT"
  â†’ Human reviewer checks the entry
  â†’ Reviewer approves â†’ entry is posted
  â†’ Event status = "POSTED"
  
Use case: Write-offs, large adjustments, manual corrections
Governance: Segregation of duties enforced
```

**Mode selection is determined by:**
```
if (event.amount > config.autoPostThreshold) â†’ use Mode 2
if (event.eventType in config.reviewRequiredEvents) â†’ use Mode 2
else â†’ use Mode 1

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
       â”‚
       â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ 1. Identify error                            â”‚
â”‚    - Which invoice/payment?                  â”‚
â”‚    - Which FinancialEvent?                   â”‚
â”‚    - Which JournalEntry?                     â”‚
â”‚    - What is the correct state?              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚
       â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ 2. Create Corrective Event                   â”‚
â”‚    - If invoice was wrongly issued:          â”‚
â”‚      Cancel original â†’ new FinancialEvent    â”‚
â”‚      PostingEngine reverses original JE      â”‚
â”‚    - If invoice amount wrong:                â”‚
â”‚      Create adjustment â†’ new FinancialEvent  â”‚
â”‚      PostingEngine creates correction JE     â”‚
â”‚    - If payment wrongly allocated:           â”‚
â”‚      Reverse payment â†’ new FinancialEvent    â”‚
â”‚      PostingEngine reverses original JE      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚
       â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ 3. Verify                                    â”‚
â”‚    - Trial Balance still balances            â”‚
â”‚    - AR account = sum of unpaid invoices     â”‚
â”‚    - Revenue account correct for period      â”‚
â”‚    - Audit trail shows all corrections       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## PART 6: RECONCILIATION FRAMEWORK

### 6.1 Reconciliation Layers

```
Layer 1: Transaction â€” Per-event reconciliation
  Every FinancialEvent has a matching JournalEntry
  Every JournalEntry references back to source event
  â†’ Verified at creation time (GOV-003)

Layer 2: Period â€” Aggregate reconciliation
  Monthly (at period close):
  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
  â”‚ RECONCILIATION CHECKLIST                                        â”‚
  â”‚                                                                 â”‚
  â”‚ â–¡ 1. Sum of all Invoice amounts in period                      â”‚
  â”‚    = Sum of Revenue journal entries for period                  â”‚
  â”‚    (allowing for cancellations and adjustments)                 â”‚
  â”‚                                                                 â”‚
  â”‚ â–¡ 2. Sum of all Payment amounts in period                      â”‚
  â”‚    = Sum of Cash journal entries for period                     â”‚
  â”‚    (allowing for reversals and refunds)                         â”‚
  â”‚                                                                 â”‚
  â”‚ â–¡ 3. AR account closing balance                                â”‚
  â”‚    = Sum of all unpaid Invoice amounts                          â”‚
  â”‚    (where status in: issued, overdue, partial)                 â”‚
  â”‚                                                                 â”‚
  â”‚ â–¡ 4. Total Credits = Total Debits in Trial Balance             â”‚
  â”‚                                                                 â”‚
  â”‚ â–¡ 5. Revenue account balance                                   â”‚
  â”‚    = Sum of issued invoices - sum of cancelled invoices        â”‚
  â”‚                                                                 â”‚
  â”‚ â–¡ 6. Cash/Bank account balance                                 â”‚
  â”‚    = Sum of payments received - sum of refunds                 â”‚
  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

Layer 3: System â€” Automated daily check
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
| Duplicate event | Unique constraint violation | Reject â€” event already processed |
| Period closed but event backdated | Period.status = "CLOSED" | Create correcting entry in current period |
| Auto-posting failed | Transaction rollback | Event remains PENDING, retry mechanism picks it up |

### 6.3 Reconciliation Report (per Period Close)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  PERIOD RECONCILIATION REPORT                                       â”‚
â”‚  Period: 2026-07 (July 2026)                                        â”‚
â”‚  Generated: 2026-08-01 00:00:00                                     â”‚
â”‚                                                                      â”‚
â”‚  INVOICES:                                                          â”‚
â”‚    Total invoiced:          1,250,000.00 EGP                         â”‚
â”‚    Total cancelled:           -25,000.00 EGP                         â”‚
â”‚    Net invoiced:            1,225,000.00 EGP                         â”‚
â”‚                                                                      â”‚
â”‚  REVENUE JOURNAL:                                                    â”‚
â”‚    Total DR (AR):           1,225,000.00 EGP                         â”‚
â”‚    Total CR (Revenue):      1,225,000.00 EGP                         â”‚
â”‚    âœ… Balanced: YES                                                  â”‚
â”‚    âœ… Matches net invoiced: YES                                      â”‚
â”‚                                                                      â”‚
â”‚  PAYMENTS:                                                           â”‚
â”‚    Total received:            875,000.00 EGP                         â”‚
â”‚    Total reversed:            -12,000.00 EGP                         â”‚
â”‚    Net received:              863,000.00 EGP                         â”‚
â”‚                                                                      â”‚
â”‚  CASH JOURNAL:                                                       â”‚
â”‚    Total DR (Cash):           863,000.00 EGP                         â”‚
â”‚    Total CR (AR):             863,000.00 EGP                         â”‚
â”‚    âœ… Balanced: YES                                                  â”‚
â”‚    âœ… Matches net received: YES                                      â”‚
â”‚                                                                      â”‚
â”‚  AR BALANCE:                                                         â”‚
â”‚    GL account 1201 closing:    362,000.00 EGP                        â”‚
â”‚    Unpaid invoices total:       362,000.00 EGP                        â”‚
â”‚    âœ… Reconciled: YES                                                â”‚
â”‚                                                                      â”‚
â”‚  STATUS: âœ… RECONCILED                                               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## PART 7: SECURITY & GOVERNANCE

### 7.1 Role-Based Access Control

The existing RBAC system from C12 will be extended with financial-specific permissions.

| Role | Permissions | Can View | Can Create | Can Approve | Can Post |
|------|-------------|----------|------------|-------------|----------|
| **Billing Operator** | billing.* | Invoice, Payment, BillRun | Invoice, BillRun | âŒ | âŒ |
| **Accountant** | accounting.*, financial-event.view | All financial data | Journal Entry (DRAFT) | âŒ | âŒ |
| **Finance Reviewer** | accounting.journal.approve, financial-event.* | All financial data | âŒ | Journal Entry âœ… | âŒ |
| **Finance Admin** | accounting.*, financial-event.* | All financial data | All | All | All |
| **Auditor** | audit.view, financial-event.view, accounting.reports.* | Read-only all | âŒ | âŒ | âŒ |

### 7.2 Segregation of Duties

**Create â‰  Approve â‰  Post** â€” enforced at route level:

| Operation | Billing Operator | Accountant | Finance Reviewer | Finance Admin |
|-----------|:----------------:|:----------:|:----------------:|:-------------:|
| Create Invoice | âœ… | âŒ | âŒ | âœ… |
| Issue Invoice | âœ… | âŒ | âŒ | âœ… |
| Create Payment | âœ… | âŒ | âŒ | âœ… |
| Reverse Payment | âŒ | âŒ | âœ… | âœ… |
| Cancel Invoice | âŒ | âŒ | âœ… | âœ… |
| Create Journal | âŒ | âœ… | âŒ | âœ… |
| Post Journal | âŒ | âŒ | âœ… | âœ… |
| Reverse Journal | âŒ | âŒ | âœ… | âœ… |
| Close Period | âŒ | âŒ | âŒ | âœ… |
| Override Period | âŒ | âŒ | âŒ | âœ… (CFO only) |

### 7.3 Security Controls

| Control | Mechanism | Implementation |
|---------|-----------|----------------|
| Financial event access scoped by area | areaId on Invoice/Payment â†’ filtered by user area | Prisma where clause in route |
| Journal entry immutability after POSTED | Status guard in route | accounting.js route check |
| Period lock after close | Period status check | accounting.js period check |
| No hard delete on any financial record | archivedAt pattern | All models |
| Every financial mutation audited | auditLog() middleware | All routes |
| Sensitive amount display limited | Role-based field filtering | Middleware |
| PostingEngine idempotency | Unique (sourceType, sourceId) | DB constraint |
| API rate limiting on financial endpoints | express-rate-limit | Existing middleware |

---

## PART 8: TESTING STRATEGY â€” W01 (85 Tests)

### 8.1 Invoice Posting Tests (20)

| # | Test | Expected | 
|---|------|----------|
| 1 | Issue invoice â†’ FinancialEvent INVOICE_ISSUED created | Event status PENDING |
| 2 | Issue invoice â†’ JournalEntry auto-created + posted | Entry status POSTED |
| 3 | Issue invoice â†’ DR: AR, CR: Revenue correct amounts | Lines match invoice.amount |
| 4 | Issue invoice â†’ GeneralLedgerEntry updated | GL balance changes correctly |
| 5 | Issue invoice â†’ period assigned correctly | Period matches invoice.issuedAt |
| 6 | Issue multiple invoices â†’ multiple separate JEs | 1:1 mapping |
| 7 | Issue invoice with tax â†’ CR: Tax Payable included | Tax line exists |
| 8 | Cancel invoice â†’ FinancialEvent INVOICE_CANCELLED | Event created |
| 9 | Cancel invoice â†’ reversal JE created + posted | Reversal references original |
| 10 | Cancel invoice â†’ GL balances reversed | AR/Revenue back to pre-issue |
| 11 | Cancel non-existent invoice â†’ 404 | Proper error |
| 12 | Cancel already cancelled invoice â†’ 400 | Proper error |
| 13 | Cancel paid invoice â†’ 400 | Proper error |
| 14 | Adjust issued invoice â†’ FinancialEvent INVOICE_ADJUSTED | Event created |
| 15 | Adjust invoice â†’ correction JE created | Amount matches adjustment |
| 16 | Re-generate invoice â†’ cancel old + create new | Both events generated |
| 17 | Issue invoice in CLOSED period â†’ error | Period check blocks |
| 18 | Issue invoice with no OPEN period â†’ error | No period found |
| 19 | Issue invoice â†’ audit log created | AuditEntry has action |
| 20 | Issue invoice â†’ correlationId traced | Audit chain complete |

### 8.2 Payment Posting Tests (20)

| # | Test | Expected |
|---|------|----------|
| 1 | Receive payment â†’ FinancialEvent PAYMENT_RECEIVED created | Event status PENDING |
| 2 | Receive payment â†’ JournalEntry auto-created + posted | Entry status POSTED |
| 3 | Receive payment â†’ DR: Cash, CR: AR correct amounts | Lines match payment.amount |
| 4 | Receive payment â†’ AR GL balance decreases | GL updated |
| 5 | Receive payment â†’ Cash GL balance increases | GL updated |
| 6 | Pay with gateway fee â†’ fee line created | DR: Bank Charges included |
| 7 | Pay full invoice â†’ invoice status = "paid" | Existing + new JE |
| 8 | Pay partial invoice â†’ invoice status = "partial" | Existing + new JE |
| 9 | Reverse payment â†’ FinancialEvent PAYMENT_REVERSED | Event created |
| 10 | Reverse payment â†’ reversal JE created + posted | References original |
| 11 | Reverse payment â†’ AR balance increases back | GL restored |
| 12 | Reverse payment â†’ Cash balance decreases | GL restored |
| 13 | Reverse non-existent payment â†’ 404 | Proper error |
| 14 | Reverse already reversed payment â†’ 400 | Proper error |
| 15 | Refund payment â†’ FinancialEvent PAYMENT_REFUNDED | Event created |
| 16 | Refund payment â†’ expense + cash JE | DR: Refund Expense, CR: Cash |
| 17 | Pay in CLOSED period â†’ error | Period check blocks |
| 18 | Pay with no OPEN period â†’ error | No period found |
| 19 | Pay â†’ audit log created with amounts | AuditEntry has action |
| 20 | Pay â†’ correlationId traced | Audit chain complete |

### 8.3 Journal Balancing Tests (15)

| # | Test | Expected |
|---|------|----------|
| 1 | PostingEngine ensures debit = credit | Always balanced |
| 2 | Debit total mismatches credit by 0.001 â†’ error | Validation catches |
| 3 | Debit total mismatches credit by 0.01 â†’ error | Validation catches |
| 4 | Debit total mismatches credit by 1000 â†’ error | Validation catches |
| 5 | Single-line journal (only DR) â†’ error | Invalid |
| 6 | Single-line journal (only CR) â†’ error | Invalid |
| 7 | Multi-line journal (many DR, many CR) â†’ balanced | Passes |
| 8 | Three-line journal (2 DR, 1 CR) â†’ balanced | Passes |
| 9 | Reversal auto-computes negated amounts | Balances |
| 10 | Reversal of multi-line entry â†’ all lines negated | Balances |
| 11 | Entry with zero amount â†’ error | Validation |
| 12 | Entry with negative amounts â†’ error | Zod rejects |
| 13 | Entry with 500 lines â†’ passes | Max limit OK |
| 14 | Entry with 501 lines â†’ error | Max limit exceeded |
| 15 | Duplicate line accounts â†’ still balances | Passes |

### 8.4 Period Lock Tests (10)

| # | Test | Expected |
|---|------|----------|
| 1 | Post to OPEN period â†’ passes | Period accepted |
| 2 | Post to CLOSED period â†’ blocked | Error returned |
| 3 | Close period with posted entries â†’ passes | Close succeeds |
| 4 | Close period with DRAFT entries â†’ blocked | Error returned |
| 5 | Close period with no entries â†’ passes | Close succeeds |
| 6 | Re-open closed period â†’ admin only | Guard enforced |
| 7 | Create period for existing year/month â†’ 409 | Duplicate blocked |
| 8 | FinancialEvent auto-assigns correct period | Date-based match |
| 9 | Event at period boundary â†’ assigned to correct period | Edge case |
| 10 | Event with no matching period â†’ clear error | Error message |

### 8.5 Reversal Tests (10)

| # | Test | Expected |
|---|------|----------|
| 1 | Reverse POSTED entry â†’ reversal created | New entry with negated lines |
| 2 | Reverse POSTED entry â†’ original marked reversed | reversedAt set |
| 3 | Reversal auto-posts | Reversal status = POSTED |
| 4 | Reverse DRAFT entry â†’ error | Only POSTED reversible |
| 5 | Reverse already reversed entry â†’ error | reversedAt check |
| 6 | Reverse non-existent entry â†’ 404 | Proper error |
| 7 | Reversal GL impact = original negated | GL restored |
| 8 | Reversal references original entry number | referenceId set |
| 9 | Original entry number visible in reversal description | Description contains "Reversal of JE-..." |
| 10 | Multiple reversals of same entry blocked | Guard |

### 8.6 Audit Trace Tests (5)

| # | Test | Expected |
|---|------|----------|
| 1 | Complete trace: Invoice â†’ FinancialEvent â†’ JE â†’ GL | All links present |
| 2 | Complete trace: Payment â†’ FinancialEvent â†’ JE â†’ GL | All links present |
| 3 | Complete trace: Cancellation â†’ FinancialEvent â†’ reversal JE â†’ GL | All links present |
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
| `backend/src/services/posting-engine.js` | Central PostingEngine service (eventâ†’journal) |
| `backend/src/routes/financial-events.js` | FinancialEvent CRUD + monitoring routes |
| `backend/src/services/account-mapping.js` | AccountMapping resolution service |

**MODIFIED files (5):**
| File | Change |
|------|--------|
| `backend/prisma/schema.prisma` | Add FinancialEvent + AccountMapping models, Invoice.periodId, Payment.periodId |
| `backend/src/routes/invoices.js` | INJECT posting: after `status â†’ "issued"`, call PostingEngine.postEvent() |
| `backend/src/routes/payments.js` | INJECT posting: after payment completed, call PostingEngine.postEvent() |
| `backend/src/routes/billing.js` | INJECT reversal: on invoice cancel, create FinancialEvent + call reversal |
| `backend/src/server.js` | Register financial-events route |

### 9.2 Integration Point â€” Invoice Issue (invoices.js)

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

### 9.3 Integration Point â€” Payment Create (payments.js)

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

### 9.4 Integration Point â€” Invoice Cancel (billing.js)

**Current (line 124-145):**
Sets status to "cancelled", creates history entry.

**After W01:** Create FinancialEvent INVOICE_CANCELLED â†’ PostingEngine creates reversal.

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
  periodId          String?     // FK â†’ FinancialPeriod
  period            FinancialPeriod? @relation(fields: [periodId], references: [id])

// Add to Payment model:
  periodId          String?     // FK â†’ FinancialPeriod
  period            FinancialPeriod? @relation(fields: [periodId], references: [id])
```

---

## PART 10: W01 DEFINITION OF DONE

```
W01 â€” FINANCIAL INTEGRATION FOUNDATION
CERTIFICATION CHECKLIST
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

â–¡ FINANCIAL EVENT MODEL
   â–¡ FinancialEvent Prisma model created with all fields
   â–¡ FinancialEvent migrations applied
   â–¡ FinancialEvent CRUD routes operational
   â–¡ FinancialEvent unique constraint on (sourceType, sourceId)
   â–¡ FinancialEvent status lifecycle: PENDING â†’ POSTED | FAILED

â–¡ ACCOUNT MAPPING
   â–¡ AccountMapping Prisma model created
   â–¡ AccountMapping CRUD routes operational
   â–¡ Seed AccountMapping records for base transaction types:
     - INVOICE_ISSUED (Water/Electric/Gas)
     - PAYMENT_RECEIVED (Cash/Bank/Card)
     - INVOICE_CANCELLED
     - PAYMENT_REVERSED
     - INVOICE_ADJUSTED
   â–¡ AccountMapping resolution service operational
   â–¡ Condition-based mapping (utility type) operational

â–¡ POSTING ENGINE
   â–¡ PostingEngine service created
   â–¡ postEvent() creates FinancialEvent + JournalEntry
   â–¡ Debit = credit enforced on every posting
   â–¡ Period OPEN check before posting
   â–¡ Auto-post or draft-review-post mode selectable
   â–¡ Idempotency guard (no duplicate postings)
   â–¡ Error handling: no partial state (transaction rollback)
   â–¡ Reversal flow: creates negated JournalEntry

â–¡ INVOICE ISSUE INTEGRATION
   â–¡ Invoice issue â†’ FinancialEvent.created
   â–¡ FinancialEvent â†’ PostingEngine.postEvent()
   â–¡ JournalEntry: DR: AR, CR: Revenue (amount = invoice.amount)
   â–¡ GeneralLedgerEntry updated for both accounts
   â–¡ Invoice.periodId set to matched FinancialPeriod
   â–¡ Existing invoice functionality preserved
   â–¡ Error handling: invoice issued but no journal = FAILED event

â–¡ PAYMENT CREATE INTEGRATION
   â–¡ Payment create â†’ FinancialEvent.created
   â–¡ FinancialEvent â†’ PostingEngine.postEvent()
   â–¡ JournalEntry: DR: Cash, CR: AR (amount = payment.amount)
   â–¡ GeneralLedgerEntry updated for both accounts
   â–¡ Payment.periodId set to matched FinancialPeriod
   â–¡ Gateway fee handling: separate fee line in journal
   â–¡ Existing payment allocation preserved

â–¡ INVOICE CANCEL INTEGRATION
   â–¡ Invoice cancel â†’ FinancialEvent INVOICE_CANCELLED
   â†’ PostingEngine creates reversal JournalEntry
   â–¡ Reversal references original JournalEntry
   â–¡ GL balances reversed to pre-issue state
   â–¡ High-risk guard (amount > 10K or overdue) preserved

â–¡ PAYMENT REVERSE INTEGRATION
   â–¡ Payment reverse â†’ FinancialEvent PAYMENT_REVERSED
   â†’ PostingEngine creates reversal JournalEntry
   â–¡ Reversal references original JournalEntry
   â–¡ GL balances restored

â–¡ FINANCIAL PERIOD ASSIGNMENT
   â–¡ Invoice issue â†’ period auto-assigned by issuedAt date
   â–¡ Payment complete â†’ period auto-assigned by paidAt date
   â–¡ No OPEN period â†’ clear error message
   â–¡ CLOSED period â†’ blocked with error message

â–¡ AUDIT & GOVERNANCE
   â–¡ Every FinancialEvent creation logged to AuditEntry
   â–¡ Every FinancialEvent posting logged to AuditEntry
   â–¡ Every FinancialEvent failure logged to AuditEntry
   â–¡ Correlation ID propagated from request â†’ event â†’ journal
   â–¡ RBAC permissions for financial-event.* routes
   â–¡ Segregation of duties: create â‰  post

â–¡ RECONCILIATION
   â–¡ Daily reconciliation job definition
   â–¡ Monthly reconciliation checklist
   â–¡ AR balance vs unpaid invoices comparison query
   â–¡ Trial Balance verification after all postings

â–¡ DATA INTEGRITY
   â–¡ Seed script for Chart of Accounts (if not exist)
   â–¡ Seed script for AccountMappings (base types)
   â–¡ Migration rollback script defined
   â–¡ Feature flag to toggle auto-posting

â–¡ TESTS â€” 85 PASSING
   â–¡ Invoice posting: 20 tests
   â–¡ Payment posting: 20 tests
   â–¡ Journal balancing: 15 tests
   â–¡ Period locking: 10 tests
   â–¡ Reversal: 10 tests
   â–¡ Audit trace: 5 tests
   â–¡ Reconciliation: 5 tests

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
W01 STATUS: â–¡ NOT IMPLEMENTED
All items above are DESIGN-COMPLETE but not executed.
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
    â”‚
    â”œâ”€â”€â†’ Migration
    â”‚
    â”œâ”€â”€â†’ posting-engine.js â”€â”€â†’ account-mapping.js
    â”‚         â”‚
    â”‚         â”œâ”€â”€â†’ invoices.js (hook after issue)
    â”‚         â”œâ”€â”€â†’ payments.js (hook after create)
    â”‚         â””â”€â”€â†’ billing.js (hook after cancel)
    â”‚
    â”œâ”€â”€â†’ financial-events.js (CRUD + monitoring routes)
    â”‚
    â”œâ”€â”€â†’ seed-financial-accounts.js (idempotent)
    â”‚
    â””â”€â”€â†’ reconciliation.js (scheduled + period-end)
```

## APPENDIX C: ROLLBACK STRATEGY

| Scenario | Rollback Action |
|----------|-----------------|
| PostingEngine has a bug | Disable auto-posting via feature flag â†’ revert to current state (no GL impact) |
| Account mapping is wrong | Update AccountMapping records (no code change needed) |
| FinancialEvent gets stuck in PENDING | Admin retry UI â†’ repost failed events |
| Migration causes DB issues | `prisma migrate down` â†’ removes FinancialEvent + AccountMapping tables |
| Wrong account seed data | Delete accounts manually via API (soft delete with guard) |
| Posting causes GL imbalance | Manual reversal of posted entries via existing accounting routes |

**Feature flag:**
```javascript
// config/feature-flags.js
{
  "financialAutoPosting": { enabled: false, description: "Toggle billing-to-GL auto-posting" }
}
// When disabled, FinancialEvents are still created with status PENDING
// but PostingEngine does not auto-post â€” admin must manually trigger
```

---

*This document is a planning artifact only. No code, no implementation, no database migration.*
*C13-W01 â€” Financial Integration Foundation. READ ONLY. GOVERNANCE PLANNING ONLY.*

