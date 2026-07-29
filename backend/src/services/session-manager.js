import logger from "./logger.js"

const SESSION_TTL_MS = 3600000  // 1 hour default
const CLEANUP_INTERVAL_MS = 300000  // 5 min

export class SessionManager {
  constructor(options = {}) {
    this.sessionTtl = options.sessionTtl || SESSION_TTL_MS
    this.sessions = new Map()  // profileId -> { token, expiresAt, createdAt }
    this._cleanupTimer = null
  }

  start() {
    logger.info({ sessionTtl: this.sessionTtl, component: "session-manager" }, "Session manager started")
    this._cleanupTimer = setInterval(() => this._cleanup(), CLEANUP_INTERVAL_MS)
    return this
  }

  set(profileId, token, ttl) {
    const expiresAt = Date.now() + (ttl || this.sessionTtl)
    this.sessions.set(profileId, { token, expiresAt, createdAt: Date.now() })
    logger.debug({ profileId, expiresAt: new Date(expiresAt).toISOString(), component: "session-manager" }, "Session cached")
  }

  get(profileId) {
    const session = this.sessions.get(profileId)
    if (!session) return null
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(profileId)
      logger.debug({ profileId, component: "session-manager" }, "Session expired")
      return null
    }
    session.expiresAt = Date.now() + this.sessionTtl  // sliding expiration
    return session.token
  }

  refresh(profileId, newToken, ttl) {
    this.set(profileId, newToken, ttl)
    logger.debug({ profileId, component: "session-manager" }, "Session refreshed")
  }

  remove(profileId) {
    this.sessions.delete(profileId)
    logger.debug({ profileId, component: "session-manager" }, "Session removed")
  }

  clear() {
    this.sessions.clear()
    logger.info({ component: "session-manager" }, "All sessions cleared")
  }

  stop() {
    if (this._cleanupTimer) clearInterval(this._cleanupTimer)
    this.sessions.clear()
    logger.info({ component: "session-manager" }, "Session manager stopped")
  }

  getStats() {
    const now = Date.now()
    return {
      total: this.sessions.size,
      active: Array.from(this.sessions.values()).filter(s => s.expiresAt > now).length,
      expired: Array.from(this.sessions.values()).filter(s => s.expiresAt <= now).length,
    }
  }

  _cleanup() {
    const now = Date.now()
    for (const [id, session] of this.sessions) {
      if (session.expiresAt <= now) this.sessions.delete(id)
    }
  }
}
