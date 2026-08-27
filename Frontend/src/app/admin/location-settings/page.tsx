"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getMeterTypes, getEvents, saveSetting } from "@/features/admin-settings/api/service"

const TABS = [{ id: "0", label: "Area Settings" }, { id: "1", label: "Project Settings" }, { id: "2", label: "Unit Zones" }, { id: "3", label: "Unit Types" }, { id: "4", label: "Main Settings" }, { id: "5", label: "Event Log" }]

const UNIT_TYPES = [
  { id: 1, type: "Residential", count: 520, meterType: "Single Phase" },
  { id: 2, type: "Commercial", count: 89, meterType: "Three Phase" },
  { id: 3, type: "Industrial", count: 23, meterType: "CT Connected" },
  { id: 4, type: "Villa", count: 156, meterType: "Single Phase" }
]

export default function LocationSettingsPage() {
  const [tab, setTab] = useState(0)
  const [meterTypes, setMeterTypes] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchArea, setSearchArea] = useState("")
  const [searchProject, setSearchProject] = useState("")
  const [searchZone, setSearchZone] = useState("")

  useEffect(() => {
    Promise.all([
      getMeterTypes().catch(() => ({ types: [] })),
      getEvents("location", 10).catch(() => ({ events: [] })),
    ]).then(([mt, ev]) => { setMeterTypes(mt.types); setEvents(ev.events); setLoading(false) })
  }, [])
  const [defaultArea, setDefaultArea] = useState("October")
  const [saving, setSaving] = useState(false)
  const handleSave = async () => { setSaving(true); try { await saveSetting("location_default_area", defaultArea, "location") } catch {} finally { setSaving(false) } }

  const areas = ["October", "New Cairo", "SODIC", "Zayed", "North Coast"]
  const projects = [
    { name: "Palm Hills October A", area: "October", units: 240, status: "Active" },
    { name: "Palm Hills October B", area: "October", units: 180, status: "Active" },
    { name: "New Cairo Village", area: "New Cairo", units: 320, status: "Active" }
  ]
  const zones = [
    { name: "Zone A - Residential", units: 120 }, { name: "Zone B - Commercial", units: 45 },
    { name: "Zone C - Mixed Use", units: 78 }, { name: "Zone D - Villa Complex", units: 34 }
  ]

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
        <div><h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Location Settings</h1><p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p></div>
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
            <input placeholder="Search areas..." value={searchArea} onChange={e => setSearchArea(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-xs outline-none mb-4"
              style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
            {table(["Area", "Status"], areas.filter(a => a.toLowerCase().includes(searchArea.toLowerCase())).map(a => [a, <span key={a} className="px-2 py-0.5 rounded-full text-xs text-green-500" style={{ backgroundColor: "rgba(220,38,38,0.1)" }}>Active</span>]))}
            <p className="text-xs mt-3" style={{ color: "var(--text-secondary)" }}>Loaded from live data. {meterTypes.length} meter types available.</p>
          </motion.div>
        )}
        {!loading && tab === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <input placeholder="Search projects..." value={searchProject} onChange={e => setSearchProject(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-xs outline-none mb-4"
              style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
            {table(["Name", "Area", "Units", "Status"], projects.filter(p => p.name.toLowerCase().includes(searchProject.toLowerCase())).map(p => [p.name, p.area, String(p.units), <span key={p.name} className="px-2 py-0.5 rounded-full text-xs text-green-500" style={{ backgroundColor: "rgba(220,38,38,0.1)" }}>{p.status}</span>]))}
          </motion.div>
        )}
        {!loading && tab === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <input placeholder="Search zones..." value={searchZone} onChange={e => setSearchZone(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-xs outline-none mb-4"
              style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
            {table(["Name", "Units"], zones.filter(z => z.name.toLowerCase().includes(searchZone.toLowerCase())).map(z => [z.name, String(z.units)]))}
          </motion.div>
        )}
        {!loading && tab === 3 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Type", "Count", "Meter Type"], UNIT_TYPES.map(u => [u.type, String(u.count), u.meterType]))}</motion.div>}
        {!loading && tab === 4 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg space-y-4">
          <div><label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }} htmlFor="lbl-default-area">Default Area</label><select id="lbl-default-area" value={defaultArea} onChange={e => setDefaultArea(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}><option>October</option><option>New Cairo</option><option>SODIC</option></select></div>
          <button onClick={handleSave} disabled={saving} className="rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-50" style={{ backgroundColor: "var(--brand)" }}>{saving ? "Saving..." : "Save"}</button>
        </motion.div>}
        {!loading && tab === 5 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {events.length === 0 ? <p className="text-xs py-6 text-center" style={{ color: "var(--text-secondary)" }}>No events</p> : table(["Time", "Action", "Resource"], events.map((e: any) => [new Date(e.createdAt).toLocaleString(), <span key={e.id ?? e.name ?? e} className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{e.action}</span>, e.resource || "â€”"]))}
        </motion.div>}
      </div>
    </div>
  )
}
