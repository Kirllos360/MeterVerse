# SOLAR WALLET IMPLEMENTATION CONTRACT — P59-C/LR-2 (Track E)

**Status:** PREPARED BUT BLOCKED — requires OBIS model decision (approval artifact) before production implementation. No directional data invented.

## 1. Verified Legacy Formula (runtime, routes_admin.py:630-697)

```
prev_180, prev_280  = parsed from previous invoice notes (legacy) OR structured readings (MeterVerse)
consumption = max(current_180 - prev_180, 0)
production  = max(current_280 - prev_280, 0)
net         = max(consumption - production, 0)
surplus     = max(production - consumption, 0)
if surplus > 0:
    wallet += surplus                     # CREDIT transaction (balance_before/after)
# Tariff (as-built, tiered):
amount = 0; remaining = net
for (limit, rate) in [(50,0.48),(100,0.58),(150,0.68),(200,0.78),(300,0.88),
                      (400,0.98),(500,1.08),(600,1.18),(700,1.28),
                      (800,1.38),(900,1.48),(1000,1.58)]:
    chunk = min(remaining, limit); amount += chunk*rate; remaining -= chunk
if remaining > 0: amount += remaining * 1.68
admin_fee   = round(amount * 0.02, 2)
service_fee = 9.10
total       = round(amount + admin_fee + service_fee, 2)
```

## 2. Verified Test Vectors (from legacy behavior)

| Case | prev180 | curr180 | prev280 | curr280 | net | surplus | wallet credit | amount (tiered) | total |
|------|---------|---------|---------|---------|-----|---------|---------------|-----------------|-------|
| A: consume only | 100 | 200 | 0 | 0 | 100 | 0 | 0 | 50×0.48+50×0.58=53.00 | 53+1.06+9.10=63.16 |
| B: produce only | 0 | 0 | 50 | 150 | 0 | 100 | 100 | 0 | 0+0+9.10=9.10 |
| C: net + surplus | 100 | 250 | 50 | 180 | 150 | 30 | 30 | 50×0.48+50×0.58+50×0.68=87.00 | 87+1.74+9.10=97.84 |
| D: equal | 100 | 200 | 50 | 150 | 0 | 0 | 0 | 0 | 9.10 |
| E: zero consumption | 100 | 100 | 50 | 50 | 0 | 0 | 0 | 0 | 9.10 |

Note: these are **expected-value vectors for MeterVerse tests** derived from the legacy formula; they must be re-validated against business rules before production.

## 3. MeterVerse-Native Mapping (no directional commit)

| Legacy | MeterVerse target (proposed) | OBIS-dependent? |
|--------|------------------------------|-----------------|
| reading_180 / reading_280 | `Reading.obis180` / `Reading.obis280` (Option A) | **YES — gated** |
| customer.solar_balance | `CustomerLedgerEntry` type="solar_credit" (or Customer.solarBalance) | No |
| SolarWalletTransaction | `CustomerLedgerEntry` with reference metadata | No |
| tariff table | `TariffTier` rows | No |
| admin_fee / service_fee | `InvoiceItem` type="charge" | No |
| invoice notes parsing | structured `Reading`/`Consumption` (anti-pattern rejected) | No |

## 4. Service Boundary

- New `solar-wallet-engine.js`: `computeSolar(reading180, reading280, prev180, prev280, tariff)` → {consumption, production, net, surplus, walletCredit, amount, adminFee, serviceFee, total}
- Pure function — unit-testable without DB.
- Ledger/invoice persistence via existing `CustomerLedgerEntry`/`InvoiceItem`/`Invoice`.

## 5. Dependency Graph

```
OBIS DECISION (approval)  →  Reading.obis180/obis280  →  solar-wallet-engine  →  tariff → invoice/ledger
         │                                                        ↑
         └────── (safe independent work: tariff tiers, fees, test vectors, contract)
```

## 6. What Is Safe to Implement Now (independent of OBIS)

- Pure compute function with the tiered tariff + fees (works with net consumption input; directional registers not required if input is pre-computed net)
- Tariff tier seed data
- Test vectors
- This contract

## 7. BLOCKED Portion

- Storing directional readings (obis180/obis280) in `Reading`
- Production solar reading capture requiring registers
- Any behavior that invents directional data

## 8. Approval Request (precise)

**REQUIRED APPROVAL:** Add nullable `obis180` + `obis280` fields to `Reading` (Option A) — or approved alternative (Option E: both combined + directional). This is required before solar net-metering production implementation. See OBIS-COMPATIBILITY-DECISION-MATRIX (P59-C/LR-1) for full comparison.
