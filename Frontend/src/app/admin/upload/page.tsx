"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"

const waveAnim = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

interface UploadRecord {
  id: string
  filename: string
  type: string
  size: string
  uploadedAt: string
  status: "success" | "processing" | "failed"
  uploadedBy: string
}

const MOCK_UPLOADS: UploadRecord[] = [
  { id: "U001", filename: "october_readings_jul2026.csv", type: "CSV", size: "2.4 MB", uploadedAt: "2026-07-26 05:30:00", status: "success", uploadedBy: "admin@meterverse.com" },
  { id: "U002", filename: "new_cairo_meters_update.xlsx", type: "XLSX", size: "1.1 MB", uploadedAt: "2026-07-25 14:22:00", status: "success", uploadedBy: "operator@meterverse.com" },
  { id: "U003", filename: "sodic_import_batch_07.csv", type: "CSV", size: "3.7 MB", uploadedAt: "2026-07-25 10:15:00", status: "processing", uploadedBy: "admin@meterverse.com" },
  { id: "U004", filename: "customer_ledger_june.xlsx", type: "XLSX", size: "856 KB", uploadedAt: "2026-07-24 16:45:00", status: "failed", uploadedBy: "operator@meterverse.com" },
  { id: "U005", filename: "tariff_update_v3.csv", type: "CSV", size: "124 KB", uploadedAt: "2026-07-24 09:30:00", status: "success", uploadedBy: "admin@meterverse.com" },
]

const TEMPLATES = [
  { name: "Meter Readings Template", type: "CSV", description: "Standard format for bulk meter reading uploads", icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
  { name: "Customer Import Template", type: "XLSX", description: "Customer data import with required fields", icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
  { name: "Tariff Update Template", type: "CSV", description: "Tariff schedule update format", icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
  { name: "Invoice Batch Template", type: "CSV", description: "Batch invoice generation template", icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
]

export default function AdminUploadPage() {
  const [uploads] = useState<UploadRecord[]>(MOCK_UPLOADS)
  const [dragging, setDragging] = useState(false)

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(true) }, [])
  const onDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false) }, [])
  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false) }, [])

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Upload Center</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Upload files, manage imports, and download templates</p>
        </div>
        <motion.div animate={waveAnim} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
        </motion.div>
      </motion.div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT: Templates */}
        <motion.div variants={fadeUp}
          className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download Templates
          </h3>
          <div className="space-y-3">
            {TEMPLATES.map((t, i) => (
              <motion.div key={i} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className="rounded-xl border p-3.5 flex items-center justify-between cursor-pointer transition-colors hover:shadow-sm"
                style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-card, transparent)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2"><path d={t.icon} /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{t.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded" style={{ backgroundColor: "rgba(var(--brand-rgb),0.08)", color: "var(--brand)" }}>{t.type}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT: Upload */}
        <motion.div variants={fadeUp}
          className="rounded-2xl border p-5 flex flex-col" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            Upload Files
          </h3>
          <motion.div
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            className="flex-1 rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
            style={{ backgroundColor: dragging ? "rgba(var(--brand-rgb),0.05)" : "transparent", borderColor: dragging ? "var(--brand)" : "var(--border-default)" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.5"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Drop files here or click to browse</p>
            <p className="text-xs mt-1.5" style={{ color: "var(--text-secondary)" }}>Supports CSV, XLSX, XML — max 50 MB</p>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }
            } className="mt-4 px-5 py-2 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: "var(--brand)" }}>
              Browse Files
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Upload History */}
      <motion.div variants={fadeUp}
        className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <div className="px-5 py-3 border-b text-sm font-bold flex items-center gap-2" style={{ color: "var(--text-primary)", borderColor: "var(--border-default)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
          Upload History
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border-default)" }}>
                <th className="text-left px-5 py-2.5 font-semibold">Filename</th>
                <th className="text-left px-5 py-2.5 font-semibold">Type</th>
                <th className="text-left px-5 py-2.5 font-semibold">Size</th>
                <th className="text-left px-5 py-2.5 font-semibold">Uploaded</th>
                <th className="text-left px-5 py-2.5 font-semibold">Status</th>
                <th className="text-left px-5 py-2.5 font-semibold">By</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((u) => (
                <tr key={u.id} className="border-t" style={{ borderColor: "var(--border-default)" }}>
                  <td className="px-5 py-2.5 font-medium" style={{ color: "var(--text-primary)" }}>{u.filename}</td>
                  <td className="px-5 py-2.5">
                    <span className="px-1.5 py-0.5 rounded text-xs font-mono font-bold" style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)", color: "var(--brand)" }}>{u.type}</span>
                  </td>
                  <td className="px-5 py-2.5 font-mono" style={{ color: "var(--text-secondary)" }}>{u.size}</td>
                  <td className="px-5 py-2.5 font-mono" style={{ color: "var(--text-secondary)" }}>{u.uploadedAt}</td>
                  <td className="px-5 py-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: u.status === "success" ? "rgba(5,150,105,0.1)" : u.status === "processing" ? "rgba(37,99,235,0.1)" : "rgba(220,38,38,0.1)",
                        color: u.status === "success" ? "#059669" : u.status === "processing" ? "#2563EB" : "#DC2626",
                      }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: u.status === "success" ? "#059669" : u.status === "processing" ? "#2563EB" : "#DC2626" }} />
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-2.5" style={{ color: "var(--text-secondary)" }}>{u.uploadedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
