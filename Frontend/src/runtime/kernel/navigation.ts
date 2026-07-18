import { TypedEvent } from "./events"
import type { NavigationTarget } from "../contracts/program"
import type { NavigationState, NavigationSnapshot } from "../contracts/runtime"

export interface NavigationResult {
  success: boolean
  programId?: string
  error?: string
}

export interface NavigationEvent {
  from: NavigationState | null
  to: NavigationState
  type: "navigation" | "program" | "tab"
}

export interface TabChangeEvent {
  tabId: string
  programId: string
  action: "created" | "activated" | "closed"
}

export interface OpenProgramOptions {
  inNewTab?: boolean
  params?: Record<string, string>
  focus?: boolean
}

export interface NavigationManager {
  readonly current: NavigationState | null
  readonly stack: NavigationState[]
  readonly canGoBack: boolean
  readonly canGoForward: boolean

  navigate(target: NavigationTarget, options?: OpenProgramOptions): Promise<NavigationResult>
  openProgram(programId: string, options?: OpenProgramOptions): Promise<NavigationResult>
  closeProgram(programId: string): Promise<void>
  goBack(): Promise<NavigationResult>
  goForward(): Promise<NavigationResult>

  onNavigate: TypedEvent<NavigationEvent>
}

export class RuntimeNavigationManager implements NavigationManager {
  private _stack: NavigationState[] = []
  private _currentIndex = -1

  onNavigate = new TypedEvent<NavigationEvent>()

  get current(): NavigationState | null {
    return this._currentIndex >= 0 ? this._stack[this._currentIndex] : null
  }

  get stack(): NavigationState[] { return [...this._stack] }
  get canGoBack(): boolean { return this._currentIndex > 0 }
  get canGoForward(): boolean { return this._currentIndex < this._stack.length - 1 }

  async navigate(target: NavigationTarget, options?: OpenProgramOptions): Promise<NavigationResult> {
    const from = this.current
    const state: NavigationState = {
      programId: target.programId || from?.programId || "",
      route: target.route,
      params: target.params,
      title: from?.title,
    }

    if (this._currentIndex < this._stack.length - 1) {
      this._stack = this._stack.slice(0, this._currentIndex + 1)
    }
    this._stack.push(state)
    this._currentIndex++
    if (this._stack.length > 100) { this._stack.shift(); this._currentIndex-- }

    this.onNavigate.dispatch({ from, to: state, type: "navigation" })
    return { success: true, programId: state.programId }
  }

  async openProgram(programId: string, options?: OpenProgramOptions): Promise<NavigationResult> {
    const state: NavigationState = { programId, title: programId }
    this._stack.push(state)
    this._currentIndex++
    this.onNavigate.dispatch({ from: null, to: state, type: "program" })
    return { success: true, programId }
  }

  async closeProgram(programId: string): Promise<void> {
    this._stack = this._stack.filter((s) => s.programId !== programId)
    if (this._currentIndex >= this._stack.length) this._currentIndex = this._stack.length - 1
  }

  async goBack(): Promise<NavigationResult> {
    if (!this.canGoBack) return { success: false, error: "No history to go back to" }
    const from = this.current
    this._currentIndex--
    const to = this.current!
    this.onNavigate.dispatch({ from, to, type: "navigation" })
    return { success: true, programId: to.programId }
  }

  async goForward(): Promise<NavigationResult> {
    if (!this.canGoForward) return { success: false, error: "No forward history" }
    const from = this.current
    this._currentIndex++
    const to = this.current!
    this.onNavigate.dispatch({ from, to, type: "navigation" })
    return { success: true, programId: to.programId }
  }
}
