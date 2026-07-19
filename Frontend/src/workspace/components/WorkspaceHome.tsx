"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAppRegistry } from "@/app-framework/registry/application-registry"
import { useWorkspaceStore } from "../stores"
import { useTranslation } from "@/hooks/use-translation"
import { AnimatedCounter } from "@/components/effects/AnimatedCounter"
import { GradientText, TypewriterText } from "@/components/effects/AnimatedText"
import { futuristic } from "@/design-system/motion"

const glassCard = {
  backgroundColor: "var(--surface-raised)",
  boxShadow: "var(--shadow-sm)",
}

const monthlyData = [3200, 2800, 3500, 4100, 3800, 4200, 4600, 4300, 4900, 5100, 4800, 5300]
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const activityColors: Record<string, string> = {
  reading: "var(--brand)",
  invoice: "#3B82F6",
  customer: "var(--status-pending)",
  system: "#8B5CF6",
  report: "var(--surface-base)",
}

export function WorkspaceHome() {
  const { getActive } = useAppRegistry()
  const { openTab, area } = useWorkspaceStore()
  const { t } = useTranslation()

  const [liveMonthlyData, setLiveMonthlyData] = useState(monthlyData)

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMonthlyData((prev) => {
        const next = [...prev]
        const lastVal = next[next.length - 1]
        const variation = Math.floor((Math.random() - 0.5) * 400)
        next[next.length - 1] = Math.max(100, lastVal + variation)
        return next
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const statData = [
    { label: t("home.activeMeters", "Active Meters"), value: 2847 },
    { label: t("home.pendingInvoices", "Pending Invoices"), value: 193 },
    { label: t("home.collectionRate", "Collection Rate"), value: 94 },
    { label: t("home.systemHealth", "System Health"), value: 98 },
  ]

  const activityItems = [
    { time: "2 " + t("home.minutesAgo", "min ago"), text: t("home.meterReadingUploaded", "Meter reading uploaded — Phase 1"), type: "reading" as const },
    { time: "15 " + t("home.minutesAgo", "min ago"), text: t("home.invoiceGenerated", "Invoice #INV-2024-0892 generated"), type: "invoice" as const },
    { time: "1 " + t("home.hoursAgo", "hr ago"), text: t("home.newCustomerRegistered", "New customer registered: Ahmed Corp"), type: "customer" as const },
    { time: "3 " + t("home.hoursAgo", "hr ago"), text: t("home.systemHealthCheck", "System health check completed"), type: "system" as const },
    { time: t("home.yesterday", "Yesterday"), text: t("home.monthlyReportGenerated", "Monthly report for October generated"), type: "report" as const },
  ]

  const quickApps = getActive().slice(0, 8)
  const maxMonthly = Math.max(...liveMonthlyData)
  const meterDistribution = [
    { label: t("home.active", "Active"), value: 2847, color: "var(--brand)" },
    { label: t("home.maintenance", "Maintenance"), value: 156, color: "var(--status-pending)" },
    { label: t("home.offline", "Offline"), value: 47, color: "var(--status-error)" },
  ]
  const totalMeters = meterDistribution.reduce((a, b) => a + b.value, 0)
  let donutAngle = 0
  const donutSegments = meterDistribution.map((m) => {
    const angle = (m.value / totalMeters) * 360
    const start = donutAngle
    donutAngle += angle
    return { ...m, start, angle }
  })

  return (
    <div className="h-full overflow-y-auto p-6" style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div className="mb-6">
        <GradientText className="text-xl font-semibold">{t("nav.dashboard", "Workspace Home")}</GradientText>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          <TypewriterText text={`${t("common.area", "Area")}: ${area} — All systems operational`} speed={20} />
        </p>
      </div>

      {/* Executive Summary — Glass Cards */}
      <div className="mb-6">
        <SectionTitle label={t("home.executiveSummary", "Executive Summary")} />
        <div className="grid grid-cols-4 gap-2">
          {statData.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={{
                initial: { opacity: 0, y: 16 },
                animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 22, delay: i * 0.04 } },
              }}
              initial="initial"
              animate="animate"
              className="p-3 rounded-xl"
              style={glassCard}
            >
              <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{stat.label}</div>
              <div className="text-lg font-bold mt-0" style={{ color: "var(--text-primary)" }}>
                {stat.label === "Collection Rate" || stat.label === "System Health" ? (
                  <><AnimatedCounter value={stat.value} />%</>
                ) : (
                  <AnimatedCounter value={stat.value} />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <SectionTitle label={t("home.quickActions", "Quick Actions")} />
        <div className="grid grid-cols-4 gap-2">
          {[
            t("home.newInvoice", "New Invoice"),
            t("home.addMeter", "Add Meter"),
            t("home.recordReading", "Record Reading"),
            t("home.generateReport", "Generate Report")
          ].map((action) => (
            <button key={action} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:shadow-md"
              style={{ ...glassCard, color: "var(--text-primary)" }}
            >
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ backgroundColor: "rgba(var(--brand-rgb), 0.1)", color: "var(--brand)" }}>+</span>
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Monthly Consumption Bar Chart */}
        <div className="p-3 rounded-xl" style={glassCard}>
          <SectionTitle label={t("home.monthlyConsumption", "Monthly Consumption (kWh)")} />
          <div className="flex items-end gap-1.5 h-24 pt-2">
            {liveMonthlyData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(v / maxMonthly) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.03, ease: "easeOut" }}
                  className="w-full rounded-t-sm"
                  style={{
                    backgroundColor: i === 11 ? "var(--brand)" : "rgba(var(--brand-rgb), 0.25)",
                    minHeight: 4,
                  }}
                />
                <span className="text-[8px]" style={{ color: "var(--text-tertiary)" }}>{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart — Meter Status Distribution */}
        <div className="p-3 rounded-xl" style={glassCard}>
          <SectionTitle label={t("home.meterStatusDistribution", "Meter Status Distribution")} />
          <div className="flex items-center gap-4">
            <svg width="100" height="100" viewBox="0 0 36 36">
              {donutSegments.map((seg) => {
                const r = 15.915
                const x1 = 18 + r * Math.cos((-90 + seg.start) * (Math.PI / 180))
                const y1 = 18 + r * Math.sin((-90 + seg.start) * (Math.PI / 180))
                const x2 = 18 + r * Math.cos((-90 + seg.start + seg.angle) * (Math.PI / 180))
                const y2 = 18 + r * Math.sin((-90 + seg.start + seg.angle) * (Math.PI / 180))
                const largeArc = seg.angle > 180 ? 1 : 0
                return (
                  <motion.path
                    key={seg.label}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    d={`M 18 18 L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={seg.color}
                    opacity={0.85}
                  />
                )
              })}
              <circle cx="18" cy="18" r="11" fill="var(--surface-raised)" />
            </svg>
            <div className="flex flex-col gap-1.5">
              {meterDistribution.map((m) => (
                <div key={m.label} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{m.label}</span>
                  <span className="text-[11px] font-medium ml-auto" style={{ color: "var(--text-primary)" }}>{m.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Applications */}
      <div className="mb-6">
        <SectionTitle label={t("home.applications", "Applications")} />
        <div className="grid grid-cols-4 gap-2">
          {quickApps.map((app) => (
            <motion.button
              key={app.id}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openTab({ id: app.id, label: app.title, icon: app.icon })}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm transition-all"
              style={glassCard}
            >
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: "var(--brand)" }}>
                {app.title[0]}
              </span>
              <span className="truncate" style={{ color: "var(--text-primary)" }}>{app.title}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-6">
        <SectionTitle label={t("home.recentActivity", "Recent Activity")} />
        <div className="p-3 rounded-xl" style={glassCard}>
          <div className="space-y-0">
            {activityItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 py-2.5 border-b last:border-b-0"
                style={{ borderColor: "var(--border-default)" }}
              >
                <div className="relative flex items-center justify-center mt-0.5">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: activityColors[item.type] }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs" style={{ color: "var(--text-primary)" }}>{item.text}</p>
                </div>
                <span className="text-[10px] shrink-0" style={{ color: "var(--text-tertiary)" }}>{item.time}</span>
              </motion.div>
            ))}
          </div>
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


