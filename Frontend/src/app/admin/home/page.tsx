"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const TABS = [
  { id: "0", label: "System Health" },
  { id: "1", label: "Database Health" },
  { id: "2", label: "Connection Status" },
  { id: "3", label: "DB Size" },
  { id: "4", label: "User Counters" }
]

const STAT_CARDS = [
  { label: "Total Projects", value: "12", change: "+2", color: "#22c55e" },
  { label: "Total Areas", value: "8", change: "+1", color: "#3b82f6" },
  { label: "Active Connections", value: "47", change: "+5", color: "#a855f7" },
  { label: "DB Size", value: "2.4 TB", change: "+120 GB", color: "#f59e0b" },
  { label: "Users Online", value: "1,342", change: "+89", color: "#06b6d4" }
]

const CONNECTIONS = [
  { name: "PalmHills_October", status: "Online", latency: "12ms", lastSeen: "Just now", area: "October" },
  { name: "PalmHills_NewCairo", status: "Online", latency: "8ms", lastSeen: "1m ago", area: "New Cairo" },
  { name: "SODIC", status: "Online", latency: "15ms", lastSeen: "2m ago", area: "SODIC" },
  { name: "Billing_Prod", status: "Online", latency: "21ms", lastSeen: "30s ago", area: "Core" },
  { name: "Archive_2024", status: "Offline", latency: "—", lastSeen: "3h ago", area: "Archive" },
  { name: "Replica_EU", status: "Degraded", latency: "340ms", lastSeen: "5m ago", area: "Replica" }
]

const DB_SIZES = [
  { project: "October", size: 840, unit: "GB", pct: 84 },
  { project: "New Cairo", size: 620, unit: "GB", pct: 62 },
  { project: "SODIC", size: 410, unit: "GB", pct: 41 },
  { project: "Billing", size: 290, unit: "GB", pct: 29 },
  { project: "Archive", size: 180, unit: "GB", pct: 18 }
]

const USER_COUNTERS = [
  { area: "October", users: 412, active: 388 },
  { area: "New Cairo", users: 356, active: 312 },
  { area: "SODIC", users: 289, active: 254 },
  { area: "Billing", users: 145, active: 132 },
  { area: "Admin", users: 89, active: 78 }
]

const statusDot = (s: string) => {
  const color = s === "Online" ? "#22c55e" : s === "Degraded" ? "#f59e0b" : "#ef4444"
  return <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: color }} />
}

export default function HomePage() {
  const [tab, setTab] = useState(0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Home</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p>
        </div>
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              {STAT_CARDS.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                  <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
                  <p className="text-xs mt-1" style={{ color: s.color }}>{s.change} this week</p>
                </motion.div>
              ))}
            </div>
            <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Recent Activity</h3>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>System operating normally. All critical services healthy.</p>
            </div>
          </motion.div>
        )}
        {tab === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Last Backup</p>
                <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>2026-07-27 03:00</p>
              </div>
              <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Integrity Check</p>
                <p className="text-lg font-bold text-green-500">Passed</p>
              </div>
              <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Replication Lag</p>
                <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>0.3s</p>
              </div>
            </div>
          </motion.div>
        )}
        {tab === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                    <th className="pb-3 pr-4 font-semibold">Connection</th>
                    <th className="pb-3 pr-4 font-semibold">Status</th>
                    <th className="pb-3 pr-4 font-semibold">Latency</th>
                    <th className="pb-3 pr-4 font-semibold">Last Seen</th>
                    <th className="pb-3 font-semibold">Area</th>
                  </tr>
                </thead>
                <tbody>
                  {CONNECTIONS.map((c) => (
                    <tr key={c.name} className="border-b" style={{ borderColor: "var(--border-default)" }}>
                      <td className="py-3 pr-4 font-medium" style={{ color: "var(--text-primary)" }}>{c.name}</td>
                      <td className="py-3 pr-4">{statusDot(c.status)}<span>{c.status}</span></td>
                      <td className="py-3 pr-4" style={{ color: "var(--text-secondary)" }}>{c.latency}</td>
                      <td className="py-3 pr-4" style={{ color: "var(--text-secondary)" }}>{c.lastSeen}</td>
                      <td className="py-3" style={{ color: "var(--text-secondary)" }}>{c.area}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        {tab === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-3">
              {DB_SIZES.map((d) => (
                <div key={d.project} className="flex items-center gap-4">
                  <span className="text-xs font-semibold w-24" style={{ color: "var(--text-primary)" }}>{d.project}</span>
                  <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-default)" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${d.pct}%` }} transition={{ duration: 0.8 }}
                      className="h-full rounded-full" style={{ backgroundColor: "var(--brand)", width: `${d.pct}%` }} />
                  </div>
                  <span className="text-xs font-mono w-20 text-right" style={{ color: "var(--text-secondary)" }}>{d.size} {d.unit}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {tab === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                    <th className="pb-3 pr-4 font-semibold">Area</th>
                    <th className="pb-3 pr-4 font-semibold">Total Users</th>
                    <th className="pb-3 font-semibold">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {USER_COUNTERS.map((u) => (
                    <tr key={u.area} className="border-b" style={{ borderColor: "var(--border-default)" }}>
                      <td className="py-3 pr-4 font-medium" style={{ color: "var(--text-primary)" }}>{u.area}</td>
                      <td className="py-3 pr-4" style={{ color: "var(--text-secondary)" }}>{u.users}</td>
                      <td className="py-3"><span className="text-green-500">{u.active}</span><span className="text-xs ml-1" style={{ color: "var(--text-secondary)" }}>({Math.round(u.active / u.users * 100)}%)</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
