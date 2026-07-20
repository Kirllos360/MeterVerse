"use client"

import { useState, useEffect } from "react"

interface Service { name: string; status: string; latency: string }
interface Metrics { users: number; meters: number; readings: number; uptime: number }

const STATUS_COLORS: Record<string, string> = { operational: "#DC2626", degraded: "#EF4444", down: "#EF4444" }

export default function AdminDashboardPage() {
  const [services, setServices] = useState<Service[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchHealth = () => {
    fetch("/api/admin/health").then((r) => r.json()).then((d) => {
      setServices(d.services || [])
      setMetrics(d.metrics || null)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchHealth(); const i = setInterval(fetchHealth, 10000); return () => clearInterval(i) }, [])

  const metricCards = metrics ? [
    { label: "Users", value: metrics.users.toString(), color: "var(--status-error)" },
    { label: "Meters", value: metrics.meters.toString(), color: "#DC2626" },
    { label: "Readings", value: metrics.readings.toLocaleString(), color: "#DC2626" },
    { label: "Uptime", value: `${Math.floor(metrics.uptime / 3600)}h`, color: "#DC2626" },
  ] : []

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-white">System Health</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Enterprise administration dashboard</p>
      </div>

      {loading ? (
        <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3">
            {metricCards.map((m) => (
              <div key={m.label} className="rounded-xl border p-4" style={{ backgroundColor: "var(--admin-surface)", borderColor: "var(--admin-border)" }}>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{m.label}</div>
                <div className="text-xl font-bold mt-1 tabular-nums" style={{ color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--admin-border)" }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-surface)" }}>
              <h2 className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>Service Health</h2>
            </div>
            <div style={{ backgroundColor: "var(--admin-surface)" }}>
              {services.map((s) => (
                <div key={s.name} className="flex items-center justify-between px-4 py-3 border-b text-xs" style={{ borderColor: "var(--admin-border)" }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.status] || "#DC2626" }} />
                    <span style={{ color: "rgba(255,255,255,0.8)" }}>{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ color: STATUS_COLORS[s.status] || "#DC2626" }}>{s.status}</span>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>{s.latency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

