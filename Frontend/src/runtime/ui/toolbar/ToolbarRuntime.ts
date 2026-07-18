import { create } from "zustand"

export type ToolbarZone = "left" | "center" | "right"
export type ToolbarItemType = "button" | "menu" | "search" | "filter" | "divider" | "spacer" | "badge"

export interface ToolbarAction {
  id: string
  label: string
  labelAr?: string
  icon?: string
  type: ToolbarItemType
  action?: () => void
  disabled?: boolean
  permissions?: string[]
  zone: ToolbarZone
  order: number
}

interface ToolbarState {
  actions: ToolbarAction[]
  register: (action: ToolbarAction) => void
  registerMany: (actions: ToolbarAction[]) => void
  unregister: (id: string) => void
  getByZone: (zone: ToolbarZone) => ToolbarAction[]
  clear: () => void
}

export const useToolbarRuntime = create<ToolbarState>((set, get) => ({
  actions: [],
  register: (action) => set((s) => ({ actions: [...s.actions.filter((a) => a.id !== action.id), action] })),
  registerMany: (actions) => actions.forEach((a) => get().register(a)),
  unregister: (id) => set((s) => ({ actions: s.actions.filter((a) => a.id !== id) })),
  getByZone: (zone) => get().actions.filter((a) => a.zone === zone).sort((a, b) => a.order - b.order),
  clear: () => set({ actions: [] }),
}))
