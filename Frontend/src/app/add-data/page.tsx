"use client"

import { motion } from "framer-motion"

const waveAnim = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

export default function AddDataPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Add Data</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Submit new meter readings and data entries</p>
        </div>
        <motion.div animate={waveAnim} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 4v16m8-8H4" /></svg>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {["Manual Entry", "Bulk Import", "API Push", "Scheduled"].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-2xl border p-5 cursor-pointer hover:shadow-lg transition-all"
            style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{item}</h3>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Submit data via {item.toLowerCase()}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
