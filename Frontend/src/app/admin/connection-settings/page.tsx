"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getSystemSettings } from "@/features/admin-settings/api/service"

const TABS = [
  { id: "0", label: "Connection Status" }, { id: "1", label: "VM Settings" }, { id: "2", label: "Sync Meter" },
  { id: "3", label: "Sync Reading" }, { id: "4", label: "Health Status" }, { id: "5", label: "Event Log" }, { id: "6", label: "Error Log" }
]

const CONN_ROWS = [
  { name: "Primary DB", host: "10.0.1.50:1433", status: "Online", latency: "4ms", lastSeen: "Just now" },
  { name: "Replica EU", host: "10.0.2.10:1433", status: "Degraded", latency: "210ms", lastSeen: "2m ago" },
  { name: "Billing API", host: "api.billing.local:443", status: "Online", latency: "12ms", lastSeen: "30s ago" },
  { name: "Redis Cache", host: "10.0.1.60:6379", status: "Online", latency: "1ms", lastSeen: "Just now" },
  { name: "Archive Cold", host: "10.0.3.99:1433", status: "Offline", latency: "—", lastSeen: "4h ago" }
]

const VMS = [
  { name: "web-01", ip: "10.0.1.10", status: "Running", uptime: "142d 7h", cpu: "23%", mem: "4.2/8 GB" },
  { name: "web-02", ip: "10.0.1.11", status: "Running", uptime: "142d 7h", cpu: "31%", mem: "5.1/8 GB" },
  { name: "db-01", ip: "10.0.1.50", status: "Running", uptime: "365d 2h", cpu: "45%", mem: "28/64 GB" },
  { name: "worker-01", ip: "10.0.1.70", status: "Stopped", uptime: "0d 0h", cpu: "—", mem: "—" },
  { name: "cache-01", ip: "10.0.1.60", status: "Running", uptime: "280d 14h", cpu: "12%", mem: "6/16 GB" }
]

const SYNC_METERS = [
  { meter: "MTR-001", lastSync: "2026-07-27 08:15:22", status: "Synced", readings: 342 },
  { meter: "MTR-002", lastSync: "2026-07-27 08:14:55", status: "Synced", readings: 289 },
  { meter: "MTR-003", lastSync: "2026-07-26 23:00:00", status: "Pending", readings: 0 },
  { meter: "MTR-004", lastSync: "2026-07-27 08:10:01", status: "Synced", readings: 156 },
  { meter: "MTR-005", lastSync: "2026-07-25 12:30:00", status: "Error", readings: 12 }
]

const SYNC_READINGS = [
  { source: "October Import", records: 12450, lastSync: "2026-07-27 08:15:00", status: "OK" },
  { source: "October Export", records: 11890, lastSync: "2026-07-27 08:14:59", status: "OK" },
  { source: "New Cairo Import", records: 9720, lastSync: "2026-07-27 08:13:30", status: "OK" },
  { source: "SODIC Combined", records: 5630, lastSync: "2026-07-27 08:12:45", status: "OK" }
]

const HEALTH_CARDS = [
  { label: "API Gateway", status: "Healthy", detail: "99.97% uptime" },
  { label: "Database", status: "Healthy", detail: "Replication lag 0.3s" },
  { label: "Cache", status: "Healthy", detail: "Hit rate 94%" },
  { label: "Queue", status: "Healthy", detail: "0 pending" }
]

const statusDot = (s: string) => {
  const color = s === "Online" || s === "Synced" || s === "OK" || s === "Healthy" || s === "Running" ? "#22c55e"
    : s === "Degraded" || s === "Pending" || s === "Stopped" ? "#f59e0b" : "#ef4444"
  return <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: color }} />
}

export default function ConnectionSettingsPage() {
  const [tab, setTab] = useState(0)
  const [settings, setSettings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSystemSettings().then((s: any) => { setSettings(s.settings); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const table = (headers: string[], rows: (string | React.ReactNode)[][]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead><tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
          {headers.map((h, i) => <th key={i} className={`pb-3 font-semibold ${i < headers.length - 1 ? "pr-4" : ""}`}>{h}</th>)}
        </tr></thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b" style={{ borderColor: "var(--border-default)" }}>
              {row.map((cell, ci) => <td key={ci} className={`py-3 ${ci < row.length - 1 ? "pr-4" : ""}`} style={{ color: ci === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: ci === 0 ? 600 : 400 }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Connection Settings</h1><p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p></div>
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
        {!loading && tab === 0 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Connection", "Host", "Status", "Latency", "Last Seen"], CONN_ROWS.map(c => [c.name, c.host, <>{statusDot(c.status)}<span>{c.status}</span></>, c.latency, c.lastSeen]))}</motion.div>}
        {!loading && tab === 1 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Name", "IP", "Status", "Uptime", "CPU", "Memory"], VMS.map(v => [v.name, v.ip, <>{statusDot(v.status)}<span>{v.status}</span></>, v.uptime, v.cpu, v.mem]))}</motion.div>}
        {!loading && tab === 2 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Meter", "Last Sync", "Status", "Readings"], SYNC_METERS.map(m => [m.meter, m.lastSync, <>{statusDot(m.status)}<span>{m.status}</span></>, String(m.readings)]))}</motion.div>}
        {!loading && tab === 3 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Source", "Records", "Last Sync", "Status"], SYNC_READINGS.map(s => [s.source, String(s.records), s.lastSync, <>{statusDot(s.status)}<span>{s.status}</span></>]))}</motion.div>}
        {!loading && tab === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {HEALTH_CARDS.map(h => (
                <div key={h.label} className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                  <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{h.label}</p>
                  <p className="text-lg font-bold text-green-500">{h.status}</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{h.detail}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {!loading && tab === 5 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-xs py-6 text-center" style={{ color: "var(--text-secondary)" }}>Settings: {settings.length} configured</p>
        </motion.div>}
        {!loading && tab === 6 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-xs py-6 text-center" style={{ color: "var(--text-secondary)" }}>No errors logged</p>
        </motion.div>}
      </div>
    </div>
  )
}
