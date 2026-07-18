// Runtime Kernel — Phase 17A Implementation
// The heart of MeterVerse. Every application runs inside the runtime.
// Nothing bypasses it.

export { RuntimeKernel } from "./kernel/runtime"
export { RuntimeProgramManager } from "./kernel/program"
export { RuntimeWindowManager, RuntimeProgramWindow } from "./kernel/window"
export { RuntimeFocusManager } from "./kernel/focus"
export { RuntimeSelectionManager } from "./kernel/selection"
export { RuntimeNavigationManager } from "./kernel/navigation"
export { RuntimeHistoryManager } from "./kernel/history"
export { RuntimeEventDispatcher, TypedEvent } from "./kernel/events"
export { RuntimeServiceContainer } from "./kernel/services"

export { RuntimeProvider, getRuntime, useRuntimeContext } from "./providers/runtime-provider"

export { useRuntime, useProgram, useFocus, useSelection, useHistory } from "./hooks/useRuntime"

export { RuntimeProgramHost } from "./host/program-host"

export { SnapshotEngineImpl } from "./snapshot/engine"

export { RuntimeEventTypes } from "./events/runtime-events"

export { bootstrapRuntime } from "./bootstrap/index"

export type { RuntimeContext, RuntimeSnapshot, RuntimeOptions, ProgramSnapshot } from "./contracts/runtime"
export type { ProgramContract, ProgramLifecycle, ProgramRegistration, ProgramMetadata, ProgramState, ProgramHost, NavigationTarget } from "./contracts/program"
export type { ProgramWindow, WindowState, WindowSnapshot } from "./contracts/window"
export type { FocusManager, FocusChangeEvent } from "./kernel/focus"
export type { SelectionManager, SelectionChangeEvent, SelectableEntity } from "./kernel/selection"
export type { NavigationManager, NavigationEvent } from "./kernel/navigation"
export type { HistoryManager, HistoryEntry, HistoryChangeEvent } from "./kernel/history"
export type { EventDispatcher, EventHandler } from "./kernel/events"
export type { ServiceContainer } from "./kernel/services"
