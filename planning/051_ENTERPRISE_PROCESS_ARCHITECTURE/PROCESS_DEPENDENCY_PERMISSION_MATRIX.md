# Process Dependencies & Permissions

**File:** `planning/051_ENTERPRISE_PROCESS_ARCHITECTURE/PROCESS_DEPENDENCY_PERMISSION_MATRIX.md`

---

## Dependency Matrix (Top 30 Critical Processes)

| ID | Process | Depends On | Required By | Parallelizable |
|----|---------|-----------|-------------|----------------|
| P-001 | Meter Registration | — | P-002, P-011 | Yes |
| P-002 | Meter Assignment | P-001, P-021 | P-011 | Yes |
| P-003 | Meter Replacement | P-001, P-002 | — | No |
| P-011 | Reading Import | P-001 | P-014 | Yes |
| P-014 | Reading Validation | P-011 | P-015, P-016, P-018 | Yes |
| P-015 | Reading Approval | P-014 | P-018 | No |
| P-018 | Consumption Calc | P-015 | P-031 | Yes (per meter) |
| P-021 | Customer Registration | — | P-002, P-026, P-045 | Yes |
| P-026 | Contract Creation | P-021 | P-002 | No |
| P-030 | Bill Cycle Creation | — | P-031 | No |
| P-031 | Bill Cycle Execution | P-030, P-018, P-033 | P-059 | Yes (per cycle) |
| P-033 | Invoice Generation | P-031 | P-034, P-036, P-056 | Yes (per invoice) |
| P-034 | Invoice Approval | P-033 | P-036 | No |
| P-036 | Invoice Distribution | P-034 | — | Yes |
| P-045 | Payment Registration | P-021 | P-046, P-056 | Yes |
| P-046 | Payment Allocation | P-045 | P-055 | Yes (auto) |
| P-051 | Collection Assignment | P-033 (overdue) | P-052 | Yes |
| P-055 | Customer Ledger Update | P-046 | P-056 | Yes |
| P-056 | GL Posting | P-033, P-045, P-055 | P-057, P-059 | No |
| P-057 | Journal Posting | P-056 | P-059 | No |
| P-058 | Bank Reconciliation | P-045 | P-059 | No |
| P-059 | Month Close | P-056, P-057, P-058 | P-060 | No |
| P-066 | Sync Job | All domains | — | Yes |
| P-073 | Login | — | All | Yes |
| P-086 | Health Check | — | P-087 | Yes |
| P-088 | Backup | — | P-089, P-090 | Yes |
| P-094 | AI RCA | P-001, P-011, P-014 | — | Yes |
| P-098 | Alert Generation | P-014, P-019 | — | Yes |
| P-100 | Analytics Report | All | — | Yes |

## Permission Matrix

| Process ID | Create | Read | Update | Delete | Execute | Approve |
|-----------|--------|------|--------|--------|---------|---------|
| P-001 | meter.operator | meter.viewer | meter.operator | meter.admin | — | — |
| P-002 | meter.operator | meter.viewer | meter.operator | meter.admin | — | — |
| P-011 | readings.create | readings.list | readings.edit | readings.delete | — | — |
| P-014 | — | readings.list | — | — | system | — |
| P-015 | — | readings.list | — | — | readings.edit | readings.edit |
| P-018 | — | readings.list | — | — | system | — |
| P-021 | customers.create | customers.list | customers.edit | customers.delete | — | — |
| P-031 | billing.* | billing.* | billing.* | — | billing.* | billing.admin |
| P-033 | invoices.create | invoices.list | invoices.edit | invoices.delete | — | invoices.approve |
| P-034 | — | invoices.list | — | — | invoices.edit | invoices.approve |
| P-045 | payments.* | payments.* | — | — | payments.* | — |
| P-051 | collections.* | collections.* | collections.* | — | collections.* | — |
| P-056 | — | — | — | — | finance.admin | — |
| P-059 | — | — | — | — | finance.admin | finance.director |
| P-073 | — | — | — | — | public | — |
| P-086 | — | — | — | — | system | — |
| P-088 | — | — | — | — | admin.* | — |

## Role-Based Access Summary

| Role | Processes |
|------|-----------|
| **Super Admin** | All processes |
| **Admin** | All except finance close |
| **Meter Operator** | P-001 through P-010 |
| **Billing Operator** | P-030 through P-044 |
| **Finance Admin** | P-056 through P-060 |
| **Collection Officer** | P-051 through P-055 |
| **Customer Service** | P-021 through P-025, P-036 through P-038 |
| **Viewer** | Read-only on all |
| **Field Technician** | P-002, P-003, P-012, P-061 |
| **System** | P-014, P-018, P-031, P-066, P-086 |
