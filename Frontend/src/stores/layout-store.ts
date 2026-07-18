"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type SidebarMode = "expanded" | "collapsed" | "dock" | "floating"
export type Density = "comfortable" | "compact" | "ultraCompact"

interface LayoutState {
  sidebarMode: SidebarMode
  sidebarWidth: number
  inspectorOpen: boolean
  inspectorWidth: number
  density: Density
  mobileMenuOpen: boolean
  setSidebarMode: (mode: SidebarMode) => void
  setSidebarWidth: (width: number) => void
  setInspectorOpen: (open: boolean) => void
  setInspectorWidth: (width: number) => void
  setDensity: (density: Density) => void
  setMobileMenuOpen: (open: boolean) => void
  toggleSidebar: () => void
  toggleInspector: () => void
  reset: () => void
}

const defaults = {
  sidebarMode: "expanded" as SidebarMode,
  sidebarWidth: 256,
  inspectorOpen: false,
  inspectorWidth: 360,
  density: "comfortable" as Density,
  mobileMenuOpen: false,
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      ...defaults,
      setSidebarMode: (sidebarMode) => set({ sidebarMode }),
      setSidebarWidth: (sidebarWidth) => set({ sidebarWidth: Math.max(48, Math.min(480, sidebarWidth)) }),
      setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }),
      setInspectorWidth: (inspectorWidth) => set({ inspectorWidth: Math.max(280, Math.min(512, inspectorWidth)) }),
      setDensity: (density) => set({ density }),
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
      toggleSidebar: () =>
        set((s) => ({
          sidebarMode: s.sidebarMode === "expanded" ? "collapsed" : "expanded",
        })),
      toggleInspector: () => set((s) => ({ inspectorOpen: !s.inspectorOpen })),
      reset: () => set(defaults),
    }),
    { name: "meterverse-layout" }
  )
)
