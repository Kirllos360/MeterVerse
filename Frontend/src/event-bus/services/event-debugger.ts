import type { EventEnvelope } from "../core/event-bus"
import { TypedEvent } from "@/runtime/kernel/events"

export interface CapturedEvent {
  event: EventEnvelope
  capturedAt: number
  queueDuration: number
}

export class EventDebuggerService {
  private _active = false
  private _captured: CapturedEvent[] = []
  private _breakpoints = new Set<string>()
  private _stepMode = false
  private _paused = false
  private _pendingQueue: EventEnvelope[] = []

  onCaptured = new TypedEvent<CapturedEvent>()
  onBreakpointHit = new TypedEvent<string>()

  get active() { return this._active }
  get captured() { return [...this._captured] }
  get stepMode() { return this._stepMode }

  start(): void {
    this._active = true
    this._captured = []
  }

  stop(): void {
    this._active = false
  }

  clear(): void {
    this._captured = []
    this._pendingQueue = []
  }

  capture(event: EventEnvelope): void {
    if (!this._active) return
    const captured: CapturedEvent = {
      event,
      capturedAt: Date.now(),
      queueDuration: Date.now() - event.timestamp,
    }
    this._captured.push(captured)
    if (this._captured.length > 10000) this._captured.splice(0, this._captured.length - 10000)
    this.onCaptured.dispatch(captured)

    if (this._breakpoints.has(event.type)) {
      this.onBreakpointHit.dispatch(event.type)
    }

    if (this._stepMode) {
      this._paused = true
      this._pendingQueue.push(event)
    }
  }

  addBreakpoint(eventType: string): void { this._breakpoints.add(eventType) }
  removeBreakpoint(eventType: string): void { this._breakpoints.delete(eventType) }
  listBreakpoints(): string[] { return Array.from(this._breakpoints) }

  setStepMode(enabled: boolean): void {
    this._stepMode = enabled
    if (!enabled) {
      this._paused = false
      this._pendingQueue = []
    }
  }

  stepForward(): CapturedEvent | null {
    if (!this._paused || !this._pendingQueue.length) return null
    const event = this._pendingQueue.shift()!
    if (this._pendingQueue.length === 0) this._paused = false
    return this._captured.find((c) => c.event.id === event.id) || null
  }

  export(): CapturedEvent[] { return this._captured }
  import(events: CapturedEvent[]): void { this._captured.push(...events) }
}
