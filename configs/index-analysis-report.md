# MeterVerse — PostgreSQL Index Analysis

**Generated**: 2026-07-25
**Analysis**: 61 models, 86 @@index declarations

## Summary

| Metric | Count |
|--------|-------|
| Total models | 61 |
| Models with indexes | 38 |
| Models with zero indexes | 22 |
| Critical missing indexes | 2 (Customer table) |
| High-priority missing | 5 |
| Medium-priority missing | 4 |
| Duplicate/redundant | 0 |

## Top 5 Missing Indexes

### #1: Customer (CRITICAL — zero indexes currently)
```sql
CREATE INDEX idx_customer_archived_status ON "Customer" ("archivedAt", "status");
CREATE INDEX idx_customer_archived_created ON "Customer" ("archivedAt", "createdAt" DESC);
```

### #2: Reading review queue
```sql
CREATE INDEX idx_reading_review_queue ON "Reading" ("status", "archivedAt", "timestamp" DESC) WHERE "archivedAt" IS NULL;
```

### #3: Invoice issued-at
```sql
CREATE INDEX idx_invoice_archived_issued ON "Invoice" ("archivedAt", "issuedAt" DESC);
```

### #4: MeterAssignment active check
```sql
CREATE INDEX idx_meter_assignment_meter_status ON "MeterAssignment" ("meterId", "status") WHERE "status" = 'active';
```

### #5: Reading duplicate detection
```sql
CREATE INDEX idx_reading_meter_timestamp_source ON "Reading" ("meterId", "timestamp", "source");
```
