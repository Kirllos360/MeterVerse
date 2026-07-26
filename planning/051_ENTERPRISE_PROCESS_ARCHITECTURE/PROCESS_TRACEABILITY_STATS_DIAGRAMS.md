# Process Traceability, Statistics & Diagrams

**File:** `planning/051_ENTERPRISE_PROCESS_ARCHITECTURE/PROCESS_TRACEABILITY_STATS_DIAGRAMS.md`

---

## Traceability Matrix

| Process ID | Business Goal | Domain (P09) | API Endpoint | DB Table | UI Route | Workflow |
|-----------|--------------|-------------|-------------|----------|----------|----------|
| P-001 | Track all meters | MV-DOM-001 | POST /api/meters | Meter | /admin/meters | Manual |
| P-002 | Link meter to customer | MV-DOM-001 | POST /api/meter-assignments | MeterAssignment | /admin/meters/:id | Manual |
| P-011 | Capture consumption data | MV-DOM-002 | POST /api/readings | Reading | /admin/readings | Automated |
| P-014 | Ensure data quality | MV-DOM-002 | POST /api/readings/:id/approve | Reading.status | — | Automated |
| P-018 | Calculate usage | MV-DOM-002 | POST /api/business/pipeline/calculate-consumption | — | — | Automated |
| P-021 | Onboard customer | MV-DOM-003 | POST /api/customers | Customer | /admin/customers | Manual |
| P-031 | Generate monthly bills | MV-DOM-009 | POST /api/billing/runs/:id/generate | BillRun | /admin/billing | Workflow |
| P-033 | Create invoices | MV-DOM-010 | POST /api/invoices/generate | Invoice | /admin/invoices | Workflow |
| P-045 | Record payment | MV-DOM-011 | POST /api/payments | Payment | /admin/payments | Automated |
| P-056 | Update financial records | MV-DOM-013 | — (planned) | GeneralLedgerEntry | /admin/accounting | Workflow |
| P-066 | Replicate data across areas | MV-DOM-028 | — (planned) | SyncJob | /admin/sync | Automated |
| P-073 | Authenticate user | MV-DOM-046 | POST /api/auth/login | Session | /admin/login | Automated |
| P-086 | Verify system health | MV-DOM-051 | GET /api/health | — | — | Automated |
| P-094 | Diagnose meter issues | MV-DOM-039 | POST /api/rca/cases | RCACase | /admin/rca-workspace | AI |

## Process Statistics

### Coverage Statistics

| Metric | Value |
|--------|-------|
| Total processes identified | 120 |
| Processes with full specs | 2 of 120 (1.7%) |
| Processes with partial specs | 118 of 120 (98.3%) |
| Processes with state machines | 8 of 120 (6.7%) |
| Processes with KPIs | 18 of 120 (15%) |
| Processes with SLAs | 18 of 120 (15%) |
| Processes with diagrams | 8 of 120 (6.7%) |
| Processes with API mapping | 38 of 120 (31.7%) |
| Processes with DB mapping | 20 of 120 (16.7%) |
| Processes with permission mapping | 30 of 120 (25%) |
| Processes with risk assessment | 14 of 120 (11.7%) |

### Distribution by Domain (P09)

| Domain | Processes |
|--------|----------|
| Meter (MV-DOM-001) | 10 |
| Reading (MV-DOM-002) | 10 |
| Customer (MV-DOM-003) | 5 |
| Billing (MV-DOM-009) | 2 |
| Invoice (MV-DOM-010) | 9 |
| Payment (MV-DOM-011) | 6 |
| Accounting (MV-DOM-013) | 5 |
| Collection (MV-DOM-016) | 5 |
| Sub-total Core+Finance | 52 |
| All other domains | 68 |

---

## Diagram Index

| Diagram ID | Diagram Type | Process(s) | Format | Location |
|-----------|-------------|------------|--------|----------|
| D-001 | Mermaid State | P-001 to P-006 | Mermaid | 08_STATE_MACHINES/PROCESS_STATE_MACHINES.md |
| D-002 | Mermaid State | P-011 to P-017 | Mermaid | 08_STATE_MACHINES/PROCESS_STATE_MACHINES.md |
| D-003 | Mermaid State | P-033 to P-035 | Mermaid | 08_STATE_MACHINES/PROCESS_STATE_MACHINES.md |
| D-004 | Mermaid State | P-045 to P-050 | Mermaid | 08_STATE_MACHINES/PROCESS_STATE_MACHINES.md |
| D-005 | Mermaid State | P-051 to P-054 | Mermaid | 08_STATE_MACHINES/PROCESS_STATE_MACHINES.md |
| D-006 | Mermaid State | P-056 to P-060 | Mermaid | 08_STATE_MACHINES/PROCESS_STATE_MACHINES.md |
| D-007 | Mermaid State | P-066 to P-068 | Mermaid | 08_STATE_MACHINES/PROCESS_STATE_MACHINES.md |
| D-008 | Mermaid State | P-078 to P-081 | Mermaid | 08_STATE_MACHINES/PROCESS_STATE_MACHINES.md |
| D-009 | Mermaid Flow | P-031 | Mermaid | 02_FINANCIAL_PROCESSES/billing/P-031_BIL-BEX.md |

### Missing Diagrams

| Diagram ID | Required For | Type | Status |
|-----------|-------------|------|--------|
| D-010 | P-003 Meter Replacement | BPMN 2.0 | ❌ Missing |
| D-011 | P-011 Reading Import | Swimlane | ❌ Missing |
| D-012 | P-021 Customer Registration | BPMN 2.0 | ❌ Missing |
| D-013 | P-045 Payment Processing | Sequence | ❌ Missing |
| D-014 | P-051 Collection Lifecycle | BPMN 2.0 | ❌ Missing |
| D-015 | P-059 Month Close | Swimlane | ❌ Missing |
| D-016 | P-073 Login Flow | Sequence | ❌ Missing |
| D-017 | P-090 Disaster Recovery | Activity + Decision | ❌ Missing |
| D-018 | P-094 AI RCA | Activity | ❌ Missing |
| D-019 | P-066 Sync Job | Sequence | ❌ Missing |
