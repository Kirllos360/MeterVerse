import { create } from "zustand"
import { persist } from "zustand/middleware"

export type LayoutPresetId = "default" | "focus" | "analytics" | "table" | "editor" | "presentation" | "compact"

export interface LayoutPreset {
  id: LayoutPresetId
  label: string
  sidebarMode: "expanded" | "collapsed" | "dock" | "floating"
  inspectorOpen: boolean
  inspectorWidth: number
  density: "comfortable" | "compact" | "ultraCompact"
  topbarVisible: boolean
  statusbarVisible: boolean
}

const presets: Record<LayoutPresetId, LayoutPreset> = {
  default: { id: "default", label: "Default", sidebarMode: "expanded", inspectorOpen: false, inspectorWidth: 360, density: "comfortable", topbarVisible: true, statusbarVisible: true },
  focus: { id: "focus", label: "Focus", sidebarMode: "dock", inspectorOpen: false, inspectorWidth: 360, density: "comfortable", topbarVisible: false, statusbarVisible: false },
  analytics: { id: "analytics", label: "Analytics", sidebarMode: "collapsed", inspectorOpen: true, inspectorWidth: 400, density: "compact", topbarVisible: true, statusbarVisible: true },
  table: { id: "table", label: "Table", sidebarMode: "collapsed", inspectorOpen: false, inspectorWidth: 360, density: "ultraCompact", topbarVisible: true, statusbarVisible: true },
  editor: { id: "editor", label: "Editor", sidebarMode: "expanded", inspectorOpen: true, inspectorWidth: 400, density: "comfortable", topbarVisible: true, statusbarVisible: true },
  presentation: { id: "presentation", label: "Presentation", sidebarMode: "floating", inspectorOpen: false, inspectorWidth: 360, density: "comfortable", topbarVisible: false, statusbarVisible: false },
  compact: { id: "compact", label: "Compact", sidebarMode: "collapsed", inspectorOpen: false, inspectorWidth: 320, density: "ultraCompact", topbarVisible: true, statusbarVisible: false },
}

interface LayoutPresetState {
  activePreset: LayoutPresetId
  userPresets: Partial<Record<LayoutPresetId, Partial<LayoutPreset>>>
  setPreset: (id: LayoutPresetId) => void
  customizePreset: (id: LayoutPresetId, overrides: Partial<LayoutPreset>) => void
  getActiveConfig: () => LayoutPreset
  resetPreset: (id: LayoutPresetId) => void
}

export const useLayoutPresets = create<LayoutPresetState>()(
  persist(
    (set, get) => ({
      activePreset: "default",
      userPresets: {},

      setPreset: (id) => set({ activePreset: id }),

      customizePreset: (id, overrides) =>
        set((s) => ({
          userPresets: { ...s.userPresets, [id]: { ...s.userPresets[id], ...overrides } },
        })),

      getActiveConfig: () => {
        const { activePreset, userPresets } = get()
        const base = presets[activePreset]
        const overrides = userPresets[activePreset]
        return overrides ? { ...base, ...overrides } : base
      },

      resetPreset: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.userPresets
          return { userPresets: rest }
        }),
    }),
    { name: "meterverse-layout-presets" }
  )
)
