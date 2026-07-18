# MeterVerse Page Composition Rules

**Version:** 2.0.0  
**Authority:** How every page is assembled. No developer may deviate from these blueprints.

---

## 1. Composition Architecture

Every page is built from:
```
FIXED REGIONS (always present)
├── Top Navigation (framework, not part of any page)
├── Sidebar (framework)
├── Breadcrumb (auto-generated from route)
├── Page Header (HeroSection)
├── Page Footer (minimal)
└── Status Bar (framework)

FLEXIBLE REGIONS (page-defined)
├── KPI Strip (0-12 metric cards)
├── Warning Banners (0-5 conditional banners)
├── Quick Actions (0-8 action buttons)
├── Content Area (tabs, sections, wizard steps)
├── Side Panel (optional, context-aware)
├── Activity Timeline (optional)
└── Relationship Panel (optional)
```

---

## 2. Customer Workspace Blueprint

```
FIXED: EnterpriseShell → HeroSection → Breadcrumb

FLEXIBLE:
├── [REQUIRED] CustomerHero — avatar, name, status, tags, summary ribbon, quick actions
├── [REQUIRED] WarningBanners — negative balance, suspended, faulty meter
├── [REQUIRED] KPIStrip — 12 KPIs (balance, outstanding, wallet, meters, consumption, etc.)
├── [REQUIRED] TabContainer — 17 tabs (overview, units, meters, invoices, payments, ledger, etc.)
├── [REQUIRED] SmartPanel — context-aware warnings, suggestions, quick actions (right side)
├── [REQUIRED] ActivityTimeline — chronological feed of all business events
├── [OPTIONAL] RelationshipPanel — visual entity relationship graph (right side)
└── [OPTIONAL] CustomerHealthWidget — health gauge (right side)

RULES:
- CustomerHero must always be visible, even during scroll (sticky top)
- KPIStrip wraps to 2 rows on tablet, 3 rows on mobile
- SmartPanel collapses to bottom on mobile
- Timeline paginates at 20 events, "Load more" button
- Right panel is toggleable; state persists per user
```

---

## 3. Meter Workspace Blueprint

```
FIXED: EnterpriseShell → HeroSection → Breadcrumb

FLEXIBLE:
├── [REQUIRED] MeterHero — serial, type icon, brand, status badge, location
├── [REQUIRED] HealthGauge — communication status, last reading health, battery
├── [REQUIRED] KPIStrip — 6 KPIs (last reading, consumption, readings count, age, etc.)
├── [REQUIRED] TabContainer — overview, readings, lifecycle, maintenance, communication, alerts
├── [REQUIRED] ReadingTimeline — chronological readings with consumption chart
├── [OPTIONAL] SIMCardPanel — linked SIM info, status, eligibility
└── [OPTIONAL] QuickActions — record reading, replace, terminate, maintenance

RULES:
- Status badge must pulse for faulty/offline meters
- ReadingTimeline shows latest 12 readings with sparkline chart
- Health gauge updates in real-time (simulated)
```

---

## 4. Invoice Workspace Blueprint

```
FIXED: EnterpriseShell → HeroSection → Breadcrumb

FLEXIBLE:
├── [REQUIRED] InvoiceHero — invoice number, customer, period, total, status
├── [REQUIRED] FinancialSummary — subtotal, tax, adjustments, total, paid, outstanding
├── [REQUIRED] InvoiceLines — line items SmartTable
├── [REQUIRED] PaymentHistory — allocated payments table
├── [REQUIRED] QuickActions — download PDF, email, cancel, adjust, reverse
├── [OPTIONAL] LedgerEntries — related ledger activity
└── [OPTIONAL] AuditTrail — invoice lifecycle events

RULES:
- FinancialSummary uses financial card variant with currency formatting
- Status determines available actions (cannot cancel paid invoice)
- PDF download triggers immediately, shows progress
```

---

## 5. Payment Workspace Blueprint

```
FIXED: EnterpriseShell → HeroSection → Breadcrumb

FLEXIBLE:
├── [REQUIRED] PaymentHero — amount, method, customer, date, status
├── [REQUIRED] PaymentAllocation — which invoices were paid, amounts
├── [REQUIRED] ReceiptPanel — receipt preview, download
├── [REQUIRED] QuickActions — reverse, email receipt, print
├── [OPTIONAL] CustomerSnapshot — related customer mini-card
└── [OPTIONAL] AuditTrail — payment lifecycle events
```

---

## 6. Dashboard Workspace Blueprint

```
FIXED: EnterpriseShell

FLEXIBLE:
├── [REQUIRED] DashboardHero — title, period selector, last refresh
├── [REQUIRED] KPIStrip — 4-6 domain-specific KPIs
├── [REQUIRED] WidgetGrid — 2-6 dashboard widgets (charts, tables, status)
├── [OPTIONAL] AlertSummary — current alerts by severity
├── [OPTIONAL] ActivityFeed — recent events timeline
└── [OPTIONAL] QuickActions — common tasks for this role
```

---

## 7. Explorer Workspace Blueprint

```
FIXED: EnterpriseShell → Breadcrumb

FLEXIBLE:
├── [REQUIRED] ExplorerHeader — title, count, add button
├── [REQUIRED] FilterBar — search input, filter dropdowns, date range
├── [REQUIRED] ViewToggle — table / card / grid toggle
├── [REQUIRED] DataDisplay — SmartTable or CardGrid
├── [REQUIRED] Pagination — page controls, page size selector
├── [OPTIONAL] ColumnDesigner — show/hide/reorder columns
├── [OPTIONAL] SavedViews — save/load filter configurations
└── [OPTIONAL] ExportButton — CSV, Excel, PDF
```

---

## 8. Settings Workspace Blueprint

```
FIXED: EnterpriseShell → Breadcrumb

FLEXIBLE:
├── [REQUIRED] SettingsNav — vertical tab list (users, areas, unit types, etc.)
├── [REQUIRED] SettingsContent — form or table for the selected section
├── [OPTIONAL] SectionDescription — explain what this section does
├── [OPTIONAL] AuditLog — track who changed what
└── [OPTIONAL] SaveIndicator — unsaved changes indicator
```

---

## 9. Wizard Workspace Blueprint

```
FIXED: EnterpriseShell (minimal) → No sidebar

FLEXIBLE:
├── [REQUIRED] StepIndicator — all steps, current highlighted, completed checkmarked
├── [REQUIRED] StepContent — form fields for current step
├── [REQUIRED] NavigationButtons — Previous, Next, Cancel
├── [REQUIRED] SummaryStep — review all data before submission
├── [OPTIONAL] SaveDraft — persist progress
└── [OPTIONAL] ProgressBar — completion percentage
```

---

## 10. Enforcement Rules

| Rule | Violation Consequence |
|------|----------------------|
| Every page must match exactly one blueprint | CI fails |
| Every required section must be present | CI fails |
| No page may define custom spacing | Lint fails |
| No page may define custom colors | Lint fails |
| Every interactive element must have 7 states | Architecture review |
| Every data display must have 4 states | Architecture review |
| Every form must have 5 validation states | Architecture review |
