# 02 — Route Map

**Date:** 2026-07-11
**Mode:** Read-Only Audit
**Scope:** All Next.js App Router routes with component mapping

---

## Route Table

| Route | V1/V2 | Page Component | Data Source | Backend Ready? | Status | Duplicate Of | Notes |
|-------|-------|----------------|-------------|----------------|--------|--------------|-------|
| `/` | V1 | `RootLayout` → dashboard | Mock | Partial | WORKING | — | Landing page, informational |
| `/collections` | V1 | `CollectionDashboard` | Mock (hooks-financial) | No | MOCK_ONLY | `/v2/dashboard` (partial) | Aging buckets, collector performance |
| `/customers` | V1 | `CustomerExplorer` | Mock (hooks.ts) | Yes | MOCK_ONLY | `/v2/customers` | Searchable customer list |
| `/customers/[id]` | V1 | `CustomerWorkspace` | Mock (hooks-customers.ts) | Yes | MOCK_ONLY | `/v2/customers/[id]` | Full customer workspace |
| `/financial` | V1 | `FinancialDashboard` | Mock (hooks-financial) | Partial | MOCK_ONLY | `/v2/dashboard` | Revenue, collections, aging |
| `/invoices` | V1 | `InvoiceExplorer` | Mock (hooks-financial) | Yes | MOCK_ONLY | `/v2/invoices` | Invoice list |
| `/invoices/[id]` | V1 | `InvoiceWorkspace` | Mock | Yes | MOCK_ONLY | `/v2/invoices/[id]` | Invoice detail |
| `/meters` | V1 | `MeterExplorer` | Mock (hooks.ts) | Yes | MOCK_ONLY | `/v2/meters` | Meter inventory |
| `/meters/[id]` | V1 | `MeterDetail` | Mock | Yes | MOCK_ONLY | `/v2/meters/[id]` | Meter detail |
| `/payments` | V1 | `PaymentExplorer` | Mock (hooks-financial) | Yes | MOCK_ONLY | `/v2/payments` | Payment list |
| `/payments/[id]` | V1 | `PaymentWorkspace` | Mock | Yes | MOCK_ONLY | `/v2/payments/[id]` | Payment detail |
| `/readings` | V1 | `ReadingExplorer` | Mock (hooks.ts) | Yes | MOCK_ONLY | `/v2/readings` | Reading list |
| `/showcase` | V1 | Component showcase | N/A | N/A | WORKING | `/v2/design-system` | Design system demo |
| `/tariffs` | V1 | `TariffStudio` | Mock (hooks-financial) | Yes | MOCK_ONLY | — | Tariff management |
| `/units` | V1 | `UnitExplorer` | Mock (hooks.ts) | Yes | MOCK_ONLY | — | Property unit explorer |
| `/v2` | V2 | `GlobalShell` | V2 repos + mocks | Partial | WORKING | `/` | V2 app root |
| `/v2/customers` | V2 | `GlobalShell` + entities | V2 repos + mocks | Partial | WORKING | `/customers` | V2 customer list |
| `/v2/customers/[id]` | V2 | `GlobalShell` + entities | V2 repos + mocks | Partial | WORKING | `/customers/[id]` | V2 customer detail |
| `/v2/invoices` | V2 | `GlobalShell` + entities | V2 repos + mocks | Partial | WORKING | `/invoices` | V2 invoice list |
| `/v2/invoices/[id]` | V2 | `GlobalShell` + InvoiceCommandCenter | V2 repos + mocks | Partial | WORKING | `/invoices/[id]` | V2 invoice detail (602L) |
| `/v2/meters` | V2 | `GlobalShell` + entities | V2 repos + mocks | Partial | WORKING | `/meters` | V2 meter list |
| `/v2/meters/[id]` | V2 | `GlobalShell` + MeterWorkspace | V2 repos + mocks | Partial | WORKING | `/meters/[id]` | V2 meter detail (163L) |
| `/v2/payments` | V2 | `GlobalShell` + entities | V2 repos + mocks | Partial | WORKING | `/payments` | V2 payment list |
| `/v2/readings` | V2 | `GlobalShell` + entities | V2 repos + mocks | Partial | WORKING | `/readings` | V2 reading list |
| `/v2/settings` | V2 | `GlobalShell` | V2 repos + mocks | No | PLACEHOLDER | — | Customer entity fallback |
| `/v2/enterprise` | V2 | `GlobalShell` + EnterpriseAdminCenter | EnterpriseRepo (mock) | No | MOCK_ONLY | — | 19-module admin OS |
| `/v2/design-system` | V2 | V2 Component Catalog | N/A | N/A | WORKING | `/showcase` | V2 design system demo |

---

## Duplicate Route Pairs

| Domain | V1 Route | V2 Route | Recommended Action |
|--------|----------|----------|-------------------|
| Customers List | `/customers` | `/v2/customers` | Keep both during migration, archive V1 when V2 reaches parity |
| Customer Detail | `/customers/[id]` | `/v2/customers/[id]` | Keep both, migrate when V2 CustomerWorkspace is complete |
| Invoices List | `/invoices` | `/v2/invoices` | Keep both, V2 `InvoiceCommandCenter` is more feature-rich (602L) |
| Invoice Detail | `/invoices/[id]` | `/v2/invoices/[id]` | V2 wins — more sections (ledger, approvals, workflow, chart) |
| Meters List | `/meters` | `/v2/meters` | Keep both |
| Meter Detail | `/meters/[id]` | `/v2/meters/[id]` | Keep both |
| Payments List | `/payments` | `/v2/payments` | Keep both |
| Payment Detail | `/payments/[id]` | `/v2/payments/[id]` | V2 wins — 610L, more comprehensive |
| Readings List | `/readings` | `/v2/readings` | Keep both |
| Showcase | `/showcase` | `/v2/design-system` | Both should stay as independent catalogs |
| Dashboard | `/` | `/v2` (GlobalShell) | `/v2` is the primary. V1 `/` is informational landing |

---

## Route Status Summary

| Status | Count | Routes |
|--------|-------|--------|
| WORKING | 5 | `/`, `/showcase`, `/v2`, `/v2/design-system`, `/v2/settings` (placeholder) |
| MOCK_ONLY | 15 | All V1 domain routes + `/v2/enterprise` |
| PARTIAL | 10 | All V2 domain routes (have mocks but no real API) |
| PLACEHOLDER | 3 | `/auth/login`, `/auth/forgot-password`, `/auth/reset-password` |

---

## Routing Architecture Issues

1. **No loading/error boundaries** — zero `loading.tsx` or `error.tsx` files exist under `src/app/`
2. **V2 routes all use `GlobalShell`** — entity type is selected via `useEffect` in each page
3. **Settings route is misconfigured** — selects "customer" entity as fallback, not "settings"
4. **V1-V2 dual maintenance** — 10 routes duplicated across V1 and V2 with different component implementations
5. **Auth routes are empty** — no login/forgot-password/reset-password pages exist despite backend having full auth
