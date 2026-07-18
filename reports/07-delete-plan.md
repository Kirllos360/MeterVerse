# 07 — Delete Plan

**Date:** 2026-07-11
**Mode:** Read-Only Audit
**Scope:** Every folder, component, route with risk level, safety, blockers, and dependencies

---

## Deletion Risk Classification

| Risk Level | Definition | Action |
|------------|-----------|--------|
| 🔴 HIGH | Active dependency chain, removal would break the app | Must migrate dependencies first |
| 🟡 MEDIUM | Referenced but not critical, or duplicates exist | Safe to delete after soft-deprecation |
| 🟢 LOW | Dead code, unused, no consumers | Safe to delete now |
| ⚪ INFO | Structural (empty dir, barrel file) | Safe to delete, no functional impact |

---

## 1. Routes to Delete

| Route | Risk | Reason | Depends On | Blockers | Migrate To |
|-------|------|--------|------------|----------|------------|
| `/customers` | 🟡 MEDIUM | V2 duplicate exists | CustomerExplorer component | V1 CustomerExplorer has different UX | `/v2/customers` |
| `/customers/[id]` | 🟡 MEDIUM | V2 duplicate exists | CustomerWorkspace component | V1 workspace has health widget + smart panel not in V2 | `/v2/customers/[id]` |
| `/invoices` | 🟡 MEDIUM | V2 duplicate exists | InvoiceExplorer component | V1 Explorer is simpler UI | `/v2/invoices` |
| `/invoices/[id]` | 🟡 MEDIUM | V2 duplicate exists | InvoiceWorkspace component | V2 InvoiceCommandCenter is more complete | `/v2/invoices/[id]` |
| `/meters` | 🟡 MEDIUM | V2 duplicate exists | MeterExplorer component | V1 has different filter/sort | `/v2/meters` |
| `/meters/[id]` | 🟡 MEDIUM | V2 duplicate exists | MeterDetail component | V2 MeterWorkspace is more complete | `/v2/meters/[id]` |
| `/payments` | 🟡 MEDIUM | V2 duplicate exists | PaymentExplorer component | V1 has simpler list | `/v2/payments` |
| `/payments/[id]` | 🟡 MEDIUM | V2 duplicate exists | PaymentWorkspace component | V2 PaymentWorkspace is more complete | `/v2/payments/[id]` |
| `/readings` | 🟡 MEDIUM | V2 duplicate exists | ReadingExplorer component | V1 has 4 tab filters | `/v2/readings` |
| `/collections` | 🟡 MEDIUM | No V2 equivalent, but low usage | CollectionDashboard | No duplicate, but could be recreated in V2 | Keep until V2 equivalent |
| `/financial` | 🟡 MEDIUM | No V2 equivalent | FinancialDashboard | No duplicate | Keep until V2 Dashboard covers it |
| `/tariffs` | 🟡 MEDIUM | No V2 equivalent | TariffStudio | No duplicate | Keep until V2 enterprise covers it |
| `/units` | 🟡 MEDIUM | No V2 equivalent | UnitExplorer | No duplicate | Keep until V2 covers it |
| `/showcase` | 🟢 LOW | V2 design-system exists | Many UI components | Versions target different design systems | `/v2/design-system` |
| `/auth/*` | 🟢 LOW | Empty dirs, no pages | Nothing | N/A | Delete (unused placeholders) |

---

## 2. V1 Components to Delete

### 2.1 Design System (Replaced by V2)

| Component | Risk | Reason | Safety Check | Migrate To |
|-----------|------|--------|-------------|------------|
| `ui/button.tsx` | 🔴 HIGH | Imported by all V1 pages | Must verify NO V1 page uses V2 Button | `v2/components/ui/Button.tsx` |
| `ui/input.tsx` | 🔴 HIGH | Imported by all V1 forms | Must verify | `v2/components/ui/input.tsx` |
| `ui/select.tsx` | 🔴 HIGH | Imported by V1 explorers | Must verify | `v2/components/ui/select.tsx` |
| `ui/checkbox.tsx` | 🔴 HIGH | Imported by filters | Must verify | `v2/components/ui/checkbox.tsx` |
| `ui/switch.tsx` | 🔴 HIGH | Imported by settings | Must verify | `v2/components/ui/switch.tsx` |
| `ui/badge.tsx` | 🔴 HIGH | Imported by all V1 pages | Must verify | `v2/components/ui/badge.tsx` |
| `ui/tabs.tsx` | 🔴 HIGH | Imported by workspaces | Must verify | `v2/components/ui/tabs.tsx` |
| `ui/card.tsx` | 🔴 HIGH | Imported by all V1 pages | Must verify | `v2/components/ui/card.tsx` |
| `ui/dialog.tsx` | 🟡 MEDIUM | V2 has Radix dialog | V1 dialogs may have different API | `v2/components/ui/dialog.tsx` |
| `ui/toast.tsx` | 🟡 MEDIUM | V2 uses Sonner | Different API | `v2/components/ui/toast.tsx` |
| `ui/command-palette.tsx` | 🟢 LOW | V2 uses cmdk | V2 is more complete | `v2/components/ui/command-palette.tsx` |
| `ui/context-menu.tsx` | 🟢 LOW | V2 has Radix version | V2 is more complete | `v2/components/ui/context-menu.tsx` |
| `ui/dropdown.tsx` | 🟢 LOW | V2 has Radix DropdownMenu | V2 is more complete | `v2/components/ui/dropdown.tsx` |
| `ui/popover.tsx` | 🟢 LOW | V2 has Radix popover | V2 is more complete | `v2/components/ui/popover.tsx` |
| `ui/tooltip.tsx` | 🟢 LOW | V2 has Radix tooltip | V2 is more complete | `v2/components/ui/tooltip.tsx` |
| `ui/progress.tsx` | 🟢 LOW | V2 has Radix progress | Same functionality | `v2/components/ui/progress.tsx` |
| `ui/skeleton.tsx` | 🟢 LOW | V2 has skeleton | V2 is simpler | `v2/components/ui/skeleton.tsx` |
| `ui/breadcrumb.tsx` | 🟢 LOW | V2 has breadcrumb with more features | V2 is more complete | `v2/components/ui/breadcrumb.tsx` |
| `ui/pagination.tsx` | 🟢 LOW | V2 has pagination with first/last | V2 is more complete | `v2/components/ui/pagination.tsx` |
| `ui/accordion.tsx` | 🟢 LOW | V2 has Radix accordion | V2 is more complete | `v2/components/ui/accordion.tsx` |

### 2.2 Dead Components (No V2 Equivalent, Low Usage)

| Component | Risk | Reason | Notes |
|-----------|------|--------|-------|
| `ui/glass-card.tsx` | 🟢 LOW | Not used in V2, low usage | Glassmorphism is not in V2 design |
| `ui/bottom-sheet.tsx` | 🟢 LOW | Mobile-only, not used | No V2 equivalent |
| `ui/file-upload.tsx` | 🟢 LOW | Not used in active pages | No V2 equivalent |
| `ui/hover-card.tsx` | 🟢 LOW | Rarely used | No V2 equivalent |
| `ui/advanced-inputs.tsx` | 🟢 LOW | CurrencyInput, OTPInput, TagInput, Slider | Only CurrencyInput might be needed |
| `ui/business-primitives.tsx` | 🟢 LOW | KPIStrip, Ribbon, EntityHeader, etc. | V2 has different patterns |
| `ui/charts.tsx` | 🟢 LOW | Recharts wrappers | V2 uses SVG-based Charts |
| `ui/enterprise-table.tsx` | 🟢 LOW | V2 uses DataGrid (TanStack) | V2 wins |
| `ui/avatar.tsx` | 🟢 LOW | V2 has Radix Avatar | V2 wins |

### 2.3 Legacy Layout/Navigation Components

| Component | Risk | Reason | Migrate To |
|-----------|------|--------|------------|
| `layout/AppShell.tsx` | 🟡 MEDIUM | Used by V1 pages | `v2/components/layout/Shell.tsx` |
| `layout/EnterpriseShell.tsx` | 🟡 MEDIUM | Used by V1 enterprise | V2 GlobalShell |
| `layout/TopNavigation.tsx` | 🟡 MEDIUM | Used by V1 pages | V2 Shell pattern |
| `navigation/Sidebar.tsx` | 🟢 LOW | Legacy, replaced by AdaptiveSidebar | `v2/components/layout/Sidebar.tsx` |
| `navigation/Topbar.tsx` | 🟢 LOW | Legacy, replaced by TopNavigation | V2 Shell |
| `search/SearchDialog.tsx` | 🟢 LOW | V2 has SearchModal + CommandPalette | `v2/components/search/SearchModal.tsx` |
| `shared/SmartTable.tsx` | 🟡 MEDIUM | Used by all V1 domain components | `v2/components/ui/data-grid.tsx` |
| `state/StateComponents.tsx` | 🟢 LOW | V2 has states.tsx with animation | `v2/components/ui/states.tsx` |
| `loading/LoadingStates.tsx` | 🟢 LOW | V2 has states.tsx | `v2/components/ui/states.tsx` |

### 2.4 V1 Domain Components (When V2 Reaches Parity)

| Component | Risk | Blockers |
|-----------|------|----------|
| `customers/CustomerExplorer.tsx` | 🟡 MEDIUM | V2 Explorer may not have same UX |
| `customers/CustomerWorkspace.tsx` | 🟡 MEDIUM | V2 CustomerWorkspace lacks health widget, smart panel, relationship panel |
| `customers/CustomerDetail.tsx` | 🟡 MEDIUM | No V2 equivalent for standalone detail |
| `customers/CustomerTabs.tsx` | 🟡 MEDIUM | 17-tab interface not replicated in V2 |
| `customers/CustomerHealthWidget.tsx` | 🟢 LOW | HealthScore computed in hook, widget is simple SVG |
| `customers/CustomerSmartPanel.tsx` | 🟢 LOW | Mock smart assistant |
| `customers/CustomerRelationshipPanel.tsx` | 🟢 LOW | Mock tree diagram |
| `customers/CustomerTimeline.tsx` | 🟢 LOW | V2 has Timeline component |
| `customers/CustomerAlerts.tsx` | 🟢 LOW | Simple alert list |
| `customers/CustomerKPICards.tsx` | 🟢 LOW | V2 has AnalyticsCard |
| `customers/CustomerWorkspaceHeader.tsx` | 🟢 LOW | V2 has different header pattern |
| `invoices/InvoiceExplorer.tsx` | 🟡 MEDIUM | V2 invoice list via Explorer |
| `invoices/InvoiceWorkspace.tsx` | 🟢 LOW | V2 InvoiceCommandCenter is more complete |
| `meters/MeterExplorer.tsx` | 🟡 MEDIUM | V2 meter list via Explorer |
| `meters/MeterDetail.tsx` | 🟢 LOW | V2 MeterWorkspace is more complete |
| `payments/PaymentExplorer.tsx` | 🟡 MEDIUM | V2 payment list via Explorer |
| `payments/PaymentWorkspace.tsx` | 🟢 LOW | V2 PaymentWorkspace is more complete |
| `readings/ReadingExplorer.tsx` | 🟡 MEDIUM | V2 reading list via Explorer |
| `tariffs/TariffStudio.tsx` | 🟡 MEDIUM | No V2 tariff component |
| `units/UnitExplorer.tsx` | 🟡 MEDIUM | No V2 unit component |
| `collections/CollectionDashboard.tsx` | 🟡 MEDIUM | No V2 collection component |
| `financial/FinancialDashboard.tsx` | 🟡 MEDIUM | V2 Dashboard covers some |
| `dashboard/DashboardEngine.tsx` | 🟢 LOW | V2 Dashboard is more complete |
| `workflow/WorkflowAssistant.tsx` | 🟢 LOW | Floating widget, not in V2 |
| `experience/*` | 🟡 MEDIUM | HeroSection, MetricCard, StatCard, ChartWrappers, ActivityTimeline — partially replaced by V2 |

---

## 3. V1 Stores to Delete

| Store | Risk | Reason | Migrate To |
|-------|------|--------|------------|
| `lib/stores/workspace-store.ts` | 🔴 HIGH | Used by 9 V1 components | V2 sub-stores (selection, tabs, layout, navigation, explorer) |
| `lib/stores/theme-store.ts` | 🟡 MEDIUM | Used by V1 components + duplicate exists | V2 uses CSS variables, no store needed |
| `lib/theme/theme-store.ts` | 🟢 LOW | Duplicate with slightly diff schema | Consolidate to `lib/stores/theme-store.ts` then deprecate |
| `lib/stores/notification-store.ts` | 🟡 MEDIUM | Used by 12+ V1 components | V2 uses Sonner, no store needed |
| `lib/locale/locale-store.ts` | 🟡 MEDIUM | Used by i18n context + V1 navigation | V2 uses CSS direction only |

---

## 4. V1 Hooks/API to Delete

| File | Risk | Reason | Migrate To |
|------|------|--------|------------|
| `lib/api/hooks.ts` | 🔴 HIGH | Used by 6 V1 domain components | V2 query framework |
| `lib/api/hooks-customers.ts` | 🔴 HIGH | Used by CustomerWorkspace | V2 query hooks |
| `lib/api/hooks-financial.ts` | 🔴 HIGH | Used by 7+ V1 components | V2 query hooks + repos |
| `lib/api/http-client.ts` | 🔴 HIGH | Foundation of V1 API | V2 ApiClient |
| `lib/api/backend-client.ts` | 🟡 MEDIUM | Never actually called (mock only) | V2 repositories |
| `lib/api/mock-data.ts` | 🟡 MEDIUM | Minimal, only used by V1 hooks | V2 mock data (richer) |

---

## 5. V2 Files to Delete/Clean

| File | Risk | Reason | Action |
|------|------|--------|--------|
| `v2/stores/index.ts` (legacy) | 🟢 LOW | Uses `api.get()` pattern, never called | Delete — V2 uses repositories |
| `v2/app/` (duplicate) | 🟡 MEDIUM | Another Next.js app directory; may conflict | Consolidate to `src/app/v2/` |
| Empty dirs (adapters, contracts, mappers, services, utils) | ⚪ INFO | Structural placeholders | Delete or populate |

---

## 6. Backend Files to Consider

| File | Risk | Reason |
|------|------|--------|
| `admin-portal/` | 🟢 LOW | Separate admin portal, possibly deprecated |
| `admin-console/` | 🟢 LOW | Separate admin console, possibly deprecated |
| `draft/legacy-templates/` | 🟢 LOW | Old template backups |
| `draft/legacy-reports/` | 🟢 LOW | Old report backups |

---

## 7. Deletion Order (Recommended Sequence)

| Phase | Action | Risk |
|-------|--------|------|
| **Phase 1 — Safe** | Delete empty dirs, dead components (glass-card, bottom-sheet, hover-card, file-upload, advanced-inputs) | 🟢 LOW |
| **Phase 2 — Low** | Delete legacy navigation (Sidebar, Topbar), legacy state/loading components | 🟢 LOW |
| **Phase 3 — Low** | Delete V1 search (SearchDialog), replace with V2 CommandPalette | 🟢 LOW |
| **Phase 4 — Low** | Delete duplicate theme store (`lib/theme/`), consolidate to `lib/stores/` | 🟢 LOW |
| **Phase 5 — Medium** | Delete V1 experience components (HeroSection, StatCard, etc.) after verifying V2 equivalent | 🟡 MEDIUM |
| **Phase 6 — Medium** | Delete V1 shared components (SmartTable) after migrating consumers to V2 DataGrid | 🟡 MEDIUM |
| **Phase 7 — Medium** | Delete V1 UI components after V1 pages are migrated to V2 | 🟡 MEDIUM |
| **Phase 8 — High** | Delete V1 domain components after V2 reaches parity for each domain | 🔴 HIGH |
| **Phase 9 — High** | Delete V1 routes after V2 migration complete | 🔴 HIGH |
| **Phase 10 — High** | Delete V1 stores/hooks/API after all consumers migrated to V2 | 🔴 HIGH |
