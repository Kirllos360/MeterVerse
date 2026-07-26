"use client"

import { motion } from "framer-motion"

const waveAnim = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

export default function SimCardsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>SIM Card Management</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Manage SIM cards and connectivity</p>
        </div>
        <motion.div animate={waveAnim} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 3v2m6-2v2M9 7h6M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </motion.div>
      </div>

      <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>SIM Inventory</h3>
          <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)", color: "var(--brand)" }}>0 active</span>
        </div>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>No SIM cards registered yet.</p>
      </div>
    </div>
  )
}
