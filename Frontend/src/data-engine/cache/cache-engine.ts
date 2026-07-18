import { TypedEvent } from "@/runtime/kernel/events"

export interface CacheOptions {
  ttl?: number
  tags?: string[]
  queryKeys?: string[]
}

export interface CacheEntry<T> {
  value: T
  expiresAt: number
  tags: string[]
  queryKeys: string[]
  createdAt: number
}

export interface CacheInvalidateEvent {
  key: string
  reason: "ttl" | "manual" | "mutation" | "tag" | "queryKey"
}

export class CacheEngine {
  private cache = new Map<string, CacheEntry<unknown>>()
  private defaultTTL = 300_000 // 5 minutes
  private maxEntries = 5000

  onInvalidate = new TypedEvent<CacheInvalidateEvent>()

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this.onInvalidate.dispatch({ key, reason: "ttl" })
      return undefined
    }
    return entry.value as T
  }

  set<T>(key: string, value: T, options?: CacheOptions): void {
    if (this.cache.size >= this.maxEntries) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (options?.ttl ?? this.defaultTTL),
      tags: options?.tags || [],
      queryKeys: options?.queryKeys || [],
      createdAt: Date.now(),
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
    this.onInvalidate.dispatch({ key, reason: "manual" })
  }

  clear(): void { this.cache.clear() }

  invalidateByTag(tag: string): void {
    for (const [key, entry] of this.cache) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key)
        this.onInvalidate.dispatch({ key, reason: "tag" })
      }
    }
  }

  invalidateByQueryKey(queryKey: string): void {
    for (const [key, entry] of this.cache) {
      if (entry.queryKeys.includes(queryKey)) {
        this.cache.delete(key)
        this.onInvalidate.dispatch({ key, reason: "queryKey" })
      }
    }
  }

  async getOrCompute<T>(key: string, fn: () => Promise<T>, options?: CacheOptions): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== undefined) return cached
    const value = await fn()
    this.set(key, value, options)
    return value
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    if (Date.now() > entry.expiresAt) { this.cache.delete(key); return false }
    return true
  }

  stats(): { size: number; hitRate: number; hits: number; misses: number } {
    let hits = 0; let misses = 0
    for (const [, entry] of this.cache) {
      if (Date.now() > entry.expiresAt) misses++
      else hits++
    }
    const total = hits + misses
    return { size: this.cache.size, hitRate: total > 0 ? hits / total : 0, hits, misses }
  }
}
