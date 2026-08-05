"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getCustomerGroups, getEvents, getErrors } from "@/features/admin-settings/api/service"

const TABS = [{ id: "0", label: "Customer Groups" }, { id: "1", label: "Customer Types" }, { id: "2", label: "Transfer Ownership" }, { id: "3", label: "Event Log" }, { id: "4", label: "Error Log" }]

const TYPES = [
  { name: "Individual", code: "IND", billingCycle: "Monthly", settings: "Standard" },
  { name: "Corporate", code: "CORP", billingCycle: "Quarterly", settings: "Premium" },
  { name: "Subsidized", code: "SUB", billingCycle: "Monthly", settings: "Reduced Rate" },
  { name: "Prepaid", code: "PRE", billingCycle: "Upfront", settings: "Wallet-based" }
]

export default function CustomerSettingsPage() {
  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState("")
  const [transferFrom, setTransferFrom] = useState("")
  const [transferTo, setTransferTo] = useState("")
  const [groups, setGroups] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [errors, setErrors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getCustomerGroups().catch(() => ({ groups: [] })),
      getEvents("customer", 10).catch(() => ({ events: [] })),
      getErrors("customer", 10).catch(() => ({ errors: [] })),
    ]).then(([g, ev, er]) => { setGroups(g.groups); setEvents(ev.events); setErrors(er.errors); setLoading(false) })
  }, [])

  const sevColor = (s: string) => s === "ERROR" || s === "error" ? "#ef4444" : s === "WARN" || s === "warn" ? "#f59e0b" : "#3b82f6"
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Customer Settings</h1><p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p></div>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-3 mb-4">
              <input placeholder="Search groups..." value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 rounded-xl border px-3 py-2 text-xs outline-none"
                style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
            </div>
            {groups.length === 0 ? <p className="text-xs py-6 text-center" style={{ color: "var(--text-secondary)" }}>No customer groups configured</p> : table(["Name", "Members", "Status"], groups.filter((g: any) => g.name.toLowerCase().includes(search.toLowerCase())).map((g: any) => [g.name, String(g._count?.members || 0), <span className="px-2 py-0.5 rounded-full text-xs text-green-500" style={{ backgroundColor: "rgba(220,38,38,0.1)" }}>Active</span>]))}
          </motion.div>
        )}
        {!loading && tab === 1 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Name", "Code", "Billing Cycle", "Settings"], TYPES.map(t => [t.name, t.code, t.billingCycle, t.settings]))}</motion.div>}
        {!loading && tab === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md space-y-4">
            <div><label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>From Customer ID</label><input value={transferFrom} onChange={e => setTransferFrom(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} /></div>
            <div><label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>To Customer ID</label><input value={transferTo} onChange={e => setTransferTo(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} /></div>
            <button className="rounded-xl px-4 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>Transfer</button>
          </motion.div>
        )}
        {!loading && tab === 3 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Time", "Action", "Resource"], events.map((e: any) => [new Date(e.createdAt).toLocaleString(), <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{e.action}</span>, e.resource || "—"]))}</motion.div>}
        {!loading && tab === 4 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Time", "Severity", "Action"], errors.map((e: any) => [new Date(e.createdAt).toLocaleString(), <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${sevColor(e.severity)}20`, color: sevColor(e.severity) }}>{e.severity.toUpperCase()}</span>, e.action]))}</motion.div>}
      </div>
    </div>
  )
}
