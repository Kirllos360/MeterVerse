# Customer Integration Audit

**Date:** 2026-07-21  
**Phase:** 40 — Enterprise Architecture Validation  
**Purpose:** Trace the complete Customer data flow (Button → DB → UI) and identify every break point  

---

## Complete Flow Trace

```
User clicks "Customers" in sidebar
    ↓
1. Admin: AdminLayout → setActive("customers")
   Dashboard: ❌ NOT AVAILABLE — missing from nav-config.ts
    ↓
2. GenericAdminPage mounts
   ↓
3. useEffect → fetch("/api/admin/users") ← ❌ WRONG API (C01)
   Should be: fetch("/api/meterverse/customers")
    ↓
4. BFF Route: /api/meterverse/customers/route.ts
   ↓
5. apiBackend("/customers") checks NEXT_PUBLIC_API_URL
   ├── Backend available (localhost:3001) → proxy to Express
   └── No backend → return mock { customers: [], total: 0 }
    ↓
6. Express Backend: customers.js
   GET / → prisma.customer.findMany() + count()
   WHERE: {} ← ❌ No archivedAt filter (soft delete not enforced)
   ORDER: createdAt DESC
    ↓
7. Prisma → PostgreSQL
   Table: Customer
   Indexes: PK only ← ❌ No FK/status/createdAt indexes
    ↓
8. Response: { customers: [...], total: N, page: 1, limit: 10 }
    ↓
9. GenericAdminPage: transform(d) → setData(items)
   ❌ CURRENT: d.users (user data)
   ✅ SHOULD: d.customers (customer data)
    ↓
10. Render: table with Name, Email, Phone, Status, Area, Created
    ↓
11. User clicks "Add" → Sheet opens with form fields
    ↓
12. User fills form → clicks "Save"
    ❌ NO ONSUBMIT HANDLER (C02) — form does nothing
    ↓
13. User clicks row → "Edit" → Sheet opens pre-filled
    ↓
14. User modifies → clicks "Update"
    ❌ NO ONSUBMIT HANDLER (C02) — form does nothing
    ↓
15. User clicks row → "Activate/Deactivate/Maintain/Terminate"
    ↓
16. handleAction → updateStatus → optimistic setData
    ↓
17. fetch(PUT /api/admin/users/:id) ← ❌ WRONG API
    ✅ Should: fetch(PUT /api/meterverse/customers/:id)
    ↓
18. catch {} ← ❌ EMPTY CATCH (errors silently swallowed)
    ↓
19. User clicks row → "Delete" → AlertModal opens
    ↓
20. Confirm → setData(filter) → DELETE /api/meterverse/customers/:id
    ← ❌ Hard delete (no archivedAt set)
    ↓
21. User clicks row → "View"
    ❌ case "view": break — NO ACTION (no detail page)
    ↓
22. No toast notification at any point
    ❌ Zero user feedback for success/failure
```

---

## Break Points Identified

| # | Location | Break | Impact | Fix |
|---|----------|-------|--------|-----|
| B01 | `page-configs.ts:19` | Wrong API: `/api/admin/users` instead of `/api/meterverse/customers` | Shows user data as customers | Change URL string |
| B02 | `page-configs.ts:21` | Wrong transform: `d.users` instead of `d.customers` | Maps user fields to customer columns | Change accessor |
| B03 | `GenericAdminPage.tsx:198` | Sheet "Save"/"Update" buttons have no onClick handler | Cannot create or edit customers | Add onSubmit handler |
| B04 | `GenericAdminPage.tsx:79` | Empty catch on status update | Errors invisible to user | Add error toast |
| B05 | `GenericAdminPage.tsx:241` | case "view": break | Customer detail page never opens | Add navigation to detail |
| B06 | Backend customers DELETE | Hard delete (prisma.customer.delete) | Data loss — no recovery | Set archivedAt instead |
| B07 | Backend customers GET | No `where: { archivedAt: null }` filter | Deleted records still appear | Add archivedAt filter |
| B08 | `customers.js` | No auditLog() calls | Zero audit trail for customer ops | Import and call auditLog |
| B09 | `customers.js` | No requireRole() | Any user can manage customers | Add middleware |
| B10 | `nav-config.ts` | No Customers entry | Users can't access customer management | Add nav entry |
| B11 | `GenericAdminPage.tsx` | No toast on mutations | No success/failure feedback | Add sonner toasts |
| B12 | Dashboard | No `/dashboard/customers` page | Only admins can see customer list | Create page |

---

## Integration Status Summary

| Layer | Status | Issues |
|-------|:------:|--------|
| **Button (sidebar click)** | ⚠️ Partial | Admin works; dashboard missing from nav-config |
| **Component (GenericAdminPage)** | ⚠️ Partial | Renders but with wrong data + unsubmitted forms |
| **Hook (useEffect)** | ⚠️ Partial | Fetches on mount but wrong endpoint |
| **BFF (route handler)** | ✅ OK | Proxies correctly; mock fallback works |
| **Backend (Express)** | ✅ OK | CRUD exists with Zod + pagination + search |
| **Prisma (ORM)** | ⚠️ Partial | archivedAt exists but not filtered |
| **Database (PostgreSQL)** | ⚠️ Partial | No performance indexes on Customer table |
| **Response** | ✅ OK | Consistent envelope format |
| **UI Update** | ⚠️ Partial | Renders data; no mutation feedback |
| **Complete chain** | **3/9 layers fully functional** | **33% integration completeness** |

---

## Critical Path to Fix

To make Customer fully operational, fix these in order:

1. **Fix API endpoint** (B01, B02) — 5 minutes, changes one URL string + one transform key
2. **Wire Sheet submit** (B03) — 2 hours, adds POST/PUT fetch + form data serialization
3. **Add toast notifications** (B11) — 1 hour, imports sonner + wraps mutations
4. **Fix empty catch** (B04) — 15 minutes, adds error toast to catch block
5. **Add dashboard page** (B10, B12) — 2 hours, creates page + nav entry
6. **Wire auditLog** (B08) — 30 minutes, imports auditLog into customers.js routes
7. **Wire requireRole** (B09) — 30 minutes, adds middleware to customers.js
8. **Fix soft delete** (B06, B07) — 1 hour, set archivedAt instead of delete, filter in GET
9. **Create detail page** (B05) — 4 hours, new page with tabbed interface

**Total to make Customer fully operational: ~11 hours**
