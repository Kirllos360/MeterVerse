# MeterVerse Solar Invoice — Technical Demonstration

**Date:** 2026-08-17 · **Status:** LIVE & VERIFIABLE · **Author:** MeterVerse Engineering (DeepSeek execution)

This document is a hard technical evidence package. Every claim below was verified by direct runtime, database, API, and file inspection on this machine — not asserted from source code alone.

---

## 1. Live System Links (all verified HTTP 200 + browser-rendered 2026-08-17)

| App | URL (local) | URL (LAN) | Status |
|-----|-------------|-----------|--------|
| **Admin / Enterprise Console** | http://localhost:3535 | http://192.168.1.2:3535 | ✅ 200 + browser-rendered (MeterVerse OS shell, Customers opens) |
| **Customer Portal** | http://localhost:3030 | http://192.168.1.2:3030 | ✅ 200 |
| **Admin API** | http://localhost:3131/api | http://192.168.1.2:3131/api | ✅ health 200 |
| **Portal API** | http://localhost:3003/api | http://192.168.1.2:3003/api | ✅ health 200 |
| **Symbiot ingestion bridge** | tcp :9000 / http :9001 | — | ✅ listening (BE process) |
| **PostgreSQL** | localhost:5433 (meter_pulse) | — | ✅ running |

**Admin login:** `admin@meterverse.com` / `Admin@123`

**Current LAN IP:** 192.168.1.2 (Wi-Fi). FEs bind on `::` (all interfaces); Node.js inbound firewall rule = Allow; LAN URL returns HTTP 200 from this machine. Remote-owner access from a separate computer on the same network is expected to work but was not tested from a second device.

---

## 2. Real Customer

| Field | Value |
|-------|-------|
| Customer ID | `f881de8e-5d61-4b93-bbdc-ffb70fac4441` |
| Name | **ايهاب امام حسنين شافعي** (Ihab Shafie) |
| Status | active |
| Meter link | meter `52051449` (solar) |
| Unit (legacy) | 189 (Golf Extension) |

*Provenance: REAL — imported from the real Collection System export (Solar_Customers_For_Import.xlsx) and verified via psql + authenticated API.*

---

## 3. Real Meter

| Field | Value |
|-------|-------|
| Meter ID | `57cc414c-15da-41b1-9b34-a9af414d0580` |
| Serial | **52051449** |
| Type | **solar** |
| Customer | `f881de8e` (Ihab Shafie) — linked via `Meter.customerId` |
| Assignment | active `MeterAssignment` (2021-01-01) |

*Provenance: REAL — meter record exists in meter_pulse; link verified via psql + API.*

---

## 4. Reading → Meter Relationship (exact)

**The system uses `Reading.meterId → Meter.id` (foreign key).** A reading belongs to a meter because every `Reading` row stores the `meterId` of its meter.

```
Reading.meterId  ──(FK)──▶  Meter.id
Meter.serial = "52051449"
```

- **Table:** `Reading` → column `meterId`
- **Table:** `Meter` → column `id` (unique), `serial` (unique `52051449`)
- **Relationship:** `Reading.meter @relation(fields: [meterId], references: [id])` (schema.prisma)
- **Constraint:** `@@index([meterId, timestamp])`
- **Ingestion path:** `ingestReading()` in `backend/src/services/symbiot-bridge.js` resolves `Meter.serial` → `meter.id`, then persists `Reading.meterId = meter.id` (tenancy `areaId`/`projectId` copied from the meter).

> **Owner answer:** *"Reading X belongs to meter Y because X's row stores Y's unique meter ID, and Y is uniquely identified by its serial 52051449."*

---

## 5. Meter → Customer Relationship (exact)

```
Meter.customerId  ──(FK)──▶  Customer.id
```

- **Table:** `Meter` → column `customerId` (nullable FK to `Customer.id`)
- **Table:** `MeterAssignment` → `meterId`, `customerId`, `status="active"` (formal assignment record)
- **Verified:** psql + authenticated API both return meter 52051449 → customer `f881de8e`, customer shows 1 meter.

**Live DB join result (psql, 2026-08-17):**
```
 serial  | type  |        customer        | assignment | startDate
---------+-------+------------------------+------------+---------------------
 52051449 | solar | ايهاب امام حسنين شافعي | active     | 2021-01-01 00:00:00
```

---

## 6. Tariff Selection (exact)

The **Solar Wallet Engine** (`backend/src/services/solar-wallet-engine.js`) applies a **fixed, verified Collection legacy tariff** — it does NOT depend on a separately-assigned Tariff row for the tiered rate. The tariff is **selected by meter type (solar)** and resolved internally:

| Constant | Value |
|----------|-------|
| `SOLAR_TARIFF_TIERS` | `[(50,0.48),(100,0.58),(150,0.68),(200,0.78),(300,0.88),(400,0.98),(500,1.08),(600,1.18),(700,1.28),(800,1.38),(900,1.48),(1000,1.58)]` |
| `SOLAR_OVER_LIMIT_RATE` | 1.68 EGP/kWh (>1000) |
| `SOLAR_ADMIN_FEE_RATE` | 2% |
| `SOLAR_SERVICE_FEE` | 9.10 EGP (fixed) |

**Why this tariff:** it reproduces the real Collection System formula (verified line-by-line against `routes_admin.py` + `solar-wallet-replay-report.md`). It is not guessed.

---

## 7. Billing Calculation (exact)

Engine function `computeSolar({ curr180, prev180, curr280, prev280 })`:

```
consumption = max(curr180 − prev180, 0)      # import register 1.8.0
production  = max(curr280 − prev280, 0)      # export register 2.8.0
net         = max(consumption − production, 0)
surplus     = max(production − consumption, 0)
amount      = tiered tariff(net)             # SOLAR_TARIFF_TIERS
adminFee    = round2(amount × 0.02)
serviceFee  = 9.10
total       = round2(amount + adminFee + serviceFee)
```

Persistence: `persistSolarInvoice({ customerId, periodStart, periodEnd, meterId, result, meta })` creates `CustomerLedgerEntry` (surplus credit) + `Invoice` + `InvoiceItem` rows (energy + admin + service).

---

## 8. Real Invoice (verified live)

| Field | Value |
|-------|-------|
| Invoice Number | **SOLAR-52051449-2021-01** |
| Invoice ID | `22cc2e45-d615-4f98-90d4-76098fea2aac` |
| Billing Period | 2021-01-01 → 2021-01-31 |
| Amount | **36.10 EGP** |
| Status | issued |
| Customer | ايهاب امام حسنين شافعي |

*Provenance: REAL — recovered from real Collection export + replay report; totals reconcile (65 invoices = 77,855.94; 23 payments = 75,124.50; balance 2,731.44).*

---

## 9. Real PDF

- **Endpoint:** `POST /api/pdf/invoices/:id` (route `backend/src/routes/pdf.js` → `generateInvoicePdf` in `backend/src/services/pdf-engine.js`)
- **Rendered file:** `backend/pdf-output/invoice-SOLAR-52051449-2021-01.pdf`
- **Verification:** 23,649 bytes; magic `%PDF-`; extracted text contains **36.10**, **SOLAR-52051449-2021-01**, **ايهاب امام حسنين شافعي**, and **"thirty six EGP"** (amount in words). Bilingual Arabic rendering via embedded Tahoma.
- **Sample PDFs (real invoices):** SOLAR-52051449-2021-02 (36.10), -2021-03 (36.10), -2022-09 (1,426.10), -2026-04 (471.51) — all in `backend/pdf-output/`.

---

## 10. Data Provenance (strict classification)

| Category | Items |
|----------|-------|
| **REAL** | Customer, meter 52051449 (solar), meter→customer link, 65 invoices, 23 payments, invoice SOLAR-52051449-2021-01 = 36.10, PDF (real render), DB totals |
| **DERIVED** | Register 54.26 kWh (used only for read-only pipeline proof; **NOT** presented as a real reading) |
| **UNKNOWN** | Raw 180/280 register history (proven absent in every accessible copy; no live Collection/Symbiot/SEP source reachable) |

---

## 11. System Architecture (data flow)

```
Reading (Reading.meterId → Meter.id)
   ↓
Meter 52051449 (serial, type=solar, customerId)
   ↓
MeterAssignment (active, 2021-01-01)
   ↓
Customer / Unit (f881de8e / 189)
   ↓
Tariff (SOLAR_TARIFF_TIERS — solar engine, verified Collection formula)
   ↓
Billing Engine (solar-wallet-engine.computeSolar)
   ↓
Invoice (persistSolarInvoice → Invoice + InvoiceItem + LedgerEntry)
   ↓
PDF (pdf-engine.generateInvoicePdf, bilingual)
   ↓
Portal / Admin (3535 / 3030)
```

**Exact files:**
- `backend/src/services/solar-wallet-engine.js` — compute + persist
- `backend/src/services/symbiot-bridge.js` — `ingestReading` (serial→meter→reading)
- `backend/src/services/pdf-engine.js` — bilingual PDF
- `backend/src/routes/solar.js` — `/api/solar/compute`, `/api/solar/invoices`
- `backend/src/routes/pdf.js` — `/api/pdf/invoices/:id`
- `backend/src/routes/invoices.js` — invoice lifecycle (issue/immutability)
- `backend/prisma/schema.prisma` — Reading/Meter/Customer/MeterAssignment/Invoice/InvoiceItem

---

## 12. Security

- **Authentication:** `authenticate` JWT middleware on all routes; unauthenticated → 401 (tested).
- **RBAC:** role-based permissions; solar route requires `invoices.create` (admin/area_manager/billing); `requireAccess` object-level authorization.
- **Tenancy/Area:** invoice `areaId` **derived from the customer** (not client-supplied) — horizontal-privilege fix; `AREA_RESTRICTED` for cross-area access (tested).
- **Audit:** `auditLog` on compute + invoice create + authorization events; `AuditEntry.correlationId` for traceability.
- **Idempotency:** deterministic invoice number `SOLAR-{serial}-{period}` = DB unique constraint; `P2002 → 409`.

---

## 13. Technical Evidence

- **Regression:** 448 tests (430 pass / 18 skip)
- **Graph:** 12 pass / 0 fail
- **SpecKit:** 19/19, 100%
- **FE typecheck:** 0 errors
- **Live API:** invoice detail + PDF generation verified (this document)
- **Database:** psql verified (65 invoices / 23 payments / totals exact)
- **Git:** HEAD `3db42629`, clean, pushed
