"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getEvents, getErrors, getMeterTypes } from "@/features/admin-settings/api/service"

const TABS = [
  { id: "0", label: "Upload Center" },
  { id: "1", label: "Migration Jobs" },
  { id: "2", label: "Templates" },
  { id: "3", label: "History" },
  { id: "4", label: "Event Log" },
  { id: "5", label: "Error Log" }
]

const UPLOAD_HISTORY = [
  { id: 1, filename: "readings_oct_20260727.csv", type: "Meter Readings", size: "12.3 MB", rows: 4520, status: "Success", uploaded: "2026-07-27 09:15:00" },
  { id: 2, filename: "tariff_update_w30.xlsx", type: "Tariff Import", size: "1.8 MB", rows: 45, status: "Success", uploaded: "2026-07-27 08:00:00" },
  { id: 3, filename: "customer_sync_jul.xml", type: "Customer Data", size: "4.2 MB", rows: 1280, status: "Failed", uploaded: "2026-07-26 22:00:00" },
  { id: 4, filename: "readings_ncr_20260726.csv", type: "Meter Readings", size: "8.9 MB", rows: 3210, status: "Success", uploaded: "2026-07-26 09:00:00" },
  { id: 5, filename: "bulk_config_sodic.json", type: "Bulk Meter Config", size: "0.6 MB", rows: 34, status: "Failed", uploaded: "2026-07-25 14:30:00" }
]

const MIGRATION_JOBS = [
  { id: 1, name: "October → PostgreSQL", source: "PalmHills_October", target: "PostgreSQL Main", status: "Completed", records: 12450, lastRun: "2026-07-27 03:00" },
  { id: 2, name: "New Cairo → PostgreSQL", source: "PalmHills_NewCairo", target: "PostgreSQL Main", status: "Completed", records: 9720, lastRun: "2026-07-27 03:15" },
  { id: 3, name: "SODIC → PostgreSQL", source: "SODIC", target: "PostgreSQL Main", status: "Running", records: 5630, lastRun: "2026-07-27 04:00" },
  { id: 4, name: "Billing Archive 2024", source: "Billing_Prod", target: "Archive Cold", status: "Pending", records: 0, lastRun: "—" }
]

const TEMPLATES = [
  { id: 1, name: "Meter Readings CSV", format: ".csv", columns: "MeterID,Timestamp,Value,Status", size: "50 MB" },
  { id: 2, name: "Tariff Import XLSX", format: ".xlsx", columns: "Code,Name,Rate,EffectiveFrom", size: "20 MB" },
  { id: 3, name: "Customer Data XML", format: ".xml", columns: "ISO 20022 Standard", size: "10 MB" },
  { id: 4, name: "Bulk Meter Config", format: ".json", columns: "Serial,Type,Area,Protocol", size: "5 MB" }
]

const statusBadge = (s: string) => {
  const colors: Record<string, string> = { Success: "#DC2626", Completed: "#DC2626", Active: "#DC2626", Running: "#3b82f6", Failed: "#ef4444", Pending: "#f59e0b" }
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
    style={{ backgroundColor: (colors[s] || "#6b7280") + "18", color: colors[s] || "#6b7280" }}>
    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[s] || "#6b7280" }} />{s}
  </span>
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

export default function MigrationUploadsPage() {
  const [tab, setTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [events, setEvents] = useState<any[]>([])
  const [errors, setErrors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getEvents("upload", 10).catch(() => ({ events: [] })),
      getErrors("upload", 10).catch(() => ({ errors: [] })),
    ]).then(([ev, er]) => { setEvents(ev.events); setErrors(er.errors); setLoading(false) })
  }, [])

  const filtered = UPLOAD_HISTORY.filter(f => f.filename.toLowerCase().includes(searchTerm.toLowerCase()))
  const sevColor = (s: string) => s === "ERROR" || s === "error" ? "#ef4444" : s === "WARN" || s === "warn" ? "#f59e0b" : "#3b82f6"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Migration & Uploads</h1><p className="text-sm" style={{ color: "var(--text-secondary)" }}>Data import, export, and migration management</p></div>
      </div>
      <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none rounded-2xl border px-3" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} className="shrink-0 px-3 py-1.5 text-xs font-semibold transition-all rounded-xl whitespace-nowrap"
            style={{ backgroundColor: tab === i ? "var(--brand)" : "transparent", color: tab === i ? "#FFFFFF" : "var(--text-secondary)" }}>
            {tab === i && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block mr-1.5" />}{t.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border p-6" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
        {loading && <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }} /></div>}
        {!loading && tab === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center gap-3" style={{ borderColor: "var(--border-default)" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5m0 0L7 8m5-5v12" /></svg>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Drop files or click to upload</p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>CSV, XLSX, XML, JSON supported</p>
                <button className="rounded-xl px-4 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>Select Files</button>
              </div>
              <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Quick Actions</p>
                <div className="space-y-2">
                  <button className="w-full text-left rounded-lg border px-3 py-2 text-xs font-medium transition-all hover:opacity-80" style={{ borderColor: "var(--border-default)", color: "var(--text-primary)" }}>▶ Run Daily Import</button>
                  <button className="w-full text-left rounded-lg border px-3 py-2 text-xs font-medium transition-all hover:opacity-80" style={{ borderColor: "var(--border-default)", color: "var(--text-primary)" }}>▶ Sync All Meters</button>
                  <button className="w-full text-left rounded-lg border px-3 py-2 text-xs font-medium transition-all hover:opacity-80" style={{ borderColor: "var(--border-default)", color: "var(--text-primary)" }}>▶ Export Full Backup</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {!loading && tab === 1 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {renderTable(["Job Name", "Source", "Target", "Status", "Records", "Last Run"], MIGRATION_JOBS.map(j => [j.name, j.source, j.target, statusBadge(j.status), String(j.records), j.lastRun]))}
        </motion.div>}
        {!loading && tab === 2 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {renderTable(["Template Name", "Format", "Columns", "Max Size"], TEMPLATES.map(t => [t.name, t.format, t.columns, t.size]))}
        </motion.div>}
        {!loading && tab === 3 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <input placeholder="Search history..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-xs outline-none"
            style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
          {renderTable(["Filename", "Type", "Size", "Rows", "Status", "Uploaded"], filtered.map(f => [f.filename, f.type, f.size, String(f.rows), statusBadge(f.status), f.uploaded]))}
        </motion.div>}
        {!loading && tab === 4 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {events.length === 0 ? <p className="text-xs py-6 text-center" style={{ color: "var(--text-secondary)" }}>No events</p> : renderTable(["Time", "Action", "Resource"], events.map((e: any) => [new Date(e.createdAt).toLocaleString(), <span key={e.id ?? e.name ?? e} className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{e.action}</span>, e.resource || "—"]))}
        </motion.div>}
        {!loading && tab === 5 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {errors.length === 0 ? <p className="text-xs py-6 text-center" style={{ color: "var(--text-secondary)" }}>No errors</p> : renderTable(["Time", "Severity", "Action"], errors.map((e: any) => [new Date(e.createdAt).toLocaleString(), <span key={e.id ?? e.name ?? e} className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${sevColor(e.severity)}20`, color: sevColor(e.severity) }}>{e.severity.toUpperCase()}</span>, e.action]))}
        </motion.div>}
      </div>
    </div>
  )
}
