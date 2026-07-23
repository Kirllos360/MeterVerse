# Domain Map

## Purpose
Every domain in MeterVerse, with links to models, pages, APIs, components, permissions, tests, planning, and documentation.

---

## Customer Domain
| Aspect | Links |
|--------|-------|
| **Models** | Customer, CustomerContact, CustomerMeter |
| **Pages** | GenericAdminPage (Customers), CustomerDetailPage |
| **APIs** | GET/POST /api/customers, GET/PUT /api/customers/:id |
| **Components** | CustomerMeterGrid, ContactList, CustomerStatusBadge |
| **Permissions** | customers_view, customers_add, customers_edit, customers_activate, customers_deactivate, customers_terminate, customers_archive |
| **Planning** | W01 (42a), W03 (44a-c), W07 (48a-d) |

## Meter Domain
| Aspect | Links |
|--------|-------|
| **Models** | Meter, MeterConnection, MeasurementPoint, MeasPointResType |
| **Pages** | GenericAdminPage (Meters), MeterDetailPage |
| **APIs** | GET/POST /api/meters, GET/PUT /api/meters/:id |
| **Components** | MeterStatusBadge, MeterReadingGrid, MeterTypeSelector |
| **Permissions** | meters_view, meters_add, meters_edit, meters_activate, meters_deactivate, meters_terminate |
| **Planning** | W01 (42a), W08 (49a-c), W09 (50d) |

## Reading Domain
| Aspect | Links |
|--------|-------|
| **Models** | Reading, Result, MPRT, ResultM, ResultType, Quantity |
| **Pages** | GenericAdminPage (Readings) |
| **APIs** | GET/POST /api/readings, /api/results |
| **Components** | ReadingChart, ReadingTable |
| **Permissions** | readings_view, readings_add, readings_edit |
| **Planning** | W01 (42a), W08 (49a), W10 (51d) |

## Billing Domain
| Aspect | Links |
|--------|-------|
| **Models** | Invoice, InvoiceItem, BillCycle, BillRun |
| **Pages** | GenericAdminPage (Invoices), InvoiceDetailPage |
| **APIs** | GET/POST /api/invoices, /api/bill-runs |
| **Components** | InvoiceTable, InvoiceStatusBadge, BillRunPanel |
| **Permissions** | invoices_view, invoices_add, invoices_edit, invoices_cancel, invoices_reopen |
| **Planning** | W01 (42f), W03 (44a-d), W07 (48a), W09 (50d) |

## Payment Domain
| Aspect | Links |
|--------|-------|
| **Models** | Payment, PaymentGateway, PaymentTransaction |
| **Pages** | GenericAdminPage (Payments) |
| **APIs** | GET/POST /api/payments, /api/payment-gateways |
| **Components** | PaymentForm, PaymentHistoryTable |
| **Permissions** | payments_view, payments_add, payments_edit, payments_adjust |
| **Planning** | W01 (42f), W07 (48c) |

## Finance Domain
| Aspect | Links |
|--------|-------|
| **Models** | CustomerLedger, AccountantLedger (to be built) |
| **Pages** | (planned) |
| **APIs** | (planned) |
| **Permissions** | (to be defined) |
| **Planning** | W07 (48a-e) |

## Tariff Domain
| Aspect | Links |
|--------|-------|
| **Models** | Tariff, TariffRate, TariffTier, ChargeRule |
| **Pages** | GenericAdminPage (Tariffs - planned) |
| **APIs** | (planned) |
| **Permissions** | tariffs_view, tariffs_add, tariffs_edit, tariffs_approve |
| **Planning** | W03 (44a) |

## Organization Domain
| Aspect | Links |
|--------|-------|
| **Models** | Organization, Area, Project |
| **Pages** | GenericAdminPage (Organizations, Areas, Projects) |
| **APIs** | GET/POST /api/organizations, /api/areas, /api/projects |
| **Components** | AreaSelector, OrganizationTree |
| **Permissions** | organizations_view, organizations_edit, areas_view, areas_edit |
| **Planning** | W01 (42a), W09 (50a, 50d) |

## User Domain
| Aspect | Links |
|--------|-------|
| **Models** | User, Role, UserRole, UserPreference |
| **Pages** | GenericAdminPage (Users), LoginPage |
| **APIs** | GET/POST /api/users, /api/auth/* |
| **Components** | UserAvatar, RoleSelector, UserForm |
| **Permissions** | users_view, users_add, users_edit, users_deactivate, roles_view, roles_edit |
| **Planning** | W01 (42a, 42e), W02 (43a) |

## Notification Domain
| Aspect | Links |
|--------|-------|
| **Models** | Notification, NotificationPreference |
| **Pages** | NotificationPanel (frontend) |
| **APIs** | GET/POST /api/notifications, WebSocket events |
| **Components** | NotificationBell, NotificationList |
| **Permissions** | notifications_view, notifications_send |
| **Planning** | W02 (42b, 43b), W10 (51c) |

## AI Domain
| Aspect | Links |
|--------|-------|
| **Models** | KpiResult, Alert, Prediction (to be built) |
| **Pages** | AIDashboard (planned) |
| **APIs** | (planned) |
| **Permissions** | ai_view, ai_configure |
| **Planning** | W05 (46a-d), W10 (51a-d) |

## Workflow Domain
| Aspect | Links |
|--------|-------|
| **Models** | Workflow, WorkflowState, WorkflowTransition |
| **Pages** | (planned) |
| **APIs** | Workflow engine (state machines) |
| **Permissions** | workflows_view, workflows_edit |
| **Planning** | W01 (42e) |

## Reports Domain
| Aspect | Links |
|--------|-------|
| **Models** | ReportDefinition, KpiDefinition, KpiTarget |
| **Pages** | GenericAdminPage (Reports, KPIs) |
| **APIs** | GET /api/kpis, /api/reports (planned) |
| **Components** | KpiCard, ReportChart |
| **Permissions** | reports_view, reports_export, reports_configure |
| **Planning** | W01 (42f), W05 (46b) |

## Security Domain
| Aspect | Links |
|--------|-------|
| **Models** | AuditLog, Permission, Role |
| **Pages** | GenericAdminPage (Audit Logs, Permissions) |
| **APIs** | GET /api/audit-logs |
| **Components** | AuditLogTable |
| **Permissions** | audit_view, audit_export |
| **Planning** | W01 (42e), W04 (45b) |

## Settings Domain
| Aspect | Links |
|--------|-------|
| **Models** | SystemConfig (planned) |
| **Pages** | SystemConfigHub, AdminPanelPage |
| **APIs** | (planned) |
| **Components** | ConfigEditor, SettingToggle |
| **Permissions** | system_config_view, system_config_edit |
| **Planning** | W02 (43d) |

## Integration Domain
| Aspect | Links |
|--------|-------|
| **Models** | Integration, IntegrationLog (planned) |
| **Pages** | GenericAdminPage (Integrations - planned) |
| **APIs** | SYMBIOT sync (planned) |
| **Components** | IntegrationStatus, SyncPanel |
| **Permissions** | integrations_view, integrations_configure |
| **Planning** | W08 (49a), W05 (46d) |

---
*Last updated: 2026-07-23*
