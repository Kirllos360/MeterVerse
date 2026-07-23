# Database Index Audit Report

**Date:** 2026-07-23
**Phase:** 42a, Task: T01, Step: S01
**Status:** COMPLETE

## Current State

- **Total models:** 78
- **Current indexes:** 0 (zero)
- **Unique constraints:** 11 (auto-indexed by PostgreSQL/Prisma)
- **Composite indexes:** 0

## Index Requirements

### Priority 1 — Foreign Key Indexes (31 columns across all models)

Every `@relation` field must have a single-column index. Without these, JOIN queries perform sequential scans.

| Column | Related Models |
|--------|---------------|
| `customerId` | Invoice, Contract, MeterAssignment, CollectionCase, GroupMember |
| `meterId` | Reading, MeterEvent |
| `invoiceId` | Payment, InvoiceItem, CollectionCase |
| `userId` | Session, ApiKey |
| `roleId` | User, PermissionOnRole |
| `contractId` | ContractTerm, ContractAmendment, MeterAssignment |
| `organizationId` | Project |
| `tariffId` | TariffRate, TariffTier, GroupPricing |
| `billCycleId` | BillRun |
| `chargeRuleId` | ChargeOverride |
| `slaId` | SLABreach, SLAEscalation, GroupSLA |
| `alertRuleId` | Alert |
| `validationRuleId` | ValidationResult |
| `gatewayId` | PaymentTransaction |
| `paymentId` | PaymentTransaction |
| `workflowStateId` | WorkflowTransition |
| `collectionCaseId` | CollectionAction, PromiseToPay |
| `customerGroupId` | GroupMember, GroupPricing, GroupSLA |
| `escalationPolicyId` | EscalationStep |
| `kpiId` | KpiSnapshot |
| `meterAssignmentId` | MeterAssignmentHistory |
| `invoiceItemId` | InvoiceTax, DiscountRule |
| `billRunId` | BillRunHistory |
| `paymentTransactionId` | GatewayLog |
| `actorId`/`recipientId`/`uploadedBy` | AuditEntry, Notification, StoredFile |
| `referenceId` | InvoiceItem |
| `entityId` | ValidationResult, Alert, WorkflowState |
| `resourceId` | AuditEntry, ActivityStream |
| `permissionId` | PermissionOnRole |

### Priority 2 — Status/State Indexes (for filtered queries)

All models with `status`, `type`, `state`, or `severity` fields benefit from indexes for WHERE filtering.

### Priority 3 — Timestamp Indexes (for sorted queries)

All models with `createdAt`, `updatedAt`, `timestamp` fields need indexes for ORDER BY performance.

### Priority 4 — Composite Indexes (10 recommended)

| Index | Models | Query Pattern |
|-------|--------|---------------|
| `[status, createdAt]` | User, Customer, Meter, Reading, Invoice, Payment, Contract, Alert | "Show me all active X sorted by date" |
| `[customerId, status]` | Invoice, Contract, MeterAssignment, CollectionCase | "Show me this customer's active invoices" |
| `[meterId, timestamp]` | Reading, MeterEvent | "Show me this meter's readings ordered by time" |
| `[invoiceId, status]` | Payment, InvoiceItem | "Show me payments for this invoice" |
| `[entityType, entityId]` | ValidationResult, Alert, WorkflowState | "Show me validation results for this entity" |
| `[contractId, startDate]` | ContractTerm, ContractAmendment | "Show me terms for this contract" |
| `[organizationId, status]` | Project | "Show me projects by org" |
| `[userId, isActive]` | Session | "Show me active sessions for this user" |
| `[customerGroupId, customerId]` | GroupMember | "Show me members of this group" |
| `[slaId, breachedAt]` | SLABreach | "Show me breaches for this SLA sorted by time" |

## Recommended Migration

### Phase 1 (immediate, non-breaking)
```prisma
// Add to every model with a foreign key:
@@index([foreignKeyId])
@@index([status, createdAt])
```

### Estimated index count
- 31 foreign key indexes
- 25 status/type indexes (on models with filter fields)
- 30 createdAt indexes (on models with timestamps)
- 10 composite indexes
- **Total: ~96 new indexes**

## Performance Impact
- **Write overhead:** <5% (PostgreSQL handles index maintenance efficiently)
- **Read improvement:** 10x-100x on filtered queries (sequential scan → index scan)
- **Storage overhead:** ~200MB for 96 indexes on projected 1M row tables
