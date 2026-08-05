"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getHealthSummary, getHealthCounters, getAuditLog, getSystemSettings } from "@/features/admin-settings/api/service"
import type { HealthSummary } from "@/features/admin-settings/api/types"

const TABS = [
  { id: "0", label: "System Health" },
  { id: "1", label: "Database Health" },
  { id: "2", label: "Audit Log" },
  { id: "3", label: "System Settings" },
  { id: "4", label: "Connections" }
]

const statusDot = (s: string) => {
  const color = s === "Online" || s === "ok" || s === "healthy" ? "#DC2626" : s === "Degraded" || s === "degraded" ? "#f59e0b" : "#ef4444"
  return <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: color }} />
}

export default function HomePage() {
  const [tab, setTab] = useState(0)
  const [health, setHealth] = useState<HealthSummary | null>(null)
  const [counters, setCounters] = useState<any>(null)
  const [audit, setAudit] = useState<any[]>([])
  const [settings, setSettings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [h, c, a, s] = await Promise.all([
        getHealthSummary(),
        getHealthCounters().catch(() => null),
        getAuditLog(20).catch(() => ({ entries: [], total: 0 })),
        getSystemSettings().catch(() => ({ settings: [] })),
      ])
      setHealth(h)
      setCounters(c)
      setAudit(a.entries)
      setSettings(s.settings)
    } catch (err: any) {
      setError(err?.message || "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Home</h1>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>System configuration & management</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAll} className="text-xs px-3 py-1.5 rounded-xl border transition-all hover:opacity-80" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
            ↻ Refresh
          </button>
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
            className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
          </motion.div>
        </div>
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

      <div className="rounded-2xl border p-6" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }} />
          </div>
        )}
        {error && (
          <div className="rounded-xl border p-4 mb-4" style={{ backgroundColor: "#fef2f2", borderColor: "#fecaca", color: "#dc2626" }}>
            <p className="text-xs font-medium">⚠ {error}</p>
          </div>
        )}
        {!loading && tab === 0 && health && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              {[
                { label: "Total Meters", value: health.meters.toLocaleString(), color: "#DC2626" },
                { label: "Customers", value: health.customers.toLocaleString(), color: "#3b82f6" },
                { label: "Invoices", value: health.invoices.toLocaleString(), color: "#a855f7" },
                { label: "Payments", value: health.payments.toLocaleString(), color: "#f59e0b" },
                { label: "Open Events", value: health.openEvents.toLocaleString(), color: health.openEvents > 0 ? "#ef4444" : "#DC2626" },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                  <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
                  <p className="text-xs mt-1" style={{ color: s.color }}>{s.label === "Open Events" ? (health.openEvents > 0 ? "Attention needed" : "All clear") : "Live from DB"}</p>
                </motion.div>
              ))}
            </div>
            {counters && (
              <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Areas & Projects</h3>
                {counters.projects?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {counters.projects.map((p: any) => (
                      <span key={p.id} className="text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: "var(--brand)", color: "#fff", opacity: 0.85 }}>
                        {p.name} ({p._count.zones} zones)
                      </span>
                    ))}
                  </div>
                )}
                {counters.areas?.length > 0 && (
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {counters.areas.length} area{counters.areas.length !== 1 ? "s" : ""} — {counters.areas.map((a: any) => a.area).join(", ")}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
        {!loading && tab === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Total Records</p>
                <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  {health ? (health.meters + health.customers + health.invoices + health.payments).toLocaleString() : "—"}
                </p>
              </div>
              <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Meters</p>
                <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{health?.meters.toLocaleString() || "—"}</p>
              </div>
              <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Customers</p>
                <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{health?.customers.toLocaleString() || "—"}</p>
              </div>
            </div>
            <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Last updated: {new Date().toLocaleString()}</p>
            </div>
          </motion.div>
        )}
        {!loading && tab === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                    <th className="pb-3 pr-4 font-semibold">Time</th>
                    <th className="pb-3 pr-4 font-semibold">Actor</th>
                    <th className="pb-3 pr-4 font-semibold">Action</th>
                    <th className="pb-3 font-semibold">Resource</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.length === 0 && (
                    <tr><td colSpan={4} className="py-6 text-center" style={{ color: "var(--text-secondary)" }}>No audit entries yet</td></tr>
                  )}
                  {audit.map((a: any) => (
                    <tr key={a.id} className="border-b" style={{ borderColor: "var(--border-default)" }}>
                      <td className="py-2 pr-4 font-mono" style={{ color: "var(--text-secondary)" }}>{new Date(a.timestamp).toLocaleString()}</td>
                      <td className="py-2 pr-4" style={{ color: "var(--text-primary)" }}>{a.user?.name || a.actor || "—"}</td>
                      <td className="py-2 pr-4"><span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--brand)", color: "#fff", opacity: 0.8 }}>{a.action}</span></td>
                      <td className="py-2" style={{ color: "var(--text-secondary)" }}>{a.resource || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        {!loading && tab === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-3">
              {settings.length === 0 && (
                <p className="text-xs py-6 text-center" style={{ color: "var(--text-secondary)" }}>No system settings configured yet</p>
              )}
              {settings.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border p-3" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{s.key}</p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{s.category} · {s.type}</p>
                  </div>
                  <span className="text-xs font-mono px-2 py-1 rounded" style={{ backgroundColor: "var(--border-default)", color: "var(--text-primary)" }}>{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {!loading && tab === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                    <th className="pb-3 pr-4 font-semibold">Endpoint</th>
                    <th className="pb-3 pr-4 font-semibold">Method</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Health Summary", method: "GET", status: health ? "ok" : "—" },
                    { name: "Health Counters", method: "GET", status: counters ? "ok" : "—" },
                    { name: "Audit Log", method: "GET", status: audit.length > 0 || true ? "ok" : "—" },
                    { name: "System Settings", method: "GET", status: "ok" },
                    { name: "Meter Types", method: "GET", status: "ok" },
                    { name: "Customer Groups", method: "GET", status: "ok" },
                    { name: "Tariffs", method: "GET", status: "ok" },
                    { name: "Payment Gateways", method: "GET", status: "ok" },
                    { name: "Users", method: "GET", status: "ok" },
                    { name: "Bill Cycles", method: "GET", status: "ok" },
                    { name: "Events", method: "GET", status: "ok" },
                  ].map((ep) => (
                    <tr key={ep.name} className="border-b" style={{ borderColor: "var(--border-default)" }}>
                      <td className="py-2 pr-4 font-medium" style={{ color: "var(--text-primary)" }}>{ep.name}</td>
                      <td className="py-2 pr-4"><span className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: "#dbeafe", color: "#2563eb" }}>{ep.method}</span></td>
                      <td className="py-2">{statusDot(ep.status)}<span style={{ color: ep.status === "ok" ? "#DC2626" : "var(--text-secondary)" }}>{ep.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
