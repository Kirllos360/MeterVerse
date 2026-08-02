# P48 — Customization Architecture

**Version:** 1.0 · Customize without breaking the operating system.

## 1. Principle

Customization is **data-driven and scoped**, never fork-based. Users configure behavior through preferences, themes, branding, and layouts — the architecture stays one shared codebase.

## 2. Customization Layers

| Layer | Scope | Mechanism | Existing |
|---|---|---|---|
| **Tenant Branding** | Per tenant | BrandingConfig (logo, name, colors) | ✅ admin/branding |
| **Theme Engine** | Global/tenant | 10 CSS themes, cookie default | ✅ theme system |
| **Workspace Layout** | Per user | layout-store (collapsed sidebar, order) | ✅ |
| **Widgets/Dashboard** | Per role/user | config-driven widgets | ⚠️ GenericAdminPage |
| **Tables/Forms** | Per app | page-configs (columns, fields) | ✅ page-configs |
| **Navigation/Menus** | Per role | use-nav filtering + nav-config | ✅ |
| **Preferences** | Per user | userPreference | ⚠️ partial |
| **Role Layouts** | Per role | role-scoped landing/nav | ⚠️ |
| **Organization Prefs** | Per org | system settings | ✅ config-center |

## 3. Rules

- **Customization NEVER changes core logic** — it changes presentation/scoping only.
- **Precedence:** user preference > role layout > tenant branding > platform default.
- **Every preference persists + is reloadable** (P45 settings persistence pattern).
- **No custom code per tenant** — config data only.

## 4. Customization Model

```
Platform default (tokens, theme)
  └─ Tenant branding (BrandingConfig)
      └─ Role layout (role-scoped nav/landing)
          └─ User preference (theme, layout, language)
```

## 5. Current → Target

| Capability | Current | Target |
|---|---|---|
| Themes | ✅ 10 themes | tenant-scoped themes |
| Branding | ✅ admin/branding | full tenant branding |
| Layout | ✅ layout-store | per-role defaults |
| Widgets | ⚠️ static | config-driven role dashboards |
| Preferences | ⚠️ partial | full user preference center (C14) |
| Language | ✅ en/ar (next-intl) | per-user + per-tenant |
