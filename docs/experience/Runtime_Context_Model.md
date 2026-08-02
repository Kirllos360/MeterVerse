# P48 — Runtime Context Model

**Version:** 1.0 · The reactive state model behind the Operating System.

## 1. Purpose

A single, reactive runtime context that every app consumes. Changing the context updates the entire workspace — menus, data, inspector, actions — without reload.

## 2. Context Shape

```ts
interface RuntimeContext {
  // session
  user: { id; email; name; role; permissions[]; mfaEnabled }
  tenant?: { id; slug; branding }          // C22
  // location scope
  areaId?: string; areaName?: string
  projectId?: string; projectName?: string
  zoneId?: string; unitType?: string
  // runtime flags
  featureFlags: Record<string, boolean>
  theme: string; lang: 'en'|'ar'
  // workspace
  activeApp: string
  openApps: string[]
}
```

## 3. Stores (Zustand)

| Store | Holds | Persisted |
|---|---|---|
| `admin-store` | activePage, openPages, theme/lang, location | ✅ localStorage |
| `auth` (AuthRuntime) | user, tokens, session | ✅ mv-identity |
| `permission` | permissions, guards | — |
| `layout-store` | sidebar/collapsed | ✅ |
| `theme-store` | theme | ✅ |
| `notification-store` | in-app notifications | — |
| `command-store` | palette state | — |
| `workspace-store` | tabs/dock | — |

## 4. Reactivity Flow

```
user changes Area/Project (LocationSelector)
  → admin-store.setLocation()
    → React Query keys containing areaId/projectId change
      → scoped queries refetch
    → menu filter re-evaluates (permission)
    → breadcrumb/status/toolbar re-render
    → inspector clears/reloads selected object
```

## 5. Server Alignment

- `api-client`/`apiBackend` append `areaId`/`projectId`.
- Server middleware: `filterByArea`, `requireAreaAccess`, `requirePermission`.
- Multi-tenant: `tenant` in context → scoped DB (row-level) per C22.

## 6. Persistence & Restore

- Session restored on reload (AuthRuntime + localStorage).
- Context (area/project) restored from admin-store.
- Deep-link: app + context encoded for restore (target).

## 7. Contract

Every Wave 3–10 app consumes `RuntimeContext` via hooks (e.g. `useRuntimeContext()`), keys its queries with context, and never hardcodes scope.
