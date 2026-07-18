/* ── Repository Cache ── */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class RepositoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private defaultTTLMs = 30000;

  setDefaultTTL(ms: number) { this.defaultTTLMs = ms; }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { this.store.delete(key); return null; }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    this.store.set(key, { data, expiresAt: Date.now() + (ttlMs ?? this.defaultTTLMs) });
  }

  invalidate(key: string): void { this.store.delete(key); }

  invalidatePattern(pattern: RegExp): void {
    for (const key of this.store.keys()) {
      if (pattern.test(key)) this.store.delete(key);
    }
  }

  clear(): void { this.store.clear(); }

  /* ── Key builders ── */
  entityKey(type: string, id: string): string { return `entity:${type}:${id}`; }
  listKey(type: string, params?: string): string { return `list:${type}:${params || ""}`; }
  searchKey(type: string, query: string): string { return `search:${type}:${query}`; }
}

export const cache = new RepositoryCache();
