import type { EventBus, EventEnvelope } from "../core/event-bus"
import type { EventStore, EventQuery } from "../store/event-store"
import { TypedEvent } from "@/runtime/kernel/events"

export interface ReplayProgress {
  total: number
  replayed: number
  failed: number
  percentage: number
  currentEventId: string
}

export interface ReplayResult {
  totalEvents: number
  replayedEvents: number
  failedEvents: number
  duration: number
}

export class EventReplayService {
  private _cancelled = false
  onProgress = new TypedEvent<ReplayProgress>()

  constructor(private bus: EventBus, private store: EventStore) {}

  async replayAll(options?: { speed?: "instant" | number; skipErrors?: boolean }): Promise<ReplayResult> {
    this._cancelled = false
    const events = await this.store.getAll()
    return this.replayEvents(events, options)
  }

  async replayByType(eventType: string, options?: { speed?: "instant" | number; limit?: number }): Promise<ReplayResult> {
    this._cancelled = false
    const query: EventQuery = { types: [eventType], limit: options?.limit }
    const events = await this.store.query(query)
    return this.replayEvents(events, options)
  }

  async replayByCorrelationId(correlationId: string, options?: { speed?: "instant" | number }): Promise<ReplayResult> {
    this._cancelled = false
    const events = await this.store.getByCorrelationId(correlationId)
    return this.replayEvents(events, options)
  }

  async replayByTimeRange(from: number, to: number, options?: { speed?: "instant" | number }): Promise<ReplayResult> {
    this._cancelled = false
    const query: EventQuery = { fromTimestamp: from, toTimestamp: to }
    const events = await this.store.query(query)
    return this.replayEvents(events, options)
  }

  cancel(): void {
    this._cancelled = true
  }

  private async replayEvents(events: EventEnvelope[], options?: { speed?: "instant" | number; skipErrors?: boolean }): Promise<ReplayResult> {
    const start = Date.now()
    let replayed = 0
    let failed = 0
    const total = events.length

    for (const event of events) {
      if (this._cancelled) break
      if (options?.speed && options.speed !== "instant") {
        await new Promise((r) => setTimeout(r, options.speed as number))
      }
      try {
        await this.bus.publish(event.type, event.payload, { priority: event.priority, source: event.source, correlationId: event.correlationId })
        replayed++
      } catch {
        if (!options?.skipErrors) break
        failed++
      }
      this.onProgress.dispatch({ total, replayed, failed, percentage: Math.round((replayed / total) * 100), currentEventId: event.id })
    }

    return { totalEvents: total, replayedEvents: replayed, failedEvents: failed, duration: Date.now() - start }
  }
}
