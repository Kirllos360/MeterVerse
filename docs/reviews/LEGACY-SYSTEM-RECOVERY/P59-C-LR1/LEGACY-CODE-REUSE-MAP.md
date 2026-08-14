# LEGACY CODE REUSE MAP — P59-C/LR-1

Exact legacy code → MeterVerse target mapping. **No code copied yet** (implementation gate separate).

## 1. Solar Wallet (highest value)

| LEGACY | METERVERSE TARGET |
|--------|-------------------|
| `charge_engine.py` (concept) | `backend/src/services/business-engine.js` (tariff/invoice pipeline) |
| `routes_admin.py:630-697` solar_invoice | new `backend/src/services/solar-wallet-engine.js` (proposed) |
| `models.py` SolarWalletTransaction | new Prisma `SolarWalletTransaction` (or extend `CustomerLedgerEntry` type="solar_credit") |
| `models.py` Customer.solar_balance | new Prisma `Customer.solarBalance` (or derive from ledger) |
| `models.py` MeterReading.solar_register_180/280 | new Prisma `Reading.obis180`/`obis280` (or `Reading.register` fields) |
| tariff_table [(50,0.48)...] | `TariffTier` rows (existing model) |
| admin_fee 2% + service_fee 9.10 | `InvoiceItem` type="charge" |

**REUSE STRATEGY:** extract algorithm → port to JS/Prisma → structured models (no notes-parsing).

## 2. Settlement Engine

| LEGACY | METERVERSE TARGET |
|--------|-------------------|
| `charge_engine.py:74-112` calculate_settlements | new `backend/src/services/settlement-engine.js` (proposed) |
| `models.py` Settlement (name/type/amount/percentage/is_active) | new Prisma `Settlement` model |
| Settlement applied to subtotal | `InvoiceItem` rows on invoice assembly (business-engine.js assembleInvoice) |
| ONE_TIME guard (Transaction LIKE) | `CustomerLedgerEntry` reference check (explicit, better) |

**REUSE STRATEGY:** port 3-type logic → MeterVerse-native settlement service + model.

## 3. Charge Types

| LEGACY | METERVERSE TARGET |
|--------|-------------------|
| STATIC (`charge_engine.py:45-46`) | `ChargeRule.type="fixed"` (EXISTS) |
| PER_UNIT (`:48-54`) | `ChargeRule.type="rate_based"` + add `upperLimit` cap (GAP) |
| ZERO (`:56-58`) | `ChargeRule.type="zero"` (GAP — new type) |
| STEPS/FLAT | `Tariff.tiers`/`Tariff.rates` (EXISTS) |

**REUSE STRATEGY:** extend ChargeRule `type` enum + add `upperLimit`/`appliesWhenZero` fields.

## 4. Excel Templates

| LEGACY | METERVERSE TARGET |
|--------|-------------------|
| `Solar_Customers_For_Import.xlsx` (55×25: 3-meter serials, unit/zone/floor/building) | `ImportJob` schema for customer+multi-meter bulk import |
| `Solar_Invoices_Import.xlsx` (2797×6: Meter Serial/Month/Amount/Number/Solar Tag/Notes) | `ImportJob` schema for invoice import |
| `Solar_Payments_Import.xlsx` (964×6: Meter Serial/Month/Payment Amount/Method/Solar Tag/Notes) | `ImportJob` schema for payment import |

**REUSE STRATEGY:** adopt column schemas → define ImportJob column-maps (no legacy parser reuse).

## 5. Chilled-Water (evidence-gated)

| LEGACY | METERVERSE TARGET |
|--------|-------------------|
| `ChilledWaterConfig`/`ChilledWaterSettlement` | new models (business scope pending) |
| `tests/test_chilled_settlement.py` | reuse as test-design reference |

**REUSE STRATEGY:** F (needs business evidence) — do not implement yet.

## 6. Cheque / POS / Payment Centers

| LEGACY | METERVERSE TARGET |
|--------|-------------------|
| `models.py` Cheque, POSTerminal, PaymentCenter, BankAccount | new models (evidence-gated) |

**REUSE STRATEGY:** F (needs full model read + lifecycle evidence).

## 7. Symbiot Protocol Knowledge

| LEGACY | METERVERSE TARGET |
|--------|-------------------|
| `all-last-update/sys_n/` (5,952 files, 25+ protocols, OBIS usage) | `backend/src/services/gateway*` / SEP bridge (planned) |

**REUSE STRATEGY:** extract protocol/OBIS inventory → bridge design doc (C: rule extraction).

## 8. Reject (no code reuse — MeterVerse already better)

- flask-login RBAC, fpdf2 reports, Jinja2 templates, IMS HTML, NotificationQueue, BillCycle lookup, JournalEntry (legacy simple) — all covered/surpassed by MeterVerse.

## Code-Reuse Caveats

1. Legacy is Python/Flask/SQLAlchemy; MeterVerse is JS/Prisma — **translation port, never direct copy**.
2. Legacy uses `Transaction` for invoices+payments (single table) — MeterVerse separates `Invoice`/`Payment` — do NOT import the combined-transaction model.
3. Legacy reading history via notes-parsing is an anti-pattern — MeterVerse uses structured `Reading`/`Consumption`.
4. OBIS register storage (1.8.0/2.8.0) requires a model decision first (OBIS-DECISION-MATRIX).
