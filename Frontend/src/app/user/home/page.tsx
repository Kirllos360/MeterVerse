"use client"

import { motion } from "framer-motion"

export default function UserHomePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Meter Verse</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Welcome to your dashboard</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Active Meters", value: "—", icon: "M9 3l3-3m0 0l3 3m-3-3v12" },
          { label: "Total Customers", value: "—", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8" },
          { label: "Pending Invoices", value: "—", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586" },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2"><path d={card.icon} /></svg>
              </div>
              <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{card.label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{card.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
