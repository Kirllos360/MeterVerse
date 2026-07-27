"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const TABS = [
  { id: "0", label: "Dashboard" },
  { id: "1", label: "Setup" }
]

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

export default function ReportSettingsPage() {
  const [tab, setTab] = useState(0)

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = { Active: "#22c55e", Completed: "#22c55e", Inactive: "#6b7280", Failed: "#ef4444" }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
        style={{ backgroundColor: colors[s] + "18", color: colors[s] }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[s] }} />
        {s}
      </span>
    )
  }

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
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Report Settings</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p>
        </div>
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 17v-2m3 2v-4m3 4v-6" /></svg>
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
            {["PDF", "CSV", "XLSX"].map((fmt, i) => (
              <motion.div key={fmt} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="rounded-xl border p-4 flex items-center gap-3"
                style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: "var(--brand)" }}>{fmt}</div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{fmt} Reports</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{i === 0 ? "3 active" : i === 1 ? "2 active" : "1 active"}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Report Type Configuration</h3>
            {renderTable(
              ["Name", "Format", "Schedule", "Last Run", "Status", ""],
              REPORT_TYPES.map(r => [r.name, r.format, r.schedule, r.lastRun, statusBadge(r.status),
                <button key={r.name} className="px-3 py-1 text-xs font-semibold rounded-lg border transition-all hover:opacity-80"
                  style={{ borderColor: "var(--border-default)", color: "var(--brand)" }}>Edit</button>])
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Recent Reports</h3>
            {renderTable(
              ["ID", "Name", "Type", "Size", "Generated", "Status"],
              RECENT_REPORTS.map(r => [r.id, r.name, r.type, r.size, r.generated, statusBadge(r.status)])
            )}
          </div>
        </motion.div>
      )}

      {tab === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-6" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Report Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Default Report Format", value: "PDF" },
              { label: "Max File Size (MB)", value: "50" },
              { label: "Retention Period", value: "12 months" },
              { label: "Auto-Generate Daily", value: true, type: "toggle" as const },
              { label: "Email Reports", value: true, type: "toggle" as const },
              { label: "Compress Output", value: false, type: "toggle" as const },
              { label: "Report Archive Path", value: "/reports/archive" },
              { label: "Scheduled Time (UTC)", value: "23:00" }
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
