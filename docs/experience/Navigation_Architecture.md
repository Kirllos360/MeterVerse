# P48 — Navigation Architecture (Context Navigation)

**Version:** 1.0 · Replaces page navigation with **context navigation**.

## 1. Principle

Navigation is **context-driven**, not URL-driven. The active **Area → Project → Role → Permission** determines what is visible, enabled, and scoped. Changing the context updates everything reactively — no reloads.

```
Context (Area, Project, Role, Permission)
   ↓ reactive
Menu items (filtered by use-nav)  →  Apps (visible)  →  Data (scoped)  →  Actions (enabled)
```

## 2. Context Object

```ts
interface RuntimeContext {
  areaId?: string      // global scope
  projectId?: string
  role: string         // RBAC role
  permissions: string[] // matched via requirePermission
  tenantId?: string    // C22 multi-tenant
  zoneId?: string      // optional drill-down
}
```

## 3. Navigation Layers

1. **Context selectors** — Area/Project in toolbar (LocationSelector).
2. **Module navigation** — sidebar groups (Admin: Control Center modules; User: Operations modules).
3. **System tabs** — Admin/Dashboard/Analytics/System.
4. **App-level tabs** — open apps within canvas.
5. **Command palette** — global search/navigation (Cmd+K).

## 4. Filtering Rules

- **Menu** filtered by role/permission (`use-nav` → `filterItems`).
- **API** filtered by `requirePermission` + `requireAreaAccess`/`filterByArea`.
- **Data** scoped by area/project (query params areaId/projectId).
- **Direct URL** denied → 403 + audit (verified P46).

## 5. Current → Target

| Aspect | Current | Target |
|---|---|---|
| Menu filtering | ✅ use-nav (role/permission) | ✅ + tenant |
| Context reactivity | ⚠️ area/project in admin-store; partial query refetch | Full reactive refetch on context change |
| URL stability | ✅ SPA `/admin` | ✅ stable across centers |
| Role-scoped landing | ⚠️ home is generic | Context-aware landing per role |
| Deep links | ⚠️ `/admin` catch-all | App-level deep-link restore |

## 6. Navigation Contract (Waves 3–10)

Every new app must: register in the correct nav group, respect context, be permission-gated, and never be an orphan (P47 no-orphan rule).
