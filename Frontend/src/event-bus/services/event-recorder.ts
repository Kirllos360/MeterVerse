import type { EventBus, EventEnvelope } from "../core/event-bus"

export interface Recording {
  id: string
  startedAt: number
  endedAt: number
  events: EventEnvelope[]
}

export class EventRecorderService {
  private _isRecording = false
  private _events: EventEnvelope[] = []
  private _startedAt = 0
  private unsub?: () => void

  get isRecording() { return this._isRecording }

  start(bus: EventBus): void {
    if (this._isRecording) return
    this._isRecording = true
    this._events = []
    this._startedAt = Date.now()
    this.unsub = bus.subscribe("*", (event: unknown) => {
      this._events.push(event as EventEnvelope)
    })
  }

  stop(): Recording {
    if (this.unsub) this.unsub()
    this._isRecording = false
    const recording: Recording = {
      id: `rec_${this._startedAt}`,
      startedAt: this._startedAt,
      endedAt: Date.now(),
      events: [...this._events],
    }
    this._events = []
    return recording
  }

  exportJSON(recording: Recording): string {
    return JSON.stringify(recording, null, 2)
  }
}
