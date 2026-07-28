"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getUsers, getRoles, getEvents, getErrors, saveSetting } from "@/features/admin-settings/api/service"

const TABS = [{ id: "0", label: "User Settings" }, { id: "1", label: "User Groups" }, { id: "2", label: "Main Settings" }, { id: "3", label: "Group Profiles" }, { id: "4", label: "User Profiles" }, { id: "5", label: "Permission Settings" }, { id: "6", label: "Event Log" }, { id: "7", label: "Error Log" }]

export default function UsersPermissionsPage() {
  const [tab, setTab] = useState(0)
  const [users, setUsers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [errors, setErrors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getUsers().catch(() => ({ users: [] })),
      getRoles().catch(() => ({ roles: [] })),
      getEvents("user", 10).catch(() => ({ events: [] })),
      getErrors("user", 10).catch(() => ({ errors: [] })),
    ]).then(([u, r, ev, er]) => { setUsers(u.users); setRoles(r.roles); setEvents(ev.events); setErrors(er.errors); setLoading(false) })
  }, [])
  const [sessionTimeout, setSessionTimeout] = useState(30)
  const [mfaEnforcement, setMfaEnforcement] = useState("All Users")
  const [saving, setSaving] = useState(false)
  const handleSave = async () => { setSaving(true); try { await Promise.all([saveSetting("user_session_timeout", String(sessionTimeout), "user"), saveSetting("user_mfa_enforcement", mfaEnforcement, "user")]) } catch {} finally { setSaving(false) } }

  const table = (headers: string[], rows: (string | React.ReactNode)[][], kIdx = 0) => (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead><tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
          {headers.map((h, i) => <th key={i} className={`pb-3 font-semibold ${i < headers.length - 1 ? "pr-4" : ""}`}>{h}</th>)}
        </tr></thead>
        <tbody>{rows.map((row, ri) => (
          <tr key={ri} className="border-b" style={{ borderColor: "var(--border-default)" }}>
            {row.map((cell, ci) => <td key={ci} className={`py-3 ${ci < row.length - 1 ? "pr-4" : ""}`} style={{ color: ci === kIdx ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: ci === kIdx ? 600 : 400 }}>{cell}</td>)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
  const sevColor = (s: string) => s === "ERROR" || s === "error" ? "#ef4444" : s === "WARN" || s === "warn" ? "#f59e0b" : "#3b82f6"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Users & Permissions</h1><p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p></div>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>System Users</h3>
            {users.length === 0 ? <p className="text-xs py-4" style={{ color: "var(--text-secondary)" }}>No users found</p> : table(["Name", "Email", "Role", "Status", "Last Login"], users.map((u: any) => [u.name, u.email, u.roleRel?.name || u.role, <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: u.status === "active" ? "rgba(34,197,94,0.1)" : "rgba(156,163,175,0.1)", color: u.status === "active" ? "#22c55e" : "#6b7280" }}>{u.status}</span>, u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "—"]))}
          </motion.div>
        )}
        {!loading && tab === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Roles</h3>
            {roles.length === 0 ? <p className="text-xs py-4" style={{ color: "var(--text-secondary)" }}>No roles configured</p> : table(["Name", "Users", "Description"], roles.map((r: any) => [r.name, String(r._count?.users || 0), r.description || "—"]))}
          </motion.div>
        )}
        {!loading && tab === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg space-y-4">
            <div><label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Session Timeout (min)</label><input type="number" value={sessionTimeout} onChange={e => setSessionTimeout(Number(e.target.value))} className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} /></div>
            <div><label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>MFA Enforcement</label><select value={mfaEnforcement} onChange={e => setMfaEnforcement(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}><option>All Users</option><option>Admins Only</option><option>Disabled</option></select></div>
            <button onClick={handleSave} disabled={saving} className="rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-50" style={{ backgroundColor: "var(--brand)" }}>{saving ? "Saving..." : "Save"}</button>
          </motion.div>
        )}
        {!loading && tab === 3 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{roles.length} roles available with permissions</p>
        </motion.div>}
        {!loading && tab === 4 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {users.length === 0 ? <p className="text-xs py-4" style={{ color: "var(--text-secondary)" }}>No user profiles</p> : table(["Name", "Email", "Role", "Status"], users.map((u: any) => [u.name, u.email, u.role, <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: u.status === "active" ? "rgba(34,197,94,0.1)" : "rgba(156,163,175,0.1)", color: u.status === "active" ? "#22c55e" : "#6b7280" }}>{u.status}</span>]))}
        </motion.div>}
        {!loading && tab === 5 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Permission settings available per role</p>
        </motion.div>}
        {!loading && tab === 6 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Time", "Action", "Resource"], events.map((e: any) => [new Date(e.createdAt).toLocaleString(), <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{e.action}</span>, e.resource || "—"]))}</motion.div>}
        {!loading && tab === 7 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Time", "Severity", "Action"], errors.map((e: any) => [new Date(e.createdAt).toLocaleString(), <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${sevColor(e.severity)}20`, color: sevColor(e.severity) }}>{e.severity.toUpperCase()}</span>, e.action]))}</motion.div>}
      </div>
    </div>
  )
}
