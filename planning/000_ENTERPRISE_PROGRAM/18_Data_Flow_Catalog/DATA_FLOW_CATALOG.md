# Data Flow Catalog

**Purpose:** How data moves through the system — from source to destination.

## Reading Data Flow
```
Meter → Reading API → Validation Engine → Database → Notification Engine → Billing Engine → Invoice → Payment
```

## Customer Data Flow
```
UI Form → API → Validation → Database → ActivityStream → Notification → Audit
```

## Invoice Data Flow
```
BillRun → Reading Aggregation → Tariff Application → Discount → Tax → Invoice → Customer → Payment
```

## Each Data Flow Documents
| Element | Description |
|---------|-------------|
| Source | Where data originates |
| Transformations | What changes happen to the data |
| Destinations | Where data ends up |
| Validation | What rules are applied |
| Persistence | Where data is stored |
| Latency | Expected timing |
| Failure mode | What happens if flow breaks |
| Recovery | How to recover failed data |
