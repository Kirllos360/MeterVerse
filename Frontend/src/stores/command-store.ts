"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CommandAction {
  id: string
  label: string
  description?: string
  icon?: string
  shortcut?: string
  category: "page" | "action" | "settings" | "recent"
  keywords?: string[]
  action: () => void
}

interface CommandState {
  isOpen: boolean
  query: string
  selectedIndex: number
  recentItems: string[]
  pinnedItems: string[]
  favoriteItems: string[]
  open: () => void
  close: () => void
  toggle: () => void
  setQuery: (query: string) => void
  setSelectedIndex: (index: number) => void
  addRecent: (id: string) => void
  togglePin: (id: string) => void
  toggleFavorite: (id: string) => void
}

export const useCommandStore = create<CommandState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      query: "",
      selectedIndex: 0,
      recentItems: [],
      pinnedItems: [],
      favoriteItems: [],
      open: () => set({ isOpen: true, query: "", selectedIndex: 0 }),
      close: () => set({ isOpen: false, query: "" }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen, query: "", selectedIndex: 0 })),
      setQuery: (query) => set({ query, selectedIndex: 0 }),
      setSelectedIndex: (selectedIndex) => set({ selectedIndex }),
      addRecent: (id) =>
        set((s) => ({
          recentItems: [id, ...s.recentItems.filter((i) => i !== id)].slice(0, 8),
        })),
      togglePin: (id) =>
        set((s) => ({
          pinnedItems: s.pinnedItems.includes(id)
            ? s.pinnedItems.filter((i) => i !== id)
            : [...s.pinnedItems, id],
        })),
      toggleFavorite: (id) =>
        set((s) => ({
          favoriteItems: s.favoriteItems.includes(id)
            ? s.favoriteItems.filter((i) => i !== id)
            : [...s.favoriteItems, id],
        })),
    }),
    { name: "meterverse-command" }
  )
)
