"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const waveAnim = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

interface AccountNode {
  code: string
  name: string
  type: string
  balance: number
  children?: AccountNode[]
}

interface AccountType {
  type: string
  label: string
  normalBalance: "debit" | "credit"
  color: string
}

const ACCOUNT_TREE: AccountNode[] = [
  {
    code: "1", name: "Assets", type: "asset", balance: 4520000,
    children: [
      { code: "1.1", name: "Current Assets", type: "asset", balance: 1850000, children: [
        { code: "1.1.1", name: "Cash & Banks", type: "asset", balance: 820000 },
        { code: "1.1.2", name: "Accounts Receivable", type: "asset", balance: 680000 },
        { code: "1.1.3", name: "Inventory", type: "asset", balance: 350000 },
      ]},
      { code: "1.2", name: "Fixed Assets", type: "asset", balance: 2670000, children: [
        { code: "1.2.1", name: "Buildings", type: "asset", balance: 1800000 },
        { code: "1.2.2", name: "Equipment", type: "asset", balance: 520000 },
        { code: "1.2.3", name: "Vehicles", type: "asset", balance: 350000 },
      ]},
    ],
  },
  {
    code: "2", name: "Liabilities", type: "liability", balance: 2180000,
    children: [
      { code: "2.1", name: "Current Liabilities", type: "liability", balance: 980000, children: [
        { code: "2.1.1", name: "Accounts Payable", type: "liability", balance: 620000 },
        { code: "2.1.2", name: "Accrued Expenses", type: "liability", balance: 360000 },
      ]},
      { code: "2.2", name: "Long-term Liabilities", type: "liability", balance: 1200000, children: [
        { code: "2.2.1", name: "Bank Loans", type: "liability", balance: 900000 },
        { code: "2.2.2", name: "Bonds Payable", type: "liability", balance: 300000 },
      ]},
    ],
  },
  {
    code: "3", name: "Equity", type: "equity", balance: 2340000,
    children: [
      { code: "3.1", name: "Capital", type: "equity", balance: 1500000 },
      { code: "3.2", name: "Retained Earnings", type: "equity", balance: 640000 },
      { code: "3.3", name: "Reserves", type: "equity", balance: 200000 },
    ],
  },
  {
    code: "4", name: "Revenue", type: "revenue", balance: 1250000,
    children: [
      { code: "4.1", name: "Service Revenue", type: "revenue", balance: 850000 },
      { code: "4.2", name: "Interest Income", type: "revenue", balance: 400000 },
    ],
  },
  {
    code: "5", name: "Expenses", type: "expense", balance: 890000,
    children: [
      { code: "5.1", name: "Operating Expenses", type: "expense", balance: 520000, children: [
        { code: "5.1.1", name: "Salaries", type: "expense", balance: 320000 },
        { code: "5.1.2", name: "Utilities", type: "expense", balance: 120000 },
        { code: "5.1.3", name: "Rent", type: "expense", balance: 80000 },
      ]},
      { code: "5.2", name: "Non-Operating Expenses", type: "expense", balance: 370000 },
    ],
  },
]

const ACCOUNT_TYPES: AccountType[] = [
  { type: "asset", label: "Asset", normalBalance: "debit", color: "#059669" },
  { type: "liability", label: "Liability", normalBalance: "credit", color: "#D97706" },
  { type: "equity", label: "Equity", normalBalance: "credit", color: "#2563EB" },
  { type: "revenue", label: "Revenue", normalBalance: "credit", color: "#7C3AED" },
  { type: "expense", label: "Expense", normalBalance: "debit", color: "#DC2626" },
]

function AccountRow({ node, depth = 0 }: { node: AccountNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0

  return (
    <>
      <div className="flex items-center justify-between px-5 py-2.5 border-t text-sm" style={{ borderColor: "var(--border-default)", paddingLeft: `${20 + depth * 20}px` }}>
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <button onClick={() => setExpanded(!expanded)} className="w-4 h-4 flex items-center justify-center rounded hover:opacity-70"
              style={{ color: "var(--text-secondary)" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ) : <div className="w-4" />}
          <span className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>{node.code}</span>
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{node.name}</span>
          <span className="text-xs px-1.5 py-0.5 rounded capitalize" style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)", color: "var(--brand)" }}>{node.type}</span>
        </div>
        <span className="font-mono text-sm font-bold" style={{ color: node.balance >= 0 ? "var(--text-primary)" : "#DC2626" }}>
          {node.balance >= 0 ? `EGP ${node.balance.toLocaleString()}` : `(EGP ${Math.abs(node.balance).toLocaleString()})`}
        </span>
      </div>
      {hasChildren && expanded && node.children!.map((child) => (
        <AccountRow key={child.code} node={child} depth={depth + 1} />
      ))}
    </>
  )
}

export default function ChartOfAccountsPage() {
  const [tree] = useState<AccountNode[]>(ACCOUNT_TREE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Chart of Accounts</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Manage account structure, types, and hierarchy</p>
        </div>
        <motion.div animate={waveAnim} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        </motion.div>
      </div>

      {/* Account Types Legend */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <div className="flex items-center gap-6 flex-wrap">
          {ACCOUNT_TYPES.map((t) => (
            <div key={t.type} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: t.color }} />
              <span className="text-xs font-semibold capitalize" style={{ color: "var(--text-primary)" }}>{t.label}</span>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>({t.normalBalance})</span>
            </div>
          ))}
          <div className="ml-auto">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>
              + New Account
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Account Tree */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <div className="px-5 py-3 border-b text-sm font-bold" style={{ color: "var(--text-primary)", borderColor: "var(--border-default)" }}>Account Hierarchy</div>
        <div className="divide-y-0">
          {tree.map((root) => (
            <AccountRow key={root.code} node={root} depth={0} />
          ))}
        </div>
      </motion.div>

      {/* Account Creation Form Placeholder */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Create New Account</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {["Account Code", "Account Name", "Account Type", "Parent Account"].map((field) => (
            <div key={field}>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>{field}</label>
              <div className="rounded-xl border px-3 py-2 text-xs" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)", backgroundColor: "rgba(var(--brand-rgb),0.03)" }}>
                {field === "Account Type" ? "Select type..." : `Enter ${field.toLowerCase()}...`}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>
            Create Account
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
