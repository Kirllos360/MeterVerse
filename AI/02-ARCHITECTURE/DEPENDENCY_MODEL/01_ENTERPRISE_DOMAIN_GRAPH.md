# 01 — Enterprise Domain Graph

**Version:** 1.0.0  
**Purpose:** Complete business domain map of MeterVerse. Every entity, relationship, lifecycle, and rule.

---

## 1. Complete Domain Hierarchy

```
Organization (EOX Enterprise)
│
├── Workspace
│   ├── Operations
│   ├── Billing
│   ├── CRM
│   ├── Administration
│   ├── Analytics
│   ├── Monitoring
│   ├── Field Operations
│   └── Executive
│
├── Project (community/development)
│   ├── Area (geographic region)
│   │   ├── Building
│   │   │   └── Floor
│   │   │       └── Unit
│   │   │           ├── Customer (occupant/owner)
│   │   │           │   ├── UtilityAccount
│   │   │           │   │   ├── Meter (physical device)
│   │   │           │   │   │   ├── SIMCard (communication)
│   │   │           │   │   │   ├── Reading (measurement)
│   │   │           │   │   │   │   ├── Consumption (calculated)
│   │   │           │   │   │   │   ├── ReadingReview (approval)
│   │   │           │   │   │   │   └── ReadingException (anomaly)
│   │   │           │   │   │   ├── MeterMaintenance (history)
│   │   │           │   │   │   ├── MeterSeal (security)
│   │   │           │   │   │   └── MeterCertification (calibration)
│   │   │           │   │   ├── Tariff (pricing)
│   │   │           │   │   ├── Invoice (billing)
│   │   │           │   │   │   ├── InvoiceLine (details)
│   │   │           │   │   │   ├── Payment (received money)
│   │   │           │   │   │   │   └── PaymentAllocation (distribution)
│   │   │           │   │   │   └── InvoiceAdjustment (correction)
│   │   │           │   │   ├── LedgerEntry (financial trail)
│   │   │           │   │   ├── Wallet (prepaid balance)
│   │   │           │   │   │   └── WalletTransaction (activity)
│   │   │           │   │   └── Settlement (manual adjustment)
│   │   │           │   ├── Alert (notifications)
│   │   │           │   ├── Ticket (support)
│   │   │           │   │   └── TicketComment (thread)
│   │   │           │   └── Document (attachments)
│   │   │           └── UnitType (taxonomy)
│   │   ├── ProjectConfig (settings)
│   │   │   ├── Threshold (reading limits)
│   │   │   ├── BillingPeriod (cycle)
│   │   │   └── WaterDifference (policy)
│   │   └── User (operator)
│   │       ├── Role (permissions)
│   │       └── Notification (in-app)
│   ├── BillCycle (billing state machine)
│   └── KPIData (aggregated metrics)
│
├── AuditLog (all changes)
├── SyncStatus (Symbiot integration)
├── ImportRecord (bulk operations)
└── ReportJob (generated reports)
```

---

## 2. Relationship Definitions

### Organization → Workspace
- **Parent:** Organization
- **Children:** Workspace (8 types)
- **Dependencies:** None (root entity)
- **Ownership:** Organization owns all workspaces
- **Lifecycle:** Created with platform. Never deleted.
- **Permissions:** super_admin can manage workspaces
- **Deletion Rules:** Cannot delete. Can archive.
- **Archive Rules:** Archived workspaces hidden from non-admin users.
- **Search Rules:** Workspace name searchable in global search.

### Workspace → Project
- **Parent:** Workspace
- **Children:** Project
- **Dependencies:** Workspace must exist
- **Ownership:** Workspace can have multiple projects
- **Lifecycle:** Projects are created, activated, completed, archived
- **Permissions:** area_manager can manage their area's projects
- **Deletion Rules:** Can delete only if no active meters, customers, or invoices
- **Archive Rules:** Archived projects hide all child data from non-admin views

### Project → Area
- **Parent:** Project
- **Children:** Area (1 project = 1 area in current model)
- **Dependencies:** Project must exist
- **Ownership:** Project owns all child entities
- **Lifecycle:** Area inherits project lifecycle
- **Permissions:** area_manager role scoped to specific area
- **Deletion Rules:** Cannot delete area with active buildings

### Area → Building → Floor → Unit
- **Parent:** Area
- **Children:** Building → Floor → Unit (4-level hierarchy)
- **Dependencies:** Each level requires parent
- **Ownership:** Area owns all buildings
- **Lifecycle:** Units occupied→vacant→under-maintenance→archived
- **Permissions:** operator can view all; area_manager can edit
- **Deletion Rules:** Cannot delete unit with active meter assignment

### Unit → Customer
- **Parent:** Unit
- **Children:** Customer (occupant/owner)
- **Dependencies:** Unit must exist
- **Ownership:** Customer is assigned to unit, not owned by it
- **Lifecycle:** Customer active→suspended→archived
- **Permissions:** customer:read (viewer+), customer:manage (admin+)
- **Deletion Rules:** Cascade: delete customer removes linked ledger, wallet, alerts, tickets. Does NOT cascade to invoices, payments, meters (reassign to unit).
- **Archive Rules:** Archived customer hides from search, keeps financial history

### Customer → UtilityAccount → Meter
- **Parent:** Customer
- **Children:** UtilityAccount → Meter
- **Dependencies:** Customer must exist
- **Ownership:** Customer owns utility accounts
- **Lifecycle:** Meter available→assigned→active→offline→faulty→replaced→terminated→retired
- **Permissions:** meter:read (viewer+), meter:assign (operator+), meter:terminate (admin+)
- **Deletion Rules:** Cannot delete meter with pending readings or unpaid invoices
- **Archive Rules:** Retired meters are read-only, kept for historical accuracy

### Meter → SIMCard
- **Parent:** Meter
- **Children:** SIMCard (assigned to meter)
- **Dependencies:** Meter must exist for assignment
- **Ownership:** SIM is assigned, not owned. Can be reassigned after cooldown.
- **Lifecycle:** available→assigned→active→suspended→old→reusable→retired
- **Permissions:** sim:manage (admin+)
- **Deletion Rules:** Cannot delete SIM with active assignment. Must terminate first.

### Meter → Reading → Consumption
- **Parent:** Meter
- **Children:** Reading → Consumption (computed)
- **Dependencies:** Meter must be active
- **Ownership:** Reading belongs to meter
- **Lifecycle:** pending→valid→suspicious→corrected→rejected→approved
- **Permissions:** reading:read (viewer+), reading:write (operator+), reading:approve (admin+)
- **Deletion Rules:** Cannot delete reading that has been billed. Mark as corrected instead.
- **Import Rules:** Readings can be bulk-imported from CSV/Excel/Symbiot

### CustomerUtilityAccount → Tariff
- **Parent:** CustomerUtilityAccount
- **Children:** Tariff (applied to account)
- **Dependencies:** Account must exist, tariff must be active for that period
- **Ownership:** Tariff is applied, not owned. Can be changed.
- **Lifecycle:** active→superseded (when new version takes effect)
- **Permissions:** tariff:manage (admin+)
- **Deletion Rules:** Cannot delete tariff that has been used for billing. Can supersede with new version.

### CustomerUtilityAccount → Invoice → Payment
- **Parent:** CustomerUtilityAccount
- **Children:** Invoice → Payment → PaymentAllocation
- **Dependencies:** Readings + tariff must exist for period
- **Ownership:** Invoice belongs to account
- **Lifecycle:** draft→issued→partially_paid→paid→overdue→cancelled
- **Permissions:** invoice:read (viewer+), invoice:issue (admin+), invoice:cancel (admin+)
- **Deletion Rules:** NEVER delete invoices. Cancel or reverse only.
- **Archive Rules:** Paid invoices are immutable. Unpaid can be cancelled.

### Customer → Wallet → WalletTransaction
- **Parent:** Customer
- **Children:** Wallet → WalletTransaction
- **Dependencies:** Customer must exist
- **Ownership:** Customer owns wallet
- **Lifecycle:** Wallet active→frozen→closed
- **Permissions:** Customer can view own wallet. admin can credit/debit.
- **Deletion Rules:** Never delete wallet transactions. Append-only.

### Customer → LedgerEntry
- **Parent:** Customer
- **Children:** LedgerEntry
- **Dependencies:** Any financial event (invoice, payment, adjustment)
- **Ownership:** Ledger belongs to customer
- **Lifecycle:** Append-only. Never modified or deleted.
- **Permissions:** finance+ can view all. Customer can view own.
- **Audit Rules:** Every ledger entry is immutable. Running balance computed from chain.

### Any Entity → Alert
- **Parent:** Any entity (meter, customer, invoice, payment)
- **Children:** Alert
- **Dependencies:** Source entity must exist
- **Ownership:** Alert belongs to source entity
- **Lifecycle:** triggered→acknowledged→resolved
- **Permissions:** alert:read (operator+), alert:manage (admin+)
- **Deletion Rules:** Never delete resolved alerts. Archive after 90 days.

### Any Entity → Ticket
- **Parent:** Any entity (customer, meter, invoice)
- **Children:** Ticket → TicketComment
- **Dependencies:** Source entity should exist (optional)
- **Ownership:** Ticket can be standalone or linked
- **Lifecycle:** open→in_progress→resolved→closed
- **Permissions:** ticket:read (support+), ticket:manage (admin+)

---

## 3. Domain Boundary Rules

| Domain | Boundaries | Cross-Domain Operations |
|--------|-----------|------------------------|
| Customer Management | Customer CRUD, ledger, wallet, ownership | Creates alerts, tickets. Consumes readings. |
| Meter Management | Meter lifecycle, SIM, maintenance | Creates readings, alerts. Consumes assignments. |
| Billing | Invoice generation, payments, collections | Consumes readings, tariffs. Creates ledger. |
| Collections | Aging, recovery, collector management | Consumes invoices. Creates alerts. |
| Reporting | Report generation, scheduling | Reads all domains. Creates no data. |
| Administration | Users, roles, settings, audit | Manages all domains. |
| Synchronization | Symbiot bridge, data import | Creates/updates meters, readings, customers. |
| Monitoring | Dashboards, KPIs, alerts | Reads all domains. Displays status. |
