"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const waveAnim = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

export default function FinancialAiPage() {
  const [board, setBoard] = useState<any>(null)
  const [live, setLive] = useState(false)

  // P49: consume the existing financial-ai BFF handler (real backend data).
  useEffect(() => {
    let cancelled = false
    fetch("/api/financial-ai/board", { headers: { "X-Dev-Mode": "true" } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (cancelled || !d || typeof d.overallHealth !== "number") return; setBoard(d); setLive(true) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const cards = [
    { label: "Overall health", value: board?.overallHealth != null ? `${board.overallHealth}/100` : "—", key: "health" },
    { label: "Forecast", value: board?.latestForecast?.type ?? "—", key: "forecast" },
    { label: "Confidence", value: board?.latestForecast?.confidence ?? "—", key: "conf" },
    { label: "Pending recommendations", value: board?.pendingRecommendations ?? "—", key: "rec" },
    { label: "Critical insights", value: board?.criticalInsights ?? "—", key: "ins" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Financial AI</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{live ? "Live data from /api/financial-ai/board" : "Forecasting, scenarios, and decision intelligence"}</p>
        </div>
        <motion.div animate={waveAnim} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
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
        <h2 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Capabilities</h2>
        <ul className="text-sm space-y-2" style={{ color: "var(--text-secondary)" }}>
          <li>• Forecasting (linear-trend + seasonality) — revenue / collections / cash.</li>
          <li>• Monte Carlo simulation (p5 / p95 / histogram).</li>
          <li>• Scenario analysis (optimistic / pessimistic / custom).</li>
          <li>• Business health score (profitability / liquidity / collections / growth).</li>
          <li>• Executive insights + recommendation log (human-approval gated).</li>
        </ul>
      </div>
    </div>
  )
}
