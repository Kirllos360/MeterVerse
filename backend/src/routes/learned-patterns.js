import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

const createSchema = z.object({
  pattern: z.string().min(1).max(2000),
  resolution: z.string().min(1).max(5000),
  frequency: z.number().int().min(1).optional().default(1),
  effectiveness: z.number().min(0).max(1).optional().default(0),
  tags: z.string().optional().default("[]"),
  areaId: z.string().optional(),
  meterType: z.string().optional(),
  source: z.string().optional().default("manual"),
  confidence: z.number().min(0).max(1).optional().default(0),
})

router.get("/", requirePermission("learned_patterns.list"), async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, sort = "frequency", order = "desc", tag, areaId } = req.query
    const where = { archivedAt: null }
    if (tag) where.tags = { contains: tag as string }
    if (areaId) where.areaId = areaId as string
    const [patterns, total] = await Promise.all([
      prisma.learnedPattern.findMany({
        where, take: Number(limit), skip: Number(offset),
        orderBy: { [sort as string]: order === "asc" ? "asc" : "desc" },
      }),
      prisma.learnedPattern.count({ where }),
    ])
    res.json({ patterns, total })
  } catch (err) { next(err) }
})

router.get("/:id", requirePermission("learned_patterns.read"), async (req, res, next) => {
  try {
    const pattern = await prisma.learnedPattern.findUnique({ where: { id: req.params.id } })
    if (!pattern || pattern.archivedAt) return res.status(404).json({ error: "Pattern not found" })
    res.json({ pattern })
  } catch (err) { next(err) }
})

router.post("/", requirePermission("learned_patterns.create"), async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body)
    const pattern = await prisma.learnedPattern.create({ data })
    auditLog(req, "learned_pattern.created", { patternId: pattern.id })
    res.status(201).json({ pattern })
  } catch (err) { next(err) }
})

router.put("/:id", requirePermission("learned_patterns.update"), async (req, res, next) => {
  try {
    const data = createSchema.partial().parse(req.body)
    const pattern = await prisma.learnedPattern.update({ where: { id: req.params.id }, data: { ...data, updatedAt: new Date() } })
    auditLog(req, "learned_pattern.updated", { patternId: pattern.id })
    res.json({ pattern })
  } catch (err) { next(err) }
})

router.delete("/:id", requirePermission("learned_patterns.delete"), async (req, res, next) => {
  try {
    await prisma.learnedPattern.update({ where: { id: req.params.id }, data: { archivedAt: new Date() } })
    auditLog(req, "learned_pattern.archived", { patternId: req.params.id })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.post("/:id/feedback", requirePermission("learned_patterns.update"), async (req, res, next) => {
  try {
    const { effectiveness } = z.object({ effectiveness: z.number().min(0).max(1) }).parse(req.body)
    const pattern = await prisma.learnedPattern.update({
      where: { id: req.params.id },
      data: { effectiveness, frequency: { increment: 1 }, lastObserved: new Date() },
    })
    auditLog(req, "learned_pattern.feedback", { patternId: pattern.id, effectiveness })
    res.json({ pattern })
  } catch (err) { next(err) }
})

export { router as learnedPatternsRouter }
