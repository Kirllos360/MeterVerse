# Enterprise ERD & Data Flow Diagrams

**File:** `planning/052_ENTERPRISE_DATA_ARCHITECTURE/17_DIAGRAMS/ENTERPRISE_ERD.md`

---

## Enterprise Entity Relationship Diagram (Logical)

```mermaid
erDiagram
    Organization ||--o{ Project : contains
    Project ||--o{ Zone : contains
    Zone ||--o{ Unit : contains
    Unit ||--o{ Customer : occupies
    
    Customer ||--o{ Contract : signs
    Customer ||--o{ Meter : assigned
    Customer ||--o{ Invoice : receives
    Customer ||--o{ Payment : makes
    Customer ||--o{ CollectionCase : has
    
    Contract ||--o{ MeterAssignment : governs
    Contract ||--o{ ContractTerm : defines
    
    Meter ||--o{ Reading : produces
    Meter ||--o{ MeterEvent : generates
    Meter ||--o{ MeterAssignment : involved
    Meter ||--o{ SIMCard : communicates
    Meter ||--o{ MeterConfiguration : configured
    
    SIMCard ||--o{ SIMAssignment : lifecycle
    
    Reading ||--o{ ValidationResult : validated
    
    Invoice ||--o{ InvoiceItem : contains
    Invoice ||--o{ Payment : pays
    Invoice ||--o{ CollectionCase : triggers
    
    Payment ||--o{ PaymentTransaction : processed
    
    InvoiceItem ||--o{ InvoiceTax : taxed
    InvoiceItem ||--o{ DiscountRule : discounted
    
    Tariff ||--o{ TariffRate : rates
    Tariff ||--o{ TariffTier : tiers
    
    BillCycle ||--o{ BillRun : schedules
    BillRun ||--o{ BillRunHistory : logs
    
    JournalEntry ||--o{ JournalLineItem : lines
    Account ||--o{ GeneralLedgerEntry : balances
    Account ||--o{ JournalLineItem : posted
    
    User ||--o{ Session : authenticates
    User ||--o{ ApiKey : authorizes
    Role ||--o{ PermissionOnRole : grants
    Permission ||--o{ PermissionOnRole : assigned
    
    AlertRule ||--o{ Alert : triggers
    WorkflowDefinition ||--o{ WorkflowState : defines
    WorkflowState ||--o{ WorkflowTransition : transitions
    
    CustomerGroup ||--o{ GroupMember : includes
    CustomerGroup ||--o{ GroupPricing : prices
    CustomerGroup ||--o{ GroupSLA : serves
    
    SLA ||--o{ GroupSLA : assigned
    SLA ||--o{ SLABreach : monitors
    SLA ||--o{ SLAEscalation : escalates
```

## Data Flow Diagram (Context Level)

```mermaid
graph TD
    subgraph "MeterVerse Platform"
        API[API Gateway]
        AUTH[Auth Service]
        BILLING[Billing Engine]
        SYNC[Sync Engine]
        AI_ENGINE[AI Engine]
        VALIDATION[Validation Engine]
    end
    
    subgraph "External Systems"
        AMI[AMI/MDM] -->|Readings| API
        SCADA[SCADA System] -->|Real-time Data| API
        ERP[ERP System] <-->|Financial Sync| API
        CRM[CRM System] <-->|Customer Sync| API
        GIS[GIS System] -->|Location Data| API
        BANK[Bank Gateway] <-->|Payments| API
        GOV[Government Portal] -->|Regulatory Data| API
    end
    
    subgraph "Users"
        ADMIN_USER[Admin User] -->|Operations| API
        FIELD_TECH[Field Tech] -->|Mobile Access| API
        CUSTOMER[Customer] -->|Portal Access| API
    end
    
    API --> AUTH
    API --> BILLING
    API --> SYNC
    API --> AI_ENGINE
    API --> VALIDATION
```

## Data Replication Diagram

```mermaid
graph TD
    subgraph "Primary (Central)"
        P_DB[(Primary Database)]
        P_APP[Application Servers]
    end
    
    subgraph "Standby (DR)"
        S_DB[(Standby Database)]
        S_APP[Standby Servers]
    end
    
    subgraph "October Area"
        O_APP[October App]
        O_DB[(October Cache)]
    end
    
    subgraph "New Cairo Area"
        NC_APP[New Cairo App]
        NC_DB[(New Cairo Cache)]
    end
    
    subgraph "SODIC Area"
        SOD_APP[SODIC App]
        SOD_DB[(SODIC Cache)]
    end
    
    P_DB <-->|Streaming Replication| S_DB
    P_APP -->|Read/Write| P_DB
    O_APP -->|Read (Cached)| O_DB
    O_APP -->|Write| P_APP
    NC_APP -->|Read (Cached)| NC_DB
    NC_APP -->|Write| P_APP
    SOD_APP -->|Read (Cached)| SOD_DB
    SOD_APP -->|Write| P_APP
    
    S_APP -->|Read| S_DB
```

## Data Lifecycle State Diagram

```mermaid
stateDiagram-v2
    [*] --> CREATED: Data enters system
    CREATED --> VALIDATED: Passes validation
    VALIDATED --> APPROVED: Manual/auto approval
    APPROVED --> ACTIVE: Available for use
    ACTIVE --> MODIFIED: Change occurs
    MODIFIED --> ACTIVE: Version updated
    ACTIVE --> ARCHIVED: Retention trigger
    ARCHIVED --> DELETED: Soft delete
    DELETED --> PURGED: Hard delete after retention
    PURGED --> [*]: Final disposal
    
    CREATED --> REJECTED: Fails validation
    VALIDATED --> REJECTED: Fails approval
    ACTIVE --> DELETED: Legal hold exception
    ARCHIVED --> ACTIVE: Restore request
```
