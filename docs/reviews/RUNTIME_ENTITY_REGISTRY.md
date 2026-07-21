# Runtime Entity Registry

**Date:** 2026-07-21  
**Phase:** 40 — Enterprise Architecture Validation  
**Scope:** Workspace Engine, Runtime Registry, Page Registry, Widget Registry, Toolbar Registry, Context Menu Registry, Command Palette, Inspector, Workspace Tabs, Dock, Quick Actions, Recent Items, Favorites, Notifications  

---

## Runtime Kernel Architecture

The MeterVerse runtime kernel has 26 modules across 48 files. It includes:
- **11 Registries:** app, command, permission, event, service, plugin, theme, locale, shortcut, panel, inspector
- **Event Bus:** publish/subscribe with replay, versioning, debugging
- **Data Engine:** cache, offline queue, optimistic updates
- **Workflow Engine:** state machine, approval, scheduling

### Registry Contents

| Registry | File | Contents | Customer Registered? |
|----------|------|----------|:--------------------:|
| **App Registry** | `runtime/registry/app-registry.ts` | 5 workspace apps: Customers, Meters, Readings, Invoices, Payments | ✅ Yes |
| **Command Registry** | `runtime/registry/command-registry.ts` | Commands for navigation, actions, search | ❌ Not checked |
| **Permission Registry** | `runtime/registry/permission-registry.ts` | Permission definitions | ❌ Not checked |
| **Event Registry** | `runtime/registry/event-registry.ts` | Event types and handlers | ❌ Not checked |
| **Service Registry** | `runtime/registry/service-registry.ts` | Service instances | ❌ Not checked |
| **Plugin Registry** | `runtime/registry/plugin-registry.ts` | Plugin definitions | ❌ Not checked |

---

## Workspace Engine

The Workspace Engine is the main application shell. It consists of:
- **WorkspaceLayout** — sidebar + toolbar + tabs + inspector
- **WorkspaceTabs** — tab management for open apps
- **InspectorPanel** — API query runner + command history

### Registered Workspace Apps

| App | Registry Name | Has Page? | Has Widget? | Has Component? |
|-----|:-------------:|:---------:|:-----------:|:--------------:|
| Customers | `app_registry` | ✅ (admin) | ❌ | ❌ |
| Meters | `app_registry` | ✅ (admin) | ❌ | ❌ |
| Readings | `app_registry` | ✅ (admin) | ❌ | ❌ |
| Invoices | `app_registry` | ✅ (admin) | ❌ | ❌ |
| Payments | `app_registry` | ✅ (admin) | ❌ | ❌ |

**Finding:** The workspace apps are registered but only have admin pages, not workspace-integrated pages. The workspace apps use mock data — they are not connected to real backend APIs.

---

## Page Registry

The Page Registry maps route paths to page components. Currently:
- Admin pages: 52 pages (45 GenericAdminPage + 7 custom)
- Dashboard pages: 13 pages
- Workspace apps: 5 apps (mock data)

**Customer is registered in:**
- ✅ Admin: `/admin/customers` (GenericAdminPage — wrong API endpoint)
- ❌ Dashboard: `/dashboard/customers` (missing)
- ✅ Workspace: App registry (mock data)
- ✅ BFF: `/api/meterverse/customers` (proxies to backend or mock)

---

## Widget Registry

**Widget Registry:** Not implemented. No entity has dashboard widgets registered.

All KPIs are displayed as static text in GenericAdminPage stat cards — they are not registered as reusable widgets that can be placed on dashboards.

---

## Toolbar Registry

**Toolbar Registry:** Not implemented. The admin toolbar (AdminToolbar.tsx) and user toolbar (dashboard layout) are hardcoded, not registry-driven.

---

## Context Menu Registry

**Context Menu Registry:** Not implemented. Row action menus (View, Edit, Delete, etc.) are hardcoded in GenericAdminPage. They are not configurable per entity.

---

## Command Palette

**Current State:**
- KBar command palette exists in `/dashboard/layout.tsx`
- Provides quick navigation and keyboard shortcuts
- **NOT available in admin layout**

**Customer commands:** None registered. The command palette cannot navigate to customer pages or execute customer actions.

---

## Inspector

**InspectorPanel** (`Frontend/src/admin/layout/InspectorPanel.tsx`):
- API query runner: Execute arbitrary API calls
- Command history: Previous commands with results
- Collapse/expand: Two states

**Customer relevance:** The inspector can manually query `/api/meterverse/customers` but has no customer-specific integration (no saved queries, no customer context).

---

## Workspace Tabs

**WorkspaceTabs** component exists in the admin layout. Tabs track open apps/pages. Currently only tracks the active page ID in `openTabs` state.

---

## Dock

**Dock:** Not implemented. No persistent icon dock for quick app switching.

---

## Quick Actions

**Quick Actions:** Not implemented. No configurable quick action buttons.

---

## Recent Items

**Recent Items:** Not implemented. No recently accessed entities tracking.

---

## Favorites

**Favorites:** Not implemented. No entity favoriting system.

---

## Notifications

**Notification System:**
- In-app notification center at `/dashboard/notifications`
- Notification model in Prisma (12 fields)
- NotificationTemplate model for templates
- EmailLog, SmsLog, PushNotification for channel delivery
- **NOT wired to any business event**

**Customer notifications:** 0/12 customer lifecycle events trigger notifications.

---

## Customer Integration Summary

| Runtime Component | Customer Integrated? | Status |
|------------------|:--------------------:|:------:|
| App Registry | ✅ | Registered as workspace app |
| Page Registry | ✅ | Admin page exists (wrong API) |
| Widget Registry | ❌ | No dashboard widgets |
| Toolbar Registry | ❌ | Not registry-driven |
| Context Menu | ❌ | Hardcoded in GenericAdminPage |
| Command Palette | ❌ | No customer commands |
| Inspector | ❌ | No saved queries |
| Workspace Tabs | ❌ | No customer-specific tab behavior |
| Dock | ❌ | Not implemented |
| Quick Actions | ❌ | Not implemented |
| Recent Items | ❌ | Not implemented |
| Favorites | ❌ | Not implemented |
| Notifications | ❌ | 0/12 events wired |
| Event Bus | ❌ | 0 subscribers |
| Data Engine | ❌ | Cache/offline/optimistic not used for customer |

**Customer Runtime Integration Score: 3/15 (20%)**
