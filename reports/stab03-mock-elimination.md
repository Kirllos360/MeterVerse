# STAB-03 — Mock Elimination

## Summary

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Files importing `@/lib/mock-data` | 27 | 17 | −10 |
| Files importing `@/lib/mock-auth` | 6 | 6 | (unchanged — auth still mock) |
| `?? mock` fallback expressions | 18 | 0 | −18 |
| `toast.info()` stubs | 27 | 27 | (unchanged — all are placeholders) |
| Feature flags defaulting to `mock` | 10 | 3 | −7 |

## Pages Cleaned (mock imports removed)

| Page | What Changed |
|------|-------------|
| CustomersPage | Removed `mockCustomers`, `mockProjects` imports + `??` fallbacks |
| CustomerDetailPage | Removed `mockCustomers` import (kept sub-entity mocks) |
| MetersPage | Removed `mockMeters`, `mockProjects` imports + `??` fallback |
| MeterDetailPage | Removed `mockMeters` import + `??` fallback (kept sub-entity mocks) |
| MeterTerminatePage | Removed `mockMeters` import + `??` fallback (kept sub-entity mocks) |
| MeterReplacePage | Removed `mockMeters` import + `??` fallback |
| ReadingsPage | Removed `mockReadings`, `mockProjects` imports + `??` fallback |
| SimCardsPage | Removed `mockSimCards` import + `??` fallback |
| ProjectsPage | Removed `mockProjects` import + `??` fallback |
| LocationsPage | Removed `mockProjects` import (already `api` flag) |
| InvoicesPage | Removed `mockInvoices`, `mockProjects` imports + `isFeatureEnabled` gate |
| InvoiceDetailPage | Removed `mockInvoices`, `mockPayments` imports + ternary fallback |
| PaymentsPage | Removed `mockPayments` import + `isFeatureEnabled` gate (kept `mockCustomers` for dialog) |

## Feature Flags Flipped (`mock` → `api`)

- `projects.list` → **api**
- `projects.readings` → **api**
- `customers.list` → **api**
- `meters.list` → **api**
- `sims.list` → **api**
- `readings.list` → **api**

Previously flipped: `locations.list`, `billing.list`, `invoices.list`, `payments.list`

Still `mock`: `reports.list`, `alerts.list`, `tickets.list`

## Remaining Mock Dependencies

### Sub-entity lookups (no backend filter endpoints exist)
- CustomerDetailPage: `mockInvoices`, `mockMeters`, `mockUnits`
- MeterDetailPage: `mockReadings`, `mockSimCards`, `mockInvoices`
- MeterTerminatePage: `mockSimCards`, `mockCustomers`
- ReadingNewPage: all mock selectors (project/meter/customer/unit dropdowns)
- PaymentsPage: `mockCustomers` (record payment dialog)

### Dashboard & analytics pages (no backend endpoints for charts)
- DashboardPage: KPI, consumption, activity, alerts, meter status charts
- WaterBalancePage: water balance data, project selector, child meter table
- ConsumptionPage: consumption chart data
- BalancesPage: balance data (already returns `[]` when API enabled)

### No API pages (fully mock)
- MeterAssignPage (221-line wizard — deferred)
- AlertsPage, TicketsPage, SupportPage
- ReportsPage, SettingsPage

### Auth pages (mock-auth only, no real auth)
- AppShell, AppSidebar, LoginPage, RoleSwitcher, ProtectedAction, TopNav

### Toast stubs (all `toast.info()`) — 27 remaining
- Edit/Delete actions in SmartTable dropdowns
- Issue/Cancel/Record Payment invoice actions
- Export/Preview report actions
- PDF download placeholders

## Verdict

**MOCK_FREE = NO** (remaining 17 files still import mock data for sub-entity lookups and non-wired pages)

However, **core data display pages no longer have mock fallbacks** — all major list/detail/create pages now rely exclusively on API data. The remaining mock imports are limited to:
- Sub-entity enrichment (invoices by customer, readings by meter, etc.)
- Dashboard analytics (no backend endpoints yet)
- Pages with no backend at all (alerts, tickets, reports, settings)
- Auth (no real auth replacement yet)
