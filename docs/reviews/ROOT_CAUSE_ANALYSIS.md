# ROOT CAUSE ANALYSIS — Real Operational Gaps

**Date:** 2026-08-02 · **Method:** 5-Why per failure · **Result:** 5 root causes, all fixed + verified in browser.

## Failure 1: "Cannot create users / Add buttons missing" (Users page)
- Why? User lands on settings page, not CRUD page.
- Why? Admin nav points to `users-permissions` (settings-only page).
- Why? Working `admin/users` CRUD page existed but was orphaned from navigation.
- **ROOT CAUSE A: Navigation/CRUD wiring gap** — `ALL_NAV_ITEMS` in `AdminLayout.tsx` targeted settings pages, not the GenericAdminPage CRUD pages.

## Failure 2: "No data appears / system appears read-only" (all pages)
- Why? Every admin BFF returned `{entries:[],total:0}`.
- Why? BFF handlers pass `/admin/users` to `apiBackend()`.
- Why? `apiBackend()` fetches `:3002${path}` directly (no `/api` prefix) → 404 → caught → empty fallback.
- **ROOT CAUSE B: BFF→backend path mismatch** in `src/lib/api-client.ts` + ~30 route handlers.

## Failure 3: "Add Customer / Add Meter / Add Invoice / Add Payment missing"
- Why? Page renders charts dashboard, not the list.
- Why? Page defaults to `tab === "dashboard"`.
- Why? Default tab set to `"dashboard"` when the page was built analytics-first.
- **ROOT CAUSE C: Dashboard-first default** in `customers/meters/invoices/payments/page.tsx`.

## Failure 4: Invoices/Payments page blank after list fix (no Add, no data)
- Why? Table area empty, ErrorBoundary message "Objects are not valid as a React child (object {id, name})".
- Why? Backend `/api/invoices` returns `customer: {id, name}` (object); config transform used `inv.customer` directly.
- Why? Cell rendered object as text → React crash → ErrorBoundary → blank.
- **ROOT CAUSE E: Object-as-React-child** in `configs/billing.ts` invoices+payments transforms.

## Failure 5: Console hydration warning "button <button>"
- Why? A `<button>` is nested inside a `<button>` somewhere (React DOM constraint).
- Non-blocking; journey functioned. Logged as remaining gap (not root of operational failure).

## Files Responsible
- `Frontend/src/admin/layout/AdminLayout.tsx` — RC-A (nav)
- `Frontend/src/app/admin/page.tsx` — RC-A (page map)
- `Frontend/src/lib/api-client.ts` — RC-B (apiBackend path)
- `Frontend/src/app/api/admin/*/route.ts` (~30 handlers) — RC-B
- `Frontend/src/app/admin/{customers,meters,invoices,payments}/page.tsx` — RC-C (default tab)
- `Frontend/src/admin/tables/configs/billing.ts` — RC-E (object customer)

## Fix Summary (all small + verified)
| RC | Fix | Verified |
|---|---|---|
| A | Rewired nav → CRUD pages; added pages to page map | tsc 0; browser nav works |
| B | `apiBackend` normalizes `/api` prefix | BFF returns real data (200) |
| C | Default tab `"list"` on 4 pages | Add button visible in browser |
| E | Transform extracts `.name` from customer object | Invoices/Payments Add+data in browser |

## Verification (Phase 9)
Full exam: **292 unit + 56 contract + 31 integration + tsc 0 + vitest 44**. Browser journey: all 9 pages Add+data; Customer create → **POST 201 → persisted**.
