import { Router } from "express"
import multer from "multer"
import fs from "fs"
import path from "path"
import crypto from "crypto"
import { fileURLToPath } from "url"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"
import { IMPORT_SCHEMAS, parseWorkbook, createImportJob, executeImport } from "../services/import-engine.js"

const router = Router()
router.use(authenticate)

const UPLOAD_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "uploads")
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`),
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024, files: 1 }, fileFilter: (_req, file, cb) => {
  const okMime = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "application/octet-stream"].includes(file.mimetype)
  const okExt = /\.(xlsx|xls)$/i.test(file.originalname)
  if (okMime && okExt) cb(null, true)
  else cb(new Error(`File type '${file.mimetype}' not allowed (XLSX/XLS only)`))
}})

// Available import types (schema registry)
router.get("/types", requirePermission("documents.*"), (_req, res) => {
  res.json({ types: Object.keys(IMPORT_SCHEMAS), schemas: IMPORT_SCHEMAS })
})

// Upload + preview: parse, validate schema/rows, create ImportJob (status=preview). No mutation.
router.post("/upload/:type", requirePermission("documents.*"), upload.single("file"), async (req, res, next) => {
  try {
    const type = req.params.type
    if (!IMPORT_SCHEMAS[type]) return res.status(400).json({ error: `Unknown import type '${type}'` })
    if (!req.file) return res.status(400).json({ error: "No file provided" })

    const buffer = fs.readFileSync(req.file.path)
    let parsed
    try {
      parsed = parseWorkbook(buffer, type)
    } catch (e) {
      fs.unlinkSync(req.file.path)
      return res.status(422).json({ error: "Workbook parse failed", details: e.message })
    }
    if (!parsed.ok) {
      fs.unlinkSync(req.file.path)
      return res.status(422).json({ error: "Workbook invalid", details: parsed.errors })
    }

    // row-level validation summary (no DB mutation)
    const summary = { valid: 0, invalid: 0, invalidRows: [] }
    for (const { index, data } of parsed.rows) {
      const v = validateRowSummary(type, data, index)
      if (v.ok) summary.valid++
      else { summary.invalid++; summary.invalidRows.push({ row: index, errors: v.errors }) }
    }

    const job = await createImportJob({ type, fileName: req.file.originalname, rows: parsed.rows, errors: parsed.errors, req })
    fs.unlinkSync(req.file.path)
    auditLog(req, "import.preview", { type, jobId: job.id, total: parsed.rows.length, valid: summary.valid, invalid: summary.invalid })
    res.status(201).json({ job, total: parsed.rows.length, valid: summary.valid, invalid: summary.invalid, invalidRows: summary.invalidRows.slice(0, 25) })
  } catch (err) { next(err) }
})

// Execute a previously previewed import (idempotency-safe via job status).
router.post("/jobs/:id/execute", requirePermission("documents.*"), async (req, res, next) => {
  try {
    const job = await prisma.importJob.findUnique({ where: { id: req.params.id } })
    if (!job || job.archivedAt) return res.status(404).json({ error: "Import job not found" })
    if (job.status === "completed") return res.status(409).json({ error: "Import already executed" })

    // Re-parse not needed: validated rows are persisted on the job at preview time,
    // so execution is idempotent and does not require re-uploading the file.
    let payload = null
    try { payload = JSON.parse(job.errors || "null") } catch { payload = null }
    if (!payload?.rows || payload.rows.length === 0) return res.status(400).json({ error: "Preview payload missing; re-upload the file" })

    const result = await executeImport(job.type, payload.rows, { req })
    const updated = await prisma.importJob.update({
      where: { id: job.id },
      data: { status: "completed", processed: result.processed, failed: result.failed, completedAt: new Date() },
    })
    auditLog(req, "import.executed", { type: job.type, jobId: job.id, processed: result.processed, failed: result.failed })
    res.json({ job: updated, ...result })
  } catch (err) { next(err) }
})

// List import jobs
router.get("/jobs", requirePermission("documents.*"), async (req, res, next) => {
  try {
    const items = await prisma.importJob.findMany({ where: { archivedAt: null }, orderBy: { createdAt: "desc" }, take: 100 })
    res.json({ jobs: items, total: items.length })
  } catch (err) { next(err) }
})

function validateRowSummary(type, data, index) {
  // lightweight re-check matching import-engine.validateRow
  const schema = IMPORT_SCHEMAS[type]
  const errors = []
  for (const [col, spec] of Object.entries(schema.columns)) {
    const raw = data[col]
    const s = raw === null || raw === undefined ? "" : String(raw).trim()
    if (spec.required && s === "") errors.push(`row ${index}: missing '${col}'`)
  }
  return { ok: errors.length === 0, errors }
}

export { router as importsRouter }
