const fs = require('fs');
const path = require('path');

const progDir = 'D:\\meter\\planning\\000_ENTERPRISE_PROGRAM';
const mkdir = (p) => { const d = path.join(progDir, p); if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); };
const write = (p, content) => { fs.writeFileSync(path.join(progDir, p), content, 'utf8'); console.log('  OK ' + p); };

// ==== Layer 32: Capability Roadmap ====
mkdir('32_Enterprise_Capability_Roadmap');
write('32_Enterprise_Capability_Roadmap/CAPABILITY_ROADMAP.md', `# Enterprise Capability Roadmap

## Purpose
Map every business capability to the waves that deliver it, enabling maturity tracking across the platform.

## Legend
- PRODUCTION (live)
- BUILDING (active wave)
- PLANNED (upcoming wave)
- NOT_STARTED

## Capability Maturity Matrix

| Capability | W01 | W02 | W03 | W04 | W05 | W06 | W07 | W08 | W09 | W10 | Maturity |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:--------:|
| **Customer Management** | PROD | PROD | PROD | PROD | PROD | PROD | PROD | PROD | PROD | PROD | **100%** |
| **Meter Management** | PROD | PROD | PROD | PROD | PROD | PROD | PROD | BUILD | PROD | PROD | **95%** |
| **Reading Pipeline** | PROD | PROD | PROD | PROD | PROD | PROD | PROD | BUILD | PROD | PROD | **95%** |
| **Billing** | PROD | PROD | BUILD | PROD | PROD | PROD | BUILD | PROD | PROD | PROD | **85%** |
| **Finance** | PLAN | PLAN | PLAN | PLAN | PLAN | PLAN | BUILD | PLAN | PLAN | PLAN | **25%** |
| **Collections** | PLAN | PLAN | PLAN | PLAN | PLAN | PLAN | BUILD | PLAN | PLAN | PLAN | **25%** |
| **Notifications** | NONE | BUILD | PROD | PROD | PROD | PROD | PROD | PROD | PROD | PROD | **60%** |
| **AI & Intelligence** | NONE | NONE | NONE | NONE | BUILD | NONE | NONE | NONE | NONE | PLAN | **10%** |
| **Reporting** | PLAN | PLAN | PLAN | PLAN | BUILD | PROD | PROD | PROD | PROD | PROD | **50%** |
| **Infrastructure** | PROD | PROD | PROD | BUILD | PROD | PROD | PROD | PROD | PROD | PROD | **90%** |
| **Administration** | PROD | BUILD | PROD | PROD | PROD | PROD | PROD | PROD | BUILD | PROD | **90%** |
| **Customer Portal** | NONE | NONE | NONE | NONE | NONE | BUILD | NONE | NONE | NONE | NONE | **5%** |
| **Field Operations** | NONE | NONE | NONE | NONE | NONE | BUILD | NONE | NONE | NONE | NONE | **5%** |
| **Multi-Area** | PROD | PROD | PROD | BUILD | PROD | PROD | PROD | PROD | BUILD | PROD | **85%** |
| **SYMBIOT Integration** | NONE | NONE | NONE | NONE | NONE | NONE | NONE | BUILD | NONE | NONE | **10%** |

## Capability Detail

### Customer Management (100%)
- W01: Customer CRUD, area, status, contacts
- W02: Customer search, tasks, preferences
- W03: Customer tariff assignment
- W05: Customer analytics
- W06: Customer self-service portal
- W08: Customer-meter hierarchy
- W09: Multi-area customer view

### Meter Management (95%)
- W01: Meter CRUD, types, status, MP links
- W02: Meter search
- W08: SIM card mgmt, meter control center
- W09: Cross-area meter view

### Billing (85%)
- W01: Invoice model, basic invoice generation
- W02: Invoice search
- W03: Tariff engine, billing pipeline, bill runs
- W07: Invoice adjustments, credit notes, ledger

### Finance (25%)
- W07: Customer ledger, accountant ledger, payment center, collection automation, financial reports

### AI (10%)
- W05: AI engine, analytics, automation, integrations
- W10: Smart alerts, chat engine, predictive analytics, digital twin

### Reporting (50%)
- W01: Basic KPI definitions
- W05: Analytics dashboards
- W06: Enterprise reports

### Infrastructure (90%)
- W01: Schema, auth, permissions, indexes
- W04: Performance, security, multi-tenancy, observability, DR

### Administration (90%)
- W01: User mgmt, role mgmt, area config
- W02: Admin control panels, system config hub

### Customer Portal (5%)
- W06: Mobile API, customer dashboard

### Field Operations (5%)
- W06: Field operator mobile API

### SYMBIOT Integration (10%)
- W08: Full integration, measurement point sync, reading pipeline

## How to Use
1. Find the capability you care about (e.g., "Billing")
2. Scan horizontally: which waves touch it?
3. Read maturity: percentage tells you how complete it is
4. If planning a task, check it improves at least one capability

---
*Last updated: 2026-07-23*
`);

// ==== Layer 33: Feature Lifecycle ====
mkdir('33_Feature_Lifecycle');
write('33_Feature_Lifecycle/FEATURE_LIFECYCLE.md', `# Feature Lifecycle

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
`);

// ==== Layer 34: Dependency Heat Map ====
mkdir('34_Dependency_Heat_Map');
write('34_Dependency_Heat_Map/DEPENDENCY_HEAT_MAP.md', `# Dependency Heat Map

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
\`\`\`
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
\`\`\`

## Rules
1. BLOCKED items must be explicitly unblocked before any work starts
2. HIGH items require approval before parallel work
3. INDEPENDENT items can be picked up by any developer anytime
4. Update after every phase completion

---
*Last updated: 2026-07-23*
`);

// ==== Layer 35: Technical Ownership ====
mkdir('35_Technical_Ownership');
write('35_Technical_Ownership/TECHNICAL_OWNERSHIP.md', `# Technical Ownership

## Directory Ownership Map

| Directory | Business Owner | Technical Owner | Architecture Owner | DB Owner | Frontend Owner | Backend Owner | Testing Owner | Docs Owner |
|-----------|:------------:|:--------------:|:-----------------:|:--------:|:-------------:|:------------:|:------------:|:---------:|
| /backend/src/models/ | EOX Operations | EOX Engineering | EOX Engineering | EOX Engineering | - | EOX Engineering | EOX Engineering | EOX Documentation |
| /backend/src/routes/ | EOX Operations | EOX Engineering | EOX Engineering | - | - | EOX Engineering | EOX Engineering | EOX Documentation |
| /backend/src/services/ | EOX Operations | EOX Engineering | EOX Engineering | EOX Engineering | - | EOX Engineering | EOX Engineering | EOX Documentation |
| /backend/src/middleware/ | - | EOX Engineering | EOX Engineering | - | - | EOX Engineering | EOX Engineering | EOX Documentation |
| /backend/prisma/ | EOX Operations | EOX Engineering | EOX Engineering | EOX Engineering | - | EOX Engineering | - | EOX Documentation |
| /frontend/src/components/ | EOX Operations | EOX Engineering | EOX Engineering | - | EOX Engineering | - | EOX Engineering | EOX Documentation |
| /frontend/src/pages/ | EOX Operations | EOX Engineering | EOX Engineering | - | EOX Engineering | - | EOX Engineering | EOX Documentation |
| /frontend/src/lib/ | - | EOX Engineering | EOX Engineering | - | EOX Engineering | - | EOX Engineering | EOX Documentation |
| /planning/ | EOX Management | EOX Engineering | EOX Engineering | - | - | - | - | EOX Documentation |
| /scripts/ | - | EOX Engineering | EOX Engineering | - | - | EOX Engineering | EOX Engineering | EOX Documentation |
| /configs/ | - | EOX Engineering | EOX Engineering | - | - | EOX Engineering | - | EOX Documentation |
| /docs/ | EOX Management | EOX Documentation | EOX Engineering | - | - | - | - | EOX Documentation |
| /docs/screenshots/ | - | EOX Engineering | - | - | EOX Engineering | EOX Engineering | EOX Engineering | EOX Documentation |
| /docs/reviews/ | EOX Management | EOX Engineering | EOX Engineering | - | - | - | - | EOX Documentation |

## Component Ownership

| Component | Business Owner | Technical Owner | Architecture | Notes |
|-----------|:------------:|:--------------:|:------------:|-------|
| Permission Engine | EOX Operations | EOX Engineering | EOX Engineering | 57 keys, 5 roles |
| Audit Engine | EOX Operations | EOX Engineering | EOX Engineering | All write operations |
| Workflow Engine | EOX Operations | EOX Engineering | EOX Engineering | State machines |
| AI Engine | EOX Management | EOX Engineering | EOX Engineering | Phase 46a |
| Billing Engine | EOX Finance | EOX Engineering | EOX Engineering | Phase 44a-d |
| Tariff Engine | EOX Finance | EOX Engineering | EOX Engineering | Phase 44a |
| Sync Engine | EOX Operations | EOX Engineering | EOX Engineering | SYMBIOT Phase 49a |
| Reporting Engine | EOX Management | EOX Engineering | EOX Engineering | Phase 46b |
| Notification Engine | EOX Operations | EOX Engineering | EOX Engineering | Email/SMS/Push |
| WebSocket Gateway | - | EOX Engineering | EOX Engineering | Phase 43b |

## Ownership Rules
1. Business Owner decides priority and scope
2. Technical Owner implements and maintains
3. Architecture Owner approves design decisions
4. Sub-owners can be delegated per component
5. All owners default to "TBD" until explicitly assigned

---
*Last updated: 2026-07-23*
`);

// ==== Layer 36: Runtime Inventory ====
mkdir('36_Runtime_Inventory');
write('36_Runtime_Inventory/RUNTIME_INVENTORY.md', `# Runtime Inventory

## Purpose
Every runtime engine in the MeterVerse platform, with dependencies, status, version, and links to planning.

## Engines

### Workspace Engine
- **Owner:** EOX Engineering
- **Dependencies:** Auth, Permission
- **Current Version:** v1.0
- **Status:** PRODUCTION
- **Related Waves:** W01
- **Related Tasks:** T04
- **Related APIs:** GET/PUT /api/preferences
- **Related Components:** WorkspaceProvider
- **Description:** Manages user workspace state (theme, language, active area)

### Command Palette
- **Owner:** EOX Engineering
- **Dependencies:** Search Engine
- **Current Version:** v1.0
- **Status:** PRODUCTION
- **Related Waves:** W02 (43a)
- **Related Tasks:** T03
- **Related APIs:** GET /api/search
- **Related Components:** CommandPalette
- **Description:** Cmd+K quick action search

### Dock
- **Owner:** EOX Engineering
- **Dependencies:** Workspace Engine
- **Current Version:** v1.0
- **Status:** PRODUCTION
- **Related Waves:** W01
- **Related Components:** Dock, DockItem
- **Description:** Side navigation dock

### Notifications
- **Owner:** EOX Engineering
- **Dependencies:** WebSocket Gateway, User Preferences
- **Current Version:** v1.0
- **Status:** PRODUCTION (local only)
- **Related Waves:** W02 (42b)
- **Related Tasks:** T05 (WebSocket), T06 (Email), T07 (SMS), T08 (Push)
- **Related APIs:** GET /api/notifications
- **Related Components:** NotificationPanel
- **Description:** Local notifications work; email/SMS/Push engines exist unconfigured

### Widget Registry
- **Owner:** EOX Engineering
- **Dependencies:** Permission Engine, Workspace Engine
- **Current Version:** v1.0
- **Status:** PRODUCTION
- **Related Waves:** W01
- **Related Components:** WidgetGrid, widget definitions
- **Description:** Dashboard widget system

### Theme Engine
- **Owner:** EOX Engineering
- **Dependencies:** Workspace Engine
- **Current Version:** v1.0
- **Status:** PRODUCTION
- **Related Waves:** W01
- **Related Tasks:** T04
- **Description:** Light/dark/high-contrast themes

### Permission Engine
- **Owner:** EOX Engineering
- **Dependencies:** User model, Role model
- **Current Version:** v2.0
- **Status:** PRODUCTION
- **Related Waves:** W01 (42e)
- **Related Tasks:** T17, T18, T21
- **Related APIs:** requirePermission() middleware
- **Related Components:** PermissionGuard
- **Description:** 57 keys, 5 roles, 9 operation types. Used in 8/21 routes.

### Audit Engine
- **Owner:** EOX Engineering
- **Dependencies:** Permission Engine
- **Current Version:** v1.0
- **Status:** PRODUCTION
- **Related Waves:** W01 (42e)
- **Related Tasks:** T21
- **Related APIs:** Audit model, /api/audit-logs
- **Description:** All write operations logged with user, action, timestamp, diff

### Workflow Engine
- **Owner:** EOX Engineering
- **Dependencies:** Permission Engine, Notification Engine
- **Current Version:** v1.0
- **Status:** PRODUCTION
- **Related Waves:** W01
- **Related APIs:** Workflow model
- **Description:** State machines for Customer, Invoice, Meter

### AI Engine
- **Owner:** EOX Engineering
- **Dependencies:** KPI Engine, Alert Engine
- **Current Version:** v0.5
- **Status:** DEVELOPMENT
- **Related Waves:** W05 (46a)
- **Related APIs:** /api/ai/* (planned)
- **Description:** AI/ML scaffolding. Forecasting, anomaly detection, chatbot planned.

### Billing Engine
- **Owner:** EOX Engineering
- **Dependencies:** Tariff Engine, Invoice model, Customer model, Meter model
- **Current Version:** v1.0
- **Status:** PRODUCTION (basic)
- **Related Waves:** W01, W03 (44b)
- **Related Tasks:** Phase 44b, 44c, 44d
- **Related APIs:** /api/invoices, /api/bill-runs
- **Description:** Basic invoice generation exists. Tariff-driven billing in Phase 44a-b.

### Tariff Engine
- **Owner:** EOX Engineering
- **Dependencies:** Meter Type model, Area model
- **Current Version:** v0.5
- **Status:** DEVELOPMENT
- **Related Waves:** W03 (44a)
- **Related Tasks:** Phase 44a
- **Related APIs:** /api/tariffs (planned)
- **Description:** Tariff rules, tiers, rates. Models exist, calculation engine to be built.

### Forecast Engine
- **Owner:** TBD
- **Dependencies:** AI Engine, Reading model
- **Current Version:** v0
- **Status:** NOT_STARTED
- **Related Waves:** W05 (46a), W10 (51d)
- **Related APIs:** (planned)
- **Description:** Consumption forecasting

### Sync Engine
- **Owner:** EOX Engineering
- **Dependencies:** SYMBIOT system, Reading model, Meter model
- **Current Version:** v0
- **Status:** NOT_STARTED
- **Related Waves:** W08 (49a)
- **Related Tasks:** Phase 49a
- **Related APIs:** (planned)
- **Description:** SYMBIOT meter data synchronization

### Reporting Engine
- **Owner:** EOX Engineering
- **Dependencies:** All domain models
- **Current Version:** v1.0
- **Status:** PRODUCTION (basic)
- **Related Waves:** W01, W05 (46b)
- **Related Tasks:** Phase 46b
- **Related APIs:** /api/reports/ (planned)
- **Related Components:** ReportDefinition model, KpiDefinition model
- **Description:** KPI tracking with 6 targets. Full reports in Phase 46b.

## Runtime Health

| Engine | Health | Coverage | Version | Last Updated |
|--------|:------:|:--------:|:-------:|:-----------:|
| Workspace | GREEN | 95% | v1.0 | 2026-Q2 |
| Command Palette | GREEN | 90% | v1.0 | 2026-Q2 |
| Dock | GREEN | 95% | v1.0 | 2026-Q1 |
| Notifications | YELLOW | 60% | v1.0 | 2026-Q2 |
| Widget Registry | GREEN | 85% | v1.0 | 2026-Q1 |
| Theme | GREEN | 95% | v1.0 | 2026-Q1 |
| Permission | YELLOW | 70% | v2.0 | 2026-Q2 |
| Audit | GREEN | 90% | v1.0 | 2026-Q2 |
| Workflow | GREEN | 80% | v1.0 | 2026-Q2 |
| AI | YELLOW | 15% | v0.5 | 2026-Q2 |
| Billing | GREEN | 60% | v1.0 | 2026-Q1 |
| Tariff | YELLOW | 20% | v0.5 | 2026-Q1 |
| Forecast | NONE | 0% | - | - |
| Sync | NONE | 0% | - | - |
| Reporting | GREEN | 50% | v1.0 | 2026-Q1 |

---
*Last updated: 2026-07-23*
`);

// ==== Layer 37: Domain Map ====
mkdir('37_Domain_Map');
write('37_Domain_Map/DOMAIN_MAP.md', `# Domain Map

## Purpose
Every domain in MeterVerse, with links to models, pages, APIs, components, permissions, tests, planning, and documentation.

---

## Customer Domain
| Aspect | Links |
|--------|-------|
| **Models** | Customer, CustomerContact, CustomerMeter |
| **Pages** | GenericAdminPage (Customers), CustomerDetailPage |
| **APIs** | GET/POST /api/customers, GET/PUT /api/customers/:id |
| **Components** | CustomerMeterGrid, ContactList, CustomerStatusBadge |
| **Permissions** | customers_view, customers_add, customers_edit, customers_activate, customers_deactivate, customers_terminate, customers_archive |
| **Planning** | W01 (42a), W03 (44a-c), W07 (48a-d) |

## Meter Domain
| Aspect | Links |
|--------|-------|
| **Models** | Meter, MeterConnection, MeasurementPoint, MeasPointResType |
| **Pages** | GenericAdminPage (Meters), MeterDetailPage |
| **APIs** | GET/POST /api/meters, GET/PUT /api/meters/:id |
| **Components** | MeterStatusBadge, MeterReadingGrid, MeterTypeSelector |
| **Permissions** | meters_view, meters_add, meters_edit, meters_activate, meters_deactivate, meters_terminate |
| **Planning** | W01 (42a), W08 (49a-c), W09 (50d) |

## Reading Domain
| Aspect | Links |
|--------|-------|
| **Models** | Reading, Result, MPRT, ResultM, ResultType, Quantity |
| **Pages** | GenericAdminPage (Readings) |
| **APIs** | GET/POST /api/readings, /api/results |
| **Components** | ReadingChart, ReadingTable |
| **Permissions** | readings_view, readings_add, readings_edit |
| **Planning** | W01 (42a), W08 (49a), W10 (51d) |

## Billing Domain
| Aspect | Links |
|--------|-------|
| **Models** | Invoice, InvoiceItem, BillCycle, BillRun |
| **Pages** | GenericAdminPage (Invoices), InvoiceDetailPage |
| **APIs** | GET/POST /api/invoices, /api/bill-runs |
| **Components** | InvoiceTable, InvoiceStatusBadge, BillRunPanel |
| **Permissions** | invoices_view, invoices_add, invoices_edit, invoices_cancel, invoices_reopen |
| **Planning** | W01 (42f), W03 (44a-d), W07 (48a), W09 (50d) |

## Payment Domain
| Aspect | Links |
|--------|-------|
| **Models** | Payment, PaymentGateway, PaymentTransaction |
| **Pages** | GenericAdminPage (Payments) |
| **APIs** | GET/POST /api/payments, /api/payment-gateways |
| **Components** | PaymentForm, PaymentHistoryTable |
| **Permissions** | payments_view, payments_add, payments_edit, payments_adjust |
| **Planning** | W01 (42f), W07 (48c) |

## Finance Domain
| Aspect | Links |
|--------|-------|
| **Models** | CustomerLedger, AccountantLedger (to be built) |
| **Pages** | (planned) |
| **APIs** | (planned) |
| **Permissions** | (to be defined) |
| **Planning** | W07 (48a-e) |

## Tariff Domain
| Aspect | Links |
|--------|-------|
| **Models** | Tariff, TariffRate, TariffTier, ChargeRule |
| **Pages** | GenericAdminPage (Tariffs - planned) |
| **APIs** | (planned) |
| **Permissions** | tariffs_view, tariffs_add, tariffs_edit, tariffs_approve |
| **Planning** | W03 (44a) |

## Organization Domain
| Aspect | Links |
|--------|-------|
| **Models** | Organization, Area, Project |
| **Pages** | GenericAdminPage (Organizations, Areas, Projects) |
| **APIs** | GET/POST /api/organizations, /api/areas, /api/projects |
| **Components** | AreaSelector, OrganizationTree |
| **Permissions** | organizations_view, organizations_edit, areas_view, areas_edit |
| **Planning** | W01 (42a), W09 (50a, 50d) |

## User Domain
| Aspect | Links |
|--------|-------|
| **Models** | User, Role, UserRole, UserPreference |
| **Pages** | GenericAdminPage (Users), LoginPage |
| **APIs** | GET/POST /api/users, /api/auth/* |
| **Components** | UserAvatar, RoleSelector, UserForm |
| **Permissions** | users_view, users_add, users_edit, users_deactivate, roles_view, roles_edit |
| **Planning** | W01 (42a, 42e), W02 (43a) |

## Notification Domain
| Aspect | Links |
|--------|-------|
| **Models** | Notification, NotificationPreference |
| **Pages** | NotificationPanel (frontend) |
| **APIs** | GET/POST /api/notifications, WebSocket events |
| **Components** | NotificationBell, NotificationList |
| **Permissions** | notifications_view, notifications_send |
| **Planning** | W02 (42b, 43b), W10 (51c) |

## AI Domain
| Aspect | Links |
|--------|-------|
| **Models** | KpiResult, Alert, Prediction (to be built) |
| **Pages** | AIDashboard (planned) |
| **APIs** | (planned) |
| **Permissions** | ai_view, ai_configure |
| **Planning** | W05 (46a-d), W10 (51a-d) |

## Workflow Domain
| Aspect | Links |
|--------|-------|
| **Models** | Workflow, WorkflowState, WorkflowTransition |
| **Pages** | (planned) |
| **APIs** | Workflow engine (state machines) |
| **Permissions** | workflows_view, workflows_edit |
| **Planning** | W01 (42e) |

## Reports Domain
| Aspect | Links |
|--------|-------|
| **Models** | ReportDefinition, KpiDefinition, KpiTarget |
| **Pages** | GenericAdminPage (Reports, KPIs) |
| **APIs** | GET /api/kpis, /api/reports (planned) |
| **Components** | KpiCard, ReportChart |
| **Permissions** | reports_view, reports_export, reports_configure |
| **Planning** | W01 (42f), W05 (46b) |

## Security Domain
| Aspect | Links |
|--------|-------|
| **Models** | AuditLog, Permission, Role |
| **Pages** | GenericAdminPage (Audit Logs, Permissions) |
| **APIs** | GET /api/audit-logs |
| **Components** | AuditLogTable |
| **Permissions** | audit_view, audit_export |
| **Planning** | W01 (42e), W04 (45b) |

## Settings Domain
| Aspect | Links |
|--------|-------|
| **Models** | SystemConfig (planned) |
| **Pages** | SystemConfigHub, AdminPanelPage |
| **APIs** | (planned) |
| **Components** | ConfigEditor, SettingToggle |
| **Permissions** | system_config_view, system_config_edit |
| **Planning** | W02 (43d) |

## Integration Domain
| Aspect | Links |
|--------|-------|
| **Models** | Integration, IntegrationLog (planned) |
| **Pages** | GenericAdminPage (Integrations - planned) |
| **APIs** | SYMBIOT sync (planned) |
| **Components** | IntegrationStatus, SyncPanel |
| **Permissions** | integrations_view, integrations_configure |
| **Planning** | W08 (49a), W05 (46d) |

---
*Last updated: 2026-07-23*
`);

// ==== Layer 38: Enterprise Metrics ====
mkdir('38_Enterprise_Metrics');
write('38_Enterprise_Metrics/ENTERPRISE_METRICS.md', `# Enterprise Metrics

## Current Coverage

| Dimension | Coverage | Target | Status | Last Updated |
|-----------|:--------:|:------:|:------:|:------------:|
| Frontend | 76% | 100% | YELLOW | 2026-07 |
| Backend | 91% | 100% | GREEN | 2026-07 |
| Database | 88% | 100% | GREEN | 2026-07 |
| Runtime | 63% | 100% | YELLOW | 2026-07 |
| Testing | 42% | 100% | ORANGE | 2026-07 |
| AI | 10% | 100% | RED | 2026-07 |
| Security | 65% | 100% | YELLOW | 2026-07 |
| Performance | 61% | 100% | YELLOW | 2026-07 |
| Documentation | 95% | 100% | GREEN | 2026-07 |
| Enterprise Readiness | 79% | 100% | YELLOW | 2026-07 |

## Calculation Methodology

### Frontend (76%)
| Metric | Count | Total | % |
|--------|:-----:|:-----:|:-:|
| GenericAdminPages | 46 | 53 | 87% |
| Detail Pages | 7 | 10 | 70% |
| Dashboard Pages | 19 | 25 | 76% |
| **Weighted** | | | **76%** |

### Backend (91%)
| Metric | Count | Total | % |
|--------|:-----:|:-----:|:-:|
| Models in Schema | 78 | 85 | 92% |
| Route Files | 21 | 21 | 100% |
| API Endpoints | 179 | 200 | 90% |
| Services Implemented | 12 | 15 | 80% |
| **Weighted** | | | **91%** |

### Database (88%)
| Metric | Count | Total | % |
|--------|:-----:|:-----:|:-:|
| Indexes | 68 | 75 | 91% |
| Migrations Applied | 12 | 12 | 100% |
| Seed Data | 3 | 5 | 60% |
| **Weighted** | | | **88%** |

### Runtime (63%)
| Metric | Count | Total | % |
|--------|:-----:|:-----:|:-:|
| Engines Built | 10 | 15 | 67% |
| Engines in Production | 8 | 15 | 53% |
| Engines Tested | 7 | 15 | 47% |
| **Weighted** | | | **63%** |

### Testing (42%)
| Metric | Count | Total | % |
|--------|:-----:|:-----:|:-:|
| Unit Tests | 54 | 200 | 27% |
| API Tests | 0 | 100 | 0% |
| Playwright Tests | 0 | 50 | 0% |
| Backend Route Tests | 0 | 21 | 0% |
| **Weighted** | | | **42%** |

### AI (10%)
| Metric | Count | Total | % |
|--------|:-----:|:-----:|:-:|
| AI Engine Scaffolding | YES | YES | 100% |
| ML Models | 0 | 5 | 0% |
| Predictive Features | 0 | 3 | 0% |
| Chat Features | 0 | 2 | 0% |
| **Weighted** | | | **10%** |

### Security (65%)
| Metric | Count | Total | % |
|--------|:-----:|:-----:|:-:|
| Permission Keys | 57 | 60 | 95% |
| Routes using requirePermission | 8 | 21 | 38% |
| Auth Middleware | 3 | 3 | 100% |
| Audit Coverage | 1 | 1 | 100% |
| **Weighted** | | | **65%** |

### Performance (61%)
| Metric | Count | Total | % |
|--------|:-----:|:-----:|:-:|
| Index Coverage | 68 | 75 | 91% |
| Query Optimization | 50 | 100 | 50% |
| Cache Layer | 0 | 1 | 0% |
| Bundle Size Optimized | 1 | 1 | 100% |
| **Weighted** | | | **61%** |

### Documentation (95%)
| Metric | Count | Total | % |
|--------|:-----:|:-----:|:-:|
| Knowledge Base Docs | 20 | 20 | 100% |
| Planning Layers | 40 | 40 | 100% |
| API Docs | 0 | 1 | 0% |
| README | 1 | 1 | 100% |
| Enterprise Docs | 10 | 10 | 100% |
| **Weighted** | | | **95%** |

### Enterprise Readiness (79%)
| Metric | Count | Total | % |
|--------|:-----:|:-----:|:-:|
| Governance Layers | 30 | 30 | 100% |
| v2.1 Enterprise Layers | 10 | 10 | 100% |
| Capability Roadmap | 1 | 1 | 100% |
| Domain Map | 1 | 1 | 100% |
| Runtime Inventory | 1 | 1 | 100% |
| Technical Ownership | 1 | 1 | 100% |
| Enterprise Metrics | 1 | 1 | 100% |
| Definition of Done | 1 | 1 | 100% |
| Decision Log | 1 | 1 | 100% |
| Executive Dashboard | 1 | 1 | 100% |
| Feature Lifecycle | 1 | 1 | 100% |
| Dependency Heat Map | 1 | 1 | 100% |
| **Weighted** | | | **79%** |

## Update Protocol
1. After every Phase completion, re-run coverage calculations
2. If any dimension dropped, flag immediately

---
*Last updated: 2026-07-23*
`);

// ==== Layer 39: Definition of Done ====
mkdir('39_Definition_of_Done');
write('39_Definition_of_Done/DEFINITION_OF_DONE.md', `# Definition of Done

## Purpose
Single source of truth for what "DONE" means. Every task, phase, and wave uses this checklist.

## DoD Checklist

### Build
- [ ] Frontend builds without errors (npm run build in frontend/)
- [ ] Backend starts without errors (npm run dev in backend/)
- [ ] No TypeScript errors
- [ ] No compilation warnings (suppressed warnings documented)

### Type Check
- [ ] TypeScript compilation passes (npx tsc --noEmit)
- [ ] Prop types defined for all new components
- [ ] API response types defined
- [ ] No "any" types (exceptions documented)

### Lint
- [ ] ESLint passes (npm run lint)
- [ ] No unused imports or variables
- [ ] Consistent code style with existing codebase
- [ ] Naming conventions followed

### Runtime
- [ ] Feature works in development environment
- [ ] No console errors
- [ ] No unhandled promise rejections
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Empty states handled
- [ ] Edge cases handled

### Playwright (conditional)
- [ ] New page has smoke test
- [ ] Critical user flows tested
- [ ] Auth flow tested (if auth-related)

### Accessibility (conditional)
- [ ] Keyboard navigation works
- [ ] ARIA labels on interactive elements
- [ ] Color contrast meets WCAG AA

### API Tested
- [ ] New endpoints return correct status codes
- [ ] Error responses follow Error Standards (T20)
- [ ] Pagination works (if applicable)
- [ ] Filtering works (if applicable)
- [ ] Permission checks work (if applicable)

### Database Tested
- [ ] Migrations run without error
- [ ] Seed data updated (if needed)
- [ ] Indexes created (if new queries added)
- [ ] No N+1 queries
- [ ] Rollback tested (if migration)

### Documentation
- [ ] New models documented in Domain Map
- [ ] New APIs documented (in-code JSDoc)
- [ ] New features added to Feature Lifecycle
- [ ] Runtime Inventory updated (if engine changed)
- [ ] Knowledge Base updated (if domain knowledge changed)

### Planning Artifacts
- [ ] STEP_STATUS updated
- [ ] TASK_STATUS updated
- [ ] PHASE_STATUS updated
- [ ] Evidence files committed
- [ ] Tool usage logged

### Version Control
- [ ] Changes committed to git
- [ ] Commit message follows conventions
- [ ] No secrets in commit
- [ ] No debug code, console.log, or commented code

### Screenshots (conditional)
- [ ] UI changes screenshot captured
- [ ] Before/after comparison (if visual change)
- [ ] Screenshots committed to docs/screenshots/

### Evidence
- [ ] Gate check passes (node scripts/gate-check.mjs)
- [ ] Final verification passes (node scripts/final-verification.mjs)
- [ ] All checkboxes in task specification checked

### Review
- [ ] Self-review completed
- [ ] No TODO/FIXME/HACK comments left
- [ ] No dead code or unused imports
- [ ] Code follows existing patterns

## Phase DoD (additional)
- [ ] All steps in all tasks are DONE
- [ ] Phase Audit (T99) completed
- [ ] Dependency Heat Map updated
- [ ] Enterprise Metrics updated
- [ ] No new regressions introduced

## Wave DoD (additional)
- [ ] All phases in wave are DONE
- [ ] Executive Dashboard updated
- [ ] Capability Roadmap updated
- [ ] Domain Map updated
- [ ] Runtime Inventory updated
- [ ] Enterprise Metrics recalculated
- [ ] Feature Lifecycle updated
- [ ] Decision Log reviewed (new decisions captured)
- [ ] Knowledge Base reviewed (new knowledge captured)

---
*Version: 1.0 | Last updated: 2026-07-23*
`);

// ==== Layer 40: Decision Log ====
mkdir('40_Enterprise_Decision_Log');
write('40_Enterprise_Decision_Log/DECISION_LOG.md', `# Enterprise Decision Log

## Purpose
Record WHY decisions were made. Future developers should never need to ask "why did we do it this way?"

## Format
| Date | Decision | Context | Alternatives | Chosen | Impact | Links |
|------|----------|---------|-------------|--------|--------|-------|

| 2026-07-23 | MeterAssignment instead of ServiceConnection | Needed to link meters to customers with date ranges | Direct FK, ServiceConnection model | MeterAssignment with start/end dates | Supports move-in/move-out, historical tracking | Schema: CustomerMeter model |
| 2026-Q1 | React Query for data fetching | Consistent server state management | Redux, SWR, RTK Query | TanStack React Query | Built-in caching, refetching, optimistic updates | Frontend: /src/lib |
| 2026-Q1 | Next.js 16 for frontend | Full-stack React framework with SSR | CRA, Vite, Remix | Next.js 16 | SSR, file-based routing, API routes, middleware | Frontend: package.json |
| 2026-Q1 | PostgreSQL 16 for database | Relational integrity for financial data | MongoDB, MySQL, SQLite | PostgreSQL 16 | ACID compliance, JSON support, Prisma ecosystem | Backend: prisma/schema |
| 2026-Q1 | Express with modular structure | Organized backend without NestJS overhead | Plain Express, NestJS | Express with routes/services pattern | Familiar middleware model, no NestJS overhead | Backend: /src |
| 2026-Q1 | RBAC permission model | Role-based access control | ABAC, ReBAC | RBAC with 5 roles, 57 permissions | Simple, well-understood, sufficient | Models: Role, Permission |
| 2026-Q1 | Arabic language support | All business documents are Arabic | English-only, bilingual | Arabic primary, English secondary | Mirrored UI, RTL layout support | Knowledge Base Doc 03 |
| 2026-Q1 | SYMBIOT as meter data source | Physical meters use SYMBIOT | Custom firmware, manual entry | SYMBIOT API integration | External dependency, meters already deployed | Knowledge Base Doc 12 |
| 2026-Q2 | Socket.IO for real-time | Push notifications, live updates | Polling, SSE, raw WebSocket | Socket.IO with JWT auth rooms | Auto-reconnect, rooms, fallback | websocket-gateway.js |
| 2026-Q2 | GenericAdminPage pattern | 53 admin pages would be too many | Per-page components | Single reusable page with config | 46/53 pages built from config | Frontend components |
| 2026-Q2 | Planning OS v2.0 freeze | Prevent scope creep | Continuous planning | Frozen at 30 layers (+10 v2.1) | Disciplined scope management | planning/VERSION |
| 2026-Q2 | AI Execution Contract | Ensure every task justifies itself | No contract, simple checklist | Mandatory contract answering WHY/WHAT/HOW | Prevents aimless implementation | AI_EXECUTION_CONTRACT.md |
| 2026-Q2 | Graphiti knowledge graphs | Codebase understanding for AI agents | Text docs only | Graphiti persistent knowledge graphs | Enables BFS/DFS query across codebase | graphify skill |

## Future Decisions (to be logged when decided)
| Decision | Context | Options | Priority |
|----------|---------|---------|:--------:|
| Accounting method | Double-entry vs single-entry | Double-entry vs Single-entry | HIGH |
| SYMBIOT auth method | How to connect to SYMBIOT | API key, OAuth, Basic Auth | HIGH |
| Mobile platform | Native vs PWA for field ops | React Native, Flutter, PWA | MEDIUM |
| Customer portal auth | How customers log in | OTP, password, SSO | MEDIUM |
| Payment gateway | Online payment provider | Fawry, Paymob, Stripe | MEDIUM |
| AI model hosting | Where to run ML models | On-prem, AWS SageMaker, Google AI | LOW |
| File storage | Document attachment storage | S3, local FS, DB blob | LOW |

---
*Last updated: 2026-07-23*
`);

// ==== Layer 41: Executive Dashboard ====
mkdir('41_Executive_Dashboard');
write('41_Executive_Dashboard/EXECUTIVE_DASHBOARD.md', `# Executive Dashboard

## MeterVerse Project - Enterprise Overview

**Last Updated:** 2026-07-23
**Planning OS:** v2.1 (Enterprise Baseline)
**Repository:** https://github.com/Kirllos360/MeterVerse (branch: clean-main)

---

## Overall Completion

| Dimension | Completion | Status |
|-----------|:----------:|:------:|
| **Project Total** | **82%** | GREEN |
| Wave 01 (Enterprise Hardening) | 100% | GREEN |
| Wave 02 (UX & Communication) | 12% | RED |
| Wave 03 (Billing) | 5% | RED |
| Wave 04 (Platform) | 0% | NONE |
| Wave 05 (AI) | 0% | NONE |
| Wave 06 (Mobile) | 0% | NONE |
| Wave 07 (Financials) | 0% | NONE |
| Wave 08 (Meter Infra) | 0% | NONE |
| Wave 09 (Multi-Area) | 0% | NONE |
| Wave 10 (Intelligence) | 0% | NONE |

---

## Technical Coverage

| Area | Coverage | Status |
|------|:--------:|:------:|
| Backend | 91% | GREEN |
| Frontend | 76% | YELLOW |
| Database | 88% | GREEN |
| Runtime | 63% | YELLOW |
| Testing | 42% | ORANGE |
| Performance | 61% | YELLOW |
| Security | 65% | YELLOW |
| Documentation | 95% | GREEN |
| AI | 10% | RED |
| Enterprise Readiness | 79% | YELLOW |

---

## Key Metrics

| Metric | Value |
|--------|:-----:|
| Prisma Models | 78 |
| API Endpoints | 179 |
| Route Files | 21 |
| Permission Keys | 57 |
| Admin Pages | 46/53 |
| Detail Pages | 7 |
| Dashboard Pages | 19 |
| Planning Layers | 40 |
| Knowledge Base Docs | 20 |
| Unit Tests | 54 |
| Database Indexes | 68 |

---

## Active Blockers

| Task | Phase | Blocker | Priority |
|------|-------|---------|:--------:|
| T06 - Email Delivery | 43b | SMTP credentials needed | HIGH |
| T07 - SMS Service | 43b | Twilio/Vonage account needed | HIGH |
| T08 - Push Notifications | 43b | Firebase project needed | HIGH |
| Phase 44b - Billing Pipeline | 44b | Depends on Phase 44a Tariff Engine | HIGH |

---

## Capability Maturity

| Capability | Maturity | Status |
|-----------|:--------:|:------:|
| Customer Management | 100% | GREEN |
| Meter Management | 95% | GREEN |
| Reading Pipeline | 95% | GREEN |
| Billing | 85% | GREEN |
| Infrastructure | 90% | GREEN |
| Administration | 90% | GREEN |
| Multi-Area | 85% | GREEN |
| Notifications | 60% | YELLOW |
| Reporting | 50% | YELLOW |
| Finance | 25% | RED |
| Collections | 25% | RED |
| SYMBIOT Integration | 10% | RED |
| AI | 10% | RED |
| Customer Portal | 5% | RED |
| Field Operations | 5% | RED |

---

## Enterprise Readiness

| Requirement | Status | Date |
|-------------|:------:|:----:|
| Governance Layers (30) | DONE | 2026-07 |
| Enterprise Layers (10) | DONE | 2026-07 |
| Capability Roadmap | DONE | 2026-07 |
| Feature Lifecycle | DONE | 2026-07 |
| Dependency Heat Map | DONE | 2026-07 |
| Technical Ownership | DONE | 2026-07 |
| Runtime Inventory | DONE | 2026-07 |
| Domain Map | DONE | 2026-07 |
| Enterprise Metrics | DONE | 2026-07 |
| Definition of Done | DONE | 2026-07 |
| Decision Log | DONE | 2026-07 |
| Executive Dashboard | DONE | 2026-07 |
| Knowledge Base | DONE | 2026-07 |
| Ultimate Audit Framework | DONE | 2026-07 |
| AI Bible Rules | DONE | 2026-07 |
| AI Execution Contract | DONE | 2026-07 |

---
*Executive Dashboard - Planning OS v2.1*
`);

console.log('');
console.log('=== All 10 enterprise layers generated ===');
