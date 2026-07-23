# Enterprise Capability Roadmap

## Purpose
Map every business capability to the waves that deliver it, enabling maturity tracking across the platform.

## Legend
- PRODUCTION (live)
- BUILDING (active wave)
- PLANNED (upcoming wave)
- NOT_STARTED

## Capability Maturity Matrix

| Capability | W01 | W02 | W03 | W04 | W05 | W06 | W07 | W08 | W09 | W10 | Maturity |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:--------:|
| **Customer Management** | PROD | PROD | PROD | PROD | PROD | PROD | PROD | PROD | PROD | PROD | **100%** |
| **Meter Management** | PROD | PROD | PROD | PROD | PROD | PROD | PROD | BUILD | PROD | PROD | **95%** |
| **Reading Pipeline** | PROD | PROD | PROD | PROD | PROD | PROD | PROD | BUILD | PROD | PROD | **95%** |
| **Billing** | PROD | PROD | BUILD | PROD | PROD | PROD | BUILD | PROD | PROD | PROD | **85%** |
| **Finance** | PLAN | PLAN | PLAN | PLAN | PLAN | PLAN | BUILD | PLAN | PLAN | PLAN | **25%** |
| **Collections** | PLAN | PLAN | PLAN | PLAN | PLAN | PLAN | BUILD | PLAN | PLAN | PLAN | **25%** |
| **Notifications** | NONE | BUILD | PROD | PROD | PROD | PROD | PROD | PROD | PROD | PROD | **60%** |
| **AI & Intelligence** | NONE | NONE | NONE | NONE | BUILD | NONE | NONE | NONE | NONE | PLAN | **10%** |
| **Reporting** | PLAN | PLAN | PLAN | PLAN | BUILD | PROD | PROD | PROD | PROD | PROD | **50%** |
| **Infrastructure** | PROD | PROD | PROD | BUILD | PROD | PROD | PROD | PROD | PROD | PROD | **90%** |
| **Administration** | PROD | BUILD | PROD | PROD | PROD | PROD | PROD | PROD | BUILD | PROD | **90%** |
| **Customer Portal** | NONE | NONE | NONE | NONE | NONE | BUILD | NONE | NONE | NONE | NONE | **5%** |
| **Field Operations** | NONE | NONE | NONE | NONE | NONE | BUILD | NONE | NONE | NONE | NONE | **5%** |
| **Multi-Area** | PROD | PROD | PROD | BUILD | PROD | PROD | PROD | PROD | BUILD | PROD | **85%** |
| **SYMBIOT Integration** | NONE | NONE | NONE | NONE | NONE | NONE | NONE | BUILD | NONE | NONE | **10%** |

## Capability Detail

### Customer Management (100%)
- W01: Customer CRUD, area, status, contacts
- W02: Customer search, tasks, preferences
- W03: Customer tariff assignment
- W05: Customer analytics
- W06: Customer self-service portal
- W08: Customer-meter hierarchy
- W09: Multi-area customer view

### Meter Management (95%)
- W01: Meter CRUD, types, status, MP links
- W02: Meter search
- W08: SIM card mgmt, meter control center
- W09: Cross-area meter view

### Billing (85%)
- W01: Invoice model, basic invoice generation
- W02: Invoice search
- W03: Tariff engine, billing pipeline, bill runs
- W07: Invoice adjustments, credit notes, ledger

### Finance (25%)
- W07: Customer ledger, accountant ledger, payment center, collection automation, financial reports

### AI (10%)
- W05: AI engine, analytics, automation, integrations
- W10: Smart alerts, chat engine, predictive analytics, digital twin

### Reporting (50%)
- W01: Basic KPI definitions
- W05: Analytics dashboards
- W06: Enterprise reports

### Infrastructure (90%)
- W01: Schema, auth, permissions, indexes
- W04: Performance, security, multi-tenancy, observability, DR

### Administration (90%)
- W01: User mgmt, role mgmt, area config
- W02: Admin control panels, system config hub

### Customer Portal (5%)
- W06: Mobile API, customer dashboard

### Field Operations (5%)
- W06: Field operator mobile API

### SYMBIOT Integration (10%)
- W08: Full integration, measurement point sync, reading pipeline

## How to Use
1. Find the capability you care about (e.g., "Billing")
2. Scan horizontally: which waves touch it?
3. Read maturity: percentage tells you how complete it is
4. If planning a task, check it improves at least one capability

---
*Last updated: 2026-07-23*
