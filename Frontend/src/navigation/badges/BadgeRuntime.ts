import { create } from "zustand"

interface BadgeEntry {
  id: string
  count: number
  variant: "count" | "alert" | "warning" | "success" | "draft"
}

interface BadgeState {
  badges: Map<string, BadgeEntry>
  setBadge: (id: string, count: number, variant?: BadgeEntry["variant"]) => void
  incrementBadge: (id: string) => void
  decrementBadge: (id: string) => void
  clearBadge: (id: string) => void
  getBadge: (id: string) => BadgeEntry | undefined
}

export const useBadgeRuntime = create<BadgeState>((set, get) => ({
  badges: new Map(),

  setBadge: (id, count, variant = "count") => set((s) => {
    const b = new Map(s.badges)
    b.set(id, { id, count, variant })
    return { badges: b }
  }),

  incrementBadge: (id) => {
    const current = get().badges.get(id)
    get().setBadge(id, (current?.count ?? 0) + 1, current?.variant)
  },

  decrementBadge: (id) => {
    const current = get().badges.get(id)
    if (current && current.count > 0) get().setBadge(id, current.count - 1, current.variant)
  },

  clearBadge: (id) => set((s) => {
    const b = new Map(s.badges)
    b.delete(id)
    return { badges: b }
  }),

  getBadge: (id) => get().badges.get(id),
}))
