import type { RuntimeContext, RuntimeSnapshot, RuntimeOptions } from "../contracts/runtime"
import { RuntimeProgramManager } from "./program"
import { RuntimeWindowManager } from "./window"
import { RuntimeFocusManager } from "./focus"
import { RuntimeSelectionManager } from "./selection"
import { RuntimeNavigationManager } from "./navigation"
import { RuntimeHistoryManager } from "./history"
import { RuntimeEventDispatcher } from "./events"
import { RuntimeServiceContainer } from "./services"

export class RuntimeKernel implements RuntimeContext {
  readonly sessionId: string
  readonly programs: RuntimeProgramManager
  readonly windows: RuntimeWindowManager
  readonly focus: RuntimeFocusManager
  readonly selection: RuntimeSelectionManager
  readonly navigation: RuntimeNavigationManager
  readonly history: RuntimeHistoryManager
  readonly events: RuntimeEventDispatcher
  readonly services: RuntimeServiceContainer
  readonly options: RuntimeOptions

  private initialized = false

  constructor(options: RuntimeOptions = {}) {
    this.sessionId = `ses_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296.toString(36).slice(2, 8)}`
    this.options = {
      storageKey: "mv:runtime",
      maxHistorySize: 100,
      autoSnapshot: true,
      snapshotInterval: 30000,
      ...options,
    }

    this.events = new RuntimeEventDispatcher()
    this.services = new RuntimeServiceContainer()
    this.programs = new RuntimeProgramManager()
    this.windows = new RuntimeWindowManager()
    this.focus = new RuntimeFocusManager()
    this.selection = new RuntimeSelectionManager()
    this.navigation = new RuntimeNavigationManager()
    this.history = new RuntimeHistoryManager()

    // Register core services
    this.services.register("runtime:kernel", this)
    this.services.register("runtime:programs", this.programs)
    this.services.register("runtime:windows", this.windows)
    this.services.register("runtime:focus", this.focus)
    this.services.register("runtime:selection", this.selection)
    this.services.register("runtime:navigation", this.navigation)
    this.services.register("runtime:history", this.history)
    this.services.register("runtime:events", this.events)
  }

  async initialize(): Promise<void> {
    if (this.initialized) return
    this.initialized = true

    // Create built-in events
    this.events.createEvent<{ sessionId: string }>("runtime:initialized")
    this.events.createEvent<{ reason: string }>("runtime:suspending")
    this.events.createEvent<{ sessionId: string }>("runtime:resumed")
    this.events.createEvent<{ reason: string }>("runtime:shutdown")
    this.events.createEvent<{ programId: string; from: string; to: string }>("runtime:program:stateChanged")
    this.events.createEvent<{ windowId: string; hasFocus: boolean }>("runtime:focus:changed")
    this.events.createEvent<{ programId: string }>("runtime:navigation:changed")
    this.events.createEvent<{ error: string }>("runtime:error")

    await this.events.dispatch("runtime:initialized", { sessionId: this.sessionId })
  }

  async suspendAll(): Promise<void> {
    await this.events.dispatch("runtime:suspending", { reason: "user" })
    await this.programs.suspendAll()
  }

  async resumeAll(): Promise<void> {
    await this.programs.resumeAll()
    await this.events.dispatch("runtime:resumed", { sessionId: this.sessionId })
  }

  async destroyAll(): Promise<void> {
    await this.programs.destroyAll()
    await this.events.dispatch("runtime:shutdown", { reason: "destroy" })
  }

  snapshot(): RuntimeSnapshot {
    return {
      id: `snap_${Date.now()}`,
      timestamp: Date.now(),
      version: "1.0.0",
      sessionId: this.sessionId,
      programs: this.programs.getAll().map((p) => ({
        id: p.id,
        state: p.state,
        metadata: p.metadata,
        window: { id: p.id, programId: p.id, state: "opened" as const, position: { x: 0, y: 0 }, size: { width: 800, height: 600 } },
        customState: {},
      })),
      windows: this.windows.getAll().map((w) => w.getState()),
      workspace: { layout: "default", sidebarMode: "expanded", inspectorOpen: false },
      focus: { focusedProgramId: this.focus.focusedProgram?.id ?? null, focusStack: this.focus.focusStack.map((f) => f.programId) },
      selection: { selectedIds: this.selection.selection.entities.map((e) => e.id), entityType: this.selection.selection.entities[0]?.type },
      navigation: { current: this.navigation.current ?? { programId: "" }, stack: this.navigation.stack },
      history: [],
    }
  }

  async restore(snapshot: RuntimeSnapshot): Promise<void> {
    this.programs.activeProgramId = snapshot.focus.focusedProgramId
  }
}
