# P-002: Meter Assignment

**Domain Group:** 01_meter
**Priority:** P0
**Business Owner:** Meter Ops Director

## Business Context
- **Business Purpose:** Link meter to customer/contract
- **Trigger:** Customer request
- **Actors:** Meter Ops, Customer Service

## Inputs & Outputs
- **Inputs:** Meter ID, Customer ID
- **Outputs:** MeterAssignment record

## Rules
- **Business Rules:** One active assignment per meter
- **Security Rules:** Customer-scoped
- **Permissions:** meter_assignments.*

## Flow Control
- **Exception Paths:** Customer not found
- **Retry Strategy:** 2 attempts
- **Rollback Strategy:** Reverse assignment

## Dependencies
- **Upstream:** P-001
- **Downstream:** P-011

## Technical References
- **APIs:** POST /api/meter-assignments
- **Database Tables:** MeterAssignment, Meter

## Definition of Done
Meter linked to customer

---
