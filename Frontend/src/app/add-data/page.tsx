"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { AnalyticsBar } from "@/features/charts/AnalyticsBar"
import { toast } from "sonner"
import { apiBackend } from "@/lib/api-client"

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

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  users: Icons.users,
  settings: Icons.settings,
  chart: Icons.chart,
  clipboard: Icons.clipboard,
  creditCard: Icons.creditCard,
}

interface SearchOption {
  id: string
  label: string
  sub: string
}

interface KpiTotals {
  customers: number
  meters: number
  readings: number
  invoices: number
  payments: number
}

const FIELD_MAP: Record<TabId, { key: string; label: string; required?: boolean; type?: string; hint?: string }[]> = {
  customers: [
    { key: "name", label: "Name", required: true },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Phone" },
    { key: "address", label: "Address" },
    { key: "area", label: "Area" },
  ],
  meters: [
    { key: "serial", label: "Serial", required: true },
    { key: "type", label: "Type", required: true, hint: "e.g. LP2, solar, water" },
    { key: "location", label: "Location" },
    { key: "area", label: "Area" },
    { key: "status", label: "Status", hint: "active / inactive" },
  ],
  readings: [
    { key: "value", label: "Value", required: true, type: "number" },
    { key: "unit", label: "Unit", hint: "default kWh" },
    { key: "source", label: "Source" },
  ],
  invoices: [
    { key: "number", label: "Number", required: true },
    { key: "amount", label: "Amount", required: true, type: "number" },
    { key: "status", label: "Status", hint: "default pending" },
  ],
  payments: [
    { key: "amount", label: "Amount", required: true, type: "number" },
    { key: "method", label: "Method", required: true, hint: "cash / cheque / bank_transfer / mobile_wallet / online / card" },
    { key: "reference", label: "Reference" },
    { key: "notes", label: "Notes" },
  ],
}

const SUBMIT_PATH: Record<TabId, string> = {
  customers: "/api/customers",
  meters: "/api/meters",
  readings: "/api/readings",
  invoices: "/api/invoices",
  payments: "/api/payments",
}

const SEARCH_PATH: Record<TabId, string> = {
  customers: "/api/customers?limit=50&search=",
  meters: "/api/meters?limit=50&search=",
  readings: "/api/meters?limit=50&search=",
  invoices: "/api/customers?limit=50&search=",
  payments: "/api/customers?limit=50&search=",
}

function optionFor(tab: TabId, item: Record<string, any>): SearchOption {
  if (tab === "meters" || tab === "readings") {
    return { id: item.id, label: `${item.serial ?? item.id}`, sub: `${item.type ?? "meter"} Â· ${item.customer?.name ?? "unassigned"}` }
  }
  return { id: item.id, label: item.name ?? item.number ?? item.id, sub: item.email ?? item.phone ?? "" }
}

export default function AddDataPage() {
  const [activeTab, setActiveTab] = useState<TabId>("customers")
  const [step, setStep] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [options, setOptions] = useState<SearchOption[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<SearchOption | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [totals, setTotals] = useState<KpiTotals | null>(null)

  const loadTotals = useCallback(async () => {
    const zero: { total?: number } = {}
    try {
      const [c, m, r, i, p] = await Promise.all([
        apiBackend<{ total?: number }>("/api/customers?limit=1").catch(() => zero),
        apiBackend<{ total?: number }>("/api/meters?limit=1").catch(() => zero),
        apiBackend<{ total?: number }>("/api/readings?limit=1").catch(() => zero),
        apiBackend<{ total?: number }>("/api/invoices?limit=1").catch(() => zero),
        apiBackend<{ total?: number }>("/api/payments?limit=1").catch(() => zero),
      ])
      setTotals({ customers: c.total ?? 0, meters: m.total ?? 0, readings: r.total ?? 0, invoices: i.total ?? 0, payments: p.total ?? 0 })
    } catch {
      setTotals(null)
    }
  }, [])

  const loadOptions = useCallback(async () => {
    setLoading(true)
    try {
      const path = SEARCH_PATH[activeTab]
      const data = await apiBackend<Record<string, any[]>>(path + encodeURIComponent(searchQuery)).catch(() => null)
      const key = activeTab === "customers" || activeTab === "invoices" || activeTab === "payments" ? "customers"
        : activeTab === "readings" || activeTab === "meters" ? "meters" : ""
      const items = (data?.[key] ?? []).slice(0, 50)
      setOptions(items.map((it) => optionFor(activeTab, it)))
    } catch {
      setOptions([])
    } finally {
      setLoading(false)
    }
  }, [activeTab, searchQuery])

  useEffect(() => {
    if (step === 0) loadOptions()
  }, [step, activeTab, searchQuery, loadOptions])

  useEffect(() => {
    loadTotals()
  }, [loadTotals])

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
    setStep(0)
    setSearchQuery("")
    setSelectedEntity(null)
    setFormData({})
  }

  const handleNext = () => {
    if (step === 0 && !selectedEntity) {
      toast.error("Please select an entity first")
      return
    }
    if (step === 1) {
      const required = FIELD_MAP[activeTab].filter((f) => f.required)
      const missing = required.filter((f) => !(formData[f.key] ?? "").trim())
      if (missing.length) {
        toast.error(`Required: ${missing.map((m) => m.label).join(", ")}`)
        return
      }
    }
    if (step < STEPS.length - 1) setStep((s) => s + 1)
  }

  const handleSubmit = async () => {
    const entityId = selectedEntity?.id ?? ""
    let payload: Record<string, any> = {}
    const base = activeTab === "readings" || activeTab === "invoices" || activeTab === "payments" ? { customerId: entityId } : {}
    const baseMeter = activeTab === "readings" ? { meterId: entityId } : {}

    for (const f of FIELD_MAP[activeTab]) {
      const raw = (formData[f.key] ?? "").trim()
      if (raw === "") continue
      payload[f.key] = f.type === "number" ? Number(raw) : raw
    }
    if (activeTab === "readings") payload = { ...baseMeter, ...payload }
    else if (activeTab === "invoices" || activeTab === "payments") payload = { ...base, ...payload }
    else if (activeTab === "customers" || activeTab === "meters") payload = { ...payload }

    setSubmitting(true)
    try {
      await apiBackend(SUBMIT_PATH[activeTab], { method: "POST", body: JSON.stringify(payload) })
      toast.success(`${activeTab.slice(0, -1)} ${selectedEntity?.label ?? ""} saved`)
      setStep(0)
      setSelectedEntity(null)
      setFormData({})
      setSearchQuery("")
      loadTotals()
      loadOptions()
    } catch (e: any) {
      toast.error(e?.message || `Failed to submit ${activeTab}`)
    } finally {
      setSubmitting(false)
    }
  }

  const kpiCards = [
    { label: "Customers", value: totals?.customers, icon: Icons.users },
    { label: "Meters", value: totals?.meters, icon: Icons.settings },
    { label: "Readings", value: totals?.readings, icon: Icons.chart },
    { label: "Invoices", value: totals?.invoices, icon: Icons.clipboard },
    { label: "Payments", value: totals?.payments, icon: Icons.creditCard },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Add Data</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Submit new customers, meters, readings, invoices and payments</p>
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
        data1={[
          { name: "Customers", value: totals?.customers ?? 0 },
          { name: "Meters", value: totals?.meters ?? 0 },
          { name: "Readings", value: totals?.readings ?? 0 },
          { name: "Invoices", value: totals?.invoices ?? 0 },
          { name: "Payments", value: totals?.payments ?? 0 },
        ]}
        data2={[
          { name: "Customers", value: totals?.customers ?? 0 },
          { name: "Invoices", value: totals?.invoices ?? 0 },
        ]}
        data3={[
          { name: "Readings", value: totals?.readings ?? 0 },
          { name: "Payments", value: totals?.payments ?? 0 },
        ]}
      />

      <div className="grid grid-cols-5 gap-4">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border p-4 flex items-center gap-3"
            style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
              <kpi.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{kpi.label}</p>
              <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{kpi.value ?? "â€”"}</p>
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
                    {loading && <p className="text-sm px-3 py-2" style={{ color: "var(--text-tertiary)" }}>Loadingâ€¦</p>}
                    {!loading && options.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setSelectedEntity(o)}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex justify-between items-center"
                        style={{
                          backgroundColor: selectedEntity?.id === o.id ? "var(--brand)" : "transparent",
                          color: selectedEntity?.id === o.id ? "#fff" : "var(--text-primary)",
                        }}
                      >
                        <span>{o.label}</span>
                        {o.sub && (
                          <span className="text-xs" style={{ color: selectedEntity?.id === o.id ? "#fff" : "var(--text-tertiary)" }}>
                            {o.sub}
                          </span>
                        )}
                      </button>
                    ))}
                    {!loading && options.length === 0 && (
                      <p className="text-sm px-3 py-2" style={{ color: "var(--text-tertiary)" }}>No results</p>
                    )}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-3">
                  <div className="rounded-xl border px-3 py-2 mb-3 text-sm" style={{ borderColor: "var(--border-default)" }}>
                    <span style={{ color: "var(--text-tertiary)" }}>{activeTab === "readings" ? "Meter" : "Entity"}: </span>
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>{selectedEntity?.label ?? "â€”"}</span>
                  </div>
                  {FIELD_MAP[activeTab].map((field) => (
                    <div key={field.key}>
                      <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>
                        {field.label} {field.required && <span style={{ color: "var(--brand)" }}>*</span>}
                        {field.hint && <span className="ml-2" style={{ color: "var(--text-tertiary)" }}>{field.hint}</span>}
                      </label>
                      <Input
                        className="rounded-xl h-9"
                        type={field.type ?? "text"}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        value={formData[field.key] ?? ""}
                        onChange={(e) => setFormData((d) => ({ ...d, [field.key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Review</p>
                  {[
                    { label: activeTab === "readings" ? "Meter" : "Entity", value: selectedEntity?.label ?? "â€”" },
                    ...Object.entries(formData)
                      .filter(([k, v]) => (v ?? "").trim() !== "")
                      .map(([k, v]) => ({ label: k, value: v })),
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-1.5 border-b text-sm" style={{ borderColor: "var(--border-default)" }}>
                      <span style={{ color: "var(--text-tertiary)" }}>{label}</span>
                      <span className="font-medium" style={{ color: "var(--text-primary)" }}>{value || "â€”"}</span>
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
            <Button variant="outline" size="sm" className="rounded-xl" disabled={step === 0} onClick={() => step > 0 && setStep((s) => s - 1)}>
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

