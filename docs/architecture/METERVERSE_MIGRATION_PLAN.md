# MeterVerse Migration Plan — Template to Enterprise OS
**Date:** 2026-07-17 | **Phase:** Migration Planning | **Duration:** ~6 months

---

## Migration Overview

```
Phase 1: Foundation (Weeks 1-3)
Phase 2: Workspace + Navigation (Weeks 4-6)
Phase 3: Sidebar + Theme (Weeks 7-8)
Phase 4: Runtime Integration (Weeks 9-12)
Phase 5: Enterprise Pages (Weeks 13-18)
Phase 6: Backend Integration (Weeks 19-22)
Phase 7: Testing + Polish (Weeks 23-24)
Phase 8: Production Launch (Week 25)
```

---

## Phase 1: Foundation (Weeks 1-3)

**Objective:** Clean the template, establish MeterVerse design foundation

| Task | Files Affected | Classification | Effort |
|------|---------------|----------------|--------|
| 1.1 | Remove demo pages | `features/forms/`, `features/react-query-demo/`, `components/forms/demo-form.tsx` | Remove | 1h |
| 1.2 | Remove template branding | `components/layout/cta-github.tsx`, `.husky/` hooks | Remove | 30m |
| 1.3 | Reduce fonts | `components/themes/font.config.ts` — keep: Inter, JetBrains Mono, Cairo | Refactor | 30m |
| 1.4 | Reduce themes | `styles/themes/*.css` — keep: 3 (default, dark, high-contrast) | Refactor | 1h |
| 1.5 | Apply MeterVerse colors | Update globals.css with MeterVerse color tokens (#00BFA5 brand, #064E3B sidebar) | Refactor | 2h |
| 1.6 | Install i18n | `npm install next-intl` | Add | 1h |
| 1.7 | Setup i18n structure | Create `messages/en.json`, `messages/ar.json`, locale middleware | Add | 3h |
| 1.8 | Create design tokens | `src/lib/design-tokens/` — colors, spacing, typography, elevation, motion | Add | 3h |
| 1.9 | Setup Bootstrap 5 | `npm install bootstrap` + SCSS integration | Add | 2h |
| 1.10 | Create initial SCSS | Global styles, Bootstrap overrides, MeterVerse utilities | Add | 3h |

**Deliverables:** Clean template with MeterVerse identity, i18n ready, Bootstrap + SCSS integrated
**Checkpoint:** `npm run dev` starts with MeterVerse brand colors

---

## Phase 2: Workspace + Navigation (Weeks 4-6)

**Objective:** Transform dashboard layout into 3-column workspace

| Task | Files Affected | Effort |
|------|---------------|--------|
| 2.1 | Create WorkspaceShell | `components/layout/workspace-shell.tsx` — 3-column layout | 4h |
| 2.2 | Create PanelLayout | `components/layout/panel-layout.tsx` — resizable panels | 3h |
| 2.3 | Update dashboard layout | `app/dashboard/layout.tsx` — use WorkspaceShell | 2h |
| 2.4 | Create InspectorPanel | `components/layout/inspector-panel.tsx` — right panel | 3h |
| 2.5 | Create BreadcrumbRuntime | `components/layout/breadcrumb-runtime.tsx` — dynamic breadcrumbs | 2h |
| 2.6 | Update header | `components/layout/header.tsx` — add workspace selector, locale toggle | 2h |
| 2.7 | Update page-container | `components/layout/page-container.tsx` — support all workspace modes | 2h |
| 2.8 | Migrate nav-config | `config/nav-config.ts` — MeterVerse navigation tree | 3h |
| 2.9 | Update nav-main | `components/nav-main.tsx` — MeterVerse nav groups | 1h |
| 2.10 | Create floating panel system | `components/layout/floating-panel.tsx` | 3h |

**Deliverables:** 3-column workspace with sidebar, main content, inspector panel
**Checkpoint:** All existing pages render in the new workspace layout

---

## Phase 3: Sidebar + Theme (Weeks 7-8)

**Objective:** Implement MeterVerse Dynamic Island sidebar

| Task | Files Affected | Effort |
|------|---------------|--------|
| 3.1 | Design sidebar store | `lib/stores/sidebar-store.ts` — Zustand with persist | 3h |
| 3.2 | Create SidebarV2 components | `components/layout/sidebar/` — 15 component files | 8h |
| 3.3 | Implement dock mode | Floating pill-shaped dock with glass effect | 3h |
| 3.4 | Implement hover expand | Collapsed → expanded on hover with spring animation | 2h |
| 3.5 | Implement workspace selector | Area → Organization → Project hierarchy | 3h |
| 3.6 | Implement AI Assistant entry | Pulsing indicator, floating panel | 2h |
| 3.7 | Replace shadcn sidebar | Remove `app-sidebar.tsx`, use SidebarV2 | 2h |
| 3.8 | Theme consolidation | 3 themes: Light, Dark, Gray mode | 2h |
| 3.9 | Theme persistence | Cookie + user preference sync | 1h |
| 3.10 | Animated transitions | Theme switch with view transitions | 2h |

**Deliverables:** Floating glass sidebar with 4 modes (expanded/collapsed/dock/floating)
**Checkpoint:** SidebarV2 fully functional with all animations

---

## Phase 4: Runtime Integration (Weeks 9-12)

**Objective:** Connect all features to the existing enterprise runtime

| Task | Files Affected | Effort |
|------|---------------|--------|
| 4.1 | Create API client | `lib/api/enterprise-client.ts` — JWT, retry, cache, offline queue | 4h |
| 4.2 | Create auth service | `lib/api/auth-service.ts` — login, logout, refresh, profile | 3h |
| 4.3 | Replace mock products | `features/products/api/service.ts` → real API | 3h |
| 4.4 | Replace mock users | `features/users/api/service.ts` → real API | 2h |
| 4.5 | Replace mock overview | All 4 overview charts → real dashboard API | 4h |
| 4.6 | Replace mock kanban | `features/kanban/utils/store.ts` → API-backed store | 3h |
| 4.7 | Replace mock chat | `features/chat/utils/data.ts` → real messaging API | 3h |
| 4.8 | Replace mock notifications | `features/notifications/utils/store.ts` → real notification API | 2h |
| 4.9 | Remove all mock API routes | `app/api/products/*`, `app/api/users/*` | 1h |
| 4.10 | Create repository pattern | `lib/api/repositories/` — typed CRUD for all entities | 4h |

**Deliverables:** All features connected to real backend APIs
**Checkpoint:** Dashboard shows real data from NestJS backend

---

## Phase 5: Enterprise Pages (Weeks 13-18)

**Objective:** Build all 30+ MeterVerse application pages

| Task | Pages | Effort |
|------|-------|--------|
| 5.1 | Executive workspace | ceo, coo, finance, ops, engineering dashboards | 5 days |
| 5.2 | CRM | Customers, Groups, Organizations, Contacts, Contracts | 5 days |
| 5.3 | Billing | Invoices, Generator, Adjustments, Credit Notes, Receivables | 5 days |
| 5.4 | Meter Management | Meters, Types, Assignments, History, Replacement, Map | 4 days |
| 5.5 | Reading Center | Manual, Automatic, Import, Validation, Anomalies, Consumption | 4 days |
| 5.6 | Tariff Studio | Designer, Versions, Simulation, Approval, Seasonal, Rules | 4 days |
| 5.7 | Billing Engine | Cycle, Preview, Generate, Approve, Rollback, Monitoring | 3 days |
| 5.8 | Payment Center | Cash, Bank, Online, POS, Allocation, Reconciliation | 4 days |
| 5.9 | Financial Center | Journal, GL, Revenue, Expense, Profit, Forecast | 4 days |
| 5.10 | Reports | Financial, Consumption, Customer, Operations, AI, Export | 4 days |
| 5.11 | Administration | Users, Roles, Permissions, Teams, Audit Logs, Settings | 5 days |
| 5.12 | AI Center | Assistant, Insights, Prediction, Billing Validation, Search | 4 days |
| 5.13 | Developer Center | API Explorer, Runtime Inspector, Logs, Events, Health | 3 days |
| 5.14 | Document Center | Templates, Generation, Preview, Approval, Versioning | 3 days |
| 5.15 | Security | Authentication, MFA, Sessions, API Tokens, Encryption | 3 days |

**Deliverables:** 30+ enterprise pages using the workspace shell
**Checkpoint:** All pages accessible with real data

---

## Phase 6: Backend Integration (Weeks 19-22)

**Objective:** Deep integration with all 180+ NestJS endpoints

| Task | Effort |
|------|--------|
| 6.1 | Audit trail integration | 2 days |
| 6.2 | WebSocket real-time updates | 2 days |
| 6.3 | File upload/import pipelines | 2 days |
| 6.4 | PDF/Excel/CSV export | 2 days |
| 6.5 | Background job monitoring | 1 day |
| 6.6 | Notification engine (email, SMS, WhatsApp, push) | 3 days |
| 6.7 | RBAC synchronization with backend roles | 2 days |
| 6.8 | Area scoping (x-area-id header) | 1 day |
| 6.9 | Idempotency key support | 1 day |
| 6.10 | Offline queue + retry | 2 days |

**Deliverables:** Full integration with all 180+ backend endpoints
**Checkpoint:** All API coverage tests pass

---

## Phase 7: Testing + Polish (Week 23-24)

| Task | Effort |
|------|--------|
| 7.1 | Playwright E2E tests for all pages | 5 days |
| 7.2 | Component unit tests (Vitest) | 3 days |
| 7.3 | Accessibility audit + fixes | 2 days |
| 7.4 | Performance audit + optimization | 2 days |
| 7.5 | Bundle size optimization | 1 day |
| 7.6 | RTL validation | 1 day |
| 7.7 | Dark mode validation | 1 day |
| 7.8 | Security scan (gitleaks, semgrep, snyk) | 1 day |
| 7.9 | Documentation update | 2 days |
| 7.10 | Production readiness certification | 1 day |

**Deliverables:** All tests passing, certified production-ready
**Checkpoint:** Score > 90 on production readiness assessment

---

## Phase 8: Production Launch (Week 25)

| Task | Effort |
|------|--------|
| 8.1 | Docker build verification | 1 day |
| 8.2 | Production environment setup | 1 day |
| 8.3 | SSL + domain configuration | 1 day |
| 8.4 | Monitoring + alerting | 1 day |
| 8.5 | Backup + recovery plan | 1 day |

**Deliverables:** Production deployment
**Checkpoint:** `http://localhost:7400` → Production URL

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Clerk auth incompatible with MeterVerse JWT | High | High | Plan to wrap Clerk or replace with custom auth provider |
| 180+ API surface changes during migration | Medium | High | Contract-first approach, mock API that mirrors real APIs |
| Template features not compatible with RTL | Medium | Medium | Audit all 145 files for hardcoded LTR; fix in Phase 1 |
| Performance with 30+ page types | Low | Medium | Lazy loading, code splitting per feature module |
| Team unfamiliar with architecture | Medium | Medium | Architecture documentation, component registry, design rules |
