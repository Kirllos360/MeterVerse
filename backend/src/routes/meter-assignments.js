import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requireRole, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

const createSchema = z.object({
  meterId: z.string().min(1),
  customerId: z.string().min(1),
  contractId: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  reason: z.string().optional(),
})

router.get("/", requireRole("admin", "operator", "viewer"), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query
    const where = { status: "active" }
    if (status) where.status = status
    const [assignments, total] = await Promise.all([
      prisma.meterAssignment.findMany({ where, skip: (page - 1) * limit, take: Number(limit), orderBy: { startDate: "desc" }, include: { meter: { select: { id: true, serial: true } }, customer: { select: { id: true, name: true } } } }),
      prisma.meterAssignment.count({ where }),
    ])
    res.json({ assignments, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

router.get("/:id", requireRole("admin", "operator", "viewer"), async (req, res, next) => {
  try {
    const assignment = await prisma.meterAssignment.findUnique({ where: { id: req.params.id }, include: { meter: true, customer: true, contract: true, history: true } })
    if (!assignment) return res.status(404).json({ error: "Assignment not found" })
    auditLog(req, "assignment.viewed", { assignmentId: req.params.id })
    res.json({ assignment })
  } catch (err) { next(err) }
})

router.post("/", requireRole("admin", "operator"), async (req, res, next) => {
  try {
    const data = createSchema.parse({ ...req.body, startDate: req.body.startDate || new Date().toISOString() })
    const assignment = await prisma.meterAssignment.create({ data })
    await prisma.meter.update({ where: { id: data.meterId }, data: { customerId: data.customerId } })
    auditLog(req, "assignment.created", { assignmentId: assignment.id, meterId: data.meterId, customerId: data.customerId })
    res.status(201).json({ assignment })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.put("/:id", requireRole("admin", "operator"), async (req, res, next) => {
  try {
    const data = createSchema.partial().parse(req.body)
    const assignment = await prisma.meterAssignment.update({ where: { id: req.params.id }, data })
    auditLog(req, "assignment.updated", { assignmentId: req.params.id })
    res.json({ assignment })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.delete("/:id", requireRole("admin"), async (req, res, next) => {
  try {
    await prisma.meterAssignment.update({ where: { id: req.params.id }, data: { status: "ended", endDate: new Date() } })
    auditLog(req, "assignment.ended", { assignmentId: req.params.id })
    res.json({ success: true })
  } catch (err) { next(err) }
})

export { router as meterAssignmentRouter }
