# P49.6 — Enterprise Capability Map

**Date:** 2026-08-01 · **Branch:** audit/P49.6-capability-consolidation
**Source:** P49.5 repository intelligence + P48 EOS + tracker (v8.10.0)
Classification: **Complete** · **Partial** · **Missing** · **Rejected**

---

## 1. Complete (implemented, certified)

| Capability | Evidence | Program |
|---|---|---|
| Auth / JWT / MFA / Sessions | auth.js, auth-engine, P46 S1 | C12 |
| RBAC / Permissions / Scopes | security.js, P46 S3 | C12 |
| Org hierarchy (Area/Project/Zone/Unit) | locations.js, seed-org, P46 S2 | C14/W3 (base) |
| Meter lifecycle | meters.js + meter-assignments, P46 S6 | C16 base |
| Reading intake + validation | readings.js, P46 S7 | C17 base |
| Tariff engine (versioned) | tariff-engine.js, P45 | C13 |
| Invoice + issue + GL posting | invoices.js + posting-engine, P46 S8 | C13 |
| Payments + allocations | payments.js, P46 S8 | C13 |
| GL / Journal / Trial balance | accounting.js, P46 | C13 |
| Collections engine (risk/dunning/PTP) | collections.js, P45 | C13 |
| Revenue assurance (15 rules) | revenue-assurance.js, P45 | C13 |
| Financial AI (forecast/MC/scenario) | financial-ai.js, P45 | C13 |
| Financial reporting (P&L/BS/CF) | financial-reports.js, P45 | C13 |
| Workflow/BPM | workflows.js, P45 | C23 |
| Multi-tenant (C22 models) | tenants.js, P45 | C22 |
| Audit + activity | audit middleware, P46 S9 | C12 |
| Scheduler / runtime / monitoring | scheduler-engine, P45 | C19 |
| Ingestion (Symbiot TCP + polling) | ingestion-runtime, P45-K | C19 |
| Real data pages (accounting, collections, alerts, revenue, financial-AI) | P49 activation | C13 |

## 2. Partial (exists, needs enhancement)

| Capability | Current | Gap | Program |
|---|---|---|---|
| Invoice immutability | issued → immutable | no hash/QR verification | C13/C24 |
| Notifications | engine exists | SMTP/SMS delivery placeholder | C25 |
| Import/Export | crud-service basic | no validated template flows | C24 |
| PDF/reports | pdf-engine basic | no Jasper template library | C13/C17 |
| OpenAPI | swagger.js partial | no full contract | C20 |
| Collections KPIs | engine has aging | no collection-rate/top-debtor dashboards | C13 |
| User portal | admin-reskin (P49 fixed nav) | true self-service portal | C14 |
| Documents | legacy StoredFile | governance/records models | C24 |
| Password policy | lockout only | no min-length/rotation policy | C12 |
| Consumption analytics | reports basic | no user-facing charts | C14/C17 |

## 3. Missing (needs future planning)

| Capability | Source repo | Priority | Phase |
|---|---|---|---|
| Settlement / wallet / chilled-water / gas | Mete | HIGH | Wave 5 / C13 follow-on |
| Tickets / support / claims | Mete, Abady001 | HIGH | **C14 Wave 3** |
| Invoice hash/QR | Mete | HIGH | C24 / C13 |
| Robust Excel import/export | collection-tracker | MED | C24 |
| Jasper template library | Mete | MED | C13/C17 |
| OpenAPI contract | Abady001 | MED | C20 |
| Collection KPIs | collection-tracker | MED | C13 |
| Bank reconciliation (C13-W05) | none | MED | C13-W05 |
| Password policy service | Abady001 | LOW | C12 |

## 4. Rejected (exists elsewhere, should NOT enter MeterVerse)

| Item | Source | Why rejected |
|---|---|---|
| Hardcoded DB credentials | Mete (sync-orchestrator) | **Security** — never inherit secrets (OBS-063) |
| Flask/Jinja monolith UI | collection-tracker | Superseded by Next.js EOS shell |
| SQLite template (User/Post) | Meter Pulse forks | Dead starter code |
| Boilerplate GitHub workflows | Meter- fork | Generic defaults, low value |
| Stale fork (Kirllos360/Meter-) | ~T019 | Superseded by Abady001 upstream |
| Per-repo duplicate shells | Meter, Mete, Meter Pulse | One canonical MeterVerse only |
