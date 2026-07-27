"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { GenericAdminPage } from "@/admin/tables/GenericAdminPage"
import { pageConfigs } from "@/admin/tables/page-configs"
import { EnhancedListPage } from "@/features/grid/EnhancedListPage"
import { BarChartCard, PieChartCard, LineChartCard } from "@/features/charts/components/ChartComponents"

export default function EnhancedMetersPage() {
  const [tab, setTab] = useState("dashboard")

  const meterStatusData = [
    { name: "Active", value: 1240 }, { name: "Inactive", value: 85 },
    { name: "Maintenance", value: 42 }, { name: "Retired", value: 120 },
  ]
  const meterTypeData = [
    { name: "Water", value: 850 }, { name: "Electric", value: 420 },
    { name: "Gas", value: 120 }, { name: "Solar", value: 45 },
  ]
  const readingsData = [
    { name: "Jan", readings: 45000 }, { name: "Feb", readings: 42000 },
    { name: "Mar", readings: 48000 }, { name: "Apr", readings: 51000 },
    { name: "May", readings: 49000 }, { name: "Jun", readings: 53000 },
  ]

  if (tab === "dashboard") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Meters Dashboard</h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Meter inventory & performance analytics</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setTab("list")} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: "var(--brand)" }}>
            View All Meters
          </motion.button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Meters", value: "1,487", icon: "M9 3l3-3m0 0l3 3m-3-3v12" },
            { label: "Active", value: "1,240", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0" },
            { label: "Readings (30d)", value: "288K", icon: "M9 12l2 2 4-4M7.5 21h9" },
            { label: "Sync Rate", value: "99.2%", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
          ].map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-2xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2"><path d={c.icon} /></svg>
                </div>
                <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{c.label}</span>
              </div>
              <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{c.value}</p>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PieChartCard title="Meters by Type" data={meterTypeData} />
          <PieChartCard title="Meter Status" data={meterStatusData} />
        </div>
        <BarChartCard title="Monthly Readings" data={readingsData} dataKey="readings" color="var(--brand)" />
      </div>
    )
  }
  return (
    <EnhancedListPage
      title="Meters"
      description="Meter inventory &amp; performance analytics"
      chartConfigs={{
        title: "Meter Analytics",
        data1: [{name:"Jan",readings:45000},{name:"Feb",readings:42000},{name:"Mar",readings:48000},{name:"Apr",readings:51000},{name:"May",readings:49000},{name:"Jun",readings:53000}].map(d=>({name:d.name,value:d.readings})),
        data2: [{name:"Water",value:850},{name:"Electric",value:420},{name:"Gas",value:120},{name:"Solar",value:45}],
        data3: [{name:"Active",value:1240},{name:"Inactive",value:85},{name:"Maintenance",value:42},{name:"Retired",value:120}],
      }}
      toolbarConfig={{
        sortOptions: [{value:"name",label:"Name"},{value:"type",label:"Type"},{value:"status",label:"Status"}],
        filterOptions: [{value:"all",label:"All"},{value:"active",label:"Active"},{value:"inactive",label:"Inactive"},{value:"maintenance",label:"Maintenance"}],
      }}
    >
      <GenericAdminPage config={pageConfigs.meters} />
    </EnhancedListPage>
  )
}
