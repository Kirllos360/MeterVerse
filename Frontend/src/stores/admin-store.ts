"use client"

import { create } from "zustand"

export type AdminPage =
  | "home" | "users" | "roles" | "audit" | "customers" | "meters" | "readings"
  | "invoices" | "payments" | "tariffs" | "sim" | "settings" | "reports"
  | "services" | "security" | "ai" | "monitoring" | "config-center" | "config-smtp"
  | "config-sms" | "config-firebase" | "config-symbiot" | "config-api-keys"

interface AdminStore {
  activePage: AdminPage
  setActivePage: (page: AdminPage) => void
  inspectorOpen: boolean
  setInspectorOpen: (open: boolean) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  themeMode: "light" | "dark" | "auto"
  cycleTheme: () => void
  lang: "en" | "ar"
  toggleLang: () => void
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  activePage: "home",
  setActivePage: (page) => set({ activePage: page }),
  inspectorOpen: false,
  setInspectorOpen: (open) => set({ inspectorOpen: open }),
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  themeMode: "auto",
  cycleTheme: () => {
    const modes: Array<"auto" | "light" | "dark"> = ["auto", "light", "dark"]
    const current = get().themeMode
    const idx = modes.indexOf(current)
    set({ themeMode: modes[(idx + 1) % modes.length] })
  },
  lang: "en",
  toggleLang: () => set((s) => ({ lang: s.lang === "en" ? "ar" : "en" })),
}))
