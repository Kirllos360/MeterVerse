"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type AdminPage =
  | "home" | "monitoring" | "connection-settings" | "database-management" | "migration-uploads"
  | "location-settings" | "users-permissions" | "customer-settings" | "meter-settings"
  | "readings" | "tariff-settings" | "bill-cycle-settings" | "invoices" | "payment-settings"
  | "settings" | "audit" | "report-settings" | "config-center"

interface OpenPage {
  id: string
  label: string
}

interface LocationState {
  selectedArea: string | null
  selectedProject: { id: string; name: string } | null
  selectedZone: { id: string; name: string } | null
  selectedUnitType: string | null
}

interface AdminStore {
  activePage: AdminPage
  setActivePage: (page: AdminPage) => void
  openPages: OpenPage[]
  addOpenPage: (page: OpenPage) => void
  removeOpenPage: (id: string) => void
  inspectorOpen: boolean
  setInspectorOpen: (open: boolean) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  themeMode: "light" | "dark" | "auto"
  cycleTheme: () => void
  lang: "en" | "ar"
  toggleLang: () => void
  location: LocationState
  setArea: (area: string | null) => void
  setProject: (project: { id: string; name: string } | null) => void
  setZone: (zone: { id: string; name: string } | null) => void
  setUnitType: (unitType: string | null) => void
}

const ALL_PAGES: OpenPage[] = [
  { id: "home", label: "Home" },
  { id: "monitoring", label: "Monitoring" },
  { id: "connection-settings", label: "Connection" },
  { id: "database-management", label: "Database Mgmt" },
  { id: "migration-uploads", label: "Migration & Uploads" },
  { id: "location-settings", label: "Location" },
  { id: "users-permissions", label: "Users & Permissions" },
  { id: "customer-settings", label: "Customer" },
  { id: "meter-settings", label: "Meter" },
  { id: "readings", label: "Readings" },
  { id: "tariff-settings", label: "Tariff" },
  { id: "bill-cycle-settings", label: "Billing Cycles" },
  { id: "invoices", label: "Invoices" },
  { id: "payment-settings", label: "Payment" },
  { id: "settings", label: "General Settings" },
  { id: "audit", label: "Audit Log" },
  { id: "report-settings", label: "Reports" },
]

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      activePage: "home",
      setActivePage: (page) => set({ activePage: page }),
      openPages: [ALL_PAGES[0]],
      addOpenPage: (page) => {
        const existing = get().openPages.find(p => p.id === page.id)
        if (!existing) {
          set({ openPages: [...get().openPages, page] })
        }
      },
      removeOpenPage: (id) => {
        const pages = get().openPages.filter(p => p.id !== id)
        if (pages.length === 0) pages.push(ALL_PAGES[0])
        if (get().activePage === id) {
          set({ openPages: pages, activePage: pages[pages.length - 1].id as AdminPage })
        } else {
          set({ openPages: pages })
        }
      },
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
      location: { selectedArea: null, selectedProject: null, selectedZone: null, selectedUnitType: null },
      setArea: (area) => set({ location: { selectedArea: area, selectedProject: null, selectedZone: null, selectedUnitType: null } }),
      setProject: (project) => set({ location: { ...get().location, selectedProject: project, selectedZone: null, selectedUnitType: null } }),
      setZone: (zone) => set({ location: { ...get().location, selectedZone: zone, selectedUnitType: null } }),
      setUnitType: (unitType) => set({ location: { ...get().location, selectedUnitType: unitType } }),
    }),
    { name: "admin-store" }
  )
)

export { ALL_PAGES }
