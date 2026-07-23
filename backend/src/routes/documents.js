import { Router } from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission } from "../middleware/security.js"
import { z } from "zod"

const router = Router()
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads"
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

router.use(authenticate)

router.post("/upload", requirePermission("documents.*"), upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" })
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

export { router as documentsRouter }
