# P-001: Meter Registration

**Domain Group:** 01_meter
**Priority:** P0
**Business Owner:** Meter Ops Director

## Business Context
- **Business Purpose:** Register new metering device
- **Trigger:** New meter arrives
- **Actors:** Meter Ops, System, Warehouse

## Inputs & Outputs
- **Inputs:** Serial, Type, Area, Config
- **Outputs:** Meter record, AuditEntry

## Rules
- **Business Rules:** Serial unique. Type required.
- **Security Rules:** Area-scoped
- **Permissions:** meters.create

## Flow Control
- **Exception Paths:** Duplicate serial ? 409
- **Retry Strategy:** 3 attempts
- **Rollback Strategy:** Not needed

## Dependencies
- **Upstream:** None
- **Downstream:** P-002

## Technical References
- **APIs:** POST /api/meters
- **Database Tables:** Meter, MeterType

## Definition of Done
Meter created with all fields

---
