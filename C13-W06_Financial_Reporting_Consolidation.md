# C13-W06 — Enterprise Financial Reporting, Consolidation & Executive Analytics Platform
## Blueprint

**Version:** 1.0.0  
**Status:** READ ONLY — GOVERNANCE PLANNING ONLY — NOT IMPLEMENTED  
**Date:** 2026-07-29  
**Program:** C13 Enterprise Financial & Billing Intelligence Platform  
**Wave:** W06 (Financial Reporting & Analytics — builds on W01-W05 complete financial infrastructure)  

---

## PART 1: CURRENT STATE AUDIT

### 1.1 Existing Reporting Infrastructure

| Component | Location | Status | Capability |
|-----------|----------|--------|------------|
| **ReportDefinition** model | `schema.prisma:702` | ✅ Complete | name, type, config (JSON), schedule, recipients |
| **KpiDefinition** model | `schema.prisma:716` | ✅ Complete | category, target, unit, current, trend |
| **KpiSnapshot** model | `schema.prisma:730` | ✅ Complete | value, recordedAt (time-series) |
| **ExportLog** model | `schema.prisma:828` | ✅ Complete | type, format, totalRows, status |
| **Report routes** | `routes/reports.js` | ✅ Basic | CSV/JSON export of raw data (invoices, payments, customers, meters, readings, aging) |
| **Trial Balance** | `routes/accounting.js:534` | ✅ Complete | Period-level TB with balancing check |
| **GL Listing** | `routes/accounting.js:476` | ✅ Complete | Per-account, per-period GL entries |
| **GL Summary** | `routes/accounting.js:496` | ✅ Complete | Aggregated account balances per period |
| **AI Report Builder** | `services/ai-engine.js:196` | ✅ Basic | Revenue summary generation |
| **W01 Account Mapping** | Planned | ❌ W01 | Account categorization for financial statements |
| **W01 GL Posting** | Planned | ❌ W01 | Source data for all financial reports |
| **W02 Revenue Assurance** | Planned | ❌ W02 | Revenue validation for P&L accuracy |
| **W04 Collection Intel** | Planned | ❌ W04 | AR aging data for Balance Sheet |
| **W05 Cash Management** | Planned | ❌ W05 | Cash/bank data for Cash Flow Statement |

### 1.2 Gap Analysis

| Capability | Current | W06 Target |
|------------|---------|------------|
| **P&L Statement** | ❌ None | Multi-period with drill-down |
| **Balance Sheet** | ❌ None | Classified with ratio analysis |
| **Cash Flow Statement** | ❌ None | Direct + Indirect methods |
| **Equity Changes** | ❌ None | Statement of changes in equity |
| **Budget vs Actual** | ❌ None | Full variance analysis |
| **Financial Consolidation** | ❌ None | Multi-area, multi-project |
| **Segment Reporting** | ❌ None | By area, customer type, utility |
| **Cost Center Reporting** | ❌ None | Cost allocation and analysis |
| **Report Scheduling** | ❌ None | Cron-based with distribution |
| **Report Versioning** | ❌ None | Snapshot-based |
| **PDF/Excel Export** | ❌ None | Professional formatting |
| **Executive Dashboard** | ❌ None | CFO analytics |
| **Budget Management** | ❌ None | Budget creation, tracking |
| **AI Financial Analytics** | ❌ Basic | Narrative, variance explanation, forecasting |
| **Regulatory Reporting** | ❌ None | IFRS/GAAP mapping |

---

## PART 2: FINANCIAL REPORTING ARCHITECTURE

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                FINANCIAL REPORTING & CONSOLIDATION PLATFORM                                           │
│                                                                                                       │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  DATA SOURCE LAYER                                                                              │    │
│  │                                                                                                │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │    │
│  │  │ W01 GL   │  │ W02 Rev  │  │ W03 Tar  │  │ W04 Coll │  │ W05 Cash │  │ Budget   │         │    │
│  │  │ Ledger   │  │ Assur.   │  │ iff      │  │ AR Aging │  │ Bank Rec │  │ Data     │         │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                                  │
│                                    ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FINANCIAL STATEMENT ENGINE                                                                     │    │
│  │                                                                                                │    │
│  │  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────┐   │    │
│  │  │ Trial Balance      │  │ P&L / Income       │  │ Balance Sheet      │  │ Cash Flow      │   │    │
│  │  │ Processor          │──│ Statement Engine   │──│ Engine             │──│ Statement      │   │    │
│  │  │ (GL→TB)           │  │ (Revenue + Expense) │  │ (Assets+Liabs+Eq)  │  │ (Direct+Indir) │   │    │
│  │  └────────────────────┘  └────────────────────┘  └────────────────────┘  └────────────────┘   │    │
│  │                                                                                                │    │
│  │  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────┐   │    │
│  │  │ Statement of       │  │ Budget vs Actual   │  │ Consolidation      │  │ Segment        │   │    │
│  │  │ Changes in Equity  │──│ Engine             │──│ Engine             │──│ Reporting      │   │    │
│  │  └────────────────────┘  └────────────────────┘  └────────────────────┘  └────────────────┘   │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                                  │
│                                    ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  ANALYTICS & INTELLIGENCE LAYER                                                                  │    │
│  │                                                                                                │    │
│  │  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────┐   │    │
│  │  │ KPI Engine         │  │ Variance Analysis  │  │ Ratio Analysis     │  │ Trend Analysis │   │    │
│  │  │ (15+ financial KPI)│──│ Engine             │──│ Engine             │──│ Engine         │   │    │
│  │  └────────────────────┘  └────────────────────┘  └────────────────────┘  └────────────────┘   │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                                  │
│                                    ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  AI FINANCIAL ANALYTICS AGENT                                                                   │    │
│  │                                                                                                │    │
│  │  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────┐   │    │
│  │  │ Executive          │  │ Variance           │  │ Financial Trend    │  │ Cash Flow      │   │    │
│  │  │ Narrative Agent    │──│ Explanation Agent  │──│ Forecasting Agent  │──│ Intelligence   │   │    │
│  │  └────────────────────┘  └────────────────────┘  └────────────────────┘  └────────────────┘   │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                       │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  REPORT OUTPUT LAYER                                                                             │    │
│  │                                                                                                │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐             │    │
│  │  │ Screen     │  │ PDF        │  │ Excel      │  │ CSV        │  │ Scheduled  │             │    │
│  │  │ (Dashboard)│  │ (Formatted)│  │ (Pivot)    │  │ (Raw Data) │  │ (Email)    │             │    │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘  └────────────┘             │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                       │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  DASHBOARDS                                                                                      │    │
│  │                                                                                                │    │
│  │  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐                │    │
│  │  │ Executive Dashboard  │  │ CFO Analytics        │  │ Finance Operations   │                │    │
│  │  │ (CEO/Board view)     │  │ (CFO/Finance Mgr)    │  │ (Daily ops view)     │                │    │
│  │  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘                │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Financial Statement Generation Pipeline

```
FinancialStatementEngine.generate(periodId, statementType):
  1. LOAD period
  2. LOAD Trial Balance (from accounting engine)
     accounts = GET /trial-balance?periodId=periodId
  
  3. CLASSIFY accounts by statement type:
     BALANCE_SHEET:
       ASSET accounts   → Balance Sheet (Assets section)
       LIABILITY acc.   → Balance Sheet (Liabilities section)
       EQUITY accounts  → Balance Sheet (Equity section)
     
     INCOME_STATEMENT:
       REVENUE accounts → P&L (Revenue section)
       EXPENSE accounts → P&L (Expense section)
       → Net Income = Revenue - Expense
     
     CASH_FLOW:
       Analyze GL changes between periods
       Classify into Operating / Investing / Financing
  
  4. COMPUTE totals and subtotals:
     Balance Sheet:
       Total Assets = Current + Non-Current
       Total Liabilities = Current + Non-Current
       Total Equity = Share Capital + Retained Earnings + Reserves
       Check: Total Assets = Total Liabilities + Total Equity
     
     P&L:
       Gross Profit = Revenue - Cost of Sales
       Operating Profit = Gross Profit - Operating Expenses
       Net Profit = Operating Profit + Other Income - Tax
  
  5. FORMAT into report structure:
     header: { reportName, period, generatedAt, currency }
     sections: [{ name, accounts: [{ code, name, balance }], total }]
     footer: { generatedBy, approvedBy, notes }
  
  6. STORE as FinancialSnapshot (versioned)
  7. RETURN report object
```

### 2.3 Financial Report Lifecycle

```
PERIOD END INITIATED (via FinancialPeriod.close)
    │
    ▼
┌─────────────┐
│  GENERATED   │  System generates all financial statements
│  (DRAFT)     │  P&L, Balance Sheet, Cash Flow, Equity
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  REVIEWED    │  Finance team reviews for accuracy
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  APPROVED    │  Controller/CFO approves
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  PUBLISHED   │  Distributed to stakeholders
│  (FINAL)     │  Snapshot locked for audit
└─────────────┘
```

---

## PART 3: DATA MODEL DESIGN

### 3.1 FinancialSnapshot (NEW)

**Purpose:** Versioned, immutable snapshots of financial statements at period end.

```
FinancialSnapshot
├── id: String (UUID, PK)
├── periodId: String (FK → FinancialPeriod)
├── period: FinancialPeriod
├── type: String                     ← BALANCE_SHEET | INCOME_STATEMENT | CASH_FLOW | EQUITY_CHANGES
├── version: Int @default(1)
├── status: String @default("DRAFT") ← DRAFT | REVIEWED | APPROVED | PUBLISHED
├── data: String (JSON)              ← Full report structure with all sections, accounts, totals
├── subtotals: String (JSON)         ← Key subtotals for quick access
├── totalAssets: Float?
├── totalLiabilities: Float?
├── totalEquity: Float?
├── netIncome: Float?
├── totalRevenue: Float?
├── totalExpenses: Float?
├── currency: String @default("EGP")
├── generatedBy: String? (FK → User)
├── reviewedBy: String? (FK → User)
├── reviewedAt: DateTime?
├── approvedBy: String? (FK → User)
├── approvedAt: DateTime?
├── publishedAt: DateTime?
├── notes: String?
├── createdAt, archivedAt

Indexes:
  @@unique([periodId, type, version])
  @@index([periodId, type, status])
```

### 3.2 Budget (NEW)

**Purpose:** Define budgets for account/period combinations.

```
Budget
├── id: String (UUID, PK)
├── fiscalYearId: String (FK → FiscalYear)
├── accountId: String (FK → Account)
├── areaId: String?                   ← Area-scoped (null = enterprise)
├── projectId: String?                ← Project-scoped (null = enterprise)
├── periodType: String @default("MONTHLY")  ← MONTHLY | QUARTERLY | ANNUAL
├── amount: Float
├── version: Int @default(1)
├── status: String @default("DRAFT")  ← DRAFT | APPROVED | LOCKED
├── approvedBy: String?
├── approvedAt: DateTime?
├── notes: String?
├── createdAt, archivedAt, updatedAt

Indexes:
  @@index([fiscalYearId, accountId])
  @@index([fiscalYearId, areaId])
```

### 3.3 Budget vs Actual Entry (NEW — materialized view concept)

**Purpose:** Pre-computed budget vs actual comparison for reporting performance.

```
BudgetVsActual
├── id: String (UUID, PK)
├── fiscalYearId: String
├── periodId: String (FK → FinancialPeriod)
├── accountId: String (FK → Account)
├── areaId: String?
├── budgetAmount: Float @default(0)
├── actualAmount: Float @default(0)
├── variance: Float @default(0)      ← actual - budget
├── variancePct: Float @default(0)   ← (actual - budget) / budget × 100
├── computedAt: DateTime
├── createdAt

Index:
  @@index([periodId, accountId])
  @@index([fiscalYearId, areaId])
```

### 3.4 FinancialRatio (NEW)

**Purpose:** Store computed financial ratios per period.

```
FinancialRatio
├── id: String (UUID, PK)
├── periodId: String (FK → FinancialPeriod)
├── name: String                     ← current_ratio | debt_to_equity | profit_margin | etc.
├── value: Float
├── target: Float?
├── priorPeriodValue: Float?
├── variance: Float?                 ← vs prior period
├── trend: String?                   ← IMPROVING | DECLINING | STABLE | NEW
├── createdAt

Index:
  @@index([periodId, name])
```

### 3.5 ReportSchedule (NEW)

**Purpose:** Schedule and distribute financial reports.

```
ReportSchedule
├── id: String (UUID, PK)
├── name: String
├── reportType: String               ← PNL | BALANCE_SHEET | CASH_FLOW | BUDGET_VS_ACTUAL | CUSTOM
├── frequency: String                ← DAILY | WEEKLY | MONTHLY | QUARTERLY | ANNUAL
├── format: String @default("PDF")   ← PDF | EXCEL | CSV | ALL
├── recipients: String (JSON)        ← Email addresses
├── includeComparison: Boolean @default(false)  ← Include prior period
├── active: Boolean @default(true)
├── lastRunAt: DateTime?
├── nextRunAt: DateTime?
├── createdAt, archivedAt
```

### 3.6 FinancialNote (NEW)

**Purpose:** Annotations and notes attached to financial statements.

```
FinancialNote
├── id: String (UUID, PK)
├── snapshotId: String (FK → FinancialSnapshot)
├── section: String                  ← Note reference (e.g., "1. Revenue Recognition")
├── content: String
├── order: Int @default(0)
├── createdBy: String?
├── createdAt, archivedAt
```

### 3.7 IFRSMapping (NEW)

**Purpose:** Map local account codes to IFRS/GAAP standard categories.

```
IFRSMapping
├── id: String (UUID, PK)
├── accountId: String (FK → Account)
├── standard: String                 ← IFRS | GAAP | LOCAL_TAX
├── categoryCode: String             ← IFRS category code
├── categoryName: String             ← IFRS category name
├── effectiveFrom: DateTime
├── effectiveTo: DateTime?
├── createdAt, archivedAt
```

### 3.8 SegmentPerformance (NEW — materialized view)

**Purpose:** Pre-computed segment performance data for reporting.

```
SegmentPerformance
├── id: String (UUID, PK)
├── periodId: String (FK → FinancialPeriod)
├── segmentType: String              ← AREA | PROJECT | CUSTOMER_GROUP | UTILITY_TYPE
├── segmentId: String
├── segmentName: String
├── revenue: Float @default(0)
├── expenses: Float @default(0)
├── profit: Float @default(0)
├── margin: Float @default(0)        ← profit / revenue
├── customerCount: Int @default(0)
├── invoiceCount: Int @default(0)
├── computedAt: DateTime
├── createdAt

Indexes:
  @@index([periodId, segmentType])
```

### 3.9 New Models Summary

| # | Model | Lines | Purpose |
|---|-------|-------|---------|
| 1 | FinancialSnapshot | ~30 | Versioned, immutable financial statements |
| 2 | Budget | ~22 | Budget definition per account/period |
| 3 | BudgetVsActual | ~14 | Pre-computed BvA comparison |
| 4 | FinancialRatio | ~14 | Computed financial ratios |
| 5 | ReportSchedule | ~16 | Scheduled report distribution |
| 6 | FinancialNote | ~10 | Statement notes/annotations |
| 7 | IFRSMapping | ~12 | IFRS/GAAP category mapping |
| 8 | SegmentPerformance | ~16 | Segment performance data |
| **Total** | **8 new models** | **~134 lines** | |

**Enhanced existing:** ReportDefinition (add version tracking), KpiDefinition (add 15 financial KPIs)

---

## PART 4: FINANCIAL STATEMENT ENGINE

### 4.1 Trial Balance → Financial Statements

```
GL Data (Journal Entries)
    │
    ▼
GeneralLedgerEntry (per-account, per-period balances)
    │
    ▼
Trial Balance (all accounts with debit/credit totals)
    │
    ├──→ BALANCE SHEET
    │     Classify accounts by type:
    │       ASSET (1000-1999):
    │         Current: Cash (1001), Bank (1002), AR (1201)
    │         Non-Current: Fixed Assets (1500), Depreciation (1600)
    │       LIABILITY (2000-2999):
    │         Current: AP (2001), Tax Payable (2101), Accrued (2200)
    │         Non-Current: Loans (2500), Deferred Tax (2600)
    │       EQUITY (3000-3999):
    │         Share Capital (3000), Retained Earnings (3001), Reserves (3100)
    │
    ├──→ INCOME STATEMENT
    │     Classify accounts by type:
    │       REVENUE (4000-4999):
    │         Water Revenue (4001-01), Electric Revenue (4001-02), Gas Revenue (4001-03)
    │       EXPENSE (5000-6999):
    │         Cost of Sales (5000), Operating Exp (5100), Admin Exp (5200)
    │         Depreciation (5300), Bank Charges (5105), Bad Debt (6101)
    │       → Net Income = Revenue - Expense
    │
    └──→ CASH FLOW STATEMENT
          Compare GL between two periods:
          OPERATING:
            Net Income (from P&L)
            + Depreciation (non-cash expense)
            - Increase in AR (cash not received)
            + Increase in AP (cash not paid)
            = Net Cash from Operations
          INVESTING:
            - Purchase of Fixed Assets
            + Sale of Fixed Assets
          FINANCING:
            + Loan Proceeds
            - Loan Repayments
            - Dividends Paid
```

### 4.2 Balance Sheet Structure

```
BALANCE SHEET
As at: July 31, 2026
═══════════════════════════════════════

ASSETS
  Current Assets
    Cash & Cash Equivalents               EGP 3,250,000
    Accounts Receivable (Net)              EGP 1,225,000
    Less: Allowance for Doubtful Accounts  -EGP 99,500
    Prepaid Expenses                       EGP 45,000
    Total Current Assets                   EGP 4,420,500

  Non-Current Assets
    Property, Plant & Equipment            EGP 2,500,000
    Less: Accumulated Depreciation         -EGP 750,000
    Intangible Assets                      EGP 300,000
    Total Non-Current Assets               EGP 2,050,000

TOTAL ASSETS                               EGP 6,470,500

LIABILITIES & EQUITY
  Current Liabilities
    Accounts Payable                       EGP 380,000
    Accrued Expenses                       EGP 120,000
    Tax Payable                            EGP 215,000
    Deferred Revenue                       EGP 45,000
    Total Current Liabilities              EGP 760,000

  Non-Current Liabilities
    Long-term Debt                         EGP 1,500,000
    Deferred Tax Liability                 EGP 85,000
    Total Non-Current Liabilities          EGP 1,585,000

  Equity
    Share Capital                          EGP 3,000,000
    Retained Earnings                      EGP 1,010,500
    Reserves                               EGP 115,000
    Total Equity                           EGP 4,125,500

TOTAL LIABILITIES & EQUITY                 EGP 6,470,500
═══════════════════════════════════════
✅ BALANCED: Assets = Liabilities + Equity
```

### 4.3 P&L Structure

```
PROFIT & LOSS STATEMENT
For the period: July 1 - July 31, 2026
═══════════════════════════════════════

REVENUE
  Water Service Revenue                    EGP 850,000
  Electric Service Revenue                 EGP 1,200,000
  Gas Service Revenue                      EGP 320,000
  Late Payment Fees                        EGP 12,500
  Total Revenue                            EGP 2,382,500

COST OF SALES
  Water Purchases                          EGP 340,000
  Electric Purchases                        EGP 600,000
  Gas Purchases                            EGP 160,000
  Total Cost of Sales                      EGP 1,100,000

GROSS PROFIT                               EGP 1,282,500  (53.8%)

OPERATING EXPENSES
  Salaries & Benefits                      EGP 325,000
  Meter Reading Operations                 EGP 85,000
  Customer Service                         EGP 42,000
  Depreciation                             EGP 25,000
  IT & Systems                             EGP 38,000
  Bank Charges                             EGP 12,500
  Total Operating Expenses                 EGP 527,500

OPERATING PROFIT                           EGP 755,000   (31.7%)

OTHER INCOME / EXPENSES
  Interest Income                          EGP 8,500
  Interest Expense                         -EGP 22,000
  Bad Debt Expense                         -EGP 12,500
  Total Other                              -EGP 26,000

PROFIT BEFORE TAX                          EGP 729,000   (30.6%)

INCOME TAX                                 -EGP 102,060  (14%)

NET PROFIT                                 EGP 626,940   (26.3%)
═══════════════════════════════════════
```

### 4.4 Cash Flow Statement Structure

```
CASH FLOW STATEMENT
For the period: July 1 - July 31, 2026
═══════════════════════════════════════

CASH FLOWS FROM OPERATING ACTIVITIES
  Net Profit                               EGP 626,940
  Adjustments for:
    Depreciation                           EGP 25,000
    Bad Debt Expense                       EGP 12,500
    Interest Income                        -EGP 8,500
  Changes in Working Capital:
    Increase in AR                         -EGP 125,000
    Increase in AP                         EGP 45,000
    Increase in Tax Payable                EGP 18,000
    Decrease in Prepaids                   EGP 5,000
  Net Cash from Operations                 EGP 598,940

CASH FLOWS FROM INVESTING ACTIVITIES
  Purchase of Equipment                    -EGP 150,000
  Net Cash used in Investing               -EGP 150,000

CASH FLOWS FROM FINANCING ACTIVITIES
  Loan Repayment                           -EGP 25,000
  Interest Paid                            -EGP 22,000
  Net Cash used in Financing               -EGP 47,000

NET INCREASE IN CASH                      EGP 401,940

Opening Cash Balance                       EGP 2,848,060
Closing Cash Balance                       EGP 3,250,000
═══════════════════════════════════════
```

---

## PART 5: BUDGET VS ACTUAL & VARIANCE ANALYSIS

### 5.1 Budget Management

```
Budget lifecycle:
  DRAFT → PENDING_APPROVAL → APPROVED → LOCKED

CREATE BUDGET:
  BudgetService.create(fiscalYear, accountId, areaId, monthlyAmounts):
    1. Validate fiscal year is OPEN
    2. Check no existing budget for same year/account/area
    3. Create Budget (status: DRAFT)
    4. Auto-generate budget-versions if needed

APPROVE BUDGET:
  BudgetService.approve(budgetId, approver):
    1. Validate budget status is DRAFT
    2. Set status = APPROVED, approvedBy, approvedAt
    3. Lock budget amounts (cannot edit)
    4. Trigger BudgetVsActual computation
```

### 5.2 Variance Analysis Engine

```
VarianceEngine.analyze(periodId):
  budgets = Budget.findMany({ fiscalYearId: period.fiscalYearId })
  
  FOR each budget:
    actual = GeneralLedgerEntry.findUnique({
      accountId: budget.accountId,
      periodId: periodId,
    })
    
    actualAmount = actual ? actual.closingBalance : 0
    variance = actualAmount - budget.amount
    variancePct = (variance / budget.amount) × 100
    
    // Classify variance:
    IF abs(variancePct) <= 5:
      classification = "WITHIN_THRESHOLD"
    ELSE IF variancePct > 5:
      classification = "FAVORABLE" | "UNFAVORABLE"  (depends on account type)
    ELSE IF variancePct < -5:
      classification = "UNFAVORABLE" | "FAVORABLE"
    
    Upsert BudgetVsActual({
      periodId, accountId, budgetAmount, actualAmount,
      variance, variancePct
    })
  
  RETURN { totalBudget, totalActual, totalVariance, analysis: classifications }
```

**Variance Classification by Account Type:**
| Account Type | Actual > Budget | Actual < Budget |
|--------------|----------------|-----------------|
| REVENUE | FAVORABLE | UNFAVORABLE |
| EXPENSE | UNFAVORABLE | FAVORABLE |
| ASSET | Depends on direction | Depends on direction |

---

## PART 6: FINANCIAL KPI ENGINE

### 6.1 Financial KPIs (15 KPIs)

| # | KPI | Formula | Target | Unit |
|---|-----|---------|--------|------|
| 1 | **Current Ratio** | Current Assets / Current Liabilities | > 1.5 | Ratio |
| 2 | **Quick Ratio** | (CA - Inventory) / CL | > 1.0 | Ratio |
| 3 | **Cash Ratio** | Cash / Current Liabilities | > 0.3 | Ratio |
| 4 | **Debt to Equity** | Total Liabilities / Total Equity | < 1.0 | Ratio |
| 5 | **Gross Profit Margin** | Gross Profit / Revenue | > 50% | % |
| 6 | **Operating Profit Margin** | Operating Profit / Revenue | > 25% | % |
| 7 | **Net Profit Margin** | Net Profit / Revenue | > 15% | % |
| 8 | **Revenue Growth (YoY)** | (Revenue - PriorYearRevenue) / PriorYearRevenue | > 10% | % |
| 9 | **Expense Growth** | (Expense - PriorYearExpense) / PriorYearExpense | < Inflation | % |
| 10 | **AR Turnover** | Revenue / Avg AR | > 6x | Times/year |
| 11 | **Days Sales Outstanding** | 365 / AR Turnover | < 45 | Days |
| 12 | **Collection Effectiveness** | Cash Collected / Billed Amount | > 90% | % |
| 13 | **Operating Cash Flow Ratio** | OCF / Current Liabilities | > 0.5 | Ratio |
| 14 | **Budget Accuracy** | 1 - abs(Total Variance / Total Budget) | > 90% | % |
| 15 | **EBITDA Margin** | EBITDA / Revenue | > 30% | % |

### 6.2 KPI Refresh Pipeline

```
KPIEngine.refresh(periodId):
  1. LOAD all FinancialSnapshots for period
  2. COMPUTE each KPI from snapshot data
  3. COMPARE with target → status (ON_TRACK | AT_RISK | OFF_TRACK)
  4. COMPARE with prior period → trend (IMPROVING | DECLINING | STABLE)
  5. SAVE to KpiSnapshot (time-series)
  6. UPDATE KpiDefinition.current + trend
```

---

## PART 7: AI FINANCIAL ANALYTICS AGENT

### 7.1 Agent Design

**Agent Name:** Financial Analytics Agent  
**Framework:** C12-W07 Operational Intelligence  
**Autonomy:** ⚡ Semi-autonomous  

| Capability | Autonomy | Approval |
|------------|----------|----------|
| Executive narrative generation | ✅ Full (read-only narrative) | None |
| Variance explanation | ✅ Full (read-only analysis) | None |
| Financial trend forecasting | ✅ Full (read-only forecast) | None |
| Cash flow intelligence | ✅ Full (read-only) | None |
| Revenue & profitability analytics | ✅ Full (read-only) | None |

### 7.2 Executive Narrative Generation

```
ALGORITHM: generateExecutiveNarrative(periodId):
  period = FinancialPeriod.findUnique(periodId)
  snapshots = FinancialSnapshot.findMany({ periodId })
  ratios = FinancialRatio.findMany({ periodId })
  
  narrative = {
    title: `Executive Summary — ${period.year}-${period.month}`,
    generatedAt: now(),
    
    overview: `In ${periodLabel}, MeterVerse generated EGP ${format(totalRevenue)}
      in revenue with a net profit of EGP ${format(netProfit)}, representing a
      ${netMargin}% margin. Total assets stood at EGP ${format(totalAssets)},
      with a current ratio of ${currentRatio}.`,
    
    highlights: [
      revenueGrowth > 10%
        ? `Revenue grew ${revenueGrowth}% vs prior period, driven by...`
        : null,
      netMargin > target
        ? `Net margin of ${netMargin}% exceeded target of ${target}%`,
      null,
    ].filter(Boolean),
    
    risks: [
      currentRatio < 1.5
        ? `Liquidity risk: Current ratio of ${currentRatio} is below target of 1.5`,
      dso > 45
        ? `Collection risk: DSO of ${dso} days exceeds target of 45 days`,
      null,
    ].filter(Boolean),
    
    recommendations: [
      revenueGrowth < 10%
        ? `Revenue growth of ${revenueGrowth}% is below target — review tariff strategy`,
      dso > 45
        ? `DSO of ${dso} days indicates collection delays — focus on W04 collections`,
      null,
    ].filter(Boolean),
    
    keyMetrics: {
      revenue: format(totalRevenue),
      netProfit: format(netProfit),
      margin: `${netMargin}%`,
      currentRatio,
      dso: `${dso} days`,
      operatingCashFlow: format(ocf),
    },
  }
  
  RETURN narrative
```

### 7.3 Variance Explanation

```
ALGORITHM: explainVariance(periodId):
  bvaEntries = BudgetVsActual.findMany({ periodId, abs(variancePct) > 5 })
  
  explanations = []
  FOR each entry:
    account = Account.findUnique(entry.accountId)
    
    IF entry.variancePct > 0 AND account.type == "REVENUE":
      explanations.push({
        account: account.name,
        variance: format(entry.variance),
        variancePct: entry.variancePct,
        explanation: `Revenue exceeded budget by ${entry.variancePct}%,
          primarily due to [driver - e.g., higher consumption, tariff increase]`,
        confidence: 0.85,
      })
    
    ELSE IF entry.variancePct < 0 AND account.type == "EXPENSE":
      explanations.push({
        account: account.name,
        variance: format(entry.variance),
        variancePct: entry.variancePct,
        explanation: `Expenses exceeded budget by ${abs(entry.variancePct)}%,
          primarily due to [driver - e.g., higher headcount, rate increase]`,
        confidence: 0.80,
      })
  
  RETURN {
    totalVariance: format(total),
    significantVariances: explanations.sort(abs(variancePct) DESC),
    summary: `${explanations.length} significant variances found`,
  }
```

---

## PART 8: DASHBOARDS

### 8.1 Executive Dashboard (`/admin/finance/executive`)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ EXECUTIVE FINANCIAL DASHBOARD                                                                   │
│                                                                                                │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│ │ Revenue      │ │ Net Profit   │ │ Gross Margin │ │ EBITDA       │ │ Op. Cash     │         │
│ │ EGP 2.38M    │ │ EGP 627K     │ │    53.8%     │ │ EGP 780K     │ │ EGP 599K     │         │
│ │ ↑ 12% YoY   │ │ ↑ 8% MoM    │ │  ▲ 2.1pp     │ │ ↑ 5% MoM    │ │ ↑ 15% MoM   │         │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                                                                │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ REVENUE & PROFIT TREND (12 months)                                                        │   │
│ │  Revenue ████████████████████████████████████  2.5M ─                                    │   │
│ │  Profit  ██████████████                            ─ 1.0M                                │   │
│ │  Margin  ────◆───◆───◆───◆───◆───◆───◆───◆───◆──────────                                │   │
│ │          Jul  Aug  Sep  Oct  Nov  Dec  Jan  Feb  Mar  Apr  May  Jun                      │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                │
│ ┌──────────────────────────┐ ┌──────────────────────────┐ ┌──────────────────────────────┐   │
│ │ KEY RATIOS                │ │ BUDGET vs ACTUAL         │ │ EXECUTIVE NARRATIVE           │   │
│ │                           │ │                          │ │                               │   │
│ │ Current Ratio:     2.1 ✅│ │ Revenue:  +5.2% ✅      │ │ 📋 July performance strong   │   │
│ │ Quick Ratio:       1.8 ✅│ │ Expenses: -2.1% ✅      │ │ Revenue grew 12% YoY driven │   │
│ │ Debt to Equity:    0.4 ✅│ │ Net Profit: +8.3% ✅    │ │ by tariff update in Q2...   │   │
│ │ DSO:               42d ⚠│ │ Capex:  -15% ⚠           │ │ [ Full Narrative → ]         │   │
│ │ Collection Eff:    82% ✅│ │                          │ │                               │   │
│ └──────────────────────────┘ └──────────────────────────┘ └──────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 CFO Analytics Dashboard (`/admin/finance/cfo`)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ CFO ANALYTICS DASHBOARD                                                                        │
│                                                                                                │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ BALANCE SHEET HIGHLIGHTS           │ INCOME STATEMENT HIGHLIGHTS                        │   │
│ │                                    │                                                     │   │
│ │ Assets:            EGP 6.47M       │ Revenue:            EGP 2.38M                      │   │
│ │ Liabilities:       EGP 2.35M       │ COGS:               EGP 1.10M                      │   │
│ │ Equity:            EGP 4.13M       │ Gross Profit:        EGP 1.28M                      │   │
│ │                                    │ Operating Exp:       EGP 528K                       │   │
│ │ ✅ BALANCED                        │ Net Profit:          EGP 627K                       │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                │
│ ┌────────────────────────────────────┐ ┌──────────────────────────────────────────────────┐   │
│ │ CASH FLOW SUMMARY                   │ │ SEGMENT PERFORMANCE                              │   │
│ │                                     │ │                                                  │   │
│ │ Operating:        +EGP 599K        │ │ ┌──────────┬─────────┬─────────┬────────┐       │   │
│ │ Investing:        -EGP 150K        │ │ │ Segment  │ Revenue │ Expense │ Margin │       │   │
│ │ Financing:        -EGP 47K         │ │ │ October  │ EGP 1.1M│ EGP 450K│  59%   │       │   │
│ │ Net Change:       +EGP 402K        │ │ │ New Cairo│ EGP 850K│ EGP 380K│  55%   │       │   │
│ │ Closing Balance:  EGP 3.25M        │ │ │ SODIC    │ EGP 430K│ EGP 180K│  58%   │       │   │
│ └────────────────────────────────────┘ └──────────┴─────────┴─────────┴────────┘       │   │
│                                                                                                │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ VARIANCE ANALYSIS — SIGNIFICANT VARIANCES                                                 │   │
│ │ 🔴 Electric Revenue: +EGP 85K (+7.6%) vs budget — higher consumption due to heat wave     │   │
│ │ 🟢 Water Purchases: -EGP 22K (-6.1%) vs budget — lower than expected                      │   │
│ │ 🔴 Salaries: +EGP 18K (+5.5%) vs budget — new hires in customer service                  │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 8.3 Finance Operations Dashboard (`/admin/finance/operations`)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ FINANCE OPERATIONS DASHBOARD                                                                   │
│                                                                                                │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│ │ Unreconciled │ │ Draft JEs    │ │ Period Status│ │ Pending       │ │ Days to      │         │
│ │ Statements  5 │ │           12 │ │ Jul 2026     │ │ Approvals  3  │ │ Close        │         │
│ │              │ │              │ │ OPEN         │ │              │ │       4      │         │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                                                                │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ PERIOD CLOSE CHECKLIST (July 2026)                                                        │   │
│ │ ☐ All bank statements reconciled?         5 remaining of 12                              │   │
│ │ ☐ All journal entries posted?             3 DRAFT entries                                │   │
│ │ ☐ Revenue assurance complete?             No open findings                               │   │
│ │ ☐ Bad debt provision calculated?          Pending                                       │   │
│ │ ☐ Intercompany reconciled?                N/A                                           │   │
│ │ ☐ Trial Balance verified?                  ✅ Balanced                                   │   │
│ │ ☐ Financial statements generated?          ❌ Pending — run now                         │   │
│ │ ☐ Budget vs Actual computed?               ❌ Pending                                   │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 9: INTEGRATION STRATEGY

### 9.1 Integration Points

| Source | Data Provided | W06 Consumer | Frequency |
|--------|---------------|--------------|-----------|
| **W01 GeneralLedger** | Account balances per period | All financial statements | Per period |
| **W01 JournalEntry** | Transaction details | Journal report, GL drill-down | On demand |
| **W01 PostingEngine** | Auto-posted entries | Revenue/expense verification | Continuous |
| **W02 Revenue Assurance** | Revenue findings | Revenue quality in P&L | Per period |
| **W03 Tariff** | Tariff rates/revenue data | Segment analysis | Per period |
| **W04 Collections** | AR aging, collections data | Balance Sheet AR, DSO calc | Per period |
| **W05 Cash Management** | Bank balances, cash flow | Cash Flow Statement | Per period |
| **C12-W07** | AIRecommendation, LearnedPattern | AI narrative, variance explanation | On demand |

### 9.2 Period Close Integration

```
FinancialPeriod.close() (existing accounting.js → enhanced by W06):
  1. RUN Revenue Assurance checks (W02)
  2. RECONCILE all bank statements (W05)
  3. CALCULATE bad debt provision (W04)
  4. POST all remaining journal entries (W01)
  5. RUN Trial Balance verification
  6. GENERATE FinancialSnapshots (W06)
  7. COMPUTE Budget vs Actual (W06)
  8. REFRESH Financial KPIs (W06)
  9. GENERATE AI Executive Narrative (W06)
  10. PUBLISH statements
  11. CLOSE period
```

---

## PART 10: TESTING STRATEGY — W06 (110 Tests)

### 10.1 Financial Statement Tests (25)

| # | Test | Expect |
|---|------|--------|
| 1 | P&L generated → correct revenue total | Sum of revenue accounts |
| 2 | P&L generated → correct expense total | Sum of expense accounts |
| 3 | P&L → net income = revenue - expense | Equation holds |
| 4 | Balance Sheet → total assets = total liabilities + equity | Balanced |
| 5 | Balance Sheet → current assets correct | Classification right |
| 6 | Balance Sheet → non-current correct | Classification right |
| 7 | Cash Flow (direct) → operating section correct | Method matches |
| 8 | Cash Flow (indirect) → operating section correct | Method matches |
| 9 | Cash Flow → closing balance matches bank GL | Consistent |
| 10 | Equity statement → retained earnings change = net income | Consistent |
| 11 | Multi-period P&L → correct period comparison | Period filter |
| 12 | Empty period → zero balances | No crash |

### 10.2 Financial Snapshot Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Create snapshot → status DRAFT | Initial state |
| 2 | Review snapshot → status REVIEWED | Status change |
| 3 | Approve snapshot → status APPROVED | Status change |
| 4 | Publish snapshot → status PUBLISHED | Status change |
| 5 | Cannot edit PUBLISHED snapshot | Immutability |
| 6 | Version increment → version 2 created | Versioning |
| 7 | Snapshot data matches TB query | Data accuracy |
| 8 | Multiple periods → independent snapshots | Per-period |

### 10.3 Budget vs Actual Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Create budget → DRAFT | Initial state |
| 2 | Approve budget → APPROVED | Status change |
| 3 | BvA computed → variance correct | Formula |
| 4 | Revenue > budget → FAVORABLE variance | Classification |
| 5 | Expense > budget → UNFAVORABLE variance | Classification |
| 6 | Variance < 5% → within threshold | Threshold |
| 7 | Budget locked → cannot edit | Immutability |
| 8 | Multi-area budget → area filter | Filter |
| 9 | Year to date budget → cumulative | YTD |

### 10.4 Financial Ratio Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Current ratio = CA / CL | Formula |
| 2 | Quick ratio = (CA-Inventory) / CL | Formula |
| 3 | Debt to equity = TL / TE | Formula |
| 4 | Gross margin = GP / Revenue | Formula |
| 5 | Net margin = NP / Revenue | Formula |
| 6 | DSO = 365 / (Revenue / AR) | Formula |
| 7 | Ratio value compared to target | Status |
| 8 | Trend comparison vs prior period | Trend |
| 9 | All 15 KPIs computed without error | Completeness |
| 10 | KPI snapshot stored as time-series | KpiSnapshot |

### 10.5 Segment Reporting Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | Segment by area → correct totals | Area filter |
| 2 | Segment by utility → correct totals | Utility filter |
| 3 | Segment by customer group → correct | Group filter |
| 4 | Cross-segment report → all dimensions | Multi-dimension |
| 5 | Segment with zero activity → zero | Empty |

### 10.6 IFRS/GAAP Mapping Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | Map account to IFRS → category assigned | Correct code |
| 2 | Map account to GAAP → category assigned | Correct code |
| 3 | IFRS report → all accounts mapped | Complete |
| 4 | Unmapped account → flag for review | Warning |
| 5 | Multiple standards → independent maps | Per standard |

### 10.7 AI Agent Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | Narrative generated with correct metrics | Accurate |
| 2 | Narrative explains variance > 5% | Significant |
| 3 | Narrative ignores variance < 5% | Threshold |
| 4 | Trend forecast within bounds | Reasonable |
| 5 | Cash flow intelligence accurate | Correct |

### 10.8 Report Schedule & Distribution Tests (10)

| # | Test | Expect |
|---|------|--------|
| 1 | Schedule monthly report → fires monthly | Cron |
| 2 | PDF export → formatted output | Formatting |
| 3 | Excel export → pivot-ready | Formatting |
| 4 | CSV export → raw data | Formatting |
| 5 | Email distribution → recipients notified | Delivery |
| 6 | Schedule with error → notification sent | Error handling |

---

## PART 11: W06 DEFINITION OF DONE

```
W06 — FINANCIAL REPORTING, CONSOLIDATION & EXECUTIVE ANALYTICS
CERTIFICATION CHECKLIST

□ CORE DATA MODELS — 8 NEW
   □ FinancialSnapshot (versioned, immutable statements)
   □ Budget (per-account, per-period budgets)
   □ BudgetVsActual (pre-computed comparison)
   □ FinancialRatio (15 KPIs)
   □ ReportSchedule (scheduled distribution)
   □ FinancialNote (statement annotations)
   □ IFRSMapping (standard mapping)
   □ SegmentPerformance (pre-computed segment data)

□ FINANCIAL STATEMENTS — ALL GENERATED
   □ Profit & Loss (multi-period, with drill-down)
   □ Balance Sheet (classified, with ratio analysis)
   □ Cash Flow Statement (direct + indirect)
   □ Statement of Changes in Equity
   □ Trial Balance (existing — enhanced)

□ BUDGET vs ACTUAL
   □ Budget creation and approval workflow
   □ Auto-computed BvA per period
   □ Variance classification (FAVORABLE / UNFAVORABLE / THRESHOLD)
   □ YTD cumulative comparison

□ FINANCIAL KPIs — 15 COMPUTED
   □ Liquidity ratios (current, quick, cash)
   □ Leverage ratio (debt to equity)
   □ Profitability ratios (gross, operating, net, EBITDA)
   □ Efficiency ratios (AR turnover, DSO)
   □ Growth metrics (revenue, expense)
   □ KPI time-series via existing KpiSnapshot

□ SEGMENT REPORTING
   □ By area (October, New Cairo, SODIC)
   □ By utility type (Electric, Water, Gas)
   □ By customer group
   □ By project
   □ Cross-segment drill-down

□ IFRS/GAAP MAPPING
   □ Account→IFRS category mapping
   □ Account→GAAP category mapping
   □ IFRS-compliant report generation
   □ Unmapped account detection

□ AI FINANCIAL ANALYTICS AGENT
   □ Executive narrative generation
   □ Variance explanation (threshold-gated)
   □ Financial trend forecasting
   □ Cash flow intelligence
   □ C12 AIRecommendation integration

□ DASHBOARDS
   □ Executive Dashboard (/admin/finance/executive)
   □ CFO Analytics Dashboard (/admin/finance/cfo)
   □ Finance Operations Dashboard (/admin/finance/operations)

□ PERIOD CLOSE INTEGRATION
   □ All statements generated on close
   □ AI narrative generated on close
   □ KPIs refreshed on close
   □ BvA computed on close

□ EXPORT & DISTRIBUTION
   □ PDF report generation with formatting
   □ Excel export with pivot structure
   □ CSV raw data export
   □ Scheduled email distribution
   □ Report versioning via snapshots

□ SECURITY
   □ RBAC: Viewer, Analyst, Manager, CFO, Executive
   □ Snapshot immutability after PUBLISHED
   □ Budget approval workflow
   □ All mutations audited

□ TESTS — 110 PASSING
   □ Financial statements: 25 tests
   □ Financial snapshots: 15 tests
   □ Budget vs Actual: 15 tests
   □ Financial ratios: 15 tests
   □ Segment reporting: 10 tests
   □ IFRS/GAAP mapping: 10 tests
   □ AI agent: 10 tests
   □ Schedule & distribution: 10 tests

W06 STATUS: □ NOT IMPLEMENTED
All items above are DESIGN-COMPLETE but not executed.
```

---

## APPENDIX A: W06 FILE MANIFEST

| # | File | Action | Lines |
|---|------|--------|-------|
| 1 | `backend/prisma/schema.prisma` | MODIFY | +140 lines (8 new models) |
| 2 | Migration: financial_reporting | CREATE | Standard |
| 3 | `backend/src/services/financial-statement-engine.js` | **CREATE** | ~350 lines |
| 4 | `backend/src/services/budget-service.js` | **CREATE** | ~150 lines |
| 5 | `backend/src/services/budget-vs-actual.js` | **CREATE** | ~120 lines |
| 6 | `backend/src/services/financial-ratio-engine.js` | **CREATE** | ~100 lines |
| 7 | `backend/src/services/segment-reporting.js` | **CREATE** | ~120 lines |
| 8 | `backend/src/services/ifrs-mapping.js` | **CREATE** | ~80 lines |
| 9 | `backend/src/services/report-scheduler.js` | **CREATE** | ~100 lines |
| 10 | `backend/src/services/financial-ai.js` | **CREATE** | ~150 lines |
| 11 | `backend/src/routes/financial-reports.js` | **CREATE** | ~300 lines |
| 12 | `backend/src/services/posting-engine.js` | MODIFY | +5 lines |
| 13 | `backend/src/server.js` | MODIFY | +3 lines |
| 14 | `Frontend/src/app/admin/finance/executive/page.tsx` | **CREATE** | ~300 lines |
| 15 | `Frontend/src/app/admin/finance/cfo/page.tsx` | **CREATE** | ~350 lines |
| 16 | `Frontend/src/app/admin/finance/operations/page.tsx` | **CREATE** | ~250 lines |
| 17 | `Frontend/src/app/admin/finance/reports/page.tsx` | **CREATE** | ~200 lines |
| 18 | `Frontend/src/app/admin/finance/budget/page.tsx` | **CREATE** | ~250 lines |

**Total estimated new code:** ~3,000 lines
**Total estimated tests:** 110 tests
**Cumulative C13 (W01-W06):** 85 + 95 + 100 + 105 + 105 + 110 = 600 tests

---

*This document is a planning artifact only. No code, no implementation, no database migration.*
*C13-W06 — Financial Reporting & Consolidation. READ ONLY. GOVERNANCE PLANNING ONLY.*
