import { create } from "zustand"
import { persist } from "zustand/middleware"

interface RecentState {
  pages: string[]
  entities: string[]
  commands: string[]
  maxItems: number
  addPage: (id: string) => void
  addEntity: (id: string) => void
  addCommand: (id: string) => void
  clearPages: () => void
  clearEntities: () => void
}

export const useRecentRuntime = create<RecentState>()(
  persist(
    (set, get) => ({
      pages: [],
      entities: [],
      commands: [],
      maxItems: 10,

      addPage: (id) => set((s) => ({
        pages: [id, ...s.pages.filter((p) => p !== id)].slice(0, s.maxItems)
      })),

      addEntity: (id) => set((s) => ({
        entities: [id, ...s.entities.filter((e) => e !== id)].slice(0, s.maxItems)
      })),

      addCommand: (id) => set((s) => ({
        commands: [id, ...s.commands.filter((c) => c !== id)].slice(0, s.maxItems)
      })),

      clearPages: () => set({ pages: [] }),
      clearEntities: () => set({ entities: [] }),
    }),
    { name: "mv-nav-recent" }
  )
)
