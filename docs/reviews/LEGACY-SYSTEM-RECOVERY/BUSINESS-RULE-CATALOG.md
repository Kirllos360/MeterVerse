# LEGACY BUSINESS RULE CATALOG

**Extracted from actual legacy evidence (code + docs). No invented rules.**

---

| # | Rule | Source File / Location | Legacy System | Confidence | MeterVerse Relationship |
|---|------|------------------------|---------------|-----------|--------------------------|
| R1 | Tariff charge types: STEPS (tiered), FLAT (rate×consumption), STATIC (fixed), PER_UNIT (capped), ZERO | `app/charge_engine.py:1-50` | Collection | HIGH | MeterVerse TariffTier/TariffRate/TariffVersion covers tiered+flat; STATIC/PER_UNIT/ZERO behavior should be verified |
| R2 | Settlements: FIXED adds amount; PERCENTAGE adds % of subtotal (ROUND_HALF_UP); ONE_TIME guarded against prior application | `app/charge_engine.py:74-112` | Collection | HIGH | MeterVerse has no explicit Settlement entity → **GAP** |
| R3 | Solar net metering: consumption=Δ1.8.0, production=Δ2.8.0, net=max(cons−prod,0), surplus=max(prod−cons,0), wallet_credit=min(wallet_prev,net), billed=max(net−credit,0)×2.23, new_wallet=prev+surplus−credit | `docs/specs/business-rule-discovery.md` (CR 2047 Excel) | Collection | HIGH | MeterVerse has no SolarWalletTransaction → **GAP** |
| R4 | Payments allocate against customer account with ledger entries; PaymentAllocation entity supports multi-method | `app/models.py` (Transaction, PaymentAllocation), `routes_transactions.py` | Collection | MEDIUM | MeterVerse has PaymentTransaction + CustomerLedgerEntry — allocation algorithm should be compared |
| R5 | Readings above configured thresholds route to review (ReadingReview, ReadingThreshold) | `app/models.py` | Collection | MEDIUM | MeterVerse has Reading status + ValidationRule — overlap |
| R6 | Chilled-water consumption settlement with dedicated config (17 settlements / 31 invoices in operational PDFs) | `ChilledWaterConfig`, `ChilledWaterSettlement`, docs | Collection | MEDIUM | MeterVerse has no chilled-water module → **GAP** |
| R7 | Tax/fee composition: labour 15% + tax 1% + VAT 14% (October billing) | `reference\sbill\architecture\01-legacy-core-architecture-report.md` | SBill | HIGH | MeterVerse has InvoiceTax + TariffTax — rules should be mirrored for Palm Hills |
| R8 | Meter read scheduling + validation + aggregation (MDM) over 25+ protocols | `reference\all-last-update\sys_n\README.md` | Symbiot | HIGH | MeterVerse SEP/symbiot bridge targets this |
| R9 | Payment via Fawry gateway + push notifications (Firebase) + email (SMTP) | `reference\sbill\01-legacy-core-architecture-report.md` | Energy360/SBill | HIGH | MeterVerse has PaymentGateway + notification engine |

---

## Notes

- R1–R6 extracted from **Collection System** (Python source + business-rule-discovery doc).
- R7 from **SBill** (architecture report — tax percentages).
- R8 from **Symbiot** (AMI/MDM behavior).
- R9 from **Energy360/SBill** (payment gateway + notifications).
- Every rule cites its evidence file. Rules marked MEDIUM confidence require source-trace confirmation before reuse decisions.
