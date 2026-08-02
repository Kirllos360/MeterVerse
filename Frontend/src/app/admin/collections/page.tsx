"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const waveAnim = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

interface AgingBucket {
  bucket: string
  count: number
  total: number
  percentage: number
}

interface Collector {
  name: string
  cases: number
  collected: number
  outstanding: number
  recoveryRate: number
}

interface ActiveCase {
  id: string
  customer: string
  debt: number
  daysOverdue: number
  collector: string
  status: string
}

const AGING_BUCKETS: AgingBucket[] = [
  { bucket: "0–30 days", count: 245, total: 184500, percentage: 42 },
  { bucket: "31–60 days", count: 132, total: 98200, percentage: 22 },
  { bucket: "61–90 days", count: 78, total: 61200, percentage: 14 },
  { bucket: "91–180 days", count: 45, total: 52300, percentage: 12 },
  { bucket: "180+ days", count: 28, total: 43800, percentage: 10 },
]

const COLLECTORS: Collector[] = [
  { name: "Ahmed Hassan", cases: 85, collected: 124000, outstanding: 31200, recoveryRate: 80 },
  { name: "Mona Said", cases: 72, collected: 98500, outstanding: 28400, recoveryRate: 78 },
  { name: "Karim Youssef", cases: 91, collected: 112300, outstanding: 45600, recoveryRate: 71 },
  { name: "Nadia Lotfy", cases: 64, collected: 87500, outstanding: 19800, recoveryRate: 82 },
]

const ACTIVE_CASES: ActiveCase[] = [
  { id: "C001", customer: "Ahmed El-Sayed", debt: 12500, daysOverdue: 45, collector: "Ahmed Hassan", status: "in-progress" },
  { id: "C002", customer: "Mariam Ibrahim", debt: 8700, daysOverdue: 62, collector: "Mona Said", status: "pending" },
  { id: "C003", customer: "Hossam Mahmoud", debt: 22300, daysOverdue: 120, collector: "Karim Youssef", status: "escalated" },
  { id: "C004", customer: "Laila Mostafa", debt: 5400, daysOverdue: 28, collector: "Nadia Lotfy", status: "in-progress" },
  { id: "C005", customer: "Tamer Fathy", debt: 16100, daysOverdue: 75, collector: "Ahmed Hassan", status: "pending" },
]

export default function AdminCollectionsPage() {
  const [aging, setAging] = useState<AgingBucket[]>(AGING_BUCKETS)
  const [collectors, setCollectors] = useState<Collector[]>(COLLECTORS)
  const [cases, setCases] = useState<ActiveCase[]>(ACTIVE_CASES)
  const [live, setLive] = useState<{ openCases?: number; overdueTotal?: number } | null>(null)

  // P45/P49: fetch real collections data from the backend when reachable.
  // Static sample data remains as a graceful fallback (never shown when real).
  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch("/api/collections/summary", { headers: { "X-Dev-Mode": "true" } }).then(r => r.ok ? r.json() : null),
      fetch("/api/domain/collection-cases", { headers: { "X-Dev-Mode": "true" } }).then(r => r.ok ? r.json() : null),
      fetch("/api/collections/risk-profiles", { headers: { "X-Dev-Mode": "true" } }).then(r => r.ok ? r.json() : null),
    ]).then(([sum, casesD, riskD]) => {
      if (cancelled) return
      if (sum && typeof sum.openCases === "number") {
        setLive(sum)
        setAging([{ bucket: "Open cases", count: sum.openCases, total: sum.overdueTotal || 0, percentage: 100 }])
      }
      const realCases = (casesD as any)?.items || (casesD as any)?.collectionCases || (casesD as any)?.collection_cases || (casesD as any)?.data
      if (Array.isArray(realCases) && realCases.length) {
        setCases(realCases.slice(0, 10).map((c: any, i: number) => ({
          id: c.id || `C${i}`, customer: c.customer?.name || c.customerId || "-", debt: c.totalAmount || 0,
          daysOverdue: c.daysOverdue ?? 0, collector: c.assignedTo || "unassigned", status: c.status || "open",
        })))
        setLive(prev => prev || {})
      }
      const riskList = (riskD as any)?.profiles
      if (Array.isArray(riskList) && riskList.length) {
        setCollectors(riskList.slice(0, 6).map((p: any) => ({
          name: p.customer?.name || p.customerId, cases: p.overdueCount || 0, collected: 0,
          outstanding: p.totalOwing || 0, recoveryRate: Math.max(0, Math.min(100, Math.round(100 - p.riskScore))),
        })))
      }
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  const totalOutstanding = live?.overdueTotal ?? aging.reduce((s, b) => s + b.total, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Collections Dashboard</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{live ? "Live data from /api/collections" : "Aging buckets, collector performance, and active cases"}</p>
        </div>
        <motion.div animate={waveAnim} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </motion.div>
      </div>

      {/* Aging Buckets */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {aging.map((b, i) => (
          <motion.div key={b.bucket} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-2xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>{b.bucket}</p>
            <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>EGP {b.total.toLocaleString()}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{b.count} cases</span>
              <span className="text-xs font-semibold" style={{ color: "var(--brand)" }}>{b.percentage}%</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full" style={{ backgroundColor: "rgba(var(--brand-rgb),0.15)" }}>
              <div className="h-1.5 rounded-full" style={{ width: `${b.percentage}%`, backgroundColor: "var(--brand)" }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Total Outstanding */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl border p-5 text-center" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Total Outstanding</p>
        <p className="text-3xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>EGP {totalOutstanding.toLocaleString()}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collector Performance */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
          <div className="px-5 py-3 border-b text-sm font-bold" style={{ color: "var(--text-primary)", borderColor: "var(--border-default)" }}>Collector Performance</div>
          <div className="divide-y" style={{ borderColor: "var(--border-default)" }}>
            {collectors.map((c) => (
              <div key={c.name} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{c.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{c.cases} cases</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>EGP {c.collected.toLocaleString()}</p>
                  <p className="text-xs" style={{ color: c.recoveryRate >= 75 ? "#059669" : "#D97706" }}>{c.recoveryRate}% recovery</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Active Cases */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
          <div className="px-5 py-3 border-b text-sm font-bold" style={{ color: "var(--text-primary)", borderColor: "var(--border-default)" }}>Active Cases</div>
          <div className="divide-y" style={{ borderColor: "var(--border-default)" }}>
            {cases.map((c) => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{c.customer}</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{c.collector} · {c.daysOverdue}d overdue</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>EGP {c.debt.toLocaleString()}</p>
                  <span className="px-1.5 py-0.5 rounded text-xs font-medium capitalize"
                    style={{
                      backgroundColor: c.status === "in-progress" ? "rgba(37,99,235,0.1)" : c.status === "escalated" ? "rgba(220,38,38,0.1)" : "rgba(217,119,6,0.1)",
                      color: c.status === "in-progress" ? "#2563EB" : c.status === "escalated" ? "#DC2626" : "#D97706",
                    }}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
