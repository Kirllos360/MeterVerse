import { create } from "zustand"

interface QueuedMutation {
  id: string
  endpoint: string
  method: "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  createdAt: number
  retries: number
}

interface OfflineState {
  queue: QueuedMutation[]
  isOnline: boolean
  processing: boolean
  enqueue: (mutation: Omit<QueuedMutation, "id" | "createdAt" | "retries">) => void
  dequeue: (id: string) => void
  setOnline: (online: boolean) => void
  setProcessing: (processing: boolean) => void
  processQueue: () => Promise<void>
  clear: () => void
}

export const useOfflineRuntime = create<OfflineState>((set, get) => ({
  queue: [],
  isOnline: true,
  processing: false,

  enqueue: (mutation) => {
    const item: QueuedMutation = {
      ...mutation,
      id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
      retries: 0,
    }
    set((s) => ({ queue: [...s.queue, item] }))
    if (typeof window !== "undefined") {
      try { localStorage.setItem("mv-offline-queue", JSON.stringify([...get().queue, item])) } catch {}
    }
  },

  dequeue: (id) => set((s) => ({ queue: s.queue.filter((q) => q.id !== id) })),

  setOnline: (isOnline) => {
    set({ isOnline })
    if (isOnline) get().processQueue()
  },

  setProcessing: (processing) => set({ processing }),

  processQueue: async () => {
    if (get().processing || get().queue.length === 0) return
    set({ processing: true })
    const { queue } = get()
    for (const mutation of queue) {
      try {
        const response = await fetch(`/api/v1${mutation.endpoint}`, {
          method: mutation.method,
          headers: { "Content-Type": "application/json" },
          body: mutation.body ? JSON.stringify(mutation.body) : undefined,
        })
        if (response.ok) get().dequeue(mutation.id)
        else if (response.status >= 400 && response.status < 500) get().dequeue(mutation.id)
      } catch {}
    }
    set({ processing: false })
  },

  clear: () => set({ queue: [] }),
}))

if (typeof window !== "undefined") {
  window.addEventListener("online", () => useOfflineRuntime.getState().setOnline(true))
  window.addEventListener("offline", () => useOfflineRuntime.getState().setOnline(false))
  try {
    const stored = localStorage.getItem("mv-offline-queue")
    if (stored) {
      const items = JSON.parse(stored)
      if (items.length > 0) useOfflineRuntime.getState().setOnline(true)
    }
  } catch {}
}
