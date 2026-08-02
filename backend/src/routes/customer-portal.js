import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

// ─── Customer preferences ────────────────────────────────────────────────────
router.get("/customers/:id/preferences", requirePermission("customers.read"), async (req, res, next) => {
  try {
    const preference = await prisma.customerPreference.findUnique({ where: { customerId: req.params.id } })
    res.json({ preference })
  } catch (err) { next(err) }
})

router.put("/customers/:id/preferences", requirePermission("customers.update"), async (req, res, next) => {
  try {
    const data = z.object({ language: z.string().optional(), theme: z.string().optional(), notifyChannels: z.array(z.string()).optional(), billingEmail: z.string().optional(), billingPhone: z.string().optional(), preferences: z.record(z.any()).optional() }).parse(req.body)
    const preference = await prisma.customerPreference.upsert({
      where: { customerId: req.params.id },
      update: { ...(data.language && { language: data.language }), ...(data.theme && { theme: data.theme }), ...(data.notifyChannels && { notifyChannels: JSON.stringify(data.notifyChannels) }), ...(data.billingEmail !== undefined && { billingEmail: data.billingEmail }), ...(data.billingPhone !== undefined && { billingPhone: data.billingPhone }), ...(data.preferences && { preferences: JSON.stringify(data.preferences) }) },
      create: { customerId: req.params.id, language: data.language || "en", theme: data.theme || "adaptive", notifyChannels: data.notifyChannels ? JSON.stringify(data.notifyChannels) : '["in_app","email"]', billingEmail: data.billingEmail, billingPhone: data.billingPhone },
    })
    auditLog(req, "customer.preference.updated", { customerId: req.params.id })
    res.json({ preference })
  } catch (err) { next(err) }
})

// ─── Delegated access ────────────────────────────────────────────────────────
router.get("/customers/:id/delegated", requirePermission("customers.read"), async (req, res, next) => {
  try {
    const delegated = await prisma.delegatedAccess.findMany({ where: { customerId: req.params.id, status: "ACTIVE" } })
    res.json({ delegated })
  } catch (err) { next(err) }
})

router.post("/customers/:id/delegated", requirePermission("customers.update"), async (req, res, next) => {
  try {
    const data = z.object({ delegateEmail: z.string().email(), permissions: z.array(z.string()).default(["view"]), validTo: z.string().optional() }).parse(req.body)
    const access = await prisma.delegatedAccess.create({ data: { customerId: req.params.id, delegateEmail: data.delegateEmail, permissions: JSON.stringify(data.permissions), validTo: data.validTo ? new Date(data.validTo) : null, createdBy: req.user?.id } })
    auditLog(req, "customer.delegated", { customerId: req.params.id, accessId: access.id })
    res.status(201).json({ access })
  } catch (err) { next(err) }
})

// ─── Service requests ────────────────────────────────────────────────────────
router.get("/customers/:id/requests", requirePermission("customers.read"), async (req, res, next) => {
  try {
    const requests = await prisma.serviceRequest.findMany({ where: { customerId: req.params.id, archivedAt: null }, orderBy: { createdAt: "desc" }, include: { messages: { orderBy: { createdAt: "asc" } } } })
    res.json({ requests })
  } catch (err) { next(err) }
})

router.post("/customers/:id/requests", requirePermission("customers.update"), async (req, res, next) => {
  try {
    const data = z.object({ type: z.string().min(1), subject: z.string().min(1), description: z.string().optional() }).parse(req.body)
    const request = await prisma.$transaction(async (tx) => {
      const r = await tx.serviceRequest.create({ data: { customerId: req.params.id, type: data.type, subject: data.subject, description: data.description, createdBy: req.user?.id } })
      if (data.description) await tx.serviceRequestMessage.create({ data: { requestId: r.id, authorId: req.user?.id, body: data.description } })
      return r
    })
    auditLog(req, "customer.request.created", { customerId: req.params.id, requestId: request.id, type: data.type })
    res.status(201).json({ request })
  } catch (err) { next(err) }
})

// ─── Tickets (support/claims) ────────────────────────────────────────────────
router.get("/customers/:id/tickets", requirePermission("customers.read"), async (req, res, next) => {
  try {
    const tickets = await prisma.ticket.findMany({ where: { customerId: req.params.id, archivedAt: null }, orderBy: { createdAt: "desc" } })
    res.json({ tickets })
  } catch (err) { next(err) }
})

router.post("/customers/:id/tickets", requirePermission("customers.update"), async (req, res, next) => {
  try {
    const data = z.object({ subject: z.string().min(1), description: z.string().optional(), category: z.string().default("SUPPORT"), priority: z.string().default("NORMAL") }).parse(req.body)
    const ticket = await prisma.ticket.create({ data: { customerId: req.params.id, subject: data.subject, description: data.description, category: data.category, priority: data.priority, createdBy: req.user?.id } })
    auditLog(req, "customer.ticket.created", { customerId: req.params.id, ticketId: ticket.id })
    res.status(201).json({ ticket })
  } catch (err) { next(err) }
})

router.patch("/tickets/:id", requirePermission("customers.update"), async (req, res, next) => {
  try {
    const data = z.object({ status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]), resolution: z.string().optional() }).parse(req.body)
    const ticket = await prisma.ticket.update({ where: { id: req.params.id }, data: { status: data.status, ...(data.resolution && { description: data.resolution }) } })
    auditLog(req, "customer.ticket.updated", { ticketId: ticket.id, status: data.status })
    res.json({ ticket })
  } catch (err) { next(err) }
})

// ─── Customer documents ──────────────────────────────────────────────────────
router.get("/customers/:id/documents", requirePermission("customers.read"), async (req, res, next) => {
  try {
    const documents = await prisma.customerDocument.findMany({ where: { customerId: req.params.id, archivedAt: null }, orderBy: { createdAt: "desc" } })
    res.json({ documents })
  } catch (err) { next(err) }
})

// ─── Customer timeline (unified activity) ────────────────────────────────────
router.get("/customers/:id/timeline", requirePermission("customers.read"), async (req, res, next) => {
  try {
    const [invoices, payments, requests, tickets, audit] = await Promise.all([
      prisma.invoice.findMany({ where: { customerId: req.params.id, archivedAt: null }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, number: true, amount: true, status: true, createdAt: true } }),
      prisma.payment.findMany({ where: { customerId: req.params.id, archivedAt: null }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, amount: true, method: true, status: true, createdAt: true } }),
      prisma.serviceRequest.findMany({ where: { customerId: req.params.id }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, type: true, status: true, createdAt: true } }),
      prisma.ticket.findMany({ where: { customerId: req.params.id }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, subject: true, status: true, createdAt: true } }),
      prisma.auditEntry.findMany({ where: { OR: [{ resourceId: req.params.id }, { details: { contains: req.params.id } }] }, orderBy: { timestamp: "desc" }, take: 20, select: { id: true, action: true, timestamp: true } }),
    ])
    res.json({ invoices, payments, requests, tickets, audit })
  } catch (err) { next(err) }
})

export { router as customerPortalRouter }
