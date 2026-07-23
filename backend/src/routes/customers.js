import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requireRole, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

const createSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  area: z.string().max(100).optional().or(z.literal("")),
})

router.get("/", requireRole("admin", "operator", "viewer"), async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10))
    const search = req.query.search
    const where = { archivedAt: null, ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}) }
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.customer.count({ where }),
    ])
    res.json({ customers, total, page, limit })
  } catch (err) { next(err) }
})

router.get("/:id", requireRole("admin", "operator", "viewer"), async (req, res, next) => {
  try {
    const customer = await prisma.customer.findFirst({ where: { id: req.params.id, archivedAt: null }, include: { meters: true, invoices: true } })
    if (!customer) return res.status(404).json({ error: "Customer not found" })
    auditLog(req, 'customer.viewed', { customerId: req.params.id })
    res.json({ customer })
  } catch (err) { next(err) }
})

router.post("/", requireRole("admin", "operator"), async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body)
    const customer = await prisma.customer.create({ data })
    auditLog(req, 'customer.created', { customerId: customer.id })
    prisma.notification.create({ data: { type: "customer_welcome", title: "New Customer", body: `Customer ${customer.name} was created`, recipientEmail: customer.email || undefined } }).catch(() => {})
    res.status(201).json({ customer })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.put("/:id", requireRole("admin", "operator"), async (req, res, next) => {
  try {
    const data = createSchema.partial().parse(req.body)
    const customer = await prisma.customer.update({ where: { id: req.params.id }, data })
    res.json({ customer })
    auditLog(req, 'customer.updated', { customerId: req.params.id })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.delete("/:id", requireRole("admin"), async (req, res, next) => {
  try {
    const activeAssignments = await prisma.meterAssignment.count({ where: { customerId: req.params.id, status: "active" } })
    if (activeAssignments > 0) return res.status(400).json({ error: "Cannot archive customer with active meter assignments" })
    const unpaidInvoices = await prisma.invoice.count({ where: { customerId: req.params.id, status: "pending", archivedAt: null } })
    if (unpaidInvoices > 0) return res.status(400).json({ error: "Cannot archive customer with unpaid invoices" })
    await prisma.customer.update({ where: { id: req.params.id }, data: { archivedAt: new Date() } })
    auditLog(req, 'customer.archived', { customerId: req.params.id })
    res.json({ success: true })
  } catch (err) { next(err) }
})

router.get("/export", requireRole("admin", "operator"), async (req, res, next) => {
  try {
    const customers = await prisma.customer.findMany({ where: { archivedAt: null }, orderBy: { createdAt: "desc" } })
    const header = "id,name,email,phone,status,area,createdAt"
    const rows = customers.map(c => `${c.id},${c.name || ""},${c.email || ""},${c.phone || ""},${c.status || ""},${c.area || ""},${c.createdAt?.toISOString() || ""}`)
    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=customers.csv")
    res.send([header, ...rows].join("\n"))
    auditLog(req, "customer.export", { count: customers.length })
  } catch (err) { next(err) }
})

router.get("/stats", requireRole("admin", "operator", "viewer"), async (req, res, next) => {
  try {
    const [total, active, inactive, maintenance, terminated] = await Promise.all([
      prisma.customer.count({ where: { archivedAt: null } }),
      prisma.customer.count({ where: { archivedAt: null, status: "active" } }),
      prisma.customer.count({ where: { archivedAt: null, status: "inactive" } }),
      prisma.customer.count({ where: { archivedAt: null, status: "maintenance" } }),
      prisma.customer.count({ where: { archivedAt: null, status: "terminated" } }),
    ])
    res.json({ stats: { total, active, inactive, maintenance, terminated } })
  } catch (err) { next(err) }
})

export { router as customersRouter }

