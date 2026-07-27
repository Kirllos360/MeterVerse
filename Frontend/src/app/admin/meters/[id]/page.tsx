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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface MeterData {
  id: string
  serial?: string
  type?: string
  status?: string
  area?: string
  location?: string
  model?: string
  manufacturer?: string
  firmware?: string
  protocol?: string
  customer?: { name?: string; id?: string }
  customerId?: string
  simId?: string
  lastReading?: number
  lastReadingAt?: string
  totalReadings?: number
  alerts?: number
  totalEvents?: number
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  inactive: "secondary",
  maintenance: "outline",
  retired: "destructive",
}

const tabs = ["Overview", "Readings", "Events", "SIM", "Assignments", "Configuration"] as const
type Tab = (typeof tabs)[number]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

export default function MeterDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<MeterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>("Overview")
  const [terminating, setTerminating] = useState(false)
  const [termReason, setTermReason] = useState("")
  const [termFinalReading, setTermFinalReading] = useState("")

  const load = useCallback(async () => {
    try {
      const res = await apiClient<Record<string, unknown>>(`/api/meters/${params.id}`)
      setData((res.meter || res) as MeterData)
    } catch { setData(null) } finally { setLoading(false) }
  }, [params.id])

  useEffect(() => { load() }, [load])

  const handleTerminate = async () => {
    if (!termReason.trim()) { toast.error("Reason is required"); return }
    setTerminating(true)
    try {
      const body: Record<string, unknown> = { reason: termReason }
      if (termFinalReading) body.finalReading = Number(termFinalReading)
      await apiClient(`/api/meters/${params.id}/terminate`, { method: "POST", body: JSON.stringify(body) })
      toast.success("Meter terminated")
      setTermReason(""); setTermFinalReading("")
      load()
    } catch (e: any) { toast.error(e.message || "Termination failed") }
    finally { setTerminating(false) }
  }

  if (loading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
  if (!data) return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Meter not found</h2>
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2">
                <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{data.serial || data.id?.slice(0, 8) || "Meter"}</h1>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{data.type || "—"} meter {data.area ? `· ${data.area}` : ""}</p>
            </div>
            <Badge variant={sv}>{data.status || "unknown"}</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/meters")}>Back to list</Button>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeUp} className="flex gap-1 overflow-x-auto pb-1 border-b" style={{ borderColor: "var(--border-default)" }}>
          {tabs.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="relative px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors"
              style={{ color: activeTab === t ? "var(--brand)" : "var(--text-secondary)", backgroundColor: activeTab === t ? "rgba(var(--brand-rgb),0.08)" : "transparent" }}>
              {t}
              {activeTab === t && <motion.div layoutId="mtab" className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ backgroundColor: "var(--brand)" }} />}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        {activeTab === "Overview" && (
          <motion.div key="mt-overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Last Reading", value: typeof data.lastReading === "number" ? data.lastReading.toLocaleString() : "—", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
                { label: "Total Readings", value: data.totalReadings ?? "—", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
                { label: "Active Alerts", value: data.alerts ?? "—", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" },
                { label: "Total Events", value: data.totalEvents ?? "—", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
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

            {/* Meter Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div variants={fadeUp} className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Meter Information</h3>
                <div className="space-y-3 text-sm">
                  {[
                    ["Meter ID", data.id],
                    ["Serial Number", data.serial],
                    ["Type", data.type],
                    ["Model", data.model],
                    ["Manufacturer", data.manufacturer],
                    ["Firmware", data.firmware],
                    ["Protocol", data.protocol],
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
                <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary)" }}>Installation & Assignment</h3>
                <div className="space-y-3 text-sm">
                  {[
                    ["Area", data.area || data.location],
                    ["Customer", data.customer?.name || data.customerId],
                    ["SIM ID", data.simId],
                    ["Last Reading At", data.lastReadingAt ? new Date(data.lastReadingAt).toLocaleString() : "—"],
                    ["Created", data.createdAt ? new Date(data.createdAt).toLocaleString() : "—"],
                    ["Updated", data.updatedAt ? new Date(data.updatedAt).toLocaleString() : "—"],
                  ].map(([l, v]) => (
                    <div key={l as string} className="flex justify-between">
                      <span style={{ color: "var(--text-secondary)" }}>{l}</span>
                      <span className="font-medium" style={{ color: "var(--text-primary)" }}>{v ?? "—"}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--border-default)" }}>
                  {data.status !== "retired" && (
                    <AlertDialog>
                      <AlertDialogTrigger>
                        <Button variant="destructive" size="sm">Terminate Meter</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Terminate Meter</AlertDialogTitle>
                          <AlertDialogDescription>This will retire the meter and release any assigned SIM.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-3 py-2">
                          <div><Label htmlFor="reason">Reason</Label><Input id="reason" value={termReason} onChange={e => setTermReason(e.target.value)} placeholder="e.g. Meter faulty, customer moved" /></div>
                          <div><Label htmlFor="finalReading">Final Reading (optional)</Label><Input id="finalReading" type="number" value={termFinalReading} onChange={e => setTermFinalReading(e.target.value)} placeholder="e.g. 12345" /></div>
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => { setTermReason(""); setTermFinalReading("") }}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleTerminate} disabled={terminating || !termReason.trim()}>
                            {terminating ? "Terminating..." : "Confirm Termination"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
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
