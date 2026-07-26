"use client"

import { motion } from "framer-motion"

const waveAnim = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

export default function InfoGuidePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Information & Guide</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Documentation, guides and system information</p>
        </div>
        <motion.div animate={waveAnim} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Getting Started", desc: "Quick start guide for new users", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
          { title: "User Manual", desc: "Complete system documentation", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
          { title: "FAQ", desc: "Frequently asked questions", icon: "M8 10h.01M12 10h.01M16 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-2xl border p-5 cursor-pointer hover:shadow-lg transition-all"
            style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2"><path d={item.icon} /></svg>
            </div>
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{item.title}</h3>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
