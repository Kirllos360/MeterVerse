# P48 — Context Architecture

**Version:** 1.0 · The reactive runtime context that makes MeterVerse an OS.

## 1. Definition

**Context** is the current operational scope: the combination of Area, Project, role, permissions, and tenant that defines what the user sees and can do at any moment. It is **global state**, held in the workspace, and **reactively** drives every app.

## 2. Context Sources

| Source | Where | Example |
|---|---|---|
| User session | AuthRuntime (user, role, permissions) | role=operator |
| Location | admin-store (area/project/zone/unit) | area=October, project=Phase 1 |
| Tenant | C22 (multi-tenant) | PalmHills_October |
| Feature flags | FeatureFlag store | new-billing on |

## 3. Context Lifecycle

```
Login → default context (from user: area, project)
  → user changes Area/Project → context updated in store
    → all apps refetch scoped data (query key includes areaId/projectId)
    → menus re-filter (permission)
    → inspector/toolbar reflect new context
Logout → context cleared
```

## 4. Context Propagation

- **Query keys** include `[areaId, projectId]` → React Query auto-refetch on change.
- **API calls** append `areaId`/`projectId` (api-client + apiBackend).
- **Server** filters by area (`filterByArea`, `requireAreaAccess`).
- **UI** shows active context in toolbar + breadcrumb + status bar.

## 5. Context Scoping Rules

- **Admin** — can switch across all areas/projects (full scope).
- **Operator** — scoped to assigned area(s); cannot see others.
- **Viewer** — read-only within scope.
- **Row-level** — customer/meter data filtered by context.

## 6. Current → Target

| Aspect | Current | Target |
|---|---|---|
| Location context | ✅ admin-store + LocationSelector | ✅ |
| Role/permission context | ✅ auth + use-nav | ✅ |
| Tenant context | ⚠️ C22 models exist; UI minimal | Tenant switcher |
| Reactive refetch | ⚠️ partial | Full (query keys + invalidate on context change) |
| Context-aware landing | ⚠️ generic home | Role/scope-specific landing |
| Context in URL (deep-link) | ⚠️ | App-level context restore |

## 7. Contract

Every Wave 3–10 app must read the Runtime Context (area/project/role/permission/tenant) and render scoped data. No app may hardcode scope.
