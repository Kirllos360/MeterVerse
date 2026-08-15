"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import { apiBackend, getAuthHeaders } from "@/lib/api-client"

interface ImportSchema {
  columns: Record<string, { required?: boolean; type?: string }>
  sheet?: string
}

interface ImportType {
  name: string
  schema: ImportSchema
}

interface ImportJob {
  id: string
  type: string
  fileName: string
  status: string
  processed?: number
  failed?: number
  createdAt?: string
}

const WAVE = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

export default function UploadPage() {
  const [types, setTypes] = useState<Record<string, ImportSchema>>({})
  const [selectedType, setSelectedType] = useState("")
  const [fileName, setFileName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [preview, setPreview] = useState<{ jobId: string; total: number; valid: number; invalid: number; invalidRows: { row: number; errors: string[] }[] } | null>(null)
  const [jobs, setJobs] = useState<ImportJob[]>([])
  const [dragOver, setDragOver] = useState(false)

  const loadTypes = useCallback(async () => {
    try {
      const data = await apiBackend<{ types: string[]; schemas: Record<string, ImportSchema> }>("/api/imports/types")
      setTypes(data.schemas ?? {})
      setSelectedType((prev) => prev || data.types?.[0] || "")
    } catch {
      setTypes({})
    }
  }, [])

  const loadJobs = useCallback(async () => {
    try {
      const data = await apiBackend<{ jobs: ImportJob[] }>("/api/imports/jobs")
      setJobs(data.jobs ?? [])
    } catch {
      setJobs([])
    }
  }, [])

  useEffect(() => {
    loadTypes()
    loadJobs()
  }, [loadTypes, loadJobs])

  const doUpload = async () => {
    if (!file) {
      toast.error("Select an XLSX/XLS file first")
      return
    }
    if (!selectedType) {
      toast.error("Select an import type first")
      return
    }
    setUploading(true)
    setPreview(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch(`/api/imports/upload/${selectedType}`, { method: "POST", body: fd, headers: getAuthHeaders() })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(body.error || `Upload failed (${res.status})`)
        return
      }
      setPreview({ jobId: body.job?.id, total: body.total ?? 0, valid: body.valid ?? 0, invalid: body.invalid ?? 0, invalidRows: body.invalidRows ?? [] })
      toast.success(`Previewed ${body.total} rows (${body.valid} valid)`)
    } catch (e: any) {
      toast.error(e?.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const doExecute = async () => {
    if (!preview?.jobId) return
    setExecuting(true)
    try {
      const res = await apiBackend<{ processed: number; failed: number }>(`/api/imports/jobs/${preview.jobId}/execute`, { method: "POST", body: JSON.stringify({}) })
      toast.success(`Import executed: ${res.processed} processed, ${res.failed} failed`)
      setPreview(null)
      setFile(null)
      setFileName("")
      loadJobs()
    } catch (e: any) {
      toast.error(e?.message || "Execute failed")
    } finally {
      setExecuting(false)
    }
  }

  const doDownloadTemplate = async () => {
    if (!selectedType) {
      toast.error("Select an import type first")
      return
    }
    try {
      const res = await fetch(`/api/imports/templates/${selectedType}/download`, { headers: getAuthHeaders() })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        toast.error(body.error || `Download failed (${res.status})`)
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${selectedType}_template.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`${selectedType} template downloaded`)
    } catch (e: any) {
      toast.error(e?.message || "Download failed")
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) { setFile(f); setFileName(f.name) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Upload Center</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Preview and execute XLSX template imports</p>
        </div>
        <motion.div animate={WAVE} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <Icons.upload className="h-4 w-4 text-white" />
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-2xl border p-5 space-y-4" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>New import</p>

          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Import type</label>
            <div className="flex gap-2">
              <select
                className="flex-1 rounded-xl h-9 px-3 text-sm bg-transparent"
                style={{ color: "var(--text-primary)", border: "1px solid var(--border-default)" }}
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {Object.keys(types).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <Button size="sm" variant="outline" className="rounded-xl h-9 shrink-0" onClick={doDownloadTemplate} disabled={!selectedType}>
                <Icons.download className="mr-1.5 h-3.5 w-3.5" />
                Template
              </Button>
            </div>
            {selectedType && types[selectedType]?.columns && (
              <div className="mt-2 flex flex-wrap gap-1">
                {Object.entries(types[selectedType].columns).map(([col, spec]) => (
                  <Badge key={col} variant="secondary" className="text-[10px]">
                    {col}{spec.required ? " *" : ""}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div
            className="rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer"
            style={{
              borderColor: dragOver ? "var(--brand)" : "var(--border-default)",
              backgroundColor: dragOver ? "var(--brand)" : "transparent",
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <Icons.upload className="h-7 w-7 mx-auto mb-2" style={{ color: "var(--brand)" }} />
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>{fileName || "Drag & drop or click to browse"}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>XLSX / XLS, max 10 MB</p>
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setFileName(f.name) } }}
            />
          </div>

          <Button size="sm" className="rounded-xl w-full" disabled={uploading || !file} onClick={doUpload}>
            {uploading ? <Icons.spinner className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Icons.upload className="mr-1.5 h-3.5 w-3.5" />}
            Upload & Preview
          </Button>

          {preview && (
            <div className="rounded-xl border p-3 space-y-2 text-sm" style={{ borderColor: "var(--border-default)" }}>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Preview</p>
              <div className="flex gap-4">
                <Badge variant="secondary">Total {preview.total}</Badge>
                <Badge variant="secondary" className="bg-green-500/10 text-green-500">Valid {preview.valid}</Badge>
                <Badge variant="secondary" className="bg-red-500/10 text-red-500">Invalid {preview.invalid}</Badge>
              </div>
              {preview.invalid > 0 && preview.invalidRows.length > 0 && (
                <div className="max-h-28 overflow-auto text-xs space-y-1">
                  {preview.invalidRows.slice(0, 8).map((r) => (
                    <p key={r.row} style={{ color: "var(--text-tertiary)" }}>row {r.row}: {r.errors.join("; ")}</p>
                  ))}
                </div>
              )}
              <Button size="sm" className="rounded-xl w-full" disabled={executing || preview.valid === 0} onClick={doExecute}>
                {executing ? <Icons.spinner className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Icons.check className="mr-1.5 h-3.5 w-3.5" />}
                Execute import
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
          <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Recent imports</p>
          <div className="space-y-2 max-h-80 overflow-auto">
            {jobs.length === 0 && <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No imports yet</p>}
            {jobs.map((j) => (
              <div key={j.id} className="rounded-xl border px-3 py-2 flex items-center justify-between text-sm" style={{ borderColor: "var(--border-default)" }}>
                <div>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>{j.fileName}</p>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{j.type} · {new Date(j.createdAt ?? "").toLocaleString()}</p>
                </div>
                <Badge variant={j.status === "completed" ? "secondary" : "outline"} className={j.status === "completed" ? "bg-green-500/10 text-green-500" : ""}>
                  {j.status}{j.processed != null ? ` (${j.processed}/${j.failed ?? 0})` : ""}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
