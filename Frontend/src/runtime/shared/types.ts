export type RuntimeId = string
export type RuntimeTimestamp = number

export interface RuntimeError {
  code: string
  message: string
  details?: unknown
}

export interface RuntimeEvent<T = unknown> {
  type: string
  source: string
  timestamp: RuntimeTimestamp
  data: T
  metadata?: {
    userId?: string
    workspaceId?: string
    correlationId?: string
  }
}

export interface RuntimeRegistry<T> {
  register: (id: string, item: T) => void
  unregister: (id: string) => void
  get: (id: string) => T | undefined
  list: () => T[]
  find: (predicate: (item: T) => boolean) => T[]
}

export function createRegistry<T>(): RuntimeRegistry<T> {
  const items = new Map<string, T>()
  return {
    register: (id, item) => { items.set(id, item) },
    unregister: (id) => { items.delete(id) },
    get: (id) => items.get(id),
    list: () => Array.from(items.values()),
    find: (predicate) => Array.from(items.values()).filter(predicate),
  }
}
