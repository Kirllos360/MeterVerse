"use client"

import { useState, useEffect } from "react"

interface AdminUser {
  id: string; name: string; email: string; role: string; status: string; avatar?: string; phone?: string; area?: string; lastActiveAt?: string; createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/admin/users").then((r) => r.json()).then((d) => { setUsers(d.users || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const filtered = search ? users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) : users

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">User Management</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{users.length} users — Manage administrators and system users</p>
        </div>
        <div className="flex items-center gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="px-3 py-2 rounded-lg border text-xs outline-none" style={{ backgroundColor: "var(--admin-surface)", borderColor: "var(--admin-border)", color: "white" }} />
          <button className="px-3 py-2 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: "var(--status-error)" }}>Add User</button>
        </div>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-surface)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "var(--admin-surface)" }}>
              {["Name", "Email", "Role", "Status", "Last Active"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)", borderBottom: "1px solid var(--admin-border)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>No users found</td></tr>
            ) : filtered.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 text-sm" style={{ color: "rgba(255,255,255,0.7)", borderBottom: "1px solid var(--admin-border)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: "rgba(var(--status-error-rgb), 0.2)", color: "var(--status-error)" }}>{u.name.charAt(0).toUpperCase()}</div>
                    {u.name}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: "rgba(255,255,255,0.5)", borderBottom: "1px solid var(--admin-border)" }}>{u.email}</td>
                <td className="px-4 py-3 text-sm" style={{ color: "rgba(255,255,255,0.7)", borderBottom: "1px solid var(--admin-border)" }}>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: "rgba(var(--status-error-rgb), 0.1)", color: "var(--status-error)" }}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: u.status === "active" ? "#DC2626" : "rgba(255,255,255,0.3)", borderBottom: "1px solid var(--admin-border)" }}>{u.status}</td>
                <td className="px-4 py-3 text-sm" style={{ color: "rgba(255,255,255,0.4)", borderBottom: "1px solid var(--admin-border)" }}>{u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleDateString() : "Never"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

