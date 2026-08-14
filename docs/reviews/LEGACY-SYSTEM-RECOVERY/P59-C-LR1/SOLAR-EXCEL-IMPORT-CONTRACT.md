# SOLAR EXCEL IMPORT CONTRACT — P59-C/LR-2 (Track D)

**Status:** Mapping/preparation only. No production import code depends on directional OBIS registers. OBIS-dependent behavior is gated.

## 1. Legacy Templates (evidence — openpyxl inspection)

| Template | Sheet | Rows | Columns |
|----------|-------|------|---------|
| Solar_Customers_For_Import.xlsx | Customers | 55 | Customer Type, Account Type, Project, Arabic Name, Email, Phone 1-3, Meter Serial Electricity, Electricity Meter Install Date, Initial Balance Electricity, Meter Serial Water, Water Install Date, Initial Balance Water, Meter Serial Garden, Garden Install Date, Initial Balance Garden, Unit No., Unit Type ID, Zone Type ID, Floor No, Building No, City, Customer Info, Notes |
| Solar_Invoices_Import.xlsx | Invoices | 2797 | Meter Serial, Month, Invoice Amount, Invoice Number, Solar Tag, Notes |
| Solar_Payments_Import.xlsx | Payments | 964 | Meter Serial, Month, Payment Amount, Payment Method, Solar Tag, Notes |

## 2. MeterVerse Mapping (ImportJob type → models)

| Legacy Column | MeterVerse Field | Notes |
|---------------|------------------|-------|
| Meter Serial (Electricity/Water/Garden) | `Meter.serial` | up to 3 meters per customer |
| Customer Type / Account Type | `Customer.customerType` / `Customer.accountType` | map enums |
| Arabic Name | `Customer.name` (or nameEn fallback) | |
| Initial Balance | `Customer.openingBalance` | ledger opening |
| Unit No / Unit Type / Zone / Floor / Building | `Unit` (zoneId) + address fields | needs Zone lookup |
| City / Project | `Area`/`Project` lookup | **tenancy-sensitive — see P59-B boundary** |
| Month | `Invoice` period / `BillCycle` | |
| Invoice Amount / Number | `Invoice.amount` / `Invoice.number` | historical import — immutable |
| Payment Amount / Method | `Payment.amount` / `Payment.method` | |

## 3. Validation Definitions (to implement with ImportJob)

- Meter serial format (non-empty, unique within batch)
- Initial balance numeric, >= 0
- Invoice amount numeric, > 0
- Payment method in allowed set (cash/card/cheque/bank)
- Month format YYYY-MM
- Customer Project/Area must resolve (else row FAILED)
- Duplicate meter serial within batch → reject row

## 4. ImportJob Contract

- `type`: `"solar_customers"` | `"solar_invoices"` | `"solar_payments"`
- `status`: pending → processing → completed/failed
- `totalRows` / `processed` / `failed` / `errors` (per-row error JSON)
- Row-level: `{ row, status, error?, data? }`

## 5. OBIS GATE NOTE

The legacy solar templates do NOT include OBIS register columns (1.8.0/2.8.0 are entered via the
solar invoice UI, not the import templates). Therefore **this import contract does not require
the OBIS model decision** — it can proceed independently. Solar reading/billing import that
would need directional registers remains gated on the OBIS decision.

## 6. Implementation Boundary

- Mapping layer + validation definitions are safe to implement.
- Actual ImportJob processor route can be implemented for these 3 types without OBIS dependency.
- NOT implemented in this gate (kept as contract) to avoid scope creep; next safe step if desired.
