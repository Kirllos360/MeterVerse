# 08 — Master Migration Plan

**Date:** 2026-07-11
**Mode:** Read-Only Audit
**Scope:** Keep/Move/Rewrite/Delete/Merge per feature with effort estimates

---

## Summary

| Metric | Count |
|--------|-------|
| V1 Routes | 15 |
| V2 Routes | 12 |
| V1 Components | 116 files (~5,200 lines) |
| V2 Components | 82 files (~9,676 lines) |
| V1 Stores | 5 (4 unique, 1 duplicate) |
| V2 Stores | 7 (6 sub-stores + 1 composite) |
| V1 Hooks/API | 6 files (26 hooks, all mock) |
| V2 Repos | 7 (6 entity + 1 enterprise) |
| Backend Modules | 65 (47 domain + 13 common + 5 sub) |
| Prisma Models | 137 |
| Integration Score | 0% (no real API calls) |

---

## 1. Feature Migration Matrix

### 1.1 Customer Domain

| Feature | V1 | V2 | Action | Effort | Priority |
|---------|-----|-----|--------|--------|----------|
| Customer list | CustomerExplorer (50L) | Explorer sidebar (143L) | REWRITE V1 to use V2 Explorer | 2d | P1 |
| Customer detail | CustomerWorkspace (142L) | CustomerWorkspace (164L) | KEEP V2, add health widget from V1 | 1d | P2 |
| Customer health gauge | CustomerHealthWidget (30L) | Missing | MERGE into V2 CustomerWorkspace | 0.5d | P3 |
| Smart panel | CustomerSmartPanel (48L) | Missing | REWRITE as V2 component | 1d | P3 |
| Relationship panel | CustomerRelationshipPanel (46L) | Missing | REWRITE as V2 component | 1d | P3 |
| 17-tab interface | CustomerTabs (208L) | Inspector (163L) | REWRITE using V2 Inspector pattern | 2d | P2 |
| Timeline | CustomerTimeline (51L) | V2 Timeline (84L) | MERGE — use V2 Timeline component | 0.5d | P3 |
| Alerts | CustomerAlerts (27L) | Missing | REWRITE as V2 component | 0.5d | P3 |
| KPI cards | CustomerKPICards (45L) | V2 AnalyticsCard (191L) | MERGE — use V2 pattern | 0.5d | P3 |
| Header | CustomerWorkspaceHeader (63L) | V2 Shell pattern | REWRITE | 1d | P2 |

### 1.2 Invoice Domain

| Feature | V1 | V2 | Action | Effort | Priority |
|---------|-----|-----|--------|--------|----------|
| Invoice list | InvoiceExplorer (40L) | Explorer sidebar | REWRITE using V2 Explorer | 2d | P1 |
| Invoice detail | InvoiceWorkspace (106L) | InvoiceCommandCenter (602L) | KEEP V2 (more complete) | 0d | P1 |
| Backend integration | Mock | Mock | WIRE to backend controllers | 3d | P0 |

### 1.3 Meter Domain

| Feature | V1 | V2 | Action | Effort | Priority |
|---------|-----|-----|--------|--------|----------|
| Meter list | MeterExplorer (50L) | Explorer sidebar | REWRITE using V2 Explorer | 2d | P1 |
| Meter detail | MeterDetail (86L) | MeterWorkspace (163L) | KEEP V2 (more complete) | 0d | P1 |
| Backend integration | Mock | Mock | WIRE to backend controllers | 2d | P0 |

### 1.4 Payment Domain

| Feature | V1 | V2 | Action | Effort | Priority |
|---------|-----|-----|--------|--------|----------|
| Payment list | PaymentExplorer (36L) | Explorer sidebar | REWRITE using V2 Explorer | 2d | P1 |
| Payment detail | PaymentWorkspace (69L) | PaymentWorkspace (610L) | KEEP V2 (much more complete) | 0d | P1 |
| Backend integration | Mock | Mock | WIRE to backend controllers | 3d | P0 |

### 1.5 Reading Domain

| Feature | V1 | V2 | Action | Effort | Priority |
|---------|-----|-----|--------|--------|----------|
| Reading list | ReadingExplorer (58L) | Explorer sidebar | REWRITE using V2 Explorer | 2d | P1 |
| Reading detail | Missing | ReadingWorkspace (636L) | KEEP V2 | 0d | P1 |
| Backend integration | Mock | Mock | WIRE to backend controllers + add missing AI/neighbor endpoints | 5d | P0 |

### 1.6 Financial / Dashboard

| Feature | V1 | V2 | Action | Effort | Priority |
|---------|-----|-----|--------|--------|----------|
| Dashboard | DashboardEngine (21L) | Dashboard (421L) | KEEP V2 | 0d | P1 |
| Financial KPI | FinancialDashboard (44L) | Dashboard (partial) | MERGE — add financial KPI to V2 Dashboard | 1d | P2 |
| Collections | CollectionDashboard (46L) | Missing | REWRITE as V2 component | 2d | P3 |
| Tariff Studio | TariffStudio (73L) | Missing (in Enterprise) | REWRITE as V2 component | 2d | P2 |
| Unit Explorer | UnitExplorer (44L) | Missing | REWRITE as V2 component | 1d | P3 |

### 1.7 Enterprise Admin

| Feature | V1 | V2 | Action | Effort | Priority |
|---------|-----|-----|--------|--------|----------|
| 19-module admin | Missing | EnterpriseAdminCenter (766L) | KEEP V2 | 0d | P1 |
| Backend API | Missing | Missing | BUILD 19 new controllers/services | 15d | P2 |

### 1.8 Auth

| Feature | V1 | V2 | Action | Effort | Priority |
|---------|-----|-----|--------|--------|----------|
| Login page | Missing | Missing | BUILD login page using V2 components | 3d | P0 |
| Auth integration | Mock | Mock | WIRE to backend auth endpoints | 2d | P0 |
| Session management | Missing | Missing | BUILD token refresh, protected routes | 2d | P0 |

---

## 2. Design System Migration

| Component | V1 | V2 | Action | Effort |
|-----------|-----|-----|--------|--------|
| Button + IconButton | 55L + 28L | 27L + 29L | DELETE V1, keep V2 | 1d |
| Input | 43L | 33L | DELETE V1, keep V2 | 0.5d |
| Textarea | 21L | 26L | DELETE V1, keep V2 | 0.5d |
| SearchInput | 20L | 47L | DELETE V1, keep V2 | 0.5d |
| NumberInput | 30L | 58L | DELETE V1, keep V2 | 0.5d |
| Badge | 38L | 13L | DELETE V1, keep V2 | 0.5d |
| Chip | — | 45L | KEEP V2 only | 0d |
| Checkbox | 23L | 29L | DELETE V1, keep V2 | 0.5d |
| Radio | 20L | 39L | DELETE V1, keep V2 | 0.5d |
| Switch | 19L | 32L | DELETE V1, keep V2 | 0.5d |
| Select | 30L | 120L | DELETE V1, keep V2 (Radix) | 1d |
| MultiSelect | 36L | 112L | DELETE V1, keep V2 | 0.5d |
| Avatar | 16L | 44L | DELETE V1, keep V2 | 0.5d |
| Card suite | 46L | 40L | DELETE V1, keep V2 | 0.5d |
| Panel | — | 24L | KEEP V2 only | 0d |
| Tabs | 32L | 44L | DELETE V1, keep V2 | 0.5d |
| Accordion | 33L | 46L | DELETE V1, keep V2 | 0.5d |
| Dialog | 33L | 69L | DELETE V1, keep V2 | 0.5d |
| Drawer | 30L | 55L | DELETE V1, keep V2 | 0.5d |
| Tooltip | 20L | 28L | DELETE V1, keep V2 | 0.5d |
| Popover | 24L | 32L | DELETE V1, keep V2 | 0.5d |
| Dropdown | 32L | 185L | DELETE V1, keep V2 | 1d |
| ContextMenu | 36L | 173L | DELETE V1, keep V2 | 1d |
| Breadcrumb | 20L | 87L | DELETE V1, keep V2 | 0.5d |
| Pagination | 23L | 83L | DELETE V1, keep V2 | 0.5d |
| Progress | 18L | 24L | DELETE V1, keep V2 | 0.5d |
| Skeleton | 36L | 21L | DELETE V1, keep V2 | 0.5d |
| Alert | 28L | 57L | DELETE V1, keep V2 | 0.5d |
| Toast | 26L + 37L | 31L (Sonner) | DELETE V1, keep V2 | 0.5d |
| States | 71L + 62L | 93L | DELETE V1, keep V2 | 0.5d |
| CommandPalette | 78L | 90L (cmdk) | DELETE V1, keep V2 | 0.5d |
| DatePicker | 32L | 55L | DELETE V1, keep V2 | 0.5d |
| Form components | — | 84L | KEEP V2 only | 0d |
| ErrorBoundary | — | 26L | KEEP V2 only | 0d |

---

## 3. Store Migration

| V1 Store | V2 Replacement | Action | Effort |
|----------|---------------|--------|--------|
| `useWorkspaceStore` | 6 V2 sub-stores | REWRITE V1 components to use V2 composition | 3d |
| `useThemeStore` | CSS variables (V2) | DELETE store, use CSS + data attributes | 1d |
| `useNotificationStore` | Sonner Toaster (V2) | DELETE store, migrate consumers | 1d |
| `useLocaleStore` | CSS dir attribute (V2) | DELETE store | 0.5d |

---

## 4. Data Layer Migration

| V1 File | V2 Replacement | Action | Effort |
|---------|---------------|--------|--------|
| `lib/api/http-client.ts` | `v2/lib/api/client.ts` | DELETE V1, keep V2 | 0.5d |
| `lib/api/backend-client.ts` | V2 repositories | DELETE V1 | 1d |
| `lib/api/mock-data.ts` | `v2/data/mock/index.ts` | DELETE V1 (minimal) | 0.5d |
| `lib/api/hooks.ts` | `v2/lib/query/index.ts` | REWRITE consumers to use V2 query hooks | 3d |
| `lib/api/hooks-customers.ts` | V2 query hooks + repo | REWRITE consumers | 2d |
| `lib/api/hooks-financial.ts` | V2 query hooks + repos | REWRITE consumers | 2d |
| `lib/types/business.ts` | `v2/data/fixtures/models.ts` | CONSOLIDATE or reference V2 types | 1d |

---

## 5. Backend Integration Plan

| Phase | Entity | Effort | Dependencies |
|-------|--------|--------|-------------|
| **Phase 1: Auth** | Login/logout, token management, protected routes | 3d | No frontend auth exists |
| **Phase 2: Core CRUD** | Customers, Meters, Invoices, Payments, Readings | 10d | Backend controllers exist, wire repositories |
| **Phase 3: Extended** | Tariffs, Bill Cycles, Collections, Notifications | 5d | Partial backend |
| **Phase 4: Niche** | Wallet, Solar, Chilled Water, SIM Cards, Reports | 5d | No frontend exists |
| **Phase 5: Enterprise** | 19 admin modules | 15d | No backend exists |
| **Phase 6: Advanced** | AI predictions, risk engine, weather correlation | 10d | New backend services needed |

---

## 6. Total Effort Estimate

| Category | Effort (person-days) |
|----------|---------------------|
| V1 → V2 Design System Migration | 15d |
| V1 → V2 Store/Hooks Migration | 12d |
| V1 → V2 Domain Component Migration | 20d |
| Backend Integration (Core CRUD) | 10d |
| Backend Integration (Extended) | 5d |
| Backend Integration (Niche) | 5d |
| Enterprise Admin Backend | 15d |
| Advanced Backend Features | 10d |
| Auth Frontend Implementation | 5d |
| **Total** | **~97 person-days** |

---

## 7. Recommended Sprint Plan

### Sprint 1: Foundation (15d)
- [ ] Wire auth: login page, JWT token management, protected routes
- [ ] Wire Customer CRUD: V2 repositories → backend controllers
- [ ] Migrate UI primitives: Button, Input, Select, Dialog → V2

### Sprint 2: Core Domain (15d)
- [ ] Wire Meters, Invoices, Payments, Readings — V2 repos → backend
- [ ] Migrate V1 domain components to V2: Customer, Invoice, Meter
- [ ] Delete V1 SmartTable, migrate to V2 DataGrid

### Sprint 3: Migration (15d)
- [ ] Migrate remaining V1 domain components: Payment, Reading, Tariff, Unit
- [ ] Migrate V1 stores to V2 sub-stores
- [ ] Migrate V1 notification system to Sonner
- [ ] Delete V1 hooks, API client, mock-data

### Sprint 4: Extended (15d)
- [ ] Wire bill cycles, collections, notifications
- [ ] Build Wallet, Solar, Chilled Water frontends
- [ ] Add loading/error boundaries to all routes

### Sprint 5: Enterprise (15d)
- [ ] Build Enterprise Admin backend (19 controllers + services)
- [ ] Wire EnterpriseAdminCenter to real API
- [ ] Add missing V2 features: health widget, smart panel, relationship panel

### Sprint 6: Polish (15d)
- [ ] AI predictions, risk engine, weather correlation
- [ ] Performance optimization
- [ ] Delete all V1 dead code
- [ ] Final integration testing

---

## 8. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| V2 design system has fewer components than V1 | MEDIUM | Audit and build missing V2 components (file-upload, advanced inputs) |
| V2 domain workspaces are mock-only | HIGH | Wire to backend incrementally; keep V1 routes as fallback |
| Enterprise admin has no backend | HIGH | De-scope from MVP or build minimal enterprise backend |
| No auth pages exist | HIGH | Build login as P0 blocking dependency |
| Dual route maintenance (V1 + V2) | MEDIUM | Delete V1 routes incrementally after each domain is migrated |
| V2 ReadingWorkspace has features beyond backend (AI, weather) | MEDIUM | Build backend equivalents or simplify frontend |
