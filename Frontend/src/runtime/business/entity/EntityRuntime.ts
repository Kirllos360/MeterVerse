import { create } from "zustand"

export interface EntityField {
  id: string
  label: string
  labelAr?: string
  type: "text" | "number" | "email" | "phone" | "date" | "select" | "boolean" | "reference"
  required?: boolean
  options?: { label: string; value: string }[]
  reference?: { entity: string; field: string }
}

export interface EntityAction {
  id: string
  label: string
  icon?: string
  route?: string
  permissions?: string[]
}

export interface EntityStatus {
  id: string
  label: string
  color: string
}

export interface EntityMeta {
  id: string
  name: string
  nameAr?: string
  icon: string
  description: string
  fields: EntityField[]
  actions: EntityAction[]
  statuses: EntityStatus[]
  relationships: { entity: string; label: string; cardinality: "one" | "many" }[]
  defaultColumns: string[]
  defaultFilters: string[]
  permissions?: string[]
  route?: string
}

interface EntityState {
  registry: Map<string, EntityMeta>
  register: (meta: EntityMeta) => void
  registerMany: (metas: EntityMeta[]) => void
  get: (id: string) => EntityMeta | undefined
  list: () => EntityMeta[]
  getRelated: (id: string) => { entity: string; label: string; cardinality: "one" | "many" }[]
}

export const useEntityRuntime = create<EntityState>((set, get) => ({
  registry: new Map(),
  register: (meta) => set((s) => { const r = new Map(s.registry); r.set(meta.id, meta); return { registry: r } }),
  registerMany: (metas) => metas.forEach((m) => get().register(m)),
  get: (id) => get().registry.get(id),
  list: () => Array.from(get().registry.values()),
  getRelated: (id) => get().registry.get(id)?.relationships ?? [],
}))
