# MeterVerse MVEOS — Engineering Readiness Audit

**Date:** 2026-07-05  
**Audited:** 83 Stitch export directories  
**Source:** `stitch_meterverse_enterprise_os/`

---

## PHASE 1 — Complete Page Inventory (76 HTML pages)

### Authentication (3 pages)
| ID | Page | Route | Parent | Dialogs | Charts | Forms |
|----|------|-------|--------|---------|--------|-------|
| A01 | Login – Dark Theme | `/login` | — | None | 0 | Email, Password, Remember |
| A02 | Login – Energy OS Identity | `/login-alt` | — | None | 0 | Email, Password |
| A03 | Session Expired / Timeout | `/session-expired` | — | None | 0 | None |

**Missing:** Forgot Password, Reset Password, Two-Factor Auth, Register

### Executive / Command Center (11 pages)
| ID | Page | Route | Charts | KPIs |
|----|------|-------|--------|------|
| E01 | Executive Command Center Integrated | `/executive` | 6+ | 8 |
| E02 | Command Center v1 | `/executive/v1` | 4 | 6 |
| E03 | Command Center v2 | `/executive/v2` | 5 | 6 |
| E04 | Command Center v3 | `/executive/v3` | 3 | 8 |
| E05 | Command Center v4 | `/executive/v4` | 4 | 6 |
| E06 | Command Center Refined Theme 1 | `/executive/refined-1` | 4 | 6 |
| E07 | Command Center Refined Theme 2 | `/executive/refined-2` | 4 | 6 |
| E08 | Financial Analytics Dashboard | `/financial/analytics` | 6 | 8 |
| E09 | Financial Performance Dashboard | `/financial/performance` | 5 | 6 |
| E10 | Industrial Intelligence OS | `/industrial-intelligence` | 8 | 10 |
| E11 | Enterprise Monitoring Dashboard | `/monitoring/global-health` | 6 | 6 |

### Grid / Energy Overview (7 pages)
| ID | Page | Route |
|----|------|-------|
| G01 | Grid Overview (default) | `/grid` |
| G02 | Grid Monitoring Refined 1 | `/grid/refined-1` |
| G03 | Grid Monitoring Refined 2 | `/grid/refined-2` |
| G04 | Live Grid Control Room (Dark) | `/grid/control-room` |
| G05 | Operational Control Room v1 | `/grid/operations-1` |
| G06 | Operational Control Room v2 | `/grid/operations-2` |
| G07 | Operational Control Room v3 | `/grid/operations-3` |
| G08 | Grid Topology & Load Balancing | `/grid/topology` |

### Customers (6 pages)
| ID | Page | Route |
|----|------|-------|
| C01 | Customer Explorer CRM v1 | `/customers` |
| C02 | Customer Explorer CRM v2 | `/customers?v=2` |
| C03 | Customer Explorer CRM v3 | `/customers?v=3` |
| C04 | Customer Workspace – Al Hamra | `/customers/[id]` |
| C05 | Customer Workspace – Integrated | `/customers/[id]/integrated` |
| C06 | Customer 360 Communication History | `/customers/[id]/history` |

### Meters (5 pages)
| ID | Page | Route |
|----|------|-------|
| M01 | Meter Explorer | `/meters` |
| M02 | Meter Explorer Refined 1 | `/meters?v=2` |
| M03 | Meter Explorer Refined 2 | `/meters?v=3` |
| M04 | Meter Lifecycle – MTR-9821 | `/meters/[serial]` |
| M05 | Meter Diagnostics – Telemetry | `/meters/[serial]/diagnostics` |
| M06 | Meter Workspace – MTR-9821 Detail | `/meters/[serial]/workspace` |
| M07 | Meter Workspace – Unit 402 | `/meters/[serial]/unit` |

### Billing / Invoices (8 pages)
| ID | Page | Route |
|----|------|-------|
| B01 | Invoice Calculation Engine v1 | `/billing/invoices/calculate` |
| B02 | Invoice Calculation Engine v2 | `/billing/invoices/calculate?v=2` |
| B03 | Invoice Calculation Dialog | (dialog component) |
| B04 | Settlement Calculation v1 | `/billing/settlement` |
| B05 | Settlement Calculation v2 | `/billing/settlement?v=2` |
| B06 | Settlement Enterprise Dialog | (dialog component) |
| B07 | Settlement Refined Theme 1 | `/billing/settlement?v=3` |
| B08 | Settlement Refined Theme 2 | `/billing/settlement?v=4` |

### Finance (2 pages)
| ID | Page | Route |
|----|------|-------|
| F01 | General Ledger – Audit Workspace | `/finance/ledger` |
| F02 | Compliance & Audit Explorer | `/finance/audit` |

### Monitoring / System Health (3 pages)
| ID | Page | Route |
|----|------|-------|
| H01 | Global Health Monitoring | `/monitoring` |
| H02 | System Health Dashboard | `/monitoring/health` |
| H03 | Real-Time Infrastructure Monitor | `/monitoring/infrastructure` |

### Collections (1 page)
| ID | Page | Route |
|----|------|-------|
| L01 | Collection Route Planning | `/collections` |

### Alarm / Outage (2 pages)
| ID | Page | Route |
|----|------|-------|
| O01 | Alarm Center – Command Control | `/alarms` |
| O02 | Outage Management – Restoration | `/outages` |

### Asset / Maintenance (3 pages)
| ID | Page | Route |
|----|------|-------|
| P01 | Preventive Maintenance Planner | `/maintenance` |
| P02 | Installation – Technical Wizard | `/installations` |
| P03 | Inventory & Warehouse Management | `/warehouse` |

### GIS / Network (4 pages)
| ID | Page | Route |
|----|------|-------|
| Z01 | Regional Grid Explorer – GIS | `/gis` |
| Z02 | Substation Intelligence | `/gis/substations` |
| Z03 | Transformer Health Analytics | `/gis/transformers` |
| Z04 | Network Topology Load Balancing | `/network/topology` |

### Operations (3 pages)
| ID | Page | Route |
|----|------|-------|
| Q01 | Work Order Dispatch & Crew | `/operations/dispatch` |
| Q02 | Communication Center – Network | `/operations/communications` |
| Q03 | Bulk Reading Validation Wizard | `/operations/bulk-validation` |

### Tariff (1 page)
| ID | Page | Route |
|----|------|-------|
| T01 | Tariff Price Book Registry | `/tariffs` |

### Admin / Access Control (3 pages)
| ID | Page | Route |
|----|------|-------|
| R01 | Permission Matrix | `/admin/permissions` |
| R02 | User Access Control | `/admin/users` |
| R03 | Approval Inbox – Governance | `/admin/approvals` |

### Reports (1 page)
| ID | Page | Route |
|----|------|-------|
| S01 | Jasper Report Preview Engine | `/reports` |

### Search / Command (2 pages)
| ID | Page | Route |
|----|------|-------|
| D01 | Global Search Overlay v1 | (overlay component) |
| D02 | Global Search Overlay v2 | (overlay component) |

### Developer / System (1 page)
| ID | Page | Route |
|----|------|-------|
| K01 | Developer Console – Config Hub | `/admin/developer` |

### Support / Knowledge (3 pages)
| ID | Page | Route |
|----|------|-------|
| N01 | Knowledge Base – Support Center | `/support` |
| N02 | Enterprise Help & Release Notes | `/help` |
| N03 | Customer Document Center | `/documents` |

### Theme / Localization (2 pages)
| ID | Page | Route |
|----|------|-------|
| Y01 | Energy Theme & Localization | `/admin/localization` |
| Y02 | Theme & Localization Engine | `/admin/themes` |

---

## PHASE 2 — Dialog Inventory

### Existing Dialogs (found in Stitch exports)
| Dialog | Found In | Type |
|--------|----------|------|
| Invoice Calculation | B01-B03 | Full-screen modal |
| Settlement Calculation | B04-B06 | Full-screen modal |
| Global Search | D01-D02 | Overlay |
| Permission Edit | R01 | Side panel |
| User Edit | R02 | Side panel |
| Report Parameters | S01 | Dialog |
| Install Wizard | P02 | Multi-step wizard |
| Bulk Validation | Q03 | Wizard + table |
| Document Viewer | N03 | Side panel |
| Help Viewer | N02 | Side panel |

### Missing Dialogs (32 required)
| Dialog | Priority | Used By |
|--------|----------|---------|
| Add Customer | 🔴 Critical | Customers |
| Edit Customer | 🔴 Critical | Customers |
| Delete Confirm | 🔴 Critical | All CRUD |
| Add Meter | 🔴 Critical | Meters |
| Edit Meter | 🔴 Critical | Meters |
| Assign Meter | 🔴 Critical | Meters |
| Replace Meter | 🔴 Critical | Meters |
| Terminate Meter | 🔴 Critical | Meters |
| Add Reading | 🔴 Critical | Readings |
| Edit Reading | 🔴 Critical | Readings |
| Import Wizard | 🔴 Critical | Bulk operations |
| Export Wizard | 🔴 Critical | All pages |
| Add Invoice | 🔴 Critical | Billing |
| Reverse Invoice | 🟠 High | Billing |
| Record Payment | 🟠 High | Payments |
| Reverse Payment | 🟠 High | Payments |
| Add Tariff | 🟠 High | Tariffs |
| Edit Tariff | 🟠 High | Tariffs |
| Add User | 🟠 High | Admin |
| Edit Role | 🟠 High | Admin |
| Edit Permissions | 🟠 High | Admin |
| Add Alert Rule | 🟠 High | Monitoring |
| Schedule Report | 🟠 High | Reports |
| Add Document | 🟠 High | Documents |
| View Audit Detail | 🟠 High | Audit |
| Approve Invoice | 🟠 High | Billing |
| Reject Invoice | 🟠 High | Billing |
| Add Note | 🟡 Medium | Customers |
| Transfer Customer | 🟡 Medium | Customers |
| Firmware Update | 🟡 Medium | Meters |
| Remote Command | 🟡 Medium | Meters |
| Confirm Action (generic) | 🔴 Critical | All |

---

## PHASE 3 — Component Inventory

### Existing (confirmed in Stitch code)
| Component | Status |
|-----------|--------|
| Sidebar (collapsible, 240px/64px) | ✅ Present |
| Top Navigation Bar | ✅ Present |
| KPI Card (glass style) | ✅ Present |
| Data Table with sticky header | ✅ Present |
| Pin Column (first column sticky) | ✅ Present |
| Status Badge (colored pill) | ✅ Present |
| Avatar with online dot | ✅ Present |
| Search Input | ✅ Present |
| Notification Panel | ✅ Present |
| Breadcrumb | ✅ Present |
| Tab Navigation | ✅ Present |
| Filter Bar | ✅ Present |
| Pagination | ✅ Present |
| Timeline | ✅ Present |
| Progress Bar | ✅ Present |
| Glass Card | ✅ Present |
| Dialog/Modal | ✅ Present |
| Alert Banner | ✅ Present |
| Stat Card | ✅ Present |
| Chart Container | ✅ Present |
| Tag / Chip | ✅ Present |
| Toggle Switch | ✅ Present |
| Radio Button | ✅ Present |
| Checkbox | ✅ Present |

### Missing Components (26 required)
| Component | Priority | Reason |
|-----------|----------|--------|
| File Upload (drag-drop) | 🔴 Critical | Import center |
| Date Picker | 🔴 Critical | All forms |
| Command Palette (Ctrl+K) | 🔴 Critical | Search export exists, needs impl |
| Tree View | 🔴 Critical | GIS, locations |
| Multi-Select | 🔴 Critical | All filter bars |
| Autocomplete/Typeahead | 🔴 Critical | Customer/meter search |
| Toast Manager | 🔴 Critical | All success/error feedback |
| Skeleton Loader | 🔴 Critical | UX across all pages |
| Empty State | 🔴 Critical | All list pages |
| Error State | 🔴 Critical | All pages |
| Offline Banner | 🟠 High | System-wide |
| Loading Spinner | 🔴 Critical | All async actions |
| Stepper/Wizard | 🟠 High | Multi-step workflows |
| Accordion | 🟠 High | Settings, help |
| Drawer (right panel) | 🟠 High | Detail views |
| Tooltip | 🟠 High | All icons |
| Popover | 🟠 High | All dropdown menus |
| Dropdown Menu | 🟠 High | Row actions |
| Color Picker | 🟡 Medium | Theme settings |
| Code Editor | 🟡 Medium | Developer console |
| JSON Viewer | 🟡 Medium | Developer console |
| Map Component | 🟡 Medium | GIS |
| Markdown Renderer | 🟡 Medium | Help, knowledge base |
| Resizable Panel | 🟡 Medium | Monitoring, GIS |
| Split Pane | 🟡 Medium | Monitoring |
| Virtualized List | 🟡 Medium | Tables with 10K+ rows |

---

## PHASE 4 — Routing Audit

### Route Completeness
| Status | Count |
|--------|-------|
| Routes with Stitch designs | 52 |
| Routes missing designs | 11 |
| Dead/broken routes in Stitch | 0 |

### Missing Routes
| Route | Required By |
|-------|-------------|
| `/forgot-password` | Auth flow |
| `/reset-password` | Auth flow |
| `/two-factor` | Auth flow |
| `/readings` | Business data |
| `/readings/[id]` | Business data |
| `/payments` | Financial data |
| `/payments/[id]` | Financial data |
| `/customers/new` | Customer creation |
| `/meters/new` | Meter creation |
| `/invoices/new` | Invoice creation |
| `/404` | Standard |
| `/500` | Standard |

### Breadcrumb Verification
All pages in Stitch have breadcrumb components. No broken breadcrumb navigation detected.

### Navigation Circularity
| Path | Issue |
|------|-------|
| Executive → Financial → Executive | Valid (dashboard switching) |
| Customers → Detail → Customers | Valid (breadcrumb back) |
| All other paths | Acyclic ✅ |

---

## PHASE 5 — Data Flow Matrix

| Entity | Create | Read | Update | Delete | Approve | Import | Export | Realtime | Audit |
|--------|--------|------|--------|--------|---------|--------|--------|----------|-------|
| Customer | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | — | ✅ |
| Meter | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ |
| Reading | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Invoice | ✅ | ✅ | ✅ | ❌ | ✅ | — | ✅ | — | ✅ |
| Payment | ✅ | ✅ | ✅ | ❌ | — | ✅ | ✅ | — | ✅ |
| Tariff | ✅ | ✅ | ✅ | ❌ | ✅ | — | ✅ | — | ✅ |
| User | ✅ | ✅ | ✅ | ❌ | — | ✅ | ✅ | — | ✅ |
| Role | ✅ | ✅ | ✅ | ❌ | — | — | ✅ | — | ✅ |
| Alert | — | ✅ | ✅ | ✅ | — | — | ✅ | ✅ | ✅ |
| Report | — | ✅ | — | ✅ | — | — | ✅ | — | ✅ |
| Document | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ |

---

## PHASE 6 — State Management

| State Type | Storage | Used By |
|-----------|---------|---------|
| Theme (dark/light) | Zustand persist | All pages |
| Locale (ar/en) | Zustand persist | All pages |
| Auth token | Zustand persist + cookie | All protected pages |
| User preferences | Zustand persist | Settings |
| Sidebar state | Zustand persist | All pages |
| Current workspace | Zustand persist | Shell |
| Active filters | Zustand (session) | Explorer pages |
| Search query | Zustand (session) | Search, explorers |
| Notification count | Zustand (live) | Top bar |
| WebSocket connection | Zustand (live) | Monitoring, grid |
| Form drafts | Zustand (session) | Add/edit dialogs |
| Table sort/page | Zustand (session) | All tables |
| Selected rows | Zustand (local) | Bulk actions |

---

## PHASE 7 — API Contract Matrix

| Entity | Base Path | GET | POST | PUT | PATCH | DELETE |
|--------|-----------|-----|------|-----|-------|--------|
| Customers | `/api/v1/customers` | ✅ List/Detail | ✅ Create | ✅ Update | ✅ Partial | ✅ Soft |
| Meters | `/api/v1/meters` | ✅ List/Detail | ✅ Create | ✅ Update | ✅ Status | ✅ Soft |
| Readings | `/api/v1/readings` | ✅ List/Detail | ✅ Create | ✅ Correct | — | ✅ |
| Invoices | `/api/v1/invoices` | ✅ List/Detail | ✅ Generate | ✅ Issue | ✅ Adjust | ❌ |
| Payments | `/api/v1/payments` | ✅ List/Detail | ✅ Record | ✅ | — | ❌ |
| Tariffs | `/api/v1/tariffs` | ✅ List/Detail | ✅ Create | ✅ Update | ✅ | ❌ |
| Users | `/api/v1/users` | ✅ List/Detail | ✅ Create | ✅ Update | ✅ Status | ❌ |
| Roles | `/api/v1/roles` | ✅ List | ✅ Create | ✅ Update | — | ❌ |
| Permissions | `/api/v1/permissions` | ✅ List | — | — | — | — |
| Documents | `/api/v1/documents` | ✅ List/Detail | ✅ Upload | — | — | ✅ |
| Alerts | `/api/v1/alerts` | ✅ List | ✅ Create | ✅ Acknowledge | ✅ Resolve | ✅ |
| Reports | `/api/v1/reports` | ✅ List | ✅ Generate | — | — | ✅ |
| Audit | `/api/v1/audit` | ✅ List | — | — | — | — |
| Grid/Monitoring | `/api/v1/grid` | ✅ Status | — | — | — | — |

---

## PHASE 8 — Permission Matrix

| Page | View | Create | Edit | Delete | Approve | Export | Import | Role |
|------|------|--------|------|--------|---------|--------|--------|------|
| Executive Dashboard | ✅ | — | — | — | — | ✅ | — | Executive |
| Financial Dashboard | ✅ | — | — | — | — | ✅ | — | Finance |
| Customer Explorer | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | CRM |
| Customer Workspace | ✅ | ✅ | ✅ | ✅ | — | ✅ | — | CRM |
| Meter Explorer | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | Ops |
| Meter Workspace | ✅ | ✅ | ✅ | ✅ | — | — | — | Ops |
| Reading Explorer | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Ops |
| Invoice Explorer | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | — | Finance |
| Invoice Workspace | ✅ | — | ✅ | ❌ | ✅ | ✅ | — | Finance |
| Payment Explorer | ✅ | ✅ | ❌ | ❌ | — | ✅ | ✅ | Finance |
| Tariff Manager | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | — | Admin |
| User Manager | ✅ | ✅ | ✅ | ❌ | — | ✅ | — | SuperAdmin |
| Role Manager | ✅ | ✅ | ✅ | ❌ | — | — | — | SuperAdmin |
| Monitoring | ✅ | — | — | — | — | — | — | All |
| Admin Panel | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | SuperAdmin |

---

## PHASE 9 — Implementation Dependency Graph

```
Sprint 1 — Foundation (Week 1)
├── Package setup, configs, folder structure
├── Theme engine (Zustand store + CSS classes)
├── i18n engine (next-intl + RTL support)
├── Design tokens → globals.css
├── Layout shell (Sidebar + Topbar + Content)
├── Login page
└── Session management
        ↓
Sprint 2 — Core Components (Week 2)
├── Button, Input, Select, Checkbox, Switch
├── Card, GlassCard, StatCard, KPICard
├── Badge, Avatar, Status dot
├── Dialog, Drawer, Modal
├── Table with sticky header + pinned column
├── Toast, Alert, Notification bell
├── Breadcrumb, Tabs, Pagination
├── Search, Filter bar
└── Skeleton, Empty state, Error state
        ↓
Sprint 3 — Executive & Dashboard (Week 3)
├── Executive Command Center (E01-E07)
├── Financial Analytics (E08-E09)
├── Industrial Intelligence (E10)
├── Global Health Monitoring (E11)
├── Chart library (Recharts integration)
└── KPI grid with glass cards
        ↓
Sprint 4 — Customers (Week 4)
├── Customer Explorer (C01-C03)
├── Customer Workspace (C04-C05)
├── Customer 360 / History (C06)
├── Customer dialogs (Add, Edit, Delete, Transfer)
└── Customer document center
        ↓
Sprint 5 — Meters & Readings (Week 5)
├── Meter Explorer (M01-M03)
├── Meter Workspace (M04-M07)
├── Meter lifecycle, diagnostics, telemetry
├── Reading Explorer
├── Bulk validation wizard
└── Meter/Reading dialogs
        ↓
Sprint 6 — Billing & Finance (Week 6)
├── Invoice calculation engine (B01-B03)
├── Settlement engine (B04-B08)
├── Invoice workspace
├── Payment recording
├── General Ledger (F01)
├── Audit explorer (F02)
└── All billing dialogs
        ↓
Sprint 7 — Operations (Week 7)
├── Grid monitoring (G01-G08)
├── Alarm center (O01)
├── Outage management (O02)
├── Collections (L01)
├── Operations dispatch (Q01)
├── Communications center (Q02)
├── Maintenance planner (P01-P03)
├── GIS explorer (Z01-Z04)
└── Network topology
        ↓
Sprint 8 — Admin & Final (Week 8)
├── User management (R02)
├── Permission matrix (R01)
├── Approval inbox (R03)
├── Tariff registry (T01)
├── Report engine (S01)
├── Search overlay (D01-D02)
├── Developer console (K01)
├── Support, help, documents (N01-N03)
├── Theme & localization (Y01-Y02)
├── Command palette
└── Global search
```

---

## PHASE 10 — Implementation Readiness Score

| Category | Score | Notes |
|----------|-------|-------|
| **Visual Completeness** | 92/100 | 76 HTML pages with full Tailwind designs. All major screens covered. |
| **Architecture** | 85/100 | Clean page hierarchy. Some duplicate theme variants can be consolidated. |
| **Routing** | 78/100 | 52 routes mapped. 11 missing (auth, payments, readings). |
| **Components** | 70/100 | 24 existing. 26 missing (critical: upload, date picker, command palette). |
| **Dialogs** | 45/100 | Only 10 dialogs exist. 32 missing. **Largest gap.** |
| **Forms** | 60/100 | Basic forms exist. Need React Hook Form + Zod integration. |
| **Accessibility** | 30/100 | No ARIA labels in Stitch exports. Must add during implementation. |
| **RTL** | 25/100 | Arabic support designed but no RTL CSS in Stitch. |
| **Themes** | 80/100 | Dark + Light available. Gray mode and adaptive need implementation. |
| **Responsiveness** | 50/100 | Desktop-focused. Tablet/mobile adaptations needed. |
| **Performance Readiness** | 60/100 | Component-level lazy loading planned. Code splitting needed. |
| **Backend Readiness** | 75/100 | All API contracts mapped. 14 entity endpoints defined. |
| **Testing Readiness** | 40/100 | No test infrastructure in Stitch. Must add Playwright + Vitest. |
| **Deployment Readiness** | 50/100 | Docker config needed. CI/CD pipeline needed. |

### Overall Score: **60/100**

---

## IMPLEMENTATION READY: **NO**

### Blockers Preventing Implementation

| # | Blocker | Severity | Resolution |
|---|---------|----------|------------|
| 1 | **32 dialogs missing** | 🔴 CRITICAL | Must create dialog components for: Add/Edit/Delete/Assign/Transfer across all entities |
| 2 | **26 components missing** | 🔴 CRITICAL | File upload, date picker, command palette, tree view, multi-select, autocomplete, skeleton, empty/error/offline states, stepper, drawer, tooltip, popover, dropdown, map |
| 3 | **11 routes missing** | 🟠 HIGH | Auth flow (forgot/reset/2FA), payments, readings standalone pages |
| 4 | **No RTL implementation** | 🟠 HIGH | Arabic is required. All layouts must mirror. |
| 5 | **No accessibility** | 🟠 HIGH | WCAG AA requires keyboard nav, ARIA, focus management, screen reader support |
| 6 | **No gray/adaptive themes** | 🟡 MEDIUM | 4 themes required by spec. Only dark + light exist in Stitch. |
| 7 | **No responsive layouts** | 🟡 MEDIUM | Tablet and mobile breakpoints not present in Stitch exports. |
| 8 | **No testing infrastructure** | 🟡 MEDIUM | Playwright, component tests, a11y tests must be set up. |
| 9 | **No command palette** | 🟡 MEDIUM | Global search exports exist but as static overlays, not working Ctrl+K. |
| 10 | **No CI/CD** | 🟢 LOW | Deployment pipeline. Not blocking implementation. |

### If All Blockers Resolved → Implementation Order

```
Sprint 1 (Week 1): Foundation — Config, Theme, i18n, Shell, Login, 12 core components
Sprint 2 (Week 2): 26 missing components + 32 dialogs + Chart library
Sprint 3 (Week 3): Executive Suite (11 pages)
Sprint 4 (Week 4): Customers (6 pages + dialogs)
Sprint 5 (Week 5): Meters + Readings (7 + 3 pages + dialogs)
Sprint 6 (Week 6): Billing + Finance (10 pages + dialogs)
Sprint 7 (Week 7): Operations + Grid + GIS + Monitoring (18 pages)
Sprint 8 (Week 8): Admin + Reports + Search + Support + Final polish
```

**Total estimated effort: 8 weeks** for a team of 2-3 frontend engineers.
