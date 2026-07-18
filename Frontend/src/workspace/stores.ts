"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type WorkspaceTab = {
  id: string
  label: string
  icon?: string
  route?: string
  pinned?: boolean
  dirty?: boolean
}

export interface WorkspaceStore {
  // Sidebar
  sidebarMode: "expanded" | "collapsed" | "dock" | "floating"
  sidebarWidth: number
  sidebarHovered: boolean
  setSidebarMode: (mode: WorkspaceStore["sidebarMode"]) => void
  setSidebarWidth: (w: number) => void
  setSidebarHovered: (h: boolean) => void

  // Layout
  layoutPreset: string
  density: "comfortable" | "compact" | "ultraCompact"
  viewMode: "list" | "grid"
  inspectorOpen: boolean
  inspectorWidth: number
  setLayoutPreset: (p: string) => void
  setDensity: (d: WorkspaceStore["density"]) => void
  setViewMode: (m: "list" | "grid") => void
  setInspectorOpen: (o: boolean) => void
  setInspectorWidth: (w: number) => void
  resetInspectorWidth: () => void
  resetSidebarWidth: () => void

  // Tabs
  tabs: WorkspaceTab[]
  activeTabId: string | null
  openTab: (tab: Omit<WorkspaceTab, "pinned" | "dirty">) => void
  closeTab: (id: string) => void
  closeOtherTabs: (id: string) => void
  closeAllTabs: () => void
  setActiveTab: (id: string) => void
  togglePinTab: (id: string) => void
  markDirty: (id: string) => void
  markClean: (id: string) => void
  moveTab: (from: number, to: number) => void
  duplicateTab: (id: string) => void

  // Context
  area: string
  organization: string
  project: string
  setArea: (a: string) => void
  setOrganization: (o: string) => void
  setProject: (p: string) => void

  // Theme
  theme: string
  language: string
  setTheme: (t: string) => void
  setLanguage: (l: string) => void

  // Status bar
  connectionStatus: "connected" | "disconnected" | "degraded"
  backendLatency: number
  setConnectionStatus: (s: WorkspaceStore["connectionStatus"]) => void
  setBackendLatency: (l: number) => void
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      sidebarMode: "expanded",
      sidebarWidth: 256,
      sidebarHovered: false,
      setSidebarMode: (sidebarMode) => set({ sidebarMode }),
      setSidebarWidth: (w) => set({ sidebarWidth: Math.max(48, Math.min(480, w)) }),
      setSidebarHovered: (sidebarHovered) => set({ sidebarHovered }),

      layoutPreset: "default",
      density: "comfortable",
      viewMode: "list",
      inspectorOpen: false,
      inspectorWidth: 260,
      setLayoutPreset: (layoutPreset) => set({ layoutPreset }),
      setDensity: (density) => set({ density }),
      setViewMode: (viewMode) => set({ viewMode }),
      setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }),
      setInspectorWidth: (w) => set({ inspectorWidth: Math.max(200, Math.min(400, w)) }),
      resetInspectorWidth: () => set({ inspectorWidth: 260 }),
      resetSidebarWidth: () => set({ sidebarWidth: 256 }),

      tabs: [
        { id: "welcome", label: "Welcome", pinned: true, dirty: false },
      ],
      activeTabId: "welcome",
      openTab: (tab) => {
        const existing = get().tabs.find((t) => t.id === tab.id)
        if (existing) { set({ activeTabId: tab.id }); return }
        set((s) => ({
          tabs: [...s.tabs, { ...tab, pinned: false, dirty: false }],
          activeTabId: tab.id,
        }))
      },
      closeTab: (id) => set((s) => {
        const tab = s.tabs.find((t) => t.id === id)
        if (tab?.pinned) return s
        const newTabs = s.tabs.filter((t) => t.id !== id)
        const idx = s.tabs.findIndex((t) => t.id === id)
        const newActive = s.activeTabId === id ? newTabs[Math.min(idx, newTabs.length - 1)]?.id ?? null : s.activeTabId
        return { tabs: newTabs, activeTabId: newActive }
      }),
      closeOtherTabs: (id) => set((s) => ({ tabs: s.tabs.filter((t) => t.id === id || t.pinned), activeTabId: id })),
      closeAllTabs: () => set((s) => {
        const pinned = s.tabs.filter((t) => t.pinned)
        return { tabs: pinned, activeTabId: pinned[0]?.id ?? null }
      }),
      setActiveTab: (activeTabId) => set({ activeTabId }),
      togglePinTab: (id) => set((s) => ({ tabs: s.tabs.map((t) => t.id === id ? { ...t, pinned: !t.pinned } : t) })),
      markDirty: (id) => set((s) => ({ tabs: s.tabs.map((t) => t.id === id ? { ...t, dirty: true } : t) })),
      markClean: (id) => set((s) => ({ tabs: s.tabs.map((t) => t.id === id ? { ...t, dirty: false } : t) })),
      moveTab: (from, to) => set((s) => {
        const tabs = [...s.tabs]
        const [moved] = tabs.splice(from, 1)
        tabs.splice(to, 0, moved)
        return { tabs }
      }),
      duplicateTab: (id) => set((s) => {
        const original = s.tabs.find((t) => t.id === id)
        if (!original) return s
        const newTab = { ...original, id: `${original.id}-copy`, label: `${original.label} (copy)`, pinned: false, dirty: false }
        return { tabs: [...s.tabs, newTab], activeTabId: newTab.id }
      }),

      area: "October",
      organization: "Palm Hills",
      project: "Phase 1",
      setArea: (area) => set({ area }),
      setOrganization: (organization) => set({ organization }),
      setProject: (project) => set({ project }),

      theme: "adaptive",
      language: "en",
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),

      connectionStatus: "connected",
      backendLatency: 12,
      setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
      setBackendLatency: (backendLatency) => set({ backendLatency }),
    }),
    {
      name: "mv-workspace",
      partialize: (s) => ({
        sidebarMode: s.sidebarMode,
        sidebarWidth: s.sidebarWidth,
        inspectorOpen: s.inspectorOpen,
        inspectorWidth: s.inspectorWidth,
        layoutPreset: s.layoutPreset,
        density: s.density,
        viewMode: s.viewMode,
        tabs: s.tabs,
        activeTabId: s.activeTabId,
        area: s.area,
        organization: s.organization,
        project: s.project,
        theme: s.theme,
        language: s.language,
      }),
    }
  )
)
