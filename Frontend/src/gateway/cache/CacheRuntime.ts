interface CacheEntry<T> {
  data: T
  expires: number
  tags: string[]
  createdAt: number
}

class CacheRuntime {
  private store = new Map<string, CacheEntry<unknown>>()
  private pending = new Map<string, Promise<unknown>>()

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expires) { this.store.delete(key); return undefined }
    return entry.data as T
  }

  set<T>(key: string, data: T, ttlMs = 30000, tags: string[] = []): void {
    this.store.set(key, { data, expires: Date.now() + ttlMs, tags, createdAt: Date.now() })
  }

  invalidate(tag: string): void {
    this.store.forEach((entry, key) => {
      if (entry.tags.includes(tag)) this.store.delete(key)
    })
  }

  invalidateAll(): void { this.store.clear() }

  async getOrFetch<T>(key: string, fetcher: () => Promise<T>, ttlMs = 30000, tags: string[] = []): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== undefined) return cached

    const pending = this.pending.get(key)
    if (pending) return pending as Promise<T>

    const promise = fetcher().then((data) => {
      this.set(key, data, ttlMs, tags)
      this.pending.delete(key)
      return data
    }).catch((err) => {
      this.pending.delete(key)
      throw err
    })
    this.pending.set(key, promise)
    return promise
  }

  getSize(): number { return this.store.size }
  getKeys(): string[] { return Array.from(this.store.keys()) }
}

export const cacheRuntime = new CacheRuntime()
