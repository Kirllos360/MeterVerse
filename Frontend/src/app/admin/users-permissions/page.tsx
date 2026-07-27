"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const TABS = [
  { id: "0", label: "User Settings" },
  { id: "1", label: "User Groups" },
  { id: "2", label: "Main Settings" },
  { id: "3", label: "Group Profiles" },
  { id: "4", label: "User Profiles" },
  { id: "5", label: "Permission Settings" },
  { id: "6", label: "Event Log" },
  { id: "7", label: "Error Log" }
]

const USERS = [
  { name: "Ahmed Hassan", email: "ahmed@example.com", role: "Admin", status: "Active", lastLogin: "2026-07-27 08:00" },
  { name: "Mona Ali", email: "mona@example.com", role: "Operator", status: "Active", lastLogin: "2026-07-26 14:30" },
  { name: "Khaled Omar", email: "khaled@example.com", role: "Viewer", status: "Active", lastLogin: "2026-07-25 11:00" },
  { name: "Sara Nabil", email: "sara@example.com", role: "Operator", status: "Inactive", lastLogin: "2026-07-10 09:00" },
  { name: "Omar Youssef", email: "omar@example.com", role: "Admin", status: "Active", lastLogin: "2026-07-27 07:45" }
]

const USER_GROUPS = [
  { name: "System Administrators", members: 3, permissions: "Full Access" },
  { name: "Data Operators", members: 8, permissions: "Read/Write Meters" },
  { name: "Viewers", members: 15, permissions: "Read Only" },
  { name: "Billing Team", members: 5, permissions: "Billing Admin" },
  { name: "Auditors", members: 2, permissions: "Audit Logs" }
]

const GROUP_PROFILES = [
  { profile: "Admin Profile", group: "System Administrators", permissions: "ALL", priority: 1 },
  { profile: "Operator Profile", group: "Data Operators", permissions: "Meter:CRUD, Reading:R", priority: 2 },
  { profile: "Viewer Profile", group: "Viewers", permissions: "Meter:R, Report:R", priority: 3 },
  { profile: "Billing Profile", group: "Billing Team", permissions: "Payment:CRUD, Invoice:CRUD", priority: 2 }
]

const USER_PROFILES = [
  { name: "Ahmed Hassan", dept: "IT", role: "Admin", mfa: true, lastAccess: "2m ago" },
  { name: "Mona Ali", dept: "Operations", role: "Operator", mfa: false, lastAccess: "1h ago" },
  { name: "Khaled Omar", dept: "Finance", role: "Viewer", mfa: false, lastAccess: "1d ago" }
]

const EVENTS = [
  { ts: "2026-07-27 08:00:00", action: "USER_CREATE", detail: "Created user Omar Youssef", user: "admin" },
  { ts: "2026-07-26 16:00:00", action: "GROUP_MODIFY", detail: "Updated Viewer permissions", user: "admin" },
  { ts: "2026-07-25 12:00:00", action: "PERMISSION_CHANGE", detail: "Granted Meter:CRUD to Operators", user: "admin" },
  { ts: "2026-07-24 10:00:00", action: "USER_DEACTIVATE", detail: "Deactivated Sara Nabil", user: "system" }
]

const ERRORS = [
  { ts: "2026-07-27 07:30:00", severity: "ERROR", message: "Permission denied: user lacks Meter:DELETE", source: "AuthZ" },
  { ts: "2026-07-26 21:00:00", severity: "WARN", message: "Password change required for 3 users", source: "Security" },
  { ts: "2026-07-26 14:00:00", severity: "ERROR", message: "Duplicate group name 'Data Operators'", source: "Groups" },
  { ts: "2026-07-25 09:00:00", severity: "INFO", message: "MFA enrollment reminder sent to 12 users", source: "Auth" }
]

export default function UsersPermissionsPage() {
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
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Users & Permissions</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p>
        </div>
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z" /></svg>
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
              <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 rounded-xl border px-3 py-2 text-xs outline-none"
                style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
              <button className="rounded-xl px-3 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>+ Add User</button>
            </div>
            {table(["Name", "Email", "Role", "Status", "Last Login"], USERS.filter(u => u.name.toLowerCase().includes(search.toLowerCase())).map(u => [
              u.name, u.email,
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: u.role === "Admin" ? "rgba(168,85,247,0.1)" : u.role === "Operator" ? "rgba(59,130,246,0.1)" : "rgba(107,114,128,0.1)", color: u.role === "Admin" ? "#a855f7" : u.role === "Operator" ? "#3b82f6" : "#6b7280" }}>{u.role}</span>,
              <span className={`px-2 py-0.5 rounded-full text-xs ${u.status === "Active" ? "text-green-500" : "text-gray-400"}`} style={{ backgroundColor: u.status === "Active" ? "rgba(34,197,94,0.1)" : "rgba(156,163,175,0.1)" }}>{u.status}</span>,
              u.lastLogin
            ]))}
          </motion.div>
        )}
        {tab === 1 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Group Name", "Members", "Permissions"], USER_GROUPS.map(g => [g.name, String(g.members), g.permissions]))}</motion.div>}
        {tab === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg space-y-4">
            <div><label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Session Timeout (min)</label><input type="number" defaultValue={60} className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} /></div>
            <div><label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Max Login Attempts</label><input type="number" defaultValue={5} className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} /></div>
            <div className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded" /><span className="text-xs" style={{ color: "var(--text-secondary)" }}>Enforce MFA</span></div>
            <button className="rounded-xl px-4 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>Save Settings</button>
          </motion.div>
        )}
        {tab === 3 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Profile", "Group", "Permissions", "Priority"], GROUP_PROFILES.map(p => [p.profile, p.group, <code className="px-2 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: "var(--border-default)", color: "var(--text-primary)" }}>{p.permissions}</code>, String(p.priority)]))}</motion.div>}
        {tab === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {USER_PROFILES.map(p => (
                <div key={p.name} className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                  <div className="w-10 h-10 rounded-full mb-3 flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: "var(--brand)" }}>{p.name.split(" ").map(n => n[0]).join("")}</div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{p.dept} · {p.role}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span className={`inline-block w-2 h-2 rounded-full ${p.mfa ? "bg-green-500" : "bg-gray-400"}`} />
                    MFA {p.mfa ? "Enabled" : "Disabled"}
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Last access: {p.lastAccess}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {tab === 5 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}><th className="pb-3 pr-4 font-semibold">Resource</th><th className="pb-3 pr-4 font-semibold">Admin</th><th className="pb-3 pr-4 font-semibold">Operator</th><th className="pb-3 pr-4 font-semibold">Viewer</th><th className="pb-3 font-semibold">Billing</th></tr></thead>
                <tbody>
                  {[
                    ["Meters", "CRUD", "CRUD", "R", "R"],
                    ["Readings", "CRUD", "R", "R", "R"],
                    ["Customers", "CRUD", "R", "—", "R"],
                    ["Payments", "CRUD", "—", "—", "CRUD"],
                    ["Reports", "CRUD", "R", "R", "CRUD"],
                    ["Users", "CRUD", "—", "—", "—"]
                  ].map((row) => (
                    <tr key={row[0]} className="border-b" style={{ borderColor: "var(--border-default)" }}>
                      <td className="py-3 pr-4 font-medium" style={{ color: "var(--text-primary)" }}>{row[0]}</td>
                      {row.slice(1).map((perm, ci) => (
                        <td key={ci} className="py-3 pr-4"><span className="px-2 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: perm === "CRUD" ? "rgba(34,197,94,0.1)" : perm === "R" ? "rgba(59,130,246,0.1)" : "rgba(156,163,175,0.1)", color: perm === "CRUD" ? "#22c55e" : perm === "R" ? "#3b82f6" : "#9ca3af" }}>{perm}</span></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        {tab === 6 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Timestamp", "Action", "Detail", "User"], EVENTS.map(e => [e.ts, <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{e.action}</span>, e.detail, e.user]))}</motion.div>}
        {tab === 7 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Time", "Severity", "Message", "Source"], ERRORS.map(e => [e.ts, <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${sevColor(e.severity)}20`, color: sevColor(e.severity) }}>{e.severity}</span>, e.message, e.source]))}</motion.div>}
      </div>
    </div>
  )
}
