# MeterVerse Enterprise Component Registry
**Date:** 2026-07-17 | **Files Cataloged:** ~150 | **Status:** Draft

---

## Legend

| Status | Meaning |
|--------|---------|
| ✅ KEEP | Production-ready, reusable |
| 🔄 REPLACE | Architecture good, data layer needs swap |
| 🔧 REFACTOR | Needs optimization |
| ❌ REMOVE | Demo only, not for production |

---

## 1. Layout Components

| Component | File | Type | Status | Lines | Notes |
|-----------|------|------|--------|-------|-------|
| `AppSidebar` | `components/layout/app-sidebar.tsx` | Layout | 🔧 REFACTOR | 175 | Replace with SidebarV2 |
| `Header` | `components/layout/header.tsx` | Layout | ✅ KEEP | 33 | Add locale switcher, workspace selector |
| `PageContainer` | `components/layout/page-container.tsx` | Layout | ✅ KEEP | 70 | Page wrapper with title, loading, access control |
| `Providers` | `components/layout/providers.tsx` | Layout | ✅ KEEP | 40 | Clerk + Theme + Query providers |
| `QueryProvider` | `components/layout/query-provider.tsx` | Layout | ✅ KEEP | 17 | TanStack Query |
| `UserNav` | `components/layout/user-nav.tsx` | Layout | ✅ KEEP | 54 | User dropdown |
| `InfoSidebar` | `components/layout/info-sidebar.tsx` | Layout | ✅ KEEP | 99 | Right info panel |
| `CTAGithub` | `components/layout/cta-github.tsx` | Layout | ❌ REMOVE | 24 | Template branding |

---

## 2. Sidebar Components (Planned — Phase 3)

| Component | Purpose | Priority |
|-----------|---------|----------|
| `SidebarV2` | Main orchestrator with 4 modes | P0 |
| `SidebarItem` | Single nav item with glow, badge, animation | P0 |
| `SidebarDock` | Floating pill dock mode | P0 |
| `SidebarWorkspace` | Area → Org → Project selector | P0 |
| `SidebarSearch` | Inline search with cmd+k | P0 |
| `SidebarNotifications` | Bell icon + dropdown panel | P0 |
| `SidebarProfile` | User avatar + dropdown menu | P0 |
| `SidebarFloatingActions` | AI Assistant entry | P1 |
| `SidebarCollapse` | Collapse/expand toggle | P0 |
| `SidebarExpand` | Hover-expand overlay | P0 |
| `SidebarFooter` | Footer with collapse + profile | P0 |
| `SidebarTheme` | Mode switcher + density toggle | P0 |

---

## 3. Navigation Components

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| `NavMain` | `components/nav-main.tsx` | ✅ KEEP | Sidebar nav group collapsible |
| `NavProjects` | `components/nav-projects.tsx` | ✅ KEEP | Projects with context menu |
| `NavUser` | `components/nav-user.tsx` | ✅ KEEP | User section in sidebar |
| `OrgSwitcher` | `components/org-switcher.tsx` | ✅ KEEP | Clerk org switcher |
| `Breadcrumbs` | `components/breadcrumbs.tsx` | ✅ KEEP | Dynamic breadcrumb |
| `SearchInput` | `components/search-input.tsx` | ✅ KEEP | KBar trigger button |

---

## 4. Theme Components

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| `ThemeProvider` | `components/themes/theme-provider.tsx` | ✅ KEEP | Wraps next-themes |
| `ThemeSelector` | `components/themes/theme-selector.tsx` | ✅ KEEP | Theme dropdown |
| `ThemeModeToggle` | `components/themes/theme-mode-toggle.tsx` | ✅ KEEP | Dark/light toggle |
| `ActiveTheme` | `components/themes/active-theme.tsx` | ✅ KEEP | Cookie persistence |
| `FontConfig` | `components/themes/font.config.ts` | 🔧 REFACTOR | 14 fonts → 3 |

---

## 5. shadcn/ui Primitives (All ✅ KEEP)

| Category | Components |
|----------|-----------|
| **Layout** | `sidebar`, `sheet`, `resizable`, `scroll-area`, `separator` |
| **Navigation** | `accordion`, `breadcrumb`, `dropdown-menu`, `navigation-menu`, `tabs`, `menubar` |
| **Display** | `badge`, `card`, `avatar`, `table`, `tooltip`, `hover-card`, `context-menu` |
| **Feedback** | `alert`, `alert-dialog`, `dialog`, `toast`, `sonner`, `progress`, `skeleton` |
| **Input** | `button`, `input`, `select`, `checkbox`, `radio-group`, `switch`, `textarea`, `slider`, `label`, `form`, `toggle`, `toggle-group`, `input-otp` |
| **Overlay** | `dialog`, `sheet`, `drawer`, `popover`, `command` |
| **Data** | `table`, `pagination`, `collapsible` |

**Total: ~50 shadcn components**

---

## 6. Form System (All ✅ KEEP)

| Component | File | Notes |
|-----------|------|-------|
| `useAppForm` | `components/ui/tanstack-form.tsx` | Main form hook |
| `createFormField` | `components/ui/form-context.tsx` | Field factory |
| `TextField` | `components/forms/fields/text-field.tsx` | With FormTextField |
| `TextareaField` | `components/forms/fields/textarea-field.tsx` | With FormTextareaField |
| `SelectField` | `components/forms/fields/select-field.tsx` | With FormSelectField |
| `CheckboxField` | `components/forms/fields/checkbox-field.tsx` | With FormCheckboxField |
| `SwitchField` | `components/forms/fields/switch-field.tsx` | With FormSwitchField |
| `RadioGroupField` | `components/forms/fields/radio-group-field.tsx` | With FormRadioGroupField |
| `SliderField` | `components/forms/fields/slider-field.tsx` | With FormSliderField |
| `FileUploadField` | `components/forms/fields/file-upload-field.tsx` | With FormFileUploadField |
| `Field` | `components/ui/field.tsx` | Base field container |
| `FieldLabel` | `components/ui/field.tsx` | Field label |
| `FieldError` | `components/ui/field.tsx` | Error display |
| `FieldDescription` | `components/ui/field.tsx` | Description text |

---

## 7. Data Table System (All ✅ KEEP)

| Component | File | Notes |
|-----------|------|-------|
| `DataTable` | `components/ui/table/data-table.tsx` | Core with scrolling, pinning |
| `DataTablePagination` | `components/ui/table/data-table-pagination.tsx` | Page controls |
| `DataTableToolbar` | `components/ui/table/data-table-toolbar.tsx` | Auto-generated filters |
| `DataTableColumnHeader` | `components/ui/table/data-table-column-header.tsx` | Sortable header |
| `DataTableFacetedFilter` | `components/ui/table/data-table-faceted-filter.tsx` | Multi-select filter |
| `DataTableDateFilter` | `components/ui/table/data-table-date-filter.tsx` | Date range filter |
| `DataTableSliderFilter` | `components/ui/table/data-table-slider-filter.tsx` | Range slider filter |
| `DataTableFilterClear` | `components/ui/table/data-table-filter-clear.tsx` | Clear all button |
| `DataTableViewOptions` | `components/ui/table/data-table-view-options.tsx` | Column toggle |
| `DataTableSkeleton` | `components/ui/table/data-table-skeleton.tsx` | Loading state |
| `useDataTable` | `hooks/use-data-table.ts` | Hook with nuqs URL state |

---

## 8. Chart Components

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| `BarGraph` | `features/overview/components/bar-graph.tsx` | 🔄 REPLACE | Hardcoded data |
| `AreaGraph` | `features/overview/components/area-graph.tsx` | 🔄 REPLACE | Hardcoded data |
| `PieGraph` | `features/overview/components/pie-graph.tsx` | 🔄 REPLACE | Hardcoded data |
| `RecentSales` | `features/overview/components/recent-sales.tsx` | 🔄 REPLACE | Hardcoded data |
| Chart skeletons | `features/overview/skeletons/` | ✅ KEEP | 4 skeleton loaders |

---

## 9. Command Palette (All ✅ KEEP)

| Component | File | Notes |
|-----------|------|-------|
| `KBar` | `components/kbar/index.tsx` | KBar provider with actions |
| `ResultItem` | `components/kbar/result-item.tsx` | Search result |
| `RenderResult` | `components/kbar/render-result.tsx` | Results list |
| `useThemeSwitching` | `components/kbar/use-theme-switching.tsx` | Theme shortcuts |

---

## 10. Business Components (Feature Modules)

| Feature | Key Components | Status | Data Source |
|---------|---------------|--------|-------------|
| **Products** | `ProductListing`, `ProductViewPage`, `ProductForm`, `ProductTable` | 🔄 REPLACE | mock-api |
| **Users** | `UserListing`, `UserFormSheet`, `UsersTable` | 🔄 REPLACE | mock-api-users |
| **Overview** | `BarGraph`, `AreaGraph`, `PieGraph`, `RecentSales` | 🔄 REPLACE | Hardcoded |
| **Kanban** | `KanbanBoard`, `BoardColumn`, `TaskCard`, `NewTaskDialog` | 🔄 REPLACE | In-memory store |
| **Chat** | `Messenger`, `ChatArea`, `ConversationList`, `MessageComposer` | 🔄 REPLACE | In-memory store |
| **Notifications** | `NotificationsPage`, `NotificationCenter`, `NotificationItem` | 🔄 REPLACE | In-memory store |
| **Auth** | `SignInView`, `SignUpView`, `UserAuthForm` | ✅ KEEP | Clerk |
| **Profile** | `ProfileViewPage`, `FormSchema` | ✅ KEEP | Clerk |

---

## 11. Utility Components

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| `Icons` | `components/icons.tsx` | ✅ KEEP | 90+ icon registry |
| `FileUploader` | `components/file-uploader.tsx` | ✅ KEEP | Drag-drop upload |
| `AlertModal` | `components/modal/alert-modal.tsx` | ✅ KEEP | Confirm dialog |
| `FormCardSkeleton` | `components/form-card-skeleton.tsx` | ✅ KEEP | Loading skeleton |
| `UserAvatarProfile` | `components/user-avatar-profile.tsx` | ✅ KEEP | User avatar |

---

## 12. Hooks Registry

| Hook | File | Purpose | Status |
|------|------|---------|--------|
| `useBreadcrumbs` | `hooks/use-breadcrumbs.tsx` | Path-based breadcrumb | ✅ |
| `useNav` | `hooks/use-nav.ts` | RBAC nav filtering | ✅ |
| `useDataTable` | `hooks/use-data-table.ts` | Table + URL state | ✅ |
| `useMobile` | `hooks/use-mobile.tsx` | Mobile detection | ✅ |
| `useMediaQuery` | `hooks/use-media-query.ts` | Media query state | ✅ |
| `useStepper` | `hooks/use-stepper.tsx` | Multi-step forms | ✅ |
| `useDebouncedCallback` | `hooks/use-debounced-callback.ts` | Debounce | ✅ |
| `useDebounce` | `hooks/use-debounce.tsx` | Debounce | ✅ |
| `useControllableState` | `hooks/use-controllable-state.tsx` | State pattern | ✅ |
| `useCallbackRef` | `hooks/use-callback-ref.ts` | Stable callback | ✅ |

---

## 13. Store Registry

| Store | File | State | Status |
|------|------|-------|--------|
| `useSidebarStore` (planned) | `lib/stores/sidebar-store.ts` | Sidebar mode, width, pinned | 🔧 PLAN |
| Kanban store | `features/kanban/utils/store.ts` | Tasks, columns, drag state | 🔄 REPLACE |
| Chat store | `features/chat/utils/store.ts` | Conversations, messages | 🔄 REPLACE |
| Notification store | `features/notifications/utils/store.ts` | Notifications, unread count | 🔄 REPLACE |

---

## 14. Planned Enterprise Components (Phase 2+)

| Component | Purpose | Phase |
|-----------|---------|-------|
| `WorkspaceShell` | 3-column workspace layout | P2 |
| `PanelLayout` | Resizable panel system | P2 |
| `InspectorPanel` | Right context panel | P2 |
| `FloatingPanel` | Floating overlay panel | P2 |
| `EntityDetail` | Entity detail view | P2 |
| `StatusBadge` | MeterVerse status indicators | P2 |
| `MetricsGrid` | KPI card grid | P2 |
| `Timeline` | Activity timeline | P3 |
| `PropertyPanel` | Entity property editor | P3 |
| `AIInsightCard` | AI-powered insight | P3 |

---

## Component Count Summary

| Category | Keep | Replace | Refactor | Remove | Total |
|----------|------|---------|----------|--------|-------|
| shadcn/ui | ~50 | 0 | 0 | 0 | ~50 |
| Layout | 6 | 0 | 1 | 1 | 8 |
| Navigation | 6 | 0 | 0 | 0 | 6 |
| Form System | 14 | 0 | 0 | 0 | 14 |
| Data Table | 11 | 0 | 0 | 0 | 11 |
| Charts | 4 | 4 | 0 | 0 | 8 |
| KBar | 4 | 0 | 0 | 0 | 4 |
| Business | 6 | 11 | 0 | 0 | 17 |
| Utility | 5 | 0 | 0 | 0 | 5 |
| Hooks | 10 | 0 | 0 | 0 | 10 |
| Theme | 5 | 0 | 1 | 0 | 6 |
| Planned | 0 | 0 | 0 | 0 | 9 |
| **TOTAL** | **121** | **15** | **2** | **1** | **~148** |
