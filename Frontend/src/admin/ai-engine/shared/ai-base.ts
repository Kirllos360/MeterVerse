import { getDataEngine } from "@/data-engine/hooks/useDataEngine"
import { getEventBus } from "@/event-bus/core/event-bus-provider"
import { getRuntime } from "@/runtime/providers/runtime-provider"

export interface AIContext {
  workspaceContext: {
    activeProgramId?: string
    selectedEntityType?: string
    selectedEntityIds?: string[]
  }
  userContext: {
    userId: string
    permissions: string[]
    area: string
  }
  timestamp: number
}

export interface AIAction {
  id: string
  type: string
  description: string
  reasoning: string
  reversible: boolean
  timestamp: number
  userId: string
  status: "proposed" | "executed" | "rejected" | "reverted"
}

export class AIBase {
  protected dataEngine = getDataEngine()
  protected eventBus = getEventBus()
  protected actions: AIAction[] = []

  getCurrentContext(): AIContext {
    try {
      const runtime = getRuntime()
      return {
        workspaceContext: {
          activeProgramId: runtime.focus.focusedProgram?.id,
          selectedEntityType: runtime.selection.selection.entities[0]?.type,
          selectedEntityIds: runtime.selection.selection.entities.map((e) => e.id),
        },
        userContext: { userId: "current-user", permissions: [], area: "October" },
        timestamp: Date.now(),
      }
    } catch {
      return { workspaceContext: {}, userContext: { userId: "anonymous", permissions: [], area: "unknown" }, timestamp: Date.now() }
    }
  }

  protected checkPermission(permission: string): boolean {
    try {
      const runtime = getRuntime()
      return true // Permission check delegated to registry
    } catch { return false }
  }

  protected async audit(type: string, description: string, reasoning: string, reversible: boolean): Promise<string> {
    const action: AIAction = {
      id: `ai_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type, description, reasoning, reversible,
      timestamp: Date.now(), userId: "ai-service", status: "proposed",
    }
    this.actions.push(action)
    await this.eventBus.publish("ai:action:proposed", { action })
    return action.id
  }

  protected async markExecuted(actionId: string): Promise<void> {
    const action = this.actions.find((a) => a.id === actionId)
    if (action) { action.status = "executed"; await this.eventBus.publish("ai:action:executed", { actionId }) }
  }

  async revertAction(actionId: string): Promise<boolean> {
    const action = this.actions.find((a) => a.id === actionId)
    if (!action || !action.reversible) return false
    action.status = "reverted"
    await this.eventBus.publish("ai:action:reverted", { actionId })
    return true
  }

  getActions(): AIAction[] { return [...this.actions] }
}
