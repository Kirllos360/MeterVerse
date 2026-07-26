# P-004: Meter Disconnect

**Domain Group:** 01_meter
**Priority:** P0
**Business Owner:** Collection Director

## Business Context
- **Business Purpose:** Disconnect meter for non-payment
- **Trigger:** Invoice overdue
- **Actors:** Field Tech, Collection Officer

## Inputs & Outputs
- **Inputs:** Meter ID, Reason, Authorization
- **Outputs:** Meter DISCONNECTED, Final reading

## Rules
- **Business Rules:** Med hardship exempt. Govt 90-day notice.
- **Security Rules:** Supervisor approval required
- **Permissions:** meters.update, collections.*

## Flow Control
- **Exception Paths:** Remote fails ? Dispatch field
- **Retry Strategy:** 2 remote attempts
- **Rollback Strategy:** Reconnect (P-005)

## Dependencies
- **Upstream:** P-051
- **Downstream:** P-005

## Technical References
- **APIs:** POST /api/meters/:id/deactivate
- **Database Tables:** Meter, MeterEvent

## Definition of Done
Meter disconnected. Final reading captured.

---
