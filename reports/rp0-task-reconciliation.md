# RP0-E — Task Reconciliation

**Date:** 2026-06-17
**Source:** tasks.md (T001-T150) vs SYSTEM_DNA_DRAFT.md
**Mode:** DISCOVERY ONLY — No Implementation

---

## 1. Tasks Correctly Represented (Matches DNA)

| Task | DNA Reference | Status |
|------|--------------|--------|
| T001-T005 | Setup infrastructure | ✅ Correct |
| T006-T008 | Error envelope, correlation, idempotency | ✅ Correct |
| T009 | JWT auth + 7-role RBAC | ✅ Correct |
| T010 | Append-only audit | ✅ Correct |
| T011 | API versioning + OpenAPI | ✅ Correct |
| T012 | Contract test harness | ✅ Correct |
| T013-T019 | All migrations | ✅ Correct |
| T020-T022 | Frontend foundation | ✅ Correct |
| T023-T042 | US1 — Meters/assignments | ✅ Correct |
| T043-T052 | US2 — Readings/validation | ✅ Correct (DNA flags T048a as pending) |
| T053-T065 | US3 core billing | ✅ Correct |
| T066 | Payment reversal | ✅ Correct (marked [ ] in tasks.md, implemented — discrepancy) |
| T067 | Customer statement | ✅ Correct (marked [ ] in tasks.md, implemented — discrepancy) |
| T068-T071 | Frontend billing pages | ✅ Correct |
| T071a | Consumption view | ✅ Correct (marked [ ] in tasks.md, implemented — discrepancy) |
| T073 | Report export jobs | ✅ Correct — NOT STARTED |
| T074 | Report contract tests | ✅ Correct — NOT STARTED |
| T075 | RBAC + audit tests | ✅ Correct — NOT STARTED |
| T076 | Reports v2 frontend | ✅ Correct — NOT STARTED |
| T077 | Action permission gating | ✅ Correct (marked [ ] in tasks.md, implemented — discrepancy) |
| T079 | Frontend contract tests | ✅ Correct — NOT STARTED |
| T080 | E2E coverage expansion | ✅ Correct — NOT STARTED |
| T081 | Observability | ✅ Correct — NOT STARTED |
| T083 | Contract reconciliation | ✅ Correct — NOT STARTED |
| T084 | E2E acceptance validation | ✅ Correct — 12/12 passing |
| T084a | Backup/restore drill | ✅ Correct |
| T085 | Constitution ratification | ✅ Correct (marked [ ] in tasks.md, implemented — discrepancy) |
| T086-T120 | v2.0.0 tasks | ✅ Correct — ALL NOT STARTED |

---

## 2. Tasks Missing From tasks.md (DNA Gaps)

The following requirements are documented in SYSTEM_DNA_DRAFT.md but have NO corresponding task in tasks.md:

| Gap ID | DNA Section | Missing Task | Description | Priority |
|--------|-------------|-------------|-------------|----------|
| G001 | §2 (Governance) | **T200** | Create SYSTEM_DNA.md | P0 |
| G005 | §9 (PDF) | **T201** | PDF Generation Engine | P0 |
| G006 | §9 (Templates) | **T202** | Template Engine V3 port | P0 |
| G007 | §8 (Bill Cycle) | **T203** | Bill Cycle Governance (OPEN/CLOSE/CANCEL) | P1 |
| G012 | §4.3 (Invoices) | **T204** | Fix customer/unit resolution in invoice gen | P1 |
| G015 | §12 (Frontend) | **T205** | Wire Meter Detail Page to live API | P2 |
| G016 | §8.2 (DB) | **T206** | Add DB unique constraint for invoice dedup | P1 |
| G017 | §4.4 (Invoices) | **T207** | Implement cancel invoice endpoint | P2 |
| G018 | §4.3 (Invoices) | **T208** | Replace destructive invoice regeneration | P1 |
| G019 | §10.2 (Security) | **T209** | SSL/HTTPS configuration | P0 |
| G020 | §10.2 (DevOps) | **T210** | Monitoring and alerting | P1 |
| G021 | §13 (Deployment) | **T211** | Provision production environment | P0 |
| G024 | §9 (Documents) | **T212** | QR code generation for invoices | P1 |
| G025 | §9 (Documents) | **T213** | Invoice hash/verification code | P1 |
| G026 | §4.3 (Invoices) | **T214** | Set invoice due date during generation | P2 |
| G029 | §12 (Quality) | **T215** | RTL/responsive Playwright tests | P2 |
| G032 | §10.2 (Operations) | **T216** | Scheduled backup automation | P1 |

**Total missing tasks: 17** (T200-T216)

---

## 3. Tasks Incorrectly Represented (Status Mismatch)

The following tasks have implementation status that does NOT match what tasks.md reports:

| Task | tasks.md Status | DNA/Code Status | Discrepancy | Impact |
|------|----------------|-----------------|-------------|--------|
| T066 | [ ] Not done | ✅ Implemented | Payment reversal endpoint exists | Tracker underreports completion |
| T067 | [ ] Not done | ✅ Implemented | Customer statement uses DB view | Tracker underreports completion |
| T071a | [ ] Not done | ✅ Implemented | Consumption view wired to API | Tracker underreports completion |
| T077 | [ ] Not done | ✅ Implemented | action-permissions.ts + ProtectedAction exist | Tracker underreports completion |
| T085 | [ ] Not done | ✅ Implemented | constitution.md ratified | Tracker underreports completion |

**Impact:** tasks.md shows 84.6% MVP completion. With corrections: **90.1%** (77 of ~85 MVP-equivalent tasks).

---

## 4. Tasks Incorrect in Scope or Definition

| Task | DNA Issue | Recommended Action |
|------|-----------|-------------------|
| T078 | Alerts→Tickets linkage — DNA documents this as OUT OF SCOPE | Mark as [x] with note "out of scope — no FR backs this" |
| T087 | DNA §3 identifies 15-area architecture. T087 only defines 10 Features tables. The settlement/solar/chilled water tables (needed for §5-7) are missing from T087 scope. | Add settlement config/record tables to T087 Featuress DB schema |
| T088 | DNA §3 specifies 45 tables per area. T088 should include SolarWalletTransaction, ChilledWaterConfig, ChilledWaterSettlement which are currently not listed. | Verify area template includes all domain tables |
| T089 | DNA §10.3 defines 16 roles. T089 should align with exact role names matching frontend navigation | Verify role names match frontend |
| T100 | DNA §4.2 defines 5 charge modes. T100 must include settlement types (FIXED/PERCENTAGE/ONE_TIME) | Add settlement types to T100 scope |
| T107 | DNA §5 defines solar wallet architecture. T107 current scope "historical data migration" is too narrow — must include the wallet engine implementation, not just migration | Split into T107a (wallet engine) and T107b (historical migration) |
| T116 | DNA §13 defines CI/CD targets. T116 should specify: frontend lint+build on Ubuntu, backend test on Ubuntu, Symbiot build on Windows, security scan, SBOM | Already correct — no change needed |

---

## 5. Tasks That Are Obsolete

| Task | Reason | Action |
|------|--------|--------|
| None identified | All tasks map to valid DNA requirements | — |

---

## 6. Task Coverage by DNA Section

| DNA Section | tasks.md Covers | Missing Tasks |
|-------------|----------------|---------------|
| §3 Data Architecture | T013-T019, T086-T088 | T206 (dedup constraint) |
| §4 Billing Architecture | T061-T067, T062a | T204 (customer resolution), T208 (safe regen), T214 (due date) |
| §5 Solar Wallet | T107 | — (scope gap — should include engine, not just migration) |
| §6 Chilled Water | T088, T097 | — |
| §7 Settlement Engine | T088 | — |
| §8 Bill Cycle | — | T203 |
| §9 Templates & PDF | — | T201, T202, T212, T213 |
| §10 Security | T009, T089, T112 | T209 (SSL), T210 (monitoring) |
| §11 API | T011 | T207 (cancel invoice) |
| §12 Frontend | T035-T042, T049-T051, T068-T071, T076-T081 | T205 (meter detail wire), T215 (RTL tests) |
| §13 Deployment | T117-T118, T116 | T211 (production env) |
| §15 Migration | T107-T110 | — |
| §16 Governance | T085 | T200 (SYSTEM_DNA.md) |
| §17 Operational Rules | (Referenced by all tasks) | — |

---

## 7. Overall Task Inventory Reconciliation

| Category | Count | Details |
|----------|-------|---------|
| Tasks in tasks.md (T001-T120) | 120 | — |
| Tasks in DNA (T001-T216) | 137 | T001-T120 + T200-T216 |
| Missing from tasks.md | 17 | T200-T216 |
| Status mismatches | 5 | T066, T067, T071a, T077, T085 |
| Out of scope | 1 | T078 (alerts→tickets — no FR) |
| Scope adjustment needed | 3 | T087 (add settlement tables), T088 (verify area template), T107 (split into engine + migration) |

---

## 8. Recommended Immediate Actions

| # | Action | Rationale |
|---|--------|-----------|
| 1 | Create T200 (SYSTEM_DNA.md) as P0 — **before any other implementation** | DNA §16 Rule 3: No P0 without SYSTEM_DNA |
| 2 | Update tasks.md: mark T066, T067, T071a, T077, T085 as [x] completed | Restore tracker accuracy (G013) |
| 3 | Mark T078 as [x] with note "out of scope" | DNA §2 lists this as out of scope |
| 4 | Add T200-T216 to tasks.md as new tasks | Close 17 identified gaps |
| 5 | Update T087 scope to include settlement/solar/chilled water feature tables | Align with DNA §3, §5, §6, §7 |
| 6 | Split T107 into T107a (wallet engine implementation) + T107b (historical migration) | DNA §5 identifies engine as separate concern |
| 7 | Ratify SYSTEM_DNA_DRAFT.md → SYSTEM_DNA.md | Establish primary authority before proceeding |
