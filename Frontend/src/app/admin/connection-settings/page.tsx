"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const TABS = [
  { id: "0", label: "Connection Status" },
  { id: "1", label: "VM Settings" },
  { id: "2", label: "Sync Meter" },
  { id: "3", label: "Sync Reading" },
  { id: "4", label: "Health Status" },
  { id: "5", label: "Event Log" },
  { id: "6", label: "Error Log" }
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
  { label: "Queue", status: "Degraded", detail: "12 messages backlog" },
  { label: "Storage", status: "Healthy", detail: "2.4 TB / 4 TB used" }
]

const EVENTS = [
  { ts: "2026-07-27 08:00:00", action: "CONNECT", detail: "New connection from 10.0.1.50", user: "system" },
  { ts: "2026-07-27 07:30:15", action: "DISCONNECT", detail: "Idle connection closed", user: "system" },
  { ts: "2026-07-27 06:45:00", action: "SYNC", detail: "Full sync initiated for October", user: "scheduler" },
  { ts: "2026-07-26 22:00:00", action: "RECONNECT", detail: "Replica EU reconnected after timeout", user: "system" }
]

const ERRORS = [
  { ts: "2026-07-27 07:52:18", severity: "ERROR", message: "Connection timeout to Replica EU", source: "Health Check" },
  { ts: "2026-07-27 05:30:00", severity: "WARN", message: "Connection pool 80% utilized", source: "Monitor" },
  { ts: "2026-07-26 20:15:42", severity: "ERROR", message: "SSL handshake failed on archive endpoint", source: "TLS" },
  { ts: "2026-07-26 14:00:00", severity: "INFO", message: "Network topology change detected", source: "Discovery" }
]

const sDot = (s: string) => {
  const c = s === "Online" || s === "Running" || s === "Healthy" || s === "Synced" || s === "OK" ? "#22c55e" : s === "Degraded" || s === "Pending" ? "#f59e0b" : "#ef4444"
  return <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: c }} />
}

export default function ConnectionSettingsPage() {
  const [tab, setTab] = useState(0)

  const table = (headers: string[], rows: (string | React.ReactNode)[][], keyIdx: number = 0) => (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
            {headers.map((h, i) => <th key={i} className={`pb-3 font-semibold ${i < headers.length - 1 ? "pr-4" : ""}`}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b" style={{ borderColor: "var(--border-default)" }}>
              {row.map((cell, ci) => <td key={ci} className={`py-3 ${ci < row.length - 1 ? "pr-4" : ""}`} style={{ color: ci === keyIdx ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: ci === keyIdx ? 600 : 400 }}>{cell}</td>)}
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
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Connection Settings</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p>
        </div>
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9" /></svg>
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

      <div className="rounded-2xl border p-6" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
        {tab === 0 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Name", "Host", "Status", "Latency", "Last Seen"], CONN_ROWS.map(c => [c.name, c.host, <>{sDot(c.status)}{c.status}</>, c.latency, c.lastSeen]))}</motion.div>}
        {tab === 1 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["VM Name", "IP Address", "Status", "Uptime", "CPU", "Memory"], VMS.map(v => [v.name, v.ip, <>{sDot(v.status)}{v.status}</>, v.uptime, v.cpu, v.mem]))}</motion.div>}
        {tab === 2 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Meter", "Last Sync", "Status", "Readings"], SYNC_METERS.map(m => [m.meter, m.lastSync, <>{sDot(m.status)}{m.status}</>, String(m.readings)]))}</motion.div>}
        {tab === 3 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Source", "Records", "Last Sync", "Status"], SYNC_READINGS.map(r => [r.source, r.records.toLocaleString(), r.lastSync, <>{sDot(r.status)}{r.status}</>]))}</motion.div>}
        {tab === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {HEALTH_CARDS.map((h) => (
                <div key={h.label} className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                  <div className="flex items-center gap-2 mb-2">{sDot(h.status)}<span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{h.label}</span></div>
                  <p className="text-sm font-bold" style={{ color: h.status === "Healthy" ? "#22c55e" : "#f59e0b" }}>{h.status}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{h.detail}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {tab === 5 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Timestamp", "Action", "Detail", "User"], EVENTS.map(e => [e.ts, <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{e.action}</span>, e.detail, e.user]))}</motion.div>}
        {tab === 6 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}><th className="pb-3 pr-4 font-semibold">Time</th><th className="pb-3 pr-4 font-semibold">Severity</th><th className="pb-3 pr-4 font-semibold">Message</th><th className="pb-3 font-semibold">Source</th></tr></thead>
                <tbody>{ERRORS.map((e, i) => {
                  const sc = e.severity === "ERROR" ? "#ef4444" : e.severity === "WARN" ? "#f59e0b" : "#3b82f6"
                  return <tr key={i} className="border-b" style={{ borderColor: "var(--border-default)" }}>
                    <td className="py-3 pr-4 font-mono" style={{ color: "var(--text-secondary)" }}>{e.ts}</td>
                    <td className="py-3 pr-4"><span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${sc}20`, color: sc }}>{e.severity}</span></td>
                    <td className="py-3 pr-4" style={{ color: "var(--text-primary)" }}>{e.message}</td>
                    <td className="py-3" style={{ color: "var(--text-secondary)" }}>{e.source}</td>
                  </tr>
                })}</tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
