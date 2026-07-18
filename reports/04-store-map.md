# 04 — Store Map

**Date:** 2026-07-11
**Mode:** Read-Only Audit
**Scope:** All Zustand stores in V1 (src/lib/stores/) and V2 (src/v2/stores/)

---

## 1. V1 Stores (4 files)

### 1.1 `useWorkspaceStore` (112 lines)

| Property | Value |
|----------|-------|
| **Path** | `src/lib/stores/workspace-store.ts` |
| **Persistence** | `localStorage` key: `"meter-verse-workspace"` |
| **Pattern** | Single monolithic store |

**State (19 fields):**
| Field | Type | Default |
|-------|------|---------|
| `currentWorkspace` | string | `"operations"` |
| `currentProject` | string | `""` |
| `currentArea` | string | `""` |
| `currentDepartment` | string | `""` |
| `currentPage` | string | `"dashboard"` |
| `currentLayout` | PageLayout enum | `"dashboard"` |
| `sidebarExpanded` | boolean | `true` |
| `recentWorkspaces` | string[] | `[]` |
| `favoriteWorkspaces` | string[] | `[]` |
| `recentPages` | string[] | `[]` |
| `pinnedPages` | string[] | `[]` |
| `panelLeftOpen` | boolean | `false` |
| `panelRightOpen` | boolean | `false` |
| `panelBottomOpen` | boolean | `false` |
| `panelLeftWidth` | number | `320` |
| `panelRightWidth` | number | `320` |
| `panelBottomHeight` | number | `240` |

**Actions (18):** setWorkspace, setProject, setArea, setDepartment, setPage, setLayout, toggleSidebar, setSidebarExpanded, addRecentWorkspace, toggleFavoriteWorkspace, addRecentPage, togglePinnedPage, togglePanelLeft, togglePanelRight, togglePanelBottom, setPanelLeftWidth, setPanelRightWidth, setPanelBottomHeight

**Consumers (9):** WorkspaceManager, BreadcrumbEngine, AdaptiveSidebar, TopNavigation, EnterpriseShell, MeterExplorer, InvoiceExplorer, SearchDialog, CustomerExplorer, PaymentExplorer

### 1.2 `useThemeStore` (64 lines, at `lib/stores/theme-store.ts`)

| Property | Value |
|----------|-------|
| **Path** | `src/lib/stores/theme-store.ts` |
| **Persistence** | `localStorage` key: `"mv-theme"` |
| **Pattern** | Single store |

**State (4 fields):** mode (ThemeMode), density (DensityMode), dir (Direction), reducedMotion (boolean)

**Actions (8):** setMode, setTheme (alias), toggleTheme, setDensity, setDir, toggleDir, setReducedMotion

**Consumers:** TopNavigation, AppShell, ThemeProvider, showcase page

### 1.3 `useThemeStore` DUPLICATE (37 lines, at `lib/theme/theme-store.ts`)

| Property | Value |
|----------|-------|
| **Path** | `src/lib/theme/theme-store.ts` |
| **Persistence** | `localStorage` key: `"mv-theme"` (same key!) |
| **Pattern** | Single store |

**Differences from primary:**
- No `"high-contrast"` in ThemeMode
- No direction/reducedMotion state
- Has `sidebarExpanded` (from workspace store)
- `toggleMode` cycles: light -> dark -> adaptive -> gray -> light (no high-contrast)

**Consumers (4):** WorkspaceShell, Sidebar, Topbar, GlobalProviders

**Risk:** Both stores persist to `"mv-theme"` and will overwrite each other.

### 1.4 `useNotificationStore` (17 lines)

| Property | Value |
|----------|-------|
| **Path** | `src/lib/stores/notification-store.ts` |
| **Persistence** | None (in-memory) |
| **Pattern** | Simple list |

**State:** notifications (max 100), unreadCount

**Actions (7):** add, addNotification (alias), markRead, markAllRead, dismiss, clearNotification (alias), clearAll

**Consumers (7+):** TopNavigation (display + markRead/dismiss), ToastContainer, ToastManager, Topbar, MeterDetail, InvoiceWorkspace, TariffStudio, PaymentWorkspace, CustomerWorkspace, CustomerWorkspaceHeader, CustomerDetail, ReadingExplorer

### 1.5 `useLocaleStore` (27 lines)

| Property | Value |
|----------|-------|
| **Path** | `src/lib/locale/locale-store.ts` |
| **Persistence** | `localStorage` key: `"mv-locale"` |
| **Pattern** | Single store |

**State:** locale (`"ar"|"en"`), dir (`"rtl"|"ltr"`)

**Actions:** setLocale, toggleLocale

**Consumers:** Topbar, Sidebar, GlobalProviders, LocaleProvider (i18n context)

---

## 2. V2 Stores (9 files)

### 2.1 Store Architecture (Composition Pattern)

V2 uses a **composition pattern** where `stores/workspace.ts` re-exports 6 individual stores plus a composite `useWorkspace()` hook. Each sub-store is independently created with `zustand`.

### 2.2 Sub-Store Breakdown

| Store | File | Lines | Persistence | State | Consumers |
|-------|------|-------|-------------|-------|-----------|
| `useSelectionStore` | `stores/selection.ts` | 25 | None | activeEntityType, activeEntityId, multiSelectIds, previewEntity | GlobalShell, Explorer |
| `useTabsStore` | `stores/tabs.ts` | 49 | None | tabs[], activeTabId, maxTabs (10) | Workspace, GlobalShell |
| `useExplorerStore` | `stores/explorer.ts` | 51 | None | search, filter, density, groupBy, sortBy, sortDir, view, favorites, pinned, savedView | Explorer |
| `useLayoutStore` | `stores/layout.ts` | 29 | None | explorerOpen, inspectorOpen, explorerWidth, inspectorWidth | GlobalShell |
| `useNavigationStore` | `stores/navigation.ts` | 18 | None | recentHistory (max 20) | GlobalShell |
| `useSearch` | `stores/search.ts` | 54 | None | open, query, results[], mockSearch() | SearchModal, CommandPalette |
| `useCommandPalette` | `stores/commands.ts` | 28 | None | open, query, registeredCommands[] | CommandPalette |

### 2.3 Composite Store

| Export | File | Lines | What it does |
|--------|------|-------|--------------|
| `useWorkspace()` | `stores/workspace.ts` | 81 | Maps all 6 sub-stores into a single flat object |

**Consumers:** GlobalShell, Workspace, Explorer, Inspector

---

## 3. Store Comparison: V1 vs V2

| Concern | V1 Store | V2 Store | Analysis |
|---------|----------|----------|----------|
| Entity Selection | `currentPage` (string) | `useSelectionStore` (entityType + entityId + multiSelect + preview) | V2 is richer |
| Workspace State | `useWorkspaceStore` (19 fields, monolithic) | 6 sub-stores (composition) | V2 is modular |
| Theme | `useThemeStore` (2 duplicates!) | CSS variables only | V2 removed store dependency |
| Notifications | `useNotificationStore` (V1) + Sonner (V2) | Sonner Toaster | V2 uses library directly |
| Search | None | `useSearch` + `useCommandPalette` | V2 added |
| Locale | `useLocaleStore` (separate file) | Not in V2 stores | V2 uses CSS-only |
| Persistence | localStorage | None in V2 stores | V2 is session-only |

---

## 4. Issues & Recommendations

### 4.1 Duplicate Theme Stores

Two `useThemeStore` definitions exist at different paths (`lib/stores/theme-store.ts` vs `lib/theme/theme-store.ts`), both persisting to `"mv-theme"`. They have slightly different type definitions and state fields. **CONSOLIDATE** into the `lib/stores/` version.

### 4.2 V1 Workspace Store Bloat

`useWorkspaceStore` (112 lines) combines workspace selection, page navigation, sidebar state, and panel preferences. This should be split into sub-stores as V2 has done.

### 4.3 Missing V2 Store Persistence

None of the V2 stores use `zustand/middleware` persist. If a user refreshes, all state is lost (active tab, entity selection, explorer filters). Add persistence to critical stores (tabs, selection, layout).

### 4.4 V1 Notification Store Aliases

`add`/`addNotification`, `dismiss`/`clearNotification` are duplicate aliases confusing the API. Remove aliases, keep canonical names.

### 4.5 Dead V2 Stores

No component has been observed consuming `useNavigationStore` (recentHistory) outside of the `useWorkspace()` composite. Confirm if this is a dead store or planned for future use.
