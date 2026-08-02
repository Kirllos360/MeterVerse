import { Router } from "express"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"

const router = Router()
router.use(authenticate)

// GET /areas — distinct all areas from Meter records + system settings fallback
router.get("/areas", async (req, res, next) => {
  try {
    const rows = await prisma.meter.groupBy({ by: ["area"], _count: { _all: true }, where: { area: { not: null }, archivedAt: null }, orderBy: { area: "asc" } })
    if (rows.length > 0) {
      const areas = rows.map(r => ({ name: r.area, code: r.area?.substring(0, 3).toUpperCase(), meterCount: r._count._all }))
      return res.json({ areas })
    }
    // Fallback: get areas from system settings
    const settings = await prisma.systemSetting.findMany({ where: { category: "location", type: "area", archivedAt: null } })
    const areas = settings.map(s => ({ name: s.value, code: s.value.substring(0, 3).toUpperCase(), meterCount: 0 }))
    // Also try Area model
    const areaRecords = await prisma.area.findMany({ where: { archivedAt: null } })
    for (const a of areaRecords) {
      if (!areas.find(x => x.name === a.name)) areas.push({ name: a.name, code: a.code, meterCount: 0 })
    }
    res.json({ areas })
  } catch (err) { next(err) }
})

// GET /areas/:area/projects — projects within an area
router.get("/areas/:area/projects", async (req, res, next) => {
  try {
    const { area } = req.params
    const areaRec = await prisma.area.findFirst({ where: { name: area, archivedAt: null } })
    const projects = areaRec
      ? await prisma.project.findMany({ where: { areaId: areaRec.id, archivedAt: null }, include: { _count: { select: { zones: true } } }, orderBy: { name: "asc" } })
      : await prisma.project.findMany({
          where: { archivedAt: null },
          include: { _count: { select: { zones: true } } },
          orderBy: { name: "asc" },
        })
    res.json({ projects: projects.map(p => ({ id: p.id, name: p.name, zoneCount: p._count.zones })) })
  } catch (err) { next(err) }
})

// GET /projects/:projectId/zones — zones within a project
router.get("/projects/:projectId/zones", async (req, res, next) => {
  try {
    const zones = await prisma.zone.findMany({
      where: { projectId: req.params.projectId, archivedAt: null },
      include: { _count: { select: { units: true } } },
      orderBy: { name: "asc" },
    })
    res.json({ zones: zones.map(z => ({ id: z.id, name: z.name, code: z.code, unitCount: z._count.units })) })
  } catch (err) { next(err) }
})

// GET /zones/:zoneId/units — units within a zone
router.get("/zones/:zoneId/units", async (req, res, next) => {
  try {
    const units = await prisma.unit.findMany({
      where: { zoneId: req.params.zoneId, archivedAt: null },
      orderBy: { name: "asc" },
    })
    res.json({ units })
  } catch (err) { next(err) }
})

// GET /zones — flat list of all zones (contract endpoint)
router.get("/zones", async (req, res, next) => {
  try {
    const { projectId } = req.query
    const where = { archivedAt: null }
    if (projectId) where.projectId = projectId
    const zones = await prisma.zone.findMany({
      where,
      include: { _count: { select: { units: true } } },
      orderBy: { name: "asc" },
    })
    res.json({ zones: zones.map(z => ({ id: z.id, name: z.name, code: z.code, projectId: z.projectId, unitCount: z._count.units })) })
  } catch (err) { next(err) }
})

// GET /units — flat list of all units (contract endpoint)
router.get("/units", async (req, res, next) => {
  try {
    const { zoneId } = req.query
    const where = { archivedAt: null }
    if (zoneId) where.zoneId = zoneId
    const units = await prisma.unit.findMany({ where, orderBy: { name: "asc" } })
    res.json({ units })
  } catch (err) { next(err) }
})

// GET /unit-types — distinct unit types
router.get("/unit-types", async (req, res, next) => {
  try {
    const rows = await prisma.unit.groupBy({ by: ["type"], _count: { _all: true }, where: { archivedAt: null }, orderBy: { type: "asc" } })
    res.json({ types: rows.map(r => ({ type: r.type, count: r._count._all })) })
  } catch (err) { next(err) }
})

// GET /tree — full cascading tree
router.get("/tree", async (req, res, next) => {
  try {
    const areas = await prisma.area.findMany({ where: { archivedAt: null }, orderBy: { name: "asc" } })
    const tree = []
    for (const areaRec of areas) {
      const projects = await prisma.project.findMany({ where: { areaId: areaRec.id, archivedAt: null }, include: { zones: { include: { units: true } } } })
      const meterCount = await prisma.meter.count({ where: { areaId: areaRec.id, archivedAt: null } })
      tree.push({
        id: areaRec.id,
        name: areaRec.name,
        code: areaRec.code,
        meterCount,
        projects: projects.map(p => ({
          id: p.id, name: p.name,
          zones: p.zones.filter(z => !z.archivedAt).map(z => ({
            id: z.id, name: z.name, code: z.code,
            units: z.units.filter(u => !u.archivedAt).map(u => ({ id: u.id, name: u.name, type: u.type })),
          })),
        })),
      })
    }
    res.json({ tree })
  } catch (err) { next(err) }
})

export { router as locationsRouter }
