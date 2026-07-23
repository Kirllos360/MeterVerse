import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "review", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assigneeId: z.string().uuid().optional().nullable(),
  customerId: z.string().uuid().optional().nullable(),
  dueDate: z.string().optional().nullable(),
})

router.get("/", requirePermission("tasks.list"), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, priority, assigneeId } = req.query
    const where = { ...(status ? { status } : {}), ...(priority ? { priority } : {}), ...(assigneeId ? { assigneeId } : {}) }
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({ where, skip: (page - 1) * limit, take: Math.min(100, Number(limit)), orderBy: { createdAt: "desc" }, include: { assignee: { select: { id: true, name: true, email: true } }, customer: { select: { id: true, name: true } } } }),
      prisma.task.count({ where }),
    ])
    res.json({ tasks, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

router.get("/:id", requirePermission("tasks.read"), async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id }, include: { assignee: { select: { id: true, name: true } }, customer: { select: { id: true, name: true } } } })
    if (!task) return res.status(404).json({ error: "Task not found" })
    res.json({ task })
  } catch (err) { next(err) }
})

router.post("/", requirePermission("tasks.create"), async (req, res, next) => {
  try {
    const data = taskSchema.parse(req.body)
    const task = await prisma.task.create({ data: { ...data, createdBy: req.user?.email } })
    auditLog(req, "task.created", { taskId: task.id, title: task.title })
    res.status(201).json({ task })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.put("/:id", requirePermission("tasks.update"), async (req, res, next) => {
  try {
    const data = taskSchema.partial().parse(req.body)
    const task = await prisma.task.update({ where: { id: req.params.id }, data })
    auditLog(req, "task.updated", { taskId: task.id })
    res.json({ task })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.delete("/:id", requirePermission("tasks.delete"), async (req, res, next) => {
  try {
    const existing = await prisma.task.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: "Not found" })
    await prisma.task.delete({ where: { id: req.params.id } })
    auditLog(req, "task.deleted", { taskId: req.params.id })
    res.json({ success: true })
  } catch (err) { next(err) }
})

export { router as tasksRouter }
