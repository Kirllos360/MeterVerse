# Phase 39 — Customer Domain Architecture Analysis

**Date:** 2026-07-21  
**Analyst:** Enterprise Architecture Review  
**Scope:** Complete Customer Domain — frontend, backend, database, UX, integrations  
**Current Phase:** 38 complete → Phase 39 planned

---

## Table of Contents

1. [Current Implementation](#1-current-implementation)
2. [Current Problems](#2-current-problems)
3. [Broken Workflows](#3-broken-workflows)
4. [Duplicate Logic](#4-duplicate-logic)
5. [Missing Entities & Relationships](#5-missing-entities--relationships)
6. [Missing APIs](#6-missing-apis)
7. [Missing UI](#7-missing-ui)
8. [Missing Business Rules](#8-missing-business-rules)
9. [Missing Validation](#9-missing-validation)
10. [Missing Permissions](#10-missing-permissions)
11. [Missing Audit Logging](#11-missing-audit-logging)
12. [Missing Notifications](#12-missing-notifications)
13. [Missing Reports](#13-missing-reports)
14. [Missing Automation](#14-missing-automation)
15. [Missing Integrations](#15-missing-integrations)
16. [Missing Indexes & Performance](#16-missing-indexes--performance)
17. [Missing Caching](#17-missing-caching)
18. [Missing Background Jobs](#18-missing-background-jobs)
19. [Missing Exports & Imports](#19-missing-exports--imports)
20. [Missing Offline Handling](#20-missing-offline-handling)
21. [Missing Mobile Considerations](#21-missing-mobile-considerations)
22. [Missing Accessibility](#22-missing-accessibility)
23. [Missing UX](#23-missing-ux)
24. [Missing Backend Functionality](#24-missing-backend-functionality)
25. [Missing Frontend Functionality](#25-missing-frontend-functionality)
26. [Missing Testing](#26-missing-testing)
27. [Missing Documentation](#27-missing-documentation)
28. [Sprint Recommendation](#28-sprint-recommendation)

---

## 1. Current Implementation

### Backend (`backend/src/routes/customers.js`)
- 68-line Express router with full CRUD
- `GET /` — paginated, searchable (name/email), sorted by createdAt
- `GET /:id` — includes meters + invoices via Prisma relations
- `POST /` — Zod validation (`customerSchema`)
- `PUT /:id` — partial Zod update
- `DELETE /:id` — hard delete (no soft delete)
- JWT auth middleware applied
- No audit logging, no business rules, no status workflow

### Database (`backend/prisma/schema.prisma` lines 442–455)
- Customer model: 8 fields (id, name, email, phone, address, status, area, notes)
- Relations: meters[], invoices[]
- Missing: 9+ enterprise fields (code, groupId, contractId, tags, createdBy, etc.)
- No soft delete, no versioning, no unique constraints beyond id

### Frontend Admin (`/admin/customers`)
- GenericAdminPage config-driven (page-configs.ts lines 15–43)
- Stats cards: Total, Active, Inactive, Maintenance
- Status tabs: All/Active/Inactive/Maintenance/Terminated
- Table: Name, Email, Phone, Status, Area, Created
- Actions: View, Edit, Activate, Deactivate, Maintain, Terminate, Delete
- Add/Edit Sheet with form fields
- Connected to `/api/admin/users` (reuses user endpoint — INCORRECT)

### Frontend Workspace (`workspace pages`)
- Mock data generated inline (no real API calls in production mode)
- No loading/error/empty states
- No detail view, no edit form, no delete confirmation

### Navigation
- Admin sidebar: has Customers link (between Roles and Meters)
- User sidebar (`nav-config.ts`): **NO Customers link exists**
- Dashboard pages: customers/ does not exist under `src/app/dashboard/`

---

## 2. Current Problems

### 🔴 Critical
| # | Problem | Location | Impact |
|---|---------|----------|--------|
| P1 | Admin customers page fetches from `/api/admin/users` instead of `/api/meterverse/customers` | `page-configs.ts:11` | Wrong data — shows users, not customers |
| P2 | No user-facing Customers page in dashboard sidebar | `nav-config.ts` | Users cannot access customer management |
| P3 | No customer detail view anywhere in the system | All layers | Cannot view customer meters, invoices, or history |
| P4 | Hard delete instead of soft delete | `backend/routes/customers.js:58` | Data loss risk — no recovery possible |
| P5 | No customer-meter assignment workflow | All layers | Meters cannot be operationally assigned to customers |

### 🟡 High
| # | Problem | Location | Impact |
|---|---------|----------|--------|
| P6 | No status workflow enforcement | Backend + Frontend | Status changes have no validation or side effects |
| P7 | No createdBy/updatedBy tracking | Prisma schema | No audit trail for who modified customers |
| P8 | No customer contract entity | All layers | Cannot track customer agreements |
| P9 | No customer groups/organizations | All layers | Cannot segment customers for billing/reporting |
| P10 | No customer tags or categories | All layers | Cannot filter or group by metadata |
| P11 | Admin edit sheet does not submit data | `GenericAdminPage.tsx:198` | Add/Edit buttons have no onSubmit handler |
| P12 | Status update swallows errors silently | `GenericAdminPage.tsx:79` | Failures invisible to user |

### 🟢 Medium
| # | Problem | Location | Impact |
|---|---------|----------|--------|
| P13 | No customer code/ID field | Prisma schema | No human-readable customer identifier |
| P14 | No unique constraint on name+area | Prisma schema | Duplicate customers possible |
| P15 | No cascading deletes on relations | Prisma schema | Orphan records on delete |
| P16 | Empty `/customer` directory placeholder | `src/app/customer/` | Confuses developers |
| P17 | 47 missing business capabilities across domain | `BUSINESS_CAPABILITIES.md` | Only 8/58 capabilities partially implemented |
| P18 | Average database completion 39% | `DATABASE_COMPLETION.md` | Foundational gaps in all 6 core models |

---

## 3. Broken Workflows

### Create Customer
```
Admin: Click "Add" → Sheet opens → Fill fields → Click "Save"
  → ❌ No API call (GenericAdminPage sheet has no onSubmit)
  → ❌ No validation feedback
  → ❌ No success/error notification
  → ❌ No data refresh

User workspace: Click "Add new" → Notification shown
  → ❌ No form of any kind
  → ❌ Notification only, no actual creation
```

### Edit Customer
```
Admin: Click "Edit" → Sheet opens with data → Modify → Click "Update"
  → ❌ No API call (same as Create)
  → ❌ Changes lost on sheet close

User workspace: Click "Edit" in dropdown
  → ❌ No edit form exists
```

### Delete Customer
```
Admin: Click "Delete" → Confirm dialog → Confirm
  → ✅ Local state removed
  → ✅ API called (DELETE /:id)
  → ❌ Hard delete — no recovery
  → ❌ No confirmation of success/failure

User workspace: Click "Delete"
  → ❌ Not wired to any action
```

### View Customer
```
Admin: Click "View" in dropdown
  → ❌ No action — case "view": break (empty handler)

User workspace: Click "View" in dropdown
  → ❌ No detail view exists
```

### Status Change
```
Admin: Click "Activate/Deactivate/Maintain/Terminate"
  → ✅ Optimistic update
  → ✅ PUT /:id with { status }
  → ❌ No validation (can activate already-active customer)
  → ❌ No side effects (no notifications, no audit, no workflow)
  → ❌ Empty catch block on error
```

---

## 4. Duplicate Logic

| Duplication | Locations | Impact |
|-------------|-----------|--------|
| Customer data key mapping | Admin page-configs.ts, workspace mock pages, backend routes | 3 different transform shapes for same entity |
| Status badge rendering | GenericAdminPage, workspace pages, admin pages | Redundant status → variant mapping |
| API fetch patterns | GenericAdminPage, workspace useEffect, admin EnterpriseTable | 3 different fetch patterns for same endpoints |
| Tab filter logic | GenericAdminPage, workspace pages, admin custom pages | Filter logic duplicated across components |
| Customer transform | `page-configs.ts` users config uses `/api/admin/users` for customers | WRONG — customers page showing user data |

---

## 5. Missing Entities & Relationships

### Prisma Models Missing for Customer Domain

| Entity | Why Needed | Priority |
|--------|-----------|----------|
| **CustomerGroup** | Organize customers into segments (residential, commercial, industrial) | 🔴 |
| **Contract** | Customer agreements with terms, start/end dates, tariff reference | 🔴 |
| **ContractTerm** | Line items within a contract (service type, rate, duration) | 🟡 |
| **MeterAssignment** | Join table: customer × meter with start/end dates | 🔴 |
| **MeterEvent** | Installation, removal, maintenance, replacement history | 🔴 |
| **CustomerDocument** | Uploaded contracts, IDs, photos | 🟡 |
| **CustomerNote** | Internal notes with author and timestamp | 🟡 |
| **CustomerTag** | Lightweight categorization | 🟡 |
| **CustomerTimeline** | Activity feed for each customer (created, meter assigned, invoice generated) | 🟡 |
| **Address** | Structured address (street, city, zone, coordinates) instead of string | 🟡 |

### Missing Fields on Customer

| Field | Type | Purpose |
|-------|------|---------|
| `code` | String (unique) | Human-readable customer number |
| `type` | String (residential/commercial/industrial) | Customer classification |
| `groupId` | String? | FK to CustomerGroup |
| `contractId` | String? | FK to current Contract |
| `tags` | String[] | Free-form categorization |
| `notes` | String | Internal comments |
| `createdBy` | String | Who created |
| `updatedBy` | String | Who last updated |
| `deletedAt` | DateTime? | Soft delete |
| `deletedBy` | String? | Who deleted |
| `avatar` | String? | Profile photo |
| `taxId` | String? | Tax registration number |
| `creditLimit` | Float? | Credit limit for billing |

---

## 6. Missing APIs

| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/api/customers/:id/meters` | GET | List meters assigned to customer | 🔴 |
| `/api/customers/:id/meters` | POST | Assign meter to customer | 🔴 |
| `/api/customers/:id/meters/:meterId` | DELETE | Unassign meter from customer | 🔴 |
| `/api/customers/:id/timeline` | GET | Customer activity timeline | 🟡 |
| `/api/customers/:id/documents` | GET/POST | Customer document management | 🟡 |
| `/api/customers/:id/invoices` | GET | Customer invoices with filters | 🟡 |
| `/api/customers/:id/payments` | GET | Customer payment history | 🟡 |
| `/api/customers/:id/readings` | GET | Readings across all customer meters | 🟡 |
| `/api/customers/bulk` | POST | Bulk create/update customers | 🟡 |
| `/api/customers/export` | GET | Export customers as CSV/Excel | 🟡 |
| `/api/customers/import` | POST | Import customers from CSV/Excel | 🟡 |
| `/api/customers/:id/status` | PUT | Status change with validation | 🔴 |
| `/api/customers/stats` | GET | Dashboard KPI data | 🟡 |

---

## 7. Missing UI

| UI Component | Location | Priority |
|-------------|----------|----------|
| **Customer Detail Page** | User-facing system (`/dashboard/customers/[id]`) | 🔴 |
| **Customer Detail Page** | Admin system (`/admin/customers/[id]`) | 🔴 |
| **Customer Meter Assignment UI** | Customer detail → Meters tab | 🔴 |
| **Customer Timeline** | Customer detail → Activity tab | 🟡 |
| **Customer Documents** | Customer detail → Documents tab | 🟡 |
| **Customer Reading History** | Customer detail → Readings tab | 🟡 |
| **Customer Invoice List** | Customer detail → Invoices tab | 🟡 |
| **Customer Payment History** | Customer detail → Payments tab | 🟡 |
| **Customer KPI Dashboard** | Customers list page → KPI cards | 🔴 |
| **Customer Map View** | Customers list → area-based visualization | 🟢 |
| **Customer Import Dialog** | Customers list → Import button | 🟡 |
| **Customer Export Dialog** | Customers list → Export button | 🟡 |
| **Customer Search (advanced)** | Customers list → multi-field search | 🟡 |
| **Bulk Action UI** | Customers list → select + bulk operation | 🟡 |

---

## 8. Missing Business Rules

| Rule | Description | Where | Priority |
|------|-------------|-------|----------|
| R1 | Customer code auto-generation on create | Backend | 🔴 |
| R2 | Status transition validation (cannot activate without contract) | Backend | 🔴 |
| R3 | Cannot delete customer with active meters | Backend | 🔴 |
| R4 | Cannot delete customer with outstanding balance | Backend | 🔴 |
| R5 | Status change audit entry | Backend | 🔴 |
| R6 | Customer welcome notification on create | Backend | 🟡 |
| R7 | Automatic meter suspension on customer deactivation | Backend | 🟡 |
| R8 | Credit limit enforcement during invoice generation | Backend | 🟡 |
| R9 | Duplicate customer detection (same email, name, area) | Backend | 🟡 |
| R10 | Customer churn prediction trigger (no activity in 90 days) | Backend | 🟢 |

---

## 9. Missing Validation

| Validation | Location | Priority |
|-----------|----------|----------|
| Email format validation | Frontend form + backend Zod | 🔴 |
| Phone format validation | Frontend form + backend Zod | 🔴 |
| Unique email check (duplicate detection) | Backend before create | 🔴 |
| Required field enforcement (name, email) | Frontend form | 🔴 |
| Status value must be in allowed set | Backend | 🔴 |
| Address field length limits | Both | 🟡 |
| Customer code format enforcement | Backend | 🟡 |
| File upload type/size limits for documents | Backend | 🟡 |

---

## 10. Missing Permissions

| Permission | Action | Priority |
|-----------|--------|----------|
| `customers:create` | Add new customers | 🔴 |
| `customers:read` | View customer list/details | 🔴 |
| `customers:update` | Edit customer details | 🔴 |
| `customers:delete` | Delete customers | 🔴 |
| `customers:assign-meter` | Assign/unassign meters | 🔴 |
| `customers:change-status` | Change customer status | 🔴 |
| `customers:export` | Export customer data | 🟡 |
| `customers:import` | Import customer data | 🟡 |
| `customers:manage-billing` | Modify billing details | 🟡 |

**Current state:** Admin users have unrestricted access. No RBAC granularity for customer operations.

---

## 11. Missing Audit Logging

| Action | Current | Required |
|--------|---------|----------|
| Customer created | ❌ | Log actor, timestamp, customer data |
| Customer updated | ❌ | Log actor, timestamp, changed fields (before/after) |
| Customer deleted | ❌ | Log actor, timestamp, full customer snapshot |
| Customer status change | ❌ | Log actor, timestamp, old/new status |
| Meter assigned | ❌ | Log actor, timestamp, meter ID |
| Meter unassigned | ❌ | Log actor, timestamp, meter ID |
| Customer viewed | ❌ | Log actor, timestamp (opt-in for sensitive data) |

`backend/src/middleware/security.js` has `auditLog()` middleware but it is **never called** from customer routes.

---

## 12. Missing Notifications

| Event | Channel | Priority |
|-------|---------|----------|
| Customer created (welcome) | Email, In-app | 🟡 |
| Customer status changed | Email, In-app | 🟡 |
| Meter assigned/unassigned | In-app | 🟡 |
| Invoice generated | Email, In-app | 🔴 |
| Payment received | Email, In-app | 🔴 |
| Payment overdue | Email, SMS, In-app | 🔴 |
| Customer deactivated | Email, In-app | 🟡 |
| Contract expiring | Email, In-app | 🟡 |

---

## 13. Missing Reports

| Report | Data Source | Priority |
|--------|------------|----------|
| Customer Growth (new customers/month) | Customer.createdAt | 🔴 |
| Customer Churn (deactivated/month) | Customer.updatedAt + status | 🔴 |
| Customer Segmentation (by type, area, group) | Customer.type, area, groupId | 🟡 |
| Customer Lifetime Value | Customer + Invoice + Payment | 🟡 |
| Customer Aging (inactive since) | Customer.status + updatedAt | 🟡 |
| Top Customers by Revenue | Customer → Invoice | 🟡 |
| Customer Meter Count Distribution | Customer → Meter count | 🟢 |
| Customer Contract Expiry Calendar | Customer → Contract | 🟢 |

---

## 14. Missing Automation

| Automation | Trigger | Action | Priority |
|-----------|---------|--------|----------|
| Auto-generate customer code | On customer create | `CUST-{YYYY}-{NNNNN}` | 🔴 |
| Auto-welcome email | On customer create | Send welcome notification | 🟡 |
| Auto-suspend meters | On customer deactivate | Update all assigned meters | 🟡 |
| Churn detection | Daily cron | Flag customers with 90d inactivity | 🟢 |
| Contract expiry alert | Daily cron | Notify before contract end | 🟢 |
| Overdue balance alert | Daily cron | Notify customer + operations | 🔴 |

---

## 15. Missing Integrations

| Integration | With | Purpose | Priority |
|-------------|------|---------|----------|
| Customer → ERP sync | External ERP | Sync customer data bidirectionally | 🟡 |
| Customer → CRM sync | External CRM | Two-way customer data sync | 🟡 |
| Customer → Billing | Invoice domain | Auto-create invoices per bill cycle | 🔴 |
| Customer → Collections | Payment domain | Trigger collection on overdue | 🟡 |
| Customer → Address validation | External API | Verify address format/validity | 🟢 |
| Customer → National ID verification | Gov API | Verify customer identity | 🟢 |

---

## 16. Missing Indexes & Performance

| Index | Table | Purpose | Priority |
|-------|-------|---------|----------|
| `idx_customer_status` | Customer | Fast status filtering (Active/Inactive) | 🔴 |
| `idx_customer_area` | Customer | Area-based grouping/reporting | 🔴 |
| `idx_customer_createdAt` | Customer | Date-range queries, growth reporting | 🟡 |
| `idx_customer_code` | Customer | Customer code lookup (unique) | 🔴 |
| `idx_customer_groupId` | Customer | Group-based aggregations | 🟡 |
| `idx_customer_type` | Customer | Customer type segmentation | 🟡 |
| Composite index on `(status, area)` | Customer | Common filter combination | 🟡 |
| Composite index on `(createdAt, status)` | Customer | Growth + cohort analysis | 🟡 |

**Current indexes:** Only PK on `id` (UUID). No performance indexes.

---

## 17. Missing Caching

| Cache | Strategy | Benefit |
|-------|----------|---------|
| Customer list (page 1) | In-memory, 60s TTL | Quick initial load |
| Customer stats (KPI counts) | In-memory, 300s TTL | Dashboard performance |
| Customer detail by ID | In-memory, 120s TTL | Detail view performance |
| Customer search results | In-memory, 30s TTL | Search response time |

**Current state:** No caching anywhere in the customer domain.

---

## 18. Missing Background Jobs

| Job | Schedule | Purpose | Priority |
|-----|----------|---------|----------|
| Customer KPI calculation | Every 15 min | Recalculate stats for KPI cards | 🟡 |
| Customer cohort rollup | Daily | Aggregate customer cohorts by signup month | 🟡 |
| Churn detection scan | Daily | Flag inactive customers | 🟡 |
| Contract expiry scan | Daily | Find expiring contracts | 🟡 |
| Customer data export | On demand | Generate large CSV exports | 🟡 |
| Data clean-up | Weekly | Remove soft-deleted records | 🟢 |

---

## 19. Missing Exports & Imports

### Export Missing
| Format | Data | Complexity |
|--------|------|-----------|
| CSV | Customer list with all fields | Low |
| Excel | Customer list with formatted columns | Medium |
| PDF | Customer detail report | Medium |
| JSON | Full customer data (API format) | Low |

### Import Missing
| Format | Supported | Complexity |
|--------|-----------|-----------|
| CSV import | Customer create/update | Medium |
| Excel import | Customer create/update | Medium |
| Validation report | Import errors summary | Medium |
| Duplicate handling | Skip/update/error options | Medium |

---

## 20. Missing Offline Handling

| Scenario | Current | Required |
|----------|---------|----------|
| API unavailable | Shows error/empty state | Graceful degradation with cached data |
| Create customer offline | Not possible | Queue creation, sync when online |
| Update customer offline | Not possible | Queue update, sync when online |
| View customer offline | Not possible | Local cache of recently viewed customers |
| Optimistic updates | Implemented (status changes) | Extend to all mutations |

---

## 21. Missing Mobile Considerations

| Feature | Current | Required |
|---------|---------|----------|
| Responsive customer table | GenericAdminPage has responsive layout | Touch-friendly row actions |
| Mobile customer detail | Not implemented | Stack layout for small screens |
| Swipe actions | Not implemented | Swipe to call, email, navigate |
| Quick actions widget | Not implemented | Home screen widget for recent customers |
| Push notifications | Not implemented | Customer alerts on mobile |

---

## 22. Missing Accessibility

| WCAG Criterion | Current State | Required |
|----------------|---------------|----------|
| 1.1.1 Non-text Content | Icons have no aria-labels | Add aria-labels to all action icons |
| 1.3.1 Info and Relationships | Table headers semantic | ✅ Already correct |
| 1.4.3 Contrast (Minimum) | May fail AA in some states | Audit and fix |
| 2.1.1 Keyboard | DropdownMenu uses modal=false, may trap focus | Verify keyboard navigation |
| 2.4.3 Focus Order | Sheet focus may not be trapped | Verify Sheet focus management |
| 2.4.7 Focus Visible | Focus rings present | ✅ Already correct |
| 3.3.1 Error Identification | Form errors not displayed | Add inline validation errors |
| 4.1.2 Name, Role, Value | Interactive elements need proper roles | Audit and fix |

---

## 23. Missing UX

| UX Gap | Description | Priority |
|--------|-------------|----------|
| No customer detail page | Cannot see full customer profile | 🔴 |
| No loading skeleton | GenericAdminPage has skeleton — workspace does not | 🔴 |
| No empty state guidance | "No records found" — no CTA to create first customer | 🟡 |
| No confirmation after save | Sheet closes, no success toast | 🟡 |
| No inline validation | Form fields don't validate until submit | 🟡 |
| No keyboard shortcuts | No ⌘K for search, no shortcuts for actions | 🟢 |
| No batch operations | Cannot select multiple customers for bulk action | 🟡 |
| No customer avatars | Initials-only, no photo support | 🟢 |
| No quick filters | No pre-set filters (New today, Overdue, etc.) | 🟡 |
| No column customization | Table columns are fixed | 🟡 |

---

## 24. Missing Backend Functionality

| Feature | Current | Status |
|---------|---------|--------|
| Soft delete | Hard delete | ❌ |
| Bulk operations | Not implemented | ❌ |
| Transactional updates | Not implemented | ❌ |
| Zod validation on all routes | Missing on meter/reading/invoice/payment | ⚠️ |
| Request logging (morgan) | Not configured | ❌ |
| OpenAPI/Swagger documentation | Not generated | ❌ |
| Rate limiting customer-specific | Global only | ❌ |
| Role-based authorization on endpoints | `authenticate` only, no `requireRole()` | ❌ |
| Audit logging middleware wired in | Exists but unused | ❌ |
| Customer-meter assignment endpoints | Not implemented | ❌ |
| Customer status workflow engine | Not implemented | ❌ |
| Webhook triggers on customer events | Not implemented | ❌ |

---

## 25. Missing Frontend Functionality

| Feature | Admin | User Workspace | Priority |
|---------|-------|---------------|----------|
| Customer detail view | ❌ | ❌ | 🔴 |
| Customer edit form (wired) | ❌ | ❌ | 🔴 |
| Customer create form (wired) | ❌ | ❌ | 🔴 |
| Customer delete (wired) | ✅ | ❌ | 🔴 |
| Meter assignment UI | ❌ | ❌ | 🔴 |
| Reading history view | ❌ | ❌ | 🟡 |
| Invoice history view | ❌ | ❌ | 🟡 |
| Payment history view | ❌ | ❌ | 🟡 |
| Activity timeline | ❌ | ❌ | 🟡 |
| KPI dashboard | ❌ | ❌ | 🔴 |
| Advanced search | ❌ | ❌ | 🟡 |
| Bulk operations | ❌ | ❌ | 🟡 |
| Import/Export | ❌ | ❌ | 🟡 |
| Map view | ❌ | ❌ | 🟢 |

---

## 26. Missing Testing

| Test Type | Current | Required |
|-----------|---------|----------|
| Backend unit tests | 0 | Jest + Supertest for all 13 customer endpoints |
| Backend integration tests | 0 | Database CRUD + workflow tests |
| Frontend component tests | 0 | React Testing Library for all customer components |
| Frontend E2E tests | 0 | Playwright for customer CRUD flow |
| API contract tests | 0 | Verify request/response shapes |
| Performance tests | 0 | Load test customer list with 10K+ records |
| Accessibility tests | 0 | Axe-core scan of customer pages |
| Visual regression tests | 0 | Screenshot comparison for customer pages |

---

## 27. Missing Documentation

| Document | Current | Required |
|----------|---------|----------|
| Customer API reference | Not generated | OpenAPI/Swagger for all customer endpoints |
| Customer workflows | Not documented | Create → Assign Meter → Read → Invoice → Pay |
| Customer business rules | Not documented | Status transitions, validation rules |
| Customer data model | `DOMAIN_MODEL.md` mentions Customer | Complete field-level reference |
| Customer integration guide | Not documented | How to integrate with external CRM/ERP |
| Customer admin guide | Not documented | How operations team manages customers |
| Customer troubleshooting | Not documented | Common issues and resolutions |

---

## 28. Sprint Recommendation

### Immediate Priority (Sprint 39a)
1. **Fix admin customers page data source** — change from `/api/admin/users` to `/api/meterverse/customers`
2. **Add user-facing Customers page** — create `/dashboard/customers/` with sidebar nav entry
3. **Add customer detail view** — shared component for admin + user pages
4. **Wire GenericAdminPage sheet forms** — add onSubmit handlers for create/update
5. **Add soft delete** — update backend route + schema

### Full Customer Domain (Sprint 39b)
6. **Enrich Customer model** — add 12+ missing fields
7. **Add meter assignment system** — join table + API + UI
8. **Add customer timeline** — activity feed component
9. **Add KPI dashboard** — customer growth, churn, segmentation
10. **Add permissions** — granular RBAC for customer operations

### Ecosystem (Sprint 40+)
11. **Customer contract management**
12. **Customer group management**
13. **Customer document management**
14. **Import/Export engine**
15. **Full audit trail**
16. **Notification automation**

---

*End of analysis. Ready for implementation roadmap.*
