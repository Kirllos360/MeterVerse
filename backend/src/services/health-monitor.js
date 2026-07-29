import { prisma } from "../server.js"
import logger from "./logger.js"

export class HealthMonitor {
  constructor(runtime) {
    this.runtime = runtime
    this.scores = new Map()  // profileId -> { score, history }
    this.thresholds = {
      latencyWarning: 500,   // ms
      latencyCritical: 2000, // ms
      heartbeatStaleMs: 90000, // 90s without heartbeat = stale
      failureRateWarning: 0.1, // 10% failure rate
      failureRateCritical: 0.3, // 30% failure rate
    }
  }

  async computeScore(profileId) {
    try {
      const recent = await prisma.healthCheck.findMany({
        where: { connectionProfileId: profileId },
        orderBy: { checkedAt: "desc" },
        take: 20,
      })
      if (recent.length === 0) return { score: 0, status: "unknown", factors: {} }

      const profile = await prisma.connectionProfile.findUnique({ where: { id: profileId } })
      if (!profile) return { score: 0, status: "unknown", factors: {} }

      // Factor 1: Connectivity status (weight: 0.3)
      const okCount = recent.filter(h => h.status === "ok").length
      const connectivityScore = (okCount / recent.length) * 100

      // Factor 2: Latency (weight: 0.2)
      const avgLatency = recent.reduce((s, h) => s + h.latencyMs, 0) / recent.length
      const latencyScore = avgLatency < this.thresholds.latencyWarning ? 100
        : avgLatency < this.thresholds.latencyCritical ? 60 : 20

      // Factor 3: Heartbeat freshness (weight: 0.2)
      const latest = recent[0]
      const freshnessMs = Date.now() - new Date(latest.checkedAt).getTime()
      const freshnessScore = freshnessMs < 30000 ? 100
        : freshnessMs < this.thresholds.heartbeatStaleMs ? 60 : 20

      // Factor 4: Sync success rate (weight: 0.15)
      const syncs = await prisma.syncLog.findMany({
        where: { connectionProfileId: profileId },
        orderBy: { startedAt: "desc" },
        take: 10,
      })
      const syncOk = syncs.filter(s => s.status === "completed").length
      const syncScore = syncs.length > 0 ? (syncOk / syncs.length) * 100 : 50

      // Factor 5: Runtime stability (weight: 0.15)
      const runtimeOk = profile.status === "active" ? 100 : profile.status === "failed" ? 20 : 50

      const score = Math.round(
        connectivityScore * 0.3 +
        latencyScore * 0.2 +
        freshnessScore * 0.2 +
        syncScore * 0.15 +
        runtimeOk * 0.15
      )

      const clamped = Math.max(0, Math.min(100, score))
      const status = clamped >= 80 ? "healthy" : clamped >= 50 ? "degraded" : clamped >= 25 ? "warning" : "critical"

      this.scores.set(profileId, { score: clamped, status, timestamp: Date.now() })

      return {
        score: clamped,
        status,
        factors: {
          connectivity: Math.round(connectivityScore),
          latency: Math.round(latencyScore),
          freshness: Math.round(freshnessScore),
          syncHealth: Math.round(syncScore),
          runtimeStability: Math.round(runtimeOk),
        },
        details: {
          totalChecks: recent.length,
          okCount,
          avgLatency: Math.round(avgLatency),
          lastCheck: latest.checkedAt,
          lastError: recent.find(h => h.error)?.error || null,
        },
      }
    } catch (err) {
      logger.error({ profileId, error: err.message, component: "health-monitor" }, "Score computation failed")
      return { score: 0, status: "error", error: err.message }
    }
  }

  async getAllScores() {
    const profiles = await prisma.connectionProfile.findMany({
      where: { archivedAt: null },
      select: { id: true, name: true, status: true, areaId: true },
    })
    const results = []
    for (const p of profiles) {
      const score = await this.computeScore(p.id)
      results.push({ profileId: p.id, name: p.name, status: p.status, areaId: p.areaId, ...score })
    }
    return results
  }

  getScore(profileId) {
    return this.scores.get(profileId) || { score: 0, status: "unknown" }
  }

  getStats() {
    const values = Array.from(this.scores.values())
    const avg = values.length > 0 ? Math.round(values.reduce((s, v) => s + v.score, 0) / values.length) : 0
    return {
      profilesTracked: this.scores.size,
      averageScore: avg,
      byStatus: {
        healthy: values.filter(v => v.status === "healthy").length,
        degraded: values.filter(v => v.status === "degraded").length,
        warning: values.filter(v => v.status === "warning").length,
        critical: values.filter(v => v.status === "critical").length,
        unknown: values.filter(v => v.status === "unknown" || v.status === "error").length,
      },
      thresholds: this.thresholds,
    }
  }
}
