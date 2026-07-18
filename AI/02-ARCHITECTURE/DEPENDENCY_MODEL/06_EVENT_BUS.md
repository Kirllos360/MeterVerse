# 06 — Enterprise Event Bus

**Version:** 1.0.0  
**Purpose:** Every enterprise event, its publisher, subscribers, priority, retry policy, audit, and notification rules.

---

## Domain Events

| Event | Publisher | Subscribers | Priority | Retry | Audit | Notification | Dashboard | History |
|-------|-----------|-------------|----------|-------|-------|-------------|-----------|---------|
| **CustomerCreated** | CustomerService | Notification, Audit, Search, KPI | P2 | 3x | ✅ | Welcome notification | Customer count KPI | Timeline |
| **CustomerUpdated** | CustomerService | Audit, Search | P3 | 2x | ✅ | — | — | Timeline |
| **CustomerTransferred** | CustomerService | Notification, Audit, Billing, Meter | P1 | 3x | ✅ | To both customers | Transfer count KPI | Timeline |
| **CustomerMerged** | CustomerService | Audit, Billing, Meter, Collection | P1 | 3x | ✅ | To admin | — | Timeline |
| **CustomerArchived** | CustomerService | Audit, Billing, Meter, Collection, Search | P2 | 3x | ✅ | To customer | — | Timeline |
| **MeterInstalled** | MeterService | Notification, Audit, KPI, Dashboard | P2 | 3x | ✅ | To customer | Active meter count KPI | Timeline |
| **MeterAssigned** | MeterService | Notification, Audit | P2 | 3x | ✅ | To customer | — | Timeline |
| **MeterActivated** | MeterService | Notification, Audit, KPI, Reading | P2 | 3x | ✅ | To customer | — | Timeline |
| **MeterReplaced** | MeterService | Notification, Audit, Billing, Reading | P1 | 3x | ✅ | To customer + technician | Replacement count KPI | Timeline |
| **MeterArchived** | MeterService | Audit, Search, Reading | P2 | 3x | ✅ | — | — | Timeline |
| **ReadingSubmitted** | ReadingService | Notification, Audit, KPI, Consumption | P2 | 3x | ✅ | — | Reading count KPI | Timeline |
| **ReadingReviewed** | ReadingService | Notification, Audit, Billing | P1 | 3x | ✅ | To operator | Review queue | Timeline |
| **ReadingAnomalyDetected** | ReadingService | Notification, Audit, Alert, Dashboard | P0 | 5x | ✅ | Alert to operator | Alert widget | Timeline |
| **ReadingBatchApproved** | ReadingService | Notification, Audit, Billing | P2 | 3x | ✅ | To operator | — | Timeline |
| **InvoiceGenerated** | BillingService | Notification, Audit, KPI, Dashboard, Collection | P2 | 3x | ✅ | To customer | Revenue KPI | Timeline |
| **InvoiceIssued** | BillingService | Notification, Audit, Collection | P2 | 3x | ✅ | To customer | — | Timeline |
| **InvoiceCancelled** | BillingService | Notification, Audit, Collection, Dashboard | P1 | 3x | ✅ | To customer + finance | Outstanding KPI | Timeline |
| **InvoiceAdjusted** | BillingService | Audit, Collection | P2 | 3x | ✅ | To finance | — | Timeline |
| **PaymentReceived** | PaymentService | Notification, Audit, KPI, Dashboard, Collection | P2 | 3x | ✅ | Receipt to customer | Collection rate KPI | Timeline |
| **PaymentReversed** | PaymentService | Notification, Audit, Collection, Dashboard | P1 | 3x | ✅ | To customer + finance | — | Timeline |
| **CollectorAssigned** | CollectionService | Notification, Audit | P2 | 2x | ✅ | To collector | — | — |
| **TariffChanged** | TariffService | Notification, Audit, Billing | P1 | 3x | ✅ | To affected customers | — | — |
| **ProjectArchived** | ProjectService | Notification, Audit, All modules | P1 | 3x | ✅ | To area manager | — | — |

---

## Infrastructure Events (Runtime)

| Event | Publisher | Subscribers | Priority | Retry | Description |
|-------|-----------|-------------|----------|-------|-------------|
| **service.registered** | RuntimeCoordinator | RuntimeDashboard, GraphEngine | P3 | 2x | New service registered |
| **service.activated** | RuntimeCoordinator | RuntimeDashboard, GraphEngine | P3 | 2x | Service accepting requests |
| **service.healthy** | HealthEngine | RuntimeDashboard | P3 | 1x | Health check passed |
| **service.degraded** | HealthEngine | RuntimeDashboard, Alert | P1 | 3x | Health score below threshold |
| **service.failed** | HealthEngine | RuntimeDashboard, Alert, Notification | P0 | 5x | Health below failure threshold |
| **workspace.ready** | Infrastructure | RuntimeDashboard | P3 | 2x | Workspace serving requests |
| **workspace.maintenance** | Infrastructure | RuntimeDashboard, Alert | P1 | 3x | Workspace in maintenance mode |
| **deployment.started** | DeploymentEngine | RuntimeDashboard | P2 | 2x | Deployment phase started |
| **deployment.completed** | DeploymentEngine | RuntimeDashboard | P2 | 2x | Deployment completed |
| **deployment.failed** | DeploymentEngine | RuntimeDashboard, Alert | P0 | 5x | Deployment failed |
| **configuration.changed** | ConfigService | RuntimeDashboard | P2 | 2x | Configuration updated |
| **sync.started** | SyncService | RuntimeDashboard | P2 | 2x | Symbiot sync started |
| **sync.completed** | SyncService | RuntimeDashboard, KPI | P2 | 2x | Sync completed |
| **sync.failed** | SyncService | RuntimeDashboard, Alert | P1 | 5x | Sync failed |
| **polling.completed** | PollingService | ReadingService | P2 | 2x | Automatic polling cycle done |
| **health.critical** | HealthEngine | RuntimeDashboard, Alert, Notification | P0 | 5x | System health critical |

---

## Event Bus Architecture

| Property | Rule |
|----------|------|
| **Delivery** | At-least-once. Events are persisted before publishing. |
| **Retry** | Exponential backoff: 1s, 5s, 30s, 5min, 30min. Max 5 retries. |
| **Dead Letter Queue** | After max retries, event moves to DLQ. Manual replay or discard. |
| **Idempotency** | Event handlers must be idempotent. Use event ID for deduplication. |
| **Ordering** | Events from same aggregate are ordered. Cross-aggregate ordering not guaranteed. |
| **Subscriptions** | Pull-based for subscribers. Push-based for real-time dashboards. |
| **Persistence** | Events retained for 30 days. Archived to long-term storage after. |
