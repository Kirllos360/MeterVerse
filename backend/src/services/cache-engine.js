const cache = new Map()
const TTL_SECONDS = 300

export function getCached(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data
}

export function setCache(key, data, ttl = TTL_SECONDS) {
  cache.set(key, { data, expiresAt: Date.now() + ttl * 1000 })
}

export function clearCache(pattern) {
  if (!pattern) { cache.clear(); return }
  const regex = new RegExp(pattern.replace(/\*/g, ".*"))
  for (const key of cache.keys()) {
    if (regex.test(key)) cache.delete(key)
  }
}

export function getCacheStats() {
  return { size: cache.size, keys: [...cache.keys()] }
}
