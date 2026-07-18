import { create } from "zustand"
import { persist } from "zustand/middleware"

interface PersistedState {
  theme: string
  language: string
  density: "comfortable" | "compact" | "ultraCompact"
  sidebarMode: "expanded" | "collapsed" | "dock" | "floating"
  sidebarWidth: number
  inspectorOpen: boolean
  inspectorWidth: number
  layoutPreset: string
  recentPages: string[]
  pinnedPages: string[]
  activeWorkspace: string | null
  activeArea: string | null
  activeTab: string | null
  openTabs: { id: string; label: string; pinned?: boolean }[]
  panelLayouts: Record<string, { size: number; collapsed: boolean }>
}

interface PersistenceActions {
  update: (partial: Partial<PersistedState>) => void
  reset: () => void
}

type WorkspacePersistence = PersistedState & PersistenceActions

const defaults: PersistedState = {
  theme: "adaptive",
  language: "en",
  density: "comfortable",
  sidebarMode: "expanded",
  sidebarWidth: 256,
  inspectorOpen: false,
  inspectorWidth: 360,
  layoutPreset: "default",
  recentPages: [],
  pinnedPages: [],
  activeWorkspace: null,
  activeArea: null,
  activeTab: null,
  openTabs: [],
  panelLayouts: {},
}

export const useWorkspacePersistence = create<WorkspacePersistence>()(
  persist(
    (set) => ({
      ...defaults,
      update: (partial) => set(partial),
      reset: () => set(defaults),
    }),
    {
      name: "meterverse-workspace",
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        density: state.density,
        sidebarMode: state.sidebarMode,
        sidebarWidth: state.sidebarWidth,
        inspectorOpen: state.inspectorOpen,
        inspectorWidth: state.inspectorWidth,
        layoutPreset: state.layoutPreset,
        recentPages: state.recentPages,
        pinnedPages: state.pinnedPages,
        activeWorkspace: state.activeWorkspace,
        activeArea: state.activeArea,
        panelLayouts: state.panelLayouts,
      }),
    }
  )
)
