import { Router } from "express"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

router.get("/", requirePermission("admin.list"), async (req, res, next) => {
  try {
    const { q, type, page = 1, limit = 20 } = req.query
    if (!q || String(q).length < 2) return res.json({ results: [], total: 0 })

    const search = String(q)
    const skip = (Number(page) - 1) * Number(limit)
    const take = Math.min(50, Number(limit))
    const results = []
    let total = 0

    if (!type || type === "customers") {
      const [items, count] = await Promise.all([
        prisma.customer.findMany({ where: { OR: [{ name: { contains: search } }, { email: { contains: search } }, { phone: { contains: search } }] }, take, skip, orderBy: { createdAt: "desc" } }),
        prisma.customer.count({ where: { OR: [{ name: { contains: search } }, { email: { contains: search } }, { phone: { contains: search } }] } }),
      ])
      results.push(...items.map(i => ({ ...i, _type: "customer" })))
      total += count
    }

    if (!type || type === "meters") {
      const [items, count] = await Promise.all([
        prisma.meter.findMany({ where: { OR: [{ serial: { contains: search } }, { type: { contains: search } }, { location: { contains: search } }] }, take, skip, orderBy: { createdAt: "desc" } }),
        prisma.meter.count({ where: { OR: [{ serial: { contains: search } }, { type: { contains: search } }, { location: { contains: search } }] } }),
      ])
      results.push(...items.map(i => ({ ...i, _type: "meter" })))
      total += count
    }

    if (!type || type === "invoices") {
      const [items, count] = await Promise.all([
        prisma.invoice.findMany({ where: { OR: [{ number: { contains: search } }] }, take, skip, orderBy: { createdAt: "desc" } }),
        prisma.invoice.count({ where: { OR: [{ number: { contains: search } }] } }),
      ])
      results.push(...items.map(i => ({ ...i, _type: "invoice" })))
      total += count
    }

    res.json({ results, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

export { router as searchRouter }
