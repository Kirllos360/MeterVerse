import type { Query, QueryResult, Mutation, MutationResult, Entity } from "../contracts/types"

export interface DataProvider {
  readonly name: string
  readonly isAvailable: boolean

  create<T>(entityType: string, data: Partial<T>): Promise<T>
  read<T>(entityType: string, id: string): Promise<T>
  update<T>(entityType: string, id: string, data: Partial<T>): Promise<T>
  delete<T>(entityType: string, id: string): Promise<T>
  query<T>(entityType: string, query: Query<T>): Promise<QueryResult<T>>
  executeMutation<T>(mutation: Mutation<T>): Promise<MutationResult<T>>
}

export class RestDataProvider implements DataProvider {
  readonly name = "rest"
  readonly isAvailable = true
  private baseUrl = "/api/v1"

  constructor(baseUrl?: string) { if (baseUrl) this.baseUrl = baseUrl }

  async create<T>(entityType: string, data: Partial<T>): Promise<T> {
    const res = await fetch(`${this.baseUrl}/${entityType}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    return res.json()
  }

  async read<T>(entityType: string, id: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}/${entityType}/${id}`)
    if (!res.ok) throw new Error(`Failed to read ${entityType}/${id}`)
    return res.json()
  }

  async update<T>(entityType: string, id: string, data: Partial<T>): Promise<T> {
    const res = await fetch(`${this.baseUrl}/${entityType}/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    return res.json()
  }

  async delete<T>(entityType: string, id: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}/${entityType}/${id}`, { method: "DELETE" })
    return res.json()
  }

  async query<T>(entityType: string, query: Query<T>): Promise<QueryResult<T>> {
    const params = new URLSearchParams()
    if (query.pagination) { params.set("page", String(query.pagination.page)); params.set("pageSize", String(query.pagination.pageSize)) }
    if (query.orderBy?.length) params.set("sort", query.orderBy.map((s) => `${s.field}:${s.direction}`).join(","))
    const res = await fetch(`${this.baseUrl}/${entityType}?${params}`)
    return res.json()
  }

  async executeMutation<T>(mutation: Mutation<T>): Promise<MutationResult<T>> {
    switch (mutation.type) {
      case "create": { const data = await this.create(mutation.entityType, mutation.data!); return { success: true, data } }
      case "update": { const data = await this.update(mutation.entityType, mutation.id!, mutation.data!); return { success: true, data } }
      case "delete": { await this.delete(mutation.entityType, mutation.id!); return { success: true } }
      default: return { success: false, error: `Unknown mutation type: ${mutation.type}` }
    }
  }
}

export class MockDataProvider implements DataProvider {
  readonly name = "mock"
  readonly isAvailable = true
  private store = new Map<string, Entity[]>()

  constructor(mocks?: Record<string, Entity[]>) {
    if (mocks) for (const [key, val] of Object.entries(mocks)) this.store.set(key, [...val])
  }

  async create<T>(entityType: string, data: Partial<T>): Promise<T> {
    const entity = { id: `mock_${Date.now()}`, ...data, createdAt: new Date().toISOString() } as unknown as Entity
    const existing = this.store.get(entityType) || []
    existing.push(entity)
    this.store.set(entityType, existing)
    return entity as unknown as T
  }

  async read<T>(entityType: string, id: string): Promise<T> {
    const items = this.store.get(entityType) || []
    const item = items.find((i) => i.id === id)
    if (!item) throw new Error(`Not found: ${entityType}/${id}`)
    return item as unknown as T
  }

  async update<T>(entityType: string, id: string, data: Partial<T>): Promise<T> {
    const items = this.store.get(entityType) || []
    const idx = items.findIndex((i) => i.id === id)
    if (idx < 0) throw new Error(`Not found: ${entityType}/${id}`)
    items[idx] = { ...items[idx], ...data } as Entity
    return items[idx] as unknown as T
  }

  async delete<T>(entityType: string, id: string): Promise<T> {
    const items = this.store.get(entityType) || []
    const idx = items.findIndex((i) => i.id === id)
    if (idx < 0) throw new Error(`Not found: ${entityType}/${id}`)
    const deleted = items.splice(idx, 1)[0]
    return deleted as unknown as T
  }

  async query<T>(entityType: string, query: Query<T>): Promise<QueryResult<T>> {
    let items = [...(this.store.get(entityType) || [])] as T[]
    if (query.orderBy?.length) {
      for (const sort of query.orderBy) {
        items.sort((a, b) => {
          const av = (a as Record<string, unknown>)[sort.field]
          const bv = (b as Record<string, unknown>)[sort.field]
          return sort.direction === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
        })
      }
    }
    const total = items.length
    if (query.pagination) {
      const { page, pageSize } = query.pagination
      const start = (page - 1) * pageSize
      items = items.slice(start, start + pageSize)
    }
    return { data: items, total, page: query.pagination?.page || 1, pageSize: query.pagination?.pageSize || total, totalPages: Math.ceil(total / (query.pagination?.pageSize || total)), hasNext: false, hasPrevious: false, duration: 0 }
  }

  async executeMutation<T>(mutation: Mutation<T>): Promise<MutationResult<T>> {
    switch (mutation.type) {
      case "create": { const d = await this.create(mutation.entityType, mutation.data!); return { success: true, data: d } }
      case "update": { const d = await this.update(mutation.entityType, mutation.id!, mutation.data!); return { success: true, data: d } }
      case "delete": { await this.delete(mutation.entityType, mutation.id!); return { success: true } }
      default: return { success: false, error: `Unknown: ${mutation.type}` }
    }
  }
}
