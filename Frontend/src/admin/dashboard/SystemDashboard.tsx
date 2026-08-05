"use client"

import { motion } from "framer-motion"

const waveAnim = { scale: [1, 1.06, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-5 transition-all hover:shadow-lg"
      style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d={icon} /></svg>
        </div>
        <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{label}</span>
      </div>
      <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
    </motion.div>
  )
}

function MiniChart({ data, color, height = 60 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data, 1)
  const w = 100 / data.length
  return (
    <div className="flex items-end gap-[2px]" style={{ height }}>
      {data.map((v, i) => (
        <div key={i} className="rounded-t-sm transition-all hover:opacity-80" style={{
          width: `${w}%`, height: `${(v / max) * 100}%`, backgroundColor: color, minHeight: 2,
          opacity: 0.3 + (v / max) * 0.7
        }} />
      ))}
    </div>
  )
}

const statsConfig = {
  red: { color: "#DC2626", label: "admin" },
}

const sampleData = [23, 45, 38, 52, 41, 65, 58, 72, 61, 85, 78, 92, 88, 95, 82, 99]

export default function SystemDashboard({ brandColor = "#DC2626", title = "Dashboard" }: { brandColor?: string; title?: string }) {
  const cards = [
    { label: "Total Meters", value: "—", icon: "M9 3l3-3m0 0l3 3m-3-3v12" },
    { label: "Active Customers", value: "—", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8" },
    { label: "Monthly Readings", value: "—", icon: "M9 12l2 2 4-4" },
    { label: "Pending Invoices", value: "—", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{title}</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>System overview & analytics</p>
        </div>
        <motion.div animate={waveAnim} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: brandColor }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => <StatCard key={i} {...c} color={brandColor} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Monthly Trend</h3>
          <MiniChart data={sampleData} color={brandColor} height={120} />
          <div className="flex justify-between mt-2 text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
            <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
          </div>
        </div>

        <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "View All Meters", action: "meters" },
              { label: "Recent Invoices", action: "invoices" },
              { label: "System Health", action: "monitoring" },
            ].map((a, i) => (
              <motion.button key={i} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all"
                style={{ backgroundColor: brandColor, color: "#FFFFFF" }}>
                <span>{a.label}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
