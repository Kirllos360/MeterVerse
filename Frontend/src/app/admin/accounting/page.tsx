"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { EnhancedListPage } from "@/features/grid/EnhancedListPage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const waveAnim = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

export default function AccountingDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/accounting/financial-periods").then(r => r.json()).catch(() => ({ periods: [] })),
      fetch("/api/accounting/general-ledger/summary").then(r => r.json()).catch(() => ({})),
    ]).then(([periods, ledger]) => {
      setStats({ periods, ledger })
      setLoading(false)
    })
  }, [])

  return (
    <EnhancedListPage
      title="Accounting"
      description="Financial management & reporting"
      chartConfigs={{
        title: "Financial Overview",
        data1: [{name:"Jan",value:185000},{name:"Feb",value:192000},{name:"Mar",value:210000},{name:"Apr",value:198000},{name:"May",value:225000},{name:"Jun",value:240000}],
        data2: [{name:"Assets",value:45},{name:"Liabilities",value:28},{name:"Equity",value:32},{name:"Revenue",value:55}],
        data3: [{name:"Open",value:3},{name:"Closed",value:8},{name:"Pending",value:2}],
      }}
      toolbarConfig={{
        sortOptions: [{value:"date",label:"Date"},{value:"amount",label:"Amount"},{value:"type",label:"Type"}],
        filterOptions: [{value:"all",label:"All"},{value:"open",label:"Open"},{value:"closed",label:"Closed"}],
      }}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Accounts", value: stats?.ledger?.accountCount || "—", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" },
            { label: "Journal Entries", value: stats?.ledger?.journalCount || "—", icon: "M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l4 4h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
            { label: "Open Period", value: stats?.periods?.periods?.filter((p: any) => p.status === "OPEN").length || "—", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
            { label: "Trial Balance", value: stats?.periods?.periods?.filter((p: any) => p.status === "CLOSED").length ? "Balanced" : "Pending", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          ].map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2"><path d={c.icon} /></svg>
                </div>
                <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{c.label}</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{c.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { label: "Chart of Accounts", href: "/admin/accounting" },
              { label: "New Journal Entry", href: "/admin/accounting" },
              { label: "Trial Balance", href: "/admin/accounting" },
              { label: "General Ledger", href: "/admin/accounting" },
              { label: "Financial Periods", href: "/admin/accounting" },
              { label: "GL Summary", href: "/admin/accounting" },
            ].map((a, i) => (
              <motion.button key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all"
                style={{ backgroundColor: "var(--brand)" }}>
                {a.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </EnhancedListPage>
  )
}
