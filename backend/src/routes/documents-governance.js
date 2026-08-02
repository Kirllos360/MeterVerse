import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

const docSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  storedFileId: z.string().optional(),
  customerId: z.string().optional(),
  areaId: z.string().optional(),
  projectId: z.string().optional(),
  retentionPolicyId: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// GET /api/documents-governance — list documents (filtered)
router.get("/", requirePermission("documents.*"), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, categoryId, customerId, areaId } = req.query
    const where = { archivedAt: null }
    if (status) where.status = String(status)
    if (categoryId) where.categoryId = String(categoryId)
    if (customerId) where.customerId = String(customerId)
    if (areaId) where.areaId = String(areaId)
    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where, skip: (page - 1) * limit, take: Math.min(100, Number(limit)),
        orderBy: { updatedAt: "desc" },
        include: { category: { select: { id: true, name: true } }, tags: { include: { tag: true } }, versions: { select: { id: true, versionNumber: true, createdAt: true }, orderBy: { versionNumber: "desc" }, take: 1 } },
      }),
      prisma.document.count({ where }),
    ])
    res.json({ documents, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

// POST /api/documents-governance — create document (register a stored file)
router.post("/", requirePermission("documents.create"), async (req, res, next) => {
  try {
    const data = docSchema.parse(req.body)
    const document = await prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          title: data.title, description: data.description, categoryId: data.categoryId,
          storedFileId: data.storedFileId, customerId: data.customerId, areaId: data.areaId,
          projectId: data.projectId, retentionPolicyId: data.retentionPolicyId,
          createdBy: req.user?.id,
        },
      })
      if (data.storedFileId) {
        await tx.documentVersion.create({ data: { documentId: doc.id, versionNumber: 1, storedFileId: data.storedFileId } })
      }
      if (data.tags?.length) {
        for (const t of data.tags) {
          const tag = await tx.documentTag.upsert({ where: { name: t }, update: {}, create: { name: t } })
          await tx.documentDocumentTag.create({ data: { documentId: doc.id, tagId: tag.id } })
        }
      }
      return doc
    })
    auditLog(req, "document.created", { documentId: document.id, title: data.title })
    res.status(201).json({ document })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// GET /api/documents-governance/:id — document detail + versions
router.get("/:id", requirePermission("documents.*"), async (req, res, next) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { category: true, tags: { include: { tag: true } }, versions: { orderBy: { versionNumber: "desc" } }, approvals: true, comments: true, retentionPolicy: true },
    })
    if (!document) return res.status(404).json({ error: "Document not found" })
    res.json({ document })
  } catch (err) { next(err) }
})

// PUT /api/documents-governance/:id — update metadata + create new version
router.put("/:id", requirePermission("documents.update"), async (req, res, next) => {
  try {
    const data = docSchema.partial().parse(req.body)
    const existing = await prisma.document.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: "Document not found" })

    const document = await prisma.$transaction(async (tx) => {
      const nextVersion = data.storedFileId ? existing.versionNumber + 1 : existing.versionNumber
      const doc = await tx.document.update({
        where: { id: existing.id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
          ...(data.retentionPolicyId !== undefined && { retentionPolicyId: data.retentionPolicyId }),
          ...(data.storedFileId && { storedFileId: data.storedFileId, versionNumber: nextVersion }),
        },
      })
      if (data.storedFileId) {
        await tx.documentVersion.create({ data: { documentId: doc.id, versionNumber: nextVersion, storedFileId: data.storedFileId } })
      }
      return doc
    })
    auditLog(req, "document.updated", { documentId: document.id, newVersion: document.versionNumber })
    res.json({ document })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// POST /api/documents-governance/:id/approve — approve lifecycle
router.post("/:id/approve", requirePermission("documents.update"), async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(["APPROVED", "PUBLISHED", "ARCHIVED", "REJECTED"]) }).parse(req.body)
    const document = await prisma.document.update({ where: { id: req.params.id }, data: { status } })
    await prisma.documentApproval.create({ data: { documentId: document.id, approverId: req.user?.id, status: status === "REJECTED" ? "REJECTED" : "APPROVED", decidedAt: new Date() } })
    auditLog(req, "document.lifecycle", { documentId: document.id, status })
    res.json({ document })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// POST /api/documents-governance/:id/comment
router.post("/:id/comment", requirePermission("documents.update"), async (req, res, next) => {
  try {
    const { body } = z.object({ body: z.string().min(1) }).parse(req.body)
    const comment = await prisma.documentComment.create({ data: { documentId: req.params.id, authorId: req.user?.id, body } })
    auditLog(req, "document.commented", { documentId: req.params.id })
    res.status(201).json({ comment })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// Categories + tags + retention (small reference CRUD)
router.get("/meta/categories", requirePermission("documents.*"), async (req, res, next) => {
  try {
    const categories = await prisma.documentCategory.findMany({ where: { archivedAt: null }, orderBy: { name: "asc" } })
    res.json({ categories })
  } catch (err) { next(err) }
})
router.post("/meta/categories", requirePermission("documents.create"), async (req, res, next) => {
  try {
    const { name, code, description } = z.object({ name: z.string().min(1), code: z.string().min(1), description: z.string().optional() }).parse(req.body)
    const category = await prisma.documentCategory.create({ data: { name, code, description } })
    auditLog(req, "document.category.created", { categoryId: category.id })
    res.status(201).json({ category })
  } catch (err) { next(err) }
})
router.get("/meta/retention-policies", requirePermission("documents.*"), async (req, res, next) => {
  try {
    const policies = await prisma.retentionPolicy.findMany({ where: { active: true, archivedAt: null } })
    res.json({ policies })
  } catch (err) { next(err) }
})

export { router as documentGovernanceRouter }
