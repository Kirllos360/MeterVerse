import { create } from "zustand"
import { persist } from "zustand/middleware"

interface FavoritesState {
  items: string[]
  add: (id: string) => void
  remove: (id: string) => void
  toggle: (id: string) => void
  isFavorite: (id: string) => boolean
  reorder: (from: number, to: number) => void
  clear: () => void
}

export const useFavoritesRuntime = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (id) => set((s) => ({ items: [...new Set([...s.items, id])] })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i !== id) })),
      toggle: (id) => {
        if (get().items.includes(id)) get().remove(id)
        else get().add(id)
      },
      isFavorite: (id) => get().items.includes(id),
      reorder: (from, to) => set((s) => {
        const items = [...s.items]
        const [moved] = items.splice(from, 1)
        items.splice(to, 0, moved)
        return { items }
      }),
      clear: () => set({ items: [] }),
    }),
    { name: "mv-nav-favorites" }
  )
)
