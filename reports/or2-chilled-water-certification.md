# OR2 — Chilled Water Certification

**Date:** 2026-06-17
**Classification:** ❌ MISSING

---

## Required Verification

| Item | Status | Evidence |
|------|--------|----------|
| BTU Previous Reading | ❌ | No BTU reading field. No `BTU` meter type. `MeterType` enum has no BTU/chilled water. `Reading` model has no BTU-specific fields. |
| BTU Current Reading | ❌ | Same as above. |
| Consumption (BTU) | ❌ | No BTU consumption calculation. |
| Rate (BTU) | ❌ | No BTU rate in `TariffPlan`. No `base_btu_rate` field. |
| Invoice (Chilled Water) | ❌ | No `chilled_water` in `UtilityType` enum (only `electricity, water`). |
| Settlement | ❌ | No `ChilledWaterConfig` or `ChilledWaterSettlement` models. |
| Approval | ❌ | No settlement approval workflow. |
| Carry Forward | ❌ | No `carry_forward` / `previous_balance` fields. |
| Versioning | ❌ | No settlement versioning. |
| History | ❌ | No settlement history tracking. |
| PDF | ❌ | No PDF generation. |
| Audit | ❌ | No chilled-water-specific audit events. |

## Detailed Evidence

### Database
```
-- MeterType enum (current):
'sim_system'.'meter_type' AS ENUM ('electricity', 'water_main', 'water_child')

-- UtilityType enum (current):
'sim_system'.'utility_type' AS ENUM ('electricity', 'water')

-- No ChilledWaterConfig table
-- No ChilledWaterSettlement table
-- No BTU-related columns anywhere
```
Source: `backend/prisma/schema.prisma` — all enum definitions

### API
```
No chilled water or BTU routes in any controller.
No settlement endpoints.
```
Source: All controllers in `backend/src/`

### Reference System
```
Chilled water IS fully implemented in Collection System (Flask):
- routes_chilled_settlement.py: config/create/edit/approve/template
- models.py: ChilledWaterConfig + ChilledWaterSettlement (lines 262-315)
- charge_engine.py: BTU consumption calculation

Certified in Phase F:
- 206 BTU invoices replayed, 100% match (reports/f-final-chilled-water-certification.md)
- 15 settlements replayed, 100% match
- Formula: Total = Consumption × Rate_per_BTU (3.0 default, 2.44 custom)
- 1,000 deterministic stress cycles, identical SHA256
```
Source: `reference/collection-system/app/` + `reports/f*-chilled-water-certification.md`

## Classification

| Criterion | Result |
|-----------|--------|
| Current implementation | ❌ MISSING |
| Reference implementation | ✅ Full implementation in Flask, certified Phase F |
| Porting status | ❌ Not started (T088, T107 — v2.0.0 scope) |

**Verdict: MISSING — Chilled water billing and settlement exist only in the Flask Collection System reference. The Phase F certification validated the reference implementation, but none of this has been ported to the NestJS Meter Verse backend. All BTU/Settlement tables, endpoints, and UI pages need to be built.**
