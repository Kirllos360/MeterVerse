# P48 — Dashboard Replacement Strategy

**Version:** 1.0 · Moving from static dashboards to context-aware operating surfaces.

## 1. Problem

Current dashboards are largely **static** (home, user home, admin home all show hardcoded/sample data or `—`). P45/P46 wired many live endpoints, but dashboards lag.

## 2. Strategy

Replace **"dashboard as a page"** with **"home as an operating surface"** — a context-aware, live, role-scoped overview that is the landing point after login.

## 3. Home Surface Model

```
Context (Area/Project/Role) →
  Home =
    KPI strip (live, role-scoped)          [React Query]
    Primary workflow actions (quick actions)
    Recent/active items (open tasks, alerts, readings to review)
    Health snapshot (system/ops)
    AI insights (role-scoped)
```

- **Role-scoped KPIs:** Admin → system health, users, connections, audit volume. Finance → invoiced, collected, outstanding, GL. Ops → meters, readings, gaps. User → my meters, my bills, my tickets.
- **Live data only** — no sample values (P45/P46 rule).
- **Drill from KPI** → app tab (not new page).

## 4. Replacing Existing Dashboards

| Surface | Current | Target |
|---|---|---|
| Admin home | static-ish (health/audit live) | Context-aware control overview |
| User home | hardcoded `—` | My operations overview (meters/bills/tickets) |
| Root SPA home | hardcoded | Reuse user home (consolidate `/user`) |
| Dashboard starter | unused Clerk shell | Remove or convert to app examples |

## 5. Implementation Approach

1. Build a **HomeApp** (shared) driven by role + context.
2. KPI cards read live endpoints (business/dashboard-summary, reports/operational, reports/financial, health).
3. Quick actions = top workflows per role (P48 journey maps).
4. Retire static sample data; delete unused dashboard starter shell.

## 6. Success Criteria

- Landing after login shows real, scoped data in <1s (cache).
- Every KPI drills into a live app tab.
- No hardcoded values anywhere.
- User sees only their own scope (row-level).
