# 03 — Component Map

**Date:** 2026-07-11
**Mode:** Read-Only Audit
**Scope:** All components across V1 (src/components/) and V2 (src/v2/components/)

---

## 1. V1 Component Registry (116 files, ~5,200 lines)

### 1.1 Design System (48 files under `src/components/ui/`)

| Component | Lines | Status | Dependencies | Notes |
|-----------|-------|--------|--------------|-------|
| Button | 55 | PRODUCTION | React, clsx | 6 variants, loading state |
| IconButton | 28 | LEGACY | React | Simple implementation |
| Badge | 38 | PRODUCTION | CVA | 7 variants, 3 sizes |
| Avatar | 16 | LEGACY | None | Simple image/initials |
| Card (6 sub-components) | 46 | PRODUCTION | None | Forwarded-ref |
| GlassCard, KPICard | 29 | LEGACY | None | Glassmorphism |
| Accordion | 33 | LEGACY | React | Basic collapsible |
| Input | 43 | PRODUCTION | React, aria | Label, error, validation |
| Textarea | 21 | PRODUCTION | React | Resizable |
| SearchInput | 20 | PRODUCTION | React | Search icon prefix |
| NumberInput | 30 | LEGACY | React | Prefix/suffix |
| CurrencyInput, OTPInput, TagInput, Slider | 78 | LEGACY | React | Combined file |
| Select | 30 | PRODUCTION | React | Native styled select |
| MultiSelect | 36 | LEGACY | React | Custom implementation |
| Checkbox | 23 | PRODUCTION | React | Accessible |
| Switch | 19 | PRODUCTION | React | Peer-checked |
| RadioGroup | 20 | PRODUCTION | React | Generic |
| FileUpload | 32 | LEGACY | React | Drag-and-drop |
| DatePicker, DateRangePicker | 32 | LEGACY | React | Native date inputs |
| EnterpriseTable | 95 | LEGACY | React | Sort, search, paginate, density modes |
| Breadcrumb | 20 | PRODUCTION | React | Chevron separators |
| Pagination | 23 | PRODUCTION | React | Ellipsis truncation |
| Progress | 18 | PRODUCTION | React | 4 variants |
| Skeleton | 36 | PRODUCTION | React | 4 variants (text/card/table/chart) |
| Timeline | 28 | LEGACY | React | Vertical timeline |
| Tabs | 32 | PRODUCTION | React | 2 variants (underline/pills) |
| Dialog | 33 | PRODUCTION | React | Escape-to-close, sizes |
| Drawer | 30 | LEGACY | React | Slide-in, left/right |
| BottomSheet | 29 | LEGACY | React | Mobile, 80vh max |
| Tooltip | 20 | PRODUCTION | React | 4 placements |
| Popover | 24 | PRODUCTION | React | Click-triggered |
| Dropdown | 32 | LEGACY | React | Basic implementation |
| HoverCard | 15 | LEGACY | React | Floating card |
| ContextMenu | 36 | LEGACY | React | Right-click, cursor positioned |
| CommandPalette | 78 | PRODUCTION | React | Cmd+K, keyboard nav |
| Alert | 28 | PRODUCTION | React | 4 variants, dismissible |
| Toast | 37 | PRODUCTION | React | Auto-dismiss 4s, severity |
| BusinessPrimitives (KPIStrip, Ribbon, etc.) | 96 | LEGACY | React | 8 business components |
| Charts (8 types, Recharts) | 34 | PRODUCTION | Recharts | Themed colors |

### 1.2 Domain Components (50 files)

| Module | Component | Lines | Status | Depends On | Notes |
|--------|-----------|-------|--------|------------|-------|
| customers | CustomerWorkspace | 142 | MOCK_ONLY | V1 hooks, SmartTable | Health score, KPI cards, 9 tabs |
| customers | CustomerDetail | 82 | MOCK_ONLY | V1 hooks, SmartTable | 5 tabs, ledger |
| customers | CustomerExplorer | 50 | MOCK_ONLY | V1 hooks, SmartTable | Searchable list |
| customers | CustomerTabs | 208 | MOCK_ONLY | SmartTable | 17 tabs — widest V1 component |
| customers | CustomerKPICards | 45 | MOCK_ONLY | MetricCard | 12 stat cards |
| customers | CustomerHealthWidget | 30 | MOCK_ONLY | SVG | Circular gauge |
| customers | CustomerSmartPanel | 48 | MOCK_ONLY | React | Smart assistant |
| customers | CustomerRelationshipPanel | 46 | MOCK_ONLY | React | Tree diagram |
| customers | CustomerTimeline | 51 | MOCK_ONLY | React | Activity feed |
| customers | CustomerAlerts | 27 | MOCK_ONLY | React | Alert display |
| customers | CustomerWorkspaceHeader | 63 | MOCK_ONLY | React | Avatar, status, actions |
| invoices | InvoiceExplorer | 40 | MOCK_ONLY | V1 hooks, SmartTable | Invoice list with search |
| invoices | InvoiceWorkspace | 106 | MOCK_ONLY | V1 hooks, SmartTable | Detail + tabs |
| meters | MeterExplorer | 50 | MOCK_ONLY | V1 hooks, SmartTable | Meter inventory |
| meters | MeterDetail | 86 | MOCK_ONLY | V1 hooks, SmartTable | 4 tabs, reading history |
| payments | PaymentExplorer | 36 | MOCK_ONLY | V1 hooks, SmartTable | Payment list |
| payments | PaymentWorkspace | 69 | MOCK_ONLY | V1 hooks, SmartTable | Detail + tabs |
| readings | ReadingExplorer | 58 | MOCK_ONLY | V1 hooks, SmartTable | 4 tab filters |
| tariffs | TariffStudio | 73 | MOCK_ONLY | V1 hooks, SmartTable | Tariff editor |
| units | UnitExplorer | 44 | MOCK_ONLY | V1 hooks, SmartTable | Property units |
| collections | CollectionDashboard | 46 | MOCK_ONLY | V1 hooks | KPIs, aging, collectors |
| financial | FinancialDashboard | 44 | MOCK_ONLY | V1 hooks | Revenue, collections |
| dashboard | DashboardEngine | 21 | MOCK_ONLY | WorkspaceShell | Generic wrapper |
| workflow | WorkflowAssistant | 97 | MOCK_ONLY | React | Floating widget, mock data |
| search | SearchDialog | 108 | DORMANT | React | Cmd+K, 5 search providers |
| page | PageHeader, ActionToolbar, FilterBar | 37 | LEGACY | React | Page layout primitives |

### 1.3 Layout & Infrastructure (12 files)

| Component | Lines | Status | Dependencies | Notes |
|-----------|-------|--------|--------------|-------|
| AppShell | 97 | LEGACY | Sidebar | Original shell |
| EnterpriseShell | 72 | LEGACY | AdaptiveSidebar, workspace store | Panel layouts |
| RootLayout | 19 | PRODUCTION | Sidebar, Topbar | Minimal |
| ThemeProvider | 36 | PRODUCTION | theme store | Mode, density, dir |
| TopNavigation | 111 | PRODUCTION | stores | WorkspaceSwitcher, search, notifications |
| AdaptiveSidebar | 124 | PRODUCTION | workspace store | Collapsible, grouped |
| BreadcrumbEngine | 60 | PRODUCTION | workspace store | Auto-generated |
| Sidebar | 70 | LEGACY | Material Symbols | Legacy sidebar |
| Topbar | 43 | LEGACY | stores | Legacy top bar |
| WorkspaceManager | 46 | PRODUCTION | React context | Provider + bridge |
| WorkspaceSwitcher | 73 | PRODUCTION | React | 8 workspaces dropdown |
| WorkspaceShell | 32 | PRODUCTION | Navigation | Page shell composer |
| GlobalProviders | 34 | PRODUCTION | stores | Client initializer |
| ToastContainer | 26 | PRODUCTION | notification store | Toast display |
| ToastManager | 47 | LEGACY | notification store | Alternative toast |
| DialogSystem | 42 | PRODUCTION | Zustand | Global dialog renderer |
| LoadingStates | 62 | PRODUCTION | React | 6 state components |
| StateComponents | 71 | PRODUCTION | React | 6 state UI primitives |
| SmartTable | 156 | PRODUCTION | React | Generic table with search/sort/pagination |

---

## 2. V2 Component Registry (82 files, ~9,676 lines)

### 2.1 New Design System (36 files)

| Component | Lines | Status | Library | Notes |
|-----------|-------|--------|---------|-------|
| Button + IconButton | 27+29 | PRODUCTION | Radix Slot, CVA | Forwarded-ref, loading |
| Input | 33 | PRODUCTION | — | Forwarded-ref |
| Textarea | 26 | PRODUCTION | — | Forwarded-ref |
| SearchInput | 47 | PRODUCTION | — | Clear button |
| NumberInput | 58 | PRODUCTION | — | Stepper |
| Badge | 13 | PRODUCTION | CVA | 6 variants |
| Chip | 45 | PRODUCTION | — | Dismissible |
| Checkbox | 29 | PRODUCTION | Radix | Check indicator |
| RadioGroup | 39 | PRODUCTION | Radix | Circle indicator |
| Switch | 32 | PRODUCTION | Radix | Forwarded-ref |
| Select (full suite) | 120 | PRODUCTION | Radix | Trigger, content, item, label, group |
| Avatar | 44 | PRODUCTION | Radix | Image + fallback |
| Skeleton | 21 | PRODUCTION | CSS | Animated |
| Progress | 24 | PRODUCTION | Radix | Indicator |
| Tabs | 44 | PRODUCTION | Radix | List, trigger, content |
| Accordion | 46 | PRODUCTION | Radix | Animated chevron |
| Dialog (full suite) | 69 | PRODUCTION | Radix | Overlay, header, footer, close |
| Drawer | 55 | PRODUCTION | framer-motion | Portal-based, animated |
| Tooltip | 28 | PRODUCTION | Radix | Provider, trigger, content |
| Popover | 32 | PRODUCTION | Radix | Trigger + content |
| DropdownMenu (full suite) | 185 | PRODUCTION | Radix | Items, checkbox, radio, sub, labels |
| Card | 40 | PRODUCTION | — | Header, footer, title, description |
| Panel | 24 | PRODUCTION | — | Bordered container |
| Breadcrumb | 87 | PRODUCTION | — | Link, ellipsis, separator |
| Pagination | 83 | PRODUCTION | — | First/last, prev/next, ellipsis |
| Toaster | 31 | PRODUCTION | Sonner | Dark theme |
| Alert | 57 | PRODUCTION | — | 4 variants, icons |
| States (5 components) | 93 | PRODUCTION | framer-motion | Empty, error, loading, offline, denied |
| CommandPalette | 90 | PRODUCTION | cmdk, framer-motion | Groups, shortcuts, animated |
| DataGrid | 118 | PRODUCTION | TanStack Table | Sortable, striped, sticky |
| ContextMenu (full suite) | 173 | PRODUCTION | Radix | Items, checkbox, radio, sub |
| MultiSelect | 112 | PRODUCTION | cmdk, Radix Popover | Search, chips, checkable |
| DatePicker | 55 | PRODUCTION | date-fns, react-day-picker | Popover calendar |
| Form (FormField, Label, etc.) | 84 | PRODUCTION | Radix Label | Error state, row, section |
| ErrorBoundary | 26 | PRODUCTION | React | Class-based |

### 2.2 Domain Workspaces (7 files)

| Component | Lines | Status | Data Source | Notes |
|-----------|-------|--------|-------------|-------|
| GlobalShell | 161 | PRODUCTION | V2 repos + stores | Orchestrator |
| Workspace | 178 | PRODUCTION | Workspace store | Tab-based router |
| CustomerWorkspace | 164 | MOCK_ONLY | V2 query hooks | Profile + 6 tables |
| MeterWorkspace | 163 | MOCK_ONLY | V2 query hooks | Info + readings + alarms + commands |
| InvoiceCommandCenter | 602 | MOCK_ONLY | V2 query + invoiceRepo | 10+ sections |
| PaymentWorkspace | 610 | MOCK_ONLY | V2 query + paymentRepo | 10+ sections |
| ReadingWorkspace | 636 | MOCK_ONLY | V2 query + readingRepo | 10+ sections + charts |
| EnterpriseAdminCenter | 766 | MOCK_ONLY | EnterpriseRepo | 20+ tabs, 4 categories |

### 2.3 Experience Components (5 files)

| Component | Lines | Status | Dependencies | Notes |
|-----------|-------|--------|--------------|-------|
| Dashboard | 421 | MOCK_ONLY | V2 query hooks | KPI cards, charts, health, pipeline |
| Explorer | 143 | PRODUCTION | Workspace store | Entity sidebar |
| Inspector | 163 | PRODUCTION | Workspace store | Entity preview |
| SearchModal | 65 | PRODUCTION | Search store | Cmd+Shift+F |
| Timeline | 84 | PRODUCTION | framer-motion | Animated events |
| AnalyticsCard | 191 | PRODUCTION | SVG, framer-motion | Sparkline trend |
| Charts | 224 | PRODUCTION | SVG, framer-motion | Bar, line, pie, donut, area |

---

## 3. Key Findings

### 3.1 Duplicated Components

| Component | V1 Location | V2 Location | Status |
|-----------|-------------|-------------|--------|
| Button | `components/ui/button.tsx` | `v2/components/ui/Button.tsx` | V2 wins (Radix Slot, CVA) |
| Input | `components/ui/input.tsx` | `v2/components/ui/input.tsx` | V2 wins (forwarded-ref) |
| Select | `components/ui/select.tsx` | `v2/components/ui/select.tsx` | V2 wins (Radix, full suite) |
| Dialog | `components/ui/dialog.tsx` | `v2/components/ui/dialog.tsx` | V2 wins (Radix, full suite) |
| Dropdown | `components/ui/dropdown.tsx` | `v2/components/ui/dropdown.tsx` | V2 wins (Radix, full suite) |
| Context Menu | `components/ui/context-menu.tsx` | `v2/components/ui/context-menu.tsx` | V2 wins (Radix, full suite) |
| Toast | `components/ui/toast.tsx` | `v2/components/ui/toast.tsx` | Different (custom vs Sonner) |
| Table | `components/ui/enterprise-table.tsx` | `v2/components/ui/data-grid.tsx` | V2 wins (TanStack) |
| Search | `components/search/SearchDialog.tsx` | `v2/components/ui/command-palette.tsx` | V2 wins (cmdk) |
| Timeline | `components/ui/timeline.tsx` | `v2/components/timeline/Timeline.tsx` | Minor differences |
| DatePicker | `components/ui/date-picker.tsx` | `v2/components/ui/date-picker.tsx` | V2 wins (react-day-picker) |
| Charts | `components/ui/charts.tsx` (Recharts) | `v2/components/analytics/Charts.tsx` (SVG) | Different libraries |
| Sidebar | `components/navigation/Sidebar.tsx` | `v2/components/layout/Sidebar.tsx` | Different implementations |
| Shell | `components/layout/AppShell.tsx` | `v2/components/layout/Shell.tsx` | V2 wins |
| Workspace | `components/workspace/shells/WorkspaceShell.tsx` | `v2/components/workspace/GlobalShell.tsx` | V2 wins |

### 3.2 Dead/Legacy Components (V1, no V2 equivalent planned)

| Component | Reason |
|-----------|--------|
| `experience/chart/ChartWrappers.tsx` | Replaced by V2 SVG-based Charts |
| `experience/hero/HeroSection.tsx` | Replaced by V2 shell patterns |
| `experience/kpi/MetricCard.tsx` | Replaced by V2 AnalyticsCard |
| `navigation/AdaptiveSidebar.tsx` | Replaced by V2 Sidebar |
| `navigation/BreadcrumbEngine.tsx` | Replaced by V2 Breadcrumb |
| `notification/ToastContainer.tsx` | Replaced by V2 Sonner Toaster |
| `layout/AppShell.tsx` | Replaced by V2 Shell + GlobalShell |
| `layout/EnterpriseShell.tsx` | Replaced by V2 layout |
| `layout/TopNavigation.tsx` | Replaced by V2 shell patterns |
| `navigation/Topbar.tsx` | Legacy, replaced by TopNavigation |
| `navigation/Sidebar.tsx` | Legacy, replaced by AdaptiveSidebar |
| `search/SearchDialog.tsx` | Replaced by V2 SearchModal + CommandPalette |
| `shared/SmartTable.tsx` | Replaced by V2 DataGrid (TanStack) |
| `ui/enterprise-table.tsx` | Replaced by V2 DataGrid |
| `ui/glass-card.tsx` | Not used in V2 |
| `ui/bottom-sheet.tsx` | No V2 equivalent |
| `ui/file-upload.tsx` | No V2 equivalent |
| `ui/business-primitives.tsx` | No direct V2 equivalent |
| `ui/hover-card.tsx` | No V2 equivalent |
| `loading/LoadingStates.tsx` | Replaced by V2 states.tsx |
| `state/StateComponents.tsx` | Replaced by V2 states.tsx |
| `ui/command-palette.tsx` | Replaced by V2 CommandPalette (cmdk) |
| `ui/advanced-inputs.tsx` | No V2 equivalent |

### 3.3 Only-in-V1 Components (no V2 replacement)

| Component | Lines | Notes |
|-----------|-------|-------|
| `ui/GlassCard` | 29 | Glassmorphism style |
| `ui/BottomSheet` | 29 | Mobile pattern |
| `ui/FileUpload` | 32 | Drag-and-drop |
| `ui/HoverCard` | 15 | Hover preview |
| `ui/AdvancedInputs` (Currency, OTP, Tag, Slider) | 78 | Specialized inputs |
| `ui/BusinessPrimitives` | 96 | KPIStrip, Ribbon, EntityHeader, etc. |
| `ui/EnterpriseTable` | 95 | Density modes, sticky columns |
| `workflow/WorkflowAssistant` | 97 | Floating workflow widget |
| `customers/CustomerTabs` | 208 | 17-tab interface |
| `customers/CustomerHealthWidget` | 30 | SVG gauge |
| `customers/CustomerSmartPanel` | 48 | Smart assistant |
| `customers/CustomerRelationshipPanel` | 46 | Tree diagram |
| `experience/HeroSection` | 45 | Page header pattern |
| `experience/StatCard` variants | 38 | Card primitives |
| `page/PageHeader` | 37 | Page layout |

### 3.4 Empty Directories

| Directory | Purpose |
|-----------|---------|
| `src/components/animation/` | Planned animation components |
| `src/components/business/` | Planned business logic components |
| `src/components/gis/` | Planned GIS/map components |
| `src/components/ledger/` | Planned ledger components |
| `src/components/panels/` | Planned panel components |
| `src/components/permission/` | Planned permission components |
| `src/components/wallet/` | Planned wallet components |
| `src/v2/adapters/` | Planned backend adapters |
| `src/v2/contracts/` | Planned API contracts |
| `src/v2/mappers/` | Planned data mappers |
| `src/v2/services/` | Planned service layer |
| `src/v2/utils/` | Planned V2 utilities |
