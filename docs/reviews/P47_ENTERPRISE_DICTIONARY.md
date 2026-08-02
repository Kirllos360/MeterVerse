# P47 — Enterprise Dictionary

For each core concept: purpose, owner, database, frontend, backend, API, runtime, permission, dependencies, lifecycle, examples.

| Concept | Purpose | Owner | DB | Frontend | Backend | API | Runtime | Permission | Depends on | Lifecycle |
|---|---|---|---|---|---|---|---|---|---|---|
| **User** | Platform actor | C12 | User | admin/users, login | auth.js, auth-engine | /api/auth, /api/admin/users | session-mgr | users.* | Role | active→archived |
| **Role/Permission** | RBAC | C12 | Role/Permission/PermissionOnRole | admin/roles+permissions | security.js | /api/admin/roles | requirePermission | admin.* | User | system-defined |
| **Session** | Auth continuity | C12 | Session | sessions page | sessions.js | /api/sessions | session-mgr | admin.sessions | User | active→expired |
| **Organization** | Enterprise tenant | C22 | Organization | — | domain.js | /api/domain/organizations | runtime | admin.* | — | active→archived |
| **Area/Project/Zone/Unit** | Geography hierarchy | C14 | Area/Project/Zone/Unit | admin/{areas,projects,zones,units} | locations.js, projects.js | /api/locations/*, /api/projects | location-selector | locations.areas.* | Org | active→inactive |
| **Customer** | Billing party | C14 | Customer | admin+customers, user/customers | customers.js | /api/customers | — | customers.* | Org/Area | active→archived |
| **Meter** | Device | C16 | Meter/MeterType | admin/meters | meters.js | /api/meters | symbiot | meters.* | Area/Customer | created→terminated |
| **MeterAssignment** | Meter↔Customer | C16 | MeterAssignment | admin/meter-assignments | meter-assignments.js | /api/meter-assignments | — | meter_assignments.* | Meter/Customer | active→ended |
| **Reading** | Usage value | C17 | Reading | admin/readings | readings.js | /api/readings | polling-ingestion | readings.* | Meter | received→validated→approved |
| **Tariff** | Pricing | C13 | Tariff/TariffVersion* | admin/tariffs | tariffs.js, tariff-engine.js | /api/tariffs, /api/tariff-engine | tariff-engine | tariffs.* | — | draft→active→superseded |
| **Invoice** | Bill | C13 | Invoice/Item/Tax | admin/invoices | invoices.js | /api/invoices | posting-engine | invoices.* | Customer/Tariff | pending→issued→paid |
| **Payment** | Collection | C13 | Payment/Transaction | admin/payments, /payments | payments.js | /api/payments | posting-engine | payments.* | Invoice | received→reversed |
| **Journal/GL/Account** | Accounting | C13 | Account/JournalEntry/GeneralLedgerEntry | admin/accounting/* | accounting.js, posting-engine | /api/accounting | posting-engine | accounting.* | Invoice/Payment | posted→reversed |
| **FinancialPeriod** | Reporting window | C13 | FinancialPeriod | admin/accounting | accounting.js | /api/accounting/financial-periods | — | accounting.periods.* | — | open→closed |
| **CollectionCase** | Debt | C13 | CollectionCase/PromiseToPay | admin/collections | collections.js, collections-engine | /api/collections | dunning | collections.* | Invoice | open→closed |
| **FinancialEvent** | GL trigger | C13 | FinancialEvent/AccountMapping | — | financial-integration.js, posting-engine | /api/financial-integration | posting-engine | accounting.events.* | Invoice/Payment | pending→posted |
| **RevenueRule/Finding** | Leakage | C13 | RevenueRule/LeakageFinding | — | revenue-assurance.js | /api/revenue-assurance | assurance engine | revenue.* | Invoice/Reading | seeded→run→resolved |
| **WorkflowDef/Instance** | BPM | C23 | WorkflowDefinition/Version/Instance | admin/workflows | workflows.js | /api/workflows | workflow-engine | workflow.* | — | draft→active |
| **ApprovalRequest** | Approval | C23 | ApprovalRequest/Decision | admin/workflows | workflows.js | /api/workflows | workflow-engine | workflow.* | Workflow | pending→approved |
| **Tenant** | Multi-tenant | C22 | Tenant/TenantSetting | — | tenants.js | /api/tenants | runtime | tenant.* | Org | onboard→active→archived |
| **AuditEntry** | Trace | C12 | AuditEntry | admin/audit | audit middleware | /api/admin/audit | audit middleware | admin.* | every op | created-on-write |
| **SystemSetting** | Config | C19 | SystemSetting | admin/settings | config-center.js | /api/admin/config/* | — | admin.* | — | created→updated |
| **FeatureFlag** | Gating | C19 | FeatureFlag | admin/feature-flags | migration-service | /api/admin/feature-flags | runtime | admin.* | — | on/off |
| **ConnectionProfile** | TCP source | C19 | ConnectionProfile (drift) | admin/connection-settings | connection-profiles.js, connection-manager | /api/connection-profiles | ingestion-runtime | connections.* | Area | draft→tested→active |
| **ScheduledTask** | Jobs | C27 | ScheduledTask/QueueJob | admin/scheduler | scheduler-engine | /api/scheduler/stats | scheduler-engine | admin.* | — | scheduled→run |
| **KpiSnapshot** | Metrics | C17 | KpiDefinition/Snapshot | admin/reports | kpi-engine | /api/reports/kpi | kpi-engine | reports.* | readings/invoices | snapshot-per-cycle |

**Related modules:** Every concept cross-references the P47 responsibility matrix (owner=primary program). Dependencies column shows the wiring chain.
