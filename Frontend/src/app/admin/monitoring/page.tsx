"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { LineChartCard, AreaChartCard, PieChartCard } from "@/features/charts/components/ChartComponents"

export default function EnhancedMonitoringPage() {
  const [tab, setTab] = useState("dashboard")

  const latencyData = [
    { name: "00:00", latency: 45 }, { name: "04:00", latency: 38 },
    { name: "08:00", latency: 62 }, { name: "12:00", latency: 88 },
    { name: "16:00", latency: 74 }, { name: "20:00", latency: 52 },
    { name: "23:00", latency: 41 },
  ]

  const resourceData = [
    { name: "Jan", cpu: 55, memory: 62, disk: 48 },
    { name: "Feb", cpu: 58, memory: 65, disk: 50 },
    { name: "Mar", cpu: 52, memory: 60, disk: 47 },
    { name: "Apr", cpu: 61, memory: 68, disk: 52 },
    { name: "May", cpu: 57, memory: 63, disk: 49 },
    { name: "Jun", cpu: 63, memory: 70, disk: 53 },
  ]

  const errorData = [
    { name: "API Errors", value: 42 },
    { name: "Timeout", value: 28 },
    { name: "Auth Failures", value: 18 },
    { name: "DB Errors", value: 12 },
    { name: "Rate Limited", value: 8 },
  ]

  const healthChecks = [
    { label: "Database", status: "healthy", latency: "12ms" },
    { label: "Redis Cache", status: "healthy", latency: "3ms" },
    { label: "API Gateway", status: "healthy", latency: "8ms" },
    { label: "Queue Worker", status: "degraded", latency: "120ms" },
    { label: "File Storage", status: "healthy", latency: "45ms" },
    { label: "Email Service", status: "healthy", latency: "22ms" },
  ]

  if (tab === "dashboard") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Monitoring Dashboard</h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>System health & performance metrics</p>
          </div>
          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setTab("list")}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: "var(--brand)" }}>
              View Full Status
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "System Uptime", value: "99.97%", icon: "M13 10V3L4 14h7v7l9-11h-7z", status: "healthy" },
            { label: "API Latency", value: "48ms avg", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0", status: "healthy" },
            { label: "Active Users", value: "1,247", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", status: "healthy" },
            { label: "Error Rate", value: "0.8%", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0", status: "degraded" },
          ].map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-2xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2"><path d={c.icon} /></svg>
                </div>
                <span className="text-[11px] font-semibold" style={{ color: "var(--text-secondary)" }}>{c.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{c.value}</p>
                <span className={`w-2 h-2 rounded-full ${c.status === "healthy" ? "" : ""}`}
                  style={{ backgroundColor: c.status === "healthy" ? "var(--brand, #DC2626)" : "var(--status-warning, #eab308)"}} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LineChartCard title="API Response Time" subtitle="Average latency throughout the day" data={latencyData} dataKey="latency" color="var(--brand)" />
          <AreaChartCard title="System Resource Usage" subtitle="CPU, Memory & Disk over time" data={resourceData} dataKey="cpu" color="var(--brand)" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PieChartCard title="Error Distribution by Type" subtitle="Breakdown of system errors" data={errorData} />
          <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Health Status</h3>
            <div className="space-y-2">
              {healthChecks.map((h, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs"
                  style={{ backgroundColor: "rgba(var(--brand-rgb),0.03)" }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{
                      backgroundColor: h.status === "healthy" ? "var(--brand, #DC2626)" : "var(--status-warning, #eab308)"
                    }} />
                    <span style={{ color: "var(--text-primary)" }}>{h.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ color: "var(--text-tertiary)" }}>{h.latency}</span>
                    <span className="font-semibold" style={{
                      color: h.status === "healthy" ? "var(--brand, #DC2626)" : "var(--status-warning, #eab308)"
                    }}>{h.status}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setTab("dashboard")}
          className="px-3 py-1.5 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: "var(--brand)" }}>
          ← Dashboard
        </motion.button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {healthChecks.map((h, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{h.label}</span>
              <span className="w-2 h-2 rounded-full" style={{
                backgroundColor: h.status === "healthy" ? "var(--brand, #DC2626)" : "var(--status-warning, #eab308)"
              }} />
            </div>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{h.status}</p>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Latency: {h.latency}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
