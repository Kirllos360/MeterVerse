import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

const simSchema = z.object({
  iccid: z.string().min(1),
  simNumber: z.string().min(1),
  operator: z.string().default(""),
  apn: z.string().optional(),
  ipAddress: z.string().optional(),
})

router.get("/", requirePermission("meters.*"), async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
    const where = {}
    if (req.query.status) where.status = req.query.status
    const [sims, total] = await Promise.all([
      prisma.sIMCard.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" }, include: { meter: { select: { meterId: true, type: true } } } }),
      prisma.sIMCard.count({ where }),
    ])
    res.json({ sims, total, page, limit })
  } catch (err) { next(err) }
})

router.get("/:id", requirePermission("meters.*"), async (req, res, next) => {
  try {
    const sim = await prisma.sIMCard.findUnique({ where: { id: req.params.id }, include: { assignments: { orderBy: { startAt: "desc" } }, meter: { select: { meterId: true, type: true } } } })
    if (!sim) return res.status(404).json({ error: "SIM not found" })
    res.json({ sim })
  } catch (err) { next(err) }
})

router.post("/", requirePermission("meters.*"), async (req, res, next) => {
  try {
    const data = simSchema.parse(req.body)
    const existing = await prisma.sIMCard.findFirst({ where: { OR: [{ iccid: data.iccid }, { simNumber: data.simNumber }] } })
    if (existing) return res.status(409).json({ error: "SIM with this ICCID or SIM number already exists" })
    const sim = await prisma.sIMCard.create({ data })
    auditLog(req, "sim.created", { simId: sim.id, iccid: sim.iccid })
    res.status(201).json({ sim })
  } catch (err) { next(err) }
})

router.put("/:id", requirePermission("meters.*"), async (req, res, next) => {
  try {
    const existing = await prisma.sIMCard.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: "SIM not found" })
    const data = simSchema.partial().parse(req.body)
    const sim = await prisma.sIMCard.update({ where: { id: req.params.id }, data })
    auditLog(req, "sim.updated", { simId: sim.id, changes: Object.keys(data) })
    res.json({ sim })
  } catch (err) { next(err) }
})

router.get("/:id/eligibility", requirePermission("meters.*"), async (req, res, next) => {
  try {
    const sim = await prisma.sIMCard.findUnique({ where: { id: req.params.id } })
    if (!sim) return res.status(404).json({ error: "SIM not found" })
    let eligible = true; let reason = ""; let cooldownUntil = null
    if (sim.status === "assigned" || sim.status === "active") { eligible = false; reason = "SIM is currently assigned to a meter" }
    if (sim.cooldownUntil && new Date(sim.cooldownUntil) > new Date()) { eligible = false; reason = `SIM is in cooldown until ${sim.cooldownUntil.toISOString().split("T")[0]}`; cooldownUntil = sim.cooldownUntil }
    if (sim.status === "retired") { eligible = false; reason = "SIM has been retired" }
    if (sim.status === "faulty") { eligible = false; reason = "SIM is reported as faulty" }
    if (!eligible && !reason) reason = "SIM is not available"
    res.json({ eligible, reason: eligible ? "SIM is available" : reason, cooldownUntil, status: sim.status, simId: sim.id, iccid: sim.iccid })
  } catch (err) { next(err) }
})

router.post("/:id/assign", requirePermission("meters.*"), async (req, res, next) => {
  try {
    const { meterId } = z.object({ meterId: z.string() }).parse(req.body)
    const sim = await prisma.sIMCard.findUnique({ where: { id: req.params.id } })
    if (!sim) return res.status(404).json({ error: "SIM not found" })
    const meter = await prisma.meter.findUnique({ where: { id: meterId } })
    if (!meter) return res.status(404).json({ error: "Meter not found" })
    const eligibility = await prisma.sIMCard.findUnique({ where: { id: req.params.id } })
    if (eligibility?.status === "assigned" || eligibility?.status === "active") return res.status(409).json({ error: "SIM is already assigned" })

    const result = await prisma.$transaction(async (tx) => {
      await tx.sIMAssignment.updateMany({ where: { simId: req.params.id, endAt: null }, data: { endAt: new Date(), status: "ended" } })
      const assignment = await tx.sIMAssignment.create({ data: { simId: req.params.id, meterId, createdBy: req.user?.email } })
      await tx.sIMCard.update({ where: { id: req.params.id }, data: { status: "assigned", meterId } })
      return assignment
    })
    auditLog(req, "sim.assigned", { simId: req.params.id, meterId })
    res.status(201).json({ assignment: result })
  } catch (err) { next(err) }
})

router.post("/:id/release", requirePermission("meters.*"), async (req, res, next) => {
  try {
    const sim = await prisma.sIMCard.findUnique({ where: { id: req.params.id } })
    if (!sim) return res.status(404).json({ error: "SIM not found" })
    if (sim.status !== "assigned" && sim.status !== "active") return res.status(400).json({ error: "SIM is not currently assigned" })
    await prisma.$transaction(async (tx) => {
      await tx.sIMAssignment.updateMany({ where: { simId: req.params.id, endAt: null }, data: { endAt: new Date(), status: "released" } })
      await tx.sIMCard.update({ where: { id: req.params.id }, data: { status: "available", meterId: null } })
    })
    auditLog(req, "sim.released", { simId: req.params.id })
    res.json({ message: "SIM released" })
  } catch (err) { next(err) }
})

export { router as simRouter }
