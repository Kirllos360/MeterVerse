"use client"

import { MetricsDashboard } from "@/admin/metrics/MetricsDashboard"
import { SystemHealth } from "@/admin/health/SystemHealth"

export default function AdminDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-white">System Health</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Enterprise administration dashboard</p>
      </div>
      <MetricsDashboard />
      <SystemHealth />
    </div>
  )
}
