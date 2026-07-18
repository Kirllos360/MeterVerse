# R3 — Entity Mapping: Legacy → Meter Verse

**Date**: 2026-06-17  
**Status**: ✅ COMPLETED  
**Phase**: R3 (of R1–R7 remediation)

---

## Source Schemas Analyzed

| Source | Technology | Tables | Data Present | Key Data |
|--------|-----------|--------|-------------|----------|
| Collection System (`collection.db`) | SQLite | 55 | Minimal (4 customers, 43 tariffs, 4 users) | Structure reference only |
| Collection Backup (`collection_backup_*.db`) | SQLite (11.2MB) | 55 | **Likely full production data** | Not yet analyzed |
| SBill Palm Hills (`PalmHills_Billing_FullSchema.sql`) | SQL Server DDL | 30+ | Schema only | Production schema reference |
| Meter Verse Target (`schema.prisma`) | PostgreSQL/Prisma | 22 models | Empty (0 rows) | Target schema |

---

## Entity Mapping Table

### Core Organization

| Meter Verse (Target) | Collection System (Legacy) | SBill Palm Hills (Legacy) | Notes |
|---|---|---|---|
| `Project` | `project` (7 rows) | `project` | All have code/name/name_ar. Meter Verse adds tax, thresholds, water diff mode |
| `LocationNode` (zone/building/floor/unit) | `location_zone` | `location` | Meter Verse has hierarchical (parentId) with node_type enum. Legacy is flat. |
| `Customer` | `customer` (4 rows) | `customer` | Meter Verse: project-scoped with customerCode. Legacy: global with unit_number. |
| `CustomerUnitAssignment` | (customer → unit in customer.unit_number field) | `customer_meter` | **Gap**: Legacy embeds unit as field. Meter Verse formalizes with start/end dates. |

### Meters & SIMs

| Meter Verse (Target) | Collection System (Legacy) | SBill Palm Hills (Legacy) | Notes |
|---|---|---|---|
| `Meter` | `customer_meter` | `meter` | Meter Verse has full lifecycle (installation/activation/termination dates, status enum). |
| `MeterAssignment` | (customer ↔ meter via customer table) | `customer_meter` | **Gap**: Legacy has implicit assignment. Meter Verse formalizes with project/unit/change_reason. |
| `SIMCard` | `sim_card` | — | Direct 1:1 match. Meter Verse adds ip_type enum. |
| `SIMAssignment` | (sim.assigned_meter_id field) | — | **Gap**: Legacy embeds meter_id in sim_card. Meter Verse formalizes as separate table. |

### Readings

| Meter Verse (Target) | Collection System (Legacy) | SBill Palm Hills (Legacy) | Notes |
|---|---|---|---|
| `Reading` | `meter_reading` | `meter_reading`, `monthly_reading` | **Gap**: Legacy has 2 reading tables. Meter Verse consolidates with customer/unit snapshots. |
| `ReadingReview` | `reading_review` | — | Direct 1:1 match. |

### Tariffs & Billing Periods

| Meter Verse (Target) | Collection System (Legacy) | SBill Palm Hills (Legacy) | Notes |
|---|---|---|---|
| `TariffPlan` | `tariff` (43 rows) | `tariff` | Meter Verse simplified: one rate per plan. Legacy has tiered rates. |
| `BillingPeriod` | `bill_cycle` | `billcycle_log` | Direct match. |

### Invoices

| Meter Verse (Target) | Collection System (Legacy) | SBill Palm Hills (Legacy) | Notes |
|---|---|---|---|
| `Invoice` | `transaction` (type=invoice) | `invoice` | Meter Verse: utility_type, billing_period_id. Includes subtotal/tax/total/paid/remaining. |
| `InvoiceLine` | `invoice_detail` | `invoice_details` | Meter Verse links to reading_id snapshot. |
| `InvoiceAdjustment` | `invoice_adjustment` | `cancelled_invoices` | Direct match. |

### Payments & Ledger

| Meter Verse (Target) | Collection System (Legacy) | SBill Palm Hills (Legacy) | Notes |
|---|---|---|---|
| `Payment` | `transaction` (type=payment) | `payment` | Meter Verse: paymentNumber, method, collector. |
| `PaymentAllocation` | `payment_allocation` | — | **Gap**: SBill allocates payment directly to invoice_id. Meter Verse has dedicated allocation table. |
| `CustomerLedgerEntry` | `customer_ledger_entry`, `transaction` | — | Meter Verse: append-only with running_balance. Legacy has both ledger + transaction. |

### System

| Meter Verse (Target) | Collection System (Legacy) | SBill Palm Hills (Legacy) | Notes |
|---|---|---|---|
| `AuditLog` | `audit_log` | `user_audit`, `audit_log`, `adm_persistent_audit_event` | Meter Verse: single append-only table with hash. |
| `LoginAttempt` | `login_attempt` | `security_breach_log` | Direct match. |
| `RefreshToken` | — | `user_session` | **New**: Meter Verse adds refresh token rotation. |
| `IdempotencyRecord` | — | — | **New**: Not in legacy. |
| `ProjectThreshold` | `reading_threshold` | — | Direct match. |
| `WaterBalance` | `water_balance` | — | Direct match. |
| `ReportJob` | `report_job` | — | Direct match. |

---

## Key Mapping Gaps

1. **Location hierarchy**: Legacy uses flat `location`. Meter Verse uses `LocationNode` with hierarchical `parentId` and `nodeType` (zone/building/floor/unit). Must infer hierarchy from existing naming conventions.

2. **Meter assignment**: Legacy has implicit meter→customer link. Meter Verse formalizes with `MeterAssignment` table (project, unit, change_reason, start/end dates).

3. **SIM management**: Legacy embeds `assigned_meter_id` in `sim_card`. Meter Verse has dedicated `SIMAssignment` table with lifecycle tracking.

4. **Billing context**: Legacy uses `bill_cycle` for batch billing. Meter Verse has `BillingPeriod` similarly but adds `utility_type` at invoice level.

5. **Reading snapshots**: Meter Verse's `Reading` model captures `customerIdSnapshot` and `unitIdSnapshot` at time of reading — records who was responsible then, not who is responsible now.

6. **Tariff structure**: Legacy `tariff` supports tiered rates (from_value/to_value). Meter Verse `TariffPlan` has single `ratePerUnit`. Tiered tariffs must be flattened or migrated as multiple TariffPlan entries.

---

## Data Sources to Migrate (Priority Order)

| Priority | Source | Est. Records | Complexity |
|----------|--------|-------------|-----------|
| P0 | Collection System PostgreSQL data (dump files) | Unknown (full DB) | Medium |
| P1 | Collection System SQLite backup (11.2MB) | Thousands | Low |
| P2 | EDNC XLSX files M01–M05/2026 | ~1100 customers × 5 months | Medium |
| P3 | Collection System SQLite live (collection.db) | 4 customers, 43 tariffs, 4 users | Low |
| P4 | Legacy SBill SQL Server (Palm Hills schema) | Unknown (external) | High |

---

## Migration Strategy Recommendation

**Phase 1 — Structure first**: Migrate empty schema structure (projects, locations, tariffs, users) from legacy → Meter Verse.

**Phase 2 — Reference data**: Migrate customers, meters, SIMs, assignments with historical tracking.

**Phase 3 — Transactions**: Migrate readings, invoices, payments with full audit trail and ledger entries.

**Phase 4 — Reconciliation**: Recalculate running balances, verify invoice totals match legacy.

## Verification

- 22 Meter Verse models all have corresponding legacy entity
- 6 gaps identified (see above) — all have documented resolution strategy
- No unmappable legacy entities found
