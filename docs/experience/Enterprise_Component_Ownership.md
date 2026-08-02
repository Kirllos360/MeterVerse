# P48 — Enterprise Component Ownership

**Version:** 1.0 · Who owns what in the Operating System — no duplication, clear custody.

## 1. Component Categories & Owners

| Category | Owner (program) | Existing home | Notes |
|---|---|---|---|
| **Design tokens / themes** | C20/DNA | `src/components/themes`, `src/styles/themes`, `src/design-system` | 10 themes; brand duality (red/green) |
| **Core UI (shadcn/ui)** | C20 | `src/components/ui` (63+ components) | Never modify directly; extend |
| **Icon registry** | C20 | `src/components/icons.tsx` | Single source; add via registry |
| **Layout / shell** | C19 | `src/layouts`, `src/admin/layout` | AdminLayout/SystemLayout |
| **Navigation** | C19 | `src/config/nav-config.ts`, `src/navigation` | nav-config, use-nav, SeedNavigation |
| **Workspace state** | C19 | `src/stores` (admin/layout/theme/…) | Zustand stores |
| **Data layer** | C19 | `src/lib/api-client.ts`, `src/gateway` | apiClient/apiBackend, BaseRepository |
| **Auth/identity** | C12 | `src/identity` | AuthRuntime, sessions, permissions, RouteGuard |
| **Context** | C22 | `admin-store` location + LocationSelector | area/project/zone/unit + tenant |
| **Tables/grids** | C17 | `src/admin/tables` (GenericAdminPage, page-configs) | config-driven |
| **Forms** | C20 | `src/components/ui/tanstack-form`, `useAppForm` | TanStack Form + Zod |
| **Billing/tariff apps** | C13 | `admin/tariffs`, tariff-engine | backend + frontend |
| **Accounting apps** | C13 | `admin/accounting/*`, accounting.js | |
| **Collections apps** | C13 | `admin/collections`, collections.js | |
| **Financial AI** | C13 | financial-ai.js, board BFF | page pending |
| **Revenue assurance** | C13 | revenue-assurance.js, summary BFF | page pending |
| **AI / RCA** | C18 | ai-engine.js, root src/intelligence | |
| **Monitoring/ops** | C19 | monitor.js, runtime-manager, health | |
| **Documents/records** | C24 (Wave 3) | legacy StoredFile/OcrJob | 21 planned models pending |
| **Communication** | C25 (Wave 3) | legacy Notification/EmailLog/SmsLog | 21 planned models pending |
| **User portal** | C14 (Wave 3) | user/ pages | true portal pending |

## 2. Ownership Rules

1. **One owner per component** — no duplicate implementations (P47 rule).
2. **Owner adds, consumers reuse** — e.g. icons via registry, tables via GenericAdminPage.
3. **Cross-cutting components owned by C19/C20** (shell, data, forms) — other programs consume.
4. **Program components owned by their program** — e.g. C13 owns financial apps; Wave-3 programs own their apps.
5. **Backend↔frontend pairing** — each domain app owns its route + page + BFF.

## 3. New Component Checklist (Waves 3–10)

Before creating a component:
1. Search repo (icon, table, form, hook, service, route).
2. If exists → extend/wire. If not → create under the owning program's folder.
3. Register icons in `icons.tsx`; register nav in the correct group.
4. Add BFF handler if the page needs a proxy; wire page to real endpoint.
5. Add permission + audit + tests. Multi-verify.

## 4. Current Mis-ownership to fix (P47 findings)

- `/user` duplicate shell → consolidate under C14 (user portal).
- Unused dashboard starter shell (Clerk) → remove (C20).
- Root-level `src/intelligence` (C18) imported by backend → vendor into backend or formalize.
- 3 unconsumed BFF handlers → consume (revenue-assurance, financial-ai, financial-reports/ratios) or remove.
