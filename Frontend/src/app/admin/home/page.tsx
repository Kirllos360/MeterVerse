"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function AdminHomePage() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/health").then(r=>r.json()).catch(()=>({})),
      fetch("/api/business/pipeline-status").then(r=>r.json()).catch(()=>({})),
    ]).then(([h,b]) => setStats({ health: h, business: b }))
  }, [])

  const cards = [
    { l:"Total Users", v:stats?.business?.stats?.totalReadings||"—", c:"var(--admin-accent)", icon:"M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8" },
    { l:"Active Sessions", v:stats?.health?.metrics?.users||"—", c:"#DC2626", icon:"M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" },
    { l:"System Health", v:stats?.health?.status||"—", c:"#DC2626", icon:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
    { l:"Services", v:"15 active", c:"#EF4444", icon:"M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" },
  ]

  const quickLinks = [
    { l:"👥 Users", p:"/admin/users", d:"Manage administrators" },
    { l:"🛡️ Security", p:"/admin/security", d:"Security audit & compliance" },
    { l:"📊 Reports", p:"/admin/reports", d:"Analytics & reporting" },
    { l:"🤖 AI", p:"/admin/ai", d:"AI agents & automation" },
    { l:"📋 Audit", p:"/admin/audit", d:"System audit trail" },
    { l:"📈 Monitor", p:"/admin/monitoring", d:"Performance metrics" },
    { l:"⚙️ Settings", p:"/admin/settings", d:"System configuration" },
    { l:"🧩 Services", p:"/admin/services", d:"Platform services" },
  ]

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Admin Dashboard</h1>
        <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>MeterVerse Enterprise Administration</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div key={c.l} initial={{ opacity: 0, y: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 20 }}
            whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.3)" }}
            className="rounded-2xl border p-5" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--admin-surface)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>{c.l}</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${c.c}18` }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.c} strokeWidth="2" strokeLinecap="round"><path d={c.icon} /></svg>
              </div>
            </div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{c.v}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Links + Recent Activity Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Quick Links */}
        <motion.div className="col-span-2 rounded-2xl border p-5" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--admin-surface)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Quick Access</h2>
          <div className="grid grid-cols-4 gap-2">
            {quickLinks.map((q, i) => (
              <motion.a key={q.l} href={q.p} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                className="rounded-xl px-4 py-3 text-xs block" style={{ backgroundColor: "rgba(var(--semantic-error-rgb), 0.06)", border: "1px solid rgba(var(--semantic-error-rgb), 0.1)", color: "var(--text-primary)", textDecoration: "none" }}>
                <div className="text-base mb-1">{q.l.split(" ")[0]}</div>
                <div className="font-medium">{q.l.split(" ").slice(1).join(" ")}</div>
                <div className="text-[10px] mt-1" style={{ color: "var(--text-tertiary)" }}>{q.d}</div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div className="rounded-2xl border p-5" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--admin-surface)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Recent Activity</h2>
          <div className="space-y-2">
            {[
              { t:"System health check passed", s:"success", ts:"2m ago" },
              { t:"Backup completed", s:"success", ts:"15m ago" },
              { t:"New user registered", s:"info", ts:"1h ago" },
              { t:"Invoice #INV-0042 generated", s:"info", ts:"2h ago" },
              { t:"Meter reading anomaly flagged", s:"warning", ts:"3h ago" },
            ].map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs" style={{ backgroundColor: "var(--admin-surface)", border: "1px solid var(--border-default)" }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: a.s === "success" ? "#DC2626" : a.s === "warning" ? "#EF4444" : "#DC2626" }} />
                <span className="flex-1" style={{ color: "var(--text-secondary)" }}>{a.t}</span>
                <span style={{ color: "var(--text-tertiary)" }}>{a.ts}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* System Info Bar */}
      <motion.div className="rounded-2xl border p-4 flex items-center gap-4 text-xs" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--admin-surface)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <span className="px-3 py-1.5 rounded-lg text-white text-[10px] font-semibold" style={{ backgroundColor: "var(--admin-accent)" }}>v8.0.0</span>
        <span style={{ color: "var(--text-tertiary)" }}>•</span>
        <span style={{ color: "var(--text-secondary)" }}>78 Prisma Models</span>
        <span style={{ color: "var(--text-tertiary)" }}>•</span>
        <span style={{ color: "var(--text-secondary)" }}>165 API Endpoints</span>
        <span style={{ color: "var(--text-tertiary)" }}>•</span>
        <span style={{ color: "var(--text-secondary)" }}>42 Admin Pages</span>
        <span style={{ color: "var(--text-tertiary)" }}>•</span>
        <span style={{ color: "var(--text-secondary)" }}>9 AI Agents</span>
        <div className="flex-1" />
        <span style={{ color: "var(--status-success)" }}>● All Systems Operational</span>
      </motion.div>
    </div>
  )
}

