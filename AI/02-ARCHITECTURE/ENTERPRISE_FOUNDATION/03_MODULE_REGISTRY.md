# Section 3 — Enterprise Module Registry

**Status:** PERMANENT — Every module must declare all fields.

---

## Module Declaration Template

Every module registers with:
```
Module: [Name]
Dependencies: [Module IDs]
APIs: [Endpoint list]
Events: [Event list]
Permissions: [Permission list]
Search: [Searchable fields]
Audit: [Audit level]
Import: [Supported import types]
Export: [Supported export formats]
Reports: [Available reports]
```

---

## Infrastructure Modules

### Database Module
- **Dependencies:** None
- **APIs:** Prisma schema, migrations
- **Events:** None
- **Permissions:** None
- **Search:** None
- **Audit:** None
- **Import:** None
- **Export:** None
- **Reports:** None

### Authentication Module
- **Dependencies:** Database, User
- **APIs:** POST /auth/login, POST /auth/refresh, POST /auth/logout, GET /auth/me, POST /auth/dev-login
- **Events:** auth.login.success, auth.login.failure, auth.access.denied
- **Permissions:** None (gate for all)
- **Search:** None
- **Audit:** ALL (every login/logout)
- **Import:** None
- **Export:** None
- **Reports:** Login activity report

### Permission Engine
- **Dependencies:** Database, Auth
- **APIs:** Internal (RolesGuard, CapabilityRegistry)
- **Events:** None
- **Permissions:** role:manage (super_admin)
- **Search:** None
- **Audit:** ALL
- **Import:** Roles from legacy
- **Export:** Role configuration
- **Reports:** Permission audit report

### Workflow Engine
- **Dependencies:** Database, Auth, Permission
- **APIs:** Internal (workflow.create, step.complete, canProceed)
- **Events:** workflow.started, step.completed, workflow.completed, workflow.blocked
- **Permissions:** Inherits from entity permissions
- **Search:** None
- **Audit:** ALL
- **Import:** None
- **Export:** Workflow status
- **Reports:** Workflow completion report

### Notification Engine
- **Dependencies:** User, Auth
- **APIs:** GET /notifications, PATCH /notifications/:id/read, PATCH /notifications/read-all
- **Events:** (subscribes to all domain events)
- **Permissions:** notification:send (admin+)
- **Search:** By title, date
- **Audit:** None
- **Import:** None
- **Export:** Notification history
- **Reports:** Notification delivery report

### Search Engine
- **Dependencies:** All entity modules
- **APIs:** GET /search?q=
- **Events:** None
- **Permissions:** Inherits from entity permissions
- **Search:** (is the search module)
- **Audit:** Search queries (admin only)
- **Import:** Full reindex
- **Export:** Search results (via API)
- **Reports:** Search usage report

### Audit Engine
- **Dependencies:** Database
- **APIs:** GET /audit/logs, GET /audit/export/csv, GET /audit/export/json
- **Events:** (subscribes to all events)
- **Permissions:** audit:view (admin+)
- **Search:** By actor, action, resource, date range
- **Audit:** (is the audit engine — every action is recorded)
- **Import:** Legacy audit logs
- **Export:** CSV, JSON
- **Reports:** Audit summary report

### Report Engine
- **Dependencies:** All entity modules, JasperReports
- **APIs:** GET /reports, POST /reports/generate
- **Events:** report.generated, report.failed
- **Permissions:** report:read (viewer+), report:manage (admin+)
- **Search:** By name, type, category
- **Audit:** ALL (every report generation)
- **Import:** Report templates
- **Export:** PDF, Excel, CSV
- **Reports:** (is the report engine)

### Import Engine
- **Dependencies:** All entity modules
- **APIs:** POST /upload/:entityType, POST /upload/template/:type
- **Events:** import.completed, import.failed
- **Permissions:** import (admin+)
- **Search:** Import history by type, date, status
- **Audit:** ALL
- **Import:** (is the import engine)
- **Export:** Error report
- **Reports:** Import summary report

### Export Engine
- **Dependencies:** Report Engine
- **APIs:** POST /downloads/table/csv, POST /downloads/table/pdf, GET /downloads/invoices/:id/pdf
- **Events:** export.completed
- **Permissions:** export (viewer+)
- **Search:** Export history
- **Audit:** ALL
- **Import:** None
- **Export:** (is the export engine)
- **Reports:** Export usage report

### Sync Engine
- **Dependencies:** Meter, Customer, Reading, Area
- **APIs:** POST /sync/meters/:areaCode, GET /sync/status/:areaCode
- **Events:** sync.started, sync.completed, sync.failed
- **Permissions:** sync (admin+)
- **Search:** Sync status by area
- **Audit:** ALL
- **Import:** Meters, Readings from Symbiot
- **Export:** Sync log
- **Reports:** Sync health report

### Migration Engine
- **Dependencies:** All entity modules
- **APIs:** POST /migration/start, GET /migration/status, POST /migration/rollback
- **Events:** migration.started, migration.completed, migration.failed
- **Permissions:** admin:access (super_admin only)
- **Search:** Migration history
- **Audit:** ALL
- **Import:** All entities from legacy
- **Export:** Migration report
- **Reports:** Migration summary

### Configuration Engine
- **Dependencies:** Database
- **APIs:** GET /settings, PATCH /settings
- **Events:** configuration.changed
- **Permissions:** configure (admin+)
- **Search:** By key
- **Audit:** ALL
- **Import:** Bulk config import
- **Export:** Config export
- **Reports:** Config audit report

---

## Business Modules

| Module | Dependencies | APIs | Events | Permissions | Search | Import | Export |
|--------|-------------|------|--------|-------------|--------|--------|--------|
| **Customer** | Project, Unit | CRUD + 360 + transfer + merge + statement | customer.* | customer:read/write/manage | ✅ Name, code, phone, email | ✅ CSV | ✅ CSV, PDF |
| **Meter** | Customer, Unit, SIM | CRUD + assign + replace + terminate + transition | meter.* | meter:read/write/manage/assign/terminate | ✅ Serial, type, status | ✅ CSV, Excel | ✅ CSV |
| **Reading** | Meter, Customer | CRUD + validate + approve + reject + review queue | reading.* | reading:read/write/approve | ✅ Meter serial, date | ✅ CSV, Excel | ✅ CSV |
| **SIM** | Meter (optional) | CRUD + eligibility + assign + release | sim.* | sim:read/write/manage | ✅ ICCID, MSISDN | ✅ CSV | ✅ CSV |
| **Invoice** | Customer, Meter, Tariff, Reading | CRUD + generate + issue + cancel + reverse + adjust + PDF | invoice.* | invoice:read/write/manage/issue/cancel | ✅ Number, customer, period | — | ✅ PDF, CSV |
| **Payment** | Customer, Invoice | CRUD + reverse + receipt | payment.* | payment:read/write/manage/reverse | ✅ Customer, date, amount | ✅ CSV | ✅ PDF, CSV |
| **Tariff** | Project | CRUD + version + simulate + tiers | tariff.* | tariff:manage | ✅ Name, type | — | ✅ CSV |
| **Wallet** | Customer | CRUD + credit + debit + transfer | — | finance+ | ✅ Customer | — | ✅ CSV |
| **Ledger** | Customer, Invoice, Payment | Read-only (append-only) | — | finance+ | ✅ Customer | — | ✅ CSV, PDF |
| **Settlement** | Customer, Invoice | CRUD + adjustments | — | finance+ | ✅ Customer | — | ✅ CSV |
| **BillCycle** | Project | CRUD + start + generate + post + cancel | — | billing:manage | ✅ Period, status | — | — |
| **Collections** | Invoice, Payment, Customer | Aging + dashboard + KPI | — | (inherits) | — | — | ✅ CSV |
| **Maintenance** | Meter | CRUD + schedule + complete | — | admin+ | ✅ Meter | — | — |
