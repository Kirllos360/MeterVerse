# P-008: Firmware Upgrade

**Domain Group:** 01_meter
**Priority:** P2
**Business Owner:** Meter Ops Director

## Business Context
- **Business Purpose:** Update meter firmware
- **Trigger:** Vendor release
- **Actors:** Meter Admin

## Inputs & Outputs
- **Inputs:** Firmware file, Target meters
- **Outputs:** Firmware updated, Version recorded

## Rules
- **Business Rules:** Staged: 10%?50%?100%. CRC check.
- **Security Rules:** File checksum verified. Staged rollout.
- **Permissions:** meters.admin

## Flow Control
- **Exception Paths:** > 5% failure ? Auto-rollback
- **Retry Strategy:** Per meter: 3 attempts
- **Rollback Strategy:** Reinstall previous version

## Dependencies
- **Upstream:** P-007
- **Downstream:** None

## Technical References
- **APIs:** Planned
- **Database Tables:** Meter (firmwareVersion)

## Definition of Done
Firmware updated. Success rate > 95%.

---
