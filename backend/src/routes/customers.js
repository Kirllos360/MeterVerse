import { Router } from "express"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"

const router = Router()
router.use(authenticate)

router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query
    const where = search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({ where, skip: (page - 1) * limit, take: Number(limit), orderBy: { createdAt: "desc" } }),
      prisma.customer.count({ where }),
    ])
    res.json({ customers, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

router.get("/:id", async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: req.params.id }, include: { meters: true, invoices: true } })
    if (!customer) return res.status(404).json({ error: "Customer not found" })
    res.json({ customer })
  } catch (err) { next(err) }
})

router.post("/", async (req, res, next) => {
  try {
    const customer = await prisma.customer.create({ data: req.body })
    res.status(201).json({ customer })
  } catch (err) { next(err) }
})

router.put("/:id", async (req, res, next) => {
  try {
    const customer = await prisma.customer.update({ where: { id: req.params.id }, data: req.body })
    res.json({ customer })
  } catch (err) { next(err) }
})

router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.customer.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) { next(err) }
})

export { router as customersRouter }
