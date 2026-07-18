export const RuntimeEventTypes = {
  // Runtime lifecycle
  INITIALIZED: "runtime:initialized",
  SUSPENDING: "runtime:suspending",
  RESUMED: "runtime:resumed",
  SHUTDOWN: "runtime:shutdown",
  ERROR: "runtime:error",

  // Program lifecycle
  PROGRAM_MOUNTED: "runtime:program:mounted",
  PROGRAM_INITIALIZED: "runtime:program:initialized",
  PROGRAM_ACTIVATED: "runtime:program:activated",
  PROGRAM_DEACTIVATED: "runtime:program:deactivated",
  PROGRAM_SUSPENDED: "runtime:program:suspended",
  PROGRAM_RESUMED: "runtime:program:resumed",
  PROGRAM_DESTROYED: "runtime:program:destroyed",
  PROGRAM_STATE_CHANGED: "runtime:program:stateChanged",

  // Window
  WINDOW_CREATED: "runtime:window:created",
  WINDOW_DESTROYED: "runtime:window:destroyed",
  WINDOW_FOCUS_CHANGED: "runtime:window:focusChanged",

  // Focus
  FOCUS_CHANGED: "runtime:focus:changed",

  // Selection
  SELECTION_CHANGED: "runtime:selection:changed",
  SELECTION_CLEARED: "runtime:selection:cleared",

  // Navigation
  NAVIGATION_CHANGED: "runtime:navigation:changed",

  // History
  HISTORY_CHANGED: "runtime:history:changed",
} as const

export type RuntimeEventType = (typeof RuntimeEventTypes)[keyof typeof RuntimeEventTypes]

export interface RuntimeEventPayloads {
  [RuntimeEventTypes.INITIALIZED]: { sessionId: string }
  [RuntimeEventTypes.SUSPENDING]: { reason: string }
  [RuntimeEventTypes.RESUMED]: { sessionId: string }
  [RuntimeEventTypes.SHUTDOWN]: { reason: string }
  [RuntimeEventTypes.ERROR]: { error: string }
  [RuntimeEventTypes.PROGRAM_MOUNTED]: { programId: string }
  [RuntimeEventTypes.PROGRAM_ACTIVATED]: { programId: string }
  [RuntimeEventTypes.PROGRAM_DEACTIVATED]: { programId: string }
  [RuntimeEventTypes.PROGRAM_DESTROYED]: { programId: string }
  [RuntimeEventTypes.PROGRAM_STATE_CHANGED]: { programId: string; from: string; to: string }
  [RuntimeEventTypes.FOCUS_CHANGED]: { programId: string | null }
  [RuntimeEventTypes.SELECTION_CHANGED]: { entityType: string; entityIds: string[] }
  [RuntimeEventTypes.NAVIGATION_CHANGED]: { programId: string }
  [RuntimeEventTypes.HISTORY_CHANGED]: { entryCount: number }
}
