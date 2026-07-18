import type { EventEnvelope } from "../core/event-bus"
import type { EventStore, EventQuery } from "../store/event-store"

export interface HistoryEntry {
  event: EventEnvelope
  processedAt: number
  subscriberCount: number
}

export interface HistoryStats {
  totalEvents: number
  uniqueTypes: number
  busiestHour: string
  eventsByType: Record<string, number>
}

export class EventHistoryService {
  constructor(private store: EventStore) {}

  async getHistory(query?: EventQuery): Promise<HistoryEntry[]> {
    const events = query ? await this.store.query(query) : await this.store.getAll()
    return events.map((e) => ({
      event: e,
      processedAt: Date.now(),
      subscriberCount: 0,
    }))
  }

  async getTimeline(options?: { interval?: string; from?: number; to?: number }): Promise<{ timeBucket: string; events: EventEnvelope[]; count: number }[]> {
    const events = await this.store.query({ fromTimestamp: options?.from, toTimestamp: options?.to })
    const buckets = new Map<string, EventEnvelope[]>()
    for (const event of events) {
      const date = new Date(event.timestamp)
      const bucket = date.toISOString().slice(0, 13) + ":00"
      if (!buckets.has(bucket)) buckets.set(bucket, [])
      buckets.get(bucket)!.push(event)
    }
    return Array.from(buckets.entries()).map(([timeBucket, evts]) => ({ timeBucket, events: evts, count: evts.length }))
  }

  async getStats(): Promise<HistoryStats> {
    const events = await this.store.getAll()
    const types = new Set(events.map((e) => e.type.split(".")[0]))
    const byType: Record<string, number> = {}
    for (const event of events) {
      const prefix = event.type.split(".")[0]
      byType[prefix] = (byType[prefix] || 0) + 1
    }
    return {
      totalEvents: events.length,
      uniqueTypes: types.size,
      busiestHour: "—",
      eventsByType: byType,
    }
  }
}
