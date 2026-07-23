# Feature Lifecycle

## Lifecycle Stages
Idea -> Approved -> Planning -> Architecture -> Development -> Testing -> Review -> Production -> Deprecated -> Archived

## Feature Registry

| Feature | Stage | Wave | Owner | Dependencies | Since |
|---------|-------|:----:|-------|-------------|:-----:|
| Customer CRUD | Production | W01 | EOX Engineering | - | 2026-Q1 |
| Meter CRUD | Production | W01 | EOX Engineering | Customer | 2026-Q1 |
| Invoice Generation | Production | W01 | EOX Engineering | Customer, Meter, Reading | 2026-Q1 |
| Permission Engine | Production | W01 | EOX Engineering | User | 2026-Q1 |
| WebSocket Gateway | Production | 43b | EOX Engineering | Auth | 2026-Q2 |
| Tasks Kanban | Production | 43a | EOX Engineering | User, Permission | 2026-Q2 |
| Search API | Production | 43a | EOX Engineering | Customer, Meter, Invoice | 2026-Q2 |
| Command Palette | Production | 43a | EOX Engineering | Search | 2026-Q2 |
| User Preferences | Production | 43a | EOX Engineering | User | 2026-Q2 |
| Email Engine | Testing | 43b | EOX Engineering | SMTP Config | 2026-Q2 |
| SMS Engine | Testing | 43b | EOX Engineering | Twilio/Vonage | 2026-Q2 |
| Push Notifications | Testing | 43b | EOX Engineering | Firebase | 2026-Q2 |
| Document Management | Planning | 43c | EOX Engineering | File Storage | 2026-Q2 |
| Tariff Engine | Planning | 44a | EOX Engineering | Meter Type, Area | 2026-Q2 |
| Billing Pipeline | Planning | 44b | EOX Engineering | Tariff, Invoice | 2026-Q2 |
| Bill Run | Planning | 44b | EOX Engineering | Billing Pipeline | 2026-Q2 |
| Collections Engine | Idea | 44c | EOX Engineering | Payment | 2026-Q2 |
| Customer Ledger | Idea | 48a | TBD | Invoice, Payment | - |
| Accountant Ledger | Idea | 48b | TBD | Customer Ledger | - |
| Payment Center | Idea | 48c | TBD | Ledger, Collections | - |
| SYMBIOT Sync | Idea | 49a | TBD | Reading, Meter | - |
| Meter Control Center | Idea | 49b | TBD | Meter, SYMBIOT | - |
| SIM Card Management | Idea | 49c | TBD | Meter | - |
| AI Forecasting | Idea | 46a | TBD | Reading, Analytics | - |
| Smart Alerts | Idea | 51a | TBD | AI Engine | - |
| Chat Engine | Idea | 51b | TBD | AI Engine | - |
| Customer Portal | Idea | 47a | TBD | Invoice, Payment | - |
| Field Ops Mobile | Idea | 47a | TBD | Meter, Reading | - |
| Arabic UI | Idea | 50b | TBD | UI Framework | - |
| Multi-Area Reports | Idea | 50d | TBD | All Areas | - |
| System Config Hub | Development | 43d | EOX Engineering | Permission | 2026-Q2 |
| Admin Control Panels | Development | 43d | EOX Engineering | System Config | 2026-Q2 |

## Lifecycle Rules
1. No feature skips stages - each must pass through every stage
2. Gate check required at every transition (see Definition of Done)
3. Production = all Definition of Done checks pass
4. Deprecated = no active development, existing users still supported
5. Archived = removed from codebase, kept in git history + Feature Registry

---
*Last updated: 2026-07-23*
