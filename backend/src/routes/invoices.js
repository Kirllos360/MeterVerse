import { Router } from "express"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"

const router = Router()
router.use(authenticate)

router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query
    const where = {}
    if (status) where.status = status
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({ where, skip: (page - 1) * limit, take: Number(limit), orderBy: { issuedAt: "desc" }, include: { customer: { select: { id: true, name: true } }, payments: true } }),
      prisma.invoice.count({ where }),
    ])
    res.json({ invoices, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

router.get("/:id", async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id }, include: { customer: true, payments: true } })
    if (!invoice) return res.status(404).json({ error: "Invoice not found" })
    res.json({ invoice })
  } catch (err) { next(err) }
})

router.post("/", async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.create({ data: req.body })
    res.status(201).json({ invoice })
  } catch (err) { next(err) }
})

router.put("/:id", async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.update({ where: { id: req.params.id }, data: req.body })
    res.json({ invoice })
  } catch (err) { next(err) }
})

export { router as invoicesRouter }
