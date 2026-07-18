"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"

export interface WorkspaceState {
  area: string
  organization: string
  project: string
  sidebarMode: "expanded" | "collapsed" | "dock" | "floating"
  sidebarWidth: number
  inspectorOpen: boolean
  inspectorWidth: number
  layoutPreset: string
  density: "comfortable" | "compact" | "ultraCompact"
  theme: string
  language: string
}

const WorkspaceCtx = createContext<WorkspaceState>({
  area: "October",
  organization: "Palm Hills",
  project: "Phase 1",
  sidebarMode: "expanded",
  sidebarWidth: 256,
  inspectorOpen: false,
  inspectorWidth: 360,
  layoutPreset: "default",
  density: "comfortable",
  theme: "adaptive",
  language: "en",
})

export function useWorkspace() {
  return useContext(WorkspaceCtx)
}

export function WorkspaceProvider({ children, value }: { children: ReactNode; value?: Partial<WorkspaceState> }) {
  const ctx = useMemo(() => ({ ...useContext(WorkspaceCtx), ...value }), [value])
  return <WorkspaceCtx.Provider value={ctx}>{children}</WorkspaceCtx.Provider>
}
