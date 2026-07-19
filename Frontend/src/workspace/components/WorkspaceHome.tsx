"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAppRegistry } from "@/app-framework/registry/application-registry"
import { useWorkspaceStore } from "../stores"
import { useTranslation } from "@/hooks/use-translation"

const glassCard = {
  backgroundColor: "var(--surface-raised)",
  boxShadow: "var(--shadow-sm)",
}

const CHART_DATA = [
  { label: "Meters Online/Offline", value: "2,847 Active / 203 Offline", color: "var(--status-success)" },
  { label: "Invoice Status", value: "193 Pending / 1,204 Paid / 47 Overdue", color: "var(--status-warning)" },
  { label: "Payment Methods", value: "Bank 62% / Cash 23% / Card 15%", color: "var(--brand)" },
  { label: "Monthly Collection", value: "Jan $1.8M / Feb $2.1M / Mar $1.9M", color: "var(--status-success)" },
  { label: "Meter Types", value: "Electric 55% / Water 30% / Gas 15%", color: "var(--brand)" },
  { label: "Regional Distribution", value: "October 42% / New Cairo 33% / SODIC 25%", color: "var(--status-warning)" },
  { label: "Consumption Trends", value: "+12.4% vs last month", color: "var(--brand)" },
  { label: "Alerts by Severity", value: "Critical 3 / Warning 12 / Info 47", color: "var(--status-error)" },
  { label: "Revenue Breakdown", value: "Residential 58% / Commercial 32% / Industrial 10%", color: "var(--status-success)" },
  { label: "Task Completion", value: "Billing 92% / Maintenance 78% / Inspections 85%", color: "var(--brand)" },
  { label: "Customer Growth", value: "+5.2% this quarter", color: "var(--status-success)" },
  { label: "System Performance", value: "99.97% uptime / 1.8s avg", color: "var(--status-success)" },
]

const DEBT_CUSTOMERS = [
  { name: "Palm Hills Development", amount: "$24,500", days: 65 },
  { name: "Omar Corp", amount: "$18,200", days: 42 },
  { name: "Ahmed Hassan", amount: "$3,450", days: 28 },
]

export function WorkspaceHome() {
  const { getActive } = useAppRegistry()
  const { openTab, area } = useWorkspaceStore()
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")

  const quickApps = getActive().slice(0, 8)
  const filteredDebt = DEBT_CUSTOMERS.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{t("nav.dashboard", "Dashboard")}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{area} — All systems operational</p>
        </div>
      </div>

      {/* Executive Summary — 8 KPI Cards */}
      <div className="mb-6">
        <SectionTitle label="Executive Summary" />
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Active Meters", value: "2,847", color: "var(--brand)" },
            { label: "Pending Invoices", value: "193", color: "var(--status-pending)" },
            { label: "Collection Rate", value: "94%", color: "var(--status-success)" },
            { label: "System Health", value: "98%", color: "var(--status-success)" },
            { label: "Revenue (MTD)", value: "$2.4M", color: "var(--brand)" },
            { label: "Avg Response", value: "1.8s", color: "var(--status-warning)" },
            { label: "Active Customers", value: "1,523", color: "var(--brand)" },
            { label: "Total Meters", value: "3,050", color: "var(--brand)" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="p-3 rounded-xl" style={glassCard}>
              <div className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>{stat.label}</div>
              <div className="text-xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{stat.value}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 12 Charts Grid */}
      <div className="mb-6">
        <SectionTitle label="System Analysis (12 Views)" />
        <div className="grid grid-cols-3 gap-3">
          {CHART_DATA.map((chart, i) => (
            <motion.div key={chart.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="p-4 rounded-xl" style={glassCard}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>{chart.label}</span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: chart.color }} />
              </div>
              <div className="h-16 flex items-center">
                {/* Mini bar visualization */}
                <div className="w-full space-y-1.5">
                  <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: chart.color, width: `${40 + Math.random() * 50}%` }}
                      initial={{ width: 0 }} animate={{ width: `${40 + Math.random() * 50}%` }} transition={{ duration: 0.8, delay: i * 0.05 }} />
                  </div>
                  <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{chart.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Top Debt Customers + Quick Actions */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Debt Customers */}
        <div className="col-span-2 p-4 rounded-xl" style={glassCard}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Top Debt Customers</span>
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 px-2 py-1 rounded border text-[11px] outline-none"
              style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-sunken)", color: "var(--text-primary)" }}
              placeholder="Search customers..." />
          </div>
          <div className="space-y-1">
            {filteredDebt.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between py-2 px-2 rounded hover:bg-black/5 transition-colors"
                style={{ borderBottom: i < filteredDebt.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{c.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs" style={{ color: "var(--status-error)" }}>{c.amount}</span>
                  <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{c.days} days overdue</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 rounded-xl" style={glassCard}>
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Quick Actions</span>
          <div className="mt-3 space-y-2">
            {[t("home.newInvoice", "New Invoice"), t("home.addMeter", "Add Meter"), t("home.recordReading", "Record Reading"), t("home.generateReport", "Generate Report")].map((action) => (
              <button key={action} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all hover:bg-black/5"
                style={{ color: "var(--text-primary)" }}>
                <span className="w-5 h-5 rounded flex items-center justify-center text-[9px]" style={{ backgroundColor: "rgba(var(--brand-rgb), 0.1)", color: "var(--brand)" }}>+</span>
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Apps */}
      <div className="mb-6">
        <SectionTitle label="Applications" />
        <div className="grid grid-cols-4 gap-2">
          {quickApps.map((app) => (
            <motion.button key={app.id} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
              onClick={() => openTab({ id: app.id, label: app.title })}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all" style={glassCard}>
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: "var(--brand)" }}>
                {app.title[0]}
              </span>
              <span className="truncate text-xs" style={{ color: "var(--text-primary)" }}>{app.title}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>{label}</span>
      <div className="flex-1 h-px" style={{ backgroundColor: "var(--border-default)" }} />
    </div>
  )
}
