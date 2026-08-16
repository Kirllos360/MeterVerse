import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, requireAccess, scopeWhere, clampRequestedScope, auditLog } from "../middleware/security.js"
import { createChequePayment, clearChequePayment, rejectChequePayment } from "../services/cheque-engine.js"

const router = Router()
router.use(authenticate)

const createChequeSchema = z.object({
  customerId: z.string().min(1),
  invoiceId: z.string().optional().nullable(),
  amount: z.number().positive(),
  chequeNumber: z.string().min(1),
  bankName: z.string().optional(),
  notes: z.string().optional(),
})

const rejectSchema = z.object({
  reason: z.string().min(1),
})

// List cheque payments (filtered by customerId or status)
router.get("/", requirePermission("payments.*"), async (req, res, next) => {
  try {
    const clamp = clampRequestedScope(req)
    if (!clamp.ok) return res.status(403).json({ error: "Area/project access denied", code: "AREA_RESTRICTED" })
    const { customerId, status, page = 1, limit = 20 } = req.query
    const where = {
      archivedAt: null,
      method: "cheque",
      ...scopeWhere(req),
      ...(customerId ? { customerId: String(customerId) } : {}),
      ...(status ? { status: String(status) } : {}),
      ...(clamp.areaId ? { areaId: String(clamp.areaId) } : {}),
      ...(clamp.projectId ? { projectId: String(clamp.projectId) } : {}),
    }
    const [cheques, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Math.min(100, Number(limit)),
        orderBy: { createdAt: "desc" },
        include: { customer: { select: { id: true, name: true } } },
      }),
      prisma.payment.count({ where }),
    ])
    res.json({ cheques, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

// Create a cheque payment (status=pending until cleared)
router.post("/", requirePermission("payments.*"), async (req, res, next) => {
  try {
    const data = createChequeSchema.parse(req.body)
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } })
    if (!customer) return res.status(404).json({ error: "Customer not found" })
    const cheque = await createChequePayment({
      customerId: data.customerId,
      invoiceId: data.invoiceId,
      amount: data.amount,
      chequeNumber: data.chequeNumber,
      bankName: data.bankName,
      notes: data.notes,
    })
    auditLog(req, "cheque.created", { paymentId: cheque.id, customerId: data.customerId, amount: data.amount, chequeNumber: data.chequeNumber })
    res.status(201).json({ cheque })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// Clear a cheque payment (status -> completed, paidAt set)
router.post("/:id/clear", requirePermission("payments.*"), requireAccess("Payment", null), async (req, res, next) => {
  try {
    const cheque = await clearChequePayment(req.params.id)
    auditLog(req, "cheque.cleared", { paymentId: req.params.id })
    res.json({ cheque })
  } catch (err) {
    if (err.message?.includes("not a cheque") || err.message?.includes("not found")) return res.status(400).json({ error: err.message })
    next(err)
  }
})

// Reject/bounce a cheque payment
router.post("/:id/reject", requirePermission("payments.*"), requireAccess("Payment", null), async (req, res, next) => {
  try {
    const { reason } = rejectSchema.parse(req.body ?? {})
    const cheque = await rejectChequePayment(req.params.id, reason)
    auditLog(req, "cheque.rejected", { paymentId: req.params.id, reason })
    res.json({ cheque })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    if (err.message?.includes("not a cheque") || err.message?.includes("not found")) return res.status(400).json({ error: err.message })
    next(err)
  }
})

export { router as chequeRouter }
