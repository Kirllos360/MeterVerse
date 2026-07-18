import type { ProgramContract } from "@/runtime/contracts/program"

export type WorkspaceMode = "single" | "multi" | "split" | "floating"
export type SlotState = "loading" | "active" | "suspended" | "minimized" | "closed"
export type SlotType = "main" | "split" | "floating" | "detached"

export interface SlotPosition {
  row: number
  column: number
  order: number
}

export interface SlotSize {
  width: number | "auto"
  height: number | "auto"
  minWidth?: number
  minHeight?: number
}

export interface ProgramSlot {
  readonly id: string
  readonly program: ProgramContract
  position: SlotPosition
  size: SlotSize
  state: SlotState
  type: SlotType
  isFocused: boolean
  metadata: Record<string, unknown>
}

export interface WorkspaceState {
  mode: WorkspaceMode
  activeSlotId: string | null
  slots: ProgramSlot[]
  layout: WorkspaceLayout
  dock: DockState
  session: SessionInfo
}

export interface WorkspaceLayout {
  id: string
  name: string
  type: "single" | "split" | "grid" | "floating"
  columns: number
  rows: number
  splits: SplitConfig[]
  windows: WindowLayout[]
  dock: DockLayout
  inspector: InspectorLayout
}

export interface SplitConfig {
  direction: "horizontal" | "vertical"
  panels: string[]
  dividers: { index: number; position: number }[]
}

export interface WindowLayout {
  programId: string
  position: SlotPosition
  size: SlotSize
  state: SlotState
  isPinned: boolean
  tabHistory: string[]
}

export interface DockState {
  mode: DockMode
  pinnedItems: string[]
  recentItems: string[]
  expandedCategories: string[]
}

export type DockMode = "expanded" | "collapsed" | "dock" | "auto-hide"

export interface DockLayout {
  mode: DockMode
  pinnedItems: string[]
  recentItems: string[]
  expandedCategories: string[]
}

export interface InspectorLayout {
  isOpen: boolean
  width: number
  activeSection: string
}

export interface SessionInfo {
  id: string
  startedAt: number
  lastActivityAt: number
}

export interface WorkspaceSnapshot {
  version: number
  timestamp: number
  workspace: {
    mode: WorkspaceMode
    activeSlotId: string | null
    slots: SlotSnapshot[]
    layout: WorkspaceLayout
  }
  dock: DockSnapshot
  splits: SplitSnapshot[]
  floatingWindows: FloatingSnapshot[]
  tabs: TabSnapshot[]
  scrollPositions: Record<string, { x: number; y: number }>
}

export interface SlotSnapshot {
  id: string
  programId: string
  type: SlotType
  position: SlotPosition
  size: SlotSize
  state: SlotState
  customState?: Record<string, unknown>
}

export interface DockSnapshot {
  mode: DockMode
  pinnedItems: string[]
  recentItems: string[]
  expandedCategories: string[]
}

export interface SplitSnapshot {
  id: string
  direction: "horizontal" | "vertical"
  panels: string[]
  dividerPositions: number[]
}

export interface FloatingSnapshot {
  id: string
  programId: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  state: string
  zIndex: number
}

export interface TabSnapshot {
  id: string
  programId: string
  title: string
  isPinned: boolean
  isTemporary: boolean
  order: number
  scrollPosition?: { x: number; y: number }
}

export interface LayoutTemplate {
  id: string
  name: string
  description: string
  icon: string
  layout: WorkspaceLayout
  category: "productivity" | "monitoring" | "billing" | "admin"
  isDefault: boolean
  isBuiltin: boolean
}
