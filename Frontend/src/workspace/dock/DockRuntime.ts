import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface DockItem {
  id: string
  label: string
  icon?: string
  route?: string
  running?: boolean
  pinned: boolean
}

interface DockState {
  items: DockItem[]
  runningApps: string[]
  pinApp: (id: string) => void
  unpinApp: (id: string) => void
  launchApp: (id: string) => void
  closeApp: (id: string) => void
  isRunning: (id: string) => boolean
  isPinned: (id: string) => boolean
  getPinned: () => DockItem[]
  getRunning: () => DockItem[]
  reorder: (from: number, to: number) => void
}

export const useDockRuntime = create<DockState>()(
  persist(
    (set, get) => ({
      items: [],
      runningApps: [],

      pinApp: (id) => set((s) => {
        const existing = s.items.find((i) => i.id === id)
        if (existing) return { items: s.items.map((i) => i.id === id ? { ...i, pinned: true } : i) }
        return { items: [...s.items, { id, label: id, pinned: true }] }
      }),

      unpinApp: (id) => set((s) => ({
        items: s.items.map((i) => i.id === id ? { ...i, pinned: false } : i)
      })),

      launchApp: (id) => set((s) => ({
        runningApps: [...new Set([...s.runningApps, id])],
        items: s.items.map((i) => i.id === id ? { ...i, running: true } : i)
      })),

      closeApp: (id) => set((s) => ({
        runningApps: s.runningApps.filter((a) => a !== id),
        items: s.items.map((i) => i.id === id ? { ...i, running: false } : i)
      })),

      isRunning: (id) => get().runningApps.includes(id),
      isPinned: (id) => get().items.find((i) => i.id === id)?.pinned ?? false,
      getPinned: () => get().items.filter((i) => i.pinned),
      getRunning: () => get().items.filter((i) => i.running),

      reorder: (from, to) => set((s) => {
        const items = [...s.items]
        const [m] = items.splice(from, 1)
        items.splice(to, 0, m)
        return { items }
      }),
    }),
    { name: "mv-dock" }
  )
)
