# Active System Implementation Plan

**Date:** 2026-08-01 · Objective: make MeterVerse a running operational system.

## Priority

### P0 — Critical (this phase)
1. ✅ Authentication + 5 role users (System Admin, Ops Manager, Billing, Support, Portal) — verified
2. ✅ RBAC enforcement — verified (billing 403 on admin/users, audit recorded)
3. **Operational seed dataset** (customers 20+, meters 50+, connections 30+, readings 100+, invoices 50+, payments 20+) — pending
4. ✅ Dashboard KPIs — live
5. ✅ Core CRUD — live
6. ✅ API stability — 570+ endpoints, 292 tests

### P1 — Post-activation
- Dashboard consolidation (admin/home vs dashboard/overview)
- Notifications wiring (C25 hub → real delivery)
- Reports polish (Jasper templates)

### P2 — Future
- SMS real delivery (Twilio)
- Advanced analytics / AI prediction (C17/C18)
- Settlement/wallet/gas (Mete extraction)

## Execution Order
1. Write `seed-operational.mjs` (idempotent, realistic MeterVerse data)
2. Run seed → verify DB counts
3. Verify full business flow (customer→meter→reading→invoice→payment→audit) with seeded data
4. Full exam (292 unit, 56 contract, 31 integration, tsc, vitest)
5. Certify + commit + push

## Not implemented in P0 (documented)
- SMS real delivery (needs Twilio creds — non-blocking)
- Dashboard consolidation (P1)
- Advanced AI (P2)
