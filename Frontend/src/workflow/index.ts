// Workflow Engine — Phase 17F Implementation
// Every enterprise action becomes a workflow. Buttons only trigger workflows.

export { WorkflowEngine } from "./engine/workflow-engine"
export { WorkflowScheduler } from "./scheduler/scheduler"
export { ApprovalEngine } from "./approval/approval-engine"
export { WorkflowInspector } from "./inspector/workflow-inspector"
export { createWorkflowSystem, getWorkflowEngine, getWorkflowScheduler, getApprovalEngine, BUILTIN_WORKFLOWS } from "./workflow-init"
export { conditionStep, apiCallStep, createEntityStep, sendNotificationStep, waitStep } from "./steps/builtin-steps"
export { useWorkflow, useWorkflowDefinition, useAllWorkflows, useExecution, useAllExecutions } from "./hooks/useWorkflow"

export type { WorkflowDefinition, WorkflowExecution, WorkflowStep, WorkflowTrigger, WorkflowTemplate, ExecutionStatus, StepType, WorkflowCategory } from "./contracts/workflow"
export type { ApprovalRequest, ApprovalDecision } from "./approval/approval-engine"
export type { ScheduledJob } from "./scheduler/scheduler"
export type { ExecutionDetails, TimelineEvent } from "./inspector/workflow-inspector"
