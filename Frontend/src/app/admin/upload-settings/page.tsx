"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const TABS = [
  { id: "0", label: "Dashboard" },
  { id: "1", label: "Setup" }
]

const FILE_TYPES = [
  { id: 1, name: "Meter Readings CSV", format: ".csv", maxSize: "50 MB", template: "DLMS Standard", status: "Active" },
  { id: 2, name: "Tariff Import XLSX", format: ".xlsx", maxSize: "20 MB", template: "Tariff v2", status: "Active" },
  { id: 3, name: "Customer Data XML", format: ".xml", maxSize: "10 MB", template: "ISO 20022", status: "Active" },
  { id: 4, name: "Bulk Meter Config", format: ".json", maxSize: "5 MB", template: "MeterVerse v1", status: "Inactive" }
]

const UPLOAD_HISTORY = [
  { id: 1, filename: "readings_oct_20260727.csv", type: "Meter Readings", size: "12.3 MB", rows: 4520, status: "Success", uploaded: "2026-07-27 09:15:00" },
  { id: 2, filename: "tariff_update_w30.xlsx", type: "Tariff Import", size: "1.8 MB", rows: 45, status: "Success", uploaded: "2026-07-27 08:00:00" },
  { id: 3, filename: "customer_sync_jul.xml", type: "Customer Data", size: "4.2 MB", rows: 1280, status: "Failed", uploaded: "2026-07-26 22:00:00" },
  { id: 4, filename: "readings_ncr_20260726.csv", type: "Meter Readings", size: "8.9 MB", rows: 3210, status: "Success", uploaded: "2026-07-26 09:00:00" },
  { id: 5, filename: "bulk_config_sodic.json", type: "Bulk Meter Config", size: "0.6 MB", rows: 34, status: "Failed", uploaded: "2026-07-25 14:30:00" }
]

export default function UploadSettingsPage() {
  const [tab, setTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = { Active: "#22c55e", Success: "#22c55e", Inactive: "#6b7280", Failed: "#ef4444", Processing: "#3b82f6" }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
        style={{ backgroundColor: colors[s] + "18", color: colors[s] }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[s] }} />
        {s}
      </span>
    )
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Upload Settings</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p>
        </div>
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
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
          <div>
            <SectionHeader title="File Type Settings" onAdd={() => {}} />
            {renderTable(
              ["ID", "Name", "Format", "Max Size", "Template", "Status", "Actions"],
              FILE_TYPES.map(f => [f.id, f.name, f.format, f.maxSize, f.template, statusBadge(f.status),
                <div key={f.id} className="flex gap-2">
                  <button className="px-3 py-1 text-xs font-semibold rounded-lg border transition-all hover:opacity-80"
                    style={{ borderColor: "var(--border-default)", color: "var(--brand)" }}>Edit</button>
                  <button className="px-3 py-1 text-xs font-semibold rounded-lg border transition-all hover:opacity-80"
                    style={{ borderColor: "var(--border-default)", color: "#ef4444" }}>Delete</button>
                </div>])
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Upload History</h3>
            {renderTable(
              ["ID", "Filename", "Type", "Size", "Rows", "Status", "Uploaded"],
              UPLOAD_HISTORY.map(u => [u.id, u.filename, u.type, u.size, u.rows, statusBadge(u.status), u.uploaded])
            )}
          </div>
        </motion.div>
      )}

      {tab === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-6" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Upload Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Max File Size (MB)", value: "50" },
              { label: "Accepted Formats", value: ".csv, .xlsx, .xml, .json" },
              { label: "Auto-validate on Upload", value: true, type: "toggle" as const },
              { label: "Archive After Processing", value: true, type: "toggle" as const },
              { label: "Duplicate Detection", value: true, type: "toggle" as const },
              { label: "Notify on Failure", value: true, type: "toggle" as const },
              { label: "Upload Timeout (s)", value: "300" },
              { label: "Chunk Size (MB)", value: "10" }
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
