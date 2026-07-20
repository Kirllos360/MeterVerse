export type EventHandler<T> = (payload: T) => void | Promise<void>
export type SubscribeOptions = { once?: boolean; priority?: number }
export type Unsubscribe = () => void

export interface Event<T> {
  subscribe(handler: EventHandler<T>, options?: SubscribeOptions): Unsubscribe
  dispatch(payload: T): Promise<void>
  clear(): void
  subscriberCount(): number
}

export class TypedEvent<T> implements Event<T> {
  private handlers: { handler: EventHandler<T>; options?: SubscribeOptions; id: number }[] = []
  private nextId = 0

  subscribe(handler: EventHandler<T>, options?: SubscribeOptions): Unsubscribe {
    const id = this.nextId++
    this.handlers.push({ handler, options, id })
    return () => {
      this.handlers = this.handlers.filter((h) => h.id !== id)
    }
  }

  async dispatch(payload: T): Promise<void> {
    const sorted = [...this.handlers].sort((a, b) => (b.options?.priority ?? 0) - (a.options?.priority ?? 0))
    const toRemove: number[] = []
    for (const h of sorted) {
      try {
        await h.handler(payload)
      } catch (e) {
        console.error(`[Event] Handler error:`, e)
      }
      if (h.options?.once) toRemove.push(h.id)
    }
    if (toRemove.length) this.handlers = this.handlers.filter((h) => !toRemove.includes(h.id))
  }

  clear(): void { this.handlers = [] }
  subscriberCount(): number { return this.handlers.length }
}

export interface EventDispatcher {
  createEvent<T>(name: string): Event<T>
  getEvent<T>(name: string): Event<T> | undefined
  dispatch<T>(eventType: string, payload: T): Promise<void>
  subscribe<T>(eventType: string, handler: EventHandler<T>, options?: SubscribeOptions): Unsubscribe
  clearAll(): void
}

export class RuntimeEventDispatcher implements EventDispatcher {
  private events = new Map<string, TypedEvent<unknown>>()

  createEvent<T>(name: string): Event<T> {
    if (this.events.has(name)) throw new Error(`Event "${name}" already exists`)
    const event = new TypedEvent<T>()
    this.events.set(name, event as unknown as TypedEvent<unknown>)
    return event
  }

  getEvent<T>(name: string): Event<T> | undefined {
    return this.events.get(name) as unknown as Event<T> | undefined
  }

  async dispatch<T>(eventType: string, payload: T): Promise<void> {
    const event = this.events.get(eventType)
    if (event) await (event as unknown as TypedEvent<T>).dispatch(payload)
  }

  subscribe<T>(eventType: string, handler: EventHandler<T>, options?: SubscribeOptions): Unsubscribe {
    const event = this.events.get(eventType)
    if (!event) throw new Error(`Event "${eventType}" not found. Create it first.`)
    return (event as unknown as TypedEvent<T>).subscribe(handler, options)
  }

  clearAll(): void {
    this.events.forEach((e) => e.clear())
    this.events.clear()
  }
}
