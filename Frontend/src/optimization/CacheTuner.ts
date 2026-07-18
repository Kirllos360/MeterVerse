import { CacheEngine } from "@/data-engine/cache/cache-engine"
import { getDataEngine } from "@/data-engine/hooks/useDataEngine"

export interface CacheConfig {
  entityTTL: Record<string, number>  // seconds per entity type
  queryTTL: number                   // seconds for query results
  swrWindow: number                  // stale-while-revalidate window
  maxEntries: number
}

const DEFAULT_CONFIG: CacheConfig = {
  entityTTL: {
    customers: 300,    // 5 min
    meters: 600,       // 10 min (meters change less frequently)
    invoices: 120,     // 2 min
    readings: 60,      // 1 min (readings change frequently)
    payments: 120,     // 2 min
    reports: 900,      // 15 min
  },
  queryTTL: 30,         // 30 seconds for list queries
  swrWindow: 60,        // serve stale for 60s while revalidating
  maxEntries: 5000,
}

export class CacheTuner {
  private cache: CacheEngine
  private config: CacheConfig

  constructor(cache?: CacheEngine, config?: Partial<CacheConfig>) {
    this.cache = cache || new CacheEngine()
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  getConfig(): CacheConfig { return { ...this.config } }

  updateConfig(partial: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...partial }
  }

  getEntityTTL(entityType: string): number {
    return this.config.entityTTL[entityType] || this.config.queryTTL
  }

  invalidateStaleCaches(): void {
    const engine = getDataEngine()
    const entityTypes = Object.keys(this.config.entityTTL)
    for (const type of entityTypes) {
      engine.cache.invalidateByQueryKey(type)
    }
  }

  warmUpCache(): void {
    const engine = getDataEngine()
    // Pre-warm essential data
    // This would be called after login / initial load
  }

  getStats() {
    return this.cache.stats()
  }

  resetToDefaults(): void {
    this.config = { ...DEFAULT_CONFIG }
  }
}

export function createCacheTuner(): CacheTuner {
  return new CacheTuner()
}
