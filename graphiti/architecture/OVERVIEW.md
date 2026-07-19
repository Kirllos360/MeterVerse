# MeterVerse Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 16 App Router                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Runtime  │  │ Registry │  │Event Bus │  │Data Eng  │  │
│  │  Kernel  │  │  Engine  │  │  Engine  │  │  Engine  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Workflow │  │ Identity │  │Security  │  │Audit     │  │
│  │  Engine  │  │  Runtime │  │  Layer   │  │  Engine  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐│
│  │                  Workspace Engine                     ││
│  │  (Sidebar, Toolbar, ContextPanel, StatusBar, Tabs)    ││
│  └──────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────┐│
│  │              Enterprise Components                    ││
│  │  (FileUpload, ContextMenu, ErrorBoundary, DataTable)  ││
│  └──────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────┐│
│  │              Effects & Animations                     ││
│  │  (AmbientBackground, AnimatedBorder, AnimatedText)    ││
│  └──────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────┤
│  BFF Layer: /api/auth/*, /api/meterverse/*               │
│           Auth → JWT | Proxy → Backend | Mock ← Fallback │
└─────────────────────────────────────────────────────────┘
```

## Key Architecture Decisions

1. **MPRTFk-based schema** — All areas use result linking via MeasPointResType foreign key
2. **BFF Pattern** — Frontend talks to API routes that proxy to backend or return mock data
3. **Design Tokens** — All visual styling via CSS variables, no hardcoded colors
4. **10 Themes** — Light/dark mode with automatic adaptation
5. **Event-Driven** — Event Bus decouples all subsystems
6. **Registry-Driven** — Components and apps registered via metadata

## Module Dependency Graph

```
Runtime Kernel ← Registry Engine
Runtime Kernel ← Event Bus Engine  
Runtime Kernel ← Data Engine
Runtime Kernel ← Workflow Engine
Workspace Engine ← Runtime Kernel
Enterprise Components ← Workspace Engine
Effects ← Design Tokens
Identity ← BFF Auth API
BFF Layer ← Identity (for auth)
Backend API ← BFF Layer (optional proxy)
```
