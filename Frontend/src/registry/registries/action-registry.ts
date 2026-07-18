import { BaseRegistry } from "./base-registry"
import type { Registrable } from "../contracts/base"

export type ActionType = "create" | "edit" | "delete" | "view" | "export" | "import" | "assign" | "approve" | "reject" | "suspend" | "activate" | "archive" | "duplicate" | "share" | "print"

export interface ActionContext {
  programId: string
  entityType?: string
  entityIds?: string[]
  viewMode?: "list" | "grid"
}

export interface ActionResult {
  success: boolean
  message?: string
  requiresRefresh?: boolean
}

export interface ActionRegistration extends Registrable {
  execute: (context: ActionContext) => Promise<ActionResult>
  canExecute?: (context: ActionContext) => boolean
  icon: string
  actionType: ActionType
  entityTypes?: string[]
  programIds?: string[]
  requiresSelection?: boolean
  bulkAction?: boolean
  showInContextMenu?: boolean
  showInToolbar?: boolean
  showInRow?: boolean
  confirmMessage?: string
}

export class ActionRegistry extends BaseRegistry<ActionRegistration> {
  constructor() { super("action-registry", "Action Registry") }

  getContextualActions(context: ActionContext): ActionRegistration[] {
    return this.getAll().filter((a) => {
      if (a.programIds && !a.programIds.includes(context.programId)) return false
      if (a.entityTypes && context.entityType && !a.entityTypes.includes(context.entityType)) return false
      if (a.requiresSelection && (!context.entityIds || !context.entityIds.length)) return false
      return a.enabled !== false
    })
  }

  getToolbarActions(programId: string): ActionRegistration[] {
    return this.getContextualActions({ programId }).filter((a) => a.showInToolbar)
  }

  getBulkActions(entityType?: string): ActionRegistration[] {
    return this.getAll().filter((a) => a.bulkAction && (!entityType || a.entityTypes?.includes(entityType)))
  }
}
