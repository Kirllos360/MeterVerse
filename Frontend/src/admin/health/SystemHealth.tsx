"use client"

import { useState, useEffect } from "react"

interface ServiceStatus {
  name: string; status: "operational" | "degraded" | "down"; latency: string
}

const COLORS = { operational: "var(--status-success)", degraded: "var(--status-warning)", down: "var(--status-error)" }

export function SystemHealth() {
  const [services, setServices] = useState<ServiceStatus[]>([])

  useEffect(() => {
    fetch("/api/admin/health").then(r => r.json()).then(d => {
      const items = (d.services || d.checks || []).map((s: any) => ({
        name: s.name || s.check || "Service",
        status: s.status === "healthy" || s.status === "ok" || s.status === "pass" ? "operational" : s.status === "degraded" || s.status === "warn" ? "degraded" : "down",
        latency: s.latency || s.duration || "—",
      }))
      setServices(items)
    }).catch(() => {})
  }, [])

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-default)" }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-raised)" }}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Service Health</h2>
      </div>
      <div style={{ backgroundColor: "var(--surface-base)" }}>
        {services.length === 0 && <div className="px-4 py-8 text-center text-xs" style={{ color: "var(--text-tertiary)" }}>No services data available</div>}
        {services.map((s) => (
          <div key={s.name} className="flex items-center justify-between px-4 py-3 border-b text-xs" style={{ borderColor: "var(--border-default)" }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[s.status] || "var(--text-tertiary)" }} />
              <span style={{ color: "var(--text-primary)" }}>{s.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span style={{ color: COLORS[s.status] || "var(--text-tertiary)" }}>{s.status}</span>
              <span style={{ color: "var(--text-tertiary)" }}>{s.latency}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
