"use client"

import { motion } from "framer-motion"
import { ListGridPage } from "@/features/grid/ListGridPage"
import { pageConfigs } from "@/admin/tables/page-configs"
import { LineChartCard, BarChartCard, PieChartCard } from "@/features/charts/components/ChartComponents"

const monthlyData = [
  { name: "Jan", collected: 185000, pending: 32000 },
  { name: "Feb", collected: 192000, pending: 28000 },
  { name: "Mar", collected: 178000, pending: 35000 },
  { name: "Apr", collected: 210000, pending: 30000 },
  { name: "May", collected: 198000, pending: 27000 },
  { name: "Jun", collected: 225000, pending: 31000 },
]

const methodData = [
  { name: "Credit Card", value: 45 },
  { name: "Bank Transfer", value: 28 },
  { name: "Cash", value: 15 },
  { name: "Digital Wallet", value: 12 },
]

const statusData = [
  { name: "Completed", value: 520 },
  { name: "Pending", value: 85 },
  { name: "Refunded", value: 32 },
  { name: "Failed", value: 18 },
]

export default function PaymentsPage() {
  return (
    <ListGridPage
      config={pageConfigs.payments}
      renderDashboard={() => (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Collected", value: "EGP 1.19M", icon: "M12 2C8 2 4 5 4 10s4 8 8 8 8-5 8-10-4-8-8-8zM12 6v4m0 4h.01" },
              { label: "Pending", value: "EGP 183K", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0" },
              { label: "Refunds", value: "EGP 24K", icon: "M3 10h18M3 14h18M12 4v16" },
              { label: "Success Rate", value: "96.3%", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0" },
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
            <LineChartCard title="Monthly Collection Trend" subtitle="Collected vs pending per month" data={monthlyData} dataKey="collected" color="var(--brand)" />
            <BarChartCard title="Payments by Method" subtitle="Distribution across payment methods" data={methodData} dataKey="value" color="var(--brand)" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PieChartCard title="Payment Status Distribution" subtitle="Breakdown by transaction status" data={statusData} />
            <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
              <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {["Process Pending", "Issue Refund", "Generate Report", "Export CSV", "Payment Settings", "Reconcile"].map((a, i) => (
                  <motion.button key={i} whileHover={{ scale: 1.02 }} className="px-3 py-2 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>{a}</motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    />
  )
}
