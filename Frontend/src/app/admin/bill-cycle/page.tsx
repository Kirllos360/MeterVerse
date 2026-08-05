"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const TABS = [
  { id: "0", label: "Dashboard" },
  { id: "1", label: "Setup" }
]

const ACTIVE_CYCLES = [
  { id: 1, name: "October Monthly", period: "Jul 2026", meters: 520, progress: 78, status: "In Progress" },
  { id: 2, name: "New Cairo Monthly", period: "Jul 2026", meters: 380, progress: 92, status: "In Progress" },
  { id: 3, name: "SODIC Bi-Monthly", period: "Jul-Aug 2026", meters: 210, progress: 45, status: "In Progress" }
]

const UPCOMING_RUNS = [
  { id: 1, name: "October Monthly", nextRun: "2026-08-05 00:00", type: "Meter Read", status: "Scheduled" },
  { id: 2, name: "October Monthly", nextRun: "2026-08-10 00:00", type: "Bill Generation", status: "Scheduled" },
  { id: 3, name: "SODIC Bi-Monthly", nextRun: "2026-08-15 00:00", type: "Meter Read", status: "Scheduled" },
  { id: 4, name: "New Cairo Monthly", nextRun: "2026-08-05 00:00", type: "Meter Read", status: "Scheduled" }
]

const RECENT_RUNS = [
  { id: 1, cycle: "October Monthly", type: "Meter Read", date: "2026-07-01 00:00", records: 520, status: "Completed" },
  { id: 2, cycle: "October Monthly", type: "Bill Generation", date: "2026-07-05 00:00", records: 518, status: "Completed" },
  { id: 3, cycle: "New Cairo Monthly", type: "Meter Read", date: "2026-07-01 00:00", records: 380, status: "Completed" },
  { id: 4, cycle: "SODIC Bi-Monthly", type: "Meter Read", date: "2026-07-01 00:00", records: 210, status: "Failed" },
  { id: 5, cycle: "New Cairo Monthly", type: "Bill Generation", date: "2026-07-05 00:00", records: 378, status: "Completed" }
]

export default function BillCyclePage() {
  const [tab, setTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = { "In Progress": "#3b82f6", Scheduled: "#f59e0b", Completed: "#DC2626", Failed: "#ef4444" }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
        style={{ backgroundColor: colors[s] + "18", color: colors[s] }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[s] }} />
        {s}
      </span>
    )
  }

  const SectionHeader = ({ title, onAdd }: { title: string; onAdd?: () => void }) => (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{title}</h3>
      <div className="flex gap-2">
        <input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="w-40 px-3 py-1.5 text-xs rounded-lg border outline-none"
          style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
        {onAdd && <button onClick={onAdd}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-all hover:opacity-90"
          style={{ backgroundColor: "var(--brand)" }}>+ Add</button>}
      </div>
    </div>
  )

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
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Bill Cycle</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p>
        </div>
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /></svg>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ACTIVE_CYCLES.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{c.name}</span>
                  {statusBadge(c.status)}
                </div>
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{c.period} &middot; {c.meters} meters</div>
                <div className="mt-3 w-full h-1.5 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${c.progress}%`, backgroundColor: "var(--brand)" }} />
                </div>
                <div className="text-xs mt-1 font-medium" style={{ color: "var(--text-secondary)" }}>{c.progress}% complete</div>
              </motion.div>
            ))}
          </div>

          <div>
            <SectionHeader title="Upcoming Runs" />
            {renderTable(
              ["ID", "Cycle", "Next Run", "Type", "Status"],
              UPCOMING_RUNS.map(u => [u.id, u.name, u.nextRun, u.type, statusBadge(u.status)])
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Recent Runs</h3>
            {renderTable(
              ["ID", "Cycle", "Type", "Date", "Records", "Status"],
              RECENT_RUNS.map(r => [r.id, r.cycle, r.type, r.date, r.records, statusBadge(r.status)])
            )}
          </div>
        </motion.div>
      )}

      {tab === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-6" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Bill Cycle Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Default Cycle Type", value: "Monthly" },
              { label: "Meter Read Day", value: "1st of month" },
              { label: "Bill Generation Day", value: "5th of month" },
              { label: "Due Day", value: "20th of month" },
              { label: "Auto-Generate Bills", value: true, type: "toggle" as const },
              { label: "Send Notifications", value: true, type: "toggle" as const },
              { label: "Retry Failed Runs", value: true, type: "toggle" as const },
              { label: "Max Retries", value: "3" }
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
