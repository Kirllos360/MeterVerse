# MeterVerse — Strategic Roadmap: Sprints 39–45

**Date:** 2026-07-20  
**Current State:** Phase 38 complete — Enterprise certified at 94.4%  
**Next Phase:** Sprint 39 — Domain Completion  

---

## Strategic Shift

> **MeterVerse is not a billing application.**
> It is an **Enterprise Utility Operating System**.

Billing becomes one application inside the platform — not the platform itself.

```
Organization → Projects → Assets → Infrastructure → Meters
    → Services → Contracts → Customers → Billing
    → Collections → Analytics → Operations → Automation → AI
```

---

## Sprint 39 — Domain Completion

**Goal:** Expand from 40 → 70–80 Prisma models

### Missing Enterprise Concepts

| Domain | Models Needed | Priority |
|--------|--------------|----------|
| **Contracts** | Contract, ContractTerm, ContractVersion, ContractAmendment | 🔴 |
| **Tariffs** | Tariff, TariffRate, TariffTier, TariffSchedule, RateHistory | 🔴 |
| **Bill Cycles** | BillCycle, BillRun, BillRunHistory, CycleSchedule | 🔴 |
| **Charge Rules** | ChargeRule, ChargeFormula, ChargeOverride, DiscountRule | 🔴 |
| **Invoice Items** | InvoiceItem, InvoiceTax, InvoiceDiscount, InvoiceAdjustment | 🔴 |
| **Meter History** | MeterAssignment, MeterEvent, MeterStatusLog, MeterAudit | 🔴 |
| **Validation** | ValidationRule, ValidationResult, ValidationProfile | 🟡 |
| **Workflow** | WorkflowState, WorkflowTransition, WorkflowAction, StateMachine | 🟡 |
| **Collections** | CollectionCase, CollectionAction, PromiseToPay, DunningLevel | 🟡 |
| **Payment Gateway** | GatewayConfig, PaymentTransaction, GatewayLog, Refund | 🟡 |
| **Customer Groups** | CustomerGroup, GroupMember, GroupPricing, GroupSLA | 🟡 |
| **SLA** | SLADefinition, SLAMetric, SLABreach, SLAEscalation | 🟢 |
| **Alerts** | AlertRule, AlertCondition, AlertNotification, AlertHistory | 🟢 |
| **Escalations** | EscalationPolicy, EscalationStep, EscalationAction | 🟢 |

**Target:** 70–80 models (+30–40 from current 40)

---

## Sprint 40 — Business Engine

**Goal:** Implement the core MeterVerse business pipeline

### The Reading-to-Revenue Pipeline

```
Reading
   ↓
Validation (Sprint 39 rules)
   ↓
Consumption Calculation (formula engine)
   ↓
Tariff Application (Sprint 39 tariffs)
   ↓
Charge Generation (Sprint 39 charge rules)
   ↓
Invoice Assembly (line items, taxes, discounts)
   ↓
Ledger Posting (debit/credit entries)
   ↓
Payment Processing (gateway integration)
   ↓
Balance Calculation (aging, credit/debit)
   ↓
Reporting (Epic 9 reports with real data)
```

### Key Components

| Component | Description |
|-----------|-------------|
| **Validation Engine** | Rule-based validation pipeline for meter readings |
| **Consumption Calculator** | Interval-based consumption with loss adjustments |
| **Tariff Engine** | Tiered rates, time-of-use, demand charges |
| **Charge Generator** | Rule-based charge creation from consumption × tariff |
| **Invoice Builder** | Line-item invoice assembly with taxes |
| **Ledger Engine** | Double-entry ledger with account balances |
| **Payment Processor** | Multi-gateway payment orchestration |

---

## Sprint 41 — Real CRUD

**Goal:** Convert all UI shells into real end-to-end workflows

### Current State
```
UI mock → API route → Database
But: Edit, Delete, Bulk, Import, Export, Undo, Archive, Approval, Version History
     are either missing or partially implemented
```

### Required Workflows

| Action | Backend | Frontend | Status |
|--------|---------|----------|--------|
| **Edit** | PUT /:id with validation | Inline or form edit | ✅ Partial |
| **Delete** | DELETE /:id (soft) | Confirmation dialog | ⚠️ Missing on some |
| **Bulk Update** | PATCH /bulk with filters | Multi-select + apply | ❌ Missing |
| **Import** | POST /import (CSV/Excel) | Drag-drop + mapping | ❌ Missing |
| **Export** | GET /export?format=csv | Download trigger | ✅ Partial |
| **Undo** | POST /:id/undo (snapshot) | Toast with undo action | ❌ Missing |
| **Archive** | POST /:id/archive | Archive toggle | ❌ Missing |
| **Approval** | POST /:id/approve + reject | Approval workflow UI | ❌ Missing |
| **Version History** | GET /:id/versions | Timeline diff view | ❌ Missing |

---

## Sprint 42 — Enterprise Tables

**Goal:** Tables comparable to SAP, Azure Portal, Datadog, Linear, Notion, Airtable

### Required Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Column presets** | Save/load column configurations | 🔴 |
| **Resize** | Drag-to-resize column widths | 🔴 |
| **Reorder** | Drag-to-reorder columns | 🔴 |
| **Pin/freeze** | Pin columns to left/right | 🔴 |
| **Inline editing** | Click cell → edit → save | 🔴 |
| **Grouping** | Group rows by column value | 🟡 |
| **Aggregation** | Sum, avg, min, max, count in footer | 🟡 |
| **Advanced filters** | Multi-condition filter builder | 🟡 |
| **Saved views** | Named view presets per user | 🟡 |
| **Bulk actions** | Select rows → batch operation | 🟡 |
| **Export** | CSV, Excel, PDF from table state | 🟡 |
| **Keyboard shortcuts** | Navigate, select, edit via keyboard | 🟢 |

---

## Sprint 43 — Runtime Engine

**Goal:** Describe applications from metadata instead of writing pages manually

### Metadata-Driven Architecture

```yaml
Entity: Customer
  fields:
    - name: String (required, max 200)
    - email: String (email, unique)
    - phone: String (pattern: +20...)
    - status: Enum (active, inactive, suspended)
  permissions:
    - admin: CRUD
    - operator: read, update
    - viewer: read
  forms:
    - create: [name, email, phone, address]
    - edit: [name, email, phone]
    - view: [all fields, read-only]
  tables:
    - default: [name, email, status, area]
    - compact: [name, status]
  actions:
    - export: [csv, pdf]
    - archive: soft-delete
    - approve: requires permission "customers.approve"
  workflows:
    - on_create: [validate_address, assign_meter, send_welcome]
    - on_status_change: [check_balance, notify]
```

### Benefits

| Aspect | Before (manual) | After (metadata) |
|--------|----------------|------------------|
| New entity | Write page, route, validation, table | Define YAML → Auto-generated |
| Change | Edit TSX, CSS, routes | Edit YAML → Regenerated |
| Consistency | Per-page style decisions | Centralized templates |
| Development speed | Days per entity | Minutes per entity |

---

## Sprint 44 — Monitoring & Observability

**Goal:** Full operational visibility with enterprise-grade monitoring

### Stack

| Tool | Purpose | Integration |
|------|---------|-------------|
| **Prometheus** | Metrics collection | Export backend metrics (request count, latency, error rate) |
| **Grafana** | Dashboards | Pre-built dashboards for operations, business, infrastructure |
| **OpenTelemetry** | Distributed tracing | Trace requests across frontend → BFF → Backend → DB |
| **Structured Logging** | JSON log output | `pino` or `winston` for machine-parseable logs |
| **Performance Dashboard** | Real-time metrics | Request rate, p50/p95/p99 latency, error budget |
| **Audit Explorer** | Searchable audit log | Full-text search, filters, export |
| **Business Analytics** | Revenue, consumption trends | Time-series charts with drill-down |

---

## Sprint 45 — AI Layer

**Goal:** Make MeterVerse genuinely unique with domain-specific AI

### AI Agents

| Agent | Function | Impact |
|-------|----------|--------|
| **AI Operator** | Chat with your entire system — "Show me all overdue invoices in October" | Instant operations |
| **AI Billing Assistant** | "Why was this invoice EGP 500 higher than last month?" | Root cause analysis |
| **AI Reading Validator** | Flag anomalous readings before they enter the pipeline | Prevent billing errors |
| **AI Leak Detection** | Detect consumption patterns that indicate leaks | Reduce water loss |
| **AI Forecasting** | Predict consumption, revenue, cash flow | Planning accuracy |
| **AI Root Cause** | Trace billing complaints to their source | Faster resolution |
| **AI Report Builder** | "Build me a report showing consumption by tariff type" | Self-serve analytics |
| **AI SQL Assistant** | "Show me customers with >20% month-over-month variance" | Natural language queries |
| **AI Workflow Generator** | "Create a workflow that suspends service after 3 missed payments" | Automated operations |

### Architecture

```
User Query
    ↓
AI Orchestrator
    ├── NLU (intent classification)
    ├── Context Retrieval (current state, history)
    ├── Action Selection (query, generate, analyze)
    ├── Tool Execution (API calls, SQL queries, report generation)
    └── Response Generation (natural language + data)
```

---

## Summary: The 7-Sprint Plan

| Sprint | Theme | Key Deliverable | Effort |
|--------|-------|----------------|--------|
| **39** | Domain Completion | 40→80 models, enterprise domains | 2 weeks |
| **40** | Business Engine | Reading→Revenue pipeline, tariff engine | 3 weeks |
| **41** | Real CRUD | Edit, Delete, Bulk, Import, Export, Undo, Archive, Approval | 2 weeks |
| **42** | Enterprise Tables | SAP-grade tables with all features | 2 weeks |
| **43** | Runtime Engine | Metadata-driven app generation | 3 weeks |
| **44** | Monitoring | Prometheus, Grafana, OpenTelemetry, dashboards | 2 weeks |
| **45** | AI Layer | 9 AI agents, NLU orchestration | 4 weeks |

**Total:** ~18 weeks to transform MeterVerse from a billing app into an **Enterprise Utility Operating System**.
