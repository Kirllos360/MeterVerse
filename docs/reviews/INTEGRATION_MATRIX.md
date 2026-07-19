# Integration Layer Audit — Full-Stack Data Flow Matrix

**Date:** 2026-07-19  
**Scope:** Every user action traced through all layers  

---

## Integration Chain

```
Button Click → Frontend → Service → BFF API → Backend API → Controller → Prisma → Database
                                                                                ↓
                                                                           Audit Log
                                                                                ↓
                                                                         Notification
                                                                                ↓
                                                                         Realtime WS
                                                                                ↓
                                                                         UI Refresh
```

---

## Action → Full Stack Mapping

### Login

| Layer | Status | File |
|-------|--------|------|
| **Button** | ✅ | `login/page.tsx` — Submit button |
| **Frontend** | ✅ | `useAuthRuntime()` → `fetch(/api/auth/login)` |
| **BFF** | ✅ | `/api/auth/login/route.ts` → `loginUser()` |
| **Service** | ✅ | `auth-service.ts` — tries backend, falls back to mock |
| **Backend** | ✅ | `routes/auth.js` → bcrypt → JWT |
| **Prisma** | ✅ | `User.findUnique()` |
| **Database** | ✅ | PostgreSQL users table |
| **Audit** | ❌ | `track("login")` never called |
| **Notification** | ❌ | No login notification |
| **Realtime** | ❌ | No WebSocket event |
| **UI Refresh** | ⚠️ | AuthRuntime state update only |

### List Customers

| Layer | Status | File |
|-------|--------|------|
| **Button** | ✅ | Tab click → `WorkspaceContent` |
| **Frontend** | ⚠️ | `useEffect` fetches from `/api/meterverse/customers` |
| **BFF** | ✅ | `customers/route.ts` → `apiBackend()` |
| **Service** | ✅ | `api-client.ts` — fetch with auth headers |
| **Backend** | ✅ | `routes/customers.js` → Prisma findMany |
| **Prisma** | ✅ | `Customer.findMany()` |
| **Database** | ✅ | PostgreSQL |
| **Audit** | ❌ | Not logged |
| **Notification** | N/A | |
| **Realtime** | ❌ | |
| **UI Refresh** | ⚠️ | Works, but falls back to mock data when API fails |

### Create Customer

| Layer | Status | File |
|-------|--------|------|
| **Button** | ✅ | "Add new" button in header |
| **Frontend** | ⚠️ | `handleAdd` — shows notification only, no API call |
| **BFF** | ✅ | POST route exists |
| **Backend** | ✅ | POST route with Zod validation |
| **Prisma** | ✅ | `Customer.create()` |
| **Database** | ✅ | PostgreSQL |
| **Audit** | ❌ | Not logged |
| **Notification** | ❌ | No success/error notification |
| **Realtime** | ❌ | |
| **UI Refresh** | ❌ | Mock notification, no data refresh |

### View Customer Detail

| Layer | Status | File |
|-------|--------|------|
| **Button** | ⚠️ | "View" in dropdown menu — not wired |
| **Frontend** | ❌ | No detail view implemented |
| **BFF** | ❌ | No `/api/meterverse/customers/:id` route |
| **Backend** | ✅ | `router.get("/:id")` exists |
| **Prisma** | ✅ | `Customer.findUnique()` |
| **Database** | ✅ | PostgreSQL |
| **Audit** | ❌ | |
| **UI Refresh** | ❌ | |

### Edit Customer

| Layer | Status | File |
|-------|--------|------|
| **Button** | ⚠️ | "Edit" in dropdown — not wired |
| **Frontend** | ❌ | No edit form |
| **BFF** | ❌ | No PUT route in BFF |
| **Backend** | ✅ | `router.put("/:id")` exists |
| **Audit** | ❌ | |

### Delete Customer

| Layer | Status | File |
|-------|--------|------|
| **Button** | ⚠️ | "Delete" in dropdown — not wired |
| **Frontend** | ❌ | No confirmation dialog |
| **BFF** | ❌ | No DELETE route in BFF |
| **Backend** | ✅ | `router.delete("/:id")` exists (hard delete) |
| **Audit** | ❌ | |
| **Soft Delete** | ❌ | Data is permanently removed |

---

## Integration Coverage by Entity

| Action | Customers | Meters | Readings | Invoices | Payments |
|--------|-----------|--------|----------|----------|----------|
| **List** | 🟡 BFF→API→DB, mock fallback | 🟡 Same | 🟡 Same | 🟡 Same | 🟡 Same |
| **View Detail** | ❌ No detail UI | ❌ | ❌ | ❌ | ❌ |
| **Create** | ⚠️ Button exists, no API call | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| **Update** | ❌ No edit form | ❌ | ❌ | ❌ | ❌ |
| **Delete** | ❌ No confirmation | ❌ | ❌ | ❌ | ❌ |
| **Search** | 🟡 Frontend only | 🟡 | 🟡 | 🟡 | 🟡 |
| **Sort** | 🟡 Frontend only | 🟡 | 🟡 | 🟡 | 🟡 |
| **Export** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Import** | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Enterprise Integration Features

| Feature | Status | Notes |
|---------|--------|-------|
| **Audit Logging** | ❌ | `AuditHooks.ts` exists but is never called anywhere |
| **Notifications** | ❌ | `NotificationCenter` component exists, but no real notifications |
| **Realtime** | ❌ | No WebSocket, no SSE, no polling |
| **UI Refresh** | ❌ | No React Query, no SWR, no automatic refetch |
| **Permissions** | ⚠️ | RouteGuard + PermissionGuard exist but not wired to backend roles |

---

## Integration Score: 22%

| Layer | Coverage | Status |
|-------|----------|--------|
| Button → Frontend | 30% | List works, Create/Edit/Delete are UI shells |
| Frontend → BFF | 40% | List fetches from API, mutations don't |
| BFF → Backend | 60% | GET routes forward, POST/PUT/DELETE partially |
| Backend → Prisma | 70% | CRUD routes connect to Prisma |
| Prisma → Database | 100% | PostgreSQL connected |
| Audit | 0% | Never integrated |
| Notifications | 0% | Never integrated |
| Realtime | 0% | Never integrated |
| UI Refresh | 10% | No automatic refresh after mutations |
| **Overall** | **22%** | |

---

## Immediate Priority Fixes

| # | Fix | Layer | Effort |
|---|-----|-------|--------|
| 1 | Wire "Add New" button → POST to BFF → Backend → DB → refresh list | Frontend→Backend | 4h |
| 2 | Add View Detail page (modal/drawer) with `/api/:id` call | Frontend | 4h |
| 3 | Wire "Edit" → PUT to BFF → Backend | Frontend→Backend | 4h |
| 4 | Wire "Delete" with confirmation → DELETE to BFF → soft delete | Frontend→Backend | 4h |
| 5 | Add audit logging to all mutations | All routes | 8h |
| 6 | Add success/error notifications for all mutations | Frontend | 2h |
