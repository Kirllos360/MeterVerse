"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorBoundary } from "@/components/effects/ErrorBoundary"

interface UnitData {
  id: string
  name?: string
  code?: string
  type?: string
  status?: string
  area?: string
  address?: string
  floor?: string
  unitNumber?: string
  totalMeters?: number
  totalCustomers?: number
  totalInvoices?: number
  balance?: number
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  inactive: "secondary",
  maintenance: "outline",
  occupied: "default",
  vacant: "secondary",
}

const tabs = ["Overview", "Meters", "Customers", "History"] as const
type Tab = (typeof tabs)[number]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

export default function UnitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<UnitData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>("Overview")

  const load = useCallback(async () => {
    try {
      const res = await apiClient<Record<string, unknown>>(`/api/units/${params.id}`)
      setData((res.unit || res) as UnitData)
    } catch { setData(null) } finally { setLoading(false) }
  }, [params.id])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
  if (!data) return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Unit not found</h2>
      <Button onClick={() => router.back()} className="mt-4">Go back</Button>
    </div>
  )

  const sv = statusVariant[data.status?.toLowerCase() ?? ""] ?? "outline"

  return (
    <ErrorBoundary>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(var(--brand-rgb),0.12)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2"><path d="M3 21h18M3 7v1a3 3 0 003 3h12a3 3 0 003-3V7m-18 0l3-3h12l3 3M3 7l3 3h12l3-3" /><path d="M9 21v-4a3 3 0 016 0v4" /></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{data.name || `Unit ${data.id?.slice(0, 8)}`}</h1>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{data.code || data.unitNumber ? `${data.code || data.unitNumber} · ` : ""}{data.type || "—"}</p>
            </div>
            <Badge variant={sv}>{data.status || "unknown"}</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/units")}>Back to list</Button>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeUp} className="flex gap-1 overflow-x-auto pb-1 border-b" style={{ borderColor: "var(--border-default)" }}>
          {tabs.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="relative px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors"
              style={{ color: activeTab === t ? "var(--brand)" : "var(--text-secondary)", backgroundColor: activeTab === t ? "rgba(var(--brand-rgb),0.08)" : "transparent" }}>
              {t}
              {activeTab === t && <motion.div layoutId="utab" className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ backgroundColor: "var(--brand)" }} />}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        {activeTab === "Overview" && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Meters", value: data.totalMeters ?? "—", icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" },
                { label: "Total Customers", value: data.totalCustomers ?? "—", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" },
                { label: "Total Invoices", value: data.totalInvoices ?? "—", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
                { label: "Balance", value: typeof data.balance === "number" ? `$${data.balance.toLocaleString()}` : "—", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
              ].map((c, i) => (
                <motion.div key={i} variants={fadeUp}
                  className="rounded-2xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2"><path d={c.icon} /></svg>
                    </div>
                    <span className="text-[11px] font-semibold" style={{ color: "var(--text-secondary)" }}>{c.label}</span>
                  </div>
                  <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{typeof c.value === "number" ? c.value.toLocaleString() : c.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Unit Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div variants={fadeUp} className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Unit Information</h3>
                <div className="space-y-3 text-sm">
                  {[
                    ["Unit ID", data.id],
                    ["Name", data.name],
                    ["Code", data.code],
                    ["Unit Number", data.unitNumber],
                    ["Floor", data.floor],
                    ["Type", data.type],
                    ["Status", data.status],
                  ].map(([l, v]) => (
                    <div key={l as string} className="flex justify-between">
                      <span style={{ color: "var(--text-secondary)" }}>{l}</span>
                      <span className="font-medium" style={{ color: "var(--text-primary)" }}>{v ?? "—"}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div variants={fadeUp} className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Location & Timeline</h3>
                <div className="space-y-3 text-sm">
                  {[
                    ["Area", data.area],
                    ["Address", data.address],
                    ["Created", data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "—"],
                    ["Updated", data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : "—"],
                  ].map(([l, v]) => (
                    <div key={l as string} className="flex justify-between">
                      <span style={{ color: "var(--text-secondary)" }}>{l}</span>
                      <span className="font-medium" style={{ color: "var(--text-primary)" }}>{v ?? "—"}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab !== "Overview" && (
          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-2xl border p-8 text-center" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{activeTab} content loading...</p>
          </motion.div>
        )}
      </motion.div>
    </ErrorBoundary>
  )
}
