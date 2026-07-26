# Domain Architecture Diagrams

**File:** `_diagrams/DOMAIN_DIAGRAMS.md`
**Status:** Enterprise Planning Phase

---

## 1. Context Diagram (C4 Level 1)

```mermaid
graph TB
    subgraph "MeterVerse Platform"
        MV["MeterVerse Enterprise OS"]
    end
    
    subgraph "External Actors"
        CUSTOMER[Customer]
        FIELD_TECH[Field Technician]
        AMI[AMI/MDM System]
        ERP[ERP System]
        CRM[CRM System]
        BANK[Banking Gateway]
        GOV[Government Portal]
        SCADA[SCADA System]
    end
    
    CUSTOMER -->|"View bills, pay, submit readings"| MV
    FIELD_TECH -->|"Install, read, maintain meters"| MV
    AMI -->|"Push readings, push events"| MV
    ERP -->|"Sync financials, GL codes"| MV
    CRM -->|"Sync customer data"| MV
    BANK -->|"Process payments, reconcile"| MV
    GOV -->|"Regulatory reporting"| MV
    SCADA -->|"Real-time monitoring"| MV
```

## 2. Domain Map

```mermaid
graph TB
    subgraph "Core Domains"
        METER[Meter Domain]
        READING[Reading Domain]
        CUSTOMER[Customer Domain]
        CONTRACT[Contract Domain]
    end
    
    subgraph "Billing & Finance"
        BILLING[Billing Domain]
        INVOICE[Invoice Domain]
        PAYMENT[Payment Domain]
        TARIFF[Tariff Domain]
        ACCOUNTING[Accounting Domain]
        COLLECTION[Collection Domain]
        WALLET[Wallet Domain]
    end
    
    subgraph "Communication"
        SIM[SIM Domain]
        SYNC[Synchronization Domain]
        NOTIFICATION[Notification Domain]
    end
    
    subgraph "Intelligence"
        AI[AI Domain]
        ANALYTICS[Analytics Domain]
        ALERT[Alert Domain]
        RCA[RCA Domain]
    end
    
    subgraph "Integration"
        INTEGRATION[Integration Domain]
        ERP[ERP Integration]
        GIS[GIS Integration]
    end
    
    subgraph "Platform"
        AUTH[Authentication]
        TENANT[Tenant Management]
        CONFIG[Configuration]
        MONITOR[Monitoring]
        BACKUP[Backup & Recovery]
    end
    
    READING -->|"consumption data"| BILLING
    METER -->|"meter data"| READING
    CUSTOMER -->|"billing party"| BILLING
    CONTRACT -->|"terms"| BILLING
    TARIFF -->|"rates"| BILLING
    BILLING -->|"invoices"| INVOICE
    INVOICE -->|"payments"| PAYMENT
    PAYMENT -->|"allocations"| COLLECTION
    INVOICE -->|"GL entries"| ACCOUNTING
    PAYMENT -->|"GL entries"| ACCOUNTING
    COLLECTION -->|"bad debt"| ACCOUNTING
    WALLET -->|"prepayments"| ACCOUNTING
    SYNC -->|"replicated data"| ALL_CORE[All Core Domains]
    NOTIFICATION -->|"alerts"| ALL_DOMAINS[All Domains]
```

## 3. Capability Map (Heat Map)

```mermaid
graph LR
    subgraph "Implementation Status"
        GREEN[✅ Live]
        YELLOW[⚠️ Partial]
        RED[🔴 Missing]
    end
    
    subgraph "Core"
        M1[Meter CRUD]:::live
        M2[Meter Config]:::missing
        M3[Meter Sync]:::missing
        R1[Reading CRUD]:::live
        R2[Reading Validation]:::live
        C1[Customer CRUD]:::live
        C2[Customer Groups]:::live
    end
    
    subgraph "Billing"
        B1[Bill Run]:::live
        B2[Invoice Gen]:::live
        B3[Lifecycle]:::partial
        T1[Tariff Engine]:::live
        P1[Payment]:::live
    end
    
    subgraph "Finance"
        A1[Chart of Accounts]:::missing
        A2[Journal Entry]:::missing
        A3[General Ledger]:::missing
        A4[Trial Balance]:::missing
        A5[Period Mgmt]:::missing
        A6[Reconciliation]:::missing
    end
    
    subgraph "Comms"
        S1[SIM Lifecycle]:::live
        S2[Sync Engine]:::missing
        N1[Notifications]:::partial
    end
    
    classDef live fill:#22C55E,color:white
    classDef partial fill:#F59E0B,color:white
    classDef missing fill:#DC2626,color:white
```

## 4. Dependency Graph (Top 10 Domains)

```mermaid
graph TD
    CUSTOMER --> CONTRACT
    CUSTOMER --> METER
    METER --> READING
    CONTRACT --> BILLING
    READING --> BILLING
    TARIFF --> BILLING
    BILLING --> INVOICE
    INVOICE --> PAYMENT
    INVOICE --> COLLECTION
    PAYMENT --> ACCOUNTING
    INVOICE --> ACCOUNTING
    COLLECTION --> ACCOUNTING
    ACCOUNTING --> JOURNAL
    JOURNAL --> REPORTING
```

## 5. BPMN: Invoice-to-Payment Process

```mermaid
sequenceDiagram
    participant M as Meter
    participant R as Reading
    participant B as Billing
    participant I as Invoice
    participant P as Payment
    participant A as Accounting
    participant GL as General Ledger
    
    M->>R: Submit Reading
    R->>B: Valid Reading
    B->>B: Calculate Consumption
    B->>B: Apply Tariff
    B->>I: Generate Invoice
    I->>P: Send to Customer
    P->>P: Receive Payment
    P->>A: Post to AR Account
    A->>GL: Create Journal Entry
    GL->>GL: Update Account Balances
```

## 6. Ownership Map

| Domain | Team | Tech Lead | DB Owner |
|--------|------|-----------|----------|
| Meter | Meter Operations | Backend Team | Core DB |
| Reading | Meter Data Mgmt | Backend Team | Core DB |
| Customer | CRM Team | Full Stack Team | Core DB |
| Billing | Billing Team | Backend Team | Core DB |
| Accounting | Finance Team | Backend Team | Core DB |
| AI | AI Platform Team | AI Team | Intelligence DB |
| Platform | Platform Team | DevOps Team | System DB |
| Integration | Integration Team | Backend Team | Core DB |
