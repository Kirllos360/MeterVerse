import type { WorkflowExecution, StepExecution } from "../contracts/workflow"

export interface ExecutionDetails {
  execution: WorkflowExecution
  duration: number
  stepCount: number
  completedSteps: number
  failedSteps: number
}

export interface TimelineEvent {
  timestamp: number
  type: "start" | "stepStart" | "stepComplete" | "stepFail" | "complete" | "fail"
  label: string
  stepId?: string
  duration?: number
}

export class WorkflowInspector {
  getExecutionDetails(execution: WorkflowExecution): ExecutionDetails {
    return {
      execution,
      duration: execution.duration || 0,
      stepCount: execution.steps.length,
      completedSteps: execution.steps.filter((s) => s.status === "completed").length,
      failedSteps: execution.steps.filter((s) => s.status === "failed").length,
    }
  }

  getTimeline(execution: WorkflowExecution): TimelineEvent[] {
    const events: TimelineEvent[] = [
      { timestamp: execution.startedAt, type: "start", label: `Workflow started: ${execution.workflowName}` },
    ]
    for (const step of execution.steps) {
      if (step.startedAt) {
        events.push({ timestamp: step.startedAt, type: "stepStart", label: `Step: ${step.stepName}`, stepId: step.stepId })
      }
      if (step.completedAt) {
        events.push({
          timestamp: step.completedAt,
          type: step.status === "failed" ? "stepFail" : "stepComplete",
          label: `${step.stepName}: ${step.status}`,
          stepId: step.stepId,
          duration: step.duration,
        })
      }
    }
    if (execution.completedAt) {
      events.push({ timestamp: execution.completedAt, type: execution.status === "failed" ? "fail" : "complete", label: `Workflow ${execution.status}` })
    }
    return events.sort((a, b) => a.timestamp - b.timestamp)
  }
}
