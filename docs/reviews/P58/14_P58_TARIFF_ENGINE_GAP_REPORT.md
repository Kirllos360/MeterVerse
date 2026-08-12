# P58 — TARIFF ENGINE GAP REPORT
**Date:** 2026-08-12

## CURRENT CAPABILITIES (verified)
**Models present (11):** Tariff, TariffRate, TariffTier, TariffVersion, TariffVersionRate, TariffVersionTier, TariffToUSchedule, TariffDemandRate, TariffFixedCharge, TariffTax, TariffChangeLog
**Service:** tariff-engine.js (calculate/simulate) with ToU ✓, tiered ✓, demand ✓, fixed ✓, tax ✓, rounding ✓

## EGYPTIAN BUSINESS REQUIREMENTS vs CURRENT
| Requirement | Current | Gap |
|-------------|---------|-----|
| Tariff categories/slabs/tiers | ✓ TariffTier | — |
| Consumption ranges | ✓ | — |
| Fixed/service charges | ✓ TariffFixedCharge | — |
| Taxes | ✓ TariffTax | — |
| Effective dates / history | ✓ TariffVersion + TariffChangeLog | — |
| Customer category / meter type | ✓ (via tariffs) | verify binding |
| Area / project | partial (Project.taxRate, taxEnabled) | area-level tariff binding? |
| Exemptions | — | GAP |
| Rounding / min charge | rounding ✓, **min charge?** | verify |
| Billing period / prorating | — | GAP |
| Adjustments | — | GAP |
| Retroactive tariff changes | — | GAP |
| **Egyptian fee chain: Labour 15% → Tax 1% → VAT 14% on (consumption+labour+tax)** | **NOT verified/replicated** | **CRITICAL GAP (OBS-024)** |

## VERDICT
**PARTIAL** — a production engine exists (tiered/ToU/demand/fixed/tax), but:
1. The **canonical Egyptian fee chain from sbill** is not confirmed replicated
2. **Real per-area Egyptian tariff values** exist only as binary (xlsx/rar) in `Meter/reference/meter-department/Tariffs` — need extraction + seeding
3. Prorating, adjustments, retroactive changes, min-charge not implemented

## GAP PLAN (priority)
1. **P1:** Verify tariff-engine output vs sbill formulas (labour/tax/VAT chain) — unit tests against legacy examples
2. **P1:** Extract + seed real per-area tariffs (meter-department xlsx) into Tariff/Version/Rate/Tier
3. **P2:** Add prorating + min-charge enforcement
4. **P3:** Adjustments + retroactive tariff versioning
5. **P3:** Area/project tariff binding model
