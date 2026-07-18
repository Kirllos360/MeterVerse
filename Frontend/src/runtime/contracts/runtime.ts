import type { ProgramContract, ProgramRegistration } from "./program"
import type { ProgramWindow, WindowSnapshot } from "./window"
import type { FocusManager } from "../kernel/focus"
import type { SelectionManager } from "../kernel/selection"
import type { NavigationManager } from "../kernel/navigation"
import type { HistoryManager } from "../kernel/history"
import type { EventDispatcher } from "../kernel/events"
import type { ServiceContainer } from "../kernel/services"
import type { ProgramManager } from "../kernel/program"
import type { WindowManager } from "../kernel/window"

export interface RuntimeContext {
  readonly sessionId: string
  readonly programs: ProgramManager
  readonly windows: WindowManager
  readonly focus: FocusManager
  readonly selection: SelectionManager
  readonly navigation: NavigationManager
  readonly history: HistoryManager
  readonly events: EventDispatcher
  readonly services: ServiceContainer

  suspendAll(): Promise<void>
  resumeAll(): Promise<void>
  destroyAll(): Promise<void>

  snapshot(): RuntimeSnapshot
  restore(snapshot: RuntimeSnapshot): Promise<void>
}

export interface RuntimeSnapshot {
  id: string
  timestamp: number
  version: string
  sessionId: string
  programs: ProgramSnapshot[]
  windows: WindowSnapshot[]
  workspace: WorkspaceSnapshot
  focus: FocusSnapshot
  selection: SelectionSnapshot
  navigation: NavigationSnapshot
  history: import("./program").Unsubscribe[]
}

export interface ProgramSnapshot {
  id: string
  state: string
  metadata: import("./program").ProgramMetadata
  window: WindowSnapshot
  customState?: Record<string, unknown>
}

export interface WorkspaceSnapshot {
  layout: string
  sidebarMode: string
  inspectorOpen: boolean
}

export interface FocusSnapshot {
  focusedProgramId: string | null
  focusStack: string[]
}

export interface SelectionSnapshot {
  selectedIds: string[]
  entityType?: string
}

export interface NavigationSnapshot {
  current: NavigationState
  stack: NavigationState[]
}

export interface NavigationState {
  programId: string
  route?: string
  params?: Record<string, string>
  title?: string
}

export interface RuntimeOptions {
  storageKey?: string
  maxHistorySize?: number
  autoSnapshot?: boolean
  snapshotInterval?: number
}
