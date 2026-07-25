/**
 * Idempotency-Key middleware
 * Ensures POST/PUT/PATCH requests with the same idempotency key
 * are only processed once. Stores responses in memory with TTL.
 */

const store = new Map()
const TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

// Periodic cleanup
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.expiresAt < now) store.delete(key)
  }
}, 60_000)

export function idempotencyMiddleware(req, res, next) {
  // Only apply to mutating methods
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return next()

  const key = req.headers["x-idempotency-key"]
  if (!key) return next()

  const existing = store.get(key)
  if (existing) {
    // Return cached response
    res.status(existing.status).json(existing.body)
    return
  }

  // Store the original send to intercept response
  const originalSend = res.json.bind(res)
  res.json = function (body) {
    store.set(key, {
      status: res.statusCode,
      body,
      expiresAt: Date.now() + TTL_MS,
    })
    originalSend(body)
  }

  next()
}

// For testing: clear the store
export function clearIdempotencyStore() {
  store.clear()
}
