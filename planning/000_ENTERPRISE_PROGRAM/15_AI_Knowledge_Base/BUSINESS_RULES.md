# Business Rules

## Customer
- Customer must have unique email
- Customer cannot be deleted if has active meters or unpaid invoices
- Customer status: active, inactive, maintenance, terminated

## Meter
- Meter serial is unique
- Meter cannot be deleted if has readings
- Meter status: active, inactive, maintenance, terminated

## Reading
- Reading value must be positive
- Reading cannot be in the future
- Bulk import validates all rows before committing any

## Billing
- Invoice cannot be deleted if has payments
- Invoice status: pending, paid, overdue, cancelled
- Payment cannot exceed invoice amount
