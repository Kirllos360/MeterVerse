"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDropzone } from "react-dropzone"

interface FileUploadProps {
  accept?: Record<string, string[]>
  maxSize?: number
  onUpload: (files: File[]) => Promise<void>
}

export function FileUpload({ accept, maxSize = 10485760, onUpload }: FileUploadProps) {
  const [files, setFiles] = useState<{ file: File; progress: number; status: "pending" | "uploading" | "done" | "error" }[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted.map((f) => ({ file: f, progress: 0, status: "pending" as const }))])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept, maxSize })

  const uploadAll = async () => {
    setIsUploading(true)
    for (const f of files) {
      if (f.status !== "pending") continue
      f.status = "uploading"
      try {
        await onUpload([f.file])
        f.status = "done"
      } catch {
        f.status = "error"
      }
    }
    setIsUploading(false)
  }

  return (
    <div className="space-y-3">
      <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragActive ? "border-[var(--brand-primary)]" : "border-[var(--border-default)]"}`} style={{ backgroundColor: isDragActive ? "rgba(0,191,165,0.03)" : "var(--surface-raised)" }}>
        <input {...getInputProps()} aria-label="File upload" />
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" className="mx-auto mb-2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{isDragActive ? "Drop files here" : "Drag & drop or click to browse"}</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>Max size: {Math.round(maxSize / 1048576)}MB</p>
      </div>

      <AnimatePresence>
        {files.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg border" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-raised)" }}>
            <div className="flex-1 min-w-0">
              <p className="text-xs truncate" style={{ color: "var(--text-primary)" }}>{f.file.name}</p>
              <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{(f.file.size / 1024).toFixed(1)} KB</p>
            </div>
            {f.status === "uploading" && <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--surface-sunken)" }}><motion.div className="h-full rounded-full" style={{ backgroundColor: "var(--brand-primary)" }} animate={{ width: ["0%", "100%"] }} transition={{ duration: 2 }} /></div>}
            {f.status === "done" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
            {f.status === "error" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
            {f.status === "pending" && (
              <button onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))} className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {files.some((f) => f.status === "pending") && (
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={uploadAll} disabled={isUploading}
          className="w-full py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: isUploading ? "rgba(0,191,165,0.5)" : "var(--brand-primary)" }}>
          {isUploading ? "Uploading..." : `Upload ${files.filter((f) => f.status === "pending").length} files`}
        </motion.button>
      )}
    </div>
  )
}
