"use client"

import { useState, useEffect } from "react"

interface Flag { id: string; key: string; name: string; enabled: boolean; scope: string }

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState<Flag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/feature-flags").then((r) => r.json()).then((d) => { setFlags(d.flags || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const toggleFlag = async (id: string) => {
    const res = await fetch(`/api/admin/feature-flags/${id}`, { method: "PUT" })
    if (res.ok) {
      const d = await res.json()
      setFlags((prev) => prev.map((f) => f.id === id ? { ...f, enabled: d.flag?.enabled ?? !f.enabled } : f))
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-white">Feature Flags</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Toggle system features on/off — {flags.length} flags</p>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-surface)" }}>
        {loading ? (
          <div className="px-4 py-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Loading...</div>
        ) : flags.map((f) => (
          <div key={f.id} className="flex items-center justify-between px-4 py-3 border-b text-xs" style={{ borderColor: "var(--admin-border)" }}>
            <div>
              <div className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>{f.name}</div>
              <div className="text-[10px] font-mono mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{f.key} · {f.scope}</div>
            </div>
            <button onClick={() => toggleFlag(f.id)} className="relative w-10 h-5 rounded-full transition-colors" style={{ backgroundColor: f.enabled ? "#22C55E" : "rgba(255,255,255,0.15)" }}>
              <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: f.enabled ? "22px" : "2px" }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
