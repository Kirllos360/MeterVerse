import { create } from "zustand"

export interface FieldMeta {
  id: string
  label: string
  labelAr?: string
  type: "text" | "number" | "email" | "phone" | "date" | "datetime" | "select" | "boolean" | "reference" | "currency"
  required?: boolean
  readonly?: boolean
  hidden?: boolean
  placeholder?: string
  options?: { label: string; value: string }[]
  reference?: { entity: string; field: string }
  width?: "full" | "half" | "third"
  validation?: { min?: number; max?: number; pattern?: string; message?: string }
}

export interface ColumnMeta {
  id: string
  header: string
  headerAr?: string
  sortable?: boolean
  filterable?: boolean
  width?: number
  align?: "left" | "center" | "right"
  aggregate?: "sum" | "avg" | "count"
}

export interface FilterMeta {
  id: string
  label: string
  field: string
  type: "text" | "select" | "date" | "number" | "boolean"
  options?: { label: string; value: string }[]
}

export interface BusinessEntityMeta {
  id: string
  name: string
  nameAr?: string
  icon: string
  fields: FieldMeta[]
  columns: ColumnMeta[]
  filters: FilterMeta[]
  actions: string[]
  permissions?: string[]
  toolbarZones?: string[]
  inspectorTabs?: string[]
  relationships?: { entity: string; label: string }[]
}

interface BusinessMetaState {
  registry: Map<string, BusinessEntityMeta>
  register: (meta: BusinessEntityMeta) => void
  get: (id: string) => BusinessEntityMeta | undefined
  list: () => BusinessEntityMeta[]
}

export const useBusinessMetadata = create<BusinessMetaState>((set, get) => ({
  registry: new Map(),

  register: (meta) => set((s) => {
    const r = new Map(s.registry)
    r.set(meta.id, meta)
    return { registry: r }
  }),

  get: (id) => get().registry.get(id),
  list: () => Array.from(get().registry.values()),
}))
