# Accounting Domain

**File:** `02_BILLING_FINANCE/accounting/DOMAIN.md`
**Domain ID:** MV-DOM-013
**Priority:** P0 — Critical Path (MISSING — Must Build)
**Status:** 🔴 NOT IMPLEMENTED — Enterprise Planning Phase

---

## Business Purpose
The Accounting domain provides double-entry bookkeeping, general ledger management, financial period control, and financial reporting for the entire MeterVerse enterprise. This domain is the financial backbone that ensures every monetary transaction is recorded, traceable, and auditable.

## Business Owner
Chief Financial Officer / Accounting Director

## Enterprise Scope
- Chart of Accounts management (hierarchical account structure)
- Double-entry journal entries (debit/credit pairs)
- General Ledger (aggregated account balances)
- Trial Balance (period-end validation)
- Financial periods (open/close cycles)
- Multi-currency support with exchange rates
- Bank reconciliation
- Accounts Receivable / Payable aging
- Financial reporting (P&L, Balance Sheet, Cash Flow)
- Audit trail for every financial transaction
- Tax determination and reporting

## Capabilities

| Capability | Sub-capabilities | Status |
|-----------|------------------|--------|
| Chart of Accounts | Create, Import, Hierarchical, Map to groups | 🔴 Missing |
| Journal Entry | Debit/Credit pairs, Multi-currency, Period assignment | 🔴 Missing |
| General Ledger | Account balances, Period balances, Drill-down | 🔴 Missing |
| Trial Balance | Period-end, Account groups, Variance analysis | 🔴 Missing |
| Financial Periods | Open, Close, Re-open, Archive | 🔴 Missing |
| Bank Reconciliation | Statement import, Match transactions, Flag differences | 🔴 Missing |
| Multi-Currency | Exchange rates, Gain/Loss, Revaluation | 🔴 Missing |
| Accounts Receivable | Customer aging, Collection status, Provisions | 🔴 Missing |
| Accounts Payable | Vendor aging, Payment scheduling | 🔴 Missing |
| Financial Reports | P&L, Balance Sheet, Cash Flow, Trial Balance | 🔴 Missing |

## Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| ACG-001 | Every journal entry must balance (total debits = total credits) | Application rule |
| ACG-002 | Journal entries cannot be modified after period close | Immutability rule |
| ACG-003 | A period cannot be closed if it has unposted entries | Workflow rule |
| ACG-004 | An account cannot have a negative balance if it is an asset type | Validation rule |
| ACG-005 | Currency exchange rates must be approved before use | Workflow rule |
| ACG-006 | Journal entries require a description and reference | Validation rule |
| ACG-007 | Debit/Credit amounts must be positive numbers | Validation rule |
| ACG-008 | Chart of Accounts codes must be unique | Unique constraint |

## Proposed Database Schema

```prisma
model Account {
  id          String   @id @default(uuid())
  code        String   @unique
  name        String
  type        AccountType // ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
  category    AccountCategory // CURRENT, NON_CURRENT, OPERATING, etc.
  parentId    String?
  parent      Account?  @relation("AccountHierarchy", fields: [parentId], references: [id])
  children    Account[] @relation("AccountHierarchy")
  currency    String    @default("EGP")
  active      Boolean   @default(true)
  description String?
  createdAt   DateTime  @default(now())
  archivedAt  DateTime?
  updatedAt   DateTime  @updatedAt

  // Relations
  journalLines JournalLineItem[]
  ledgers      GeneralLedgerEntry[]

  @@index([type, active])
  @@index([parentId])
}

model JournalEntry {
  id          String   @id @default(uuid())
  entryNumber String   @unique
  description String
  entryDate   DateTime
  periodId    String
  period      FinancialPeriod @relation(fields: [periodId], references: [id])
  status      JournalStatus // DRAFT, POSTED, REVERSED
  source      String   // BILLING, PAYMENT, MANUAL, ADJUSTMENT
  referenceId String?  // Links to source invoice, payment, etc.
  referenceType String? // INVOICE, PAYMENT, MANUAL
  totalDebit  Float    @default(0)
  totalCredit Float    @default(0)
  createdBy   String?
  postedAt    DateTime?
  reversedAt  DateTime?
  createdAt   DateTime @default(now())
  archivedAt  DateTime?

  // Relations
  lines JournalLineItem[]

  @@index([periodId, status])
  @@index([entryDate])
  @@index([referenceType, referenceId])
}

model JournalLineItem {
  id          String  @id @default(uuid())
  journalId   String
  journal     JournalEntry @relation(fields: [journalId], references: [id], onDelete: Cascade)
  accountId   String
  account     Account @relation(fields: [accountId], references: [id])
  description String?
  debitAmount Float   @default(0)
  creditAmount Float  @default(0)
  currency    String  @default("EGP")
  exchangeRate Float  @default(1)
  createdAt   DateTime @default(now())

  @@index([accountId, journalId])
  @@index([journalId])
}

model GeneralLedgerEntry {
  id          String   @id @default(uuid())
  accountId   String
  account     Account  @relation(fields: [accountId], references: [id])
  periodId    String
  period      FinancialPeriod @relation(fields: [periodId], references: [id])
  openingBalance Float  @default(0)
  totalDebit  Float    @default(0)
  totalCredit Float    @default(0)
  closingBalance Float @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([accountId, periodId])
  @@index([periodId])
}

model FinancialPeriod {
  id        String   @id @default(uuid())
  year      Int
  month     Int
  quarter   Int
  startDate DateTime
  endDate   DateTime
  status    PeriodStatus // OPEN, CLOSED, LOCKED
  openedAt  DateTime  @default(now())
  closedAt  DateTime?
  closedBy  String?
  createdAt DateTime  @default(now())
  archivedAt DateTime?

  // Relations
  journalEntries JournalEntry[]
  ledgers        GeneralLedgerEntry[]

  @@unique([year, month])
  @@index([status, year, quarter])
}

model ExchangeRate {
  id        String   @id @default(uuid())
  fromCurrency String
  toCurrency   String
  rate      Float
  date      DateTime
  approvedBy String?
  approvedAt DateTime?
  createdAt DateTime @default(now())

  @@unique([fromCurrency, toCurrency, date])
}

model BankStatement {
  id            String   @id @default(uuid())
  bankAccountId String
  statementDate DateTime
  reference     String
  description   String?
  amount        Float
  type          BankTransactionType // CREDIT, DEBIT
  matched       Boolean  @default(false)
  matchedTo     String?  // PaymentTransaction ID
  matchedAt     DateTime?
  createdAt     DateTime @default(now())
  archivedAt    DateTime?

  @@index([bankAccountId, statementDate])
  @@index([matched])
}
```

## API Endpoints Required

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/accounts` | List chart of accounts |
| POST | `/api/accounts` | Create account |
| PUT | `/api/accounts/:id` | Update account |
| DELETE | `/api/accounts/:id` | Deactivate account |
| GET | `/api/journal-entries` | List journal entries |
| POST | `/api/journal-entries` | Create journal entry |
| GET | `/api/journal-entries/:id` | Get journal entry with lines |
| POST | `/api/journal-entries/:id/post` | Post journal entry |
| POST | `/api/journal-entries/:id/reverse` | Reverse journal entry |
| GET | `/api/general-ledger` | Get ledger balances |
| GET | `/api/trial-balance` | Trial balance report |
| GET | `/api/financial-periods` | List periods |
| POST | `/api/financial-periods/:id/close` | Close period |
| GET | `/api/bank-reconciliation` | Reconciliation status |
| POST | `/api/bank-reconciliation/match` | Match transaction |

## Dependencies

| Domain | Type | Description |
|--------|------|-------------|
| Invoice | Source | Invoice transactions post to AR accounts |
| Payment | Source | Payment transactions post to Cash accounts |
| Journal | Sibling | Journals are the input to General Ledger |
| Collection | Source | Bad debt provisions post to expense accounts |
| Wallet | Source | Wallet top-ups and usage post to liability accounts |
| Configuration | Required | Account mapping rules, tax rates |
| Billing | Source | Billing transactions post to revenue accounts |

## Implementation Priority: P0 — Critical
**Wave:** 07 (NEW — Must be added to planning)  
**Phase:** Financial Infrastructure  
**Estimated Sessions:** 25 sessions  
**Dependencies:** Invoice, Payment, Collection  
**Risk:** HIGH — No existing database models. Complete schema migration required.
**Rollback:** Feature flag on accounting features. Financial periods can be re-opened.

## Definition of Done
Accounting domain fully implemented with chart of accounts, journal entries, and GL posting.

## Acceptance Criteria
Accounts created. Journal entries post correctly. Trial balance balanced.
