import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requireRole, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

const createSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.number().positive(),
  method: z.string().default("cash"),
  status: z.string().default("completed"),
})

router.get("/", requireRole("admin", "super_admin", "operator", "viewer"), async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const where = {}
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({ where, skip: (page - 1) * limit, take: Math.min(100, Number(limit)), orderBy: { paidAt: "desc" }, include: { invoice: { select: { id: true, number: true } } } }),
      prisma.payment.count({ where }),
    ])
    res.json({ payments, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})


router.get("/export", requireRole("admin", "super_admin", "operator"), async (req, res, next) => {
  try {
    const items = await prisma.payment.findMany({ orderBy: { createdAt: "desc" } })
    const header = "invoiceId,amount,method,status,paidAt,createdAt"
    const rows = items.map(i => [i.invoiceId, i.amount, i.method, i.status, i.paidAt, i.createdAt].join(","))
    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=payments.csv")
    res.send([header, ...rows].join("\n"))
    auditLog(req, "payment.export", { count: items.length })
  } catch (err) { next(err) }
})

router.get("/:id", requireRole("admin", "super_admin", "operator", "viewer"), async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: req.params.id }, include: { invoice: true } })
    if (!payment) return res.status(404).json({ error: "Payment not found" })
    auditLog(req, "payment.viewed", { paymentId: req.params.id })
    res.json({ payment })
  } catch (err) { next(err) }
})

router.post("/", requireRole("admin", "super_admin", "billing"), async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body)
    const inv = await prisma.invoice.findUnique({ where: { id: data.invoiceId } })
    if (!inv) return res.status(404).json({ error: "Invoice not found" })
    if (inv.status === "paid") return res.status(400).json({ error: "Invoice is already paid" })
    if (inv.archivedAt) return res.status(400).json({ error: "Cannot pay archived invoice" })
    const payment = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({ data })
      await tx.invoice.update({ where: { id: data.invoiceId }, data: { status: "paid" } })
      return p
    })
    auditLog(req, 'payment.created', { paymentId: payment.id, invoiceId: data.invoiceId })
    prisma.notification.create({ data: { type: 'payment_received', title: 'Payment Received', body: 'Payment of EGP ' + data.amount + ' for invoice ' + data.invoiceId + ' received', recipientId: data.invoiceId } }).catch(() => {})
    res.status(201).json({ payment })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.delete("/:id", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const existingpayment = await prisma.payment.findUnique({ where: { id: req.params.id } });
    if (!existingpayment) return res.status(404).json({ error: "Not found" });
    await prisma.payment.delete({ where: { id: req.params.id } })
    auditLog(req, "payment.deleted", { paymentId: req.params.id })
    res.json({ success: true })
  } catch (err) { next(err) }
})

export { router as paymentsRouter }




