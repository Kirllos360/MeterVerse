export class MetricsCollector {
  constructor() {
    this.metrics = {
      runtime: { activeConnections: 0, poolSize: 0, poolMax: 20 },
      scheduler: { jobsExecuted: 0, successRate: 100, failureRate: 0, avgDuration: 0 },
      health: { averageScore: 0, healthy: 0, degraded: 0, critical: 0 },
      failover: { total: 0, successful: 0, failed: 0, avgDuration: 0 },
      audit: { total: 0 },
      connections: { created: 0, updated: 0, deleted: 0, tested: 0 },
    }
    this.counters = {}
    this.timings = {}
  }

  increment(category, name) {
    const key = category + "." + name
    this.counters[key] = (this.counters[key] || 0) + 1
    if (this.metrics[category]) {
      if (this.metrics[category][name] !== undefined) {
        if (typeof this.metrics[category][name] === "number") {
          this.metrics[category][name]++
        }
      }
    }
  }

  gauge(category, name, value) {
    if (this.metrics[category]) {
      this.metrics[category][name] = value
    }
  }

  timing(category, name, durationMs) {
    const key = category + "." + name
    if (!this.timings[key]) this.timings[key] = []
    this.timings[key].push(durationMs)
    if (this.timings[key].length > 100) this.timings[key].shift()

    // Update avg
    const arr = this.timings[key]
    const avg = Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
    if (this.metrics[category] && this.metrics[category][name] !== undefined) {
      this.metrics[category][name] = avg
    }
  }

  snapshot(runtime) {
    if (!runtime) return
    const rs = runtime.getStatus()
    this.gauge("runtime", "activeConnections", rs.activeConnections || 0)
    this.gauge("runtime", "poolSize", rs.pool?.total || 0)
    this.gauge("runtime", "poolMax", rs.pool?.maxSize || 20)

    const hs = runtime.healthMonitor?.getStats()
    if (hs) {
      this.gauge("health", "averageScore", hs.averageScore)
      this.gauge("health", "healthy", hs.byStatus?.healthy || 0)
      this.gauge("health", "degraded", hs.byStatus?.degraded || 0)
      this.gauge("health", "critical", hs.byStatus?.critical || 0)
    }

    const fs = runtime.failover?.getStats()
    if (fs) {
      this.gauge("failover", "total", fs.historyCount || 0)
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      counters: { ...this.counters },
      collected: new Date().toISOString(),
    }
  }

  getPrometheus() {
    const lines = [
      "# HELP meterverse_connections_total Total connections created",
      "# TYPE meterverse_connections_total counter",
      "meterverse_connections_total " + (this.counters["connections.created"] || 0),
      "",
      "# HELP meterverse_jobs_executed_total Total scheduler jobs executed",
      "# TYPE meterverse_jobs_executed_total counter",
      "meterverse_jobs_executed_total " + (this.counters["scheduler.executed"] || 0),
      "",
      "# HELP meterverse_health_score Current average health score",
      "# TYPE meterverse_health_score gauge",
      "meterverse_health_score " + this.metrics.health.averageScore,
      "",
      "# HELP meterverse_active_connections Current active connections",
      "# TYPE meterverse_active_connections gauge",
      "meterverse_active_connections " + this.metrics.runtime.activeConnections,
      "",
      "# HELP meterverse_failover_total Total failover events",
      "# TYPE meterverse_failover_total counter",
      "meterverse_failover_total " + this.metrics.failover.total,
    ]
    return lines.join("\n")
  }
}
