import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  organizationId: z.string(),
  status: z.enum(["active", "inactive"]).default("active"),
  taxEnabled: z.boolean().default(false),
  taxRate: z.number().min(0).max(1).default(0.14),
  waterDifferenceMode: z.enum(["billable", "report_only"]).default("report_only"),
  readingThreshold: z.number().positive().optional(),
  paymentTermsDays: z.number().int().min(0).max(365).default(30),
})

router.get("/", requirePermission("admin.*"), async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
    const search = req.query.search?.toString().trim() || ""
    const status = req.query.status?.toString() || ""
    const orgId = req.query.organizationId?.toString() || ""

    const where = {}
    if (status) where.status = status
    if (orgId) where.organizationId = orgId
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          organization: { select: { id: true, name: true } },
          _count: { select: { zones: true } },
        },
      }),
      prisma.project.count({ where }),
    ])
    res.json({ projects, total, page, limit })
  } catch (err) { next(err) }
})

router.get("/stats", requirePermission("admin.*"), async (req, res, next) => {
  try {
    const [total, active, inactive] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: "active" } }),
      prisma.project.count({ where: { status: "inactive" } }),
    ])
    res.json({ stats: { total, active, inactive } })
  } catch (err) { next(err) }
})

router.get("/:id", requirePermission("admin.*"), async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        organization: { select: { id: true, name: true } },
        _count: { select: { zones: true } },
      },
    })
    if (!project) return res.status(404).json({ error: "Project not found", code: "NOT_FOUND" })
    res.json({ project })
  } catch (err) { next(err) }
})

router.post("/", requirePermission("admin.*"), async (req, res, next) => {
  try {
    const data = projectSchema.parse(req.body)
    const project = await prisma.project.create({ data })
    auditLog(req, "project.created", { projectId: project.id, name: project.name })
    res.status(201).json({ project })
  } catch (err) { next(err) }
})

router.put("/:id", requirePermission("admin.*"), async (req, res, next) => {
  try {
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: "Project not found", code: "NOT_FOUND" })
    const data = projectSchema.partial().parse(req.body)
    const project = await prisma.project.update({ where: { id: req.params.id }, data })
    auditLog(req, "project.updated", { projectId: project.id, changes: Object.keys(data) })
    res.json({ project })
  } catch (err) { next(err) }
})

router.delete("/:id", requirePermission("admin.*"), async (req, res, next) => {
  try {
    const existing = await prisma.project.findUnique({ where: { id: req.params.id }, include: { _count: { select: { zones: true } } } })
    if (!existing) return res.status(404).json({ error: "Project not found", code: "NOT_FOUND" })
    if (existing._count.zones > 0) return res.status(400).json({ error: "Cannot archive project with active zones", zoneCount: existing._count.zones })
    const project = await prisma.project.update({ where: { id: req.params.id }, data: { status: "inactive", archivedAt: new Date() } })
    auditLog(req, "project.archived", { projectId: project.id })
    res.json({ project })
  } catch (err) { next(err) }
})

router.post("/:id/restore", requirePermission("admin.*"), async (req, res, next) => {
  try {
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: "Project not found", code: "NOT_FOUND" })
    const project = await prisma.project.update({ where: { id: req.params.id }, data: { status: "active", archivedAt: null } })
    auditLog(req, "project.restored", { projectId: project.id })
    res.json({ project })
  } catch (err) { next(err) }
})

router.post("/bulk/archive", requirePermission("admin.*"), async (req, res, next) => {
  try {
    const { ids } = z.object({ ids: z.array(z.string().min(1)).min(1) }).parse(req.body)
    const result = await prisma.project.updateMany({ where: { id: { in: ids }, zones: { none: {} } }, data: { status: "inactive", archivedAt: new Date() } })
    auditLog(req, "projects.bulk.archived", { count: result.count })
    res.json({ archived: result.count })
  } catch (err) { next(err) }
})

export { router as projectsRouter }
