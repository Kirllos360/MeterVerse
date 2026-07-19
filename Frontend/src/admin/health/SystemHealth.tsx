"use client"

import { useState, useEffect } from "react"

interface ServiceStatus {
  name: string; status: "operational" | "degraded" | "down"; latency: string
}

const COLORS = { operational: "var(--status-success)", degraded: "var(--status-warning)", down: "var(--status-error)" }

export function SystemHealth() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "API Gateway", status: "operational", latency: "12ms" },
    { name: "Auth Service", status: "operational", latency: "8ms" },
    { name: "Database", status: "operational", latency: "4ms" },
    { name: "Redis Cache", status: "operational", latency: "1ms" },
    { name: "WebSocket", status: "operational", latency: "3ms" },
    { name: "File Storage", status: "operational", latency: "245ms" },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setServices((prev) =>
        prev.map((s) => ({
          ...s,
          latency: `${Math.floor(Math.random() * 50 + 1)}ms`,
          status: Math.random() > 0.9 ? "degraded" : "operational",
        }))
      )
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-default)" }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-raised)" }}>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Service Health</h2>
      </div>
      <div style={{ backgroundColor: "var(--surface-base)" }}>
        {services.map((s) => (
          <div key={s.name} className="flex items-center justify-between px-4 py-3 border-b text-xs" style={{ borderColor: "var(--border-default)" }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[s.status] }} />
              <span style={{ color: "var(--text-primary)" }}>{s.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span style={{ color: COLORS[s.status] }}>{s.status}</span>
              <span style={{ color: "var(--text-tertiary)" }}>{s.latency}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
