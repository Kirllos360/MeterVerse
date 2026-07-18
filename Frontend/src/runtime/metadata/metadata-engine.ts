import { create } from "zustand"

export interface ApplicationMetadata {
  id: string
  name: string
  nameAr?: string
  category: string
  icon: string
  route?: string
  permissions?: string[]
  toolbar?: ToolbarMetadata[]
  tables?: TableMetadata[]
  forms?: FormMetadata[]
  charts?: ChartMetadata[]
  widgets?: WidgetMetadata[]
  inspector?: InspectorMetadata[]
}

export interface ToolbarMetadata {
  id: string
  label: string
  icon?: string
  type: "button" | "dropdown" | "search" | "filter" | "bulk"
  permissions?: string[]
}

export interface TableMetadata {
  id: string
  label: string
  columns: { id: string; header: string; sortable?: boolean; filterable?: boolean }[]
  actions?: string[]
}

export interface FormMetadata {
  id: string
  label: string
  fields: { id: string; label: string; type: string; required?: boolean }[]
}

export interface ChartMetadata {
  id: string
  label: string
  type: string
}

export interface WidgetMetadata {
  id: string
  label: string
  type: string
  size: "sm" | "md" | "lg"
}

export interface InspectorMetadata {
  id: string
  label: string
  tabs: { id: string; label: string }[]
}

interface MetadataState {
  apps: Map<string, ApplicationMetadata>
  registerAppMetadata: (meta: ApplicationMetadata) => void
  getAppMetadata: (id: string) => ApplicationMetadata | undefined
  listAppMetadata: () => ApplicationMetadata[]
  searchApps: (query: string) => ApplicationMetadata[]
}

export const useMetadataEngine = create<MetadataState>((set, get) => ({
  apps: new Map(),

  registerAppMetadata: (meta) =>
    set((s) => {
      const apps = new Map(s.apps)
      apps.set(meta.id, meta)
      return { apps }
    }),

  getAppMetadata: (id) => get().apps.get(id),
  listAppMetadata: () => Array.from(get().apps.values()),

  searchApps: (query) => {
    const q = query.toLowerCase()
    return Array.from(get().apps.values()).filter(
      (app) =>
        app.name.toLowerCase().includes(q) ||
        app.nameAr?.includes(q) ||
        app.category.toLowerCase().includes(q)
    )
  },
}))
