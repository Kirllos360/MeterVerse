"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { AnalyticsBar } from "@/features/charts/AnalyticsBar"
import { toast } from "sonner"

type TabId = "customers" | "meters" | "readings" | "invoices" | "payments"

interface TabConfig {
  id: TabId
  label: string
  icon: keyof typeof Icons
}

const TABS: TabConfig[] = [
  { id: "customers", label: "Customers", icon: "users" },
  { id: "meters", label: "Meters", icon: "settings" },
  { id: "readings", label: "Readings", icon: "chart" },
  { id: "invoices", label: "Invoices", icon: "clipboard" },
  { id: "payments", label: "Payments", icon: "creditCard" },
]

const STEPS = ["Select", "Enter", "Review", "Submit"]

const MOCK_CHART_DATA = {
  trend: [
    { name: "Mon", value: 120 },
    { name: "Tue", value: 180 },
    { name: "Wed", value: 140 },
    { name: "Thu", value: 220 },
    { name: "Fri", value: 190 },
  ],
  distribution: [
    { name: "Q1", value: 340 },
    { name: "Q2", value: 420 },
    { name: "Q3", value: 380 },
    { name: "Q4", value: 500 },
  ],
  breakdown: [
    { name: "Resolved", value: 65 },
    { name: "Pending", value: 35 },
  ],
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  users: Icons.users,
  settings: Icons.settings,
  chart: Icons.chart,
  clipboard: Icons.clipboard,
  creditCard: Icons.creditCard,
}

export default function AddDataPage() {
  const [activeTab, setActiveTab] = useState<TabId>("customers")
  const [step, setStep] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEntity, setSelectedEntity] = useState("")
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const kpiData = { addedToday: 47, successRate: 94, pendingReview: 12 }

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
    setStep(0)
    setSearchQuery("")
    setSelectedEntity("")
    setFormData({})
  }

  const handleNext = () => {
    if (step === 0 && !selectedEntity) {
      toast.error("Please select an entity first")
      return
    }
    if (step < STEPS.length - 1) setStep((s) => s + 1)
  }

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200))
    setSubmitting(false)
    toast.success(`${activeTab} entry submitted successfully`)
    setStep(0)
    setSelectedEntity("")
    setFormData({})
  }

  const entities = [
    `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Alpha`,
    `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Beta`,
    `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Gamma`,
  ].filter((e) => !searchQuery || e.toLowerCase().includes(searchQuery.toLowerCase()))

  const CurrentIcon = activeTab ? ICON_MAP[TABS.find((t) => t.id === activeTab)?.icon ?? "users"] : Icons.users

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Add Data</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Submit new meter readings and data entries</p>
        </div>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--brand)" }}
        >
          <Icons.add className="h-4 w-4 text-white" />
        </motion.div>
      </div>

      <AnalyticsBar
        title="Data Entry Overview"
        data1={MOCK_CHART_DATA.trend}
        data2={MOCK_CHART_DATA.distribution}
        data3={MOCK_CHART_DATA.breakdown}
      />

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Added Today", value: kpiData.addedToday, icon: Icons.check },
          { label: "Success Rate", value: `${kpiData.successRate}%`, icon: Icons.badgeCheck },
          { label: "Pending Review", value: kpiData.pendingReview, icon: Icons.clock },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl border p-4 flex items-center gap-3"
            style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
              <kpi.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{kpi.label}</p>
              <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl border" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <div className="flex border-b" style={{ borderColor: "var(--border-default)" }}>
          {TABS.map((tab) => {
            const TabIcon = ICON_MAP[tab.icon]
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative"
                style={{
                  color: isActive ? "var(--brand)" : "var(--text-tertiary)",
                  borderBottom: isActive ? "2px solid var(--brand)" : "2px solid transparent",
                }}
              >
                <TabIcon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 mb-5">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors"
                  style={{
                    backgroundColor: i <= step ? "var(--brand)" : "var(--border-default)",
                    color: i <= step ? "#fff" : "var(--text-tertiary)",
                  }}
                >
                  {i < step ? <Icons.check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className="text-[11px] font-medium" style={{ color: i <= step ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className="w-8 h-px" style={{ backgroundColor: i < step ? "var(--brand)" : "var(--border-default)" }} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-step-${step}`}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.15 }}
            >
              {step === 0 && (
                <div className="space-y-3">
                  <div className="relative">
                    <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-tertiary)" }} />
                    <Input
                      placeholder={`Search ${activeTab}...`}
                      className="pl-9 rounded-xl h-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 max-h-48 overflow-auto">
                    {entities.map((e) => (
                      <button
                        key={e}
                        onClick={() => setSelectedEntity(e)}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm transition-colors"
                        style={{
                          backgroundColor: selectedEntity === e ? "var(--brand)" : "transparent",
                          color: selectedEntity === e ? "#fff" : "var(--text-primary)",
                        }}
                      >
                        {e}
                      </button>
                    ))}
                    {entities.length === 0 && (
                      <p className="text-sm px-3 py-2" style={{ color: "var(--text-tertiary)" }}>No results</p>
                    )}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-3">
                  {["Value", "Date", "Notes"].map((field) => (
                    <div key={field}>
                      <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>{field}</label>
                      <Input
                        className="rounded-xl h-9"
                        placeholder={`Enter ${field.toLowerCase()}`}
                        value={formData[field] ?? ""}
                        onChange={(e) => setFormData((d) => ({ ...d, [field]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Review</p>
                  {[
                    { label: "Entity", value: selectedEntity },
                    ...Object.entries(formData).map(([k, v]) => ({ label: k, value: v })),
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-1.5 border-b text-sm" style={{ borderColor: "var(--border-default)" }}>
                      <span style={{ color: "var(--text-tertiary)" }}>{label}</span>
                      <span className="font-medium" style={{ color: "var(--text-primary)" }}>{value || "—"}</span>
                    </div>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: "var(--brand)" }}>
                    <Icons.check className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-bold" style={{ color: "var(--text-primary)" }}>Ready to submit</p>
                  <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>Please confirm to submit the {activeTab} entry</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-5 pt-4 border-t" style={{ borderColor: "var(--border-default)" }}>
            <Button variant="outline" size="sm" className="rounded-xl" disabled={step === 0} onClick={handleBack}>
              <Icons.arrowRight className="mr-1.5 h-3.5 w-3.5 rotate-180" />
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button size="sm" className="rounded-xl" onClick={handleNext}>
                Next
                <Icons.arrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button size="sm" className="rounded-xl" disabled={submitting} onClick={handleSubmit}>
                {submitting ? (
                  <Icons.spinner className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Icons.check className="mr-1.5 h-3.5 w-3.5" />
                )}
                Confirm & Submit
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
