# Phase 40 — Implementation Plan

**Date:** 2026-07-21  
**Based On:** Phase 40 analysis — 6 reports covering entity inventory, runtime registry, enterprise template, customer integration audit, duplication audit  
**Rule:** No production code until plan is approved  

---

## Executive Summary

Phase 40 analysis has identified:
- **36 business entities** across the codebase
- **17 fully implemented** (DB + API + UI)
- **14 partially implemented** (DB + API only, missing UI)
- **1 completely missing** (ServiceConnection)
- **1 parallel codebase** (`Meter/` directory with ~500+ duplicate files)
- **12 break points** in the Customer integration chain
- **11 backend controller files** duplicated in `Meter/` directory
- **5 component sets** duplicated in `Meter/Frontend/`

**The top priority is fixing the Customer domain** — it is the most broken entity (wrong API, unsubmitted forms, no audit, no detail page, no dashboard page) and is the foundation for all other entities.

---

## Implementation Order

### Sprint 39a — Critical Bug Fixes (Week 1)
**Duration:** 5 days  
**Risk:** Low  
**Theme:** Fix the Customer domain so it works end-to-end

| Day | Task | Files | Hours |
|:---:|------|:-----:|:-----:|
| 1 | Fix admin customers API endpoint + transform | 2 | 0.5 |
| 1 | Wire auditLog() to customers.js | 1 | 0.5 |
| 1 | Wire requireRole() to customers.js | 1 | 0.5 |
| 2 | Wire Sheet submit handlers in GenericAdminPage | 1 | 2 |
| 2 | Add sonner toast notifications | 1 | 1 |
| 2 | Fix empty catch on status update | 1 | 0.25 |
| 3 | Create `/dashboard/customers` page | 2 | 2 |
| 3 | Add Customers to nav-config.ts | 1 | 0.25 |
| 4 | Create `/dashboard/customers/[id]` detail page | 3 | 4 |
| 5 | Fix soft delete (archivedAt set + filter) | 2 | 1 |
| 5 | Verification + screenshots + docs | — | 3 |

**Total:** ~15 hours (2 days) over 5 days

### Sprint 39b — Entity Detail Pages (Week 2)
**Duration:** 5 days  
**Risk:** Low  
**Theme:** Create reusable Entity Detail Page component, wire for Meter and Invoice

| Day | Task | Hours |
|:---:|------|:-----:|
| 1 | Create EntityDetailPage reusable component | 4 |
| 2 | Create Meter detail page (admin + dashboard) | 3 |
| 3 | Create Invoice detail page (admin + dashboard) | 3 |
| 4 | Add EntityTimeline component | 3 |
| 5 | Verification + screenshots + docs | 3 |

### Sprint 40 — Infrastructure Wiring (Week 3-4)
**Duration:** 8 days  
**Risk:** Medium  
**Theme:** Wire existing infrastructure to business events

| Day | Task | Hours |
|:---:|------|:-----:|
| 1 | Wire Event Bus to Customer CRUD | 3 |
| 2 | Wire Queue jobs for KPI calculation | 3 |
| 3 | Wire Notification to customer events (3 events) | 3 |
| 4 | Seed 40+ permissions + wire requirePermission() | 4 |
| 5 | Add Zod validation to 6 unprotected route files | 2 |
| 6 | Add 26 database indexes | 4 |
| 7 | Add export endpoints (Customer, Meter, Invoice CSV) | 4 |
| 8 | Verification + screenshots + docs | 4 |

### Sprint 41 — UI Completion (Week 5-6)
**Duration:** 10 days  
**Risk:** Medium  
**Theme:** Complete all missing frontend UIs

| Day | Task | Hours |
|:---:|------|:-----:|
| 1-2 | Wire GlobalSearch into admin layout | 4 |
| 3-4 | Wire CommandPalette (KBar) into admin layout | 4 |
| 5-6 | Admin sidebar: add grouping + collapsible sections | 6 |
| 7-8 | Add missing UI pages for 14 entities with DB+API only | 8 |
| 9-10 | Verification + screenshots + docs | 6 |

### Sprint 42 — ServiceConnection + Consumption (Week 7-8)
**Duration:** 10 days  
**Risk:** High  
**Theme:** Add the two most critical missing entities

| Day | Task | Hours |
|:---:|------|:-----:|
| 1-2 | Create ServiceConnection Prisma model | 4 |
| 3-4 | Create ServiceConnection API + BFF | 4 |
| 5-6 | Create ServiceConnection admin page | 4 |
| 7-8 | Create Consumption calculation engine | 6 |
| 9-10 | Verification + screenshots + docs | 4 |

---

## Entity Priority Matrix

| Entity | Business Value | Effort | Risk | Priority |
|--------|:--------------:|:------:|:----:|:--------:|
| Customer | 🔴 Critical | 15 hours | Low | **1** |
| Meter | 🔴 Critical | 10 hours | Low | **2** |
| Invoice | 🔴 Critical | 10 hours | Low | **3** |
| Payment | 🟡 High | 8 hours | Low | **4** |
| Reading | 🟡 High | 8 hours | Low | **5** |
| Contract | 🟡 High | 12 hours | Medium | **6** |
| Tariff | 🟡 High | 14 hours | Medium | **7** |
| ServiceConnection | 🔴 Critical | 20 hours | High | **8** |
| Consumption | 🔴 Critical | 16 hours | High | **9** |
| Notification wiring | 🟡 High | 8 hours | Low | **10** |
| Permission seeding | 🟡 High | 4 hours | Low | **11** |
| All others | 🟢 Medium | 2-4 hours each | Low | **12+** |

---

## Risks

| Risk | Sprint | Likelihood | Impact | Mitigation |
|------|--------|:----------:|:------:|------------|
| Sheet form changes break 45 admin pages | 39a | Medium | High | Test with 3 configs; add unit test |
| RBAC wiring blocks existing users | 39a | Medium | High | Default-permissive; test with admin role |
| Detail page performance with 10K+ records | 39b | Low | Medium | Fetch on mount; paginate relations |
| Parallel `Meter/` codebase confusion | 40 | High | Medium | Document as reference only; don't merge |
| Invoice generation complexity | 42 | Medium | High | Start with simple tariff engine; iterate |
| ServiceConnection migration breaks existing | 42 | High | High | Phase migration; keep backward compat |

---

## Acceptance Criteria (Phase 40)

- [ ] Admin customers page shows correct customer data
- [ ] Dashboard customers page exists with sidebar entry
- [ ] Customer create/edit forms submit successfully
- [ ] Toast notifications appear on all mutations
- [ ] Customer detail page shows with tabs
- [ ] All customer mutations audited via AuditEntry
- [ ] Customer routes require "admin" or "operator" role
- [ ] Meter detail page exists
- [ ] Invoice detail page exists
- [ ] 26 database indexes added
- [ ] 6 unprotected routes get Zod validation
- [ ] Customer CSV export works
- [ ] Build passes with 0 errors
- [ ] Screenshots captured (100+ new)
- [ ] AI memory updated
- [ ] All reports generated and pushed
