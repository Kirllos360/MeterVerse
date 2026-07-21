# Enterprise Entity Blueprint

**Date:** 2026-07-21  
**Phase:** 40 — Enterprise Architecture Validation  
**Purpose:** One reusable blueprint for ALL business entities (Customer, Meter, Invoice, Payment, Contract, etc.)  

---

## Blueprint Architecture

Every business entity in MeterVerse follows this standard structure. This blueprint applies to Customer, Meter, Invoice, Payment, Reading, Contract, Tariff, BillCycle, Organization, Project, and all future entities.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENTITY BLUEPRINT                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Admin   │ │  User    │ │Workspace │ │   API    │           │
│  │  Page    │ │  Page    │ │  App     │ │  Routes  │           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       │             │            │             │                 │
│  ┌────▼─────────────▼────────────▼─────────────▼──────────────┐ │
│  │                  GenericAdminPage                           │ │
│  │  (config-driven: columns, fields, stats, actions, tabs)     │ │
│  └──────────────────────────┬───────────────────────────────┘ │
│                              │                                  │
│  ┌──────────────────────────▼───────────────────────────────┐  │
│  │                   Entity Detail Page                      │  │
│  │  Tabs: Overview | Related | Timeline | Docs | Audit       │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│                              │                                  │
│  ┌──────────────────────────▼───────────────────────────────┐  │
│  │  Custom Components (charts, maps, specific operations)    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Blueprint Sections

### 1. Data Layer (Prisma Model)
```prisma
model Entity {
  id         String   @id @default(uuid())
  status     String   @default("active")
  archivedAt DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  // Entity-specific fields
  // Relations to other entities
  // Indexes on status, FK, createdAt
}
```

**Standards:**
- UUID primary keys (v7 for time-ordering on hot tables)
- `archivedAt` for soft delete (filtered in all queries)
- `status` string field (CHECK constraint in future)
- `createdAt` + `updatedAt` on every model
- Indexes: FK, status, createdAt, composite (status+createdAt)

### 2. Backend API Layer
```
GET    /api/entities         → List (paginated, searchable, filterable, sortable)
GET    /api/entities/:id     → Detail (includes relations)
POST   /api/entities         → Create (Zod validated)
PUT    /api/entities/:id     → Update (partial Zod)
DELETE /api/entities/:id     → Soft delete (sets archivedAt)
POST   /api/entities/bulk    → Bulk operations
GET    /api/entities/export  → CSV/Excel export
POST   /api/entities/import  → CSV/Excel import
GET    /api/entities/stats   → KPI aggregation
POST   /api/entities/:id/status → Status change with workflow validation
```

**Standards:**
- Zod validation on ALL routes
- `authenticate` + `requireRole` middleware on ALL routes
- `auditLog()` on ALL mutating operations
- Consistent response envelope: `{ entity(s): [], total, page, limit }`
- Pagination: offset-based (default), cursor-based for large datasets

### 3. BFF Proxy Layer
```typescript
// /api/meterverse/entities/route.ts
export async function GET() {
  if (backendAvailable) return proxyToBackend()
  return mockData()  // Development fallback
}
```

### 4. Frontend Admin Page (GenericAdminPage)
```typescript
pageConfigs.entityName = {
  id: "entity-name",
  title: "Entity Name",
  description: "Manage entities",
  apiEndpoint: "/api/meterverse/entities",
  transform: (d) => d.entities?.map(e => ({ id: e.id, ... })),
  columns: [/* config-driven columns */],
  fields: [/* config-driven form fields */],
  statsCards: [/* KPI cards */],
}
```

### 5. Frontend Detail Page
```typescript
// /dashboard/entities/[id]/page.tsx
// Tabs: Overview | Related | Timeline | Documents | Audit
export default function EntityDetailPage({ params }) {
  // Fetch entity with relations
  // Render tabbed interface
  // Handle loading, error, empty states
}
```

### 6. Audit & History
```typescript
// Every mutation calls auditLog()
auditLog(req, "entity.created", { entityId, ...changes })

// History tracked via EntityHistory model
model EntityHistory {
  id, entityType, entityId, field, oldValue, newValue, changedBy, changedAt
}
```

### 7. Permissions
```typescript
// Permission seeds
permissions: [
  "entities:create", "entities:read", "entities:update",
  "entities:delete", "entities:export", "entities:import"
]

// Route protection
router.use(authenticate)
router.get("/", requireRole("admin", "operator"), handler)
router.post("/", requirePermission("entities:create"), handler)
```

### 8. Notifications
```typescript
// Event-bound notifications
events.on("entity.created", sendNotification)
events.on("entity.statusChanged", sendNotification)
```

### 9. KPI Definitions
```typescript
kpiDefinitions: [
  { name: "Total Entities", query: "count where archivedAt is null" },
  { name: "Active", query: "count where status = active" },
]
```

---

## Entity-Specific Configurations

### Customer
```
columns: name (avatar), email, phone, status, area, createdAt
fields: name*, email*, phone, area, status
stats: Total, Active, Inactive, Maintenance
relations: meters[], invoices[], contracts[]
detail tabs: Overview | Meters | Invoices | Contracts | Timeline | Documents
```

### Meter
```
columns: serial (avatar), type, status, area, customer, lastReading, createdAt
fields: serial*, type*, area, customerId, status
stats: Total, Active, In Maintenance, Retired
relations: readings[], assignments[], events[]
detail tabs: Overview | Readings | Assignments | Events | Timeline
```

### Invoice
```
columns: number, customer (avatar), amount, status, dueDate, paidAt
fields: customerId*, amount*, dueDate, status
stats: Total, Paid, Overdue, Pending
relations: items[], payments[], customer
detail tabs: Overview | Line Items | Payments | Timeline | PDF
```

### Payment
```
columns: reference, customer (avatar), amount, method, status, paidAt
fields: customerId*, amount*, method*, status
stats: Total, Completed, Failed, Refunded
relations: invoice, allocations
detail tabs: Overview | Allocation | Receipt | Timeline
```

### Reading
```
columns: meter (avatar), value, unit, status, timestamp
fields: meterId*, value*, unit, timestamp, status
stats: Total, Valid, Anomalous, Estimated
relations: meter, validation
detail tabs: Overview | Validation | Correction History | Consumption
```

---

## Reusable Components

| Component | Entity | Status | Reusable? |
|-----------|--------|--------|:---------:|
| GenericAdminPage | All entities | ✅ Complete | ✅ Yes — config-driven |
| AlertModal | All entities | ✅ Complete | ✅ Yes |
| Sheet (form) | All entities | ⚠️ No submit handler | ✅ Yes — needs wiring |
| Toast (sonner) | All entities | ✅ Available | ✅ Yes — needs wiring |
| EntityToolbar | None | ❌ Missing | 🏗️ Needs creation |
| EntityBreadcrumb | None | ❌ Missing | 🏗️ Needs creation |
| EntityTimeline | None | ❌ Missing | 🏗️ Needs creation |
| EntityActivity | None | ❌ Missing | 🏗️ Needs creation |
| EntityRelations | None | ❌ Missing | 🏗️ Needs creation |
| EntityDocuments | None | ❌ Missing | 🏗️ Needs creation |
| EntityHistory | None | ❌ Missing | 🏗️ Needs creation |
| EntityStats | GenericAdminPage | ✅ Partial | ✅ Yes — stat cards |
| EntityStatusBadge | GenericAdminPage | ✅ Complete | ✅ Yes |
| EntitySearch | GenericAdminPage | ✅ Complete | ✅ Yes |

---

## Implementation Priority

| Component | Priority | Depends On | Estimated Effort |
|-----------|:--------:|------------|:-----------------:|
| Sheet submit handler | 🔴 | None | 2 hours |
| Toast notification | 🔴 | Sonner (installed) | 1 hour |
| Entity detail page template | 🔴 | GenericAdminPage | 4 hours |
| Customer detail page | 🔴 | Entity detail template | 4 hours |
| Meter detail page | 🔴 | Entity detail template | 3 hours |
| Invoice detail page | 🔴 | Entity detail template | 3 hours |
| EntityTimeline component | 🟡 | Entity detail template | 4 hours |
| EntityHistory component | 🟡 | Entity detail template | 2 hours |
| EntityToolbar component | 🟡 | None | 2 hours |
| EntityBreadcrumb component | 🟢 | None | 1 hour |
| EntityDocuments component | 🟢 | Storage service | 4 hours |
| EntityActivity component | 🟢 | Event Bus wiring | 3 hours |
