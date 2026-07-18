import { create } from "zustand"

export type AppCategory = "executive" | "crm" | "billing" | "meters" | "readings" | "tariffs" | "payments" | "financial" | "reports" | "admin" | "notifications" | "ai" | "developer" | "documents" | "security"

export interface ApplicationMeta {
  id: string
  name: string
  nameAr?: string
  category: AppCategory
  icon: string
  route?: string
  description: string
  permissions?: string[]
  searchTerms?: string[]
  keywords?: string[]
  order?: number
}

interface AppRegistryState {
  applications: ApplicationMeta[]
  register: (app: ApplicationMeta) => void
  registerMany: (apps: ApplicationMeta[]) => void
  unregister: (id: string) => void
  get: (id: string) => ApplicationMeta | undefined
  list: () => ApplicationMeta[]
  findByCategory: (category: AppCategory) => ApplicationMeta[]
  search: (query: string) => ApplicationMeta[]
}

export const useAppRegistry = create<AppRegistryState>((set, get) => ({
  applications: [],

  register: (app) =>
    set((s) => ({
      applications: [...s.applications.filter((a) => a.id !== app.id), app],
    })),

  registerMany: (apps) =>
    set((s) => {
      const existing = s.applications.filter((a) => !apps.find((na) => na.id === a.id))
      return { applications: [...existing, ...apps] }
    }),

  unregister: (id) =>
    set((s) => ({
      applications: s.applications.filter((a) => a.id !== id),
    })),

  get: (id) => get().applications.find((a) => a.id === id),

  list: () => get().applications,

  findByCategory: (category) =>
    get().applications.filter((a) => a.category === category),

  search: (query) => {
    const q = query.toLowerCase()
    return get().applications.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.nameAr?.includes(q) ||
        a.keywords?.some((k) => k.toLowerCase().includes(q)) ||
        a.searchTerms?.some((t) => t.toLowerCase().includes(q))
    )
  },
}))
