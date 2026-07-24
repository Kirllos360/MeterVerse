# Architecture Traceability Matrix

| Task | API Endpoint | Database Model | Frontend Module | Service |
|------|:-----------:|:--------------:|:---------------:|:-------:|
| Auth | `POST /api/auth/login` | User, Session | LoginPage | auth-engine.js |
| Permissions | Middleware | Role, Permission | PermissionGuard | security.js |
| Audit | Middleware | AuditEntry | AuditLogPage | security.js |
| Workflow | Internal | WorkflowState | — | workflow-engine.js |
| Tariff | `/api/tariffs/*` | Tariff, TariffRate, TariffTier | GenericAdminPage | routes/tariffs.js |
| Bill Run | `/api/billing/runs/*` | BillRun, BillRunHistory | GenericAdminPage | routes/billing.js |
| Invoice | `/api/billing/invoices/*` | Invoice, InvoiceItem | InvoiceDetailPage | routes/billing.js |
| Payment | `/api/payments/*` | Payment, PaymentTransaction | PaymentsPage | routes/payments.js |
| Statement | `/api/payments/customers/:id/statement` | Customer, Invoice, Payment | CustomerDetailPage | routes/payments.js |
| Export | `/api/reports/export` | ExportLog | ReportsPage | routes/reports.js |
| WebSocket | ws:// | Session | WebSocketRuntime | websocket-gateway.js |
| Documents | `/api/documents/*` | StoredFile | GenericAdminPage | routes/documents.js |
| Cache | Internal | — | — | cache-engine.js |
| Circuit Breaker | Internal | — | — | circuit-breaker.js |
