"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const waveAnim = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

interface Summary { open?: number; confirmed?: number; resolved?: number; estimatedLeakage?: number; activeRules?: number }

export default function RevenueAssurancePage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [live, setLive] = useState(false)

  // P49: consume the existing revenue-assurance BFF handler (real backend data).
  useEffect(() => {
    let cancelled = false
    fetch("/api/revenue-assurance/summary", { headers: { "X-Dev-Mode": "true" } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (cancelled || !d || typeof d.open !== "number") return; setSummary(d); setLive(true) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const cards = [
    { label: "Open findings", value: summary?.open ?? "—", key: "open" },
    { label: "Confirmed", value: summary?.confirmed ?? "—", key: "confirmed" },
    { label: "Resolved", value: summary?.resolved ?? "—", key: "resolved" },
    { label: "Est. leakage (EGP)", value: summary?.estimatedLeakage ? summary.estimatedLeakage.toLocaleString() : "—", key: "leak" },
    { label: "Active rules", value: summary?.activeRules ?? "—", key: "rules" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Revenue Assurance</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{live ? "Live data from /api/revenue-assurance/summary" : "Leakage detection rules and findings"}</p>
        </div>
        <motion.div animate={waveAnim} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((c, i) => (
          <motion.div key={c.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
            <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{c.label}</p>
            <p className="text-xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{c.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <h2 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>How it works</h2>
        <ol className="text-sm space-y-2" style={{ color: "var(--text-secondary)" }}>
          <li>1. 15 leakage rules run across PRE_BILL / POST_BILL / CONTINUOUS windows.</li>
          <li>2. Anomalies produce RevenueLeakageFindings (scored 0–100).</li>
          <li>3. Findings can be investigated and resolved (RevenueInvestigation).</li>
          <li>4. Confirmed leakage feeds estimatedLeakage and collection action.</li>
        </ol>
      </div>
    </div>
  )
}
