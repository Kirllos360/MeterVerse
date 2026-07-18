import { WindowState, type ProgramWindow, type WindowSnapshot, type WindowPosition, type WindowSize, type OpenOptions, type WindowStateChange, type ResizeEvent, type MoveEvent, type FocusChange } from "../contracts/window"
import { TypedEvent } from "./events"

export interface WindowFactory {
  (programId: string, options?: OpenOptions): ProgramWindow
}

export interface WindowManager {
  readonly windows: Map<string, ProgramWindow>
  readonly activeWindowId: string | null

  register(type: string, factory: WindowFactory): void
  create(programId: string, options?: OpenOptions): Promise<ProgramWindow>
  destroy(windowId: string): Promise<void>
  get(windowId: string): ProgramWindow | undefined
  getByProgram(programId: string): ProgramWindow[]
  getAll(): ProgramWindow[]
  focus(windowId: string): Promise<void>
  getFocused(): ProgramWindow | undefined

  onWindowCreated: TypedEvent<ProgramWindow>
  onWindowDestroyed: TypedEvent<string>
  onFocusChange: TypedEvent<FocusChange>
}

export class RuntimeWindowManager implements WindowManager {
  readonly windows = new Map<string, ProgramWindow>()
  activeWindowId: string | null = null
  private factories = new Map<string, WindowFactory>()
  private nextId = 1

  onWindowCreated = new TypedEvent<ProgramWindow>()
  onWindowDestroyed = new TypedEvent<string>()
  onFocusChange = new TypedEvent<FocusChange>()

  register(type: string, factory: WindowFactory): void {
    this.factories.set(type, factory)
  }

  async create(programId: string, options?: OpenOptions): Promise<ProgramWindow> {
    const factory = this.factories.get("default") || ((pid: string) => new RuntimeProgramWindow(pid, this))
    const window = factory(programId, options)
    this.windows.set(window.id, window)
    await window.open(options)
    this.onWindowCreated.dispatch(window)
    return window
  }

  async destroy(windowId: string): Promise<void> {
    this.windows.delete(windowId)
    if (this.activeWindowId === windowId) this.activeWindowId = null
    this.onWindowDestroyed.dispatch(windowId)
  }

  get(windowId: string): ProgramWindow | undefined {
    return this.windows.get(windowId)
  }

  getByProgram(programId: string): ProgramWindow[] {
    return Array.from(this.windows.values()).filter((w) => w.programId === programId)
  }

  getAll(): ProgramWindow[] {
    return Array.from(this.windows.values())
  }

  getFocused(): ProgramWindow | undefined {
    return this.activeWindowId ? this.windows.get(this.activeWindowId) : undefined
  }

  async focus(windowId: string): Promise<void> {
    const previous = this.activeWindowId
    this.activeWindowId = windowId
    this.onFocusChange.dispatch({ windowId, hasFocus: true })
    if (previous) this.onFocusChange.dispatch({ windowId: previous, hasFocus: false })
  }
}

export class RuntimeProgramWindow implements ProgramWindow {
  readonly id: string
  readonly programId: string
  state: WindowState = WindowState.CLOSED
  position: WindowPosition = { x: 100, y: 100 }
  size: WindowSize = { width: 800, height: 600 }
  minSize: WindowSize = { width: 400, height: 300 }
  maxSize?: WindowSize

  onStateChange = new TypedEvent<WindowStateChange>()
  onResize = new TypedEvent<ResizeEvent>()
  onMove = new TypedEvent<MoveEvent>()
  onFocusChange = new TypedEvent<FocusChange>()

  constructor(programId: string, private manager: RuntimeWindowManager) {
    this.id = `win_${programId}_${Date.now()}`
    this.programId = programId
  }

  async open(options?: OpenOptions): Promise<void> {
    this.state = WindowState.OPENED
    if (options?.position) this.position = options.position
    if (options?.size) this.size = options.size
  }

  async close(): Promise<void> {
    this.state = WindowState.CLOSED
  }

  async focus(): Promise<void> {
    const previous = this.state
    this.state = WindowState.FOCUSED
    await this.manager.focus(this.id)
    this.onStateChange.dispatch({ windowId: this.id, previousState: previous, newState: WindowState.FOCUSED })
  }

  async blur(): Promise<void> {
    this.state = WindowState.OPENED
  }

  async minimize(): Promise<void> {
    const previous = this.state
    this.state = WindowState.MINIMIZED
    this.onStateChange.dispatch({ windowId: this.id, previousState: previous, newState: WindowState.MINIMIZED })
  }

  async restore(): Promise<void> {
    const previous = this.state
    this.state = WindowState.RESTORED
    this.onStateChange.dispatch({ windowId: this.id, previousState: previous, newState: WindowState.RESTORED })
  }

  getState(): WindowSnapshot {
    return { id: this.id, programId: this.programId, state: this.state, position: { ...this.position }, size: { ...this.size } }
  }

  async restoreState(snapshot: WindowSnapshot): Promise<void> {
    this.state = snapshot.state
    this.position = { ...snapshot.position }
    this.size = { ...snapshot.size }
  }
}
