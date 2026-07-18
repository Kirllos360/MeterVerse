# MeterVerse Enterprise Knowledge Base — Folder Tree

**Target:** ~140 documents  
**Structure:** Domain-grouped, modular, dependency-chained  
**Rule:** No duplicated responsibilities. Every concept appears once.

---

## 00-ROOT (4 documents)

```
/
├── 000-INDEX.md                          # Master index of every document
├── 001-PRODUCT-VISION.md                 # Product identity, philosophy, principles (MV-ARCH-001)
├── 002-READING-ORDER.md                  # Mandatory reading sequence for new agents
└── 003-GLOSSARY.md                       # Enterprise terminology — single source of truth for every term
```

---

## 01-ARCHITECTURE (12 documents)

```
01-ARCHITECTURE/
├── 010-ENTERPRISE-ARCHITECTURE-OVERVIEW.md       # System architecture, layers, boundaries
├── 011-BACKEND-ARCHITECTURE.md                   # NestJS modules, Prisma, API design
├── 012-FRONTEND-ARCHITECTURE.md                  # Next.js, React 19, component hierarchy
├── 013-RUNTIME-ARCHITECTURE.md                   # RuntimeCoordinator, Gateway, EventBus, Graph
├── 014-MICROSERVICES-BOUNDARIES.md               # Module boundaries, domain events, contracts
├── 015-API-DESIGN-CONTRACTS.md                   # REST conventions, pagination, errors, versioning
├── 016-DATABASE-ARCHITECTURE.md                  # Prisma schema, multi-schema, migrations
├── 017-AUTHENTICATION-ARCHITECTURE.md            # JWT, refresh tokens, CSRF, session
├── 018-PERMISSION-ARCHITECTURE.md                # RBAC, 16 roles, 46 actions, CapabilityRegistry
├── 019-SECURITY-ARCHITECTURE.md                  # Area isolation, audit, encryption, secrets
├── 01A-OBSERVABILITY-ARCHITECTURE.md             # Logging, metrics, health checks, alerts
└── 01B-INTEGRATION-ARCHITECTURE.md               # Symbiot, legacy sync, external APIs
```

---

## 02-DOMAIN-MODELS (15 documents)

```
02-DOMAIN-MODELS/
├── 020-ENTERPRISE-DOMAIN-GRAPH.md                # Complete entity hierarchy with relationships
├── 021-CUSTOMER-DOMAIN.md                        # Customer entity, lifecycle, 360 view, transfer, merge
├── 022-PROJECT-DOMAIN.md                         # Project, Area, Building, Floor, Unit hierarchy
├── 023-METER-DOMAIN.md                           # Meter entity, 8-status lifecycle, state transitions
├── 024-READING-DOMAIN.md                         # Reading entity, 7 validators, review queue, exceptions
├── 025-CONSUMPTION-DOMAIN.md                     # Consumption calculation, trends, anomaly detection
├── 026-INVOICE-DOMAIN.md                         # Invoice entity, 6-status lifecycle, tax, adjustments
├── 027-PAYMENT-DOMAIN.md                         # Payment entity, allocation, reversal, receipt
├── 028-TARIFF-DOMAIN.md                          # Tariff entity, 7 charge modes, versioning, slabs
├── 029-LEDGER-DOMAIN.md                          # Append-only ledger, running balance, immutability
├── 02A-WALLET-DOMAIN.md                          # Wallet entity, credit/debit/transfer, solar wallet
├── 02B-SIM-CARD-DOMAIN.md                        # SIM entity, 7-status lifecycle, cooldown, eligibility
├── 02C-COLLECTION-DOMAIN.md                      # Aging buckets, collector assignment, recovery
├── 02D-BILL-CYCLE-DOMAIN.md                      # BillCycle state machine, period management
└── 02E-SETTLEMENT-DOMAIN.md                      # Settlement entity, adjustments, manual invoices
```

---

## 03-BUSINESS-RULES (12 documents)

```
03-BUSINESS-RULES/
├── 030-BUSINESS-RULES-OVERVIEW.md                # Rule engine architecture, validation pipeline
├── 031-METER-BUSINESS-RULES.md                   # Activation preconditions, valid transitions, duplicate serial
├── 032-READING-BUSINESS-RULES.md                 # 7 validation rules, anomaly detection, review workflow
├── 033-INVOICE-BUSINESS-RULES.md                 # Generation rules, tax calculation, cancellation policy
├── 034-PAYMENT-BUSINESS-RULES.md                 # Allocation rules, overpayment tolerance, reversal policy
├── 035-CUSTOMER-BUSINESS-RULES.md                # Transfer rules, merge rules, archive policy
├── 036-TARIFF-BUSINESS-RULES.md                  # Non-overlap, effective dating, slab calculations
├── 037-COLLECTION-BUSINESS-RULES.md              # Aging calculation, collector assignment rules
├── 038-SIM-BUSINESS-RULES.md                     # Eligibility, cooldown, reassignment policy
├── 039-BILL-CYCLE-BUSINESS-RULES.md              # State transition rules, period validation
├── 03A-APPROVAL-BUSINESS-RULES.md                # Threshold-based approval matrix
└── 03B-ENTERPRISE-POLICIES.md                    # 8 PolicyEngine policies and their interactions
```

---

## 04-WORKFLOWS (10 documents)

```
04-WORKFLOWS/
├── 040-WORKFLOW-ENGINE-ARCHITECTURE.md           # Workflow engine, pipeline stages, operation registry
├── 041-CUSTOMER-REGISTRATION-WORKFLOW.md         # Create → assign unit → activate
├── 042-METER-INSTALLATION-WORKFLOW.md            # Receive → warehouse → assign → install → activate
├── 043-READING-CAPTURE-WORKFLOW.md               # Capture → validate → review → approve/reject
├── 044-INVOICE-GENERATION-WORKFLOW.md            # Generate → issue → (pay / cancel / reverse)
├── 045-PAYMENT-RECORDING-WORKFLOW.md             # Receive → identify → allocate → receipt
├── 046-OWNERSHIP-TRANSFER-WORKFLOW.md            # Select target → preview → confirm → deactivate source
├── 047-METER-REPLACEMENT-WORKFLOW.md             # Schedule → terminate old → install new → verify
├── 048-METER-TERMINATION-WORKFLOW.md             # Final reading → terminate → SIM cooldown → retire
└── 049-BULK-IMPORT-WORKFLOW.md                   # Upload → validate → preview → execute → rollback
```

---

## 05-API-CONTRACTS (8 documents)

```
05-API-CONTRACTS/
├── 050-API-CONTRACT-OVERVIEW.md                  # REST conventions, base URL, headers, errors
├── 051-CUSTOMER-API.md                           # GET/POST/PUT/DELETE customers, 360, statement, transfer, merge
├── 052-METER-API.md                              # GET/POST/PUT/DELETE meters, assign, replace, terminate, transition
├── 053-READING-API.md                            # GET/POST readings, validate, approve, reject, review-queue, exceptions
├── 054-INVOICE-API.md                            # GET/POST invoices, generate, issue, cancel, reverse, PDF
├── 055-PAYMENT-API.md                            # GET/POST payments, reverse, receipt, allocate
├── 056-TARIFF-API.md                             # GET/POST tariffs, simulate, version, clone, tiers
└── 057-SEARCH-AUDIT-IMPORT-API.md               # GET search, GET audit, POST upload
```

---

## 06-DATA-MODEL (6 documents)

```
06-DATA-MODEL/
├── 060-DATA-MODEL-OVERVIEW.md                    # Prisma schema structure, multi-schema strategy
├── 061-CORE-SCHEMA.md                            # Core entities: User, Role, Area, Project, AuditLog
├── 062-BUSINESS-SCHEMA.md                        # Customer, Meter, SIM, Reading, Consumption
├── 063-FINANCIAL-SCHEMA.md                       # Invoice, Payment, Ledger, Tariff, Wallet, Settlement
├── 064-OPERATIONAL-SCHEMA.md                     # BillCycle, Notification, Ticket, Alert, Document, Import
└── 065-MIGRATION-SCHEMA.md                       # Schema migration strategy, versioning, rollback
```

---

## 07-FRONTEND-EXPERIENCE (18 documents)

```
07-FRONTEND-EXPERIENCE/
├── 070-EXPERIENCE-ARCHITECTURE.md                # Experience layer overview, component hierarchy
├── 071-VISUAL-LANGUAGE.md                        # Spacing, shadow, surface, border, radius, animation tokens
├── 072-TYPOGRAPHY-SYSTEM.md                      # Type scale, fonts (Inter, Cairo, JetBrains Mono), RTL
├── 073-COLOR-SYSTEM.md                           # Brand, status, chart palettes, dark/light tokens
├── 074-COMPONENT-PRIMITIVES.md                   # Button, Input, Badge, Card, Tabs, Dialog, Drawer
├── 075-EXPERIENCE-LIBRARY.md                     # HeroSection, MetricCard, InsightCard, StatGrid, TabBar
├── 076-KPI-CARD-LIBRARY.md                       # 12 KPI variants (Large, Compact, Financial, Health, Trend, Risk)
├── 077-CARD-LIBRARY.md                           # 10 card variants (Info, Summary, Interactive, Financial, Alert, Widget)
├── 078-CHART-LIBRARY.md                          # 10 chart types (Line, Area, Bar, Pie, Donut, Gauge, Heatmap, Radar)
├── 079-DASHBOARD-WIDGET-LIBRARY.md               # 12 widget types (Revenue, Collection, Consumption, Health, Alerts)
├── 07A-NAVIGATION-EXPERIENCE.md                  # Sidebar, TopNav, Breadcrumb, CommandPalette, Dock
├── 07B-PAGE-TEMPLATES.md                         # 5 templates (Dashboard, Detail, Explorer, Settings, Wizard)
├── 07C-WORKSPACE-BLUEPRINTS.md                   # Blueprint definitions for every workspace archetype
├── 07D-STATUS-SYSTEM.md                          # 16 semantic statuses, badge variants, state transitions
├── 07E-EMPTY-LOADING-ERROR-STATES.md             # Every state: loading skeleton, empty state, error, offline
├── 07F-ANIMATION-SYSTEM.md                       # Motion tokens, micro-interactions, page transitions
├── 07G-RESPONSIVE-SYSTEM.md                      # Breakpoints, layout shifts, mobile adaptations
└── 07H-ACCESSIBILITY-SYSTEM.md                   # WCAG 2.2 AA, keyboard, screen reader, focus, contrast
```

---

## 08-PAGES (12 documents)

```
08-PAGES/
├── 080-PAGE-INVENTORY.md                         # Complete inventory of all 14+ pages with routes
├── 081-CUSTOMER-WORKSPACE.md                     # Customer workspace blueprint, 17 tabs, KPI strip
├── 082-METER-WORKSPACE.md                        # Meter workspace blueprint, 5 tabs, health gauge
├── 083-INVOICE-WORKSPACE.md                      # Invoice workspace, payment history, ledger, audit
├── 084-PAYMENT-WORKSPACE.md                      # Payment workspace, allocation, receipt, reversal
├── 085-DASHBOARD-WORKSPACE.md                    # Dashboard archetype, widget grid, KPI strip
├── 086-EXPLORER-WORKSPACE.md                     # Explorer archetype, SmartTable, filters, views
├── 087-SETTINGS-WORKSPACE.md                     # Settings archetype, vertical tabs, forms
├── 088-WIZARD-WORKSPACE.md                       # Wizard archetype, step indicator, validation
├── 089-REPORTING-WORKSPACE.md                    # Reports archetype, generation, scheduling
├── 08A-COLLECTION-DASHBOARD.md                   # Collection workspace, aging, collector ranking
└── 08B-FINANCIAL-DASHBOARD.md                    # Financial overview, revenue, collection, outstanding trends
```

---

## 09-MODULES (12 documents)

```
09-MODULES/
├── 090-MODULE-REGISTRY.md                        # Complete module registry with dependencies
├── 091-CUSTOMER-MODULE.md                        # Customer module: services, controllers, events, permissions
├── 092-METER-MODULE.md                           # Meter module: lifecycle, state machine, events
├── 093-READING-MODULE.md                         # Reading module: validation pipeline, review queue
├── 094-INVOICE-MODULE.md                         # Invoice module: generation, lifecycle, PDF
├── 095-PAYMENT-MODULE.md                         # Payment module: allocation, reversal, receipt
├── 096-TARIFF-MODULE.md                          # Tariff module: versioning, slabs, simulation
├── 097-COLLECTION-MODULE.md                      # Collection module: aging, KPIs, collector
├── 098-NOTIFICATION-MODULE.md                    # Notification module: channels, templates, delivery
├── 099-AUDIT-MODULE.md                           # Audit module: immutability, integrity, export
├── 09A-SYNC-MODULE.md                            # Sync module: Symbiot bridge, polling, status
└── 09B-IMPORT-EXPORT-MODULE.md                   # Import/Export: CSV, Excel, validation, preview
```

---

## 10-EVENTS (4 documents)

```
10-EVENTS/
├── 100-EVENT-BUS-ARCHITECTURE.md                 # Event bus design: publish/subscribe, retry, DLQ
├── 101-DOMAIN-EVENTS.md                          # 36 domain events with publishers, subscribers, payloads
├── 102-INFRASTRUCTURE-EVENTS.md                  # 16 runtime events: health, deployment, sync
└── 103-EVENT-HANDLER-REGISTRY.md                 # All event handlers and their idempotency rules
```

---

## 11-PERMISSIONS (4 documents)

```
11-PERMISSIONS/
├── 110-PERMISSION-MATRIX.md                      # Complete permission matrix: 30 entities × 15 operations
├── 111-ROLE-DEFINITIONS.md                       # 16 roles with level hierarchy and permission inheritance
├── 112-PAGE-PERMISSIONS.md                       # Page-level permissions for all 14+ routes
└── 113-COMPONENT-BUTTON-PERMISSIONS.md           # Component and button-level permission enforcement
```

---

## 12-LOCALIZATION (6 documents)

```
12-LOCALIZATION/
├── 120-LOCALIZATION-ARCHITECTURE.md              # i18n engine design, locale switching, RTL/LTR
├── 121-ARABIC-LANGUAGE-RULES.md                  # Arabic typography, RTL layout, numeral system
├── 122-ENGLISH-LANGUAGE-RULES.md                 # English typography, LTR layout, formatting
├── 123-DATE-TIME-FORMATTING.md                   # Date, time, timezone formatting per locale
├── 124-CURRENCY-NUMBER-FORMATTING.md             # Currency, number, percentage formatting
└── 125-TRANSLATION-KEY-REGISTRY.md              # All 676+ translation keys organized by domain
```

---

## 13-MIGRATION (5 documents)

```
13-MIGRATION/
├── 130-MIGRATION-ARCHITECTURE.md                 # Migration engine design, pipeline, rollback
├── 131-SBILL-MIGRATION.md                        # SBill Palm Hills + Estates: mapping, validation
├── 132-COLLECTION-SYSTEM-MIGRATION.md            # Legacy Flask collection system migration
├── 133-SYMBIOT-INTEGRATION.md                    # Symbiot bridge, real-time sync, polling
└── 134-DATA-MIGRATION-PLAYBOOK.md                # Step-by-step migration execution guide
```

---

## 14-REPORTING (6 documents)

```
14-REPORTING/
├── 140-REPORTING-ARCHITECTURE.md                 # JasperReports integration, JRXML, output formats
├── 141-INVOICE-REPORTS.md                        # Invoice PDF, summary, batch reports
├── 142-FINANCIAL-REPORTS.md                      # Revenue, aging, collection reports
├── 143-OPERATIONAL-REPORTS.md                    # Meter health, reading, sync reports
├── 144-REGULATORY-REPORTS.md                     # Utility consumption, area reports
└── 145-REPORT-TEMPLATE-REGISTRY.md               # All JRXML templates with parameters and permissions
```

---

## 15-TESTING (6 documents)

```
15-TESTING/
├── 150-TESTING-STRATEGY.md                       # Testing philosophy, pyramid, CI/CD gates
├── 151-BACKEND-TESTING.md                        # Unit, integration, contract, E2E testing patterns
├── 152-FRONTEND-TESTING.md                       # Playwright, component testing, visual regression
├── 153-PLAYWRIGHT-TEST-MATRIX.md                 # Every page × 4 viewports × test categories
├── 154-PERFORMANCE-TESTING.md                    # TTI, LCP, CLS budgets, load testing
└── 155-ACCESSIBILITY-TESTING.md                  # axe-core, keyboard, screen reader, contrast
```

---

## 16-DEPLOYMENT (4 documents)

```
16-DEPLOYMENT/
├── 160-DEPLOYMENT-ARCHITECTURE.md                # Build, staging, production pipeline
├── 161-CONFIGURATION-MANAGEMENT.md               # Environment variables, secrets, feature flags
├── 162-MONITORING-ALERTING.md                    # Health checks, metrics, alert thresholds
└── 163-DISASTER-RECOVERY.md                      # Backup, restore, failover, RPO/RTO
```

---

## 17-DESIGN-DECISIONS (8 documents)

```
17-DESIGN-DECISIONS/
├── 170-ADR-INDEX.md                              # Index of all Architecture Decision Records
├── 171-ADR-FRONTEND-REBUILD.md                   # ADR-001: Why new frontend, not legacy
├── 172-ADR-DESIGN-DNA-AUTHORITY.md               # ADR-002: Design DNA as sole visual authority
├── 173-ADR-METADATA-DRIVEN-UI.md                 # ADR-003: Registry-based navigation and permissions
├── 174-ADR-SEMANTIC-TOKENS.md                    # ADR-004: CSS custom properties for theming
├── 175-ADR-RUNTIME-CONSUMPTION.md                # ADR-005: Frontend consumes runtime via API
├── 176-ADR-RTL-FIRST.md                          # ADR-006: Arabic as primary language
└── 177-ADR-PROCESS-ORIENTED.md                   # ADR-007: Workflow-driven over page-driven
```

---

## 18-GOVERNANCE (6 documents)

```
18-GOVERNANCE/
├── 180-GOVERNANCE-FRAMEWORK.md                   # EEC-00C governance, amendments, certification
├── 181-CODE-REVIEW-STANDARDS.md                  # Pre/post implementation checks, CI gates
├── 182-DEFINITION-OF-DONE.md                     # Phase completion criteria, quality gates
├── 183-BLOCKER-REPORT-TEMPLATE.md                # Blocker report format for failed gates
├── 184-ARCHITECTURE-CONFLICT-RESOLUTION.md       # How to resolve architecture conflicts
└── 185-CERTIFICATION-PROCESS.md                  # Wave certification, IV requirements
```

---

## 19-EAOS (4 documents)

```
19-EAOS/
├── 190-AI-OPERATING-SYSTEM.md                    # EAOS: permanent AI governance constitution
├── 191-MANDATORY-READING-SEQUENCE.md             # Canonical startup sequence for new AI
├── 192-HANDSHAKE-PROTOCOL.md                     # Session continuity, memory update rules
└── 193-AI-MEMORY-MANAGEMENT.md                   # Long-term memory, conflict resolution, state updates
```

---

## 20-LEGACY (6 documents)

```
20-LEGACY/
├── 200-LEGACY-SYSTEMS-INVENTORY.md               # All legacy systems: purpose, data, status
├── 201-COLLECTION-SYSTEM-FLASK.md                # Flask billing system: architecture, entities
├── 202-SBILL-PALM-HILLS.md                       # SBill PH: data model, migration rules
├── 203-SBILL-ESTATES.md                          # SBill Estates: data model, migration rules
├── 204-LEGACY-BUSINESS-RULES.md                  # Business rules extracted from legacy systems
└── 205-LEGACY-KNOWLEDGE-PRESERVATION.md          # What legacy concepts must be preserved
```

---

## SUMMARY

| Section | Category | Document Count |
|---------|----------|---------------|
| 00 | Root | 4 |
| 01 | Architecture | 12 |
| 02 | Domain Models | 15 |
| 03 | Business Rules | 12 |
| 04 | Workflows | 10 |
| 05 | API Contracts | 8 |
| 06 | Data Model | 6 |
| 07 | Frontend Experience | 18 |
| 08 | Pages | 12 |
| 09 | Modules | 12 |
| 10 | Events | 4 |
| 11 | Permissions | 4 |
| 12 | Localization | 6 |
| 13 | Migration | 5 |
| 14 | Reporting | 6 |
| 15 | Testing | 6 |
| 16 | Deployment | 4 |
| 17 | Design Decisions | 8 |
| 18 | Governance | 6 |
| 19 | EAOS | 4 |
| 20 | Legacy | 6 |
| **Total** | | **~142** |

Every document has a unique ID, clear responsibility, and documented dependencies. No duplication. No generic names. Everything modular.
