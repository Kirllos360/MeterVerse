# Meter Types

## Current Knowledge
**Meter types found in Excel files and schema:**
| Type | Found In | Schema Support |
|------|---------|---------------|
| Water | All water tracking sheets | `Meter.type` field (String) |
| Electricity | Crown Electricity, Golf Electricity | `Meter.type` field (String) |
| Solar | Solar Tracking Sheet Golf | `Meter.type` field (String) |
| BTU | Palm Central BTU sheet | `Meter.type` field (String) |

**Meter model fields:** id, serial (unique), type, location, status, area, customerId, archivedAt, createdAt, updatedAt

## Unknown
- Full list of meter types and their specifications
- Whether each meter type has different reading units (kWh, m³, BTU, etc.)
- Meter installation and maintenance processes

## Assumptions
- Meter types are defined as strings in the type field
- Different meter types may have different reading frequencies

## Confidence
- Found types: 100% (from Excel data)
- Schema coverage: 80%

## Need User Confirmation
- [ ] Confirm complete list of meter types
- [ ] Confirm reading units per meter type
