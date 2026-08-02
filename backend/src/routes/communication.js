import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

// ─── Conversations (unified inbox) ──────────────────────────────────────────
router.get("/conversations", requirePermission("notifications.*"), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, type, customerId } = req.query
    const where = { archivedAt: null }
    if (status) where.status = String(status)
    if (type) where.type = String(type)
    if (customerId) where.customerId = String(customerId)
    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where, skip: (page - 1) * limit, take: Math.min(100, Number(limit)),
        orderBy: { updatedAt: "desc" },
        include: { messages: { orderBy: { createdAt: "asc" }, take: 1 } },
      }),
      prisma.conversation.count({ where }),
    ])
    res.json({ conversations, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

router.post("/conversations", requirePermission("notifications.create"), async (req, res, next) => {
  try {
    const data = z.object({ subject: z.string().optional(), type: z.string().default("INTERNAL"), customerId: z.string().optional(), areaId: z.string().optional(), projectId: z.string().optional(), body: z.string().optional() }).parse(req.body)
    const conversation = await prisma.$transaction(async (tx) => {
      const c = await tx.conversation.create({ data: { subject: data.subject, type: data.type, customerId: data.customerId, areaId: data.areaId, projectId: data.projectId, createdBy: req.user?.id } })
      if (data.body) await tx.message.create({ data: { conversationId: c.id, senderId: req.user?.id, body: data.body, channel: "in_app" } })
      return c
    })
    auditLog(req, "conversation.created", { conversationId: conversation.id, type: data.type })
    res.status(201).json({ conversation })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.get("/conversations/:id/messages", requirePermission("notifications.*"), async (req, res, next) => {
  try {
    const messages = await prisma.message.findMany({ where: { conversationId: req.params.id }, orderBy: { createdAt: "asc" } })
    res.json({ messages })
  } catch (err) { next(err) }
})

router.post("/conversations/:id/messages", requirePermission("notifications.create"), async (req, res, next) => {
  try {
    const { body, channel } = z.object({ body: z.string().min(1), channel: z.string().default("in_app") }).parse(req.body)
    const message = await prisma.message.create({ data: { conversationId: req.params.id, senderId: req.user?.id, body, channel } })
    await prisma.conversation.update({ where: { id: req.params.id }, data: { status: "ACTIVE" } })
    auditLog(req, "conversation.message", { conversationId: req.params.id, messageId: message.id })
    res.status(201).json({ message })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.patch("/conversations/:id", requirePermission("notifications.*"), async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(["OPEN", "ACTIVE", "CLOSED", "ARCHIVED"]) }).parse(req.body)
    const conversation = await prisma.conversation.update({ where: { id: req.params.id }, data: { status } })
    auditLog(req, "conversation.updated", { conversationId: conversation.id, status })
    res.json({ conversation })
  } catch (err) { next(err) }
})

// ─── Delivery tracking ───────────────────────────────────────────────────────
router.get("/deliveries", requirePermission("notifications.*"), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, channel, status } = req.query
    const where = {}
    if (channel) where.channel = String(channel)
    if (status) where.status = String(status)
    const [deliveries, total] = await Promise.all([
      prisma.deliveryAttempt.findMany({ where, skip: (page - 1) * limit, take: Math.min(100, Number(limit)), orderBy: { createdAt: "desc" } }),
      prisma.deliveryAttempt.count({ where }),
    ])
    res.json({ deliveries, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

router.post("/deliveries", requirePermission("notifications.create"), async (req, res, next) => {
  try {
    const data = z.object({ channel: z.enum(["email", "sms", "push", "webhook"]), recipient: z.string().min(1), subject: z.string().optional(), body: z.string().optional() }).parse(req.body)
    const delivery = await prisma.deliveryAttempt.create({ data: { channel: data.channel, recipient: data.recipient, subject: data.subject, body: data.body, status: "PENDING", attempts: 1 } })
    auditLog(req, "delivery.created", { deliveryId: delivery.id, channel: data.channel, recipient: data.recipient })
    res.status(201).json({ delivery })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// ─── Notification preferences ────────────────────────────────────────────────
router.get("/preferences", requirePermission("notifications.*"), async (req, res, next) => {
  try {
    const prefs = await prisma.notificationPreference.findMany({ where: { userId: req.user?.sub ?? req.user?.id } })
    res.json({ preferences: prefs })
  } catch (err) { next(err) }
})

router.post("/preferences", requirePermission("notifications.*"), async (req, res, next) => {
  try {
    const data = z.object({ category: z.string().default("general"), channels: z.array(z.string()).default(["in_app"]), enabled: z.boolean().default(true) }).parse(req.body)
    const preference = await prisma.notificationPreference.upsert({
      where: { userId_category: { userId: req.user?.sub ?? req.user?.id ?? "", category: data.category } },
      update: { channels: JSON.stringify(data.channels), enabled: data.enabled },
      create: { userId: req.user?.sub ?? req.user?.id, category: data.category, channels: JSON.stringify(data.channels), enabled: data.enabled },
    })
    auditLog(req, "preference.updated", { preferenceId: preference.id })
    res.json({ preference })
  } catch (err) { next(err) }
})

export { router as communicationRouter }
