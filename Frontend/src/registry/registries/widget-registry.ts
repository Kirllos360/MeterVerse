import { BaseRegistry } from "./base-registry"
import type { Registrable } from "../contracts/base"
import type { ComponentType } from "react"

export type DashboardType = "home" | "executive" | "monitoring" | "billing" | "custom"

export interface WidgetProps {
  config: Record<string, unknown>
  loading: boolean
  error?: Error
  onRefresh: () => Promise<void>
}

export interface WidgetRegistration extends Registrable {
  component: () => Promise<{ default: ComponentType<WidgetProps> }>
  defaultSize: { w: number; h: number }
  minSize?: { w: number; h: number }
  dashboardTypes: DashboardType[]
  autoRefresh?: boolean
  defaultRefreshInterval?: number
}

export class WidgetRegistry extends BaseRegistry<WidgetRegistration> {
  constructor() { super("widget-registry", "Widget Registry") }

  getByDashboardType(type: DashboardType): WidgetRegistration[] {
    return this.getAll().filter((w) => w.dashboardTypes.includes(type))
  }
}
