# Workflow Domain

**File:** `05_WORKFLOW_AUTOMATION/workflow/DOMAIN.md`
**Domain ID:** MV-DOM-030
**Priority:** P0 — Critical Path
**Status:** Draft — Enterprise Planning Phase

---

## Business Purpose
The Workflow domain provides configurable state machines, approval chains, and business process automation for all MeterVerse operations. Workflows enable business users to define, execute, and monitor processes without developer intervention.

## Business Owner
Chief Operations Officer / Business Process Director

## Capabilities
| Capability | Description | Status |
|-----------|-------------|--------|
| Workflow Definition | Visual designer for state machines | 🔲 Planned |
| Workflow Instance | Per-entity workflow execution tracking | ✅ Partial |
| State Management | Current state, allowed transitions | ✅ Partial |
| Guard Conditions | Pre-transition validation rules | 🔲 Planned |
| Role-based Assignment | Actors assigned to workflow steps | 🔲 Planned |
| Escalation | Time-based escalation on stalled workflows | 🔲 Planned |
| Automation Rules | Trigger actions on state transitions | 🔲 Planned |

## Proposed Schema
```prisma
model WorkflowDefinition {
  id          String   @id @default(uuid())
  name        String   @unique
  entityType  String   // INVOICE, COLLECTION, READING, METER
  description String?
  states      WorkflowStateDefinition[]
  transitions WorkflowTransitionDefinition[]
  active      Boolean  @default(true)
  version     Int      @default(1)
  createdAt   DateTime @default(now())
  archivedAt  DateTime?
}

model WorkflowStateDefinition {
  id           String @id @default(uuid())
  workflowId   String
  workflow     WorkflowDefinition @relation(fields: [workflowId], references: [id])
  name         String
  type         StateType // INITIAL, INTERMEDIATE, FINAL, TERMINAL
  assigneeRole String?  // Role assigned at this state
  order        Int
}
```

**Priority:** P0 — Critical | **Wave:** 05 | **Sessions:** 18 | **Dependencies:** All operational domains
