import { create } from "zustand"

export interface InspectorTab {
  id: string
  label: string
  labelAr?: string
  icon?: string
  content?: string
}

export interface InspectorSection {
  id: string
  label: string
  collapsed: boolean
  order: number
}

interface InspectorState {
  tabs: InspectorTab[]
  activeTabId: string | null
  sections: InspectorSection[]
  selectedEntityId: string | null
  selectedEntityType: string | null
  registerTab: (tab: InspectorTab) => void
  registerTabs: (tabs: InspectorTab[]) => void
  unregisterTab: (id: string) => void
  setActiveTab: (id: string) => void
  toggleSection: (id: string) => void
  selectEntity: (type: string, id: string) => void
  clearSelection: () => void
  getActiveTab: () => InspectorTab | undefined
}

export const useInspectorRuntime = create<InspectorState>((set, get) => ({
  tabs: [
    { id: "properties", label: "Properties", icon: "Settings" },
    { id: "activity", label: "Activity", icon: "Activity" },
    { id: "history", label: "History", icon: "Clock" },
    { id: "metadata", label: "Metadata", icon: "FileJson" },
    { id: "audit", label: "Audit", icon: "Shield" },
  ],
  activeTabId: "properties",
  sections: [
    { id: "details", label: "Details", collapsed: false, order: 0 },
    { id: "relations", label: "Relationships", collapsed: false, order: 1 },
    { id: "activity", label: "Activity", collapsed: true, order: 2 },
  ],
  selectedEntityId: null,
  selectedEntityType: null,

  registerTab: (tab) =>
    set((s) => ({
      tabs: [...s.tabs.filter((t) => t.id !== tab.id), tab],
    })),

  registerTabs: (tabs) =>
    set((s) => {
      const existing = s.tabs.filter((t) => !tabs.find((nt) => nt.id === t.id))
      return { tabs: [...existing, ...tabs] }
    }),

  unregisterTab: (id) =>
    set((s) => ({
      tabs: s.tabs.filter((t) => t.id !== id),
      activeTabId: s.activeTabId === id ? s.tabs[0]?.id ?? null : s.activeTabId,
    })),

  setActiveTab: (id) => set({ activeTabId: id }),

  toggleSection: (id) =>
    set((s) => ({
      sections: s.sections.map((sec) =>
        sec.id === id ? { ...sec, collapsed: !sec.collapsed } : sec
      ),
    })),

  selectEntity: (type, id) => set({ selectedEntityType: type, selectedEntityId: id }),
  clearSelection: () => set({ selectedEntityId: null, selectedEntityType: null }),

  getActiveTab: () => {
    const { tabs, activeTabId } = get()
    return tabs.find((t) => t.id === activeTabId)
  },
}))
