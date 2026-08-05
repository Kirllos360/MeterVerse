"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const waveAnim = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

interface TrialBalanceRow {
  code: string
  account: string
  type: string
  debit: number
  credit: number
}

const PERIODS = ["2026-07", "2026-06", "2026-05", "2026-04", "2026-03"]

const MOCK_TB: TrialBalanceRow[] = [
  { code: "1.1.1", account: "Cash & Banks", type: "asset", debit: 820000, credit: 0 },
  { code: "1.1.2", account: "Accounts Receivable", type: "asset", debit: 680000, credit: 0 },
  { code: "1.1.3", account: "Inventory", type: "asset", debit: 350000, credit: 0 },
  { code: "1.2.1", account: "Buildings", type: "asset", debit: 1800000, credit: 0 },
  { code: "1.2.2", account: "Equipment", type: "asset", debit: 520000, credit: 0 },
  { code: "1.2.3", account: "Vehicles", type: "asset", debit: 350000, credit: 0 },
  { code: "2.1.1", account: "Accounts Payable", type: "liability", debit: 0, credit: 620000 },
  { code: "2.1.2", account: "Accrued Expenses", type: "liability", debit: 0, credit: 360000 },
  { code: "2.2.1", account: "Bank Loans", type: "liability", debit: 0, credit: 900000 },
  { code: "2.2.2", account: "Bonds Payable", type: "liability", debit: 0, credit: 300000 },
  { code: "3.1", account: "Capital", type: "equity", debit: 0, credit: 1500000 },
  { code: "3.2", account: "Retained Earnings", type: "equity", debit: 0, credit: 640000 },
  { code: "3.3", account: "Reserves", type: "equity", debit: 0, credit: 200000 },
  { code: "4.1", account: "Service Revenue", type: "revenue", debit: 0, credit: 850000 },
  { code: "4.2", account: "Interest Income", type: "revenue", debit: 0, credit: 400000 },
  { code: "5.1.1", account: "Salaries", type: "expense", debit: 320000, credit: 0 },
  { code: "5.1.2", account: "Utilities", type: "expense", debit: 120000, credit: 0 },
  { code: "5.1.3", account: "Rent", type: "expense", debit: 80000, credit: 0 },
  { code: "5.2", account: "Non-Operating Expenses", type: "expense", debit: 370000, credit: 0 },
]

export default function TrialBalancePage() {
  const [period, setPeriod] = useState(PERIODS[0])
  const [rows, setRows] = useState<TrialBalanceRow[]>(MOCK_TB)
  const [live, setLive] = useState(false)

  // P49: fetch real trial balance via the latest open financial period.
  useEffect(() => {
    let cancelled = false
    fetch("/api/accounting/financial-periods", { headers: { "X-Dev-Mode": "true" } })
      .then(r => r.ok ? r.json() : null)
      .then(per => {
        if (cancelled || !per?.periods?.length) return
        const latest = per.periods[0]
        setPeriod(`${latest.year}-${String(latest.month).padStart(2, "0")}`)
        return fetch(`/api/accounting/trial-balance?periodId=${latest.id}`, { headers: { "X-Dev-Mode": "true" } })
      })
      .then(r => (r && r.ok ? r.json() : null))
      .then(tb => {
        if (cancelled || !tb?.rows?.length) return
        const mapped: TrialBalanceRow[] = tb.rows.map((r: any) => ({
          code: r.code, account: r.name, type: (r.type || "").toLowerCase(),
          debit: r.totalDebit || (r.closingBalance > 0 ? r.closingBalance : 0),
          credit: r.totalCredit || (r.closingBalance < 0 ? Math.abs(r.closingBalance) : 0),
        }))
        setRows(mapped.filter(r => r.code))
        setLive(true)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const totalDebit = rows.reduce((s, r) => s + r.debit, 0)
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0)
  const balanced = totalDebit === totalCredit

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Trial Balance</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Account balances, debits, and credits by period</p>
        </div>
        <motion.div animate={waveAnim} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
        </motion.div>
      </div>

      {/* Period Selector + Balance Status */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="sm:col-span-3"
          style={{}}>
          <div className="rounded-2xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Period:</span>
              <div className="flex gap-2 flex-wrap">
                {PERIODS.map((p) => (
                  <motion.button key={p} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setPeriod(p)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: p === period ? "var(--brand)" : "rgba(var(--brand-rgb),0.1)",
                      color: p === period ? "white" : "var(--text-primary)",
                    }}>
                    {p}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="rounded-2xl border p-4 text-center h-full flex flex-col justify-center" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
            <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Status</p>
            <p className="text-sm font-bold mt-1" style={{ color: balanced ? "#DC2626" : "#DC2626" }}>
              {balanced ? "✓ Balanced" : "✗ Unbalanced"}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Trial Balance Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <div className="px-5 py-3 border-b text-sm font-bold" style={{ color: "var(--text-primary)", borderColor: "var(--border-default)" }}>
          Account Balances — {period}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border-default)" }}>
                <th className="text-left px-5 py-2 font-semibold">Code</th>
                <th className="text-left px-5 py-2 font-semibold">Account</th>
                <th className="text-left px-5 py-2 font-semibold">Type</th>
                <th className="text-right px-5 py-2 font-semibold">Debit</th>
                <th className="text-right px-5 py-2 font-semibold">Credit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.code} className="border-t" style={{ borderColor: "var(--border-default)" }}>
                  <td className="px-5 py-2.5 font-mono" style={{ color: "var(--text-secondary)" }}>{r.code}</td>
                  <td className="px-5 py-2.5 font-semibold" style={{ color: "var(--text-primary)" }}>{r.account}</td>
                  <td className="px-5 py-2.5">
                    <span className="px-1.5 py-0.5 rounded text-xs capitalize" style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)", color: "var(--brand)" }}>{r.type}</span>
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono" style={{ color: r.debit > 0 ? "var(--text-primary)" : "var(--text-secondary)" }}>
                    {r.debit > 0 ? `EGP ${r.debit.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono" style={{ color: r.credit > 0 ? "var(--text-primary)" : "var(--text-secondary)" }}>
                    {r.credit > 0 ? `EGP ${r.credit.toLocaleString()}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "2px solid var(--brand)", backgroundColor: "rgba(var(--brand-rgb),0.05)" }}>
                <td className="px-5 py-3 font-bold text-xs" style={{ color: "var(--text-primary)" }} colSpan={3}>Totals</td>
                <td className="px-5 py-3 text-right font-bold font-mono text-xs" style={{ color: "var(--text-primary)" }}>
                  EGP {totalDebit.toLocaleString()}
                </td>
                <td className="px-5 py-3 text-right font-bold font-mono text-xs" style={{ color: "var(--text-primary)" }}>
                  EGP {totalCredit.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-4 text-center" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
          <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Total Debits</p>
          <p className="text-xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>EGP {totalDebit.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border p-4 text-center" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
          <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Total Credits</p>
          <p className="text-xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>EGP {totalCredit.toLocaleString()}</p>
        </div>
      </motion.div>
    </div>
  )
}
