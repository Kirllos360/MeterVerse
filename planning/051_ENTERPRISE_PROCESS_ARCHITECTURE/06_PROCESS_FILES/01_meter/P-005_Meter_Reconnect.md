# P-005: Meter Reconnect

**Domain Group:** 01_meter
**Priority:** P0
**Business Owner:** Collection Director

## Business Context
- **Business Purpose:** Restore service after payment
- **Trigger:** Payment received
- **Actors:** Field Tech, Customer

## Inputs & Outputs
- **Inputs:** Meter ID, Payment confirmation
- **Outputs:** Meter ACTIVE

## Rules
- **Business Rules:** Safety check if disconnected > 6mo
- **Security Rules:** Automated on payment
- **Permissions:** meters.update

## Flow Control
- **Exception Paths:** Meter tampered ? Inspection
- **Retry Strategy:** Auto every 30min x 6hrs
- **Rollback Strategy:** Re-disconnect (P-004)

## Dependencies
- **Upstream:** P-004, P-045
- **Downstream:** None

## Technical References
- **APIs:** POST /api/meters/:id/activate
- **Database Tables:** Meter, MeterEvent

## Definition of Done
Service restored. Communication verified.

---
