# Admin Portal Merger Plan — Same Port, Route-Based

## Current Architecture
```
Main System:  localhost:7400/*
Admin:        localhost:7400/admin/*
                   └── or port 7500 (separate instance)
```

## Problem
Running admin on a separate port (7500) requires:
- Two Node.js processes → 2× memory (~200MB each)
- Cross-origin requests → CORS configuration
- Separate auth sessions → Token sharing complexity
- Duplicate EventBus instances → No cross-system events
- No shared cache → Double data fetching

## Solution: Same Port, Route-Based Separation

### Architecture
```
localhost:7400
  ├── /                    → Main workspace (unauthenticated users)
  ├── /admin/*             → Admin platform (admin users only)
  ├── /api/*               → API routes (shared)
  └── /_next/*             → Next.js internals
```

### Why Same Port Works
| Concern | Resolution |
|---------|-----------|
| Auth isolation | Proxy.ts middleware detects `/admin/*` → redirects non-admins to `/admin/login` |
| Visual identity | Admin uses red accent (`#EF4444`), main uses teal (`#00BFA5`) — same CSS variables, different values |
| Component sharing | Both use same `Enterprise UI` components, same `RuntimeKernel`, same `EventBus` |
| Performance | Single Node.js process, single cache, single WebSocket |
| Security | Middleware enforces admin route protection |

### Implementation Steps (2-3 hours)

1. **Add admin CSS variables** to `dark-mode.css`:
```css
:root {
  --admin-bg: #050505;
  --admin-surface: #0A0A0A;
  --admin-border: #1A1A1A;
  --admin-primary: #EF4444;
}
```

2. **Update admin layout** to use `var(--admin-bg)` instead of hardcoded `#050505`

3. **Keep proxy.ts as-is** — it already handles `/admin/*` routes

4. **Shared components** are already imported:
   - `MetricsDashboard` → used in admin dashboard
   - `SystemHealth` → used in admin dashboard
   - `AuditViewer` → used in admin audit page

### Result
- Single port: `localhost:7400`
- Single process: ~200MB memory instead of ~400MB
- No CORS, no separate auth, shared EventBus
- Admin feels like a natural extension, not a separate app

## Files to Modify
| File | Change |
|------|--------|
| `src/styles/dark-mode.css` | Add `--admin-*` CSS variables |
| `src/app/admin/layout.tsx` | Replace `#050505` → `var(--admin-bg)` |
| `src/proxy.ts` | Already handles admin routes — no change needed |
