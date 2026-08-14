# P59-C/LR-6 — SOLAR VERTICAL SLICE MAP

**Date:** 2026-08-14 · **Purpose:** classify every step of the intended first-goal solar invoice vertical.
**Legend:** DISCOVERED / EXISTS / REUSED / ADAPTED / MISSING / BLOCKED / IMPLEMENTED / TESTED / CERTIFIED

| # | Step | Classification | Component | Status |
|---|------|----------------|-----------|--------|
| 1 | Symbiot meter exists | EXISTS (legacy/SEP) | meter/connection infra | REFERENCE |
| 2 | MeterVerse synchronizes meter | ADAPTED | scheduler + ingestion-runtime | EXISTS |
| 3 | Meter exposes required attributes | EXISTS | `Meter` (serial, type, status, customerId) | EXISTS |
| 4 | Measurement points available | MISSING (directional) | Reading.obis180/280 | **BLOCKED (OBIS)** |
| 5 | Meter assigned to unit | EXISTS | MeterAssignment/MeterAssignmentHistory | EXISTS |
| 6 | Customer exists | EXISTS | Customer | EXISTS |
| 7 | Customer/unit/meter relationship valid | EXISTS | customerId FKs + tenancy | EXISTS |
| 8 | Tariff configured | EXISTS | Tariff/TariffRate/TariffTier/TariffVersion | EXISTS |
| 9 | Solar tariff activated | ADAPTED | Tariff type + tier seed (tiered 0.48–1.58) | ADAPTED |
| 10 | Initial balance/wallet state established | ADAPTED | CustomerLedgerEntry type="solar_credit" | REUSED |
| 11 | Reading captured | EXISTS | Reading (single value today) | EXISTS |
| 12 | OBIS directional values validated | **BLOCKED** | obis180/obis280 validation | **BLOCKED (OBIS)** |
| 13 | Reading anomaly/threshold validation | EXISTS | ValidationRule/ValidationResult + Reading.status | EXISTS |
| 14 | Consumption/net-metering calculation | IMPLEMENTED+TESTED | `computeSolar` (net/surplus) | TESTED |
| 15 | Solar wallet calculation | IMPLEMENTED+TESTED | `computeSolar` (walletCredit) | TESTED |
| 16 | Charges generated | IMPLEMENTED+TESTED | `persistSolarInvoice` (energy/admin/service items) | TESTED |
| 17 | Settlement applied where required | IMPLEMENTED+TESTED | settlement-engine (LR-2) — optional on solar invoice | TESTED |
| 18 | Invoice generated | IMPLEMENTED+TESTED | `persistSolarInvoice` → Invoice | TESTED |
| 19 | Invoice PDF/document generated | MISSING | documents/PDF route | PENDING |
| 20 | Customer can view invoice | MISSING | customer-portal invoice view | PENDING |
| 21 | Ledger is correct | IMPLEMENTED+TESTED | CustomerLedgerEntry (solar_credit) | TESTED |
| 22 | Audit trail exists | ADAPTED | auditLog on import/settlement | REUSED |
| 23 | Retry/idempotency behavior safe | IMPLEMENTED+TESTED | import job status 409; per-row tx | TESTED |
| 24 | Failure/recovery behavior safe | IMPLEMENTED+TESTED | row-level transaction, unknown-meter reject | TESTED |

## Dependency chain (verified, no new circular deps)

```
Meter → Reading → [obis180/280 = BLOCKED] → computeSolar → persistSolarInvoice
                                                          ├→ CustomerLedgerEntry (solar_credit)
                                                          ├→ InvoiceItem (energy/admin/service)
                                                          └→ Invoice → [PDF = MISSING] → portal
ImportJob → execute (guarded) → Customer/Meter/Invoice/Payment
```

## Summary
- **IMPLEMENTED + TESTED:** steps 14, 15, 16, 18, 21, 23, 24 (solar engine + import safety).
- **EXISTS/REUSED:** steps 3, 5, 6, 7, 8, 11, 13, 22.
- **BLOCKED (OBIS):** steps 4, 12 (directional reading capture).
- **MISSING (future, unblocked):** steps 19 (PDF), 20 (portal view), 9 (solar tariff seed data).
- **CERTIFIED:** none (vertical not fully complete — OBIS + PDF + portal remain).

## Next actions (dependency-safe)
1. Seed solar tiered tariff data (step 9 — no OBIS dep, SAFE).
2. Wire a solar route/controller using computeSolar + persistSolarInvoice with manually-entered directional inputs (step 12 alternative — non-Reading input source) — SAFE.
3. PDF + portal (steps 19/20) — SAFE, after solar route.
4. OBIS approval → enable Reading capture (steps 4/12) — BLOCKED.
