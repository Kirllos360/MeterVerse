"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getBillCycles, getEvents, getErrors } from "@/features/admin-settings/api/service"

const TABS = [{ id: "0", label: "Per Meter Type" }, { id: "1", label: "Per Project" }, { id: "2", label: "Verification" }, { id: "3", label: "Event Log" }, { id: "4", label: "Error Log" }]

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

export default function BillCycleSettingsPage() {
  const [tab, setTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [cycles, setCycles] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [errors, setErrors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getBillCycles().catch(() => ({ cycles: [] })),
      getEvents("billing", 10).catch(() => ({ events: [] })),
      getErrors("billing", 10).catch(() => ({ errors: [] })),
    ]).then(([c, ev, er]) => { setCycles(c.cycles); setEvents(ev.events); setErrors(er.errors); setLoading(false) })
  }, [])

  const table = (headers: string[], rows: (string | React.ReactNode)[][], kIdx = 0) => (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead><tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
          {headers.map((h, i) => <th key={i} className={`pb-3 font-semibold ${i < headers.length - 1 ? "pr-4" : ""}`}>{h}</th>)}
        </tr></thead>
        <tbody>{rows.map((row, ri) => (
          <tr key={ri} className="border-b" style={{ borderColor: "var(--border-default)" }}>
            {row.map((cell, ci) => <td key={ci} className={`py-3 ${ci < row.length - 1 ? "pr-4" : ""}`} style={{ color: ci === kIdx ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: ci === kIdx ? 600 : 400 }}>{cell}</td>)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
  const sevColor = (s: string) => s === "ERROR" || s === "error" || s === "High" ? "#ef4444" : s === "WARN" || s === "warn" || s === "Medium" ? "#f59e0b" : "#3b82f6"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Bill Cycle Settings</h1><p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p></div>
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
        {!loading && tab === 0 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-3 mb-4">
            <input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 rounded-xl border px-3 py-2 text-xs outline-none"
              style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
          </div>
          {table(["Type", "Cycle", "Bill Day", "Read Day", "Status"], METER_TYPES.filter(m => m.type.toLowerCase().includes(searchTerm.toLowerCase())).map(m => [m.type, m.cycle, String(m.billDay), String(m.readDay), <span key={m.id} className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: m.status === "Active" ? "rgba(220,38,38,0.1)" : "rgba(156,163,175,0.1)", color: m.status === "Active" ? "#DC2626" : "#6b7280" }}>{m.status}</span>]))}
        </motion.div>}
        {!loading && tab === 1 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Bill Cycles from Database</h3>
          {cycles.length === 0 ? <p className="text-xs py-4" style={{ color: "var(--text-secondary)" }}>No cycles configured</p> : table(["Name", "Code", "Frequency", "Billing Day", "Due Day"], cycles.map((c: any) => [c.name, c.code, c.frequency, String(c.billingDay), String(c.dueDay)]))}
        </motion.div>}
        {!loading && tab === 2 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {table(["Project", "Meters Read", "Verified", "Failed", "Status"], VERIFICATION.map(v => [v.project, String(v.metersRead), String(v.verified), String(v.failed), <span key={v.id} className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: v.status === "Verified" ? "rgba(220,38,38,0.1)" : v.status === "Pending" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)", color: v.status === "Verified" ? "#DC2626" : v.status === "Pending" ? "#f59e0b" : "#ef4444" }}>{v.status}</span>]))}
        </motion.div>}
        {!loading && tab === 3 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Time", "Action", "Resource"], events.map((e: any) => [new Date(e.createdAt).toLocaleString(), <span key={e.id ?? e.name ?? e} className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{e.action}</span>, e.resource || "â€”"]))}</motion.div>}
        {!loading && tab === 4 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Time", "Severity", "Action"], errors.map((e: any) => [new Date(e.createdAt).toLocaleString(), <span key={e.id ?? e.name ?? e} className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${sevColor(e.severity)}20`, color: sevColor(e.severity) }}>{e.severity.toUpperCase()}</span>, e.action]))}</motion.div>}
      </div>
    </div>
  )
}
