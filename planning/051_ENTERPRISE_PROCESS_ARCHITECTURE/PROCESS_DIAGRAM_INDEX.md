# Process Diagram Index

**File:** `planning/051_ENTERPRISE_PROCESS_ARCHITECTURE/PROCESS_DIAGRAM_INDEX.md`

---

## Diagram Inventory

### State Machine Diagrams (Mermaid)

| # | Diagram | Processes Covered | Format | File Location |
|---|---------|------------------|--------|---------------|
| D-001 | Meter Lifecycle | P-001 to P-006 | Mermaid stateDiagram | `08_STATE_MACHINES/PROCESS_STATE_MACHINES.md` |
| D-002 | Reading Lifecycle | P-011 to P-017 | Mermaid stateDiagram | `08_STATE_MACHINES/PROCESS_STATE_MACHINES.md` |
| D-003 | Invoice Lifecycle | P-033 to P-035 | Mermaid stateDiagram | `08_STATE_MACHINES/PROCESS_STATE_MACHINES.md` |
| D-004 | Payment Lifecycle | P-045 to P-050 | Mermaid stateDiagram | `08_STATE_MACHINES/PROCESS_STATE_MACHINES.md` |
| D-005 | Collection Lifecycle | P-051 to P-054 | Mermaid stateDiagram | `08_STATE_MACHINES/PROCESS_STATE_MACHINES.md` |
| D-006 | Accounting Period | P-056 to P-060 | Mermaid stateDiagram | `08_STATE_MACHINES/PROCESS_STATE_MACHINES.md` |
| D-007 | Synchronization | P-066 to P-068 | Mermaid stateDiagram | `08_STATE_MACHINES/PROCESS_STATE_MACHINES.md` |
| D-008 | User Registration | P-078 to P-081 | Mermaid stateDiagram | `08_STATE_MACHINES/PROCESS_STATE_MACHINES.md` |

### BPMN / Workflow Diagrams (Mermaid)

| # | Diagram | Processes Covered | Type | File Location |
|---|---------|------------------|------|---------------|
| D-009 | Bill Cycle Execution | P-031 | Mermaid flow graph | `02_FINANCIAL_PROCESSES/billing/P-031_BIL-BEX.md` |
| D-010 | Meter Registration | P-001 | BPMN swimlane | `07_DIAGRAMS/PROCESS_BPMN_DIAGRAMS.md` |
| D-011 | Reading Import (AMI) | P-011 | Swimlane | `07_DIAGRAMS/PROCESS_BPMN_DIAGRAMS.md` |
| D-012 | Invoice-to-Payment | P-033 → P-045 | Sequence diagram | `07_DIAGRAMS/PROCESS_BPMN_DIAGRAMS.md` |
| D-013 | Month Close | P-059 | Activity + Decision | `07_DIAGRAMS/PROCESS_BPMN_DIAGRAMS.md` |
| D-014 | Collection Lifecycle | P-051 to P-054 | Swimlane | `07_DIAGRAMS/PROCESS_BPMN_DIAGRAMS.md` |
| D-015 | Login Flow | P-073 | Sequence diagram | `07_DIAGRAMS/PROCESS_BPMN_DIAGRAMS.md` |
| D-016 | Meter Replacement | P-003 | Swimlane | `07_DIAGRAMS/PROCESS_BPMN_DIAGRAMS.md` |

### Exception Flow Diagrams (Mermaid)

| # | Diagram | Processes Covered | Type | File Location |
|---|---------|------------------|------|---------------|
| D-017 | Failed Reading Import | P-011 | Exception decision tree | `07_DIAGRAMS/PROCESS_ADVANCED_DIAGRAMS.md` |
| D-018 | Failed Payment Allocation | P-046 | Exception decision tree | `07_DIAGRAMS/PROCESS_ADVANCED_DIAGRAMS.md` |
| D-019 | Month Close Failed | P-059 | Exception decision tree | `07_DIAGRAMS/PROCESS_ADVANCED_DIAGRAMS.md` |

### Architecture & Mapping Diagrams (Mermaid)

| # | Diagram | Coverage | Type | File Location |
|---|---------|----------|------|---------------|
| D-020 | Context Diagram (C4 L1) | Whole system | Mermaid graph | `_diagrams/DOMAIN_DIAGRAMS.md` (P09) |
| D-021 | Domain Map | All domains | Mermaid graph | `_diagrams/DOMAIN_DIAGRAMS.md` (P09) |
| D-022 | Capability Heat Map | Core/Billing/Finance/Comms | Mermaid graph | `_diagrams/DOMAIN_DIAGRAMS.md` (P09) |
| D-023 | Dependency Graph (Top 10) | Core domains | Mermaid graph | `_diagrams/DOMAIN_DIAGRAMS.md` (P09) |
| D-024 | BPMN Invoice-to-Payment | P-033→P-045→P-056 | Sequence diagram | `_diagrams/DOMAIN_DIAGRAMS.md` (P09) |
| D-025 | Event Flow Mapping | All domain events | Mermaid graph | `07_DIAGRAMS/PROCESS_BPMN_DIAGRAMS.md` |
| D-026 | Process Communication Graph | Top 30 processes | Mermaid graph | `07_DIAGRAMS/PROCESS_BPMN_DIAGRAMS.md` |
| D-027 | DDD Bounded Context Map | 8 contexts | Mermaid graph | `07_DIAGRAMS/PROCESS_ADVANCED_DIAGRAMS.md` |
| D-028 | Ownership (Team → Process) | 13 teams | Table | `07_DIAGRAMS/PROCESS_ADVANCED_DIAGRAMS.md` |
| D-029 | Business Capability Map | 16 capabilities | Table | `07_DIAGRAMS/PROCESS_ADVANCED_DIAGRAMS.md` |

### Source Code Diagrams

| # | Diagram | Format | Coverage | File Location |
|---|---------|--------|----------|---------------|
| D-030 | Login Flow | Draw.io XML | P-073 | `07_DIAGRAMS/PROCESS_ADVANCED_DIAGRAMS.md` |
| D-031 | Invoice-to-Payment | PlantUML | P-033→P-045 | `07_DIAGRAMS/PROCESS_ADVANCED_DIAGRAMS.md` |
| D-032 | Meter Registration | PlantUML | P-001 | `07_DIAGRAMS/PROCESS_ADVANCED_DIAGRAMS.md` |

---

## Summary

| Diagram Category | Count |
|-----------------|-------|
| State Machines | 8 |
| BPMN / Workflow | 7 |
| Exception Flows | 3 |
| Architecture & Maps | 9 |
| Source Code (XML/UML) | 3 |
| **Total** | **30** |
