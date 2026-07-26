import { Router } from "express"
import { z } from "zod"
import { intelligence } from "../../src/intelligence/core/UnifiedIntelligence.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

// List all capabilities
router.get("/capabilities", requirePermission("ai.*"), (req, res) => {
  res.json({ capabilities: intelligence.listCapabilities(), count: intelligence.listCapabilities().length })
})

// Execute any capability
router.post("/execute", requirePermission("ai.*"), async (req, res, next) => {
  try {
    const { capability, args } = z.object({ capability: z.string(), args: z.record(z.any()).default({}) }).parse(req.body)
    const result = await intelligence.execute(capability, args)
    res.json(result)
  } catch (err) { next(err) }
})

// Audit log
router.get("/audit", requirePermission("admin.*"), (req, res) => {
  res.json({ entries: intelligence.getAuditLog() })
})

// System health
router.get("/health", requirePermission("ai.*"), async (req, res) => {
  const result = await intelligence.execute("system_health")
  res.json(result)
})

export { router as intelligenceRouter }
