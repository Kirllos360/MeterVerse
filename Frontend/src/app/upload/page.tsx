"use client"

import { motion } from "framer-motion"

const waveAnim = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Upload Center</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Upload and manage data files</p>
        </div>
        <motion.div animate={waveAnim} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5m0 0L7 8m5-5v12" /></svg>
        </motion.div>
      </div>

      <div className="rounded-2xl border p-8 flex flex-col items-center justify-center" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.5" className="mb-4">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5m0 0L7 8m5-5v12" />
        </svg>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Upload files</p>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Drag & drop or click to browse</p>
      </div>
    </div>
  )
}
