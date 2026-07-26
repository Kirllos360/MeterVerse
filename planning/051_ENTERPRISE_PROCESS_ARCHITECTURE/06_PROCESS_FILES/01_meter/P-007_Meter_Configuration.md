# P-007: Meter Configuration

**Domain Group:** 01_meter
**Priority:** P1
**Business Owner:** Meter Ops Director

## Business Context
- **Business Purpose:** Set/update meter technical parameters
- **Trigger:** Configuration change
- **Actors:** Meter Admin, Field Tech

## Inputs & Outputs
- **Inputs:** Meter ID, Config params (JSON)
- **Outputs:** MeterConfiguration updated

## Rules
- **Business Rules:** CT ratio 1-10000. PT ratio 1-1000.
- **Security Rules:** Only meter.admin can change
- **Permissions:** meters.configure

## Flow Control
- **Exception Paths:** Invalid params ? Reject with range
- **Retry Strategy:** 2 attempts
- **Rollback Strategy:** Restore previous config

## Dependencies
- **Upstream:** P-001
- **Downstream:** None

## Technical References
- **APIs:** Planned: POST /api/meters/:id/configure
- **Database Tables:** MeterConfiguration, Meter

## Definition of Done
Config saved. Previous version preserved.

---
