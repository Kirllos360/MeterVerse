"use client"

import { useState } from "react"

interface AuditEntry {
  id: string; timestamp: string; actor: string; action: string; resource: string; status: "success" | "failure"
}

const MOCK_AUDIT: AuditEntry[] = Array.from({ length: 20 }, (_, i) => ({
  id: `audit_${i}`, timestamp: new Date(Date.now() - i * 60000).toISOString(),
  actor: ["admin@meterverse.com", "operator@meterverse.com", "system"][i % 3],
  action: ["user.login", "invoice.generate", "meter.assign", "reading.import", "customer.update"][i % 5],
  resource: ["User #1", "Invoice #INV-001", "Meter #M-123", "Batch #B-001", "Customer #C-001"][i % 5],
  status: i % 5 === 0 ? "failure" : "success",
}))

export function AuditViewer() {
  const [search, setSearch] = useState("")
  const [entries] = useState(MOCK_AUDIT)

  const filtered = search ? entries.filter((e) =>
    e.actor.includes(search) || e.action.includes(search) || e.resource.includes(search)
  ) : entries

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-default)" }}>
      <div className="px-4 py-2.5 border-b" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-raised)" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search audit log..." className="w-full px-3 py-1.5 rounded-lg border text-xs outline-none focus:border-[var(--brand-primary)] transition-colors" style={{ backgroundColor: "var(--surface-sunken)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
      </div>
      <div style={{ backgroundColor: "var(--surface-base)" }}>
        {filtered.map((e) => (
          <div key={e.id} className="flex items-center gap-3 px-4 py-2 border-b text-xs" style={{ borderColor: "var(--border-default)" }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: e.status === "success" ? "var(--status-success)" : "var(--status-error)" }} />
            <span className="w-32 shrink-0 font-mono text-[10px]" style={{ color: "var(--text-tertiary)" }}>{new Date(e.timestamp).toLocaleTimeString()}</span>
            <span className="w-36 shrink-0 truncate" style={{ color: "var(--text-secondary)" }}>{e.actor}</span>
            <span className="w-32 shrink-0 truncate font-medium" style={{ color: "var(--text-primary)" }}>{e.action}</span>
            <span className="flex-1 truncate" style={{ color: "var(--text-secondary)" }}>{e.resource}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: e.status === "success" ? "rgba(5,150,105,0.1)" : "rgba(220,38,38,0.1)", color: e.status === "success" ? "var(--status-success)" : "var(--status-error)" }}>{e.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
