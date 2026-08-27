"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getMeterTypes, getEvents, saveSetting } from "@/features/admin-settings/api/service"

const TABS = [{ id: "0", label: "Dashboard" }, { id: "1", label: "Setup" }]

const UPLOAD_HISTORY = [
  { id: 1, filename: "readings_oct_20260727.csv", type: "Meter Readings", size: "12.3 MB", rows: 4520, status: "Success", uploaded: "2026-07-27 09:15:00" },
  { id: 2, filename: "tariff_update_w30.xlsx", type: "Tariff Import", size: "1.8 MB", rows: 45, status: "Success", uploaded: "2026-07-27 08:00:00" },
  { id: 3, filename: "customer_sync_jul.xml", type: "Customer Data", size: "4.2 MB", rows: 1280, status: "Failed", uploaded: "2026-07-26 22:00:00" },
  { id: 4, filename: "readings_ncr_20260726.csv", type: "Meter Readings", size: "8.9 MB", rows: 3210, status: "Success", uploaded: "2026-07-26 09:00:00" },
  { id: 5, filename: "bulk_config_sodic.json", type: "Bulk Meter Config", size: "0.6 MB", rows: 34, status: "Failed", uploaded: "2026-07-25 14:30:00" }
]

const statusBadge = (s: string) => {
  const colors: Record<string, string> = { Active: "#DC2626", Success: "#DC2626", Inactive: "#6b7280", Failed: "#ef4444", Processing: "#3b82f6" }
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
    style={{ backgroundColor: colors[s] + "18", color: colors[s] }}>
    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[s] }} />{s}
  </span>
}

export default function UploadSettingsPage() {
  const [tab, setTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [meterTypes, setMeterTypes] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getMeterTypes().catch(() => ({ types: [] })),
      getEvents("upload", 10).catch(() => ({ events: [] })),
    ]).then(([mt, ev]) => { setMeterTypes(mt.types); setEvents(ev.events); setLoading(false) })
  }, [])
  const [maxSize, setMaxSize] = useState("50 MB")
  const [saving, setSaving] = useState(false)
  const handleSave = async () => { setSaving(true); try { await saveSetting("upload_max_size", maxSize, "upload") } catch {} finally { setSaving(false) } }

  const renderTable = (headers: string[], rows: (string | number | React.ReactNode)[][]) => (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border-default)" }}>
      <table className="w-full text-sm">
        <thead><tr style={{ backgroundColor: "var(--surface-topbar)" }}>
          {headers.map((h, i) => <th key={i} className="px-4 py-2.5 text-left font-semibold text-xs" style={{ color: "var(--text-secondary)" }}>{h}</th>)}
        </tr></thead>
        <tbody>{rows.map((row, ri) => (
          <tr key={ri} className="border-t" style={{ borderColor: "var(--border-default)" }}>
            {row.map((cell, ci) => <td key={ci} className="px-4 py-3 text-xs" style={{ color: ci === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: ci === 0 ? 600 : 400 }}>{cell}</td>)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  )

  const filtered = UPLOAD_HISTORY.filter(f => f.filename.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Upload Settings</h1><p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p></div>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center gap-3">
              <input placeholder="Search history..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="flex-1 rounded-xl border px-3 py-2 text-xs outline-none"
                style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
            </div>
            {renderTable(["Filename", "Type", "Size", "Rows", "Status", "Uploaded"],
              filtered.map(f => [f.filename, f.type, f.size, String(f.rows), statusBadge(f.status), f.uploaded]))}
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{meterTypes.length} meter types available. Events: {events.length}</p>
          </motion.div>
        )}
        {tab === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg space-y-4">
            <div><label htmlFor="lbl-max-upload-size" className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Max Upload Size</label><select value={maxSize} onChange={e => setMaxSize(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}><option>50 MB</option><option>100 MB</option><option>200 MB</option></select></div>
            <div><label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Allowed Formats</label><div className="flex gap-2"><label className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}><input id="lbl-max-upload-size" type="checkbox" defaultChecked /> .csv</label><label className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}><input type="checkbox" defaultChecked /> .xlsx</label><label className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}><input type="checkbox" defaultChecked /> .xml</label></div></div>
            <button onClick={handleSave} disabled={saving} className="rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-50" style={{ backgroundColor: "var(--brand)" }}>{saving ? "Saving..." : "Save"}</button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
