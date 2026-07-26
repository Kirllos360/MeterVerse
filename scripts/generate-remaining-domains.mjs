import fs from "fs"

const BASE = "D:/meter/planning/050_ENTERPRISE_DOMAIN_ARCHITECTURE"

function gen(id, name, group, data) {
  return `# ${name} Domain

**File:** \`${group}/${name.toLowerCase().replace(/\s+/g,'_')}/DOMAIN.md\`
**Domain ID:** ${id}
**Priority:** ${data.pr || "P1"} | **Status:** ${data.st || "Draft"}

---

## Business Purpose
${data.pu || `Manages all ${name.toLowerCase()} related operations and data within the MeterVerse platform.`}

## Business Owner
${data.ow || "Chief Operations Officer"}

## Enterprise Scope
${data.sc || `Enterprise-wide ${name.toLowerCase()} lifecycle management.`}

## Capabilities
${Object.entries(data.cap || {Dashboard:"Overview and monitoring",Management:"CRUD operations",Configuration:"Settings and parameters"}).map(([k,v]) => `| ${k} | ${v} |`).join('\n')}

## Lifecycle States
${data.lc || "ACTIVE → ARCHIVED → RETIRED"}

## Actors
${Object.entries(data.act || {Admin:"System administrator",Operator:"Daily operator",Viewer:"Read-only access"}).map(([k,v]) => `| **${k}** | ${v} |`).join('\n')}

## Permissions
${data.pe || "admin.*, operator.*, viewer.*"}

## Dependencies
${data.dep || "None"}

## API Endpoints
${data.api || "Standard CRUD: GET, POST, PUT, DELETE"}

## Database Tables
${data.db || "Standard entity tables with archivedAt"}

## Security Requirements
${data.se || "Standard RBAC authentication. All mutations audited."}

## Compliance Requirements
${data.co || "Standard data retention and audit compliance."}

## Performance Requirements
${data.pf || "< 500ms for read operations, < 2s for write operations"}

## Availability Requirements
${data.av || "99.9% uptime"}

## Scalability Requirements
${data.sl || "Horizontal scaling supported"}

## Future Expansion
${data.fe || "Standard domain evolution"}

## Known Risks
${data.kr || "Data consistency, performance under load"}

## Implementation Priority: ${data.pr || "P1"}
**Wave:** ${data.wv || "05"} | **Sessions:** ${data.ses || "3"}
**Definition of Done:** Domain fully implemented with CRUD APIs, DB schema, and UI pages.
**Acceptance Criteria:** All capabilities operational. Tests passing. Documentation complete.
---
`
}

const domains = {
  // ===== CORE =====
  "MV-DOM-004": ["Contract", "01_CORE_DOMAINS", {
    pu:"Manage customer service agreements, terms, amendments, and renewals across all customer segments.",
    ow:"Legal & Contracts Director",
    sc:"Contract lifecycle from creation through renewal, suspension, and cancellation. Supports standard, corporate, and government contract types with configurable terms.",
    cap:{Creation:"Create contracts from templates with configurable terms",Renewal:"Auto and manual renewal with terms update",Suspension:"Temporary suspension for seasonal/vacancy",Cancellation:"Permanent termination with final billing",Amendment:"Contract modifications with version history",TermManagement:"Key-value term configuration per contract"},
    lc:"DRAFT → ACTIVE → SUSPENDED → CANCELLED → ARCHIVED",
    act:{ContractManager:"Creates and manages contracts",Customer:"Signs and reviews contracts",Legal:"Approves non-standard terms",System:"Auto-renewal processing"},
    pe:"contracts.create, contracts.update, contracts.delete, contracts.read",
    dep:"Customer (MV-DOM-003), Meter (MV-DOM-001), Tariff (MV-DOM-012)",
    api:"CRUD via /api/domain/contracts, /api/domain/contract-terms, /api/domain/contract-amendments",
    db:"Contract, ContractTerm, ContractAmendment, MeterAssignment",
    se:"E-signature binding per local law. Legal review for non-standard terms. Contract terms immutable after signing.",
    co:"Contract terms must comply with utility regulations. Min/max term limits enforced. Auto-renewal disclosure required 60 days before.",
    pf:"< 1s contract retrieval, < 5s contract creation",av:"99.9%",sl:"100,000 active contracts",
    fe:"Smart contract integration. Self-service contract builder. AI-powered term optimization.",kr:"Contract term conflicts. Auto-renewal missed window.",
    pr:"P1",wv:"03",ses:"5"
  }],
  "MV-DOM-005": ["Unit", "01_CORE_DOMAINS", {
    pu:"Manage individual units (apartments, offices, lots) within zones, including type classification, customer assignment, and status tracking.",
    ow:"Operations Director",
    sc:"Unit registration, type classification (residential/commercial/industrial), customer assignment, and status lifecycle across all zones and projects.",
    cap:{Registration:"Register units with type, area, and zone assignment",Classification:"Categorize by type (residential/commercial/industrial)",Assignment:"Link to customer",StatusTracking:"Active/vacant/maintenance lifecycle"},
    lc:"VACANT → OCCUPIED → MAINTENANCE → VACANT",
    api:"CRUD via /api/locations/units",
    db:"Unit, Zone",
    pr:"P1",wv:"01",ses:"2"
  }],
  "MV-DOM-006": ["Project", "01_CORE_DOMAINS", {
    pu:"Manage organizational projects (developments, districts, compounds) that group zones and units for operational management.",
    ow:"Operations Director",
    sc:"Project creation, status tracking, organization assignment, and zone grouping.",
    cap:{Creation:"Create projects within organizations",Organization:"Assign to organization",Status:"Active/inactive lifecycle"},
    lc:"PLANNING → ACTIVE → COMPLETED → ARCHIVED",
    api:"CRUD via /api/projects, /api/admin/projects",
    db:"Project, Organization",
    pr:"P1",wv:"01",ses:"2"
  }],
  "MV-DOM-007": ["Area", "01_CORE_DOMAINS", {
    pu:"Manage geographical and operational areas for meter routing, data synchronization, and regional reporting.",
    ow:"Operations Director",
    sc:"Area definition covering meter routing rules, sync boundaries, and operational regions (October, New Cairo, SODIC).",
    cap:{Definition:"Define operational areas",Routing:"Route meters to areas",Sync:"Configure area-level data replication"},
    lc:"ACTIVE → INACTIVE → ARCHIVED",
    api:"Configuration via admin settings",
    db:"Project (area field), Meter (area field)",
    pr:"P1",wv:"01",ses:"1"
  }],
  "MV-DOM-008": ["Organization", "01_CORE_DOMAINS", {
    pu:"Manage tenant organizations for multi-tenancy, including branding, settings, and project isolation.",
    ow:"Platform Director",
    sc:"Multi-tenant organization lifecycle with isolated projects, users, and configuration.",
    cap:{Tenancy:"Multi-tenant organization management",Isolation:"Data isolation per organization",Branding:"Per-organization branding and settings"},
    lc:"ACTIVE → SUSPENDED → ARCHIVED",
    api:"CRUD via /api/admin/organizations",
    db:"Organization, Project, BrandingConfig",
    pr:"P1",wv:"04",ses:"3"
  }],

  // ===== BILLING & FINANCE =====
  "MV-DOM-010": ["Invoice", "02_BILLING_FINANCE", {
    pu:"Manage the complete invoice lifecycle including generation, approval, distribution, adjustments, and payment tracking.",
    ow:"Billing Director",
    sc:"Invoice from draft through issued, paid, and archived. Supports credit notes, debit notes, and adjustments.",
    cap:{Generation:"Auto-generate from bill runs",Approval:"Review and approve workflow",Distribution:"Portal, email, SMS, print",Adjustments:"Credit notes, debit notes, corrections",Lifecycle:"Draft→Approved→Issued→Paid→Archived"},
    lc:"DRAFT → PENDING_APPROVAL → APPROVED → ISSUED → PAID → PARTIALLY_PAID → OVERDUE → ARCHIVED",
    dep:"Customer (MV-DOM-003), Billing (MV-DOM-009), Tariff (MV-DOM-012), Payment (MV-DOM-011)",
    api:"Full CRUD + POST /api/invoices/generate, POST /api/invoices/:id/issue, POST /api/invoices/:id/adjustments",
    db:"Invoice, InvoiceItem, InvoiceTax, DiscountRule",
    pr:"P0",wv:"03",ses:"8"
  }],
  "MV-DOM-011": ["Payment", "02_BILLING_FINANCE", {
    pu:"Manage payment recording, allocation, refunds, and reconciliation across all channels.",
    ow:"Finance Director",
    sc:"Payment lifecycle from registration through allocation to reconciliation. Supports cash, card, bank transfer, and wallet payments.",
    cap:{Registration:"Record payments from all channels",Allocation:"Auto-allocate to invoices (oldest first)",Refunds:"Process refunds and reversals",Reconciliation:"Match with bank statements",Reporting:"Daily/monthly payment reports"},
    lc:"PENDING → COMPLETED → ALLOCATED → REVERSED → REFUNDED",
    dep:"Customer (MV-DOM-003), Invoice (MV-DOM-010), Accounting (MV-DOM-013), Gateway (MV-DOM-027)",
    api:"POST /api/payments, POST /api/payments/:id/reverse, POST /api/payments/:id/refund, GET /api/payments/customers/:id/statement",
    db:"Payment, PaymentTransaction, GatewayLog",
    pr:"P0",wv:"02",ses:"5"
  }],
  "MV-DOM-012": ["Tariff", "02_BILLING_FINANCE", {
    pu:"Manage rate structures including flat rates, tiered pricing, time-of-use, and demand charges for all utility types.",
    ow:"Billing Director",
    sc:"Tariff definition with rates, tiers, time-of-use schedules, and effective date management.",
    cap:{FlatRate:"Single rate per unit",Tiered:"Volume-based pricing tiers",TimeOfUse:"Peak/off-peak scheduling",Demand:"Demand-based charges"},
    lc:"DRAFT → ACTIVE → INACTIVE → ARCHIVED",
    dep:"Meter Type (MV-DOM-001), Billing (MV-DOM-009)",
    api:"CRUD via /api/tariffs + POST /api/tariffs/calculate",
    db:"Tariff, TariffRate, TariffTier",
    pr:"P0",wv:"03",ses:"6"
  }],
  "MV-DOM-016": ["Collection", "02_BILLING_FINANCE", {
    pu:"Manage debt collection including case assignment, field visits, payment promises, escalations, and write-offs.",
    ow:"Collection Director",
    sc:"Collection case lifecycle from overdue invoice through assignment, visit, resolution, or escalation.",
    cap:{CaseCreation:"Auto-create from overdue invoices",Assignment:"Route to collectors",Visits:"Field visit management",Promises:"Payment promise tracking",Escalation:"Time-based escalation",WriteOff:"Bad debt write-off"},
    lc:"OPEN → IN_PROGRESS → CONTACTED → PROMISE_TO_PAY → PAID → ESCALATED → CLOSED",
    dep:"Customer (MV-DOM-003), Invoice (MV-DOM-010), Payment (MV-DOM-011)",
    api:"CRUD via /api/domain/collection-cases",
    db:"CollectionCase, CollectionAction, PromiseToPay",
    pr:"P0",wv:"03",ses:"5"
  }],
  "MV-DOM-017": ["Settlement", "02_BILLING_FINANCE", {
    pu:"Manage meter settlement data from head-end systems for accurate consumption reconciliation.",
    ow:"Billing Director",
    sc:"Settlement data upload, validation, approval, and rollback for accurate billing.",
    cap:{Upload:"Import settlement files",Validation:"Validate against expected consumption",Approval:"Review and approve",Rollback:"Reverse erroneous settlements"},
    dep:"Meter (MV-DOM-001), Reading (MV-DOM-002), Billing (MV-DOM-009)",
    pr:"P1",wv:"05",ses:"4"
  }],
  "MV-DOM-018": ["Charge", "02_BILLING_FINANCE", {
    pu:"Manage charge rules for fixed and variable fees applied during billing.",
    ow:"Billing Director",
    sc:"Charge rule definition with formulas, priorities, effective dates, and customer overrides.",
    cap:{RuleDefinition:"Define charge rules with formulas",Prioritization:"Order-of-operations for multiple charges",Overrides:"Customer-specific charge overrides"},
    dep:"Billing (MV-DOM-009), Customer (MV-DOM-003), Contract (MV-DOM-004)",
    api:"CRUD via /api/domain/charge-rules, /api/domain/charge-overrides",
    db:"ChargeRule, ChargeOverride",
    pr:"P0",wv:"03",ses:"3"
  }],
  "MV-DOM-019": ["Discount", "02_BILLING_FINANCE", {
    pu:"Manage discount rules for promotional, loyalty, and early payment discounts.",
    ow:"Billing Director",
    sc:"Discount rule creation, approval, application, and rollback.",
    cap:{Creation:"Create discount rules",Approval:"Approve before application",Application:"Apply to invoice generation"},
    dep:"Billing (MV-DOM-009), Customer Group",
    pr:"P1",wv:"05",ses:"3"
  }],
  "MV-DOM-020": ["Wallet", "02_BILLING_FINANCE", {
    pu:"Manage customer prepayment wallets for deposit-based and prepaid utility services.",
    ow:"Finance Director",
    sc:"Wallet creation, top-up, deduction, balance inquiry, and transaction history.",
    cap:{TopUp:"Add funds to wallet",Deduction:"Auto-deduct from bills",Balance:"Real-time balance inquiry",History:"Transaction log"},
    dep:"Customer (MV-DOM-003), Payment (MV-DOM-011), Billing (MV-DOM-009)",
    pr:"P1",wv:"08",ses:"5"
  }],

  // ===== UTILITY =====
  "MV-DOM-021": ["Energy", "03_UTILITY_ENERGY", {
    pu:"Manage electric energy metering including consumption, demand, power quality, and net metering.",
    ow:"Utility Director",sc:"Electric metering for residential, commercial, and industrial customers with support for net metering and solar.",
    cap:{Consumption:"kWh consumption tracking",Demand:"Peak demand monitoring",Quality:"Power quality monitoring",NetMetering:"Bi-directional energy flow"},
    dep:"Meter (MV-DOM-001), Reading (MV-DOM-002), Tariff (MV-DOM-012), Solar (MV-DOM-024)",
    pr:"P0",wv:"01",ses:"3"
  }],
  "MV-DOM-022": ["Water", "03_UTILITY_ENERGY", {
    pu:"Manage water metering including consumption, leak detection, flow monitoring, and quality.",
    ow:"Utility Director",
    sc:"Water metering with special handling for difference modes, leak detection, and conservation programs.",
    cap:{Consumption:"m³ consumption tracking",LeakDetection:"Continuous flow monitoring",DifferenceMode:"Report/warn/block on variance"},
    dep:"Meter (MV-DOM-001), Reading (MV-DOM-002), Leak Detection (P-020)",
    pr:"P0",wv:"01",ses:"3"
  }],
  "MV-DOM-023": ["Gas", "03_UTILITY_ENERGY", {
    pu:"Manage gas metering including consumption, pressure monitoring, and safety compliance.",
    ow:"Utility Director",
    sc:"Natural gas metering for residential and commercial customers.",
    cap:{Consumption:"BTU/m³ consumption",Safety:"Pressure and leak monitoring"},
    dep:"Meter (MV-DOM-001), Reading (MV-DOM-002)",
    pr:"P1",wv:"05",ses:"2"
  }],
  "MV-DOM-024": ["Solar", "03_UTILITY_ENERGY", {
    pu:"Manage solar generation metering including production tracking, net metering, and feed-in tariff application.",
    ow:"Renewable Energy Director",
    sc:"Solar PV generation metering with bi-directional energy tracking and feed-in tariff calculation.",
    cap:{GenerationTracking:"kWh production monitoring",NetMetering:"Import/export tracking",FeedInTariff:"FIT calculation and crediting",Wallet:"Solar credit wallet"},
    dep:"Meter (MV-DOM-001), Reading (MV-DOM-002), Energy (MV-DOM-021), Wallet (MV-DOM-020)",
    pr:"P1",wv:"05",ses:"5"
  }],
  "MV-DOM-025": ["BTU", "03_UTILITY_ENERGY", {
    pu:"Manage British Thermal Unit (BTU) metering for district cooling and heating systems.",
    ow:"Utility Director",sc:"BTU metering for centralized HVAC systems in district cooling/heating networks.",
    cap:{Consumption:"BTU consumption tracking",Efficiency:"System efficiency monitoring"},
    dep:"Meter (MV-DOM-001), Reading (MV-DOM-002)",pr:"P1",wv:"05",ses:"2"
  }],

  // ===== COMMUNICATION =====
  "MV-DOM-026": ["SIM", "04_COMMUNICATION", {
    pu:"Manage SIM card lifecycle including inventory, assignment to meters, carrier management, and status tracking.",
    ow:"Communication Manager",
    sc:"SIM card inventory, assignment lifecycle, carrier relationships, and APN configuration.",
    cap:{Inventory:"SIM card stock management",Assignment:"Assign/release from meters",Carrier:"Multi-carrier support",Status:"Active/faulty/retired tracking"},
    lc:"AVAILABLE → ASSIGNED → ACTIVE → FAULTY → RETIRED",
    dep:"Meter (MV-DOM-001)",
    api:"CRUD via /api/sim + POST /api/sim/:id/assign, POST /api/sim/:id/release, GET /api/sim/:id/eligibility",
    db:"SIMCard, SIMAssignment",
    pr:"P0",wv:"02",ses:"3"
  }],
  "MV-DOM-027": ["Gateway", "04_COMMUNICATION", {
    pu:"Manage communication gateways (concentrators, data loggers) for meter data collection and relay.",
    ow:"Communication Manager",
    sc:"Gateway registration, connection management, firmware, and communication path monitoring.",
    cap:{Registration:"Register gateway devices",Connection:"Manage communication links",Monitoring:"Path health monitoring"},
    dep:"Meter (MV-DOM-001), SIM (MV-DOM-026), Synchronization (MV-DOM-028)",
    pr:"P1",wv:"04",ses:"3"
  }],
  "MV-DOM-029": ["Notification", "04_COMMUNICATION", {
    pu:"Manage multi-channel notification delivery including in-app, email, SMS, and push notifications.",
    ow:"Communications Director",
    sc:"Notification templating, channel delivery, delivery tracking, and user preference management.",
    cap:{Templating:"Multi-channel notification templates",Delivery:"Channel delivery with fallback",Preferences:"User opt-in/opt-out per channel",Tracking:"Delivery confirmation and analytics"},
    dep:"All domains (event sources)",
    api:"CRUD via /api/services/notifications, /api/notification-templates",
    db:"Notification, NotificationTemplate, EmailLog, SmsLog, PushNotification",
    pr:"P0",wv:"02",ses:"4"
  }],

  // ===== WORKFLOW =====
  "MV-DOM-031": ["Approval", "05_WORKFLOW_AUTOMATION", {
    pu:"Manage approval workflows for processes requiring authorization before execution.",
    ow:"Operations Director",
    sc:"Multi-level approval chains with role-based assignment, escalation, and audit.",
    cap:{Chains:"Configurable approval chains",Assignment:"Route to approver by role",Escalation:"Time-based escalation"},
    dep:"Workflow (MV-DOM-030), Authorization (MV-DOM-047)",
    pr:"P1",wv:"05",ses:"4"
  }],
  "MV-DOM-032": ["Automation", "05_WORKFLOW_AUTOMATION", {
    pu:"Manage automated business process execution via rules engine and AI triggers.",
    ow:"Operations Director",
    sc:"Rule-based and AI-triggered automation of routine business processes.",
    cap:{Rules:"Configurable automation rules",Triggers:"Event-driven and scheduled",AI:"AI-recommended actions"},
    dep:"Workflow (MV-DOM-030), AI (MV-DOM-037)",
    pr:"P2",wv:"06",ses:"6"
  }],
  "MV-DOM-033": ["Validation", "05_WORKFLOW_AUTOMATION", {
    pu:"Manage validation rules for data quality across all domains.",
    ow:"Data Quality Director",
    sc:"Configurable validation rules for readings, meter data, customer data, and financial data.",
    cap:{Rules:"Configurable validation rules",Results:"Validation result tracking",Severity:"Error/warning/info levels"},
    dep:"All domains",
    api:"CRUD via /api/domain/validation-rules",
    db:"ValidationRule, ValidationResult",
    pr:"P0",wv:"02",ses:"3"
  }],

  // ===== INTELLIGENCE =====
  "MV-DOM-034": ["Analytics", "06_INTELLIGENCE", {
    pu:"Generate business intelligence and analytics across all operational domains.",
    ow:"Analytics Director",
    sc:"Dashboard metrics, trend analysis, period-over-period comparison, and custom report building.",
    cap:{Dashboards:"Pre-built operational dashboards",Trends:"Period-over-period analysis",Custom:"Custom report builder"},
    dep:"All domains",
    pr:"P0",wv:"04",ses:"5"
  }],
  "MV-DOM-035": ["Forecast", "06_INTELLIGENCE", {
    pu:"Generate consumption and revenue forecasts using statistical and ML models.",
    ow:"Analytics Director",sc:"Short-term and long-term forecasting for consumption, demand, and revenue.",
    cap:{Consumption:"Usage forecasting",Demand:"Peak demand prediction",Revenue:"Revenue forecasting"},
    dep:"Analytics (MV-DOM-034), AI (MV-DOM-037)",pr:"P1",wv:"06",ses:"5"
  }],
  "MV-DOM-036": ["Alert", "06_INTELLIGENCE", {
    pu:"Manage threshold-based alerting for operational and business rule violations.",
    ow:"Operations Director",
    sc:"Alert rule configuration, generation, delivery, and lifecycle management.",
    cap:{Rules:"Configurable alert thresholds",Generation:"Auto-alert on breach",Lifecycle:"Open→acknowledged→resolved"},
    dep:"All domains (metrics sources)",
    api:"CRUD via /api/alerts, /api/domain/alert-rules",
    db:"Alert, AlertRule",
    pr:"P0",wv:"02",ses:"3"
  }],
  "MV-DOM-037": ["AI", "06_INTELLIGENCE", {
    pu:"Manage AI/ML model lifecycle including training, deployment, inference, and monitoring.",
    ow:"AI Platform Director",
    sc:"AI model registry, inference endpoints, prompt management, and model performance tracking.",
    cap:{Models:"ML model registry and versioning",Inference:"Real-time and batch inference",Prompts:"LLM prompt management",Monitoring:"Model performance and drift"},
    dep:"Knowledge (MV-DOM-038), RCA (MV-DOM-039)",
    api:"POST /api/ai/chat, POST /api/intelligence/agents/:id/execute, POST /api/ai/root-cause",
    db:"RCACase (in-memory), KnowledgeRepository",
    pr:"P0",wv:"04",ses:"8"
  }],
  "MV-DOM-038": ["Knowledge", "06_INTELLIGENCE", {
    pu:"Manage enterprise knowledge base for semantic search, incident matching, and AI context.",
    ow:"AI Platform Director",
    sc:"Knowledge entity management, semantic search, meter timelines, and similar incident matching.",
    cap:{Search:"Multi-entity semantic search",Timelines:"Meter lifecycle timelines",Incidents:"Similar incident matching"},
    dep:"All domains (data sources)",
    api:"POST /api/knowledge/search, GET /api/knowledge/meters/:serial/timeline, POST /api/knowledge/incidents/similar",
    db:"KnowledgeRepository (Prisma-based)",
    pr:"P1",wv:"04",ses:"4"
  }],
  "MV-DOM-039": ["RCA", "06_INTELLIGENCE", {
    pu:"Manage root cause analysis for meter anomalies using AI-powered investigation.",
    ow:"AI Platform Director",
    sc:"RCA case lifecycle from creation through evidence collection, AI analysis, human review, and resolution learning.",
    cap:{CaseCreation:"Create RCA cases from meter issues",Evidence:"Auto-collect meter evidence",Analysis:"AI-powered 5-whys analysis",Learning:"Resolution pattern learning"},
    lc:"NEW → INVESTIGATING → AI_ANALYSIS_READY → HUMAN_REVIEW → APPROVED → RESOLVED → LEARNED",
    dep:"Meter (MV-DOM-001), Reading (MV-DOM-002), AI (MV-DOM-037), Knowledge (MV-DOM-038)",
    api:"Full lifecycle: POST /api/rca/cases, POST /api/rca/cases/:id/auto-analyze, GET /api/rca/patterns/similar",
    db:"RCACaseEngine (in-memory Map), ResolutionLearner (file-based JSON)",
    pr:"P1",wv:"04",ses:"6"
  }],

  // ===== INTEGRATION =====
  "MV-DOM-040": ["Integration", "07_INTEGRATION", {
    pu:"Manage external system integrations including webhooks, queues, schedulers, and API gateways.",
    ow:"Integration Director",
    sc:"Integration lifecycle covering webhook delivery, queue processing, scheduled tasks, and external system connectivity.",
    cap:{Webhooks:"Outbound event delivery",Queues:"Async job processing",Scheduler:"Cron-based task execution",Gateway:"API gateway management"},
    dep:"All domains",
    api:"Webhook management via admin UI, Queue via /api/admin/queue, Scheduler via /api/admin/scheduler",
    db:"Webhook, QueueJob, ScheduledTask, ExportLog, ImportJob",
    pr:"P0",wv:"04",ses:"6"
  }],
  "MV-DOM-041": ["ERP", "07_INTEGRATION", {
    pu:"Integrate with external Enterprise Resource Planning systems (SAP, Oracle, Microsoft Dynamics).",
    ow:"Integration Director",
    sc:"Financial data synchronization including GL accounts, invoices, payments, and customer data.",
    cap:{Sync:"Bi-directional data sync",Mapping:"Account and entity mapping",Reconciliation:"Post-sync verification"},
    dep:"Integration (MV-DOM-040), Accounting (MV-DOM-013), Invoice (MV-DOM-010), Payment (MV-DOM-011)",
    pr:"P1",wv:"05",ses:"8"
  }],
  "MV-DOM-042": ["CRM", "07_INTEGRATION", {
    pu:"Integrate with external Customer Relationship Management systems (Salesforce, Dynamics 365).",
    ow:"Integration Director",
    sc:"Customer data synchronization including profiles, contacts, and communication history.",
    cap:{Sync:"Customer data sync",Mapping:"Field-level mapping"},
    dep:"Integration (MV-DOM-040), Customer (MV-DOM-003)",
    pr:"P1",wv:"05",ses:"6"
  }],
  "MV-DOM-043": ["GIS", "07_INTEGRATION", {
    pu:"Integrate with Geographic Information Systems (ArcGIS, QGIS) for spatial data.",
    ow:"Integration Director",
    sc:"Meter location synchronization and area boundary management.",
    dep:"Integration (MV-DOM-040), Meter (MV-DOM-001), Area (MV-DOM-007)",
    pr:"P2",wv:"06",ses:"5"
  }],
  "MV-DOM-044": ["SCADA", "07_INTEGRATION", {
    pu:"Integrate with Supervisory Control and Data Acquisition systems for real-time monitoring.",
    ow:"Integration Director",
    sc:"Real-time meter data acquisition from SCADA systems via OPC/Modbus protocols.",
    dep:"Integration (MV-DOM-040), Reading (MV-DOM-002)",
    pr:"P2",wv:"06",ses:"6"
  }],
  "MV-DOM-045": ["Field Service", "07_INTEGRATION", {
    pu:"Manage field service operations including technician dispatch, work orders, and mobile workforce.",
    ow:"Field Operations Director",
    sc:"End-to-end field service lifecycle from work order creation through dispatch, execution, and completion.",
    cap:{WorkOrders:"Create and assign work orders",Dispatch:"Optimize technician routing",Mobile:"Mobile app for field techs",Completion:"Digital signature and photo capture"},
    dep:"Meter (MV-DOM-001), Customer (MV-DOM-003), Asset (MV-DOM-065)",
    pr:"P1",wv:"05",ses:"6"
  }],

  // ===== PLATFORM =====
  "MV-DOM-046": ["Authentication", "08_PLATFORM", {
    pu:"Manage user authentication including login, MFA, session management, and SSO integration.",
    ow:"Security Director",
    sc:"Authentication lifecycle from login through session management to logout across all user types.",
    cap:{Login:"Password and SSO authentication",MFA:"TOTP and hardware key support",Sessions:"JWT session management",SSO:"SAML/OIDC integration"},
    lc:"ACTIVE → LOCKED → ARCHIVED",
    dep:"User (MV-DOM-003 via roles)",
    api:"POST /api/auth/login, POST /api/auth/register, GET /api/auth/me, POST /api/auth/dev-login",
    db:"User, Session, ApiKey",
    pr:"P0",wv:"01",ses:"4"
  }],
  "MV-DOM-047": ["Authorization", "08_PLATFORM", {
    pu:"Manage role-based access control (RBAC) with fine-grained permissions across all platform resources.",
    ow:"Security Director",
    sc:"Role and permission management including permission assignment, role hierarchy, and segregation of duties.",
    cap:{Roles:"Role definition and hierarchy",Permissions:"Per-resource permission assignment",SoD:"Segregation of duties enforcement",Audit:"Permission change audit trail"},
    dep:"Authentication (MV-DOM-046)",
    api:"CRUD via /api/admin/roles, /api/admin/permissions",
    db:"Role, Permission, PermissionOnRole",
    pr:"P0",wv:"01",ses:"3"
  }],
  "MV-DOM-048": ["Tenant", "08_PLATFORM", {
    pu:"Manage multi-tenant isolation for organizations, projects, and data scoping.",
    ow:"Platform Director",
    sc:"Tenant lifecycle, data isolation strategies, cross-tenant reporting, and tenant provisioning.",
    cap:{Isolation:"Data isolation per tenant",Provisioning:"Automated tenant setup",Reporting:"Cross-tenant analytics"},
    dep:"Organization (MV-DOM-008), Authorization (MV-DOM-047)",
    pr:"P0",wv:"04",ses:"4"
  }],
  "MV-DOM-049": ["Configuration", "08_PLATFORM", {
    pu:"Manage system-wide configuration settings, feature flags, and application parameters.",
    ow:"Platform Director",
    sc:"Configuration CRUD, change approval, versioning, and environment-specific settings.",
    cap:{Settings:"System setting management",FeatureFlags:"Gradual feature rollout",ChangeMgmt:"Configuration change approval"},
    api:"CRUD via /api/admin/settings, /api/admin/feature-flags, /api/admin/branding",
    db:"SystemSetting, FeatureFlag, BrandingConfig",
    pr:"P0",wv:"02",ses:"3"
  }],
  "MV-DOM-050": ["Deployment", "08_PLATFORM", {
    pu:"Manage application deployment including CI/CD pipeline, environment promotion, and release management.",
    ow:"DevOps",
    sc:"Release lifecycle from build through test, staging, and production deployment with rollback capability.",
    cap:{Pipeline:"CI/CD build and deploy",Environments:"Dev/staging/prod promotion",Rollback:"Automated rollback on failure"},
    dep:"Version (MV-DOM-057), Plugin (MV-DOM-058)",
    pr:"P1",wv:"04",ses:"4"
  }],
  "MV-DOM-051": ["Monitoring", "08_PLATFORM", {
    pu:"Monitor system health, performance metrics, and business KPIs with alerting.",
    ow:"DevOps",
    sc:"Infrastructure and application monitoring, metric collection, dashboard visualization, and threshold alerting.",
    cap:{Metrics:"CPU, memory, disk, API latency",Health:"Component status checks",Alerts:"Threshold-based alerting",Dashboards:"Real-time visualization"},
    api:"GET /api/admin/health, GET /api/admin/monitoring, GET /api/monitor/metrics/prometheus",
    db:"Metric storage (Prometheus), Alert, AlertRule",
    pr:"P0",wv:"02",ses:"4"
  }],
  "MV-DOM-052": ["Logging", "08_PLATFORM", {
    pu:"Manage centralized logging for application events, errors, and audit trails.",
    ow:"DevOps",
    sc:"Log collection, storage, search, and retention across all platform components.",
    cap:{Collection:"Centralized log aggregation",Search:"Full-text log search",Retention:"Configurable retention policies"},
    dep:"Monitoring (MV-DOM-051)",
    pr:"P0",wv:"02",ses:"2"
  }],
  "MV-DOM-053": ["Backup", "08_PLATFORM", {
    pu:"Manage database and configuration backup with encryption and off-site replication.",
    ow:"DevOps",
    sc:"Backup scheduling, encryption, verification, retention, and off-site replication.",
    cap:{Scheduling:"Automated backup schedules",Encryption:"AES-256 encryption",Verification:"Automated restore testing",Retention:"Configurable retention policies"},
    dep:"Recovery (MV-DOM-054)",
    api:"CRUD via /api/admin/backups",
    db:"Backup",
    pr:"P0",wv:"02",ses:"3"
  }],
  "MV-DOM-054": ["Recovery", "08_PLATFORM", {
    pu:"Manage disaster recovery including restore procedures, failover, and business continuity.",
    ow:"DevOps",
    sc:"Recovery procedures for database restore, application failover, and full disaster recovery.",
    cap:{Restore:"Database restore from backup",Failover:"Application failover to DR",DR:"Full disaster recovery execution"},
    dep:"Backup (MV-DOM-053), Deployment (MV-DOM-050)",
    pr:"P0",wv:"02",ses:"4"
  }],
  "MV-DOM-055": ["Health", "08_PLATFORM", {
    pu:"Manage system health checks and status reporting for all platform components.",
    ow:"DevOps",
    sc:"Component health monitoring, dependency checks, and status page management.",
    cap:{Checks:"Automated component health checks",Status:"Real-time system status page",Dependencies:"External service monitoring"},
    dep:"Monitoring (MV-DOM-051), Logging (MV-DOM-052)",
    api:"GET /api/health, GET /api/admin/deep-health",
    pr:"P0",wv:"01",ses:"2"
  }],
  "MV-DOM-056": ["Diagnostics", "08_PLATFORM", {
    pu:"Manage system diagnostics and troubleshooting tools for operational support.",
    ow:"DevOps",
    sc:"Diagnostic endpoint testing, connectivity verification, and system troubleshooting.",
    cap:{Endpoints:"23 endpoint health checks",Testing:"Connectivity and performance tests"},
    api:"GET /api/diagnostics/system/diagnostics",
    pr:"P1",wv:"02",ses:"2"
  }],
  "MV-DOM-057": ["Version", "08_PLATFORM", {
    pu:"Manage software versioning, release notes, and compatibility tracking.",
    ow:"Engineering",
    sc:"Version tracking across backend, frontend, and mobile applications.",
    cap:{Tracking:"Version history and release notes",Compatibility:"Cross-component compatibility"},
    dep:"Deployment (MV-DOM-050)",
    pr:"P1",wv:"04",ses:"2"
  }],
  "MV-DOM-058": ["Plugin", "08_PLATFORM", {
    pu:"Manage plugin/extensibility system for third-party and custom extensions.",
    ow:"Platform Director",
    sc:"Plugin lifecycle from marketplace installation through upgrade to removal.",
    cap:{Marketplace:"Plugin discovery and installation",Sandbox:"Isolated plugin execution",Lifecycle:"Install→upgrade→remove"},
    dep:"Version (MV-DOM-057), Deployment (MV-DOM-050)",
    pr:"P2",wv:"06",ses:"4"
  }],

  // ===== DOCUMENTS =====
  "MV-DOM-059": ["Document", "09_DOCUMENTS", {
    pu:"Manage document storage, versioning, categorization, and access control.",
    ow:"Document Manager",
    sc:"Document upload, malware scanning, categorization, version control, and retention management.",
    cap:{Upload:"File upload with malware scan",Categorization:"Tag and categorize",Versioning:"Document version control",Access:"Role-based access control"},
    api:"CRUD via /api/documents, file upload via POST /api/documents/upload",
    db:"StoredFile",
    pr:"P0",wv:"02",ses:"3"
  }],
  "MV-DOM-060": ["Media", "09_DOCUMENTS", {
    pu:"Manage media assets including images, videos, and audio files.",
    ow:"Document Manager",
    sc:"Media asset upload, transcoding, CDN delivery, and gallery management.",
    dep:"Document (MV-DOM-059)",
    pr:"P1",wv:"04",ses:"2"
  }],
  "MV-DOM-061": ["Attachment", "09_DOCUMENTS", {
    pu:"Manage file attachments linked to specific entity records.",
    ow:"Document Manager",
    sc:"Entity-linked attachment upload, download, and lifecycle tied to parent entity.",
    dep:"Document (MV-DOM-059)",
    pr:"P1",wv:"02",ses:"1"
  }],
  "MV-DOM-062": ["Report", "09_DOCUMENTS", {
    pu:"Manage report generation, scheduling, distribution, and template management.",
    ow:"Reporting Director",
    sc:"Report definition, generation via JasperReports/Playwright, scheduling, and multi-format export.",
    cap:{Generation:"Report generation (PDF, Excel, CSV)",Scheduling:"Automated report delivery",Templates:"Report template management",Export:"Multi-format export support"},
    dep:"All domains (data sources), Document (MV-DOM-059)",
    api:"POST /api/reports/export, POST /api/reports/jasper/generate, GET /api/reports/types",
    db:"ReportDefinition, ScheduledReport, ExportJob, ExportLog",
    pr:"P0",wv:"03",ses:"6"
  }],
  "MV-DOM-063": ["Dashboard", "09_DOCUMENTS", {
    pu:"Manage operational dashboards with real-time metrics, charts, and drill-down capabilities.",
    ow:"Operations Director",
    sc:"Dashboard configuration, widget management, real-time data refresh, and role-based visibility.",
    dep:"Analytics (MV-DOM-034), Monitoring (MV-DOM-051), Report (MV-DOM-062)",
    pr:"P0",wv:"03",ses:"4"
  }],

  // ===== OPERATIONS =====
  "MV-DOM-064": ["Inventory", "10_OPERATIONS", {
    pu:"Manage physical inventory of meters, SIMs, gateways, and spare parts.",
    ow:"Supply Chain Director",
    sc:"Inventory tracking including stock levels, movements, reorder points, and warehouse management.",
    cap:{Stock:"Stock level tracking",Movements:"Inbound/outbound tracking",Reorder:"Automated reorder points"},
    dep:"Meter (MV-DOM-001), SIM (MV-DOM-026), Asset (MV-DOM-065)",
    pr:"P1",wv:"04",ses:"4"
  }],
  "MV-DOM-065": ["Asset", "10_OPERATIONS", {
    pu:"Manage enterprise asset lifecycle including registration, maintenance, depreciation, and retirement.",
    ow:"Asset Manager",
    sc:"Enterprise asset lifecycle management including financial tracking, maintenance scheduling, and compliance.",
    cap:{Registration:"Asset registration with barcode/RFID",Maintenance:"Preventive and corrective maintenance",Depreciation:"Asset value tracking",Retirement:"End-of-life disposal"},
    lc:"ACTIVE → MAINTENANCE → RETIRED → DISPOSED",
    dep:"Inventory (MV-DOM-064), Maintenance (MV-DOM-067)",
    pr:"P1",wv:"04",ses:"4"
  }],
  "MV-DOM-066": ["Procurement", "10_OPERATIONS", {
    pu:"Manage procurement of meters, SIMs, gateways, and services from vendors.",
    ow:"Supply Chain Director",
    sc:"Vendor management, purchase orders, goods receipt, and invoice matching.",
    dep:"Inventory (MV-DOM-064), Asset (MV-DOM-065)",
    pr:"P2",wv:"06",ses:"4"
  }],
  "MV-DOM-067": ["Maintenance", "10_OPERATIONS", {
    pu:"Manage preventive and corrective maintenance for all physical assets.",
    ow:"Maintenance Director",
    sc:"Maintenance scheduling, work order management, technician assignment, and completion verification.",
    dep:"Asset (MV-DOM-065), Field Service (MV-DOM-045)",
    pr:"P1",wv:"04",ses:"4"
  }],
}

// Generate files
let count = 0
for (const [id, [name, group, data]] of Object.entries(domains)) {
  const dir = `${BASE}/${group}/${name.toLowerCase().replace(/\s+/g,'_')}`
  const content = gen(id, name, group, data)
  fs.writeFileSync(`${dir}/DOMAIN.md`, content)
  count++
}

console.log(`Generated ${count} domain files`)
console.log(`Total domains now: ${count + 8} (8 existing + ${count} new)`)
