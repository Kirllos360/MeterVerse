# Enterprise State Machines

**File:** `planning/051_ENTERPRISE_PROCESS_ARCHITECTURE/08_STATE_MACHINES/PROCESS_STATE_MACHINES.md`

---

## 1. Meter Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> STOCK: Registered
    STOCK --> ASSIGNED: Assigned to customer
    ASSIGNED --> INSTALLED: Field installation
    INSTALLED --> ACTIVE: Commissioning verified
    ACTIVE --> MAINTENANCE: Fault/calibration
    MAINTENANCE --> ACTIVE: Repaired
    ACTIVE --> RETIRED: End of life
    MAINTENANCE --> RETIRED: Beyond repair
    RETIRED --> [*]: Archived
    
    state ACTIVE {
        [*] --> READING
        READING --> VALIDATING
        VALIDATING --> BILLING
    }
```

## 2. Reading Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING: Reading received
    PENDING --> VALIDATING: Start validation
    VALIDATING --> APPROVED: All checks pass
    VALIDATING --> FLAGGED: Spike/drop detected
    FLAGGED --> REJECTED: Manual review fail
    FLAGGED --> APPROVED: Manual review pass
    APPROVED --> BILLED: Used in invoice
    BILLED --> [*]: Archived after retention
    
    state VALIDATING {
        [*] --> CHECK_SPIKE
        CHECK_SPIKE --> CHECK_DROP
        CHECK_DROP --> CHECK_ZERO
        CHECK_ZERO --> CHECK_THRESHOLD
        CHECK_THRESHOLD --> [*]
    }
```

## 3. Invoice Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Generated
    DRAFT --> PENDING_APPROVAL: Submit for approval
    PENDING_APPROVAL --> DRAFT: Rejected
    PENDING_APPROVAL --> APPROVED: Approved
    APPROVED --> ISSUED: immutability lock
    ISSUED --> PAID: Full payment received
    ISSUED --> PARTIALLY_PAID: Partial payment
    PARTIALLY_PAID --> PAID: Remaining paid
    ISSUED --> OVERDUE: Past due date
    OVERDUE --> COLLECTIONS: Assigned to collector
    ISSUED --> CANCELLED: Cancellation request
    CANCELLED --> CREDIT_NOTE: Credit issued
    PAID --> [*]: Archived
    CREDIT_NOTE --> [*]: Archived
```

## 4. Payment Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING: Payment initiated
    PENDING --> PROCESSING: Gateway processing
    PROCESSING --> COMPLETED: Success
    PROCESSING --> FAILED: Gateway error
    COMPLETED --> ALLOCATED: Auto-allocated to invoices
    COMPLETED --> PARTIALLY_ALLOCATED: Partial allocation
    COMPLETED --> REVERSED: Reversal request
    COMPLETED --> REFUNDED: Refund processed
    REFUNDED --> [*]: Archived
    FAILED --> [*]: Logged
```

## 5. Collection Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> OPEN: Invoice overdue
    OPEN --> IN_PROGRESS: Assigned to collector
    IN_PROGRESS --> CONTACTED: First contact
    CONTACTED --> PROMISE_TO_PAY: Promise received
    PROMISE_TO_PAY --> PAID: Payment received
    PROMISE_TO_PAY --> BROKEN: Promise broken
    BROKEN --> ESCALATED: Escalated
    CONTACTED --> ESCALATED: No resolution
    ESCALATED --> LEGAL: Legal action
    PAID --> CLOSED: Case resolved
    LEGAL --> CLOSED: Case resolved
    ESCALATED --> CLOSED: Write-off
    CLOSED --> [*]: Archived
```

## 6. Accounting Period State Machine

```mermaid
stateDiagram-v2
    [*] --> OPEN: Period starts
    OPEN --> CLOSING: Initiate close
    CLOSING --> OPEN: Close failed
    CLOSING --> CLOSED: Close successful
    CLOSED --> LOCKED: 30 days after close
    LOCKED --> [*]: Archived
    
    state CLOSING {
        [*] --> POST_ADJUSTMENTS
        POST_ADJUSTMENTS --> RUN_TRIAL_BALANCE
        RUN_TRIAL_BALANCE --> REVIEW_ANOMALIES
        REVIEW_ANOMALIES --> GENERATE_REPORTS
        GENERATE_REPORTS --> [*]
    }
```

## 7. Synchronization State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING: Sync scheduled
    PENDING --> VALIDATING: Start sync
    VALIDATING --> EXTRACTING: Source validated
    EXTRACTING --> TRANSFORMING: Data extracted
    TRANSFORMING --> LOADING: Transformed
    LOADING --> COMPLETED: Loaded successfully
    LOADING --> CONFLICT: Conflict detected
    CONFLICT --> RESOLVING: Auto/manual resolution
    RESOLVING --> COMPLETED: Resolved
    EXTRACTING --> FAILED: Connection error
    TRANSFORMING --> FAILED: Transformation error
    FAILED --> PENDING: Retry scheduled
```

## 8. User Registration & Approval State Machine

```mermaid
stateDiagram-v2
    [*] --> REGISTERED: User submits
    REGISTERED --> EMAIL_VERIFIED: Email confirmed
    EMAIL_VERIFIED --> APPROVED: Admin approval
    APPROVED --> ACTIVE: Activated
    ACTIVE --> SUSPENDED: Admin action
    SUSPENDED --> ACTIVE: Reinstated
    ACTIVE --> LOCKED: Too many attempts
    LOCKED --> ACTIVE: Admin unlock
    ACTIVE --> ARCHIVED: Deleted
```

## State Machine Summary

| Machine | States | Transitions | Terminal States |
|---------|--------|-------------|-----------------|
| Meter Lifecycle | 7 | 10 | RETIRED |
| Reading Lifecycle | 7 | 10 | BILLED |
| Invoice Lifecycle | 10 | 14 | PAID, CANCELLED, CREDIT_NOTE |
| Payment Lifecycle | 8 | 10 | REFUNDED, FAILED |
| Collection Lifecycle | 10 | 12 | CLOSED |
| Accounting Period | 5 | 6 | LOCKED |
| Synchronization | 8 | 12 | COMPLETED, FAILED |
| User Registration | 7 | 8 | ARCHIVED |
