import { Router } from "express"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"

const router = Router()
router.use(authenticate)

router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({ skip: (page - 1) * limit, take: Number(limit), orderBy: { paidAt: "desc" }, include: { invoice: { select: { id: true, number: true, amount: true } } } }),
      prisma.payment.count(),
    ])
    res.json({ payments, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

router.post("/", async (req, res, next) => {
  try {
    const payment = await prisma.payment.create({ data: req.body })
    await prisma.invoice.update({ where: { id: req.body.invoiceId }, data: { status: "paid", paidAt: new Date() } })
    res.status(201).json({ payment })
  } catch (err) { next(err) }
})

export { router as paymentsRouter }
