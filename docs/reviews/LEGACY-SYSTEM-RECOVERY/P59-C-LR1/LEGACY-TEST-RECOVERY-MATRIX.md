# LEGACY TEST RECOVERY MATRIX — P59-C/LR-1

Legacy tests found and their reusable knowledge.

## Collection System Tests (evidence)

| Test File | Coverage | Reusable Knowledge | MeterVerse Equivalent Test |
|-----------|----------|--------------------|---------------------------|
| `tests/test_chilled_settlement.py` | Chilled-water settlement: first-time config (version=1, DRAFT), carry-forward (version increments, carry_forward carries prev balance, total = fixed + rate×BTU) | **Exact settlement carry-forward rules + edge cases** | (no chilled module yet) — reuse as test-design |
| `tests/test_comprehensive.py` | Translation key parity (AR=EN), model imports, 27 features | Smoke-test pattern; i18n parity check | MeterVerse has i18n (676 keys per AGENTS) — reuse parity-check idea |
| `tests/run_tests.py` | Test runner | — | — |

## Solar Wallet Test Knowledge (extracted from runtime, no dedicated test)

- consumption/production/net/surplus math (R-SOL-1/2)
- tariff tier boundaries [(50,0.48)…(1000,1.58), >1000 @ 1.68]
- admin fee 2% + service fee 9.10
- wallet CREDIT only on surplus; balance_before/after recorded
- Edge cases: zero production → no credit; production > consumption → surplus; prev readings from last invoice

## Settlement Test Knowledge (extracted from charge_engine)

- FIXED: adds amount
- PERCENTAGE: subtotal × pct, ROUND_HALF_UP, skip if 0
- ONE_TIME: guarded by existing transaction match
- Edge: only active settlements apply

## Missing MeterVerse Tests Identified (from legacy evidence)

1. Tiered tariff boundary tests matching solar tariff table (if solar implemented)
2. Settlement engine unit tests (FIXED/PERCENT/ONE_TIME)
3. Net-metering math tests (net/surplus/wallet-credit)
4. Zero-consumption charge tests (legacy ZERO type)

## Test-Reuse Recommendation

- Adopt legacy test **scenarios/expected values** as MeterVerse test fixtures (language differs — write Vitest).
- Do NOT port pytest code; translate the business assertions.
- The chilled-water carry-forward test is the strongest single reusable test artifact.
