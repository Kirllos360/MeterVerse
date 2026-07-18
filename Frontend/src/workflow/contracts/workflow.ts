export type WorkflowCategory = "billing" | "meters" | "customers" | "readings" | "reports" | "admin" | "notifications" | "integration"

export type StepType =
  | "condition" | "apiCall" | "createEntity" | "updateEntity" | "deleteEntity"
  | "sendNotification" | "sendEmail" | "requestApproval" | "waitForApproval"
  | "generatePDF" | "exportCSV" | "subWorkflow" | "wait" | "custom"

export type ExecutionStatus = "pending" | "running" | "paused" | "waitingForApproval" | "completed" | "failed" | "cancelled" | "timedOut"

export interface WorkflowDefinition {
  id: string
  name: string
  nameAr?: string
  version: string
  description: string
  category: WorkflowCategory
  trigger: WorkflowTrigger
  steps: WorkflowStep[]
  conditions?: WorkflowCondition[]
  onError?: ErrorHandling
  compensation?: WorkflowStep[]
  timeout?: number
  requiresApproval?: boolean
  approvalConfig?: ApprovalConfig
  retryPolicy?: RetryPolicy
  executionMode?: "sequential" | "parallel" | "conditional"
}

export type WorkflowTrigger =
  | { type: "manual"; label: string; labelAr?: string; icon?: string; context: ("toolbar" | "contextMenu" | "rowAction")[]; entityTypes?: string[]; programIds?: string[]; confirmMessage?: string }
  | { type: "event"; eventType: string; filter?: Record<string, unknown> }
  | { type: "schedule"; cron: string; timezone?: string; startAt?: string; endAt?: string }
  | { type: "webhook"; path: string; methods: string[] }

export interface WorkflowStep {
  id: string
  name: string
  nameAr?: string
  type: StepType
  optional?: boolean
  timeout?: number
  retryPolicy?: RetryPolicy
  input?: Record<string, string>
  output?: Record<string, string>
  when?: WorkflowCondition
  nextOnSuccess?: string
  nextOnFailure?: string
  compensationStepId?: string
}

export interface WorkflowCondition {
  type: "and" | "or" | "not" | "compare"
  conditions?: WorkflowCondition[]
  field?: string
  operator?: "eq" | "neq" | "gt" | "gte" | "lt" | "lte"
  value?: unknown
}

export interface ErrorHandling {
  retryPolicy?: RetryPolicy
  compensation?: "all" | "failed" | "none"
  notifyOnError?: boolean
}

export interface ApprovalConfig {
  approvers: { type: "role" | "user"; value: string }[]
  requiredApprovals: number
  timeout?: number
  escalation?: { afterHours: number; escalateTo: { type: "role" | "user"; value: string } }
}

export interface RetryPolicy {
  maxRetries: number
  backoff: "fixed" | "exponential" | "immediate"
  baseDelay: number
  maxDelay?: number
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  workflowName: string
  version: string
  status: ExecutionStatus
  currentStepId: string | null
  steps: StepExecution[]
  input: Record<string, unknown>
  output?: Record<string, unknown>
  error?: string
  startedAt: number
  completedAt?: number
  duration?: number
  context: Record<string, unknown>
}

export interface StepExecution {
  stepId: string
  stepName: string
  stepType: StepType
  status: "pending" | "running" | "completed" | "failed" | "skipped"
  input?: Record<string, unknown>
  output?: Record<string, unknown>
  error?: string
  startedAt?: number
  completedAt?: number
  duration?: number
  retryCount: number
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: WorkflowCategory
  icon: string
  definition: Partial<WorkflowDefinition>
  parameters: { id: string; name: string; type: string; required: boolean }[]
}
