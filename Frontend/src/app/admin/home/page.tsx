"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { LineChartCard, BarChartCard, PieChartCard, AreaChartCard } from "@/features/charts/components/ChartComponents"

export default function EnhancedAdminHomePage() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetch("/api/admin/monitoring").then(r => r.json()).then(d => setStats(d?.metrics || {})).catch(() => {})
  }, [])

  const readingData = [
    { name: "Jan", readings: 285000, cost: 1420000 },
    { name: "Feb", readings: 298000, cost: 1490000 },
    { name: "Mar", readings: 312000, cost: 1560000 },
    { name: "Apr", readings: 305000, cost: 1525000 },
    { name: "May", readings: 330000, cost: 1650000 },
    { name: "Jun", readings: 345000, cost: 1725000 },
  ]

  const areaData = [
    { name: "October", meters: 15200, revenue: 3800000 },
    { name: "New Cairo", meters: 24500, revenue: 6100000 },
    { name: "SODIC", meters: 8900, revenue: 2200000 },
    { name: "Zayed", meters: 11300, revenue: 2800000 },
    { name: "Maadi", meters: 7200, revenue: 1800000 },
  ]

  const deviceTypeData = [
    { name: "Smart Water", value: 31200 },
    { name: "Smart Electric", value: 18400 },
    { name: "Gas Meters", value: 5600 },
    { name: "Solar Inverters", value: 2100 },
  ]

  const recentActivity = [
    { action: "Bulk reading import", entity: "October zone", time: "2 min ago", status: "completed" },
    { action: "Invoice generation", entity: "New Cairo", time: "15 min ago", status: "completed" },
    { action: "Meter assignment", entity: "SODIC Block C", time: "1 hr ago", status: "completed" },
    { action: "Payment reconciliation", entity: "Bank transfer batch", time: "3 hrs ago", status: "processing" },
    { action: "System backup", entity: "Full database", time: "6 hrs ago", status: "completed" },
    { action: "Firmware update", entity: "Smart meters v4.2", time: "12 hrs ago", status: "completed" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Admin Dashboard</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>System-wide overview & metrics</p>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: "var(--brand)" }}>
            Refresh Data
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Meters", value: stats?.totalMeters ?? "57,300", icon: "M9 3l3-3m0 0l3 3m-3-3v12" },
          { label: "Active Customers", value: stats?.activeCustomers ?? "38,100", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" },
          { label: "Readings (30d)", value: stats?.totalReadings ?? "1.87M", icon: "M9 12l2 2 4-4M7.5 21h9" },
          { label: "Revenue (MTD)", value: "EGP 9.4M", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2" },
        ].map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-2xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2"><path d={c.icon} /></svg>
              </div>
              <span className="text-[11px] font-semibold" style={{ color: "var(--text-secondary)" }}>{c.label}</span>
            </div>
            <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{c.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LineChartCard title="Monthly Readings" subtitle="Total readings processed per month" data={readingData} dataKey="readings" color="var(--brand)" />
        <AreaChartCard title="Revenue by Area" subtitle="Monthly revenue per zone" data={areaData} dataKey="revenue" color="var(--brand)" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChartCard title="Device Distribution by Type" subtitle="Meters deployed by category" data={deviceTypeData} dataKey="value" color="var(--brand)" />
        <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Recent Activity</h3>
          <div className="space-y-1">
            {recentActivity.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs"
                style={{ backgroundColor: "rgba(var(--brand-rgb),0.03)" }}>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{
                    backgroundColor: a.status === "completed" ? "var(--status-success, #22c55e)" : "var(--status-warning, #eab308)"
                  }} />
                  <span style={{ color: "var(--text-primary)" }}>{a.action}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ color: "var(--text-tertiary)" }}>{a.entity}</span>
                  <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{a.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {[
          { label: "Generate Reports", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
          { label: "Manage Meters", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
          { label: "View Invoices", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
          { label: "System Settings", icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" },
        ].map((btn, i) => (
          <motion.button key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="rounded-2xl border p-4 flex items-center gap-3 text-xs font-semibold text-white"
            style={{ backgroundColor: "var(--brand)", borderColor: "var(--brand)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={btn.icon} /></svg>
            {btn.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
