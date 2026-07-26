"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const waveAnim = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

interface Document {
  id: string
  name: string
  category: string
  type: string
  size: string
  uploadedAt: string
  uploadedBy: string
  status: "published" | "draft" | "archived"
}

interface DocumentCategory {
  name: string
  color: string
  count: number
}

const DOCUMENTS: Document[] = [
  { id: "D001", name: "MeterVerse_Integration_Guide_v3.pdf", category: "Technical Docs", type: "PDF", size: "2.8 MB", uploadedAt: "2026-07-25 14:30", uploadedBy: "admin@meterverse.com", status: "published" },
  { id: "D002", name: "October_Area_Commissioning_Report.docx", category: "Reports", type: "DOCX", size: "1.2 MB", uploadedAt: "2026-07-24 10:15", uploadedBy: "eng@meterverse.com", status: "published" },
  { id: "D003", name: "Tariff_Schedule_2026_Q3.xlsx", category: "Templates", type: "XLSX", size: "456 KB", uploadedAt: "2026-07-23 16:45", uploadedBy: "finance@meterverse.com", status: "published" },
  { id: "D004", name: "SODIC_Go_Live_Checklist.pdf", category: "Technical Docs", type: "PDF", size: "890 KB", uploadedAt: "2026-07-22 09:00", uploadedBy: "admin@meterverse.com", status: "draft" },
  { id: "D005", name: "Customer_Communication_Template.docx", category: "Templates", type: "DOCX", size: "234 KB", uploadedAt: "2026-07-21 11:30", uploadedBy: "ops@meterverse.com", status: "published" },
  { id: "D006", name: "Q2_2026_Performance_Review.pdf", category: "Reports", type: "PDF", size: "3.4 MB", uploadedAt: "2026-07-20 08:00", uploadedBy: "admin@meterverse.com", status: "published" },
]

const CATEGORIES: DocumentCategory[] = [
  { name: "Technical Docs", color: "#2563EB", count: 12 },
  { name: "Reports", color: "#059669", count: 8 },
  { name: "Templates", color: "#7C3AED", count: 6 },
  { name: "Contracts", color: "#D97706", count: 4 },
  { name: "Archived", color: "#6B7280", count: 15 },
]

export default function DocumentsPage() {
  const [docs] = useState<Document[]>(DOCUMENTS)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filtered = selectedCategory ? docs.filter((d) => d.category === selectedCategory) : docs

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Document Center</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Uploaded files, document categories, and template management</p>
        </div>
        <motion.div animate={waveAnim} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        </motion.div>
      </div>

      {/* Categories */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Categories:</span>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedCategory(null)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              backgroundColor: !selectedCategory ? "var(--brand)" : "rgba(var(--brand-rgb),0.1)",
              color: !selectedCategory ? "white" : "var(--text-primary)",
            }}>
            All ({docs.length})
          </motion.button>
          {CATEGORIES.map((cat) => (
            <motion.button key={cat.name} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedCategory(cat.name)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              style={{
                backgroundColor: selectedCategory === cat.name ? cat.color : "rgba(var(--brand-rgb),0.1)",
                color: selectedCategory === cat.name ? "white" : "var(--text-primary)",
              }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
              {cat.name} ({cat.count})
            </motion.button>
          ))}
          <div className="ml-auto">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>
              + Upload
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Document List */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <div className="px-5 py-3 border-b text-sm font-bold" style={{ color: "var(--text-primary)", borderColor: "var(--border-default)" }}>
          {filtered.length} Document{filtered.length !== 1 ? "s" : ""}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border-default)" }}>
                <th className="text-left px-5 py-2 font-semibold">Name</th>
                <th className="text-left px-5 py-2 font-semibold">Category</th>
                <th className="text-left px-5 py-2 font-semibold">Type</th>
                <th className="text-left px-5 py-2 font-semibold">Size</th>
                <th className="text-left px-5 py-2 font-semibold">Uploaded</th>
                <th className="text-left px-5 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-t" style={{ borderColor: "var(--border-default)" }}>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.5">
                        <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{d.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-2.5">
                    <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)", color: "var(--brand)" }}>{d.category}</span>
                  </td>
                  <td className="px-5 py-2.5">
                    <span className="px-1.5 py-0.5 rounded text-xs font-mono font-bold" style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)", color: "var(--brand)" }}>{d.type}</span>
                  </td>
                  <td className="px-5 py-2.5 font-mono" style={{ color: "var(--text-secondary)" }}>{d.size}</td>
                  <td className="px-5 py-2.5">
                    <p className="font-mono" style={{ color: "var(--text-secondary)" }}>{d.uploadedAt}</p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{d.uploadedBy}</p>
                  </td>
                  <td className="px-5 py-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                      style={{
                        backgroundColor: d.status === "published" ? "rgba(5,150,105,0.1)" : d.status === "draft" ? "rgba(37,99,235,0.1)" : "rgba(107,114,128,0.1)",
                        color: d.status === "published" ? "#059669" : d.status === "draft" ? "#2563EB" : "#6B7280",
                      }}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Template Management */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Template Management</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {["Meter Reading Import", "Invoice Batch", "Customer Registration Form"].map((tpl) => (
            <div key={tpl} className="rounded-xl border p-3 flex items-center justify-between" style={{ borderColor: "var(--border-default)" }}>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{tpl}</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
