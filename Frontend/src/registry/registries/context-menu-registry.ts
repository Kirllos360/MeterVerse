import { BaseRegistry } from "./base-registry"
import type { Registrable } from "../contracts/base"

export interface ContextMenuItem {
  id: string
  label: string
  labelAr?: string
  icon?: string
  shortcut?: string
  action?: string
  children?: ContextMenuItem[]
  separator?: boolean
  disabled?: boolean
  destructive?: boolean
  permission?: string
}

export interface ContextMenuContext {
  entityType?: string
  entityId?: string
  programId?: string
}

export interface ContextMenuRegistration extends Registrable {
  items: ContextMenuItem[]
  context: ContextMenuContext
  order?: number
}

export interface ContextMenuNode extends ContextMenuItem {
  action?: () => Promise<void>
  children?: ContextMenuNode[]
}

export class ContextMenuRegistry extends BaseRegistry<ContextMenuRegistration> {
  constructor() { super("context-menu-registry", "Context Menu Registry") }

  getMenus(context: ContextMenuContext): ContextMenuRegistration[] {
    return this.getAll()
      .filter((m) => {
        if (m.context.entityType && m.context.entityType !== context.entityType) return false
        if (m.context.programId && m.context.programId !== context.programId) return false
        return true
      })
      .sort((a, b) => (a.order || 100) - (b.order || 100))
  }
}
