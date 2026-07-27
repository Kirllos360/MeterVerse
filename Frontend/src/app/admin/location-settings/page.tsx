"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const TABS = [
  { id: "0", label: "Area Settings" },
  { id: "1", label: "Project Settings" },
  { id: "2", label: "Unit Zones" },
  { id: "3", label: "Unit Types" },
  { id: "4", label: "Main Settings" },
  { id: "5", label: "Event Log" }
]

const AREAS = [
  { code: "OCT", name: "October", projects: 12, status: "Active" },
  { code: "NCR", name: "New Cairo", projects: 8, status: "Active" },
  { code: "SOD", name: "SODIC", projects: 6, status: "Active" },
  { code: "ZED", name: "Zayed", projects: 4, status: "Inactive" },
  { code: "NOR", name: "North Coast", projects: 3, status: "Pending" }
]

const PROJECTS = [
  { id: 1, name: "Palm Hills October A", area: "October", units: 240, status: "Active" },
  { id: 2, name: "Palm Hills October B", area: "October", units: 180, status: "Active" },
  { id: 3, name: "New Cairo Village", area: "New Cairo", units: 320, status: "Active" }
]

const ZONES = [
  { id: 1, name: "Zone A - Residential", units: 120 },
  { id: 2, name: "Zone B - Commercial", units: 45 },
  { id: 3, name: "Zone C - Mixed Use", units: 78 },
  { id: 4, name: "Zone D - Villa Complex", units: 34 }
]

const UNIT_TYPES = [
  { id: 1, type: "Residential", count: 520, meterType: "Single Phase" },
  { id: 2, type: "Commercial", count: 89, meterType: "Three Phase" },
  { id: 3, type: "Industrial", count: 23, meterType: "CT Connected" },
  { id: 4, type: "Villa", count: 156, meterType: "Single Phase" }
]

const EVENT_LOG = [
  { time: "2026-07-27 08:23:11", event: "Area OCT added", user: "admin" },
  { time: "2026-07-27 07:15:44", event: "Zone C configuration updated", user: "admin" },
  { time: "2026-07-26 22:00:00", event: "Daily sync completed", user: "system" },
  { time: "2026-07-26 14:30:18", event: "Unit Type Industrial added", user: "manager" },
  { time: "2026-07-26 10:12:05", event: "Project Palm Hills B activated", user: "admin" }
]

const LABEL_STYLE = "text-xs font-medium" as const
const LABEL_COLOR = { color: "var(--text-secondary)" } as const

export default function LocationSettingsPage() {
  const [tab, setTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")

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
    const colors: Record<string, string> = { Active: "#22c55e", Inactive: "#ef4444", Pending: "#f59e0b" }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
        style={{ backgroundColor: colors[s] + "18", color: colors[s] }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[s] }} />
        {s}
      </span>
    )
  }

  const actionButtons = (id?: number) => (
    <div className="flex gap-2">
      <button className="px-3 py-1 text-xs font-semibold rounded-lg border transition-all hover:opacity-80"
        style={{ borderColor: "var(--border-default)", color: "var(--brand)" }}>Edit</button>
      <button className="px-3 py-1 text-xs font-semibold rounded-lg border transition-all hover:opacity-80"
        style={{ borderColor: "var(--border-default)", color: "#ef4444" }}>Delete</button>
    </div>
  )

  const SectionHeader = ({ title, onAdd }: { title: string; onAdd?: () => void }) => (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{title}</h3>
      <div className="flex gap-2">
        <div className="relative">
          <input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-40 px-3 py-1.5 text-xs rounded-lg border outline-none"
            style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
        </div>
        {onAdd && <button onClick={onAdd}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-all hover:opacity-90"
          style={{ backgroundColor: "var(--brand)" }}>+ Add</button>}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Location Settings</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p>
        </div>
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
            <SectionHeader title="Area Settings" onAdd={() => {}} />
            {renderTable(
              ["Code", "Name", "Projects", "Status", "Actions"],
              AREAS.map(a => [a.code, a.name, a.projects, statusBadge(a.status), actionButtons()])
            )}
          </>
        )}

        {tab === 1 && (
          <>
            <SectionHeader title="Project Settings" onAdd={() => {}} />
            {renderTable(
              ["ID", "Name", "Area", "Units", "Status", "Actions"],
              PROJECTS.map(p => [p.id, p.name, p.area, p.units, statusBadge(p.status), actionButtons(p.id)])
            )}
          </>
        )}

        {tab === 2 && (
          <>
            <SectionHeader title="Unit Zones" onAdd={() => {}} />
            {renderTable(
              ["ID", "Zone Name", "Units", "Actions"],
              ZONES.map(z => [z.id, z.name, z.units, actionButtons(z.id)])
            )}
          </>
        )}

        {tab === 3 && (
          <>
            <SectionHeader title="Unit Types" onAdd={() => {}} />
            {renderTable(
              ["ID", "Type", "Unit Count", "Meter Type", "Actions"],
              UNIT_TYPES.map(u => [u.id, u.type, u.count, u.meterType, actionButtons(u.id)])
            )}
          </>
        )}

        {tab === 4 && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Main Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Default Country", type: "text", value: "Egypt" },
                { label: "Default City", type: "text", value: "Cairo" },
                { label: "Timezone", type: "select", value: "Africa/Cairo" },
                { label: "Auto-sync Interval", type: "select", value: "24 hours" },
                { label: "Max Projects Per Area", type: "number", value: "50" },
                { label: "Enable Geocoding", type: "toggle" as const, value: true }
              ].map((f, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <span className={LABEL_STYLE} style={LABEL_COLOR}>{f.label}</span>
                  {f.type === "toggle" ? (
                    <div className="w-10 h-5 rounded-full transition-all cursor-pointer"
                      style={{ backgroundColor: f.value ? "var(--brand)" : "var(--border-default)" }} />
                  ) : f.type === "select" ? (
                    <select className="px-3 py-1.5 text-xs rounded-lg border outline-none"
                      style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
                      <option>{f.value}</option>
                    </select>
                  ) : (
                    <input type={f.type} defaultValue={String(f.value)}
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

        {tab === 5 && (
          <>
            <SectionHeader title="Event Log" />
            {renderTable(
              ["Timestamp", "Event", "User"],
              EVENT_LOG.map(e => [e.time, e.event, e.user])
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}
