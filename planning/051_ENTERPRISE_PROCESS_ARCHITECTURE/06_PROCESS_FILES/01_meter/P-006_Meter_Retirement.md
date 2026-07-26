# P-006: Meter Retirement

**Domain Group:** 01_meter
**Priority:** P1
**Business Owner:** Meter Ops Director

## Business Context
- **Business Purpose:** Permanently remove meter from service
- **Trigger:** End of life
- **Actors:** Meter Ops, Asset Manager

## Inputs & Outputs
- **Inputs:** Meter ID, Reason, Disposition
- **Outputs:** Meter RETIRED, Serial decommissioned

## Rules
- **Business Rules:** No active readings pending billing. SIM released.
- **Security Rules:** Supervisor approval
- **Permissions:** meters.delete

## Flow Control
- **Exception Paths:** Unbilled readings ? Hold
- **Retry Strategy:** 2 attempts
- **Rollback Strategy:** Reactivate meter

## Dependencies
- **Upstream:** P-002 (ended)
- **Downstream:** Asset Mgmt

## Technical References
- **APIs:** DELETE /api/meters/:id
- **Database Tables:** Meter, MeterEvent, AuditEntry

## Definition of Done
Meter retired. All data archived. SIM released.

---
