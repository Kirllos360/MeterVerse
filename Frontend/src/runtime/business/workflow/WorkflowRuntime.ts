import { create } from "zustand"

export type WorkflowAction = "approve" | "reject" | "assign" | "complete" | "cancel" | "suspend" | "resume"

export interface WorkflowStep {
  id: string
  action: WorkflowAction
  label: string
  fromStatus: string
  toStatus: string
  permissions?: string[]
  requireComment?: boolean
}

export interface WorkflowTransition {
  id: string
  entityId: string
  entityType: string
  action: WorkflowAction
  from: string
  to: string
  performedBy?: string
  comment?: string
  timestamp: number
}

interface WorkflowState {
  definitions: WorkflowStep[]
  history: WorkflowTransition[]
  registerDefinition: (step: WorkflowStep) => void
  registerDefinitions: (steps: WorkflowStep[]) => void
  executeTransition: (transition: Omit<WorkflowTransition, "id" | "timestamp">) => void
  getHistory: (entityId: string) => WorkflowTransition[]
  getAvailableActions: (entityType: string, currentStatus: string) => WorkflowStep[]
}

export const useWorkflowRuntime = create<WorkflowState>((set, get) => ({
  definitions: [],
  history: [],

  registerDefinition: (step) => set((s) => ({ definitions: [...s.definitions.filter((d) => d.id !== step.id), step] })),

  registerDefinitions: (steps) => steps.forEach((s) => get().registerDefinition(s)),

  executeTransition: (transition) => {
    const entry: WorkflowTransition = {
      ...transition,
      id: `wf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    }
    set((s) => ({ history: [...s.history, entry] }))
  },

  getHistory: (entityId) => get().history.filter((h) => h.entityId === entityId),

  getAvailableActions: (entityType, currentStatus) =>
    get().definitions.filter((d) => d.fromStatus === currentStatus),
}))
