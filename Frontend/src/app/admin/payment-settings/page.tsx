"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getPaymentGateways, getEvents, getErrors, saveSetting } from "@/features/admin-settings/api/service"

const TABS = [{ id: "0", label: "Payment Center" }, { id: "1", label: "Payment Types" }, { id: "2", label: "Journal Types" }, { id: "3", label: "Main Settings" }, { id: "4", label: "Accounts" }, { id: "5", label: "Report Settings" }, { id: "6", label: "Event Log" }, { id: "7", label: "Error Log" }]

const CENTERS = [
  { name: "Cairo Main", code: "CAI-01", status: "Active", manager: "Ahmed Hassan", phone: "02-12345678" },
  { name: "October Branch", code: "OCT-01", status: "Active", manager: "Mona Ali", phone: "02-87654321" },
  { name: "New Cairo Branch", code: "NCR-01", status: "Active", manager: "Khaled Omar", phone: "02-11223344" },
  { name: "SODIC Branch", code: "SOD-01", status: "Inactive", manager: "â€”", phone: "â€”" }
]
const TYPES = [
  { name: "Cash", code: "CASH", fee: "0%", enabled: true }, { name: "Credit Card", code: "CARD", fee: "2.5%", enabled: true },
  { name: "Bank Transfer", code: "BANK", fee: "0.5%", enabled: true }, { name: "Digital Wallet", code: "WALLET", fee: "1.0%", enabled: true }
]
const JOURNALS = [
  { code: "PAY", name: "Payment Received", direction: "Credit" }, { code: "REF", name: "Refund Issued", direction: "Debit" },
  { code: "ADJ", name: "Adjustment", direction: "Both" }, { code: "FEE", name: "Service Fee", direction: "Debit" }
]
const ACCOUNTS = [
  { name: "Main Operating Account", number: "EG-380019000-01", bank: "CIB", balance: "EGP 12,450,000" },
  { name: "Collection Account", number: "EG-380019000-02", bank: "CIB", balance: "EGP 3,200,000" },
  { name: "Settlement Account", number: "EG-380019000-03", bank: "NBE", balance: "EGP 890,000" },
  { name: "Refund Account", number: "EG-380019000-04", bank: "QNB", balance: "EGP 150,000" }
]

export default function PaymentSettingsPage() {
  const [tab, setTab] = useState(0)
  const [gateways, setGateways] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [errors, setErrors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getPaymentGateways().catch(() => ({ gateways: [] })),
      getEvents("payment", 10).catch(() => ({ events: [] })),
      getErrors("payment", 10).catch(() => ({ errors: [] })),
    ]).then(([g, ev, er]) => { setGateways(g.gateways); setEvents(ev.events); setErrors(er.errors); setLoading(false) })
  }, [])
  const [currency, setCurrency] = useState("EGP")
  const [saving, setSaving] = useState(false)
  const handleSave = async () => { setSaving(true); try { await saveSetting("payment_default_currency", currency, "payment") } catch {} finally { setSaving(false) } }

  const table = (headers: string[], rows: (string | React.ReactNode)[][]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead><tr className="text-left border-b" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
          {headers.map((h, i) => <th key={i} className={`pb-3 font-semibold ${i < headers.length - 1 ? "pr-4" : ""}`}>{h}</th>)}
        </tr></thead>
        <tbody>{rows.map((row, ri) => (
          <tr key={ri} className="border-b" style={{ borderColor: "var(--border-default)" }}>
            {row.map((cell, ci) => <td key={ci} className={`py-3 ${ci < row.length - 1 ? "pr-4" : ""}`} style={{ color: ci === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: ci === 0 ? 600 : 400 }}>{cell}</td>)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
  const sevColor = (s: string) => s === "ERROR" || s === "error" ? "#ef4444" : s === "WARN" || s === "warn" ? "#f59e0b" : "#3b82f6"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Payment Settings</h1><p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p></div>
      </div>
      <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none rounded-2xl border px-3" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} className="shrink-0 px-3 py-1.5 text-xs font-semibold transition-all rounded-xl whitespace-nowrap"
            style={{ backgroundColor: tab === i ? "var(--brand)" : "transparent", color: tab === i ? "#FFFFFF" : "var(--text-secondary)" }}>
            {tab === i && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block mr-1.5" />}{t.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border p-6" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
        {loading && <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }} /></div>}
        {!loading && tab === 0 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Name", "Code", "Status", "Manager", "Phone"], CENTERS.map(c => [c.name, c.code, <span key={c.name} className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: c.status === "Active" ? "rgba(220,38,38,0.1)" : "rgba(156,163,175,0.1)", color: c.status === "Active" ? "#DC2626" : "#6b7280" }}>{c.status}</span>, c.manager, c.phone]))}</motion.div>}
        {!loading && tab === 1 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Name", "Code", "Fee", "Enabled"], TYPES.map(t => [t.name, t.code, t.fee, t.enabled ? <span key={t.name} className="text-green-500">âœ“</span> : <span className="text-red-500">âœ—</span>]))}</motion.div>}
        {!loading && tab === 2 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Code", "Name", "Direction"], JOURNALS.map(j => [j.code, j.name, j.direction]))}</motion.div>}
        {!loading && tab === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg space-y-4">
            <div><label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }} htmlFor="lbl-default-currency">Default Currency</label><select id="lbl-default-currency" value={currency} onChange={e => setCurrency(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}><option>EGP</option><option>USD</option></select></div>
            <button onClick={handleSave} disabled={saving} className="rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-50" style={{ backgroundColor: "var(--brand)" }}>{saving ? "Saving..." : "Save"}</button>
          </motion.div>
        )}
        {!loading && tab === 4 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Name", "Number", "Bank", "Balance"], ACCOUNTS.map(a => [a.name, a.number, a.bank, a.balance]))}</motion.div>}
        {!loading && tab === 5 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Gateways: {gateways.length} configured</p>
        </motion.div>}
        {!loading && tab === 6 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Time", "Action", "Resource"], events.map((e: any) => [new Date(e.createdAt).toLocaleString(), <span key={e.id ?? e.name ?? e} className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{e.action}</span>, e.resource || "â€”"]))}</motion.div>}
        {!loading && tab === 7 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{table(["Time", "Severity", "Action"], errors.map((e: any) => [new Date(e.createdAt).toLocaleString(), <span key={e.id ?? e.name ?? e} className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${sevColor(e.severity)}20`, color: sevColor(e.severity) }}>{e.severity.toUpperCase()}</span>, e.action]))}</motion.div>}
      </div>
    </div>
  )
}
