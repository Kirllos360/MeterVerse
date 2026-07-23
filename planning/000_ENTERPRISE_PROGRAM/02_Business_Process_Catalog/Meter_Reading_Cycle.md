# Meter Reading Cycle

## Actors
- Field Operator (System B)
- System

## Input
- Meter assignment
- Reading schedule

## Process Flow
1. Schedule reading
2. Collect reading (manual or automated)
3. Validate reading
4. Apply validation rules
5. Flag anomalies
6. Store reading
7. Trigger billing if cycle complete

## Output
- Validated reading record
- Anomaly alerts (if applicable)

## Decision Points
- Reading within expected range? Yes → Store. No → Flag anomaly.
- Manual or automated reading? Manual → Require operator verification.

## Failure Points
- Reading exceeds max threshold → Flag for review, do not auto-bill
- Meter communication failure → Schedule retry, notify operator

## Recovery
- Allow re-reading within 24 hours
- Manual override for verified anomalous readings

## Automation
- Auto-schedule readings based on meter type and location
- Auto-validate using configured rules

## AI Assistance
- Predict expected reading range from historical data
- Detect tampering patterns

## Notifications
- Anomaly alert to supervisor
- Reading confirmation to customer (if enabled)

## KPIs
- Readings collected on time (target: 98%)
- Anomaly detection rate (target: > 95%)
