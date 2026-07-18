import { BaseRegistry } from "./base-registry"
import type { Registrable } from "../contracts/base"
import type { ComponentType } from "react"

export interface PanelProps {
  entityId: string
  entityType: string
  entityData: Record<string, unknown>
  isExpanded: boolean
  onToggle: () => void
}

export interface PanelRegistration extends Registrable {
  component: () => Promise<{ default: ComponentType<PanelProps> }>
  entityTypes: string[]
  defaultExpanded?: boolean
  icon?: string
  order: number
  supportsInlineEdit?: boolean
  group?: string
}

export class PanelRegistry extends BaseRegistry<PanelRegistration> {
  constructor() { super("panel-registry", "Panel Registry") }

  getByEntityType(entityType: string): PanelRegistration[] {
    return this.getAll()
      .filter((p) => p.entityTypes.includes(entityType))
      .sort((a, b) => a.order - b.order)
  }

  getDefaultPanel(entityType: string): PanelRegistration | undefined {
    return this.getByEntityType(entityType).find((p) => p.defaultExpanded !== false)
  }
}
