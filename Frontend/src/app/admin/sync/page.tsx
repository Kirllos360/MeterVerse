"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const waveAnim = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

interface SyncStatus {
  area: string
  db: string
  lastSync: string
  status: "healthy" | "warning" | "error" | "syncing"
  rowsSynced: number
  errors: number
}

interface SyncJob {
  id: string
  area: string
  startedAt: string
  finishedAt: string | null
  status: string
  rowsProcessed: number
}

const MOCK_STATUS: SyncStatus[] = [
  { area: "October", db: "PalmHills_October", lastSync: "2026-07-26 06:45:12", status: "healthy", rowsSynced: 152340, errors: 0 },
  { area: "New Cairo", db: "PalmHills_NewCairo", lastSync: "2026-07-26 06:44:58", status: "healthy", rowsSynced: 98720, errors: 0 },
  { area: "SODIC", db: "SODIC", lastSync: "2026-07-26 06:30:00", status: "warning", rowsSynced: 45210, errors: 3 },
]

const MOCK_JOBS: SyncJob[] = [
  { id: "J001", area: "October", startedAt: "2026-07-26 06:00:00", finishedAt: "2026-07-26 06:45:12", status: "success", rowsProcessed: 152340 },
  { id: "J002", area: "New Cairo", startedAt: "2026-07-26 06:00:00", finishedAt: "2026-07-26 06:44:58", status: "success", rowsProcessed: 98720 },
  { id: "J003", area: "SODIC", startedAt: "2026-07-26 06:00:00", finishedAt: "2026-07-26 06:30:00", status: "warning", rowsProcessed: 45210 },
  { id: "J004", area: "October", startedAt: "2026-07-25 06:00:00", finishedAt: "2026-07-25 06:42:30", status: "success", rowsProcessed: 151900 },
  { id: "J005", area: "New Cairo", startedAt: "2026-07-25 06:00:00", finishedAt: "2026-07-25 06:43:15", status: "success", rowsProcessed: 98500 },
]

const STATUS_ICONS: Record<string, string> = {
  healthy: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  warning: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
  error: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  syncing: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
}

const STATUS_COLORS: Record<string, string> = {
  healthy: "#059669",
  warning: "#D97706",
  error: "#DC2626",
  syncing: "#2563EB",
}

export default function AdminSyncPage() {
  const [statuses] = useState<SyncStatus[]>(MOCK_STATUS)
  const [jobs] = useState<SyncJob[]>(MOCK_JOBS)
  const [syncing, setSyncing] = useState(false)

  function handleManualSync() {
    setSyncing(true)
    setTimeout(() => setSyncing(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Data Sync Dashboard</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Monitor and trigger sync jobs across all areas</p>
        </div>
        <motion.div animate={waveAnim} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </motion.div>
      </div>

      {/* Sync Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statuses.map((s, i) => (
          <motion.div key={s.area} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.status] }} />
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{s.area}</span>
              </div>
              <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>{s.db}</span>
            </div>
            <div className="space-y-1 text-xs" style={{ color: "var(--text-secondary)" }}>
              <div className="flex justify-between"><span>Last Sync</span><span className="font-mono">{s.lastSync}</span></div>
              <div className="flex justify-between"><span>Rows Synced</span><span className="font-mono">{s.rowsSynced.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Errors</span><span className="font-mono" style={{ color: s.errors > 0 ? STATUS_COLORS.error : "inherit" }}>{s.errors}</span></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Manual Sync Trigger */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-2xl border p-5 flex items-center justify-between" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <div>
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Manual Sync Trigger</span>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Start an immediate full sync across all areas</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={syncing} onClick={handleManualSync}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-50"
          style={{ backgroundColor: syncing ? "var(--text-secondary)" : "var(--brand)" }}>
          {syncing ? "Syncing..." : "Trigger Sync"}
        </motion.button>
      </motion.div>

      {/* Sync Job History */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <div className="px-5 py-3 border-b text-sm font-bold" style={{ color: "var(--text-primary)", borderColor: "var(--border-default)" }}>Sync Job History</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border-default)" }}>
                <th className="text-left px-5 py-2 font-semibold">Job ID</th>
                <th className="text-left px-5 py-2 font-semibold">Area</th>
                <th className="text-left px-5 py-2 font-semibold">Started</th>
                <th className="text-left px-5 py-2 font-semibold">Finished</th>
                <th className="text-left px-5 py-2 font-semibold">Status</th>
                <th className="text-right px-5 py-2 font-semibold">Rows</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} className="border-t" style={{ borderColor: "var(--border-default)" }}>
                  <td className="px-5 py-2.5 font-mono" style={{ color: "var(--text-primary)" }}>{j.id}</td>
                  <td className="px-5 py-2.5" style={{ color: "var(--text-primary)" }}>{j.area}</td>
                  <td className="px-5 py-2.5 font-mono" style={{ color: "var(--text-secondary)" }}>{j.startedAt}</td>
                  <td className="px-5 py-2.5 font-mono" style={{ color: "var(--text-secondary)" }}>{j.finishedAt || "—"}</td>
                  <td className="px-5 py-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: j.status === "success" ? "rgba(5,150,105,0.1)" : "rgba(217,119,6,0.1)", color: j.status === "success" ? "#059669" : "#D97706" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: j.status === "success" ? "#059669" : "#D97706" }} />
                      {j.status}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono" style={{ color: "var(--text-primary)" }}>{j.rowsProcessed.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
