# P49.5 — Repository Intelligence Report

**Date:** 2026-08-01 · **Branch:** `audit/P49.5-repository-intelligence` · **Mode:** READ-ONLY
**Scope:** All 6 repositories (MeterVerse + 5 legacy/related)

---

## 1. Repository Summary

| # | Repository | Local/clone | Stack | Identity | Status |
|---|---|---|---|---|---|
| 1 | **MeterVerse** (Kirllos360/MeterVerse) | `D:\meter` (working) | Express + Prisma + Next.js 16 + PostgreSQL | **THE enterprise platform** (Wave 1–2 certified, P45–P49 complete, Alpha operational) | ✅ ACTIVE — canonical |
| 2 | **Meter** (Kirllos360/Meter.git) | `D:\meter\Meter` (nested legacy) | NestJS 10 + Next.js + Prisma | Legacy metering/billing platform (637 commits), same lineage as Mete | ⚠️ SUPERSEDED by MeterVerse |
| 3 | **collection-tracker** (Kirllos360) | temp clone | Flask 3 + SQLAlchemy + Jinja2 + PostgreSQL 16 | Bilingual (AR/EN) **billing + debt-collection system** across 8 areas with per-area schema isolation | ⚠️ SEPARATE — collections domain value |
| 4 | **Meter-** (Kirllos360/Meter-.git) | temp clone | NestJS 11 + Next.js 16 (scaffold) | **Fork, early snapshot (~T019)** of Meter Pulse; backend empty (auth+audit only), mock frontend | 🔴 STALE FORK — no unique value |
| 5 | **Meter-** (Abady001/Meter-.git) | temp clone | NestJS 10 + Next.js 16 | **Meter Pulse UPSTREAM (~T065)** — fully implemented PostgreSQL/NestJS rebuild of the metering domain | ⚠️ SUPERSEDED but rich design assets |
| 6 | **Mete** (Kirllos360/Mete.git) | temp clone | NestJS 10 + Prisma 6 + Next.js 16 + PostgreSQL (4 schemas) | **MeterVerse lineage** (120+ models, 22 migrations, sync bridge to Symbiot/sBill) | ⚠️ SUPERSEDED; **contains hardcoded DB credentials** |

## 2. Architecture Comparison

| Aspect | MeterVerse (canonical) | Meter Pulse (Abady001) | Mete | collection-tracker |
|---|---|---|---|---|
| Backend | Express + Prisma (168 models) | NestJS 10 + Prisma (23 models) | NestJS 10 + Prisma (120+ models, 4 schemas) | Flask 3 monolith |
| Frontend | Next.js 16 App Router SPA (93 admin + user) | Next.js 16 + real API hooks | Next.js 16 + feature pages | Jinja2 templates (bilingual RTL) |
| Database | PostgreSQL `meter_pulse` + per-area SQL Server (Symbiot) | PostgreSQL `sim_system` | PostgreSQL 4 schemas (sim_system/core/features/area) + Symbiot/sBill | PostgreSQL per-area schemas (8) |
| Combined channels | ✅ MPRTFk `Result` SQL triggers (5.8.0) | ❌ (only import/export meter id hooks) | ❌ (hooks only) | ❌ |
| Collections | ✅ C13-W04 engine (risk/dunning/PTP/provision) | ✅ aging/dashboard/actions | ✅ aging + dashboard + receipt | ✅ billing + debt KPIs |
| Security | ✅ JWT/RBAC/MFA/audit/CSRF-idempotency | ✅ + throttler/CSRF/hashed-audit | ⚠️ **hardcoded creds** | ✅ CSRF/limiter/lockout |

## 3. Capability Inventory (reusable assets)

### MeterVerse (owns, mature)
Auth/RBAC, org hierarchy, meters, readings+validation, billing, tariffs, invoices, payments, GL/posting, collections, revenue assurance, financial AI/reporting, workflows, tenants, audit, scheduler, ingestion (Symbiot TCP), 267+ tests, P45–P49 certified.

### Meter Pulse / Abady001 (design reference, superseded)
- Full **OpenAPI 3.1 contract** (`meter-pulse-api.yaml`, 563 lines)
- Billing engine design (batch invoice, tax, approval gate >10k, immutable issued, adjustments)
- Reading validation (negative/zero/spike/threshold profiles), water-balance variance
- Payment allocation (oldest-due-first), running-balance ledger
- Security stack: idempotency, CSRF, hashed audit, throttler, refresh tokens, semgrep/spectral CI
- SIM lifecycle + cooldown, meter polling adapter pattern
- 59 deep-coverage docs + test-agent automation pattern

### Mete (lineage, superseded — HIGH RISK)
- `area` schema template (47 tables) — per-area schema blueprint
- 60+ JasperReports `.jrxml` templates (invoice/reports)
- Sync bridge pattern to Symbiot/sBill
- Collections controller (aging/dashboard/receipt)
- **CRITICAL: hardcoded Symbiot DB credentials in source**

### collection-tracker (separate, collections domain)
- Collection KPIs (rate, outstanding, top-50 debtors), tiered tariff engine (4 utilities)
- Excel import/export with validation, PDF receipts/statements, batch ZIP
- Per-area schema isolation (same areas as MeterVerse)
- Bilingual AR/EN UI + i18n dictionary (87 KB)

### Meter (legacy, superseded)
Same NestJS lineage as Mete; chilled-water/gas/settlement/wallet modules; no unique value beyond Mete.

## 4. Reusable Assets (highest value → MeterVerse)

1. **OpenAPI contract** (Abady001) — canonical REST design for a web layer.
2. **JasperReports templates** (Mete) — 60+ report definitions consumable by reporting engine.
3. **Collections KPIs + tariff engine** (collection-tracker) — C13 enrichment.
4. **Security patterns** (Abady001): idempotency, CSRF, hashed audit, throttler.
5. **Per-area schema blueprint** (Mete/collection-tracker) — informs `reverse_engineer_system.sql`.
6. **Reading validation + water-balance logic** (Abady001) — QC layer reference.

## 5. Risks

| Risk | Severity | Detail |
|---|---|---|
| **Hardcoded DB credentials** in Mete | 🔴 CRITICAL | `sync-orchestrator.service.ts` commits Symbiot `sa` password + sBill creds |
| Duplication (same platform ×5) | 🟠 HIGH | MeterVerse, Meter, Mete, Meter Pulse A/B all solve the same domain → 5 sources of truth |
| Superseded repos drift | 🟠 HIGH | Meter Pulse fork (Kirllos360/Meter-) is stale (~T019); Abady001 is canonical upstream |
| Schema philosophy mismatch | 🟡 MEDIUM | Prisma/snapshot vs MPRTFk SQL triggers — code not directly portable |
| collection-tracker single-commit | 🟡 MEDIUM | No migration history; thin tests |
