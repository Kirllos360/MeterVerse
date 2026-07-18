"use client"

import { useEffect, useState, useCallback } from "react"
import { getEventBus } from "../core/event-bus-provider"
import type { SubscribeOptions } from "../core/event-bus"

export function useEvent<T>(type: string, handler: (payload: T) => void, deps: unknown[] = [], options?: SubscribeOptions): void {
  useEffect(() => {
    const bus = getEventBus()
    const unsub = bus.subscribe(type, handler, options)
    return () => unsub()
  }, [type, ...deps])
}

export function usePublish() {
  const bus = getEventBus()
  return {
    publish: useCallback(<T>(type: string, payload: T, options?: { priority?: number; correlationId?: string }) => {
      return bus.publish(type, payload, options)
    }, [bus]),
  }
}

export function useEventHistory(eventType?: string, limit = 50) {
  const bus = getEventBus()
  const [events, setEvents] = useState<unknown[]>([])

  useEffect(() => {
    const load = async () => {
      const store = bus.getStore()
      const results = eventType
        ? await store.getByType(eventType, limit)
        : (await store.query({ limit }))
      setEvents(results)
    }
    load()
  }, [bus, eventType, limit])

  const refresh = useCallback(async () => {
    const store = bus.getStore()
    const results = eventType
      ? await store.getByType(eventType, limit)
      : (await store.query({ limit }))
    setEvents(results)
  }, [bus, eventType, limit])

  return { events, refresh, count: events.length }
}

export function useEventStats() {
  const bus = getEventBus()
  const [stats, setStats] = useState({ totalEvents: 0, uniqueTypes: 0, storageSize: 0 })

  useEffect(() => {
    const update = () => {
      const s = bus.getStore().stats()
      setStats({ totalEvents: s.totalEvents, uniqueTypes: 0, storageSize: s.storageSize })
    }
    update()
    const interval = setInterval(update, 5000)
    return () => clearInterval(interval)
  }, [bus])

  return stats
}
