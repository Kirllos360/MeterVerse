import { create } from "zustand"
import type { ReactNode } from "react"

export interface ContextPlugin {
  id: string
  label: string
  icon?: string
  entityTypes: string[]
  render: () => ReactNode
  order?: number
}

interface ContextPluginState {
  plugins: Map<string, ContextPlugin>
  activePlugin: string | null
  register: (plugin: ContextPlugin) => void
  unregister: (id: string) => void
  getForEntity: (entityType: string) => ContextPlugin[]
  setActivePlugin: (id: string | null) => void
}

export const useContextPlugins = create<ContextPluginState>((set, get) => ({
  plugins: new Map(),
  activePlugin: null,

  register: (plugin) => set((s) => {
    const p = new Map(s.plugins)
    p.set(plugin.id, plugin)
    return { plugins: p }
  }),

  unregister: (id) => set((s) => {
    const p = new Map(s.plugins)
    p.delete(id)
    return { plugins: p }
  }),

  getForEntity: (entityType) =>
    Array.from(get().plugins.values())
      .filter((p) => p.entityTypes.includes(entityType))
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),

  setActivePlugin: (id) => set({ activePlugin: id }),
}))
