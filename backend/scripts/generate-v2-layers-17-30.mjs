/**
 * Planning OS v2.0 — Layers 17-30: Product Strategy, Quality, AI Governance
 */
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const V2_ROOT = 'D:/meter/planning/000_ENTERPRISE_PROGRAM';

// ═══ LAYER 17: Enterprise State Machine ═══
const smDir = join(V2_ROOT, '17_Enterprise_State_Machine');
mkdirSync(smDir, { recursive: true });

const stateMachines = {
  'INVOICE_STATE_MACHINE.md': '# Invoice State Machine\n\n```\nDraft → Pending → Approved → Issued → Partially Paid → Paid → Cancelled → Archived\n```\n\n| State | Allowed Transitions | Requires | Triggers |\n|-------|-------------------|----------|----------|\n| Draft | Pending | Validation passed | Save button |\n| Pending | Approved, Cancelled | Manager review | Approval action |\n| Approved | Issued | Schedule trigger | BillRun execution |\n| Issued | Partially Paid, Paid, Cancelled | Payment received | Payment event |\n| Partially Paid | Paid | Full payment | Payment event |\n| Paid | Archived | 30 days after due | Scheduled job |\n| Cancelled | Archived | Reason recorded | Cancel action |\n| Archived | — | — | Scheduled job |\n\n### Invariants\n- Cannot delete invoice with status > Draft\n- Cannot modify invoice after Issued\n- Cancelled invoice cannot transition to Paid\n',
  'CUSTOMER_STATE_MACHINE.md': '# Customer State Machine\n\n```\nLead → Created → Verified → Active → Suspended → Closed → Archived\n```\n\n| State | Allowed Transitions | Requires |\n|-------|-------------------|----------|\n| Lead | Created | Contact information |\n| Created | Verified, Archived | Email verification |\n| Verified | Active, Suspended | Meter assignment + contract |\n| Active | Suspended, Closed | Payment failure or request |\n| Suspended | Active, Closed | Payment received or resolution |\n| Closed | Archived | All invoices paid, meters returned |\n| Archived | — | 90 days after closure |\n',
  'METER_STATE_MACHINE.md': '# Meter State Machine\n\n```\nStock → Assigned → Installed → Reading → Disconnected → Maintenance → Retired\n```\n\n| State | Allowed Transitions | Requires |\n|-------|-------------------|----------|\n| Stock | Assigned | Customer assignment |\n| Assigned | Installed | Installation confirmation |\n| Installed | Reading, Maintenance | Active status |\n| Reading | Disconnected, Maintenance | Reading schedule |\n| Disconnected | Maintenance, Retired | Deactivation order |\n| Maintenance | Installed, Retired | Repair completion |\n| Retired | — | Final reading recorded |\n',
};

for (const [file, content] of Object.entries(stateMachines)) {
  writeFileSync(join(smDir, file), content);
}
console.log('  Layer 17: Enterprise State Machine');

// ═══ LAYER 18: Data Flow Catalog ═══
const dfDir = join(V2_ROOT, '18_Data_Flow_Catalog');
mkdirSync(dfDir, { recursive: true });

let dfContent = '# Data Flow Catalog\n\n**Purpose:** How data moves through the system — from source to destination.\n\n## Reading Data Flow\n```\nMeter → Reading API → Validation Engine → Database → Notification Engine → Billing Engine → Invoice → Payment\n```\n\n## Customer Data Flow\n```\nUI Form → API → Validation → Database → ActivityStream → Notification → Audit\n```\n\n## Invoice Data Flow\n```\nBillRun → Reading Aggregation → Tariff Application → Discount → Tax → Invoice → Customer → Payment\n```\n\n## Each Data Flow Documents\n| Element | Description |\n|---------|-------------|\n| Source | Where data originates |\n| Transformations | What changes happen to the data |\n| Destinations | Where data ends up |\n| Validation | What rules are applied |\n| Persistence | Where data is stored |\n| Latency | Expected timing |\n| Failure mode | What happens if flow breaks |\n| Recovery | How to recover failed data |\n';
writeFileSync(join(dfDir, 'DATA_FLOW_CATALOG.md'), dfContent);
console.log('  Layer 18: Data Flow Catalog');

// ═══ LAYER 19: Enterprise Workflows ═══
const ewDir = join(V2_ROOT, '19_Enterprise_Workflows');
mkdirSync(ewDir, { recursive: true });

const workflows = {
  'METER_TO_PAYMENT_WORKFLOW.md': '# Meter-to-Payment Enterprise Workflow\n\n**Spans:** Backend, Database, Frontend, Notifications, AI, Security\n\n```\n1. Create Customer (Frontend → Backend → Database)\n2. Assign Meter (Frontend → Backend → Database)\n3. Validate Meter (Backend → Validation Engine → Database)\n4. Activate Contract (Backend → Database → Notification)\n5. Collect Reading (Field App → Backend → Validation → Database)\n6. Generate Bill (Scheduler → Billing Engine → Database)\n7. Approve Bill (Backend → AI Validation → Database) ← AI flag if anomalous\n8. Issue Invoice (Backend → Database → Email/Notification)\n9. Receive Payment (Payment Gateway → Backend → Database → Notification)\n10. Close Cycle (Backend → Database → Analytics → Archive)\n11. Audit (All steps → AuditEntry)\n12. Backup (Database → Storage)\n```\n\n### Workflow Governance\n| Check | Gate |\n|-------|------|\n| Security | All API calls authenticated + authorized |\n| Data Integrity | Validation rules applied at every write |\n| Audit | Every state change recorded |\n| Notification | Customer notified at key milestones |\n| AI | Anomaly detection on readings and billing |\n| Compliance | Invoice format meets regulatory requirements |\n',
  'CUSTOMER_ONBOARDING_WORKFLOW.md': '# Customer Onboarding Enterprise Workflow\n\n```\nLead Capture → Verification → Meter Assignment → Contract Creation → Tariff Config → Service Activation → Welcome Notification\n```\n\n### Cross-Cutting Concerns\n- **Backend:** API endpoints for each step\n- **Database:** Customer, Meter, Contract, Tariff tables\n- **Frontend Admin:** Customer creation form, meter assignment UI\n- **Frontend User:** Status tracking dashboard\n- **Notifications:** Welcome email, SMS confirmation\n- **AI:** Suggested tariff based on customer profile\n- **Security:** Permission checks at every mutation\n- **Audit:** Full audit trail of onboarding process\n',
};

for (const [file, content] of Object.entries(workflows)) {
  writeFileSync(join(ewDir, file), content);
}
console.log('  Layer 19: Enterprise Workflows');

// ═══ LAYER 20: Feature Catalog ═══
const fcDir = join(V2_ROOT, '20_Feature_Catalog');
mkdirSync(fcDir, { recursive: true });

let fcContent = '# Feature Catalog\n\n**Purpose:** Features grouped by business capability. Features → Epics → Stories → Tasks.\n\n## Customer Management\n\n| Feature | Epic | Stories | Wave |\n|---------|------|---------|------|\n| Customer CRUD | Customer Core | Create, Read, Update, Delete, List, Search | 01 |\n| Customer Contracts | Customer Core | Create Contract, Amend, Renew, Expire | 01 |\n| Customer Billing | Customer Billing | View Invoices, Payment History, Balance | 01 |\n| Customer Documents | Customer Docs | Upload, Categorize, Search, Download | 02 |\n| Customer Notifications | Customer Comms | Email, SMS, In-App, Preferences | 01+02 |\n| Customer Timeline | Customer Analytics | Activity Log, State Changes, Audit | 01 |\n| Customer Analytics | Customer Analytics | Usage Patterns, Payment Behavior | 05 |\n| Customer Permissions | Customer Admin | Role-Based Access, Data Visibility | 01 |\n| Customer Reports | Customer Reporting | Standard Reports, Custom Export | 01 |\n| Customer Import | Customer Admin | CSV Import, Validation, Error Handling | 01 |\n| Customer Export | Customer Admin | CSV Export, PDF Export | 01 |\n\n## Meter Management\n\n| Feature | Epic | Stories | Wave |\n|---------|------|---------|------|\n| Meter CRUD | Meter Core | Create, Read, Update, Delete, List, Search | 01 |\n| Meter Assignment | Meter Ops | Assign, Unassign, History | 01 |\n| Meter Readings | Meter Data | Record, Bulk Import, Validate, Flag | 01 |\n| Meter Events | Meter Ops | Installation, Maintenance, Failure, Tamper | 01 |\n| Meter Analytics | Meter Analytics | Consumption Patterns, Anomaly Detection | 05 |\n| Meter Reports | Meter Reporting | Reading History, Event Log | 01 |\n| Meter Export | Meter Admin | CSV Export, PDF Export | 01 |\n';
writeFileSync(join(fcDir, 'FEATURE_CATALOG.md'), fcContent);
console.log('  Layer 20: Feature Catalog');

// ═══ LAYER 21: Product Strategy ═══
const psDir = join(V2_ROOT, '21_Product_Strategy');
mkdirSync(psDir, { recursive: true });

let psContent = '# Product Strategy\n\n**Purpose:** The "WHY" layer — why every feature exists and what business outcome it drives.\n\n## North Star Metric\n**Bills Paid On Time** — The single metric that indicates overall platform health.\n\n## Strategic Pillars\n\n| Pillar | Objective | Key Results |\n|--------|-----------|-------------|\n| Operational Excellence | Zero unplanned downtime | 99.9% uptime, < 1hr incident response |\n| Customer Success | Faster billing cycles | Bill within 24h of reading, 98% on-time payment |\n| Employee Productivity | Reduce manual work | 50% reduction in manual data entry |\n| Financial Accuracy | Zero billing errors | 99.99% billing accuracy, automated reconciliation |\n| Scalability | Global readiness | Support 1M+ customers, 10+ organizations |\n\n## Target Markets\n1. Utility companies (water, electricity, gas)\n2. Property management firms\n3. Sub-metering operators\n4. Energy resellers\n\n## Competitive Advantage\n1. Unified admin + user platform (vs. fragmented tools)\n2. AI-native anomaly detection (vs. reactive alerts)\n3. Open API ecosystem (vs. closed systems)\n4. Multi-tenant by design (vs. single-tenant legacy)\n';
writeFileSync(join(psDir, 'PRODUCT_STRATEGY.md'), psContent);
console.log('  Layer 21: Product Strategy');

// ═══ LAYER 22: Product Personas ═══
const ppDir = join(V2_ROOT, '22_Product_Personas');
mkdirSync(ppDir, { recursive: true });

let ppContent = '# Product Personas\n\n**Purpose:** Every feature is built for a persona. If no persona needs it, don\'t build it.\n\n## Personas\n\n### Admin (System A)\n- **Role:** System administrator, billing manager\n- **Needs:** Configure tariffs, run billing, manage users, view reports\n- **Pain Points:** Manual billing processes, data inconsistency, lack of visibility\n- **Success Criteria:** Bills generated accurately and on time\n\n### Operator (System B)\n- **Role:** Field operator, customer service rep\n- **Needs:** Read meters, manage customers, view invoices, record payments\n- **Pain Points:** Paper-based processes, data entry errors, slow customer lookup\n- **Success Criteria:** Complete daily reading targets, resolve customer issues in one call\n\n### Finance Manager\n- **Role:** Accounts receivable, financial controller\n- **Needs:** Payment reconciliation, aging reports, revenue forecasts\n- **Pain Points:** Late payments, reconciliation effort, cash flow visibility\n- **Success Criteria:** Reduce DSO (Days Sales Outstanding) by 30%\n\n### Customer\n- **Role:** End customer receiving bills\n- **Needs:** View bills, make payments, view consumption, submit readings\n- **Pain Points:** Complicated bills, limited payment options, no usage insights\n- **Success Criteria:** Bills paid on time, self-service adoption > 60%\n\n### Executive\n- **Role:** CEO, COO, CFO\n- **Needs:** Dashboards, KPIs, trend analysis, compliance reports\n- **Pain Points:** Data silos, slow reporting, lack of predictive insights\n- **Success Criteria:** Data-driven decisions, regulatory compliance\n';
writeFileSync(join(ppDir, 'PRODUCT_PERSONAS.md'), ppContent);
console.log('  Layer 22: Product Personas');

// ═══ LAYER 23: Quality Gates ═══
const qgDir = join(V2_ROOT, '23_Quality_Gates');
mkdirSync(qgDir, { recursive: true });

let qgContent = '# Quality Gates\n\n**Purpose:** Every phase must pass all 10 gates before marking complete.\n\n## Gate Definitions\n\n| Gate | Check | Verifier | Blocks If |\n|------|-------|----------|-----------|\n| G01 Architecture | Architecture approved by Chief Architect | Graphiti compare | Missing nodes or edges |\n| G02 Database | Schema changes validated | Prisma validate + migration test | Migration fails or missing rollback |\n| G03 Backend | All endpoints working | Integration tests pass | Any endpoint returns 500 |\n| G04 Frontend | All pages render | Playwright smoke tests | Any page errors |\n| G05 Runtime | Services operational | Health check endpoint | Service fails |\n| G06 Security | No vulnerabilities | npm audit + CodeQL | Critical vulnerability |\n| G07 Performance | Response time within SLA | k6 load test | P99 > 500ms |\n| G08 Business | Business rules verified | Rule test suite | Business rule fails |\n| G09 Evidence | Evidence committed | GATE_CHECK script | Missing evidence |\n| G10 Release | Release ready | Governance board | Missing sign-off |\n\n## Gate Process\n```\nEach task → passes task gates → marks COMPLETE\nEach phase → runs T99 audit → passes all 10 gates → marks COMPLETE\nWave → all phases complete → final review → marks COMPLETE\n```\n';
writeFileSync(join(qgDir, 'QUALITY_GATES.md'), qgContent);
console.log('  Layer 23: Quality Gates');

// ═══ LAYER 24: Enterprise Verification ═══
const evDir = join(V2_ROOT, '24_Enterprise_Verification');
mkdirSync(evDir, { recursive: true });

let evContent = '# Enterprise Verification Matrix\n\n**Purpose:** Every feature must pass ALL verification steps before closure.\n\n## Verification Chain\n\n```\nCompile → Type Check → Lint → Unit Test → Integration Test → Workflow Test → Performance Test → Accessibility → Security → Graph Compare → Spec Compare → Architecture Compare → Business Rule Compare → UI Compare → Screenshot Compare → Evidence → Git → Done\n```\n\n## Verification Requirements by Feature Type\n\n| Feature Type | Required Verifications |\n|-------------|----------------------|\n| New API endpoint | Compile, Unit, Integration, Security, Graph Compare, Spec Compare, Evidence |\n| New UI page | Compile, Type Check, Accessibility, UI Compare, Screenshot Compare, Evidence |\n| Database migration | Compile, Integration, Rollback Test, Graph Compare, Evidence |\n| Business rule change | Unit, Integration, Business Rule Compare, Evidence |\n| AI model | Unit, Performance, Accuracy Test, Evidence |\n| Infrastructure change | Compile, Deployment Test, Rollback Test, Security, Evidence |\n\n## Blocking Rules\n1. Any verification failure blocks step completion\n2. Security failures block ALL progress until resolved\n3. Graph Compare failures require ADR update before proceeding\n4. Evidence missing = step NOT complete\n';
writeFileSync(join(evDir, 'VERIFICATION_MATRIX.md'), evContent);
console.log('  Layer 24: Enterprise Verification');

// ═══ LAYER 25: Release Governance ═══
const rgDir = join(V2_ROOT, '25_Release_Governance');
mkdirSync(rgDir, { recursive: true });

let rgContent = '# Release Governance\n\n**Purpose:** Governed release process with mandatory approvals.\n\n## Release Types\n\n| Type | Frequency | Approval | Risk |\n|------|-----------|----------|------|\n| Hotfix | As needed | Tech Lead + Product Owner | Critical bug/security |\n| Patch | Weekly | Tech Lead | Bug fixes, minor changes |\n| Feature | Per Wave | Architecture Board | New capabilities |\n| Major | Per Enterprise Release | Executive Committee | Platform milestones |\n\n## Release Board\n\n| Role | Responsibility |\n|------|---------------|\n| Enterprise Architect | Architecture compliance |\n| Product Owner | Business value validation |\n| Security Lead | Security clearance |\n| QA Lead | Test coverage sign-off |\n| DevOps Lead | Deployment readiness |\n| Release Manager | Coordination and communication |\n\n## Release Checklist\n- [ ] All quality gates passed\n- [ ] All tests pass\n- [ ] Security scan clean\n- [ ] Performance within SLA\n- [ ] Documentation updated\n- [ ] Rollback plan tested\n- [ ] Release notes written\n- [ ] Stakeholders notified\n- [ ] Deployment window confirmed\n- [ ] Monitoring alerting configured\n';
writeFileSync(join(rgDir, 'RELEASE_GOVERNANCE.md'), rgContent);
console.log('  Layer 25: Release Governance');

// ═══ LAYER 26: Operation Runbook ═══
const orDir = join(V2_ROOT, '26_Operation_Runbook');
mkdirSync(orDir, { recursive: true });

let orContent = '# Operation Runbook\n\n**Purpose:** How to operate, monitor, and recover the system in production.\n\n## Daily Operations\n\n| Task | Frequency | Owner |\n|------|-----------|-------|\n| Check health endpoint | Continuous | Monitoring |\n| Review error logs | Daily | Engineering |\n| Verify KPI snapshots | Daily | Product Owner |\n| Check pending queue jobs | Daily | Engineering |\n| Review failed notifications | Daily | Support |\n| Backup verification | Weekly | DevOps |\n| SSL certificate expiry | Monthly | DevOps |\n| Dependency audit | Monthly | Engineering |\n\n## Incident Response\n\n| Severity | Response Time | Escalation |\n|----------|---------------|------------|\n| P1 — System down | 15 minutes | Engineering + Management |\n| P2 — Feature broken | 1 hour | Engineering |\n| P3 — Minor issue | 24 hours | Team |\n| P4 — Cosmetic | Next release | Product Owner |\n\n## Recovery Procedures\n\n### Database Recovery\n```\n1. Identify failure point\n2. Restore from latest backup\n3. Apply WAL logs for point-in-time recovery\n4. Verify data integrity\n5. Resume service\n```\n\n### Application Recovery\n```\n1. Check health endpoint\n2. Review error logs\n3. Check database connectivity\n4. Verify environment variables\n5. Restart service\n6. Verify functionality\n```\n';
writeFileSync(join(orDir, 'OPERATION_RUNBOOK.md'), orContent);
console.log('  Layer 26: Operation Runbook');

// ═══ LAYER 27: Post-Release Monitoring ═══
const prDir = join(V2_ROOT, '27_PostRelease_Monitoring');
mkdirSync(prDir, { recursive: true });

let prContent = '# Post-Release Monitoring\n\n**Purpose:** What to monitor after every release to ensure stability.\n\n## First 24 Hours (Critical)\n\n| Metric | Threshold | Action |\n|--------|-----------|--------|\n| Error rate | < 0.1% | Investigate if exceeded |\n| Response time P99 | < 500ms | Performance review |\n| API success rate | > 99.5% | Rollback if below |\n| Active users | No drop | Check for regressions |\n| Database connections | < 80% pool | Scale if needed |\n\n## First 7 Days\n\n| Check | Frequency |\n|-------|-----------|\n| Error log review | Daily |\n| Performance comparison (before/after) | Daily |\n| User feedback collection | Daily |\n| KPI trend analysis | Daily |\n| Security scan results | Weekly |\n\n## Rollback Criteria\nRollback immediately if:\n1. Error rate exceeds 1% for 5+ minutes\n2. Any P1 security vulnerability discovered\n3. Data integrity issue detected\n4. Performance degrades > 50%\n5. Critical business rule broken\n';
writeFileSync(join(prDir, 'POSTRELEASE_MONITORING.md'), prContent);
console.log('  Layer 27: Post-Release Monitoring');

// ═══ LAYER 28: AI Execution Rules ═══
const aerDir = join(V2_ROOT, '28_AI_Execution_Rules');
mkdirSync(aerDir, { recursive: true });

let aerContent = '# AI Execution Rules\n\n**Purpose:** Rules every AI agent must follow when executing work.\n\n## Before Any Implementation\n\n1. **Read this file first** — Always start here\n2. **Read the AI Knowledge Base** — `15_AI_Knowledge_Base/`\n3. **Read the Traceability Matrix** — `16_Enterprise_Traceability_Matrix/`\n4. **Check the Feature Dependency Matrix** — `07_Feature_Dependency_Matrix/`\n5. **Check the Risk Register** — `09_Risk_Register/`\n6. **Understand the business capability** — `01_Enterprise_Capability_Model/`\n7. **Understand the personas affected** — `22_Product_Personas/`\n8. **Check the product strategy** — `21_Product_Strategy/`\n\n## During Implementation\n\n1. **Answer WHY before WHAT** — Start with the AI Execution Contract\n2. **Never skip the impact analysis** — Always produce the 12-dimension table\n3. **Never modify existing files** — Always add new layers\n4. **Never skip GATE_CHECK** — Run `scripts/gate-check.mjs` before marking complete\n5. **Never skip Graphiti** — Update graph nodes for new components\n6. **Never skip SpecKit** — Run `speckit-validate.mjs` before completion\n7. **Never skip evidence** — Evidence must exist for every step\n8. **Never skip quality gates** — All 10 gates must pass\n\n## AI Behavior Rules\n\n1. If you find a gap, DO NOT implement it — create a planning entry\n2. If architecture would be damaged, STOP and raise Architecture Warning\n3. If you don\'t know, read the relevant layer before asking\n4. If dependencies are missing, do not proceed until they exist\n5. If requirements are unclear, clarify before coding\n6. If a task is too large, break it into smaller steps\n7. If you\'re repeating work, check if it already exists\n8. If you\'re unsure about quality, run the tests\n';
writeFileSync(join(aerDir, 'AI_EXECUTION_RULES.md'), aerContent);
console.log('  Layer 28: AI Execution Rules');

// ═══ LAYER 29: AI Self Review ═══
const asrDir = join(V2_ROOT, '29_AI_Self_Review');
mkdirSync(asrDir, { recursive: true });

let asrContent = '# AI Self-Review Checklist\n\n**Purpose:** AI agents must review their own work before presenting it.\n\n## Self-Review Questions\n\n### Completeness\n- [ ] Did I implement what was requested?\n- [ ] Did I miss any edge cases?\n- [ ] Did I handle errors properly?\n- [ ] Did I add validation?\n- [ ] Did I handle authentication and authorization?\n- [ ] Did I add audit logging?\n\n### Quality\n- [ ] Does the code follow existing patterns?\n- [ ] Is the code consistent with the rest of the codebase?\n- [ ] Are there any obvious performance issues?\n- [ ] Are there any security concerns?\n- [ ] Are error messages helpful?\n- [ ] Is the code readable?\n\n### Architecture\n- [ ] Does this change affect System A or System B?\n- [ ] Does this change break any shared component?\n- [ ] Does this change require a new permission key?\n- [ ] Does this change require Graphiti update?\n- [ ] Does this change require SpecKit update?\n- [ ] Does this change require documentation update?\n\n### Evidence\n- [ ] Did I update STATUS.yaml correctly?\n- [ ] Did I commit evidence files?\n- [ ] Did I update the Master Knowledge Checklist?\n- [ ] Did I log tool usage?\n- [ ] Did I run GATE_CHECK?\n- [ ] Did I run SpecKit validation?\n\n### Honesty\n- [ ] Am I marking work complete that is actually incomplete?\n- [ ] Did I skip any verification step?\n- [ ] Did I test the change?\n- [ ] Is there any risk I\'m not reporting?\n- [ ] Would I be comfortable if a colleague reviewed this?\n';
writeFileSync(join(asrDir, 'AI_SELF_REVIEW.md'), asrContent);
console.log('  Layer 29: AI Self Review');

// ═══ LAYER 30: AI Stop Conditions ═══
const ascDir = join(V2_ROOT, '30_AI_Stop_Conditions');
mkdirSync(ascDir, { recursive: true });

let ascContent = '# AI Stop Conditions\n\n**Purpose:** Conditions under which AI must STOP and raise a warning instead of continuing.\n\n## Architecture Stop Conditions\n\n| Condition | Action |\n|-----------|--------|\n| Implementation would break shared component | STOP — Create Architecture Warning |\n| Implementation would fork shared service | STOP — Create Architecture Warning |\n| Implementation bypasses permission system | STOP — Security risk |\n| Implementation would cause schema drift | STOP — Must create migration first |\n| Implementation duplicates existing feature | STOP — Check Feature Catalog |\n\n## Quality Stop Conditions\n\n| Condition | Action |\n|-----------|--------|\n| Tests fail | STOP — Fix before proceeding |\n| Security scan fails | STOP — Fix before proceeding |\n| GATE_CHECK fails | STOP — Missing evidence or status error |\n| SpecKit fails | STOP — Missing spec, graph, or documentation |\n| Quality gate not passed | STOP — Complete gate requirements first |\n\n## Dependency Stop Conditions\n\n| Condition | Action |\n|-----------|--------|\n| Dependency not implemented | STOP — Create dependency task first |\n| Required permission key missing | STOP — Add permission key first |\n| Required database migration missing | STOP — Create migration first |\n| Required ADR not created | STOP — Create ADR first |\n\n## Ethical Stop Conditions\n\n| Condition | Action |\n|-----------|--------|\n| Task requires modification of existing architecture without ADR | STOP — Raise Architecture Warning |\n| Task would cause data loss without backup plan | STOP — Require backup plan |\n| Task would bypass audit trail | STOP — Security violation |\n| Task would reduce accessibility | STOP — Accessibility is a requirement |\n| Task unclear or underspecified | STOP — Request clarification |\n\n## How to Raise a Stop\n```\n🚫 ARCHITECTURE WARNING\nTitle: [Brief description of the issue]\nAffects: [Systems/components affected]\nRisk: [High/Medium/Low]\nRecommendation: [What should be done instead]\n```\n';
writeFileSync(join(ascDir, 'AI_STOP_CONDITIONS.md'), ascContent);
console.log('  Layer 30: AI Stop Conditions');

// ═══ AI EXECUTION CONTRACT (standalone, referenced by all layers) ═══
const contractDir = join(V2_ROOT);
let contractContent = '# AI Execution Contract\n\n**Purpose:** Before ANY implementation, the AI must answer these questions. This is mandatory.\n\n---\n\n## 1. Why is this work being done?\n\n| Question | Answer |\n|----------|--------|\n| Which business capability does this improve? |  |\n| Which strategic pillar does this support? |  |\n| What is the expected business outcome? |  |\n| How will success be measured? |  |\n\n## 2. Who is affected?\n\n| Persona | Impact |\n|---------|--------|\n| Admin (System A) |  |\n| Operator (System B) |  |\n| Finance Manager |  |\n| Customer |  |\n| Executive |  |\n\n## 3. What systems are affected?\n\n| System | Change |\n|--------|--------|\n| Admin Portal |  |\n| User Portal |  |\n| Backend API |  |\n| Database |  |\n| Runtime |  |\n| AI |  |\n| Notifications |  |\n\n## 4. What dependencies must be complete?\n\n- [ ] Dependency 1:\n- [ ] Dependency 2:\n- [ ] Dependency 3:\n\n## 5. What evidence proves correct implementation?\n\n| Evidence | Location |\n|----------|----------|\n| Tests pass |  |\n| Security scan |  |\n| Performance within SLA |  |\n| Graphiti updated |  |\n| SpecKit passed |  |\n| GATE_CHECK passed |  |\n| Stakeholder approval |  |\n\n## 6. What regression checks must pass?\n\n- [ ] Existing tests still pass\n- [ ] No new security vulnerabilities\n- [ ] Performance not degraded\n- [ ] Accessibility not reduced\n- [ ] Backward compatibility maintained\n\n## 7. What documents must be updated?\n\n- [ ] Architecture docs\n- [ ] API contracts\n- [ ] Data dictionary\n- [ ] Component catalog\n- [ ] Feature catalog\n- [ ] User documentation\n- [ ] Master Knowledge Checklist\n\n## 8. What Graphiti and SpecKit validations must succeed?\n\n| Validation | Expected | Actual |\n|-----------|----------|--------|\n| Graph nodes match implementation | ✅ |  |\n| Graph edges match dependencies | ✅ |  |\n| Spec compliance | ✅ |  |\n| Evidence completeness | ✅ |  |\n\n## 9. What conditions would require STOPPING?\n\n- [ ] Architecture violation detected?\n- [ ] Missing dependency?\n- [ ] Security risk?\n- [ ] Performance regression?\n- [ ] Scope creep beyond original requirement?\n\n## 10. Implementation Plan\n\n| Step | Action | Owner |\n|------|--------|-------|\n| 1 |  | AI |\n| 2 |  | AI |\n| 3 |  | AI |\n| 4 |  | AI |\n\n---\n\n*This contract must be completed before any implementation begins. No exceptions.*\n';
writeFileSync(join(contractDir, 'AI_EXECUTION_CONTRACT.md'), contractContent);
console.log('  Layer AI: AI Execution Contract');

console.log('\n=== LAYERS 17-30 + AI EXECUTION CONTRACT GENERATED ===');
