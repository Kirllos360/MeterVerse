# MeterVerse UI Architecture

## Application Shell

```
┌─────────────────────────────────────────────────────────┐
│ Toolbar (h-14)                                          │
│ Logo | Area | Search | Notif | Theme | Lang | Profile   │
├────────┬──────────────────────────────────┬──────────────┤
│        │                                  │              │
│ Sidebar│     Content Canvas               │  Inspector   │
│ 72/260px│    (flex-1 overflow-y-auto)      │  (320px,     │
│        │                                  │  contextual) │
│        │  ┌─ Tabs ─────────────────────┐  │              │
│        │  │ Tab1 | Tab2 | Tab3        │  │              │
│        │  └───────────────────────────┘  │              │
│        │                                  │              │
│        │  ┌ Page Content ────────────┐   │              │
│        │  │                          │   │              │
│        │  └──────────────────────────┘   │              │
├────────┴──────────────────────────────────┴──────────────┤
│ Status Bar (h-10)                                        │
│ Connection | Quotes | Area | Lang | Version              │
└─────────────────────────────────────────────────────────┘
```

## Layout Components

| Component | File | Role |
|-----------|------|------|
| `WorkspaceLayout` | `workspace/components/WorkspaceLayout.tsx` | Shell orchestrator |
| `SidebarContent` | `workspace/components/SidebarContent.tsx` | Primary navigation |
| `ToolbarContent` | `workspace/components/ToolbarContent.tsx` | Top toolbar |
| `WorkspaceTabs` | `workspace/components/WorkspaceTabs.tsx` | Document tabs |
| `ContextPanel` | `workspace/components/ContextPanel.tsx` | Contextual inspector |
| `StatusBarContent` | `workspace/components/StatusBarContent.tsx` | Status bar |
| `WorkspaceContent` | `workspace/components/WorkspaceContent.tsx` | Page content router |
| `WorkspaceHome` | `workspace/components/WorkspaceHome.tsx` | Home dashboard |

## Page Architecture

```
/ (root)
├── /login                    → LoginPage (45/55 split, live preview)
├── /                         → WorkspaceLayout → Home
├── /workspace                → WorkspaceLayout → WorkspaceHome
├── /dashboard                → DashboardLayout (shadcn sidebar)
├── /admin/*                  → AdminLayout (dark theme)
│   ├── /login
│   ├── /dashboard
│   ├── /users, /roles, /monitoring
│   ├── /audit, /logs, /security
│   └── /settings, /ai-diagnostics
├── /about, /privacy, /terms  → Static pages
└── /component-lab            → Component playground
```

## States

Every page supports:
- **Loading**: `LoadingState` skeleton animation
- **Empty**: `EmptyState` with 5 variants
- **Error**: `ErrorBoundary` with retry
- **Offline**: Graceful degradation
- **404**: Not-found page
