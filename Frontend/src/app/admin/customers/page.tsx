"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { GenericAdminPage } from "@/admin/tables/GenericAdminPage"
import { pageConfigs } from "@/admin/tables/page-configs"
import { LineChartCard, BarChartCard, PieChartCard, AreaChartCard } from "@/features/charts/components/ChartComponents"

const waveAnim = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

export default function EnhancedCustomersPage() {
  const [tab, setTab] = useState("dashboard")
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetch("/api/admin/monitoring").then(r => r.json()).then(d => setStats(d?.metrics || {})).catch(() => {})
  }, [])

  const sampleData = [
    { name: "Jan", total: 120, active: 100, new: 15 },
    { name: "Feb", total: 135, active: 110, new: 18 },
    { name: "Mar", total: 150, active: 125, new: 22 },
    { name: "Apr", total: 168, active: 140, new: 20 },
    { name: "May", total: 180, active: 150, new: 25 },
    { name: "Jun", total: 195, active: 165, new: 28 },
  ]

  const statusData = [
    { name: "Active", value: 165 },
    { name: "Inactive", value: 20 },
    { name: "Suspended", value: 10 },
  ]

  if (tab === "dashboard") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Customers Dashboard</h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Analytics & metrics overview</p>
          </div>
          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setTab("list")}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: "var(--brand)" }}>
              View Customer List
            </motion.button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Customers", value: stats?.totalCustomers || "—", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" },
            { label: "Active", value: stats?.activeCustomers || "—", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "New This Month", value: stats?.newCustomers || "—", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6" },
            { label: "Avg. Revenue/Customer", value: stats?.avgRevenue || "—", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" },
          ].map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-2xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2"><path d={c.icon} /></svg>
                </div>
                <span className="text-[11px] font-semibold" style={{ color: "var(--text-secondary)" }}>{c.label}</span>
              </div>
              <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{typeof c.value === 'number' ? c.value.toLocaleString() : c.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BarChartCard title="Customer Growth" subtitle="New customers per month" data={sampleData} dataKey="new" color="var(--brand)" />
          <PieChartCard title="Customer Status" subtitle="Distribution by status" data={statusData} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LineChartCard title="Total Customers Trend" subtitle="Cumulative growth" data={sampleData} dataKey="total" color="var(--brand)" />
          <AreaChartCard title="Active vs Total" subtitle="Customer retention" data={sampleData} dataKey="active" color="var(--brand)" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setTab("dashboard")}
          className="px-3 py-1.5 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: "var(--brand)" }}>
          ← Dashboard
        </motion.button>
      </div>
      <GenericAdminPage config={pageConfigs.customers} />
    </div>
  )
}
