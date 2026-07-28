"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getMeterTypes, getEvents, getErrors, saveSetting } from "@/features/admin-settings/api/service"

const TABS = [
  { id: "0", label: "Meter Types" },
  { id: "1", label: "Main Settings" },
  { id: "2", label: "Measurement Points" },
  { id: "3", label: "Result Types" },
  { id: "4", label: "Data Setup" },
  { id: "5", label: "Event Log" },
  { id: "6", label: "Error Log" }
]

const sevColor = (s: string) => s === "error" || s === "ERROR" ? "#ef4444" : s === "warn" || s === "WARN" ? "#f59e0b" : "#3b82f6"

export default function MeterSettingsPage() {
  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState("")
  const [types, setTypes] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [errors, setErrors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [t, ev, er] = await Promise.all([
        getMeterTypes().catch(() => ({ types: [] })),
        getEvents("meter", 30).catch(() => ({ events: [] })),
        getErrors("meter", 30).catch(() => ({ errors: [] })),
      ])
      setTypes(t.types)
      setEvents(ev.events)
      setErrors(er.errors)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])
  const [protocol, setProtocol] = useState("DLMS/COSEM")
  const [timeout, setTimeout_] = useState(30)
  const [retries, setRetries] = useState(3)
  const [saving, setSaving] = useState(false)
  const handleSaveMain = async () => {
    setSaving(true)
    try {
      await Promise.all([
        saveSetting("meter_default_protocol", protocol, "meter"),
        saveSetting("meter_read_timeout", String(timeout), "meter"),
        saveSetting("meter_retry_attempts", String(retries), "meter"),
      ])
    } catch {} finally { setSaving(false) }
  }

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
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Meter Settings</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="text-xs px-3 py-1.5 rounded-xl border transition-all hover:opacity-80" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>↻ Refresh</button>
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
            className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 3l3-3m0 0l3 3m-3-3v12" /></svg>
          </motion.div>
        </div>
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
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }} />
          </div>
        )}
        {!loading && tab === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-3 mb-4">
              <input type="text" placeholder="Search meter types..." value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 rounded-xl border px-3 py-2 text-xs outline-none"
                style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
            </div>
            {types.length === 0 ? (
              <p className="text-xs py-6 text-center" style={{ color: "var(--text-secondary)" }}>No meter types configured yet</p>
            ) : table(["Name", "Category", "Unit", "Manufacturer", "Meters"],
              types.filter(m => m.name.toLowerCase().includes(search.toLowerCase())).map(m => [m.name, m.category, m.unit, m.manufacturer || "—", String(m._count?.meters || 0)]))}
          </motion.div>
        )}
        {!loading && tab === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg space-y-4">
            <div><label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Default Protocol</label>            <select value={protocol} onChange={e => setProtocol(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}><option>DLMS/COSEM</option><option>IEC 62056</option><option>Modbus TCP</option></select></div>
            <div><label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Read Timeout (s)</label><input type="number" value={timeout} onChange={e => setTimeout_(Number(e.target.value))} className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} /></div>
            <div><label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Retry Attempts</label><input type="number" value={retries} onChange={e => setRetries(Number(e.target.value))} className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} /></div>
            <button onClick={handleSaveMain} disabled={saving} className="rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-50" style={{ backgroundColor: "var(--brand)" }}>{saving ? "Saving..." : "Save Settings"}</button>
          </motion.div>
        )}
        {!loading && tab === 2 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><p className="text-xs py-6 text-center" style={{ color: "var(--text-secondary)" }}>Measurement points data from backend</p></motion.div>}
        {!loading && tab === 3 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><p className="text-xs py-6 text-center" style={{ color: "var(--text-secondary)" }}>Result types data from backend</p></motion.div>}
        {!loading && tab === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Data Retention</p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Raw readings: 365 days</p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Aggregated: 5 years</p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Audit logs: 3 years</p>
              </div>
              <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Data Sources</p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>FTP imports: Enabled</p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>API ingestion: Enabled</p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Manual entry: Disabled</p>
              </div>
            </div>
          </motion.div>
        )}
        {!loading && tab === 5 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {events.length === 0 ? (
            <p className="text-xs py-6 text-center" style={{ color: "var(--text-secondary)" }}>No events logged</p>
          ) : table(["Timestamp", "Action", "Resource", "Actor"],
            events.map(e => [new Date(e.createdAt).toLocaleString(), <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{e.action}</span>, e.resource || "—", e.actor || "—"]))}
        </motion.div>}
        {!loading && tab === 6 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {errors.length === 0 ? (
            <p className="text-xs py-6 text-center" style={{ color: "var(--text-secondary)" }}>No errors logged</p>
          ) : table(["Time", "Severity", "Action", "Actor"],
            errors.map(e => [new Date(e.createdAt).toLocaleString(), <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${sevColor(e.severity)}20`, color: sevColor(e.severity) }}>{e.severity.toUpperCase()}</span>, e.action, e.actor || "—"]))}
        </motion.div>}
      </div>
    </div>
  )
}
