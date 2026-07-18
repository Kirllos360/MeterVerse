# 08 — Permission Graph

**Version:** 1.0.0  
**Purpose:** Every object's permissions: view, add, edit, delete, approve, export, import, restore, archive, assign, transfer, sync, configure, override, admin.

---

## Permission Definitions

| Operation | Code | Level | Description |
|-----------|------|-------|-------------|
| View | :read | 1 | Can see the entity and its data |
| Add | :create | 2 | Can create new instances |
| Edit | :update | 2 | Can modify existing instances |
| Delete | :delete | 4 | Can permanently remove |
| Approve | :approve | 3 | Can approve workflow steps |
| Export | :export | 1 | Can export to CSV/Excel/PDF |
| Import | :import | 3 | Can bulk import |
| Restore | :restore | 5 | Can restore from archive |
| Archive | :archive | 3 | Can archive entities |
| Assign | :assign | 2 | Can assign entities (meter to customer) |
| Transfer | :transfer | 3 | Can transfer ownership |
| Synchronize | :sync | 3 | Can trigger sync operations |
| Configure | :configure | 4 | Can change configuration |
| Override | :override | 5 | Can override system warnings |
| Admin | :admin | 5 | Full administrative access |

---

## Entity Permission Matrix

| Entity | View | Add | Edit | Delete | Approve | Export | Import | Archive | Assign | Transfer | Configure |
|--------|------|-----|------|--------|---------|--------|--------|---------|--------|----------|-----------|
| Project | viewer+ | admin+ | admin+ | super_admin | — | viewer+ | admin+ | super_admin | — | — | admin+ |
| Area | viewer+ | admin+ | admin+ | super_admin | — | viewer+ | admin+ | super_admin | — | — | admin+ |
| Building | viewer+ | operator+ | operator+ | admin+ | — | viewer+ | admin+ | admin+ | — | — | — |
| Unit | viewer+ | operator+ | operator+ | admin+ | — | viewer+ | admin+ | admin+ | operator+ | — | — |
| Customer | viewer+ | operator+ | area_manager+ | admin+ | — | viewer+ | admin+ | admin+ | — | admin+ | — |
| Meter | viewer+ | operator+ | operator+ | admin+ | — | viewer+ | admin+ | admin+ | operator+ | — | — |
| SIM | viewer+ | operator+ | operator+ | admin+ | — | viewer+ | admin+ | admin+ | operator+ | — | — |
| Reading | viewer+ | operator+ | operator+ | admin+ | admin+ | viewer+ | admin+ | — | — | — | — |
| Tariff | admin+ | admin+ | admin+ | super_admin | admin+ | admin+ | super_admin | admin+ | — | — | admin+ |
| Invoice | viewer+ | admin+ | finance+ | super_admin | admin+ | viewer+ | — | — | — | — | — |
| Payment | viewer+ | finance+ | finance+ | super_admin | super_admin | viewer+ | admin+ | — | — | — | — |
| Wallet | viewer+ | admin+ | admin+ | — | — | viewer+ | — | — | — | — | — |
| Settlement | finance+ | finance+ | finance+ | super_admin | admin+ | finance+ | admin+ | — | — | — | — |
| User | admin+ | admin+ | admin+ | super_admin | — | admin+ | — | admin+ | — | — | admin+ |
| Role | super_admin | super_admin | super_admin | super_admin | — | super_admin | — | — | — | — | super_admin |
| Notification | self | admin+ | self | self | — | — | — | — | — | — | — |
| Alert | operator+ | system | operator+ | admin+ | operator+ | operator+ | — | — | — | — | — |
| Ticket | support+ | support+ | support+ | admin+ | — | support+ | — | — | support+ | — | — |
| Report | viewer+ | admin+ | admin+ | admin+ | — | viewer+ | — | — | — | — | admin+ |
| Audit | admin+ | system | — | — | — | admin+ | — | — | — | — | — |
| Settings | admin+ | admin+ | admin+ | super_admin | — | — | — | — | — | — | admin+ |
| Sync | operator+ | admin+ | — | — | — | operator+ | — | — | admin+ | — | admin+ |
| Import/Upload | admin+ | admin+ | — | — | — | — | admin+ | — | — | — | admin+ |

---

## Role Assignment

| Role | Level | Permissions |
|------|-------|-------------|
| super_admin | 100 | Everything |
| system_admin | 90 | Everything except organization-level config |
| admin | 80 | Full access within assigned areas |
| area_manager | 70 | Manage area projects, customers, meters |
| team_leader | 65 | Manage team, view area data |
| supervisor | 60 | Oversee operations, view all area data |
| operator | 55 | Daily operations, readings, basic customer management |
| technician | 50 | Field work: meter install, replace, maintain |
| finance | 45 | Financial operations, invoicing, payments |
| accountant | 40 | View financial data, reconcile |
| support | 35 | Customer support, tickets |
| collector | 30 | Payment collection |
| meter_reader | 25 | Record readings only |
| inspector | 20 | View data, inspect installations |
| viewer | 10 | Read-only access to assigned data |
| customer | 5 | Self-service portal access only |
