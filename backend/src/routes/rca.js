import { Router } from "express"
import { z } from "zod"
import { rcaCaseEngine } from "../../../src/intelligence/rca/engine/RCACaseEngine.js"
import { evidenceCollector } from "../../../src/intelligence/rca/evidence/EvidenceCollector.js"
import { fiveWhysEngine } from "../../../src/intelligence/rca/analysis/FiveWhysEngine.js"
import { recommendationEngine } from "../../../src/intelligence/rca/recommendation/RecommendationEngine.js"
import { resolutionLearner } from "../../../src/intelligence/rca/learning/ResolutionLearner.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

// Create a new RCA case
router.post("/cases", requirePermission("ai.*"), async (req, res, next) => {
  try {
    const { serial, issue } = z.object({ serial: z.string(), issue: z.string() }).parse(req.body)
    const rcaCase = rcaCaseEngine.create(serial, issue)
    rcaCaseEngine.updateStatus(rcaCase.id, "INVESTIGATING")
    // Auto-collect evidence
    const evidence = await evidenceCollector.collect(serial)
    rcaCaseEngine.setEvidence(rcaCase.id, evidence)
    res.status(201).json({ case: rcaCaseEngine.get(rcaCase.id) })
  } catch (err) { next(err) }
})

// List RCA cases
router.get("/cases", requirePermission("ai.*"), (req, res) => {
  const { status } = req.query
  res.json({ cases: rcaCaseEngine.list(status ? { status } : {}), stats: rcaCaseEngine.getStats() })
})

// Get single RCA case
router.get("/cases/:id", requirePermission("ai.*"), (req, res) => {
  const c = rcaCaseEngine.get(req.params.id)
  if (!c) return res.status(404).json({ error: "Case not found" })
  res.json({ case: c })
})

// Update case status
router.put("/cases/:id/status", requirePermission("ai.*"), (req, res, next) => {
  try {
    const { status } = z.object({ status: z.string() }).parse(req.body)
    const c = rcaCaseEngine.updateStatus(req.params.id, status)
    if (!c) return res.status(404).json({ error: "Case not found" })
    res.json({ case: c })
  } catch (err) { next(err) }
})

// Set AI analysis
router.post("/cases/:id/analyze", requirePermission("ai.*"), (req, res, next) => {
  try {
    const data = z.object({ fiveWhys: z.array(z.string()), fiveW: z.object({ who: z.string(), what: z.string(), when: z.string(), where: z.string(), why: z.string() }), rootCause: z.string(), confidence: z.number(), recommendation: z.string() }).parse(req.body)
    const c = rcaCaseEngine.setAnalysis(req.params.id, data)
    if (!c) return res.status(404).json({ error: "Case not found" })
    res.json({ case: c })
  } catch (err) { next(err) }
})

// Approve case
router.post("/cases/:id/approve", requirePermission("ai.*"), (req, res) => {
  const c = rcaCaseEngine.approve(req.params.id, req.user?.email || req.user?.sub)
  if (!c) return res.status(404).json({ error: "Case not found" })
  res.json({ case: c })
})

// Resolve case
router.post("/cases/:id/resolve", requirePermission("ai.*"), (req, res, next) => {
  try {
    const { action, notes } = z.object({ action: z.string(), notes: z.string().optional() }).parse(req.body)
    const c = rcaCaseEngine.resolve(req.params.id, { action, notes })
    if (!c) return res.status(404).json({ error: "Case not found" })
    res.json({ case: c })
  } catch (err) { next(err) }
})

// Learn from case
router.post("/cases/:id/learn", requirePermission("ai.*"), async (req, res) => {
  const c = await rcaCaseEngine.learn(req.params.id)
  if (!c) return res.status(404).json({ error: "Case not found" })
  res.json({ case: c })
})

// Auto-generate 5 Whys analysis
router.post("/cases/:id/auto-analyze", requirePermission("ai.*"), async (req, res, next) => {
  try {
    const c = rcaCaseEngine.get(req.params.id)
    if (!c) return res.status(404).json({ error: "Case not found" })
    if (!c.evidence) return res.status(400).json({ error: "Evidence not collected yet" })

    // Find similar resolved patterns
    const similarPatterns = await resolutionLearner.findSimilar(c.issue, 3)
    rcaCaseEngine.setSimilarPatterns(c.id, similarPatterns)

    // Generate 5 Whys
    const analysis = await fiveWhysEngine.generate(c.issue, c.evidence)
    rcaCaseEngine.setAnalysis(c.id, {
      fiveWhys: analysis.fiveWhys,
      fiveW: analysis.fiveW,
      rootCause: analysis.rootCause,
      confidence: analysis.confidence,
      recommendation: "",
    })

    // Generate recommendation
    const recommendation = await recommendationEngine.generate(analysis.rootCause, analysis, c.evidence, similarPatterns)
    c.recommendation = recommendation.primaryAction
    c.preventiveMeasures = recommendation.preventiveMeasures

    res.json({ case: rcaCaseEngine.get(c.id), analysis, recommendation, similarPatterns: similarPatterns.length })
  } catch (err) { next(err) }
})

// Get similar past patterns
router.get("/patterns/similar", requirePermission("ai.*"), async (req, res, next) => {
  try {
    const { query } = z.object({ query: z.string() }).parse(req.query)
    const patterns = await resolutionLearner.findSimilar(query, 10)
    res.json({ patterns })
  } catch (err) { next(err) }
})

// Record pattern effectiveness
router.post("/patterns/:id/effectiveness", requirePermission("ai.*"), async (req, res, next) => {
  try {
    const { rating } = z.object({ rating: z.enum(["effective", "partial", "ineffective"]) }).parse(req.body)
    const pattern = await resolutionLearner.recordEffectiveness(req.params.id, rating)
    if (!pattern) return res.status(404).json({ error: "Pattern not found" })
    res.json({ pattern })
  } catch (err) { next(err) }
})

// Set preventive measures
router.put("/cases/:id/preventive", requirePermission("ai.*"), (req, res, next) => {
  try {
    const { measures } = z.object({ measures: z.array(z.string()) }).parse(req.body)
    const c = rcaCaseEngine.setPreventiveMeasures(req.params.id, measures)
    if (!c) return res.status(404).json({ error: "Case not found" })
    res.json({ case: c })
  } catch (err) { next(err) }
})

// RCA stats
router.get("/stats", requirePermission("ai.*"), (req, res) => {
  res.json({ stats: rcaCaseEngine.getStats() })
})

export { router as rcaRouter }
