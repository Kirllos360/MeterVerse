"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type AdminPage =
  | "home" | "users" | "roles" | "audit" | "customers" | "meters" | "readings"
  | "invoices" | "payments" | "tariffs" | "sim" | "settings" | "reports"
  | "services" | "security" | "ai" | "monitoring" | "config-center" | "config-smtp"
  | "config-sms" | "config-firebase" | "config-symbiot" | "config-api-keys"
  | "projects" | "zones" | "units" | "meter-assignments" | "consumption"
  | "batch-validation" | "statements" | "reports-v2" | "customers-cards" | "meters-relay"

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

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
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
    }),
    { name: "admin-store" }
  )
)
