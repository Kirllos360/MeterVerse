import { BaseRegistry } from "./base-registry"
import type { Registrable } from "../contracts/base"
import type { ProgramRegistration } from "./program-registry"
import type { CommandRegistration } from "./command-registry"
import type { ActionRegistration } from "./action-registry"
import type { PanelRegistration } from "./panel-registry"
import type { WidgetRegistration } from "./widget-registry"

export interface PluginContributions {
  programs?: ProgramRegistration[]
  commands?: CommandRegistration[]
  actions?: ActionRegistration[]
  panels?: PanelRegistration[]
  widgets?: WidgetRegistration[]
}

export interface PluginRegistration extends Registrable {
  version: string
  author: string
  engineVersion: string
  icon?: string
  contributes: PluginContributions
  requires?: { plugins?: string[]; programs?: string[]; permissions?: string[] }
  setup?: () => Promise<void>
  cleanup?: () => Promise<void>
}

export type PluginStatus = "not_installed" | "installed" | "enabled" | "disabled" | "error"

export class PluginRegistry extends BaseRegistry<PluginRegistration> {
  private _statuses = new Map<string, PluginStatus>()

  constructor() { super("plugin-registry", "Plugin Registry") }

  getStatus(pluginId: string): PluginStatus { return this._statuses.get(pluginId) || "not_installed" }
  setStatus(pluginId: string, status: PluginStatus): void { this._statuses.set(pluginId, status) }

  async enable(pluginId: string): Promise<void> {
    const plugin = this.get(pluginId)
    if (!plugin) return
    if (plugin.setup) await plugin.setup()
    this._statuses.set(pluginId, "enabled")
  }

  async disable(pluginId: string): Promise<void> {
    const plugin = this.get(pluginId)
    if (!plugin) return
    if (plugin.cleanup) await plugin.cleanup()
    this._statuses.set(pluginId, "disabled")
  }
}
