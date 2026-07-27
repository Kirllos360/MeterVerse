"use client"

import { useState } from "react"
import { motion } from "framer-motion"

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

const SAMPLE_EVENTS = [
  { ts: "2026-07-27 08:12:34", action: "UPDATE", table: "Result", user: "admin", detail: "Bulk update 342 rows" },
  { ts: "2026-07-27 07:45:12", action: "INSERT", table: "MPRT", user: "system", detail: "New MPRT link created" },
  { ts: "2026-07-27 06:30:00", action: "BACKUP", table: "—", user: "scheduler", detail: "Full backup completed" },
  { ts: "2026-07-26 23:15:44", action: "DELETE", table: "Result", user: "operator", detail: "Purged 1,200 stale rows" },
  { ts: "2026-07-26 18:00:22", action: "INDEX", table: "Result", user: "system", detail: "Rebuild index IX_Result_TS" }
]

const SAMPLE_ERRORS = [
  { ts: "2026-07-27 07:52:18", severity: "ERROR", message: "Deadlock detected on Result table", source: "SQL Server" },
  { ts: "2026-07-27 06:15:03", severity: "WARN", message: "Long-running query (12s) on MPRT join", source: "Query Analyzer" },
  { ts: "2026-07-26 22:40:55", severity: "ERROR", message: "Timeout: Unable to acquire lock on Quantity", source: "SQL Server" },
  { ts: "2026-07-26 14:30:10", severity: "INFO", message: "Connection pool exhausted, created new session", source: "Connection Pool" },
  { ts: "2026-07-26 09:05:00", severity: "ERROR", message: "Disk I/O error on transaction log", source: "OS" }
]

export default function DatabaseManagementPage() {
  const [tab, setTab] = useState(0)
  const [rows, setRows] = useState(INITIAL_ROWS)
  const [sql, setSql] = useState("SELECT TOP 10 * FROM Result ORDER BY ResultTimeStamp DESC")
  const [queryRan, setQueryRan] = useState(false)
  const [search, setSearch] = useState("")

  const addRow = () => setRows([...rows, { id: Date.now(), meter: "MTR-NEW", reading: 0, date: new Date().toISOString().slice(0, 10), status: "Pending" }])
  const deleteRow = (id: number) => setRows(rows.filter(r => r.id !== id))
  const runQuery = () => setQueryRan(true)

  const filtered = rows.filter(r => r.meter.toLowerCase().includes(search.toLowerCase()))

  const sevColor = (s: string) => s === "ERROR" ? "#ef4444" : s === "WARN" ? "#f59e0b" : "#3b82f6"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Database Mgmt</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p>
        </div>
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M4 7v10c2 0 3 1 3 3h10c2 0 3-1 3-3V7M4 7h16" /></svg>
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
        {tab === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-3 mb-4">
              <input type="text" placeholder="Search meters..." value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 rounded-xl border px-3 py-2 text-xs outline-none"
                style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
              <button onClick={addRow} className="rounded-xl px-3 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>+ Add Row</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                    <th className="pb-3 pr-4 font-semibold">Meter</th>
                    <th className="pb-3 pr-4 font-semibold">Reading</th>
                    <th className="pb-3 pr-4 font-semibold">Date</th>
                    <th className="pb-3 pr-4 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} className="border-b" style={{ borderColor: "var(--border-default)" }}>
                      <td className="py-3 pr-4 font-medium" style={{ color: "var(--text-primary)" }}>{r.meter}</td>
                      <td className="py-3 pr-4" style={{ color: "var(--text-secondary)" }}>{r.reading}</td>
                      <td className="py-3 pr-4" style={{ color: "var(--text-secondary)" }}>{r.date}</td>
                      <td className="py-3 pr-4"><span className={`px-2 py-0.5 rounded-full text-xs ${r.status === "Valid" ? "text-green-500" : r.status === "Suspicious" ? "text-yellow-500" : "text-gray-400"}`} style={{ backgroundColor: r.status === "Valid" ? "rgba(34,197,94,0.1)" : r.status === "Suspicious" ? "rgba(234,179,8,0.1)" : "rgba(156,163,175,0.1)" }}>{r.status}</span></td>
                      <td className="py-3"><button onClick={() => deleteRow(r.id)} className="text-xs font-semibold" style={{ color: "#ef4444" }}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        {tab === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <textarea value={sql} onChange={e => setSql(e.target.value)}
              className="w-full rounded-xl border p-3 text-xs font-mono outline-none resize-y min-h-[120px] mb-4"
              style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
            <button onClick={runQuery} className="rounded-xl px-4 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>Run Query</button>
            {queryRan && (
              <div className="mt-4 rounded-xl border p-3" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                <p className="text-xs text-green-500 font-semibold mb-2">✓ Query executed successfully (142ms, 10 rows)</p>
                <table className="w-full text-xs">
                  <thead><tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}><th className="pb-2 pr-3">MPRTFk</th><th className="pb-2 pr-3">ResultTimeStamp</th><th className="pb-2">ResultValue</th></tr></thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map(i => (
                      <tr key={i} className="border-b" style={{ borderColor: "var(--border-default)" }}>
                        <td className="py-2 pr-3" style={{ color: "var(--text-primary)" }}>{i + 100}</td>
                        <td className="py-2 pr-3" style={{ color: "var(--text-secondary)" }}>2026-07-27 0{i}:00:00</td>
                        <td className="py-2" style={{ color: "var(--text-secondary)" }}>{(Math.random() * 2000).toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
        {tab === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>Last 5 query results</p>
            <div className="space-y-3">
              {["SELECT * FROM Result WHERE ...", "SELECT COUNT(*) FROM Meter", "SELECT TOP 100 * FROM Quantity"].map((q, i) => (
                <div key={i} className="rounded-xl border p-3" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                  <p className="text-xs font-mono mb-2" style={{ color: "var(--text-primary)" }}>{q}</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>→ {[342, 1, 10][i]} rows returned in {[45, 12, 78][i]}ms</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {tab === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                    <th className="pb-3 pr-4 font-semibold">Timestamp</th>
                    <th className="pb-3 pr-4 font-semibold">Action</th>
                    <th className="pb-3 pr-4 font-semibold">Table</th>
                    <th className="pb-3 pr-4 font-semibold">User</th>
                    <th className="pb-3 font-semibold">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_EVENTS.map((e, i) => (
                    <tr key={i} className="border-b" style={{ borderColor: "var(--border-default)" }}>
                      <td className="py-3 pr-4 font-mono" style={{ color: "var(--text-secondary)" }}>{e.ts}</td>
                      <td className="py-3 pr-4"><span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{e.action}</span></td>
                      <td className="py-3 pr-4 font-mono" style={{ color: "var(--text-primary)" }}>{e.table}</td>
                      <td className="py-3 pr-4" style={{ color: "var(--text-secondary)" }}>{e.user}</td>
                      <td className="py-3" style={{ color: "var(--text-secondary)" }}>{e.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        {tab === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                    <th className="pb-3 pr-4 font-semibold">Time</th>
                    <th className="pb-3 pr-4 font-semibold">Severity</th>
                    <th className="pb-3 pr-4 font-semibold">Message</th>
                    <th className="pb-3 font-semibold">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_ERRORS.map((e, i) => (
                    <tr key={i} className="border-b" style={{ borderColor: "var(--border-default)" }}>
                      <td className="py-3 pr-4 font-mono" style={{ color: "var(--text-secondary)" }}>{e.ts}</td>
                      <td className="py-3 pr-4"><span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${sevColor(e.severity)}20`, color: sevColor(e.severity) }}>{e.severity}</span></td>
                      <td className="py-3 pr-4" style={{ color: "var(--text-primary)" }}>{e.message}</td>
                      <td className="py-3" style={{ color: "var(--text-secondary)" }}>{e.source}</td>
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
