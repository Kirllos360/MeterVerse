# Master Data Catalog — ALL 96 Entities

**File:** `planning/052_ENTERPRISE_DATA_ARCHITECTURE/01_DATA_INVENTORY/MASTER_DATA_CATALOG.md`

---

## Master Data (12 entities)

| # | Entity | Domain (P09) | Description | Source System | Classification | 
|---|--------|-------------|-------------|---------------|----------------|
| 1 | Customer | MV-DOM-003 | Person or organization receiving utility services | CRM, Portal, API | Master |
| 2 | Meter | MV-DOM-001 | Physical metering device | AMI, Manual, Bulk | Master |
| 3 | Contract | MV-DOM-004 | Service agreement between utility and customer | Contract Mgmt | Master |
| 4 | Unit | MV-DOM-005 | Individual property unit (apartment/office/lot) | Property Mgmt | Master |
| 5 | Zone | MV-DOM-006 | Geographic zone grouping units | Location Mgmt | Master |
| 6 | Project | MV-DOM-006 | Development project grouping zones | Project Mgmt | Master |
| 7 | Organization | MV-DOM-008 | Tenant organization | System Admin | Master |
| 8 | Area | MV-DOM-007 | Operational area for routing/sync | System Admin | Master |
| 9 | MeterType | MV-DOM-001 | Classification of meter (electric/water/gas) | Configuration | Reference |
| 10 | Building | — | Building structure containing units | Property Mgmt | Master |
| 11 | CustomerGroup | MV-DOM-003 | Segmentation group for pricing/SLA | CRM | Reference |
| 12 | ServiceConnection | MV-DOM-001 | Connection point linking meter to customer | Meter Mgmt | Master |

## Transactional Data (28 entities)

| # | Entity | Domain | Description | Source | Classification |
|---|--------|--------|-------------|--------|----------------|
| 13 | Reading | MV-DOM-002 | Meter reading value at a point in time | AMI, Manual, Bulk | Transactional |
| 14 | ReadingValidation | MV-DOM-002 | Result of reading validation checks | Validation Engine | Transactional |
| 15 | Consumption | MV-DOM-002 | Calculated consumption from readings | Billing Engine | Transactional |
| 16 | BillRun | MV-DOM-009 | Batch billing execution record | Billing Engine | Transactional |
| 17 | Invoice | MV-DOM-010 | Customer invoice | Billing Engine | Transactional |
| 18 | InvoiceItem | MV-DOM-010 | Line item on an invoice | Billing Engine | Transactional |
| 19 | InvoiceTax | MV-DOM-010 | Tax applied to invoice item | Billing Engine | Transactional |
| 20 | Payment | MV-DOM-011 | Customer payment | Payment Gateway, Cashier | Transactional |
| 21 | PaymentTransaction | MV-DOM-011 | Payment gateway transaction record | Payment Gateway | Transactional |
| 22 | Settlement | MV-DOM-017 | Meter settlement data from head-end | AMI, File Upload | Transactional |
| 23 | Discount | MV-DOM-019 | Discount applied to billing | Billing Config | Transactional |
| 24 | CollectionCase | MV-DOM-016 | Collection action on overdue invoice | Collection Engine | Transactional |
| 25 | CollectionAction | MV-DOM-016 | Individual collection action/visit | Collection System | Transactional |
| 26 | PromiseToPay | MV-DOM-016 | Customer promise to pay agreement | Collection System | Transactional |
| 27 | JournalEntry | MV-DOM-013 | Double-entry journal posting | Accounting | Transactional |
| 28 | JournalLineItem | MV-DOM-013 | Individual line in a journal entry | Accounting | Transactional |
| 29 | GeneralLedgerEntry | MV-DOM-014 | GL account balance per period | Accounting | Transactional |
| 30 | Account | MV-DOM-013 | Chart of accounts entry | Accounting | Reference |
| 31 | FinancialPeriod | MV-DOM-014 | Accounting period (month/year) | Accounting | Reference |
| 32 | Tariff | MV-DOM-012 | Rate structure definition | Tariff Mgmt | Transactional |
| 33 | TariffRate | MV-DOM-012 | Individual rate within a tariff | Tariff Mgmt | Transactional |
| 34 | ChargeRule | MV-DOM-018 | Fixed/variable charge rule | Billing Config | Transactional |
| 35 | Wallet | MV-DOM-020 | Customer prepayment wallet | Wallet Service | Transactional |
| 36 | WalletTransaction | MV-DOM-020 | Wallet top-up/deduction record | Wallet Service | Transactional |
| 37 | MeterAssignment | MV-DOM-001 | Linking meter to customer | Meter Mgmt | Transactional |
| 38 | SIMAssignment | MV-DOM-026 | Linking SIM to meter | SIM Mgmt | Transactional |
| 39 | MeterEvent | MV-DOM-001 | Event recorded on a meter | Meter Monitoring | Transactional |
| 40 | MeterConfiguration | MV-DOM-001 | Meter technical parameter set | Meter Config | Transactional |

## Operational Data (15 entities)

| # | Entity | Domain | Description | Source | Classification |
|---|--------|--------|-------------|--------|----------------|
| 41 | SyncJob | MV-DOM-028 | Data synchronization job record | Sync Engine | Operational |
| 42 | ImportJob | MV-DOM-040 | File import processing record | Import Service | Operational |
| 43 | ExportJob | MV-DOM-040 | File export processing record | Export Service | Operational |
| 44 | Backup | MV-DOM-053 | System backup record | Backup Service | Operational |
| 45 | Notification | MV-DOM-029 | Notification delivery record | Notification Engine | Operational |
| 46 | EmailLog | MV-DOM-029 | Email delivery log | Email Service | Operational |
| 47 | SmsLog | MV-DOM-029 | SMS delivery log | SMS Service | Operational |
| 48 | PushNotification | MV-DOM-029 | Push notification delivery log | Push Service | Operational |
| 49 | QueueJob | MV-DOM-040 | Background job queue record | Queue Service | Operational |
| 50 | ScheduledTask | MV-DOM-040 | Scheduled task definition and execution | Scheduler | Operational |
| 51 | WorkflowInstance | MV-DOM-030 | Workflow execution instance | Workflow Engine | Operational |
| 52 | WorkflowTransition | MV-DOM-030 | State transition in workflow | Workflow Engine | Operational |
| 53 | Task | MV-DOM-030 | Manual task assignment | Task Service | Operational |
| 54 | Incident | MV-DOM-051 | System incident record | Incident Mgmt | Operational |
| 55 | Change | MV-DOM-049 | System change record | Change Mgmt | Operational |

## Configuration Data (10 entities)

| # | Entity | Domain | Description | Source | Classification |
|---|--------|--------|-------------|--------|----------------|
| 56 | SystemSetting | MV-DOM-049 | Application configuration setting | System Admin | Configuration |
| 57 | FeatureFlag | MV-DOM-049 | Feature toggle for gradual rollout | System Admin | Configuration |
| 58 | AlertRule | MV-DOM-036 | Alert threshold definition | Monitoring | Configuration |
| 59 | WorkflowDefinition | MV-DOM-030 | Workflow state machine definition | Workflow Designer | Configuration |
| 60 | ValidationRule | MV-DOM-033 | Data validation rule definition | Validation Config | Configuration |
| 61 | ReportDefinition | MV-DOM-062 | Report template and schedule | Reporting | Configuration |
| 62 | DashboardConfig | MV-DOM-063 | Dashboard layout and widget config | Dashboard Builder | Configuration |
| 63 | NotificationTemplate | MV-DOM-029 | Multi-channel notification template | Notification Config | Configuration |
| 64 | BrandingConfig | MV-DOM-049 | UI branding and theme configuration | Branding | Configuration |
| 65 | License | MV-DOM-049 | System license record | Licensing | Configuration |

## Security Data (6 entities)

| # | Entity | Domain | Description | Source | Classification |
|---|--------|--------|-------------|--------|----------------|
| 66 | User | MV-DOM-046 | System user account | Identity Provider | Security |
| 67 | Role | MV-DOM-047 | User role with permission set | Authorization | Security |
| 68 | Permission | MV-DOM-047 | Individual access permission | Authorization | Security |
| 69 | PermissionOnRole | MV-DOM-047 | Junction: permission ↔ role | Authorization | Security |
| 70 | ApiKey | MV-DOM-046 | API authentication key | API Gateway | Security |
| 71 | Session | MV-DOM-046 | User authentication session | Auth Service | Security |

## AI Data (8 entities)

| # | Entity | Domain | Description | Source | Classification |
|---|--------|--------|-------------|--------|----------------|
| 72 | AIPrompt | MV-DOM-037 | LLM prompt template | AI Config | AI |
| 73 | AIMemory | MV-DOM-037 | AI agent memory storage | AI Runtime | AI |
| 74 | KnowledgeEntry | MV-DOM-038 | Enterprise knowledge record | Knowledge Base | AI |
| 75 | Embedding | MV-DOM-038 | Vector embedding for semantic search | AI Service | AI |
| 76 | Conversation | MV-DOM-037 | AI conversation history | AI Chat | AI |
| 77 | Feedback | MV-DOM-037 | User feedback on AI response | AI Engine | AI |
| 78 | TrainingData | MV-DOM-037 | Model training dataset | AI Training | AI |
| 79 | ModelRegistry | MV-DOM-037 | AI model version registry | AI Platform | AI |

## Document & Media Data (5 entities)

| # | Entity | Domain | Description | Source | Classification |
|---|--------|--------|-------------|--------|----------------|
| 80 | StoredFile | MV-DOM-059 | Uploaded file record | Document Service | Document |
| 81 | DocumentTemplate | MV-DOM-059 | Reusable document template | Template Service | Document |
| 82 | MediaAsset | MV-DOM-060 | Image/video/audio asset | Media Service | Media |
| 83 | ReportOutput | MV-DOM-062 | Generated report file | Reporting | Document |
| 84 | ExportFile | MV-DOM-062 | Exported data file | Export Service | Document |

## Log & Audit Data (4 entities)

| # | Entity | Domain | Description | Source | Classification |
|---|--------|--------|-------------|--------|----------------|
| 85 | AuditEntry | MV-DOM-051 | System audit log entry | All Mutations | Audit |
| 86 | ActivityStream | MV-DOM-051 | User activity feed | User Actions | Audit |
| 87 | MeterAssignmentHistory | MV-DOM-001 | Meter assignment change log | Meter Mgmt | Audit |
| 88 | BillRunHistory | MV-DOM-009 | Bill run processing log | Billing | Audit |

## Time-Series & Analytics Data (8 entities)

| # | Entity | Domain | Description | Source | Classification |
|---|--------|--------|-------------|--------|----------------|
| 89 | MetricPoint | MV-DOM-051 | System performance metric | Monitoring | Time-Series |
| 90 | KpiSnapshot | MV-DOM-034 | KPI value at a point in time | Analytics | Analytical |
| 91 | AnalyticsQuery | MV-DOM-034 | Saved analytics query | Analytics | Analytical |
| 92 | DashboardWidget | MV-DOM-063 | Dashboard widget instance | Dashboard | Analytical |
| 93 | CustomerLedgerEntry | MV-DOM-016 | Customer financial ledger line | Finance | Transactional |
| 94 | GatewayLog | MV-DOM-027 | Communication gateway activity log | Gateway | Operational |
| 95 | EscalationStep | MV-DOM-016 | Collection escalation step record | Collections | Operational |
| 96 | SLABreach | MV-DOM-003 | SLA violation record | SLA Monitoring | Operational |

---

## Entity Count Summary

| Classification | Count | Percentage |
|---------------|-------|------------|
| Master Data | 12 | 12.5% |
| Transactional Data | 28 | 29.2% |
| Operational Data | 15 | 15.6% |
| Configuration Data | 10 | 10.4% |
| Security Data | 6 | 6.3% |
| AI Data | 8 | 8.3% |
| Document & Media | 5 | 5.2% |
| Log & Audit | 4 | 4.2% |
| Time-Series & Analytics | 8 | 8.3% |
| **Total** | **96** | **100%** |
