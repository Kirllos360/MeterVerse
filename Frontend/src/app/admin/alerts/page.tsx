"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const waveAnim = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

interface ActiveAlert {
  id: string
  title: string
  severity: "critical" | "warning" | "info"
  source: string
  triggeredAt: string
  acknowledged: boolean
}

interface AlertRule {
  id: string
  name: string
  condition: string
  threshold: string
  enabled: boolean
  lastFired: string | null
}

const ACTIVE_ALERTS: ActiveAlert[] = [
  { id: "A001", title: "SODIC sync stalled — no new readings in 2 hours", severity: "critical", source: "Sync Engine", triggeredAt: "2026-07-26 06:30", acknowledged: false },
  { id: "A002", title: "October DB connection pool nearing capacity (82%)", severity: "warning", source: "Database Monitor", triggeredAt: "2026-07-26 06:15", acknowledged: false },
  { id: "A003", title: "New Cairo tariff update pending approval (3 days)", severity: "info", source: "Workflow Engine", triggeredAt: "2026-07-25 08:00", acknowledged: true },
  { id: "A004", title: "High failed login rate detected from IP 192.168.1.45", severity: "critical", source: "Security", triggeredAt: "2026-07-25 07:45", acknowledged: false },
  { id: "A005", title: "Invoice batch #1456 validation warnings (12 items)", severity: "warning", source: "Billing Engine", triggeredAt: "2026-07-25 06:30", acknowledged: true },
]

const ALERT_RULES: AlertRule[] = [
  { id: "R001", name: "No Data Sync > 1 hour", condition: "sync.lastRun > 3600s", threshold: "1 hour", enabled: true, lastFired: "2026-07-26 06:30" },
  { id: "R002", name: "DB Connection Pool > 80%", condition: "db.connectionPool > 80", threshold: "80%", enabled: true, lastFired: "2026-07-26 06:15" },
  { id: "R003", name: "Failed Login Burst > 5/min", condition: "auth.failedLogins > 5", threshold: "5/min", enabled: true, lastFired: "2026-07-25 07:45" },
  { id: "R004", name: "Queued Jobs Backlog > 100", condition: "queue.pending > 100", threshold: "100 jobs", enabled: false, lastFired: null },
  { id: "R005", name: "API Error Rate > 5%", condition: "api.errorRate > 0.05", threshold: "5%", enabled: true, lastFired: "2026-07-20 14:30" },
]

export default function AlertsPage() {
  const [activeAlerts] = useState<ActiveAlert[]>(ACTIVE_ALERTS)
  const [rules] = useState<AlertRule[]>(ALERT_RULES)

  const criticalCount = activeAlerts.filter((a) => a.severity === "critical" && !a.acknowledged).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Alert Management</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Monitor active alerts, configure rules, and review history</p>
        </div>
        <motion.div animate={waveAnim} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: criticalCount > 0 ? "#DC2626" : "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" /></svg>
        </motion.div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Critical", value: activeAlerts.filter((a) => a.severity === "critical").length, color: "#DC2626" },
          { label: "Warning", value: activeAlerts.filter((a) => a.severity === "warning").length, color: "#D97706" },
          { label: "Info", value: activeAlerts.filter((a) => a.severity === "info").length, color: "#2563EB" },
          { label: "Unacknowledged", value: activeAlerts.filter((a) => !a.acknowledged).length, color: "var(--text-primary)" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-2xl border p-4 text-center" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
            <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
          <div className="px-5 py-3 border-b text-sm font-bold" style={{ color: "var(--text-primary)", borderColor: "var(--border-default)" }}>Active Alerts</div>
          <div className="divide-y" style={{ borderColor: "var(--border-default)" }}>
            {activeAlerts.map((a) => (
              <div key={a.id} className="px-5 py-3 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: a.severity === "critical" ? "#DC2626" : a.severity === "warning" ? "#D97706" : "#2563EB" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{a.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span>{a.source}</span>
                    <span>{a.triggeredAt}</span>
                    {a.acknowledged && <span className="text-xs" style={{ color: "#059669" }}>Acknowledged</span>}
                  </div>
                </div>
                {!a.acknowledged && (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap"
                    style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)", color: "var(--brand)" }}>
                    Acknowledge
                  </motion.button>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Alert Rules */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ color: "var(--text-primary)", borderColor: "var(--border-default)" }}>
            <span className="text-sm font-bold">Alert Rules</span>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>
              + New Rule
            </motion.button>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border-default)" }}>
            {rules.map((r) => (
              <div key={r.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{r.name}</span>
                    <div className={`w-2 h-2 rounded-full ${r.enabled ? "bg-green-500" : "bg-gray-400"}`} />
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {r.condition} · Threshold: {r.threshold}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
                    {r.lastFired ? `Last: ${r.lastFired}` : "Never fired"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Alert History Placeholder */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <div className="px-5 py-3 border-b text-sm font-bold" style={{ color: "var(--text-primary)", borderColor: "var(--border-default)" }}>Alert History</div>
        <div className="px-5 py-4 text-center">
          <svg className="mx-auto mb-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Historical alert timeline — expand to view last 30 days</p>
        </div>
      </motion.div>
    </div>
  )
}
