import { TypedEvent } from "@/runtime/kernel/events"
import { EventStore } from "../store/event-store"
import { EventVersionManager } from "../services/event-versioning"
import { EventFilter } from "./event-filter"

export type EventHandler<T> = (payload: T) => void | Promise<void>
export type Unsubscribe = () => void

export enum EventPriority {
  CRITICAL = 0,
  HIGH = 100,
  NORMAL = 500,
  LOW = 900,
  BACKGROUND = 999,
}

export interface EventEnvelope<T = unknown> {
  readonly id: string
  readonly type: string
  readonly version: number
  readonly timestamp: number
  readonly source: EventSource
  readonly payload: T
  readonly correlationId: string
  readonly causationId?: string
  readonly priority: number
  readonly schemaVersion: number
  readonly metadata: Record<string, unknown>
}

export interface EventSource {
  id: string
  type: "runtime" | "workspace" | "registry" | "program" | "plugin" | "user" | "system"
  name: string
}

export interface SubscribeOptions {
  once?: boolean
  priority?: number
  channel?: string
  filter?: EventFilter
  throttle?: number
  debounce?: number
}

export interface PublishedEvent {
  id: string
  envelope: EventEnvelope
  filtered?: boolean
}

export interface EventBus {
  readonly id: string
  readonly version: string

  publish<T>(type: string, payload: T, options?: { priority?: number; source?: EventSource; correlationId?: string }): Promise<PublishedEvent>
  subscribe<T>(type: string, handler: EventHandler<T>, options?: SubscribeOptions): Unsubscribe
  unsubscribe(subscription: Unsubscribe): void
  clear(): void

  getStore(): EventStore
  getVersionManager(): EventVersionManager

  onEvent: TypedEvent<EventEnvelope>
}

export class RuntimeEventBus implements EventBus {
  readonly id = `bus_${Date.now()}`
  readonly version = "1.0.0"
  readonly onEvent = new TypedEvent<EventEnvelope>()

  private handlers = new Map<string, { handler: EventHandler<unknown>; options?: SubscribeOptions; id: number }[]>()
  private nextId = 0
  private store: EventStore
  private versionManager: EventVersionManager

  constructor(store?: EventStore, versionManager?: EventVersionManager) {
    this.store = store || new EventStore()
    this.versionManager = versionManager || new EventVersionManager()
  }

  async publish<T>(type: string, payload: T, options?: { priority?: number; source?: EventSource; correlationId?: string }): Promise<PublishedEvent> {
    const envelope: EventEnvelope<T> = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      version: 1,
      timestamp: Date.now(),
      source: options?.source || { id: "system", type: "system", name: "System" },
      payload,
      correlationId: options?.correlationId || `corr_${Date.now()}`,
      priority: options?.priority ?? EventPriority.NORMAL,
      schemaVersion: 1,
      metadata: {},
    }

    // Store event
    await this.store.store(envelope)

    // Dispatch to handlers
    const handlers = this.handlers.get(type) || []
    const sorted = [...handlers].sort((a, b) => (b.options?.priority ?? EventPriority.NORMAL) - (a.options?.priority ?? EventPriority.NORMAL))

    for (const h of sorted) {
      try {
        // Apply filter if present
        if (h.options?.filter && !h.options.filter.matches(envelope as unknown as Record<string, unknown>)) continue
        await h.handler(envelope.payload)
      } catch (e) {
        console.error(`[EventBus] Handler error for ${type}:`, e)
      }
    }

    // Dispatch to wildcard handlers
    const wildcardHandlers = this.handlers.get("*") || []
    for (const h of wildcardHandlers) {
      try { await h.handler(envelope) } catch {}
    }

    this.onEvent.dispatch(envelope as unknown as EventEnvelope)
    return { id: envelope.id, envelope: envelope as unknown as EventEnvelope }
  }

  subscribe<T>(type: string, handler: EventHandler<T>, options?: SubscribeOptions): Unsubscribe {
    const id = this.nextId++
    if (!this.handlers.has(type)) this.handlers.set(type, [])
    this.handlers.get(type)!.push({ handler: handler as EventHandler<unknown>, options, id })
    return () => {
      const list = this.handlers.get(type)
      if (list) {
        const idx = list.findIndex((h) => h.id === id)
        if (idx >= 0) list.splice(idx, 1)
      }
    }
  }

  unsubscribe(subscription: Unsubscribe): void {
    subscription()
  }

  clear(): void {
    this.handlers.clear()
  }

  getStore(): EventStore { return this.store }
  getVersionManager(): EventVersionManager { return this.versionManager }
}
