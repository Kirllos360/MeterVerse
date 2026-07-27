"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const TABS = [
  { id: "0", label: "Charge Types" },
  { id: "1", label: "Tariff Setup" },
  { id: "2", label: "Version Update" },
  { id: "3", label: "Main Settings" },
  { id: "4", label: "Assign to Meter" },
  { id: "5", label: "Event Log" },
  { id: "6", label: "Error Log" }
]

const CHARGE_TYPES = [
  { id: 1, name: "Fixed Charge", type: "Fixed", rate: "25.00 EGP", status: "Active" },
  { id: 2, name: "Variable Consumption", type: "Variable", rate: "1.75 EGP/kWh", status: "Active" },
  { id: 3, name: "Tiered Residential", type: "Tiered", rate: "0.50-2.00 EGP/kWh", status: "Active" },
  { id: 4, name: "Demand Charge", type: "Variable", rate: "12.00 EGP/kVA", status: "Inactive" },
  { id: 5, name: "Service Fee", type: "Fixed", rate: "15.00 EGP", status: "Active" }
]

const TARIFFS = [
  { id: 1, name: "Residential Standard", rate: "1.75", effective: "2026-07-01", version: 3, status: "Active" },
  { id: 2, name: "Commercial General", rate: "2.50", effective: "2026-06-15", version: 2, status: "Active" },
  { id: 3, name: "Industrial High Load", rate: "1.20", effective: "2026-05-01", version: 1, status: "Active" },
  { id: 4, name: "Agricultural", rate: "0.75", effective: "2026-04-01", version: 1, status: "Inactive" }
]

const VERSIONS = [
  { ver: 3, tariff: "Residential Standard", date: "2026-07-01", changes: "Rate updated from 1.50 to 1.75", author: "admin" },
  { ver: 2, tariff: "Residential Standard", date: "2026-03-15", changes: "Tier thresholds adjusted", author: "manager" },
  { ver: 1, tariff: "Residential Standard", date: "2025-12-01", changes: "Initial version", author: "system" },
  { ver: 2, tariff: "Commercial General", date: "2026-06-15", changes: "Rate updated from 2.25 to 2.50", author: "admin" }
]

const ASSIGNMENTS = [
  { id: 1, meter: "MTR-001", tariff: "Residential Standard", area: "October", status: "Applied" },
  { id: 2, meter: "MTR-002", tariff: "Residential Standard", area: "October", status: "Applied" },
  { id: 3, meter: "MTR-015", tariff: "Commercial General", area: "New Cairo", status: "Applied" },
  { id: 4, meter: "MTR-042", tariff: "Industrial High Load", area: "SODIC", status: "Pending" },
  { id: 5, meter: "MTR-088", tariff: "Residential Standard", area: "October", status: "Applied" }
]

const EVENT_LOG = [
  { time: "2026-07-27 09:12:33", event: "Tariff v3 published", user: "admin" },
  { time: "2026-07-27 08:45:00", event: "Charge type 'Service Fee' added", user: "admin" },
  { time: "2026-07-26 23:59:00", event: "Scheduled tariff update completed", user: "system" },
  { time: "2026-07-26 16:20:15", event: "MTR-042 assigned to Industrial tariff", user: "manager" }
]

const ERROR_LOG = [
  { time: "2026-07-27 06:30:22", error: "Tariff sync failed for area SODIC", severity: "High" },
  { time: "2026-07-26 19:15:00", error: "Rate calculation overflow on meter MTR-088", severity: "Medium" },
  { time: "2026-07-26 03:00:11", error: "Version rollback detected - manual intervention required", severity: "Critical" }
]

export default function TariffSettingsPage() {
  const [tab, setTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")

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

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = { Active: "#22c55e", Applied: "#22c55e", Inactive: "#ef4444", Pending: "#f59e0b", High: "#f59e0b", Medium: "#3b82f6", Critical: "#ef4444" }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
        style={{ backgroundColor: colors[s] + "18", color: colors[s] }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[s] }} />
        {s}
      </span>
    )
  }

  const actionButtons = () => (
    <div className="flex gap-2">
      <button className="px-3 py-1 text-xs font-semibold rounded-lg border transition-all hover:opacity-80"
        style={{ borderColor: "var(--border-default)", color: "var(--brand)" }}>Edit</button>
      <button className="px-3 py-1 text-xs font-semibold rounded-lg border transition-all hover:opacity-80"
        style={{ borderColor: "var(--border-default)", color: "#ef4444" }}>Delete</button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Tariff Settings</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p>
        </div>
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0" /></svg>
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

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={tab}
        className="rounded-2xl border p-6" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>

        {tab === 0 && (
          <>
            <SectionHeader title="Charge Types" onAdd={() => {}} />
            {renderTable(
              ["ID", "Name", "Type", "Rate", "Status", "Actions"],
              CHARGE_TYPES.map(c => [c.id, c.name, c.type, c.rate, statusBadge(c.status), actionButtons()])
            )}
          </>
        )}

        {tab === 1 && (
          <>
            <SectionHeader title="Tariff Setup" onAdd={() => {}} />
            {renderTable(
              ["ID", "Name", "Rate (EGP)", "Effective Date", "Version", "Status", "Actions"],
              TARIFFS.map(t => [t.id, t.name, t.rate, t.effective, `v${t.version}`, statusBadge(t.status), actionButtons()])
            )}
          </>
        )}

        {tab === 2 && (
          <>
            <SectionHeader title="Version History" />
            {renderTable(
              ["Version", "Tariff", "Date", "Changes", "Author"],
              VERSIONS.map(v => [`v${v.ver}`, v.tariff, v.date, v.changes, v.author])
            )}
          </>
        )}

        {tab === 3 && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Main Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Default Currency", value: "EGP" },
                { label: "Tax Rate (%)", value: "14" },
                { label: "Rounding Precision", value: "2 decimals" },
                { label: "Auto-approve New Tariffs", value: true as boolean | string, type: "toggle" as const },
                { label: "Notification on Rate Change", value: true as boolean | string, type: "toggle" as const },
                { label: "Max Versions Retained", value: "10" }
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
            <button className="px-4 py-2 text-xs font-semibold rounded-lg text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "var(--brand)" }}>Save Settings</button>
          </div>
        )}

        {tab === 4 && (
          <>
            <SectionHeader title="Assign to Meter" onAdd={() => {}} />
            {renderTable(
              ["ID", "Meter", "Tariff", "Area", "Status", "Actions"],
              ASSIGNMENTS.map(a => [a.id, a.meter, a.tariff, a.area, statusBadge(a.status), actionButtons()])
            )}
          </>
        )}

        {tab === 5 && (
          <>
            <SectionHeader title="Event Log" />
            {renderTable(
              ["Timestamp", "Event", "User"],
              EVENT_LOG.map(e => [e.time, e.event, e.user])
            )}
          </>
        )}

        {tab === 6 && (
          <>
            <SectionHeader title="Error Log" />
            {renderTable(
              ["Timestamp", "Error", "Severity"],
              ERROR_LOG.map(e => [e.time, e.error, statusBadge(e.severity)])
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}
