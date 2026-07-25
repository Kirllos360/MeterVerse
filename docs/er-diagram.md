# MeterVerse ER Diagram (Auto-generated)
# Generated: 2026-07-25
# Total tables: 86
# Total relationships: 57

```mermaid
erDiagram
    ActivityStream {
        text id PK
        text actor
        text actorId
        text action
        text resource
        text resourceId
        text details
        text ip
        text severity
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    Alert {
        text id PK
        text alertRuleId
        text entityType
        text entityId
        text message
        text severity
        text status
        timestamp without time zone acknowledgedAt
        timestamp without time zone resolvedAt
        text resolvedBy
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    AlertRule {
        text id PK
        text name
        text description
        text entityType
        text condition
        text severity
        boolean enabled
        integer cooldown
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    ApiKey {
        text id PK
        text name
        text key
        text prefix
        text userId
        text permissions
        timestamp without time zone lastUsedAt
        timestamp without time zone expiresAt
        boolean active
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    AuditEntry {
        text id PK
        timestamp without time zone timestamp
        text actor
        text actorId
        text action
        text resource
        text resourceId
        text details
        text ip
        text userAgent
        text status
        text afterSnapshot
        text beforeSnapshot
        text correlationId
    }
    Backup {
        text id PK
        text name
        text type
        text size
        text status
        text path
        timestamp without time zone startedAt
        timestamp without time zone completedAt
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    BillCycle {
        text id PK
        text name
        text code
        text frequency
        integer billingDay
        integer dueDay
        integer cutOffDay
        text status
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    BillRun {
        text id PK
        text billCycleId
        timestamp without time zone periodStart
        timestamp without time zone periodEnd
        text status
        integer totalCount
        double precision totalAmount
        timestamp without time zone processedAt
        timestamp without time zone completedAt
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    BillRunHistory {
        text id PK
        text billRunId
        text action
        text details
        text actedBy
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    BrandingConfig {
        text id PK
        text key
        text value
        text category
        timestamp without time zone updatedAt
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    CacheEntry {
        text id PK
        text key
        text value
        integer ttl
        integer hits
        timestamp without time zone createdAt
        timestamp without time zone expiresAt
        timestamp without time zone archivedAt
    }
    ChargeOverride {
        text id PK
        text chargeRuleId
        text customerId
        text contractId
        double precision overrideValue
        timestamp without time zone validFrom
        timestamp without time zone validTo
        text reason
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    ChargeRule {
        text id PK
        text name
        text code
        text description
        text type
        text formula
        integer priority
        boolean active
        timestamp without time zone effectiveFrom
        timestamp without time zone effectiveTo
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    CollectionAction {
        text id PK
        text collectionCaseId
        text type
        text result
        text notes
        text actedBy
        timestamp without time zone actedAt
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    CollectionCase {
        text id PK
        text customerId
        text invoiceId
        text status
        text priority
        double precision totalAmount
        double precision paidAmount
        timestamp without time zone openedAt
        timestamp without time zone escalatedAt
        timestamp without time zone closedAt
        text assignedTo
        text notes
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    Contract {
        text id PK
        text contractNumber
        text customerId
        text type
        text status
        timestamp without time zone startDate
        timestamp without time zone endDate
        text terms
        boolean autoRenew
        text signedBy
        timestamp without time zone signedAt
        timestamp without time zone archivedAt
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
    }
    ContractAmendment {
        text id PK
        text contractId
        text amendmentNumber
        text description
        timestamp without time zone changeDate
        text approvedBy
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    ContractTerm {
        text id PK
        text contractId
        text key
        text value
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    Customer {
        text id PK
        text name
        text email
        text phone
        text address
        text status
        text area
        timestamp without time zone archivedAt
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
    }
    CustomerGroup {
        text id PK
        text name
        text description
        text status
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    CustomerLedgerEntry {
        text id PK
        text customerId
        text type
        double precision amount
        text description
        text reference
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    DiscountRule {
        text id PK
        text invoiceItemId
        text name
        text type
        double precision value
        text code
        double precision maxAmount
        timestamp without time zone validFrom
        timestamp without time zone validTo
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    EmailLog {
        text id PK
        text to
        text from
        text subject
        text body
        text status
        text error
        timestamp without time zone sentAt
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    EscalationPolicy {
        text id PK
        text name
        text description
        text triggerType
        integer threshold
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    EscalationStep {
        text id PK
        text escalationPolicyId
        integer level
        text notifyRole
        text notifyEmail
        text action
        integer timeout
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    ExcelJob {
        text id PK
        text type
        text format
        text data
        text status
        text filePath
        integer totalRows
        timestamp without time zone createdAt
        timestamp without time zone completedAt
        timestamp without time zone archivedAt
    }
    ExportJob {
        text id PK
        text type
        text format
        text filters
        text status
        integer totalRows
        text filePath
        timestamp without time zone completedAt
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    ExportLog {
        text id PK
        text type
        text format
        text filters
        integer totalRows
        text filePath
        text status
        timestamp without time zone createdAt
        timestamp without time zone completedAt
        timestamp without time zone archivedAt
    }
    FeatureFlag {
        text id PK
        text key
        text name
        boolean enabled
        text scope
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    GatewayLog {
        text id PK
        text paymentTransactionId
        text level
        text message
        text details
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    GroupMember {
        text id PK
        text customerGroupId
        text customerId
        timestamp without time zone joinedAt
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    GroupPricing {
        text id PK
        text customerGroupId
        text tariffId
        double precision discountRate
        timestamp without time zone validFrom
        timestamp without time zone validTo
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    GroupSLA {
        text id PK
        text customerGroupId
        text slaId
        integer priority
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    ImportJob {
        text id PK
        text type
        text fileName
        text status
        integer totalRows
        integer processed
        integer failed
        text errors
        timestamp without time zone completedAt
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    Invoice {
        text id PK
        text number
        text customerId
        double precision amount
        text status
        timestamp without time zone dueDate
        timestamp without time zone issuedAt
        timestamp without time zone paidAt
        timestamp without time zone archivedAt
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone immutableAt
        double precision paidAmount
    }
    InvoiceItem {
        text id PK
        text invoiceId
        text type
        text description
        double precision quantity
        double precision unitPrice
        double precision amount
        double precision taxRate
        double precision taxAmount
        double precision total
        text referenceType
        text referenceId
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    InvoiceTax {
        text id PK
        text invoiceItemId
        text name
        double precision rate
        double precision amount
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    KpiDefinition {
        text id PK
        text name
        text category
        double precision target
        text unit
        double precision current
        text trend
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    KpiSnapshot {
        text id PK
        text kpiId
        double precision value
        timestamp without time zone recordedAt
    }
    License {
        text id PK
        text key
        text type
        text status
        integer seats
        timestamp without time zone expiresAt
        timestamp without time zone activatedAt
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    Meter {
        text id PK
        text serial
        text type
        text location
        text status
        text area
        text customerId
        timestamp without time zone archivedAt
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        text meterTypeId
    }
    MeterAssignment {
        text id PK
        text meterId
        text customerId
        text contractId
        timestamp without time zone startDate
        timestamp without time zone endDate
        text reason
        text status
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    MeterAssignmentHistory {
        text id PK
        text meterAssignmentId
        text field
        text oldValue
        text newValue
        text changedBy
        timestamp without time zone changedAt
    }
    MeterEvent {
        text id PK
        text meterId
        text type
        text description
        timestamp without time zone timestamp
        timestamp without time zone resolvedAt
        text resolvedBy
        text status
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    MeterType {
        text id PK
        text name
        text category
        text unit
        text description
        text manufacturer
        text formFactor
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    Notification {
        text id PK
        text type
        text title
        text body
        text recipientId
        text recipientEmail
        text status
        text channel
        timestamp without time zone sentAt
        timestamp without time zone readAt
        text error
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    NotificationTemplate {
        text id PK
        text key
        text name
        text type
        text subject
        text body
        text variables
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    OcrJob {
        text id PK
        text fileName
        text status
        text result
        double precision confidence
        timestamp without time zone processedAt
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    Organization {
        text id PK
        text name
        text slug
        text domain
        text logo
        text plan
        text status
        text settings
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    Payment {
        text id PK
        text invoiceId
        double precision amount
        text method
        text status
        timestamp without time zone paidAt
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    PaymentGateway {
        text id PK
        text name
        text provider
        text config
        boolean active
        boolean testMode
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    PaymentTransaction {
        text id PK
        text gatewayId
        text paymentId
        text transactionId
        text type
        double precision amount
        text currency
        text status
        text gatewayResponse
        text errorMessage
        timestamp without time zone processedAt
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    PdfJob {
        text id PK
        text type
        text template
        text data
        text status
        text filePath
        timestamp without time zone createdAt
        timestamp without time zone completedAt
        timestamp without time zone archivedAt
    }
    Permission {
        text id PK
        text name
        text description
        text module
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    PermissionOnRole {
        text roleId PK
        text permissionId
    }
    Project {
        text id PK
        text name
        text description
        text organizationId
        text status
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        integer paymentTermsDays
        double precision readingThreshold
        boolean taxEnabled
        double precision taxRate
        text waterDifferenceMode
        timestamp without time zone archivedAt
    }
    PromiseToPay {
        text id PK
        text collectionCaseId
        timestamp without time zone promisedDate
        double precision promisedAmount
        text status
        timestamp without time zone keptAt
        text notes
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    PushNotification {
        text id PK
        text title
        text body
        text deviceToken
        text platform
        text status
        timestamp without time zone sentAt
        text error
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    QueueJob {
        text id PK
        text type
        text payload
        text status
        integer priority
        integer attempts
        integer maxAttempts
        text error
        timestamp without time zone scheduledAt
        timestamp without time zone startedAt
        timestamp without time zone completedAt
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    Reading {
        text id PK
        text meterId
        double precision value
        text unit
        timestamp without time zone timestamp
        text source
        text status
        timestamp without time zone archivedAt
        timestamp without time zone createdAt
    }
    ReportDefinition {
        text id PK
        text name
        text type
        text description
        text config
        text schedule
        text recipients
        timestamp without time zone lastRunAt
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    Role {
        text id PK
        text name
        text description
        boolean isSystem
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    SIMAssignment {
        text id PK
        text simId
        text meterId
        timestamp without time zone startAt
        timestamp without time zone endAt
        text status
        text createdBy
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    SIMCard {
        text id PK
        text iccid
        text simNumber
        text status
        text operator
        text apn
        text meterId
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        text ipAddress
        timestamp without time zone cooldownUntil
        timestamp without time zone archivedAt
    }
    SLA {
        text id PK
        text name
        text description
        integer responseTime
        integer resolutionTime
        double precision availability
        text severity
        boolean active
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    SLABreach {
        text id PK
        text slaId
        text metric
        double precision expected
        double precision actual
        timestamp without time zone breachedAt
        timestamp without time zone resolvedAt
        text notes
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    SLAEscalation {
        text id PK
        text slaId
        integer level
        integer threshold
        text notifyTo
        text action
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    ScheduledReport {
        text id PK
        text name
        text reportType
        text schedule
        text format
        text recipients
        boolean active
        timestamp without time zone lastSentAt
        timestamp without time zone nextRunAt
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    ScheduledTask {
        text id PK
        text name
        text description
        text cron
        text taskType
        text config
        boolean active
        timestamp without time zone lastRunAt
        timestamp without time zone nextRunAt
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    ServiceConnection {
        text id PK
        text meterId
        text customerId
        text type
        text status
        timestamp without time zone startDate
        timestamp without time zone endDate
        text contractId
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    Session {
        text id PK
        text userId
        text token
        text ip
        text userAgent
        text device
        text location
        boolean isActive
        timestamp without time zone lastUsedAt
        timestamp without time zone expiresAt
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    SmsLog {
        text id PK
        text to
        text from
        text message
        text status
        text error
        timestamp without time zone sentAt
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    StoredFile {
        text id PK
        text name
        text originalName
        text mimeType
        integer size
        text path
        text category
        text uploadedBy
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    SystemSetting {
        text id PK
        text key
        text value
        text category
        text type
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    Tariff {
        text id PK
        text name
        text code
        text description
        text type
        text currency
        text unit
        timestamp without time zone effectiveFrom
        timestamp without time zone effectiveTo
        text status
        timestamp without time zone archivedAt
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
    }
    TariffRate {
        text id PK
        text tariffId
        text name
        double precision rate
        text unit
        timestamp without time zone validFrom
        timestamp without time zone validTo
        integer priority
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    TariffTier {
        text id PK
        text tariffId
        text name
        double precision minValue
        double precision maxValue
        double precision rate
        text unit
        integer priority
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    Task {
        text id PK
        text title
        text description
        text status
        text priority
        text assigneeId
        text customerId
        timestamp without time zone dueDate
        text createdBy
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    Unit {
        text id PK
        text name
        text code
        text zoneId
        text type
        double precision area
        text status
        text customerId
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    User {
        text id PK
        text email
        text password
        text name
        text role
        text avatar
        text phone
        text status
        boolean emailVerified
        text area
        text project
        text tenant
        text language
        text theme
        boolean mfaEnabled
        timestamp without time zone lastActiveAt
        timestamp without time zone lastLoginAt
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        text roleId
        timestamp without time zone lastFailedAt
        timestamp without time zone lockedUntil
        integer loginAttempts
        text mfaSecret
        timestamp without time zone archivedAt
    }
    ValidationResult {
        text id PK
        text validationRuleId
        text entityType
        text entityId
        text status
        text message
        timestamp without time zone resolvedAt
        text resolvedBy
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    ValidationRule {
        text id PK
        text name
        text code
        text description
        text entityType
        text condition
        text action
        text severity
        boolean active
        integer priority
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    Webhook {
        text id PK
        text name
        text url
        text events
        text secret
        boolean active
        timestamp without time zone lastTriggeredAt
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }
    WorkflowState {
        text id PK
        text name
        text entityType
        text state
        timestamp without time zone enteredAt
        text enteredBy
        text notes
        timestamp without time zone createdAt
        timestamp without time zone archivedAt
    }
    WorkflowTransition {
        text id PK
        text workflowStateId
        text fromState
        text toState
        text action
        text triggeredBy
        timestamp without time zone triggeredAt
        text notes
    }
    Zone {
        text id PK
        text name
        text code
        text projectId
        text description
        timestamp without time zone createdAt
        timestamp without time zone updatedAt
        timestamp without time zone archivedAt
    }

    Alert ||--o{ AlertRule : "alertRuleId"
    ApiKey ||--o{ User : "userId"
    AuditEntry ||--o{ User : "actorId"
    BillRun ||--o{ BillCycle : "billCycleId"
    BillRunHistory ||--o{ BillRun : "billRunId"
    ChargeOverride ||--o{ ChargeRule : "chargeRuleId"
    CollectionAction ||--o{ CollectionCase : "collectionCaseId"
    CollectionCase ||--o{ Invoice : "invoiceId"
    CollectionCase ||--o{ Customer : "customerId"
    Contract ||--o{ Customer : "customerId"
    ContractAmendment ||--o{ Contract : "contractId"
    ContractTerm ||--o{ Contract : "contractId"
    DiscountRule ||--o{ InvoiceItem : "invoiceItemId"
    EscalationStep ||--o{ EscalationPolicy : "escalationPolicyId"
    GatewayLog ||--o{ PaymentTransaction : "paymentTransactionId"
    GroupMember ||--o{ Customer : "customerId"
    GroupMember ||--o{ CustomerGroup : "customerGroupId"
    GroupPricing ||--o{ Tariff : "tariffId"
    GroupPricing ||--o{ CustomerGroup : "customerGroupId"
    GroupSLA ||--o{ SLA : "slaId"
    GroupSLA ||--o{ CustomerGroup : "customerGroupId"
    Invoice ||--o{ Customer : "customerId"
    InvoiceItem ||--o{ Invoice : "invoiceId"
    InvoiceTax ||--o{ InvoiceItem : "invoiceItemId"
    KpiSnapshot ||--o{ KpiDefinition : "kpiId"
    Meter ||--o{ MeterType : "meterTypeId"
    Meter ||--o{ Customer : "customerId"
    MeterAssignment ||--o{ Contract : "contractId"
    MeterAssignment ||--o{ Customer : "customerId"
    MeterAssignment ||--o{ Meter : "meterId"
    MeterAssignmentHistory ||--o{ MeterAssignment : "meterAssignmentId"
    MeterEvent ||--o{ Meter : "meterId"
    Payment ||--o{ Invoice : "invoiceId"
    PaymentTransaction ||--o{ Payment : "paymentId"
    PaymentTransaction ||--o{ PaymentGateway : "gatewayId"
    PermissionOnRole ||--o{ Permission : "permissionId"
    PermissionOnRole ||--o{ Role : "roleId"
    Project ||--o{ Organization : "organizationId"
    PromiseToPay ||--o{ CollectionCase : "collectionCaseId"
    Reading ||--o{ Meter : "meterId"
    SIMAssignment ||--o{ SIMCard : "simId"
    SIMAssignment ||--o{ Meter : "meterId"
    SIMCard ||--o{ Meter : "meterId"
    SLABreach ||--o{ SLA : "slaId"
    SLAEscalation ||--o{ SLA : "slaId"
    ServiceConnection ||--o{ Contract : "contractId"
    ServiceConnection ||--o{ Meter : "meterId"
    ServiceConnection ||--o{ Customer : "customerId"
    Session ||--o{ User : "userId"
    TariffRate ||--o{ Tariff : "tariffId"
    TariffTier ||--o{ Tariff : "tariffId"
    Unit ||--o{ Zone : "zoneId"
    Unit ||--o{ Customer : "customerId"
    User ||--o{ Role : "roleId"
    ValidationResult ||--o{ ValidationRule : "validationRuleId"
    WorkflowTransition ||--o{ WorkflowState : "workflowStateId"
    Zone ||--o{ Project : "projectId"
```
