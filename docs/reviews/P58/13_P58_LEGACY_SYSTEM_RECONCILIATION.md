# P58 — LEGACY SYSTEM RECONCILIATION REPORT
**Date:** 2026-08-12 · **Source:** D:\meter\Meter\reference\ (skimmed; analysis only)

## LEGACY SYSTEMS & CLASSIFICATION
| System | Stack | Business value | Class |
|--------|-------|----------------|-------|
| **collection-system** | Flask 3.1.3 + PG16, 8 per-area schemas, ~140 routes | Customer/Transaction/Invoice model, 6-level roles + custom roles, per-area `search_path` isolation, invoice status badges, solar/chilled-water reading notes w/ OBIS codes (1.8.0/2.8.0), "Add Capacity" cumulative sums | **ADAPT** — business rules → collections-engine.js + CustomerRiskProfile (rebuild in Node/Prisma) |
| **sbill** (October Billing) | Java/.NET + SQL Server, Hangfire cron | Monthly cycle cron, tariff by meter-type/tier/category, charge groups 0-4, **canonical fee chain: Labour 15% → Tax 1% → VAT 14% on (consumption+labour+tax)**, duplicate-billing guard, SEP2 read pull (resultTypeId 10 elec / 100 water), JasperReports templates, hidden rules (shared JWT, graceHours −1 vs 2) | **REUSE formulas + REDESIGN arch** — C13 tariff engine must replicate the fee chain (NOT yet, OBS-024) |
| **symbiot** | Iskraemeco AMI/MDM 3.16, 5,952 files | MPRTFk Result schema (MPRTFk, ResultTimeStamp, ResultValue, Status) — **live foundation of all 3 areas**, SEP2, protocol DLLs, WCF/SignalR topology | **REUSE** — symbiot-bridge.js + ingestion-runtime.js already reimplement bridge |
| **energy-360 / meter-pulse** | NestJS + Prisma (direct ancestor) | Millieme storage (÷1000), VAT/Tax/Labour chain, auto-disconnect at zero balance, Fawry HMAC + Kashier payments, SEP2 poll, Arabic invoice watermark, idempotency (PaymentOrderIdAlreadyProcessed) | **REUSE** — design assets + API contract already consumed |
| **ims** | static HTML/CSS/JS theme | UI-only, no backend | **REJECT** (code) — design reference only |
| **meter-department** | Tariffs folder (binary xlsx/rar + PNG) | **Authoritative per-area Egyptian tariff values** (Electricity+Water: October, Badya, EDNC, New Cairo, EV tariffs 05-2026) | **REUSE** — data source for seeding C13 tariff engine (needs extraction) |
| **all-last-update** | disguised file vault ("Windows System Health Monitor", Task Scheduler, DPAPI, hardcoded creds in README) | none — security hazard | **REJECT (SECURITY)** — never inherit |
| **sbill-login** (stray file) | Playwright a11y dump | confirms Iskraemeco Angular portal | **REUSE** (evidence) |

## EXTRACTION RULES (for future implementation)
1. Business rules → implement in Node/Prisma services (NOT copy old code)
2. Egyptian fee chain + tariff values → verify against C13 tariff-engine (OBS-024 follow-up)
3. MPRTFk/SEP2 schema → already live; keep symbiot-bridge
4. Credentials in any reference → never inherit (SEC-04)

## CURRENT PLATFORM MATURITY vs LEGACY
MeterVerse already exceeds legacy (real models, engines, RBAC, audit, tests). Legacy value is **business rules + tariff data + SEP2 integration patterns**, not code.
