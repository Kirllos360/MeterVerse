import type { WorkflowDefinition, WorkflowExecution, WorkflowStep, StepExecution, ExecutionStatus, StepType } from "../contracts/workflow"
import { TypedEvent } from "@/runtime/kernel/events"
import { getEventBus } from "@/event-bus/core/event-bus-provider"

export type StepHandler = (step: WorkflowStep, context: Record<string, unknown>) => Promise<{ success: boolean; output?: Record<string, unknown>; error?: string }>

export class WorkflowEngine {
  private stepHandlers = new Map<StepType, StepHandler>()
  private executions = new Map<string, WorkflowExecution>()
  private definitions = new Map<string, WorkflowDefinition>()

  onExecutionStart = new TypedEvent<WorkflowExecution>()
  onStepComplete = new TypedEvent<{ executionId: string; stepId: string; status: string }>()
  onExecutionComplete = new TypedEvent<WorkflowExecution>()

  registerStepHandler(type: StepType, handler: StepHandler): void {
    this.stepHandlers.set(type, handler)
  }

  registerWorkflow(definition: WorkflowDefinition): void {
    this.definitions.set(definition.id, definition)
  }

  getWorkflow(id: string): WorkflowDefinition | undefined {
    return this.definitions.get(id)
  }

  getAllWorkflows(): WorkflowDefinition[] {
    return Array.from(this.definitions.values())
  }

  async start(workflowId: string, input: Record<string, unknown>): Promise<WorkflowExecution> {
    const definition = this.definitions.get(workflowId)
    if (!definition) throw new Error(`Workflow not found: ${workflowId}`)

    const execution: WorkflowExecution = {
      id: `wf_${workflowId}_${Date.now()}`,
      workflowId, workflowName: definition.name, version: definition.version,
      status: "running", currentStepId: definition.steps[0]?.id || null,
      steps: definition.steps.map((s) => ({
        stepId: s.id, stepName: s.name, stepType: s.type,
        status: "pending", retryCount: 0,
      })),
      input, startedAt: Date.now(), context: { ...input },
    }

    this.executions.set(execution.id, execution)
    this.onExecutionStart.dispatch(execution)
    getEventBus().publish("workflow:started", { workflowId, executionId: execution.id })

    await this.executeSteps(execution, definition)
    return execution
  }

  private async executeSteps(execution: WorkflowExecution, definition: WorkflowDefinition): Promise<void> {
    for (const step of definition.steps) {
      if (execution.status === "cancelled" || execution.status === "failed") break

      execution.currentStepId = step.id
      const stepExec = execution.steps.find((s) => s.stepId === step.id)
      if (!stepExec) continue

      stepExec.status = "running"
      stepExec.startedAt = Date.now()

      try {
        const handler = this.stepHandlers.get(step.type)
        if (!handler) throw new Error(`No handler for step type: ${step.type}`)

        const result = await handler(step, execution.context)
        if (result.success) {
          stepExec.status = "completed"
          stepExec.output = result.output
          stepExec.completedAt = Date.now()
          stepExec.duration = (stepExec.completedAt || 0) - (stepExec.startedAt || 0)
          if (result.output) Object.assign(execution.context, result.output)
        } else {
          throw new Error(result.error || "Step failed")
        }
      } catch (err) {
        stepExec.status = "failed"
        stepExec.error = String(err)
        stepExec.completedAt = Date.now()
        execution.error = String(err)
        execution.status = "failed"
        this.onStepComplete.dispatch({ executionId: execution.id, stepId: step.id, status: "failed" })
        break
      }

      this.onStepComplete.dispatch({ executionId: execution.id, stepId: step.id, status: stepExec.status })
    }

    if (execution.status !== "failed") {
      execution.status = "completed"
    }
    execution.completedAt = Date.now()
    execution.duration = execution.completedAt - execution.startedAt
    this.onExecutionComplete.dispatch(execution)
    getEventBus().publish(execution.status === "completed" ? "workflow:completed" : "workflow:failed", {
      workflowId: definition.id, executionId: execution.id, status: execution.status,
    })
  }

  getExecution(id: string): WorkflowExecution | undefined {
    return this.executions.get(id)
  }

  getAllExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values())
  }
}
