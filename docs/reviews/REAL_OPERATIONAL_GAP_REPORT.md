# REAL Operational Gap Report — Forensic Audit

**Date:** 2026-08-02 · **Verdict:** Real user-experience gaps existed; root causes identified and fixed; system now genuinely operational via UI.

## Summary
The prior Active System Certification validated backend/API/DB but the **real UI** had critical usability failures (read-only appearance). This audit reproduced them in a real browser and found **5 root causes**, all fixed.

## Phase 1 — Discover Real Application
- **Frontend:** `D:\meter\Frontend` — Next.js dev server on `:7400` (dev build, SPA)
- **Backend:** `D:\meter\backend` — Express/Prisma on `:3002`
- **Env:** `NEXT_PUBLIC_API_URL=http://localhost:3002`, DB `postgresql://meter_pulse:...@localhost:5432/meter_pulse`
- **Which UI:** New SPA admin (SystemLayout + GenericAdminPage), not legacy.

## Phase 2 — Real User Journey (Playwright, real admin JWT)
Before fixes: Users/Customers/Projects/Meters had no Add button, no data. After fixes, **all 9 core pages show Add button + live data rows**, and the full create workflow (Customers) produced **HTTP 201 + persisted row**.

| Page | Add button | Rows | Notes |
|---|---|---|---|
| Users | ✅ | 7 | |
| Customers | ✅ | 25 | |
| Meters | ✅ | 25 | |
| Projects | ✅ | 21 | |
| Areas | ✅ | 1 | |
| Readings | ✅ | 25 | |
| Tariffs | ✅ | 25 | |
| Invoices | ✅ | 25 | |
| Payments | ✅ | 25 | |

## Phase 3 — Frontend Permission Audit
No permission mismatch found. `GenericAdminPage` renders Add/Edit/Delete unconditionally (no RBAC gate on buttons). The gap was **navigation + rendering**, not permissions.

## Phase 4 — API vs UI Gap Analysis
- Create User: Backend exists (`POST /api/admin/users`), BFF existed but hit wrong backend path → fixed.
- Create Customer: Backend exists, UI render crashed on object cell → fixed.
- Result: B) Frontend missing/wrong-path (not backend).

## Phase 5 — Database Reality Check
Users/roles/customers/meters/invoices/payments populated (seeded + operational data). Verified live via BFF after fix.

## Phase 6 — Root Causes (5)
1. **RC-A — Nav wiring gap:** Admin nav pointed to settings pages (`users-permissions`, `customer-settings`...); working CRUD pages (`users`, `customers`, `meters`...) orphaned.
2. **RC-B — BFF wrong path:** `apiBackend()` hit `:3002/admin/...` instead of `:3002/api/admin/...` → every admin page returned empty `entries:[]` → read-only look.
3. **RC-C — Dashboard-first default:** Customers/Meters/Invoices/Payments defaulted to analytics tab; operational list (with Add) hidden behind a click.
4. **RC-D — Hydration error:** `<button>` in `<button>` → React hydration failure (non-blocking, logged).
5. **RC-E — Object-as-React-child crash:** Backend returns `customer: {id, name}` (object); config transform passed the object to a cell → ErrorBoundary → blank page, no Add.

## Phase 7-9 — Fix Plan (P0) & Implementation
Implemented small, tested fixes (see ROOT_CAUSE_ANALYSIS.md). Full exam passed.

## Phase 10 — Certification
See `REAL_OPERATIONAL_CERTIFICATION_REPORT.md` — **PASS** (human-admin operable via UI, not just API).

## Evidence
Screenshots in `docs/screenshots/` (admin users page, create form). Browser + BFF + DB verification all documented.
