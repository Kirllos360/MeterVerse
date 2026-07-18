import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface FilterChip {
  id: string
  label: string
  value: unknown
  field: string
  operator: "eq" | "neq" | "contains" | "gt" | "gte" | "lt" | "lte" | "in" | "between"
}

export interface SavedFilter {
  id: string
  name: string
  chips: FilterChip[]
  pinned?: boolean
}

interface FilterState {
  chips: FilterChip[]
  savedFilters: SavedFilter[]
  globalQuery: string
  addChip: (chip: FilterChip) => void
  removeChip: (id: string) => void
  clearChips: () => void
  saveFilter: (name: string) => void
  loadFilter: (id: string) => void
  deleteFilter: (id: string) => void
  togglePinFilter: (id: string) => void
  setGlobalQuery: (q: string) => void
}

export const useFilterRuntime = create<FilterState>()(
  persist(
    (set, get) => ({
      chips: [],
      savedFilters: [],
      globalQuery: "",

      addChip: (chip) => set((s) => ({ chips: [...s.chips.filter((c) => c.id !== chip.id), chip] })),
      removeChip: (id) => set((s) => ({ chips: s.chips.filter((c) => c.id !== id) })),
      clearChips: () => set({ chips: [] }),

      saveFilter: (name) => set((s) => {
        const id = `filter-${Date.now()}`
        return { savedFilters: [...s.savedFilters, { id, name, chips: [...s.chips] }] }
      }),

      loadFilter: (id) => {
        const filter = get().savedFilters.find((f) => f.id === id)
        if (filter) set({ chips: [...filter.chips] })
      },

      deleteFilter: (id) => set((s) => ({ savedFilters: s.savedFilters.filter((f) => f.id !== id) })),

      togglePinFilter: (id) => set((s) => ({
        savedFilters: s.savedFilters.map((f) => f.id === id ? { ...f, pinned: !f.pinned } : f)
      })),

      setGlobalQuery: (globalQuery) => set({ globalQuery }),
    }),
    { name: "mv-filters", partialize: (s) => ({ savedFilters: s.savedFilters }) }
  )
)
