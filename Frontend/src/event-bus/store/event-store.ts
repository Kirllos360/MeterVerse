import type { EventEnvelope } from "../core/event-bus"

export interface EventQuery {
  types?: string[]
  fromTimestamp?: number
  toTimestamp?: number
  priority?: { min?: number; max?: number }
  correlationId?: string
  limit?: number
  offset?: number
}

export interface EventStoreStats {
  totalEvents: number
  oldestEvent: number
  newestEvent: number
  storageSize: number
}

export class EventStore {
  private events: EventEnvelope[] = []
  private maxEvents = 10000

  async store(event: EventEnvelope): Promise<void> {
    this.events.push(event)
    if (this.events.length > this.maxEvents) {
      this.events.splice(0, this.events.length - this.maxEvents)
    }
  }

  async storeBatch(events: EventEnvelope[]): Promise<void> {
    for (const event of events) await this.store(event)
  }

  async get(eventId: string): Promise<EventEnvelope | null> {
    return this.events.find((e) => e.id === eventId) || null
  }

  async query(query: EventQuery): Promise<EventEnvelope[]> {
    let result = [...this.events]
    if (query.types) result = result.filter((e) => query.types!.some((t) => e.type.startsWith(t)))
    if (query.fromTimestamp) result = result.filter((e) => e.timestamp >= query.fromTimestamp!)
    if (query.toTimestamp) result = result.filter((e) => e.timestamp <= query.toTimestamp!)
    if (query.correlationId) result = result.filter((e) => e.correlationId === query.correlationId)
    if (query.priority) {
      if (query.priority.min !== undefined) result = result.filter((e) => e.priority >= query.priority!.min!)
      if (query.priority.max !== undefined) result = result.filter((e) => e.priority <= query.priority!.max!)
    }
    result.sort((a, b) => b.timestamp - a.timestamp)
    if (query.offset) result = result.slice(query.offset)
    if (query.limit) result = result.slice(0, query.limit)
    return result
  }

  async getByCorrelationId(correlationId: string): Promise<EventEnvelope[]> {
    return this.query({ correlationId })
  }

  async getByType(eventType: string, limit = 100): Promise<EventEnvelope[]> {
    return this.query({ types: [eventType], limit })
  }

  async count(query?: EventQuery): Promise<number> {
    if (!query) return this.events.length
    return (await this.query(query)).length
  }

  stats(): EventStoreStats {
    return {
      totalEvents: this.events.length,
      oldestEvent: this.events[0]?.timestamp || 0,
      newestEvent: this.events[this.events.length - 1]?.timestamp || 0,
      storageSize: new Blob([JSON.stringify(this.events)]).size,
    }
  }

  async getAll(): Promise<EventEnvelope[]> {
    return [...this.events]
  }
}
