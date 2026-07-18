import { create } from "zustand"

export interface SearchResult {
  id: string
  label: string
  labelAr?: string
  icon?: string
  route?: string
  category: string
  badge?: string | number
  permissions?: string[]
  keywords?: string[]
}

interface NavSearchState {
  query: string
  results: SearchResult[]
  selectedIndex: number
  recent: string[]
  setQuery: (q: string) => void
  setResults: (r: SearchResult[]) => void
  setSelectedIndex: (i: number) => void
  selectNext: () => void
  selectPrev: () => void
  addRecent: (id: string) => void
  clear: () => void
}

export const useNavSearchRuntime = create<NavSearchState>((set, get) => ({
  query: "",
  results: [],
  selectedIndex: 0,
  recent: [],

  setQuery: (query) => set({ query, selectedIndex: 0 }),
  setResults: (results) => set({ results, selectedIndex: 0 }),
  setSelectedIndex: (selectedIndex) => set({ selectedIndex }),
  selectNext: () => set((s) => ({ selectedIndex: Math.min(s.selectedIndex + 1, s.results.length - 1) })),
  selectPrev: () => set((s) => ({ selectedIndex: Math.max(s.selectedIndex - 1, 0) })),
  addRecent: (id) => set((s) => ({ recent: [id, ...s.recent.filter((r) => r !== id)].slice(0, 8) })),
  clear: () => set({ query: "", results: [], selectedIndex: 0 }),
}))
