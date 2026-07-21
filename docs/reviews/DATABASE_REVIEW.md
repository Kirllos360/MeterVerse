# Database Review

**Date:** 2026-07-21  
**Engine:** PostgreSQL 16 via Prisma ORM  
**Reviewer:** Lead Database Architect  
**Schema:** `backend/prisma/schema.prisma` — 1,024 lines, ~80 models  

---

## Entities

### Model Inventory

| Category | Models | Count |
|----------|--------|-------|
| **Core Business** | User, Role, Permission, PermissionOnRole, Customer, Meter, Reading, Invoice, Payment, Contract, ContractTerm, ContractAmendment | 12 |
| **Tariff & Billing** | Tariff, TariffRate, TariffTier, BillCycle, BillRun, BillRunHistory, ChargeRule, ChargeOverride, InvoiceItem, InvoiceTax, DiscountRule | 11 |
| **Meter Operations** | MeterAssignment, MeterAssignmentHistory, MeterEvent, ValidationRule, ValidationResult | 5 |
| **Collections** | CollectionCase, CollectionAction, PromiseToPay | 3 |
| **Payments** | PaymentGateway, PaymentTransaction, GatewayLog | 3 |
| **Customer Groups** | CustomerGroup, GroupMember, GroupPricing | 3 |
| **SLA** | SLA, SLABreach, SLAEscalation, GroupSLA | 4 |
| **Alerts** | AlertRule, Alert, EscalationPolicy, EscalationStep | 4 |
| **Workflow** | WorkflowState, WorkflowTransition | 2 |
| **Organization** | Organization, Project | 2 |
| **Admin** | SystemSetting, FeatureFlag, ApiKey, Session, AuditEntry, Webhook, NotificationTemplate | 7 |
| **Platform Services** | Backup, CacheEntry, QueueJob, ScheduledTask, StoredFile, License, BrandingConfig | 7 |
| **Notifications** | Notification, ActivityStream, EmailLog, SmsLog, PushNotification | 5 |
| **Import/Export** | ImportJob, ExportJob, ExportLog | 3 |
| **Documents** | OcrJob, PdfJob, ExcelJob | 3 |
| **Reporting** | ReportDefinition, KpiDefinition, KpiSnapshot, ScheduledReport | 4 |

**Total: ~80 models**

### Assessment

The schema is **far more complete than previously documented**. Earlier reports (DATABASE_COMPLETION.md, DOMAIN_MODEL.md) listed only 41 models and marked 28 as missing — but the actual schema has ~80 models including Contract, Tariff, BillCycle, MeterAssignment, CustomerGroup, CollectionCase, PaymentGateway, SLA, AlertRule, WorkflowState, and many more.

**Findings:**
- The Sprint 39 "Domain Completion" section (line 512) added Contract, Tariff, BillCycle, ChargeRule, MeterAssignment, ValidationRule, WorkflowState, CollectionCase, PaymentGateway, CustomerGroup, SLA, AlertRule, EscalationPolicy — these are all present ✅
- Missing: ServiceConnection, Area, Building, Unit, Consumption, CreditNote, LedgerEntry, Account
- Schema is well-structured and covers the core MeterVerse domain comprehensively

---

## Indexes

### Current Indexes (from Prisma schema)

| Model | Index | Type | Auto-generated? |
|-------|-------|------|:---------------:|
| User | `@id(uuid())` | Primary | ✅ |
| User | `email @unique` | Unique | ✅ |
| Role | `name @unique` | Unique | ✅ |
| Permission | `name @unique` | Unique | ✅ |
| PermissionOnRole | `@@id([roleId, permissionId])` | Composite PK | ✅ |
| Organization | `name @unique`, `slug @unique` | Unique | ✅ |
| SystemSetting | `key @unique` | Unique | ✅ |
| FeatureFlag | `key @unique` | Unique | ✅ |
| ApiKey | `key @unique` | Unique | ✅ |
| Session | `token @unique` | Unique | ✅ |
| NotificationTemplate | `key @unique` | Unique | ✅ |
| CacheEntry | `key @unique` | Unique | ✅ |
| License | `key @unique` | Unique | ✅ |
| BrandingConfig | `key @unique` | Unique | ✅ |
| Meter | `serial @unique` | Unique | ✅ |
| Invoice | `number @unique` | Unique | ✅ |
| Contract | `contractNumber @unique` | Unique | ✅ |
| Tariff | `name @unique`, `code @unique` | Unique | ✅ |
| BillCycle | `code @unique` | Unique | ✅ |
| ChargeRule | `code @unique` | Unique | ✅ |
| ValidationRule | `code @unique` | Unique | ✅ |
| CustomerGroup | `name @unique` | Unique | ✅ |

**Total explicit indexes:** 22 (all unique constraints)  
**Total auto-generated PK indexes:** ~80 (one per model, on `id` field)  

### Missing Performance Indexes

| Table | Column(s) | Query Pattern | Priority |
|-------|-----------|---------------|----------|
| **Customer** | `status` | Count active/inactive customers | 🔴 |
| **Customer** | `area` | Filter by area | 🔴 |
| **Customer** | `archivedAt` | Exclude soft-deleted | 🔴 |
| **Customer** | `createdAt` | Date range queries, growth charts | 🟡 |
| **Customer** | `status`, `area` | Composite: common filter combo | 🟡 |
| **Meter** | `customerId` | FK lookup: find meters by customer | 🔴 |
| **Meter** | `status` | Count active/inactive meters | 🔴 |
| **Meter** | `type` | Filter by meter type | 🟡 |
| **Meter** | `area` | Filter by area | 🟡 |
| **Meter** | `archivedAt` | Exclude soft-deleted | 🔴 |
| **Reading** | `meterId` | FK lookup: find readings by meter | 🔴 |
| **Reading** | `timestamp` | Date range queries | 🔴 |
| **Reading** | `status` | Filter by validation status | 🟡 |
| **Reading** | `meterId`, `timestamp` | Composite: readings for meter over time | 🔴 |
| **Invoice** | `customerId` | FK lookup: find invoices by customer | 🔴 |
| **Invoice** | `status` | Filter by status | 🔴 |
| **Invoice** | `dueDate` | Aging queries, overdue detection | 🟡 |
| **Invoice** | `customerId`, `status` | Composite: customer invoice status | 🟡 |
| **Payment** | `invoiceId` | FK lookup | 🔴 |
| **Payment** | `paidAt` | Date range | 🟡 |
| **Contract** | `customerId` | FK lookup | 🔴 |
| **Contract** | `endDate` | Expiry detection | 🟡 |
| **MeterAssignment** | `meterId`, `customerId` | FK lookups | 🔴 |
| **MeterEvent** | `meterId` | FK lookup | 🔴 |
| **AuditEntry** | `actorId` | Find actions by user | 🟡 |
| **AuditEntry** | `action`, `createdAt` | Audit trail queries | 🟡 |

**Total missing indexes:** 26  
**Total required indexes:** 48 (22 existing unique + 26 performance)  
**Coverage:** 22/48 = 46%

---

## Relations

### Relationship Completeness

| Model | FK Fields | Relations | Status |
|-------|-----------|-----------|--------|
| User | roleId | sessions[], apiKeys[], auditEntries[], roleRel | ✅ Complete |
| Customer | — | meters[], invoices[] | ✅ Complete |
| Meter | customerId | customer, readings[] | ✅ Complete |
| Reading | meterId | meter | ✅ Complete |
| Invoice | customerId | customer, payments[] | ✅ Complete |
| Payment | invoiceId | invoice | ✅ Complete |
| Contract | customerId | customer, contractTerms[], amendments[] | ✅ Complete |
| Tariff | — | rates[], tiers[] | ✅ Complete |
| BillCycle | — | billRuns[] | ✅ Complete |
| BillRun | billCycleId | billCycle, history[] | ✅ Complete |
| MeterAssignment | meterId, customerId, contractId | meter, customer, contract, history[] | ✅ Complete |
| InvoiceItem | invoiceId | invoice, taxes[], discounts[] | ✅ Complete |
| CollectionCase | customerId, invoiceId | customer, invoice, actions[], promises[] | ✅ Complete |
| PaymentTransaction | gatewayId, paymentId | gateway, payment, logs[] | ✅ Complete |
| CustomerGroup | — | members[], pricings[], slas[] | ✅ Complete |

### Relation Issues Found

| Issue | Models | Impact |
|-------|--------|--------|
| No cascade delete on Customer → Meter | Customer, Meter | Deleting a customer leaves orphan meters |
| No cascade delete on Customer → Invoice | Customer, Invoice | Deleting a customer leaves orphan invoices |
| No cascade delete on Invoice → Payment | Invoice, Payment | Deleting an invoice leaves orphan payments |
| No cascade delete on Meter → Reading | Meter, Reading | Deleting a meter leaves orphan readings |
| InvoiceItem has BOTH taxes[] AND discounts[] as separate arrays | InvoiceItem, InvoiceTax, DiscountRule | A discount should be on InvoiceItem, not the other way — DiscountRule references InvoiceItemId as optional, meaning a discount CAN exist without an invoice item |

### Missing Relations

| Source | Target | Type | Why Needed |
|--------|--------|------|------------|
| ServiceConnection | Customer, Meter, Tariff, Address | 1:M | Central entity (doesn't exist) |
| Consumption | Reading, TariffRate | 1:1 | Calculated consumption from reading delta |
| LedgerEntry | Invoice, Payment, Account | M:1 | Double-entry accounting |
| PaymentAllocation | Payment, Invoice | M:M | Split payments across invoices |

---

## Normalization

### Assessment

**Overall: Well-normalized to 3NF.** No obvious denormalization issues. All JSON fields (`config`, `payload`, `settings`, `filters`, `data`, `details`) are used for configuration blobs that genuinely don't need separate tables.

### JSON Fields Audit

| Model | JSON Field | Purpose | Acceptable? |
|-------|-----------|---------|:-----------:|
| Organization | `settings` `@default("{}")` | Flexible org settings | ✅ |
| QueueJob | `payload` `@default("{}")` | Job-specific data | ✅ |
| ScheduledTask | `config` `@default("{}")` | Task configuration | ✅ |
| ChargeRule | `formula` `String?` | Calculation formula (not JSON but string) | ✅ |
| ValidationRule | `condition` `String` | JSON expression | ✅ |
| PaymentGateway | `config` `@default("{}")` | Gateway-specific config | ✅ |
| Contract | `terms` `String?` | Contract terms as text | ⚠️ Should be structured if complex |
| Webhook | `events` `@default("[]")` | Array of event types | ⚠️ Should use join table for queryability |

**Finding:** `Webhook.events` stores a JSON array `"[\"customer.created\", \"invoice.paid\"]"`. This prevents querying by event type without JSON parsing. Should be a join table `WebhookEvent(webhookId, eventType)`.

---

## History

### Models with History Tracking

| Model | History Support | Mechanism |
|-------|----------------|-----------|
| MeterAssignment | ✅ | `MeterAssignmentHistory` table tracks field-level changes |
| BillRun | ✅ | `BillRunHistory` table tracks actions |
| Contract | ⚠️ Partial | `ContractAmendment` tracks amendments, not full history |

### Models WITHOUT History (majority)

- Customer: No history of field changes
- Meter: No history of status changes  
- Reading: No history of corrections
- Invoice: No history of status changes
- Payment: No history of allocation changes
- User: No history of role changes
- Permission: No history of changes

**Finding:** Only 2 models (MeterAssignment, BillRun) have proper history tracking. All other models lack change history.

### Recommendation

Implement generic history tracking via Prisma middleware:
```prisma
model EntityHistory {
  id         String   @id @default(uuid())
  entityType String   // "Customer", "Meter", etc.
  entityId   String
  field      String
  oldValue   String?
  newValue   String?
  changedBy  String?
  changedAt  DateTime @default(now())
  @@index([entityType, entityId])
}
```

---

## Soft Delete

### Current Soft Delete Coverage

| Model | Field | Status |
|-------|-------|--------|
| Customer | `archivedAt` DateTime? | ✅ Implemented |
| Meter | `archivedAt` DateTime? | ✅ Implemented |
| Reading | `archivedAt` DateTime? | ✅ Implemented |
| Invoice | `archivedAt` DateTime? | ✅ Implemented |
| Contract | `archivedAt` DateTime? | ✅ Implemented |
| Tariff | `archivedAt` DateTime? | ✅ Implemented |
| ALL OTHER MODELS | None | ❌ Missing |

**Coverage:** 6/80 models (7.5%) have soft delete.  
**All service models** (Backup, CacheEntry, QueueJob, etc.) lack soft delete.

### Soft Delete Pattern Issues

The current pattern uses `archivedAt` (DateTime?) but the routes do NOT filter by it:

```javascript
// backend/src/routes/customers.js — GET / (no archivedAt filter)
const customers = await prisma.customer.findMany({
  where: {},  // ❌ Should filter: archivedAt: null
  ...
})
```

**Finding:** Soft delete columns exist on 6 models but **none of the routes filter by them**. Soft delete is non-functional — archived records still appear in all queries. The DELETE routes still perform hard deletes:

```javascript
// backend/src/routes/customers.js — DELETE /:id
await prisma.customer.delete({ where: { id: req.params.id } })  // ❌ Hard delete
```

---

## Audit

### Current Audit State

| Component | Status |
|-----------|--------|
| `AuditEntry` model | ✅ Exists (11 fields) |
| `auditLog()` middleware | ✅ Exists in `backend/src/middleware/security.js` |
| Wired to routes | ❌ **Never called** from any route handler |
| Frontend audit hooks | ❌ `AuditHooks.ts` exists but never called |

### Audit Middleware (Unused)

The `auditLog()` middleware exists but is never imported or applied in any route file. Every Create, Update, Delete operation across all 80 models executes without any audit trail.

---

## Versioning

### Current State

| Entity | Versioning |
|--------|-----------|
| All models | ❌ No versioning |
| Contract | ⚠️ Partial: `ContractAmendment` tracks amendments but not full contract version history |
| Tariff | ❌ Rate changes overwrite previous values |
| Invoice | ❌ Adjustments modify in place |

**Finding:** No model has optimistic locking (`version` integer) or version history. Concurrent updates can silently overwrite each other. No audit trail of what changed.

---

## Performance

### Schema-Level Performance Issues

| Issue | Location | Impact |
|-------|----------|--------|
| No indexes on any FK column | All FK fields | JOIN queries do full table scans |
| No indexes on `status` columns | 40+ models with status field | Status filtering is O(n) |
| No indexes on `archivedAt` | 6 models with soft delete | Soft delete filtering is O(n) |
| No indexes on `createdAt` | All models | Date range queries are O(n) |
| JSON fields used for queryable data | Webhook.events | Cannot query by event type |
| String status fields instead of enums | All models | No DB-level validation, larger storage |
| UUID primary keys without sequential IDs | All models | Index fragmentation, poor cache locality |
| No partial indexes on active records | Customer (WHERE archivedAt IS NULL) | Soft-delete queries scan all records |

### Query Performance Estimates

| Query | Current | With Indexes |
|-------|---------|-------------|
| "Find customer by ID" | O(log n) via PK | Same |
| "Find customers by status" | O(n) full scan | O(log n) via index |
| "Find meters by customer" | O(n) full scan | O(log n) via FK index |
| "Find readings by meter, date range" | O(n) full scan | O(log n) via composite index |
| "Count active customers" | O(n) full scan | O(log n) via index-only scan |
| "Find overdue invoices" | O(n) full scan | O(log n) via status + dueDate index |

---

## Constraints

### Current Constraints

| Type | Count | Examples |
|------|-------|---------|
| Primary Keys (UUID) | ~80 | All models have `@id @default(uuid())` |
| Unique Constraints | 22 | email, serial, number, name, code, key, slug, token |
| Foreign Keys (implicit via relations) | ~30 | Model relations defined in Prisma schema |
| Check Constraints | 0 | ❌ No CHECK constraints on any field |
| Default Values | ~80 | All status fields have defaults |
| Required Fields | ~80 | All id, FK, and essential fields are non-optional |

### Missing Constraints

| Field | Missing Constraint | Impact |
|-------|--------------------|--------|
| All `status` fields | `CHECK status IN ('active','inactive',...)` | Invalid status values can be inserted |
| Reading.`value` | `CHECK value >= 0` | Negative readings possible |
| Invoice.`amount` | `CHECK amount > 0` | Negative invoices possible |
| Payment.`amount` | `CHECK amount > 0` | Negative payments possible |
| TariffRate.`rate` | `CHECK rate >= 0` | Negative rates possible |
| Customer.`email` | Format validation (handled by Zod) | Zod catches this ✅ |
| All numeric fields | Range constraints | No upper/lower bounds enforced |

**Finding:** Zero CHECK constraints exist in the database. All validation is delegated to Zod in the application layer. This means direct database access (SQL queries, admin tools) can insert invalid data.

### Naming Convention Issues

| Issue | Examples | Recommendation |
|-------|----------|---------------|
| Inconsistent relation field naming | `roleRel` vs just `role` | Use consistent field names |
| Abbreviated names | `SLA`, `SLABreach`, `GroupSLA` | OK for well-known acronyms |
| JSON field names | `config`, `payload`, `data`, `details` | Acceptable for flexible data |
| `archivedAt` vs `deletedAt` | Mixed naming | Use `deletedAt` consistently for soft delete |
| `sla` vs `slaId` relation | Mixed naming convention | Use consistent `{model}Id` for FK fields |

---

## Scalability

### Current Limitations

| Factor | Current | Enterprise Target | Gap |
|--------|---------|------------------|:---:|
| **Row count** | No constraints | 100M+ readings | Unlimited growth with no partitioning |
| **UUID PKs** | All models use UUID v4 | Sequential IDs for hot tables | Index fragmentation at scale |
| **JSON fields** | 10+ JSON blobs | Normalize if queryable | Webhook.events needs join table |
| **No partitioning** | No partition strategy | Partition Reading by year/month | Reading table will grow fastest |
| **No connection pooling** | Direct Prisma connections | pgBouncer or Prisma Accelerate | Connection exhaustion under load |
| **No read replicas** | Single PostgreSQL instance | Read replicas for reporting | All queries hit primary |
| **No archiving** | Soft delete but no archive strategy | Archive records older than N years | Historical data slows queries |
| **Index coverage** | 22 indexes | 48+ indexes needed | Missing 26 performance indexes |

### Growth Projections

| Entity | 1 Year (10K customers) | 5 Years (100K customers) | Concern |
|--------|----------------------|--------------------------|---------|
| Customer | 10,000 | 100,000 | Low |
| Meter | 15,000 | 150,000 | Low |
| Reading | 5,000,000 (daily × 365) | 50,000,000+ | 🔴 HIGH — needs partitioning |
| Invoice | 120,000 (monthly × 12) | 1,200,000+ | 🟡 Medium |
| Payment | 120,000 | 1,200,000+ | 🟡 Medium |
| AuditEntry | 500,000 | 5,000,000+ | 🟡 Medium |
| MeterEvent | 50,000 | 500,000 | 🟡 Medium |

### Recommendations for Scale

1. **Partition Reading table** by year/month immediately (preventive)
2. **Add all 26 missing indexes** before reaching 10K customers
3. **Replace UUIDs with sequential IDs** for hot tables (Reading, AuditEntry, MeterEvent) — or use UUID v7 (time-ordered)
4. **Implement Read Replicas** for reporting queries
5. **Add archiving strategy** for Readings older than 3 years
6. **Add connection pooling** via pgBouncer
7. **Implement cursor-based pagination** for Reading queries (offset pagination becomes slow at high offsets)

---

## Summary

| Dimension | Score | Key Issue |
|-----------|:-----:|-----------|
| **Entities** | 80/100 | 80 models cover most domains; ServiceConnection, Consumption, Ledger missing |
| **Indexes** | 46/100 | 22 unique indexes exist; 26 performance indexes missing |
| **Relations** | 70/100 | Well-defined but missing cascade deletes on critical paths |
| **Normalization** | 85/100 | Good 3NF; Webhook.events should be normalized |
| **History** | 15/100 | Only 2/80 models have change history |
| **Soft Delete** | 20/100 | 6 models have `archivedAt` but routes don't filter — non-functional |
| **Audit** | 5/100 | Model + middleware exist but are NEVER wired to any route |
| **Versioning** | 0/100 | No versioning on any model |
| **Performance** | 30/100 | No FK indexes, no composite indexes, no partial indexes |
| **Constraints** | 40/100 | Zero CHECK constraints; all validation in application layer |
| **Naming** | 70/100 | Inconsistent relation field naming; `archivedAt` vs `deletedAt` |
| **Scalability** | 25/100 | Reading table will grow to 50M+ records with no partitioning strategy |

**Overall Database Score:** 37/100 (37%)

### Priority Actions

1. **🔴 Wire `archivedAt` filtering** into all route queries — soft delete columns exist but are non-functional
2. **🔴 Add 26 missing indexes** — FK indexes on CustomerId, MeterId, InvoiceId; composite indexes on common query patterns
3. **🔴 Implement audit logging** — `auditLog()` middleware exists but is never called from any route
4. **🟡 Add cascade deletes** to Customer→Meter, Customer→Invoice, Invoice→Payment
5. **🟡 Normalize Webhook.events** — replace JSON array with join table
6. **🟡 Add partial indexes** on `archivedAt IS NULL` for soft-delete filtered queries
7. **🟡 Add CHECK constraints** for status fields and numeric range validation
8. **🟡 Plan Reading table partitioning** by year/month for 5M+ row scale
9. **🟢 Replace UUIDs with UUID v7** (time-ordered) for hot tables to reduce index fragmentation
10. **🟢 Add entity history tracking** via Prisma middleware for all core models
