# Duplication Audit

**Date:** 2026-07-21  
**Phase:** 40 — Enterprise Architecture Validation  
**Method:** Full codebase scan comparing entity implementations across all layers  

---

## Critical Finding: Parallel Codebase

A complete parallel application exists at `D:\meter\Meter\` with its own:
- Frontend (separate Next.js app)
- Backend (separate Express app with controllers)
- Components (separate UI components)
- Docs, tests, tools, CI/CD

### Duplicate Files Found

| Entity | Main Backend | Meter/ Backend | Status |
|--------|-------------|----------------|--------|
| Customer | `backend/src/routes/customers.js` | `Meter/backend/src/customers/customers.controller.ts` | 🔴 DUPLICATE |
| Meter | `backend/src/routes/meters.js` | `Meter/backend/src/meters/meters.controller.ts` | 🔴 DUPLICATE |
| Invoice | `backend/src/routes/invoices.js` | `Meter/backend/src/invoices/invoices.controller.ts` | 🔴 DUPLICATE |
| Payment | `backend/src/routes/payments.js` | `Meter/backend/src/payments/payments.controller.ts` | 🔴 DUPLICATE |
| Tariff | Domain API via `domain.js` | `Meter/backend/src/billing/tariff-studio.controller.ts` | 🔴 DUPLICATE |
| Reading | `backend/src/routes/readings.js` | `Meter/backend/src/readings/readings.controller.ts` | 🔴 DUPLICATE |
| Notification | Service routes | `Meter/backend/src/notifications/notifications.controller.ts` | 🔴 DUPLICATE |
| Validation | `domain.js` | `Meter/backend/src/common/validation/validation-rule.service.ts` | 🔴 DUPLICATE |
| KPI | `reports.js` | `Meter/backend/src/kpi/kpi.controller.ts` | 🔴 DUPLICATE |
| Project | Admin routes | `Meter/backend/src/projects/projects.controller.ts` | 🔴 DUPLICATE |
| Area | Admin routes (static) | `Meter/backend/src/areas/` | 🔴 DUPLICATE |

### Duplicate Frontend Components

| Entity | Main Frontend | Meter/ Frontend | Status |
|--------|--------------|-----------------|--------|
| Customer | GenericAdminPage only | `Meter/Frontend/src/components/customers/` (4 files) | 🔴 DUPLICATE |
| Meter | GenericAdminPage only | `Meter/Frontend/src/components/meters/` (5 files) | 🔴 DUPLICATE |
| Project | GenericAdminPage only | `Meter/Frontend/src/components/projects/` (4 files) | 🔴 DUPLICATE |
| Tariff | None (domain API only) | `Meter/Frontend/src/components/tariffs/` (1 file) | 🔴 DUPLICATE |
| Reading | GenericAdminPage only | `Meter/Frontend/src/components/readings/` (2 files) | 🔴 DUPLICATE |

---

## Duplicate Admin Pages

| Entity | Admin Page | Dashboard Page | Workspace App | Status |
|--------|:----------:|:--------------:|:-------------:|:------:|
| Customer | ✅ `/admin/customers` | ❌ Missing | ✅ Registered (mock) | ⚠️ 2 of 3 exist |
| Meter | ✅ `/admin/meters` | ❌ Missing | ✅ Registered (mock) | ⚠️ 2 of 3 exist |
| Reading | ✅ `/admin/readings` | ❌ Missing | ✅ Registered (mock) | ⚠️ 2 of 3 exist |
| Invoice | ✅ `/admin/invoices` | ❌ Missing | ✅ Registered (mock) | ⚠️ 2 of 3 exist |
| Payment | ✅ `/admin/payments` | ❌ Missing | ✅ Registered (mock) | ⚠️ 2 of 3 exist |

**Finding:** No entity has all three views (admin + dashboard + workspace). Each entity exists in 2 of 3 places. The workspace apps use mock data while admin pages use GenericAdminPage with API calls.

---

## Duplicate Functionality Within Main Codebase

### Table Implementations (3)
| Table | Used By | Lines | Status |
|-------|---------|:-----:|:------:|
| GenericAdminPage table | 45 admin pages | 395 | ✅ Active |
| DataTable (shadcn/ui) | Users, Products (dashboard) | ~200 | ✅ Active |
| EnterpriseTable | `/admin/tables` (demo) | ~500 | ❌ Demo only |

**Recommendation:** Unify. DataTable should be the standard. GenericAdminPage table should be replaced with DataTable. EnterpriseTable should be replaced with DataTable or removed.

### Search Implementations (4)
| Search | Location | Status |
|--------|----------|:------:|
| GenericAdminPage search (debounced) | Admin pages | ✅ Active |
| GlobalSearch | Workspace runtime | ❌ Unused in admin |
| SmartSearch | Workspace runtime | ❌ Unused in admin |
| CommandPalette | Workspace runtime | ❌ Unused in admin |

**Recommendation:** GlobalSearch should be wired into the admin layout. Remove per-page search from GenericAdminPage once GlobalSearch covers admin.

### Notification Components (2)
| Component | Location | Status |
|-----------|----------|:------:|
| Notification model + routes | Backend | ✅ Active |
| In-app notification UI | Dashboard | ✅ Active |
| Notification wiring to events | Nowhere | ❌ Not wired |

**Recommendation:** Wire existing notification infrastructure to business events. Don't rebuild.

### API Fetch Patterns (3)
| Pattern | Location | Status |
|---------|----------|:------:|
| GenericAdminPage useEffect → fetch | 45 admin pages | ✅ Active |
| TanStack React Query | Users, Products (dashboard) | ✅ Active |
| Workspace apps inline fetch | 5 workspace apps | ⚠️ Partial |

**Recommendation:** GenericAdminPage should use React Query instead of raw useEffect/fetch for caching and deduplication.

---

## Duplicate Data Sources

### Customer Data
| Source | Endpoint | Data Shape | Used By |
|--------|----------|------------|---------|
| Admin API | `/api/admin/users` | User fields | ❌ Admin customers page (WRONG) |
| MeterVerse API | `/api/meterverse/customers` | Customer fields | ✅ BFF proxy |
| Backend API | `backend/src/routes/customers.js` | Customer model fields | ✅ Express route |
| Mock data | GenericAdminPage fallback | Customer fields | ⚠️ When backend unavailable |

**Recommendation:** Remove the admin customers reference to `/api/admin/users`. Single source of truth: `/api/meterverse/customers`.

---

## Dead Code Found

| File | Reason | Size |
|------|--------|:----:|
| `Frontend/src/app/customer/` | Empty directory — no page.tsx | 0 files |
| `Frontend/src/enterprise-apps/*` | Old V2 files (per CHANGELOG) | ~10 files |
| `Frontend/src/admin/tables/EnterpriseTable.tsx` | Only used by `/admin/tables` demo page | ~500 lines |
| `Meter/` directory | Parallel codebase — not wired to main app | ~500+ files |

---

## Duplication Summary

| Type | Count | Impact |
|------|:-----:|--------|
| Parallel codebase (`Meter/`) | 1 directory, ~500+ files | 🔴 High — maintenance burden, confusion |
| Table implementations | 3 | 🟡 Medium — should unify to DataTable |
| Customer API endpoints | 2 (1 wrong) | 🔴 Critical — shows wrong data |
| Search implementations | 4 (3 unused in admin) | 🟢 Low — GlobalSearch should be wired |
| Fetch patterns | 3 | 🟡 Medium — GenericAdminPage should use React Query |
| Entity admin pages | 5 of 5 exist | ✅ Good — no duplication |
| Entity dashboard pages | 0 of 5 exist | ❌ Missing — not duplication |
| Content components (`Meter/`) | 5 entities duplicated | 🔴 High — parallel component sets |

---

## What to Reuse (Never Rebuild)

| Component | Location | Recommendation |
|-----------|----------|---------------|
| GenericAdminPage | `Frontend/src/admin/tables/GenericAdminPage.tsx` | ✅ Keep — enhance with submit + toast |
| DataTable | `Frontend/src/components/ui/table/data-table.tsx` | ✅ Make standard table component |
| Sonner toast | `Frontend/node_modules/sonner` | ✅ Use for mutation feedback |
| GlobalSearch | Workspace runtime | ✅ Wire into admin layout |
| CommandPalette | Workspace runtime (KBar) | ✅ Wire into admin layout |
| AuditEntry model + auditLog middleware | Backend | ✅ Wire to routes |
| requireRole middleware | Backend | ✅ Wire to routes |
| Notification model + templates | Backend | ✅ Wire to events |
| QueueJob + ScheduledTask | Backend | ✅ Wire to business logic |
| KpiDefinition + KpiSnapshot | Backend | ✅ Wire to calculations |
