# C17 — Enterprise Data Intelligence, Analytics & Executive Decision Platform
## Blueprint

**Version:** 1.0.0  
**Status:** READ ONLY — GOVERNANCE PLANNING ONLY — NOT IMPLEMENTED  
**Date:** 2026-07-29  
**Preceded by:** C01-C10 Connectivity, C12 Identity, C13 Financial, C14 Customer, C15 Integration, C16 Asset & Field  

---

## PART 1: ENTERPRISE ANALYTICS AUDIT

### 1.1 Current Reporting Maturity

| Dimension | Maturity | Status | Gap |
|-----------|----------|--------|-----|
| **KPI Tracking** | 15% | 6 basic KPIs with time-series snapshots | No financial, collections, asset, or workforce KPIs |
| **Operational Dashboards** | 25% | Basic admin dashboards per entity | No consolidated views |
| **Executive Dashboards** | 0% | None | No CEO/CFO/COO views |
| **Self-Service Analytics** | 0% | None | No ad-hoc query, drill-down, pivot |
| **Data Warehouse** | 0% | Direct Prisma queries on OLTP | No analytics DB, no ETL, no data lake |
| **Data Governance** | 0% | None | No catalog, lineage, quality, or stewardship |
| **Semantic Model** | 0% | None | No canonical metrics, no dimensions |
| **AI Analytics** | 5% | Basic aiOperator, aiReportBuilder | No predictive, forecasting, or narrative agents |
| **Alert Intelligence** | 0% | None | No KPI threshold alerts, trend anomalies |

**Overall Reporting Maturity: ~5%**

### 1.2 Existing KPI Definitions

```javascript
// kpi-engine.js — CURRENT KPI_DEFINITIONS:
{ name: "Total Customers",     category: "growth",     unit: "count",  target: 10000 }
{ name: "Active Meters",       category: "operations", unit: "count",  target: 15000 }
{ name: "Readings Today",      category: "operations", unit: "count",  target: 5000  }
{ name: "Invoices Generated",  category: "billing",    unit: "count",  target: 1000  }
{ name: "Payments Collected",  category: "billing",    unit: "amount", target: 500000}
{ name: "Avg Response Time",   category: "performance",unit: "ms",     target: 200   }
```

**Gap: 6 KPIs vs enterprise requirement of 75+ across 14 categories.**

### 1.3 Existing Executive Visibility

| Role | Current Visibility | C17 Target |
|------|-------------------|------------|
| **CEO** | Nothing | Enterprise scorecard, growth, risk, revenue, health |
| **CFO** | C13-designed dashboards (not impl) | Full financial analytics, forecast, budget vs actual |
| **COO** | Nothing | Operations KPIs, asset health, field performance |
| **CISO** | Nothing | Security metrics, compliance status, incidents |
| **Department Heads** | Basic admin CRUD screens | Department-specific analytics with drill-down |

### 1.4 Technical Debt in Analytics

| Issue | Severity | Effort |
|-------|----------|--------|
| All analytics queries hit OLTP Prisma models | HIGH | ~20 days for analytics DB setup |
| No materialized views for aggregation | MEDIUM | ~5 days |
| No query caching for dashboards | MEDIUM | ~3 days |
| KPI engine polls DB every snapshot (no incremental) | LOW | ~2 days |
| No data retention policy | HIGH | ~5 days |
| No data quality validation | HIGH | ~8 days |

---

## PART 2: ENTERPRISE SEMANTIC DATA MODEL

### 2.1 Canonical Business Metrics — 75+ KPIs

| Category | KPI | Source | Aggregation | Refresh |
|----------|-----|--------|-------------|---------|
| **FINANCIAL (12)** | | | | |
| | Revenue (MTD/YTD) | Invoice | SUM(amount) WHERE issued | Daily |
| | Net Profit | GL | Revenue - Expense | Monthly |
| | Gross Margin % | GL | (Revenue - COGS) / Revenue | Monthly |
| | Operating Margin % | GL | Operating Profit / Revenue | Monthly |
| | EBITDA | GL | Net Income + Tax + Interest + Deprec | Monthly |
| | AR Balance | Invoice | SUM(amount - paidAmount) WHERE unpaid | Daily |
| | AR Aging % 90+ | Invoice | (90+ AR) / Total AR | Daily |
| | DSO | Invoice | (AR / Revenue) × 365 | Daily |
| | Collection Rate % | Payment | Collected / Billed | Monthly |
| | Budget Variance % | Budget | (Actual - Budget) / Budget | Monthly |
| | Cash Balance | BankAccount | SUM(balance) | Real-time |
| | Revenue per Customer | Invoice | Revenue / Active Customers | Monthly |
| **BILLING (8)** | | | | |
| | Invoices Issued | Invoice | COUNT WHERE issued | Daily |
| | Avg Invoice Amount | Invoice | AVG(amount) | Daily |
| | On-time Payment Rate | Payment | Paid before due / Total paid | Monthly |
| | Bill Run Duration | BillRun | AVG(completedAt - processedAt) | Per run |
| | Adjustment Rate | InvoiceItem | Adjustment amount / Revenue | Monthly |
| | Unbilled Consumption | Reading/Meter | Consumption without invoice | Daily |
| | Tariff Change Impact | TariffVersion | Revenue change pre/post | Per change |
| | Auto-pay Enrollment % | CustomerPreference | AutoPay enabled / Total | Weekly |
| **COLLECTIONS (6)** | | | | |
| | Open Cases | CollectionCase | COUNT WHERE open | Daily |
| | Avg Case Age | CollectionCase | AVG(days since opened) | Daily |
| | PTP Keep Rate | PromiseToPay | Kept / (Kept + Missed) | Weekly |
| | Collection Effectiveness | CollectionCase | Resolved / Total × 100 | Monthly |
| | Collector Workload | FieldTechnician | AVG(currentWorkload) | Daily |
| | Write-off Rate | WriteOffRequest | Written off / Total AR | Monthly |
| **METER HEALTH (6)** | | | | |
| | Active Meters | Meter | COUNT WHERE active | Daily |
| | Avg Health Score | AssetHealthScore | AVG(score) | Daily |
| | Meters with Alerts | MeterEvent | COUNT WHERE last 24h | Real-time |
| | Communication Success % | Gateway/Conn | Successful reads / Total | Daily |
| | Calibration Overdue | CalibrationRecord | COUNT WHERE past due | Daily |
| | Meters Retired MTD | Meter | COUNT WHERE retired this month | Monthly |
| **ASSET (5)** | | | | |
| | Total Assets | Asset | COUNT | Daily |
| | Assets in Maintenance | Asset | COUNT WHERE maintenance | Real-time |
| | Avg Asset Age | Asset | AVG(months since commission) | Monthly |
| | Warranty Expiring | WarrantyClaim | COUNT WHERE next 90 days | Daily |
| | Spare Parts Stockout | InventoryStock | COUNT WHERE below reorder | Daily |
| **INVENTORY (4)** | | | | |
| | Stock Value | InventoryStock | SUM(qty × unitCost) | Daily |
| | Stock Turns | InventoryMovement | COGS / Avg Inventory | Monthly |
| | Open Purchase Orders | PurchaseOrder | COUNT WHERE not received | Daily |
| | Supplier Quality | Supplier | AVG(qualityRating) | Monthly |
| **WORKFORCE (5)** | | | | |
| | Active Technicians | FieldTechnician | COUNT WHERE active | Daily |
| | Avg Workload | FieldTechnician | AVG(currentWorkload) | Daily |
| | WO Completion Rate | WorkOrder | Completed / Assigned × 100 | Weekly |
| | Avg WO Duration | WorkOrder | AVG(durationMinutes) | Weekly |
| | Certifications Expiring | FieldTechnician | COUNT WHERE next 30 days | Daily |
| **CUSTOMER (5)** | | | | |
| | Total Customers | Customer | COUNT WHERE active | Daily |
| | Customer Growth Rate | Customer | (New - Churned) / Total | Monthly |
| | Customer Churn Rate | Customer | Churned / Total × 100 | Monthly |
| | Avg Satisfaction | ServiceRequest | AVG(rating) | Monthly |
| | Portal Adoption % | CustomerSession | Portal login / Total customers | Monthly |
| **SLA (3)** | | | | |
| | SLA Compliance % | SLABreach | Met / Total × 100 | Weekly |
| | Avg Response Time | SLABreach | AVG(response time) | Weekly |
| | Avg Resolution Time | SLABreach | AVG(resolution time) | Weekly |
| **SECURITY (4)** | | | | |
| | Active Sessions | Session | COUNT WHERE active | Real-time |
| | Failed Logins (24h) | AuditEntry | COUNT WHERE login failure | Real-time |
| | MFA Adoption % | User | MFA enabled / Total | Weekly |
| | API Key Usage | ApiKey | Requests by key | Daily |
| **COMPLIANCE (3)** | | | | |
| | Open Compliance Findings | AuditEntry | COUNT WHERE compliance fail | Weekly |
| | Audit Trail Completeness | Automated | All mutations logged | Monthly |
| | Data Retention Compliance | Automated | Archived records vs policy | Monthly |
| **INTEGRATION (4)** | | | | |
| | Active Integrations | IntegrationRegistry | COUNT WHERE active | Daily |
| | Integration SLA % | IntegrationLog | Successful / Total | Daily |
| | DLQ Depth | DeadLetterEntry | COUNT WHERE pending | Real-time |
| | Avg Integration Latency | IntegrationLog | AVG(durationMs) | Daily |
| **AI PERFORMANCE (4)** | | | | |
| | AI Recommendations Made | AiRecLog | COUNT WHERE today | Daily |
| | AI Acceptance Rate | AiRecLog | Approved / Total | Weekly |
| | AI Model Accuracy | AiModelVersion | AVG(accuracy) WHERE active | Weekly |
| | Forecast Accuracy | FinancialForecast | |Predicted - Actual| / Actual | Monthly |
| **OPERATIONS (4)** | | | | |
| | System Uptime % | Health Check | Uptime / Total × 100 | Daily |
| | API Latency P95 | Middleware | P95 response time | Real-time |
| | Database Connections | PostgreSQL | Active connections | Real-time |
| | Background Job Success | QueueJob | Completed / Total × 100 | Daily |

### 2.2 Dimension Strategy

| Dimension | Type | Source | SCD Strategy | Attributes |
|-----------|------|--------|--------------|------------|
| **Date** | Role-playing | Calendar table | Static | day, week, month, quarter, year, fiscalPeriod |
| **Customer** | Conformed | Customer | SCD-2 (history) | name, type, group, area, status, segment |
| **Meter** | Conformed | Meter | SCD-2 (history) | serial, type, category, status, area, age |
| **Area** | Conformed | Area | SCD-1 (overwrite) | name, region, country |
| **Tariff** | Conformed | Tariff | SCD-2 (history) | name, type, utilityType, version |
| **Technician** | Conformed | FieldTechnician | SCD-2 (history) | name, skills, certifications, area |
| **Supplier** | Conformed | Supplier | SCD-1 (overwrite) | name, qualityRating, leadTime |
| **Integration** | Conformed | IntegrationRegistry | SCD-1 (overwrite) | name, type, direction, status |
| **Financial Account** | Conformed | Account | SCD-2 (history) | code, name, type, category |

### 2.3 Fact Tables

| Fact Table | Grain | Measures | Dimensions | Retention |
|------------|-------|----------|------------|-----------|
| **FactInvoice** | Per invoice line item | amount, taxAmount, total, paidAmount | Date, Customer, Meter, Tariff, Area | 7 years |
| **FactPayment** | Per payment transaction | amount, fee, netAmount | Date, Customer, Invoice | 7 years |
| **FactReading** | Per meter reading per day | value, uom, qualityFlag | Date, Meter | 5 years |
| **FactCollectionCase** | Per case per day snapshot | outstandingAmount, stage, daysOverdue | Date, Customer, Collector | 3 years |
| **FactWorkOrder** | Per work order | durationMinutes, partsCost, laborCost | Date, Asset, Technician, Area | 5 years |
| **FactIntegrationLog** | Per integration call | durationMs, status, error | Date, Integration | 90 days |
| **FactAssetHealth** | Per asset per day | healthScore, age, events | Date, Asset | 3 years |
| **FactMaintenance** | Per maintenance event | duration, cost, partsUsed | Date, Asset, Technician | 5 years |

### 2.4 Metric Lineage

```
METER READING (source)
    → FactReading (daily rollup)
    → Billing consumption calculation
    → Invoice generation
    → FactInvoice (line-item grain)
    → Revenue KPI (revenue, AR, DSO)
    → GL posting
    → Financial Report

PAYMENT (source)
    → FactPayment
    → Collection Case update
    → FactCollectionCase (daily snapshot)
    → AR Aging, DSO, Collection Rate KPIs
    → GL Cash posting

WORK ORDER (source)
    → FactWorkOrder
    → Asset Health Score update
    → FactAssetHealth
    → Technician utilization KPI
    → Cost accounting
```

---

## PART 3: ENTERPRISE DATA WAREHOUSE ARCHITECTURE

### 3.1 Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                         ENTERPRISE DATA WAREHOUSE & ANALYTICS PLATFORM                                      │
│                                                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  OPERATIONAL DB (OLTP — PostgreSQL — existing)                                                      │    │
│  │  All Prisma models, all entity data, real-time transactions                                       │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                                     │
│                                    ▼                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  ETL/ELT PIPELINE                                                                                   │    │
│  │                                                                                                    │    │
│  │  Incremental extracts via updatedAt timestamps:                                                     │    │
│  │    → Every 15 min: high-volume (readings, events, logs)                                           │    │
│  │    → Every 1 hour: medium-volume (invoices, payments, work orders)                                │    │
│  │    → Every 6 hours: low-volume (customers, meters, assets, tariffs)                               │    │
│  │    → Daily: full snapshots (dimensions, slowly changing dimensions)                               │    │
│  │                                                                                                    │    │
│  │  Transform:                                                                                         │    │
│  │    → Clean: remove duplicates, fix nulls, standardize formats                                     │    │
│  │    → Enrich: join with dimensions, compute derived fields                                         │    │
│  │    → Aggregate: pre-compute daily/monthly aggregations                                            │    │
│  │    → Validate: quality checks, reject anomalies                                                   │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                                     │
│                                    ▼                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  ANALYTICS DB (OLAP — PostgreSQL optimized / Star Schema)                                            │    │
│  │                                                                                                    │    │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                     │    │
│  │  │ Fact Tables (8) │ │ Dimension      │ │ Materialized   │ │ Data          │                     │    │
│  │  │ Invoice,        │ │ Tables (9)    │ │ Views (daily   │ │ Quality Logs  │                     │    │
│  │  │ Payment,        │ │ Date, Customer│ │ aggregations)   │ │ (validation   │                     │    │
│  │  │ Reading, etc.   │ │ Meter, Area   │ │ KPI snapshots   │ │  results)     │                     │    │
│  │  └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘                     │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  DATA LAKE (Object Storage — Parquet files for ML model training)                                 │    │
│  │  Historical raw extracts > 90 days, archived for compliance                                       │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  DATA MART LAYER (Purpose-built aggregates)                                                        │    │
│  │                                                                                                    │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │    │
│  │  │ Financial    │ │ Operations   │ │ Billing       │ │ Customer     │ │ Asset Health  │           │    │
│  │  │ Mart         │ │ Mart         │ │ Mart          │ │ Mart         │ │ Mart          │           │    │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘           │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Materialized View Examples

```sql
-- Daily Revenue by Area and Utility
CREATE MATERIALIZED VIEW mv_daily_revenue AS
SELECT
  i.issuedAt::DATE AS date,
  c.areaId,
  mt.category AS utilityType,
  COUNT(DISTINCT i.id) AS invoiceCount,
  SUM(i.amount) AS revenue,
  SUM(i.taxAmount) AS tax,
  SUM(i.amount + i.taxAmount) AS totalBilled
FROM Invoice i
JOIN Customer c ON c.id = i.customerId
JOIN MeterAssignment ma ON ma.customerId = c.id
JOIN Meter m ON m.id = ma.meterId
JOIN MeterType mt ON mt.id = m.meterTypeId
WHERE i.status IN ('issued', 'paid', 'partial')
GROUP BY i.issuedAt::DATE, c.areaId, mt.category;

-- Customer AR Aging Snapshot
CREATE MATERIALIZED VIEW mv_customer_aging AS
SELECT
  c.id AS customerId,
  c.name AS customerName,
  c.areaId,
  SUM(CASE WHEN i.dueDate >= CURRENT_DATE THEN i.amount - i.paidAmount ELSE 0 END) AS current,
  SUM(CASE WHEN i.dueDate BETWEEN CURRENT_DATE - 30 AND CURRENT_DATE - 1 THEN i.amount - i.paidAmount ELSE 0 END) AS bucket_30,
  SUM(CASE WHEN i.dueDate BETWEEN CURRENT_DATE - 60 AND CURRENT_DATE - 31 THEN i.amount - i.paidAmount ELSE 0 END) AS bucket_60,
  SUM(CASE WHEN i.dueDate BETWEEN CURRENT_DATE - 90 AND CURRENT_DATE - 61 THEN i.amount - i.paidAmount ELSE 0 END) AS bucket_90,
  SUM(CASE WHEN i.dueDate < CURRENT_DATE - 90 THEN i.amount - i.paidAmount ELSE 0 END) AS bucket_120plus,
  SUM(i.amount - i.paidAmount) AS totalOutstanding
FROM Customer c
JOIN Invoice i ON i.customerId = c.id
WHERE i.status IN ('issued', 'overdue', 'partial')
GROUP BY c.id, c.name, c.areaId;
```

### 3.3 Data Retention Policy

| Data Category | OLTP Retention | Analytics Retention | Data Lake | Compliance |
|---------------|---------------|--------------------|-----------|------------|
| Customer data | Indefinite | 10 years | 10 years | GDPR right to deletion |
| Financial (invoices, GL) | 7 years | 10 years | 10 years | Tax authority |
| Meter readings | 2 years | 5 years | 7 years | Utility regulation |
| Payments | 7 years | 10 years | 10 years | Financial audit |
| Work orders | 3 years | 5 years | 7 years | Maintenance records |
| Integration logs | 90 days | 1 year | None | Ops only |
| Audit entries | 3 years | 7 years | 7 years | Compliance |
| Events/alerts | 90 days | 1 year | 3 years | Operational |
| User sessions | 90 days | None | None | Privacy |

---

## PART 4: EXECUTIVE DASHBOARD ARCHITECTURE

### 4.1 CEO Dashboard (`/analytics/ceo`)

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│  CEO ENTERPRISE SCORECARD                                                      Q2 2026 │ [▼] │
│                                                                                               │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│ │ Revenue      │ │ Net Profit   │ │ Active        │ │ Cash         │ │ Business     │         │
│ │ EGP 14.2M    │ │ EGP 3.8M     │ │ Customers     │ │ Position     │ │ Health       │         │
│ │ ▲ 12% YoY   │ │ ▲ 8% YoY    │ │ 18,450        │ │ EGP 3.2M    │ │ 78/100 🟢   │         │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                                                               │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────┐  │
│ │ KEY METRICS TREND (12 months)                                                             │  │
│ │  Revenue ████████████████████████████████  ─── Profit ████████████  ─── Customers █████  │  │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                               │
│ ┌─────────────── RISK ───────────────┐ ┌─────────────── OPPORTUNITY ─────────────────────┐   │
│ │ 🔴 AR 90+ Days: EGP 450K (↑12%)   │ │ 🟢 Revenue Growth: 12% YoY (target: 10%)        │   │
│ │ 🔴 Churn Rate: 2.1% (↑0.3%)       │ │ 🟢 Collection Rate: 92% (target: 90%)            │   │
│ │ 🟡 Asset Health: 74/100 (↓3 pts)  │ │ 🟢 Portal Adoption: 45% (↑8% QoQ)                │   │
│ │ 🟡 Integration SLA: 96.3% (↓0.5%) │ │ 🟢 Inventory Turns: 4.2× (target: 4.0×)          │   │
│ └────────────────────────────────────┘ └───────────────────────────────────────────────────┘   │
│                                                                                               │
│ [View Full Report]  [Schedule]  [Share]  [Download PDF]                                       │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 CFO Dashboard (`/analytics/cfo`)

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│  CFO FINANCIAL ANALYTICS                                                                       │
│                                                                                               │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│ │ Revenue      │ │ GM %         │ │ Operating    │ │ EBITDA       │ │ AR DSO       │         │
│ │ MTD: 2.38M   │ │ 53.8%        │ │ Margin       │ │ EGP 780K     │ │ 42 days      │         │
│ │ YTD: 14.2M   │ │ ▲ 2.1pp     │ │ 26.3%        │ │ ▲ 5% MoM    │ │ ⚠ Target 45  │         │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                                                               │
│ ┌─────────────────── P&L ─────────────────────┐ ┌─────────────────── CASH FLOW ───────────┐   │
│ │ Revenue:          EGP 2,382,500              │ │ Operating:        +EGP 599K             │   │
│ │ COGS:             EGP 1,100,000              │ │ Investing:        -EGP 150K             │   │
│ │ Gross Profit:     EGP 1,282,500 (53.8%)     │ │ Financing:        -EGP 47K              │   │
│ │ OpEx:             EGP 527,500                │ │ Net Change:       +EGP 402K             │   │
│ │ Net Profit:       EGP 626,940 (26.3%)       │ │ Closing:          EGP 3.25M             │   │
│ └──────────────────────────────────────────────┘ └──────────────────────────────────────────┘   │
│                                                                                               │
│ ┌─── BUDGET vs ACTUAL ───────────────────────────────────────────────────────────────────┐   │
│ │ Category        │ Budget     │ Actual     │ Variance   │ %         │ Status              │   │
│ │ Revenue         │ 2,250,000  │ 2,382,500  │ +132,500   │ +5.9%     │ 🟢 FAVORABLE         │   │
│ │ COGS            │ 1,050,000  │ 1,100,000  │ +50,000    │ +4.8%     │ 🟡 UNFAVORABLE       │   │
│ │ OpEx            │ 500,000    │ 527,500    │ +27,500    │ +5.5%     │ 🟡 UNFAVORABLE       │   │
│ │ Net Profit      │ 585,000    │ 626,940    │ +41,940    │ +7.2%     │ 🟢 FAVORABLE         │   │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                               │
│ 📈 Revenue Forecast: EGP 2.45M (+3% MoM) │ Monte Carlo: P5 -2%  P50 +8%  P95 +18%           │   │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 COO Dashboard (`/analytics/coo`)

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│  COO OPERATIONS ANALYTICS                                                                      │
│                                                                                               │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│ │ Active       │ │ Open Work    │ │ Technician   │ │ Asset Health │ │ SLA          │         │
│ │ Meters       │ │ Orders       │ │ Utilization  │ │ Avg 78/100   │ │ Compliance   │         │
│ │ 212,000      │ │ 1,245        │ │ 74%          │ │              │ │ 96.8%        │         │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                                                               │
│ ┌─── FIELD OPERATIONS ───────────────────────────────────────────────────────────────────┐   │
│ │ WO by Type        │ MTD      │ Avg Duration │ Completion │ Technician    │ Workload    │   │
│ │ INSTALL           │ 342      │ 45 min       │ 94%        │ Ahmed         │ 6/6  ██████ │   │
│ │ MAINTENANCE       │ 189      │ 62 min       │ 91%        │ Sara          │ 4/6  ████   │   │
│ │ REPAIR            │ 87       │ 78 min       │ 87%        │ Mariam        │ 5/6  █████  │   │
│ │ CALIBRATION       │ 45       │ 30 min       │ 98%        │ Omar          │ 3/6  ███   │   │
│ │ Total: 663        │ ▲ 5%     │ 54 min avg   │ 92% ✅    │ Available: 2  │             │   │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                               │
│ ┌─── ASSET HEALTH DISTRIBUTION ──────────────────────┐ ┌─── DAILY READINGS ─────────────┐    │
│ │ Excellent (90-100):  42%  ████████████████████     │ │ Today: 45,200 │ ▲ 3% vs LY   │    │
│ │ Good     (70-89):   35%  ████████████████          │ │ Peak: 08:00 — 11:00            │    │
│ │ Fair     (50-69):   15%  ██████                    │ │ Success Rate: 99.2%            │    │
│ │ Poor     (< 50):     8%  ███                       │ │                                │    │
│ └─────────────────────────────────────────────────────┘ └────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.4 Additional Dashboards (8 more)

| Dashboard | Route | Primary Audience | Key Widgets |
|-----------|-------|-----------------|-------------|
| **NOC** | `/analytics/noc` | Ops Team | System uptime, API latency, queue depth, integration health, active alerts |
| **Customer Success** | `/analytics/customer-success` | Support | Open tickets, avg resolution, satisfaction, churn indicators |
| **Warehouse** | `/analytics/warehouse` | Supply Chain | Stock levels, reorder alerts, open POs, inventory turns |
| **Field Operations** | `/analytics/field-ops` | Field Manager | WO by status, technician workload, completion rate, SLA breaches |
| **Security Operations** | `/analytics/security` | CISO/SecOps | Failed logins, active sessions, MFA rate, API key usage, incidents |
| **Compliance Office** | `/analytics/compliance` | Compliance | Open findings, audit completeness, retention compliance, policy adherence |
| **Finance** | `/analytics/finance` | Finance Team | P&L, BS, CF, Budget vs Actual, AR aging, revenue forecast |
| **Integration** | `/analytics/integrations` | Integration Ops | Integration health, SLA, DLQ depth, error rates, throughput |

---

## PART 5: AI ANALYTICS LAYER

### 5.1 AI Agents

| Agent | Purpose | Autonomy | Data Sources | Output |
|-------|---------|----------|-------------|--------|
| **Executive Narrative Agent** | Generate plain-English executive summaries | ✅ Full (read-only) | All dashboards, KPIs | Narrative text |
| **Predictive Analytics Agent** | Predict trends from historical data | ✅ Full (read-only) | Fact tables, KPIs | Forecast values |
| **Forecasting Agent** | Short/med/long term business forecasts | ✅ Full (read-only) | Time-series KPIs | Forecast + CI |
| **Capacity Planning Agent** | Recommend resource scaling | ⚡ Semi | Asset, workforce, integration | Recommendations |
| **Business Insight Agent** | Surface non-obvious correlations | ✅ Full (read-only) | All data sources | Insight cards |

### 5.2 Executive Narrative

```
ALGORITHM: generateNarrative(dashboard, period):
  metrics = getKPIsForDashboard(dashboard, period)
  prior = getKPIsForDashboard(dashboard, priorPeriod)
  
  narrative = []
  
  FOR each metric:
    change = (metric.value - prior.value) / prior.value
    IF abs(change) > threshold:
      direction = change > 0 ? "increased" : "decreased"
      narrative.push({
        metric: metric.name,
        change: change,
        sentence: `${metric.name} ${direction} ${abs(change)}% to ${format(metric.value)}`,
        significance: classifySignificance(change, metric.threshold),
        recommendation: generateRecommendation(metric, change),
      })
  
  RETURN {
    summary: `In ${periodLabel}, revenue ${direction} ${absPct}% to ${format(revenue)}...`,
    highlights: narrative.filter(n => n.significance == "HIGH"),
    details: narrative,
    recommendations: narrative.filter(n => n.recommendation).map(n => n.recommendation),
  }
```

### 5.3 Alert Intelligence

```
ALERT ENGINE — evaluate every hour:
  FOR each KPI with threshold:
    current = KpiSnapshot.latest(kpiId)
    
    // 1. Threshold breach
    IF current > kpi.target × 1.1:
      CREATE Alert { type: "KPI_THRESHOLD", severity: "WARNING" }
    IF current < kpi.target × 0.9:
      CREATE Alert { type: "KPI_THRESHOLD", severity: "WARNING" }
    
    // 2. Trend anomaly
    trend = computeTrend(kpiId, 7 days)
    IF abs(trend.slope) > trend.threshold:
      CREATE Alert { type: "TREND_ANOMALY", severity: trend.direction }
    
    // 3. Forecast deviation
    IF abs(actual - forecast) / forecast > 0.15:
      CREATE Alert { type: "FORECAST_DEVIATION", severity: "WARNING" }
    
    // 4. Composite business risk
    riskScore = computeCompositeRisk()
    IF riskScore > 70:
      CREATE Alert { type: "BUSINESS_RISK", severity: "HIGH" }
```

---

## PART 6: DATA GOVERNANCE

### 6.1 Data Catalog (new model)

```
DataCatalog
├── id, name, description, domain, entityType
├── sourceSystem, sourceTable, sourceField
├── businessDefinition: String
├── dataType, format, example
├── sensitivity: PUBLIC | INTERNAL | CONFIDENTIAL | RESTRICTED
├── owner: String (department/individual)
├── steward: String (data steward)
├── qualityScore: Float?
├── lastValidatedAt: DateTime?
├── active, createdAt, archivedAt
```

### 6.2 Data Quality Rules

| Rule Type | Check | Action |
|-----------|-------|--------|
| **Completeness** | Required fields NOT NULL | Reject record, log to DataQualityLog |
| **Uniqueness** | No duplicates on natural keys | Deduplicate, flag for review |
| **Consistency** | Cross-field validation (e.g., amount = sum of items) | Reject, alert data steward |
| **Timeliness** | Data loaded within SLA window | Alert if delayed |
| **Accuracy** | Sample-based manual verification | Quarterly audit |
| **Validity** | Format/range checks (e.g., email format, positive amounts) | Reject, auto-correct where possible |

### 6.3 Data Quality Log

```
DataQualityLog
├── id, catalogId (FK), ruleType
├── status: PASS | WARN | FAIL
├── recordCount: Int, errorCount: Int
├── errors: String (JSON)              ← Sample of failed records
├── validatedAt: DateTime
├── validatedBy: String (SYSTEM | MANUAL)
├── createdAt
```

---

## PART 7: SELF-SERVICE ANALYTICS

### 7.1 Capabilities

| Capability | Description | Implementation |
|------------|-------------|----------------|
| **Saved Reports** | Pre-built reports with parameter filters | ReportDefinition + parameterized queries |
| **Ad-hoc Query Builder** | Drag-and-drop metric/dimension selection | Visual query builder on star schema |
| **Drill-down** | Click from summary to detail | Hierarchical navigation: year→quarter→month→day |
| **Drill-through** | Click from analytics to source record | Link to admin entity pages |
| **Pivot Analysis** | Cross-tabulation of metrics by dimensions | Pivot table component |
| **Scheduled Reports** | Cron-based email delivery | Enhanced ReportSchedule |
| **Export** | PDF, Excel, CSV, PNG | Existing export + enhanced formatting |

### 7.2 Report Builder Interface

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│  REPORT BUILDER                                                                                 │
│                                                                                                │
│  METRICS:                   DIMENSIONS:                FILTERS:                                │
│  ┌────────────────────┐    ┌────────────────────┐     ┌────────────────────────────────┐      │
│  │ ☑ Revenue          │    │ ☑ Date             │     │ Date Range: [2026-01-01] ─ [◀]  │      │
│  │ ☑ Invoice Count    │    │ ☑ Area             │     │ Area: [All ▼]                   │      │
│  │ ☑ Avg Amount       │    │ ☑ Customer Type    │     │ Customer Type: [All ▼]          │      │
│  │ ☐ Tax Amount       │    │ ☐ Utility Type     │     │                                │      │
│  │ ☐ Paid Amount      │    │ ☐ Tariff           │     │                                │      │
│  └────────────────────┘    └────────────────────┘     └────────────────────────────────┘      │
│                                                                                                │
│  VISUALIZATION: [Bar Chart ▼]  SORT: [Date ▼]  LIMIT: [10]                                    │
│                                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ PREVIEW                                                                                    │  │
│  │                                                                                            │  │
│  │  Revenue by Month:                                                              Export ▼ │  │
│  │  EGP 2.5M ┤  ██                                                                           │  │
│  │  EGP 2.0M ┤  ██  ██  ██                                                                   │  │
│  │  EGP 1.5M ┤  ██  ██  ██  ██  ██  ██                                                       │  │
│  │           └──J──F──M──A──M──J──J──A──S──O──N──D                                            │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                │
│  [Save Report]  [Schedule]  [Share]  [Export PDF]  [Export Excel]                              │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## PART 8: TESTING STRATEGY — 170 Tests

### 8.1 ETL/Data Pipeline Tests (25)

| # | Test | Expect |
|---|------|--------|
| 1 | Invoice fact load → correct row count | Count matches |
| 2 | Payment fact load → correct amounts | Sum matches |
| 3 | Reading fact load → grain = 1 per meter per day | No duplicates |
| 4 | Dimension SCD-2 → new version on change | History preserved |
| 5 | Dimension SCD-1 → overwrite on change | No history |
| 6 | Incremental load → only new/modified records | UpdatedAt filter |
| 7 | Full load → all records | Complete |
| 8 | Duplicate handling → deduplicated | No dupes |
| 9 | Null handling → defaults applied | Valid |
| 10 | Load failure → alert + retry | Resilience |

### 8.2 KPI Calculation Tests (25)

| # | Test | Expect |
|---|------|--------|
| 1 | Revenue KPI = SUM(invoice.amount) | Correct |
| 2 | AR balance = SUM(unpaid invoices) | Correct |
| 3 | DSO = AR / Revenue × 365 | Correct formula |
| 4 | Collection rate = collected / billed | Correct formula |
| 5 | Asset health avg = AVG(healthScore) | Correct |
| 6 | WO completion rate = completed / assigned | Correct |
| 7 | SLA compliance = met / total | Correct |
| 8 | All 75+ KPIs compute without error | No failures |
| 9 | KPI snapshot stored as time-series | KpiSnapshot |
| 10 | KPI trend direction computed correctly | Trend |

### 8.3 Dashboard Rendering Tests (25)

| # | Test | Expect |
|---|------|--------|
| 1 | CEO dashboard — all 10 widgets render | Complete |
| 2 | CFO dashboard — all 12 widgets render | Complete |
| 3 | COO dashboard — all 10 widgets render | Complete |
| 4 | NOC dashboard — real-time data | Live |
| 5 | 8 additional dashboards — all render | Complete |
| 6 | Dashboard drill-down works (year→month) | Hierarchy |
| 7 | Dashboard drill-through to entity page | Link |
| 8 | Date range filter → correct data | Filter |
| 9 | Multi-select filter → correct AND/OR | Filter |
| 10 | Empty data state → graceful message | No crash |

### 8.4 Self-Service Analytics Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Report builder — metric + dimension → valid query | Generated |
| 2 | Report builder — invalid combination → error | Validation |
| 3 | Pivot table — row × column × value → correct | Cross-tab |
| 4 | Saved report — runs with saved parameters | Recall |
| 5 | Export CSV → valid file | Download |
| 6 | Export Excel → valid file | Download |
| 7 | Export PDF → formatted report | Download |
| 8 | Scheduled report → delivered on time | Email |
| 9 | Report with 100K rows → paginated | Performance |
| 10 | Ad-hoc query timeout > 30s → cancelled | Timeout |

### 8.5 Data Quality Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Completeness check → nulls flagged | Detected |
| 2 | Uniqueness check → duplicates flagged | Detected |
| 3 | Consistency check → cross-field mismatch flagged | Detected |
| 4 | Invalid email → flagged | Format check |
| 5 | Negative amount → flagged | Range check |
| 6 | Quality score computed → correct % | Scoring |
| 7 | Data steward notified on FAIL | Notification |
| 8 | Auto-correct where possible → corrected | Correction |

### 8.6 AI Analytics Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Narrative generated → all sections present | Complete |
| 2 | Narrative highlights significant changes only | Threshold |
| 3 | Predictive forecast → within expected bounds | Reasonable |
| 4 | Capacity recommendation → actionable | Relevant |
| 5 | Business insight → non-obvious correlation | Surprising |
| 6 | Alert — threshold breach → fires correctly | Correct |
| 7 | Alert — trend anomaly → detects direction | Correct |
| 8 | Alert — forecast deviation → flags > 15% | Correct |
| 9 | Composite risk score → 0-100 range | Scaled |
| 10 | All AI outputs include confidence | Transparency |

### 8.7 Security & Governance Tests (20)

| # | Test | Expect |
|---|------|--------|
| 1 | Row-level security — area A cannot see area B | Isolated |
| 2 | Executive metrics — only exec roles can view | RBAC |
| 3 | Sensitive metric masking — amounts hidden from viewers | Masking |
| 4 | Data catalog — searchable | Search |
| 5 | Data lineage — trace from report to source | Traceable |
| 6 | Report access audit — every view logged | Audit |
| 7 | Export audit — every download logged | Audit |
| 8 | Schedule audit — every delivery logged | Audit |
| 9 | Retention policy — old data purged after TTL | Retention |
| 10 | Data lake archive — Parquet format verified | Format |

### 8.8 Performance & Scale Tests (15)

| # | Test | Expect |
|---|------|--------|
| 1 | Dashboard load — < 2s | Performance |
| 2 | Report with 1M fact rows — < 10s | Performance |
| 3 | ETL 100K invoices — < 5 min | Throughput |
| 4 | Concurrent 50 dashboard views — no degradation | Concurrency |
| 5 | Materialized view refresh — incremental | Refresh |
| 6 | Query cache — 2nd load 10× faster | Cache hit |
| 7 | Data lake compaction — Parquet optimized | Storage |

---

## PART 9: C17 DEFINITION OF DONE

```
C17 — DATA INTELLIGENCE, ANALYTICS & EXECUTIVE DECISION PLATFORM
CERTIFICATION CHECKLIST

□ ANALYTICS INFRASTRUCTURE
   □ Analytics DB (OLAP star schema) created
   □ ETL/ELT pipeline operational (15-min/1hr/6hr/daily)
   □ 8 fact tables loaded incrementally
   □ 9 dimension tables with SCD-2 strategy
   □ Materialized views for daily KPIs
   □ Data lake with Parquet archives
   □ 5 data marts: Financial, Operations, Billing, Customer, Asset

□ KPI FRAMEWORK — 75+ KPIs ACROSS 14 CATEGORIES
   □ Financial: 12 KPIs
   □ Billing: 8 KPIs
   □ Collections: 6 KPIs
   □ Meter Health: 6 KPIs
   □ Asset: 5 KPIs
   □ Inventory: 4 KPIs
   □ Workforce: 5 KPIs
   □ Customer: 5 KPIs
   □ SLA: 3 KPIs
   □ Security: 4 KPIs
   □ Compliance: 3 KPIs
   □ Integration: 4 KPIs
   □ AI Performance: 4 KPIs
   □ Operations: 4 KPIs

□ EXECUTIVE DASHBOARDS — 11 PAGES
   □ CEO Enterprise Scorecard
   □ CFO Financial Analytics
   □ COO Operations Analytics
   □ NOC (Network Operations Center)
   □ Customer Success
   □ Warehouse
   □ Field Operations
   □ Security Operations
   □ Compliance Office
   □ Finance Details
   □ Integration Health

□ SELF-SERVICE ANALYTICS
   □ Report builder (drag-and-drop metric/dimension)
   □ Saved reports with parameters
   □ Drill-down (year→quarter→month→day)
   □ Drill-through (analytics→entity record)
   □ Pivot analysis (cross-tabulation)
   □ Scheduled report delivery
   □ Export: PDF, Excel, CSV, PNG

□ AI ANALYTICS LAYER
   □ Executive Narrative Agent (plain-English summaries)
   □ Predictive Analytics Agent (trend prediction)
   □ Forecasting Agent (short/med/long term + CI)
   □ Capacity Planning Agent (resource recommendations)
   □ Business Insight Agent (correlation discovery)
   □ Alert Intelligence (threshold, trend, forecast deviation)
   □ Composite business risk scoring

□ DATA GOVERNANCE
   □ Data catalog with business glossary
   □ Data lineage (report→source)
   □ Data quality validation (6 rule types)
   □ Data ownership and stewardship
   □ Data classification (4 sensitivity levels)
   □ Retention policy enforcement

□ SECURITY
   □ Row-level security by area/organization
   □ Multi-tenant analytics isolation
   □ Executive metric access control
   □ Sensitive metric masking
   □ Full audit trail (view, export, schedule)

□ TESTS — 170 PASSING
   □ ETL/data pipeline: 25 tests
   □ KPI calculation: 25 tests
   □ Dashboard rendering: 25 tests
   □ Self-service analytics: 20 tests
   □ Data quality: 20 tests
   □ AI analytics: 20 tests
   □ Security & governance: 20 tests
   □ Performance & scale: 15 tests

C17 STATUS: □ NOT IMPLEMENTED
All items above are DESIGN-COMPLETE but not executed.
```

---

## APPENDIX A: ENTERPRISE MATURITY IMPROVEMENT

| Domain | Before C17 | After C17 |
|--------|-----------|-----------|
| Reporting Maturity | 5% | 85% |
| KPI Coverage | 6 basic KPIs | 75+ across 14 categories |
| Executive Dashboards | 0 | 11 role-specific pages |
| Self-Service Analytics | 0 | Full query builder + drill + export |
| Data Warehouse | 0 (OLTP only) | Star schema + materialized views + data marts |
| AI Analytics | Basic aiOperator | 5 agents + alert intelligence |
| Data Governance | 0 | Catalog, lineage, quality, stewardship |
| Data Retention | None | Policy-enforced per category |
| Overall Maturity | 5% | 80% |

## APPENDIX B: WAVE BREAKDOWN

| Wave | Days | Focus | Models | Deliverables |
|------|------|-------|--------|-------------|
| **W01** | 5 | Analytics Infrastructure | AnalyticsDB config, ETL pipeline, star schema | ETL running, facts loading |
| **W02** | 5 | KPI Framework | 75+ KPI definitions, materialized views | All KPIs computing, snapshots storing |
| **W03** | 5 | Executive Dashboards | 11 dashboard pages | CEO, CFO, COO, 8 additional |
| **W04** | 5 | Self-Service Analytics | Report builder, pivot, export | Users can build + save + schedule reports |
| **W05** | 5 | AI Analytics Layer | 5 AI agents, alert engine | Narrative, predictions, alerts |
| **W06** | 4 | Data Governance | Catalog, quality, lineage, retention | Governed analytics with stewardship |
| **W07** | 3 | Certification | 170 tests | All tests passing, maturity verified |
| **Total** | **32 days** | | | |

## APPENDIX C: C17 FILE MANIFEST

| # | File | Action | Lines |
|---|------|--------|-------|
| 1 | Analytics DB setup | **CREATE** | ~50 (schema scripts) |
| 2 | ETL pipeline service | **CREATE** | ~300 |
| 3 | KPI engine (enhanced) | **REWRITE** | ~250 |
| 4 | AI analytics agents | **CREATE** | ~300 |
| 5 | Alert engine | **CREATE** | ~150 |
| 6 | Data catalog + quality | **CREATE** | ~200 |
| 7 | Analytics routes | **CREATE** | ~250 |
| 8 | 11 dashboard pages | **CREATE** | ~1,500 |
| 9 | Report builder frontend | **CREATE** | ~400 |
| 10 | Self-service query engine | **CREATE** | ~250 |

**Total estimated new code:** ~3,650 lines
**Total estimated tests:** 170 tests

---

## APPENDIX D: READINESS ASSESSMENT

```
C17 READINESS CHECKLIST:

Prerequisites (must be complete before C17 implementation):
□ C13 Financial Intelligence — provides financial fact sources
□ C14 Customer Experience — provides customer interaction data
□ C15 Enterprise Integration — provides integration metrics
□ C16 Asset & Field Operations — provides asset/workforce data
□ C12 Identity — provides RBAC for analytics security
□ Existing KpiDefinition + KpiSnapshot — base for enhancement

Dependencies on C13-C16:
  ┌──────────────┬──────────────────────────────────────────────┐
  │ C17 Fact     │ Source Program                                │
  ├──────────────┼──────────────────────────────────────────────┤
  │ FactInvoice  │ C13 Financial (Invoice + InvoiceItem)        │
  │ FactPayment  │ C13 Financial (Payment + PaymentTransaction) │
  │ FactReading  │ Existing (Reading model)                     │
  │ FactCase     │ C13 Financial (CollectionCase)               │
  │ FactWorkOrder│ C16 Asset (WorkOrder)                        │
  │ FactIntLog   │ C15 Integration (IntegrationLog)             │
  │ FactHealth   │ C16 Asset (AssetHealthScore)                 │
  │ FactMaint    │ C16 Asset (MaintenanceSchedule)              │
  └──────────────┴──────────────────────────────────────────────┘

Risk: C17 should NOT start until at least C13-C15 are implemented,
as it depends on their fact data for meaningful analytics.
```

---

*This document is a planning artifact only. No code, no implementation, no database migration.*
*C17 — Data Intelligence, Analytics & Executive Decision Platform. READ ONLY. GOVERNANCE PLANNING ONLY.*
