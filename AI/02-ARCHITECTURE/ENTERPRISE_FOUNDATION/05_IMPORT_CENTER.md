# Section 5 — Enterprise Import Center Architecture

---

## Supported Sources

| Source | Type | Entities | Trigger |
|--------|------|----------|---------|
| Excel Template | File upload (.xlsx) | Customers, Meters, Readings, Payments, SIM, Settlements | Manual |
| Symbiot Sync | API integration | Meters, Readings | Scheduled (daily) / Manual |
| Billing Connection | API | Invoices, Payments | Per-billing-cycle |
| REST API | POST /api/v1/* | All entities | Programmatic |
| Manual UI | Form entry | All entities | User action |
| Migration | Batch pipeline | All entities | One-time |

## Import Pipeline

```
Upload / Trigger
    ↓
File Validation (format, columns, types)
    ↓
Duplicate Detection (by unique keys)
    ↓
Dependency Validation (referenced entities exist)
    ↓
Business Validation (field rules)
    ↓
Preview (show rows: valid/warning/error counts)
    ↓
User Confirmation
    ↓
Execute Import (transactional per entity type)
    ├── Success rows → committed
    ├── Warning rows → committed with warnings logged
    └── Error rows → rejected with reason logged
    ↓
Audit Log (import record created)
    ↓
Notification (import complete + error count)
    ↓
Rollback Available (within 15 minutes)
```

## Required Features

| Feature | Implementation |
|---------|---------------|
| Template download | GET /upload/template/:entityType — generates Excel with headers + example row |
| Validation preview | Show parsed rows with status (valid/warning/error) before committing |
| Duplicate detection | By unique keys. Options: skip, update, create new. |
| Dependency check | Referenced entities must exist. Show missing references. |
| Partial success | Valid rows import. Invalid rows rejected. Summary shown. |
| Rollback | Reverse import within 15-minute window. |
| History | ImportRecord entity tracks every import. |
| Audit | Every row import is auditable. |
| Error report | Download error report with row-level details. |
| Template versioning | Templates versioned. Import validates against template version. |
