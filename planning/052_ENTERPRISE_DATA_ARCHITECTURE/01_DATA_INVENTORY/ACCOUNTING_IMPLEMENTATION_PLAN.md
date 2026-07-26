# Accounting Module — Implementation Plan

> **Phase:** 052 — Enterprise Data Architecture
> **Area:** 01 — Data Inventory
> **Status:** Planning
> **Date:** 2026-07-26

---

## Table of Contents

1. [Prisma Models (Database Schema)](#1-prisma-models)
2. [Backend API Endpoints](#2-backend-api-endpoints)
3. [Frontend Feature Structure](#3-frontend-feature-structure)
4. [Admin SPA Pages](#4-admin-spa-pages)
5. [Chart Components (Recharts)](#5-chart-components)
6. [Navigation & Store Updates](#6-navigation--store-updates)
7. [Implementation Order](#7-implementation-order)
8. [Data Flow Diagrams](#8-data-flow-diagrams)

---

## 1. Prisma Models

All models follow existing conventions:
- `@id @default(uuid())` for primary keys
- `archivedAt DateTime?` for soft-delete
- `@updatedAt @default(now())` for timestamps
- `String` for all IDs and enums (no native PG enums)

### 1.1 Account (Chart of Accounts)

```prisma
model Account {
  id          String    @id @default(uuid())
  code        String    @unique               // e.g. "1000", "2000-01"
  name        String                          // e.g. "Cash", "Accounts Receivable"
  type        String    @default("ASSET")     // ASSET | LIABILITY | EQUITY | REVENUE | EXPENSE
  category    String?                         // e.g. "Current Asset", "Operating Revenue"
  parentId    String?                         // Self-referencing parent (hierarchy)
  parent      Account?  @relation("AccountHierarchy", fields: [parentId], references: [id])
  children    Account[] @relation("AccountHierarchy")
  currency    String    @default("EGP")
  active      Boolean   @default(true)
  description String?
  createdAt   DateTime  @default(now())
  archivedAt DateTime?
  updatedAt   DateTime  @updatedAt

  journalLines  JournalLineItem[]
  ledgerEntries GeneralLedgerEntry[]

  @@index([type, active])
  @@index([parentId])
}
```

**Design notes:**
- `code` is unique (not `id`) — accounting codes are meaningful (e.g. "1100" = Cash)
- `type` stored as string (not enum) matching existing pattern (cf. `status` fields throughout schema)
- Self-referencing `parentId` enables tree traversal for roll-up reports
- `children` relation allows recursive queries for sub-ledger grouping

### 1.2 JournalEntry

```prisma
model JournalEntry {
  id            String    @id @default(uuid())
  entryNumber   String    @unique               // Auto-generated: "JE-2026-00001"
  description   String?
  entryDate     DateTime  @default(now())
  periodId      String?
  period        FinancialPeriod? @relation(fields: [periodId], references: [id])
  status        String    @default("DRAFT")     // DRAFT | POSTED | REVERSED
  source        String    @default("MANUAL")    // BILLING | PAYMENT | MANUAL | ADJUSTMENT
  referenceId   String?                         // Optional link to source document (invoice ID, etc.)
  referenceType String?                         // "INVOICE" | "PAYMENT" | etc.
  totalDebit    Float     @default(0)
  totalCredit   Float     @default(0)
  createdBy     String?
  postedAt      DateTime?
  createdAt     DateTime  @default(now())
  archivedAt    DateTime?

  lines     JournalLineItem[]
  lineItems JournalLineItem[]

  @@index([entryDate])
  @@index([periodId, status])
  @@index([entryNumber])
  @@index([source, referenceId])
}
```

**Design notes:**
- `entryNumber` is unique, auto-generated (`"JE-{year}-{sequential}"`)
- `periodId` links to FinancialPeriod for period-based reporting
- `source` + `referenceId/referenceType` enables traceability back to originating transactions
- `totalDebit` / `totalCredit` are computed denormalized fields (set on POST)

### 1.3 JournalLineItem

```prisma
model JournalLineItem {
  id           String    @id @default(uuid())
  journalId    String
  journal      JournalEntry @relation(fields: [journalId], references: [id], onDelete: Cascade)
  accountId    String
  account      Account      @relation(fields: [accountId], references: [id])
  description  String?
  debitAmount  Float     @default(0)
  creditAmount Float     @default(0)
  currency     String    @default("EGP")
  exchangeRate Float     @default(1)
  createdAt    DateTime  @default(now())

  @@index([journalId])
  @@index([accountId])
}
```

**Design notes:**
- One line item = one side of the entry (either debit or credit, never both > 0)
- In practice: `debitAmount > 0 XOR creditAmount > 0` enforced at application layer
- `currency` + `exchangeRate` supports multi-currency entries
- Cascade delete: removing a JournalEntry removes its lines

### 1.4 GeneralLedgerEntry

```prisma
model GeneralLedgerEntry {
  id             String    @id @default(uuid())
  accountId      String
  account        Account   @relation(fields: [accountId], references: [id])
  periodId       String?
  period         FinancialPeriod? @relation(fields: [periodId], references: [id])
  openingBalance Float     @default(0)
  totalDebit     Float     @default(0)
  totalCredit    Float     @default(0)
  closingBalance Float     @default(0)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@unique([accountId, periodId])
  @@index([accountId, periodId])
}
```

**Design notes:**
- Materialized aggregate per account per period (not transaction-level)
- `@@unique([accountId, periodId])` — one row per account-period
- Recalculated when a period is closed or a journal entry is posted/reversed
- `closingBalance = openingBalance + totalDebit - totalCredit` (for asset/expense accounts)

### 1.5 FinancialPeriod

```prisma
model FinancialPeriod {
  id         String    @id @default(uuid())
  year       Int
  month      Int                               // 1-12
  quarter    Int                               // 1-4 (computed: Math.ceil(month/3))
  startDate  DateTime
  endDate    DateTime
  status     String    @default("OPEN")        // OPEN | CLOSED | LOCKED
  openedAt   DateTime  @default(now())
  closedAt   DateTime?
  closedBy   String?
  createdAt  DateTime  @default(now())
  archivedAt DateTime?

  journalEntries JournalEntry[]
  ledgerEntries  GeneralLedgerEntry[]

  @@unique([year, month])
  @@index([year, quarter])
  @@index([status])
}
```

**Design notes:**
- `@@unique([year, month])` — one period per month
- `quarter` is denormalized (computed on create/update)
- CLOSED = finalization complete; LOCKED = immutable (even admins cannot modify)
- `openedAt` defaults to `now()` on creation

### 1.6 Migration Plan

```bash
# File: backend/prisma/migrations/<timestamp>_add_accounting_models/
# Or via schema push after generation:
npx prisma migrate dev --name add_accounting_models
```

**All models must be added to `schema.prisma` before any other work.**

---

## 2. Backend API Endpoints

All routes in `backend/src/routes/accounting.js` (new file), registered in `server.js`.

### 2.1 Route Structure

```
POST /api/accounting/accounts                    # Create account
GET  /api/accounting/accounts                    # List accounts (tree or flat)
GET  /api/accounting/accounts/:id                # Get account detail
PUT  /api/accounting/accounts/:id                # Update account
DELETE /api/accounting/accounts/:id              # Soft-delete account

POST /api/accounting/journal-entries              # Create draft entry
GET  /api/accounting/journal-entries              # List entries (paginated, filterable)
GET  /api/accounting/journal-entries/:id          # Get entry + line items
PUT  /api/accounting/journal-entries/:id          # Update draft entry
DELETE /api/accounting/journal-entries/:id        # Delete draft entry
POST /api/accounting/journal-entries/:id/post     # Post entry (compute totals, update GL)
POST /api/accounting/journal-entries/:id/reverse  # Reverse a posted entry

GET  /api/accounting/journal-line-items           # List line items (by journalId)
POST /api/accounting/journal-line-items           # Add line item to draft
PUT  /api/accounting/journal-line-items/:id       # Update line item
DELETE /api/accounting/journal-line-items/:id     # Remove line item

GET  /api/accounting/general-ledger               # GL by periodId (query param)
GET  /api/accounting/trial-balance               # Trial balance by periodId (query param)
GET  /api/accounting/income-statement             # P&L by periodId
GET  /api/accounting/balance-sheet                # Balance sheet by periodId

POST /api/accounting/financial-periods            # Create period
GET  /api/accounting/financial-periods            # List periods
GET  /api/accounting/financial-periods/:id        # Get period detail
POST /api/accounting/financial-periods/:id/close  # Close period (compute GL, prevent edits)
POST /api/accounting/financial-periods/:id/open   # Re-open period (admin only)
DELETE /api/accounting/financial-periods/:id      # Soft-delete
```

### 2.2 Key Endpoint Details

#### POST /journal-entries/:id/post
1. Validate: entry exists, status=DRAFT, lines exist, debits=credits
2. Set `status=POSTED`, `postedAt=now()`
3. Denormalize `totalDebit`, `totalCredit` from line items
4. Upsert `GeneralLedgerEntry` rows for each account in the period:
   - Increment `totalDebit` / `totalCredit`
   - Recompute `closingBalance`
5. `auditLog(req, "accounting.journal.posted", { journalId })`

#### POST /journal-entries/:id/reverse
1. Validate: entry exists, status=POSTED (cannot reverse a reversal)
2. Create a new JournalEntry (linked via `referenceId`) with:
   - Same line items but debits ↔ credits swapped
   - `source=ADJUSTMENT`, `description="Reversal of {entryNumber}"`
3. Post the reversal entry (same flow as above)
4. Set original entry `status=REVERSED`
5. `auditLog(req, "accounting.journal.reversed", { journalId })`

#### GET /trial-balance?periodId=X
```sql
-- Equivalent Prisma logic:
-- Group GeneralLedgerEntry by account for given period
-- Return: accountCode, accountName, accountType, openingBalance, totalDebit, totalCredit, closingBalance
```

#### POST /financial-periods/:id/close
1. Validate: status=OPEN, all previous periods are CLOSED/LOCKED
2. Compute GL entries for all accounts in this period
3. Compute opening balances for the next period
4. Set `status=CLOSED`, `closedAt=now()`, `closedBy=req.user.sub`
5. `auditLog(req, "accounting.period.closed", { periodId })`

### 2.3 Permissions

Add new permission entries for the accounting module:

| Permission Name | Module | Description |
|----------------|--------|-------------|
| `accounting.accounts.read` | accounting | View chart of accounts |
| `accounting.accounts.write` | accounting | Create/edit accounts |
| `accounting.journal.read` | accounting | View journal entries |
| `accounting.journal.create` | accounting | Create journal entries |
| `accounting.journal.post` | accounting | Post journal entries |
| `accounting.journal.reverse` | accounting | Reverse journal entries |
| `accounting.ledger.read` | accounting | View general ledger |
| `accounting.reports.read` | accounting | View trial balance / reports |
| `accounting.periods.manage` | accounting | Open/close financial periods |

### 2.4 File: `backend/src/routes/accounting.js`

Follow pattern from `backend/src/routes/admin.js`:
```javascript
import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

// ─── ACCOUNTS ────────────────────────────────────────────────────
router.get("/accounts", requirePermission("accounting.accounts.read"), async (req, res, next) => { ... })
// ... etc

export { router as accountingRouter }
```

### 2.5 Register in `server.js`

```javascript
import { accountingRouter } from "./routes/accounting.js"
app.use("/api/accounting", accountingRouter)
```

---

## 3. Frontend Feature Structure

### 3.1 Directory Layout

```
Frontend/src/features/accounting/
├── api/
│   ├── types.ts              # Response shapes, filter types, payloads
│   ├── service.ts            # Data access functions (fetch-based)
│   └── queries.ts            # React Query options + key factories
├── components/
│   ├── accounts/
│   │   ├── AccountTree.tsx               # Tree view of chart of accounts
│   │   ├── AccountForm.tsx               # Create/edit account form
│   │   └── AccountDetailSheet.tsx        # Slide-over detail panel
│   ├── journal/
│   │   ├── JournalEntryForm.tsx          # Multi-line journal entry form
│   │   ├── JournalEntryList.tsx          # Paginated list of entries
│   │   ├── JournalLineItemRow.tsx        # Single line item (debit/credit)
│   │   └── JournalEntryActions.tsx       # Post/Reverse/Delete buttons
│   ├── ledger/
│   │   ├── GeneralLedgerTable.tsx        # GL viewer table
│   │   └── LedgerAccountDetail.tsx       # Drill-down per account
│   ├── trial-balance/
│   │   ├── TrialBalanceTable.tsx         # Trial balance report
│   │   └── TrialBalanceSummary.tsx       # Totals row + variance
│   ├── periods/
│   │   ├── PeriodList.tsx                # Financial period grid
│   │   ├── PeriodCloseDialog.tsx         # Confirmation dialog for closing
│   │   └── PeriodStatusBadge.tsx         # OPEN/CLOSED/LOCKED badge
│   └── charts/
│       ├── AccountBalanceTrendChart.tsx   # LineChart (Recharts)
│       ├── PeriodComparisonChart.tsx      # BarChart (Recharts)
│       ├── ExpenseDistributionChart.tsx   # PieChart (Recharts)
│       └── CumulativeMetricChart.tsx      # AreaChart (Recharts)
├── schemas/
│   └── accounting-schemas.ts             # Zod schemas for forms
└── constants/
    └── accounting-constants.ts           # Account types, status options, etc.
```

### 3.2 `api/types.ts`

```typescript
// ─── Domain Types ─────────────────────────────────────────────────

export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE"
export type JournalStatus = "DRAFT" | "POSTED" | "REVERSED"
export type JournalSource = "BILLING" | "PAYMENT" | "MANUAL" | "ADJUSTMENT"
export type PeriodStatus = "OPEN" | "CLOSED" | "LOCKED"

export interface Account {
  id: string
  code: string
  name: string
  type: AccountType
  category: string | null
  parentId: string | null
  currency: string
  active: boolean
  description: string | null
  createdAt: string
  archivedAt: string | null
  updatedAt: string
  children?: Account[]
  balance?: number
}

export interface JournalEntry {
  id: string
  entryNumber: string
  description: string | null
  entryDate: string
  periodId: string | null
  status: JournalStatus
  source: JournalSource
  referenceId: string | null
  referenceType: string | null
  totalDebit: number
  totalCredit: number
  createdBy: string | null
  postedAt: string | null
  createdAt: string
  archivedAt: string | null
  lines?: JournalLineItem[]
  period?: FinancialPeriod
}

export interface JournalLineItem {
  id: string
  journalId: string
  accountId: string
  account?: Account
  description: string | null
  debitAmount: number
  creditAmount: number
  currency: string
  exchangeRate: number
  createdAt: string
}

export interface GeneralLedgerEntry {
  id: string
  accountId: string
  account?: Account
  periodId: string | null
  period?: FinancialPeriod
  openingBalance: number
  totalDebit: number
  totalCredit: number
  closingBalance: number
}

export interface FinancialPeriod {
  id: string
  year: number
  month: number
  quarter: number
  startDate: string
  endDate: string
  status: PeriodStatus
  openedAt: string
  closedAt: string | null
  closedBy: string | null
  createdAt: string
  archivedAt: string | null
}

// ─── Request/Response Types ──────────────────────────────────────

export interface AccountFilters {
  type?: AccountType
  active?: boolean
  search?: string
}

export interface JournalFilters {
  status?: JournalStatus
  source?: JournalSource
  periodId?: string
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  limit?: number
}

export interface CreateAccountPayload {
  code: string
  name: string
  type: AccountType
  category?: string
  parentId?: string
  currency?: string
  description?: string
}

export interface CreateJournalEntryPayload {
  entryDate: string
  periodId: string
  description?: string
  source?: JournalSource
  lines: CreateLineItemPayload[]
}

export interface CreateLineItemPayload {
  accountId: string
  description?: string
  debitAmount: number
  creditAmount: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface TrialBalanceRow {
  accountId: string
  accountCode: string
  accountName: string
  accountType: AccountType
  openingBalance: number
  totalDebit: number
  totalCredit: number
  closingBalance: number
}
```

### 3.3 `api/service.ts`

Follow pattern from `Frontend/src/features/users/api/service.ts`:

```typescript
import type {
  Account, AccountFilters, CreateAccountPayload,
  JournalEntry, JournalFilters, CreateJournalEntryPayload,
  JournalLineItem, CreateLineItemPayload,
  GeneralLedgerEntry, FinancialPeriod,
  TrialBalanceRow, PaginatedResponse
} from "./types"

const BASE = "/api/accounting"

// ─── Accounts ───────────────────────────────────────────────────
export async function fetchAccounts(filters?: AccountFilters): Promise<Account[]> { ... }
export async function fetchAccount(id: string): Promise<Account> { ... }
export async function createAccount(payload: CreateAccountPayload): Promise<Account> { ... }
export async function updateAccount(id: string, payload: Partial<CreateAccountPayload>): Promise<Account> { ... }
export async function deleteAccount(id: string): Promise<void> { ... }

// ─── Journal Entries ────────────────────────────────────────────
export async function fetchJournalEntries(filters?: JournalFilters): Promise<PaginatedResponse<JournalEntry>> { ... }
export async function fetchJournalEntry(id: string): Promise<JournalEntry> { ... }
export async function createJournalEntry(payload: CreateJournalEntryPayload): Promise<JournalEntry> { ... }
export async function updateJournalEntry(id: string, payload: Partial<CreateJournalEntryPayload>): Promise<JournalEntry> { ... }
export async function deleteJournalEntry(id: string): Promise<void> { ... }
export async function postJournalEntry(id: string): Promise<JournalEntry> { ... }
export async function reverseJournalEntry(id: string): Promise<JournalEntry> { ... }

// ─── Line Items ─────────────────────────────────────────────────
export async function fetchLineItems(journalId: string): Promise<JournalLineItem[]> { ... }
export async function createLineItem(payload: CreateLineItemPayload & { journalId: string }): Promise<JournalLineItem> { ... }
export async function updateLineItem(id: string, payload: Partial<CreateLineItemPayload>): Promise<JournalLineItem> { ... }
export async function deleteLineItem(id: string): Promise<void> { ... }

// ─── General Ledger ─────────────────────────────────────────────
export async function fetchGeneralLedger(periodId: string): Promise<GeneralLedgerEntry[]> { ... }

// ─── Trial Balance ──────────────────────────────────────────────
export async function fetchTrialBalance(periodId: string): Promise<TrialBalanceRow[]> { ... }

// ─── Financial Periods ──────────────────────────────────────────
export async function fetchFinancialPeriods(): Promise<FinancialPeriod[]> { ... }
export async function fetchFinancialPeriod(id: string): Promise<FinancialPeriod> { ... }
export async function createFinancialPeriod(payload: { year: number; month: number }): Promise<FinancialPeriod> { ... }
export async function closeFinancialPeriod(id: string): Promise<FinancialPeriod> { ... }
export async function openFinancialPeriod(id: string): Promise<FinancialPeriod> { ... }
```

### 3.4 `api/queries.ts`

```typescript
import { queryOptions } from "@tanstack/react-query"
import type { AccountFilters, JournalFilters } from "./types"
import * as accountingService from "./service"

export const accountingKeys = {
  all: ["accounting"] as const,
  accounts: {
    all: () => [...accountingKeys.all, "accounts"] as const,
    list: (filters?: AccountFilters) => [...accountingKeys.accounts.all(), "list", filters] as const,
    detail: (id: string) => [...accountingKeys.accounts.all(), "detail", id] as const,
  },
  journal: {
    all: () => [...accountingKeys.all, "journal"] as const,
    list: (filters?: JournalFilters) => [...accountingKeys.journal.all(), "list", filters] as const,
    detail: (id: string) => [...accountingKeys.journal.all(), "detail", id] as const,
  },
  ledger: {
    all: () => [...accountingKeys.all, "ledger"] as const,
    byPeriod: (periodId: string) => [...accountingKeys.ledger.all(), periodId] as const,
  },
  trialBalance: {
    byPeriod: (periodId: string) => [...accountingKeys.all, "trialBalance", periodId] as const,
  },
  periods: {
    all: () => [...accountingKeys.all, "periods"] as const,
    detail: (id: string) => [...accountingKeys.periods.all(), id] as const,
  },
}

export const accountsQueryOptions = (filters?: AccountFilters) =>
  queryOptions({
    queryKey: accountingKeys.accounts.list(filters),
    queryFn: () => accountingService.fetchAccounts(filters),
  })

export const journalEntriesQueryOptions = (filters?: JournalFilters) =>
  queryOptions({
    queryKey: accountingKeys.journal.list(filters),
    queryFn: () => accountingService.fetchJournalEntries(filters),
  })

// ... etc for each entity
```

---

## 4. Admin SPA Pages

The admin uses an SPA pattern with `admin-store`. All accounting pages are added as dynamic imports in `Frontend/src/app/admin/page.tsx` and registered in the `pageMap`.

### 4.1 Page Directory

```
Frontend/src/app/admin/accounting/
├── page.tsx                    # Main accounting dashboard
├── accounts/page.tsx           # Chart of Accounts
├── journal/page.tsx            # Journal Entry form + list
├── ledger/page.tsx             # General Ledger viewer
├── trial-balance/page.tsx      # Trial Balance report
└── periods/page.tsx            # Financial Period management
```

**Note:** The SPA `page.tsx` at `Frontend/src/app/admin/page.tsx` dynamically loads sub-pages. The accounting pages must be added there. However, we also create a separate route at `Frontend/src/app/admin/accounting/` to give each page its own URL as well.

### 4.2 Page Details

#### 4.2.1 `/admin/accounting` — Accounting Dashboard (`page.tsx`)

**Purpose:** Overview of accounting health — period status, recent entries, balance trends.

**Components used:**
- `PeriodStatusBadge` — quick summary of all periods
- `AccountBalanceTrendChart` (LineChart) — 12-month trend of key accounts (Cash, AR, Revenue)
- `ExpenseDistributionChart` (PieChart) — expense breakdown for current period
- `PeriodComparisonChart` (BarChart) — revenue vs expense by month
- KPI cards: Total Revenue, Total Expenses, Net Income, # of Journal Entries

**Data sources:**
- `fetchFinancialPeriods()` — latest period statuses
- `fetchTrialBalance(periodId)` — for summary numbers
- `fetchGeneralLedger(periodId)` — account balances

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  Accounting Dashboard                            │
├──────────────────────────────────────────────────┤
│  [Period: Mar 2026] [Status: OPEN] [Close]       │
├─────────────┬──────────────┬──────────┬─────────┤
│ Revenue     │ Expenses     │ Net Inc  │ Entries  │
│ 1,234,567   │ 987,654      │ 246,913  │ 42       │
├─────────────┴──────────────┴──────────┴─────────┤
│  ┌──────────────────────────────────┐            │
│  │  Balance Trend (LineChart)       │            │
│  │  ▁▃▅▇▆▄▂▁▃▅▇▆                 │            │
│  └──────────────────────────────────┘            │
├──────────────┬───────────────────────┤
│  Expenses    │  Revenue vs Expense   │
│  (PieChart)  │  (BarChart)           │
│              │                       │
└──────────────┴───────────────────────┘
```

#### 4.2.2 `/admin/accounting/accounts` — Chart of Accounts

**Purpose:** View and manage the full chart of accounts in a tree structure.

**Components used:**
- `AccountTree` — hierarchical tree view (expand/collapse)
- `AccountForm` — slide-over sheet (following existing `Sheet` pattern)
- `AccountDetailSheet` — quick view panel

**States to handle:**
- **Loading:** Skeleton tree with placeholder lines
- **Empty:** "No accounts yet. Create your first account to get started." + CTA button
- **Error:** Error banner + retry button
- **Edge cases:**
  - Cannot delete account with non-zero balance
  - Cannot set parentId to self or descendant (circular reference check server-side)
  - Code uniqueness enforced server-side (409 conflict shown in toast)

**List view fallback:** Flat table with `type` filter tabs (similar to `GenericAdminPage` pattern).

#### 4.2.3 `/admin/accounting/journal` — Journal Entry

**Purpose:** Create, view, post, and reverse journal entries.

**Views:**
1. **List tab:** Paginated list of all journal entries (filterable by status, date range, source)
2. **Create tab:** Multi-line journal entry form

**JournalEntryForm** (Create tab):
- Header: Date picker + Period selector + Description
- Lines section: Dynamic rows with account selector, description, debit/credit inputs
- Running totals: Must balance (debits = credits) before Post is enabled
- Actions: Save Draft / Post

**JournalEntryList** (List tab):
- Columns: Entry #, Date, Description, Status, Source, Total Debit, Total Credit, Actions
- Row actions: View, Post (if DRAFT), Reverse (if POSTED), Delete (if DRAFT)
- Uses TanStack Table + `useDataTable` hook

**States:**
- **Loading:** Table skeleton
- **Empty list:** "No journal entries found. Create one to get started."
- **Form validation:** Inline error messages per line item
- **Unbalanced entry:** Warning banner + disabled Post button
- **Post success:** Toast + redirect to entry detail

#### 4.2.4 `/admin/accounting/ledger` — General Ledger

**Purpose:** View general ledger entries for each account in a selected period.

**Components used:**
- `GeneralLedgerTable` — searchable/filterable table
- `LedgerAccountDetail` — expandable row showing transaction detail

**UI:**
- Period selector at top (dropdown of all FinancialPeriods)
- Table: Account Code | Account Name | Opening | Debits | Credits | Closing
- Expandable rows: click to show underlying journal entries that contributed

**States:**
- **No period selected:** Prompt "Select a financial period"
- **No data:** "No ledger entries for this period"
- **Loading:** Skeleton rows

#### 4.2.5 `/admin/accounting/trial-balance` — Trial Balance

**Purpose:** Trial balance report for a given period.

**Components used:**
- `TrialBalanceTable` — grouped by account type with subtotals
- `TrialBalanceSummary` — overall totals showing debits = credits

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  Trial Balance — March 2026                          │
├──────────────────────────────────────────────────────┤
│  Period: [Mar 2026 ▼]                                │
├────────────┬────────┬────────┬────────┬──────────────┤
│ ASSETS     │ Open    │ Debit   │ Credit  │ Close      │
│  Cash       │ 100,000 │ 50,000  │ 30,000  │ 120,000    │
│  AR         │ 200,000 │ 80,000  │ 40,000  │ 240,000    │
│  Total      │ 300,000 │ 130,000 │ 70,000  │ 360,000    │
├────────────┼────────┼────────┼────────┼──────────────┤
│ LIABILITIES│ ...    │ ...    │ ...    │ ...         │
├────────────┼────────┼────────┼────────┼──────────────┤
│ EQUITY     │ ...    │ ...    │ ...    │ ...         │
├────────────┼────────┼────────┼────────┼──────────────┤
│ REVENUE    │ ...    │ ...    │ ...    │ ...         │
├────────────┼────────┼────────┼────────┼──────────────┤
│ EXPENSE    │ ...    │ ...    │ ...    │ ...         │
├────────────┼────────┼────────┼────────┼──────────────┤
│ GRAND TOT  │ X       │ Y       │ Z       │ W           │
│            │         │ Y = Z   │         │             │
└────────────┴────────┴────────┴────────┴──────────────┘
```

**States:**
- **No period:** Prompt to select
- **Data loaded:** Grouped report with subtotals
- **Imbalanced:** Red banner "Trial balance out of balance by X"

#### 4.2.6 `/admin/accounting/periods` — Financial Period Management

**Purpose:** Manage financial periods — create, open, close, lock.

**Components used:**
- `PeriodList` — grid of year-month periods with status badges
- `PeriodCloseDialog` — confirmation with checklist

**UI:**
- Year filter tabs (2025, 2026, ...)
- Month grid showing status for each month:
  - OPEN (green) → can be closed
  - CLOSED (yellow) → can be re-opened (admin)
  - LOCKED (red) → immutable
- Close button triggers `PeriodCloseDialog`:
  - Shows summary of entries in period
  - Confirms all GL entries will be computed
  - Confirms period will be locked

**States:**
- **Loading:** Month grid skeleton
- **No periods:** "No financial periods exist. Create the first one."
- **Cannot close:** Warning if previous period still OPEN

### 4.3 Registering Pages in the SPA

**Update `admin-store.ts`:**
Add accounting pages to the `AdminPage` union type:
```typescript
export type AdminPage = /* existing */ | "accounting" | "accounting-accounts"
  | "accounting-journal" | "accounting-ledger" | "accounting-trial-balance"
  | "accounting-periods"
```

**Update `admin/page.tsx`:**
Add dynamic imports:
```typescript
const AccountingDashboard = dynamic(() => import("./accounting/page"), { ssr: false })
const AccountingAccountsPage = dynamic(() => import("./accounting/accounts/page"), { ssr: false })
const AccountingJournalPage = dynamic(() => import("./accounting/journal/page"), { ssr: false })
const AccountingLedgerPage = dynamic(() => import("./accounting/ledger/page"), { ssr: false })
const AccountingTrialBalancePage = dynamic(() => import("./accounting/trial-balance/page"), { ssr: false })
const AccountingPeriodsPage = dynamic(() => import("./accounting/periods/page"), { ssr: false })

const pageMap: Record<string, React.ComponentType<any>> = {
  ...existing,
  "accounting": AccountingDashboard,
  "accounting-accounts": AccountingAccountsPage,
  "accounting-journal": AccountingJournalPage,
  "accounting-ledger": AccountingLedgerPage,
  "accounting-trial-balance": AccountingTrialBalancePage,
  "accounting-periods": AccountingPeriodsPage,
}
```

---

## 5. Chart Components

All charts use **Recharts** (already installed in project). Located at `Frontend/src/features/accounting/components/charts/`.

### 5.1 `AccountBalanceTrendChart.tsx` — LineChart

```typescript
// Props: { accountIds: string[], periodMonths: string[] }
// Data shape: { month: string; accountName: string; balance: number }[]
// Rendering: LineChart with multiple Lines (one per account)
//           XAxis = month, YAxis = amount, Tooltip, Legend
```

**Used in:** Accounting Dashboard
**States:**
- **Loading:** Animated pulse skeleton matching chart dimensions
- **Empty:** "No balance data available for selected accounts"
- **Single account:** Single line (no legend needed)
- **Multiple accounts:** Color-coded lines via `recharts` color palette
- **Error:** Error icon + retry button

### 5.2 `PeriodComparisonChart.tsx` — BarChart

```typescript
// Props: { data: { period: string; revenue: number; expense: number; netIncome: number }[] }
// Rendering: BarChart with grouped bars (revenue green, expense red, netIncome blue)
//           XAxis = period label, YAxis = amount, Tooltip, Legend
```

**Used in:** Accounting Dashboard
**States:**
- **Loading:** Skeleton bars (gray rectangles)
- **Empty:** "No period comparison data"
- **Single period:** One group of bars
- **All negative:** Red color dominance (edge case: all expenses > revenue)

### 5.3 `ExpenseDistributionChart.tsx` — PieChart

```typescript
// Props: { data: { name: string; value: number; color: string }[] }
// Rendering: PieChart with label + percentage
//           Center hole with "Total: X" (donut style)
```

**Used in:** Accounting Dashboard
**States:**
- **Loading:** Pulsing donut skeleton
- **Empty:** "No expense data for this period"
- **Single category:** Full donut with one color
- **Many categories:** Top 5 with "Others" grouping (UX: avoid tiny slices)
- **Legend:** Right-side color-coded legend

### 5.4 `CumulativeMetricChart.tsx` — AreaChart

```typescript
// Props: { data: { date: string; value: number }[]; metricName: string }
// Rendering: AreaChart with gradient fill
//           XAxis = date, YAxis = cumulative value, Tooltip
```

**Used in:** Journal Entry List (cumulative posting volume), Dashboard
**States:**
- **Loading:** Skeleton area
- **Empty:** Flat line at zero
- **Single point:** Dot with no area (only one data point)
- **Stacked:** Multiple area stacks (e.g., cumulative revenue + expenses)

### 5.5 Recharts Integration Notes

All chart components follow the same pattern:
- Import only from `recharts` (no wrappers)
- Use consistent dimensions: `width={600} height={300}` with responsive containers
- Wrap in `ResponsiveContainer` for adaptive sizing
- Use `cn()` for className on parent divs
- Apply theme-aware colors via CSS variables:
  ```typescript
  const COLORS = [
    "var(--chart-1, #2563eb)",
    "var(--chart-2, #16a34a)",
    "var(--chart-3, #dc2626)",
    "var(--chart-4, #ca8a04)",
    "var(--chart-5, #9333ea)",
  ]
  ```

---

## 6. Navigation & Store Updates

### 6.1 Admin Store Updates

**File:** `Frontend/src/stores/admin-store.ts`

Extend `AdminPage` union type:
```typescript
export type AdminPage = /* existing 13 entries */ | "accounting"
  | "accounting-accounts" | "accounting-journal" | "accounting-ledger"
  | "accounting-trial-balance" | "accounting-periods"
```

### 6.2 Sidebar Navigation

**File:** `Frontend/src/admin/layout/SystemLayout.tsx`

Add a new "Accounting" group to `navGroups` array, placed after "Billing":

```typescript
{ label: "Accounting", items: [
  { id: "accounting", label: "Dashboard", icon: "..." },
  { id: "accounting-accounts", label: "Chart of Accounts", icon: "..." },
  { id: "accounting-journal", label: "Journal", icon: "..." },
  { id: "accounting-ledger", label: "General Ledger", icon: "..." },
  { id: "accounting-trial-balance", label: "Trial Balance", icon: "..." },
  { id: "accounting-periods", label: "Periods", icon: "..." },
]}
```

Sub-tabs for journal page (add to `PAGE_SUB_TABS`):
```typescript
"accounting-journal": [{ id: "", label: "List" }, { id: "new", label: "New Entry" }],
```

### 6.3 Icons Registration

**File:** `Frontend/src/components/icons.tsx`

Add new icons:
```typescript
import {
  IconBook,         // Journal
  IconChartLine,    // Trial balance, GL
  IconCoin,         // Accounting
  IconHierarchy2,   // Chart of accounts
  IconCalendarTime, // Periods
  IconReportAnalytics, // Reports
} from "@tabler/icons-react"

export const Icons = {
  // ... existing
  book: IconBook,
  chartLine: IconChartLine,
  coin: IconCoin,
  hierarchy2: IconHierarchy2,
  calendarTime: IconCalendarTime,
  reportAnalytics: IconReportAnalytics,
}
```

---

## 7. Implementation Order

### Phase 1: Foundation (Backend)

| Step | File(s) | Description | Estimated Effort |
|------|---------|-------------|------------------|
| 1.1 | `backend/prisma/schema.prisma` | Add 5 new models (Account, JournalEntry, JournalLineItem, GeneralLedgerEntry, FinancialPeriod) | 2h |
| 1.2 | `backend/prisma/schema.prisma` | Run migration: `npx prisma migrate dev --name add_accounting_models` | 15min |
| 1.3 | `backend/src/routes/accounting.js` | CRUD endpoints for Account (with Zod validation) | 2h |
| 1.4 | `backend/src/routes/accounting.js` | CRUD endpoints for JournalEntry + JournalLineItem | 3h |
| 1.5 | `backend/src/routes/accounting.js` | POST /post + POST /reverse logic | 2h |
| 1.6 | `backend/src/routes/accounting.js` | CRUD for FinancialPeriod + POST /close | 2h |
| 1.7 | `backend/src/routes/accounting.js` | GET /general-ledger + GET /trial-balance (aggregation queries) | 2h |
| 1.8 | `backend/src/server.js` | Register accountingRouter at `/api/accounting` | 15min |
| 1.9 | DB Seed | Create default accounts (Cash, AR, AP, Equity, Revenue, Expense categories) | 1h |
| **Total** | | | **~12h** |

### Phase 2: Feature Layer (Frontend Data)

| Step | File(s) | Description | Effort |
|------|---------|-------------|--------|
| 2.1 | `features/accounting/api/types.ts` | All TypeScript interfaces | 1h |
| 2.2 | `features/accounting/api/service.ts` | All fetch functions | 1.5h |
| 2.3 | `features/accounting/api/queries.ts` | Query key factories + queryOptions | 1h |
| 2.4 | `features/accounting/schemas/accounting-schemas.ts` | Zod schemas for form validation | 1h |
| 2.5 | `features/accounting/constants/accounting-constants.ts` | Account types, status options, colors | 30min |
| **Total** | | | **~5h** |

### Phase 3: Admin SPA Pages

| Step | File(s) | Description | Effort |
|------|---------|-------------|--------|
| 3.1 | `stores/admin-store.ts` | Extend AdminPage type | 15min |
| 3.2 | `admin/layout/SystemLayout.tsx` | Add Accounting nav group + sub-tabs | 30min |
| 3.3 | `components/icons.tsx` | Register new icons | 15min |
| 3.4 | `app/admin/page.tsx` | Add dynamic imports + pageMap entries | 15min |
| **Total** | | | **~1h** |

### Phase 4: Accounting Pages

| Step | File(s) | Description | Effort |
|------|---------|-------------|--------|
| 4.1 | `app/admin/accounting/page.tsx` | Dashboard + chart integration | 4h |
| 4.2 | `app/admin/accounting/accounts/page.tsx` | Chart of Accounts (tree + CRUD) | 4h |
| 4.3 | `app/admin/accounting/journal/page.tsx` | Journal Entry form + list | 5h |
| 4.4 | `app/admin/accounting/ledger/page.tsx` | General Ledger viewer | 2h |
| 4.5 | `app/admin/accounting/trial-balance/page.tsx` | Trial Balance report | 2h |
| 4.6 | `app/admin/accounting/periods/page.tsx` | Period management grid | 2h |
| **Total** | | | **~19h** |

### Phase 5: Chart Components

| Step | File(s) | Description | Effort |
|------|---------|-------------|--------|
| 5.1 | `features/accounting/components/charts/AccountBalanceTrendChart.tsx` | LineChart | 1.5h |
| 5.2 | `features/accounting/components/charts/PeriodComparisonChart.tsx` | BarChart | 1.5h |
| 5.3 | `features/accounting/components/charts/ExpenseDistributionChart.tsx` | PieChart | 1h |
| 5.4 | `features/accounting/components/charts/CumulativeMetricChart.tsx` | AreaChart | 1h |
| **Total** | | | **~5h** |

### Phase 6: Verification

| Step | Description | Effort |
|------|-------------|--------|
| 6.1 | `npm run lint` + `npm run typecheck` | 30min |
| 6.2 | Manual spot-check: create account → create journal → post → view GL → trial balance | 1h |
| 6.3 | Edge case testing: reversal, period close, unbalanced entry rejection | 1h |
| **Total** | | **~2.5h** |

### Overall Timeline

| Phase | Hours | Dependencies |
|-------|-------|-------------|
| 1 — Foundation (Backend) | 12h | None |
| 2 — Feature Layer (Types/Service/Queries) | 5h | Phase 1 |
| 3 — Admin SPA Setup | 1h | Phase 2 |
| 4 — Accounting Pages | 19h | Phase 3 |
| 5 — Chart Components | 5h | Phase 4 (dashboard page) |
| 6 — Verification | 2.5h | All phases |
| **Total** | **~44.5h** | |

---

## 8. Data Flow Diagrams

### 8.1 Journal Posting Flow

```
User clicks "Post"
  → Frontend: POST /api/accounting/journal-entries/:id/post
  → Backend:
    ├─ Validate: status=DRAFT, lines exist, debits=credits
    ├─ Compute totalDebit, totalCredit from line items
    ├─ UPDATE JournalEntry SET status=POSTED, postedAt=now(), totalDebit, totalCredit
    ├─ For each line item's account:
    │   ├─ UPSERT GeneralLedgerEntry (accountId, periodId)
    │   ├─ openingBalance = (previous period's closingBalance || 0)
    │   ├─ totalDebit += line.debitAmount
    │   ├─ totalCredit += line.creditAmount
    │   └─ closingBalance = openingBalance + totalDebit - totalCredit
    │     (For liability/equity/revenue: closingBalance = openingBalance + totalCredit - totalDebit)
    ├─ auditLog("accounting.journal.posted")
    └─ Return updated JournalEntry with lines
  → Frontend: invalidateQueries → toast success → redirect
```

### 8.2 Period Close Flow

```
User clicks "Close Period"
  → Frontend: Confirm dialog → POST /api/accounting/financial-periods/:id/close
  → Backend:
    ├─ Validate: status=OPEN
    ├─ Validate: previous period is CLOSED or LOCKED
    ├─ Compute GL entries for ALL accounts in this period:
    │   ├─ Aggregate JournalLineItems for entries with matching periodId + POSTED status
    │   ├─ Upsert GeneralLedgerEntry rows
    ├─ Compute opening balances for next period:
    │   ├─ For each account: nextPeriod.openingBalance = currentPeriod.closingBalance
    ├─ UPDATE FinancialPeriod SET status=CLOSED, closedAt=now(), closedBy=user
    └─ Return updated period
  → Frontend: invalidateQueries → period grid updates
```

### 8.3 Reversal Flow

```
User clicks "Reverse" on a POSTED entry
  → Frontend: Confirm dialog → POST /api/accounting/journal-entries/:id/reverse
  → Backend:
    ├─ Validate: entry exists, status=POSTED
    ├─ Create reversal JournalEntry (DRAFT):
    │   ├─ entryNumber = auto-generated
    │   ├─ description = "Reversal of {original.entryNumber}: {original.description}"
    │   ├─ source = ADJUSTMENT
    │   ├─ referenceId = original entry ID
    │   ├─ Same lines, but debitAmount ↔ creditAmount swapped
    ├─ Auto-post the reversal (same flow as 8.1)
    ├─ UPDATE original JournalEntry SET status=REVERSED
    ├─ auditLog("accounting.journal.reversed")
    └─ Return reversal entry
  → Frontend: invalidateQueries → list updates
```

### 8.4 Chart of Accounts Tree

```
GET /api/accounting/accounts?type=ASSET
  → Backend:
    ├─ Fetch all accounts of type=ASSET (including archived=false)
    ├─ Build tree in-memory:
    │   ├─ Group by parentId
    │   ├─ Attach children recursively
    │   ├─ For leaf accounts, include current balance (from latest GL entry)
    └─ Return nested array
  → Frontend AccountTree component:
    ├─ Recursive TreeItem with expand/collapse
    ├─ Indentation based on depth
    ├─ "Add Child Account" button on each parent
    └─ Edit/Delete actions on leaf nodes
```

### 8.5 GL → Trial Balance Flow

```
GET /api/accounting/trial-balance?periodId=X
  → Backend:
    ├─ Fetch all GeneralLedgerEntry for periodId=X
    ├─ Join with Account (for code, name, type)
    ├─ Group by accountType
    ├─ Within each group, sort by accountCode
    ├─ Compute subtotals per type
    ├─ Compute grand total (debits must equal credits)
    └─ Return grouped array + summary
  → Frontend TrialBalanceTable:
    ├─ Render group headers (ASSETS, LIABILITIES, ...)
    ├─ Render rows with indentation
    ├─ Subtotal row per group (bold)
    ├─ Grand total row (double-bold)
    └─ Flag if imbalanced
```

---

## Appendix A: Reusable Component List

| Component | Location | Type | Props |
|-----------|----------|------|-------|
| `AccountBalanceTrendChart` | `features/accounting/components/charts/` | LineChart (Recharts) | `accountIds`, `periodMonths` |
| `PeriodComparisonChart` | `features/accounting/components/charts/` | BarChart (Recharts) | `data: { period, revenue, expense, netIncome }[]` |
| `ExpenseDistributionChart` | `features/accounting/components/charts/` | PieChart (Recharts) | `data: { name, value, color }[]` |
| `CumulativeMetricChart` | `features/accounting/components/charts/` | AreaChart (Recharts) | `data: { date, value }[]`, `metricName` |
| `AccountTree` | `features/accounting/components/accounts/` | Tree view | `accounts`, `onSelect`, `onEdit`, `onDelete` |
| `AccountForm` | `features/accounting/components/accounts/` | Sheet form | `account?`, `onSubmit`, `onCancel` |
| `AccountDetailSheet` | `features/accounting/components/accounts/` | Sheet | `accountId`, `open`, `onClose` |
| `JournalEntryForm` | `features/accounting/components/journal/` | Multi-line form | `initial?`, `onSubmit`, `mode: 'create'|'edit'` |
| `JournalEntryList` | `features/accounting/components/journal/` | Table | `filters`, `onAction` |
| `JournalLineItemRow` | `features/accounting/components/journal/` | Form row | `item`, `onChange`, `onRemove`, `accounts` |
| `JournalEntryActions` | `features/accounting/components/journal/` | Action buttons | `entry`, `onPost`, `onReverse`, `onDelete` |
| `GeneralLedgerTable` | `features/accounting/components/ledger/` | Table | `entries`, `onExpand` |
| `LedgerAccountDetail` | `features/accounting/components/ledger/` | Expandable | `accountId`, `periodId` |
| `TrialBalanceTable` | `features/accounting/components/trial-balance/` | Grouped table | `rows`, `periodId` |
| `TrialBalanceSummary` | `features/accounting/components/trial-balance/` | Summary | `totalDebit`, `totalCredit`, `difference` |
| `PeriodList` | `features/accounting/components/periods/` | Grid | `periods`, `onClose`, `onOpen` |
| `PeriodCloseDialog` | `features/accounting/components/periods/` | Dialog | `period`, `onConfirm`, `onCancel` |
| `PeriodStatusBadge` | `features/accounting/components/periods/` | Badge | `status: PeriodStatus` |

## Appendix B: File Inventory (Complete)

```
backend/
├── prisma/
│   └── schema.prisma                        # +5 models (lines ~1445-1620)
└── src/
    ├── routes/
    │   └── accounting.js                     # NEW — all API endpoints
    └── server.js                             # +app.use("/api/accounting", accountingRouter)

Frontend/src/
├── app/admin/
│   ├── page.tsx                              # +6 dynamic imports + pageMap entries
│   └── accounting/
│       ├── page.tsx                          # NEW — Dashboard
│       ├── accounts/
│       │   └── page.tsx                      # NEW — Chart of Accounts
│       ├── journal/
│       │   └── page.tsx                      # NEW — Journal Entry
│       ├── ledger/
│       │   └── page.tsx                      # NEW — General Ledger
│       ├── trial-balance/
│       │   └── page.tsx                      # NEW — Trial Balance
│       └── periods/
│           └── page.tsx                      # NEW — Period Management
├── features/accounting/
│   ├── api/
│   │   ├── types.ts                          # NEW
│   │   ├── service.ts                        # NEW
│   │   └── queries.ts                        # NEW
│   ├── components/
│   │   ├── accounts/
│   │   │   ├── AccountTree.tsx               # NEW
│   │   │   ├── AccountForm.tsx               # NEW
│   │   │   └── AccountDetailSheet.tsx        # NEW
│   │   ├── journal/
│   │   │   ├── JournalEntryForm.tsx           # NEW
│   │   │   ├── JournalEntryList.tsx           # NEW
│   │   │   ├── JournalLineItemRow.tsx         # NEW
│   │   │   └── JournalEntryActions.tsx        # NEW
│   │   ├── ledger/
│   │   │   ├── GeneralLedgerTable.tsx         # NEW
│   │   │   └── LedgerAccountDetail.tsx        # NEW
│   │   ├── trial-balance/
│   │   │   ├── TrialBalanceTable.tsx          # NEW
│   │   │   └── TrialBalanceSummary.tsx        # NEW
│   │   ├── periods/
│   │   │   ├── PeriodList.tsx                 # NEW
│   │   │   ├── PeriodCloseDialog.tsx          # NEW
│   │   │   └── PeriodStatusBadge.tsx          # NEW
│   │   └── charts/
│   │       ├── AccountBalanceTrendChart.tsx   # NEW
│   │       ├── PeriodComparisonChart.tsx      # NEW
│   │       ├── ExpenseDistributionChart.tsx   # NEW
│   │       └── CumulativeMetricChart.tsx      # NEW
│   ├── schemas/
│   │   └── accounting-schemas.ts             # NEW
│   └── constants/
│       └── accounting-constants.ts            # NEW
├── admin/
│   ├── layout/
│   │   └── SystemLayout.tsx                  # +Accounting nav group + sub-tabs
│   └── tables/
│       └── page-configs.ts                   # Optionally add accounting page configs
├── stores/
│   └── admin-store.ts                        # +6 AdminPage union values
└── components/
    └── icons.tsx                             # +6 icon registrations
```
