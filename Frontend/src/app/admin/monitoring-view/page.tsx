"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getHealthSummary, getEvents, saveSetting } from "@/features/admin-settings/api/service"

const TABS = [{ id: "0", label: "Dashboard" }, { id: "1", label: "Setup" }]

const statusBadge = (s: string) => {
  const colors: Record<string, string> = { Healthy: "#DC2626", Degraded: "#f59e0b", Down: "#ef4444", Warning: "#f59e0b", Critical: "#ef4444", Info: "#3b82f6" }
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: colors[s] + "18", color: colors[s] }}><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[s] }} />{s}</span>
}

const renderTable = (headers: string[], rows: (string | number | React.ReactNode)[][]) => (
  <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border-default)" }}>
    <table className="w-full text-sm">
      <thead><tr style={{ backgroundColor: "var(--surface-topbar)" }}>
        {headers.map((h, i) => <th key={i} className="px-4 py-2.5 text-left font-semibold text-xs" style={{ color: "var(--text-secondary)" }}>{h}</th>)}
      </tr></thead>
      <tbody>{rows.map((row, ri) => (
        <tr key={ri} className="border-t" style={{ borderColor: "var(--border-default)" }}>
          {row.map((cell, ci) => <td key={ci} className="px-4 py-3 text-xs" style={{ color: ci === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: ci === 0 ? 600 : 400 }}>{cell}</td>)}
        </tr>
      ))}</tbody>
    </table>
  </div>
)

export default function MonitoringViewPage() {
  const [tab, setTab] = useState(0)
  const [health, setHealth] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getHealthSummary().catch(() => null),
      getEvents("monitoring", 10).catch(() => ({ events: [] })),
    ]).then(([h, ev]) => { setHealth(h); setEvents(ev.events); setLoading(false) })
  }, [])
  const [checkInterval, setCheckInterval] = useState("60s")
  const [threshold, setThreshold] = useState(3)
  const [saving, setSaving] = useState(false)
  const handleSave = async () => {
    setSaving(true)
    try { await Promise.all([saveSetting("monitoring_health_check_interval", checkInterval, "monitoring"), saveSetting("monitoring_alert_threshold", String(threshold), "monitoring")]) } catch {} finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Monitoring View</h1><p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p></div>
      </div>
      <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none rounded-2xl border px-3"
        style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            className="shrink-0 px-3 py-1.5 text-xs font-semibold transition-all rounded-xl whitespace-nowrap"
            style={{ backgroundColor: tab === i ? "var(--brand)" : "transparent", color: tab === i ? "#FFFFFF" : "var(--text-secondary)" }}>
            {tab === i && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block mr-1.5" />}{t.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border p-6" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
        {loading && <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }} /></div>}
        {!loading && tab === 0 && health && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Meters", value: health.meters.toLocaleString() },
                { label: "Customers", value: health.customers.toLocaleString() },
                { label: "Invoices", value: health.invoices.toLocaleString() },
                { label: "Payments", value: health.payments.toLocaleString() },
              ].map(s => (
                <div key={s.label} className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                  <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Recent Events</h3>
              {events.length === 0 ? <p className="text-xs" style={{ color: "var(--text-secondary)" }}>No events recorded</p> : renderTable(["Time", "Action", "Resource"], events.map((e: any) => [new Date(e.createdAt).toLocaleString(), e.action, e.resource || "—"]))}
            </div>
          </motion.div>
        )}
        {!loading && tab === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="max-w-lg space-y-4">
              <div><label htmlFor="lbl-health-check-interval"  className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }} >Health Check Interval</label><select id="lbl-health-check-interval" value={checkInterval} onChange={e => setCheckInterval(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}><option>30s</option><option>60s</option><option>120s</option></select></div>
              <div><label htmlFor="lbl-alert-threshold" className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Alert Threshold</label><input  id="lbl-alert-threshold" type="number" value={threshold} onChange={e => setThreshold(Number(e.target.value))} className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} /></div>
              <button onClick={handleSave} disabled={saving} className="rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-50" style={{ backgroundColor: "var(--brand)" }}>{saving ? "Saving..." : "Save"}</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
