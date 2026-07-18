/* ── Cache Manager ── */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  staleAt: number;
  createdAt: number;
}

type CacheListener = (key: string) => void;

export class CacheManager {
  private store = new Map<string, CacheEntry<unknown>>();
  private listeners = new Set<CacheListener>();
  private defaultFreshMs = 30000;
  private defaultStaleMs = 300000;

  onInvalidate(fn: CacheListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify(key: string) {
    this.listeners.forEach((fn) => fn(key));
  }

  setFreshMs(ms: number) { this.defaultFreshMs = ms; }
  setStaleMs(ms: number) { this.defaultStaleMs = ms; }

  get<T>(key: string): { data: T; status: "fresh" | "stale" } | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { this.store.delete(key); return null; }
    const status = Date.now() > entry.staleAt ? "stale" : "fresh";
    return { data: entry.data as T, status };
  }

  set<T>(key: string, data: T, freshMs?: number, staleMs?: number): void {
    const now = Date.now();
    this.store.set(key, {
      data,
      createdAt: now,
      expiresAt: now + (staleMs ?? this.defaultStaleMs),
      staleAt: now + (freshMs ?? this.defaultFreshMs),
    });
  }

  invalidate(key: string): void {
    const entry = this.store.get(key);
    if (entry) { entry.staleAt = 0; this.notify(key); }
  }

  invalidateAll(): void {
    this.store.clear();
    this.notify("*");
  }

  isFresh(key: string): boolean {
    const entry = this.store.get(key);
    return entry ? Date.now() <= entry.staleAt : false;
  }

  isStale(key: string): boolean {
    const entry = this.store.get(key);
    return entry ? Date.now() > entry.staleAt && Date.now() <= entry.expiresAt : false;
  }

  get size(): number { return this.store.size; }
}

export const queryCache = new CacheManager();
