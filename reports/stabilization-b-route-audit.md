# Phase B — Frontend Route Audit Report

**Date**: 2026-06-18
**Project**: Meter Verse (Meter/Frontend)
**Stack**: Next.js 16 + React 19 (SPA-style client-side routing)

---

## 1. Architecture Summary

This frontend uses a **hybrid SPA approach**:

- Next.js App Router serves only the root shell (`/` → `page.tsx` → `AppShell`)
- All actual navigation is **client-side virtual routing** via a Zustand store (`router-store.ts`)
- The sidebar is rendered conditionally based on a mock auth store (`mock-auth.ts`)
- **No Next.js App Router pages exist** for any sidebar route (dashboard, projects, etc.)

---

## 2. Sidebar Items (Complete Menu Tree)

**Source**: `src/lib/navigation.ts` — `allNavItems[]`
**Render**: `src/components/layout/AppSidebar.tsx` — `AppSidebar` component

| # | Title | href | Icon | Children |
|---|-------|------|------|----------|
| 1 | Dashboard | `/dashboard` | LayoutDashboard | — |
| 2 | Projects | `/projects` | Building2 | — |
| 3 | Locations | `/locations` | MapPin | — |
| 4 | Customers | `/customers` | Users | — |
| 5 | Meters | `/meters` | Gauge | 4 children |
| 5a | All Meters | `/meters` | List | — |
| 5b | Assign Meter | `/meters/assign` | Link | — |
| 5c | Replace Meter | `/meters/replace` | RefreshCw | — |
| 5d | Terminate Meter | `/meters/terminate` | XCircle | — |
| 6 | SIM Cards | `/sim-cards` | Wifi | — |
| 7 | Readings | `/readings` | FileText | 2 children |
| 7a | All Readings | `/readings` | List | — |
| 7b | New Reading | `/readings/new` | PlusCircle | — |
| 8 | Consumption | `/consumption` | Activity | — |
| 9 | Water Balance | `/water-balance` | Droplets | — |
| 10 | Invoices | `/invoices` | Receipt | — |
| 11 | Payments | `/payments` | Banknote | — |
| 12 | Balances | `/balances` | Scale | — |
| 13 | Reports | `/reports` | BarChart3 | — |
| 14 | Alerts | `/alerts` | Bell | — |
| 15 | Tickets | `/tickets` | MessageSquare | — |
| 16 | Support | `/support` | Headphones | — |
| 17 | Settings | `/settings` | Settings | — |

**Total**: 17 top-level items + 6 child items = **23 menu entries** in the navigation tree.

---

## 3. App Router Pages (Next.js File-Based Routes)

**Source**: `src/app/` directory

| Path | File | Purpose |
|------|------|---------|
| `/` | `src/app/page.tsx` | Root shell — renders `<AppShell />` |
| `/api` | `src/app/api/route.ts` | Health/hello endpoint |

**Only 2 App Router files exist.** All sidebar routes are virtual SPA pages.

---

## 4. Layout Registration Details

**Source**: `src/app/layout.tsx` (RootLayout)

```
<html dir="rtl" className="dark">
  <body>
    <ThemeProvider>
      <QueryProvider>
        <LocaleLayout>
          {children}    ←  renders AppShell from page.tsx
        </LocaleLayout>
        <Toaster />
      </QueryProvider>
    </ThemeProvider>
  </body>
</html>
```

Key observations:
- **No sidebar registered in root layout** — Sidebar is inside `AppShell`, client-side only
- **No Next.js middleware** (`src/middleware.ts` does not exist)
- **No server-side auth guard** in layout
- RTL layout (`dir="rtl"`, `lang="ar"`) — Arabic-first design

---

## 5. Client-Side Virtual Router (Zustand)

### Router Store (`src/lib/router-store.ts`)
- **26 PageKeys** defined: login, dashboard, projects, project-detail, locations, customers, customer-detail, meters, meter-detail, meter-assign, meter-replace, meter-terminate, sim-cards, readings, reading-new, consumption, water-balance, invoices, invoice-detail, payments, balances, reports, alerts, tickets, support, settings
- `navigate(pageKey, params)` — pushes current page to history, sets new page
- `goBack()` — pops history stack

### href → PageKey Mapping (`src/components/layout/AppSidebar.tsx` — `hrefToPageKey`)
Maps 21 sidebar hrefs to PageKeys. All are fully mapped.

### PageKey → href Mapping (`src/components/layout/AppSidebar.tsx` — `pageKeyToHref`)
Maps 26 PageKeys back to hrefs for active state detection.

---

## 6. Page Rendering (AppShell `renderPage()`)

**Source**: `src/components/layout/AppShell.tsx` — `renderPage()` switch statement

| PageKey | Component | File |
|---------|-----------|------|
| login | LoginPage | `layout/LoginPage.tsx` |
| dashboard | DashboardPage | `dashboard/DashboardPage.tsx` |
| projects | ProjectsPage | `projects/ProjectsPage.tsx` |
| project-detail | ProjectDetailPage | `projects/ProjectDetailPage.tsx` |
| locations | LocationsPage | `projects/LocationsPage.tsx` |
| customers | CustomersPage | `customers/CustomersPage.tsx` |
| customer-detail | CustomerDetailPage | `customers/CustomerDetailPage.tsx` |
| meters | MetersPage | `meters/MetersPage.tsx` |
| meter-detail | MeterDetailPage | `meters/MeterDetailPage.tsx` |
| meter-assign | MeterAssignPage | `meters/MeterAssignPage.tsx` |
| meter-replace | MeterReplacePage | `meters/MeterReplacePage.tsx` |
| meter-terminate | MeterTerminatePage | `meters/MeterTerminatePage.tsx` |
| sim-cards | SimCardsPage | `sim-cards/SimCardsPage.tsx` |
| readings | ReadingsPage | `readings/ReadingsPage.tsx` |
| reading-new | ReadingNewPage | `readings/ReadingNewPage.tsx` |
| consumption | ConsumptionPage | `billing/ConsumptionPage.tsx` |
| water-balance | WaterBalancePage | `billing/WaterBalancePage.tsx` |
| invoices | InvoicesPage | `billing/InvoicesPage.tsx` |
| invoice-detail | InvoiceDetailPage | `billing/InvoiceDetailPage.tsx` |
| payments | PaymentsPage | `billing/PaymentsPage.tsx` |
| balances | BalancesPage | `billing/BalancesPage.tsx` |
| reports | ReportsPage | `reports/ReportsPage.tsx` |
| alerts | AlertsPage | `alerts/AlertsPage.tsx` |
| tickets | TicketsPage | `tickets/TicketsPage.tsx` |
| support | SupportPage | `tickets/SupportPage.tsx` |
| settings | SettingsPage | `reports/SettingsPage.tsx` |
| *(default)* | DefaultNotFound | inline 404 |

**Total**: 26 switch cases + 1 default.

---

## 7. Navigation Tree Structure

```
AppShell
├── LoginPage          (unauthenticated)
└── [Authenticated]
    ├── TopNav
    │   ├── Logo + Brand
    │   ├── Search bar
    │   ├── RoleSwitcher
    │   ├── Notifications bell
    │   ├── Theme toggle
    │   ├── Language toggle
    │   └── User dropdown (profile, role, logout)
    ├── AppSidebar
    │   ├── Collapse toggle
    │   ├── SidebarItem × N (filtered by role)
    │   │   ├── Dashboard
    │   │   ├── Projects
    │   │   ├── Locations
    │   │   ├── Customers
    │   │   ├── Meters (expandable: All, Assign, Replace, Terminate)
    │   │   ├── SIM Cards
    │   │   ├── Readings (expandable: All Readings, New Reading)
    │   │   ├── Consumption
    │   │   ├── Water Balance
    │   │   ├── Invoices
    │   │   ├── Payments
    │   │   ├── Balances
    │   │   ├── Reports
    │   │   ├── Alerts
    │   │   ├── Tickets
    │   │   ├── Support
    │   │   └── Settings
    │   └── User avatar + role badge
    └── <main> (page content from renderPage)
```

---

## 8. Missing Routes Analysis

**Sidebar items without corresponding App Router pages:**
All 21 sidebar routes have no App Router page:
- `/dashboard`, `/projects`, `/locations`, `/customers`,
- `/meters`, `/meters/assign`, `/meters/replace`, `/meters/terminate`,
- `/sim-cards`, `/readings`, `/readings/new`,
- `/consumption`, `/water-balance`,
- `/invoices`, `/payments`, `/balances`,
- `/reports`, `/alerts`, `/tickets`, `/support`, `/settings`

**Impact**: Initial page load at any of these URLs returns 404 (Next.js SSR). Navigation only works after the SPA has booted via `/`.

**Reality**: This is the intended architecture — a client-side SPA shell. However, it means:
- Direct URL access / bookmarking / browser refresh on any sub-page will fail
- SEO is non-existent for all sub-pages
- No server-side rendering for any content page

---

## 9. Dead Routes Analysis (Clientside)

**Client-side PageKeys that exist in AppShell but have no dedicated sidebar entry:**

| PageKey | Reason |
|---------|--------|
| `project-detail` | Child of Projects, navigated from Project list |
| `customer-detail` | Child of Customers, navigated from Customer list |
| `meter-detail` | Child of Meters, navigated from Meter list |
| `invoice-detail` | Child of Invoices, navigated from Invoice list |

These are intentional — they are detail pages accessed via data-table row clicks, not sidebar entries.

---

## 10. Orphan Components

**Components imported by no route / dead code:**

| Component | File | Status |
|-----------|------|--------|
| `PagePlaceholder` | `layout/PagePlaceholder.tsx` | **Defined but never imported** — zero usages across codebase |

No other orphan page components found. All 27 page-level components in `src/components/` are consumed by `AppShell.renderPage()`.

---

## 11. Protected Routes Analysis

### Client-Side Auth (frontend only)
1. **Gate**: `AppShell.tsx:84` — `if (!isAuthenticated) return <LoginPage />`
2. **Store**: `src/lib/mock-auth.ts` — Zustand store with `isAuthenticated` boolean
3. **Login flow**: Click "Sign In" → fetches dev-login API → sets `isAuthenticated: true` → navigates to dashboard
4. **Logout**: `logout()` → clears token, sets `user: null, isAuthenticated: false`

### Role-Based Access Control
5. **Navigation filtering**: `getNavItemsForRole(role)` filters sidebar items per user role
6. **7 roles**: super_admin, project_admin, operator, technician, finance, support, customer
7. **Permission model**: RolePermissions maps each role to allowed hrefs with wildcard support (e.g. `meters/*`)
8. **No in-page guards**: Page components are NOT wrapped with role guards — role-based blocking only hides sidebar items; a user could theoretically navigate to a non-permitted page via direct URL manipulation in the console

### Server-Side Auth (missing)
| Mechanism | Present? | Notes |
|-----------|----------|-------|
| Next.js middleware.ts | ❌ | Does not exist |
| Layout auth wrapper | ❌ | Root layout has no auth |
| API route auth | ❌ | `/api/route.ts` returns public hello |
| Page-level guard HOC | ❌ | No such pattern |
| Cookie/session validation | ❌ | JWT token stored but never validated server-side |

### Risk
- All page components are bundled and accessible client-side regardless of role
- Only the sidebar hides unauthorized pages; the `renderPage()` switch has no role checks
- A user could call `usePageStore.getState().navigate('settings')` to access Settings even if their role doesn't permit it

---

## 12. Route Mismatch Summary Table

| Sidebar Item (href) | App Router Page | SPA PageKey | renderPage() | Status |
|---------------------|-----------------|-------------|--------------|--------|
| `/dashboard` | ❌ Not found | ✅ dashboard | ✅ DashboardPage | ✅ |
| `/projects` | ❌ Not found | ✅ projects | ✅ ProjectsPage | ✅ |
| `/locations` | ❌ Not found | ✅ locations | ✅ LocationsPage | ✅ |
| `/customers` | ❌ Not found | ✅ customers | ✅ CustomersPage | ✅ |
| `/meters` | ❌ Not found | ✅ meters | ✅ MetersPage | ✅ |
| `/meters/assign` | ❌ Not found | ✅ meter-assign | ✅ MeterAssignPage | ✅ |
| `/meters/replace` | ❌ Not found | ✅ meter-replace | ✅ MeterReplacePage | ✅ |
| `/meters/terminate` | ❌ Not found | ✅ meter-terminate | ✅ MeterTerminatePage | ✅ |
| `/sim-cards` | ❌ Not found | ✅ sim-cards | ✅ SimCardsPage | ✅ |
| `/readings` | ❌ Not found | ✅ readings | ✅ ReadingsPage | ✅ |
| `/readings/new` | ❌ Not found | ✅ reading-new | ✅ ReadingNewPage | ✅ |
| `/consumption` | ❌ Not found | ✅ consumption | ✅ ConsumptionPage | ✅ |
| `/water-balance` | ❌ Not found | ✅ water-balance | ✅ WaterBalancePage | ✅ |
| `/invoices` | ❌ Not found | ✅ invoices | ✅ InvoicesPage | ✅ |
| `/payments` | ❌ Not found | ✅ payments | ✅ PaymentsPage | ✅ |
| `/balances` | ❌ Not found | ✅ balances | ✅ BalancesPage | ✅ |
| `/reports` | ❌ Not found | ✅ reports | ✅ ReportsPage | ✅ |
| `/alerts` | ❌ Not found | ✅ alerts | ✅ AlertsPage | ✅ |
| `/tickets` | ❌ Not found | ✅ tickets | ✅ TicketsPage | ✅ |
| `/support` | ❌ Not found | ✅ support | ✅ SupportPage | ✅ |
| `/settings` | ❌ Not found | ✅ settings | ✅ SettingsPage | ✅ |

---

## 13. Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/navigation.ts` | NavItem definitions, role permissions, page titles |
| `src/lib/router-store.ts` | Zustand store: currentPage, navigate(), goBack() |
| `src/lib/types.ts` | NavItem, RolePermissions, UserRole types |
| `src/lib/mock-auth.ts` | Auth store: login, logout, switchRole |
| `src/components/layout/AppSidebar.tsx` | Sidebar render: icon map, href↔PageKey maps, role-filtered nav |
| `src/components/layout/AppShell.tsx` | App shell: auth gate, sidebar + topnav, renderPage() switch |
| `src/components/layout/TopNav.tsx` | Top navigation bar |
| `src/app/layout.tsx` | Root layout: providers only, no sidebar |
| `src/app/page.tsx` | Root page: renders AppShell |

---

## 14. Findings Summary

| Finding | Count | Severity |
|---------|-------|----------|
| App Router pages for sidebar routes | 0 of 21 | ❌ High |
| SPA page components fully mapped | 26 of 26 | ✅ Good |
| Sidebar ↔ SPA page mismatch | 0 | ✅ Good |
| Orphan page components | 1 (PagePlaceholder) | ⚠️ Low |
| Incomplete i18n keys for sidebar | 14 of 17 sidebar items have t-keys; 3 child items use meter.assign/replace/terminate.title | ⚠️ Low |
| Server-side middleware auth | 0 | ❌ High |
| Client-side auth gate | ✅ Present in AppShell | ✅ Good |
| Role-based sidebar filtering | ✅ Present | ✅ Good |
| In-page role guards | 0 | ⚠️ Medium |
| Direct URL / bookmark support | ❌ None — all sub-routes are 404 on SSR | ❌ High |

## 15. Recommendations

1. **Convert to real Next.js App Router pages** or keep as SPA but add catch-all route (`app/[[...slug]]/page.tsx`) to handle direct URL access
2. **Add server-side middleware** for auth protection at the Next.js edge
3. **Add in-page role guards** to prevent unauthorized access via console/URL manipulation
4. **Remove orphan `PagePlaceholder`** or integrate it into unused page components
5. **Ensure SSR-compatible routing** for SEO and bookmarkability if prioritizing public-facing features
