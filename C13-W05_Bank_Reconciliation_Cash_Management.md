# C13-W05 — Enterprise Bank Reconciliation & Cash Management Platform
## Blueprint

**Version:** 1.0.0  
**Status:** READ ONLY — GOVERNANCE PLANNING ONLY — NOT IMPLEMENTED  
**Date:** 2026-07-29  
**Program:** C13 Enterprise Financial & Billing Intelligence Platform  
**Wave:** W05 (Bank Reconciliation & Cash Management)  

---

## PART 1: CURRENT STATE AUDIT

### 1.1 Existing Infrastructure

| Component | Location | Status | Capability |
|-----------|----------|--------|------------|
| **PaymentGateway** model | `schema.prisma:1443` | ✅ Complete | name, provider, config, active, testMode |
| **PaymentTransaction** model | `schema.prisma:1456` | ✅ Complete | gatewayId, transactionId, amount, currency, status |
| **GatewayLog** model | `schema.prisma:1480` | ✅ Complete | request, response, status |
| **Payment** model | `schema.prisma:1013` | ✅ Complete | method (cash/bank/card), status, paidAt |
| **Payment** method enum | Routes | ✅ Complete | cash, bank, card, check, wallet |
| **CustomerLedgerEntry** | `schema.prisma:1493` | ✅ Complete | Overpayments, credits, refunds |
| **W01 PostingEngine** | Planned | ❌ Pending | Auto-journal from payments |
| **W02 Revenue Assurance** | Planned | ❌ Pending | Payment discrepancy detection |
| **W04 Collection Intel** | Planned | ❌ Pending | Payment allocation tracking |

### 1.2 Gap Analysis

| Capability | Current | W05 Target |
|------------|---------|------------|
| Bank account management | ❌ None | Multi-bank hierarchy with balances |
| Bank statement import | ❌ None | CSV, Excel, CAMT.053, MT940, API |
| Statement lifecycle | ❌ None | UPLOADED → PARSED → MATCHING → RECONCILED → POSTED |
| Auto-reconciliation engine | ❌ None | Rule-based matching with AI assistance |
| Manual reconciliation | ❌ None | Interactive workbench |
| Multi-currency | ❌ None | FX rates, auto-conversion, GL posting |
| Payment gateway reconciliation | ❌ None | Gateway statement vs bank statement |
| Duplicate payment detection | ❌ None | Fingerprint matching |
| Unidentified payments | ❌ None | Suspense account workflow |
| Returned payments / chargebacks | ❌ None | Full lifecycle management |
| Bank fee accounting | ❌ None | Auto-detect and post fees |
| Cash position dashboard | ❌ None | Real-time consolidated view |
| Daily cash forecasting | ❌ None | AR/AP-driven forecast |
| AI Cash Intelligence | ❌ None | Anomaly detection, liquidity forecast |
| Exception management | ❌ None | Investigation and resolution workflow |

---

## PART 2: ENTERPRISE CASH MANAGEMENT ARCHITECTURE

### 2.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                   BANK RECONCILIATION & CASH MANAGEMENT PLATFORM                                │
│                                                                                                │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  DATA INGESTION LAYER                                                                     │    │
│  │                                                                                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │    │
│  │  │ CSV/Excel    │  │ CAMT.053     │  │ MT940        │  │ Bank API     │  │ Gateway  │  │    │
│  │  │ File Import  │  │ (XML ISO)    │  │ (SWIFT)      │  │ (REST/SFTP)  │  │ (webhook)│  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘  │    │
│  └───────────────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                          │
│                                    ▼                                                          │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  RECONCILIATION ENGINE                                                                    │    │
│  │                                                                                          │    │
│  │  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐                │    │
│  │  │ Rule-Based Matcher │  │ AI-Assisted Matcher │  │ Manual Matcher    │                │    │
│  │  │                    │  │                    │  │                    │                │    │
│  │  │ • Reference match  │  │ • Fuzzy amount     │  │ • Interactive UI  │                │    │
│  │  │ • Amount + date    │  │ • Partial match    │  │ • Split/match     │                │    │
│  │  │ • Exact match      │  │ • Learning from    │  │ • Override with   │                │    │
│  │  │ • Fingerprint      │  │   manual matches   │  │   reason          │                │    │
│  │  └────────────────────┘  └────────────────────┘  └────────────────────┘                │    │
│  └───────────────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                          │
│                                    ▼                                                          │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  EXCEPTION MANAGEMENT                                                                     │    │
│  │                                                                                          │    │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │    │
│  │  │ Unmatched      │  │ Partial Match  │  │ Duplicate      │  │ Unidentified   │        │    │
│  │  │ Bank Lines     │  │ (diff > 0.01)  │  │ Detected       │  │ Payments      │        │    │
│  │  └────────────────┘  └────────────────┘  └────────────────┘  └────────────────┘        │    │
│  └───────────────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                          │
│                                    ▼                                                          │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  ACCOUNTING INTEGRATION (via W01 PostingEngine)                                          │    │
│  │                                                                                          │    │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │    │
│  │  │ Bank Statement │  │ Bank Fees      │  │ FX Gain/Loss   │  │ Suspense       │        │    │
│  │  │ GL Posting     │  │ Journal        │  │ Journal        │  │ Clearance      │        │    │
│  │  └────────────────┘  └────────────────┘  └────────────────┘  └────────────────┘        │    │
│  └───────────────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                          │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  TREASURY & CASH MANAGEMENT                                                               │    │
│  │                                                                                          │    │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │    │
│  │  │ Cash Position  │  │ Daily Cash     │  │ Liquidity      │  │ Multi-Currency │        │    │
│  │  │ Dashboard      │  │ Forecast       │  │ Planning       │  │ Balances       │        │    │
│  │  └────────────────┘  └────────────────┘  └────────────────┘  └────────────────┘        │    │
│  └───────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  AI CASH INTELLIGENCE AGENT                                                                │    │
│  │                                                                                          │    │
│  │  • Payment anomaly detection  • Cash flow prediction  • Liquidity forecasting           │    │
│  │  • Reconciliation suggestions • Duplicate detection    • Bank fee optimization          │    │
│  └───────────────────────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Statement Lifecycle

```
┌──────────┐
│ UPLOADED  │  File received via upload, API, SFTP, or webhook
└────┬─────┘
     │
     ▼
┌──────────┐
│  PARSED   │  File parsed into structured BankStatement records
└────┬─────┘
     │
     ▼
┌───────────┐
│ MATCHING   │  Auto-reconciliation engine runs
│   (auto)   │  Rule-based + AI-assisted matching
└────┬──────┘
     │
    ┌┴──────────────┐
    │               │
    ▼               ▼
┌──────────┐  ┌──────────┐
│ RECONCILED│  │EXCEPTION │  Unmatched/partial entries
│  (auto)   │  │          │
└────┬─────┘  └────┬─────┘
     │             │
     │        ┌────┴────┐
     │        │         │
     │        ▼         ▼
     │  ┌─────────┐ ┌─────────┐
     │  │Manual   │ │Investiga│
     │  │Matched  │ │ -tion   │
     │  └────┬────┘ └────┬────┘
     │       │           │
     └───────┼───────────┘
             ▼
┌──────────┐
│ VERIFIED  │  Reconciliation reviewed and approved
└────┬─────┘
     │
     ▼
┌──────────┐
│  POSTED   │  GL entries created (bank statement = bank GL balance)
└──────────┘
```

### 2.3 Matching Algorithm

```
ReconciliationEngine.match(bankStatement, internalTransactions):
  matched = []
  unmatched = []
  partial = []

  STAGE 1: EXACT MATCH
    FOR each bankLine IN bankStatement:
      internal = findExactMatch(bankLine, internalTransactions)
      IF internal:
        // Exact: reference number + amount + date within 1 day
        matched.push({ bankLine, internal, method: "EXACT", confidence: 1.0 })
        internalTransactions.remove(internal)
        bankStatement.remove(bankLine)

  STAGE 2: AMOUNT + DATE FUZZY
    FOR each bankLine IN bankStatement:
      candidates = findAmountMatch(bankLine.amount, internalTransactions, tolerance: 0.01)
      IF candidates.length == 1:
        dateDiff = |candidates[0].date - bankLine.date|
        IF dateDiff <= 3 days:
          matched.push({ bankLine, internal: candidates[0], method: "AMOUNT_DATE", confidence: 0.95 })
          internalTransactions.remove(candidates[0])
          bankStatement.remove(bankLine)

  STAGE 3: REFERENCE + AMOUNT FUZZY
    FOR each bankLine IN bankStatement:
      ref = extractReference(bankLine.description)
      IF ref:
        candidates = internalTransactions.filter(t => t.reference == ref)
        IF candidates.length == 1:
          amountDiff = |candidates[0].amount - bankLine.amount|
          IF amountDiff <= 0.01:
            matched.push({ bankLine, internal: candidates[0], method: "REFERENCE", confidence: 0.98 })
          ELSE:
            partial.push({ bankLine, internal: candidates[0], diff: amountDiff, method: "REFERENCE_PARTIAL", confidence: 0.7 })

  STAGE 4: AI-ASSISTED
    FOR each remaining bankLine:
      aiResult = AICashAgent.suggestMatch(bankLine, remainingTransactions)
      IF aiResult.confidence > 0.9:
        matched.push({ bankLine, internal: aiResult.match, method: "AI_SUGGESTED", confidence: aiResult.confidence })
      ELSE:
        unmatched.push(bankLine)

  STAGE 5: MANUAL
    FOR each unmatched:
      → Add to reconciliation workbench for manual matching

  RETURN { matched, partial, unmatched }
```

---

## PART 3: DATA MODEL DESIGN

### 3.1 BankAccount (NEW)

**Purpose:** Manage multi-bank account hierarchy.

```
BankAccount
├── id: String (UUID, PK)
├── bankName: String                 ← "National Bank of Egypt"
├── accountName: String              ← "MeterVerse Operating Account"
├── accountNumber: String            ← Masked/last-4-digits
├── iban: String?                    ← International format
├── swiftCode: String?               ← SWIFT/BIC
├── currency: String @default("EGP")
├── type: String                     ← CURRENT | SAVINGS | SETTLEMENT | COLLECTION
├── openingBalance: Float @default(0)
├── currentBalance: Float @default(0)
├── availableBalance: Float @default(0)
├── lastReconciledAt: DateTime?
├── lastReconciledBalance: Float?
├── status: String @default("ACTIVE")  ← ACTIVE | SUSPENDED | CLOSED
├── metadata: String? (JSON)
├── createdAt, archivedAt, updatedAt

Indexes:
  @@index([accountNumber])
  @@index([type, status])
```

### 3.2 BankStatement (NEW)

**Purpose:** Represent an imported bank statement for a specific account and period.

```
BankStatement
├── id: String (UUID, PK)
├── bankAccountId: String (FK → BankAccount)
├── statementDate: DateTime          ← Statement date/period-end
├── periodStart: DateTime
├── periodEnd: DateTime
├── importSource: String             ← UPLOAD | API | SFTP | MANUAL
├── importFormat: String             ← CSV | XLSX | CAMT053 | MT940 | API
├── originalFilename: String?
├── openingBalance: Float
├── closingBalance: Float
├── totalCredits: Float @default(0)
├── totalDebits: Float @default(0)
├── transactionCount: Int @default(0)
├── matchedCount: Int @default(0)
├── unmatchedCount: Int @default(0)
├── status: String @default("UPLOADED")  ← UPLOADED|PARSED|MATCHING|RECONCILED|VERIFIED|POSTED
├── reconciledAt: DateTime?
├── reconciledBy: String?
├── postedAt: DateTime?
├── glJournalEntryId: String? (FK → JournalEntry)
├── notes: String?
├── createdAt, archivedAt, updatedAt

Relations:
  bankAccount → BankAccount
  transactions → BankTransaction[]
  exceptions → ReconciliationException[]

Indexes:
  @@index([bankAccountId, status])
  @@index([bankAccountId, periodEnd])
```

### 3.3 BankTransaction (NEW)

**Purpose:** Individual line items from a bank statement.

```
BankTransaction
├── id: String (UUID, PK)
├── bankStatementId: String (FK → BankStatement)
├── transactionDate: DateTime
├── valueDate: DateTime?
├── reference: String?               ← Bank reference/transaction ID
├── description: String
├── amount: Float                     ← Positive = credit, Negative = debit
├── currency: String @default("EGP")
├── exchangeRate: Float @default(1)
├── baseAmount: Float?               ← Amount in account's base currency
├── type: String                     ← CREDIT | DEBIT
├── category: String?                ← FEE | INTEREST | TRANSFER | PAYMENT | CHARGEBACK | etc.
├── internalMatchId: String?         ← FK → PaymentTransaction.id (when matched)
├── matchMethod: String?             ← EXACT | AMOUNT_DATE | REFERENCE | AI_SUGGESTED | MANUAL
├── matchConfidence: Float?          ← 0.0-1.0
├── matchStatus: String @default("UNMATCHED")  ← UNMATCHED | MATCHED | PARTIAL | SPLIT
├── matchedAt: DateTime?
├── matchedBy: String?
├── notes: String?
├── createdAt, archivedAt

Indexes:
  @@index([bankStatementId])
  @@index([internalMatchId])
  @@index([matchStatus])
  @@index([reference])
  @@index([amount, transactionDate])
```

### 3.4 ReconciliationException (NEW)

**Purpose:** Track unmatched and problematic items during reconciliation.

```
ReconciliationException
├── id: String (UUID, PK)
├── bankStatementId: String (FK → BankStatement)
├── bankTransactionId: String? (FK → BankTransaction)
├── type: String                     ← UNMATCHED_DEBIT | UNMATCHED_CREDIT | PARTIAL_MATCH |
│                                        DUPLICATE | UNIDENTIFIED | AMOUNT_MISMATCH
├── description: String
├── amount: Float
├── status: String @default("OPEN")  ← OPEN | INVESTIGATING | RESOLVED | DISMISSED
├── resolvedMethod: String?          ← MANUAL_MATCH | WRITE_OFF | SUSPENSE | REVERSAL
├── resolvedAt: DateTime?
├── resolvedBy: String? (FK → User)
├── resolutionNote: String?
├── journalEntryId: String? (FK → JournalEntry)
├── createdAt, archivedAt

Indexes:
  @@index([bankStatementId, status])
  @@index([type, status])
```

### 3.5 PaymentGatewaySettlement (NEW)

**Purpose:** Track payment gateway settlement statements separately from bank statements.

```
PaymentGatewaySettlement
├── id: String (UUID, PK)
├── gatewayId: String (FK → PaymentGateway)
├── settlementId: String             ← Gateway's settlement reference
├── periodStart: DateTime
├── periodEnd: DateTime
├── settlementDate: DateTime
├── totalAmount: Float
├── totalFees: Float @default(0)
├── netAmount: Float
├── transactionCount: Int
├── currency: String @default("EGP")
├── status: String                   ← PENDING | SETTLED | RECONCILED
├── bankStatementId: String? (FK → BankStatement)  ← Linked when net settlement hits bank
├── createdAt, archivedAt
```

### 3.6 SuspenseTransaction (NEW)

**Purpose:** Track unidentified payments that need investigation.

```
SuspenseTransaction
├── id: String (UUID, PK)
├── source: String                   ← BANK_STATEMENT | PAYMENT_GATEWAY | MANUAL
├── sourceId: String                 ← FK to source record
├── amount: Float
├── currency: String @default("EGP")
├── description: String
├── status: String                   ← PENDING | INVESTIGATING | ALLOCATED | REVERSED
├── allocatedTo: String?             ← CustomerId or InvoiceId
├── allocatedAt: DateTime?
├── allocatedBy: String? (FK → User)
├── journalEntryId: String? (FK → JournalEntry)  ← Suspense GL entry
├── createdAt, archivedAt
```

### 3.7 CashForecast (NEW)

**Purpose:** Store daily cash flow forecasts.

```
CashForecast
├── id: String (UUID, PK)
├── forecastDate: DateTime           ← Date of forecast generation
├── projectionDate: DateTime         ← Which date is being projected
├── expectedInflows: Float @default(0)
├── expectedOutflows: Float @default(0)
├── netFlow: Float @default(0)
├── openingBalance: Float
├── closingBalance: Float
├── confidence: Float?               ← 0.0-1.0
├── source: String                   ← AI_MODEL | MANUAL | SYSTEM
├── createdAt

Index:
  @@index([projectionDate])
```

### 3.8 ExchangeRate (NEW)

**Purpose:** Official exchange rates for multi-currency support.

```
ExchangeRate
├── id: String (UUID, PK)
├── fromCurrency: String
├── toCurrency: String
├── rate: Float
├── date: DateTime
├── source: String                   ← CENTRAL_BANK | MANUAL | MARKET
├── approvedBy: String? (FK → User)
├── approvedAt: DateTime?
├── createdAt

Unique: [fromCurrency, toCurrency, date]
```

### 3.9 ReturnedPayment (NEW)

**Purpose:** Track returned payments, chargebacks, and reversals.

```
ReturnedPayment
├── id: String (UUID, PK)
├── paymentId: String (FK → Payment)
├── bankTransactionId: String? (FK → BankTransaction)
├── type: String                     ← RETURNED | CHARGEBACK | REVERSAL | STOPPED
├── reason: String
├── amount: Float
├── fees: Float @default(0)
├── status: String                   ← PENDING | PROCESSED | DISPUTED | RESOLVED
├── resolvedAt: DateTime?
├── resolvedBy: String? (FK → User)
├── journalEntryId: String? (FK → JournalEntry)
├── createdAt, archivedAt
```

### 3.10 New Models Summary

| # | Model | Lines | Purpose |
|---|-------|-------|---------|
| 1 | BankAccount | ~22 | Multi-bank account management |
| 2 | BankStatement | ~28 | Statement lifecycle |
| 3 | BankTransaction | ~30 | Statement line items |
| 4 | ReconciliationException | ~20 | Unmatched items tracking |
| 5 | PaymentGatewaySettlement | ~18 | Gateway settlement reconciliation |
| 6 | SuspenseTransaction | ~16 | Unidentified payments |
| 7 | CashForecast | ~14 | Daily cash forecasting |
| 8 | ExchangeRate | ~12 | FX rate management |
| 9 | ReturnedPayment | ~16 | Returned/chargeback payments |
| **Total** | **9 new models** | **~176 lines** | |

---

## PART 4: BANK STATEMENT IMPORT FRAMEWORK

### 4.1 Supported Formats

| Format | Type | Parser Complexity | Coverage |
|--------|------|-------------------|----------|
| **CSV** | File | Low — column mapping | Most banks |
| **Excel (XLSX)** | File | Low — sheet/column mapping | Common |
| **CAMT.053** | XML (ISO 20022) | Medium — standard XML structure | EU/international banks |
| **MT940** | SWIFT | Medium — structured text | Global banks |
| **REST API** | JSON | Medium — bank-specific format | Banks with APIs |
| **Manual entry** | Form | Low — user input | Any bank |

### 4.2 Import Pipeline

```
ImportEngine.import(bankAccountId, file, format):
  1. VALIDATE file:
     - File must not be empty
     - File must be supported format
     - Check for duplicate statement (same account + period)
  
  2. PARSE into standardized format:
     parser = getParser(format)
     rawTransactions = parser.parse(file)
     
     // Normalize:
     normalized = rawTransactions.map(t => ({
       transactionDate: normalizeDate(t.date),
       valueDate: normalizeDate(t.valueDate),
       reference: normalizeRef(t.reference || extractRef(t.description)),
       description: cleanDescription(t.description),
       amount: parseAmount(t.amount),
       type: amount >= 0 ? "CREDIT" : "DEBIT",
       currency: t.currency || bankAccount.currency,
     }))
  
  3. COMPUTE statement summary:
     openingBalance = parser.getOpeningBalance(file)
     closingBalance = parser.getClosingBalance(file)
     totalCredits = sum(normalized.filter(t => t.type == "CREDIT"), amount)
     totalDebits = abs(sum(normalized.filter(t => t.type == "DEBIT"), amount))
  
  4. VALIDATE statement:
     expectedClosing = openingBalance + totalCredits - totalDebits
     IF abs(expectedClosing - closingBalance) > 0.01:
       FLAG: "Statement does not balance"
  
  5. CREATE BankStatement + BankTransactions:
     statement = BankStatement.create({
       bankAccountId, periodStart, periodEnd, ...summary,
       importSource, importFormat, originalFilename,
       status: "PARSED"
     })
     transactions = BankTransaction.createMany(
       normalized.map(t => ({ bankStatementId: statement.id, ...t }))
     )
  
  6. TRIGGER reconciliation (auto):
     ReconciliationEngine.start(statement.id)
  
  7. RETURN { statement, transactionCount: transactions.length }
```

### 4.3 Reference Extraction

```javascript
function extractRef(description) {
  // Common patterns across banks:
  patterns = [
    /INV-\d+/i,             // INV-2026-00123
    /INV\d+/i,              // INV202600123
    /CUS-\d+/i,             // Customer reference
    /Pmt[- ]?\d+/i,         // Payment ID
    /[A-Z]{3}\d{6,}/i,      // Generic reference code
    /\b\d{6,12}\b/,         // Any 6-12 digit number
  ]
  for (pattern of patterns) {
    match = description.match(pattern)
    if (match) return match[0]
  }
  return null
}
```

---

## PART 5: RECONCILIATION ENGINE

### 5.1 Matching Rules

| Rule | Priority | Match Criteria | Confidence | Example |
|------|----------|---------------|------------|---------|
| **EXACT_REFERENCE** | 1 | Reference matches + amount within 0.01 | 1.0 | INV-2026-00123 = EGP 1,250.00 |
| **EXACT_AMOUNT_DATE** | 2 | Amount matches + date within 1 day | 0.95 | EGP 1,250.00 on 2026-07-15 |
| **FUZZY_REFERENCE** | 3 | Reference fuzzy match + amount within 0.01 | 0.90 | INV202600123 vs INV-2026-00123 |
| **CUSTOMER_NAME** | 4 | Customer name in description + amount match | 0.85 | "EgyptAir" in desc + EGP 5K |
| **AMOUNT_ONLY** | 5 | Amount matches + no other candidates | 0.70 | Only one EGP 1,250.00 payment |
| **SPLIT_MATCH** | 6 | Amount = sum of 2+ payments | 0.60 | Bank line EGP 5K = 2 × EGP 2.5K |
| **AI_SUGGESTED** | 7 | ML model recommends match | 0.50-0.95 | Based on historical patterns |

### 5.2 Reconciliation Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ RECONCILIATION WORKBENCH                                                      │
│                                                                              │
│ Statement: NBE Current Account  ·  Period: 2026-07-01 → 2026-07-31          │
│ Opening: EGP 1,250,000  ·  Closing: EGP 1,380,000  ·  Match Rate: 92%     │
│                                                                              │
│ ┌─── MATCHED (45/50) ────────────────────────────────────────────────────┐  │
│ │ Date       │ Ref          │ Description      │ Amount  │ Match │ Conf  │  │
│ │ 2026-07-15 │ INV-2026-123 │ EgyptAir payment  │ +45,200 │ EXACT │ 1.0   │  │
│ │ 2026-07-18 │ INV-2026-131 │ Nile Corp payment │ +12,000 │ REF   │ 0.95  │  │
│ │ ...        │              │                   │         │       │       │  │
│ └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│ ┌─── UNMATCHED (5/50) ────────────────────────────────────────────────────┐  │
│ │ Date       │ Description               │ Amount  │ Suggested │ Action   │  │
│ │ 2026-07-20 │ Bank fee - July           │ -250    │ Bank Fee  │ [Accept] │  │
│ │ 2026-07-22 │ Interest credit           │ +180    │ Interest  │ [Accept] │  │
│ │ 2026-07-25 │ EFT deposit - UNKNOWN     │ +8,500  │ Unident.  │ [Invest.]│  │
│ │ 2026-07-28 │ Wire transfer - UNKNOWN   │ +15,000 │ Suspense  │ [Susp.]  │  │
│ │ 2026-07-30 │ Amount diff - INV-2026-145│ +5,000  │ Partial   │ [Split]  │  │
│ └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│ [ RECONCILE ] [ VERIFY ] [ POST TO GL ] [ EXPORT REPORT ]                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 GL Posting After Reconciliation

```
When BankStatement status → POSTED:

  1. VERIFY bank GL account balance matches statement closingBalance:
     glBalance = GeneralLedgerEntry.findUnique({
       accountId: bankAccount.glAccountId,
       periodId: currentPeriod.id,
     })
     IF abs(glBalance.closingBalance - statement.closingBalance) > 0.01:
       FLAG: "GL balance mismatch — manual review required"
  
  2. CREATE summary journal entry (via W01 PostingEngine):
     // Only for unmatched/adjustment items
     FOR each unmatched transaction:
       IF transaction.type == bank_fee:
         PostingEngine.post({
           eventType: "BANK_FEE",
           amount: abs(transaction.amount),
           debitAccount: BANK_CHARGES_ACCOUNT,
           creditAccount: bankAccount.glAccountId,
         })
       IF transaction.type == interest:
         PostingEngine.post({
           eventType: "BANK_INTEREST",
           amount: transaction.amount,
           debitAccount: bankAccount.glAccountId,
           creditAccount: INTEREST_INCOME_ACCOUNT,
         })
       IF transaction.type == unknown_credit:
         PostingEngine.post({
           eventType: "SUSPENSE",
           amount: transaction.amount,
           debitAccount: bankAccount.glAccountId,
           creditAccount: SUSPENSE_ACCOUNT,
         })
  
  3. UPDATE BankAccount:
     lastReconciledAt = now()
     lastReconciledBalance = statement.closingBalance
     currentBalance = statement.closingBalance
```

---

## PART 6: PAYMENT GATEWAY RECONCILIATION

### 6.1 Gateway vs Bank Statement Matching

```
PaymentGateway (Paymob, Fawry, Stripe, etc.)
    │
    ├──→ Gateway Settlement Statement (daily/weekly)
    │     Total: EGP 125,000
    │     Fees:  EGP 1,875 (1.5%)
    │     Net:   EGP 123,125
    │
    └──→ Bank Statement (net settlement arrives 2-3 days later)
          Deposit: EGP 123,125 on 2026-07-18
          
GatewaySettlement.status → RECONCILED when:
  1. BankStatement has matching deposit within ±5 days
  2. Amount matches net settlement amount (within tolerance)
  3. Gateway transaction count = processed payment count in period
```

### 6.2 Gateway Fee Accounting

```
FOR each PaymentGatewaySettlement:
  fee = totalFees
  netSettlement = netAmount
  
  Journal Entry (via W01 PostingEngine):
    DR: Bank Account (1002-01)         netSettlement
    DR: Bank Charges (5105-01)         fee
    CR: Payment Gateway Clearing       totalAmount
  
  // Individual payment allocations already handled by W01:
  // Payment → DR: Cash, CR: AR (per payment)
```

---

## PART 7: EXCEPTION & INVESTIGATION WORKFLOW

### 7.1 Exception Types and Handling

| Exception Type | Description | Default Action | Escalation |
|----------------|-------------|----------------|------------|
| **UNMATCHED_DEBIT** | Bank debit with no matching payment | Flag → investigate | 48h → supervisor |
| **UNMATCHED_CREDIT** | Bank credit with no matching payment | Flag → suspense account | 24h → supervisor |
| **PARTIAL_MATCH** | Amount differs by < 1% | Flag → review | 72h → manager |
| **DUPLICATE** | Payment matched to 2+ bank lines | Flag → verify | 24h → supervisor |
| **AMOUNT_MISMATCH** | Amount differs by > 1% | Flag → investigate | 12h → manager |
| **UNIDENTIFIED** | No reference, no amount match | Flag → suspense | 48h → supervisor |
| **BANK_FEE** | Identified bank charge | Auto-post to fees | None |
| **INTEREST** | Identified interest | Auto-post to income | None |

### 7.2 Investigation Workflow

```
┌──────────┐
│  OPEN     │  Exception created by reconciliation engine
└────┬─────┘
     │
     ▼
┌──────────────┐
│ INVESTIGATING │  Assigned to reconciliation analyst
└──────┬───────┘
       │
  ┌────┴────────────────────────────┐
  │                                 │
  ▼                                 ▼
┌──────────┐                  ┌──────────┐
│ RESOLVED  │                  │ DISMISSED│  (false positive)
└────┬─────┘                  └──────────┘
     │
     ▼
┌──────────┐
│  POSTED   │  GL entry created if needed
└──────────┘
```

---

## PART 8: AI CASH INTELLIGENCE AGENT

### 8.1 Agent Design

**Agent Name:** Cash Intelligence Agent  
**Framework:** C12-W07 Operational Intelligence  
**Autonomy Level:** ⚡ Semi-autonomous  

| Capability | Autonomy | Human Approval |
|------------|----------|----------------|
| Payment anomaly detection | ✅ Full | None (read-only alert) |
| Reconciliation suggestions | ⚡ Semi | Required for auto-match |
| Duplicate payment detection | ✅ Full | None (read-only alert) |
| Bank fee identification | ✅ Full | Auto-classify |
| Cash flow prediction | ✅ Full | None (forecast only) |
| Liquidity forecasting | ✅ Full | None (forecast only) |

### 8.2 Anomaly Detection

```
ALGORITHM: detectPaymentAnomalies():
  1. UNUSUALLY LARGE PAYMENTS:
     payments = Payment.findWhere(amount > 3× avg for customer)
     → FLAG: "Unusually large payment from {customer}"
  
  2. PAYMENT FREQUENCY ANOMALY:
     payments = Payment.findWhere(customer has 2+ payments in same day)
     → FLAG: "Multiple payments from {customer} on same day — possible duplicate"
  
  3. GATEWAY vs BANK DELAY:
     settlements = PaymentGatewaySettlement.findWhere(
       status = "SETTLED" AND
       no matching BankTransaction within 5 days
     )
     → FLAG: "Gateway settlement not yet reflected in bank statement"
  
  4. BANK FEE VARIANCE:
     fees = BankTransaction.findWhere(category = "FEE")
     IF month's total fees > 1.5× average:
       → FLAG: "Bank fees higher than normal — review fee schedule"
  
  5. UNEXPECTED BALANCE DROP:
     IF bankAccount.currentBalance < 0.2 × avgBalance:
       → FLAG: "Account balance below 20% of average — liquidity risk"
```

### 8.3 Cash Flow Prediction

```
ALGORITHM: forecastCashFlow(days = 30):
  forecast = []
  
  FOR day IN next 30 days:
    scheduledInflows = 0
    scheduledOutflows = 0
    
    // Expected payments from customers (weighted by payment probability)
    dueInvoices = Invoice.findWhere(dueDate = day)
    FOR each invoice:
      probability = CustomerRiskProfile.getProbability(invoice.customerId)
      scheduledInflows += invoice.amount × probability
    
    // Expected collections (from W04 PTPs)
    ptps = PromiseToPay.findWhere(promisedDate = day, status = "PENDING")
    scheduledInflows += SUM(ptps, promisedAmount) × 0.85  // 85% PTP kept rate
    
    // Expected fees and outflows
    scheduledOutflows += estimatedOperatingCosts(day)
    
    netFlow = scheduledInflows - scheduledOutflows
    closingBalance = previousDay.closingBalance + netFlow
    
    forecast.push({ date: day, inflows, outflows, netFlow, closingBalance, confidence })
  
  RETURN { forecast, minBalance, maxBalance, lowPoint, lowPointDate }
```

---

## PART 9: DASHBOARDS & REPORTING

### 9.1 Cash Position Dashboard (`/admin/cash/position`)

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ CASH POSITION DASHBOARD                                                                 │
│                                                                                         │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│ │ Total Cash   │ │ Total Inflow │ │ Total Outf.  │ │ Net Cash     │ │ Accounts     │  │
│ │ EGP 3.2M     │ │ Today        │ │ Today        │ │ Flow Trend   │ │ Reconciled   │  │
│ │              │ │ EGP 125K     │ │ EGP 85K      │ │ 📈 +40K      │ │ 8/12         │  │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                                                         │
│ ┌──────────────────────────────────────────────────────────────────────────────────┐   │
│ │ BANK ACCOUNTS                                                                      │   │
│ │ ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐   │   │
│ │ │ Account  │ Currency │ Balance  │ Avail    │ Last Rec │ Status   │ Recon    │   │   │
│ │ │ NBE Curr │ EGP      │ 1,850,000│1,850,000 │ Jul 28   │ ACTIVE   │ ✅       │   │   │
│ │ │ NBE USD  │ USD      │    45,000│   45,000 │ Jul 25   │ ACTIVE   │ ⚠ Pending│   │   │
│ │ │ CIB Curr │ EGP      │   950,000│   945,000│ Jul 28   │ ACTIVE   │ ✅       │   │   │
│ │ │ Paymob   │ EGP      │   385,000│   385,000│ Jul 28   │ SETTLE   │ ✅       │   │   │
│ │ └──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘   │   │
│ └──────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
│ ┌──────────────────────────────────┐ ┌──────────────────────────────────────────────┐  │
│ │ 7-DAY CASH FORECAST              │ │ RECONCILIATION STATUS                         │  │
│ │                                  │ │                                                │  │
│ │ Tomorrow:    +EGP 45K → 3.25M   │ │ ✅ NBE Current — Jul 2026 (45/50 matched)   │  │
│ │ Day 2:       -EGP 20K → 3.23M   │ │ ⚠ NBE USD — Jul 2026 (42/48 matched)       │  │
│ │ Day 3:       +EGP 120K → 3.35M  │ │ ✅ CIB Current — Jul 2026 (38/38 matched)    │  │
│ │ Day 4:       -EGP 15K → 3.34M   │ │ ✅ Paymob — Jul 2026 (Completed)             │  │
│ │ Day 5:       +EGP 60K → 3.40M   │ │ ⚠ Fawry — Jul 2026 (Pending)                │  │
│ │ Day 6:       -EGP 100K → 3.30M  │ │                                                │  │
│ │ Day 7:       +EGP 80K → 3.38M   │ │                                                │  │
│ │ Low point: Day 2 at EGP 3.23M   │ │ Next scheduled: 2026-08-01 (period close)    │  │
│ └──────────────────────────────────┘ └──────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Reconciliation Workbench (`/admin/cash/reconciliation/:statementId`)

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ RECONCILIATION WORKBENCH — NBE Current Account — Jul 2026                              │
│                                                                                       │
│ MATCH RATE: 90% │ Unmatched: 5 │ Partial: 2 │ As of: 2026-07-29 14:30                │
│                                                                                       │
│ ┌───── TAB: UNMATCHED (5) ────────────────────────────────────────────────────────┐  │
│ │ ☐ │ Date       │ Desc                  │ Amount  │ Type    │ Suggested          │  │
│ │ ☐ │ Jul 20     │ Bank Fee - July       │ -250    │ DEBIT   │ 🅐 Bank Fee → [Ok]│  │
│ │ ☐ │ Jul 22     │ Interest Credit       │ +180    │ CREDIT  │ 🅐 Interest → [Ok] │  │
│ │ ☐ │ Jul 25     │ EFT - UNKNOWN REF     │ +8,500  │ CREDIT  │ 🅐 Search...       │  │
│ │ ☐ │ Jul 28     │ INV-2026-145 PARTIAL  │ +5,000  │ CREDIT  │ 🅐 Split match     │  │
│ │ ☐ │ Jul 29     │ Wire - UNKNOWN        │ +15,000 │ CREDIT  │ 🅐 Suspense        │  │
│ │                                                                                   │  │
│ │ [ Match Selected ]  [ Send to Suspense ]  [ Investigate ]  [ Dismiss ]            │  │
│ └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                       │
│ ┌───── MATCHED (45/50) ──────────────────────────────────────────────────────────┐   │
│ │ Showing last 5 of 45 matched items                                             │   │
│ │ INV-2026-123 │ EGP 45,200 │ Jul 15 │ EXACT Ref: INV-2026-123 │ Confidence 1.0 │   │
│ │ INV-2026-131 │ EGP 12,000 │ Jul 18 │ EXACT Ref: INV-2026-131 │ Confidence 1.0 │   │
│ │ PTP-2026-78  │ EGP 3,200  │ Jul 20 │ AMOUNT+DATE            │ Confidence 0.95│   │
│ └───────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

### 9.3 Treasury Dashboard (`/admin/cash/treasury`)

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ TREASURY DASHBOARD                                                                      │
│                                                                                       │
│ ┌──────────────────────────────┐ ┌──────────────────────────────────────────────────┐│
│ │ CASH POSITION TREND (30 days) │ │ LIQUIDITY RATIOS                                ││
│ │                              │ │                                                  ││
│ │  3.5M  █████████████████████  │ │ Current Ratio:       2.1 (Target: > 1.5)       ││
│ │  3.0M  ██████████████████    │ │ Quick Ratio:          1.8 (Target: > 1.0)       ││
│ │  2.5M  █████████████████     │ │ Cash Ratio:           0.8 (Target: > 0.3)       ││
│ │  2.0M  ████████████████      │ │ Days Cash on Hand:    45 days                    ││
│ │  1.5M  █████████████         │ │                                                  ││
│ │                              │ │ FX Exposure:          USD 45,000 @ 30.5         ││
│ └──────────────────────────────┘ └──────────────────────────────────────────────────┘│
│                                                                                       │
│ ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│ │ FORECAST ACCURACY (Last 30 days)                                                   │  │
│ │ ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐   │  │
│ │ │ Metric   │ Week 1   │ Week 2   │ Week 3   │ Week 4   │ Avg      │ Trend    │   │  │
│ │ │ Accuracy │ 92%      │ 88%      │ 94%      │ 90%      │ 91%      │ 📈       │   │  │
│ │ │ Inflow   │ 95%      │ 90%      │ 96%      │ 91%      │ 93%      │ ✅       │   │  │
│ │ │ Outflow  │ 88%      │ 85%      │ 91%      │ 88%      │ 88%      │ 📈       │   │  │
│ │ └──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘   │  │
│ └──────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 10: INTEGRATION STRATEGY

### 10.1 Integration Points

| Source | Trigger | W05 Action | Timing |
|--------|---------|------------|--------|
| **W01 PostingEngine** | Payment journal posted | Match against bank statement | Continuous |
| **W01 GL** | Bank GL account query | Verify statement closing = GL closing | Per statement |
| **W01 FinancialPeriod** | Period close | All statements must be RECONCILED before close | Monthly gate |
| **W02 Revenue Assurance** | Payment discrepancy | Flag for reconciliation investigation | On detection |
| **W03 Tariff** | Not directly | N/A | — |
| **W04 Collections** | Payment received | Update customer payment profile | Continuous |
| **C12-W07** | AI recommendations | Reconciliation suggestions + anomaly alerts | Continuous |
| **Notifications** | Exception created | Notify reconciliation team | On creation |
| **Audit** | All reconciliation actions | Log to AuditEntry | Always |

### 10.2 Period Close Gate

```
BEFORE FinancialPeriod.close():
  1. CHECK all BankStatements for period:
     FOR each active BankAccount:
       latest = BankStatement.findFirst({
         bankAccountId, periodEnd: { gte: periodEnd },
         status: { not: "POSTED" }
       })
       IF latest:
         BLOCK close: "Bank account {accountName} has unreconciled statements"
  
  2. CHECK all PaymentGatewaySettlements for period:
     FOR each active PaymentGateway:
       pending = PaymentGatewaySettlement.findFirst({
         gatewayId, periodEnd: { gte: periodEnd },
         status: { not: "RECONCILED" }
       })
       IF pending:
         WARN: "Gateway {gatewayName} has unreconciled settlements"
  
  3. ALLOW close with warnings only (not blocking for gateways)
```

---

## PART 11: TESTING STRATEGY — W05 (105 Tests)

### 11.1 Statement Import Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Import CSV with 50 transactions → 50 BankTransactions | Correct count |
| 2 | Import CAMT.053 XML → parsed correctly | Standard format |
| 3 | Import MT940 → parsed correctly | SWIFT format |
| 4 | Import duplicate statement → rejected | Duplicate check |
| 5 | Statement with unbalanced entries → warning | Validation |
| 6 | Empty file → rejected | Validation |
| 7 | Unknown format → rejected | Validation |
| 8 | Reference extraction from description → found | Extract |

### 11.2 Auto-Reconciliation Tests (25)

| # | Test | Expect |
|---|------|--------|
| 1 | Exact reference match → MATCHED confidence 1.0 | Rule 1 |
| 2 | Amount + date match → MATCHED confidence 0.95 | Rule 2 |
| 3 | Fuzzy reference match → MATCHED confidence 0.90 | Rule 3 |
| 4 | Customer name match → MATCHED confidence 0.85 | Rule 4 |
| 5 | Amount-only match (single candidate) → MATCHED 0.70 | Rule 5 |
| 6 | Split match (1 bank = 2 payments) → PARTIAL | Rule 6 |
| 7 | No match → UNMATCHED | Not found |
| 8 | Multiple candidates → UNMATCHED (ambiguous) | Ambiguous |
| 9 | Amount differs by 0.01 → still matched within tolerance | Tolerance |
| 10 | Amount differs by 1.00 → PARTIAL with diff | Beyond tolerance |

### 11.3 Gateway Reconciliation Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | Gateway settlement → Bank deposit matches net | Reconciled |
| 2 | Settlement with fees → fee journal created | Fee accounted |
| 3 | Settlement without bank match → PENDING | Awaiting |
| 4 | Multiple gateways → independent reconciliation | Per gateway |

### 11.4 Exception Handling Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Unmatched credit → exception created | OPEN |
| 2 | Unmatched debit → exception created | OPEN |
| 3 | Partial match → exception with amount diff | PARTIAL |
| 4 | Duplicate detection → 2 exception records | DUPLICATE |
| 5 | Investigate → status INVESTIGATING | Correct state |
| 6 | Manual match → resolved | RESOLVED |
| 7 | Dismiss false positive → DISMISSED | Correct state |
| 8 | Auto-fee → posted without investigation | Auto-resolve |

### 11.5 Bank Fee & Interest Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | Bank fee detected → auto-classified | Category = FEE |
| 2 | Bank fee journal → DR: Bank Charges CR: Bank | GL correct |
| 3 | Interest detected → auto-classified | Category = INTEREST |
| 4 | Interest journal → DR: Bank CR: Interest Income | GL correct |

### 11.6 Multi-Currency Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | USD transaction → uses exchange rate | FX applied |
| 2 | USD → EGP conversion → correct baseAmount | Calculation |
| 3 | Exchange rate update → new rate on correct date | Date-based |
| 4 | FX gain → journal entry created | Gain posted |
| 5 | FX loss → journal entry created | Loss posted |

### 11.7 Cash Forecasting Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | 30-day forecast generated | Complete |
| 2 | Weighted by payment probability | Correct |
| 3 | PTP promises included | 85% factor |
| 4 | Low point identified correctly | Min balance |
| 5 | Forecast accuracy tracked | Comparison |

### 11.8 Suspense & Returned Payment Tests (5)

| # | Test | Expect |
|---|------|--------|
| 1 | Unidentified payment → suspense account | Suspense created |
| 2 | Suspense resolved → allocated to customer | Allocated |
| 3 | Chargeback → ReturnedPayment + reversal | Correct flow |

### 11.9 GL Integration Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | Reconciliation → statement closing = GL balance | Match |
| 2 | Reconciliation → statement closing ≠ GL → warning | Mismatch |
| 3 | Bank fee journal → GL updated | Correct account |
| 4 | Interest journal → GL updated | Correct account |
| 5 | Period close blocked if unreconciled | Gate enforced |

---

## PART 12: W05 DEFINITION OF DONE

```
W05 — BANK RECONCILIATION & CASH MANAGEMENT
CERTIFICATION CHECKLIST

□ CORE DATA MODELS — 9 NEW
   □ BankAccount (multi-bank hierarchy)
   □ BankStatement (statement lifecycle)
   □ BankTransaction (statement line items)
   □ ReconciliationException (unmatched items)
   □ PaymentGatewaySettlement (gateway reconciliation)
   □ SuspenseTransaction (unidentified payments)
   □ CashForecast (daily forecasting)
   □ ExchangeRate (FX management)
   □ ReturnedPayment (chargebacks/reversals)

□ STATEMENT IMPORT — 5 FORMATS
   □ CSV parser
   □ Excel (XLSX) parser
   □ CAMT.053 (ISO 20022) parser
   □ MT940 (SWIFT) parser
   □ Manual entry form

□ RECONCILIATION ENGINE
   □ Rule-based matching (7 rules, priority-ordered)
   □ AI-assisted matching
   □ Manual matching workbench
   □ Split payment handling
   □ Partial match tracking

□ GATEWAY RECONCILIATION
   □ PaymentGatewaySettlement model
   □ Gateway vs bank match
   □ Fee auto-accounting
   □ Settlement period management

□ EXCEPTION MANAGEMENT
   □ 8 exception types
   □ Full investigation lifecycle
   □ Auto-resolution for fees/interest
   □ Manual matching workbench

□ GL INTEGRATION
   □ Statement closing = GL balance verification
   □ Bank fee journal posting (DR: Bank Charges, CR: Bank)
   □ Interest journal posting (DR: Bank, CR: Interest Income)
   □ Suspense account posting
   □ Period close gate (unreconciled = blocked)

□ CASH MANAGEMENT
   □ Cash position dashboard (real-time)
   □ 30-day cash flow forecast
   □ Multi-currency support
   □ FX rate management
   □ Liquidity ratio tracking

□ AI CASH INTELLIGENCE AGENT
   □ Payment anomaly detection (5 patterns)
   □ Reconciliation suggestions
   □ Cash flow prediction
   □ C12 AIRecommendation integration

□ DASHBOARDS
   □ Cash Position Dashboard (/admin/cash/position)
   □ Reconciliation Workbench (/admin/cash/reconciliation/:id)
   □ Treasury Dashboard (/admin/cash/treasury)

□ SECURITY
   □ RBAC: Reconciliation Analyst, Treasury Manager, Finance Admin
   □ Segregation: reconcile ≠ approve ≠ post
   □ Statement immutability after POSTED
   □ All mutations audited

□ TESTS — 105 PASSING
   □ Statement import: 20 tests
   □ Auto-reconciliation: 25 tests
   □ Gateway reconciliation: 10 tests
   □ Exception handling: 15 tests
   □ Bank fee & interest: 10 tests
   □ Multi-currency: 10 tests
   □ Cash forecasting: 10 tests
   □ Suspense & returns: 5 tests
   □ GL integration: 10 tests

W05 STATUS: □ NOT IMPLEMENTED
All items above are DESIGN-COMPLETE but not executed.
```

---

## APPENDIX A: W05 FILE MANIFEST

| # | File | Action | Lines |
|---|------|--------|-------|
| 1 | `backend/prisma/schema.prisma` | MODIFY | +180 lines (9 new models) |
| 2 | Migration: bank_reconciliation | CREATE | Standard |
| 3 | `backend/src/services/statement-importer.js` | **CREATE** | ~200 lines (parsers) |
| 4 | `backend/src/services/reconciliation-engine.js` | **CREATE** | ~300 lines (matching) |
| 5 | `backend/src/services/gateway-reconciliation.js` | **CREATE** | ~120 lines |
| 6 | `backend/src/services/cash-forecast.js` | **CREATE** | ~150 lines |
| 7 | `backend/src/services/exchange-rate.js` | **CREATE** | ~80 lines |
| 8 | `backend/src/services/suspense-engine.js` | **CREATE** | ~80 lines |
| 9 | `backend/src/services/cash-ai.js` | **CREATE** | ~120 lines |
| 10 | `backend/src/routes/bank-reconciliation.js` | **CREATE** | ~300 lines |
| 11 | `backend/src/routes/cash-management.js` | **CREATE** | ~150 lines |
| 12 | `backend/src/services/posting-engine.js` | MODIFY | +10 lines (bank fee/interest types) |
| 13 | `backend/src/server.js` | MODIFY | +3 lines |
| 14 | `Frontend/src/app/admin/cash/position/page.tsx` | **CREATE** | ~250 lines |
| 15 | `Frontend/src/app/admin/cash/reconciliation/[id]/page.tsx` | **CREATE** | ~350 lines |
| 16 | `Frontend/src/app/admin/cash/treasury/page.tsx` | **CREATE** | ~250 lines |
| 17 | `Frontend/src/app/admin/cash/accounts/page.tsx` | **CREATE** | ~200 lines |

**Total estimated new code:** ~2,800 lines
**Total estimated tests:** 105 tests
**Cumulative C13 (W01-W05):** 85 + 95 + 100 + 105 + 105 = 490 tests

---

*This document is a planning artifact only. No code, no implementation, no database migration.*
*C13-W05 — Bank Reconciliation & Cash Management. READ ONLY. GOVERNANCE PLANNING ONLY.*
