# BPMN Process Diagrams

**File:** `planning/051_ENTERPRISE_PROCESS_ARCHITECTURE/07_DIAGRAMS/PROCESS_BPMN_DIAGRAMS.md`

---

## D-010: Meter Registration (P-001) — BPMN 2.0

```mermaid
graph TD
    subgraph "Meter Operations"
        A[Receive Meter] --> B[Scan Serial]
        B --> C{Serial in System?}
        C -->|Yes| D[Reject: Duplicate]
        C -->|No| E[Enter Meter Details]
        E --> F[Select Meter Type]
        F --> G[Assign Area]
        G --> H{Validate All Fields}
    end
    
    subgraph "System"
        H -->|Valid| I[Create Meter Record]
        I --> J[Create Audit Entry]
        J --> K[Emit MeterCreated Event]
        K --> L[Return Success]
        H -->|Invalid| M[Show Validation Errors]
        M --> E
    end
    
    subgraph "Notification"
        K --> N[Notify Inventory Updated]
        N --> O[Ready for Assignment]
    end
    
    style A fill:#e1f5fe
    style I fill:#c8e6c9
    style D fill:#ffcdd2
```

## D-011: Reading Import — AMI Integration (P-011) — Swimlane

```mermaid
graph TD
    subgraph "AMI/MDM System"
        AMI1[Collect Reading] --> AMI2[Format Message]
        AMI2 --> AMI3[Send to Platform]
    end
    
    subgraph "API Gateway"
        GW1[Receive Request] --> GW2{Authenticate?}
        GW2 -->|Fail| GW3[Reject: 401]
        GW2 -->|Pass| GW4[Validate Payload]
        GW4 -->|Invalid| GW5[Reject: 400]
        GW4 -->|Valid| GW6[Queue for Processing]
    end
    
    subgraph "Reading Service"
        RS1[Dequeue Reading] --> RS2{Duplicate?}
        RS2 -->|Yes| RS3[Reject: Duplicate]
        RS2 -->|No| RS4[Create Reading Record]
        RS4 --> RS5[Trigger Validation]
    end
    
    subgraph "Validation Engine"
        VE1[Run Validation Rules] --> VE2{All Pass?}
        VE2 -->|Yes| VE3[Auto-Approve]
        VE2 -->|No| VE4[Flag for Review]
    end
    
    AMI3 --> GW1
    GW6 --> RS1
    RS5 --> VE1
```

## D-012: Invoice-to-Payment (P-033 → P-045) — Activity Diagram

```mermaid
sequenceDiagram
    participant C as Customer
    participant MV as MeterVerse
    participant B as Bank/Gateway
    participant GL as General Ledger
    
    MV->>MV: Generate Invoice (P-033)
    MV->>MV: Issue Invoice (P-034)
    MV->>C: Deliver Invoice (P-036)
    
    C->>MV: View Invoice Online
    C->>B: Make Payment
    
    B->>MV: Payment Notification
    MV->>MV: Record Payment (P-045)
    MV->>MV: Allocate to Invoice (P-046)
    
    alt Full Payment
        MV->>MV: Mark Invoice PAID
    else Partial Payment
        MV->>MV: Keep Invoice PARTIALLY_PAID
        MV->>MV: Create Collection Case (P-051)
    else Overpayment
        MV->>MV: Credit Customer Ledger
    end
    
    MV->>GL: Post to General Ledger (P-056)
    MV->>C: Send Receipt
```

## D-013: Month Close Process (P-059) — Activity + Decision

```mermaid
graph TD
    subgraph "Finance Team"
        MC1[Begin Month Close] --> MC2[Post Recurring Journals]
        MC2 --> MC3[Run Trial Balance]
        MC3 --> MC4{In Balance?}
        MC4 -->|No| MC5[Investigate Discrepancy]
        MC5 --> MC6[Post Correcting Entry]
        MC6 --> MC3
        MC4 -->|Yes| MC7[Run Financial Reports]
        MC7 --> MC8{Reports Valid?}
        MC8 -->|No| MC5
        MC8 -->|Yes| MC9[Generate P&L]
        MC9 --> MC10[Generate Balance Sheet]
        MC10 --> MC11[Generate Cash Flow]
        MC11 --> MC12[Director Review]
    end
    
    subgraph "Finance Director"
        MC12 --> MC13{Approve?}
        MC13 -->|No| MC5
        MC13 -->|Yes| MC14[Lock Period]
    end
    
    subgraph "System"
        MC14 --> MC15[Archive Period Data]
        MC15 --> MC16[Notify Stakeholders]
    end
    
    style MC14 fill:#c8e6c9
    style MC4 fill:#fff9c4
    style MC13 fill:#fff9c4
```

## D-014: Collection Lifecycle (P-051 to P-054) — Swimlane

```mermaid
graph TD
    subgraph "System (Auto)"
        COL1[Invoice Overdue 30d] --> COL2{Send Reminder}
        COL2 --> COL3[Send SMS/Email Reminder]
        COL3 --> COL4{Payment Received?}
        COL4 -->|Yes| COL5[Close Case]
        COL4 -->|No| COL6[Invoice Overdue 60d]
        COL6 --> COL7[Send Final Warning]
        COL7 --> COL8{Payment Received?}
        COL8 -->|Yes| COL5
        COL8 -->|No| COL9[Create CollectionCase]
    end
    
    subgraph "Collection Officer"
        COL9 --> COL10[Case Assigned]
        COL10 --> COL11[Visit Customer]
        COL11 --> COL12[Discuss Payment]
        COL12 --> COL13{Agreement?}
        COL13 -->|Promise to Pay| COL14[Record Promise]
        COL14 --> COL15{Kept Promise?}
        COL15 -->|Yes| COL5
        COL15 -->|No| COL16[Escalate]
        COL13 -->|Refuses| COL16
    end
    
    subgraph "Manager"
        COL16 --> COL17[Review Case]
        COL17 --> COL18{Decision}
        COL18 -->|Legal| COL19[Send to Legal]
        COL18 -->|Write-off| COL20[Write-off Debt]
        COL18 -->|Payment Plan| COL21[Setup Plan]
    end
    
    style COL5 fill:#c8e6c9
    style COL16 fill:#ffcdd2
```

## D-015: Login Flow (P-073) — Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as API Gateway
    participant AUTH as Auth Service
    participant MFA as MFA Service
    participant SESS as Session Store
    
    U->>FE: Enter Credentials
    FE->>API: POST /api/auth/login
    API->>AUTH: Validate Password
    
    alt Invalid Password
        AUTH->>API: Increment Attempts
        API->>FE: 401 Unauthorized
        FE->>U: Show Error
    else Valid Password
        AUTH->>AUTH: Check MFA Required
        alt MFA Required
            AUTH->>FE: Challenge MFA
            FE->>U: Prompt for MFA Code
            U->>FE: Enter MFA Code
            FE->>MFA: Verify TOTP
            MFA->>AUTH: Valid
        end
        AUTH->>SESS: Create Session
        AUTH->>FE: Return JWT + Refresh Token
        FE->>U: Redirect to Dashboard
    end
```

## D-016: Meter Replacement (P-003) — Swimlane

```mermaid
graph TD
    subgraph "Customer Service"
        MR1[Receive Replacement Request] --> MR2[Verify Customer]
        MR2 --> MR3[Schedule Replacement]
    end
    
    subgraph "Meter Operations"
        MR4[Assign New Meter] --> MR5[Dispatch Field Tech]
    end
    
    subgraph "Field Technician"
        MR5 --> MR6[Arrive On-site]
        MR6 --> MR7[Verify Meter Location]
        MR7 --> MR8[Record Final Reading]
        MR8 --> MR9[Remove Old Meter]
        MR9 --> MR10[Install New Meter]
        MR10 --> MR11[Seal New Meter]
        MR11 --> MR12[Record New Reading]
        MR12 --> MR13[Test Communication]
    end
    
    subgraph "System"
        MR13 --> MR14[Update Meter Status]
        MR14 --> MR15[Create Replacement Record]
        MR15 --> MR16[Notify Customer]
        MR16 --> MR17[Notify Billing]
    end
    
    style MR8 fill:#fff9c4
    style MR13 fill:#c8e6c9
```

## Event Flow Mapping

```mermaid
graph LR
    subgraph "Domain Events"
        MC[MeterCreated] --> ME[MeterEvent]
        MR[MeterReadingReceived] --> ME
        ME --> AL[Alert Engine]
        ME --> AI[AI RCA]
        
        IG[InvoiceGenerated] --> GL[GL Posting]
        PR[PaymentReceived] --> GL
        PR --> AL
        
        SYNC[SyncRequired] --> SYNCJ[SyncJob]
        BC[BillCycleDue] --> BE[BillExecution]
    end
    
    subgraph "Integration Events"
        WEB[Webhook Event] --> WEBH[Webhook Delivery]
        ERP[ERP Sync Required] --> ERPS[ERP Sync Job]
        NOTIF[Notification Required] --> NOTIFD[Notification Delivery]
    end
    
    style MC fill:#e3f2fd
    style PR fill:#c8e6c9
    style IG fill:#fff9c4
```

## Process Dependency Graph (Communication)

```mermaid
graph TD
    P021[Customer Registration] --> P026[Contract Creation]
    P001[Meter Registration] --> P002[Meter Assignment]
    P021 --> P002
    P026 --> P002
    
    P002 --> P011[Reading Import]
    P011 --> P014[Reading Validation]
    P014 --> P018[Consumption Calculation]
    P018 --> P031[Bill Cycle Execution]
    P031 --> P033[Invoice Generation]
    P034[Invoice Approval] --> P036[Invoice Distribution]
    P033 --> P045[Payment Registration]
    P045 --> P046[Payment Allocation]
    
    P033 --> P051[Collection Assignment]
    P051 --> P052[Collection Visit]
    
    P033 --> P056[GL Posting]
    P045 --> P056
    P056 --> P059[Month Close]
    
    style P001 fill:#e1f5fe
    style P031 fill:#c8e6c9
    style P056 fill:#fff9c4
    style P059 fill:#ffccbc
```
