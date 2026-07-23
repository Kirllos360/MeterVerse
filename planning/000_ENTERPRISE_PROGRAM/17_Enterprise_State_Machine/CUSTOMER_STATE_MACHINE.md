# Customer State Machine

```
Lead → Created → Verified → Active → Suspended → Closed → Archived
```

| State | Allowed Transitions | Requires |
|-------|-------------------|----------|
| Lead | Created | Contact information |
| Created | Verified, Archived | Email verification |
| Verified | Active, Suspended | Meter assignment + contract |
| Active | Suspended, Closed | Payment failure or request |
| Suspended | Active, Closed | Payment received or resolution |
| Closed | Archived | All invoices paid, meters returned |
| Archived | — | 90 days after closure |
