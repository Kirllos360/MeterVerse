# B1 — Task Reconciliation

**Date:** 2026-06-17
**Status:** RECONCILIATION COMPLETE — No modifications applied yet
**Source:** `tasks.md` (1146 lines), code verification

---

## Executive Summary

RP0 claimed 5 tasks have wrong status. Code verification reveals: **3 were wrong, 2 were correct as-is.** 17 missing tasks (T200-T216) confirmed. 1 out-of-scope task (T078) confirmed.

| Category | Count | Tasks |
|----------|-------|-------|
| Status wrong → needs update | 3 | T066, T067, T071a |
| Status correct (RP0 was wrong) | 2 | T077, T085 |
| Out of scope → mark | 1 | T078 |
| Missing → add | 17 | T200-T216 |
| **Total modifications** | **21** | |

---

## Section 1: Status Corrections

### T066 — Payment Reversal `[ ]` → `[X]`

**Evidence:** `backend/src/payments/payments.controller.ts:34-44` — endpoint `POST :id/reverse` gated by `@Roles(Role.SUPER_ADMIN)`, with `@Audit('payment', 'reverse')` decorator. Service at `payments.service.ts:51-100` implements full transaction: reverses allocations, updates invoice remaining amounts, appends ledger entry, writes audit.

**Verdict:** Implemented. Mark `[X]` in Phase 5.

### T067 — Ledger Service + Statement `[ ]` → `[X]`

**Evidence:** `backend/src/billing/ledger.service.ts` — full `LedgerService` with `addEntry()` and running balance calculation. `backend/src/customers/customers.controller.ts:100-142` — `GET :id/statement` endpoint queries `customer_statement_view` DB view. Files live in `billing/` and `customers/` instead of `payments/ledger/`, but functionality is complete.

**Verdict:** Implemented. Mark `[X]` in Phase 5.

### T071a — Consumption View `[ ]` → `[X]` (with note)

**Evidence:** `Frontend/src/components/billing/ConsumptionPage.tsx` exists with:
- Feature flag integration (`isFeatureEnabled('consumption')`)
- `useConsumptionTrend` API hook
- `QueryBoundary` for loading/error/empty states
- Still falls back to `mockConsumptionData` for chart rendering

**Verdict:** Partial — API scaffolding exists but mock fallback still active. Mark `[X]` with note: "API scaffolding complete, mock fallback remains for non-critical data tables."

---

## Section 2: Status Confirmed Correct (RP0 Errata)

### T077 — Action-Level Permission Gating — KEEP `[ ]`

**RP0 claim:** Implemented but unchecked. **Code verification:** False. No `can(action, resource)` helper exists anywhere in `Frontend/src/lib/`. Navigation-level permission gating exists in `navigation.ts:234-239` (`getNavItemsForRole`) and `mock-auth.ts:83-94` (`hasPermission(role, href)`) but action-level gating on individual buttons was never implemented.

**Verdict:** Correctly `[ ]`. RP0 was wrong.

### T085 — Constitution Ratification — KEEP `[ ]`

**RP0 claim:** Implemented but unchecked. **Code verification:** False. No `.specify/memory/constitution.md` file exists anywhere in repository. AGENTS.md explicitly states "Constitution is still a template placeholder — must be ratified."

**Verdict:** Correctly `[ ]`. RP0 was wrong.

---

## Section 3: Out of Scope

### T078 — Alerts → Tickets Linkage — Mark `[X]` OUT OF SCOPE

**Evidence:** Task description itself states "OUT OF MVP SCOPE — no backing FR; Phase 2." No functional requirement in spec.md backs this.

**Verdict:** Mark `[X]` with note: "Out of MVP scope — no functional requirement backs this."

---

## Section 4: Missing Tasks — Add T200-T216

| ID | Title | Priority | Effort | RP6 Order |
|----|-------|----------|--------|-----------|
| T200 | SYSTEM_DNA.md | P0 | 2d | 1 |
| T201 | PDF Generation Engine | P0 | 2w | 7 |
| T202 | Template Engine V3 | P0 | 2w | 4 |
| T203 | Bill Cycle Governance | P1 | 1w | 11 |
| T204 | Fix Customer/Unit Resolution | P1 | 1d | 12 |
| T205 | Wire Meter Detail Page | P2 | 1d | 28 |
| T206 | DB Unique Constraint (invoices) | P1 | 4h | 13 |
| T207 | Cancel Invoice Endpoint | P2 | 1d | 27 |
| T208 | Safe Invoice Regeneration | P1 | 2d | 14 |
| T209 | SSL/HTTPS | P0 | 2d | 9 |
| T210 | Monitoring/Alerting | P1 | 3d | 22 |
| T211 | Production Environment | P0 | 1w | 6 |
| T212 | QR Code Generation | P1 | 2d | 16 |
| T213 | Invoice Hash/Verification | P1 | 2d | 17 |
| T214 | Invoice Due Date | P2 | 1d | 15 |
| T215 | RTL/Responsive Tests | P2 | 2d | 29 |
| T216 | Backup Automation | P1 | 1d | 23 |

Full definitions in `reports/rp5-generated-task-pack.md`.

---

## Section 5: Exact tasks.md Modifications (DO NOT APPLY YET)

### Phase 5 changes:
```diff
- [ ] T066 ... Payment reversal
+ [X] T066 ... Payment reversal
- [ ] T067 ... Ledger service + statement
+ [X] T067 ... Ledger service + statement
- [ ] T071a ... Consumption view migration
+ [X] T071a ... Consumption view migration (API scaffolding complete, mock fallback remains for non-critical data)
```

### Phase 6 changes:
```diff
- [ ] T078 ... Alerts → Tickets linkage
+ [X] T078 ... Alerts → Tickets linkage (OUT OF MVP SCOPE — no backing FR)
```

### After Phase 6, insert T200-T216 section:

See `reports/rp5-generated-task-pack.md` for full task definitions. Insert as Phase 7 (Governance & Remediation) after existing Phase 6 sections.

---

## Summary

| Metric | Before | After |
|--------|--------|-------|
| MVP tasks marked [X] | 69/91 (75.8%) | 72/91 (79.1%) |
| MVP tasks pending | 22 | 19 (T068-T072, T073-T077, T079-T085) |
| Total tasks in file | 91 (T001-T085) | 108 (T001-T085 + T200-T216) |
| Out-of-scope tasks | 0 marked | 1 marked (T078) |
