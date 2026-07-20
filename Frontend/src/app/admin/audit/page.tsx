"use client"

import { useState, useEffect } from "react"

interface AuditEntry {
  id: string; timestamp: string; actor: string; action: string; resource: string; status: "success" | "failure"; details?: string; ip?: string
}

export default function AdminAuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/admin/audit").then((r) => r.json()).then((d) => { setEntries(d.entries || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const filtered = search ? entries.filter((e) =>
    e.actor?.includes(search) || e.action?.includes(search) || e.resource?.includes(search)
  ) : entries

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-white">Audit Logs</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>System audit trail — {entries.length} entries</p>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-surface)" }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--admin-border)" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search audit log..." className="w-full px-3 py-2 rounded-lg border text-xs outline-none focus:border-[var(--status-error)] transition-colors" style={{ backgroundColor: "var(--admin-surface)", borderColor: "var(--admin-border)", color: "white" }} />
        </div>
        <div>
          {loading ? (
            <div className="px-4 py-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>No audit entries found</div>
          ) : filtered.map((e) => (
            <div key={e.id} className="flex items-center gap-3 px-4 py-2 border-b text-xs" style={{ borderColor: "var(--admin-border)" }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: e.status === "success" ? "#DC2626" : "#EF4444" }} />
              <span className="w-32 shrink-0 font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{new Date(e.timestamp).toLocaleTimeString()}</span>
              <span className="w-36 shrink-0 truncate" style={{ color: "rgba(255,255,255,0.5)" }}>{e.actor || "system"}</span>
              <span className="w-32 shrink-0 truncate font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>{e.action}</span>
              <span className="flex-1 truncate" style={{ color: "rgba(255,255,255,0.5)" }}>{e.resource || "—"}</span>
              <span className="text-[10px] px-2 py-1 rounded-full font-medium" style={{ backgroundColor: e.status === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: e.status === "success" ? "#DC2626" : "#EF4444" }}>{e.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

