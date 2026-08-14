# LEGACY DATA RECOVERY / MIGRATION MAP — P59-C/LR-1

**No migration performed. Map only.**

## 1. SBill / October Billing (SQL Server) — MIGRATE candidate

| Dataset | Source | Classify | To MeterVerse | Notes |
|---------|--------|----------|---------------|-------|
| Customer history | PalmHills_Billing | **MIGRATE/TRANSFORM** | Customer (+Area) | Needs area mapping (legacy per-area DBs → Area model) |
| Meter data | PalmHills_Billing | **MIGRATE/TRANSFORM** | Meter (+areaId) | Serial + type + assignment |
| Invoice history | PalmHills_Billing | **MIGRATE/TRANSFORM** | Invoice | Historical billing protection required |
| Payment history | PalmHills_Billing | **MIGRATE/TRANSFORM** | Payment | Reference + amount + method |
| Tariff history | PalmHills_Billing | **TRANSFORM** | Tariff/TariffVersion | Map legacy rates → TariffTier |
| Tax rules (15%/1%/14%) | architecture doc | **TRANSFORM** | TariffTax/InvoiceTax seed | Config seed, not data dump |
| Reading history (MPRTFk/5.8.0) | area systems | **TRANSFORM** | Reading (+OBIS registers per decision) | Requires OBIS mapping (OBIS-DECISION-MATRIX) |
| Settlement history | (SBill partial) | **REFERENCE** | (Settlement new) | Evidence-gated |
| Templates | SBill | **REFERENCE** | (template store) | — |

**Migration complexity:** HIGH (per-area DBs, SQL Server → PG16, OBIS model, historical immutability).
**Relation to P59-B:** SBill area mapping conflicts with the frozen 639-record tenancy backlog — **must NOT proceed until P59-B decisions approved.**

## 2. Collection System (PostgreSQL/SQLite stubs) — REFERENCE/TRANSFORM

| Dataset | Source | Classify | Notes |
|---------|--------|----------|-------|
| Customer/transaction operational data | october.db, sodic_ednc.db (SQLite stubs, 0-byte) | **IGNORE** (stubs empty) | No real data in extracted stubs |
| Solar wallet historical | routes + Excel (CR 2047) | **REFERENCE** (rules) | Recover rules, not data |
| Chilled-water settlements | operational PDFs (17 settlements/31 invoices) | **REFERENCE** | Rules only |

## 3. IMS — IGNORE
UI-only; no data.

## 4. Symbiot — REFERENCE
Protocol/MDM inventory is knowledge, not data.

## 5. Data-Recovery Priority (reuse-first)

| Priority | Dataset | Action | Effort | Gate |
|----------|---------|--------|--------|------|
| 1 | SBill tax config seed (15%/1%/14%) | TRANSFORM → seed config | Low | Independent |
| 2 | Solar Excel templates | ADAPT → ImportJob schemas | Low | Independent |
| 3 | SBill customer/meter/invoice/payment | MIGRATE (map + transform) | High | **After P59-B approved** |
| 4 | Reading history (OBIS) | TRANSFORM (requires OBIS decision) | High | **After OBIS decision** |
| 5 | Solar wallet history | REFERENCE (rules only) | Low | Independent |

## 6. Boundary

No migration is authorized this gate. SBill data migration is explicitly gated on P59-B tenancy decisions (area mapping) and the OBIS model decision. Anything touching the frozen 639 population is FORBIDDEN.
