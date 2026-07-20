"use client"

import { useState, useEffect } from "react"

interface ApiKey { id: string; name: string; prefix: string; permissions: string; active: boolean; lastUsedAt: string | null; expiresAt: string | null; createdAt: string }

export default function AdminApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/api-keys").then((r) => r.json()).then((d) => { setKeys(d.keys || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">API Keys</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Manage API access keys — {keys.length} keys</p>
        </div>
        <button className="px-3 py-2 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: "var(--status-error)" }}>Generate Key</button>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-surface)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "var(--admin-surface)" }}>
              {["Name", "Prefix", "Permissions", "Status", "Last Used", "Expires"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)", borderBottom: "1px solid var(--admin-border)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Loading...</td></tr>
            ) : keys.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>No API keys</td></tr>
            ) : keys.map((k) => (
              <tr key={k.id}>
                <td className="px-4 py-3 text-sm" style={{ color: "rgba(255,255,255,0.7)", borderBottom: "1px solid var(--admin-border)" }}>{k.name}</td>
                <td className="px-4 py-3 text-sm font-mono" style={{ color: "rgba(255,255,255,0.5)", borderBottom: "1px solid var(--admin-border)" }}>{k.prefix}...</td>
                <td className="px-4 py-3 text-sm" style={{ color: "rgba(255,255,255,0.7)", borderBottom: "1px solid var(--admin-border)" }}>{k.permissions}</td>
                <td className="px-4 py-3 text-sm" style={{ color: k.active ? "#DC2626" : "rgba(255,255,255,0.3)", borderBottom: "1px solid var(--admin-border)" }}>{k.active ? "Active" : "Inactive"}</td>
                <td className="px-4 py-3 text-sm" style={{ color: "rgba(255,255,255,0.4)", borderBottom: "1px solid var(--admin-border)" }}>{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never"}</td>
                <td className="px-4 py-3 text-sm" style={{ color: "rgba(255,255,255,0.4)", borderBottom: "1px solid var(--admin-border)" }}>{k.expiresAt ? new Date(k.expiresAt).toLocaleDateString() : "Never"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

