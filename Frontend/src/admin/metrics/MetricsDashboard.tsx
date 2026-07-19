"use client"

import { useState, useEffect } from "react"

interface Metric { label: string; value: string; color: string; change?: string }

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([
    { label: "CPU", value: "23%", color: "var(--brand-primary)" },
    { label: "Memory", value: "6.2 GB", color: "#3B82F6" },
    { label: "Requests/min", value: "1,247", color: "#22C55E" },
    { label: "Error Rate", value: "0.02%", color: "#22C55E" },
    { label: "Active Users", value: "43", color: "#3B82F6" },
    { label: "Queue Depth", value: "156", color: "var(--status-pending)" },
    { label: "Cache Hit", value: "94%", color: "#22C55E" },
    { label: "Uptime", value: "99.97%", color: "#22C55E" },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m) => ({
          ...m,
          value: m.label === "CPU" ? `${Math.floor(Math.random() * 40 + 10)}%` :
                 m.label === "Requests/min" ? `${Math.floor(Math.random() * 500 + 1000)}` :
                 m.label === "Memory" ? `${(Math.random() * 4 + 4).toFixed(1)} GB` : m.value,
        }))
      )
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-4 gap-3">
      {metrics.map((m) => (
        <div key={m.label} className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
          <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{m.label}</div>
          <div className="text-xl font-bold mt-1 tabular-nums" style={{ color: m.color }}>{m.value}</div>
          <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--surface-sunken)" }}>
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: m.label === "CPU" ? "23%" : m.label === "Memory" ? "62%" : m.label === "Cache Hit" ? "94%" : "50%", backgroundColor: m.color }} />
          </div>
        </div>
      ))}
    </div>
  )
}
