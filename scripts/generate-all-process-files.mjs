#!/usr/bin/env node
// Generate consolidated process files from P10 data
import fs from "fs"

const OUT = "D:/meter/planning/051_ENTERPRISE_PROCESS_ARCHITECTURE/06_PROCESS_FILES"

const TEMPLATE = (p) => `# ${p.id}: ${p.name}

**Domain Group:** ${p.group}  
**Priority:** ${p.priority} | **Criticality:** ${p.criticality}  
**SLA:** ${p.sla} | **KPI:** ${p.kpi}  
**Wave:** ${p.wave} | **Sprint:** ${p.sprint} | **Sessions:** ${p.sessions}

## Business Context
- **Purpose:** ${p.purpose}
- **Owner:** ${p.owner}
- **Trigger:** ${p.trigger}
- **Actors:** ${p.actors}

## Inputs & Outputs
- **Inputs:** ${p.inputs}
- **Outputs:** ${p.outputs}

## Rules
- **Business Rules:** ${p.businessRules}
- **Security:** ${p.security}
- **Permissions:** ${p.permissions}

## Flow
- **Exceptions:** ${p.exceptions}
- **Retry:** ${p.retry}
- **Rollback:** ${p.rollback}

## Dependencies
- **Upstream:** ${p.upstream}
- **Downstream:** ${p.downstream}
- **APIs:** ${p.apis}
- **DB:** ${p.db}

## DoD
${p.dod}

---
`

const allProcesses = [
  // === METER (P-001 to P-010) ===
  { id: "P-001", name: "Meter Registration", group: "01_meter", priority: "P0", criticality: "System", sla: "< 2s per meter", kpi: "Success > 99.5%", wave: "01", sprint: "S1", sessions: "2", 
    purpose: "Register new metering device", owner: "Meter Operations Director", trigger: "New meter arrives", actors: "Meter Operations, System, Warehouse",
    inputs: "Serial, Type, Area, Config", outputs: "Meter record, AuditEntry, Event",
    businessRules: "Serial unique. Type required. Area required.", security: "Area-scoped", permissions: "meters.create",
    exceptions: "Duplicate serial → 409. Invalid type → 400.", retry: "3 attempts (0s, 1s, 5s)", rollback: "Not needed",
    upstream: "None", downstream: "P-002 (Assignment)", apis: "POST /api/meters", db: "Meter, MeterType, AuditEntry",
    dod: "Meter created with all fields. Audit logged. Visible in inventory." },
  { id: "P-002", name: "Meter Assignment", group: "01_meter", priority: "P0", criticality: "Revenue", sla: "< 5s", kpi: "Accuracy > 99.5%", wave: "01", sprint: "S1", sessions: "2",
    purpose: "Link meter to customer/contract", owner: "Meter Operations Director", trigger: "Customer request", actors: "Meter Operations, Customer Service",
    inputs: "Meter ID, Customer ID, Contract ID", outputs: "MeterAssignment record",
    businessRules: "One active assignment per meter", security: "Customer-scoped", permissions: "meter_assignments.*",
    exceptions: "Customer not found. Meter retired.", retry: "2 attempts, 3s delay", rollback: "Reverse assignment, restore old",
    upstream: "P-001, P-021", downstream: "P-011", apis: "POST /api/meter-assignments", db: "MeterAssignment, Meter",
    dod: "Meter linked. Old assignment ended. Audit trail complete." },
  { id: "P-003", name: "Meter Replacement", group: "01_meter", priority: "P0", criticality: "Service interruption", sla: "2hrs dispatch→complete", kpi: "Success > 99%", wave: "01", sprint: "S2", sessions: "3",
    purpose: "Replace installed meter with new one", owner: "Meter Operations Director", trigger: "Fault, end of life, upgrade", actors: "Field Technician, Meter Operations",
    inputs: "Old meter ID, New meter serial, Reason, Final reading", outputs: "Old retired, New active, Readings continuous",
    businessRules: "Same billing period preferred. New inherits old config.", security: "GPS-verified location", permissions: "meter.field, meter.operator",
    exceptions: "Final reading < last billed → Flag adjustment", retry: "3 attempts, 5min delay", rollback: "Restore old meter",
    upstream: "P-001, P-002", downstream: "P-006 (Retirement)", apis: "PUT /api/meters/:id", db: "Meter, MeterAssignment, MeterEvent",
    dod: "Old retired. New active at same location. No reading gap." },
  
  // === READING (P-011 to P-020) ===
  { id: "P-011", name: "Reading Import", group: "02_reading", priority: "P0", criticality: "Revenue", sla: "< 5s transmission", kpi: "Capture > 99.99%", wave: "01", sprint: "S1", sessions: "3",
    purpose: "Ingest meter readings from AMI/gateway/manual", owner: "Meter Data Management Director", trigger: "AMI push, Gateway relay, File upload", actors: "System (AMI), Field Technician, Data Entry",
    inputs: "Meter ID, Value, Timestamp, Source, Unit", outputs: "Reading record, Validation triggered",
    businessRules: "Reading must be non-negative. Timestamp valid range. Meter active.", security: "API key for AMI. Digital certificate for meter.", permissions: "readings.create",
    exceptions: "Meter not found → Dead letter queue. Duplicate → Reject.", retry: "Exponential: 1min, 5min, 15min, 1hr, 4hrs", rollback: "N/A (append-only)",
    upstream: "P-001 (Meter must exist)", downstream: "P-014 (Validation)", apis: "POST /api/readings, POST /api/readings/bulk", db: "Reading, Meter",
    dod: "Reading captured in < 5s. Validation triggered. Ready for billing pipeline." },
  { id: "P-014", name: "Reading Validation", group: "02_reading", priority: "P0", criticality: "Billing accuracy", sla: "< 1s per reading", kpi: "Auto-approval > 95%", wave: "01", sprint: "S1", sessions: "4",
    purpose: "Auto-validate readings against business rules", owner: "Meter Data Management Director", trigger: "Reading created", actors: "System (Validation Engine), Data Analyst",
    inputs: "Reading, Previous readings, Validation rules, Meter config", outputs: "Reading status: APPROVED/FLAGGED/REJECTED",
    businessRules: "Spike > 3x = flag. Drop < 0.1x = flag. Negative = reject.", security: "Rules configurable by meter.admin only", permissions: "readings.list, readings.edit",
    exceptions: "Engine down → Queue for re-validation", retry: "N/A (stateless)", rollback: "N/A (re-validate)",
    upstream: "P-011, P-012, P-013", downstream: "P-015, P-016, P-018", apis: "POST /api/readings/:id/approve", db: "Reading, ValidationResult, ValidationRule",
    dod: "Reading validated or flagged. Auto-approval rate reported." },
  { id: "P-018", name: "Consumption Calculation", group: "02_reading", priority: "P0", criticality: "Core billing input", sla: "< 2s per meter", kpi: "Accuracy 100%", wave: "01", sprint: "S1", sessions: "3",
    purpose: "Calculate consumption from approved readings", owner: "Billing Director", trigger: "Bill cycle execution", actors: "System (Calculation Engine)",
    inputs: "Meter ID, Period, Current reading, Previous reading, CT/PT ratio", outputs: "Calculated consumption",
    businessRules: "Consumption = (current - prev) × CT/PT ratio. Zero valid. Negative flagged.", security: "System-executed only", permissions: "System",
    exceptions: "Missing previous → Estimate from 90-day average", retry: "Skip meter, continue batch", rollback: "N/A (read-only)",
    upstream: "P-015 (Approved readings)", downstream: "P-031 (Bill Execution)", apis: "POST /api/business/pipeline/calculate-consumption", db: "Reading",
    dod: "Consumption calculated. Adjustment factors applied. Ready for tariff." },

  // === CUSTOMER (P-021 to P-029) ===
  { id: "P-021", name: "Customer Registration", group: "03_customer", priority: "P0", criticality: "Revenue", sla: "30min staff, instant self", kpi: "Accuracy > 99%", wave: "01", sprint: "S1", sessions: "2",
    purpose: "Onboard new customer", owner: "CRM Director", trigger: "Application, Self-registration", actors: "Customer Service, Customer",
    inputs: "Name, Email, Phone, Address, Tax ID, Type", outputs: "Customer record, Welcome notification",
    businessRules: "Email unique. Tax ID for corporate.", security: "PII encrypted. Email verification for self-reg.", permissions: "customers.create",
    exceptions: "Duplicate email → Merge (P-024)", retry: "2 attempts", rollback: "Archive customer",
    upstream: "None", downstream: "P-002, P-026", apis: "POST /api/customers", db: "Customer, CustomerGroup",
    dod: "Customer created. Welcome sent. Verification tracked." },

  // === BILLING (P-030 to P-044) ===
  { id: "P-031", name: "Bill Cycle Execution", group: "05_billing", priority: "P0", criticality: "Revenue generation", sla: "< 4hrs batch", kpi: "Zero billing errors", wave: "03", sprint: "S3", sessions: "8",
    purpose: "Execute bill run to generate invoices", owner: "Billing Director", trigger: "Scheduled monthly", actors: "System (Billing Engine)",
    inputs: "BillRun ID, Meter list, Period dates", outputs: "Invoices generated, BillRun completed",
    businessRules: "Period non-overlap. Idempotent batch. Each meter processed once.", security: "System-executed. Manual override requires billing.director.", permissions: "billing.*, billing.admin",
    exceptions: "Individual meter fails → Skip, continue, report errors", retry: "3 attempts per meter", rollback: "Reverse completed invoices, regenerate batch",
    upstream: "P-030 (Bill Cycle), P-018 (Consumption)", downstream: "P-033 (Invoice Gen), P-059 (Month Close)", apis: "POST /api/billing/runs/:id/generate", db: "BillRun, Invoice, Reading",
    dod: "All meters processed. Invoices generated. Summary report created." },

  // === PAYMENT (P-045 to P-050) ===
  { id: "P-045", name: "Payment Registration", group: "07_payment", priority: "P0", criticality: "Cash collection", sla: "< 3s processing", kpi: "Capture > 99.99%", wave: "02", sprint: "S2", sessions: "3",
    purpose: "Record customer payment", owner: "Finance Director", trigger: "Customer pays, Portal, Bank reconciliation", actors: "Cashier, System, Customer",
    inputs: "Customer ID, Amount, Method, Reference", outputs: "Payment record, Auto-allocation triggered",
    businessRules: "Amount > 0. Overpayment → credit. Underpayment → oldest invoice first.", security: "PCI-DSS: Card tokenized via gateway.", permissions: "payments.*",
    exceptions: "Gateway timeout → Retry", retry: "3 attempts", rollback: "Reverse payment, void at gateway",
    upstream: "P-021 (Customer exists)", downstream: "P-046 (Allocation)", apis: "POST /api/payments", db: "Payment, PaymentTransaction",
    dod: "Payment recorded. Receipt generated. Allocation queued." },

  // === COLLECTION (P-051 to P-054) ===
  { id: "P-051", name: "Collection Assignment", group: "08_collection", priority: "P0", criticality: "Debt recovery", sla: "< 1hr assignment", kpi: "Assignment accuracy > 99%", wave: "03", sprint: "S3", sessions: "2",
    purpose: "Assign overdue invoice to collector", owner: "Collection Director", trigger: "Invoice overdue past threshold", actors: "System (auto), Collection Manager",
    inputs: "Invoice ID, Customer ID, Outstanding amount, Aging bucket", outputs: "CollectionCase created, Collector assigned",
    businessRules: "Round-robin by workload. Priority to senior collector for high-value.", security: "Collector area-scoped", permissions: "collections.*",
    exceptions: "No available collector → Queue, alert manager", retry: "2 attempts", rollback: "Close case, return to queue",
    upstream: "P-033 (Overdue invoice)", downstream: "P-052 (Visit)", apis: "POST /api/domain/collection-cases", db: "CollectionCase",
    dod: "Case assigned. Queue updated. Collector notified." },

  // === ACCOUNTING (P-056 to P-060) ===
  { id: "P-056", name: "GL Posting", group: "09_accounting", priority: "P0", criticality: "Financial records", sla: "< 5s per posting", kpi: "GL always balanced", wave: "04", sprint: "S4", sessions: "5",
    purpose: "Post financial transactions to General Ledger", owner: "Finance Director", trigger: "Invoice issued, Payment recorded, Month end", actors: "System (GL Engine)",
    inputs: "Transaction type, Amount, Account mapping", outputs: "GeneralLedgerEntry, Account balances updated",
    businessRules: "Debits = credits. Account must be active. Period must be OPEN.", security: "System-executed. Manual override requires finance.director.", permissions: "finance.admin",
    exceptions: "Account not found → Queue for manual mapping", retry: "3 attempts, queue", rollback: "Reverse GL entry, re-post",
    upstream: "P-033 (Invoice), P-045 (Payment)", downstream: "P-059 (Month Close)", apis: "Planned: POST /api/general-ledger", db: "GeneralLedgerEntry, Account",
    dod: "GL entries posted. Accounts balanced. Trial balance in balance." },
  { id: "P-059", name: "Month Close", group: "09_accounting", priority: "P0", criticality: "Financial reporting", sla: "< 5 business days", kpi: "On-time close > 95%", wave: "04", sprint: "S4", sessions: "5",
    purpose: "Close financial period, post adjustments, generate reports", owner: "Finance Director", trigger: "Last day of month", actors: "Finance Team (System-assisted)",
    inputs: "Period ID, Adjustments, Trial balance", outputs: "Period LOCKED, Financial reports generated",
    businessRules: "Adjustments posted. Trial balanced. Director approval required.", security: "finance.director to approve. finance.admin to execute.", permissions: "finance.director, finance.admin",
    exceptions: "Trial balance not balanced → Investigate, correct, retry", retry: "Manual (no auto-retry)", rollback: "Re-open period, post corrections, re-close",
    upstream: "P-056, P-057, P-058", downstream: "P-060 (Year Close)", apis: "Planned: POST /api/financial-periods/:id/close", db: "FinancialPeriod, GeneralLedgerEntry",
    dod: "Period LOCKED. Reports generated. No further postings allowed." },

  // === SIM/GATEWAY (P-061 to P-065) ===
  { id: "P-061", name: "SIM Assignment", group: "10_sim_gateway", priority: "P0", criticality: "Communication", sla: "< 30min", kpi: "Assignment accuracy > 99%", wave: "02", sprint: "S2", sessions: "2",
    purpose: "Assign SIM to meter for cellular communication", owner: "Communication Manager", trigger: "Meter activation", actors: "Field Technician, System",
    inputs: "SIM ICCID, Meter ID, APN settings", outputs: "SIMAssignment, Meter.SIM updated",
    businessRules: "One active SIM per meter. SIM must be AVAILABLE.", security: "ICCID verified against carrier", permissions: "meters.*",
    exceptions: "SIM already assigned → Reject", retry: "2 attempts", rollback: "Release SIM, return to pool",
    upstream: "P-001 (Meter exists)", downstream: "P-065 (Comm Test)", apis: "POST /api/sim/:id/assign", db: "SIMCard, SIMAssignment, Meter",
    dod: "SIM assigned. Communication test queued. Inventory updated." },

  // === SYNC (P-066 to P-068) ===
  { id: "P-066", name: "Synchronization Job", group: "11_sync", priority: "P0", criticality: "Data consistency", sla: "< 15min sync window", kpi: "Latency within SLA > 99%", wave: "04", sprint: "S4", sessions: "4",
    purpose: "Replicate data across areas/external systems", owner: "Platform Director", trigger: "Scheduled, Event-driven, Manual", actors: "System (Sync Engine)",
    inputs: "Sync type, Source area, Target area, Last sync timestamp", outputs: "SyncJob, Target area updated, Conflict log",
    businessRules: "Idempotent. Each area source of truth for own meters.", security: "API key authentication. Payload encrypted.", permissions: "admin.*",
    exceptions: "Conflict detected → Auto-resolve (last-writer-wins) with audit", retry: "Max 5 with 1min backoff", rollback: "Reverse sync changes, re-run from checkpoint",
    upstream: "All domains", downstream: "All domains", apis: "Planned: POST /api/sync/jobs", db: "SyncJob",
    dod: "Data synchronized. Conflicts resolved or logged. Sync log created." },

  // === NOTIFICATION (P-069 to P-072) ===
  { id: "P-069", name: "Notification Delivery", group: "12_notification", priority: "P0", criticality: "Communication", sla: "< 1s delivery attempt", kpi: "Delivery rate > 99%", wave: "02", sprint: "S2", sessions: "3",
    purpose: "Deliver notifications via configured channels", owner: "Communications Director", trigger: "System event", actors: "System (Notification Engine)",
    inputs: "Recipient, Channel, Title, Body, Template", outputs: "Notification record, Channel-specific delivery log",
    businessRules: "Channel fallback: in_app → email → SMS. Rate limited.", security: "No PII in notification content unless encrypted.", permissions: "System",
    exceptions: "Channel unavailable → Try fallback within 5min", retry: "3 attempts, 5min interval", rollback: "N/A",
    upstream: "All domains (event sources)", downstream: "P-070, P-071, P-072", apis: "POST /api/notifications", db: "Notification, EmailLog, SmsLog, PushNotification",
    dod: "Notification sent. Delivery confirmed. Failures reported." },

  // === AUTH (P-073 to P-077) ===
  { id: "P-073", name: "Login", group: "13_auth", priority: "P0", criticality: "System access", sla: "< 3s", kpi: "Success > 99%", wave: "01", sprint: "S1", sessions: "3",
    purpose: "Authenticate user and establish session", owner: "Security Director", trigger: "User attempts to access system", actors: "User, Auth Service",
    inputs: "Email, Password, MFA token, Device fingerprint", outputs: "JWT, Refresh token, Session record",
    businessRules: "5 attempts before lockout. 30min lockout. JWT expires 24h.", security: "Rate limited (5/min). MFA enforced for admin.", permissions: "Public endpoint",
    exceptions: "Wrong password → Increment attempts. Locked after 5.", retry: "5 attempts before lockout", rollback: "Kill all sessions, force re-login",
    upstream: "None", downstream: "All (session required)", apis: "POST /api/auth/login", db: "Session, User",
    dod: "Authenticated. MFA verified. Session created. Token issued." },

  // === USER/ROLE (P-078 to P-081) ===
  { id: "P-078", name: "User Registration", group: "14_user_role", priority: "P0", criticality: "Team onboarding", sla: "< 30min", kpi: "Accuracy > 99%", wave: "01", sprint: "S1", sessions: "2",
    purpose: "Create new user account with assigned role", owner: "HR / IT Admin", trigger: "New employee", actors: "IT Admin, HR",
    inputs: "Name, Email, Role, Area assignment", outputs: "User created, Welcome email",
    businessRules: "Email unique. Password meets complexity.", security: "Password hashed. Role assigned per HR.", permissions: "admin.*",
    exceptions: "Email already in use → Reject", retry: "2 attempts", rollback: "Archive user",
    upstream: "None", downstream: "P-080 (Role Assignment)", apis: "POST /admin/users", db: "User, Role",
    dod: "User created. Role assigned. Welcome sent." },
  { id: "P-080", name: "Role Assignment", group: "14_user_role", priority: "P0", criticality: "Authorization", sla: "< 15min", kpi: "SoD violations prevented", wave: "01", sprint: "S1", sessions: "2",
    purpose: "Assign or change user role and permissions", owner: "IT Admin", trigger: "Role change request", actors: "IT Admin",
    inputs: "User ID, Role ID, Reason", outputs: "Role updated, Permissions recalculated",
    businessRules: "SoD enforced: conflicting roles cannot be combined. Super_admin bypasses all checks.", security: "Role change audited. Cannot self-assign.", permissions: "admin.*",
    exceptions: "SoD violation → Reject with explanation", retry: "2 attempts", rollback: "Restore previous role",
    upstream: "P-078 (User exists)", downstream: "All (access granted)", apis: "PUT /admin/users/:id, PUT /admin/roles/:id", db: "User, Role, PermissionOnRole",
    dod: "Role assigned. Permissions updated. Audit logged." },

  // === CONFIG (P-082 to P-085) ===
  { id: "P-082", name: "Configuration Update", group: "15_config", priority: "P0", criticality: "System operation", sla: "< 5min", kpi: "Accuracy > 99.9%", wave: "02", sprint: "S2", sessions: "1",
    purpose: "Change system configuration setting", owner: "Platform Director", trigger: "Admin request", actors: "System Administrator",
    inputs: "Config key, New value, Reason", outputs: "Config updated, Before/after snapshot logged",
    businessRules: "Config validation on write. Billing-impacting changes require approval.", security: "Changes audited with before/after snapshots.", permissions: "admin.*",
    exceptions: "Invalid value → Reject with valid range", retry: "2 attempts", rollback: "Restore previous value",
    upstream: "None", downstream: "Affected processes", apis: "PUT /admin/settings", db: "SystemSetting",
    dod: "Config updated. Affected systems notified. Audit logged." },

  // === MONITORING/BACKUP (P-086 to P-090) ===
  { id: "P-086", name: "Health Check", group: "16_monitoring_backup", priority: "P0", criticality: "System monitoring", sla: "< 5s response", kpi: "Uptime > 99.9%", wave: "01", sprint: "S1", sessions: "2",
    purpose: "Verify system components are healthy", owner: "DevOps", trigger: "Every 30 seconds (automated)", actors: "System (Monitoring)",
    inputs: "Component list", outputs: "Health status (PASS/DEGRADED/FAIL)",
    businessRules: "Covers DB, queue, cache, API, gateway.", security: "Public endpoint (no auth). Deep health requires auth.", permissions: "Public",
    exceptions: "Component down → Report DEGRADED, continue checking", retry: "Continuous (every 30s)", rollback: "N/A",
    upstream: "None", downstream: "P-087 (Monitoring)", apis: "GET /api/health, GET /api/admin/deep-health", db: "None",
    dod: "All checks passed. Response < 5s." },
  { id: "P-088", name: "Backup Creation", group: "16_monitoring_backup", priority: "P0", criticality: "Data protection", sla: "< 1hr backup window", kpi: "RPO < 1hr, Success > 99.5%", wave: "02", sprint: "S2", sessions: "3",
    purpose: "Create database/config backup", owner: "DevOps", trigger: "Scheduled daily", actors: "System (Backup Engine)",
    inputs: "Backup type (full/incremental), Retention policy", outputs: "Backup record, Encrypted file",
    businessRules: "AES-256 encryption. Off-site copy required. Retention: 30 days daily.", security: "Encrypted. Off-site storage.", permissions: "admin.*",
    exceptions: "Insufficient disk → Alert, retry after cleanup", retry: "1hr retry", rollback: "Restore from previous backup",
    upstream: "None", downstream: "P-089 (Restore), P-090 (DR)", apis: "POST /admin/backups", db: "Backup",
    dod: "Backup completed. Verified. Off-site copy confirmed." },

  // === AI/KNOWLEDGE (P-094 to P-097) ===
  { id: "P-094", name: "AI Root Cause Analysis", group: "17_ai_knowledge", priority: "P0", criticality: "Diagnostics", sla: "< 60s analysis", kpi: "Accuracy > 80%", wave: "04", sprint: "S4", sessions: "5",
    purpose: "Auto-diagnose root cause of meter anomalies", owner: "AI Platform Director", trigger: "Meter event, Abnormal consumption, Validation failure", actors: "AI Agent (RCAgent), Operations Analyst",
    inputs: "Meter ID, Issue, Readings (last 10), Events (last 20), SIM data", outputs: "RCA case, Root cause, Confidence score, Recommendation",
    businessRules: "Never invent data. Cite evidence. Human review if confidence < 70%.", security: "AI results reviewed by human if < 70% confidence.", permissions: "ai.*",
    exceptions: "Insufficient data → Return 'Insufficient data for analysis'", retry: "2 attempts with different model", rollback: "N/A",
    upstream: "P-001 (Meter), P-011 (Readings), P-014 (Validation)", downstream: "None", apis: "POST /api/rca/cases, POST /api/rca/cases/:id/auto-analyze", db: "RCACase, KnowledgeRepository",
    dod: "RCA case created. Root cause identified. Confidence scored." },

  // === ALERT (P-098 to P-099) ===
  { id: "P-098", name: "Alert Generation", group: "18_analytics_alert", priority: "P0", criticality: "System monitoring", sla: "< 5s detection", kpi: "MTTA < 15min", wave: "02", sprint: "S2", sessions: "3",
    purpose: "Generate alerts when thresholds breached", owner: "Operations Director", trigger: "Threshold breach", actors: "System (Monitoring Engine)",
    inputs: "Alert rule, Metric name, Current/threshold value, Severity", outputs: "Alert record, Notifications sent",
    businessRules: "Cooldown prevents storms. Aggregation: 10 in 5min → single alert.", security: "Alert rules configurable by admin only.", permissions: "admin.* (config), System (execution)",
    exceptions: "Alert storm → Aggregate into single alert with count", retry: "N/A (real-time)", rollback: "Auto-resolve if condition clears",
    upstream: "P-086 (Health), P-087 (Monitoring)", downstream: "P-099 (Resolution)", apis: "GET /api/alerts", db: "Alert, AlertRule",
    dod: "Alert generated. Correct severity. Notifications sent." },

  // === INTEGRATION (P-101 to P-108) ===
  { id: "P-101", name: "ERP Sync", group: "19_integration", priority: "P1", criticality: "Financial integration", sla: "< 1hr sync window", kpi: "Sync success > 99%", wave: "05", sprint: "S5", sessions: "8",
    purpose: "Sync financial data with external ERP", owner: "Integration Director", trigger: "Scheduled, Event-driven", actors: "System (Integration Engine)",
    inputs: "Entity type, Entity ID, Last sync timestamp", outputs: "Data exported to ERP, Sync log",
    businessRules: "Idempotent sync. Each record versioned. Error tolerance < 1%.", security: "API key or certificate auth. Data encrypted in transit.", permissions: "admin.*",
    exceptions: "Connection refused → Queue, retry, escalate after 3 failures", retry: "3 attempts with escalation", rollback: "Reverse sync entries, re-run from checkpoint",
    upstream: "P-033 (Invoices), P-045 (Payments)", downstream: "ERP System", apis: "Planned: POST /api/integration/erp/sync", db: "ExportLog",
    dod: "Data synced. Errors reported. Reconciliation log created." },
  { id: "P-106", name: "Webhook Processing", group: "20_webhook_queue", priority: "P1", criticality: "Integration delivery", sla: "< 10s delivery timeout", kpi: "Delivery rate > 99.5%", wave: "04", sprint: "S4", sessions: "4",
    purpose: "Deliver events to external systems via webhook", owner: "Integration Director", trigger: "Domain event published", actors: "System (Webhook Engine)",
    inputs: "Event type, Payload, Target URL, Secret", outputs: "HTTP POST to target, Delivery attempt logged",
    businessRules: "HMAC-SHA256 signature. Timeout 10s. Max payload 1MB. At-least-once delivery.", security: "HMAC-SHA256 signed. Shared secret.", permissions: "System",
    exceptions: "Target unreachable → Retry 5x, then dead letter queue", retry: "5 attempts: 1min, 5min, 15min, 1hr, 4hrs", rollback: "Replay from dead letter queue",
    upstream: "All domain events", downstream: "External applications", apis: "Webhook subscriptions via admin UI", db: "Webhook (subscription), WebhookDeliveryLog",
    dod: "Webhook delivered. 200 response received. Retry exhausted or succeeded logged." },
]

// Generate files
let count = 0
for (const p of allProcesses) {
  const content = TEMPLATE(p)
  const safeName = p.id + "_" + p.name.replace(/[^a-zA-Z0-9]/g, "_")
  fs.writeFileSync(`${OUT}/${p.group}/${safeName}.md`, content)
  count++
}
console.log(`Generated ${count} individual process files`)
