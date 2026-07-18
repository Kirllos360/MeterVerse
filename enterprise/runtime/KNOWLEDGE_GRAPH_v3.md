# MeterVerse Knowledge Graph v3
**Generated:** 2026-07-14 | **Phase 03 — AI Operating System Bootstrap**

## Project Map
```
METERVERSE ENTERPRISE (D:\meter)
├── Meter/
│   ├── backend/         ← NestJS 10, Prisma, PostgreSQL (ACTIVE)
│   └── Frontend/        ← Next.js 16, shadcn/ui (ACTIVE)
├── Frontend/
│   ├── meterverse-ui/   ← Next.js 16 (NEW CLIENT)
│   └── backend/         ← NestJS 10 duplicate (LEGACY)
├── enterprise/
│   └── runtime/         ← Source of Truth (21 files)
├── AI/                  ← AI prompts and configs
├── docs/                ← Documentation
├── graphify-out/        ← Knowledge graph output
├── reports/             ← 130+ Phase H completion reports
└── scripts/             ← Automation scripts
```

## Dependency Map (Backend)
```
src/
├── main.ts                                    [ENTRY POINT]
├── app.module.ts                              [ROOT MODULE]
├── common/
│   ├── config/                                [CONFIG SERVICE]
│   ├── logger/                                [PINO LOGGER]
│   ├── errors/                                [ERROR HANDLING]
│   ├── events/                                [EVENT BUS] ← CIRCULAR DEP
│   ├── tenant/                                [MULTI-TENANCY]
│   ├── validation/                            [VALIDATION]
│   ├── observability/                         [METRICS]
│   └── secrets/                               [SECRET MANAGEMENT]
├── auth/                                      [AUTHENTICATION]
├── billing/                                   [BILLING ENGINE]
├── invoices/                                  [INVOICE GENERATION]
├── readings/                                  [METER READINGS]
├── meters/                                    [METER MANAGEMENT]
├── projects/                                  [PROJECT MANAGEMENT]
├── settlements/                               [SETTLEMENT ENGINE]
├── sync/                                      [SYNC ORCHESTRATOR]
├── upload/                                    [FILE UPLOAD]
├── kpi/                                       [KPI DASHBOARD]
├── reports/                                   [REPORT ENGINE]
├── runtime/                                   [RUNTIME LAYER]
├── runtime-api/                               [RUNTIME API]
├── runtime-composer/                          [RUNTIME COMPOSER]
├── runtime-dashboard/                         [RUNTIME DASHBOARD]
├── runtime-event-bus/                         [EVENT BUS PROVIDERS]
├── runtime-gateway/                           [RUNTIME GATEWAY]
├── runtime-graph/                             [GRAPH EXPORTERS]
├── runtime-intelligence/                      [AI INTELLIGENCE]
├── runtime-manifest/                          [MANIFEST REGISTRY]
├── runtime-ui/                                [UI COMPOSER]
└── runtime-ui-manifest/                       [UI MANIFEST]
```

## API Endpoints Map
```
REST API (NestJS)
├── /auth                    → AuthController
├── /billing                 → BillingController
├── /invoices                → InvoicesController
├── /readings                → ReadingsController
├── /meters                  → MetersController
├── /customers               → CustomersController
├── /projects                → ProjectsController
├── /settlements             → SettlementController
├── /kpi                     → KpiController
├── /reports                 → ReportsController
├── /settings                → SettingsController
├── /portal                  → PortalController
├── /runtime-api             → RuntimeApiController
├── /runtime-dashboard       → RuntimeDashboardController
├── /runtime-gateway         → RuntimeGatewayController
├── /sync                    → SyncController
├── /upload                  → UploadController
├── /support                 → SupportController
├── /tickets                 → TicketsController
├── /downloads               → DownloadsController
├── /sim-cards               → SimCardsController
├── /solar                   → SolarController
├── /collections             → CollectionsController
└── /chilled-water           → ChilledWaterController
```

## Database Map (Prisma)
```
Schema: Meter/backend/prisma/schema.prisma (ACTIVE)
├── Tenant            ← Multi-tenancy root
├── User              ← Authentication
├── Role              ← RBAC roles
├── Project           ← Billing projects
├── Meter             ← Utility meters
├── Reading           ← Meter readings
├── Invoice           ← Generated invoices
├── Settlement        ← Financial settlements
├── Rate              ← Rate tables
├── Tariff            ← Tariff definitions
├── BillingCycle      ← Billing periods
├── Payment           ← Payment records
├── Adjustment        ← Billing adjustments
├── AuditLog          ← Audit trail
├── Notification      ← Notification records
├── Document          ← Uploaded documents
└── Configuration     ← System configuration
```

## UI Component Map
```
Frontend (Next.js 16 + shadcn/ui + Radix + Tailwind CSS 4)
├── Pages/              ← Route-level components
├── Components/         ← Shared components
│   ├── ui/             ← shadcn/ui primitives
│   ├── forms/          ← Form components
│   ├── layout/         ← Layout components
│   ├── charts/         ← Chart components
│   └── data/           ← Data table components
├── Features/           ← Feature-specific components
│   ├── billing/        ← Billing UI
│   ├── meters/         ← Meter management UI
│   ├── invoices/       ← Invoice UI
│   ├── dashboard/      ← Dashboard widgets
│   └── reports/        ← Report UI
├── Hooks/              ← Custom React hooks
├── Stores/             ← Zustand stores
├── Queries/            ← TanStack Query hooks
├── Styles/             ← CSS/Tailwind config
└── Types/              ← TypeScript types
```

## Workflow Map
```
Key Business Workflows:
├── Meter Reading → Validation → Billing → Invoice → Payment
├── New Customer → Project Setup → Meter Assignment → Tariff
├── Settlement → Reconciliation → Report → Audit
├── Invoice → Approval → PDF Generation → Delivery
└── Dispute → Investigation → Adjustment → Resolution
```

## State Machine Map
```
Billing States:
DRAFT → PENDING → APPROVED → INVOICED → PAID → RECONCILED
                                                        ↓
                                                   DISPUTED → REVIEWED → ADJUSTED

Meter States:
ACTIVE → READING → MAINTENANCE → RETIRED
  ↓
INACTIVE → SUSPENDED → TERMINATED

Settlement States:
PENDING → VALIDATING → APPROVED → SETTLED → RECONCILED → CLOSED
```

## Event Flow
```
Event Bus (Runtime Event Bus):
├── reading.created          → Trigger billing preview
├── billing.completed        → Trigger invoice generation
├── invoice.generated        → Trigger PDF generation
├── invoice.paid             → Trigger settlement
├── meter.status_changed     → Update meter state
├── customer.created         → Setup defaults
├── project.activated        → Start billing cycle
├── settlement.approved      → Trigger reconciliation
└── audit.entry_created      → Log audit trail
```

## Domain Model
```
Core Domains:
├── Customer Management     ← Multi-tenant customer data
├── Meter Management        ← Meter inventory & state
├── Reading Management      ← Consumption data ingestion
├── Billing Engine          ← Rate calculation & invoicing
├── Settlement Engine       ← Financial reconciliation
├── Payment Processing      ← Payment collection
├── Reporting Engine        ← Report generation
├── Notification Service    ← Alert & notification delivery
├── Document Management    ← PDF & file management
├── Audit Service           ← Audit trail & compliance
└── Integration Layer       ← External system integration
```

## Entity Relationships (High-Level)
```
Tenant 1──N Customer 1──N Project 1──N Meter 1──N Reading
  │                                                │
  │                                                ▼
  └─────────────────────────────────────────── Settlement
                                                      │
                                                      ▼
                                               Invoice 1──N Payment
                                                  │
                                                  ▼
                                             Adjustment
```

## Knowledge Graph Tooling
- **Graphly**: Auto-generates JSON knowledge graph from codebase analysis
- **Madge**: Dependency graph visualization
- **Depcruise**: Full module dependency mapping
- **Graphviz**: Renders dependency graphs as images
- **Mermaid CLI**: Generates mermaid diagrams
- **PlantUML**: UML class/component diagrams
- **SMCat**: State machine diagrams
- **prisma-erd-generator**: ER diagrams from Prisma schema
