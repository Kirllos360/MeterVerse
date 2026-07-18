# R5 — Remaining Task Detection Report

**Date:** 2026-06-17
**Source:** R0 reconciliation + R1 implementation verification

## P0 — Critical (Must fix before any deployment)

| Task | Reason | Evidence | Files Affected | Effort |
|------|--------|----------|---------------|--------|
| None | All P0 gaps from remediation plan resolved | E2E 12/12, payment reversal 4/4, DR scripts verified | — | — |

## P1 — High (Should fix before Phase H pilot)

| Task | Reason | Evidence | Files Affected | Effort |
|------|--------|----------|---------------|--------|
| **T071a** — Consumption view migration | Not implemented, no code found | Hooks/search yield no consumption API migration | Frontend/src/components/billing/ConsumptionPage.tsx | 1 day |
| **T067** — Customer statement view usage | Statement computes in JS, doesn't use `customer_statement_view` | customers.controller.ts:116-142 uses raw ledger queries | backend/src/customers/customers.controller.ts | 4 hours |
| **T084** — Contract test timeout failures | 12 contract suites timeout at 35s | Tests dependent on DB won't complete in CI | backend/test/contract/ | 1 day |
| **T085** — Constitution ratification | `.specify/memory/constitution.md` missing | File does not exist → plan Gate 4 incomplete | .specify/memory/constitution.md | 4 hours |

## P2 — Medium (Polish phase, recommended before closeout)

| Task | Reason | Evidence | Files Affected | Effort |
|------|--------|----------|---------------|--------|
| **T062a** — Water difference policy.ts | Logic inline in controller, no dedicated policy file | billing.controller.ts:115-153 | backend/src/billing/water-difference.policy.ts | 4 hours |
| **T073** — Report export jobs | reports/ dir has .gitkeep only, no controller | No reports.controller.ts | backend/src/reports/ | 2 days |
| **T074** — Reports contract test | No reports.contract.spec.ts exists | test/contract/ has 12 specs, none for reports | backend/test/contract/reports.contract.spec.ts | 1 day |
| **T075** — RBAC action-gating tests | No rbac-audit.spec.ts exists | test/integration/ has 7 files, none for RBAC | backend/test/integration/rbac-audit.spec.ts | 1 day |
| **T076** — Reports v2 API migration | ReportsPage.tsx uses mockReports | Frontend/src/components/reports/ReportsPage.tsx | Frontend/ | 1 day |
| **T077** — Action permission gating | No can(action,resource) helper | Frontend/src/lib/ | Frontend/src/lib/permissions.ts | 1 day |
| **T079** — Frontend contract tests | No frontend test infrastructure | Frontend/ has no test runner config | Frontend/ | 2 days |
| **T081** — Observability + resilience | No Sentry/error boundary pattern | Frontend/src/ | Frontend/ | 1 day |
| **T082** — Polish batch validation | No batch validation utility | Not implemented | Frontend/ | 1 day |
| **T083** — Contract reconciliation | 12 contract specs not matched to YAML | No reconciliation report exists | backend/test/contract/ | 1 day |

## P3 — Low (v2.0.0 scope, not blocking Phase H)

| Phase | Tasks | Dependency | Effort |
|-------|-------|-----------|--------|
| **v2.0.0 Phase 0: Foundation** | T086-T090 (5 tasks) | None | 5 days |
| **v2.0.0 Phase 1: Infrastructure** | T091-T092 (2 tasks) | Phase 0 | 10 days |
| **v2.0.0 Phase 2: Core Pages** | T093-T098 (6 tasks) | Phase 0 | 15 days |
| **v2.0.0 Phase 3: Features** | T099-T106 (8 tasks) | Phase 2 | 20 days |
| **v2.0.0 Phase 4: Migration** | T107-T111 (5 tasks) | Phase 0 | 10 days |
| **v2.0.0 Phase 5: Quality** | T112-T116 (5 tasks) | All above | 5 days |
| **v2.0.0 Phase 6: Launch** | T117-T120 (4 tasks) | Phase 5 | 5 days |

## Dependency Chain for Remaining Tasks

```
P1 (can start immediately):
  T071a → T072 (US3 batch validation)
  T067 → T083 (contract reconciliation)  
  T084 (fix contract timeouts) → T083
  T085 (constitution) → final sign-off

P2 (after P1):
  T073 (reports) → T074 (reports tests) → T076 (frontend reports)
  T075 (RBAC tests) → T077 (frontend permissions)
  T079 (frontend tests) → T082 (batch validation)

P3 (v2.0.0, sequential):
  T086 → T087 → T088 → T089 → T090
  T091 → T092
  T093 → T094 → T095 → T096 → T097 → T098
  T099 → T100 → T101 → T102 → T103 → T104 → T105 → T106
  T107 → T108 → T109 → T110 → T111 (parallel per source)
  T112 → T113 → T114 → T115 → T116 (parallel)
  T117 → T118 → T119 → T120 (sequential)
```

## Total Remaining Effort Estimate
| Priority | Tasks | Estimated Effort |
|----------|-------|------------------|
| P1 | 4 | ~3 days |
| P2 | 10 | ~11 days |
| P3 (v2.0.0) | 35 | ~70 days |
| **Total** | **49** | **~84 days** |
