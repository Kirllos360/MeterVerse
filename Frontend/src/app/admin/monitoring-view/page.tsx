"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const TABS = [
  { id: "0", label: "Dashboard" },
  { id: "1", label: "Setup" }
]

const STATS = [
  { label: "Active Meters", value: "1,247", change: "+12", color: "#22c55e" },
  { label: "Alerts Active", value: "3", change: "-2", color: "#f59e0b" },
  { label: "Avg Response Time", value: "1.2s", change: "-0.3s", color: "#3b82f6" },
  { label: "Uptime", value: "99.97%", change: "+0.02%", color: "#22c55e" }
]

const HEALTH_CHECKS = [
  { service: "Meter Data Service", status: "Healthy", latency: "45ms", lastCheck: "2026-07-27 10:00:00" },
  { service: "Tariff Engine", status: "Healthy", latency: "120ms", lastCheck: "2026-07-27 09:59:00" },
  { service: "Bill Generation", status: "Degraded", latency: "890ms", lastCheck: "2026-07-27 09:58:00" },
  { service: "Upload Pipeline", status: "Healthy", latency: "230ms", lastCheck: "2026-07-27 10:00:00" },
  { service: "Notification Gateway", status: "Down", latency: "N/A", lastCheck: "2026-07-27 09:55:00" }
]

const RECENT_ALERTS = [
  { time: "2026-07-27 09:45:00", type: "Warning", message: "Bill Gen latency exceeds threshold", source: "Tariff Engine" },
  { time: "2026-07-27 09:30:00", type: "Critical", message: "Notification Gateway unreachable", source: "Health Check" },
  { time: "2026-07-27 08:15:00", type: "Info", message: "Scheduled maintenance completed", source: "System" }
]

export default function MonitoringViewPage() {
  const [tab, setTab] = useState(0)

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = { Healthy: "#22c55e", Degraded: "#f59e0b", Down: "#ef4444", Warning: "#f59e0b", Critical: "#ef4444", Info: "#3b82f6" }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
        style={{ backgroundColor: colors[s] + "18", color: colors[s] }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[s] }} />
        {s}
      </span>
    )
  }

  const renderTable = (headers: string[], rows: (string | number | React.ReactNode)[][]) => (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border-default)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: "var(--surface-topbar)" }}>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left font-semibold text-xs" style={{ color: "var(--text-secondary)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-t" style={{ borderColor: "var(--border-default)" }}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2.5" style={{ color: "var(--text-primary)" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Monitoring View</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p>
        </div>
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2" /></svg>
        </motion.div>
      </div>

      <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none rounded-2xl border px-3"
        style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            className="shrink-0 px-3 py-1.5 text-xs font-semibold transition-all rounded-xl whitespace-nowrap"
            style={{ backgroundColor: tab === i ? "var(--brand)" : "transparent", color: tab === i ? "#FFFFFF" : "var(--text-secondary)" }}>
            {tab === i && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block mr-1.5" />}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{s.label}</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</span>
                  <span className="text-xs font-semibold" style={{ color: s.color }}>{s.change}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Health Checks</h3>
            {renderTable(
              ["Service", "Status", "Latency", "Last Check"],
              HEALTH_CHECKS.map(h => [h.service, statusBadge(h.status), h.latency, h.lastCheck])
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Recent Alerts</h3>
            {renderTable(
              ["Time", "Type", "Message", "Source"],
              RECENT_ALERTS.map(a => [a.time, statusBadge(a.type), a.message, a.source])
            )}
          </div>
        </motion.div>
      )}

      {tab === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-6" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Monitoring Setup</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Health Check Interval", value: "30 seconds" },
              { label: "Alert Threshold (latency)", value: "500ms" },
              { label: "Retention Period", value: "90 days" },
              { label: "Notification Channel", value: "Email + Slack" },
              { label: "Enable Auto-Remediation", value: true, type: "toggle" as const },
              { label: "PagerDuty Integration", value: false, type: "toggle" as const }
            ].map((f, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{f.label}</span>
                {f.type === "toggle" ? (
                  <div className="w-10 h-5 rounded-full transition-all cursor-pointer"
                    style={{ backgroundColor: f.value ? "var(--brand)" : "var(--border-default)" }} />
                ) : (
                  <input type="text" defaultValue={String(f.value)}
                    className="px-3 py-1.5 text-xs rounded-lg border outline-none"
                    style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
                )}
              </div>
            ))}
          </div>
          <button className="mt-5 px-4 py-2 text-xs font-semibold rounded-lg text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--brand)" }}>Save Settings</button>
        </motion.div>
      )}
    </div>
  )
}
