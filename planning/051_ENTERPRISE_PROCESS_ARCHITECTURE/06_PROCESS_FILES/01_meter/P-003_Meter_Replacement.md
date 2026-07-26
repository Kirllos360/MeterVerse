# P-003: Meter Replacement

**Domain Group:** 01_meter
**Priority:** P0
**Business Owner:** Meter Ops Director

## Business Context
- **Business Purpose:** Replace installed meter with new one
- **Trigger:** Fault/end of life
- **Actors:** Field Tech, Meter Ops

## Inputs & Outputs
- **Inputs:** Old meter ID, New serial, Reason
- **Outputs:** Old retired, New active

## Rules
- **Business Rules:** Same billing period preferred
- **Security Rules:** GPS-verified
- **Permissions:** meter.field

## Flow Control
- **Exception Paths:** Final reading < last billed
- **Retry Strategy:** 3 attempts
- **Rollback Strategy:** Restore old meter

## Dependencies
- **Upstream:** P-001
- **Downstream:** P-006

## Technical References
- **APIs:** PUT /api/meters/:id
- **Database Tables:** Meter, MeterAssignment

## Definition of Done
New meter active at same location

---
