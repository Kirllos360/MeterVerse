# P47 — Admin vs User Platform Matrix

**Served:** Admin at `/admin` (red brand #DC2626, AdminLayout) · User at `/` + `/user` (green brand #059669, SystemLayout)
**Key finding:** Both shells are SPAs driven by `useAdminStore.activePage` (Zustand). The user platform reuses the admin settings shell re-skinned green. No standalone user portal.

## Capability × Platform Matrix

Legend: **A**=Admin only · **U**=User only · **S**=Shared · **D**=Duplicate · **I**=Incorrect · **M**=Missing

| Capability | Admin | User | Verdict |
|---|---|---|---|
| Login / auth | `admin/login` | `/login` (real form) | S |
| Home / dashboard | `admin/home` (live) | `/` + `user/home` (hardcoded `—`) | D (2 user homes, both mock) |
| Customers | `admin/customers` + [id]/cards | `user/customers` (ListGridPage) + root SPA | S |
| Meters | `admin/meters` + [id]/relay | `user/meters` (GenericAdminPage) | S |
| Readings | `admin/readings` + [id] | — | A (no user reading submission) |
| Invoices | `admin/invoices` + [id] | `user/invoices` (ListGridPage) | S |
| Payments | `admin/payments` + [id] | `/payments` (list-only, simpler) | D |
| Accounting | `admin/accounting` (4 sub) | `/accounting` (re-export admin) | S (re-export) |
| Tariffs | `admin/tariffs` + tariff-settings | `/user` re-uses admin tariffs | S (read-only reuse) |
| Billing cycles | `admin/bill-cycle` (+settings) | — | A |
| Collections | `admin/collections` (hardcoded) | — | A (hardcoded) |
| Reports | `admin/reports` (live) | `/user` re-uses admin reports | S |
| Reporting studio | `admin/reporting` (live export) | — | A |
| Monitoring | `admin/monitoring` + monitoring-view | `/user` re-uses admin monitoring | S |
| Alerts | `admin/alerts` (hardcoded) | — | A |
| Projects/Zones/Units | `admin/{projects,zones,units}` | `/user` re-uses admin views | S |
| Users/Roles/Permissions | `admin/users` + roles + permissions + users-permissions | `/user` re-uses admin users | I (user sees admin user mgmt) |
| Settings/config | `admin/settings` + many | `/user` re-uses admin settings | I (user sees admin config) |
| Audit log | `admin/audit` (live) | — | A |
| Security | `admin/security` | — | A |
| Notifications | `admin/notifications` + templates | — | M (no user inbox) |
| SIM cards | `admin/sim` + [id] | `/sim-cards` (grid) | S |
| Tasks / work orders | `admin/tasks`, `admin/operations` | — | A |
| Documents | `admin/documents` (hardcoded) | — | A (hardcoded) |
| Knowledge / RCA | `admin/knowledge`, `admin/rca-workspace` | — | A |
| AI | `admin/ai` + command-center + diagnostics + operations | — | A |
| Scheduler/queue/backup/config | `admin/scheduler` + queue + backup + etc | — | A |
| **Tickets** | — | `/tickets` (hardcoded placeholder) | U (mock) |
| **Upload** | `admin/upload` (hardcoded) | `/upload` (placeholder) | M (both mock) |
| **Add data wizard** | — | `/add-data` (4-step, mock only) | U (mock) |
| **Tracking** | — | `/tracking` (placeholder) | U (mock) |
| Consumption analytics | `admin/reporting` (partial) | — | M (no user charts) |
| Profile / preferences | — | — | **M (both)** |
| Pay-bill self-service | `admin/collections` | — | **M** |
| Tariff assignment | `admin/tariffs` | — | **M (no self-service)** |
| Service requests | `admin/service-connections` | — | **M** |
| Meter ownership view | `admin/meters` | — | **M (no user)** |

## Summary counts

- **Admin-only (A):** 20+ domains (readings, billing cycles, collections, reports studio, monitoring deep, alerts, users/roles mgmt, audit, security, notifications, tasks, documents, knowledge, AI, scheduler/queue/backup/config, tickets mgmt).
- **User-only (U):** tickets, upload, add-data, tracking (all mock placeholders).
- **Shared (S):** customers, meters, invoices, payments, accounting, tariffs (read-only), reports, monitoring, projects/zones/units.
- **Duplicate (D):** home (2 user + 1 admin), payments (root vs admin), accounting (re-export).
- **Incorrect (I):** user shell exposes admin Users/Permissions/Settings/config — wrong for a customer portal.
- **Missing (M):** profile, pay-bill, reading submission, consumption analytics, notifications inbox, documents, service requests, meter ownership, billing self-service.

## Recommendation (feeds C14 Wave-3)

Build a **true user portal** (green, `/`) with customer-only views (my meters, my bills, pay, submit reading, tickets, notifications, profile, consumption). Remove the admin settings shell from the user surface. The `/user` path is a near-duplicate of root — consolidate.
