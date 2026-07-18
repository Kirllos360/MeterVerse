import { ProgramRegistry } from "./program-registry"
import { CommandRegistry, BUILTIN_COMMANDS } from "./command-registry"
import { ActionRegistry } from "./action-registry"
import { PanelRegistry } from "./panel-registry"
import { WidgetRegistry } from "./widget-registry"
import { ThemeRegistry } from "./theme-registry"
import { PermissionRegistry, BUILTIN_PERMISSIONS } from "./permission-registry"
import { PluginRegistry } from "./plugin-registry"
import { ContextMenuRegistry } from "./context-menu-registry"
import { RouteRegistry } from "./route-registry"
import { EntityRegistry } from "./entity-registry"
import { DiscoveryEngineImpl } from "../discovery/discovery-engine"
import { TypedEvent } from "@/runtime/kernel/events"

export interface RegistryManager {
  readonly initialized: boolean
  programs: ProgramRegistry
  commands: CommandRegistry
  actions: ActionRegistry
  panels: PanelRegistry
  widgets: WidgetRegistry
  themes: ThemeRegistry
  permissions: PermissionRegistry
  plugins: PluginRegistry
  contextMenus: ContextMenuRegistry
  routes: RouteRegistry
  entities: EntityRegistry
  discovery: DiscoveryEngineImpl

  initialize(): Promise<void>
  discoverAndRegister(): Promise<void>
  snapshot(): Record<string, unknown>
  onInitialized: TypedEvent<void>
}

export class RegistryManagerImpl implements RegistryManager {
  readonly programs = new ProgramRegistry()
  readonly commands = new CommandRegistry()
  readonly actions = new ActionRegistry()
  readonly panels = new PanelRegistry()
  readonly widgets = new WidgetRegistry()
  readonly themes = new ThemeRegistry()
  readonly permissions = new PermissionRegistry()
  readonly plugins = new PluginRegistry()
  readonly contextMenus = new ContextMenuRegistry()
  readonly routes = new RouteRegistry()
  readonly entities = new EntityRegistry()
  readonly discovery = new DiscoveryEngineImpl()
  private _initialized = false
  onInitialized = new TypedEvent<void>()

  get initialized() { return this._initialized }

  async initialize(): Promise<void> {
    if (this._initialized) return
    await this.discoverAndRegister()
    this._initialized = true
    this.onInitialized.dispatch()
  }

  async discoverAndRegister(): Promise<void> {
    const discovered = await this.discovery.discoverAll()

    for (const item of discovered) {
      switch (item.type) {
        case "program":
          break // Programs registered via create()
        case "command": {
          const cmd = BUILTIN_COMMANDS.find((c) => c.id === item.id)
          if (cmd) this.commands.register(cmd)
          break
        }
        case "permission": {
          const perm = BUILTIN_PERMISSIONS.find((p) => p.id === item.id)
          if (perm) this.permissions.register(perm)
          break
        }
      }
    }

    // Register built-in commands
    for (const cmd of BUILTIN_COMMANDS) {
      if (!this.commands.has(cmd.id)) this.commands.register(cmd)
    }

    // Register built-in permissions
    for (const perm of BUILTIN_PERMISSIONS) {
      if (!this.permissions.has(perm.id)) this.permissions.register(perm)
    }
  }

  snapshot(): Record<string, unknown> {
    return {
      programs: this.programs.snapshot(),
      commands: this.commands.snapshot(),
      actions: this.actions.snapshot(),
      panels: this.panels.snapshot(),
      widgets: this.widgets.snapshot(),
      themes: this.themes.snapshot(),
      permissions: this.permissions.snapshot(),
      plugins: this.plugins.snapshot(),
      contextMenus: this.contextMenus.snapshot(),
      routes: this.routes.snapshot(),
      entities: this.entities.snapshot(),
    }
  }
}
