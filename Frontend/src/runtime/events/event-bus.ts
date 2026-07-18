import { create } from "zustand"
import type { RuntimeEvent } from "../shared/types"

export type EventType =
  | "window.open" | "window.close" | "window.focus"
  | "panel.resize" | "panel.toggle"
  | "theme.changed" | "language.changed"
  | "workspace.changed" | "tab.changed"
  | "navigation.changed" | "selection.changed"
  | "layout.changed" | "density.changed"
  | "command.executed" | "application.opened"
  | "inspector.changed" | "toolbar.changed"

interface EventState {
  listeners: Map<string, Set<(event: RuntimeEvent) => void>>
  history: RuntimeEvent[]
  maxHistory: number
  subscribe: (type: EventType, handler: (event: RuntimeEvent) => void) => () => void
  emit: (type: EventType, data: unknown, source?: string) => void
  getHistory: (type?: EventType) => RuntimeEvent[]
  clearHistory: () => void
}

export const useEventBus = create<EventState>((set, get) => ({
  listeners: new Map(),
  history: [],
  maxHistory: 100,

  subscribe: (type, handler) => {
    const listeners = get().listeners
    if (!listeners.has(type)) listeners.set(type, new Set())
    listeners.get(type)!.add(handler)
    return () => { listeners.get(type)?.delete(handler) }
  },

  emit: (type, data, source = "runtime") => {
    const event: RuntimeEvent = {
      type,
      source,
      timestamp: Date.now(),
      data,
    }
    get().listeners.get(type)?.forEach((handler) => handler(event))
    set((s) => ({
      history: [...s.history.slice(-s.maxHistory + 1), event],
    }))
  },

  getHistory: (type) => {
    const history = get().history
    return type ? history.filter((e) => e.type === type) : history
  },

  clearHistory: () => set({ history: [] }),
}))
