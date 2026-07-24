import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

const paymentSchema = z.object({
  customerId: z.string(),
  amount: z.number().positive(),
  method: z.enum(["cash", "cheque", "bank_transfer", "mobile_wallet", "online", "card"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

router.post("/payments", requirePermission("payments.*"), async (req, res, next) => {
  try {
    const data = paymentSchema.parse(req.body)
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } })
    if (!customer) return res.status(404).json({ error: "Customer not found" })

    const payment = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: { customerId: data.customerId, amount: data.amount, method: data.method, reference: data.reference, notes: data.notes, status: "completed" },
      })
      const overdueInvoices = await tx.invoice.findMany({
        where: { customerId: data.customerId, status: { in: ["pending", "issued", "overdue"] } },
        orderBy: { dueDate: "asc" },
      })
      let remaining = data.amount
      for (const inv of overdueInvoices) {
        if (remaining <= 0) break
        const due = inv.amount - (inv.paidAmount || 0)
        if (due <= 0) continue
        const alloc = Math.min(remaining, due)
        await tx.paymentTransaction.create({ data: { paymentId: p.id, invoiceId: inv.id, amount: alloc } })
        await tx.invoice.update({ where: { id: inv.id }, data: { paidAmount: { increment: alloc }, status: alloc >= due ? "paid" : "partial" } })
        remaining -= alloc
      }
      if (remaining > 0) {
        await tx.customerLedgerEntry.create({ data: { customerId: data.customerId, type: "credit", amount: remaining, description: "Overpayment / credit balance", reference: p.id } })
      }
      return p
    })
    auditLog(req, "payment.created", { paymentId: payment.id, customerId: data.customerId, amount: data.amount })
    res.status(201).json({ payment })
  } catch (err) { next(err) }
})

router.post("/payments/:id/reverse", requirePermission("payments.*"), async (req, res, next) => {
  try {
    if (req.user?.role !== "super_admin") return res.status(403).json({ error: "Only super_admin can reverse payments" })
    const { reason } = z.object({ reason: z.string().min(1) }).parse(req.body)
    const payment = await prisma.payment.findUnique({ where: { id: req.params.id }, include: { paymentTransactions: true } })
    if (!payment) return res.status(404).json({ error: "Payment not found" })
    if (payment.status !== "completed") return res.status(400).json({ error: "Payment already reversed" })

    await prisma.$transaction(async (tx) => {
      for (const t of payment.paymentTransactions) {
        await tx.invoice.update({ where: { id: t.invoiceId }, data: { paidAmount: { decrement: t.amount } } })
      }
      await tx.payment.update({ where: { id: payment.id }, data: { status: "reversed" } })
      await tx.customerLedgerEntry.create({ data: { customerId: payment.customerId, type: "reversal", amount: payment.amount, description: reason, reference: payment.id } })
    })
    auditLog(req, "payment.reversed", { paymentId: payment.id, reason })
    res.json({ message: "Payment reversed" })
  } catch (err) { next(err) }
})

router.get("/customers/:id/statement", requirePermission("payments.*"), async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: req.params.id } })
    if (!customer) return res.status(404).json({ error: "Customer not found" })
    const invoices = await prisma.invoice.findMany({ where: { customerId: req.params.id }, orderBy: { createdAt: "asc" } })
    const payments = await prisma.payment.findMany({ where: { customerId: req.params.id, status: "completed" }, orderBy: { createdAt: "asc" } })
    const balance = invoices.reduce((s, i) => s + i.amount, 0) - payments.reduce((s, p) => s + p.amount, 0)
    const aging = { "0-30": 0, "31-60": 0, "61-90": 0, "90+": 0 }
    const now = Date.now()
    for (const inv of invoices) {
      if (inv.status === "paid" || inv.status === "cancelled") continue
      const due = inv.dueDate ? Math.floor((now - new Date(inv.dueDate).getTime()) / 86400000) : 0
      const owing = inv.amount - (inv.paidAmount || 0)
      if (owing <= 0) continue
      if (due > 90) aging["90+"] += owing
      else if (due > 60) aging["61-90"] += owing
      else if (due > 30) aging["31-60"] += owing
      else aging["0-30"] += owing
    }
    res.json({ customerId: req.params.id, customerName: customer.name, totalInvoiced: invoices.reduce((s, i) => s + i.amount, 0), totalPaid: payments.reduce((s, p) => s + p.amount, 0), balance, aging, invoices: invoices.length, payments: payments.length })
  } catch (err) { next(err) }
})

router.get("/customers/:id/aging", requirePermission("payments.*"), async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: req.params.id } })
    if (!customer) return res.status(404).json({ error: "Customer not found" })
    const invoices = await prisma.invoice.findMany({ where: { customerId: req.params.id, status: { notIn: ["paid", "cancelled"] } }, orderBy: { dueDate: "asc" } })
    const aging = invoices.map((i) => ({ invoiceId: i.id, number: i.number, amount: i.amount, dueDate: i.dueDate, outstanding: i.amount - (i.paidAmount || 0), daysOverdue: i.dueDate ? Math.max(0, Math.floor((Date.now() - new Date(i.dueDate).getTime()) / 86400000)) : 0 }))
    res.json({ customerId: req.params.id, aging })
  } catch (err) { next(err) }
})

router.get("/", requirePermission("payments.*"), async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" }, include: { paymentTransactions: true } }),
      prisma.payment.count(),
    ])
    res.json({ payments, total, page, limit })
  } catch (err) { next(err) }
})

export { router as paymentsRouter }
