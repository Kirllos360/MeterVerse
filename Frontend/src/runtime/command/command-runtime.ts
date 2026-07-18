import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CommandAction {
  id: string
  label: string
  labelAr?: string
  description?: string
  icon?: string
  shortcut?: string
  keywords?: string[]
  category: "navigation" | "action" | "settings" | "app" | "ai"
  appId?: string
  action: () => void
}

interface CommandState {
  isOpen: boolean
  query: string
  selectedIndex: number
  actions: CommandAction[]
  recentCommands: string[]
  pinnedCommands: string[]
  history: string[]
  registerAction: (action: CommandAction) => void
  registerActions: (actions: CommandAction[]) => void
  unregisterAction: (id: string) => void
  open: () => void
  close: () => void
  toggle: () => void
  setQuery: (query: string) => void
  setSelectedIndex: (index: number) => void
  execute: (id: string) => void
  getFilteredActions: () => CommandAction[]
}

export const useCommandRuntime = create<CommandState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      query: "",
      selectedIndex: 0,
      actions: [],
      recentCommands: [],
      pinnedCommands: [],
      history: [],

      registerAction: (action) =>
        set((s) => ({
          actions: [...s.actions.filter((a) => a.id !== action.id), action],
        })),

      registerActions: (actions) =>
        set((s) => {
          const existing = s.actions.filter((a) => !actions.find((na) => na.id === a.id))
          return { actions: [...existing, ...actions] }
        }),

      unregisterAction: (id) =>
        set((s) => ({
          actions: s.actions.filter((a) => a.id !== id),
        })),

      open: () => set({ isOpen: true, query: "", selectedIndex: 0 }),
      close: () => set({ isOpen: false, query: "" }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen, query: "", selectedIndex: 0 })),
      setQuery: (query) => set({ query, selectedIndex: 0 }),
      setSelectedIndex: (index) => set({ selectedIndex: index }),

      execute: (id) => {
        const action = get().actions.find((a) => a.id === id)
        if (action) {
          action.action()
          set((s) => ({
            history: [id, ...s.history.filter((h) => h !== id)].slice(0, 50),
            recentCommands: [id, ...s.recentCommands.filter((r) => r !== id)].slice(0, 10),
            isOpen: false,
            query: "",
          }))
        }
      },

      getFilteredActions: () => {
        const { actions, query, pinnedCommands, recentCommands } = get()
        if (!query.trim()) {
          const pinned = actions.filter((a) => pinnedCommands.includes(a.id))
          const recent = actions.filter((a) => recentCommands.includes(a.id) && !pinnedCommands.includes(a.id))
          return [...pinned, ...recent, ...actions.filter((a) => !pinnedCommands.includes(a.id) && !recentCommands.includes(a.id))]
        }
        const q = query.toLowerCase()
        return actions.filter(
          (a) =>
            a.label.toLowerCase().includes(q) ||
            a.labelAr?.includes(q) ||
            a.keywords?.some((k) => k.toLowerCase().includes(q)) ||
            a.description?.toLowerCase().includes(q)
        )
      },
    }),
    { name: "meterverse-commands" }
  )
)
