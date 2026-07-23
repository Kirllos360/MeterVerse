# Dependency Heat Map

## Risk Levels
| Level | Meaning |
|-------|---------|
| **BLOCKED** | Cannot start until predecessor completes |
| **HIGH** | Strong coupling; changes likely to break |
| **MEDIUM** | Moderate coupling; coordinate changes |
| **LOW** | Weak coupling; safe to work independently |
| **INDEPENDENT** | No dependencies; can work anytime |

## Current Task Heat Map

| Task | Risk | Depends On | Blocks | Notes |
|------|:----:|------------|--------|-------|
| T01 - Tasks Kanban | INDEPENDENT | - | - | Standalone feature |
| T02 - Search API | LOW | Customer, Meter, Invoice models | T03 | Search indexes exist |
| T03 - Command Palette | LOW | T02 Search API | - | UI-only after search |
| T04 - User Preferences | INDEPENDENT | User model | - | Standalone feature |
| T05 - WebSocket Gateway | LOW | Auth middleware | - | Mostly independent |
| T06 - Email Delivery | MEDIUM | SMTP config, templates | - | Awaits provider creds |
| T07 - SMS Service | MEDIUM | Twilio/Vonage config | - | Awaits provider creds |
| T08 - Push Notifications | MEDIUM | Firebase config | - | Awaits provider creds |
| T09 - Unit Tests | HIGH | All models, all services | - | Touches everything |
| T10 - API Tests | HIGH | All routes | - | Touches everything |
| T11 - Playwright Auth | MEDIUM | Frontend pages | T12 | Auth pages first |
| T12 - Playwright Page | HIGH | T11 | - | Depends on auth |
| T13 - Test Pipeline | MEDIUM | T09-T12 | - | Integration later |
| T14 - Accessibility | LOW | UI components | - | Mostly independent |
| T15 - Lighthouse | LOW | Frontend build | - | Mostly independent |
| T16 - Production Build | LOW | Frontend | - | Standard build |
| T17 - requirePermission | HIGH | All route files | - | Touches 13/21 routes |
| T18 - requireRole cleanup | HIGH | T17 | - | After permission migration |
| T19 - Status Audit | LOW | - | - | Read-only analysis |
| T20 - Error Standards | MEDIUM | All APIs | - | Touches all endpoints |
| T21 - Audit Coverage | MEDIUM | T17 | - | Permission-dependent |
| T22-T28 - Admin Panels | MEDIUM | Permission engine | - | Various dependencies |
| T28 - System Config Hub | HIGH | T22-T27 | - | Depends on all panels |
| Phase 43c - Documents | MEDIUM | File storage | - | Infrastructure needed |
| Phase 44a - Tariff Engine | HIGH | Meter Type, Area | 44b | Core billing dependency |
| Phase 44b - Billing Pipeline | BLOCKED | 44a Tariff Engine | 44c | Cannot start without tariff |
| Phase 44c - Collections | BLOCKED | 44b Billing Pipeline | 44d | Invoices must exist |
| Phase 44d - Billing Compliance | BLOCKED | 44c | - | Last in billing chain |
| Phase 48a - Customer Ledger | HIGH | Invoice, Payment | 48b | Core financial dependency |
| Phase 48b - Accountant Ledger | BLOCKED | 48a | 48c | Depends on customer ledger |
| Phase 48c - Payment Center | BLOCKED | 48a, 48b | 48d | Depends on both ledgers |
| Phase 48d - Collection Automation | BLOCKED | 48c | 48e | Depends on payment center |
| Phase 49a - SYMBIOT Integration | HIGH | SYMBIOT API docs | 49b | Blocked on external docs |
| Phase 50a - Multi-Area Infra | MEDIUM | All per-area configs | - | Coordination needed |
| Phase 51a - Smart Alerts | MEDIUM | AI Engine | 51b | AI foundation needed |

## Dependency Flow
```
T01(IND)  T04(IND)
  |
T02(LOW) ---> T03(LOW)
  |
T05(LOW) ---> T06(MED) ---> T07(MED) ---> T08(MED)
  |
T17(HIGH) ---> T18(HIGH) ---> T21(MED)
  |
  +-- T09(HIGH) ---> T10(HIGH) ---> T13(MED)
  |
  +-- T11(MED) ---> T12(HIGH)
  |
  +-- T22-T27(MED) ---> T28(HIGH)

Phase 44a(HIGH) ---> 44b(BLOCK) ---> 44c(BLOCK) ---> 44d(BLOCK)
Phase 48a(HIGH) ---> 48b(BLOCK) ---> 48c(BLOCK) ---> 48d(BLOCK)
Phase 49a(HIGH) ---> 49b(MED) ---> 49c(MED)
```

## Rules
1. BLOCKED items must be explicitly unblocked before any work starts
2. HIGH items require approval before parallel work
3. INDEPENDENT items can be picked up by any developer anytime
4. Update after every phase completion

---
*Last updated: 2026-07-23*
