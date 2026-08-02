# P48 — Experience Architecture

**Version:** 1.0 · Governs all Waves 3–10 experience implementation.

## 1. Experience Model

MeterVerse is experienced as **one continuous operating session**, not as pages:

```
Session (Login → Logout)
  └─ Workspace (shell: Toolbar + Sidebar + Canvas + Inspector + Dock)
      └─ Context (Area + Project + Role + Permission)  [global, reactive]
          └─ Apps (domain modules: Meters, Billing, Accounting, AI, ...)
              └─ Tasks (actions within an app)
                  └─ Results (persisted, audited, surfaced)
```

## 2. Experience Pillars

| Pillar | Definition | Implementation |
|---|---|---|
| **One Shell** | Single workspace across admin + user | AdminLayout / SystemLayout, shared components |
| **Context Reactivity** | Change Area/Project → everything updates | `useAdminStore` (area/project) + query refetch |
| **Workflow Continuity** | No dead-ends; every action has next step | App → Task → Result → Monitor |
| **Trust** | Every write persists + audits | auditLog middleware, real CRUD (P45/P46) |
| **Consistency** | One DNA everywhere | theme tokens, design-system, component library |

## 3. Experience Layers

1. **Foundation** — design tokens, themes (10), shadcn/ui NY, motion, icons registry.
2. **Shell** — layout, navigation, inspector, dock, tabs, command palette.
3. **Context** — area/project/role/permission global state.
4. **Apps** — domain workspaces (admin control, operations, finance, AI).
5. **Actions** — forms, tables, dialogs, bulk operations.
6. **Feedback** — toasts, notifications, activity stream, health.

## 4. Experience Quality Bar

- **Reactive:** changing context updates UI without reload.
- **Stateful:** workspace tabs + open pages + scroll preserved.
- **Auditable:** every mutation visible in audit + activity.
- **Fast:** query caching (React Query), no full-page reloads.
- **Accessible:** keyboard, focus, contrast, RTL (Arabic).

## 5. Mapping to Current Repo

| Pillar | Exists | Evidence | Gap |
|---|---|---|---|
| One Shell | ✅ | AdminLayout/SystemLayout, Zustand SPA | `/user` ≈ `/` duplicate |
| Context | ✅ | admin-store area/project, LocationSelector | role-scoped reactivity partial |
| Workflow | ✅ | wired apps (P45/P46) | 12 placeholder pages |
| Trust | ✅ | audit + persistence verified | — |
| Consistency | ✅ | DNA v2.0, design-system | legacy pages vs modern |

## 6. Future-Wave Contract

Every Wave 3–10 capability must: live in an app within the shell, respect the context, persist + audit, follow DNA, and pass multi-verification (P48 Rule 10).
