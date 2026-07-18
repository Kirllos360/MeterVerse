"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type PanelLayout = "single" | "split-vertical" | "three-panel" | "dashboard"

interface WorkspaceState {
  activeWorkspace: string | null
  activeArea: string | null
  activeOrganization: string | null
  activeProject: string | null
  panelLayout: PanelLayout
  breadcrumbs: { label: string; href?: string }[]
  previousRoute: string | null
  setActiveWorkspace: (id: string | null) => void
  setActiveArea: (id: string | null) => void
  setActiveOrganization: (id: string | null) => void
  setActiveProject: (id: string | null) => void
  setPanelLayout: (layout: PanelLayout) => void
  setBreadcrumbs: (breadcrumbs: { label: string; href?: string }[]) => void
  setPreviousRoute: (route: string | null) => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspace: null,
      activeArea: null,
      activeOrganization: null,
      activeProject: null,
      panelLayout: "three-panel",
      breadcrumbs: [],
      previousRoute: null,
      setActiveWorkspace: (id) => set({ activeWorkspace: id }),
      setActiveArea: (id) => set({ activeArea: id }),
      setActiveOrganization: (id) => set({ activeOrganization: id }),
      setActiveProject: (id) => set({ activeProject: id }),
      setPanelLayout: (panelLayout) => set({ panelLayout }),
      setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
      setPreviousRoute: (previousRoute) => set({ previousRoute }),
    }),
    { name: "meterverse-workspace" }
  )
)
