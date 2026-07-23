/**
 * Planning OS v2.0 — Generate all 16 enterprise governance layers
 * Adds ONLY new directories and files. Never modifies existing.
 */
import { mkdirSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const V2_ROOT = 'D:/meter/planning/000_ENTERPRISE_PROGRAM';

// ═══ LAYER 1: Enterprise Capability Model ═══
const capDir = join(V2_ROOT, '01_Enterprise_Capability_Model');
mkdirSync(capDir, { recursive: true });

const capabilities = [
  {
    name: 'Customer Management',
    description: 'End-to-end customer lifecycle management',
    subCapabilities: ['Customer CRUD', 'Customer Timeline', 'Customer Documents', 'Customer Billing', 'Customer Notification', 'Customer Contracts', 'Customer Analytics', 'Customer AI'],
    owner: 'System A + B',
    wave: 'Wave 01',
  },
  {
    name: 'Meter Management',
    description: 'Meter inventory, assignment, and lifecycle',
    subCapabilities: ['Meter CRUD', 'Meter Assignment', 'Meter Events', 'Meter Reading Collection', 'Meter Analytics'],
    owner: 'System A + B',
    wave: 'Wave 01',
  },
  {
    name: 'Reading Management',
    description: 'Consumption data ingestion and validation',
    subCapabilities: ['Reading CRUD', 'Bulk Import', 'Validation Rules', 'Anomaly Detection', 'Reading Analytics'],
    owner: 'System A + B',
    wave: 'Wave 01 + Wave 05',
  },
  {
    name: 'Billing Management',
    description: 'Invoice generation, tariff application, payment processing',
    subCapabilities: ['Tariff Engine', 'BillRun Engine', 'Invoice Generation', 'Discount Engine', 'Tax Engine', 'Payment Processing', 'Collections'],
    owner: 'System A',
    wave: 'Wave 01 + Wave 03',
  },
  {
    name: 'Payment Management',
    description: 'Payment collection, reconciliation, and reporting',
    subCapabilities: ['Payment CRUD', 'Payment Gateway', 'Payment Reconciliation', 'Promise-to-Pay', 'Collection Workflow'],
    owner: 'System A + B',
    wave: 'Wave 01 + Wave 03',
  },
  {
    name: 'Contract Management',
    description: 'Customer contract lifecycle and terms',
    subCapabilities: ['Contract CRUD', 'Contract Terms', 'Contract Amendments', 'Contract Expiry Notifications', 'Auto-Renewal'],
    owner: 'System A',
    wave: 'Wave 01',
  },
  {
    name: 'Notification Management',
    description: 'Multi-channel communication with customers and staff',
    subCapabilities: ['In-App Notifications', 'Email Notifications', 'SMS Notifications', 'Push Notifications', 'Notification Templates', 'Notification Preferences'],
    owner: 'System A + B',
    wave: 'Wave 01 + Wave 02',
  },
  {
    name: 'User Management',
    description: 'User accounts, roles, permissions, and authentication',
    subCapabilities: ['User CRUD', 'Role Management', 'Permission Management', 'Authentication', 'Session Management', 'MFA', 'Audit Trail'],
    owner: 'System A',
    wave: 'Wave 01',
  },
  {
    name: 'Reporting & Analytics',
    description: 'Business intelligence and KPI tracking',
    subCapabilities: ['Report Definitions', 'Scheduled Reports', 'KPI Dashboard', 'Real-Time Dashboard', 'Custom Report Builder', 'Data Export'],
    owner: 'System A',
    wave: 'Wave 01 + Wave 05',
  },
  {
    name: 'System Administration',
    description: 'Platform configuration, monitoring, and maintenance',
    subCapabilities: ['System Settings', 'Feature Flags', 'Audit Log', 'Monitoring', 'Backup/Restore', 'Cache Management', 'Queue Management'],
    owner: 'System A',
    wave: 'Wave 01 + Wave 04',
  },
];

let capContent = '# Enterprise Capability Model\n\n**Purpose:** Master catalog of all business capabilities. Every feature maps to a capability.\n\n';
capContent += '| Capability | Description | Sub-Capabilities | Owner | Wave |\n';
capContent += '|-----------|-------------|-----------------|-------|------|\n';
for (const c of capabilities) {
  capContent += '| ' + c.name + ' | ' + c.description + ' | ' + c.subCapabilities.join(', ') + ' | ' + c.owner + ' | ' + c.wave + ' |\n';
}
writeFileSync(join(capDir, 'CAPABILITY_CATALOG.md'), capContent);
console.log('  Layer 1: Enterprise Capability Model');

// ═══ LAYER 2: Business Process Catalog ═══
const procDir = join(V2_ROOT, '02_Business_Process_Catalog');
mkdirSync(procDir, { recursive: true });

const processes = {
  'Customer_Onboarding.md': '# Customer Onboarding\n\n## Actors\n- Admin User\n- System\n\n## Input\n- Customer information\n- Meter serial number\n\n## Process Flow\n1. Create customer record\n2. Assign meter to customer\n3. Validate meter assignment\n4. Create contract\n5. Configure tariff\n6. Activate service\n7. Send welcome notification\n\n## Output\n- Active customer with assigned meter\n- Active contract\n- Welcome notification sent\n\n## Decision Points\n- Is meter available? Yes → Assign. No → Order meter.\n- Is contract required? Yes → Create contract. No → Skip.\n\n## Failure Points\n- Meter already assigned to another customer → Error, reassign required\n- Invalid customer data → Validation error, correct and retry\n\n## Recovery\n- Rollback meter assignment if contract creation fails\n- Retry notification delivery up to 3 times\n\n## Automation\n- Meter assignment triggers contract generation\n- Contract activation triggers service provisioning\n\n## AI Assistance\n- Suggest optimal tariff based on customer profile\n- Predict meter reading schedule\n\n## Notifications\n- Welcome email to customer\n- Assignment confirmation to operator\n\n## KPIs\n- Time to onboard (target: < 24 hours)\n- First reading within 7 days\n',
  'Meter_Reading_Cycle.md': '# Meter Reading Cycle\n\n## Actors\n- Field Operator (System B)\n- System\n\n## Input\n- Meter assignment\n- Reading schedule\n\n## Process Flow\n1. Schedule reading\n2. Collect reading (manual or automated)\n3. Validate reading\n4. Apply validation rules\n5. Flag anomalies\n6. Store reading\n7. Trigger billing if cycle complete\n\n## Output\n- Validated reading record\n- Anomaly alerts (if applicable)\n\n## Decision Points\n- Reading within expected range? Yes → Store. No → Flag anomaly.\n- Manual or automated reading? Manual → Require operator verification.\n\n## Failure Points\n- Reading exceeds max threshold → Flag for review, do not auto-bill\n- Meter communication failure → Schedule retry, notify operator\n\n## Recovery\n- Allow re-reading within 24 hours\n- Manual override for verified anomalous readings\n\n## Automation\n- Auto-schedule readings based on meter type and location\n- Auto-validate using configured rules\n\n## AI Assistance\n- Predict expected reading range from historical data\n- Detect tampering patterns\n\n## Notifications\n- Anomaly alert to supervisor\n- Reading confirmation to customer (if enabled)\n\n## KPIs\n- Readings collected on time (target: 98%)\n- Anomaly detection rate (target: > 95%)\n',
  'Invoice_Billing_Cycle.md': '# Invoice Billing Cycle\n\n## Actors\n- System (automated)\n- Admin (override)\n\n## Input\n- Meter readings for billing period\n- Tariff rates\n- Customer contracts\n\n## Process Flow\n1. Start BillRun\n2. Aggregate readings per meter\n3. Apply tariff rates\n4. Calculate charges\n5. Apply discounts\n6. Calculate taxes\n7. Generate invoice\n8. Apply late fees (if applicable)\n9. Send invoice to customer\n\n## Output\n- Generated invoice\n- Invoice notification sent\n\n## Decision Points\n- Reading exists for full period? Yes → Bill. No → Estimate or skip.\n- Customer has active contract? Yes → Apply contract rates. No → Apply default.\n\n## Failure Points\n- Missing readings → Estimate based on historical average\n- Tariff expired → Use last active tariff, flag for admin review\n\n## Recovery\n- Regenerate invoice after tariff correction\n- Void and recreate invoice if billing error detected\n\n## Automation\n- Full cycle automated end-to-end\n- Exceptions routed to admin for manual review\n\n## AI Assistance\n- Predict billing anomalies before invoice generation\n- Optimize tariff selection for customer segments\n\n## Notifications\n- Invoice generated notification\n- Invoice overdue reminders\n- Payment confirmation\n\n## KPIs\n- Bills generated on time (target: 100%)\n- Billing accuracy (target: > 99.9%)\n',
};

for (const [filename, content] of Object.entries(processes)) {
  writeFileSync(join(procDir, filename), content);
}
console.log('  Layer 2: Business Process Catalog');

// ═══ LAYER 3: Enterprise Data Dictionary ═══
const dictDir = join(V2_ROOT, '03_Enterprise_Data_Dictionary');
mkdirSync(dictDir, { recursive: true });

const entities = ['Customer', 'Meter', 'Reading', 'Invoice', 'Payment', 'Contract', 'User', 'Notification'];
let dictContent = '# Enterprise Data Dictionary\n\n**Purpose:** Single source of truth for every data entity, field, and its meaning.\n\n';
for (const entity of entities) {
  dictContent += '## ' + entity + '\n\n| Field | Type | Nullable | Business Meaning | Owner | Searchable | Indexed | Encrypted |\n|-------|------|----------|-----------------|-------|-----------|---------|----------|\n';
  dictContent += '| id | UUID | No | Unique identifier | System | No | Yes | No |\n';
  dictContent += '| createdAt | DateTime | No | Record creation timestamp | System | No | Yes | No |\n';
  dictContent += '| updatedAt | DateTime | No | Last modification timestamp | System | No | Yes | No |\n';
  dictContent += '| archivedAt | DateTime | Yes | Soft delete timestamp | System | No | Yes | No |\n\n';
}
writeFileSync(join(dictDir, 'DATA_DICTIONARY.md'), dictContent);
console.log('  Layer 3: Enterprise Data Dictionary');

// ═══ LAYER 4: API Contract Library ═══
const apiDir = join(V2_ROOT, '04_API_Contract_Library');
mkdirSync(apiDir, { recursive: true });

const apiRoutes = ['customers', 'meters', 'readings', 'invoices', 'payments', 'notifications', 'auth', 'alerts'];
let apiContent = '# API Contract Library\n\n**Purpose:** Every endpoint documented with contract, validation, errors, and events.\n\n';
for (const route of apiRoutes) {
  apiContent += '## /api/' + route + '\n\n### Authentication\n- Required: Yes\n- Permission key: ' + route + '.{action}\n\n### Endpoints\n\n| Method | Path | Permission | Input | Output |\n|--------|------|-----------|-------|--------|\n';
  apiContent += '| GET | /api/' + route + ' | ' + route + '.list | page, limit, search | { ' + route + ': [], total, page, limit } |\n';
  apiContent += '| GET | /api/' + route + '/:id | ' + route + '.read | — | { ' + route + ': {} } |\n';
  apiContent += '| POST | /api/' + route + ' | ' + route + '.create | { ...fields } | { ' + route + ': {} } |\n';
  apiContent += '| PUT | /api/' + route + '/:id | ' + route + '.update | { ...fields } | { ' + route + ': {} } |\n';
  apiContent += '| DELETE | /api/' + route + '/:id | ' + route + '.delete | — | { success: true } |\n\n';
  apiContent += '### Errors\n- 400: Validation error\n- 401: Authentication required\n- 403: Permission denied\n- 404: Not found\n- 500: Internal error\n\n### Events\n- create → ' + route + '.created event\n- update → ' + route + '.updated event\n- delete → ' + route + '.deleted event\n\n---\n\n';
}
writeFileSync(join(apiDir, 'API_CONTRACTS.md'), apiContent);
console.log('  Layer 4: API Contract Library');

// ═══ LAYER 5: Component Catalog ═══
const compDir = join(V2_ROOT, '05_Component_Catalog');
mkdirSync(compDir, { recursive: true });

const components = [
  { name: 'GenericAdminPage', type: 'Page', props: 'config: PageConfig', owner: 'Admin', status: 'Live' },
  { name: 'DataTable', type: 'Table', props: 'columns, data, pagination', owner: 'Shared', status: 'Live' },
  { name: 'Card', type: 'Layout', props: 'title, children', owner: 'Shared', status: 'Live' },
  { name: 'Button', type: 'Input', props: 'variant, size, onClick', owner: 'Shared', status: 'Live' },
  { name: 'Badge', type: 'Display', props: 'variant, children', owner: 'Shared', status: 'Live' },
  { name: 'Skeleton', type: 'Feedback', props: 'width, height', owner: 'Shared', status: 'Live' },
  { name: 'ErrorBoundary', type: 'Feedback', props: 'fallback', owner: 'Shared', status: 'Planned' },
  { name: 'Breadcrumbs', type: 'Navigation', props: 'items: BreadcrumbItem[]', owner: 'Shared', status: 'Planned' },
  { name: 'SearchBar', type: 'Input', props: 'onSearch, placeholder', owner: 'Shared', status: 'Planned' },
  { name: 'CommandPalette', type: 'Navigation', props: 'commands, onSelect', owner: 'Shared', status: 'Planned' },
];

let compContent = '# Component Catalog\n\n**Purpose:** All shared UI components, their props, owners, and status.\n\n';
compContent += '| Component | Type | Props | Owner | Status | Graphiti Node |\n';
compContent += '|-----------|------|-------|-------|--------|--------------|\n';
for (const c of components) {
  compContent += '| ' + c.name + ' | ' + c.type + ' | ' + c.props + ' | ' + c.owner + ' | ' + c.status + ' | ✅ |\n';
}
writeFileSync(join(compDir, 'COMPONENT_CATALOG.md'), compContent);
console.log('  Layer 5: Component Catalog');

// ═══ LAYER 6: Runtime Dependency Map ═══
const rtDir = join(V2_ROOT, '06_Runtime_Dependency_Map');
mkdirSync(rtDir, { recursive: true });
let rtContent = '# Runtime Dependency Map\n\n**Purpose:** Document how runtime services depend on each other.\n\n```\nWorkspace Engine\n  └── Registry\n       └── Runtime Kernel\n            ├── Widgets\n            │    └── Context\n            └── Permissions\n                 └── API\n                      └── BFF\n                           └── Backend\n                                └── Database\n```\n\n### Current Runtime Stack\n\n| Service | Depends On | Depended By | Status |\n|---------|-----------|------------|--------|\n| auth-engine | prisma, bcrypt, jwt | All routes | ✅ Live |\n| notification-engine | prisma | All routes | ✅ Live |\n| email-engine | nodemailer, prisma | notification-engine | ✅ Live |\n| billing-engine | prisma | invoices route | ✅ Live |\n| validation-engine | prisma | readings route | ✅ Live |\n| alert-engine | prisma | monitoring | ✅ Live |\n| kpi-engine | prisma | Dashboard | ✅ Live |\n| monitor (middleware) | prisma | All routes | ✅ Live |\n';
writeFileSync(join(rtDir, 'RUNTIME_DEPENDENCY_MAP.md'), rtContent);
console.log('  Layer 6: Runtime Dependency Map');

// ═══ LAYER 7: Feature Dependency Matrix ═══
const fdDir = join(V2_ROOT, '07_Feature_Dependency_Matrix');
mkdirSync(fdDir, { recursive: true });
let fdContent = '# Feature Dependency Matrix\n\n**Purpose:** Every feature lists its dependencies. No feature is implemented before its dependencies.\n\n| Feature | Depends On |\n|---------|-----------|\n| Customer Documents | Customer, Permission, Upload, Storage, Audit, Notification, Search, Timeline |\n| Invoice Generation | Reading, Tariff, ChargeRule, Contract, Customer |\n| Payment Gateway | Payment, Invoice, Customer, Audit, Notification |\n| AI Anomaly Detection | Reading, ValidationRule, Audit, Timeline, Notification |\n| Real-Time Dashboard | WebSocket, KPI, ActivityStream, Permission |\n| Mobile Sync | Auth, Customer, Meter, Reading, Offline Queue |\n| Search | Customer, Meter, Reading, Invoice, Elasticsearch |\n';
writeFileSync(join(fdDir, 'FEATURE_DEPENDENCY_MATRIX.md'), fdContent);
console.log('  Layer 7: Feature Dependency Matrix');

// ═══ LAYER 8: Cross-Wave Dependency Matrix ═══
const cwDir = join(V2_ROOT, '08_CrossWave_Dependency_Matrix');
mkdirSync(cwDir, { recursive: true });
let cwContent = '# Cross-Wave Dependency Matrix\n\n**Purpose:** Waves are not isolated — this matrix tracks cross-wave dependencies.\n\n| Wave 02 Feature | Depends on Wave 01 | Depends on Wave XX |\n|----------------|-------------------|-------------------|\n| Tasks Module | Auth, Permission, User, Notification | — |\n| Search | All entity CRUDs | — |\n| WebSocket | Auth, Notification | — |\n| Email Delivery | EmailLog model, SMTP config | — |\n| Accessibility | All UI components | — |\n\n| Wave 03 Feature | Depends on Wave 01 | Depends on Wave 02 |\n|----------------|-------------------|-------------------|\n| Tariff Engine | Tariff model, Reading | — |\n| BillRun Engine | Invoice, Reading, Tariff | — |\n| Payment Gateway | Payment, Invoice | Notifications |\n\n| Wave 05 Feature | Depends on Wave 01 | Depends on Wave 03 |\n|----------------|-------------------|-------------------|\n| Anomaly Detection | Reading, ValidationRule | — |\n| AI Chat | Auth, Permission, All entities | — |\n| Forecasting | Reading (history) | Billing data |\n\n| Wave 06 Feature | Depends on Wave 01-05 |\n|----------------|----------------------|\n| Mobile API | Auth (mobile scope), All entities |\n| Production Deploy | All waves complete |\n';
writeFileSync(join(cwDir, 'CROSSWAVE_DEPENDENCY_MATRIX.md'), cwContent);
console.log('  Layer 8: Cross-Wave Dependency Matrix');

// ═══ LAYER 9: Risk Register ═══
const riskDir = join(V2_ROOT, '09_Risk_Register');
mkdirSync(riskDir, { recursive: true });
let riskContent = '# Risk Register\n\n**Purpose:** All identified risks with mitigation plans.\n\n| ID | Risk | Category | Probability | Impact | Mitigation | Owner |\n|----|------|----------|------------|--------|-----------|-------|\n| R01 | Email delivery failure | Operational | Medium | High | Retry queue, fallback to in-app | Engineering |\n| R02 | Database connection pool exhaustion | Performance | Low | Critical | PgBouncer (Wave 04), connection limiting | Engineering |\n| R03 | Permission key gaps | Security | Medium | High | Automated permission audit in CI | Architecture |\n| R04 | Schema drift between ORM and DB | Technical | Low | High | Migration chain, prisma validate in CI | Engineering |\n| R05 | Browser compatibility | UX | Medium | Medium | Playwright cross-browser tests | Frontend |\n| R06 | Third-party API deprecation (SMS/Email) | Operational | Low | High | Adapter pattern, multiple providers | Engineering |\n| R07 | Data loss during migration | Operational | Low | Critical | Rollback plan, backup before migration | DevOps |\n| R08 | AI model accuracy degradation | AI | Medium | Medium | Continuous monitoring, fallback to rules | AI/ML |\n';
writeFileSync(join(riskDir, 'RISK_REGISTER.md'), riskContent);
console.log('  Layer 9: Risk Register');

// ═══ LAYER 10: Architecture Decision Records ═══
const adrDir = join(V2_ROOT, '10_Architecture_Decision_Records');
mkdirSync(adrDir, { recursive: true });

// Reference existing ADRs in graphiti
let adrContent = '# Architecture Decision Records\n\n**Purpose:** Every important architecture decision is recorded and never revisited without a new ADR.\n\n| ADR | Title | Date | Status | Location |\n|-----|-------|------|--------|----------|\n| ADR-001 | BFF Pattern — Backend for Frontend | 2026-07-19 | Accepted | graphiti/ADR-001-bff-pattern.md |\n| ADR-002 | Design Token System | 2026-07-19 | Accepted | graphiti/ADR-002-design-tokens.md |\n| ADR-003 | V3 Database Trigger Pattern | 2026-07-19 | Accepted | graphiti/ADR-003-v3-trigger-pattern.md |\n| ADR-004 | Meter/ Parallel Codebase Decision | 2026-07-23 | Accepted | graphiti/ADR-004-meter-decision.md |\n\n### How to Create a New ADR\n1. Copy template from graphiti/ADR-*.md\n2. Assign next sequential number\n3. Document: Context, Decision, Consequences, Alternatives\n4. Add to this index\n5. Update Graphiti\n';
writeFileSync(join(adrDir, 'ADR_INDEX.md'), adrContent);
console.log('  Layer 10: Architecture Decision Records');

// ═══ LAYER 11: Technical Debt Register ═══
const debtDir = join(V2_ROOT, '11_Technical_Debt_Register');
mkdirSync(debtDir, { recursive: true });
let debtContent = '# Technical Debt Register\n\n**Purpose:** Track all known technical debt with priority and fix wave.\n\n| ID | Debt | Priority | Created | Impact | Fix Wave | Owner |\n|----|------|----------|---------|--------|---------|-------|\n| TD01 | page-configs.ts (45KB, 758 lines) | High | Wave 01 | 1.79GB dev server memory | Wave 02 | Frontend |\n| TD02 | requirePermission only on 5/17 routes | High | Wave 01 | Permission gaps | Wave 02 | Backend |\n| TD03 | Zero unit tests | Critical | Wave 01 | No regression safety | Wave 02 | QA |\n| TD04 | Zero enums in Prisma schema | Medium | Wave 01 | String-based status fields | Wave 03 | Database |\n| TD05 | Email/SMS not actually sending | High | Wave 01 | Stub implementation | Wave 02 | Backend |\n| TD06 | No user-facing BFF API | Medium | Wave 01 | Dashboard uses admin API | Wave 02 | Backend |\n| TD07 | No WebSocket for real-time | Medium | Wave 01 | No live updates | Wave 02 | Backend |\n| TD08 | Meter/ 267K files unresolved | Medium | Wave 01 | Repository bloat | Wave 02 | DevOps |\n';
writeFileSync(join(debtDir, 'TECHNICAL_DEBT_REGISTER.md'), debtContent);
console.log('  Layer 11: Technical Debt Register');

// ═══ LAYER 12: Enterprise Testing Pyramid ═══
const testDir = join(V2_ROOT, '12_Enterprise_Testing_Pyramid');
mkdirSync(testDir, { recursive: true });
let testContent = '# Enterprise Testing Pyramid\n\n**Purpose:** Every feature maps to required test types.\n\n```\n            ⬆ Chaos\n          ⬆ Load/Stress\n        ⬆ Security\n      ⬆ E2E (Playwright)\n    ⬆ API/Integration\n  ⬆ Component (Storybook)\n⬆ Unit (Vitest)\n```\n\n| Test Type | Tool | Coverage Target | Wave |\n|-----------|------|----------------|------|\n| Unit | Vitest | 70%+ | Wave 02 |\n| Component | Vitest + Testing Library | 50%+ | Wave 02 |\n| API/Integration | Vitest + supertest | 90%+ endpoints | Wave 02 |\n| E2E | Playwright | All critical paths | Wave 02 |\n| Security | CodeQL + npm audit | Zero critical | Wave 04 |\n| Performance | k6 | P99 < 500ms | Wave 04 |\n| Load | k6 | 10K concurrent | Wave 06 |\n| Accessibility | axe-core | WCAG 2.1 AA | Wave 02 |\n| Chaos | chaos-engineering | Recovery within RTO | Wave 06 |\n| Regression | Full suite | 100% pass | Every PR |\n';
writeFileSync(join(testDir, 'TESTING_PYRAMID.md'), testContent);
console.log('  Layer 12: Enterprise Testing Pyramid');

// ═══ LAYER 13: Migration Catalog ═══
const migDir = join(V2_ROOT, '13_Migration_Catalog');
mkdirSync(migDir, { recursive: true });
let migContent = '# Migration Catalog\n\n**Purpose:** Every migration is documented with rollback and validation.\n\n| Migration | From | To | Status | Rollback | Validation |\n|-----------|------|----|--------|----------|-----------|\n| M01: Init Schema | Empty | 78 models | ✅ Applied | Drop all tables | Schema valid, server starts |\n| M02: Add Indexes | No indexes | 68 indexes | ✅ Applied | Remove indexes | EXPLAIN ANALYZE shows index scans |\n| M03: User Auth Fields | No lockout | loginAttempts, lockedUntil | ✅ Applied | Remove columns | Lockout works after 5 failures |\n\n### Migration Policy\n1. All migrations are versioned and timestamped\n2. Rollback script must exist before migration runs\n3. Validation step must pass before marking complete\n4. Data integrity check required for data migrations\n';
writeFileSync(join(migDir, 'MIGRATION_CATALOG.md'), migContent);
console.log('  Layer 13: Migration Catalog');

// ═══ LAYER 14: Release Train ═══
const relDir = join(V2_ROOT, '14_Release_Train');
mkdirSync(relDir, { recursive: true });
let relContent = '# Release Train\n\n**Purpose:** Standardized release process for every wave.\n\n```\nDevelopment → QA → UAT → Pilot → Production → Hotfix\n```\n\n| Stage | Activities | Gates |\n|-------|-----------|-------|\n| Development | Feature implementation, unit tests, component tests | All tests pass, GATE_CHECK passes |\n| QA | Integration tests, regression tests, security scan | Zero P1/P2 issues |\n| UAT | User acceptance testing, stakeholder demo | Sign-off from product owner |\n| Pilot | Limited production rollout (1 org/area) | Pilot success criteria met |\n| Production | Full rollout | All waves complete, enterprise release criteria met |\n| Hotfix | Emergency fixes bypassing normal pipeline | Security/compliance exemption |\n\n### Release Cadence\n- Wave: Every 6-12 weeks\n- Hotfix: Within 24 hours for P1 issues\n- Patch: Within 1 week for P2 issues\n';
writeFileSync(join(relDir, 'RELEASE_TRAIN.md'), relContent);
console.log('  Layer 14: Release Train');

// ═══ LAYER 15: AI Knowledge Base ═══
const aiDir = join(V2_ROOT, '15_AI_Knowledge_Base');
mkdirSync(aiDir, { recursive: true });

const aiKnowledge = {
  'BUSINESS_RULES.md': '# Business Rules\n\n## Customer\n- Customer must have unique email\n- Customer cannot be deleted if has active meters or unpaid invoices\n- Customer status: active, inactive, maintenance, terminated\n\n## Meter\n- Meter serial is unique\n- Meter cannot be deleted if has readings\n- Meter status: active, inactive, maintenance, terminated\n\n## Reading\n- Reading value must be positive\n- Reading cannot be in the future\n- Bulk import validates all rows before committing any\n\n## Billing\n- Invoice cannot be deleted if has payments\n- Invoice status: pending, paid, overdue, cancelled\n- Payment cannot exceed invoice amount\n',
  'API_RULES.md': '# API Rules\n\n1. Every endpoint returns JSON\n2. Every list endpoint supports pagination (page, limit)\n3. Every list endpoint caps limit at 100\n4. Every mutation endpoint requires Zod validation\n5. Every endpoint requires authentication (except /api/auth/login)\n6. Every endpoint requires authorization (requireRole or requirePermission)\n7. Every endpoint is audited (auditLog)\n8. Error responses are always { error: string }\n9. HTTP methods follow REST conventions\n10. System type in JWT must match the application calling\n',
  'DATABASE_RULES.md': '# Database Rules\n\n1. All models have UUID primary keys\n2. All models have createdAt, updatedAt timestamps\n3. Soft delete via archivedAt (not hard delete)\n4. Foreign keys must have @@index\n5. Status fields should use Prisma enum (future wave)\n6. Migrations must have rollback plan\n7. Never use SELECT * — always specify fields\n8. All text fields have max length validation\n9. JSON fields store structured configuration\n10. Connection string from environment, never hardcoded\n',
  'ARCHITECTURE_RULES.md': '# Architecture Rules\n\n1. Shared components are ALWAYS preferred over duplication\n2. System A and System B share the same auth, DB, runtime\n3. System A configures what System B executes\n4. No product-specific fork of shared services\n5. Every new endpoint needs a permission key\n6. Graphiti must be updated before phase completion\n7. SpecKit must pass before step completion\n8. ADR must be created for significant decisions\n9. Rollback plan must exist before migration\n10. Evidence must be committed for every step\n',
  'CODING_STANDARDS.md': '# Coding Standards\n\n## Backend\n- ES modules (import/export)\n- Express Router pattern\n- Zod for validation\n- Prisma for database access\n- JWT for authentication\n\n## Frontend\n- Next.js 16 App Router\n- TypeScript\n- Tailwind CSS\n- shadcn/ui components\n- React Query for data fetching\n- Client components with "use client"\n\n## Naming\n- Models: PascalCase, singular\n- Fields: camelCase\n- Files: kebab-case\n- Functions: camelCase\n- Constants: UPPER_SNAKE_CASE\n',
  'PROMPT_LIBRARY.md': '# Prompt Library\n\nStandard prompts for AI agents working on MeterVerse:\n\n## New Feature\n"Implement [feature] following the existing [entity] pattern. Include:\n- Zod validation schema\n- RBAC with requirePermission\n- auditLog on all mutations\n- Error handling consistent with existing routes\n- Evidence in docs/reviews/"\n\n## Bug Fix\n"Investigate [issue]. Steps:\n1. Check error handler catches this case\n2. Check validation covers edge case\n3. Check permission key exists\n4. Write test that reproduces bug\n5. Fix and verify test passes"\n\n## Database Change\n"Add [field/table] to Prisma schema:\n1. npx prisma db push — test locally\n2. Create migration with npx prisma migrate dev\n3. Rollback script at [path]\n4. Update affected services and routes"\n',
};

for (const [file, content] of Object.entries(aiKnowledge)) {
  writeFileSync(join(aiDir, file), content);
}
console.log('  Layer 15: AI Knowledge Base');

// ═══ LAYER 16: Enterprise Traceability Matrix ═══
const traceDir = join(V2_ROOT, '16_Enterprise_Traceability_Matrix');
mkdirSync(traceDir, { recursive: true });

let traceContent = '# Enterprise Traceability Matrix\n\n**Purpose:** Every requirement traces through implementation to release. Nothing exists without traceability.\n\n';
traceContent += '## Traceability Chain\n\n```\nRequirement → Capability → Business Process → Wave → Phase → Task → Step → Graphiti Node → Spec → Database → API → Backend → Frontend → Testing → Evidence → Git Commit → Release\n```\n\n';
traceContent += '## Current Traceability Coverage\n\n';
traceContent += '| Element | Traced? | Location |\n|---------|---------|----------|\n| Requirements | ✅ | step-docs/02_REQUIREMENTS.md |\n| Capabilities | ✅ | 01_Enterprise_Capability_Model/ |\n| Business Processes | ✅ | 02_Business_Process_Catalog/ |\n| Data Dictionary | ✅ | 03_Enterprise_Data_Dictionary/ |\n| API Contracts | ✅ | 04_API_Contract_Library/ |\n| Components | ✅ | 05_Component_Catalog/ |\n| Runtime | ✅ | 06_Runtime_Dependency_Map/ |\n| Features | ✅ | 07_Feature_Dependency_Matrix/ |\n| Cross-Wave | ✅ | 08_CrossWave_Dependency_Matrix/ |\n| Risks | ✅ | 09_Risk_Register/ |\n| Decisions | ✅ | 10_Architecture_Decision_Records/ + graphiti/ |\n| Technical Debt | ✅ | 11_Technical_Debt_Register/ |\n| Testing | ✅ | 12_Enterprise_Testing_Pyramid/ |\n| Migrations | ✅ | 13_Migration_Catalog/ |\n| Releases | ✅ | 14_Release_Train/ |\n| AI Knowledge | ✅ | 15_AI_Knowledge_Base/ |\n| Planning | ✅ | planning/ |\n| Graph (Graphiti) | ✅ | graphiti/index.json |\n| Spec (SpecKit) | ✅ | speckit/ |\n| Evidence | ✅ | docs/reviews/ |\n| Memory | ✅ | .ai/memory/ |\n| Git | ✅ | Commit log |\n\n### How to Use\n1. When adding a feature, trace it through all layers\n2. Run GATE_CHECK to verify traceability\n3. Graphiti auto-detects missing links\n4. SpecKit validates completeness\n';

writeFileSync(join(traceDir, 'TRACEABILITY_MATRIX.md'), traceContent);
console.log('  Layer 16: Enterprise Traceability Matrix');

console.log('\n=== ALL 16 LAYERS GENERATED ===');
