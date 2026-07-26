# Data Classification

**Total entities classified: 96**

## Classification Categories

### Master Data (12)
Entities that define core business objects:
Customer, Meter, Contract, Unit, Zone, Project, Organization, Area, Building, CustomerGroup, ServiceConnection, MeterType

### Reference Data (8)
Entities that define allowable values and standards:
Currency, ExchangeRate, MeterType, Account (Chart of Accounts), FinancialPeriod, Tariff, ChargeRule, DiscountRule

### Transactional Data (28)
Entities that record business transactions:
Reading, ReadingValidation, Consumption, BillRun, BillRunHistory, Invoice, InvoiceItem, InvoiceTax, Payment, PaymentTransaction, Settlement, CollectionCase, CollectionAction, PromiseToPay, JournalEntry, JournalLineItem, GeneralLedgerEntry, Wallet, WalletTransaction, MeterAssignment, MeterAssignmentHistory, SIMAssignment, MeterEvent, MeterConfiguration, ChargeOverride, ContractTerm, ContractAmendment, CustomerLedgerEntry

### Operational Data (15)
Entities that support operations:
SyncJob, ConflictLog, ImportJob, ExportJob, Backup, Notification, EmailLog, SmsLog, PushNotification, QueueJob, ScheduledTask, WorkflowState, WorkflowTransition, Task, Incident, Change, GatewayLog

### Configuration Data (10)
Entities that configure system behavior:
SystemSetting, FeatureFlag, AlertRule, Alert, ValidationRule, ValidationResult, ReportDefinition, DashboardConfig, NotificationTemplate, BrandingConfig, License, WorkflowDefinition

### Security Data (6)
Entities that control access:
User, Role, Permission, PermissionOnRole, ApiKey, Session

### AI Data (8)
Entities that support AI/ML:
AIPrompt, AIMemory, KnowledgeEntry, Embedding, Conversation, Feedback, TrainingData, ModelRegistry

### Document & Media (5)
Entities that store files:
StoredFile, DocumentTemplate, MediaAsset, ReportOutput, ExportFile

### Log & Audit (4)
Entities that record activity:
AuditEntry, ActivityStream, SLABreach, SLAEscalation, EscalationStep, GroupMember, GroupPricing, GroupSLA, SLA

### Time-Series & Analytics (6)
Entities for analysis:
MetricPoint, KpiSnapshot, KpiDefinition, AnalyticsQuery, DashboardWidget
