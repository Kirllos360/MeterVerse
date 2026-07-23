import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requireRole } from "../middleware/security.js"

const templateSchema = z.object({
  key: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  type: z.string().optional().default("in_app"),
  subject: z.string().optional().nullable(),
  body: z.string().min(1),
  variables: z.string().optional().default("[]"),
})

const router = Router()
router.use(authenticate)

router.get("/", requireRole("admin", "super_admin", "operator", "viewer"), async (req, res, next) => {
  try {
    const userId = req.user.sub
    const { page = 1, limit = 20 } = req.query
    const where = { recipientId: userId }
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({ where, skip: (page - 1) * limit, take: Number(limit), orderBy: { createdAt: "desc" } }),
      prisma.notification.count({ where }),
    ])
    res.json({ notifications, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

router.get("/unread-count", requireRole("admin", "super_admin", "operator", "viewer"), async (req, res, next) => {
  try {
    const count = await prisma.notification.count({ where: { recipientId: req.user.sub, status: "sent", readAt: null } })
    res.json({ count })
  } catch (err) { next(err) }
})

router.put("/read-all", requireRole("admin", "super_admin", "operator", "viewer"), async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { recipientId: req.user.sub, readAt: null },
      data: { status: "read", readAt: new Date() },
    })
    res.json({ success: true })
  } catch (err) { next(err) }
})

router.put("/:id/read", requireRole("admin", "super_admin", "operator", "viewer"), async (req, res, next) => {
  try {
    const notif = await prisma.notification.update({
      where: { id: req.params.id },
      data: { status: "read", readAt: new Date() },
    })
    res.json({ notification: notif })
  } catch (err) { next(err) }
})

router.get("/templates", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const templates = await prisma.notificationTemplate.findMany({ orderBy: { key: "asc" } })
    res.json({ templates })
  } catch (err) { next(err) }
})

router.post("/templates", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const data = templateSchema.parse(req.body)
    const template = await prisma.notificationTemplate.create({ data })
    res.status(201).json({ template })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.put("/templates/:id", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const data = templateSchema.partial().parse(req.body)
    const template = await prisma.notificationTemplate.update({ where: { id: req.params.id }, data })
    res.json({ template })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.delete("/templates/:id", requireRole("super_admin"), async (req, res, next) => {
  try {
    await prisma.notificationTemplate.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) { next(err) }
})

export { router as notificationsRouter }
