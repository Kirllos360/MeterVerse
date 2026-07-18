import { create } from "zustand"

export interface PluginManifest {
  id: string
  name: string
  version: string
  description: string
  author?: string
  permissions?: string[]
  hooks?: string[]
  components?: Record<string, string>
}

interface PluginState {
  plugins: Map<string, PluginManifest>
  enabledPlugins: Set<string>
  registerPlugin: (manifest: PluginManifest) => void
  unregisterPlugin: (id: string) => void
  enablePlugin: (id: string) => void
  disablePlugin: (id: string) => void
  isPluginEnabled: (id: string) => boolean
  getPlugin: (id: string) => PluginManifest | undefined
  listPlugins: () => PluginManifest[]
  listEnabledPlugins: () => PluginManifest[]
}

export const usePluginRuntime = create<PluginState>((set, get) => ({
  plugins: new Map(),
  enabledPlugins: new Set(),

  registerPlugin: (manifest) =>
    set((s) => {
      const plugins = new Map(s.plugins)
      plugins.set(manifest.id, manifest)
      return { plugins }
    }),

  unregisterPlugin: (id) =>
    set((s) => {
      const plugins = new Map(s.plugins)
      plugins.delete(id)
      const enabledPlugins = new Set(s.enabledPlugins)
      enabledPlugins.delete(id)
      return { plugins, enabledPlugins }
    }),

  enablePlugin: (id) =>
    set((s) => {
      const enabledPlugins = new Set(s.enabledPlugins)
      enabledPlugins.add(id)
      return { enabledPlugins }
    }),

  disablePlugin: (id) =>
    set((s) => {
      const enabledPlugins = new Set(s.enabledPlugins)
      enabledPlugins.delete(id)
      return { enabledPlugins }
    }),

  isPluginEnabled: (id) => get().enabledPlugins.has(id),
  getPlugin: (id) => get().plugins.get(id),
  listPlugins: () => Array.from(get().plugins.values()),
  listEnabledPlugins: () =>
    Array.from(get().plugins.values()).filter((p) => get().enabledPlugins.has(p.id)),
}))
