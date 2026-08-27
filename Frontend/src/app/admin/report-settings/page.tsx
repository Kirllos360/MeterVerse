"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { saveSetting } from "@/features/admin-settings/api/service"

const TABS = [{ id: "0", label: "Dashboard" }, { id: "1", label: "Setup" }]

const REPORT_TYPES = [
  { name: "Daily Consumption", format: "PDF/CSV", schedule: "Daily at 23:00", lastRun: "2026-07-27 23:00", status: "Active" },
  { name: "Monthly Billing", format: "PDF", schedule: "1st of month", lastRun: "2026-07-01 06:00", status: "Active" },
  { name: "Tariff Analysis", format: "XLSX", schedule: "Weekly (Sun)", lastRun: "2026-07-27 08:00", status: "Active" },
  { name: "Meter Health", format: "PDF", schedule: "Daily at 06:00", lastRun: "2026-07-27 06:00", status: "Inactive" },
  { name: "Compliance Audit", format: "PDF", schedule: "Monthly", lastRun: "2026-07-01 00:00", status: "Active" }
]

const RECENT_REPORTS = [
  { id: 1, name: "Daily Consumption Jul 27", type: "PDF", size: "2.4 MB", generated: "2026-07-27 23:00", status: "Completed" },
  { id: 2, name: "Weekly Tariff Analysis W30", type: "XLSX", size: "1.1 MB", generated: "2026-07-27 08:00", status: "Completed" },
  { id: 3, name: "Monthly Billing June", type: "PDF", size: "8.7 MB", generated: "2026-07-01 06:00", status: "Completed" },
  { id: 4, name: "Ad-hoc Meter Query", type: "CSV", size: "0.4 MB", generated: "2026-06-30 14:30", status: "Failed" }
]

const statusBadge = (s: string) => {
  const colors: Record<string, string> = { Active: "#DC2626", Completed: "#DC2626", Inactive: "#6b7280", Failed: "#ef4444" }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: colors[s] + "18", color: colors[s] }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[s] }} />{s}
    </span>
  )
}

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

export default function ReportSettingsPage() {
  const [tab, setTab] = useState(0)
  const [defaultFormat, setDefaultFormat] = useState("PDF")
  const [maxRetention, setMaxRetention] = useState(90)
  const [saving, setSaving] = useState(false)
  const handleSave = async () => { setSaving(true); try { await Promise.all([saveSetting("report_default_format", defaultFormat, "report"), saveSetting("report_max_retention_days", String(maxRetention), "report")]) } catch {} finally { setSaving(false) } }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Report Settings</h1><p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p></div>
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
        {tab === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Report Definitions</h3>
              {renderTable(["Name", "Format", "Schedule", "Last Run", "Status"], REPORT_TYPES.map(r => [r.name, r.format, r.schedule, r.lastRun, statusBadge(r.status)]))}
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Recently Generated</h3>
              {renderTable(["Name", "Type", "Size", "Generated", "Status"], RECENT_REPORTS.map(r => [r.name, r.type, r.size, r.generated, statusBadge(r.status)]))}
            </div>
          </motion.div>
        )}
        {tab === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg space-y-4">
            <div><label htmlFor="lbl-default-export-format"  className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }} >Default Export Format</label><select id="lbl-default-export-format" value={defaultFormat} onChange={e => setDefaultFormat(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}><option>PDF</option><option>XLSX</option><option>CSV</option></select></div>
            <div><label htmlFor="lbl-max-retention-days" className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Max Retention (days)</label><input  id="lbl-max-retention-days" type="number" value={maxRetention} onChange={e => setMaxRetention(Number(e.target.value))} className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} /></div>
            <button onClick={handleSave} disabled={saving} className="rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-50" style={{ backgroundColor: "var(--brand)" }}>{saving ? "Saving..." : "Save"}</button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
