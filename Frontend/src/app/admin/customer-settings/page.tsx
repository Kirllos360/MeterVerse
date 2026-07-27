"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const TABS = [
  { id: "0", label: "Customer Groups" },
    { id: "1", label: "Customer Types" },
    { id: "2", label: "Transfer Ownership" },
    { id: "3", label: "Event Log" },
    { id: "4", label: "Error Log" }
]

export default function CustomerSettingsPage() {
  const [tab, setTab] = useState(0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Customer Settings</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p>
        </div>
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /></svg>
        </motion.div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none rounded-2xl border px-3"
        style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            className="shrink-0 px-3 py-1.5 text-xs font-semibold transition-all rounded-xl whitespace-nowrap"
            style={{ backgroundColor: tab === i ? "var(--brand)" : "transparent", color: tab === i ? "#FFFFFF" : "var(--text-secondary)" }}>
            {tab === i && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block mr-1.5" />}
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-2xl border p-6" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{TABS[tab].label} - Configuration and management section.</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
              <div className="w-10 h-10 rounded-full mb-3" style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)" }} />
              <div className="h-3 w-2/3 rounded mb-2" style={{ backgroundColor: "var(--border-default)" }} />
              <div className="h-3 w-1/2 rounded" style={{ backgroundColor: "var(--border-default)" }} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
