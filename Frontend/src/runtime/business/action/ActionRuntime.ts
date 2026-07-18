import { create } from "zustand"

export interface BusinessAction {
  id: string
  label: string
  labelAr?: string
  icon?: string
  entity: string
  handler: string
  permissions?: string[]
  confirm?: string
  successMessage?: string
}

interface ActionState {
  registry: Map<string, BusinessAction>
  register: (action: BusinessAction) => void
  registerMany: (actions: BusinessAction[]) => void
  get: (id: string) => BusinessAction | undefined
  getByEntity: (entity: string) => BusinessAction[]
  execute: (id: string) => Promise<void>
  list: () => BusinessAction[]
}

export const useActionRuntime = create<ActionState>((set, get) => ({
  registry: new Map(),

  register: (action) => set((s) => {
    const r = new Map(s.registry)
    r.set(action.id, action)
    return { registry: r }
  }),

  registerMany: (actions) => actions.forEach((a) => get().register(a)),
  get: (id) => get().registry.get(id),
  getByEntity: (entity) => Array.from(get().registry.values()).filter((a) => a.entity === entity),
  list: () => Array.from(get().registry.values()),

  execute: async (id) => {
    const action = get().registry.get(id)
    if (!action) throw new Error(`Action ${id} not found`)
    console.log(`[ActionRuntime] Executing ${action.id} (${action.label})`)
  },
}))
