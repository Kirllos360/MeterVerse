# F1 — Mock Dependency Inventory

**Date**: 2026-06-18
**Method**: Full content scan of `Frontend/src/` — grep for mock, fallback, fake, fixture, seed, demo patterns
**Source files**: `mock-data.ts` (18 arrays), `mock-auth.ts` (auth store + users)

---

## 1. Mock Data Sources

### `lib/mock-data.ts` — 18 Arrays

| # | Array | Type | Records | Used By Pages |
|---|-------|------|---------|---------------|
| 1 | `mockUsers` | User[] | 8 | Settings, auth |
| 2 | `mockProjects` | Project[] | 6 | Projects, Locations, Invoices, Meters, Readings, WaterBalance |
| 3 | `mockBuildings` | Building[] | 12 | Locations, WaterBalance, AssignMeter |
| 4 | `mockUnits` | Unit[] | 20 | Locations, CustomerDetail, AssignMeter, NewReading |
| 5 | `mockCustomers` | Customer[] | 15 | Customers, Invoices, Payments, Support, AssignMeter |
| 6 | `mockMeters` | Meter[] | 30 | Meters, Dashboard, Readings, CustomerDetail, MeterDetail, WaterBalance |
| 7 | `mockSimCards` | SimCard[] | 15 | SIM Cards, AssignMeter, TerminateMeter |
| 8 | `mockReadings` | Reading[] | 25 | Readings, MeterDetail, NewReading |
| 9 | `mockInvoices` | Invoice[] | 15 | Invoices, InvoiceDetail, Customers, Support, MeterDetail |
| 10 | `mockPayments` | Payment[] | 15 | Payments, Support, InvoiceDetail |
| 11 | `mockBalances` | Balance[] | varies | Balances |
| 12 | `mockAlerts` | Alert[] | varies | Alerts, Dashboard, TopNav, ProjectDetail |
| 13 | `mockTickets` | Ticket[] | varies | Tickets, Support |
| 14 | `mockConsumptionData` | ConsumptionRecord[] | varies | Consumption, Dashboard |
| 15 | `mockWaterBalanceData` | WaterBalanceRecord[] | varies | WaterBalance |
| 16 | `mockKPIs` | KPI[] | varies | Dashboard |
| 17 | `mockRecentActivity` | ActivityItem[] | varies | Dashboard |
| 18 | `mockReports` | Report[] | varies | Reports |

### `lib/mock-auth.ts` — Auth Store

| Export | Type | Description |
|--------|------|-------------|
| `useAuthStore` | Zustand store | Mock auth state (dev login) |
| `mockUsers` | User[] (8) | Re-imported from mock-data |
| `ROLES` | Role[] tuple | 7 roles with labels |
| `getRoleColor` | Function | Role badge colors |
| `getRoleLabel` | Function | Role display names |

---

## 2. Per-Page Mock Dependency Matrix

| Page | API Hooks | Mock Fallback (`??`) | Direct Mock Usage | Classification |
|------|-----------|---------------------|-------------------|---------------|
| **Dashboard** | 3 hooks (kpis, trend, activity) | 2 (`consumption`, `activity`) | 5 arrays (mockKPIs, mockConsumptionData, mockAlerts, mockRecentActivity, mockMeters) | **HYBRID** |
| **Projects** | `useProjectsList()` | 1 (`apiProjects ?? mockProjects`) | 1 array | **HYBRID** |
| **ProjectDetail** | `useProjectDetail(id)` | 1 (`apiProject ?? mockProjects.find()`) | 7 arrays (projects, buildings, units, customers, meters, alerts, readings) | **HYBRID** |
| **Locations** | `useProjectsList()`, `useLocationsList()` | 1 (`apiProjects ?? mockProjects`) | 2 arrays | **HYBRID** |
| **Customers** | `useProjectsList()` | 2 (projects, customers) | 2 arrays | **HYBRID** |
| **CustomerDetail** | none | 0 | 4 arrays (customers, invoices, meters, units) | **MOCK** |
| **All Meters** | `useMetersList()` | 1 (`metersQuery.data ?? mockMeters`) | 2 arrays | **HYBRID** |
| **MeterDetail** | none | 0 | 4 arrays (meters, readings, simCards, invoices) | **MOCK** |
| **Assign Meter** | none | 0 | 6 arrays (projects, buildings, units, customers, meters, simCards) | **MOCK** |
| **Replace Meter** | `useMetersList()` | 1 | 1 array | **HYBRID** |
| **Terminate Meter** | `useMetersList()` | 1 | 3 arrays | **HYBRID** |
| **SIM Cards** | `useSimCardsList()` | 1 | 1 array | **HYBRID** |
| **All Readings** | `useReadingsList()` | 1 | 2 arrays | **HYBRID** |
| **New Reading** | none | 0 | 5 arrays (projects, meters, customers, units, readings) | **MOCK** |
| **Consumption** | none | 0 | 1 array | **MOCK** |
| **Water Balance** | `useWaterBalance()` | 1 | 4 arrays | **HYBRID** |
| **Invoices** | `useInvoicesList()` | 0 (uses `useApi` flag) | 2 arrays | **HYBRID** |
| **InvoiceDetail** | `useInvoiceDetail()` | 1 | 2 arrays | **HYBRID** |
| **Payments** | `usePaymentsList()` | 0 (uses `useApi` flag) | 2 arrays | **HYBRID** |
| **Balances** | none | 0 | 1 array | **MOCK** |
| **Reports** | none | 0 | 1 array | **MOCK** |
| **Alerts** | none | 0 | 1 array | **MOCK** |
| **Tickets** | none | 0 | 1 array | **MOCK** |
| **Support** | none | 0 | 5 arrays (customers, meters, invoices, payments, tickets) | **MOCK** |
| **Settings** | none | 0 | 1 array (users) | **MOCK** |

### Classification Summary

| Classification | Count | Pages |
|---------------|-------|-------|
| **API** — real API only, no mock | 0 | (none) |
| **HYBRID** — has API hook + mock fallback | 14 | Dashboard, Projects, ProjectDetail, Locations, Customers, All Meters, Replace Meter, Terminate Meter, SIM Cards, All Readings, Water Balance, Invoices, InvoiceDetail, Payments |
| **MOCK** — mock data only, no API hook | 11 | CustomerDetail, MeterDetail, Assign Meter, New Reading, Consumption, Balances, Reports, Alerts, Tickets, Support, Settings |

**MOCK_FREE_PERCENTAGE = 0%** (no page is fully API-driven without mock fallback)

---

## 3. Feature Flag Analysis

**File**: `lib/feature-flags.ts`

| Flag | Default | Actually Respected? |
|------|---------|-------------------|
| `projects` | `'mock'` | ❌ — hooks ignore flag, call API unconditionally |
| `locations` | `'mock'` | ❌ — hooks ignore flag |
| `customers` | `'mock'` | ❌ — hooks ignore flag |
| `meters` | `'mock'` | ❌ — hooks ignore flag |
| `sim-cards` | `'mock'` | ❌ — hooks ignore flag |
| `readings` | `'mock'` | ❌ — hooks ignore flag |
| `consumption` | `'mock'` | ❌ — hooks ignore flag |
| `water-balance` | `'mock'` | ❌ — hooks ignore flag |
| `invoices` | `'mock'` | ❌ — hooks ignore flag (uses `useApi` param instead) |
| `payments` | `'mock'` | ❌ — hooks ignore flag (uses `useApi` param instead) |
| `balances` | `'mock'` | ❌ — hooks ignore flag |
| `reports` | `'mock'` | ❌ — no hook at all |
| `alerts` | `'mock'` | ❌ — no hook at all |

**Feature flags are entirely decorative.** All hooks call real API unconditionally. The `'mock'` default only matters for the unused `/api/features` endpoint.

---

## 4. `??` Mock Fallback Pattern Inventory (18 total)

| # | File | Line | Pattern |
|---|------|------|---------|
| 1 | `ProjectsPage.tsx` | 23 | `apiProjects ?? mockProjects` |
| 2 | `ProjectDetailPage.tsx` | 21 | `apiProject ?? mockProjects.find(...)` |
| 3 | `CustomersPage.tsx` | 28 | `apiProjects ?? mockProjects` |
| 4 | `CustomersPage.tsx` | 30 | `apiCustomers ?? mockCustomers` |
| 5 | `LocationsPage.tsx` | 46 | `apiProjects ?? mockProjects` |
| 6 | `MetersPage.tsx` | 20 | `metersQuery.data ?? mockMeters` |
| 7 | `MeterDetailPage.tsx` | 20 | `meterQuery.data ?? mockMeters.find(...)` |
| 8 | `MeterReplacePage.tsx` | 33 | `metersQuery.data ?? mockMeters` |
| 9 | `MeterTerminatePage.tsx` | 32 | `metersQuery.data ?? mockMeters` |
| 10 | `SimCardsPage.tsx` | 78 | `simCardsQuery.data ?? mockSimCards` |
| 11 | `ReadingsPage.tsx` | 23 | `apiReadings ?? mockReadings` |
| 12 | `InvoiceDetailPage.tsx` | 20 | `apiInvoice ?? mockInvoices.find(...)` |
| 13 | `WaterBalancePage.tsx` | 34 | `apiData ?? mockWaterBalanceData[...]` |
| 14 | `DashboardPage.tsx` | 367 | `consumptionQuery.data?.data ?? mockConsumptionData` |
| 15 | `DashboardPage.tsx` | 368 | `activityQuery.data?.items ?? mockRecentActivityData` |
| 16 | `mock-auth.ts` | 36 | `mockUsers.find((u) => u.role === role) ?? mockUsers[0]` |
| 17 | `mock-auth.ts` | 61 | `mockUsers.find((u) => u.role === role) ?? mockUsers[0]` |
| 18 | `feature-flags.ts` | 52 | `return flags[feature] ?? 'mock'` |

---

## 5. Pages Without Any API Hook (100% Mock)

| Page | Mock Arrays Used | Recommendation |
|------|-----------------|----------------|
| CustomerDetail | mockCustomers, mockInvoices, mockMeters, mockUnits | Needs `useCustomerDetail(id)` |
| MeterDetail | mockMeters, mockReadings, mockSimCards, mockInvoices | Needs `useMeterDetail(id)` |
| Assign Meter | mockProjects, mockBuildings, mockUnits, mockCustomers, mockMeters, mockSimCards | Needs `useProjectsList`, `useBuildingsList`, etc. |
| New Reading | mockProjects, mockMeters, mockCustomers, mockUnits, mockReadings | Needs `useMetersList`, `useCustomersList` |
| Consumption | mockConsumptionData | Needs `useConsumptionList(projectId)` |
| Balances | mockBalances | Needs `useBalancesList()` |
| Reports | mockReports | Needs `useReportsList()` |
| Alerts | mockAlerts | Needs `useAlertsList()` |
| Tickets | mockTickets | Needs `useTicketsList()` |
| Support | mockCustomers, mockMeters, mockInvoices, mockPayments, mockTickets | Needs multiple hooks |
| Settings | mockUsers | Needs `useUsersList()` |

---

## 6. Backend Controller Coverage

Only 3 pages have corresponding backend controllers:
- `Invoices` — controller exists, endpoint wired
- `InvoiceDetail` — controller exists, endpoint wired
- `Payments` — controller exists, endpoint wired

All other pages have frontend hooks that target non-existent backend endpoints.

---

## Board

```
MOCK_DEFINITION_FILES = 2 (mock-data.ts, mock-auth.ts)
MOCK_DATA_ARRAYS = 18
FILES_IMPORTING_MOCK = 29 (unique)
TOTAL_IMPORT_STATEMENTS = 34
??_MOCK_FALLBACK_PATTERNS = 18
FEATURE_FLAGS_DEFAULT_MOCK = 11 of 13

PAGES_CLASSIFIED:
  API_ONLY = 0  (0%)
  HYBRID   = 14 (56%)
  MOCK_ONLY = 11 (44%)

MOCK_FREE_PERCENTAGE = 0%

FEATURE_FLAGS_RESPECTED = NO (0 of 13)
BACKEND_CONTROLLER_COVERAGE = 3 of 26 pages (11.5%)
HOOKS_TARGETING_NONEXISTENT_ENDPOINTS = 12 of 14 pages
```
