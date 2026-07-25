"use client"

import { create } from "zustand"

export interface DashboardStore {
  activePage: string
  setActivePage: (page: string) => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  activePage: "overview",
  setActivePage: (page: string) => set({ activePage: page }),
}))
