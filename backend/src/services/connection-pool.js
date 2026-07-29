import { createConnection } from "net"
import logger from "./logger.js"

const MAX_POOL_SIZE = 20
const IDLE_TIMEOUT_MS = 300000  // 5 min
const CLEANUP_INTERVAL_MS = 60000  // 1 min

export class ConnectionPool {
  constructor(options = {}) {
    this.maxSize = options.maxSize || MAX_POOL_SIZE
    this.idleTimeout = options.idleTimeout || IDLE_TIMEOUT_MS
    this.pool = new Map()  // profileId -> { socket, lastUsed, createdAt, host, port }
    this.activeCount = 0
    this._cleanupTimer = null
  }

  start() {
    logger.info({ maxSize: this.maxSize, idleTimeout: this.idleTimeout, component: "connection-pool" }, "Pool started")
    this._cleanupTimer = setInterval(() => this._cleanup(), CLEANUP_INTERVAL_MS)
    return this
  }

  async acquire(profileId, host, port, timeout = 10000) {
    // Check existing idle connection
    const existing = this.pool.get(profileId)
    if (existing && existing.socket.writable && (Date.now() - existing.lastUsed) < this.idleTimeout) {
      existing.lastUsed = Date.now()
      logger.debug({ profileId, component: "connection-pool" }, "Reused existing connection")
      return existing.socket
    }

    // Max pool check
    if (this.pool.size >= this.maxSize) {
      this._evictOldest()
    }

    // Close stale connection if exists
    if (existing) { try { existing.socket.destroy() } catch {} }

    // Create new connection
    const socket = createConnection({ host, port, timeout }, () => {
      logger.debug({ profileId, host, port, component: "connection-pool" }, "Socket connected")
    })

    socket.setKeepAlive(true, 60000)

    const entry = { socket, lastUsed: Date.now(), createdAt: Date.now(), host, port }
    this.pool.set(profileId, entry)
    this.activeCount = this.pool.size

    return socket
  }

  release(profileId) {
    const entry = this.pool.get(profileId)
    if (entry) {
      entry.lastUsed = Date.now()  // Mark for reuse instead of closing
      logger.debug({ profileId, component: "connection-pool" }, "Socket released back to pool")
    }
  }

  close(profileId) {
    const entry = this.pool.get(profileId)
    if (entry) {
      try { entry.socket.destroy() } catch {}
      this.pool.delete(profileId)
      this.activeCount = this.pool.size
      logger.info({ profileId, component: "connection-pool" }, "Socket closed")
    }
  }

  closeAll() {
    for (const [id] of this.pool) this.close(id)
    if (this._cleanupTimer) clearInterval(this._cleanupTimer)
    logger.info({ component: "connection-pool" }, "All sockets closed")
  }

  getStats() {
    return {
      total: this.pool.size,
      maxSize: this.maxSize,
      activeCount: this.activeCount,
      idleCount: this.pool.size,
      entries: Array.from(this.pool.entries()).map(([id, entry]) => ({
        profileId: id, host: entry.host, port: entry.port,
        age: Date.now() - entry.createdAt,
        idle: Date.now() - entry.lastUsed,
      })),
    }
  }

  _cleanup() {
    const now = Date.now()
    for (const [id, entry] of this.pool) {
      if ((now - entry.lastUsed) > this.idleTimeout) {
        try { entry.socket.destroy() } catch {}
        this.pool.delete(id)
        logger.debug({ profileId: id, component: "connection-pool" }, "Idle connection cleaned up")
      }
    }
    this.activeCount = this.pool.size
  }

  _evictOldest() {
    let oldest = null
    let oldestId = null
    for (const [id, entry] of this.pool) {
      if (!oldest || entry.lastUsed < oldest.lastUsed) {
        oldest = entry; oldestId = id
      }
    }
    if (oldestId) this.close(oldestId)
  }
}
