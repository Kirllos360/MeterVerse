# Areas

## Current Knowledge
**Known areas (from Excel files):**
| Area | Files Found | Customers | Meter Types |
|------|-----------|-----------|-------------|
| Golf Extension | Golf Invoices, Solar Tracking, Water Collection, Electricity Collection | ~2,800+ | Water, Electricity, Solar |
| October | October Smart Water | ~3,000+ | Water |
| Palm Central | Palm Central Water BTU | ~50+ | Water, BTU |
| The Crown | Crown Electricity, Crown Water | ~1,200+ | Electricity, Water |

**Schema support:**
- `Customer.area` field exists (String, optional)
- `Meter.area` field exists (String, optional)
- `User.area` field exists (String, default "")
- `Project` model exists with `organizationId` FK

## Unknown
- Total number of areas
- Whether each area has separate infrastructure (VM, database, domain)
- Future areas planned
- Area-specific configuration requirements

## Assumptions
- Area field in schema is sufficient for current needs
- Multi-tenancy (org isolation) will be needed for full separation

## Confidence
- Known areas: 100% (from Excel files)
- Area structure in schema: 90%
- Infrastructure per area: Unknown

## Need User Confirmation
- [ ] Confirm complete list of areas
- [ ] Confirm if each area needs separate infrastructure
