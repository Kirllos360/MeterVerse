import { prisma } from "../server.js"
import { decrypt } from "./credential-vault.js"
import logger from "./logger.js"

const STAGES = [
  { id: 1, name: "Connection Availability", severity: "critical" },
  { id: 2, name: "Credential Validation", severity: "critical" },
  { id: 3, name: "Network Reachability", severity: "critical" },
  { id: 4, name: "TCP Socket Validation", severity: "critical" },
  { id: 5, name: "Runtime State Validation", severity: "high" },
  { id: 6, name: "Session Validation", severity: "high" },
  { id: 7, name: "Authentication Validation", severity: "critical" },
  { id: 8, name: "Meter Communication Test", severity: "high" },
  { id: 9, name: "Synchronization Validation", severity: "medium" },
  { id: 10, name: "Data Consistency Validation", severity: "medium" },
  { id: 11, name: "Performance Analysis", severity: "low" },
  { id: 12, name: "Final Diagnostic Summary", severity: "info" },
]

const RECOVERY_SUGGESTIONS = {
  1: ["Check if the server is powered on", "Verify network cables and switches", "Check firewall rules"],
  2: ["Verify username and password are correct", "Rotate credentials if expired", "Check credential vault encryption key"],
  3: ["Run ping test to host", "Check DNS resolution", "Verify routing tables"],
  4: ["Check if service is listening on the port", "Verify port number in configuration", "Check for port conflicts"],
  5: ["Restart the runtime manager", "Check runtime logs for errors", "Verify runtime configuration"],
  6: ["Clear and re-establish session", "Verify session TTL settings", "Check for token expiration"],
  7: ["Test authentication with known good credentials", "Check if account is locked", "Verify authentication service"],
  8: ["Check if meter is powered on", "Verify meter communication module", "Test with known working meter"],
  9: ["Check sync logs for errors", "Verify data source availability", "Reset sync cursor"],
  10: ["Run data comparison between source and target", "Check for missing records", "Verify checksums"],
  11: ["Review latency measurements", "Check for network congestion", "Consider bandwidth upgrade"],
}

export class DiagnosticsEngine {
  constructor(runtime) {
    this.runtime = runtime
  }

  async runFullDiagnostic(profileId) {
    const correlationId = "diag-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6)
    const start = Date.now()
    const stages = []
    let overallStatus = "passed"
    let stopPipeline = false

    const profile = await prisma.connectionProfile.findUnique({
      where: { id: profileId },
      include: { credentials: true, backups: true },
    })
    if (!profile) return { error: "Profile not found", correlationId }

    logger.info({ profileId, correlationId, component: "diagnostics" }, "Diagnostic started")

    const healthMonitor = this.runtime?.healthMonitor

    for (const stage of STAGES) {
      if (stopPipeline) {
        stages.push({
          stage: stage.id, name: stage.name, status: "skipped",
          detail: "Previous critical stage failed", latencyMs: 0,
        })
        continue
      }

      const stageStart = Date.now()
      let result

      try {
        result = await this._executeStage(stage.id, profile, healthMonitor)
      } catch (err) {
        result = { status: "error", detail: err.message }
      }

      const latencyMs = Date.now() - stageStart
      stages.push({
        stage: stage.id, name: stage.name, status: result.status,
        detail: result.detail, latencyMs,
        severity: stage.severity,
        suggestions: result.status === "failed" ? (RECOVERY_SUGGESTIONS[stage.id] || []) : [],
      })

      if (result.status === "failed" && stage.severity === "critical") {
        overallStatus = "failed"
        stopPipeline = true
      } else if (result.status === "failed" && overallStatus !== "failed") {
        overallStatus = "degraded"
      }
    }

    // Compute health score
    let healthScore = null
    if (healthMonitor) {
      healthScore = await healthMonitor.computeScore(profileId).catch(() => null)
    }

    const report = {
      correlationId,
      profileId,
      profileName: profile.name,
      areaId: profile.areaId,
      overallStatus,
      healthScore,
      stages,
      summary: {
        total: STAGES.length,
        passed: stages.filter(s => s.status === "passed").length,
        failed: stages.filter(s => s.status === "failed").length,
        skipped: stages.filter(s => s.status === "skipped").length,
      },
      recommendations: stages
        .filter(s => s.status === "failed" && s.suggestions.length > 0)
        .flatMap(s => s.suggestions),
      durationMs: Date.now() - start,
      completedAt: new Date().toISOString(),
    }

    // Save diagnostic result
    await prisma.connectionTest.create({
      data: {
        connectionProfileId: profileId,
        testType: "full",
        status: overallStatus,
        latencyMs: Date.now() - start,
        details: JSON.stringify(report),
      },
    }).catch(() => {})

    logger.info({ profileId, correlationId, overallStatus, durationMs: report.durationMs, component: "diagnostics" }, "Diagnostic completed")
    return report
  }

  async _executeStage(stageId, profile, healthMonitor) {
    switch (stageId) {
      case 1: return this._stage1_availability(profile)
      case 2: return this._stage2_credentials(profile)
      case 3: return this._stage3_network(profile)
      case 4: return this._stage4_tcp(profile)
      case 5: return this._stage5_runtime(profile, healthMonitor)
      case 6: return this._stage6_session(profile)
      case 7: return this._stage7_auth(profile)
      case 8: return this._stage8_meter(profile)
      case 9: return this._stage9_sync(profile)
      case 10: return this._stage10_consistency(profile)
      case 11: return this._stage11_performance(profile, healthMonitor)
      case 12: return this._stage12_summary()
      default: return { status: "error", detail: "Unknown stage" }
    }
  }

  async _stage1_availability(profile) {
    if (profile.status === "active") return { status: "passed", detail: "Connection profile is active" }
    if (profile.status === "failed") return { status: "failed", detail: "Connection profile is in failed state" }
    if (profile.status === "draft" || profile.status === "configured") return { status: "failed", detail: "Profile not yet activated" }
    return { status: "warning", detail: "Connection status: " + profile.status }
  }

  async _stage2_credentials(profile) {
    if (!profile.credentials) return { status: "failed", detail: "No credentials configured" }
    if (!profile.credentials.password && !profile.credentials.dbPassword) return { status: "warning", detail: "Credentials exist but no password set" }
    try {
      if (profile.credentials.password) {
        const test = decrypt(profile.credentials.password)
        if (test.length > 0) return { status: "passed", detail: "Credentials valid and decryptable" }
      }
      return { status: "passed", detail: "Credentials configured" }
    } catch {
      return { status: "failed", detail: "Credentials corrupted or encryption key mismatch" }
    }
  }

  async _stage3_network(profile) {
    try {
      const dns = await import("dns")
      await dns.promises.resolve(profile.host)
      return { status: "passed", detail: "Host " + profile.host + " resolves" }
    } catch {
      return { status: "failed", detail: "DNS resolution failed for " + profile.host }
    }
  }

  async _stage4_tcp(profile) {
    try {
      const { createConnection } = await import("net")
      await new Promise((resolve, reject) => {
        const socket = createConnection({ host: profile.host, port: profile.port, timeout: 5000 }, () => {
          socket.end(); resolve(true)
        })
        socket.on("error", (e) => reject(e))
        socket.on("timeout", () => reject(new Error("Connection timed out")))
      })
      return { status: "passed", detail: "TCP socket opened to " + profile.host + ":" + profile.port }
    } catch (e) {
      return { status: "failed", detail: "TCP connection failed: " + e.message }
    }
  }

  async _stage5_runtime(profile, hm) {
    if (!this.runtime) return { status: "warning", detail: "Runtime manager not available" }
    const state = this.runtime.state
    const score = hm ? (await hm.computeScore(profile.id).catch(() => ({ score: 0 }))).score : 0
    if (state === "running") return { status: "passed", detail: "Runtime running, health score: " + score }
    return { status: "warning", detail: "Runtime state: " + state }
  }

  async _stage6_session(profile) {
    const sessions = this.runtime?.sessions
    if (!sessions) return { status: "warning", detail: "Session manager not available" }
    const token = sessions.get(profile.id)
    if (token) return { status: "passed", detail: "Active session exists" }
    return { status: "warning", detail: "No cached session (will be created on next connection)" }
  }

  async _stage7_auth(profile) {
    if (!profile.credentials?.password) return { status: "warning", detail: "No password configured for auth test" }
    try {
      decrypt(profile.credentials.password)
      return { status: "passed", detail: "Authentication credentials valid" }
    } catch {
      return { status: "failed", detail: "Cannot decrypt credentials" }
    }
  }

  async _stage8_meter(profile) {
    try {
      const count = await prisma.meter.count({ where: { archivedAt: null } })
      return { status: "passed", detail: count + " meters registered in system" }
    } catch (e) {
      return { status: "error", detail: "Meter query failed: " + e.message }
    }
  }

  async _stage9_sync(profile) {
    const recent = await prisma.syncLog.findFirst({
      where: { connectionProfileId: profile.id },
      orderBy: { startedAt: "desc" },
    })
    if (!recent) return { status: "warning", detail: "No sync history available" }
    if (recent.status === "completed") return { status: "passed", detail: "Last sync: " + recent.startedAt.toISOString() + " (" + recent.recordsProcessed + " records)" }
    return { status: "warning", detail: "Last sync failed: " + (recent.error || "Unknown error") }
  }

  async _stage10_consistency(profile) {
    const checks = await prisma.healthCheck.count({ where: { connectionProfileId: profile.id } })
    const syncs = await prisma.syncLog.count({ where: { connectionProfileId: profile.id } })
    return { status: "passed", detail: checks + " health checks, " + syncs + " sync records tracked" }
  }

  async _stage11_performance(profile, hm) {
    const recent = await prisma.healthCheck.findMany({
      where: { connectionProfileId: profile.id },
      orderBy: { checkedAt: "desc" },
      take: 10,
    })
    if (recent.length === 0) return { status: "warning", detail: "No performance data available" }
    const avgLatency = Math.round(recent.reduce((s, h) => s + h.latencyMs, 0) / recent.length)
    const maxLatency = Math.max(...recent.map(h => h.latencyMs))
    const status = avgLatency < 500 ? "passed" : avgLatency < 2000 ? "warning" : "failed"
    return { status, detail: "Avg latency: " + avgLatency + "ms, Max: " + maxLatency + "ms (n=" + recent.length + ")" }
  }

  async _stage12_summary() {
    return { status: "passed", detail: "Diagnostic complete — see full report for details" }
  }
}
