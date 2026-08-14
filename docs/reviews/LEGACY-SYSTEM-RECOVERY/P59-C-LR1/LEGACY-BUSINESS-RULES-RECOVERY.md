# LEGACY BUSINESS RULES RECOVERY — P59-C/LR-1

Every rule has source evidence. No invented rules. Format: RULE → SOURCE → METERVERSE EQUIVALENT → CONFLICT? → DECISION → STATUS.

## A. Solar Wallet / Net Metering (Collection System — VERIFIED RUNTIME)

### R-SOL-1: Consumption/Production from OBIS registers
- **RULE:** consumption = max(reading_180 − prev_180, 0); production = max(reading_280 − prev_280, 0); net = max(consumption − production, 0)
- **SOURCE:** `routes_admin.py:659-660`
- **METERVERSE EQUIVALENT:** none (no OBIS registers in Reading model)
- **CONFLICT:** yes — legacy uses 1.8.0/2.8.0 OBIS; MeterVerse core has single `Reading.value`; AGENTS.md references 5.8.0 combined (Import+Export) in legacy area systems
- **DECISION REQUIRED:** OBIS mapping (see OBIS-DECISION-MATRIX)
- **STATUS:** EXTRACTED — not implemented

### R-SOL-2: Surplus → wallet credit
- **RULE:** surplus = max(production − consumption, 0); if >0: customer.solar_balance += surplus; create SolarWalletTransaction (CREDIT, balance_before/after)
- **SOURCE:** `routes_admin.py:662-673`
- **METERVERSE EQUIVALENT:** none
- **CONFLICT:** none (pure addition)
- **DECISION:** implement as ledger credit
- **STATUS:** EXTRACTED

### R-SOL-3: Tiered solar tariff (as-built)
- **RULE:** [(50,0.48),(100,0.58),(150,0.68),(200,0.78),(300,0.88),(400,0.98),(500,1.08),(600,1.18),(700,1.28),(800,1.38),(900,1.48),(1000,1.58)] then >1000 @ 1.68 EGP/kWh
- **SOURCE:** `routes_admin.py:676-681`
- **METERVERSE EQUIVALENT:** `applyTariff` tiers (business-engine.js:63-76) can represent this
- **CONFLICT:** **yes — discovery-doc said "2.23 EGP/kWh" (CR 2047 Excel), but runtime uses tiered rates.** The 2.23 was the CR-2047 legacy design; runtime is tiered.
- **DECISION:** adopt runtime tiered schedule; document CR-2047 as historical
- **STATUS:** EXTRACTED

### R-SOL-4: Admin fee + service fee
- **RULE:** admin_fee = 2% of amount; service_fee = 9.10; total = amount + admin_fee + service_fee
- **SOURCE:** `routes_admin.py:682-683`
- **METERVERSE EQUIVALENT:** InvoiceItem (type=charge) + InvoiceTax
- **CONFLICT:** none
- **DECISION:** implement as charge items
- **STATUS:** EXTRACTED

### R-SOL-5: Reading history from invoice notes
- **RULE:** previous 1.8.0/2.8.0 parsed from last invoice `notes` (format `1.8.0: x | 2.8.0: y`)
- **SOURCE:** `routes_admin.py:651-658`
- **METERVERSE EQUIVALENT:** structured Reading/Consumption history (better)
- **CONFLICT:** none — MeterVerse approach is superior
- **DECISION:** use structured readings, not notes-parsing
- **STATUS:** EXTRACTED (as anti-pattern to avoid)

## B. Settlement Engine (Collection System — VERIFIED RUNTIME)

### R-SET-1: FIXED settlement
- **RULE:** adds fixed amount to invoice subtotal (active settlements only)
- **SOURCE:** `charge_engine.py:87-92`
- **METERVERSE:** none
- **CONFLICT:** none
- **DECISION:** implement as settlement charge items
- **STATUS:** EXTRACTED

### R-SET-2: PERCENTAGE settlement
- **RULE:** amount = subtotal × pct/100, ROUND_HALF_UP to 0.01; skip if 0
- **SOURCE:** `charge_engine.py:93-100`
- **METERVERSE:** none
- **CONFLICT:** none
- **DECISION:** implement
- **STATUS:** EXTRACTED

### R-SET-3: ONE_TIME settlement
- **RULE:** apply once per customer — guard: no existing Transaction with matching description
- **SOURCE:** `charge_engine.py:101-110`
- **METERVERSE:** none
- **CONFLICT:** none
- **DECISION:** implement with CustomerLedgerEntry guard
- **STATUS:** EXTRACTED

## C. Charge Types (Collection System)

### R-CHG-1: STEPS (tiered) — SOURCE `charge_engine.py:23-35` — MeterVerse `applyTariff` already implements → **NO CONFLICT, ALREADY PRESENT**
### R-CHG-2: FLAT (rate × consumption, capped by upper_limit) — SOURCE `:37-43` — MeterVerse `applyTariff` rates → **ALREADY PRESENT (cap optional)**
### R-CHG-3: STATIC (fixed amount) — SOURCE `:45-46` — MeterVerse ChargeRule type "fixed" → **ALREADY PRESENT**
### R-CHG-4: PER_UNIT (rate × consumption, capped) — SOURCE `:48-54` — MeterVerse **MISSING** as explicit type (rate_based exists, cap absent) → **GAP: add upper-limit cap**
### R-CHG-5: ZERO (fixed amount only when consumption == 0) — SOURCE `:56-58` — MeterVerse **MISSING** → **GAP: add zero-reading charge type**

## D. Chilled-Water Settlement (Collection System)

### R-CW-1: Carry-forward settlement
- **RULE:** monthly settlement with version; carry_forward carries previous balance; total = fixed_amount + rate_per_btu × BTU
- **SOURCE:** `tests/test_chilled_settlement.py` (test_settlement_carry_forward)
- **METERVERSE:** none
- **CONFLICT:** none (new capability)
- **DECISION:** business scope review first
- **STATUS:** EXTRACTED (test-level evidence)

## E. SBill Tax Composition (Reference)

### R-TAX-1: labour 15% + tax 1% + VAT 14% — SOURCE SBill architecture report — MeterVerse InvoiceTax/TariffTax can represent → **EXTRACT as seed config**

## F. OBIS Register Semantics

### R-OBIS-1: 1.8.0 = active energy import (consumption) — SOURCE Collection routes_admin — MeterVerse: no register model
### R-OBIS-2: 2.8.0 = active energy export (production) — SOURCE Collection routes_admin — MeterVerse: no register model
### R-OBIS-3: 5.8.0 = combined (Import+Export) — SOURCE AGENTS.md / legacy area systems (MPRTFk Result) — MeterVerse core: no model

## G. Anti-Patterns Extracted (do NOT reuse)

- **AP-1:** Parsing previous readings from invoice `notes` string (R-SOL-5) — MeterVerse uses structured data
- **AP-2:** Arabic-only labels embedded in code (name_ar hardcoded) — MeterVerse uses i18n
- **AP-3:** `description LIKE '%settlement%'` guard for ONE_TIME — fragile; use explicit ledger reference
- **AP-4:** float parsing of readings in routes — use Decimal consistently
