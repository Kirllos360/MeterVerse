"use client"

import { useState, useEffect } from "react"

interface Session { id: string; userId: string; ip: string | null; userAgent: string | null; device: string | null; location: string | null; isActive: boolean; lastUsedAt: string; createdAt: string; user: { id: string; name: string; email: string } }

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/sessions").then((r) => r.json()).then((d) => { setSessions(d.sessions || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const revokeSession = async (id: string) => {
    const res = await fetch(`/api/admin/sessions/${id}`, { method: "DELETE" })
    if (res.ok) setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-white">Active Sessions</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Monitor and manage user sessions — {sessions.length} active</p>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-surface)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "var(--admin-surface)" }}>
              {["User", "IP", "Device", "Last Used", "Created", "Action"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)", borderBottom: "1px solid var(--admin-border)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Loading...</td></tr>
            ) : sessions.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>No active sessions</td></tr>
            ) : sessions.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 text-sm" style={{ color: "rgba(255,255,255,0.7)", borderBottom: "1px solid var(--admin-border)" }}>
                  <div>{s.user?.name || "Unknown"}</div>
                  <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{s.user?.email}</div>
                </td>
                <td className="px-4 py-3 text-sm font-mono" style={{ color: "rgba(255,255,255,0.5)", borderBottom: "1px solid var(--admin-border)" }}>{s.ip || "—"}</td>
                <td className="px-4 py-3 text-sm" style={{ color: "rgba(255,255,255,0.5)", borderBottom: "1px solid var(--admin-border)" }}>{s.device || s.userAgent?.substring(0, 30) || "—"}</td>
                <td className="px-4 py-3 text-sm" style={{ color: "rgba(255,255,255,0.4)", borderBottom: "1px solid var(--admin-border)" }}>{new Date(s.lastUsedAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm" style={{ color: "rgba(255,255,255,0.4)", borderBottom: "1px solid var(--admin-border)" }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm" style={{ borderBottom: "1px solid var(--admin-border)" }}>
                  <button onClick={() => revokeSession(s.id)} className="text-[10px] px-2 py-1 rounded font-medium" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#EF4444" }}>Revoke</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
