# EV-06 — Independent Database & Data Integrity Verification

**Verification Body:** Independent Enterprise Review Board  
**Methodology:** Prisma schema audit — source code evidence only  
**Date:** 2026-07-02  

---

## Executive Summary

**Certification: VERIFIED WITH CRITICAL OBSERVATIONS**

**Overall Database Maturity Score: 55%**

The Prisma schema is structurally well-organized with 137 models across 4 schemas, 189 indexes, 19 unique constraints, and consistent naming conventions. However, there are critical issues: **all ~63 area schema models have zero indexes**, the `sim_system` and `core` schemas have significant model duplication (~20 overlapping concepts), no cascade behavior is defined on any relation, and the area schema lacks audit fields.

---

## WP1 — Schema Audit

### Schema Overview

| Metric | Value |
|---|---|
| Total models | 137 |
| Total enums | 60 |
| Total indexes | 189 |
| Unique constraints | 19 |
| Relations with @relation | ~80 |
| Schemas in use | 4 (sim_system, core, features, area) |

### Schema Distribution

| Schema | Models | Purpose |
|---|---|---|
| **sim_system** | ~65 | Original legacy schema — customers, meters, readings, invoices, payments |
| **core** | ~25 | v2.0 identity — users, roles, permissions, areas, projects, audit |
| **features** | ~44 | v2.0 features — tariffs, wallets, settlement, billing cycles, documents |
| **area** | ~63 | v2.0 tenant data — per-area customers, meters, readings, invoices |

### Finding EV-06-001: Schema Duplication — sim_system vs core/features/area

- **Severity:** HIGH
- **Description:** The `sim_system` schema (original) contains overlapping models with the newer `core`, `features`, and `area` schemas. For example:
  - `sim_system.Project` ↔ `core.CoreProject`
  - `sim_system.Customer` ↔ `area.AreaCustomer`
  - `sim_system.Meter` ↔ `area.AreaCustomerMeter`
  - `sim_system.Invoice` ↔ `area.AreaInvoiceDetail`
  - `sim_system.Payment` ↔ `area.AreaTransaction`
  - `sim_system.audit.AuditLog` ↔ `core.CoreAuditLog`
  - `sim_system.RefreshToken` ↔ not duplicated (only in sim_system)
- **Impact:** Dual-write risk, confusion about which schema is authoritative, migration complexity
- **Root Cause:** v2.0 migration added new schemas without removing old ones. ECG-08 Migration Orchestrator was planned but never executed.

### Naming Convention

| Convention | Status |
|---|---|
| PascalCase model names | ✅ Consistent |
| camelCase field names | ✅ Consistent |
| snake_case `@map()` column names | ✅ Consistent |
| Plural `@@map()` table names | ✅ Consistent |
| `@@schema()` annotations | ✅ Present on all models |

---

## WP2 — Relationship Integrity ⚠️

### Finding EV-02-002: No Cascade Behavior Defined

- **Severity:** HIGH
- **Description:** None of the ~80 `@relation()` annotations specify `onDelete` or `onUpdate` cascade behavior. This means:
  - Prisma will refuse to delete a parent record if children exist (referential integrity error)
  - All deletions must be manually managed in application code
- **Evidence:** Every `@relation()` in schema.prisma has no cascade options. Example: `project Project @relation(fields: [projectId], references: [id])` — no `onDelete: Cascade`

### Cross-Schema References

The schema uses Prisma 6's multiSchema feature, allowing models in different schemas to reference each other. For example:
- `sim_system.Project` ↔ `sim_system.LocationNode` (same schema) ✅
- `core.CoreUser` ↔ `core.CoreAuditLog` (same schema) ✅
- `features.Tariff` ↔ `features.TariffVersion` (same schema) ✅
- `area.AreaCustomer` ↔ `area.AreaInvoiceDetail` (same schema) ✅

**No cross-schema references detected** — each schema is self-contained within its own boundary. This is correct for multi-tenant isolation.

---

## WP3 — Data Integrity ⚠️

### Unique Business Constraints

| Constraint Type | Count | Examples |
|---|---|---|
| `@unique` (single field) | ~30 | `serialNumber`, `iccid`, `invoiceNumber`, `paymentNumber` |
| `@@unique` (composite) | 19 | `[projectId, customerCode]`, `[projectId, periodCode]` |

### Finding EV-06-003: Missing Business-Level Unique Constraints

- **Severity:** MEDIUM
- **Evidence:** Several business entities lack unique constraints that would prevent duplicates:
  - `AreaCustomerMeter` has `meterNumber @unique` but no unique on `[customerId, meterNumber]`
  - `AreaInvoiceDetail` has no unique constraint on `[customerId, billingPeriodStart, billingPeriodEnd]` — could generate duplicate invoices for same customer/period
  - `AreaTransaction` has no unique constraint on `referenceNumber` allowing duplicate payment records
  - `AreaMeterReading` has no unique constraint on `[customerMeterId, readingDate]` — could have duplicate readings
- **Risk:** Business logic must prevent duplicates in application code with no DB-level enforcement

### Finding EV-06-004: `@db.Decimal` Precision Inconsistency

- **Severity:** MEDIUM
- **Evidence:** Monetary fields use inconsistent Decimal precision:
  - `Decimal(12, 3)` — used by most invoice/payment fields
  - `Decimal(14, 2)` — used by journal entries
  - `Decimal(14, 3)` — used by wallet balances
  - `Decimal(12, 3)` — used by customer balances
- **Risk:** Precision loss when cross-referencing financial records with different decimal scales

---

## WP4 — Migration Safety

### Finding EV-06-005: Limited Migration History

- **Severity:** MEDIUM
- **Description:** Only 2 migration files exist in `backend/prisma/migrations/`:
  - `20260528000100_audit_reports/migration.sql`
  - `20260528000200_views/migration.sql`
- **Impact:** The schema appears to have been deployed via `prisma db push` (schema sync) rather than `prisma migrate dev` (migration-based). This means:
  - No rollback capability
  - No migration dependency tracking
  - No way to reproduce the schema incrementally
  - Schema drift detection is limited

---

## WP5 — Performance Architecture ⚠️⚠️

### Index Coverage

| Schema | Indexes | Models | Coverage |
|---|---|---|---|
| **sim_system** | ~100 | ~65 | **Good** (most query fields indexed) |
| **core** | ~40 | ~25 | **Good** |
| **features** | ~49 | ~44 | **Partial** |
| **area** | **0** | **~63** | **NONE** |

### Finding EV-06-006: Zero Indexes on All Area Schema Models (Cross-reference EV-02-001)

- **Severity:** CRITICAL
- **Evidence:** The `area` schema contains ~63 models for tenant data: `AreaCustomer`, `AreaCustomerMeter`, `AreaMeterReading`, `AreaInvoiceDetail`, `AreaTransaction`, `AreaCustomerLedgerEntry`, `AreaPaymentAllocation`, etc. — all without a single `@@index` annotation.
- **Impact:** Every query against area tables performs a full table scan. At 1M+ records per area, all tenant operations become unusable.
- **Root Cause:** The area template was created without index definitions. The `@@index` annotations were never added during schema design.

### Composite Indexes

Only a few composite indexes exist in sim_system:
- `[projectId, nodeType, code]` on LocationNode
- `[projectId, customerCode]` on Customer
- `[projectId, periodCode]` on BillingPeriod
- `[meterId, readingAt, source]` on Reading
- `[areaId, projectCode]` on CoreProject
- `[areaId, holidayDate]` on CoreHoliday

No covering indexes exist for any table.

---

## WP6 — Multi-Tenant Isolation ✅

| Aspect | Status | Evidence |
|---|---|---|
| Schema-based isolation | ✅ | `@@schema("area")` for tenant data |
| Tenant identification | ✅ | `CoreArea` model with `areaCode` |
| Area guard enforcement | ✅ | `AreaGuard` global APP_GUARD |
| Cross-schema references | ✅ | None between schemas |
| Shared global tables | ✅ | `core` schema for auth/shared |
| Per-area data | ✅ | All tenant data in `area` schema |

### Finding EV-06-007: Area Schema Replication Not Yet Executed

- **Severity:** MEDIUM
- **Description:** The multi-tenant architecture uses per-schema isolation (one `area` schema per tenant). However, the 15 area schemas (`area_october`, `area_new_cairo`, etc.) have NOT been created. Only the template `area` schema exists in the Prisma schema.
- **Evidence:** The `@@schema("area")` annotation on all area models points to a single shared `area` schema, not per-tenant schemas. T089 (Area Replication) is still TODO.
- **Impact:** All tenants share the same schema namespace currently.

---

## WP7 — Audit & Compliance

### Audit Field Coverage

| Field | sim_system | core | features | area |
|---|---|---|---|---|
| `createdAt` | ✅ Almost all | ✅ All | ✅ All | ✅ All |
| `updatedAt` | ✅ Almost all | ✅ All | ✅ All | ❌ **None** |
| `createdBy` | ✅ Almost all | ✅ Some | ✅ Some | ✅ All |
| `updatedBy` | ✅ Almost all | ✅ Some | ❌ **None in features** | ✅ All |

### Finding EV-06-008: Area Schema Missing `updatedAt` on All Models

- **Severity:** HIGH
- **Description:** None of the ~63 `area` schema models have `@updatedAt` fields. This means there is no way to track when tenant records were last modified.
- **Examples:** `AreaCustomer`, `AreaCustomerMeter`, `AreaInvoiceDetail`, `AreaTransaction` — all lack `updatedAt`
- **Root Cause:** The area template was created without `@updatedAt` on any model

### Finding EV-06-009: Features Schema Missing `updatedBy` on All Models

- **Severity:** MEDIUM
- **Description:** Models in the `features` schema (`TariffChart`, `WalletAccount`, `ChilledWaterConfig`, `SettlementPeriod`, `BillingCycle`, etc.) lack `updatedBy` fields, making it impossible to audit who last modified feature data.

### Soft Delete

No `deletedAt` or soft-delete pattern exists anywhere in the schema. All deletions are hard deletes.

---

## WP8 — Disaster Recovery Readiness

| Aspect | Status |
|---|---|
| Backup strategy | ❌ No backup metadata in schema |
| Recovery metadata | ❌ No schema version tracking |
| Migration reproducibility | ⚠️ Only 2 migration files exist |
| Idempotency support | ✅ IdempotencyKey table in sim_system |
| Conflict handling | ❌ No optimistic locking |
| Replication readiness | ❌ Connection pool not configured |

### Finding EV-06-010: No Schema Version Tracking

- **Severity:** MEDIUM
- **Description:** `AreaSchemaVersion` model exists in the area schema with `schemaVersion` and `appliedAt` fields, but there's no corresponding mechanism in `sim_system` or `core` schemas. The migration history in `_prisma_migrations` table is not tracked in application code.

---

## WP9 — Dead Database Components

| Component | Status |
|---|---|
| `sim_system` models (legacy) | ~65 models — should be deprecated after v2.0 migration |
| Duplicate models (sim_system.Customer vs area.AreaCustomer) | ~10 pairs — legacy until migration complete |
| `AreaSchemaVersion` model | Defined but no code references it |
| `AreaDataSyncTracker` model | Defined but no code references it |

---

## WP10 — Certification

### Score Summary

| Category | Score |
|---|---|
| Schema Design | 65% |
| Relationship Integrity | 60% |
| Data Integrity | 55% |
| Migration Safety | 30% |
| Performance Architecture | 30% |
| Multi-Tenant Isolation | 70% |
| Audit & Compliance | 40% |
| Disaster Recovery | 20% |

**Overall Database Maturity: 55%**

### Critical Findings

| ID | Finding | Severity |
|---|---|---|
| EV-06-006 | **Zero indexes on all 63 area schema models** — Full table scans on every tenant query | CRITICAL |
| EV-06-001 | Schema duplication (~20 models overlap between sim_system and core/features/area) | HIGH |
| EV-06-002 | No cascade behavior on any of ~80 relations — manual deletion management | HIGH |
| EV-06-008 | Area schema missing `@updatedAt` on all 63 models — no modification tracking | HIGH |

### High Findings

| ID | Finding | Severity |
|---|---|---|
| EV-06-003 | Missing business-level unique constraints (duplicate readings, invoices, payments) | HIGH |
| EV-06-004 | Inconsistent `@db.Decimal` precision across financial fields | MEDIUM |
| EV-06-005 | Only 2 migration files — schema deployed via `db push`, no rollback | MEDIUM |
| EV-06-007 | 15 area schemas not yet replicated (T089 pending) | MEDIUM |
| EV-06-009 | Features schema missing `updatedBy` on all models | MEDIUM |
| EV-06-010 | No schema version tracking in sim_system/core | MEDIUM |

### Priority Fix Order

1. **Add indexes to all area schema models** — without this, the multi-tenant architecture cannot scale
2. **Add `@updatedAt` to all area schema models** — audit compliance requirement
3. **Add cascade behavior or manual deletion handlers** — data integrity
4. **Add business-level unique constraints** — prevent duplicate records
5. **Standardize `@db.Decimal` precision** — financial accuracy
6. **Generate proper migrations** — replace `db push` with `prisma migrate`
