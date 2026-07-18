export enum WindowState {
  CLOSED = "closed",
  OPENED = "opened",
  FOCUSED = "focused",
  MINIMIZED = "minimized",
  RESTORED = "restored",
}

export interface WindowSize {
  width: number
  height: number
}

export interface WindowPosition {
  x: number
  y: number
}

export interface OpenOptions {
  position?: WindowPosition
  size?: WindowSize
  title?: string
}

export interface WindowSnapshot {
  id: string
  programId: string
  state: WindowState
  position: WindowPosition
  size: WindowSize
}

export interface WindowStateChange {
  windowId: string
  previousState: WindowState
  newState: WindowState
}

export interface ResizeEvent {
  windowId: string
  previousSize: WindowSize
  newSize: WindowSize
}

export interface MoveEvent {
  windowId: string
  previousPosition: WindowPosition
  newPosition: WindowPosition
}

export interface FocusChange {
  windowId: string
  hasFocus: boolean
}

export interface ProgramWindow {
  readonly id: string
  readonly programId: string
  state: WindowState
  position: WindowPosition
  size: WindowSize
  minSize: WindowSize
  maxSize?: WindowSize

  open(options?: OpenOptions): Promise<void>
  close(): Promise<void>
  focus(): Promise<void>
  blur(): Promise<void>
  minimize(): Promise<void>
  restore(): Promise<void>

  getState(): WindowSnapshot
  restoreState(snapshot: WindowSnapshot): Promise<void>

  onStateChange: import("../kernel/events").Event<WindowStateChange>
  onResize: import("../kernel/events").Event<ResizeEvent>
  onMove: import("../kernel/events").Event<MoveEvent>
  onFocusChange: import("../kernel/events").Event<FocusChange>
}
