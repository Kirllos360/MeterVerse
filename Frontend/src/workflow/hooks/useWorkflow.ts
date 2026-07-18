"use client"

import { useState, useCallback } from "react"
import { getWorkflowEngine } from "../workflow-init"
import type { WorkflowExecution, WorkflowDefinition } from "../contracts/workflow"

export function useWorkflow(workflowId: string) {
  const [execution, setExecution] = useState<WorkflowExecution | null>(null)
  const [loading, setLoading] = useState(false)

  const start = useCallback(async (input: Record<string, unknown> = {}) => {
    setLoading(true)
    const engine = getWorkflowEngine()
    const result = await engine.start(workflowId, input)
    setExecution(result)
    setLoading(false)
    return result
  }, [workflowId])

  return { start, execution, loading }
}

export function useWorkflowDefinition(workflowId: string): WorkflowDefinition | undefined {
  const engine = getWorkflowEngine()
  return engine.getWorkflow(workflowId)
}

export function useAllWorkflows(): WorkflowDefinition[] {
  const engine = getWorkflowEngine()
  return engine.getAllWorkflows()
}

export function useExecution(executionId: string): WorkflowExecution | undefined {
  const engine = getWorkflowEngine()
  return engine.getExecution(executionId)
}

export function useAllExecutions(): WorkflowExecution[] {
  const engine = getWorkflowEngine()
  return engine.getAllExecutions()
}
