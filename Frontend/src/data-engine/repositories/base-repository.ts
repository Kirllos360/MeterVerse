import type { Entity, Query, QueryResult, Mutation } from "../contracts/types"
import { CacheEngine } from "../cache/cache-engine"
import { OptimisticEngine } from "../optimistic/optimistic-engine"
import { DataProvider } from "../providers/data-provider"

export class Repository<T extends Entity> {
  constructor(
    protected provider: DataProvider,
    protected cache: CacheEngine,
    protected optimistic: OptimisticEngine,
    protected entityType: string,
  ) {}

  async getById(id: string): Promise<T | null> {
    const cacheKey = `${this.entityType}:${id}`
    const cached = this.cache.get<T>(cacheKey)
    if (cached) return cached

    try {
      const data = await this.provider.read<T>(this.entityType, id)
      this.cache.set(cacheKey, data, { tags: [this.entityType], queryKeys: [this.entityType] })
      return data
    } catch {
      return null
    }
  }

  async query(query: Query<T>): Promise<QueryResult<T>> {
    const cacheKey = `${this.entityType}:query:${JSON.stringify(query)}`
    const cached = this.cache.get<QueryResult<T>>(cacheKey)
    if (cached) return cached

    const result = await this.provider.query(this.entityType, query)
    this.cache.set(cacheKey, result, { tags: [this.entityType], queryKeys: [this.entityType], ttl: 30_000 })
    return result
  }

  async create(data: Partial<T>): Promise<T> {
    const mutation: Mutation<T> = { type: "create", entityType: this.entityType, data, queryKeys: [this.entityType] }
    const result = await this.provider.executeMutation<T>(mutation)
    if (result.success) {
      this.cache.invalidateByQueryKey(this.entityType)
    }
    return result.data!
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const mutation: Mutation<T> = { type: "update", entityType: this.entityType, id, data, queryKeys: [this.entityType] }
    const result = await this.provider.executeMutation<T>(mutation)
    if (result.success) {
      this.cache.delete(`${this.entityType}:${id}`)
      this.cache.invalidateByQueryKey(this.entityType)
    }
    return result.data!
  }

  async delete(id: string): Promise<void> {
    const mutation: Mutation<T> = { type: "delete", entityType: this.entityType, id, queryKeys: [this.entityType] }
    await this.provider.executeMutation<T>(mutation)
    this.cache.delete(`${this.entityType}:${id}`)
    this.cache.invalidateByQueryKey(this.entityType)
  }
}
