"use client"

import { useState, useEffect } from "react"

interface Metric { label: string; value: string; color: string }

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([])

  useEffect(() => {
    fetch("/api/admin/health").then(r => r.json()).then(d => {
      const m = d.metrics || {}
      setMetrics([
        { label: "Users", value: String(m.users || m.totalUsers || "—"), color: "var(--brand)" },
        { label: "Meters", value: String(m.meters || m.totalMeters || "—"), color: "#3B82F6" },
        { label: "Readings", value: String(m.readings || m.totalReadings || "—"), color: "#22C55E" },
        { label: "Uptime", value: m.uptime || "—", color: "#22C55E" },
      ])
    }).catch(() => {})
  }, [])

  if (metrics.length === 0) return null

  return (
    <div className="grid grid-cols-4 gap-3">
      {metrics.map((m) => (
        <div key={m.label} className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
          <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>{m.label}</div>
          <div className="text-xl font-bold mt-1 tabular-nums" style={{ color: m.color }}>{m.value}</div>
        </div>
      ))}
    </div>
  )
}
