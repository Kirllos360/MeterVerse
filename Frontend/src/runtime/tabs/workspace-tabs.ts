import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Tab {
  id: string
  label: string
  labelAr?: string
  icon?: string
  route?: string
  pinned?: boolean
  dirty?: boolean
  unsaved?: boolean
  appId?: string
}

interface TabState {
  tabs: Tab[]
  activeTabId: string | null
  recentTabs: string[]
  openTab: (tab: Omit<Tab, "pinned" | "dirty" | "unsaved">) => void
  closeTab: (id: string) => void
  closeOtherTabs: (id: string) => void
  closeAllTabs: () => void
  closeTabsToLeft: (id: string) => void
  closeTabsToRight: (id: string) => void
  setActiveTab: (id: string) => void
  togglePinTab: (id: string) => void
  markDirty: (id: string) => void
  markClean: (id: string) => void
  duplicateTab: (id: string) => void
  moveTab: (id: string, toIndex: number) => void
  getActiveTab: () => Tab | undefined
}

export const useWorkspaceTabs = create<TabState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,
      recentTabs: [],

      openTab: (tab) =>
        set((s) => {
          const existing = s.tabs.find((t) => t.id === tab.id)
          if (existing) return { activeTabId: tab.id }
          return {
            tabs: [...s.tabs, { ...tab, pinned: false, dirty: false, unsaved: false }],
            activeTabId: tab.id,
          }
        }),

      closeTab: (id) =>
        set((s) => {
          const tab = s.tabs.find((t) => t.id === id)
          if (tab?.pinned) return s
          const newTabs = s.tabs.filter((t) => t.id !== id)
          const newActive = s.activeTabId === id
            ? newTabs[Math.min(s.tabs.indexOf(s.tabs.find((t) => t.id === id)!), newTabs.length - 1)]?.id ?? null
            : s.activeTabId
          return { tabs: newTabs, activeTabId: newActive }
        }),

      closeOtherTabs: (id) =>
        set((s) => ({
          tabs: s.tabs.filter((t) => t.id === id || t.pinned),
          activeTabId: id,
        })),

      closeAllTabs: () =>
        set((s) => ({
          tabs: s.tabs.filter((t) => t.pinned),
          activeTabId: s.tabs.find((t) => t.pinned)?.id ?? null,
        })),

      closeTabsToLeft: (id) =>
        set((s) => {
          const idx = s.tabs.findIndex((t) => t.id === id)
          return { tabs: [...s.tabs.filter((t) => t.pinned), ...s.tabs.slice(idx)] }
        }),

      closeTabsToRight: (id) =>
        set((s) => {
          const idx = s.tabs.findIndex((t) => t.id === id)
          return { tabs: [...s.tabs.slice(0, idx + 1)] }
        }),

      setActiveTab: (id) => set({ activeTabId: id }),

      togglePinTab: (id) =>
        set((s) => ({
          tabs: s.tabs.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)),
        })),

      markDirty: (id) =>
        set((s) => ({
          tabs: s.tabs.map((t) => (t.id === id ? { ...t, dirty: true, unsaved: true } : t)),
        })),

      markClean: (id) =>
        set((s) => ({
          tabs: s.tabs.map((t) => (t.id === id ? { ...t, dirty: false, unsaved: false } : t)),
        })),

      duplicateTab: (id) =>
        set((s) => {
          const original = s.tabs.find((t) => t.id === id)
          if (!original) return s
          const newTab = { ...original, id: `${original.id}-copy`, label: `${original.label} (copy)` }
          return { tabs: [...s.tabs, newTab], activeTabId: newTab.id }
        }),

      moveTab: (id, toIndex) =>
        set((s) => {
          const fromIndex = s.tabs.findIndex((t) => t.id === id)
          if (fromIndex === -1) return s
          const newTabs = [...s.tabs]
          const [moved] = newTabs.splice(fromIndex, 1)
          newTabs.splice(toIndex, 0, moved)
          return { tabs: newTabs }
        }),

      getActiveTab: () => {
        const { tabs, activeTabId } = get()
        return tabs.find((t) => t.id === activeTabId)
      },
    }),
    { name: "meterverse-tabs" }
  )
)
