# Planning Part 01 — Deep Audit Against old_tasks.md

**Generated:** 2026-07-24
**Status:** COMPARISON ONLY — no changes made

---

## SUMMARY STATISTICS

| Classification | Count | % |
|:--------------:|:-----:|:-:|
| ✅ COMPLETE — fully implemented | 12 | 10% |
| ⚠️ PARTIAL — exists but incomplete | 18 | 15% |
| ❌ MISSING — not implemented | 68 | **58%** |
| 🔄 WRONG ARCH — NestJS→Express diff | 1 | 1% |
| 📋 PLANNED — identified but not started | 18 | 15% |
| **Total Tasks** | **117** | **100%** |

---

## WHAT IS ✅ COMPLETE (12 tasks)

| ID | Task | Location |
|:--:|------|----------|
| T002 | PostgreSQL connection | `backend/prisma/` |
| T003 | Lint/test tooling | `vitest.config.ts` |
| T004 | Prisma ORM | 78 models |
| T005 | Docker compose | `docker-compose.yml` |
| T009 (partial) | JWT auth + RBAC | `auth-engine.js`, `security.js` |
| T018 | Audit + Report models | `AuditEntry`, `ReportDefinition` |
| T020 | FE-001 API client | `src/lib/api-client.ts` |
| T021 | FE-002 React Query | `src/lib/query-client.ts` |
| T030 | Meters CRUD | `routes/meters.js` |
| T062 | Invoice generation | `routes/invoices.js` |
| T065 | Payment allocation | `routes/payments.js` |
| T067 | Customer statement | `routes/payments.js` |

---

## WHAT IS ⚠️ PARTIAL (18 tasks — exists but incomplete)

| ID | Issue | Fix Needed |
|:--:|-------|:-----------|
| T006 | Error envelope is simple `{error: string}` — not `{code, message, details, correlationId}` | Add structured error format |
| T010 | AuditLog exists but no before/after snapshots | Add snapshot capture |
| T013-T017 | Schema tables exist but missing fields (immutable_at, utility_type, etc.) | Add missing columns |
| T032 | Meter assignment is separate resource, not scoped under /meters/{id}/assign | Restructure endpoint |
| T047 | Readings CRUD exists but no consumption calculation | Add calc logic |
| T061 | Tariff CRUD exists but no BillingPeriod model | Add model |
| T066 | Payment reversal exists but no super_admin guard | Add role check |
| T068-T069 | Frontend pages exist via GenericAdminPage but no lifecycle workflows | Add state machines |

---

## WHAT IS ❌ MISSING — TOP 10 PRIORITY (68 total missing)

| Rank | ID | Task | Impact | Effort | Dependencies |
|:----:|:--:|------|:------:|:------:|:------------|
| **1** | T091 | SYMBIOT Bridge (10 TCP × 100 HTTP multiplex) | Core business — cannot read meters | 5 sessions | Phase 43e docs |
| **2** | T031 | SIM Card Module (CRUD + eligibility) | Cannot manage SIMs | 3 sessions | T014 schema |
| **3** | T033 | Meter termination + SIM reuse | No termination workflow | 2 sessions | T031 |
| **4** | T201 | PDF Generation Engine | Cannot generate invoices/statements | 4 sessions | T202 templates |
| **5** | T202 | Template Engine V3 | No document rendering | 3 sessions | — |
| **6** | T011 | API versioning (/api/v1) + OpenAPI/Swagger | No API documentation | 2 sessions | — |
| **7** | T012 | Contract test harness | No API contract verification | 2 sessions | T011 |
| **8** | T022 | FE-003 Feature flags for API migration | No mock→API toggle | 1 session | — |
| **9** | T027 | Project config (tax_enabled, tax_rate, thresholds) | Missing billing config | 2 sessions | — |
| **10** | T203 | Bill Cycle Governance (OPEN→CLOSE→CANCEL workflow) | Missing billing governance | 2 sessions | T062 |

---

## RECOMMENDED EXECUTION ORDER (Next 5 Sessions)

| Session | What | Why Now |
|:-------:|------|---------|
| **1** | T031 — SIM Card Module (model + CRUD + eligibility) | Unlocks meter assignment flow |
| **2** | T033 — Meter termination + SIM reuse | Completes meter lifecycle |
| **3** | T066 — Fix super_admin guard on payment reversal | Security gap |
| **4** | T011 — API versioning + OpenAPI/Swagger docs | Developer experience |
| **5** | T012 — Contract test harness (supertest + YAML) | Quality gate |

---

## BLOCKED (Cannot start without external input)

| Task | Blocker | Can We Bypass? |
|:----:|---------|:--------------:|
| T091 — SYMBIOT Bridge | API docs not provided | **No** — core dependency |
| T201 — PDF Engine | Template design | **Partial** — can build engine |
| T203 — Bill Cycle | Business rules confirmation | **Yes** — use standard defaults |

---

## DECISIONS NEEDED FROM YOU

1. **SIM Card Module**: Should we build SIM management? (T031, T033)
2. **API versioning**: Keep `/api/` or migrate to `/api/v1`?
3. **Contract tests**: Build harness against OpenAPI spec?
4. **Meter termination**: Build the full termination flow with SIM reuse?
5. **Focus**: Complete old_tasks gaps first, or move to new features?

---

## MAIN PLAN CHECKLIST STATUS

| Wave | Phase | Status | Next Action |
|:----:|:-----:|:------:|:-----------|
| W01 | 420-42f | ✅ Complete | — |
| W02 | 00-42g | ✅ Complete | — |
| W02 | 43b | ❌ Blocked | Needs SMTP/Twilio/Firebase |
| W02 | 43c | ✅ Complete | — |
| W02 | 43d | ✅ Complete | — |
| W02 | 43e | ❌ Blocked | Needs SYMBIOT docs |
| W03 | 44a-d | ✅ Complete | — |
| W04 | 45a-f | ✅ Complete | — |
| **GAPS** | old_tasks | **68 MISSING** | See Top 10 above |

**No implementation has been changed. This is an audit only. Awaiting your direction.**
