import { create } from "zustand"
import { persist } from "zustand/middleware"

export type NotifType = "mention" | "task" | "approval" | "warning" | "error" | "info"
export type NotifPriority = "low" | "medium" | "high" | "critical"

export interface NotificationItem {
  id: string
  type: NotifType
  priority: NotifPriority
  title: string
  message?: string
  read: boolean
  archived: boolean
  timestamp: number
  entityId?: string
  entityType?: string
  action?: { label: string; handler: string }
}

interface NotifCenterState {
  items: NotificationItem[]
  filter: NotifType | "all"
  search: string
  unreadCount: number
  add: (n: Omit<NotificationItem, "id" | "read" | "archived" | "timestamp">) => void
  markRead: (id: string) => void
  markAllRead: () => void
  archive: (id: string) => void
  archiveAll: () => void
  setFilter: (f: NotifType | "all") => void
  setSearch: (s: string) => void
  getFiltered: () => NotificationItem[]
  getUnreadByType: (type: NotifType) => number
}

export const useNotificationCenter = create<NotifCenterState>()(
  persist(
    (set, get) => ({
      items: [],
      filter: "all",
      search: "",
      unreadCount: 0,

      add: (n) => set((s) => {
        const item: NotificationItem = {
          ...n,
          id: `notif-${Date.now()}`,
          read: false,
          archived: false,
          timestamp: Date.now(),
        }
        return {
          items: [item, ...s.items].slice(0, 200),
          unreadCount: s.unreadCount + 1,
        }
      }),

      markRead: (id) => set((s) => {
        const item = s.items.find((i) => i.id === id)
        if (!item || item.read) return s
        return {
          items: s.items.map((i) => i.id === id ? { ...i, read: true } : i),
          unreadCount: Math.max(0, s.unreadCount - 1),
        }
      }),

      markAllRead: () => set((s) => ({
        items: s.items.map((i) => ({ ...i, read: true })),
        unreadCount: 0,
      })),

      archive: (id) => set((s) => ({ items: s.items.map((i) => i.id === id ? { ...i, archived: true } : i) })),
      archiveAll: () => set((s) => ({ items: s.items.map((i) => ({ ...i, archived: true })) })),
      setFilter: (filter) => set({ filter }),
      setSearch: (search) => set({ search }),

      getFiltered: () => {
        const { items, filter, search } = get()
        let result = items.filter((i) => !i.archived)
        if (filter !== "all") result = result.filter((i) => i.type === filter)
        if (search) {
          const q = search.toLowerCase()
          result = result.filter((i) => i.title.toLowerCase().includes(q) || i.message?.toLowerCase().includes(q))
        }
        return result
      },

      getUnreadByType: (type) => get().items.filter((i) => i.type === type && !i.read).length,
    }),
    { name: "mv-notifications", partialize: (s) => ({ items: s.items }) }
  )
)
