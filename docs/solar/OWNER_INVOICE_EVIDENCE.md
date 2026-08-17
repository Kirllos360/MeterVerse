# MeterVerse Solar Invoice — Owner Invoice Evidence

**Date:** 2026-08-17 · **Status:** BROWSER-CERTIFIED LIVE

## Evidence Table

| # | Question | Answer | Source | REAL/DERIVED | Verified |
|---|----------|--------|--------|--------------|----------|
| 1 | Which customer owns the meter? | ايهاب امام حسنين شافعي (Ihab Shafie), id `f881de8e` | meter_pulse `Customer` + psql + API | REAL | ✅ browser + psql + API |
| 2 | Which meter produced the reading? | Meter `52051449`, type **solar**, id `57cc414c` | meter_pulse `Meter` + API | REAL | ✅ psql + API |
| 3 | How is a reading associated with that meter? | `Reading.meterId → Meter.id` (FK); meter resolved by unique serial `52051449` | schema.prisma `Reading`/`Meter` + symbiot-bridge `ingestReading` | CODE | ✅ source + live |
| 4 | Which tariff was selected? | Solar tariff (12 tiers 0.48–1.58 EGP/kWh, >1000 @1.68, 2% admin, 9.10 service) | `solar-wallet-engine.js` `SOLAR_TARIFF_TIERS` | CODE (verified Collection formula) | ✅ unit tests |
| 5 | Why that tariff? | Meter type = solar → solar engine formula; reproduces real Collection rule | solar-wallet-engine + replay report | CODE/REAL anchor | ✅ |
| 6 | How is consumption calculated? | `consumption = max(curr180 − prev180, 0)` | solar-wallet-engine `computeSolar` | CODE | ✅ unit tests |
| 7 | How is the invoice amount calculated? | `amount = tiered tariff(net)` + 2% admin + 9.10 service = total | solar-wallet-engine `computeSolar` | CODE | ✅ unit tests |
| 8 | How is the PDF generated? | `POST /api/pdf/invoices/:id` → `pdf-engine.generateInvoicePdf` (bilingual, Tahoma) | routes/pdf.js + pdf-engine.js | CODE | ✅ live API + file |
| 9 | How is it shown in the app? | MeterVerse OS Admin (:3535) renders full shell; customer/meter/invoice reachable | browser (Playwright) | REAL | ✅ browser render |

## Real Sample Invoices + PDFs

| Invoice | Period | Amount | PDF |
|---------|--------|--------|-----|
| SOLAR-52051449-2021-01 | Jan 2021 | 36.10 | ✅ invoice-SOLAR-52051449-2021-01.pdf (23,649 B) |
| SOLAR-52051449-2021-02 | Feb 2021 | 36.10 | ✅ invoice-SOLAR-52051449-2021-02.pdf (23,637 B) |
| SOLAR-52051449-2021-03 | Mar 2021 | 36.10 | ✅ invoice-SOLAR-52051449-2021-03.pdf (23,632 B) |
| SOLAR-52051449-2022-09 | Sep 2022 | 1,426.10 | ✅ invoice-SOLAR-52051449-2022-09.pdf (23,679 B) |
| SOLAR-52051449-2026-04 | Apr 2026 | 471.51 | ✅ invoice-SOLAR-52051449-2026-04.pdf (23,437 B) |

All PDFs located in `backend/pdf-output/`.

## Data Provenance
- **REAL:** customer, meter, meter→customer link, 65 invoices, 23 payments, all amounts (reconcile to source xlsx + replay report), generated PDFs.
- **DERIVED:** register 54.26 kWh (read-only pipeline proof only; **not** a real reading).
- **UNKNOWN:** raw 180/280 register history (absent in every accessible copy; no live Collection/Symbiot/SEP source reachable). The 36.10 amount is the **real historical solar minimum**, not a derived calculation.

## Live URLs (browser-certified)
- **Admin:** http://localhost:3535 (local) / http://192.168.1.2:3535 (LAN)
- **Portal:** http://localhost:3030 (local) / http://192.168.1.2:3030 (LAN)
- **Admin API:** http://localhost:3131/api · **Portal API:** http://localhost:3003/api
- **Login:** admin@meterverse.com / Admin@123
