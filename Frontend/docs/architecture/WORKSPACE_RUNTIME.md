# MeterVerse Workspace Runtime
**Date:** 2026-07-17 | **Status:** Draft

---

## Architecture

The Workspace Runtime is the central orchestrator for all workspace features. Every future application registers itself into the runtime instead of modifying the shell directly.

```
RuntimeProvider
  └── WorkspaceRuntime
       ├── EventBus (pub/sub for all workspace events)
       ├── WindowManager (floating windows, dialogs, drawers)
       ├── PanelRuntime (sidebar, inspector, bottom, toolbar panels)
       ├── LayoutPresets (7 presets, customizable)
       ├── WorkspaceTabs (pinned, recent, dirty, closable)
       ├── AppRegistry (application metadata registry)
       ├── CommandRuntime (Ctrl+K, search, history)
       ├── NavigationRuntime (sidebar, breadcrumb, favorites)
       ├── Persistence (Zustand persist for all state)
       ├── ToolbarRuntime (dynamic toolbar injection)
       ├── InspectorRuntime (property panels, tabs, context)
       ├── MetadataEngine (app, table, form, chart metadata)
       └── PluginRuntime (future plugin architecture)
```

## Runtime Modules

| Module | File | Purpose |
|--------|------|---------|
| `RuntimeProvider` | `workspace/workspace-runtime.tsx` | React context provider |
| `EventBus` | `events/event-bus.ts` | 15 event types, pub/sub, history |
| `WindowManager` | `window/window-manager.ts` | Window lifecycle, z-index, drag/resize |
| `PanelRuntime` | `panel/panel-runtime.ts` | 6 panel zones, size, collapse |
| `LayoutPresets` | `layout/layout-presets.ts` | 7 presets, per-user customization |
| `WorkspaceTabs` | `tabs/workspace-tabs.ts` | Tab lifecycle, pin, dirty, duplicate, move |
| `AppRegistry` | `application/application-registry.ts` | App registration, search, categories |
| `CommandRuntime` | `command/command-runtime.ts` | Command palette, recent, pinned |
| `NavigationRuntime` | `navigation/navigation-runtime.ts` | Nav tree, breadcrumbs, favorites |
| `Persistence` | `persistence/workspace-persistence.ts` | 20+ persisted fields |
| `ToolbarRuntime` | `toolbar/toolbar-runtime.ts` | Dynamic toolbar injection |
| `InspectorRuntime` | `inspector/inspector-runtime.ts` | 5 default tabs, entity selection |
| `MetadataEngine` | `metadata/metadata-engine.ts` | App, table, form, chart metadata |
| `PluginRuntime` | `plugin/plugin-runtime.ts` | Plugin manifest, enable/disable |
| `LoadingStates` | `loading/loading-states.tsx` | Skeleton, empty, loading, offline, error, permission |
