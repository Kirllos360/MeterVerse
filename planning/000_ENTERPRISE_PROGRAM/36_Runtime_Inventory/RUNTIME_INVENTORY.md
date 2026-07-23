# Runtime Inventory

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
