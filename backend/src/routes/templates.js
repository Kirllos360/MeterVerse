import { Router } from "express"
import { z } from "zod"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"
import { getTemplate, setTemplate, seedTemplates } from "../services/template-engine.js"

const router = Router()
router.use(authenticate)

router.get("/", requirePermission("admin.*"), async (req, res, next) => {
  try {
    const { prisma } = await import("../server.js")
    const templates = await prisma.notificationTemplate.findMany({ where: { type: "template" }, orderBy: { key: "asc" } })
    res.json({ templates })
  } catch (err) { next(err) }
})

router.get("/:key", requirePermission("admin.*"), async (req, res, next) => {
  try {
    const body = await getTemplate(req.params.key)
    if (!body) return res.status(404).json({ error: "Template not found", code: "NOT_FOUND" })
    res.json({ key: req.params.key, body })
  } catch (err) { next(err) }
})

router.put("/:key", requirePermission("admin.*"), async (req, res, next) => {
  try {
    const { body } = z.object({ body: z.string() }).parse(req.body)
    await setTemplate(req.params.key, body)
    auditLog(req, "template.updated", { key: req.params.key })
    res.json({ message: "Template updated", key: req.params.key })
  } catch (err) { next(err) }
})

router.post("/seed", requirePermission("admin.*"), async (req, res, next) => {
  try {
    await seedTemplates()
    auditLog(req, "templates.seeded", {})
    res.json({ message: "Default templates seeded" })
  } catch (err) { next(err) }
})

export { router as templatesRouter }
