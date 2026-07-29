import { prisma } from "../server.js"
import { ConnectionPool } from "./connection-pool.js"
import { SessionManager } from "./session-manager.js"
import { HealthMonitor } from "./health-monitor.js"
import { DiagnosticsEngine } from "./diagnostics-engine.js"
import { FailoverManager } from "./failover-manager.js"
import { EventBus } from "./event-bus.js"
import { MetricsCollector } from "./metrics-collector.js"
import { createSymbiotBridge, getSymbiotStatus } from "./symbiot-bridge.js"
import logger from "./logger.js"

const RUNTIME_EVENTS = {
  STARTED: "runtime.started",
  STOPPED: "runtime.stopped",
  RESTARTED: "runtime.restarted",
  PROFILE_ACTIVATED: "runtime.profile_activated",
  PROFILE_DEACTIVATED: "runtime.profile_deactivated",
  CONNECTION_LOST: "runtime.connection_lost",
  CONNECTION_RESTORED: "runtime.connection_restored",
  POOL_STATS: "runtime.pool_stats",
}

export class RuntimeManager {
  constructor(options = {}) {
    this.state = "stopped"
    this.eventBus = new EventBus()
    this.metrics = new MetricsCollector()
    this.pool = new ConnectionPool(options.pool)
    this.sessions = new SessionManager(options.session)
    this.healthMonitor = new HealthMonitor(this)
    this.diagnostics = new DiagnosticsEngine(this)
    this.failover = new FailoverManager(this)
    this.symbiotBridge = null
    this._healthTimer = null
    this._activeProfiles = new Map()
    this.metrics = { connectionsOpened: 0, connectionsClosed: 0, reconnections: 0, errors: 0 }
    this.listeners = new Map()
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, [])
    this.listeners.get(event).push(callback)
  }

  _emit(event, data) {
    this.eventBus.emit(event, { ...data, component: "runtime" })
  }

  async start() {
    if (this.state === "running") return
    logger.info({ component: "runtime-manager" }, "Runtime starting...")

    // Start Symbiot bridge
    this.symbiotBridge = createSymbiotBridge()
    logger.info({ component: "runtime-manager" }, "Symbiot bridge created")

    // Start pool + sessions
    this.pool.start()
    this.sessions.start()

    // Load ACTIVE profiles
    const activeProfiles = await prisma.connectionProfile.findMany({
      where: { status: "active" },
      include: { credentials: true, backups: true },
    })
    logger.info({ count: activeProfiles.length, component: "runtime-manager" }, "Active profiles loaded")

    for (const profile of activeProfiles) {
      await this._connectProfile(profile)
    }

    this.state = "running"
    this._emit(RUNTIME_EVENTS.STARTED, { activeCount: activeProfiles.length })
    this.metrics.increment("runtime", "startedCount")

    // Health check loop
    this._healthTimer = setInterval(() => {
      this._healthCheck()
      this.metrics.snapshot(this)
    }, 30000)

    logger.info({ activeCount: activeProfiles.length, component: "runtime-manager" }, "Runtime started")
  }

  async stop() {
    if (this.state === "stopped") return
    logger.info({ component: "runtime-manager" }, "Runtime stopping...")

    if (this._healthTimer) clearInterval(this._healthTimer)

    this.pool.closeAll()
    this.sessions.stop()

    this._activeProfiles.clear()
    this.state = "stopped"
    this._emit(RUNTIME_EVENTS.STOPPED, {})
    logger.info({ component: "runtime-manager" }, "Runtime stopped")
  }

  async restart() {
    logger.info({ component: "runtime-manager" }, "Runtime restarting...")
    await this.stop()
    await this.start()
    this._emit(RUNTIME_EVENTS.RESTARTED, {})
  }

  async _connectProfile(profile) {
    try {
      const socket = await this.pool.acquire(profile.id, profile.host, profile.port, profile.connTimeout * 1000)
      this.metrics.connectionsOpened++

      // Auth handshake
      let token = this.sessions.get(profile.id)
      if (!token && profile.credentials?.password) {
        const { decrypt } = await import("./credential-vault.js")
        const password = decrypt(profile.credentials.password)
        // In production: send AUTH packet via socket
        this.sessions.set(profile.id, `session-${profile.id}-${Date.now()}`)
        token = this.sessions.get(profile.id)
      }

      this._activeProfiles.set(profile.id, { profile, socket, connectedAt: Date.now() })
      this._emit(RUNTIME_EVENTS.PROFILE_ACTIVATED, { profileId: profile.id, name: profile.name })
      logger.info({ profileId: profile.id, name: profile.name, component: "runtime-manager" }, "Profile connected")
    } catch (e) {
      this.metrics.errors++
      logger.error({ profileId: profile.id, error: e.message, component: "runtime-manager" }, "Profile connection failed")
    }
  }

  async _healthCheck() {
    const stats = this.pool.getStats()
    this._emit(RUNTIME_EVENTS.POOL_STATS, stats)

    for (const [id, entry] of this._activeProfiles) {
      const healthy = entry.socket && entry.socket.writable
      if (!healthy) {
        this.metrics.connectionsClosed++
        this._emit(RUNTIME_EVENTS.CONNECTION_LOST, { profileId: id })

        // Attempt reconnect
        try {
          const profile = await prisma.connectionProfile.findUnique({ where: { id } })
          if (profile) {
            await this._connectProfile(profile)
            this.metrics.reconnections++
            this._emit(RUNTIME_EVENTS.CONNECTION_RESTORED, { profileId: id })
          }
        } catch (e) {
          logger.error({ profileId: id, error: e.message, component: "runtime-manager" }, "Reconnect failed")
        }
      }
    }
  }

  async activateProfile(profileId) {
    const profile = await prisma.connectionProfile.findUnique({
      where: { id: profileId },
      include: { credentials: true, backups: true },
    })
    if (!profile) throw new Error("Profile not found")
    await this._connectProfile(profile)
  }

  deactivateProfile(profileId) {
    this.pool.close(profileId)
    this.sessions.remove(profileId)
    this._activeProfiles.delete(profileId)
    this._emit(RUNTIME_EVENTS.PROFILE_DEACTIVATED, { profileId })
  }

  getStatus() {
    const symbiot = getSymbiotStatus()
    return {
      state: this.state,
      activeConnections: this._activeProfiles.size,
      pool: this.pool.getStats(),
      sessions: this.sessions.getStats(),
      symbiot,
      failover: this.failover.getStats(),
      eventBus: this.eventBus.getStats(),
      observability: this.metrics.getMetrics(),
      uptime: process.uptime(),
    }
  }
}

export { RUNTIME_EVENTS }
