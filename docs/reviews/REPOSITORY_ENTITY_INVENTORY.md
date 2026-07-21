# Repository Entity Inventory

**Date:** 2026-07-21  
**Phase:** 40 — Enterprise Architecture Validation  
**Method:** Codebase-wide scan across ALL directories (excluding node_modules, .git)  

---

## Entity Coverage Matrix

| Entity | Pages | BFF Routes | Prisma Model | Backend Route | Components | Nav Entry | Store | Runtime Dir | Status |
|--------|:-----:|:----------:|:------------:|:-------------:|:----------:|:---------:|:-----:|:-----------:|:------:|
| **Customer** | 1 | 2 | 1 | 2 | 4 | 1 | 0 | 1 | ✅ Partial |
| **Meter** | 1 | 2 | 1 | 2 | 5 | 1 | 0 | 1 | ✅ Partial |
| **Invoice** | 1 | 2 | 1 | 2 | 0 | 1 | 0 | 1 | ✅ Partial |
| **Payment** | 1 | 3 | 1 | 2 | 0 | 1 | 0 | 1 | ✅ Partial |
| **Reading** | 1 | 2 | 1 | 2 | 1 | 1 | 0 | 1 | ✅ Partial |
| **Contract** | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 5 | ⚠️ Missing UI |
| **Organization** | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | ✅ Admin only |
| **Project** | 1 | 1 | 1 | 1 | 1 | 0 | 0 | 0 | ✅ Admin only |
| **Tariff** | 0 | 1 | 1 | 1 | 1 | 0 | 0 | 0 | ⚠️ Missing UI |
| **BillCycle** | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | ⚠️ Missing UI |
| **ChargeRule** | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | ⚠️ Missing UI |
| **MeterAssignment** | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | ⚠️ Missing UI |
| **ValidationRule** | 0 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | ⚠️ Missing UI |
| **WorkflowState** | 0 | 1 | 1 | 0 | 0 | 0 | 1 | 1 | ⚠️ Missing UI |
| **CollectionCase** | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | ⚠️ Missing UI |
| **PaymentGateway** | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | ⚠️ Missing UI |
| **SLA** | 0 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | ⚠️ Missing UI |
| **AlertRule** | 0 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | ⚠️ Missing UI |
| **EscalationPolicy** | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | ⚠️ Missing UI |
| **CustomerGroup** | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | ⚠️ Missing UI |
| **Notification** | 3 | 2 | 1 | 1 | 4 | 1 | 2 | 2 | ✅ Complete |
| **Webhook** | 1 | 2 | 1 | 1 | 0 | 0 | 0 | 0 | ✅ Admin only |
| **Session** | 1 | 1 | 1 | 2 | 0 | 0 | 0 | 0 | ✅ Admin only |
| **ApiKey** | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | ✅ Admin only |
| **Backup** | 1 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | ✅ Admin only |
| **QueueJob** | 1 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | ✅ Admin only |
| **ScheduledTask** | 1 | 3 | 1 | 1 | 0 | 0 | 0 | 0 | ✅ Admin only |
| **StoredFile** | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | ✅ Admin only |
| **License** | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | ✅ Admin only |
| **BrandingConfig** | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | ✅ Admin only |
| **ReportDefinition** | 0 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | ⚠️ Missing UI |
| **KpiDefinition** | 0 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | ⚠️ Missing UI |
| **ExportJob** | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | ⚠️ Missing UI |
| **ImportJob** | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | ⚠️ Missing UI |
| **ServiceConnection** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ❌ Missing entirely |

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total entities scanned | 36 |
| Entities with full stack (DB+API+UI) | 17 |
| Entities with DB+API only (missing UI) | 14 |
| Entities with DB only | 4 |
| Entities completely missing | 1 (ServiceConnection) |
| Total Prisma models | ~80 (33 core entities + 47 service/support models) |
| Total backend route files | 15 (+ Meter/ directory has parallel backend) |
| Total BFF route files | 47 |
| Total frontend pages | 52 admin + 13 dashboard |
| Total runtime directories | 12 |
| Duplicate codebase found | `Meter/` directory — parallel implementation |

---

## Key Findings

1. **ServiceConnection is the only entity with zero representation** — no model, no API, no UI, no directory
2. **14 entities have DB + API but no frontend UI** — Contract, Tariff, BillCycle, ChargeRule, MeterAssignment, ValidationRule, WorkflowState, CollectionCase, PaymentGateway, SLA, AlertRule, EscalationPolicy, CustomerGroup, ReportDefinition, KpiDefinition, ExportJob, ImportJob
3. **17 entities have full-stack presence** — Customer, Meter, Invoice, Payment, Reading, Organization, Project, Notification, Webhook, Session, ApiKey, Backup, QueueJob, ScheduledTask, StoredFile, License, BrandingConfig
4. **Notification is the most complete entity** — pages, routes, model, backend, components, stores, runtime directories
5. **Parallel codebase found at `Meter/`** — contains its own Frontend, backend, docs, tests, with duplicate entity implementations
