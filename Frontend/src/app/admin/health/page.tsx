"use client"

import { useState, useEffect } from "react"

interface HealthService { name: string; status: string; latency: string }
interface HealthMetrics { users: number; meters: number; readings: number; uptime: number }

const STATUS_COLORS: Record<string, string> = { operational: "#22C55E", degraded: "#F59E0B", down: "#EF4444" }

export default function AdminHealthPage() {
  const [services, setServices] = useState<HealthService[]>([])
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHealth = () => fetch("/api/admin/health").then((r) => r.json()).then((d) => {
      setServices(d.services || []); setMetrics(d.metrics || null); setLoading(false)
    }).catch(() => setLoading(false))
    fetchHealth()
    const i = setInterval(fetchHealth, 15000)
    return () => clearInterval(i)
  }, [])

  if (loading) return <div className="p-6 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Loading...</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-white">System Health</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Real-time service status and infrastructure metrics</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {metrics && [
          { label: "Total Users", value: metrics.users.toLocaleString(), color: "#EF4444" },
          { label: "Meters", value: metrics.meters.toLocaleString(), color: "#3B82F6" },
          { label: "Readings", value: metrics.readings.toLocaleString(), color: "#22C55E" },
          { label: "Uptime", value: `${Math.floor(metrics.uptime / 3600)}h ${Math.floor((metrics.uptime % 3600) / 60)}m`, color: "#22C55E" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border p-4" style={{ backgroundColor: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{m.label}</div>
            <div className="text-xl font-bold mt-1 tabular-nums" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--admin-border)" }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-surface)" }}>
          <h2 className="text-sm font-semibold text-white">Service Status</h2>
        </div>
        {services.map((s) => (
          <div key={s.name} className="flex items-center justify-between px-4 py-3 border-b text-xs" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-surface)" }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.status] || "#22C55E" }} />
              <span style={{ color: "rgba(255,255,255,0.8)" }}>{s.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium" style={{ color: STATUS_COLORS[s.status] || "#22C55E" }}>{s.status}</span>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>{s.latency}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
