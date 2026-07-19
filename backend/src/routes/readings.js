import { Router } from "express"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"

const router = Router()
router.use(authenticate)

router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 20, meterId, status } = req.query
    const where = {}
    if (meterId) where.meterId = meterId
    if (status) where.status = status
    const [readings, total] = await Promise.all([
      prisma.reading.findMany({ where, skip: (page - 1) * limit, take: Number(limit), orderBy: { timestamp: "desc" }, include: { meter: { select: { id: true, serial: true } } } }),
      prisma.reading.count({ where }),
    ])
    res.json({ readings, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

router.post("/", async (req, res, next) => {
  try {
    const reading = await prisma.reading.create({ data: req.body })
    res.status(201).json({ reading })
  } catch (err) { next(err) }
})

router.post("/bulk", async (req, res, next) => {
  try {
    const { readings } = req.body
    const created = await prisma.reading.createMany({ data: readings })
    res.status(201).json({ count: created.count })
  } catch (err) { next(err) }
})

export { router as readingsRouter }
