"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getTariffs, getEvents, getErrors, saveSetting } from "@/features/admin-settings/api/service"

const TABS = [{ id: "0", label: "Charge Types" }, { id: "1", label: "Tariff Setup" }, { id: "2", label: "Version Update" }, { id: "3", label: "Main Settings" }, { id: "4", label: "Assign to Meter" }, { id: "5", label: "Event Log" }, { id: "6", label: "Error Log" }]

const CHARGE_TYPES = [
  { id: 1, name: "Fixed Charge", type: "Fixed", rate: "25.00 EGP", status: "Active" },
  { id: 2, name: "Variable Consumption", type: "Variable", rate: "1.75 EGP/kWh", status: "Active" },
  { id: 3, name: "Tiered Residential", type: "Tiered", rate: "0.50-2.00 EGP/kWh", status: "Active" },
  { id: 4, name: "Demand Charge", type: "Variable", rate: "12.00 EGP/kVA", status: "Inactive" },
  { id: 5, name: "Service Fee", type: "Fixed", rate: "15.00 EGP", status: "Active" }
]
const VERSIONS = [
  { ver: 3, tariff: "Residential Standard", date: "2026-07-01", changes: "Rate updated from 1.50 to 1.75", author: "admin" },
  { ver: 2, tariff: "Residential Standard", date: "2026-03-15", changes: "Tier thresholds adjusted", author: "manager" },
  { ver: 1, tariff: "Residential Standard", date: "2025-12-01", changes: "Initial version", author: "system" }
]
const ASSIGNMENTS = [
  { id: 1, meter: "MTR-001", tariff: "Residential Standard", area: "October", status: "Applied" },
  { id: 2, meter: "MTR-002", tariff: "Residential Standard", area: "October", status: "Applied" },
  { id: 3, meter: "MTR-015", tariff: "Commercial General", area: "New Cairo", status: "Applied" },
  { id: 4, meter: "MTR-042", tariff: "Industrial High Load", area: "SODIC", status: "Pending" }
]

export default function TariffSettingsPage() {
  const [tab, setTab] = useState(0)
  const [tariffs, setTariffs] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [errors, setErrors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getTariffs().catch(() => ({ tariffs: [] })),
      getEvents("tariff", 10).catch(() => ({ events: [] })),
      getErrors("tariff", 10).catch(() => ({ errors: [] })),
    ]).then(([t, ev, er]) => { setTariffs(t.tariffs); setEvents(ev.events); setErrors(er.errors); setLoading(false) })
  }, [])
  const [currency, setCurrency] = useState("EGP")
  const [saving, setSaving] = useState(false)
  const handleSave = async () => { setSaving(true); try { await saveSetting("tariff_default_currency", currency, "tariff") } catch {} finally { setSaving(false) } }

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
  const sevColor = (s: string) => s === "ERROR" || s === "error" ? "#ef4444" : s === "WARN" || s === "warn" ? "#f59e0b" : "#3b82f6"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Tariff Settings</h1><p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p></div>
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
        {!loading && tab === 0 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Name", "Type", "Rate", "Status"], CHARGE_TYPES.map(c => [c.name, c.type, c.rate, <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: c.status === "Active" ? "rgba(220,38,38,0.1)" : "rgba(156,163,175,0.1)", color: c.status === "Active" ? "#DC2626" : "#6b7280" }}>{c.status}</span>]))}</motion.div>}
        {!loading && tab === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Tariffs from Database</h3>
            {tariffs.length === 0 ? <p className="text-xs py-4" style={{ color: "var(--text-secondary)" }}>No tariffs configured</p> : table(["Name", "Code", "Type", "Unit", "Effective"], tariffs.map((t: any) => [t.name, t.code, t.type, t.unit, new Date(t.effectiveFrom).toLocaleDateString()]))}
          </motion.div>
        )}
        {!loading && tab === 2 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Ver", "Tariff", "Date", "Changes", "Author"], VERSIONS.map(v => [String(v.ver), v.tariff, v.date, v.changes, v.author]))}</motion.div>}
        {!loading && tab === 3 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg space-y-4">
          <div><label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }} htmlFor="lbl-default-currency">Default Currency</label><select id="lbl-default-currency" value={currency} onChange={e => setCurrency(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}><option>EGP</option><option>USD</option></select></div>
          <button onClick={handleSave} disabled={saving} className="rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-50" style={{ backgroundColor: "var(--brand)" }}>{saving ? "Saving..." : "Save"}</button>
        </motion.div>}
        {!loading && tab === 4 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Meter", "Tariff", "Area", "Status"], ASSIGNMENTS.map(a => [a.meter, a.tariff, a.area, <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: a.status === "Applied" ? "rgba(220,38,38,0.1)" : "rgba(245,158,11,0.1)", color: a.status === "Applied" ? "#DC2626" : "#f59e0b" }}>{a.status}</span>]))}</motion.div>}
        {!loading && tab === 5 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Time", "Action", "Resource"], events.map((e: any) => [new Date(e.createdAt).toLocaleString(), <span key={e.id ?? e.name ?? e} className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{e.action}</span>, e.resource || "—"]))}</motion.div>}
        {!loading && tab === 6 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Time", "Severity", "Action"], errors.map((e: any) => [new Date(e.createdAt).toLocaleString(), <span key={e.id ?? e.name ?? e} className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${sevColor(e.severity)}20`, color: sevColor(e.severity) }}>{e.severity.toUpperCase()}</span>, e.action]))}</motion.div>}
      </div>
    </div>
  )
}
