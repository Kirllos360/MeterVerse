"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getMeterTypes, getEvents, getErrors } from "@/features/admin-settings/api/service"

const TABS = [
  { id: "0", label: "Spreadsheet" },
  { id: "1", label: "SQL Command" },
  { id: "2", label: "Query Results" },
  { id: "3", label: "Event Log" },
  { id: "4", label: "Error Log" }
]

const INITIAL_ROWS = [
  { id: 1, meter: "MTR-001", reading: 1245.6, date: "2026-07-27", status: "Valid" },
  { id: 2, meter: "MTR-002", reading: 892.3, date: "2026-07-27", status: "Valid" },
  { id: 3, meter: "MTR-003", reading: 2105.0, date: "2026-07-26", status: "Valid" },
  { id: 4, meter: "MTR-004", reading: 456.2, date: "2026-07-26", status: "Suspicious" },
  { id: 5, meter: "MTR-005", reading: 1789.8, date: "2026-07-25", status: "Valid" }
]

export default function DatabaseManagementPage() {
  const [tab, setTab] = useState(0)
  const [rows, setRows] = useState(INITIAL_ROWS)
  const [sql, setSql] = useState("SELECT TOP 10 * FROM Result ORDER BY ResultTimeStamp DESC")
  const [queryRan, setQueryRan] = useState(false)
  const [search, setSearch] = useState("")
  const [events, setEvents] = useState<any[]>([])
  const [errors, setErrors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getEvents("database", 10).catch(() => ({ events: [] })),
      getErrors("database", 10).catch(() => ({ errors: [] })),
    ]).then(([ev, er]) => { setEvents(ev.events); setErrors(er.errors); setLoading(false) })
  }, [])

  const addRow = () => setRows([...rows, { id: Date.now(), meter: "MTR-NEW", reading: 0, date: new Date().toISOString().slice(0, 10), status: "Pending" }])
  const deleteRow = (id: number) => setRows(rows.filter(r => r.id !== id))
  const runQuery = () => setQueryRan(true)
  const filtered = rows.filter(r => r.meter.toLowerCase().includes(search.toLowerCase()))

  const sevColor = (s: string) => s === "ERROR" || s === "error" ? "#ef4444" : s === "WARN" || s === "warn" ? "#f59e0b" : "#3b82f6"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Database Management</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p>
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none rounded-2xl border px-3"
        style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            className="shrink-0 px-3 py-1.5 text-xs font-semibold transition-all rounded-xl whitespace-nowrap"
            style={{ backgroundColor: tab === i ? "var(--brand)" : "transparent", color: tab === i ? "#FFFFFF" : "var(--text-secondary)" }}>
            {tab === i && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block mr-1.5" />}{t.label}</button>
        ))}
      </div>
      <div className="rounded-2xl border p-6" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
        {loading && <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }} /></div>}
        {!loading && tab === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-3 mb-4">
              <input placeholder="Search by meter..." value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 rounded-xl border px-3 py-2 text-xs outline-none"
                style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
              <button onClick={addRow} className="rounded-xl px-3 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>+ Add Row</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                  <th className="pb-3 pr-4 font-semibold">Meter</th><th className="pb-3 pr-4 font-semibold">Reading</th><th className="pb-3 pr-4 font-semibold">Date</th><th className="pb-3 pr-4 font-semibold">Status</th><th className="pb-3 font-semibold">Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} className="border-b" style={{ borderColor: "var(--border-default)" }}>
                      <td className="py-3 pr-4 font-medium" style={{ color: "var(--text-primary)" }}>{r.meter}</td>
                      <td className="py-3 pr-4" style={{ color: "var(--text-secondary)" }}>{r.reading}</td>
                      <td className="py-3 pr-4" style={{ color: "var(--text-secondary)" }}>{r.date}</td>
                      <td className="py-3 pr-4"><span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: r.status === "Valid" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: r.status === "Valid" ? "#22c55e" : "#ef4444" }}>{r.status}</span></td>
                      <td className="py-3"><button onClick={() => deleteRow(r.id)} className="text-xs text-red-500 hover:underline">Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        {!loading && tab === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <textarea value={sql} onChange={e => setSql(e.target.value)} rows={6}
              className="w-full rounded-xl border px-3 py-2 text-xs font-mono outline-none resize-none"
              style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
            <button onClick={runQuery} className="rounded-xl px-4 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>▶ Run Query</button>
          </motion.div>
        )}
        {!loading && tab === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {!queryRan ? <p className="text-xs py-4" style={{ color: "var(--text-secondary)" }}>Run a query to see results</p> : <p className="text-xs py-4" style={{ color: "var(--text-secondary)" }}>Query executed (simulated)</p>}
          </motion.div>
        )}
        {!loading && tab === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                  <th className="pb-3 pr-4 font-semibold">Time</th><th className="pb-3 pr-4 font-semibold">Action</th><th className="pb-3 font-semibold">Detail</th>
                </tr></thead>
                <tbody>
                  {events.length === 0 && <tr><td colSpan={3} className="py-6 text-center" style={{ color: "var(--text-secondary)" }}>No events</td></tr>}
                  {events.map((e: any) => (
                    <tr key={e.id} className="border-b" style={{ borderColor: "var(--border-default)" }}>
                      <td className="py-2 pr-4 font-mono" style={{ color: "var(--text-secondary)" }}>{new Date(e.createdAt).toLocaleString()}</td>
                      <td className="py-2 pr-4"><span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "#dbeafe", color: "#3b82f6" }}>{e.action}</span></td>
                      <td className="py-2" style={{ color: "var(--text-secondary)" }}>{e.resource || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        {!loading && tab === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                  <th className="pb-3 pr-4 font-semibold">Time</th><th className="pb-3 pr-4 font-semibold">Severity</th><th className="pb-3 font-semibold">Action</th>
                </tr></thead>
                <tbody>
                  {errors.length === 0 && <tr><td colSpan={3} className="py-6 text-center" style={{ color: "var(--text-secondary)" }}>No errors</td></tr>}
                  {errors.map((e: any) => (
                    <tr key={e.id} className="border-b" style={{ borderColor: "var(--border-default)" }}>
                      <td className="py-2 pr-4 font-mono" style={{ color: "var(--text-secondary)" }}>{new Date(e.createdAt).toLocaleString()}</td>
                      <td className="py-2 pr-4"><span className="px-1.5 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: `${sevColor(e.severity)}20`, color: sevColor(e.severity) }}>{e.severity.toUpperCase()}</span></td>
                      <td className="py-2" style={{ color: "var(--text-secondary)" }}>{e.action}</td>
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
