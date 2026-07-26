// Generate individual process files from consolidated P10 data
import fs from "fs"

const OUT = "D:/meter/planning/051_ENTERPRISE_PROCESS_ARCHITECTURE/06_PROCESS_FILES"

// Template for a complete 61-field process spec
function generateProcess(id, name, group, data) {
  const { 
    purpose, goal, owner, desc, value, priority, criticality,
    trigger, preconditions, inputs, outputs,
    primaryActor, secondaryActors, roles, permissions,
    security, approval, validation, decisionPoints,
    exceptions, altFlows, retry, timeout, rollback, recovery, compensation,
    sla, kpi, successMetrics, failureMetrics,
    businessRules, techRules, complianceRules,
    deps, upstream, downstream,
    relatedDomains, relatedAPIs, relatedDB, relatedUI,
    relatedReports, relatedNotifs, relatedAI, relatedWorkflows,
    relatedEvents, relatedConfig, relatedAudit,
    futureExpansion, knownRisks,
    perf, availability, scalability,
    implPriority, sessions, wave, phase, sprint, milestone,
    dod, acceptanceCriteria
  } = data

  return `# ${id}: ${name}

**File:** \`06_PROCESS_FILES/${group}/${id}_${name.replace(/\s+/g, '_')}.md\`
**Domain Group:** ${group}

---

## 1. Business Context
- **Business Purpose:** ${purpose || 'N/A'}
- **Business Goal:** ${goal || 'N/A'}
- **Business Owner:** ${owner || 'N/A'}
- **Description:** ${desc || 'N/A'}
- **Business Value:** ${value || 'N/A'}

## 2. Priority & Criticality
- **Priority:** ${priority || 'N/A'}
- **Criticality:** ${criticality || 'N/A'}
- **Implementation Priority:** ${implPriority || priority || 'N/A'}
- **Estimated Sessions:** ${sessions || 'N/A'}
- **Wave:** ${wave || 'N/A'} | **Phase:** ${phase || 'N/A'} | **Sprint:** ${sprint || 'N/A'} | **Milestone:** ${milestone || 'N/A'}

## 3. Trigger & Preconditions
- **Trigger:** ${trigger || 'N/A'}
- **Preconditions:**
${preconditions || 'N/A'}

## 4. Inputs & Outputs
- **Inputs:** ${inputs || 'N/A'}
- **Outputs:** ${outputs || 'N/A'}

## 5. Actors & Permissions
- **Primary Actor:** ${primaryActor || 'N/A'}
- **Secondary Actors:** ${secondaryActors || 'N/A'}
- **Roles:** ${roles || 'N/A'}
- **Permissions:** ${permissions || 'N/A'}

## 6. Rules & Validation
- **Security Rules:** ${security || 'N/A'}
- **Approval Requirements:** ${approval || 'N/A'}
- **Validation Rules:** ${validation || 'N/A'}
- **Decision Points:** ${decisionPoints || 'N/A'}

## 7. Business Rules
${businessRules || 'N/A'}

## 8. Technical Rules
${techRules || 'N/A'}

## 9. Compliance Rules
${complianceRules || 'N/A'}

## 10. Flow Control
- **Exception Paths:** ${exceptions || 'N/A'}
- **Alternative Flows:** ${altFlows || 'N/A'}
- **Retry Strategy:** ${retry || 'N/A'}
- **Timeout Strategy:** ${timeout || 'N/A'}
- **Rollback Strategy:** ${rollback || 'N/A'}
- **Recovery Strategy:** ${recovery || 'N/A'}
- **Compensation Actions:** ${compensation || 'N/A'}

## 11. Service Levels
- **SLA:** ${sla || 'N/A'}
- **KPI:** ${kpi || 'N/A'}
- **Success Metrics:** ${successMetrics || kpi || 'N/A'}
- **Failure Metrics:** ${failureMetrics || 'N/A'}

## 12. Dependencies
- **Upstream Processes:** ${upstream || deps || 'N/A'}
- **Downstream Processes:** ${downstream || 'N/A'}
- **Related Domains:** ${relatedDomains || 'N/A'}

## 13. Technical References
- **Related APIs:** ${relatedAPIs || 'N/A'}
- **Related Database Tables:** ${relatedDB || 'N/A'}
- **Related UI Pages:** ${relatedUI || 'N/A'}
- **Related Reports:** ${relatedReports || 'N/A'}

## 14. Related Entities
- **Notifications:** ${relatedNotifs || 'N/A'}
- **AI Agents:** ${relatedAI || 'N/A'}
- **Workflows:** ${relatedWorkflows || 'N/A'}
- **Events:** ${relatedEvents || 'N/A'}
- **Configuration:** ${relatedConfig || 'N/A'}
- **Audit Logs:** ${relatedAudit || 'N/A'}

## 15. Future & Risk
- **Future Expansion:** ${futureExpansion || 'N/A'}
- **Known Risks:** ${knownRisks || 'N/A'}

## 16. Non-Functional Requirements
- **Performance:** ${perf || 'N/A'}
- **Availability:** ${availability || 'N/A'}
- **Scalability:** ${scalability || 'N/A'}

## 17. Definition of Done
${dod || 'N/A'}

## 18. Acceptance Criteria
${acceptanceCriteria || 'N/A'}

---
*Generated from P10 Enterprise Process Architecture — MeterVerse*
`
}

// ========== PROCESS DATA ==========
const processes = {
  "P-001": {
    id: "P-001", name: "Meter Registration", group: "01_meter",
    purpose: "Register a new metering device in the MeterVerse platform", goal: "Ensure every meter is registered with complete, accurate data before entering operational use", owner: "Meter Operations Director",
    desc: "The Meter Registration process accepts meter details and creates a persistent record. The meter enters STOCK state and is ready for assignment.",
    value: "Inventory accuracy — without registration, no meter operations are possible",
    priority: "P0 — Critical", criticality: "System — Without registration, no meter operations are possible",
    trigger: "Manual submission, Bulk import, New shipment received",
    preconditions: "Serial number globally unique, Meter type exists, User has meters.create permission",
    inputs: "Meter serial, Meter type ID, Manufacturer, Form factor, Initial configuration, Area assignment",
    outputs: "Meter record, Audit entry, MeterCreated event",
    primaryActor: "Meter Operations", secondaryActors: "System (Bulk Import), Warehouse Manager",
    roles: "meter.operator (create), meter.admin (configure)", permissions: "meters.create, meters.configure",
    security: "Area-scoped: operator can only register meters for their area. Serial format validated against pattern.",
    approval: "Single: no approval. Bulk > 100: supervisor review. Config changes: meter.admin.",
    validation: "Serial unique. Type exists. Area valid.",
    decisionPoints: "Serial duplicate? → Reject. Type invalid? → Reject with suggestion. Area inactive? → Warn but allow.",
    exceptions: "Duplicate serial → 409 Conflict. Invalid type → 400 Bad Request. DB error → Retry 3x, then 503.",
    altFlows: "Bulk import: if single fails, continue processing remaining, generate error report.",
    retry: "3 attempts: 0s, 1s, 5s", timeout: "30s API gateway, 3 retries with 5s backoff",
    rollback: "Not needed (meter not used yet)", recovery: "If creation succeeds but event publish fails, queue event for retry (max 5)",
    compensation: "None needed (meter not yet used in any process)",
    sla: "< 2 seconds per meter (single), < 60 seconds per 1000 (bulk)", kpi: "Registration success rate > 99.5%, Average time < 500ms",
    successMetrics: "Meter created in < 2s. Serial unique on first attempt.", failureMetrics: "Duplicate serial rejected. DB write fails.",
    businessRules: "Serial must match pattern per type. Area required. Type required and active.",
    techRules: "Serial must match regex per type. Area FK must exist.",
    complianceRules: "Serial unique enterprise-wide. Type per local utility regulations.",
    deps: "Meter Type must exist, Area must exist", upstream: "None (entry point)", downstream: "Meter Assignment (P-002)",
    relatedDomains: "MV-DOM-001 (Meter)", relatedAPIs: "POST /api/meters, GET /api/meter-types",
    relatedDB: "Meter (write), MeterType (read), AuditEntry (write)", relatedUI: "/admin/meters",
    relatedReports: "Meter Inventory Report", relatedNotifs: "Inventory updated notification",
    relatedAI: "None", relatedWorkflows: "None (manual)",
    relatedEvents: "MeterCreated", relatedConfig: "Meter type list, Area catalog",
    relatedAudit: "AuditEntry: meter.create",
    futureExpansion: "Multiple meter types per serial. IoT auto-registration.",
    knownRisks: "Duplicate serial (billing errors). Lost readings (revenue loss).",
    perf: "< 500ms per meter", availability: "99.9%", scalability: "1000 meters/hour",
    sessions: "2", wave: "01", phase: "Core Infrastructure", sprint: "S1", milestone: "M1-Core",
    dod: "Meter record exists with all required fields. Audit entry created. Event published. Meter visible in inventory.",
    acceptanceCriteria: "Meter record exists with all required fields. Audit entry created. Meter visible in inventory list."
  },
  "P-002": {
    id: "P-002", name: "Meter Assignment", group: "01_meter",
    purpose: "Link a registered meter to a customer and contract", goal: "Ensure every active meter is assigned to exactly one customer with a valid contract",
    owner: "Meter Operations Director", priority: "P0 — Critical", criticality: "Revenue — unassigned meters cannot be billed",
    trigger: "Customer request, Contract creation, New installation",
    preconditions: "Meter in STOCK or INSTALLED state. Customer exists. Contract exists (optional).",
    inputs: "Meter ID, Customer ID, Contract ID (optional), Start date, Assignment reason",
    outputs: "MeterAssignment record. Meter customerId updated. Old assignment ended.",
    primaryActor: "Meter Operations", secondaryActors: "Customer Service, Field Technician",
    roles: "meter.operator", permissions: "meter_assignments.*",
    security: "Customer-scoped: can only assign to same area.",
    approval: "Standard: no approval. High-value meter reassignment: supervisor.",
    validation: "One active assignment per meter. Start date < end date.",
    decisionPoints: "Meter already assigned? → End old assignment first. Customer valid? → Verify.",
    exceptions: "Customer not found. Meter in RETIRED state.",
    retry: "2 attempts with 3s delay", timeout: "10s API timeout",
    rollback: "Reverse assignment: unlink meter, restore old assignment",
    recovery: "If new assignment creates but old doesn't end, force-end old with audit",
    compensation: "Reverse assignment, restore old assignment",
    sla: "< 5 seconds", kpi: "Assignment accuracy > 99.5%",
    businessRules: "One active assignment per meter. Start < end date.",
    deps: "Meter must exist (P-001), Customer must exist (P-021)", upstream: "P-001, P-021", downstream: "P-011 (Reading Import)",
    relatedAPIs: "POST /api/meter-assignments", relatedDB: "MeterAssignment, Meter", relatedUI: "/admin/meters/:id",
    relatedEvents: "MeterAssigned", sessions: "2", wave: "01", sprint: "S1", milestone: "M1-Core",
    dod: "Meter linked to customer/contract. Old assignment ended. Audit trail complete."
  }
}

// Generate P-001
const p1 = generateProcess("P-001", "Meter Registration", "01_meter", processes["P-001"])
fs.writeFileSync(`${OUT}/01_meter/P-001_Meter_Registration.md`, p1)
console.log("Created P-001")

const p2 = generateProcess("P-002", "Meter Assignment", "01_meter", processes["P-002"])
fs.writeFileSync(`${OUT}/01_meter/P-002_Meter_Assignment.md`, p2)
console.log("Created P-002")

console.log("Done - 2 files created as sample")
