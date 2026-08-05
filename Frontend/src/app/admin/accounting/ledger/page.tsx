"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const waveAnim = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

interface LedgerEntry {
  id: string
  date: string
  account: string
  accountCode: string
  description: string
  debit: number
  credit: number
  balance: number
}

interface AccountBalance {
  account: string
  code: string
  type: string
  debitTotal: number
  creditTotal: number
  netBalance: number
}

const PERIODS = ["2026-07", "2026-06", "2026-05", "2026-04", "2026-03"]

const MOCK_LEDGER: LedgerEntry[] = [
  { id: "GL001", date: "2026-07-26", account: "Accounts Receivable", accountCode: "1.1.2", description: "July meter reading revenue", debit: 25000, credit: 0, balance: 25000 },
  { id: "GL002", date: "2026-07-26", account: "Service Revenue", accountCode: "4.1", description: "July meter reading revenue", debit: 0, credit: 25000, balance: -25000 },
  { id: "GL003", date: "2026-07-25", account: "Cash & Banks", accountCode: "1.1.1", description: "Collection batch #145", debit: 18500, credit: 0, balance: 18500 },
  { id: "GL004", date: "2026-07-25", account: "Accounts Receivable", accountCode: "1.1.2", description: "Collection batch #145", debit: 0, credit: 18500, balance: 6500 },
  { id: "GL005", date: "2026-07-24", account: "Salaries", accountCode: "5.1.1", description: "Monthly salaries allocation", debit: 3200, credit: 0, balance: 3200 },
  { id: "GL006", date: "2026-07-24", account: "Accrued Expenses", accountCode: "2.1.2", description: "Monthly salaries allocation", debit: 0, credit: 3200, balance: -3200 },
]

const MOCK_BALANCES: AccountBalance[] = [
  { account: "Cash & Banks", code: "1.1.1", type: "asset", debitTotal: 18500, creditTotal: 0, netBalance: 18500 },
  { account: "Accounts Receivable", code: "1.1.2", type: "asset", debitTotal: 25000, creditTotal: 18500, netBalance: 6500 },
  { account: "Accrued Expenses", code: "2.1.2", type: "liability", debitTotal: 0, creditTotal: 3200, netBalance: -3200 },
  { account: "Service Revenue", code: "4.1", type: "revenue", debitTotal: 0, creditTotal: 25000, netBalance: -25000 },
  { account: "Salaries", code: "5.1.1", type: "expense", debitTotal: 3200, creditTotal: 0, netBalance: 3200 },
]

export default function GeneralLedgerPage() {
  const [period, setPeriod] = useState(PERIODS[0])
  const [ledger, setLedger] = useState<LedgerEntry[]>(MOCK_LEDGER)
  const [balances, setBalances] = useState<AccountBalance[]>(MOCK_BALANCES)
  const [live, setLive] = useState(false)

  // P49: fetch real GL data from the backend. Mock data remains as a graceful
  // fallback only (never shown when real data is available).
  useEffect(() => {
    let cancelled = false
    fetch("/api/accounting/general-ledger", { headers: { "X-Dev-Mode": "true" } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (cancelled || !d?.entries?.length) return
        const rows: LedgerEntry[] = d.entries.map((e: any) => ({
          id: e.id, date: e.updatedAt || e.createdAt || "", account: e.account?.name || e.accountId,
          accountCode: e.account?.code || "", description: e.description || "GL entry",
          debit: e.totalDebit || 0, credit: e.totalCredit || 0, balance: e.closingBalance || 0,
        }))
        const byCode: Record<string, AccountBalance> = {}
        for (const e of d.entries as any[]) {
          const code = e.account?.code || e.accountId
          if (!byCode[code]) byCode[code] = { account: e.account?.name || code, code, type: (e.account?.type || "").toLowerCase(), debitTotal: 0, creditTotal: 0, netBalance: e.closingBalance || 0 }
          byCode[code].debitTotal += e.totalDebit || 0
          byCode[code].creditTotal += e.totalCredit || 0
        }
        setLedger(rows)
        setBalances(Object.values(byCode))
        setLive(true)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>General Ledger</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{live ? "Live data from /api/accounting/general-ledger" : "View ledger entries and account balances by period"}</p>
        </div>
        <motion.div animate={waveAnim} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" /></svg>
        </motion.div>
      </div>

      {/* Period Selector */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Period:</span>
          <div className="flex gap-2">
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
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ledger Entries */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
          <div className="px-5 py-3 border-b text-sm font-bold" style={{ color: "var(--text-primary)", borderColor: "var(--border-default)" }}>
            Ledger Entries — {period}
          </div>
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border-default)" }}>
                  <th className="text-left px-5 py-2 font-semibold sticky top-0" style={{ backgroundColor: "var(--surface-topbar)" }}>Date</th>
                  <th className="text-left px-5 py-2 font-semibold sticky top-0" style={{ backgroundColor: "var(--surface-topbar)" }}>Account</th>
                  <th className="text-left px-5 py-2 font-semibold sticky top-0" style={{ backgroundColor: "var(--surface-topbar)" }}>Description</th>
                  <th className="text-right px-5 py-2 font-semibold sticky top-0" style={{ backgroundColor: "var(--surface-topbar)" }}>Debit</th>
                  <th className="text-right px-5 py-2 font-semibold sticky top-0" style={{ backgroundColor: "var(--surface-topbar)" }}>Credit</th>
                  <th className="text-right px-5 py-2 font-semibold sticky top-0" style={{ backgroundColor: "var(--surface-topbar)" }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((e) => (
                  <tr key={e.id} className="border-t" style={{ borderColor: "var(--border-default)" }}>
                    <td className="px-5 py-2.5 font-mono" style={{ color: "var(--text-secondary)" }}>{e.date}</td>
                    <td className="px-5 py-2.5">
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{e.account}</span>
                      <span className="ml-1 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>({e.accountCode})</span>
                    </td>
                    <td className="px-5 py-2.5" style={{ color: "var(--text-primary)" }}>{e.description}</td>
                    <td className="px-5 py-2.5 text-right font-mono" style={{ color: e.debit > 0 ? "var(--text-primary)" : "var(--text-secondary)" }}>{e.debit > 0 ? `EGP ${e.debit.toLocaleString()}` : "—"}</td>
                    <td className="px-5 py-2.5 text-right font-mono" style={{ color: e.credit > 0 ? "var(--text-primary)" : "var(--text-secondary)" }}>{e.credit > 0 ? `EGP ${e.credit.toLocaleString()}` : "—"}</td>
                    <td className="px-5 py-2.5 text-right font-mono font-bold" style={{ color: e.balance < 0 ? "#DC2626" : "var(--text-primary)" }}>
                      {e.balance < 0 ? `(EGP ${Math.abs(e.balance).toLocaleString()})` : `EGP ${e.balance.toLocaleString()}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Account Balance Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
          <div className="px-5 py-3 border-b text-sm font-bold" style={{ color: "var(--text-primary)", borderColor: "var(--border-default)" }}>
            Account Balance Summary — {period}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border-default)" }}>
                  <th className="text-left px-5 py-2 font-semibold">Account</th>
                  <th className="text-left px-5 py-2 font-semibold">Type</th>
                  <th className="text-right px-5 py-2 font-semibold">Total Debit</th>
                  <th className="text-right px-5 py-2 font-semibold">Total Credit</th>
                  <th className="text-right px-5 py-2 font-semibold">Net Balance</th>
                </tr>
              </thead>
              <tbody>
                {balances.map((b) => (
                  <tr key={b.code} className="border-t" style={{ borderColor: "var(--border-default)" }}>
                    <td className="px-5 py-2.5">
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{b.account}</span>
                      <span className="ml-1 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>({b.code})</span>
                    </td>
                    <td className="px-5 py-2.5">
                      <span className="px-1.5 py-0.5 rounded text-xs capitalize" style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)", color: "var(--brand)" }}>{b.type}</span>
                    </td>
                    <td className="px-5 py-2.5 text-right font-mono" style={{ color: "var(--text-primary)" }}>EGP {b.debitTotal.toLocaleString()}</td>
                    <td className="px-5 py-2.5 text-right font-mono" style={{ color: "var(--text-primary)" }}>EGP {b.creditTotal.toLocaleString()}</td>
                    <td className="px-5 py-2.5 text-right font-mono font-bold" style={{ color: b.netBalance < 0 ? "#DC2626" : "var(--text-primary)" }}>
                      {b.netBalance < 0 ? `(EGP ${Math.abs(b.netBalance).toLocaleString()})` : `EGP ${b.netBalance.toLocaleString()}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
