import { prisma } from "../server.js"
import logger from "./logger.js"

const FAILOVER_STATES = {
  NORMAL: "normal",
  DEGRADED: "degraded",
  FAILOVER_PENDING: "failover_pending",
  FAILOVER_EXECUTING: "failover_executing",
  BACKUP_ACTIVE: "backup_active",
  RECOVERY_CHECK: "recovery_check",
  PRIMARY_RESTORED: "primary_restored",
}

const COOLDOWN_MS = 60000
const HEALTH_THRESHOLD = 3

export class FailoverManager {
  constructor(runtime) {
    this.runtime = runtime
    this.states = new Map()       // profileId -> failoverState
    this.cooldowns = new Map()    // profileId -> timestamp (when cooldown ends)
    this.profileFailCount = new Map()  // profileId -> consecutive failure count
    this.failoverHistory = []
  }

  async onHeartbeatResult(profileId, status, error) {
    const count = this.profileFailCount.get(profileId) || 0

    if (status === "ok") {
      this.profileFailCount.set(profileId, 0)
      this.states.set(profileId, FAILOVER_STATES.NORMAL)
      return
    }

    this.profileFailCount.set(profileId, count + 1)
    const newCount = count + 1

    if (newCount >= HEALTH_THRESHOLD) {
      await this.executeFailover(profileId, "Heartbeat missed " + newCount + " consecutive times")
    } else {
      this.states.set(profileId, FAILOVER_STATES.DEGRADED)
      logger.warn({ profileId, failCount: newCount, threshold: HEALTH_THRESHOLD, component: "failover" }, "Connection degraded")
    }
  }

  async executeFailover(profileId, reason) {
    // Cooldown check — prevent flapping
    if (this.cooldowns.has(profileId) && Date.now() < this.cooldowns.get(profileId)) {
      logger.info({ profileId, component: "failover" }, "Failover skipped — cooldown active")
      return { skipped: true, reason: "Cooldown active" }
    }

    // Lock check — prevent concurrent failover
    const currentState = this.states.get(profileId)
    if (currentState === FAILOVER_STATES.FAILOVER_EXECUTING) {
      logger.warn({ profileId, component: "failover" }, "Failover already in progress")
      return { skipped: true, reason: "Failover already executing" }
    }

    this.states.set(profileId, FAILOVER_STATES.FAILOVER_EXECUTING)
    const start = Date.now()

    try {
      const profile = await prisma.connectionProfile.findUnique({
        where: { id: profileId },
        include: { backups: { orderBy: { priority: "asc" } } },
      })
      if (!profile) throw new Error("Profile not found")

      const activeBackup = profile.backups.find(b => b.isActive)
      const targetBackup = activeBackup || profile.backups[0]

      if (!targetBackup) {
        this.states.set(profileId, FAILOVER_STATES.NORMAL)
        this.cooldowns.set(profileId, Date.now() + COOLDOWN_MS)
        logger.error({ profileId, component: "failover" }, "No backup available for failover")
        await this._createFailoverIncident(profileId, reason, null, "No backup configured")
        return { success: false, error: "No backup available" }
      }

      // Switch to backup
      const { createConnection } = await import("net")
      await new Promise((resolve, reject) => {
        const socket = createConnection({ host: targetBackup.host, port: targetBackup.port, timeout: 10000 }, () => {
          socket.end(); resolve(true)
        })
        socket.on("error", (e) => reject(e))
        socket.on("timeout", () => reject(new Error("Backup connection timed out")))
      })

      // Success — promote backup
      await prisma.backupConfig.updateMany({
        where: { connectionProfileId: profileId },
        data: { isActive: false },
      })
      await prisma.backupConfig.update({
        where: { id: targetBackup.id },
        data: { isActive: true, lastUsedAt: new Date() },
      })
      await prisma.connectionProfile.update({
        where: { id: profileId },
        data: { host: targetBackup.host, port: targetBackup.port, status: "active" },
      })

      this.states.set(profileId, FAILOVER_STATES.BACKUP_ACTIVE)
      this.profileFailCount.set(profileId, 0)

      // Notify runtime to reconnect
      if (this.runtime) {
        this.runtime._emit("failover.completed", { profileId, from: profile.host + ":" + profile.port, to: targetBackup.host + ":" + targetBackup.port, reason })
      }

      await this._createFailoverIncident(profileId, reason, targetBackup.host + ":" + targetBackup.port, null)

      logger.info({
        profileId, backupHost: targetBackup.host, backupPort: targetBackup.port,
        durationMs: Date.now() - start, component: "failover",
      }, "Failover completed")

      return { success: true, backupHost: targetBackup.host, backupPort: targetBackup.port }
    } catch (e) {
      this.states.set(profileId, FAILOVER_STATES.NORMAL)
      this.cooldowns.set(profileId, Date.now() + COOLDOWN_MS)

      logger.error({ profileId, error: e.message, component: "failover" }, "Failover failed")
      await this._createFailoverIncident(profileId, reason, null, e.message)

      return { success: false, error: e.message }
    }
  }

  async switchbackToPrimary(profileId) {
    const profile = await prisma.connectionProfile.findUnique({ where: { id: profileId } })
    if (!profile) throw new Error("Profile not found")

    const originalHost = profile.host  // Currently active backup
    const backupConfig = await prisma.backupConfig.findFirst({
      where: { connectionProfileId: profileId, isActive: true },
    })
    if (!backupConfig) throw new Error("No active backup found to switch back from")

    // The backup stores the original primary info — we need to find the primary config
    // Primary host is stored in the profile's original fields
    // For simplicity, we get it from the least-priority backup (which was the original)
    const primaryBackup = await prisma.backupConfig.findFirst({
      where: { connectionProfileId: profileId },
      orderBy: { priority: "desc" },
    })

    if (!primaryBackup) throw new Error("Cannot determine primary connection")

    // Switch back: restore original host from the backup config
    await prisma.backupConfig.updateMany({
      where: { connectionProfileId: profileId },
      data: { isActive: false },
    })
    await prisma.backupConfig.update({
      where: { id: backupConfig.id },
      data: { isActive: true },
    })
    await prisma.connectionProfile.update({
      where: { id: profileId },
      data: { host: primaryBackup.host, port: primaryBackup.port, status: "active" },
    })

    this.states.set(profileId, FAILOVER_STATES.PRIMARY_RESTORED)
    this.cooldowns.set(profileId, Date.now() + COOLDOWN_MS)

    if (this.runtime) {
      this.runtime._emit("failover.switchback", { profileId, host: primaryBackup.host })
    }

    logger.info({ profileId, host: primaryBackup.host, component: "failover" }, "Switched back to primary")
    return { success: true, host: primaryBackup.host }
  }

  getState(profileId) {
    return this.states.get(profileId) || FAILOVER_STATES.NORMAL
  }

  getStats() {
    const entries = []
    for (const [profileId, state] of this.states) {
      entries.push({
        profileId, state,
        failCount: this.profileFailCount.get(profileId) || 0,
        cooldownUntil: this.cooldowns.get(profileId) || null,
      })
    }
    return {
      historyCount: this.failoverHistory.length,
      entries,
      cooldownMs: COOLDOWN_MS,
      healthThreshold: HEALTH_THRESHOLD,
    }
  }

  async _createFailoverIncident(profileId, reason, backupTarget, error) {
    try {
      await prisma.incident.create({
        data: {
          title: "Failover: " + (backupTarget ? "switched to " + backupTarget : "failed"),
          description: "Connection failover triggered for profile " + profileId,
          severity: backupTarget ? "P2" : "P1",
          category: "communication",
          source: "auto_detected",
          status: backupTarget ? "resolved" : "investigating",
          fingerprint: "failover-" + profileId,
          resolution: backupTarget ? "Failover to backup succeeded. Backup: " + backupTarget : "Failover failed: " + (error || "unknown"),
        },
      })
    } catch (e) {
      logger.error({ profileId, error: e.message, component: "failover" }, "Failed to create incident")
    }
  }
}
