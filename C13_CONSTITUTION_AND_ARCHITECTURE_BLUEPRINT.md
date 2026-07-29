# C13 — Enterprise Financial & Billing Intelligence Platform
## Constitution & Architecture Blueprint

**Version:** 2.0.0  
**Status:** READ ONLY — GOVERNANCE PLANNING ONLY — NOT IMPLEMENTED  
**Date:** 2026-07-29  
**Preceded by:** C12 Identity Program (Certified 100%)  
**Supersedes:** C13_ENTERPRISE_FINANCIAL_PLATFORM_MASTER_PLAN.md (v1 — corrected after backend accounting discovery)

---

**IMPORTANT DISCOVERY:** The accounting backend (Account, JournalEntry, JournalLineItem, GeneralLedgerEntry, FinancialPeriod) is **already fully implemented** — all Prisma models, route files, Zod validation, RBAC authorization, audit logging, business rules (debit=credit enforcement, period validation, auto-closing entries with retained earnings transfer, trial balance). The frontend has an `accounting/` admin directory but the UI is incomplete. C13 is therefore a **connect-and-enhance** program, not a build-from-scratch program.

---

## PART 1: C13 PROGRAM CONSTITUTION

### 1.1 Business Purpose

MeterVerse currently processes billing, invoices, and payments as isolated CRUD operations. Each invoice and payment exists as a standalone record with no connection to a double-entry accounting system. This means:

- **No audit trail** from meter reading → invoice → payment → ledger
- **No financial statements** (P&L, Balance Sheet, Cash Flow)  
- **No revenue recognition** — revenue is recognized on payment, not on accrual
- **No collections intelligence** — dunning is manual, PTP tracking is basic
- **No revenue assurance** — billing errors go undetected

C13 transforms MeterVerse billing into a **carrier-grade financial platform** with GAAP-compliant accounting, intelligent revenue management, automated collections, and AI-powered financial intelligence.

### 1.2 Enterprise Objectives

| # | Objective | Measured By | Target |
|---|-----------|-------------|--------|
| 1 | Connect billing → GL with auto-journal posting | Invoices auto-post to GL within 60s of issue | 100% |
| 2 | Enable financial reporting | P&L, Balance Sheet, Cash Flow available | Real-time |
| 3 | Implement revenue assurance | Leakage detection rules active | < 0.5% leakage |
| 4 | Automate collections dunning | Dunning cases auto-escalated | 90% automation |
| 5 | Add AI financial intelligence | 5 AI agents operational | 95% accuracy |
| 6 | Build financial workbench UI | 10 workbench pages live | All CRUD complete |
| 7 | Enable bank reconciliation | Auto-match rate | > 85% auto-match |
| 8 | Support multi-currency | FX transactions auto-recorded | All currencies |

### 1.3 Financial Transformation Goals

| Maturity Domain | Before C13 | After C13 |
|-----------------|-----------|-----------|
| Accounting | **Backend built, no frontend** | Fully operational with 10 workbenches |
| Billing-GL Integration | **None (billing isolated)** | Auto-posting pipeline: invoice → journal → GL |
| Revenue Assurance | **0% (no detection)** | 15+ leakage rules, AI anomaly detection |
| Collection Intelligence | **30% (basic CRUD)** | 85% — auto-dunning, PTP, scoring |
| Financial Reporting | **0% (no reports)** | P&L, Balance Sheet, Cash Flow, AR Aging |
| Bank Reconciliation | **0% (manual)** | Auto-match engine with 85%+ rate |
| Multi-Currency | **0% (EGP only)** | Full multi-currency with FX auto-calculation |
| AI Financial Intelligence | **0% (no agents)** | 5 AI agents with governance |
| Frontend Workbench | **0% (no UI)** | 10 financial workbench pages |

### 1.4 Utility Industry Alignment

| Standard | Alignment | C13 Coverage |
|----------|-----------|--------------|
| SAP IS-U (Utility Billing) | Bill → GL integration, revenue recognition | W02, W05 |
| Oracle Utilities Customer Care & Billing | Tariff engine, collection lifecycle | W03, W04 |
| Siemens EnergyIP | Meter-to-cash traceability | W02, W10 |
| IEEE C37.118 (Utility Data) | Reading validation before billing | W02 |
| GAAP / IFRS | Accrual accounting, period closing | W01 (existing) |
| SOC2 (Trust Services) | Financial data integrity, audit trail | W10 |
| ISO 27001 (Financial) | Access control, segregation of duties | W10 |
| Local Utility Regulations | Tax calculation, e-invoice format | W08 |

### 1.5 Expected Business Outcomes

| Outcome | Impact | Timeline |
|---------|--------|----------|
| Revenue leakage detected and prevented | 2-5% revenue protection | W02 → ongoing |
| Collection cycle time reduced | 30-50% faster cash collection | W04 → ongoing |
| Financial close cycle reduced | 10+ days → 2 days | W07 → monthly |
| Bank reconciliation automated | 5 person-days → 30 minutes/month | W06 → ongoing |
| Billing errors caught before invoice | Reduced disputes, customer satisfaction | W02 → ongoing |
| Audit-ready financials | Zero audit findings | W10 → quarterly |
| AI-driven financial intelligence | Proactive risk detection | W09 → ongoing |

### 1.6 Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Invoice-to-GL latency | N/A | < 60s | Time from invoice issue to journal post |
| Revenue leakage detected | 0/month | > 10 alerts/month | Alert count |
| Dunning automation rate | 0% | > 90% | Cases escalated without human touch |
| Auto-match reconciliation rate | 0% | > 85% | Matched / total bank lines |
| Financial report availability | None | P&L, BS, CF, Trial Balance | Report count |
| AI financial agent accuracy | N/A | > 95% | Precision / recall |
| Period close time | N/A | < 2 hours | Close process duration |
| Financial UI pages | 0 | 10 | Page count |
| Accounting domain tests | < 10 | 395 | Test count |

---

## PART 2: CURRENT FINANCIAL CAPABILITY GAP ANALYSIS

### 2.1 Current Billing Maturity

| Capability | Status | Notes |
|------------|--------|-------|
| Bill Run (create, schedule, execute, close) | ✅ Live | Routes in billing.js |
| Bill Run History (action log) | ✅ Live | BillRunHistory model |
| Bill Cycle management | ✅ Live | BillCycle model exists |
| Consumption calculation | ✅ Live | Reading diff in billing engine |
| Basic tariff rates | ✅ Live | Tariff + TariffRate models |
| Flat rate calculation | ✅ Live | Single rate per unit |
| Invoice generation | ✅ Live | POST /api/invoices/generate |
| Invoice lifecycle (DRAFT→ISSUED) | ✅ Live | InvoiceStatus enum |
| Invoice items and taxes | ✅ Live | InvoiceItem, InvoiceTax models |
| Invoice cancellation + credit notes | ✅ Live | POST /api/invoices/:id/cancel |
| Invoice adjustments | ✅ Live | POST /api/invoices/:id/adjustments |

### 2.2 Current Invoice Lifecycle

**Status:** Live with DRAFT → APPROVED → ISSUED → PAID → CANCELLED  
**Gaps:**
- No invoice → journal auto-posting
- No revenue recognition on invoice issue
- No e-invoice format compliance
- No multi-currency invoices
- No automated invoice validation (rules engine)
- No invoice anomaly detection

### 2.3 Current Payment Lifecycle

**Status:** Live with PENDING → COMPLETED → ALLOCATED → REVERSED → REFUNDED  
**Gaps:**
- No payment → journal auto-posting
- No auto-allocation rules (oldest invoice first exists, but no configurable strategy)
- No payment gateway reconciliation
- No bank statement import
- No multi-currency payments
- No payment behavior scoring

### 2.4 Current Collections Process

**Status:** Basic CRUD with CollectionCase, CollectionAction, PromiseToPay models  
**Gaps:**
- **No dunning automation** — cases must be manually escalated
- **No aging-based auto-escalation** — no rules engine for 30/60/90/120+ day triggers
- **No collector assignment optimization** — assignment is manual
- **No field visit route planning**
- **No payment probability scoring** — can't prioritize high-risk cases
- **No intelligent dunning** — all customers get the same treatment
- **No write-off automation** — manual workflow only

### 2.5 Missing Accounting Capabilities (Backend exists, no frontend)

| Capability | Backend | Frontend | Integration |
|------------|---------|----------|-------------|
| Chart of Accounts | ✅ Full CRUD + hierarchy | ❌ No UI | ❌ Not connected to billing |
| Journal Entries | ✅ Full CRUD + post + reverse | ❌ No UI | ❌ Manual entry only |
| General Ledger | ✅ Period balances per account | ❌ No UI | ❌ Not auto-populated |
| Trial Balance | ✅ Complete with balancing check | ❌ No UI | ❌ Manual only |
| Financial Periods | ✅ Create, close, auto-closing entries | ❌ No UI | ❌ Not integrated |
| Bank Reconciliation | ❌ Not built | ❌ | ❌ |
| Financial Reports | ❌ Not built | ❌ | ❌ |
| Revenue Assurance | ❌ Not built | ❌ | ❌ |

### 2.6 Gap Summary

| Gap | Severity | Backend | Frontend | Integration |
|-----|----------|---------|----------|-------------|
| Accounting UI missing | HIGH | ✅ Built | ❌ No UI | ❌ Not integrated |
| Billing→GL posting | CRITICAL | ❌ Not built | N/A | ❌ |
| Revenue assurance | CRITICAL | ❌ Not built | ❌ | ❌ |
| Collection intelligence | HIGH | ❌ Partial | ❌ | ❌ |
| Financial reporting | HIGH | ❌ Not built | ❌ | ❌ |
| Bank reconciliation | MEDIUM | ❌ Not built | ❌ | ❌ |
| Multi-currency billing | MEDIUM | ❌ Not built | ❌ | ❌ |
| AI financial agents | MEDIUM | ❌ Not built | ❌ | ❌ |

---

## PART 3: ENTERPRISE FINANCIAL ARCHITECTURE VISION

### 3.1 Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                        C13 FINANCIAL INTELLIGENCE PLATFORM                          │
│                                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐    │
│  │  Meter       │  │  Reading     │  │  Customer     │  │  External Systems     │    │
│  │  Management  │  │  Pipeline   │  │  Management   │  │  Banks / ERP / Tax    │    │
│  └──────┬──────┘  └──────┬──────┘  └───────┬───────┘  └───────────┬───────────┘    │
│         │                │                  │                     │                 │
│         ▼                ▼                  ▼                     ▼                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐    │
│  │                        EXISTING BILLING LAYER                               │    │
│  │  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐   │    │
│  │  │ Bill Run │  │  Tariff   │  │  Invoice │  │ Payment  │  │Collection │   │    │
│  │  │  Engine  │  │  Engine   │  │  Engine  │  │  Engine  │  │   Cases   │   │    │
│  │  └────┬─────┘  └─────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬─────┘   │    │
│  └───────┼──────────────┼──────────────┼──────────────┼──────────────┼────────┘    │
│          │              │              │              │              │             │
│          ▼              ▼              ▼              ▼              ▼             │
│  ┌────────────────────────────────────────────────────────────────────────────┐    │
│  │                       C13 FINANCIAL ENGINE                                  │    │
│  │                                                                              │    │
│  │  ┌──────────────────────────────────────────────────────────────────────┐   │    │
│  │  │  ACCOUNTING ENGINE (Backend Complete)                                 │   │    │
│  │  │  ┌───────────┐  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │   │    │
│  │  │  │  Account  │  │ JournalEntry│  │GeneralLedger │  │ Financial  │  │   │    │
│  │  │  │  (CoA)    │──│  (Journal)  │──│   (Period)   │──│  Period    │  │   │    │
│  │  │  └───────────┘  └─────────────┘  └──────────────┘  └────────────┘  │   │    │
│  │  └──────────────────────────────────────────────────────────────────────┘   │    │
│  │                                                                              │    │
│  │  ┌──────────────────────────────────────────────────────────────────────┐   │    │
│  │  │  REVENUE INTELLIGENCE (NEW)                                           │   │    │
│  │  │  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────────┐  │   │    │
│  │  │  │ Revenue         │  │ Invoice          │  │ Billing Analytics  │  │   │    │
│  │  │  │ Assurance Engine│──│ Validation Rules │──│ & Leakage Detection│  │   │    │
│  │  │  └─────────────────┘  └──────────────────┘  └────────────────────┘  │   │    │
│  │  └──────────────────────────────────────────────────────────────────────┘   │    │
│  │                                                                              │    │
│  │  ┌──────────────────────────────────────────────────────────────────────┐   │    │
│  │  │  COLLECTION INTELLIGENCE (NEW)                                        │   │    │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  ┌───────────┐  │   │    │
│  │  │  │ Dunning      │  │ Promise-to-  │  │ Collector  │  │ Write-off │  │   │    │
│  │  │  │ Automation   │──│ Pay Engine   │──│ Assignment │──│ Workflow  │  │   │    │
│  │  │  └──────────────┘  └──────────────┘  └────────────┘  └───────────┘  │   │    │
│  │  └──────────────────────────────────────────────────────────────────────┘   │    │
│  │                                                                              │    │
│  │  ┌──────────────────────────────────────────────────────────────────────┐   │    │
│  │  │  FINANCIAL REPORTING (NEW)                                            │   │    │
│  │  │  ┌─────────┐  ┌───────────┐  ┌──────────────┐  ┌───────────────┐   │   │    │
│  │  │  │ P&L     │  │ Balance   │  │ Cash Flow    │  │ AR Aging /    │   │   │    │
│  │  │  │ Report  │──│ Sheet     │──│ Statement    │──│ Tax Summary   │   │   │    │
│  │  │  └─────────┘  └───────────┘  └──────────────┘  └───────────────┘   │   │    │
│  │  └──────────────────────────────────────────────────────────────────────┘   │    │
│  │                                                                              │    │
│  │  ┌──────────────────────────────────────────────────────────────────────┐   │    │
│  │  │  BANK RECONCILIATION (NEW)                                            │   │    │
│  │  │  ┌──────────────┐  ┌────────────┐  ┌──────────────┐  ┌───────────┐  │   │    │
│  │  │  │ Statement   │──│ Auto-Match │──│ Exception    │──│ Settlement│  │   │    │
│  │  │  │ Import      │  │ Engine     │  │ Handler      │  │ Engine    │  │   │    │
│  │  │  └────────────┘  └────────────┘  └──────────────┘  └───────────┘  │   │    │
│  │  └──────────────────────────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────┐    │
│  │  AI FINANCIAL INTELLIGENCE LAYER (NEW — 5 Agents)                           │    │
│  │  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │    │
│  │  │ Revenue Leakage │  │ Collection       │  │ Financial Forecast       │  │    │
│  │  │ Detection Agent │──│ Optimization     │──│ Agent (ARIMA projection) │  │    │
│  │  └─────────────────┘  │ Agent (scoring)  │  └──────────────────────────┘  │    │
│  │                       └──────────────────┘                                 │    │
│  │  ┌─────────────────┐  ┌──────────────────┐                                 │    │
│  │  │ Invoice Anomaly │  │ Financial        │                                 │    │
│  │  │ Agent (NLP)     │──│ Classification   │                                 │    │
│  │  └─────────────────┘  │ Agent (auto-tag) │                                 │    │
│  │                       └──────────────────┘                                 │    │
│  └────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────┐    │
│  │  FINANCIAL WORKBENCH (NEW — 10 Frontend Pages)                              │    │
│  │  ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │    │
│  │  │ Financial  │ │ Chart of │ │ Journal  │ │ Trial    │ │ Bank Recon   │  │    │
│  │  │ Dashboard  │ │ Accounts │ │ Workbench│ │ Balance  │ │ Workbench    │  │    │
│  │  └────────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │    │
│  │  ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │    │
│  │  │ Collection │ │ Revenue  │ │ Financial│ │ Tariff   │ │ Dunning      │  │    │
│  │  │ Workbench  │ │ Assurance│ │ Reports  │ │ Manager  │ │ Config       │  │    │
│  │  └────────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │    │
│  └────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────┐    │
│  │  GOVERNANCE & COMPLIANCE LAYER                                               │    │
│  │  SeD (Create≠Approve≠Post) — Period Locking — Immutability — Audit Trail    │    │
│  └────────────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Layer Descriptions

**Layer 1 — Accounting Engine** (Backend Complete)
- Hierarchical Chart of Accounts (parent/child, types: ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)
- Double-entry journal with automated balancing (debits = credits enforced)
- General Ledger with period-based balance tracking (opening, activity, closing)
- Financial Period management (create, open, close with auto-closing entries → retained earnings)
- Trial Balance with balancing verification
- Soft-delete with business rule guards

**Layer 2 — Revenue Intelligence** (New)
- Pre-bill validation rules (negative consumption, usage spikes, missing readings)
- Invoice validation (pricing accuracy, tax calculation, customer eligibility)
- Revenue leakage detection (tariff misapplication, unbilled consumption, meter errors)
- Billing analytics (trend analysis, collection effectiveness, aging)

**Layer 3 — Collection Intelligence** (New)
- Dunning automation (SMS→Email→Call→Letter→Field Visit escalation chain)
- Promise-to-Pay engine (schedule creation, payment tracking, missed-pmt re-escalation)
- Collector assignment with workload balancing
- Field visit route optimization
- Write-off workflow (recommend → approve → execute)
- Payment behavior scoring (predict payment probability per customer)

**Layer 4 — Financial Reporting** (New)
- Profit & Loss statement (revenue, COS, gross margin, opex, net income)
- Balance Sheet (assets, liabilities, equity with period comparison)
- Cash Flow statement (direct/indirect method)
- AR Aging report (current, 30, 60, 90, 120+ with drill-down)
- Tax summary report
- Revenue by area/project/utility
- GL drill-down (account → period → journal → invoice)

**Layer 5 — Bank Reconciliation** (New)
- Bank statement import (CSV, MT940, CAMT.053)
- Auto-matching engine (reference, amount, date)
- Exception handling (unmatched, partial, duplicate)
- Manual reconciliation workbench
- Gateway settlement reconciliation

**Layer 6 — AI Financial Intelligence** (New — 5 Agents)
- Revenue Leakage Detection Agent
- Collection Optimization Agent
- Financial Forecast Agent
- Invoice Anomaly Agent
- Financial Classification Agent

**Layer 7 — Financial Workbench** (New — 10 Pages)
- Complete UI for all financial operations

**Layer 8 — Governance & Compliance** (Existing + Enhanced)
- Segregation of duties enforced (create ≠ approve ≠ post)
- Period locking prevents modification of closed periods
- Journal immutability (posted entries cannot be edited)
- Full audit trail with correlation IDs
- Compliance with GAAP, IFRS, local regulations

---

## PART 4: CORE FINANCIAL DOMAIN MODEL DESIGN

### 4.1 Account (Chart of Accounts)

**Purpose:** Hierarchical account structure defining the complete Chart of Accounts for the enterprise.

**Status:** ✅ Backend complete — model, routes, Zod, RBAC, audit

```
Account
├── id: String (UUID, PK)
├── code: String (UNIQUE) — e.g. "1001", "2001-01"
├── name: String — e.g. "Cash & Cash Equivalents"
├── type: String — ASSET | LIABILITY | EQUITY | REVENUE | EXPENSE
├── category: String? — CURRENT | NON_CURRENT | OPERATING | etc.
├── parentId: String? (self-referencing hierarchy)
├── parent: Account? (FK → Account)
├── children: Account[] (FK ← Account)
├── currency: String (default "EGP")
├── active: Boolean (default true)
├── description: String?
└── audit: createdAt, archivedAt, updatedAt
```

**Relationships:**
- `Account` → `JournalLineItem` (one account has many journal lines)
- `Account` → `GeneralLedgerEntry` (one account has period balances)
- `Account` → `Account` (self-referencing parent/child hierarchy)

**Business Rules:**
- Account code must be unique globally
- Type is restricted to ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
- Parent must be of compatible type (child cannot be different root type)
- Cannot archive an account with active children
- Cannot archive an account referenced by journal entries
- Revenue and Expense accounts are closed to Retained Earnings at period end

**Ownership:** CFO / Accounting Director

**Audit Requirements:**
- Every CREATE/UPDATE/DELETE logged to AuditEntry
- Account type changes require reason
- Soft delete only (archivedAt)

### 4.2 JournalEntry

**Purpose:** Double-entry journal entries recording all financial transactions.

**Status:** ✅ Backend complete — model, routes, Zod, RBAC, audit, post/reverse

```
JournalEntry
├── id: String (UUID, PK)
├── entryNumber: String (UNIQUE) — auto-generated "JE-YYYYMM-NNNN"
├── description: String
├── entryDate: DateTime
├── periodId: String (FK → FinancialPeriod)
├── period: FinancialPeriod
├── status: String — DRAFT | POSTED | REVERSED
├── source: String — MANUAL | BILLING | PAYMENT | CLOSING | REVERSAL
├── referenceId: String? — links to source invoice/payment ID
├── referenceType: String? — INVOICE | PAYMENT | MANUAL
├── totalDebit: Float (computed from lines)
├── totalCredit: Float (computed from lines)
├── createdBy: String? (user email)
├── postedAt: DateTime?
├── reversedAt: DateTime?
├── lines: JournalLineItem[]
└── audit: createdAt, archivedAt
```

**Relationships:**
- `JournalEntry` → `FinancialPeriod` (every entry belongs to a period)
- `JournalEntry` → `JournalLineItem` (one entry has 1-500 lines)
- `JournalEntry` → referenceId (links to Invoice/Payment source)

**Business Rules:**
- Total debits MUST equal total credits (enforced at API level with 0.001 tolerance)
- DRAFT entries can be edited; POSTED entries are immutable
- Only POSTED entries can be reversed (creates negated copy)
- Reversed entries get a reference back to original
- Period must be OPEN to create/post entries
- Entry numbers are auto-generated: JE-YYYYMM-NNNN

**Ownership:** Accounting Team (create), Controller (post)

**Audit Requirements:**
- DRAFT → POSTED status change requires audit
- Every reversal creates audit trail with reason
- Entry cannot be hard-deleted (soft delete only)
- All mutations logged to AuditEntry

### 4.3 JournalLineItem

**Purpose:** Individual debit/credit lines within a journal entry.

**Status:** ✅ Backend complete

```
JournalLineItem
├── id: String (UUID, PK)
├── journalId: String (FK → JournalEntry, cascade delete)
├── journal: JournalEntry
├── accountId: String (FK → Account)
├── account: Account
├── description: String?
├── debitAmount: Float (default 0)
├── creditAmount: Float (default 0)
├── currency: String (default "EGP")
├── exchangeRate: Float (default 1)
└── audit: createdAt
```

**Business Rules:**
- At least one line per journal entry
- Max 500 lines per entry (API limit)
- Each line must have either debitAmount > 0 OR creditAmount > 0 (not both)
- Line amounts must be positive numbers
- Account must be active

### 4.4 GeneralLedgerEntry

**Purpose:** Period-end account balance summary, enabling financial reporting.

**Status:** ✅ Backend complete

```
GeneralLedgerEntry
├── id: String (UUID, PK)
├── accountId: String (FK → Account)
├── account: Account
├── periodId: String (FK → FinancialPeriod)
├── period: FinancialPeriod
├── openingBalance: Float
├── totalDebit: Float
├── totalCredit: Float
├── closingBalance: Float (= opening + debit - credit)
└── audit: createdAt, updatedAt
```

**Unique Constraint:** (accountId, periodId) — one balance per account per period

**Business Rules:**
- openingBalance = closingBalance from previous period
- closingBalance = openingBalance + totalDebit - totalCredit
- Updated automatically when journal entries are posted
- For new accounts mid-period, openingBalance = 0
- Used as source for Trial Balance and financial reports

### 4.5 FinancialPeriod

**Purpose:** Monthly accounting periods controlling when entries can be posted.

**Status:** ✅ Backend complete

```
FinancialPeriod
├── id: String (UUID, PK)
├── year: Int
├── month: Int (1-12)
├── quarter: Int (computed from month)
├── startDate: DateTime
├── endDate: DateTime
├── status: String — OPEN | CLOSED
├── openedAt: DateTime
├── closedAt: DateTime?
├── closedBy: String?
└── audit: createdAt, archivedAt
```

**Unique Constraint:** (year, month)

**Relationships:**
- `FinancialPeriod` → `JournalEntry` (one period has many entries)
- `FinancialPeriod` → `GeneralLedgerEntry` (one period has many GL entries)

**Business Rules:**
- Only OPEN periods accept journal entries
- CLOSED periods are immutable — exception requires authorized re-open
- Closing generates auto-closing entries for REVENUE/EXPENSE → Retained Earnings
- Periods are created in advance (typically 12 months)
- Prior period adjustments go to current period with disclosure

### 4.6 FiscalYear (New — Enhanced)

**Purpose:** Annual financial reporting period, spanning multiple FinancialPeriods.

**Status:** ❌ Not built — new model needed

```
FiscalYear
├── id: String (UUID, PK)
├── year: Int (UNIQUE)
├── startDate: DateTime
├── endDate: DateTime
├── status: String — OPEN | CLOSED | LOCKED
├── openedAt: DateTime
├── closedAt: DateTime?
└── audit: createdAt, archivedAt
```

**Business Rules:**
- FiscalYear contains 12 FinancialPeriods
- Closing a fiscal year requires all periods to be CLOSED
- FiscalYear LOCKED status prevents any modification to any period

### 4.7 BankStatement & BankTransaction (New)

**Purpose:** Import and manage bank statements for reconciliation.

**Status:** ❌ Not built

```
BankStatement
├── id: String (UUID, PK)
├── bankAccountId: String
├── statementDate: DateTime
├── reference: String
├── description: String?
├── amount: Float
├── type: String — CREDIT | DEBIT
├── matched: Boolean (default false)
├── matchedTo: String? (FK → PaymentTransaction)
├── matchedAt: DateTime?
└── audit: createdAt, archivedAt

BankReconciliation
├── id: String (UUID, PK)
├── bankAccountId: String
├── periodId: String (FK → FinancialPeriod)
├── periodStart: DateTime
├── periodEnd: DateTime
├── openingBalance: Float
├── closingBalance: Float
├── totalMatched: Float
├── totalUnmatched: Float
├── status: String — DRAFT | RECONCILED | VERIFIED
└── audit: createdAt, archivedAt
```

**Business Rules:**
- Import formats: CSV, MT940, CAMT.053
- Auto-match rules: reference number match, amount + date fuzzy match
- Unmatched items flagged for manual review
- Reconciliation must balance before period can close
- Audit trail for manual matches and adjustments

### 4.8 Invoice Enhancement

**Purpose:** Enhanced invoice model supporting accounting integration.

**Status:** ✅ Existing model — needs new fields

**Enhancements:**
| New Field | Type | Purpose |
|-----------|------|---------|
| `periodId` | String? | FK → FinancialPeriod for revenue recognition |
| `journalEntryId` | String? | FK → JournalEntry (auto-posted billing journal) |
| `taxAmount` | Float | Total tax amount (computed from items) |
| `taxRate` | Float | Effective tax rate |
| `currency` | String | Base currency (default EGP) |
| `exchangeRate` | Float | FX rate at invoice date |
| `baseCurrencyAmount` | Float | Amount in base currency |
| `revenueRecognitionDate` | DateTime? | Accrual date |

**Integration:** When invoice status changes to ISSUED → auto-create journal entry posting to Accounts Receivable (DR) and Revenue (CR).

### 4.9 Payment Enhancement

**Purpose:** Enhanced payment model supporting accounting and reconciliation.

**Status:** ✅ Existing model — needs new fields

**Enhancements:**
| New Field | Type | Purpose |
|-----------|------|---------|
| `periodId` | String? | FK → FinancialPeriod |
| `journalEntryId` | String? | FK → JournalEntry (auto-posted payment journal) |
| `bankReference` | String? | Bank transaction reference |
| `bankStatementId` | String? | FK → BankStatement |
| `settlementStatus` | String? | PENDING | SETTLED | FAILED |
| `settlementDate` | DateTime? | When payment cleared bank |
| `gatewayFee` | Float | Payment gateway processing fee |
| `netAmount` | Float | Amount after gateway fee |

**Integration:** When payment is COMPLETED → auto-create journal entry posting to Cash (DR) and Accounts Receivable (CR).

### 4.10 CollectionCase & PromiseToPay Enhancement

**Purpose:** Enhanced collection and PTP models supporting intelligent dunning.

**Status:** ✅ Existing models — needs new fields

**CollectionCase Enhancements:**
| New Field | Type | Purpose |
|-----------|------|---------|
| `dunningStage` | Int | Current escalation stage (0-5) |
| `dunningLastAt` | DateTime? | Last dunning action timestamp |
| `nextDunningAt` | DateTime? | Next scheduled dunning |
| `paymentProbability` | Float? | AI-calculated payment likelihood (0-1) |
| `priorityScore` | Float? | Collection priority ranking |
| `collectorId` | String? | FK → User (assigned collector) |
| `expectedResolutionDate` | DateTime? | Target resolution date |
| `writeOffReason` | String? | Reason if written off |

**PromiseToPay Enhancements:**
| New Field | Type | Purpose |
|-----------|------|---------|
| `reminderCount` | Int | Number of reminders sent |
| `lastReminderAt` | DateTime? | Last reminder timestamp |
| `reminderMethod` | String? | SMS | EMAIL | CALL |
| `missedPtpCount` | Int | Consecutive missed promises |
| `autoEscalate` | Boolean | Auto-escalate on missed PTP |

### 4.11 RevenueTransaction (New)

**Purpose:** Record individual revenue recognition events with full traceability.

**Status:** ❌ Not built

```
RevenueTransaction
├── id: String (UUID, PK)
├── invoiceId: String (FK → Invoice)
├── journalEntryId: String (FK → JournalEntry)
├── periodId: String (FK → FinancialPeriod)
├── amount: Float
├── type: String — SERVICE | PENALTY | ADJUSTMENT | DISCOUNT
├── recognitionDate: DateTime
├── deferredUntil: DateTime? (for deferred revenue)
├── status: String — RECOGNIZED | DEFERRED | REVERSED
└── audit: createdAt, archivedAt
```

**Business Rules:**
- Revenue recognized on invoice ISSUE date (accrual basis)
- Deferred revenue tracked separately until recognition criteria met
- Audit trail from meter reading → invoice → revenue → GL

---

## PART 5: BILLING INTELLIGENCE ARCHITECTURE

### 5.1 Smart Bill Run

**Current:** Bill Run executes and generates invoices. No validation, no analytics, no revenue assurance.

**C13 Target:**

```
Bill Run Workflow:
┌──────────┐    ┌───────────┐    ┌───────────┐    ┌──────────┐    ┌──────────┐
│ 1. PRE-  │───→│ 2.        │───→│ 3.        │───→│ 4.       │───→│ 5.       │
│ FLIGHT   │    │ EXECUTE   │    │ VALIDATE  │    │ ANALYZE  │    │ APPROVE  │
│ CHECKS   │    │           │    │           │    │          │    │          │
└──────────┘    └───────────┘    └───────────┘    └──────────┘    └──────────┘
     │               │               │                │               │
     ├─ Readings OK  ├─ Calc billed  ├─ Errors > X?   ├─ Revenue vs   ├─ Publish
     ├─ Tariff valid │   consumption ├─ Spike > Y%?   │   prior period├─ Post to GL
     ├─ Customers    │   consumption ├─ Negatives?    ├─ Collection   │
     │   active      │   apply tariff├─ Zero usage?   │   forecast    │
     └─ Period       │   gen invoice ├─ Rounding?     └─ Anomaly flag │
       open          └───────────┘   └───────────┘    └──────────────┘ └──────────┘
```

**Validation Rules (built as RevenueRule model):**
| Rule ID | Rule | Severity | Action |
|---------|------|----------|--------|
| REV-001 | Consumption spike > 300% vs average | WARNING | Flag for review |
| REV-002 | Negative consumption detected | ERROR | Block billing |
| REV-003 | Zero consumption (active meter) | WARNING | Flag for review |
| REV-004 | Missing reading (estimated instead) | WARNING | Flag for review |
| REV-005 | Tariff mismatch (customer type ≠ tariff type) | ERROR | Block billing |
| REV-006 | Bill total > 2x previous period | WARNING | Flag for review |
| REV-007 | Customer has no active meter | ERROR | Block billing |
| REV-008 | Period already billed | ERROR | Block billing |
| REV-009 | Consumption < 10% of previous period | INFO | Flag for review |
| REV-010 | Meter status not ACTIVE | WARNING | Flag for review |

### 5.2 Tariff Intelligence

**Current:** Flat-rate only with basic TariffRate and TariffTier models.

**C13 Target — New capabilities:**
- **Time-of-Use:** Peak (4-8 PM), Shoulder (8-11 AM, 8-11 PM), Off-Peak (11 PM-4 AM) rates
- **Tiered Pricing:** Volume-based brackets (0-100 kWh @ rate1, 101-300 @ rate2, 300+ @ rate3)
- **Demand Charge:** kW/kVA demand-based charges with rolling windows
- **Pro-ration:** Mid-period move-in/move-out, mid-period tariff change
- **Seasonal Rates:** Summer vs winter rate schedules
- **Tax Determination:** Auto-apply VAT, sales tax, withholding tax based on customer type
- **Tariff Versioning:** Effective dating with draft → active → superseded lifecycle

### 5.3 Revenue-to-GL Posting Pipeline

```
Invoice ISSUE
    │
    ▼
┌──────────────────────────────────────────┐
│ Auto-Create Journal Entry (Source: BILLING)│
│                                          │
│  DR: Accounts Receivable (1201-01)       │
│  CR: Revenue - Service (4001-01)         │
│  [If tax: CR: Tax Payable (2101-01)]     │
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│ Auto-Post Journal Entry                  │
│ (Status: POSTED, postedAt: now)          │
│                                          │
│ → Updates GeneralLedgerEntry for both    │
│   accounts in current period            │
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│ RevenueTransaction Created               │
│  - invoiceId, journalEntryId, periodId   │
│  - type: SERVICE                         │
│  - status: RECOGNIZED                    │
└──────────────────────────────────────────┘
```

When payment arrives:
```
Payment COMPLETED
    │
    ▼
┌──────────────────────────────────────────┐
│ Auto-Create Journal Entry (Source: PAYMENT)│
│                                          │
│  DR: Cash (1001-01)                      │
│  CR: Accounts Receivable (1201-01)       │
│  [If gateway fee: DR: Bank Charges]      │
└──────────────────────────────────────────┘
```

### 5.4 Consumption Analysis

- **Per-meter consumption trends** (daily, weekly, monthly, annual)
- **Area/project/zone level aggregation**
- **Comparison vs prior period, same period prior year**
- **Anomaly detection** (usage spike/drop beyond thresholds)
- **Loss analysis** (distribution losses, unmetered consumption)
- **Forecasting** (ARIMA-based consumption prediction)

---

## PART 6: COLLECTION INTELLIGENCE FRAMEWORK

### 6.1 Customer Payment Behavior Scoring

**Model inputs:**
| Feature | Source | Weight |
|---------|--------|--------|
| Days overdue | Invoice.dueDate | High |
| Number of unpaid invoices | CollectionCase.invoiceId count | High |
| Total overdue amount | Sum of invoice balances | High |
| Payment history (on-time %) | Payment records | High |
| Promise-to-Pay track record | PromiseToPay statuses | Medium |
| Customer tenure | Customer.createdAt | Low |
| Customer group/segment | Customer.group | Medium |
| Area/project | Location | Low |
| Seasonality | Historical payment patterns | Medium |
| Previous collections actions | CollectionAction history | Medium |

**Output:** `paymentProbability = 0.0 - 1.0` (AI-generated score)

**Usage:**
- Score all active collection cases daily
- Prioritize cases with low scores (< 0.3) for immediate action
- Assign high-value, low-probability cases to senior collectors
- Auto-send reminders for medium-probability cases (0.3-0.7)
- Flag high-probability cases (> 0.7) for self-service payment arrangement

### 6.2 Collection Priority Model

```
Priority Score = (Overdue Amount × 0.4) + 
                 ((120 - Days Overdue) × 0.3) +  // older = higher priority
                 ((1 - Payment Probability) × 0.2) + 
                 (Business Impact × 0.1)

Business Impact: 
  GOVERNMENT = 5
  CORPORATE_LARGE = 4
  CORPORATE_SMALL = 3
  RESIDENTIAL_HIGH_VALUE = 2
  RESIDENTIAL = 1

Priority Buckets:
  CRITICAL: score > 80  (immediate escalation + field visit)
  HIGH:     score 60-80 (intensive dunning + collector assignment)
  MEDIUM:   score 30-60 (automated dunning + reminder)
  LOW:      score < 30  (self-service + email reminder)
```

### 6.3 Intelligent Dunning

**Escalation chain (configurable per customer group):**

```
Stage 0: Invoice issued (Day 0)
Stage 1: Due date reminder (Day -3 before due)
Stage 2: Payment overdue — SMS + Email (Day +1)
Stage 3: First escalation — Call + Formal Letter (Day +15)
Stage 4: Second escalation — Letter + PTP required (Day +30)
Stage 5: Field visit — Collector dispatched (Day +45)
Stage 6: Final notice — Pre-disconnection (Day +60)
Stage 7: Write-off or Legal (Day +90+)
```

**Dunning rule config (DunningRule model):**
| Field | Description |
|-------|-------------|
| `customerGroup` | Which segment this rule applies to |
| `stage` | Escalation stage (0-7) |
| `triggerDays` | Days from due date to trigger |
| `method` | SMS | EMAIL | CALL | LETTER | VISIT |
| `templateId` | Notification template to use |
| `autoEscalate` | Whether to auto-move to next stage |
| `requirePtp` | Whether PTP is required before next stage |
| `assignCollector` | Whether to auto-assign to collector |

### 6.4 Aging Analysis

```
AR Aging Report:
┌─────────────────────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ Customer Group          │ Current  │ 1-30     │ 31-60    │ 61-90    │ 90+      │
├─────────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Government              │  50,000  │ 120,000  │  80,000  │  30,000  │  15,000  │
│ Corporate Large         │  30,000  │  80,000  │  50,000  │  20,000  │  10,000  │
│ Corporate Small         │  20,000  │  40,000  │  25,000  │  12,000  │   8,000  │
│ Residential High Value  │  15,000  │  25,000  │  15,000  │   8,000  │   5,000  │
│ Residential             │  10,000  │  15,000  │  10,000  │   5,000  │   3,000  │
├─────────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ **TOTAL**               │ **125K** │ **280K** │ **180K** │ **75K**  │ **41K**  │
│ **% of Total**          │ **18%**  │ **40%**  │ **26%**  │ **11%**  │ **6%**   │
└─────────────────────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

### 6.5 Collection Workflow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          COLLECTION WORKFLOW                                   │
│                                                                                │
│  Invoice OVERDUE (by 1 day)                                                    │
│       │                                                                        │
│       ▼                                                                        │
│  ┌─────────────────────────────┐                                              │
│  │ Auto-Create CollectionCase   │                                              │
│  │ Calculate Priority Score    │                                              │
│  │ Calculate Payment Prob.     │                                              │
│  │ → Stage 1 triggered         │                                              │
│  └─────────────────────────────┘                                              │
│       │                                                                        │
│       ▼                                                                        │
│  ┌─────────────────────────────┐                                              │
│  │ Auto-Send Reminder (SMS)    │← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─       │
│  └─────────────────────────────┘                 Repeat for each stage        │
│       │                                                                        │
│       ▼ (Stage advances per DunningRule)                                       │
│  ┌─────────────────────────────┐                                              │
│  │ Next Dunning Action         │──→ PTP Created? ──YES──→ Track PTP            │
│  └─────────────────────────────┘       │                        │             │
│       │                                NO                       │             │
│       ▼                                ▼                        ▼             │
│  ┌─────────────────────────────┐  ┌──────────┐          ┌──────────────┐      │
│  │ PTP Required (Stage 4+)     │  │ Continue │          │ Paid? ─YES──→│      │
│  │ Promised? ──YES──→ Track    │  │ Escalate │          │ Close Case   │      │
│  │ NO ──→ Escalate to Field    │  └──────────┘          └──────────────┘      │
│  └─────────────────────────────┘        │                     │               │
│       │                                 │                     NO              │
│       ▼                                 ▼                     ▼               │
│  ┌─────────────────────────────┐  ┌──────────────┐    ┌──────────────┐        │
│  │ Field Visit Assigned        │  │ Missed PTP   │    │ Re-escalate  │        │
│  │ Collector Dispatched        │  │ Auto-Escalate│    │ + Penalty    │        │
│  │ Resolution Attempted        │  └──────────────┘    └──────────────┘        │
│  └─────────────────────────────┘                                              │
│       │                                                                        │
│       ▼ (Final stages)                                                        │
│  ┌──────────────┐  ┌───────────────┐  ┌───────────────┐                      │
│  │ Pre-Discon   │  │ Write-Off     │  │ Legal Action  │                      │
│  │ Notice Sent  │──→│ Recommended   │──→│ (if applicable)│                     │
│  │ 10-day final │  │ → Approved?   │  └───────────────┘                      │
│  └──────────────┘  └───────────────┘                                          │
│                           │                                                    │
│                    ┌──────┴──────┐                                            │
│                    │ YES         │ NO                                          │
│                    ▼             ▼                                             │
│              ┌──────────┐  ┌──────────┐                                      │
│              │ Write Off │  │ Continue │                                      │
│              │ Close Case│  │ Dunning  │                                      │
│              └──────────┘  └──────────┘                                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 7: AI FINANCIAL INTELLIGENCE LAYER

### 7.1 Agent Architecture

All 5 AI agents integrate with the C12-W07 Operational Intelligence framework (AIRecommendation model, governance rules, audit trail).

**Governance Rules (all agents):**
| Rule | Description |
|------|-------------|
| AG-1 | No agent can execute financial transactions (create journal, issue invoice, write off) |
| AG-2 | All recommendations below 0.7 confidence require human review |
| AG-3 | Every recommendation includes evidence sources + confidence score |
| AG-4 | All agent actions are audited to AuditEntry |
| AG-5 | Agents cannot modify financial periods or accounting rules |
| AG-6 | Monthly agent performance review |
| AG-7 | Human override always available |

### 7.2 Revenue Leakage Detection Agent

| Field | Value |
|-------|-------|
| **Purpose** | Detect billing errors, tariff misapplication, unbilled consumption, meter-to-bill discrepancies |
| **Autonomy** | ⚡ Semi-autonomous (detects + recommends, human approves correction) |
| **Human Approval** | Required for corrective journal entries |
| **Audit** | All findings logged to AIRecommendation + AuditEntry |

**Detection Rules:**
```
RULE 1: Unbilled Consumption
  IF meter has readings for period AND no invoice exists
  AND meter status = ACTIVE
  THEN FLAG: Potential unbilled consumption

RULE 2: Tariff Misapplication
  IF customer type = RESIDENTIAL AND tariff type = COMMERCIAL
  OR customer type = COMMERCIAL AND tariff type = RESIDENTIAL
  THEN FLAG: Possible tariff misapplication

RULE 3: Consumption Anomaly
  IF current period consumption < 50% of 6-month average
  OR current period consumption > 300% of 6-month average
  THEN FLAG: Consumption anomaly — possible meter error

RULE 4: Zero Consumption Active Meter
  IF meter status = ACTIVE AND period consumption = 0
  AND meter has no maintenance event in period
  THEN FLAG: Zero consumption — possible communication failure

RULE 5: Billing vs Reading Discrepancy
  IF billed amount differs from calculated (tariff × consumption) by > 1%
  THEN FLAG: Billing calculation discrepancy

RULE 6: Late Billing
  IF period end > 45 days ago AND no bill run for period
  THEN FLAG: Period may have unbilled revenue

RULE 7: Missing Payment Reconciliation
  IF payment recorded AND no bank settlement within 7 days
  THEN FLAG: Payment not settled — possible reconciliation issue

RULE 8: Invoice Adjustment Without Reason
  IF invoice cancelled/adjusted AND no reason recorded
  THEN FLAG: Adjustment missing audit trail
```

**Output:** `{ finding, severity, confidence, affectedAmount, recommendedAction, evidence[] }`

### 7.3 Collection Optimization Agent

| Field | Value |
|-------|-------|
| **Purpose** | Score customers by payment probability, recommend optimal dunning strategy, prioritize cases |
| **Autonomy** | ⚡ Fully autonomous (scoring + recommendation, no execution) |
| **Human Approval** | None (read-only recommendations) |
| **Audit** | All scores logged |

**Scoring Model Features:**
- Payment history (last 12 months)
- Current overdue status and amount
- PTP track record
- Customer tenure and segment
- Communication response rate
- Previous collection actions effectiveness
- Seasonal payment patterns

**Output:** `{ customerId, paymentProbability, recommendedAction, priorityScore, riskFactors[] }`

### 7.4 Financial Forecast Agent

| Field | Value |
|-------|-------|
| **Purpose** | Forecast revenue, AR, cash flow, and collection effectiveness for next 3-6 months |
| **Autonomy** | ⚡ Fully autonomous (read-only forecasts) |
| **Human Approval** | None |
| **Audit** | Forecast accuracy tracked monthly |

**Forecasts:**
| Metric | Horizon | Method |
|--------|---------|--------|
| Monthly revenue | 6 months | ARIMA + seasonal decomposition |
| AR aging | 3 months | Historical pattern + current trend |
| Cash collection | 3 months | Weighted by payment probability |
| Collection effectiveness | 3 months | CER trend projection |

**Output:** `{ forecast: { month, metric, projected, lowerBound, upperBound, confidence }[] }`

### 7.5 Invoice Anomaly Agent

| Field | Value |
|-------|-------|
| **Purpose** | Detect anomalous invoices before they are sent to customers |
| **Autonomy** | ⚡ Semi-autonomous (flags anomalies, human reviews) |
| **Human Approval** | Required to block invoice from being issued |
| **Audit** | All anomalies logged |

**Anomaly Detection:**
```
ANOMALY 1: Amount Deviation
  IF invoice total > mean + 3σ of customer's historical invoices
  THEN FLAG: Amount unusually high

ANOMALY 2: Zero Amount Invoice
  IF invoice total < 0.01 AND invoice has items
  THEN FLAG: Zero amount with items

ANOMALY 3: Duplicate Invoice
  IF same customer + same period + same amount as existing invoice
  THEN FLAG: Possible duplicate

ANOMALY 4: Missing Items
  IF invoice has no items AND status != DRAFT
  THEN FLAG: Invoice without line items

ANOMALY 5: Rounding Error
  IF sum(item amounts) ≠ invoice total (tolerance > 0.01)
  THEN FLAG: Rounding discrepancy

ANOMALY 6: Negative Charge
  IF any line item amount < 0 AND type != "adjustment"
  THEN FLAG: Unexpected negative charge

ANOMALY 7: Tax Mismatch
  IF tax rate ≠ customer's applicable tax rate
  THEN FLAG: Possible tax misapplication
```

**Output:** `{ invoiceId, anomalies: [{ type, severity, description, confidence }], riskScore }`

### 7.6 Financial Classification Agent

| Field | Value |
|-------|-------|
| **Purpose** | Auto-classify journal entries to correct account codes based on transaction description |
| **Autonomy** | ⚡ Semi-autonomous (suggests account code, human approves) |
| **Human Approval** | Required for first use, agent learns from corrections |
| **Audit** | All classification decisions logged |

**Classification Model:**
- NLP on transaction description → suggest account code
- Learns from human corrections (supervised learning)
- Confidence threshold: > 0.9 auto-suggest, 0.7-0.9 flag for review, < 0.7 require manual

**Examples:**
```
"Electricity bill for October" → 5101 (Utilities Expense)
"Office rent payment" → 5201 (Rent Expense)
"Customer payment INV-2024-001" → 1201 (Accounts Receivable)
"Meter purchase 100 units" → 1401 (Inventory - Meters)
"Salaries for July" → 5103 (Salary Expense)
```

**Output:** `{ description, suggestedAccountId, confidence, alternatives: [{ accountId, confidence }] }`

---

## PART 8: ENTERPRISE FINANCIAL GOVERNANCE

### 8.1 Financial Approval Workflow

| Action | Creator | Approver | Max Amount | Escalation |
|--------|---------|----------|------------|------------|
| Journal Entry (DRAFT) | Accounting Clerk | N/A (self) | N/A | N/A |
| Journal Entry → POST | Accounting Clerk | Controller | < 100K EGP | Finance Manager |
| Journal Entry → POST | Accounting Clerk | Finance Manager | 100K - 1M EGP | CFO |
| Journal Entry → POST | Accounting Clerk | CFO | > 1M EGP | Board |
| Period Close | Controller | CFO | N/A | Audit Committee |
| Write-off < 10K | Collector | Collections Manager | N/A | N/A |
| Write-off 10K-100K | Collector | Finance Manager | N/A | CFO |
| Write-off > 100K | Collector | CFO | N/A | Board |
| Invoice Cancellation | Billing Operator | Billing Manager | N/A | N/A |
| Payment Refund | Cashier | Finance Manager | < 50K EGP | CFO |
| Account Creation | Accounting Clerk | Controller | N/A | N/A |

### 8.2 Segregation of Duties (SoD)

| Role | Can Create | Can Approve | Can Post | Can Close Period |
|------|-----------|-------------|----------|-----------------|
| Accounting Clerk | ✅ | ❌ | ❌ | ❌ |
| Controller | ❌ | ✅ | ✅ | ❌ |
| Finance Manager | ❌ | ✅ | ✅ | ✅ |
| CFO | ❌ | ✅ | ❌ | ✅ (override) |

**SoD Enforcement:**
- Same user cannot create AND post a journal entry
- Period close requires separate approval
- Write-off requester ≠ write-off approver
- Account creation ≠ account activation

### 8.3 Audit Controls

| Control | Mechanism | Implementation |
|---------|-----------|----------------|
| Journal Immutability | POSTED entries cannot be edited | Application guard in route |
| Period Locking | CLOSED periods reject new entries | Route-level period check |
| Soft Delete | archivedAt pattern + guard clauses | Prisma + route validation |
| Audit Trail | Every mutation logged to AuditEntry | Middleware auditLog() |
| Data Integrity | Total debit = total credit enforced | API-level validation (0.001 tol) |
| Access Control | RBAC with scoped permissions | requirePermission middleware |
| Correlation ID | Every event chain traceable | correlationId middleware |

### 8.4 Correction Workflow

```
DISCOVER ERROR
    │
    ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 1. IDENTIFY                                                          │
│   - Which entry/period/account affected?                            │
│   - What was the error (wrong account, wrong amount, duplicate)?    │
│   - What is the correct entry?                                      │
└──────────────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 2. CURRENT PERIOD (OPEN)                                             │
│   - If DRAFT: Edit directly                                         │
│   - If POSTED: Reverse original, create corrected entry             │
│   - Reversal includes reference back to original                    │
└──────────────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────────────────┐
│ 3. PRIOR PERIOD (CLOSED)                                             │
│   - Create correcting entry in CURRENT period                       │
│   - Clearly labeled "Prior period correction: [description]"        │
│   - Reference original entry number                                 │
│   - CFO approval required                                           │
│   - No re-opening of closed periods allowed                         │
└──────────────────────────────────────────────────────────────────────┘
```

---

## PART 9: INTEGRATION STRATEGY

### 9.1 Existing MeterVerse Billing

| Integration | Method | Wave | Priority |
|-------------|--------|------|----------|
| Invoice → Journal | Auto-create JE on invoice ISSUE | W02 | P0 |
| Payment → Journal | Auto-create JE on payment COMPLETE | W02 | P0 |
| CollectionCase → Dunning | Auto-escalate by rules | W04 | P0 |
| BillRun → Revenue | Validate consumption before billing | W02 | P0 |
| Tariff → Pricing | ToU/tiered/demand engine | W03 | P0 |
| Customer → Payment Score | Payment behavior analysis | W04 | P0 |
| MeterReading → Bill Val | Reading validation before billing | W02 | P0 |

### 9.2 External Integration

| System | Integration Type | Standard | Wave | Priority |
|--------|-----------------|----------|------|----------|
| Banks (statement import) | File upload (CSV, MT940, CAMT.053) | ISO 20022 | W06 | P0 |
| Payment Gateways (Paymob, Fawry) | API → settlement reconciliation | REST | W06 | P1 |
| ERP (Oracle, SAP, Odoo) | GL export → ERP import | CSV/API | Post-C13 | P2 |
| Tax Authority (e-invoice) | E-invoice format compliance | Local standard | W08 | P1 |
| Collection Agencies | Case export | CSV/API | W09 | P2 |

---

## PART 10: C13 WAVE BREAKDOWN

### WAVE C13-W01: Billing-to-GL Integration (5 days)
**Objective:** Connect existing billing → accounting engine with auto-posting pipeline

| Aspect | Detail |
|--------|--------|
| **Dependencies** | C12 Identity (complete), accounting backend (complete) |
| **Deliverables** | Invoice→Journal auto-post on ISSUE, Payment→Journal auto-post on COMPLETE, RevenueTransaction model + service, Reconciliation validation (invoice sum = journal total) |
| **Governance Gate** | Pipeline posts 10 test invoices → verify GL updated correctly |
| **Certification** | Every ISSUED invoice has matching JournalEntry. Trial Balance includes billing transactions. |

### WAVE C13-W02: Revenue Assurance Engine (5 days)
**Objective:** Implement pre-bill validation, leakage detection, and billing intelligence

| Aspect | Detail |
|--------|--------|
| **Dependencies** | W01 |
| **Deliverables** | RevenueRule model (10 validation rules), Pre-bill validation pipeline, Billing intelligence dashboard (leakage, anomalies, exceptions), Revenue leakage report |
| **Governance Gate** | All 10 rules tested against historical billing data |
| **Certification** | Revenue leakage detection operational. Pre-bill validation blocks erroneous invoices. |

### WAVE C13-W03: Enterprise Tariff Engine (6 days)
**Objective:** Implement ToU, tiered, demand, pro-ration, seasonal, and tax engines

| Aspect | Detail |
|--------|--------|
| **Dependencies** | W01 |
| **Deliverables** | TariffSchedule model (ToU windows), Time-of-Use tariff calculator (peak/shoulder/off-peak), Tiered pricing calculator (volume brackets), Demand charge calculator (kW/kVA), Pro-ration engine (mid-period changes), Seasonal rates engine, Tax determination engine, Tariff versioning (draft→active→superseded) |
| **Governance Gate** | All tariff types tested with 50+ scenarios |
| **Certification** | Complex tariffs calculate correctly. Pro-ration matches manual calculation. |

### WAVE C13-W04: Collection Intelligence Engine (6 days)
**Objective:** Automate dunning, PTP, collector assignment, and write-off workflow

| Aspect | Detail |
|--------|--------|
| **Dependencies** | W01 |
| **Deliverables** | DunningRule model + CRUD, Dunning escalation engine (7 stages), Promise-to-Pay enhancement (reminder, auto-escalate on miss), Collector assignment service (workload-balanced), CollectionCase enhancement (priority, probability, stage), Write-off workflow, Payment behavior scoring service, Collection dashboard |
| **Governance Gate** | Dunning automation test: 100 cases → 90% auto-escalated correctly |
| **Certification** | Collections automated end-to-end. Write-off requires approval. |

### WAVE C13-W05: Billing Analytics & AR Intelligence (5 days)
**Objective:** Real-time AR aging, revenue forecasting, collection effectiveness tracking

| Aspect | Detail |
|--------|--------|
| **Dependencies** | W02, W04 |
| **Deliverables** | AR aging dashboard (current/30/60/90/120+ by segment), Collection effectiveness rate (CER) tracking, Revenue forecasting (ARIMA-based projection), Customer payment behavior scoring, Billing cycle analysis, Consumption trend overlay |
| **Governance Gate** | AR aging matches manual SQL query for 100 invoices |
| **Certification** | Analytics dashboard data verified accurate. Forecast within 10% of actual. |

### WAVE C13-W06: Bank Reconciliation & Settlement (5 days)
**Objective:** Import bank statements, auto-match payments, reconcile

| Aspect | Detail |
|--------|--------|
| **Dependencies** | W01 |
| **Deliverables** | BankStatement model + CRUD, BankStatement import parser (CSV, MT940, CAMT.053), Auto-matching engine (reference, amount, date), Exception handling (unmatched, partial, duplicate), Manual reconciliation workbench, Gateway settlement reconciliation, BankReconciliation model + period linking |
| **Governance Gate** | Auto-match rate > 85% on test data. All exceptions handled correctly. |
| **Certification** | Bank reconciliation operational. Auto-match > 85%. Manual reconciliation available. |

### WAVE C13-W07: Financial Reporting Suite (5 days)
**Objective:** GAAP-compliant financial reports from GeneralLedger data

| Aspect | Detail |
|--------|--------|
| **Dependencies** | W01, W05, W06 |
| **Deliverables** | P&L statement (revenue, COS, gross margin, opex, net income by period), Balance Sheet (assets, liabilities, equity, period comparison), Cash Flow statement (direct/indirect method), Multi-period comparison (month, quarter, YTD, YoY), GL drill-down (account → period → journal → invoice), Audit report (all journal activity in period) |
| **Governance Gate** | P&L net income = Balance Sheet equity change for same period |
| **Certification** | P&L balances with retained earnings change. Balance Sheet balances. Cash Flow reconciles. |

### WAVE C13-W08: Multi-Currency & Tax Engine (4 days)
**Objective:** Support multi-currency invoices, FX transactions, enhanced tax rules

| Aspect | Detail |
|--------|--------|
| **Dependencies** | W01, W07 |
| **Deliverables** | ExchangeRate model + CRUD (auto-fetch + manual override), Multi-currency invoice enhancement, Multi-currency posting (base + local currency), FX gain/loss calculation + auto-journal, Enhanced tax engine (withholding, VAT stacking, exemption rules), E-invoice format compliance |
| **Governance Gate** | Multi-currency invoice generates correct FX journal entries |
| **Certification** | Multi-currency transactions post correctly. FX gain/loss calculated. Tax rules apply correctly. |

### WAVE C13-W09: Intelligent Dunning & Customer Financial Portal (5 days)
**Objective:** AI-driven dunning optimization, self-service payment arrangement

| Aspect | Detail |
|--------|--------|
| **Dependencies** | W04 |
| **Deliverables** | AI-driven dunning optimization (channel/timing/message selection), Customer financial dashboard (bills, payments, balance, usage), Self-service payment arrangement, Dispute management workflow, Auto-payment enrollment, Smart SMS/Email payment reminders |
| **Governance Gate** | AI dunning test: 50 customers → recommendation within 10% of optimal |
| **Certification** | AI dunning operational. Customer self-service available. Disputes trackable. |

### WAVE C13-W10: Audit & Compliance Integration (5 days)
**Objective:** Enforce segregation of duties, period immutability, compliance reporting

| Aspect | Detail |
|--------|--------|
| **Dependencies** | W01, W07 |
| **Deliverables** | Segregation of duties (SoD) enforcement (create≠approve≠post), Period close checklist automation, Immutability hardening (posted entries fully locked), Compliance reporting (GAAP, IFRS, local), Audit trail enhancement (financial-specific), Data retention policy enforcement, SoD violation alerts |
| **Governance Gate** | SoD test: same user cannot create+post. Period close blocks new entries. |
| **Certification** | SoD enforced. Periods immutable. Compliance reports accurate. Audit trail complete. |

### WAVE C13-W11: Frontend Financial Workbench (6 days)
**Objective:** 10 financial workbench pages with complete UI

| Aspect | Detail |
|--------|--------|
| **Dependencies** | All W02-W10 |
| **Deliverables** | Financial Dashboard (revenue KPIs, AR aging, collection rate), Chart of Accounts Manager (hierarchical tree, CRUD), Journal Entry Workbench (create, post, reverse, browse), Trial Balance Viewer (period select, drill-down), Bank Reconciliation Workbench (statement import, match, exception), Collection Workbench (cases, PTPs, assignments, visits), Revenue Assurance Dashboard (leakage, errors, reconciliation), Financial Reports (P&L, BS, CF with period select), Tariff Manager (ToU, tiers, demand, versioning), Dunning Configuration Console (rules, templates, escalation) |
| **Governance Gate** | All 10 pages render, CRUD operations complete, data verified against API |
| **Certification** | Full financial workbench operational. All pages meet UX standards. |

### WAVE C13-W12: Financial Intelligence Certification (3 days)
**Objective:** Full certification of C13 program with 395 tests

| Aspect | Detail |
|--------|--------|
| **Dependencies** | W01-W11 |
| **Deliverables** | Full test suite execution (395 tests), Integration test: billing→GL→reporting complete flow, Performance test: 100K invoices, 500K journal entries under 30s batch, Security audit: SoD, immutability, access control, Documentation: user guides, admin guides, API docs, Certification report: maturity before/after, coverage, risks, Rollback plan verification |
| **Governance Gate** | All 395 tests pass. Performance within SLA. Security audit clean. |
| **Certification** | C13 certified. Accounting 90%. Billing 95%. Collections 85%. |

---

## PART 11: TESTING STRATEGY — 395 TESTS

### 11.1 Accounting Correctness Tests (80)

| Category | Tests | Focus |
|----------|-------|-------|
| Account hierarchy | 10 | Parent/child CRUD, type validation, code uniqueness |
| Journal entry balancing | 20 | Debit=credit enforcement, partial line, multi-line |
| Journal lifecycle | 15 | DRAFT→POSTED→REVERSED, edit guard, period validation |
| Journal reversal | 10 | Full reversal, partial reversal, reversed entry immutability |
| Period close | 15 | Close with/without closing entries, guard against DRAFT entries |
| Trial balance | 10 | Account grouping, balancing verification, drill-down accuracy |

### 11.2 Billing Regression Tests (60)

| Category | Tests | Focus |
|----------|-------|-------|
| Bill run lifecycle | 10 | Create, schedule, execute, close, cancel |
| Invoice generation | 15 | Single meter, multi-meter, multi-utility, bulk |
| Invoice lifecycle | 10 | DRAFT→APPROVED→ISSUED→CANCELLED |
| Invoice adjustments | 10 | Credit note, debit note, correction |
| Invoice cancellation | 5 | Before/after issue, with/without payment |
| Invoice-GL integration | 10 | Auto-post on issue, verify GL impact |

### 11.3 Financial Audit Tests (50)

| Category | Tests | Focus |
|----------|-------|-------|
| Segregation of duties | 10 | Create≠approve≠post enforcement |
| Period immutability | 10 | Closed period rejects, locked year rejects |
| Journal immutability | 10 | POSTED cannot edit, REVERSED cannot reverse |
| Audit trail | 10 | Every mutation logged, correlation IDs present |
| Compliance reports | 10 | GAAP format, IFRS format, local format |

### 11.4 Security Tests (40)

| Category | Tests | Focus |
|----------|-------|-------|
| RBAC enforcement | 10 | Viewer cannot create, operator cannot post |
| Data isolation | 10 | Area A user cannot see Area B financials |
| API security | 10 | Zod validation, SQL injection, parameter tampering |
| Financial data access | 10 | Only authorized roles see amounts, PII isolation |

### 11.5 AI Accuracy Tests (50)

| Category | Tests | Focus |
|----------|-------|-------|
| Revenue Leakage Agent | 15 | All 8 rules tested against known-good/bad scenarios |
| Collection Optimization Agent | 10 | Scoring accuracy, priority ranking, recommendation relevance |
| Financial Forecast Agent | 10 | Forecast vs actual accuracy tracking |
| Invoice Anomaly Agent | 10 | All 7 anomaly types tested |
| Financial Classification Agent | 5 | Description→account mapping accuracy |

### 11.6 Data Integrity Tests (40)

| Category | Tests | Focus |
|----------|-------|-------|
| Journal balancing | 10 | Every period: total debits = total credits |
| GL consistency | 10 | Opening balance = prior period closing balance |
| Revenue recognition | 10 | Every invoice has revenue transaction |
| AR = sum of invoices | 10 | AR GL balance = sum of unpaid invoices |

### 11.7 Reconciliation Tests (40)

| Category | Tests | Focus |
|----------|-------|-------|
| Statement import | 10 | CSV, MT940, CAMT.053 parsing accuracy |
| Auto-match | 15 | Reference match, amount+date fuzzy match, edge cases |
| Exception handling | 10 | Unmatched, partial match, duplicate |
| Settlement reconciliation | 5 | Gateway match, fee calculation |

### 11.8 Tariff Engine Tests (35)

| Category | Tests | Focus |
|----------|-------|-------|
| Time-of-Use | 10 | Peak/shoulder/off-peak for all schedules |
| Tiered pricing | 8 | Volume bracket boundaries, cross-bracket |
| Demand charge | 5 | kW, kVA, rolling window |
| Pro-ration | 7 | Mid-period move-in, move-out, tariff change |
| Tax determination | 5 | VAT, withholding, exemption |

---

## PART 12: ENTERPRISE CERTIFICATION GATE

### C13 Certification Definition of Done

```
C13 PROGRAM CERTIFIED when ALL of the following are true:

□ ACCOUNTING MATURITY ≥ 90%
   □ Account CRUD operational with hierarchy (backend ✅)
   □ Journal entry CRUD with balancing (backend ✅)
   □ General Ledger with period balances (backend ✅)
   □ Financial Periods with open/close (backend ✅)
   □ Trial Balance with balancing check (backend ✅)
   ✅ 6 of 6 — Backend complete. Frontend needed.

□ BILLING MATURITY ≥ 95%
   □ Invoice → GL auto-posting pipeline live
   □ Revenue assurance engine with 10+ rules active
   □ ToU, tiered, demand tariff engines operational
   □ Pro-ration engine tested and accurate
   □ Tax determination engine active
   □ Multi-currency invoices and posting
   □ Revenue leakage detection active

□ COLLECTIONS MATURITY ≥ 85%
   □ Dunning automation live (7-stage escalation chain)
   □ Promise-to-Pay engine with reminder + auto-escalate
   □ Collector assignment with workload balancing
   □ Write-off workflow (recommend→approve→execute)
   □ Payment behavior scoring active
   □ Priority scoring active

□ FINANCIAL AUDIT READINESS = 100%
   □ Segregation of duties enforced
   □ Period immutability (closed = locked)
   □ Journal immutability (posted = locked)
   □ Full audit trail for every financial mutation
   □ GAAP/IFRS compliance reports available
   □ P&L, Balance Sheet, Cash Flow generating correctly
   □ Trial Balance balances (always)
   □ Every invoice traceable to GL entry

□ AI FINANCIAL INTELLIGENCE = OPERATIONAL
   □ Revenue Leakage Detection Agent — 8 rules active
   □ Collection Optimization Agent — scoring daily
   □ Financial Forecast Agent — monthly projections
   □ Invoice Anomaly Agent — pre-issue validation
   □ Financial Classification Agent — description→account

□ FULL TRACEABILITY
   □ Meter reading → Invoice → Journal → GL — complete chain
   □ Payment → Journal → GL — complete chain
   □ Bank statement → Reconciliation → GL — complete chain
   □ Every financial event has correlation ID

□ TEST SUITE = 395 PASSING
   □ Accounting correctness: 80 tests
   □ Billing regression: 60 tests
   □ Financial audit: 50 tests
   □ Security: 40 tests
   □ AI accuracy: 50 tests
   □ Data integrity: 40 tests
   □ Reconciliation: 40 tests
   □ Tariff engine: 35 tests

C13 STATUS: ✅ CERTIFIED
Accounting Maturity:  0% → 90%
Billing Maturity:    30% → 95%
Collections Maturity: 30% → 85%
Audit Readiness:     10% → 100%
Financial UI:         0% → 10 workbenches
Total Tests:          395
```

---

## APPENDIX A: C13 PROGRAM METRICS SUMMARY

| Metric | Current | Target | Waves |
|--------|---------|--------|-------|
| New Prisma models | — | 5 (FiscalYear, BankStatement, BankReconciliation, RevenueRule, RevenueTransaction) | W01-W06 |
| Enhanced models | — | 6 (Invoice, Payment, CollectionCase, PromiseToPay, Tariff, BillRun) | W01-W04 |
| New backend routes | — | ~80 | W01-W11 |
| New frontend pages | — | 10 workbenches | W11 |
| AI agents | — | 5 | W09 |
| Test count | < 10 | 395 | W12 |
| Implementation days | — | ~60 | W01-W12 |

## APPENDIX B: C13 POST-PROGRAM ROADMAP

```
C13 Complete (Financial Intelligence)
    │
    ├──→ C14: Customer Experience Platform
    │     Customer portal, self-service, dispute management
    │     Dependencies: C13 (billing accuracy, financial data)
    │
    ├──→ C15: Enterprise Integration Platform
    │     ERP, CRM, GIS, SCADA integration
    │     Dependencies: C13 (GL/accounting for ERP)
    │
    ├──→ C16: Data Lake & Analytics Platform
    │     Data warehouse, BI, enterprise reporting
    │     Dependencies: C13 (clean financial data for BI)
    │
    └──→ C17: Mobile Field Operations
        Field technician mobile app
        Dependencies: C13-W04 (collection field visits)
```

---

*This document is a planning artifact only. No code, no implementation, no database migration.*
*C13 — Enterprise Financial & Billing Intelligence Platform Constitution & Architecture Blueprint.*
*READ ONLY. GOVERNANCE PLANNING ONLY. NOT IMPLEMENTED.*
