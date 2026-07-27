"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const TABS = [
  { id: "0", label: "Per Meter Type" },
  { id: "1", label: "Per Project" },
  { id: "2", label: "Verification" },
  { id: "3", label: "Event Log" },
  { id: "4", label: "Error Log" }
]

const METER_TYPES = [
  { id: 1, type: "Single Phase", cycle: "Monthly", billDay: 5, readDay: 1, status: "Active" },
  { id: 2, type: "Three Phase", cycle: "Monthly", billDay: 10, readDay: 5, status: "Active" },
  { id: 3, type: "CT Connected", cycle: "Bi-Monthly", billDay: 15, readDay: 10, status: "Active" },
  { id: 4, type: "Prepaid", cycle: "Weekly", billDay: 1, readDay: 7, status: "Inactive" }
]

const PROJECT_CYCLES = [
  { id: 1, project: "Palm Hills October A", cycle: "Monthly", billDay: 5, readDay: 1, status: "Active" },
  { id: 2, project: "New Cairo Village", cycle: "Monthly", billDay: 12, readDay: 8, status: "Active" },
  { id: 3, project: "SODIC Heights", cycle: "Bi-Monthly", billDay: 20, readDay: 15, status: "Active" }
]

const VERIFICATION = [
  { id: 1, project: "Palm Hills October A", metersRead: 240, verified: 238, failed: 2, status: "Verified" },
  { id: 2, project: "New Cairo Village", metersRead: 320, verified: 318, failed: 2, status: "Verified" },
  { id: 3, project: "SODIC Heights", metersRead: 180, verified: 175, failed: 5, status: "Pending" },
  { id: 4, project: "Zayed Extension", metersRead: 95, verified: 90, failed: 5, status: "Failed" }
]

const EVENT_LOG = [
  { time: "2026-07-27 10:00:00", event: "Bill cycle generated for October", user: "system" },
  { time: "2026-07-27 09:30:22", event: "Verification batch #142 completed", user: "system" },
  { time: "2026-07-26 23:00:00", event: "Cycle config updated for CT Connected", user: "admin" },
  { time: "2026-07-26 15:45:10", event: "Meter read schedule adjusted for New Cairo", user: "manager" }
]

const ERROR_LOG = [
  { time: "2026-07-27 05:12:00", error: "Cycle generation timeout for project SODIC Heights", severity: "High" },
  { time: "2026-07-26 22:30:45", error: "Verification mismatch detected - batch #141", severity: "Medium" },
  { time: "2026-07-26 08:15:33", error: "Duplicate bill cycle detected for meter MTR-088", severity: "Low" }
]

export default function BillCycleSettingsPage() {
  const [tab, setTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")

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

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = { Active: "#22c55e", Verified: "#22c55e", Pending: "#f59e0b", Failed: "#ef4444", Inactive: "#6b7280", High: "#ef4444", Medium: "#f59e0b", Low: "#3b82f6" }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
        style={{ backgroundColor: colors[s] + "18", color: colors[s] }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[s] }} />
        {s}
      </span>
    )
  }

  const actionButtons = () => (
    <div className="flex gap-2">
      <button className="px-3 py-1 text-xs font-semibold rounded-lg border transition-all hover:opacity-80"
        style={{ borderColor: "var(--border-default)", color: "var(--brand)" }}>Edit</button>
      <button className="px-3 py-1 text-xs font-semibold rounded-lg border transition-all hover:opacity-80"
        style={{ borderColor: "var(--border-default)", color: "#ef4444" }}>Delete</button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Bill Cycle Settings</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p>
        </div>
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5" /></svg>
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

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={tab}
        className="rounded-2xl border p-6" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>

        {tab === 0 && (
          <>
            <SectionHeader title="Per Meter Type" onAdd={() => {}} />
            {renderTable(
              ["ID", "Meter Type", "Cycle", "Bill Day", "Read Day", "Status", "Actions"],
              METER_TYPES.map(m => [m.id, m.type, m.cycle, m.billDay, m.readDay, statusBadge(m.status), actionButtons()])
            )}
          </>
        )}

        {tab === 1 && (
          <>
            <SectionHeader title="Per Project" onAdd={() => {}} />
            {renderTable(
              ["ID", "Project", "Cycle", "Bill Day", "Read Day", "Status", "Actions"],
              PROJECT_CYCLES.map(p => [p.id, p.project, p.cycle, p.billDay, p.readDay, statusBadge(p.status), actionButtons()])
            )}
          </>
        )}

        {tab === 2 && (
          <>
            <SectionHeader title="Verification Status" />
            {renderTable(
              ["ID", "Project", "Meters Read", "Verified", "Failed", "Status"],
              VERIFICATION.map(v => [v.id, v.project, v.metersRead, v.verified, v.failed, statusBadge(v.status)])
            )}
          </>
        )}

        {tab === 3 && (
          <>
            <SectionHeader title="Event Log" />
            {renderTable(
              ["Timestamp", "Event", "User"],
              EVENT_LOG.map(e => [e.time, e.event, e.user])
            )}
          </>
        )}

        {tab === 4 && (
          <>
            <SectionHeader title="Error Log" />
            {renderTable(
              ["Timestamp", "Error", "Severity"],
              ERROR_LOG.map(e => [e.time, e.error, statusBadge(e.severity)])
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}
