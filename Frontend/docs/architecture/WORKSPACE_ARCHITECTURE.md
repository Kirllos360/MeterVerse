# MeterVerse Workspace Architecture
**Date:** 2026-07-17 | **Status:** Draft

---

## Overview

The MeterVerse workspace is a 3-column layout: sidebar | workspace content | inspector panel. All columns are resizable, collapsible, and support floating modes.

```
┌─────────────────────────────────────────────────────────────────────┐
│ TopHeader (48px, glass, sticky)                                     │
│ [☰] [Breadcrumbs...]                       [🔍] [🔔] [🌙] [🌐] [👤] │
├───────┬──────────────────────────────────────┬──────────────────────┤
│       │                                      │                      │
│ SIDE  │      WORKSPACE                       │ INSPECTOR            │
│ BAR   │                                      │ PANEL                │
│       │  ┌────────────────────────────────┐  │ (resizable)          │
│ Glass │  │ Tab Bar                        │  │ 320-512px            │
│ Float │  ├────────────────────────────────┤  │                      │
│ Round │  │                                │  │ Properties           │
│       │  │   Content Area                  │  │ History              │
│ 48-   │  │                                │  │ Activity             │
│ 480px │  │   Data Tables · Charts · Forms │  │ Metadata             │
│       │  │   Kanban · Detail Views        │  │ Context              │
│       │  │                                │  │                      │
│       │  └────────────────────────────────┘  │                      │
│       │                                      │                      │
├───────┴──────────────────────────────────────┴──────────────────────┤
│ StatusBar (32px) - Connection · Language · Theme · Area · Version   │
└─────────────────────────────────────────────────────────────────────┘
```

## Shell Components

| Component | Path | Purpose |
|-----------|------|---------|
| `ShellOrchestrator` | `components/shell/layout/ShellOrchestrator.tsx` | Master orchestrator for all shell regions |
| `Sidebar` | `components/shell/sidebar/Sidebar.tsx` | Main sidebar with 4 modes |
| `SidebarDock` | `components/shell/sidebar/SidebarDock.tsx` | Floating pill dock mode |
| `SidebarSection` | `components/shell/sidebar/SidebarSection.tsx` | Nav section group |
| `SidebarItem` | `components/shell/sidebar/SidebarItem.tsx` | Individual nav item |
| `SidebarWorkspaceSelector` | `components/shell/sidebar/SidebarWorkspaceSelector.tsx` | Area/workspace selector |
| `SidebarSearch` | `components/shell/sidebar/SidebarSearch.tsx` | Inline search trigger |
| `TopHeader` | `components/shell/header/TopHeader.tsx` | Sticky glass header |
| `Breadcrumbs` | `components/shell/header/Breadcrumbs.tsx` | Dynamic breadcrumb |
| `WorkspaceShell` | `components/shell/workspace/WorkspaceShell.tsx` | Content area wrapper |
| `InspectorShell` | `components/shell/inspector/InspectorShell.tsx` | Right panel with resize |
| `StatusBar` | `components/shell/statusbar/StatusBar.tsx` | Bottom status bar |

## States

| State | Sidebar | Inspector | Use Case |
|-------|---------|-----------|----------|
| Full workspace | Expanded | Open | Data entry, detail views |
| Focus mode | Collapsed | Hidden | Data tables, monitoring |
| Distraction-free | Dock | Hidden | Read-only, presentations |
| Debug mode | Expanded | Full width | Development |
