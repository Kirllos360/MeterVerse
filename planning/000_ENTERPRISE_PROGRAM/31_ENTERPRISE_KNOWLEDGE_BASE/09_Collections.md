# Collections

## Current Knowledge
**From Excel files (Water Collection — 1,047,034 rows, Electricity Collection — ~500,000 rows):**
- Monthly collection sheets organized by month (JAN-22 through DEC-24+)
- Each payment records: Date, Billing Months, Customer Name, Unit, Amount Paid, Payment Method, Notes

**Payment methods found:**
| Method | Arabic | Usage |
|--------|--------|-------|
| POS | POS | High |
| Cash | كاش | High |
| Bank Transfer | تحويل بنكي | Medium |
| Online | On line | Low |

**Schema support:**
- `Payment` model exists (invoiceId, amount, method, status, paidAt)
- `PaymentGateway` model exists
- `PaymentTransaction` model exists
- `CollectionCase` model exists
- `CollectionAction` model exists
- `PromiseToPay` model exists

## Unknown
- Payment reconciliation process
- How partial payments are handled
- Payment terms and grace periods
- Whether late fees / penalties are applied

## Assumptions
- POS is the primary payment method
- Cash collections require receipt generation
- Bank transfers require manual reconciliation

## Confidence
- Payment methods: 100% (from Excel data)
- Collection volume: 100% (1.5M+ records)
- Schema coverage: 80%

## Need User Confirmation
- [ ] Confirm all payment methods accepted
- [ ] Confirm reconciliation process
- [ ] Confirm late payment penalties
