import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"

const router = Router()
router.use(authenticate)

const createSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  area: z.string().max(100).optional().or(z.literal("")),
})

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10))
    const search = req.query.search
    const where = search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.customer.count({ where }),
    ])
    res.json({ customers, total, page, limit })
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
    const data = createSchema.parse(req.body)
    const customer = await prisma.customer.create({ data })
    res.status(201).json({ customer })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.put("/:id", async (req, res, next) => {
  try {
    const data = createSchema.partial().parse(req.body)
    const customer = await prisma.customer.update({ where: { id: req.params.id }, data })
    res.json({ customer })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.customer.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) { next(err) }
})

export { router as customersRouter }
