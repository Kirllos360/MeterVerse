"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const TABS = [
  { id: "0", label: "Payment Center" },
  { id: "1", label: "Payment Types" },
  { id: "2", label: "Journal Types" },
  { id: "3", label: "Main Settings" },
  { id: "4", label: "Accounts" },
  { id: "5", label: "Report Settings" },
  { id: "6", label: "Event Log" },
  { id: "7", label: "Error Log" }
]

const CENTERS = [
  { name: "Cairo Main", code: "CAI-01", status: "Active", manager: "Ahmed Hassan", phone: "02-12345678" },
  { name: "October Branch", code: "OCT-01", status: "Active", manager: "Mona Ali", phone: "02-87654321" },
  { name: "New Cairo Branch", code: "NCR-01", status: "Active", manager: "Khaled Omar", phone: "02-11223344" },
  { name: "SODIC Branch", code: "SOD-01", status: "Inactive", manager: "—", phone: "—" }
]

const PAYMENT_TYPES = [
  { name: "Cash", code: "CASH", fee: "0%", enabled: true },
  { name: "Credit Card", code: "CARD", fee: "2.5%", enabled: true },
  { name: "Bank Transfer", code: "BANK", fee: "0.5%", enabled: true },
  { name: "Digital Wallet", code: "WALLET", fee: "1.0%", enabled: true }
]

const JOURNAL_TYPES = [
  { code: "PAY", name: "Payment Received", direction: "Credit" },
  { code: "REF", name: "Refund Issued", direction: "Debit" },
  { code: "ADJ", name: "Adjustment", direction: "Both" },
  { code: "FEE", name: "Service Fee", direction: "Debit" },
  { code: "INT", name: "Interest Applied", direction: "Debit" }
]

const ACCOUNTS = [
  { name: "Main Operating Account", number: "EG-380019000-01", bank: "CIB", balance: "EGP 12,450,000" },
  { name: "Collection Account", number: "EG-380019000-02", bank: "CIB", balance: "EGP 3,200,000" },
  { name: "Settlement Account", number: "EG-380019000-03", bank: "NBE", balance: "EGP 890,000" },
  { name: "Refund Account", number: "EG-380019000-04", bank: "QNB", balance: "EGP 150,000" }
]

const EVENTS = [
  { ts: "2026-07-27 08:00:00", action: "PAYMENT_CENTER_CREATE", detail: "Created SODIC Branch center", user: "admin" },
  { ts: "2026-07-26 15:30:00", action: "TYPE_FEE_UPDATE", detail: "Updated Card fee to 2.5%", user: "admin" },
  { ts: "2026-07-25 11:00:00", action: "ACCOUNT_ADD", detail: "Added refund account QNB", user: "finance" },
  { ts: "2026-07-24 09:00:00", action: "JOURNAL_TYPE_ADD", detail: "Created journal type 'INT'", user: "admin" }
]

const ERRORS = [
  { ts: "2026-07-27 07:45:00", severity: "ERROR", message: "Payment settlement timeout for 5 transactions", source: "Gateway" },
  { ts: "2026-07-26 22:00:00", severity: "WARN", message: "Account EG-380019000-03 below minimum balance", source: "Monitor" },
  { ts: "2026-07-26 13:00:00", severity: "ERROR", message: "Invalid journal type code 'XX' on entry", source: "Journaling" },
  { ts: "2026-07-25 10:00:00", severity: "INFO", message: "Daily settlement completed: EGP 285,000", source: "Settlement" }
]

export default function PaymentSettingsPage() {
  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState("")

  const sevColor = (s: string) => s === "ERROR" ? "#ef4444" : s === "WARN" ? "#f59e0b" : "#3b82f6"

  const table = (headers: string[], rows: (string | React.ReactNode)[][], keyIdx: number = 0) => (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
            {headers.map((h, i) => <th key={i} className={`pb-3 font-semibold ${i < headers.length - 1 ? "pr-4" : ""}`}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b" style={{ borderColor: "var(--border-default)" }}>
              {row.map((cell, ci) => <td key={ci} className={`py-3 ${ci < row.length - 1 ? "pr-4" : ""}`} style={{ color: ci === keyIdx ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: ci === keyIdx ? 600 : 400 }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Payment Settings</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p>
        </div>
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2" /></svg>
        </motion.div>
      </div>

      <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none rounded-2xl border px-3"
        style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            className="shrink-0 px-3 py-1.5 text-xs font-semibold transition-all rounded-xl whitespace-nowrap"
            style={{ backgroundColor: tab === i ? "var(--brand)" : "transparent", color: tab === i ? "#FFFFFF" : "var(--text-secondary)" }}>
            {tab === i && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block mr-1.5" />}
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border p-6" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
        {tab === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-3 mb-4">
              <input type="text" placeholder="Search centers..." value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 rounded-xl border px-3 py-2 text-xs outline-none"
                style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
              <button className="rounded-xl px-3 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>+ Add Center</button>
            </div>
            {table(["Name", "Code", "Status", "Manager", "Phone"], CENTERS.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(c => [
              c.name, c.code,
              <span className={`px-2 py-0.5 rounded-full text-xs ${c.status === "Active" ? "text-green-500" : "text-gray-400"}`} style={{ backgroundColor: c.status === "Active" ? "rgba(34,197,94,0.1)" : "rgba(156,163,175,0.1)" }}>{c.status}</span>,
              c.manager, c.phone
            ]))}
          </motion.div>
        )}
        {tab === 1 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Name", "Code", "Fee", "Enabled"], PAYMENT_TYPES.map(pt => [pt.name, pt.code, pt.fee, <span className={`px-2 py-0.5 rounded-full text-xs ${pt.enabled ? "text-green-500" : "text-gray-400"}`} style={{ backgroundColor: pt.enabled ? "rgba(34,197,94,0.1)" : "rgba(156,163,175,0.1)" }}>{pt.enabled ? "Yes" : "No"}</span>]))}</motion.div>}
        {tab === 2 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Code", "Name", "Direction"], JOURNAL_TYPES.map(j => [j.code, j.name, j.direction]))}</motion.div>}
        {tab === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg space-y-4">
            <div><label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Default Currency</label><input type="text" defaultValue="EGP" className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} /></div>
            <div><label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Payment Grace Period (days)</label><input type="number" defaultValue={15} className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} /></div>
            <div><label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Late Fee (%)</label><input type="number" defaultValue={1.5} step={0.1} className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} /></div>
            <button className="rounded-xl px-4 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>Save Settings</button>
          </motion.div>
        )}
        {tab === 4 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Account Name", "Number", "Bank", "Balance"], ACCOUNTS.map(a => [a.name, a.number, a.bank, a.balance]))}</motion.div>}
        {tab === 5 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Report Format</p>
                <select className="w-full rounded-lg border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}><option>PDF</option><option>CSV</option><option>Excel</option></select>
              </div>
              <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Auto-generate</p>
                <select className="w-full rounded-lg border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}><option>Daily</option><option>Weekly</option><option>Monthly</option></select>
              </div>
            </div>
          </motion.div>
        )}
        {tab === 6 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Timestamp", "Action", "Detail", "User"], EVENTS.map(e => [e.ts, <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{e.action}</span>, e.detail, e.user]))}</motion.div>}
        {tab === 7 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Time", "Severity", "Message", "Source"], ERRORS.map(e => [e.ts, <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${sevColor(e.severity)}20`, color: sevColor(e.severity) }}>{e.severity}</span>, e.message, e.source]))}</motion.div>}
      </div>
    </div>
  )
}
