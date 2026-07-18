# G013-A — Task Status Correction

**Date:** 2026-06-17
**Status:** CORRECTIONS CERTIFIED
**Action:** Apply to tasks.md

---

## Status Change Summary

| Task | Previous Status | New Status | Evidence Source |
|------|---------------|------------|----------------|
| T066 | [ ] | [X] Complete | `backend/src/payments/payments.controller.ts:34-44` — `@Post(':id/reverse')` gated by `@Roles(Role.SUPER_ADMIN)` with `@Audit('payment', 'reverse')` decorator. `backend/src/payments/payments.service.ts:51-100` — full transaction implementation: reverses allocations, updates invoice remaining amounts, appends ledger entry, writes audit. |
| T067 | [ ] | [X] Complete | `backend/src/billing/ledger.service.ts` — full `LedgerService` with `addEntry()` method and running balance calculation. `backend/src/customers/customers.controller.ts:100-142` — `GET :id/statement` endpoint queries `customer_statement_view` DB view (created in T019), returns entries with debit/credit/running balance and date filtering. |
| T071a | [ ] | [X] Complete (scaffolding) | `Frontend/src/components/billing/ConsumptionPage.tsx` — integrates `isFeatureEnabled('consumption')` feature flag (line 34), `useConsumptionTrend` API hook (line 35), `QueryBoundary` for loading states (line 54). Charts consume API data via `const chartData = useApi && apiData ? apiData : mockConsumptionData` (line 36). Mock fallback remains for non-critical data tables (high consumption, zero consumption, missing readings, SmartTable). |
| T077 | [ ] | [ ] (unchanged) | RP5 incorrectly claimed action-level gating was implemented. Code verification: no `can(action, resource)` helper exists. Navigation-level permission gating only (`navigation.ts:234-239`, `mock-auth.ts:83-94`). |
| T085 | [ ] | [ ] (unchanged) | RP5 incorrectly claimed constitution ratified. Code verification: `.specify/memory/constitution.md` does not exist. AGENTS.md confirms "still a template placeholder." |

---

## Modified Task Lines

### T066 (Phase 5 — Implementation for User Story 3)
```diff
- [ ] T066 [US3] Payment reversal `POST /api/v1/payments/{paymentId}/reverse` (super_admin only) in `backend/src/payments/`
+ [X] T066 [US3] Payment reversal `POST /api/v1/payments/{paymentId}/reverse` (super_admin only) in `backend/src/payments/`
```

### T067 (Phase 5 — Implementation for User Story 3)
```diff
- [ ] T067 [US3] Ledger service + `GET /api/v1/customers/{customerId}/statement` in `backend/src/payments/ledger/`
+ [X] T067 [US3] Ledger service + `GET /api/v1/customers/{customerId}/statement` in `backend/src/payments/ledger/`
```

### T071a (Phase 5 — Implementation for User Story 3)
```diff
- [ ] T071a [US3] Consumption view migration in `Frontend/src/components/billing/ConsumptionPage.tsx`
+ [X] T071a [US3] Consumption view migration in `Frontend/src/components/billing/ConsumptionPage.tsx` (API scaffolding complete, mock fallback remains for non-critical data tables)
```

### T077, T085
No changes. Both correctly marked [ ] confirmed by code evidence.

---

## RP5 Discrepancy Note

RP5 `tasks.md Update Items` (lines 462-468) claimed T077 and T085 should be marked [X]. This is incorrect. Both were verified against actual code and do not meet their acceptance criteria. B1 reconciliation stands corrected.
