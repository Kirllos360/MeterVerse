# Domain Architecture — Traceability Matrix

**File:** `_traceability/TRACEABILITY_MATRIX.md`
**Status:** Enterprise Planning Phase

---

## Traceability Chain: Requirement → Domain → API → Database → UI

| Requirement ID | Requirement | Domain ID | API Endpoint | Database Model | UI Route | Test Coverage |
|---------------|-------------|-----------|-------------|---------------|----------|---------------|
| REQ-MTR-001 | Register new meter | MV-DOM-001 | POST /api/meters | Meter | /admin/meters | 🔲 |
| REQ-MTR-002 | Assign meter to customer | MV-DOM-001 | POST /api/meters/:id/assign | MeterAssignment | /admin/meters/:id | 🔲 |
| REQ-MTR-003 | Terminate meter | MV-DOM-001 | POST /api/meters/:id/terminate | Meter (archivedAt) | /admin/meters/:id | 🔲 |
| REQ-RDG-001 | Submit manual reading | MV-DOM-002 | POST /api/readings | Reading | /admin/meters/:id/readings | 🔲 |
| REQ-RDG-002 | Bulk import readings | MV-DOM-002 | POST /api/readings/bulk | Reading[] | /admin/readings | 🔲 |
| REQ-RDG-003 | Validate reading | MV-DOM-002 | POST /api/readings/:id/approve | Reading.status | /admin/readings/review | 🔲 |
| REQ-CST-001 | Register customer | MV-DOM-003 | POST /api/customers | Customer | /admin/customers | 🔲 |
| REQ-CST-002 | Customer statement | MV-DOM-003 | GET /api/customers/:id/statement | Invoice, Payment | /admin/customers/:id | 🔲 |
| REQ-BIL-001 | Execute bill run | MV-DOM-009 | POST /api/billing/runs | BillRun | /admin/billing | 🔲 |
| REQ-BIL-002 | Generate invoice | MV-DOM-009 | POST /api/invoices/generate | Invoice | /admin/billing | 🔲 |
| REQ-BIL-003 | Issue invoice | MV-DOM-009 | POST /api/invoices/:id/issue | Invoice.immutableAt | /admin/invoices | 🔲 |
| REQ-PMT-001 | Record payment | MV-DOM-011 | POST /api/payments | Payment | /admin/payments | 🔲 |
| REQ-PMT-002 | Reverse payment | MV-DOM-011 | POST /api/payments/:id/reverse | Payment.status | /admin/payments | 🔲 |
| REQ-TRF-001 | Create tariff | MV-DOM-012 | POST /api/tariffs | Tariff | /admin/tariffs | 🔲 |
| REQ-ACG-001 | Create chart of accounts | MV-DOM-013 | POST /api/accounts | Account | /admin/accounting | 🔴 MISSING |
| REQ-ACG-002 | Create journal entry | MV-DOM-013 | POST /api/journal-entries | JournalEntry | /admin/accounting | 🔴 MISSING |
| REQ-ACG-003 | Trial balance | MV-DOM-013 | GET /api/trial-balance | GeneralLedgerEntry | /admin/accounting | 🔴 MISSING |
| REQ-JRN-001 | Customer journal | MV-DOM-015 | GET /api/journals/customer/:id | CustomerLedgerEntry | /admin/customers/:id | 🔴 MISSING |
| REQ-JRN-002 | Payment journal | MV-DOM-015 | GET /api/journals/payments | Payment, PaymentTransaction | /admin/journals | 🔴 MISSING |
| REQ-CLG-001 | Create collection case | MV-DOM-016 | POST /api/domain/collection-cases | CollectionCase | /admin/collections | ✅ |
| REQ-WAL-001 | View wallet | MV-DOM-020 | GET /api/wallet/:customerId | Wallet | /admin/wallet | 🔴 MISSING |
| REQ-SIM-001 | Assign SIM to meter | MV-DOM-026 | POST /api/sim/:id/assign | SIMAssignment | /admin/sim | ✅ |
| REQ-SYNC-001 | Create sync job | MV-DOM-028 | POST /api/sync/jobs | SyncJob | /admin/sync | 🔴 MISSING |
| REQ-WKF-001 | Define workflow | MV-DOM-030 | POST /api/workflows | WorkflowDefinition | /admin/workflows | 🔴 MISSING |
| REQ-NOT-001 | Send notification | MV-DOM-029 | POST /api/notifications | Notification | — | ✅ |
| REQ-RPT-001 | Generate report | MV-DOM-062 | POST /api/reports/export | ReportDefinition, ExportJob | /admin/reports | ✅ |

## Traceability Coverage

| Domain | Requirements | Endpoints Covered | DB Models Covered | UI Covered | Coverage % |
|--------|-------------|------------------|-------------------|------------|------------|
| Meter | 3 | 3/3 | 1/1 | 2/2 | 100% |
| Reading | 3 | 3/3 | 1/1 | 2/2 | 100% |
| Customer | 2 | 2/2 | 1/1 | 2/2 | 100% |
| Billing | 3 | 3/3 | 3/3 | 2/2 | 100% |
| Payment | 2 | 2/2 | 2/2 | 1/1 | 100% |
| Tariff | 1 | 1/1 | 1/1 | 1/1 | 100% |
| Accounting | 3 | 0/3 | 0/3 | 0/1 | **0%** |
| Journal | 2 | 0/2 | 0/1 | 0/1 | **0%** |
| Collection | 1 | 1/1 | 1/1 | 1/1 | 100% |
| Wallet | 1 | 0/1 | 0/1 | 0/1 | **0%** |
| SIM | 1 | 1/1 | 1/1 | 1/1 | 100% |
| Sync | 1 | 0/1 | 0/1 | 0/1 | **0%** |
| Workflow | 1 | 0/1 | 0/1 | 0/1 | **0%** |
| Notification | 1 | 1/1 | 1/1 | 0/1 | 75% |
| Report | 1 | 1/1 | 1/1 | 1/1 | 100% |
| **Total** | **26** | **21/26 (81%)** | **16/20 (80%)** | **13/17 (76%)** | **79%** |
