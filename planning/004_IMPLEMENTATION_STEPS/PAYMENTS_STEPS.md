# Implementation Steps — Payments & Collections

| Step ID | Objective | Files | Tests |
|:-------:|-----------|:-----:|:-----:|
| IMP-P01 | Payment recording with Zod validation | `routes/payments.js` | ✅ |
| IMP-P02 | Oldest-due-first allocation in $transaction | `routes/payments.js` | ✅ |
| IMP-P03 | Payment reversal with audit | `routes/payments.js` | ✅ |
| IMP-P04 | Customer statement endpoint | `routes/payments.js` | ✅ |
| IMP-P05 | Aging buckets (0-30/31-60/61-90/90+) | `routes/payments.js` | ✅ |
| IMP-P06 | Overpayment credit balance tracking | `routes/payments.js` | ✅ |
| IMP-P07 | Report export (6 types, CSV/JSON) | `routes/reports.js` | ✅ |
