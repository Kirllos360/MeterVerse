# Invoice Billing Cycle

## Actors
- System (automated)
- Admin (override)

## Input
- Meter readings for billing period
- Tariff rates
- Customer contracts

## Process Flow
1. Start BillRun
2. Aggregate readings per meter
3. Apply tariff rates
4. Calculate charges
5. Apply discounts
6. Calculate taxes
7. Generate invoice
8. Apply late fees (if applicable)
9. Send invoice to customer

## Output
- Generated invoice
- Invoice notification sent

## Decision Points
- Reading exists for full period? Yes → Bill. No → Estimate or skip.
- Customer has active contract? Yes → Apply contract rates. No → Apply default.

## Failure Points
- Missing readings → Estimate based on historical average
- Tariff expired → Use last active tariff, flag for admin review

## Recovery
- Regenerate invoice after tariff correction
- Void and recreate invoice if billing error detected

## Automation
- Full cycle automated end-to-end
- Exceptions routed to admin for manual review

## AI Assistance
- Predict billing anomalies before invoice generation
- Optimize tariff selection for customer segments

## Notifications
- Invoice generated notification
- Invoice overdue reminders
- Payment confirmation

## KPIs
- Bills generated on time (target: 100%)
- Billing accuracy (target: > 99.9%)
