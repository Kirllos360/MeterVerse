import { Router } from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import crypto from "crypto"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission } from "../middleware/security.js"
import { z } from "zod"

const router = Router()

const templateSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
  variables: z.string().default("[]"),
  category: z.string().default("general"),
})
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads"
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

// ─── FILE VALIDATION (security layer) ─────────────────────────────

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf", "image/jpeg", "image/png", "image/gif",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
  "text/csv", "text/plain",
  "application/json", "application/xml", "text/xml",
  "application/zip", "application/gzip",
])

const MAGIC_BYTES = {
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]],
  "image/jpeg": [[0xFF, 0xD8, 0xFF]],
  "image/png": [[0x89, 0x50, 0x4E, 0x47]],
  "image/gif": [[0x47, 0x49, 0x46]],
  "application/zip": [[0x50, 0x4B, 0x03, 0x04]],
  "application/gzip": [[0x1F, 0x8B]],
}

function validateFileType(file) {
  const errors = []
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    errors.push(`File type '${file.mimetype}' is not allowed. Allowed: ${[...ALLOWED_MIME_TYPES].join(", ")}`)
  }
  const magic = MAGIC_BYTES[file.mimetype]
  if (magic) {
    const buffer = fs.readFileSync(file.path, { flag: "r" })
    const match = magic.some(sig => sig.every((b, i) => buffer[i] === b))
    if (!match) errors.push(`File content does not match expected signature for '${file.mimetype}'`)
  }
  return errors
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`),
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) cb(null, true)
  else cb(new Error(`File type '${file.mimetype}' not allowed`))
}})

router.use(authenticate)

router.post("/upload", requirePermission("documents.*"), upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" })
    const validationErrors = validateFileType(req.file)
    if (validationErrors.length > 0) {
      fs.unlinkSync(req.file.path)
      return res.status(422).json({ error: "File rejected", details: validationErrors })
    }
    const file = await prisma.storedFile.create({
      data: {
        name: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        category: req.body.category || "general",
        uploadedBy: req.user?.email,
      },
    })
    res.status(201).json({ file })
  } catch (err) { next(err) }
})

router.get("/", requirePermission("documents.*"), async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
    const [files, total] = await Promise.all([
      prisma.storedFile.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.storedFile.count(),
    ])
    res.json({ files, total, page, limit })
  } catch (err) { next(err) }
})

router.get("/:id", requirePermission("documents.*"), async (req, res, next) => {
  try {
    const file = await prisma.storedFile.findUnique({ where: { id: req.params.id } })
    if (!file) return res.status(404).json({ error: "File not found" })
    res.sendFile(path.resolve(file.path))
  } catch (err) { next(err) }
})

router.delete("/:id", requirePermission("documents.*"), async (req, res, next) => {
  try {
    const file = await prisma.storedFile.findUnique({ where: { id: req.params.id } })
    if (!file) return res.status(404).json({ error: "File not found" })
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path)
    await prisma.storedFile.delete({ where: { id: req.params.id } })
    res.json({ message: "Deleted" })
  } catch (err) { next(err) }
})

router.get("/templates", requirePermission("documents.*"), async (req, res, next) => {
  try {
    const templates = await prisma.notificationTemplate.findMany({
      where: { type: "document" },
      orderBy: { createdAt: "desc" },
    })
    res.json({ templates })
  } catch (err) { next(err) }
})

router.post("/templates", requirePermission("documents.*"), async (req, res, next) => {
  try {
    const data = templateSchema.parse(req.body)
    const template = await prisma.notificationTemplate.create({
      data: { ...data, key: `doc_${Date.now()}`, type: "document" },
    })
    res.status(201).json({ template })
  } catch (err) { next(err) }
})

router.put("/templates/:id", requirePermission("documents.*"), async (req, res, next) => {
  try {
    const data = templateSchema.partial().parse(req.body)
    const template = await prisma.notificationTemplate.update({
      where: { id: req.params.id },
      data,
    })
    res.json({ template })
  } catch (err) { next(err) }
})

router.delete("/templates/:id", requirePermission("documents.*"), async (req, res, next) => {
  try {
    await prisma.notificationTemplate.delete({ where: { id: req.params.id } })
    res.json({ message: "Deleted" })
  } catch (err) { next(err) }
})

export { router as documentsRouter }
