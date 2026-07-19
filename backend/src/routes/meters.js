import { Router } from "express"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"

const router = Router()
router.use(authenticate)

router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query
    const where = search ? { OR: [{ serial: { contains: search } }, { type: { contains: search } }] } : {}
    const [meters, total] = await Promise.all([
      prisma.meter.findMany({ where, skip: (page - 1) * limit, take: Number(limit), orderBy: { createdAt: "desc" }, include: { customer: { select: { id: true, name: true } } } }),
      prisma.meter.count({ where }),
    ])
    res.json({ meters, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

router.get("/:id", async (req, res, next) => {
  try {
    const meter = await prisma.meter.findUnique({ where: { id: req.params.id }, include: { readings: { orderBy: { timestamp: "desc" }, take: 10 }, customer: true } })
    if (!meter) return res.status(404).json({ error: "Meter not found" })
    res.json({ meter })
  } catch (err) { next(err) }
})

router.post("/", async (req, res, next) => {
  try {
    const meter = await prisma.meter.create({ data: req.body })
    res.status(201).json({ meter })
  } catch (err) { next(err) }
})

router.put("/:id", async (req, res, next) => {
  try {
    const meter = await prisma.meter.update({ where: { id: req.params.id }, data: req.body })
    res.json({ meter })
  } catch (err) { next(err) }
})

router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.meter.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) { next(err) }
})

export { router as metersRouter }
