# Billing Model

## Current Knowledge
**From Excel files:**
- Monthly invoices per meter per customer
- Opening balance tracking (carried forward debt)
- Billing status: "Yes" or "No" per customer
- Date columns in Excel are serial numbers representing months
- Large variety of invoice amounts (from 9 EGP to 3,200+ EGP)

**Schema support:**
- `Invoice` model exists (number, amount, status, dueDate, issuedAt, paidAt)
- `InvoiceItem` model exists
- `BillCycle` model exists
- `BillRun` model exists
- `ChargeRule` model exists
- `DiscountRule` model exists
- `InvoiceTax` model exists

## Unknown
- Billing cycle frequency (monthly seems likely)
- Who generates invoices (MeterVerse or pre-calculated)
- How opening balance is calculated
- Whether invoices include detailed line items (consumption, service fees, taxes)

## Assumptions
- Monthly billing cycle
- Invoice amount = consumption × tariff rate (+ fees + taxes)
- Opening balance = sum of unpaid previous invoices

## Confidence
- Schema covers billing: 85%
- Actual billing logic: 50%

## Need User Confirmation
- [ ] Confirm billing cycle frequency
- [ ] Confirm how invoice amounts are calculated
- [ ] Confirm opening balance calculation
