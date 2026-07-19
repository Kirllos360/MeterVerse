# Database Completion Audit

**Date:** 2026-07-19  
**Engine:** PostgreSQL 16 via Prisma ORM  

---

## Schema Overview

| Metric | Value |
|--------|-------|
| Models | 6 |
| Total fields | 47 |
| Enums | 0 (all status fields are strings) |
| Indexes | 2 (id PK, serial unique, email unique, number unique) |
| Foreign Keys | 3 (meter.customerId, reading.meterId, invoice.customerId, payment.invoiceId) |
| Relations | 6 (Customer→Meter, Customer→Invoice, Meter→Reading, Invoice→Payment) |

---

## Entity Completion Matrix

| Feature | User | Customer | Meter | Reading | Invoice | Payment |
|---------|------|----------|-------|---------|---------|---------|
| **Core** | | | | | | |
| Primary Key (UUID) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Created At | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Updated At | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Status field | ✅ (role) | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Relations** | | | | | | |
| Foreign Keys | ❌ | ❌ | ✅ (customer) | ✅ (meter) | ✅ (customer) | ✅ (invoice) |
| Cascade delete | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Indexes on FK | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Enterprise** | | | | | | |
| Soft delete | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Created by | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Updated by | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Deleted by | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Deleted at | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Tenant ID | ✅ (implicit) | ❌ | ❌ | ❌ | ❌ | ❌ |
| Versioning | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Audit history | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Constraints** | | | | | | |
| Unique constraints | email | ❌ | serial | ❌ | number | ❌ |
| Required fields | 3/8 | 1/8 | 2/9 | 2/7 | 3/10 | 2/7 |
| Default values | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Field validation | none | none | none | none | none | none |

---

## Completion Score by Entity

| Entity | Score | Missing |
|--------|-------|---------|
| User | 55% | tenantId explicit, createdBy, updatedBy, soft delete |
| Customer | 40% | createdBy, updatedBy, soft delete, unique name+tenant, indexes |
| Meter | 45% | unique serial per tenant, installDate, model, FK indexes |
| Reading | 30% | updatedAt, validation fields, estimated flag, anomaly score |
| Invoice | 40% | items array, tax, discount, createdBy, dueDate calculation |
| Payment | 25% | reference, gateway fields, receipt, updatedAt, createdBy |

**Average:** 39%

---

## Missing Fields by Model

### User (currently 14 fields → needs 20)
```
+ avatar        String?        Profile photo URL
+ phone         String?        Contact number
+ status        String         active/suspended/disabled
+ lastLogin     DateTime?      Last authentication
+ createdBy     String?        Who created this user
+ updatedBy     String?        Who last updated
+ deletedAt     DateTime?      Soft delete timestamp
+ deletedBy     String?        Who deleted
```

### Customer (8 fields → needs 16)
```
+ code          String?        Customer code/number (unique)
+ groupId       String?        Customer group FK
+ contractId    String?        Current contract FK
+ notes         String?        Internal notes
+ tags          String[]       Tagging/labeling
+ createdBy     String?        Who created
+ updatedBy     String?        Who updated
+ deletedAt     DateTime?      Soft delete
+ deletedBy     String?        Who deleted
```

### Meter (9 fields → needs 20)
```
+ model         String?        Meter model number
+ firmware      String?        Firmware version
+ installDate   DateTime?      Installation date
+ lastReading   Float?         Last reading value
+ simCardId     String?        SIM card FK
+ gatewayId     String?        Gateway FK
+ zoneId        String?        Zone/area FK
+ createdBy     String?        Who created
+ updatedBy     String?        Who updated
+ deletedAt     DateTime?      Soft delete
+ deletedBy     String?        Who deleted
```

### Reading (7 fields → needs 15)
```
+ updatedAt     DateTime?      Missing entirely
+ validatedBy   String?        Who validated
+ validationDate DateTime?     When validated
+ estimated     Boolean        Is this an estimated reading
+ anomalyScore  Float?         Anomaly detection score
+ correctionId  String?        Correction FK
+ createdBy     String?        Who recorded
+ deletedAt     DateTime?      Soft delete
```

### Invoice (10 fields → needs 20)
```
+ items         JSON?          Line items array
+ taxAmount     Float          Tax amount
+ discountAmount Float         Discount amount
+ notes         String?        Invoice notes
+ pdfPath       String?        Generated PDF path
+ tariffId      String?        Tariff FK
+ billCycleId   String?        Bill cycle FK
+ createdBy     String?        Who created
+ updatedBy     String?        Who updated
+ deletedAt     DateTime?      Soft delete
```

### Payment (7 fields → needs 14)
```
+ reference     String?        Payment reference number
+ gatewayResponse JSON?        Payment gateway response
+ feeAmount     Float          Transaction fee
+ receiptPath   String?        Receipt PDF path
+ updatedAt     DateTime?      Missing entirely
+ createdBy     String?        Who recorded
+ deletedAt     DateTime?      Soft delete
```

---

## Missing Indexes

| Table | Column | Index Needed | Reason |
|-------|--------|-------------|--------|
| Customer | name | ✅ | Search performance |
| Customer | status | ✅ | Filter performance |
| Meter | customerId | 🔴 FK performance |
| Meter | status | ✅ | Filter performance |
| Meter | type | ✅ | Meter type queries |
| Reading | meterId | 🔴 FK performance |
| Reading | timestamp | ✅ | Time-range queries |
| Reading | status | ✅ | Validation queries |
| Invoice | customerId | 🔴 FK performance |
| Invoice | status | ✅ | Filter performance |
| Invoice | dueDate | ✅ | Aging reports |
| Payment | invoiceId | 🔴 FK performance |
| Payment | method | ✅ | Payment method reports |

---

## Enterprise Features

| Feature | Status | Notes |
|---------|--------|-------|
| Multi-tenant | ❌ | No tenant isolation — only `User.tenant` as string |
| Soft Delete | ❌ | No `deletedAt` on any model |
| Audit Trail | ❌ | No history tables or trigger-based audit |
| Versioning | ❌ | No version fields on any model |
| Created By | ❌ | No `createdBy` on any model |
| Updated By | ❌ | No `updatedBy` on any model |
| Deleted By | ❌ | No `deletedBy` on any model |
| Cascading deletes | ❌ | `onDelete: Cascade` not set on any relation |
| Field constraints | ⚠️ | Minimal — only Zod at API level, not schema-level |
| Enums | ❌ | Status fields are raw strings — risk of invalid values |

---

## Database Completion Score: 39%

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Core structure (PKs, dates) | 20% | 85% | 17 |
| Relations & FKs | 20% | 40% | 8 |
| Enterprise fields (audit, soft-delete) | 30% | 5% | 1.5 |
| Indexes & performance | 15% | 10% | 1.5 |
| Constraints & validation | 15% | 20% | 3 |
| **Overall** | **100%** | | **39%** |

---

## Priority Fix Plan

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 1 | Add `deletedAt`, `createdBy`, `updatedBy` to all models | 2h | 🔴 |
| 2 | Add indexes on all foreign keys | 1h | 🔴 |
| 3 | Add `updatedAt` to Reading, Payment | 30min | 🟡 |
| 4 | Convert status fields to Prisma enums | 1h | 🟡 |
| 5 | Add `onDelete: Cascade` where appropriate | 30min | 🟡 |
| 6 | Add unique constraints (customer code, meter per tenant) | 1h | 🟡 |
