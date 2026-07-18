# OR-R1 — Remediation Master Plan

**Date:** 2026-06-17
**Status:** PLANNING — No Implementation
**Overall Readiness:** 23% → 100% (target)

---

## Executive Summary

The Operational Reality Certification identified **32 gaps** across **10 domains**. This plan maps to **34 tasks** in **4 waves** over **25 weeks**.

**5 feature areas** are completely missing: Solar Wallet, Chilled Water, Settlement Engine, Bill Cycle Governance, PDF/Template Engine. **5 areas** are partially covered (Invoice Gen 27%, Meter Detail 29%, Reading 60%, Payment 70%, undefined Reporting 0%). **Zero production infrastructure** exists.

**Primary blocker:** SYSTEM_DNA.md does not exist (G001).

**Critical path:** Database Foundation (T086→T087→T088) = 10 weeks minimum.

---

## Source Reports

| Report | File |
|--------|------|
| Gap Register | `reports/or11-gap-register.md` |
| Executive Board | `reports/or10-operational-board.md` |
| Master Certification | `reports/operational-reality-master-report.md` |
| Gap-to-Task Mapping | `reports/rp1-gap-to-task-mapping.md` |
| Business Vision Analysis | `reports/rp2-business-vision-gap-analysis.md` |
| Dependency Matrix | `reports/rp3-dependency-matrix.md` |
| Wave Planning | `reports/rp4-wave-planning.md` |
| Generated Task Pack | `reports/rp5-generated-task-pack.md` |
| SpecKit Execution Order | `reports/rp6-speckit-execution-order.md` |
| Governance Review | `reports/rp7-governance-review.md` |
| Executive Remediation Plan | `reports/rp8-executive-remediation-plan.md` |

---

## 4 Waves

### Wave 1: Foundation & Governance (Week 1-10)

| Order | Task | Priority | Effort | Dependencies |
|-------|------|----------|--------|-------------|
| 1 | T200 — SYSTEM_DNA.md | P0 | 2d | None |
| 2 | G013 — Update tasks.md | P2 | 1h | None |
| 3 | T086 — Core DB Schema | P0 | 1w | None |
| 4 | T202 — Template Engine V3 | P0 | 2w | None |
| 5 | T087 — Features DB Schema | P0 | 2w | T086 |
| 6 | T211 — Production Environment | P0 | 1w | None |
| 7 | T201 — PDF Generation Engine | P0 | 2w | T202 |
| 8 | T088 — Area DB Template (×15) | P0 | 4w | T087 |
| 9 | T209 — SSL/HTTPS | P0 | 2d | T211 |
| 10 | T091 — Symbiot Bridge | P0 | 4w | T086 |
| 11 | T116 — CI/CD Pipeline | P0 | 3d | T211 |

### Wave 2: Billing & Operations (Week 9-13)

| Order | Task | Priority | Effort | Dependencies |
|-------|------|----------|--------|-------------|
| 12 | T203 — Bill Cycle Governance | P1 | 1w | T009, T010 |
| 13 | T204 — Fix Customer/Unit Resolution | P1 | 1d | T032 |
| 14 | T206 — DB Unique Constraint | P1 | 4h | None |
| 15 | T208 — Safe Invoice Regeneration | P1 | 2d | T203, T206 |
| 16 | T214 — Invoice Due Date | P2 | 1d | T062, T061 |
| 17 | T212 — QR Code Generation | P1 | 2d | T201 |
| 18 | T213 — Invoice Hash/Verification | P1 | 2d | T201, T063 |
| 19 | T083 — Contract Reconciliation | P1 | 2d | T012 |
| 20 | T080 — E2E Coverage Expansion | P1 | 1w | T079 |
| 21 | T112 — Security Audit | P1 | 1w | None |
| 22 | T113 — Load Test | P1 | 3d | T062, T065 |
| 23 | T210 — Monitoring/Alerting | P1 | 3d | T211, T081 |
| 24 | T216 — Backup Automation | P1 | 1d | T084a |
| 25 | G027 — Smoke Script PATH Fix | P3 | 1h | None |

### Wave 3: Standard Features (Week 14-17)

| Order | Task | Priority | Effort | Dependencies |
|-------|------|----------|--------|-------------|
| 26 | T089 — 16-Profile RBAC | P2 | 1w | T086 |
| 27 | T207 — Cancel Invoice Endpoint | P2 | 1d | T063, T010 |
| 28 | T205 — Wire Meter Detail Page | P2 | 1d | T047, T038 |
| 29 | T215 — RTL/Responsive Tests | P2 | 2d | T080 |
| 30 | T102 — 32 Reports | P2 | 4w | T073, T202 |

### Wave 4: Migration & Cutover (Week 18-25)

| Order | Task | Priority | Effort | Dependencies |
|-------|------|----------|--------|-------------|
| 31 | T107 — Solar Wallet Migration | P0 | 2w | T088, T086 |
| 32 | T108 — SBill Palm Hills Migration | P0 | 2w | T088, T086 |
| 33 | T109 — SBill Estates Migration | P0 | 2w | T088, T086 |
| 34 | T110 — Collection Tracker Migration | P0 | 2w | T088, T086 |

---

## Quality Gates

| Gate | Requirement | Wave |
|------|-------------|------|
| GATE-1 | SYSTEM_DNA.md exists | 1 |
| GATE-2 | CI/CD pipeline passing | 1 |
| GATE-3 | SSL/HTTPS enforced | 1 |
| GATE-4 | All contract tests passing | 2 |
| GATE-5 | Duplicate prevention verified | 2 |
| GATE-6 | Bill cycle governance verified | 2 |
| GATE-7 | PDF generation verified (Arabic, QR, hash) | 2 |
| GATE-8 | Monitoring operational | 2 |
| GATE-9 | Backup verified | 2 |
| GATE-10 | Security audit passed | 2 |
| GATE-11 | Load test passed | 2 |
| GATE-12 | 16-role RBAC verified | 3 |
| GATE-13 | Migration rollback verified | 4 |

**Production deployment blocked** until GATE-1 through GATE-11 all pass.

---

## Risk Register (Top 5)

| Rank | Risk | Score | Action |
|------|------|-------|--------|
| 1 | No SYSTEM_DNA.md before implementation | 25 | Block all P0 until T200 done |
| 2 | Schema migration conflicts (15 area DBs) | 15 | Strict migration versioning |
| 3 | Symbiot Windows packaging issues | 15 | Use Docker instead |
| 4 | PDF team expertise gap | 15 | 2-day spike before implementation |
| 5 | Migration volume underestimated | 15 | Estimate during T088 |

---

## Readiness Score Progression

```
Current:  ████████░░░░░░░░░░░░░░░░░░░░░░  23%
Wave 1:   ████████████░░░░░░░░░░░░░░░░░░  35%
Wave 2:   ████████████████████████░░░░░░  65%
Wave 3:   ██████████████████████████████  80%
Wave 4:   ████████████████████████████████ 100%
```

---

## Task Count Summary

| Status | Count | Tasks |
|--------|-------|-------|
| Existing (already in tasks.md) | 13 | T079, T080, T083, T086-T091, T102, T107-T110, T112, T113, T116 |
| New (defined in RP5) | 17 | T200-T216 |
| Non-task (ops/governance) | 2 | G013 (tasks.md update), G027 (smoke PATH) |
| **Total** | **32** | — |

---

## Next Action

**Begin SpecKit cycle 1:** Read SYSTEM_DNA.md does not exist — **T200** is the first implementation task. Create `specs/SYSTEM_DNA.md` from all available source documents (OR1-OR11, tasks.md, controller code, migration files).

---

*Report generated 2026-06-17. This is a planning artifact — no implementation changes were made.*
