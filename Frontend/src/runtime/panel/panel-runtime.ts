import { create } from "zustand"

export type PanelZone = "sidebar" | "inspector" | "bottom" | "topbar" | "floating"
export type PanelSize = "sm" | "md" | "lg" | "xl" | "full"

export interface PanelConfig {
  id: string
  zone: PanelZone
  label: string
  icon?: string
  defaultSize: number
  minSize: number
  maxSize: number
  collapsed: boolean
  collapsible: boolean
  resizable: boolean
  order: number
}

interface PanelState {
  panels: PanelConfig[]
  registerPanel: (config: Omit<PanelConfig, "order">) => void
  unregisterPanel: (id: string) => void
  setPanelSize: (id: string, size: number) => void
  togglePanel: (id: string) => void
  collapsePanel: (id: string) => void
  expandPanel: (id: string) => void
  reorderPanel: (id: string, order: number) => void
  getPanelsByZone: (zone: PanelZone) => PanelConfig[]
  resetPanels: () => void
}

let panelCount = 0

export const usePanelRuntime = create<PanelState>((set, get) => ({
  panels: [],

  registerPanel: (config) => {
    const order = ++panelCount
    set((s) => ({
      panels: [...s.panels.filter((p) => p.id !== config.id), { ...config, order }],
    }))
  },

  unregisterPanel: (id) =>
    set((s) => ({ panels: s.panels.filter((p) => p.id !== id) })),

  setPanelSize: (id, size) =>
    set((s) => ({
      panels: s.panels.map((p) =>
        p.id === id ? { ...p, defaultSize: Math.max(p.minSize, Math.min(p.maxSize, size)) } : p
      ),
    })),

  togglePanel: (id) =>
    set((s) => ({
      panels: s.panels.map((p) =>
        p.id === id ? { ...p, collapsed: !p.collapsed } : p
      ),
    })),

  collapsePanel: (id) =>
    set((s) => ({
      panels: s.panels.map((p) => (p.id === id ? { ...p, collapsed: true } : p)),
    })),

  expandPanel: (id) =>
    set((s) => ({
      panels: s.panels.map((p) => (p.id === id ? { ...p, collapsed: false } : p)),
    })),

  reorderPanel: (id, order) =>
    set((s) => ({
      panels: s.panels.map((p) => (p.id === id ? { ...p, order } : p)),
    })),

  getPanelsByZone: (zone) =>
    get().panels.filter((p) => p.zone === zone).sort((a, b) => a.order - b.order),

  resetPanels: () => set({ panels: [] }),
}))
