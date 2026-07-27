"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const TABS = [
  { id: "0", label: "Meter Types" },
  { id: "1", label: "Main Settings" },
  { id: "2", label: "Measurement Points" },
  { id: "3", label: "Result Types" },
  { id: "4", label: "Data Setup" },
  { id: "5", label: "Event Log" },
  { id: "6", label: "Error Log" }
]

const METER_TYPES = [
  { name: "Landis+Gyr E550", unit: "kWh", manufacturer: "Landis+Gyr", status: "Active", protocol: "DLMS" },
  { name: "Itron ACE6000", unit: "kWh", manufacturer: "Itron", status: "Active", protocol: "IEC 62056" },
  { name: "Siemens 7KM", unit: "MWh", manufacturer: "Siemens", status: "Active", protocol: "Modbus" },
  { name: "Elster A1700", unit: "kWh", manufacturer: "Honeywell", status: "Inactive", protocol: "DLMS" },
  { name: "Kamstrup 382", unit: "kWh", manufacturer: "Kamstrup", status: "Active", protocol: "IEC 62056" }
]

const MEASUREMENT_POINTS = [
  { mp: "MP-001", meter: "MTR-001", area: "October", type: "Import", status: "Active" },
  { mp: "MP-002", meter: "MTR-001", area: "October", type: "Export", status: "Active" },
  { mp: "MP-003", meter: "MTR-002", area: "New Cairo", type: "Import", status: "Active" },
  { mp: "MP-004", meter: "MTR-003", area: "SODIC", type: "Combined", status: "Active" },
  { mp: "MP-005", meter: "MTR-004", area: "October", type: "Import", status: "Inactive" }
]

const RESULT_TYPES = [
  { rt: 1, name: "Import Active Energy", code: "1.8.0", unit: "kWh" },
  { rt: 2, name: "Export Active Energy", code: "2.8.0", unit: "kWh" },
  { rt: 3, name: "Net Active Energy", code: "3.8.0", unit: "kWh" },
  { rt: 4, name: "Total Active Energy", code: "4.8.0", unit: "kWh" },
  { rt: 10, name: "5.8.0 Energy Combined", code: "5.8.0", unit: "kWh" },
  { rt: 25, name: "5.8.0 Combined (NC)", code: "5.8.0", unit: "kWh" }
]

const EVENTS = [
  { ts: "2026-07-27 08:00:00", action: "TYPE_ADD", detail: "Added meter type Kamstrup 382", user: "admin" },
  { ts: "2026-07-26 16:30:00", action: "MP_LINK", detail: "Linked MP-004 to MTR-003", user: "operator" },
  { ts: "2026-07-25 12:00:00", action: "RT_CREATE", detail: "Created RT 10 (5.8.0 Combined)", user: "admin" },
  { ts: "2026-07-24 10:00:00", action: "SETTING_CHANGE", detail: "Updated DLMS timeout to 30s", user: "admin" }
]

const ERRORS = [
  { ts: "2026-07-27 07:30:00", severity: "ERROR", message: "Meter MTR-005 not responding on DLMS", source: "MeterComm" },
  { ts: "2026-07-26 21:00:00", severity: "WARN", message: "MP-002 duplicate mapping detected", source: "Validation" },
  { ts: "2026-07-26 14:00:00", severity: "ERROR", message: "RT code 5.8.0 collision on insert", source: "ResultType" },
  { ts: "2026-07-25 09:00:00", severity: "INFO", message: "Bulk meter config push completed", source: "Provisioning" }
]

export default function MeterSettingsPage() {
  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState("")

  const sevColor = (s: string) => s === "ERROR" ? "#ef4444" : s === "WARN" ? "#f59e0b" : "#3b82f6"

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
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 3l3-3m0 0l3 3m-3-3v12" /></svg>
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
              <input type="text" placeholder="Search meter types..." value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 rounded-xl border px-3 py-2 text-xs outline-none"
                style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
              <button className="rounded-xl px-3 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>+ Add Type</button>
            </div>
            {table(["Name", "Unit", "Manufacturer", "Status", "Protocol"], METER_TYPES.filter(m => m.name.toLowerCase().includes(search.toLowerCase())).map(m => [m.name, m.unit, m.manufacturer, <span className={`px-2 py-0.5 rounded-full text-xs ${m.status === "Active" ? "text-green-500" : "text-gray-400"}`} style={{ backgroundColor: m.status === "Active" ? "rgba(34,197,94,0.1)" : "rgba(156,163,175,0.1)" }}>{m.status}</span>, m.protocol]))}
          </motion.div>
        )}
        {tab === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg space-y-4">
            <div><label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Default Protocol</label><select className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}><option>DLMS/COSEM</option><option>IEC 62056</option><option>Modbus TCP</option></select></div>
            <div><label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Read Timeout (s)</label><input type="number" defaultValue={30} className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} /></div>
            <div><label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Retry Attempts</label><input type="number" defaultValue={3} className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} /></div>
            <button className="rounded-xl px-4 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>Save Settings</button>
          </motion.div>
        )}
        {tab === 2 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["MP ID", "Meter", "Area", "Type", "Status"], MEASUREMENT_POINTS.map(mp => [mp.mp, mp.meter, mp.area, mp.type, <span className={`px-2 py-0.5 rounded-full text-xs ${mp.status === "Active" ? "text-green-500" : "text-gray-400"}`} style={{ backgroundColor: mp.status === "Active" ? "rgba(34,197,94,0.1)" : "rgba(156,163,175,0.1)" }}>{mp.status}</span>]))}</motion.div>}
        {tab === 3 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["RT #", "Name", "Code", "Unit"], RESULT_TYPES.map(rt => [String(rt.rt), rt.name, rt.code, rt.unit]))}</motion.div>}
        {tab === 4 && (
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
        {tab === 5 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Timestamp", "Action", "Detail", "User"], EVENTS.map(e => [e.ts, <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{e.action}</span>, e.detail, e.user]))}</motion.div>}
        {tab === 6 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Time", "Severity", "Message", "Source"], ERRORS.map(e => [e.ts, <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${sevColor(e.severity)}20`, color: sevColor(e.severity) }}>{e.severity}</span>, e.message, e.source]))}</motion.div>}
      </div>
    </div>
  )
}
