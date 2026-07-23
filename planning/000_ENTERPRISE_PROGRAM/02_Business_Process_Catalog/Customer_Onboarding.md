# Customer Onboarding

## Actors
- Admin User
- System

## Input
- Customer information
- Meter serial number

## Process Flow
1. Create customer record
2. Assign meter to customer
3. Validate meter assignment
4. Create contract
5. Configure tariff
6. Activate service
7. Send welcome notification

## Output
- Active customer with assigned meter
- Active contract
- Welcome notification sent

## Decision Points
- Is meter available? Yes → Assign. No → Order meter.
- Is contract required? Yes → Create contract. No → Skip.

## Failure Points
- Meter already assigned to another customer → Error, reassign required
- Invalid customer data → Validation error, correct and retry

## Recovery
- Rollback meter assignment if contract creation fails
- Retry notification delivery up to 3 times

## Automation
- Meter assignment triggers contract generation
- Contract activation triggers service provisioning

## AI Assistance
- Suggest optimal tariff based on customer profile
- Predict meter reading schedule

## Notifications
- Welcome email to customer
- Assignment confirmation to operator

## KPIs
- Time to onboard (target: < 24 hours)
- First reading within 7 days
