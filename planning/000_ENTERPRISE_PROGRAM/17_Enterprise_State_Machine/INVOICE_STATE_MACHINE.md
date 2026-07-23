# Invoice State Machine

```
Draft → Pending → Approved → Issued → Partially Paid → Paid → Cancelled → Archived
```

| State | Allowed Transitions | Requires | Triggers |
|-------|-------------------|----------|----------|
| Draft | Pending | Validation passed | Save button |
| Pending | Approved, Cancelled | Manager review | Approval action |
| Approved | Issued | Schedule trigger | BillRun execution |
| Issued | Partially Paid, Paid, Cancelled | Payment received | Payment event |
| Partially Paid | Paid | Full payment | Payment event |
| Paid | Archived | 30 days after due | Scheduled job |
| Cancelled | Archived | Reason recorded | Cancel action |
| Archived | — | — | Scheduled job |

### Invariants
- Cannot delete invoice with status > Draft
- Cannot modify invoice after Issued
- Cancelled invoice cannot transition to Paid
