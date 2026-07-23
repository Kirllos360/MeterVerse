# MeterVerse — Master Graph

## Enterprise Dependency Graph

```
Organization
    ↓
Project
    ↓
Customer
    ├── Contract (terms, amendments)
    ├── ServiceConnection (MeterAssignment — meter, dates, history)
    │   ├── Meter (serial, type, status, events)
    │   │   ├── Reading (value, timestamp, validation)
    │   │   │   ├── Consumption (delta × tariff rate)
    │   │   │   │   └── InvoiceItem (line items)
    │   │   │   │       └── Invoice (totals, taxes, status)
    │   │   │   │           ├── Payment (amount, method, date)
    │   │   │   │           │   └── LedgerEntry (double-entry)
    │   │   │   │           └── CollectionCase (dunning)
    │   │   │   └── ValidationResult (rules engine)
    │   │   └── MeterEvent (installation, maintenance)
    │   ├── BillCycle → BillRun → Invoice
    │   └── Tariff (rates, tiers, schedules)
    ├── Invoice → Payment → Ledger
    └── Notification (events)
        ├── EmailLog
        ├── SmsLog
        └── PushNotification
```

## Execution Order

```
Phase 42: Indexes + domain.js fix + Notifications → Export → Detail Pages
Phase 43: Performance + Caching → Unit Tests
Phase 44: ServiceConnection full activation → Contract UI → Tariff UI
Phase 45: Customer Portal → Field Worker App → Mobile
Phase 46: AI Agents → LLM Integration → Predictive Analytics
```

## Validation Order
Every implementation must validate:
1. TypeScript compilation
2. API response matches spec
3. Graph updated
4. Spec updated
5. Screenshots captured
6. Reports generated
7. Evidence committed
