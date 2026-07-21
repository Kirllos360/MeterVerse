import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requireRole, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

const createSchema = z.object({
  number: z.string().min(1),
  customerId: z.string().min(1),
  amount: z.number().positive(),
  status: z.string().default("pending"),
  dueDate: z.string().optional(),
})

router.get("/", requireRole("admin", "operator", "viewer"), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query
    const where = { archivedAt: null }
    if (status) where.status = status
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({ where, skip: (page - 1) * limit, take: Number(limit), orderBy: { issuedAt: "desc" }, include: { customer: { select: { id: true, name: true } } } }),
      prisma.invoice.count({ where }),
    ])
    res.json({ invoices, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

router.get("/:id", requireRole("admin", "operator", "viewer"), async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findFirst({ where: { id: req.params.id, archivedAt: null }, include: { customer: true, payments: true } })
    if (!invoice) return res.status(404).json({ error: "Invoice not found" })
    auditLog(req, "invoice.viewed", { invoiceId: req.params.id })
    res.json({ invoice })
  } catch (err) { next(err) }
})

router.post("/", requireRole("admin", "billing"), async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body)
    const invoice = await prisma.invoice.create({ data })
    auditLog(req, "invoice.created", { invoiceId: invoice.id })
    res.status(201).json({ invoice })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.put("/:id", requireRole("admin", "billing"), async (req, res, next) => {
  try {
    const data = createSchema.partial().parse(req.body)
    const invoice = await prisma.invoice.update({ where: { id: req.params.id }, data })
    auditLog(req, "invoice.updated", { invoiceId: req.params.id })
    res.json({ invoice })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.delete("/:id", requireRole("admin"), async (req, res, next) => {
  try {
    await prisma.invoice.update({ where: { id: req.params.id }, data: { archivedAt: new Date() } })
    auditLog(req, "invoice.archived", { invoiceId: req.params.id })
    res.json({ success: true })
  } catch (err) { next(err) }
})

export { router as invoicesRouter }
