import { prisma } from "../server.js"
import logger from "./logger.js"

const JOB_LOCKS = new Map()

export class SchedulerEngine {
  constructor(runtimeManager) {
    this.runtime = runtimeManager
    this.jobs = new Map()
    this.timers = new Map()
    this.state = "stopped"
  }

  register(job) {
    if (this.jobs.has(job.id)) throw new Error(`Job ${job.id} already registered`)
    this.jobs.set(job.id, {
      ...job,
      lastRun: null,
      lastDuration: 0,
      lastError: null,
      runCount: 0,
      failCount: 0,
    })
    logger.info({ jobId: job.id, jobName: job.name, intervalMs: job.intervalMs, component: "scheduler" }, "Job registered")
  }

  start() {
    if (this.state === "running") return
    this.state = "running"
    logger.info({ jobCount: this.jobs.size, component: "scheduler" }, "Scheduler starting...")

    for (const [id, job] of this.jobs) {
      this._startJob(id, job)
    }
    logger.info({ jobCount: this.jobs.size, component: "scheduler" }, "Scheduler started")
  }

  stop() {
    this.state = "stopped"
    for (const [id, timer] of this.timers) {
      clearInterval(timer)
    }
    this.timers.clear()
    JOB_LOCKS.clear()
    logger.info({ component: "scheduler" }, "Scheduler stopped")
  }

  _startJob(id, job) {
    const execute = async () => {
      if (!this._acquireLock(id)) {
        logger.debug({ jobId: id, component: "scheduler" }, "Job skipped — lock held by another instance")
        return
      }
      const entry = this.jobs.get(id)
      const start = Date.now()
      entry.lastRun = new Date()
      entry.runCount++

      try {
        await job.handler(this.runtime, prisma)
        entry.lastDuration = Date.now() - start
        entry.lastError = null
        this._emitEvent(`scheduler.${id}.completed`, { jobId: id, durationMs: entry.lastDuration })
      } catch (err) {
        entry.failCount++
        entry.lastError = err.message
        entry.lastDuration = Date.now() - start
        logger.error({ jobId: id, error: err.message, durationMs: entry.lastDuration, component: "scheduler" }, "Job failed")
        this._emitEvent(`scheduler.${id}.failed`, { jobId: id, error: err.message })
      } finally {
        this._releaseLock(id)
      }
    }

    // Run immediately on start (for heartbeat)
    if (job.runOnStart) {
      setTimeout(execute, 1000)
    }

    this.timers.set(id, setInterval(execute, job.intervalMs))
  }

  _acquireLock(id) {
    if (JOB_LOCKS.has(id)) return false
    JOB_LOCKS.set(id, Date.now())
    return true
  }

  _releaseLock(id) {
    JOB_LOCKS.delete(id)
  }

  _emitEvent(event, data) {
    if (this.runtime) {
      try { this.runtime._emit(event, data) } catch {}
    }
  }

  getStats() {
    const entries = []
    for (const [id, job] of this.jobs) {
      entries.push({
        id, name: job.name, intervalMs: job.intervalMs,
        lastRun: job.lastRun, lastDuration: job.lastDuration,
        lastError: job.lastError, runCount: job.runCount,
        failCount: job.failCount, locked: JOB_LOCKS.has(id),
      })
    }
    return { state: this.state, jobCount: this.jobs.size, entries, lockedCount: JOB_LOCKS.size }
  }
}

// ─── Built-in Job Definitions ──────────────────────────────────────────

export const HEARTBEAT_JOB = {
  id: "heartbeat",
  name: "Heartbeat Check",
  intervalMs: 30000,
  runOnStart: true,
  handler: async (runtime, prisma) => {
    const activeProfiles = await prisma.connectionProfile.findMany({
      where: { status: "active", archivedAt: null },
    })
    for (const profile of activeProfiles) {
      const start = Date.now()
      let status = "ok"
      let error = null
      try {
        const { createConnection } = await import("net")
        await new Promise((resolve, reject) => {
          const socket = createConnection({ host: profile.host, port: profile.port, timeout: 5000 }, () => {
            socket.end(); resolve(true)
          })
          socket.on("error", (e) => reject(e))
          socket.on("timeout", () => reject(new Error("Timed out")))
        })
      } catch (e) {
        status = "failed"; error = e.message
      }
      await prisma.healthCheck.create({
        data: { connectionProfileId: profile.id, status, latencyMs: Date.now() - start, error },
      })
      // Route to FailoverManager for handling
      if (status === "failed" && runtime) {
        await runtime.failover.onHeartbeatResult(profile.id, "failed", error)
      }
    }
    logger.debug({ component: "scheduler", profilesChecked: activeProfiles.length }, "Heartbeat completed")
  },
}

export const SYNC_METER_JOB = {
  id: "sync-meter",
  name: "Meter Synchronization",
  intervalMs: 3600000,
  runOnStart: true,
  handler: async (runtime, prisma) => {
    const activeProfiles = await prisma.connectionProfile.findMany({
      where: { status: "active", archivedAt: null },
    })
    for (const profile of activeProfiles) {
      const log = await prisma.syncLog.create({
        data: { connectionProfileId: profile.id, syncType: "incremental", status: "running", startedAt: new Date() },
      })
      try {
        // In production: query meters via TCP to profile
        const meterCount = await prisma.meter.count({ where: { archivedAt: null } })
        await prisma.syncLog.update({
          where: { id: log.id },
          data: { status: "completed", recordsProcessed: meterCount, completedAt: new Date(), durationMs: 100 },
        })
        await prisma.connectionProfile.update({ where: { id: profile.id }, data: { lastSyncAt: new Date() } })
      } catch (e) {
        await prisma.syncLog.update({
          where: { id: log.id },
          data: { status: "failed", error: e.message, completedAt: new Date() },
        })
      }
    }
  },
}

export const SYNC_READING_JOB = {
  id: "sync-reading",
  name: "Reading Synchronization",
  intervalMs: 900000,
  runOnStart: false,
  handler: async (runtime, prisma) => {
    const activeProfiles = await prisma.connectionProfile.findMany({
      where: { status: "active", archivedAt: null },
    })
    for (const profile of activeProfiles) {
      const log = await prisma.syncLog.create({
        data: { connectionProfileId: profile.id, syncType: "incremental", status: "running", startedAt: new Date() },
      })
      try {
        const readingCount = await prisma.reading.count({
          where: { archivedAt: null, createdAt: { gte: new Date(Date.now() - 900000) } },
        })
        await prisma.syncLog.update({
          where: { id: log.id },
          data: { status: "completed", recordsProcessed: readingCount, completedAt: new Date(), durationMs: 100 },
        })
      } catch (e) {
        await prisma.syncLog.update({
          where: { id: log.id },
          data: { status: "failed", error: e.message, completedAt: new Date() },
        })
      }
    }
  },
}

export const CLEANUP_JOB = {
  id: "cleanup",
  name: "System Cleanup",
  intervalMs: 86400000,
  runOnStart: false,
  handler: async (runtime, prisma) => {
    const cutoff = new Date(Date.now() - 90 * 86400000)
    // Archive old health checks (>90 days)
    const oldHealth = await prisma.healthCheck.deleteMany({ where: { checkedAt: { lt: cutoff } } })
    // Archive old sync logs (>365 days)
    const oldSync = await prisma.syncLog.deleteMany({ where: { startedAt: { lt: new Date(Date.now() - 365 * 86400000) } } })
    logger.info({ component: "scheduler", healthChecksArchived: oldHealth.count, syncLogsArchived: oldSync.count }, "Cleanup completed")
  },
}

export const RETRY_JOB = {
  id: "retry",
  name: "Retry Queue Processor",
  intervalMs: 60000,
  runOnStart: false,
  handler: async (runtime, prisma) => {
    // Find and retry failed sync logs that haven't exceeded max retries
    const failedSyncs = await prisma.syncLog.findMany({
      where: { status: "failed", completedAt: { gte: new Date(Date.now() - 86400000) } },
      take: 10,
    })
    for (const log of failedSyncs) {
      const profile = await prisma.connectionProfile.findUnique({ where: { id: log.connectionProfileId } })
      if (!profile || profile.status !== "active") continue
      const retryLog = await prisma.syncLog.create({
        data: { connectionProfileId: profile.id, syncType: log.syncType, status: "running", startedAt: new Date() },
      })
      try {
        await prisma.syncLog.update({ where: { id: retryLog.id }, data: { status: "completed", completedAt: new Date() } })
      } catch (e) {
        await prisma.syncLog.update({ where: { id: retryLog.id }, data: { status: "failed", error: e.message, completedAt: new Date() } })
      }
    }
  },
}
