"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const waveAnim = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

interface JournalLine {
  id: string
  account: string
  accountCode: string
  debit: number
  credit: number
}

interface JournalEntry {
  id: string
  description: string
  date: string
  period: string
  status: "posted" | "draft" | "reversed"
  totalDebit: number
  totalCredit: number
  lines: number
}

const MOCK_LINES: JournalLine[] = [
  { id: "L1", account: "Accounts Receivable", accountCode: "1.1.2", debit: 25000, credit: 0 },
  { id: "L2", account: "Service Revenue", accountCode: "4.1", debit: 0, credit: 25000 },
]

const MOCK_ENTRIES: JournalEntry[] = [
  { id: "JE-2026-001", description: "July 2026 meter reading revenue accrual", date: "2026-07-26", period: "2026-07", status: "posted", totalDebit: 25000, totalCredit: 25000, lines: 2 },
  { id: "JE-2026-002", description: "Customer payment collection batch #145", date: "2026-07-25", period: "2026-07", status: "posted", totalDebit: 18500, totalCredit: 18500, lines: 4 },
  { id: "JE-2026-003", description: "Utility expense allocation", date: "2026-07-24", period: "2026-07", status: "draft", totalDebit: 3200, totalCredit: 3200, lines: 3 },
  { id: "JE-2026-004", description: "Fixed asset depreciation - July", date: "2026-07-23", period: "2026-07", status: "posted", totalDebit: 8400, totalCredit: 8400, lines: 5 },
  { id: "JE-2026-005", description: "Reversal of incorrect entry JE-2026-003", date: "2026-07-24", period: "2026-07", status: "reversed", totalDebit: 3200, totalCredit: 3200, lines: 3 },
]

export default function JournalEntryPage() {
  const [lines, setLines] = useState<JournalLine[]>(MOCK_LINES)
  const [entries, setEntries] = useState<JournalEntry[]>(MOCK_ENTRIES)
  const [live, setLive] = useState(false)

  // P49: fetch real journal entries. Mock data is graceful fallback only.
  useEffect(() => {
    let cancelled = false
    fetch("/api/accounting/journal-entries", { headers: { "X-Dev-Mode": "true" } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (cancelled || !d?.entries?.length) return
        const list: JournalEntry[] = d.entries.map((e: any) => ({
          id: e.entryNumber || e.id, description: e.description, date: e.entryDate || e.createdAt,
          period: e.periodId || "", status: (e.status || "posted").toLowerCase(),
          totalDebit: e.totalDebit || 0, totalCredit: e.totalCredit || 0, lines: e.lines?.length || 0,
        }))
        const first = d.entries[0]
        if (first?.lines?.length) {
          setLines(first.lines.map((l: any) => ({ id: l.id, account: l.account?.name || l.accountId, accountCode: l.account?.code || "", debit: l.debitAmount || 0, credit: l.creditAmount || 0 })))
        }
        setEntries(list)
        setLive(true)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const totalDebit = lines.reduce((s, l) => s + l.debit, 0)
  const totalCredit = lines.reduce((s, l) => s + l.credit, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Journal Entry</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Create and manage journal entries</p>
        </div>
        <motion.div animate={waveAnim} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Journal Entry Form */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>New Entry</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>Description</label>
                <div className="rounded-xl border px-3 py-2 text-xs" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)", backgroundColor: "rgba(var(--brand-rgb),0.03)" }}>
                  Enter description...
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>Date</label>
                  <div className="rounded-xl border px-3 py-2 text-xs" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)", backgroundColor: "rgba(var(--brand-rgb),0.03)" }}>
                    2026-07-26
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>Period</label>
                  <div className="rounded-xl border px-3 py-2 text-xs" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)", backgroundColor: "rgba(var(--brand-rgb),0.03)" }}>
                    2026-07
                  </div>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>
                Save as Draft
              </motion.button>
            </div>
          </motion.div>

          {/* Line Items */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
            <div className="px-5 py-3 border-b text-sm font-bold" style={{ color: "var(--text-primary)", borderColor: "var(--border-default)" }}>Line Items</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border-default)" }}>
                    <th className="text-left px-5 py-2 font-semibold">Account</th>
                    <th className="text-left px-5 py-2 font-semibold">Code</th>
                    <th className="text-right px-5 py-2 font-semibold">Debit</th>
                    <th className="text-right px-5 py-2 font-semibold">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.id} className="border-t" style={{ borderColor: "var(--border-default)" }}>
                      <td className="px-5 py-2.5" style={{ color: "var(--text-primary)" }}>{l.account}</td>
                      <td className="px-5 py-2.5 font-mono" style={{ color: "var(--text-secondary)" }}>{l.accountCode}</td>
                      <td className="px-5 py-2.5 text-right font-mono" style={{ color: l.debit > 0 ? "var(--text-primary)" : "var(--text-secondary)" }}>{l.debit > 0 ? `EGP ${l.debit.toLocaleString()}` : "—"}</td>
                      <td className="px-5 py-2.5 text-right font-mono" style={{ color: l.credit > 0 ? "var(--text-primary)" : "var(--text-secondary)" }}>{l.credit > 0 ? `EGP ${l.credit.toLocaleString()}` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "2px solid var(--brand)", backgroundColor: "rgba(var(--brand-rgb),0.05)" }}>
                    <td className="px-5 py-2.5 font-bold text-xs" style={{ color: "var(--text-primary)" }}>Totals</td>
                    <td className="px-5 py-2.5" />
                    <td className="px-5 py-2.5 text-right font-bold font-mono text-xs" style={{ color: totalDebit === totalCredit ? "#059669" : "#DC2626" }}>
                      EGP {totalDebit.toLocaleString()}
                    </td>
                    <td className="px-5 py-2.5 text-right font-bold font-mono text-xs" style={{ color: totalDebit === totalCredit ? "#059669" : "#DC2626" }}>
                      EGP {totalCredit.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {totalDebit === totalCredit ? (
              <div className="px-5 py-2 text-xs font-semibold" style={{ color: "#059669", backgroundColor: "rgba(5,150,105,0.05)" }}>✓ Balanced</div>
            ) : (
              <div className="px-5 py-2 text-xs font-semibold" style={{ color: "#DC2626", backgroundColor: "rgba(220,38,38,0.05)" }}>✗ Unbalanced (difference: EGP {Math.abs(totalDebit - totalCredit).toLocaleString()})</div>
            )}
          </motion.div>
        </div>

        {/* Entry List */}
        <div className="lg:col-span-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
            <div className="px-5 py-3 border-b text-sm font-bold" style={{ color: "var(--text-primary)", borderColor: "var(--border-default)" }}>Journal Entries</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border-default)" }}>
                    <th className="text-left px-5 py-2 font-semibold">Entry ID</th>
                    <th className="text-left px-5 py-2 font-semibold">Description</th>
                    <th className="text-left px-5 py-2 font-semibold">Date</th>
                    <th className="text-left px-5 py-2 font-semibold">Period</th>
                    <th className="text-left px-5 py-2 font-semibold">Status</th>
                    <th className="text-right px-5 py-2 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id} className="border-t" style={{ borderColor: "var(--border-default)" }}>
                      <td className="px-5 py-2.5 font-mono font-semibold" style={{ color: "var(--text-primary)" }}>{e.id}</td>
                      <td className="px-5 py-2.5" style={{ color: "var(--text-primary)" }}>{e.description}</td>
                      <td className="px-5 py-2.5 font-mono" style={{ color: "var(--text-secondary)" }}>{e.date}</td>
                      <td className="px-5 py-2.5 font-mono" style={{ color: "var(--text-secondary)" }}>{e.period}</td>
                      <td className="px-5 py-2.5">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                          style={{
                            backgroundColor: e.status === "posted" ? "rgba(5,150,105,0.1)" : e.status === "draft" ? "rgba(217,119,6,0.1)" : "rgba(220,38,38,0.1)",
                            color: e.status === "posted" ? "#059669" : e.status === "draft" ? "#D97706" : "#DC2626",
                          }}>
                          {e.status}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-right font-mono" style={{ color: "var(--text-primary)" }}>EGP {e.totalDebit.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
