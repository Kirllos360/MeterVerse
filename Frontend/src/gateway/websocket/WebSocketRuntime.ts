import { create } from "zustand"

type WSEventHandler = (data: unknown) => void

interface WsState {
  ws: WebSocket | null
  connected: boolean
  reconnectAttempts: number
  maxReconnect: number
  baseDelay: number
  url: string | null
  handlers: Map<string, Set<WSEventHandler>>
  subscriptions: Set<string>
  heartbeatInterval: any

  connect: (url: string) => void
  disconnect: () => void
  subscribe: (event: string, handler: WSEventHandler) => () => void
  unsubscribe: (event: string) => void
  send: (event: string, data: unknown) => void
  isConnected: () => boolean
}

export const useWebSocketRuntime = create<WsState>((set, get) => ({
  ws: null,
  connected: false,
  reconnectAttempts: 0,
  maxReconnect: 10,
  baseDelay: 1000,
  url: null,
  handlers: new Map(),
  subscriptions: new Set(),
  heartbeatInterval: null,

  connect: (url) => {
    if (get().ws?.readyState === WebSocket.OPEN) return
    set({ url })

    try {
      const ws = new WebSocket(url)
      ws.onopen = () => {
        set({ connected: true, reconnectAttempts: 0, ws })
        const interval = setInterval(() => { ws.send(JSON.stringify({ type: "ping" })) }, 30000)
        set({ heartbeatInterval: interval })
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          const handlers = get().handlers.get(msg.type)
          if (handlers) handlers.forEach((h) => h(msg.data))
        } catch {}
      }

      ws.onclose = () => {
        set({ connected: false })
        const { url, reconnectAttempts, maxReconnect, baseDelay } = get()
        if (url && reconnectAttempts < maxReconnect) {
          const delay = baseDelay * Math.pow(2, reconnectAttempts)
          set({ reconnectAttempts: reconnectAttempts + 1 })
          setTimeout(() => get().connect(url), delay)
        }
      }

      ws.onerror = () => ws.close()
      set({ ws })
    } catch {}
  },

  disconnect: () => {
    get().ws?.close()
    if (get().heartbeatInterval) clearInterval(get().heartbeatInterval)
    set({ ws: null, connected: false, reconnectAttempts: 0, heartbeatInterval: null })
  },

  reconnect: () => {
    const { url, reconnectAttempts, maxReconnect } = get()
    if (!url || reconnectAttempts >= maxReconnect) return
    const delay = get().baseDelay * Math.pow(2, reconnectAttempts)
    set({ reconnectAttempts: reconnectAttempts + 1 })
    setTimeout(() => get().connect(url), delay)
  },

  subscribe: (event, handler) => {
    set((s) => {
      const handlers = new Map(s.handlers)
      if (!handlers.has(event)) handlers.set(event, new Set())
      handlers.get(event)!.add(handler)
      return { handlers, subscriptions: new Set([...s.subscriptions, event]) }
    })
    return () => get().handlers.get(event)?.delete(handler)
  },

  unsubscribe: (event) => {
    set((s) => {
      const handlers = new Map(s.handlers)
      handlers.delete(event)
      const subs = new Set(s.subscriptions)
      subs.delete(event)
      return { handlers, subscriptions: subs }
    })
  },

  send: (event, data) => {
    const { ws, connected } = get()
    if (ws && connected) ws.send(JSON.stringify({ type: event, data }))
  },

  isConnected: () => get().connected,
}))
