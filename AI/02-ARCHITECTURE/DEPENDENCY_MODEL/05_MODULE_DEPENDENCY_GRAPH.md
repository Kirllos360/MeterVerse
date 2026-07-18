# 05 — Module Dependency Graph

**Version:** 1.0.0  
**Purpose:** Every module's dependencies, shared services, components, APIs, permissions, and events.

---

## Module Dependency Matrix

| Module | Dependencies | Shared Services | Shared Components | Shared APIs | Shared Permissions | Shared Events |
|--------|-------------|----------------|-----------------|------------|-------------------|--------------|
| **Authentication** | None | AuthService, RoleService | LoginPage, RegisterPage, RoleGuard | POST /auth/login, POST /auth/refresh | All | auth.login.success, auth.login.failure, auth.access.denied |
| **Customer Management** | Auth, Location, Project | CustomerService, CustomerSearchService | CustomerWorkspace, CustomerExplorer, CustomerCard | GET/POST/PUT/DELETE /customers | customer:read, manage, write | customer.created, updated, transferred, merged, archived |
| **Meter Management** | Auth, Customer, Location, Project | MeterService, MeterStateService | MeterWorkspace, MeterExplorer, MeterCard | GET/POST/PUT/DELETE /meters | meter:read, write, manage, assign, terminate | meter.installed, assigned, activated, replaced, archived |
| **SIM Management** | Auth, Meter | SimCardService | SimCardExplorer, SimCardPanel | GET/POST /sim-cards, GET /sim-eligibility | sim:read, write, manage | sim.assigned, released, retired |
| **Reading Management** | Auth, Meter, Customer | ReadingService, ReadingValidationService | ReadingExplorer, ReadingTimeline, ConsumptionWidget | GET/POST /readings, POST /readings/validate, GET /readings/review-queue | reading:read, write, approve | reading.created, approved, rejected, corrected, anomaly.detected |
| **Billing** | Auth, Customer, Meter, Reading, Tariff | BillingService, BillingApplicationService, TariffEngine, PenaltyService | InvoiceWorkspace, InvoiceExplorer, PaymentWorkspace, PaymentExplorer | POST /billing/invoices, POST /billing/payments, GET /billing/tariffs | invoice:manage, read, write, issue, cancel; payment:manage, read, write, reverse | invoice.generated, issued, cancelled, reversed, adjusted; payment.received, reversed |
| **Collections** | Auth, Customer, Invoice, Payment | CollectionsService, AgingService | CollectionsDashboard, CollectionWidget | GET /collections/aging, GET /collections/dashboard | collections (via invoice/payment permissions) | collector.assigned |
| **Tariff Management** | Auth, Project | TariffStudioService | TariffStudioPage | GET/POST /tariffs, POST /tariffs/simulate | tariff:manage | tariff.changed |
| **Wallet** | Auth, Customer | WalletService | WalletTab | GET /wallet, POST /wallet/credit/debit/transfer | finance+ | — |
| **Notification** | Auth, User | NotificationService | NotificationCenter, ToastManager | GET/PATCH /notifications | notification:send | (all domain events publish notifications) |
| **Ticketing** | Auth, Customer (optional) | TicketService | TicketExplorer, TicketBoard | GET/POST /tickets | ticket:read, manage | — |
| **Reporting** | All modules | ReportGenerator | ReportPage, ReportCard | GET /reports, POST /reports/generate | report:read, manage | — |
| **Audit** | All modules | AuditService, AuditLogService | AuditLogPage | GET /audit/logs, GET /audit/export | audit:view | (all domain events are audited) |
| **Search** | Customer, Meter, Invoice, Payment | GlobalSearchService | SearchDialog | GET /search | (inherits from searched entities) | — |
| **Upload** | Auth, Project | UploadService, ImportService | UploadCenterPage | POST /upload/*, GET /upload/templates | config:manage | import.completed, import.failed |
| **Synchronization** | Auth, Project, Area | SyncService, SymbiotService | SyncGatewayPage | POST /sync/meters, GET /sync/status | admin:access | sync.started, completed, failed; polling.started, completed, failed |
| **Administration** | Auth, All modules | AdminService, ConfigService | AdminPage, DatabaseAdminPage, SettingsPage | GET /admin/*, GET /settings | admin:access | — |
| **KPI Dashboard** | Customer, Meter, Reading, Invoice, Payment | KPIService | DashboardHero, KPIStrip, WidgetGrid | GET /kpi/executive, collections, utilities | dashboard:read | — |
| **Portal** | Auth, Customer | PortalService | CustomerPortalPage | GET /portal/* | customer (self) | — |
| **Runtime** | All modules | RuntimeCoordinator, RuntimeGateway, RuntimeEventBus, GraphEngine, IntelligenceService | ControlCenterPage | GET /runtime/*, GET /dashboard/runtime, POST /gateway/* | admin:access (super_admin+) | runtime.* (30+ infrastructure events) |
