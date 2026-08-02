# P47 — Responsibility Matrix

Defines who (Admin platform vs User platform vs Shared/System) is responsible for each capability, plus security/operational/customization/monitoring/audit boundaries.

## Capability Responsibility

| Capability | Admin | User | System/Shared | Boundary |
|---|---|---|---|---|
| User provisioning | ✅ create/roles | view own | — | Admin-only writes |
| Role/Permission assignment | ✅ | ❌ | — | Admin-only (security) |
| Area/Project/Zone/Unit CRUD | ✅ | ❌ | — | Admin-only (org structure) |
| Customer CRUD | ✅ | view own | — | Admin writes, user reads own |
| Meter CRUD/assign/activate | ✅ | view own meters | — | Admin-only writes |
| Reading intake | ✅ + ingestion | submit own reading (future) | polling/symbiot | User self-submit needs C14 |
| Tariff definition | ✅ | ❌ | tariff-engine calculates | Admin-only |
| Invoice generation/issue | ✅ | view own bills | posting-engine posts GL | User read-only |
| Payment | ✅ record | pay own bill (future) | posting-engine | User pay needs C14 |
| Accounting/GL | ✅ | ❌ | posting-engine | Admin-only (finance) |
| Collections/dunning | ✅ | view own status | dunning engine | Admin-only writes |
| Reports/analytics | ✅ | view own usage | engines | User limited to own data |
| Notifications | ✅ manage | receive (future) | notification-engine | User inbox needs C14 |
| Audit log | ✅ view | ❌ | audit middleware | Admin-only (compliance) |
| Settings/config | ✅ | ❌ | config-center | Admin-only |
| Security (keys, MFA mgmt) | ✅ | own MFA | auth-engine | User owns own credentials |
| Scheduler/queue/backup | ✅ | ❌ | scheduler-engine | Admin-only (ops) |
| AI/forecasting | ✅ | ❌ | ai-engine | Admin-only |
| TCP/connection mgmt | ✅ | ❌ | ingestion-runtime | Admin-only (ops) |

## Boundaries

- **Security boundary:** Admin writes roles/permissions/security; users own only their credentials. RBAC enforced server-side (requirePermission) + menu filtering (use-nav). Direct URL access denied (403 + audit).
- **Operational boundary:** Connection/TCP/scheduler/backup/queue = admin-only ops. Users never touch infrastructure.
- **Customization boundary:** Branding/themes/translations/layout = admin (global); user theme preference = personal (C14).
- **Monitoring boundary:** System health/metrics/observability = admin. Users see only their own usage/consumption.
- **Audit boundary:** All writes audit-logged (admin.viewable). Users cannot read the audit trail.
- **Data boundary (row-level):** Users must only see their own data (C14 portal enforces `filterByArea`/customer scoping). Admin sees all.

## Current gap (feeds C14)

User platform currently has **no real user-scoped surface** — it reuses admin components. The responsibility matrix above is the **target**; C14 builds the user portal that enforces these boundaries (own data only, self-service actions).
