# Backend Review

**Date:** 2026-07-21  
**Runtime:** Node.js 22, Express.js  
**ORM:** Prisma 6.x (PostgreSQL 16)  
**Auth:** JWT (jsonwebtoken) + bcryptjs  
**Validation:** Zod 3.x  
**Security:** Helmet.js, CORS, express-rate-limit  

---

## Routes

### Route File Inventory

| File | Lines | Endpoints | Patterns | Status |
|------|:-----:|:---------:|----------|--------|
| admin.js | 716 | 30+ | Admin CRUD (users, roles, settings, etc.) | ✅ Live |
| services.js | 331 | 16 | Email, SMS, Push, OCR, PDF, Excel, notifications | ✅ Live |
| reports.js | 187 | 14 | Operational, financial, executive, KPI, variance, aging | ✅ Live |
| domain.js | 169 | 18 | Domain data access (contracts, tariffs, bill cycles, etc.) | ✅ Live |
| security.js | 153 | 5 | Security audit, secrets audit, dependency audit | ✅ Live |
| monitor.js | 147 | 4 | Health deep, performance, audit explorer, analytics | ✅ Live |
| business.js | 82 | 2 | Pipeline status, simulate | ✅ Live |
| ai.js | 82 | 9 | AI agent endpoints (operator, billing, etc.) | ✅ Live |
| crud.js | 81 | 1 | Generic CRUD executor | ✅ Live |
| customers.js | 68 | 5 | Customer CRUD | ✅ Live |
| auth.js | 59 | 3 | Login, register, me | ✅ Live |
| meters.js | 49 | 5 | Meter CRUD | ✅ Live |
| invoices.js | 43 | 4 | Invoice CRUD | ✅ Live |
| readings.js | 37 | 4 | Reading CRUD + bulk | ✅ Live |
| payments.js | 27 | 3 | Payment CRUD | ✅ Live |

**Total:** 15 files, 2,239 lines, ~128 endpoints

### Route Pattern Analysis

| Route File | Zod | Auth | Pagination | Search | Sorting | Audit | Soft Delete | Error Handler |
|-----------|:---:|:----:|:----------:|:------:|:-------:|:-----:|:-----------:|:-------------:|
| auth.js | ✅ | ✅ | N/A | N/A | N/A | ❌ | ❌ | ✅ |
| customers.js | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| meters.js | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| readings.js | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| invoices.js | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| payments.js | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| admin.js | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| services.js | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| reports.js | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| security.js | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| ai.js | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| business.js | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| crud.js | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| domain.js | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| monitor.js | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |

**Coverage:**
- Zod validation: 10/15 (67%) — missing on meters, readings, invoices, payments, security, monitor
- Auth: 15/15 (100%) — every route file uses `authenticate` middleware
- Pagination: 11/15 (73%) — missing on auth, security, ai, crud
- Search: 6/15 (40%) — only customers, meters, admin, domain, monitor
- Sorting: 11/15 (73%) — missing on auth, security, ai, crud
- Audit: 0/15 (0%) — `auditLog()` middleware exists but NEVER called for business operations
- Soft Delete: 0/15 (0%) — `archivedAt` columns exist but routes don't filter or use them

---

## Controllers

### Current Pattern
```javascript
// Route handler IS the controller — no separation
router.get("/", async (req, res, next) => {
  try {
    const items = await prisma.customer.findMany({ ... })
    res.json({ customers: items, total, page, limit })
  } catch (err) { next(err) }
})
```

**Assessment:** The backend uses the **route-as-controller** antipattern. Route handlers contain both HTTP logic (request parsing, response formatting) AND business logic (database queries). This violates the Single Responsibility Principle and makes testing difficult.

**Recommendation:** Extract business logic into service layer:
```
routes/customers.js → controllers/customerController.js → services/customerService.js → prisma
```

---

## Validation

### Zod Usage

| Coverage | Route Files |
|----------|-------------|
| ✅ Full Zod | auth.js, customers.js, admin.js, services.js, reports.js, ai.js, business.js, crud.js, domain.js |
| ❌ No Zod | meters.js, readings.js, invoices.js, payments.js, security.js, monitor.js |

### Schema Example (customers.js)
```javascript
const createSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  area: z.string().max(100).optional().or(z.literal("")),
})
```

**Assessment:** Zod validation is well-implemented where it exists, with clear schemas, partial updates, and ZodError handling. The 6 route files without Zod are a security gap — invalid data can reach the database.

---

## Permissions

### Current State

**Middleware exists:**
```javascript
// backend/src/middleware/security.js
export function requireRole(...roles) { ... }
export function requirePermission(...permissions) { ... }
```

**Usage in routes:**
```javascript
// Currently: router.use(authenticate) — only auth, NO role/permission check
```

**Finding:** `requireRole()` and `requirePermission()` middleware are **never applied** to any route. Every authenticated user can access every endpoint. The RBAC infrastructure exists but is not enforced.

### Audit in Permissions
The `requireRole()` function DOES call `auditLog()` on authorization failures:
```javascript
auditLog(req, "authorization.failed", { required: roles, userRole: req.user?.role })
```
So failed authorization attempts ARE audited. Successful operations are NOT.

---

## Audit

### Audit Infrastructure

| Component | Status |
|-----------|--------|
| `AuditEntry` Prisma model | ✅ 11 fields (id, timestamp, actor, actorId, action, resource, resourceId, details, ip, userAgent, status) |
| `auditLog()` function | ✅ In `security.js` — creates AuditEntry record |
| `auditMiddleware()` | ✅ Express middleware that wraps res.json |
| Wired to requireRole/requirePermission | ✅ For authorization failures |
| Wired to business routes | ❌ **Not imported or used in ANY route handler** |

### Audit Gap

The `auditLog()` function is called in only two places:
1. `requireRole()` — when authorization fails
2. `requirePermission()` — when permission check fails

It is **NOT called** for:
- Customer created (POST /api/customers)
- Customer updated (PUT /api/customers/:id)
- Customer deleted (DELETE /api/customers/:id)
- Any meter, reading, invoice, or payment mutation
- Any admin operation
- Any successful login

**Impact:** Zero audit trail exists for business operations. If a customer is deleted, there is no record of who deleted it or when.

---

## Logging

### Current State

```javascript
// backend/src/server.js — No logging middleware configured
// app.use(morgan(...))  // ❌ Not present
```

**How errors are logged:**
```javascript
// backend/src/middleware/errorHandler.js
export function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${err.message}`)  // ❌ Console.log, no structured logging
  res.status(status).json({ error: err.message })
}
```

**Finding:** No HTTP request logging (morgan, pino-http). Error logging uses `console.error` with no structured format, no log levels, no correlation IDs. Logs are not machine-parseable.

---

## Errors

### Error Handling Pattern

```javascript
// Every route handler is wrapped in try/catch
router.get("/", async (req, res, next) => {
  try {
    // ... business logic
  } catch (err) { next(err) }  // Delegates to errorHandler
})
```

**Assessment:** The try/catch → next(err) → errorHandler pattern is consistent across all routes. The errorHandler middleware returns proper HTTP status codes and JSON error responses.

**Gap:** No error categorization (validation vs business vs system errors). No error codes for client-side handling. No PII sanitization in error messages.

---

## Transactions

### Current State

```javascript
// backend/src/routes/payments.js — Only place using transactions
await prisma.$transaction([
  prisma.payment.create({ data }),
  prisma.invoice.update({ where: { id: invoiceId }, data: { status: "paid" } }),
])
```

**Finding:** `prisma.$transaction()` is only used in the payments route. All other mutating operations (customer create, meter update, invoice generate, etc.) execute as individual queries with no transactional guarantees. If a multi-step operation fails midway, the database is left in an inconsistent state.

---

## Pagination

### Current Implementation

```javascript
// Backend pattern
const page = Math.max(1, Number(req.query.page) || 1)
const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10))
const skip = (page - 1) * limit

const [items, total] = await Promise.all([
  prisma.customer.findMany({ skip, take: limit, ... }),
  prisma.customer.count({ where }),
])
```

**Coverage:** 11/15 route files implement pagination (73%). Missing on auth, security, ai, crud.

**Assessment:** Offset-based pagination is correctly implemented with bounds checking. For large datasets (>10K records), offset pagination degrades because the database must scan and skip all previous rows. Cursor-based pagination is recommended for Reading and AuditEntry tables.

---

## Filtering

### Current Coverage

| Route | Filters | Type |
|-------|---------|------|
| customers | search (name, email) | Text search |
| meters | search (serial, location) | Text search |
| readings | meterId, status | Exact match |
| invoices | status | Exact match |
| admin/* | Various | Various |
| domain | Various | Various |
| Others | None | ❌ |

**Assessment:** Filtering is limited to text search and simple status/meterId filters. No multi-field filter combinations, no date range filters, no relationship-based filters (e.g., "find readings for customer X").

---

## Sorting

### Current Implementation

```javascript
const sortBy = req.query.sortBy || "createdAt"
const sortOrder = req.query.sortOrder || "desc"
const orderBy = { [sortBy]: sortOrder }
```

**Coverage:** 11/15 route files implement sorting (73%). Missing on auth, security, ai, crud.

**Assessment:** Sorting is functional but has a security concern — `sortBy` is taken directly from user input and used as a Prisma object key. This allows sorting by any field on the model, including sensitive fields. Should validate against an allowlist of permitted sort fields.

---

## Exports

### Current State

| Export Type | Backend | Frontend |
|-------------|:-------:|:--------:|
| Customer CSV | ❌ | ❌ |
| Meter CSV | ❌ | ❌ |
| Reading CSV | ❌ | ❌ |
| Invoice CSV | ❌ | ❌ |
| Payment CSV | ❌ | ❌ |
| Report CSV | ❌ | ✅ (reports.js has route pattern, not wired) |

**Finding:** The `ExportJob` model exists in Prisma with full field support. The `reports.js` route file has export endpoints. However, **no data export endpoint is wired** — there is no way to export customers, meters, readings, invoices, or payments as CSV/Excel/PDF from either the backend API or the frontend UI.

---

## Imports

### Current State

| Import Type | Backend | Frontend |
|-------------|:-------:|:--------:|
| Customer CSV/Excel | ❌ | ❌ |
| Meter CSV/Excel | ❌ | ❌ |
| Reading CSV/Excel | ❌ | ❌ |

**Finding:** The `ImportJob` model exists in Prisma with full field support. The `OcrJob` and `ExcelJob` service models exist. However, **no data import endpoint is wired** — there is no way to import customers, meters, or readings from CSV/Excel.

---

## Bulk Actions

### Current State

| Bulk Action | Endpoint | Status |
|-------------|----------|--------|
| Bulk create readings | `POST /api/readings/bulk` | ✅ Implemented |
| Bulk create customers | ❌ | ❌ |
| Bulk update customers | ❌ | ❌ |
| Bulk delete customers | ❌ | ❌ |
| Bulk update meters | ❌ | ❌ |
| Bulk status change | ❌ | ❌ |

**Finding:** Only readings have bulk create support. No other entity supports bulk operations. The `crud.js` endpoint provides a generic bulk executor but requires manual JSON payload crafting.

---

## Rate Limiting

### Current Implementation

```javascript
// backend/src/server.js
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 200,                    // 200 requests per window
  message: { error: "Too many requests, please try again later." }
}))

// Stricter for auth routes
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,  // 20 login attempts per 15 minutes
}))
```

**Assessment:** Rate limiting is implemented at two levels: global (200/15min) and auth-specific (20/15min). No per-endpoint rate limiting, no rate limiting by user role or API key scope.

---

## Security

### Implemented

| Measure | Status | Detail |
|---------|--------|--------|
| Helmet.js (security headers) | ✅ | CSP, X-Frame-Options, X-Content-Type-Options, etc. |
| CORS | ✅ | Origin: localhost:7400, credentials: true |
| JWT Authentication | ✅ | `authenticate` middleware on all routes |
| Rate Limiting | ✅ | Global 200/15min, Auth 20/15min |
| Error Handler | ✅ | Centralized, no stack traces in production |
| Password Validation | ✅ | `validatePassword()` in security.js |
| Session Validation | ✅ | `validateSession()` — expires stale sessions |
| RBAC Middleware | ⚠️ | `requireRole()`/`requirePermission()` exist but UNUSED |
| Audit Logging | ⚠️ | `auditLog()`/`auditMiddleware()` exist but UNUSED for business ops |

### Missing

| Measure | Impact | Priority |
|---------|--------|----------|
| `requireRole()` not applied to routes | Any user can access any endpoint | 🔴 |
| No Zod validation on 6 route files | Invalid data can reach database | 🔴 |
| No audit for business operations | No forensic trail for any mutation | 🔴 |
| JWT refresh tokens | Sessions cannot be extended | 🟡 |
| No API key scope enforcement | API keys have unlimited access | 🟡 |
| No login attempt tracking | Brute force not prevented beyond rate limit | 🟡 |
| No input sanitization | XSS in stored data possible | 🟡 |
| Helmet CSP allows unsafe-inline | Required for Next.js HMR in dev | ⚠️ Acceptable for dev |

---

## Summary

| Dimension | Score | Key Issue |
|-----------|:-----:|-----------|
| **Routes** | 75/100 | 15 route files, well-organized; routes act as controllers (antipattern) |
| **Controllers** | 30/100 | No separation — route IS controller; testing difficult |
| **Validation** | 67/100 | Zod on 10/15 routes; 5 routes have NO input validation |
| **Permissions** | 20/100 | RBAC middleware exists but NEVER applied to routes |
| **Audit** | 10/100 | Infrastructure exists; NEVER called for business operations |
| **Logging** | 15/100 | No structured logging; console.error only |
| **Errors** | 70/100 | Consistent try/catch/next(errorHandler) pattern |
| **Transactions** | 10/100 | Only used in payments route; all other mutations are unguarded |
| **Pagination** | 73/100 | 11/15 routes; offset-based (degrades at high offsets) |
| **Filtering** | 40/100 | Limited to text search + status filters |
| **Sorting** | 60/100 | 11/15 routes; no sort field allowlist (security risk) |
| **Exports** | 5/100 | Infrastructure exists; NO export endpoint wired |
| **Imports** | 5/100 | Infrastructure exists; NO import endpoint wired |
| **Bulk Actions** | 10/100 | Only readings have bulk create |
| **Rate Limiting** | 60/100 | Global + auth; no per-endpoint or per-user limits |
| **Security** | 55/100 | Helmet + JWT + rate limit; RBAC and audit unwired; 6 routes unvalidated |

**Overall Backend Score:** 37/100 (37%)

### Priority Actions

1. **🔴 Wire `auditLog()` to ALL route handlers** — zero audit trail for business ops (5 minutes of work, massive impact)
2. **🔴 Add Zod validation to 6 unprotected route files** — meters, readings, invoices, payments, security, monitor
3. **🔴 Apply `requireRole()` to admin routes** — RBAC exists, just needs wiring
4. **🟡 Extract service layer** — separate business logic from route handlers
5. **🟡 Add `archivedAt` filtering** — soft delete columns exist but routes don't filter
6. **🟡 Add export endpoints** — Customer CSV, Meter CSV, Invoice CSV, Reading CSV
7. **🟡 Add import endpoints** — Customer CSV, Meter CSV, Reading CSV
8. **🟡 Add transactions** — wrap muti-step operations in `prisma.$transaction()`
9. **🟡 Add structured logging** — pino or winston with correlation IDs
10. **🟢 Add bulk update/delete endpoints** — for all core entities
11. **🟢 Implement cursor-based pagination** — for Reading and AuditEntry queries
12. **🟢 Add sort field allowlist** — prevent arbitrary field sorting
