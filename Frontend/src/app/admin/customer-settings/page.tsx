"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const TABS = [
  { id: "0", label: "Customer Groups" },
  { id: "1", label: "Customer Types" },
  { id: "2", label: "Transfer Ownership" },
  { id: "3", label: "Event Log" },
  { id: "4", label: "Error Log" }
]

const GROUPS = [
  { name: "Residential", members: 12450, status: "Active", created: "2024-01-15" },
  { name: "Commercial", members: 2340, status: "Active", created: "2024-01-15" },
  { name: "Industrial", members: 312, status: "Active", created: "2024-03-01" },
  { name: "Government", members: 89, status: "Active", created: "2024-06-20" },
  { name: "Trial Users", members: 456, status: "Inactive", created: "2025-09-01" }
]

const TYPES = [
  { name: "Individual", code: "IND", billingCycle: "Monthly", settings: "Standard" },
  { name: "Corporate", code: "CORP", billingCycle: "Quarterly", settings: "Premium" },
  { name: "Subsidized", code: "SUB", billingCycle: "Monthly", settings: "Reduced Rate" },
  { name: "Prepaid", code: "PRE", billingCycle: "Upfront", settings: "Wallet-based" }
]

const EVENTS = [
  { ts: "2026-07-27 08:00:00", action: "GROUP_CREATE", detail: "Created group 'Trial Users'", user: "admin" },
  { ts: "2026-07-26 14:30:00", action: "TYPE_MODIFY", detail: "Updated Corporate billing cycle", user: "admin" },
  { ts: "2026-07-25 11:00:00", action: "OWNER_TRANSFER", detail: "Transferred 12 meters to new owner", user: "operator" },
  { ts: "2026-07-24 09:15:00", action: "GROUP_DELETE", detail: "Removed group 'Test'", user: "admin" }
]

const ERRORS = [
  { ts: "2026-07-27 07:55:00", severity: "ERROR", message: "Transfer failed: invalid customer ID", source: "Ownership" },
  { ts: "2026-07-26 22:10:00", severity: "WARN", message: "Group 'Residential' nearing member limit", source: "Groups" },
  { ts: "2026-07-26 15:00:00", severity: "ERROR", message: "Type code 'IND' already exists", source: "Types" },
  { ts: "2026-07-25 08:30:00", severity: "INFO", message: "Bulk import of 500 customers completed", source: "Import" }
]

export default function CustomerSettingsPage() {
  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState("")
  const [transferFrom, setTransferFrom] = useState("")
  const [transferTo, setTransferTo] = useState("")

  const sevColor = (s: string) => s === "ERROR" ? "#ef4444" : s === "WARN" ? "#f59e0b" : "#3b82f6"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Customer Settings</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p>
        </div>
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /></svg>
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
              <input type="text" placeholder="Search groups..." value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 rounded-xl border px-3 py-2 text-xs outline-none"
                style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
              <button className="rounded-xl px-3 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>+ Add Group</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                    <th className="pb-3 pr-4 font-semibold">Name</th><th className="pb-3 pr-4 font-semibold">Members</th><th className="pb-3 pr-4 font-semibold">Status</th><th className="pb-3 pr-4 font-semibold">Created</th><th className="pb-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {GROUPS.filter(g => g.name.toLowerCase().includes(search.toLowerCase())).map(g => (
                    <tr key={g.name} className="border-b" style={{ borderColor: "var(--border-default)" }}>
                      <td className="py-3 pr-4 font-medium" style={{ color: "var(--text-primary)" }}>{g.name}</td>
                      <td className="py-3 pr-4" style={{ color: "var(--text-secondary)" }}>{g.members.toLocaleString()}</td>
                      <td className="py-3 pr-4"><span className={`px-2 py-0.5 rounded-full text-xs ${g.status === "Active" ? "text-green-500" : "text-gray-400"}`} style={{ backgroundColor: g.status === "Active" ? "rgba(34,197,94,0.1)" : "rgba(156,163,175,0.1)" }}>{g.status}</span></td>
                      <td className="py-3 pr-4" style={{ color: "var(--text-secondary)" }}>{g.created}</td>
                      <td className="py-3"><div className="flex gap-2"><button className="text-xs" style={{ color: "var(--brand)" }}>Edit</button><button className="text-xs" style={{ color: "#ef4444" }}>Delete</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        {tab === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-end mb-4"><button className="rounded-xl px-3 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>+ Add Type</button></div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}><th className="pb-3 pr-4 font-semibold">Name</th><th className="pb-3 pr-4 font-semibold">Code</th><th className="pb-3 pr-4 font-semibold">Billing Cycle</th><th className="pb-3 pr-4 font-semibold">Settings</th><th className="pb-3 font-semibold">Actions</th></tr></thead>
                <tbody>{TYPES.map(t => (
                  <tr key={t.code} className="border-b" style={{ borderColor: "var(--border-default)" }}>
                    <td className="py-3 pr-4 font-medium" style={{ color: "var(--text-primary)" }}>{t.name}</td>
                    <td className="py-3 pr-4 font-mono" style={{ color: "var(--text-secondary)" }}>{t.code}</td>
                    <td className="py-3 pr-4" style={{ color: "var(--text-secondary)" }}>{t.billingCycle}</td>
                    <td className="py-3 pr-4" style={{ color: "var(--text-secondary)" }}>{t.settings}</td>
                    <td className="py-3"><button className="text-xs" style={{ color: "var(--brand)" }}>Edit</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </motion.div>
        )}
        {tab === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>From Customer</label>
              <input type="text" placeholder="Customer ID or Name" value={transferFrom} onChange={e => setTransferFrom(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-xs outline-none"
                style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>To Customer</label>
              <input type="text" placeholder="Customer ID or Name" value={transferTo} onChange={e => setTransferTo(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-xs outline-none"
                style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Items to Transfer</label>
              <select className="w-full rounded-xl border px-3 py-2 text-xs outline-none"
                style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
                <option>All Meters & Contracts</option>
                <option>Meters Only</option>
                <option>Contracts Only</option>
              </select>
            </div>
            <button className="rounded-xl px-4 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>Transfer Ownership</button>
          </motion.div>
        )}
        {tab === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}><th className="pb-3 pr-4 font-semibold">Timestamp</th><th className="pb-3 pr-4 font-semibold">Action</th><th className="pb-3 pr-4 font-semibold">Detail</th><th className="pb-3 font-semibold">User</th></tr></thead>
                <tbody>{EVENTS.map((e, i) => (
                  <tr key={i} className="border-b" style={{ borderColor: "var(--border-default)" }}>
                    <td className="py-3 pr-4 font-mono" style={{ color: "var(--text-secondary)" }}>{e.ts}</td>
                    <td className="py-3 pr-4"><span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{e.action}</span></td>
                    <td className="py-3 pr-4" style={{ color: "var(--text-primary)" }}>{e.detail}</td>
                    <td className="py-3" style={{ color: "var(--text-secondary)" }}>{e.user}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </motion.div>
        )}
        {tab === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}><th className="pb-3 pr-4 font-semibold">Time</th><th className="pb-3 pr-4 font-semibold">Severity</th><th className="pb-3 pr-4 font-semibold">Message</th><th className="pb-3 font-semibold">Source</th></tr></thead>
                <tbody>{ERRORS.map((e, i) => (
                  <tr key={i} className="border-b" style={{ borderColor: "var(--border-default)" }}>
                    <td className="py-3 pr-4 font-mono" style={{ color: "var(--text-secondary)" }}>{e.ts}</td>
                    <td className="py-3 pr-4"><span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${sevColor(e.severity)}20`, color: sevColor(e.severity) }}>{e.severity}</span></td>
                    <td className="py-3 pr-4" style={{ color: "var(--text-primary)" }}>{e.message}</td>
                    <td className="py-3" style={{ color: "var(--text-secondary)" }}>{e.source}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
