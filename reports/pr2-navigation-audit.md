# PR2 — Navigation Synchronization Audit

**Date**: 2026-06-18
**Source files**: `router-store.ts`, `AppSidebar.tsx`, `AppShell.tsx`, `navigation.ts`

---

## 1. Route Tree

### Source of Truth: PageKey type (`router-store.ts`)
**26 keys** defined:

```
login, dashboard, projects, project-detail, locations,
customers, customer-detail, meters, meter-detail,
meter-assign, meter-replace, meter-terminate, sim-cards,
readings, reading-new, consumption, water-balance,
invoices, invoice-detail, payments, balances, reports,
alerts, tickets, support, settings
```

### Sidebar Navigation (`navigation.ts` → `getNavItemsForRole`)
**17 top-level items** with **6 sub-items** for Super Admin:

```
                    sidebar                  href
┌─────────────────────────────────────────────────────┐
│  Dashboard      ← LayoutDashboard     /dashboard     │
│  Projects       ← Building2          /projects       │
│  Locations      ← MapPin             /locations      │
│  Customers      ← Users              /customers      │
│  Meters         ← Gauge              /meters         │
│  ├ All Meters   ← List               /meters         │
│  ├ Assign Meter ← Link               /meters/assign  │
│  ├ Replace Meter← RefreshCw          /meters/replace │
│  └ Terminate M. ← XCircle            /meters/terminat│
│  SIM Cards      ← Wifi               /sim-cards      │
│  Readings       ← FileText           /readings       │
│  ├ All Readings ← List               /readings       │
│  └ New Reading  ← PlusCircle         /readings/new   │
│  Consumption    ← Activity           /consumption    │
│  Water Balance  ← Droplets           /water-balance  │
│  Invoices       ← Receipt            /invoices       │
│  Payments       ← Banknote           /payments       │
│  Balances       ← Scale              /balances       │
│  Reports        ← BarChart3          /reports        │
│  Alerts         ← Bell               /alerts         │
│  Tickets        ← MessageSquare      /tickets        │
│  Support        ← Headphones         /support        │
│  Settings       ← Settings           /settings       │
└─────────────────────────────────────────────────────┘
```

### Programmatic Detail Pages (no sidebar link)
```
project-detail   ← accessed via project row click
customer-detail  ← accessed via customer row click
meter-detail     ← accessed via meter row click
invoice-detail   ← accessed via invoice row click
```

---

## 2. Route Mapping Consistency

| Check | Source | Count | Status |
|-------|--------|-------|--------|
| PageKey type definitions | `router-store.ts` | 26 | ✅ |
| AppShell renderPage cases | `AppShell.tsx:117-197` | 26 | ✅ Matches |
| hrefToPageKey mappings | `AppSidebar.tsx:80-102` | 21 | ✅ (detail pages excluded) |
| pageKeyToHref mappings | `AppSidebar.tsx:105-132` | 26 | ✅ |
| Sidebar navigation items | `navigation.ts` | 23 (17+6) | ✅ |
| Actual running sidebar | Playwright snapshot | 23 (17+6) | ✅ Matches |

---

## 3. Dead Routes

| Route | Status |
|-------|--------|
| `login` | ✅ Renders LoginPage (accessible when unauthenticated) |
| `project-detail` | ✅ Renders ProjectDetailPage (via row click) |
| `customer-detail` | ✅ Renders CustomerDetailPage (via row click) |
| `meter-detail` | ✅ Renders MeterDetailPage (via row click) |
| `invoice-detail` | ✅ Renders InvoiceDetailPage (via row click) |

**No dead routes found.**

---

## 4. Missing Routes

| Expected | Found in | Status |
|----------|----------|--------|
| All 26 PageKeys in AppShell | `AppShell.tsx` | ✅ All present |
| All 23 sidebar routes actually navigable | Playwright | ✅ All navigable |
| All 17 sidebar items in navigation.ts | `navigation.ts` | ✅ All present |
| All href→PageKey mappings | `AppSidebar.tsx` | ✅ All present |

**No missing routes found.**

---

## 5. Duplicate Routes

Checked: All 26 PageKeys are unique. All href values in navigation.ts are unique except `/meters` (parent + first child) and `/readings` (parent + first child) — this is intentional (parent expands children and child navigates).

**No duplicate routes found.**

---

## 6. Orphan Pages

Checked: All 26 component imports in AppShell.tsx correspond to existing source files.

| Component | File exists? | Used in AppShell? |
|-----------|-------------|------------------|
| LoginPage | ✅ `./LoginPage.tsx` | ✅ |
| DashboardPage | ✅ `dashboard/DashboardPage.tsx` | ✅ |
| ProjectsPage | ✅ `projects/ProjectsPage.tsx` | ✅ |
| ProjectDetailPage | ✅ `projects/ProjectDetailPage.tsx` | ✅ |
| LocationsPage | ✅ `projects/LocationsPage.tsx` | ✅ |
| CustomersPage | ✅ `customers/CustomersPage.tsx` | ✅ |
| CustomerDetailPage | ✅ `customers/CustomerDetailPage.tsx` | ✅ |
| MetersPage | ✅ `meters/MetersPage.tsx` | ✅ |
| MeterDetailPage | ✅ `meters/MeterDetailPage.tsx` | ✅ |
| MeterAssignPage | ✅ `meters/MeterAssignPage.tsx` | ✅ |
| MeterReplacePage | ✅ `meters/MeterReplacePage.tsx` | ✅ |
| MeterTerminatePage | ✅ `meters/MeterTerminatePage.tsx` | ✅ |
| SimCardsPage | ✅ `sim-cards/SimCardsPage.tsx` | ✅ |
| ReadingsPage | ✅ `readings/ReadingsPage.tsx` | ✅ |
| ReadingNewPage | ✅ `readings/ReadingNewPage.tsx` | ✅ |
| ConsumptionPage | ✅ `billing/ConsumptionPage.tsx` | ✅ |
| WaterBalancePage | ✅ `billing/WaterBalancePage.tsx` | ✅ |
| InvoicesPage | ✅ `billing/InvoicesPage.tsx` | ✅ |
| InvoiceDetailPage | ✅ `billing/InvoiceDetailPage.tsx` | ✅ |
| PaymentsPage | ✅ `billing/PaymentsPage.tsx` | ✅ |
| BalancesPage | ✅ `billing/BalancesPage.tsx` | ✅ |
| ReportsPage | ✅ `reports/ReportsPage.tsx` | ✅ |
| SettingsPage | ✅ `reports/SettingsPage.tsx` | ✅ |
| AlertsPage | ✅ `alerts/AlertsPage.tsx` | ✅ |
| TicketsPage | ✅ `tickets/TicketsPage.tsx` | ✅ |
| SupportPage | ✅ `tickets/SupportPage.tsx` | ✅ |

**No orphan pages found.**

---

## 7. Legacy Navigation

The old `hrefToPageKey` approach in `AppSidebar.tsx:80-102` does NOT include the 4 detail pages (`project-detail`, `customer-detail`, `meter-detail`, `invoice-detail`). These are accessed programmatically via `usePageStore.navigate()` directly. This is intentional and correct — they are not sidebar-triggered.

---

## 8. Actual vs Expected (From Playwright)

The running sidebar (confirmed via Playwright snapshot during Phase D) matches the `allNavItems` array exactly for Super Admin role:

- All 17 main items present with correct Arabic labels
- All sub-items present under Meters (4) and Readings (2)
- All icons match
- Active state highlighting works
- Collapse/expand animations work
- Mobile drawer works

---

## Board

```
NAVIGATION_SYNCHRONIZED = YES ✅
```

**The sidebar that the user sees IS the current source code.** If they reported "old navigation," the issue is that the 76 uncommitted changes (PR1 finding) have not been committed to git. The running dev server reflects the uncommitted state. Running from a fresh clone of `main` would show an older version.
