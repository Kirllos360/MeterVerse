"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function OperationsCenterPage() {
  const [stats, setStats] = useState<any>(null)
  const [recentIncidents, setRecentIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/incidents/stats", { headers: { Authorization: "Bearer dev", "X-Dev-Mode": "true" } }).then(r => r.json()).catch(() => null),
      fetch("/api/incidents?limit=10&status=detected", { headers: { Authorization: "Bearer dev", "X-Dev-Mode": "true" } }).then(r => r.json()).catch(() => ({ incidents: [] })),
    ]).then(([s, inc]) => { setStats(s); setRecentIncidents(inc.incidents || []); setLoading(false) })
  }, [])

  const severityColor = (s: string) => s === "P0" || s === "P1" ? "#ef4444" : s === "P2" ? "#f59e0b" : s === "P3" ? "#3b82f6" : "#6b7280"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Operations Center</h1><p className="text-sm" style={{ color: "var(--text-secondary)" }}>Incident management and system health</p></div>
      </div>

      {loading ? <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" /></div> : (
        <>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.bySeverity?.map((s: any) => (
                <div key={s.severity} className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                  <p className="text-xs font-medium" style={{ color: severityColor(s.severity) }}>{s.severity}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{String(s._count)}</p>
                </div>
              ))}
              <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Avg Correlation</p>
                <p className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{String(stats.avgCorrelation || 0)}</p>
              </div>
            </div>
          )}

          <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Open Incidents</h3>
            {recentIncidents.length === 0 ? (
              <p className="text-xs py-4" style={{ color: "var(--text-secondary)" }}>No open incidents</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                    <th className="pb-3 pr-4 font-semibold">Title</th><th className="pb-3 pr-4 font-semibold">Severity</th><th className="pb-3 pr-4 font-semibold">Category</th><th className="pb-3 font-semibold">Detected</th>
                  </tr></thead>
                  <tbody>{recentIncidents.map((inc: any) => (
                    <tr key={inc.id} className="border-b" style={{ borderColor: "var(--border-default)" }}>
                      <td className="py-3 pr-4 font-medium" style={{ color: "var(--text-primary)" }}>{inc.title}</td>
                      <td className="py-3 pr-4"><span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: severityColor(inc.severity) + "20", color: severityColor(inc.severity) }}>{inc.severity}</span></td>
                      <td className="py-3 pr-4" style={{ color: "var(--text-secondary)" }}>{inc.category}</td>
                      <td className="py-3" style={{ color: "var(--text-secondary)" }}>{new Date(inc.detectedAt).toLocaleString()}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
