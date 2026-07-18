# Phase C — API Connection Audit

**Date**: 2026-06-18  
**Auditor**: opencode  
**Scope**: All 25 SPA pages + LoginPage, feature flags, API hooks, mock data, backend controllers

---

## 1. Summary

| Metric | Count |
|--------|-------|
| Pages audited | 26 (25 SPA + Login) |
| With API hook | 16 |
| With feature flag | 13 (16 flags exist, 1 unused by any page) |
| Feature flag key configured `'api'` | 6 (invoices, invoice detail, payments, balances, reviews, billing) |
| Backend controllers exist | 12+ |
| Ready for API mode | 3 pages (Invoices, InvoiceDetail, Payments) |
| Missing backend controller | Reports, Alerts, Tickets |
| Missing API hook | 9 pages |
| Pages using **only** hardcoded mock data | 12 pages (CustomerDetail, MeterAssign, MeterReplace forms, MeterTerminate forms, ReadingNew forms, Consumption (broken), Balances, Reports, Settings, Alerts, Tickets, Support) |

---

## 2. Per-Page Audit Table

| # | Page | URL | API Hook(s) | Feature Flag | Fallback Mock | Backend Controller | API Ready |
|---|------|-----|-------------|--------------|---------------|-------------------|-----------|
| 0 | **LoginPage** | `/login` | `useAuthStore.login()` → `POST /auth/dev-login` | none | mock token | `auth/` (dev-login) | ✅ |
| 1 | **DashboardPage** | `/dashboard` | `useDashboardKpis`, `useConsumptionTrend`, `useRecentActivity` | none | `mockKPIs`, `mockConsumptionData`, `mockRecentActivityData` | `dashboard.controller.ts` | ⚠️ no flag |
| 2 | **ProjectsPage** | `/projects` | `useProjectsList` → `GET /projects` | `projects.list` = `'mock'` | `mockProjects` | `projects.controller.ts` | ⚠️ flag=mock |
| 3 | **ProjectDetailPage** | `/projects/:id` | `useProjectDetail` → `GET /projects/:id` | auto `projects.list` | `mockProjects` + sub-entity mocks | `projects.controller.ts` | ⚠️ mixed mock |
| 4 | **LocationsPage** | `/locations` | `useLocationsList`, `useProjectsList` | `locations.list` = `'mock'` | `mockProjects`, empty arrays | `locations.controller.ts` | ⚠️ flag=mock |
| 5 | **CustomersPage** | `/customers` | `useCustomersList` → `GET /projects/:id/customers` | `customers.list` = `'mock'` | `mockCustomers` | `customers.controller.ts` | ⚠️ flag=mock |
| 6 | **CustomerDetailPage** | `/customers/:id` | none for detail | none | `mockCustomers`, `mockInvoices`, `mockMeters`, `mockUnits` | `customers.controller.ts` | ❌ no detail hook |
| 7 | **MetersPage** | `/meters` | `useMetersList` → `GET /meters` | `meters.list` = `'mock'` | `mockMeters` | `meters.controller.ts` | ⚠️ flag=mock |
| 8 | **MeterDetailPage** | `/meters/:id` | `useMeterDetail` → `GET /meters/:id` | none | `mockMeters` + `mockReadings`, `mockSimCards`, `mockInvoices` | `meters.controller.ts` | ⚠️ mixed mock |
| 9 | **MeterAssignPage** | `/meters/assign/:meterId` | none | none | all mock sources (6 mocks) | — | ❌ 100% mock |
| 10 | **MeterReplacePage** | `/meters/replace/:oldMeterId` | `useMetersList`, `useReplaceMeter` | none | `mockMeters` | `meters.controller.ts` (terminate) | ⚠️ action only |
| 11 | **MeterTerminatePage** | `/meters/terminate/:meterId` | `useMetersList`, `useTerminateMeter` | none | `mockMeters`, `mockSimCards`, `mockCustomers` | `meters.controller.ts` (terminate) | ⚠️ action only |
| 12 | **SimCardsPage** | `/sim-cards` | `useSimCardsList` → `GET /sim-cards` | `sims.list` = `'mock'` | `mockSimCards` | none found | ⚠️ flag=mock |
| 13 | **ReadingsPage** | `/readings` | `useReadingsList` → `GET /readings` | `projects.readings` = `'mock'` | `mockReadings` | `readings.controller.ts` | ⚠️ flag=mock |
| 14 | **ReadingNewPage** | `/readings/new` | `useCreateReading` → `POST /readings` | none | `mockProjects`, `mockMeters`, `mockCustomers`, `mockUnits` | `readings.controller.ts` | ⚠️ mock form |
| 15 | **ConsumptionPage** | `/billing/consumption` | `useConsumptionTrend` | `'consumption'` **missing** from FeatureFlags | `mockConsumptionData` | — | ❌ broken flag |
| 16 | **WaterBalancePage** | `/billing/water-balance` | `useWaterBalance` | none | `mockWaterBalanceData` | `water-balance.controller.ts` | ⚠️ no flag |
| 17 | **InvoicesPage** | `/billing/invoices` | `useInvoicesList` → `GET /invoices` | `invoices.list` = `'api'` ✅ | `mockInvoices` | `billing.controller.ts` | ✅ READY |
| 18 | **InvoiceDetailPage** | `/billing/invoices/:id` | `useInvoiceDetail` → `GET /invoices/:id` | `invoices.list` = `'api'` ✅ | `mockInvoices` | `billing.controller.ts` | ✅ READY |
| 19 | **PaymentsPage** | `/billing/payments` | `usePaymentsList` → `GET /payments` | `payments.list` = `'api'` ✅ | `mockPayments` | — | ✅ READY |
| 20 | **BalancesPage** | `/billing/balances` | none | `billing.list` = `'api'` | `mockBalances` (when flag='mock'), `[]` (when flag='api') | — | ❌ no hook |
| 21 | **ReportsPage** | `/reports` | none | `reports.list` = `'mock'` | `mockReports` | `reports/` dir empty | ❌ 100% mock |
| 22 | **SettingsPage** | `/settings` | none | none | `mockUsers` | — | ❌ 100% mock |
| 23 | **AlertsPage** | `/alerts` | none | `alerts.list` = `'mock'` | `mockAlerts` | — | ❌ 100% mock |
| 24 | **TicketsPage** | `/tickets` | none | `tickets.list` = `'mock'` | `mockTickets` | — | ❌ 100% mock |
| 25 | **SupportPage** | `/support` | none | none | 5 mock sources | — | ❌ 100% mock |

---

## 3. Feature Flags Analysis

### Configured (16 flags in `feature-flags.ts`)

| Flag Key | Default | Used By | Ready for 'api'? |
|----------|---------|---------|------------------|
| `projects.list` | `'mock'` | ProjectsPage, ProjectDetailPage (auto) | ✅ has hook |
| `projects.readings` | `'mock'` | ReadingsPage (via autoOverride) | ✅ has hook |
| `customers.list` | `'mock'` | CustomersPage | ✅ has hook |
| `meters.list` | `'mock'` | MetersPage | ✅ has hook |
| `locations.list` | `'mock'` | LocationsPage | ✅ has hook |
| `sims.list` | `'mock'` | SimCardsPage | ✅ has hook |
| `reports.list` | `'mock'` | ReportsPage | ❌ no hook, no controller |
| `alerts.list` | `'mock'` | AlertsPage | ❌ no hook, no controller |
| `tickets.list` | `'mock'` | TicketsPage | ❌ no hook, no controller |
| `invoices.list` | `'api'` | InvoicesPage, InvoiceDetailPage | ✅ has hook, has controller |
| `payments.list` | `'api'` | PaymentsPage | ✅ has hook |
| `billing.list` | `'api'` | BalancesPage | ❌ no hook |
| `reviews.list` | `'api'` | none | N/A |
| `reviews.readings` | `'api'` | none | N/A |
| `jobs.export` | `'mock'` | none | N/A |
| `jobs.import` | `'mock'` | none | N/A |

### Missing Flag

`'consumption'` — referenced in `ConsumptionPage.tsx:32` via `isFeatureEnabled('consumption')` but not defined in `FeatureFlags`. Fallback logic defaults to `'mock'` from the `??` operator — undefined key test always fails.

### Auto-Override Behavior

```typescript
// In feature-flags.ts
{ test: 'projects.readings', eq: 'api', set: ['projects.list', 'api'] }
```
When `projects.readings = 'api'`, it forces `projects.list = 'api'`. This means:
- If `projects.readings` flag is set to `'api'`, the **ProjectsPage** also switches to API mode regardless of its own config.

---

## 4. API Hook Coverage

### Hooks with full API-mock dual source (tries API, falls back to mock)

| Hook | Endpoint | Used By |
|------|----------|---------|
| `useDashboardKpis` | `GET /dashboard/kpis` | DashboardPage |
| `useConsumptionTrend` | `GET /dashboard/consumption-trend` | DashboardPage, ConsumptionPage |
| `useRecentActivity` | `GET /dashboard/recent-activity` | DashboardPage |
| `useProjectsList` | `GET /projects` | ProjectsPage, LocationsPage, CustomerDetailPage, MeterReplacePage, MeterTerminatePage |
| `useProjectDetail` | `GET /projects/:id` | ProjectDetailPage |
| `useCustomersList` | `GET /projects/:projectId/customers` | CustomersPage |
| `useMetersList` | `GET /meters` | MetersPage, MeterReplacePage, MeterTerminatePage |
| `useMeterDetail` | `GET /meters/:id` | MeterDetailPage |
| `useSimCardsList` | `GET /sim-cards` | SimCardsPage |
| `useReadingsList` | `GET /readings` | ReadingsPage |
| `useLocationsList` | `GET /projects/:id/locations` | LocationsPage |
| `useWaterBalance` | `GET /projects/:projectId/water-balance` | WaterBalancePage |
| `useInvoicesList` | `GET /invoices` | InvoicesPage |
| `useInvoiceDetail` | `GET /invoices/:id` | InvoiceDetailPage |
| `usePaymentsList` | `GET /payments` | PaymentsPage |

### Hooks with mutations only (no GET query)

| Hook | Endpoint | Used By |
|------|----------|---------|
| `useCreateReading` | `POST /readings` | ReadingNewPage |
| `useReplaceMeter` | `POST /meters/:id/terminate` + `POST /meters/:id/assign` | MeterReplacePage |
| `useTerminateMeter` | `POST /meters/:meterId/terminate` | MeterTerminatePage |

### Hooks NOT used by any page

- `useBalances` (`GET /customers/:customerId/statement`) — exists in `use-balances.ts` but not imported anywhere in pages

---

## 5. Mock Data Fallback Analysis

| Mock Source | Size | Used By (pages) |
|-------------|------|-----------------|
| `mockProjects` | ~20 entries | 7 pages |
| `mockBuildings` | ~15 entries | 3 pages |
| `mockUnits` | ~20 entries | 4 pages |
| `mockCustomers` | ~20 entries | 7 pages |
| `mockMeters` | ~15 entries | 10 pages |
| `mockSimCards` | ~10 entries | 5 pages |
| `mockReadings` | ~20 entries | 3 pages |
| `mockInvoices` | ~10 entries | 4 pages |
| `mockPayments` | ~15 entries | 2 pages |
| `mockAlerts` | ~10 entries | 1 page |
| `mockTickets` | ~10 entries | 2 pages |
| `mockReports` | ~8 entries | 1 page |
| `mockUsers` | ~5 entries | 1 page |
| `mockKPIs` | ~6 entries | 1 page |
| `mockConsumptionData` | ~12 entries | 2 pages (Dashboard + Consumption) |
| `mockWaterBalanceData` | ~5 entries | 1 page |
| `mockBalances` | ~8 entries | 1 page |
| `mockRecentActivityData` | ~5 entries | 1 page |

---

## 6. Backend Controller Coverage

| Module | Controller | Routes | Status |
|--------|-----------|--------|--------|
| `auth/` | `AuthController` | `POST /auth/dev-login` | ✅ |
| `health/` | `HealthController` | `GET /health` | ✅ |
| `dashboard/` | `DashboardController` | Dashboard endpoints | ✅ |
| `projects/` | `ProjectsController` | `GET /projects`, `GET /projects/:id` | ✅ |
| `customers/` | `CustomersController` | `GET /projects/:projectId/customers` | ✅ |
| `meters/` | `MetersController` | `GET /meters`, `GET /meters/:id`, `PATCH /meters/:id/terminate` | ✅ |
| `readings/` | `ReadingsController` | `POST /readings`, `GET /readings/review-queue` | ✅ |
| `billing/` | `BillingController` | `POST /invoices/generate`, +2 stubs | ✅ stubs |
| `locations/` | `LocationsController` | Not checked | ⚠️ unknown |
| `sim-cards/` | Not found | — | ❌ |
| `water-balance/` | `WaterBalanceController` | Not checked | ⚠️ unknown |
| `reports/` | None (empty dir) | — | ❌ |
| `alerts/` | Not found | — | ❌ |
| `tickets/` | Not found | — | ❌ |
| `settings/` | Not found | — | ❌ |

---

## 7. Detailed Findings by Page

### LoginPage (`components/LoginPage.tsx`)
- **Data source**: `useAuthStore` (zustand store in `mock-auth.ts`)
- **API call**: `POST /auth/dev-login` with email/password
- **Fallback**: On API failure, returns mock token `mock-jwt-token-xxx`
- **Backend**: `AuthController` exists at `backend/src/auth/`
- **Verdict**: ✅ Works — API-first with mock fallback

### DashboardPage (`components/dashboard/DashboardPage.tsx`)
- **Hooks**: `useDashboardKpis()`, `useConsumptionTrend()`, `useRecentActivity()`
- **API calls**: `GET /dashboard/kpis`, `GET /dashboard/consumption-trend`, `GET /dashboard/recent-activity`
- **Fallback**: `mockKPIs ?? []`, `mockConsumptionData ?? []`, `mockRecentActivityData ?? []`
- **Flag**: None — always tries API
- **Verdict**: ⚠️ Partial — no feature flag control, but API + fallback pattern works

### ProjectsPage (`components/projects/ProjectsPage.tsx`)
- **Hook**: `useProjectsList()`
- **API call**: `GET /projects`
- **Fallback**: `apiProjects ?? mockProjects`
- **Flag**: `projects.list = 'mock'`
- **Verdict**: ⚠️ Flag set to mock; switching to 'api' should work

### ProjectDetailPage (`components/projects/ProjectDetailPage.tsx`)
- **Hook**: `useProjectDetail(id)`
- **API call**: `GET /projects/:id`
- **Fallback**: `apiProject ?? mockProjects.find(...)`
- **Sub-entities**: buildings, units, customers, meters, alerts, readings ALL use hardcoded mock data (`.filter(...)` on mock arrays)
- **Verdict**: ❌ Partially connected — detail endpoint is API-backed, but all sub-entities are mock-only

### LocationsPage (`components/projects/LocationsPage.tsx`)
- **Hooks**: `useProjectsList()`, `useLocationsList(projectId)`
- **API calls**: `GET /projects`, `GET /projects/:id/locations`
- **Fallback**: `apiProjects ?? mockProjects`; if no API data, `buildings = []`, `units = []`
- **Flag**: `locations.list = 'mock'`
- **Verdict**: ⚠️ Flag set to mock; API hook exists

### CustomersPage (`components/customers/CustomersPage.tsx`)
- **Hook**: `useCustomersList(projectId)`
- **API call**: `GET /projects/:projectId/customers`
- **Fallback**: `apiCustomers ?? mockCustomers`
- **Flag**: `customers.list = 'mock'`
- **Verdict**: ⚠️ Flag set to mock; API hook exists

### CustomerDetailPage (`components/customers/CustomerDetailPage.tsx`)
- **Hook**: Only `useProjectsList()` for project name lookup
- **Customer data**: `const customer = mockCustomers.find(...)` — **no API hook**
- **Invoices, meters, units**: All from `mockInvoices`, `mockMeters`, `mockUnits`
- **Flag**: None
- **Verdict**: ❌ **No API hook for customer detail** — hardcoded mock data exclusively

### MetersPage (`components/meters/MetersPage.tsx`)
- **Hook**: `useMetersList()`
- **API call**: `GET /meters`
- **Fallback**: `apiMeters ?? mockMeters`
- **Flag**: `meters.list = 'mock'`
- **Verdict**: ⚠️ Flag set to mock; API hook exists

### MeterDetailPage (`components/meters/MeterDetailPage.tsx`)
- **Hook**: `useMeterDetail(id)`
- **API call**: `GET /meters/:id`
- **Fallback**: `apiMeter ?? mockMeters.find(...)`
- **Sub-entities**: readings, sim cards, invoices ALL from mock data
- **Flag**: None
- **Verdict**: ⚠️ Detail endpoint is API-backed, but sub-entities are mock-only

### MeterAssignPage (`components/meters/MeterAssignPage.tsx`)
- **No API hooks** — no GET, no mutation
- **Data**: `mockProjects`, `mockBuildings`, `mockUnits`, `mockCustomers`, `mockMeters`, `mockSimCards`
- **Flag**: None
- **Verdict**: ❌ **100% hardcoded mock data** — no API integration at all

### MeterReplacePage (`components/meters/MeterReplacePage.tsx`)
- **Hooks**: `useMetersList()` for list, `useReplaceMeter()` for mutation
- **API calls**: `GET /meters` (list), `POST /meters/:oldMeterId/terminate` + `POST /meters/:newMeterId/assign` (mutation)
- **Fallback**: list uses `apiMeters ?? mockMeters`; customer/sim display from mocks
- **Flag**: None
- **Verdict**: ⚠️ Action posts to API; form data from mocks

### MeterTerminatePage (`components/meters/MeterTerminatePage.tsx`)
- **Hooks**: `useMetersList()` for list, `useTerminateMeter()` for mutation
- **API calls**: `GET /meters` (list), `POST /meters/:meterId/terminate` (mutation)
- **Fallback**: list uses `apiMeters ?? mockMeters`; customer/sim display from mocks
- **Flag**: None
- **Verdict**: ⚠️ Action posts to API; form data from mocks

### SimCardsPage (`components/sim-cards/SimCardsPage.tsx`)
- **Hook**: `useSimCardsList()`
- **API call**: `GET /sim-cards`
- **Fallback**: `apiSimCards ?? mockSimCards`
- **Flag**: `sims.list = 'mock'`
- **Verdict**: ⚠️ Flag set to mock; API hook exists

### ReadingsPage (`components/readings/ReadingsPage.tsx`)
- **Hook**: `useReadingsList(filters)`
- **API call**: `GET /readings`
- **Fallback**: `apiReadings ?? mockReadings`
- **Flag**: `projects.readings = 'mock'` (auto-forces `projects.list`)
- **Verdict**: ⚠️ Flag set to mock; API hook exists

### ReadingNewPage (`components/readings/ReadingNewPage.tsx`)
- **Hook**: `useCreateReading()` for mutation
- **API call**: `POST /readings` (mutation)
- **Form data**: `mockProjects`, `mockMeters`, `mockCustomers`, `mockUnits`, `mockReadings`
- **Flag**: None
- **Verdict**: ⚠️ Mutation posts to API; form dropdowns populated from mock data

### ConsumptionPage (`components/billing/ConsumptionPage.tsx`)
- **Hook**: `useConsumptionTrend()`
- **API call**: `GET /dashboard/consumption-trend`
- **Flag**: **`'consumption'` not defined** in FeatureFlags → `isFeatureEnabled('consumption')` always false → always uses `mockConsumptionData`
- **Fallback**: `mockConsumptionData`
- **Verdict**: ❌ **Broken feature flag** — missing key causes data to never be fetched from API

### WaterBalancePage (`components/billing/WaterBalancePage.tsx`)
- **Hook**: `useWaterBalance(projectId)`
- **API call**: `GET /projects/:projectId/water-balance`
- **Fallback**: `api || mockWaterBalanceData`
- **Flag**: None
- **Verdict**: ⚠️ No flag control; always tries API first

### InvoicesPage (`components/billing/InvoicesPage.tsx`)
- **Hook**: `useInvoicesList()`
- **API call**: `GET /invoices`
- **Flag**: `invoices.list = 'api'` ✅ — properly read and used
- **Fallback**: `mockInvoices` only when flag is `'mock'`
- **Verdict**: ✅ **Ready for API mode** — follows correct pattern

### InvoiceDetailPage (`components/billing/InvoiceDetailPage.tsx`)
- **Hook**: `useInvoiceDetail(id)`
- **API call**: `GET /invoices/:id`
- **Flag**: `invoices.list = 'api'` ✅ — inherited from same flag
- **Fallback**: `mockInvoice` only when flag is `'mock'`
- **Verdict**: ✅ **Ready for API mode**

### PaymentsPage (`components/billing/PaymentsPage.tsx`)
- **Hook**: `usePaymentsList()`
- **API call**: `GET /payments`
- **Flag**: `payments.list = 'api'` ✅ — properly read and used
- **Fallback**: `mockPayments` only when flag is `'mock'`
- **Verdict**: ✅ **Ready for API mode**

### BalancesPage (`components/billing/BalancesPage.tsx`)
- **Hook**: None
- **Flag**: `billing.list = 'api'` — read via `isFeatureEnabled`
- **Data when flag='api'**: `const [balances, setBalances] = useState([])` — **hardcoded empty array**
- **Data when flag='mock'**: `mockBalances`
- **Verdict**: ❌ **No API hook** — flag is 'api' but no hook fetches data; returns empty state

### ReportsPage (`components/reports/ReportsPage.tsx`)
- **Hook**: None
- **Data**: `mockReports` exclusively
- **Flag**: `reports.list = 'mock'`
- **Backend**: `reports/` directory exists but is empty (only `.gitkeep`)
- **Verdict**: ❌ **Mock only** — no backend controller, no API hook

### SettingsPage (`components/reports/SettingsPage.tsx`)
- **Hook**: None
- **Data**: Team table from `mockUsers`; all settings are local state
- **Flag**: Not in feature flags
- **Backend**: Not found
- **Verdict**: ❌ **100% mock/local data** — no API integration at all

### AlertsPage (`components/alerts/AlertsPage.tsx`)
- **Hook**: None
- **Data**: `mockAlerts` exclusively; acknowledge is local state
- **Flag**: `alerts.list = 'mock'`
- **Backend**: Not found
- **Verdict**: ❌ **Mock only** — no backend controller, no API hook

### TicketsPage (`components/tickets/TicketsPage.tsx`)
- **Hook**: None
- **Data**: `mockTickets` exclusively; status/priority changes are local state
- **Flag**: `tickets.list = 'mock'`
- **Backend**: Not found
- **Verdict**: ❌ **Mock only** — no backend controller, no API hook

### SupportPage (`components/tickets/SupportPage.tsx`)
- **Hook**: None
- **Data**: `mockCustomers`, `mockMeters`, `mockInvoices`, `mockPayments`, `mockTickets`
- **Flag**: Not in feature flags
- **Backend**: Not found
- **Verdict**: ❌ **100% mock** — no API integration at all

---

## 8. Blockers to Production API Readiness

### P0 — Must Fix

1. **ConsumptionPage: missing 'consumption' feature flag** — `isFeatureEnabled('consumption')` references a key not in `FeatureFlags`. Add `'consumption': 'mock'` to the record.

2. **BalancesPage: 'api' flag with no hook** — `billing.list = 'api'` but page renders empty. Create `useBalancesList` hook or connect existing `useBalances` hook.

3. **MeterAssignPage: no API hooks at all** — 100% hardcoded mock forms. Needs `useProjectsList`, `useBuildingsList`, `useUnitsList`, `useCustomersList`, `useMetersList`, `useSimCardsList`, and a `useAssignMeter` mutation.

### P1 — Should Fix

4. **CustomerDetailPage: missing customer detail hook** — Needs `useCustomerDetail(id)` hook.

5. **ReportsPage: no backend controller + no hook** — Backend `reports/` dir is empty. Needs controller + hook.

6. **AlertsPage: no backend controller + no hook** — Needs alerts controller + hook.

7. **TicketsPage: no backend controller + no hook** — Needs tickets controller + hook.

8. **SettingsPage: no backend controller + no hook** — Needs settings/users controller + hook.

9. **SupportPage: no backend controller + no hook** — Needs support/tickets controller + hook.

### P2 — Nice to Have

10. **Sub-entity mock data in detail pages** — After switching `projects.list` to 'api', ProjectDetailPage will still show mock buildings/units/customers/meters/alerts/readings. MeterDetailPage will show mock readings/SIM cards/invoices.

11. **ReadingNewPage form data from API** — Dropdowns for project, meter, customer, unit use mock data. Should use `useProjectsList`, `useMetersList`, `useCustomersList`, `useUnitsList`.

12. **No feature flag for DashboardPage, CustomerDetailPage, MeterDetailPage, MeterAssignPage, MeterReplacePage, MeterTerminatePage, ReadingNewPage, ConsumptionPage, WaterBalancePage, SettingsPage, SupportPage** — Can't control API/mock toggle without flags.

---

## 9. Recommendations

### Immediate (next sprint)

1. **Add `'consumption'` key** to `FeatureFlags` with default `'mock'`
2. **Create `useBalancesList` hook** or wire `useBalances` to `BalancesPage`
3. **Create `useCustomerDetail` hook** for CustomerDetailPage

### Short-term

4. **Add feature flags to all pages missing them** — at minimum: `dashboard`, `consumption`, `water-balance`, `settings`, `support`
5. **Replace hardcoded mock sub-entities** in ProjectDetailPage and MeterDetailPage with API hooks
6. **Build backend controllers** for reports, alerts, tickets, settings/support

### Medium-term

7. **Full MeterAssignPage API integration** — hooks for all dropdowns + assign mutation
8. **Full ReadingNewPage API integration** — hooks for form dropdowns
9. **Unused API resources cleanup** — retire `mockProjects`, `mockMeters`, etc. when all pages are API-backed

---

## 10. Files Referenced

| File | Purpose |
|------|---------|
| `Frontend/src/lib/feature-flags.ts` | Feature flag definitions |
| `Frontend/src/lib/api/client.ts` | API client (`apiGet`, `apiPost`) |
| `Frontend/src/lib/mock-data.ts` | All mock data arrays |
| `Frontend/src/lib/mock-auth.ts` | Auth store with dev-login |
| `Frontend/src/hooks/use-*.ts` | All 14 hooks (dashboard, projects, customers, meters, readings, invoices, payments, sim-cards, locations, water-balance, consumption, replace-meter, terminate-meter, balances) |
| `Frontend/src/components/*/` | All 25 page components |
| `backend/src/*/*.controller.ts` | Backend controllers |
| `backend/src/reports/` | Empty reports module |
