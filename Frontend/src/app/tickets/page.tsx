"use client"

import { motion } from "framer-motion"

const waveAnim = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

export default function TicketsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Ticket System</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Support tickets and issue tracking</p>
        </div>
        <motion.div animate={waveAnim} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Open", value: "—", color: "var(--brand)" },
          { label: "In Progress", value: "—", color: "#F59E0B" },
          { label: "Resolved", value: "—", color: "#10B981" },
          { label: "Closed", value: "—", color: "var(--text-tertiary)" },
        ].map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{c.label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{c.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
