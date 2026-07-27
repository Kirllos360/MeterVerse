import fs from "fs"

const ADMIN = "D:/meter/Frontend/src/app/admin"

const pages = [
  { id: "home", label: "Home", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", tabs: ["System Health","Database Health","Connection Status","DB Size","User Counters"] },
  { id: "database-management", label: "Database Mgmt", icon: "M4 7v10c2 0 3 1 3 3h10c2 0 3-1 3-3V7M4 7h16", tabs: ["Spreadsheet","SQL Command","Query Results","Event Log","Error Log"] },
  { id: "connection-settings", label: "Connection Settings", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9", tabs: ["Connection Status","VM Settings","Sync Meter","Sync Reading","Health Status","Event Log","Error Log"] },
  { id: "monitoring-view", label: "Monitoring View", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2", tabs: ["Dashboard","Setup"] },
  { id: "customer-settings", label: "Customer Settings", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", tabs: ["Customer Groups","Customer Types","Transfer Ownership","Event Log","Error Log"] },
  { id: "meter-settings", label: "Meter Settings", icon: "M9 3l3-3m0 0l3 3m-3-3v12", tabs: ["Meter Types","Main Settings","Measurement Points","Result Types","Data Setup","Event Log","Error Log"] },
  { id: "location-settings", label: "Location Settings", icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z", tabs: ["Area Settings","Project Settings","Unit Zones","Unit Types","Main Settings","Event Log"] },
  { id: "payment-settings", label: "Payment Settings", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2", tabs: ["Payment Center","Payment Types","Journal Types","Main Settings","Accounts","Report Settings","Event Log","Error Log"] },
  { id: "users-permissions", label: "Users & Permissions", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z", tabs: ["User Settings","User Groups","Main Settings","Group Profiles","User Profiles","Permission Settings","Event Log","Error Log"] },
  { id: "tariff-settings", label: "Tariff Settings", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0", tabs: ["Charge Types","Tariff Setup","Version Update","Main Settings","Assign to Meter","Event Log","Error Log"] },
  { id: "report-settings", label: "Report Settings", icon: "M9 17v-2m3 2v-4m3 4v-6", tabs: ["Dashboard","Setup"] },
  { id: "upload-settings", label: "Upload Settings", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12", tabs: ["Dashboard","Setup"] },
  { id: "bill-cycle-settings", label: "Bill Cycle Settings", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5", tabs: ["Per Meter Type","Per Project","Verification","Event Log","Error Log"] },
  { id: "bill-cycle", label: "Bill Cycle", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2", tabs: ["Dashboard","Setup"] },
]

for (const page of pages) {
  const dir = ADMIN + "/" + page.id
  fs.mkdirSync(dir, { recursive: true })

  // Create tabs array as JS string
  const tabsJs = page.tabs.map((t, i) => `{ id: "${i}", label: "${t}" }`).join(",\n    ")

  const content = `"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const TABS = [
  ${tabsJs}
]

export default function ${page.id.replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace(/^./, c => c.toUpperCase())}Page() {
  const [tab, setTab] = useState(0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>${page.label}</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>System configuration & management</p>
        </div>
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="${page.icon}" /></svg>
        </motion.div>
      </div>

      {/* Sub-tabs */}
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

      {/* Content */}
      <div className="rounded-2xl border p-6" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{TABS[tab].label} - Configuration and management section.</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
              <div className="w-10 h-10 rounded-full mb-3" style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)" }} />
              <div className="h-3 w-2/3 rounded mb-2" style={{ backgroundColor: "var(--border-default)" }} />
              <div className="h-3 w-1/2 rounded" style={{ backgroundColor: "var(--border-default)" }} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
`
  fs.writeFileSync(dir + "/page.tsx", content)
  console.log("Created " + page.id)
}
