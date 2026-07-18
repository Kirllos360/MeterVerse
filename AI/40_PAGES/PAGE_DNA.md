# MeterVerse Page DNA

**Defines every page archetype in the MeterVerse platform. Every future page must conform to one of these archetypes.**

---

## 1. Dashboard Archetype

**Purpose:** At-a-glance overview of KPIs, status, and trends for a domain.

| Element | Description |
|---------|-------------|
| Layout | KPI strip (top) + widget grid (below) |
| Navigation | Dashboard is sidebar section, child pages are tabs |
| Components | KPI cards, charts, SmartTable, activity feed, alert summary |
| Interactions | Filters affect all widgets, click KPI → detail page |
| Workflow | Monitoring, exception identification, drill-down |
| Permissions | Role-based KPI visibility, widget filtering |
| Responsive | KPI strip scrolls horizontally on mobile, widgets stack |

**Pages using this archetype:** Executive Dashboard, Operations Dashboard, Billing Dashboard, Collections Dashboard, Utility Dashboard, Solar Dashboard, Control Center Dashboard

---

## 2. List/CRUD Archetype

**Purpose:** Browse, search, filter, and manage a list of entities with create/edit/delete actions.

| Element | Description |
|---------|-------------|
| Layout | Search/filter bar (top) + SmartTable (main) + action bar (conditional) |
| Navigation | Sidebar item, child pages for detail/create |
| Components | SmartTable, SearchInput, FilterBar, PageHeader, Action buttons |
| Interactions | Row click → detail, checkbox → bulk actions, table sort/filter/paginate |
| Workflow | List → view detail → edit/delete/create new |
| Permissions | Row actions filtered by role, column visibility, bulk actions |
| Responsive | Table → card layout on mobile, filters collapse into dropdown |

**Pages:** Customers List, Meters List, Readings List, Invoices List, Payments List, SIM Cards List, Alerts List, Tickets List, Bill Cycles List, Report List, Upload History

---

## 3. Detail Archetype

**Purpose:** Comprehensive view of a single entity with related information organized in tabs.

| Element | Description |
|---------|-------------|
| Layout | Entity header (name, status badge, key actions) + tabbed content |
| Navigation | Breadcrumb: List > Entity Name, tabs for sub-sections |
| Components | StatusBadge, Tabs, SmartTable (child entities), StatCard, ActivityTimeline |
| Interactions | Tab switch, action buttons in header, child row click |
| Workflow | View details → edit → navigate to related entities → take action |
| Permissions | Tab visibility, action availability based on role and entity state |

**Pages:** Customer Detail (tabs: Overview, Units, Invoices, Meters, Ownership, Wallet), Meter Detail (tabs: Overview, Readings, Invoices, SIM, Edit), Invoice Detail, Payment Detail, Ticket Detail, Project Detail

---

## 4. Form/Create Archetype

**Purpose:** Create or edit a single entity.

| Element | Description |
|---------|-------------|
| Layout | Form fields (single/multi-column) + action buttons |
| Navigation | Sidebar "Create" button or List page "Add" button |
| Components | Form fields, validation, cancel/submit, page header |
| Interactions | Tab between fields, auto-save draft, validate on blur |
| Workflow | Fill form → validate → submit → redirect to detail |
| Permissions | Field visibility, action availability based on role |

**Pages:** New Customer, New Reading, New Ticket, New Project, New User

---

## 5. Wizard Archetype

**Purpose:** Multi-step guided process for complex workflows.

| Element | Description |
|---------|-------------|
| Layout | Step indicator (top) + current step content + navigation buttons (bottom) |
| Navigation | Step indicator clickable, Previous/Next buttons, Cancel |
| Components | Form fields per step, StepIndicator, summary step, ProgressBar |
| Interactions | Next (validate step), Previous (no validate), Submit (validate all) |
| Workflow | Step-by-step guided data entry → summary review → submit |
| Permissions | Step visibility, field availability |

**Pages:** Meter Assign (9-step: Project → Building → Floor → Unit → Customer → Meter Type → Meter → SIM/IP → Confirm), Payment Wizard (5-step: Search → Select → Details → Pay → Receipt)

---

## 6. Explorer Archetype

**Purpose:** Navigate hierarchical data (locations, org structure, area hierarchy).

| Element | Description |
|---------|-------------|
| Layout | Tree/explorer panel (left) + detail panel (right) or full tree |
| Navigation | Tree nodes expandable, click → detail in right panel |
| Components | Tree, DetailPanel, SmartTable, Breadcrumb |
| Interactions | Expand/collapse tree, node click, breadcrumb navigate |
| Workflow | Navigate hierarchy → view node detail → take action |
| Permissions | Node visibility, action availability |

**Pages:** Locations (Project → Building → Floor → Unit), Area Explorer

---

## 7. Settings/Configuration Archetype

**Purpose:** Configure system settings, manage users, areas, and preferences.

| Element | Description |
|---------|-------------|
| Layout | Settings sidebar/vertical tabs (left) + content area (right) |
| Navigation | Settings sections in sidebar, click → content |
| Components | Form fields, Switch, Select, Save button, section description |
| Interactions | Change setting → auto-save or explicit save |
| Workflow | Navigate section → view/change settings → save |
| Permissions | Section visibility based on admin role |

**Pages:** System Settings (Users, Areas, Unit Types, Unit Groups, etc.), Profile Settings, Workspace Settings, Project Configuration

---

## 8. Analytics/Reports Archetype

**Purpose:** View and generate reports with filtering and export.

| Element | Description |
|---------|-------------|
| Layout | Report list/grid (filterable) + report viewer/editor |
| Navigation | Report category tabs or list |
| Components | ReportCard/RunButton, Chart, SmartTable, DateRangePicker, ExportButton |
| Interactions | Select report → configure filters → run → view → export |
| Workflow | Browse reports → configure → generate → view/export |
| Permissions | Report visibility, data access, export permissions |

**Pages:** Reports (41 report types across 6 categories), KPI pages, Consumption analysis, Water Balance

---

## 9. Monitoring Archetype

**Purpose:** Real-time status and health monitoring of systems and entities.

| Element | Description |
|---------|-------------|
| Layout | Status summary (top) + entity list/grid with status indicators |
| Navigation | Sidebar item, auto-refresh toggle |
| Components | StatusBadge, ProgressBar, AlertSummary, SmartTable, AutoRefreshToggle |
| Interactions | Status filter, entity click → detail, refresh |
| Workflow | Monitor → identify issues → drill down → take action |
| Permissions | Read-only for most roles, admin for actions |

**Pages:** Sync Gateway (9 areas health monitor), Control Center Runtime Status, Deployment Monitor, Security Status

---

## 10. Customer Portal Archetype

**Purpose:** Customer self-service for viewing invoices, meters, usage, and making payments.

| Element | Description |
|---------|-------------|
| Layout | Customer-focused dashboard + navigation |
| Navigation | Limited sidebar/tabs: Dashboard, Invoices, Meters, Usage, Payments |
| Components | StatCard, SmartTable (read-only), Chart, PaymentForm |
| Interactions | View data, download invoices, make payments, submit requests |
| Workflow | View → download/pay → confirmation |
| Permissions | Customer-scoped — only own data visible |

**Pages:** Customer Portal (Dashboard, Invoices, Meters, Payments)

---

## 11. GIS Archetype

**Purpose:** Map-based visualization of locations, meters, and infrastructure.

| Element | Description |
|---------|-------------|
| Layout | Interactive map (main) + detail panel (side or overlay) |
| Navigation | Map pan/zoom, marker click → detail |
| Components | InteractiveMap, MarkerCluster, InfoWindow, SearchBox, LayerToggle |
| Interactions | Pan, zoom, marker click, search address, filter layer |
| Workflow | Browse map → locate entity → view detail → navigate to full detail |
| Permissions | Read-only for most roles |

**Pages:** GIS Map View, Location Explorer

---

## 12. Notification Center Archetype

**Purpose:** View and manage all notifications and alerts.

| Element | Description |
|---------|-------------|
| Layout | Filter bar (top) + notification list (main) |
| Components | NotificationItem, StatusBadge, FilterTabs, MarkReadButton |
| Interactions | Click → mark read, click link → navigate, mark all read |
| Workflow | Review notifications → act or dismiss → clear |
| Permissions | Own notifications only |

**Pages:** Notifications, Alerts List

---

## 13. Audit Log Archetype

**Purpose:** View system audit trail with filtering and export.

| Element | Description |
|---------|-------------|
| Layout | Filter bar (top) + SmartTable (main) |
| Components | SmartTable with audit-specific columns, DateRangePicker, ExportButton |
| Interactions | Filter by date/actor/action, view detail, export |
| Workflow | Filter → browse → investigate → export if needed |
| Permissions | Admin/super_admin only |

**Pages:** Audit Log, Activity History
