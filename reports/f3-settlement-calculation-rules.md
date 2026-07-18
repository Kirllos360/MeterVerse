# Phase F3 — Settlement Calculation Rules

## Settlement Document Structure

Each settlement is a per-tenant PDF/XLSM document with this layout:

```
Header:
  Project: Golf Central Mall (مول الجولف سنترال)
  Address: (full address)
  Customer: (tenant name)
  Tax Card: (tax ID)
  Commercial Registry: (registration)
  Unit: (unit number, e.g., A-02-G)
  Contract: Chilled Water (مياة مثلجة)
  Month: (e.g., اغسطس 2025)
  Issue Date: (date)

Body:
  Previous Reading | Current Reading | Consumption | Rate | Total
  Fees/Stamps (رسوم ودمغات): 0
  Admin/Other (مصاريف إدارية): 0
  Total Amount Due: (المبلغ الإجمالي المطلوب)
  
  Amount in Words
```

## Settlement Calculation Formula

### Standard Rate Cases
```
Total = Consumption × Rate_per_BTU

Where:
  Consumption = Current_Reading - Previous_Reading
  Previous_Reading = 0 (first settlement) or last month's current reading
  Fees/Stamps = 0
  Admin/Other = 0
  No taxes applied
```

### Verification Against XLSM Data

| Tenant | Unit | Prev | Current | Cons | Rate | Total | Formula |
|--------|------|------|---------|------|------|-------|---------|
| Mon Maki | D1-08-G | 0 | 2,580 | 2,580 | 3.0 | 7,740 | 2580 × 3.0 = 7,740 ✓ |
| GIGI Cairo | D1-05-G | 0 | 3,088.667 | 3,088.667 | 3.0 | 9,266 | 3088.667 × 3.0 = 9266 ✓ |
| AirZon | A-02-G | 0 | 7,627.869 | 7,627.869 | 2.44 | 18,612 | 7627.869 × 2.44 = 18612 ✓ |

### Per-Customer Rate Variation
Rate is **not always 3.0** — it can be configured per customer:
- **Mon Maki**: 3.0 EGP/BTU (default/standard)
- **GIGI Cairo**: 3.0 EGP/BTU
- **AirZon**: 2.44 EGP/BTU (custom rate)

This confirms the `ChilledWaterConfig.base_btu_rate` field is actively used.

## Meter Verse Settlement Engine

### ChilledWaterConfig Model (`models.py:285`)
```
base_btu_rate:         Decimal(12,4), default 3.0
monthly_fixed_amount:  Decimal(12,2), default 0
admin_fee:             Decimal(12,2), default 0
service_fee:           Decimal(12,2), default 0
is_active:             Boolean
```

### ChilledWaterSettlement Model (`models.py:262`)
```
btu_consumption:       Decimal(12,3)
rate_per_btu:          Decimal(12,4), default 3.0
fixed_amount:          Decimal(12,2), default 0
variable_amount:       Decimal(12,2), default 0
total_amount:          Decimal(12,2)
carry_forward:         Decimal(12,2), default 0
previous_balance:      Decimal(12,2), default 0
version:               Integer (≥1)
status:                DRAFT / APPROVED / CANCELLED
```

### Settlement Lifecycle (`routes_chilled_settlement.py`)

**1. First-Time Setup** (POST to `/chilled-water/settlement/config`):
```
1. Deactivate any existing config for (customer, meter)
2. Create ChilledWaterConfig
3. Create initial ChilledWaterSettlement (v1, DRAFT)
   - settlement_date = first of current month
   - rate_per_btu = base_btu_rate (from config)
   - fixed_amount = monthly_fixed_amount
   - total_amount = fixed_amount
   - version = 1
   - previous_balance = 0
   - carry_forward = 0
```

**2. Monthly Settlement Creation** (POST to `/chilled-water/settlement/create`):
```
1. Find active ChilledWaterConfig for (customer, meter)
2. If no config → first-time setup redirect
3. Find previous settlement (highest version) for that customer/meter
4. Create new settlement:
   - settlement_date = first of current month
   - fixed_amount = config.monthly_fixed_amount
   - rate_per_btu = config.base_btu_rate
   - total_amount = fixed_amount
   - carry_forward = prev.carry_forward (or 0)
   - previous_balance = prev.total_amount (or 0)
   - version = 1
   - status = DRAFT
```

**3. Settlement Edit** (POST to `/chilled-water/settlement/{id}/edit`):
```
EDIT GUARD: Blocked if active Transaction exists for same customer/month
            with description containing 'مياه مثلجة'

Calculation:
  variable_amount = btu_consumption × rate_per_btu
  total_amount = fixed_amount + variable_amount
                 (or overridden by user via total_amount form field)

New version created (append-only):
  version = prev.version + 1
  status = DRAFT
  previous_balance = prev.total_amount
  carry_forward = user-specified
```

**4. Settlement Approval** (POST to `/chilled-water/settlement/{id}/approve`):
```
  status = APPROVED
  approved_by = current_user
  approved_at = UTC now
```

**5. Automatic Invoice via Readings** (`routes_readings.py:145-152`):
```
1. calculate_charges() → subtotal (consumption-based)
2. calculate_settlements(subtotal) → applies FIXED/PERCENTAGE/ONE_TIME
3. Total = subtotal + settlement_total
```

## Two Settlement Systems

### System 1: General Settlement (`charge_engine.py:calculate_settlements`)
- Uses `Settlement` model (not ChilledWaterSettlement)
- Types: FIXED (add amount), PERCENTAGE (% of subtotal), ONE_TIME (once per customer)
- Applied during automatic invoice generation from MeterReading
- Not specific to chilled water — used for electricity/water adjustments

### System 2: Chilled Water Settlement (`routes_chilled_settlement.py`)
- Uses `ChilledWaterSettlement` model (versioned, per customer/meter/month)
- Versioned (append-only), workflow (DRAFT → APPROVED)
- Carry-forward tracking (previous_balance, carry_forward)
- Config per customer (base_btu_rate, monthly_fixed_amount)
- Separate from Transaction/invoice system
- Uses cooling BTU consumption, not electrical kWh or water M3

## Key Differences from Electricity/Water Billing

| Aspect | Electricity/Water | Chilled Water |
|--------|------------------|---------------|
| Pricing | Multi-tier (STEPS) | Flat rate (3.0 EGP/BTU) |
| Taxes/Service | Applied | None |
| Meter type | kWh / M3 | BTU (cooling) |
| Settlement model | General (FIXED/%) | Chilled-specific (versioned) |
| Carry-forward | No | Yes |
| Approval workflow | No | Yes (DRAFT → APPROVED) |
| Per-customer rate | Via tariff only | Via ChilledWaterConfig |

## Confirmed Rules for Settlement Reconstruction

| Rule | Formula | Evidence |
|------|---------|----------|
| Consumption | Current − Previous (≥ 0) | XLSM settlement files |
| Base rate | 3.0 EGP/BTU (configurable) | `__init__.py`, `routes_chilled_settlement.py` |
| Variable amount | Consumption × rate | `routes_chilled_settlement.py:107` |
| Total (auto) | fixed_amount + variable_amount | `routes_chilled_settlement.py:108` |
| Total (manual) | User override accepted | `routes_chilled_settlement.py:108` |
| Fees | Always 0 | Settlement XLSM (رسوم ودمغات = 0) |
| Admin | Always 0 | Settlement XLSM (مصاريف إدارية = 0) |
| Carry-forward | From previous settlement | `routes_chilled_settlement.py:49-50` |
| Versioning | Append-only, incrementing | `routes_chilled_settlement.py:117` |
