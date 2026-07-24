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
    const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" }, include: { organization: { select: { name: true } } } })
    res.json({ projects })
  } catch (err) { next(err) }
})

router.get("/:id", requirePermission("admin.*"), async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id }, include: { organization: { select: { name: true } } } })
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

export { router as projectsRouter }
