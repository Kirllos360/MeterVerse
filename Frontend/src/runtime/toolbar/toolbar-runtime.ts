import { create } from "zustand"
import { createRegistry, type RuntimeRegistry } from "../shared/types"

export interface ToolbarAction {
  id: string
  label: string
  icon?: string
  type: "button" | "dropdown" | "search" | "filter" | "bulk" | "divider" | "spacer"
  action?: () => void
  disabled?: boolean
  permissions?: string[]
  order?: number
}

interface ToolbarState {
  leftActions: ToolbarAction[]
  centerActions: ToolbarAction[]
  rightActions: ToolbarAction[]
  registerAction: (zone: "left" | "center" | "right", action: ToolbarAction) => void
  unregisterAction: (id: string) => void
  clearActions: () => void
  getSortedActions: (zone: "left" | "center" | "right") => ToolbarAction[]
}

export const useToolbarRuntime = create<ToolbarState>((set, get) => ({
  leftActions: [],
  centerActions: [],
  rightActions: [],

  registerAction: (zone, action) =>
    set((s) => {
      const key = zone === "left" ? "leftActions" : zone === "center" ? "centerActions" : "rightActions"
      const existing = s[key].filter((a) => a.id !== action.id)
      return { [key]: [...existing, action] }
    }),

  unregisterAction: (id) =>
    set((s) => ({
      leftActions: s.leftActions.filter((a) => a.id !== id),
      centerActions: s.centerActions.filter((a) => a.id !== id),
      rightActions: s.rightActions.filter((a) => a.id !== id),
    })),

  clearActions: () => set({ leftActions: [], centerActions: [], rightActions: [] }),

  getSortedActions: (zone) => {
    const actions = zone === "left" ? get().leftActions : zone === "center" ? get().centerActions : get().rightActions
    return [...actions].sort((a, b) => (a.order || 0) - (b.order || 0))
  },
}))
