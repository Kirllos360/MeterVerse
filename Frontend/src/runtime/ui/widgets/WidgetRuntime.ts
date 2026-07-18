import { create } from "zustand"

export type WidgetSize = "sm" | "md" | "lg" | "xl" | "full"
export type WidgetCategory = "kpi" | "metric" | "chart" | "table" | "list" | "status" | "trend"

export interface WidgetMeta {
  id: string
  title: string
  titleAr?: string
  icon?: string
  category: WidgetCategory
  size: WidgetSize
  permissions?: string[]
  refreshInterval?: number
  lazy?: boolean
  config?: Record<string, unknown>
}

interface WidgetState {
  registry: Map<string, WidgetMeta>
  enabled: Map<string, boolean>
  positions: Map<string, { row: number; col: number }>
  register: (meta: WidgetMeta) => void
  registerMany: (metas: WidgetMeta[]) => void
  unregister: (id: string) => void
  get: (id: string) => WidgetMeta | undefined
  getByCategory: (cat: WidgetCategory) => WidgetMeta[]
  setEnabled: (id: string, enabled: boolean) => void
  setPosition: (id: string, row: number, col: number) => void
  list: () => WidgetMeta[]
}

export const useWidgetRuntime = create<WidgetState>((set, get) => ({
  registry: new Map(),
  enabled: new Map(),
  positions: new Map(),

  register: (meta) => set((s) => {
    const registry = new Map(s.registry)
    registry.set(meta.id, meta)
    const enabled = new Map(s.enabled)
    if (!enabled.has(meta.id)) enabled.set(meta.id, true)
    return { registry, enabled }
  }),

  registerMany: (metas) => {
    metas.forEach((m) => get().register(m))
  },

  unregister: (id) => set((s) => {
    const registry = new Map(s.registry)
    registry.delete(id)
    const enabled = new Map(s.enabled)
    enabled.delete(id)
    return { registry, enabled }
  }),

  get: (id) => get().registry.get(id),
  getByCategory: (cat) => Array.from(get().registry.values()).filter((w) => w.category === cat),
  setEnabled: (id, enabled) => set((s) => {
    const e = new Map(s.enabled)
    e.set(id, enabled)
    return { enabled: e }
  }),
  setPosition: (id, row, col) => set((s) => {
    const p = new Map(s.positions)
    p.set(id, { row, col })
    return { positions: p }
  }),
  list: () => Array.from(get().registry.values()),
}))
