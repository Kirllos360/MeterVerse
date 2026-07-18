import { WorkflowEngine } from "./engine/workflow-engine"
import { WorkflowScheduler } from "./scheduler/scheduler"
import { ApprovalEngine } from "./approval/approval-engine"
import { WorkflowInspector } from "./inspector/workflow-inspector"
import { conditionStep, apiCallStep, createEntityStep, sendNotificationStep, waitStep } from "./steps/builtin-steps"
import type { WorkflowDefinition, WorkflowCategory } from "./contracts/workflow"

let globalEngine: WorkflowEngine | null = null
let globalScheduler: WorkflowScheduler | null = null
let globalApproval: ApprovalEngine | null = null
let globalInspector: WorkflowInspector | null = null

export function createWorkflowSystem(): { engine: WorkflowEngine; scheduler: WorkflowScheduler; approval: ApprovalEngine; inspector: WorkflowInspector } {
  if (globalEngine) return { engine: globalEngine, scheduler: globalScheduler!, approval: globalApproval!, inspector: globalInspector! }

  const engine = new WorkflowEngine()
  const scheduler = new WorkflowScheduler(engine)
  const approval = new ApprovalEngine()
  const inspector = new WorkflowInspector()

  // Register built-in step handlers
  engine.registerStepHandler("condition", conditionStep)
  engine.registerStepHandler("apiCall", apiCallStep)
  engine.registerStepHandler("createEntity", createEntityStep)
  engine.registerStepHandler("sendNotification", sendNotificationStep)
  engine.registerStepHandler("wait", waitStep)

  // Register built-in workflows
  for (const wf of BUILTIN_WORKFLOWS) engine.registerWorkflow(wf)

  globalEngine = engine
  globalScheduler = scheduler
  globalApproval = approval
  globalInspector = inspector

  return { engine, scheduler, approval, inspector }
}

export function getWorkflowEngine(): WorkflowEngine {
  if (!globalEngine) throw new Error("Workflow system not initialized. Call createWorkflowSystem() first.")
  return globalEngine
}

export function getWorkflowScheduler(): WorkflowScheduler {
  if (!globalScheduler) throw new Error("Workflow system not initialized.")
  return globalScheduler
}

export function getApprovalEngine(): ApprovalEngine {
  if (!globalApproval) throw new Error("Workflow system not initialized.")
  return globalApproval
}

export const BUILTIN_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: "workflow:invoice:generate",
    name: "Generate Invoice",
    version: "1.0.0",
    description: "Generate invoices for a billing period",
    category: "billing",
    trigger: { type: "manual", label: "Generate Invoice", icon: "fileText", context: ["toolbar"], entityTypes: ["invoice"] },
    steps: [
      { id: "validate", name: "Validate Input", type: "condition", input: { field: "periodStart", operator: "exists" } },
      { id: "notify", name: "Notify Start", type: "sendNotification", input: { title: "Invoice Generation Started" } },
      { id: "wait", name: "Process", type: "wait", input: { duration: 500 } },
    ],
    requiresApproval: false,
    executionMode: "sequential",
  },
  {
    id: "workflow:reading:import",
    name: "Bulk Import Readings",
    version: "1.0.0",
    description: "Import meter readings from external source",
    category: "readings",
    trigger: { type: "manual", label: "Import Readings", icon: "upload", context: ["toolbar"], entityTypes: ["readings"] },
    steps: [
      { id: "validate", name: "Validate Data", type: "condition", input: { field: "readings", operator: "exists" } },
      { id: "import", name: "Import Readings", type: "createEntity", input: { entityType: "readings" } },
      { id: "notify", name: "Notify Results", type: "sendNotification", input: { title: "Import Complete" } },
    ],
    executionMode: "sequential",
  },
  {
    id: "workflow:customer:notify",
    name: "Notify Customer",
    version: "1.0.0",
    description: "Send notification to customer",
    category: "customers",
    trigger: { type: "manual", label: "Notify Customer", icon: "send", context: ["contextMenu"], entityTypes: ["customer"] },
    steps: [
      { id: "notify", name: "Send Notification", type: "sendNotification", input: { title: "Customer Notification" } },
    ],
    executionMode: "sequential",
  },
]
