# Frontend Architecture Audit

## Structure
- **71 admin pages** — Full CRUD SPA with 25 nav items
- **30 dashboard pages** — User workspace with parallel routes
- **119 API route handlers** — BFF pattern via Next.js
- **5 layout files** — Root + admin + dashboard
- **125 components** across 8 categories

## State Management (54 Zustand Stores)

| Category | Count | Key Stores |
|:---------|:-----:|:-----------|
| Core stores | 7 | admin, workspace, theme, notification, layout, dashboard, command |
| Runtime | 15 | window, toolbar, filters, datatable, panel, inspector, tabs, event-bus |
| Business | 5 | meter, invoice, customer, entity, action |
| Identity | 4 | auth, session, permission, audit |
| Navigation | 4 | registry, search, favorites, recent, badges |
| Gateway | 3 | websocket, error, offline |
| Features | 3 | chat, kanban, notifications |
| Workspace | 3 | window-v2, narrations, dock, context-plugins |
| Framework | 10+ | app-registry, plugin-runtime, metadata-engine, persistence |

## Component Architecture
```
components/
├── ui/ (73)      — Button, Card, Table, Dialog, Input, Badge, Skeleton, etc.
├── effects/ (8)  — ErrorBoundary, animations
├── enterprise/ (6) — Enterprise-specific components
├── forms/ (10)   — Form field wrappers
├── layout/ (5)   — Sidebar, header, shell
├── themes/ (4)   — Theme system
├── kbar/ (4)     — Command palette
├── modal/ (1)    — Alert modal
└── dashboard/ (1) — Dashboard shell
```

## Data Flow
```
Pages → Service Layer (features/*/api/)
  → apiClient/lib/api-client.ts
  → Next.js Rewrites (next.config.ts)
  → Express Backend → Prisma → PostgreSQL
```

## Key Findings
1. **54 zustand stores** — Mature state management
2. **GenericAdminPage** — Eliminates duplication for 50+ entities
3. **Service layer pattern** — Consistent (types → service → queries)
4. **Duplication risk: LOW** — Reusable patterns throughout
5. **Auth**: Clerk multi-tenant with middleware
6. **Tables**: TanStack React Table via DataTable component
7. **Forms**: TanStack React Form via useAppForm hook
