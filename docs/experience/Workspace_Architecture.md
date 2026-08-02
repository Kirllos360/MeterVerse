# P48 — Workspace Architecture

**Version:** 1.0 · The single application shell shared by Admin + User.

## 1. Workspace Model

```
┌─────────────────────────────────────────────────────────────────────┐
│ Toolbar (h-14): Logo | Area ▾ | Project ▾ | Search | Notif | AI | Lang | Theme | Profile │
├──────────┬──────────────────────────────────────┬───────────────────┤
│ Sidebar  │ Canvas (flex-1, scroll)              │ Inspector (320px) │
│ 72/260px │  ┌ Tabs ────────────────┐            │ contextual        │
│ nav      │  │ Tab1 | Tab2 | Tab3   │            │ (properties/      │
│ modules  │  └──────────────────────┘            │  timeline/tasks/  │
│          │  Page / App content                  │  activity/health) │
├──────────┴──────────────────────────────────────┴───────────────────┤
│ Status Bar: context | sync | scheduler | runtime health | quick actions │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. Workspace Elements (RULE 6 mapping)

| Element | Purpose | Current state |
|---|---|---|
| Toolbar | Global actions + context + identity | ✅ AdminToolbar |
| Sidebar | Module navigation | ✅ ALL_NAV_ITEMS / nav-config |
| Canvas + Tabs | Open apps/pages, state preserved | ✅ Zustand openPages/addOpenPage |
| Inspector | Contextual properties/timeline | ✅ InspectorPanel (partial) |
| Dock | Pinned/favorite objects | ⚠️ FavoritesRuntime (nav SDK) |
| Command Palette | Global search + actions | ✅ CommandPalette |
| Status Bar | Health/sync/context | ⚠️ partial |
| Quick Actions | Frequent operations | ⚠️ partial |
| Notifications | In-app + activity | ✅ notification store (partial) |
| AI Assistant | Contextual help | ⚠️ ai pages only |
| Breadcrumb | Location in context | ✅ Breadcrumbs |
| Action/Context Bar | Per-app actions | ✅ page headers |

## 3. Workspace Rules

- **SPA only** — no full-page reloads; URL stays stable (`/admin`).
- **Tabs preserve state** — switching apps keeps scroll/filters.
- **Context is global** — Area/Project in toolbar drive all data.
- **Inspector is contextual** — reflects the selected object.
- **Everything reachable by keyboard** (Command Palette).

## 4. State Model

- `admin-store`: activePage, openPages, theme, lang, location (area/project/zone/unit).
- `layout-store`, `theme-store`, `notification-store`, `command-store`, `workspace-store`.
- React Query cache for server data; nuqs for URL state.

## 5. Target Consolidations (Wave 3+)

1. Unify `/user` into `/` (one Operations Center).
2. Remove unused dashboard starter shell (Clerk).
3. Full inspector + dock + status bar across both centers.
4. AI assistant panel inside the workspace (contextual).
