import type { ReactNode } from "react"

export interface ShellSlot {
  children?: ReactNode
  className?: string
}

export interface ShellContextType {
  sidebarMode: "expanded" | "collapsed" | "dock" | "floating"
  sidebarWidth: number
  inspectorOpen: boolean
  inspectorWidth: number
  setSidebarMode: (mode: ShellContextType["sidebarMode"]) => void
  setSidebarWidth: (width: number) => void
  setInspectorOpen: (open: boolean) => void
  setInspectorWidth: (width: number) => void
  isRTL: boolean
  isDark: boolean
  density: "comfortable" | "compact" | "ultraCompact"
}
