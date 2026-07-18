import { create } from "zustand"
import { persist } from "zustand/middleware"
import { seedApps } from "./seed-apps"

export type AppCategory =
  | "executive" | "crm" | "billing" | "meters" | "readings"
  | "operations" | "finance" | "reports" | "monitoring" | "iot"
  | "admin" | "security" | "ai" | "settings" | "developer"

export type AppStatus = "active" | "beta" | "experimental" | "disabled"

export interface ApplicationMeta {
  id: string
  title: string
  titleAr?: string
  icon: string
  description: string
  category: AppCategory
  route: string
  permissions?: string[]
  workspace?: string
  window?: string
  tags?: string[]
  status?: AppStatus
  beta?: boolean
  experimental?: boolean
  badge?: string | number
  order?: number
  visible?: boolean
}

interface AppRegistryState {
  apps: ApplicationMeta[]
  register: (app: ApplicationMeta) => void
  registerMany: (apps: ApplicationMeta[]) => void
  unregister: (id: string) => void
  get: (id: string) => ApplicationMeta | undefined
  list: () => ApplicationMeta[]
  getByCategory: (cat: AppCategory) => ApplicationMeta[]
  getVisible: () => ApplicationMeta[]
  getActive: () => ApplicationMeta[]
  search: (query: string) => ApplicationMeta[]
}

export const useAppRegistry = create<AppRegistryState>()(
  persist(
    (set, get) => ({
      apps: seedApps,
      register: (app) => set((s) => ({ apps: [...s.apps.filter((a) => a.id !== app.id), app] })),
      registerMany: (apps) => set((s) => {
        const existing = s.apps.filter((a) => !apps.find((na) => na.id === a.id))
        return { apps: [...existing, ...apps] }
      }),
      unregister: (id) => set((s) => ({ apps: s.apps.filter((a) => a.id !== id) })),
      get: (id) => get().apps.find((a) => a.id === id),
      list: () => get().apps,
      getByCategory: (cat) => get().apps.filter((a) => a.category === cat).sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
      getVisible: () => get().apps.filter((a) => a.visible !== false),
      getActive: () => get().apps.filter((a) => a.status !== "disabled"),
      search: (query) => {
        const q = query.toLowerCase()
        return get().apps.filter(
          (a) => a.title.toLowerCase().includes(q) || a.titleAr?.includes(q) ||
                 a.description.toLowerCase().includes(q) || a.tags?.some((t) => t.toLowerCase().includes(q))
        )
      },
    }),
    { name: "mv-app-registry" }
  )
)

export const categories: { id: AppCategory; label: string; icon: string; order: number }[] = [
  { id: "executive", label: "Executive", icon: "LayoutDashboard", order: 1 },
  { id: "crm", label: "CRM", icon: "Users", order: 2 },
  { id: "billing", label: "Billing", icon: "FileText", order: 3 },
  { id: "meters", label: "Meters", icon: "Gauge", order: 4 },
  { id: "readings", label: "Readings", icon: "ClipboardList", order: 5 },
  { id: "operations", label: "Operations", icon: "Settings", order: 6 },
  { id: "finance", label: "Finance", icon: "BarChart3", order: 7 },
  { id: "reports", label: "Reports", icon: "BarChart4", order: 8 },
  { id: "monitoring", label: "Monitoring", icon: "Activity", order: 9 },
  { id: "iot", label: "IoT", icon: "Radio", order: 10 },
  { id: "admin", label: "Admin", icon: "Shield", order: 11 },
  { id: "security", label: "Security", icon: "Lock", order: 12 },
  { id: "ai", label: "AI", icon: "Bot", order: 13 },
  { id: "settings", label: "Settings", icon: "Settings", order: 14 },
  { id: "developer", label: "Developer", icon: "Terminal", order: 15 },
]
