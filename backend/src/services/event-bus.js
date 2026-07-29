import logger from "./logger.js"

export class EventBus {
  constructor() {
    this.listeners = new Map()
    this.history = []
    this.maxHistory = 1000
    this.enabled = true
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, [])
    this.listeners.get(event).push(callback)
    return () => this.off(event, callback)
  }

  off(event, callback) {
    const cbs = this.listeners.get(event)
    if (cbs) this.listeners.set(event, cbs.filter(c => c !== callback))
  }

  emit(event, data = {}) {
    if (!this.enabled) return
    const entry = { event, data, timestamp: new Date().toISOString(), correlationId: data.correlationId || "evt-" + Date.now() }
    this.history.push(entry)
    if (this.history.length > this.maxHistory) this.history.shift()

    const cbs = this.listeners.get(event) || []
    const wildcard = this.listeners.get("*") || []

    for (const cb of [...cbs, ...wildcard]) {
      try {
        cb(entry)
      } catch (e) {
        logger.error({ event, error: e.message, component: "event-bus" }, "Event handler error")
      }
    }
  }

  // Async version — doesn't block the caller
  emitAsync(event, data = {}) {
    setImmediate(() => this.emit(event, data))
  }

  getHistory(event) {
    if (event) return this.history.filter(h => h.event === event).slice(-100)
    return this.history.slice(-100)
  }

  getStats() {
    const eventCounts = {}
    for (const h of this.history) {
      eventCounts[h.event] = (eventCounts[h.event] || 0) + 1
    }
    return {
      totalEvents: this.history.length,
      listeners: Array.from(this.listeners.entries()).map(([e, cbs]) => ({ event: e, count: cbs.length })),
      topEvents: Object.entries(eventCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([e, c]) => ({ event: e, count: c })),
      enabled: this.enabled,
    }
  }
}
