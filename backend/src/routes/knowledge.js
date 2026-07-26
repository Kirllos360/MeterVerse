import { Router } from "express"
import { z } from "zod"
import { knowledgeRepository } from "../../src/intelligence/knowledge/repository/KnowledgeRepository.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

// Search across all knowledge entities
router.post("/search", requirePermission("ai.*"), async (req, res, next) => {
  try {
    const { query, filters } = z.object({ query: z.string(), filters: z.object({ entityType: z.string().optional(), status: z.string().optional() }).default({}) }).parse(req.body)
    const results = await knowledgeRepository.search(query, filters)
    res.json({ results, total: results.length })
  } catch (err) { next(err) }
})

// Get meter timeline
router.get("/meters/:serial/timeline", requirePermission("ai.*"), async (req, res, next) => {
  try {
    const result = await knowledgeRepository.getMeterTimeline(req.params.serial)
    res.json(result)
  } catch (err) { next(err) }
})

// Find similar incidents
router.post("/incidents/similar", requirePermission("ai.*"), async (req, res, next) => {
  try {
    const { errorPattern, limit } = z.object({ errorPattern: z.string(), limit: z.number().default(10) }).parse(req.body)
    const results = await knowledgeRepository.findSimilarIncidents(errorPattern, limit)
    res.json({ results, total: results.length })
  } catch (err) { next(err) }
})

export { router as knowledgeRouter }
