# B2 — Baseline Scoreboard

**Date:** 2026-06-17
**Status:** BASELINE ESTABLISHED — True completion metrics calculated
**Source:** B1 reconciliation + RP0 executive board + code verification

---

## 1. Task Completion (Corrected)

### MVP (T001-T085, adjusted)
| Phase | Total | [X] Before B1 | [X] After B1 | Pending | % |
|-------|-------|--------------|--------------|---------|---|
| 1 — Setup | 5 | 5 | 5 | 0 | 100% |
| 2 — Foundational | 17 | 17 | 17 | 0 | 100% |
| 3 — US1 (Meters/Assignments) | 20 | 20 | 20 | 0 | 100% |
| 4 — US2 (Readings) | 13 | 13 | 13 | 0 | 100% |
| 5 — US3 (Billing/Invoices/Payments) | 22 | 14 | 17 | 5 | 77.3% |
| 6 — Polish/Cross-Cutting | 13 | 0 | 0 | 13 | 0% |
| Out of scope (T078 removed) | 1 | — | — | 0 | — |
| **MVP Total** | **90** | **69** | **72** | **18** | **80.0%** |

### v2.0.0 (T086-T120)
| Phase | Total | [X] | Pending | % |
|-------|-------|-----|---------|---|
| 0 — Foundation | 5 | 0 | 5 | 0% |
| 1 — Infrastructure | 2 | 0 | 2 | 0% |
| 2 — Core Pages | 6 | 0 | 6 | 0% |
| 3 — Features | 8 | 0 | 8 | 0% |
| 4 — Migration | 5 | 0 | 5 | 0% |
| 5 — Quality | 5 | 0 | 5 | 0% |
| 6 — Launch | 4 | 0 | 4 | 0% |
| **v2.0.0 Total** | **35** | **0** | **35** | **0%** |

### Remediation (T200-T216)
| Wave | Total | [X] | Pending | % |
|------|-------|-----|---------|---|
| 1 — Foundation & Governance | 11 | 0 | 11 | 0% |
| 2 — Billing & Operations | 14 | 0 | 14 | 0% |
| 3 — Standard Features | 5 | 0 | 5 | 0% |
| 4 — Migration & Cutover | 4 | 0 | 4 | 0% |
| **Remediation Total** | **34** | **0** | **34** | **0%** |

### Grand Total
| Category | Total | [X] | % |
|----------|-------|-----|---|
| MVP (T001-T085) | 90 | 72 | **80.0%** |
| v2.0.0 (T086-T120) | 35 | 0 | **0%** |
| Remediation (T200-T216) | 34 | 0 | **0%** |
| **All** | **159** | **72** | **45.3%** |

---

## 2. Pending Tasks Detail

### Phase 5 Pending (5 tasks)
| Task | Title | Priority |
|------|-------|----------|
| T068 | FE-040 Invoices API migration | P3 |
| T069 | FE-041 Payments allocation workflow | P3 |
| T070 | FE-042 Balances aging | P3 |
| T071 | FE-043 Customer statements v1 | P3 |
| T072 | US3 frontend batch validation | P3 |

### Phase 6 Pending (13 tasks)
| Task | Title | Priority |
|------|-------|----------|
| T073 | Report export jobs | P2 |
| T074 | Contract test report endpoints | P2 |
| T075 | RBAC action-gating + audit tests | P1 |
| T076 | FE-050 Reports v2 | P2 |
| T077 | FE-051 Action-level permission gating | P1 |
| T079 | FE-060 Frontend contract tests | P1 |
| T080 | FE-061 E2E coverage expansion | P1 |
| T081 | FE-062 Observability + UX resilience | P2 |
| T082 | Polish batch validation | P3 |
| T083 | Contract reconciliation | P1 |
| T084 | Quickstart MVP acceptance | P1 |
| T084a | Backup/restore drill | P2 |
| T085 | Constitution ratification | P1 |

---

## 3. Quality Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Backend unit/integration tests passing | 280/385 (72.7%) | SYSTEM_DNA_DRAFT + RP0 |
| Contract tests passing | 17/108 (15.7%) | tasks.md checkpoint notes |
| E2E acceptance tests | 12/12 (100%) | SYSTEM_DNA_DRAFT §18 |
| Frontend spec tests | 0 | RP0 finding |
| Frontend pages | 25 total, 15 API, 10 mock | SYSTEM_DNA_DRAFT §12 |
| Playwright smoke pages | 25 views | Frontend scripts |
| API endpoints live | 46 | SYSTEM_DNA_DRAFT §11 |
| Missing endpoints | ~20 | SYSTEM_DNA_DRAFT §11.2 |

---

## 4. Feature Area Coverage

| Domain | Status | % | Priority Gaps |
|--------|--------|---|--------------|
| Auth & RBAC | ✅ LIVE | 100% | — |
| Project/Location/Customer | ✅ LIVE | 100% | — |
| Meter & SIM Management | ✅ LIVE | 100% | — |
| Reading Ingestion | ✅ LIVE | 100% | — |
| Reading Validation | ✅ LIVE | 100% | — |
| Reading Review | ⚠️ PARTIAL | ~60% | Approve/reject/correct pending |
| Water Balance | ✅ LIVE | 100% | — |
| Tariff Management | ✅ LIVE | 100% | Flat rate only |
| Invoice Generation | ⚠️ PARTIAL | 27% | Only flat rate, hardcoded IDs, no due date |
| Invoice Issue | ✅ LIVE | 100% | — |
| Invoice Adjustments | ✅ LIVE | 100% | — |
| Payment Recording | ✅ LIVE | 100% | — |
| Payment Reversal | ✅ LIVE | 100% | — |
| Customer Ledger | ✅ LIVE | 100% | — |
| Audit Logging | ✅ LIVE | 100% | — |
| Solar Wallet | 🔲 MISSING | 0% | P0 — 3 utilities affected |
| Chilled Water | 🔲 MISSING | 0% | P0 — 3 utilities affected |
| Settlement Engine | 🔲 MISSING | 0% | P0 — contractual billing |
| Bill Cycle Governance | 🔲 MISSING | 0% | P1 — financial control |
| PDF/Template Engine | 🔲 MISSING | 0% | P0 — no customer docs |
| Production Infrastructure | 🔲 MISSING | 0% | P0 — no deploy possible |
| 16-Profile RBAC | 🔲 MISSING | 0% | P2 — 9 additional roles |
| i18n | 🔲 MISSING | 0% | P2 — 676 keys |
| Reporting | 🔲 MISSING | 0% | P2 — 32 reports |
| Symbiot Bridge | 🔲 MISSING | 0% | P0 — meter communication |

---

## 5. Readiness Score

### Before B0-B3 (RP0 estimate): 23%

| Dimension | RP0 Score | B2 Corrected | Why Changed |
|-----------|----------|-------------|-------------|
| Architecture Authority | 0% | ✅ **100%** | SYSTEM_DNA.md ratified (B0) |
| Task Tracker Accuracy | 73% | ✅ **100%** | B1 reconciliation complete |
| MVP Implementation | 90.1% | ⚠️ **80.0%** | Correct denominator (90 tasks, not 85) |
| v2.0.0 Implementation | 0% | ✅ **0%** (unchanged) | — |
| Production Readiness | 10% | ⚠️ **10%** (unchanged) | — |
| Document Output | 0% | ✅ **0%** (unchanged) | — |
| Solar Wallet | 0% | ✅ **0%** (unchanged) | — |
| Chilled Water | 0% | ✅ **0%** (unchanged) | — |
| Settlement Engine | 0% | ✅ **0%** (unchanged) | — |
| Bill Cycle Governance | 0% | ✅ **0%** (unchanged) | — |
| Data Architecture | 40% | ✅ **40%** (unchanged) | — |
| API Completeness | 60% | ✅ **60%** (unchanged) | — |
| Frontend Connection | 60% | ✅ **60%** (unchanged) | — |
| Backend Tests | 73% | ✅ **72.7%** (unchanged) | — |
| Quality Automation | 20% | ✅ **20%** (unchanged) | — |

### B2 Corrected Overall: 27% (+4% from RP0, driven by DNA ratification)

---

## 6. Key Findings

1. **MVP is 80.0% complete — not 84.6% or 90.1%.** The correct denominator is 90 tasks (T078 out of scope removed). 72 complete, 18 pending.
2. **3 Phase 5 tasks were completed but untracked** (T066, T067, T071a) — adding them moves Phase 5 from 63.6% to 77.3%.
3. **Phase 6 is 0%** — 13 tasks all untouched. This is the biggest blocker: T077 (permission gating), T080 (E2E tests), T083 (contract reconciliation), T085 (constitution).
4. **v2.0.0 is genuinely 0%** — 35 tasks untouched.
5. **Remediation adds 34 new tasks** — 0% started.
6. **Overall readiness:** 27% (up from 23% due to DNA ratification). Still far from production.
7. **Realistic production timeline:** Wave 1 (weeks 1-10) foundation + governance, Wave 2 (weeks 9-13) billing ops, Wave 3 (weeks 14-17) features, Wave 4 (weeks 18-25) migration. Total: ~25 weeks.
