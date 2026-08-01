import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"
import { forecast, monteCarlo, scenario, healthScore, generateInsights } from "../services/financial-ai-engine.js"

const router = Router()
router.use(authenticate)

const scenarioSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  scenarioType: z.enum(["OPTIMISTIC", "PESSIMISTIC", "BASE", "CUSTOM"]).default("CUSTOM"),
  adjustments: z.record(z.number()).default({}),
})

const logSchema = z.object({
  recommendation: z.string().min(1),
  category: z.string().default("FINANCIAL"),
  impact: z.number().nullable().optional(),
  confidence: z.number().min(0).max(1).nullable().optional(),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "APPLIED"]).default("PENDING"),
  metadata: z.string().optional(),
})

// ─── Forecasting ─────────────────────────────────────────────────────────────
router.post("/forecast", requirePermission("financial-ai.*"), async (req, res, next) => {
  try {
    const data = z.object({ metric: z.enum(["REVENUE", "COLLECTIONS", "CASH", "EXPENSE"]).default("REVENUE"), horizon: z.number().int().min(1).max(12).default(3) }).parse(req.body)
    const result = await forecast(data.metric, data.horizon)
    auditLog(req, "financial-ai.forecast", { metric: data.metric, horizon: data.horizon })
    res.json(result)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.get("/forecast", requirePermission("financial-ai.*"), async (req, res, next) => {
  try {
    const { forecastType } = req.query
    const forecasts = await prisma.financialForecast.findMany({ where: forecastType ? { forecastType: String(forecastType) } : {}, orderBy: { createdAt: "desc" }, take: 100 })
    res.json({ forecasts })
  } catch (err) { next(err) }
})

// ─── Monte Carlo ─────────────────────────────────────────────────────────────
router.post("/monte-carlo", requirePermission("financial-ai.*"), async (req, res, next) => {
  try {
    const data = z.object({ metric: z.enum(["REVENUE", "COLLECTIONS"]).default("REVENUE"), iterations: z.number().int().min(100).max(10000).default(1000), horizon: z.number().int().min(1).max(12).default(1) }).parse(req.body)
    const result = await monteCarlo(data.metric, data.iterations, data.horizon)
    auditLog(req, "financial-ai.montecarlo", { metric: data.metric, iterations: data.iterations })
    res.json(result)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.get("/monte-carlo", requirePermission("financial-ai.*"), async (req, res, next) => {
  try {
    const { forecastType } = req.query
    const results = await prisma.monteCarloResult.findMany({ where: forecastType ? { forecastType: String(forecastType) } : {}, orderBy: { createdAt: "desc" }, take: 100 })
    res.json({ results })
  } catch (err) { next(err) }
})

// ─── Scenarios ───────────────────────────────────────────────────────────────
router.post("/scenarios", requirePermission("financial-ai.*"), async (req, res, next) => {
  try {
    const data = scenarioSchema.parse(req.body)
    const result = await scenario(data)
    auditLog(req, "financial-ai.scenario", { name: data.name, scenarioType: data.scenarioType })
    res.status(201).json(result)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.get("/scenarios", requirePermission("financial-ai.*"), async (req, res, next) => {
  try {
    const scenarios = await prisma.financialScenario.findMany({ orderBy: { createdAt: "desc" }, take: 100 })
    res.json({ scenarios })
  } catch (err) { next(err) }
})

router.get("/scenarios/:id", requirePermission("financial-ai.*"), async (req, res, next) => {
  try {
    const s = await prisma.financialScenario.findUnique({ where: { id: req.params.id } })
    if (!s) return res.status(404).json({ error: "Scenario not found" })
    res.json({ scenario: { ...s, adjustments: JSON.parse(s.adjustments), inputs: JSON.parse(s.inputs), results: JSON.parse(s.results) } })
  } catch (err) { next(err) }
})

// ─── Health ──────────────────────────────────────────────────────────────────
router.post("/health", requirePermission("financial-ai.*"), async (req, res, next) => {
  try {
    const result = await healthScore()
    auditLog(req, "financial-ai.health", { overall: result.overall })
    res.json(result)
  } catch (err) { next(err) }
})

router.get("/health", requirePermission("financial-ai.*"), async (req, res, next) => {
  try {
    const health = await prisma.businessHealthScore.findMany({ orderBy: { periodKey: "desc" }, take: 50 })
    res.json({ health })
  } catch (err) { next(err) }
})

// ─── Insights + recommendations ──────────────────────────────────────────────
router.post("/insights/generate", requirePermission("financial-ai.*"), async (req, res, next) => {
  try {
    const insights = await generateInsights()
    auditLog(req, "financial-ai.insights", { count: insights.length })
    res.json({ insights })
  } catch (err) { next(err) }
})

router.get("/insights", requirePermission("financial-ai.*"), async (req, res, next) => {
  try {
    const { category } = req.query
    const insights = await prisma.executiveInsight.findMany({ where: category ? { category: String(category) } : {}, orderBy: { createdAt: "desc" }, take: 100 })
    res.json({ insights })
  } catch (err) { next(err) }
})

router.post("/recommendations", requirePermission("financial-ai.*"), async (req, res, next) => {
  try {
    const data = logSchema.parse(req.body)
    const log = await prisma.aiRecommendationLog.create({ data })
    auditLog(req, "financial-ai.recommendation", { logId: log.id })
    res.status(201).json({ log })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.get("/recommendations", requirePermission("financial-ai.*"), async (req, res, next) => {
  try {
    const { status } = req.query
    const logs = await prisma.aiRecommendationLog.findMany({ where: status ? { status: String(status) } : {}, orderBy: { createdAt: "desc" }, take: 100 })
    res.json({ logs })
  } catch (err) { next(err) }
})

router.patch("/recommendations/:id", requirePermission("financial-ai.*"), async (req, res, next) => {
  try {
    const data = z.object({ status: z.enum(["ACCEPTED", "REJECTED", "APPLIED"]) }).parse(req.body)
    const log = await prisma.aiRecommendationLog.update({ where: { id: req.params.id }, data: { status: data.status, appliedBy: data.status === "APPLIED" ? req.user?.id : null, appliedAt: data.status === "APPLIED" ? new Date() : null } })
    auditLog(req, "financial-ai.recommendation.updated", { logId: log.id, status: data.status })
    res.json({ log })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

// ─── Model versions + board summary ──────────────────────────────────────────
router.get("/models", requirePermission("financial-ai.*"), async (req, res, next) => {
  try {
    const models = await prisma.aiModelVersion.findMany({ orderBy: { createdAt: "desc" } })
    res.json({ models })
  } catch (err) { next(err) }
})

router.post("/models", requirePermission("financial-ai.*"), async (req, res, next) => {
  try {
    const data = z.object({ modelKey: z.string().min(1), version: z.string().min(1), status: z.enum(["STAGING", "ACTIVE", "DEPRECATED"]).default("STAGING"), metrics: z.string().optional(), notes: z.string().optional() }).parse(req.body)
    const model = await prisma.aiModelVersion.create({ data: { ...data, createdBy: req.user?.id } })
    auditLog(req, "financial-ai.model", { modelId: model.id, modelKey: data.modelKey })
    res.status(201).json({ model })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors })
    next(err)
  }
})

router.get("/board", requirePermission("financial-ai.*"), async (req, res, next) => {
  try {
    const [health, latestForecast, openRecommendations, criticalInsights] = await Promise.all([
      prisma.businessHealthScore.findFirst({ orderBy: { periodKey: "desc" } }),
      prisma.financialForecast.findFirst({ orderBy: { createdAt: "desc" } }),
      prisma.aiRecommendationLog.count({ where: { status: "PENDING" } }),
      prisma.executiveInsight.count({ where: { severity: "critical" } }),
    ])
    res.json({
      overallHealth: health ? health.overall : null,
      latestForecast: latestForecast ? { type: latestForecast.forecastType, confidence: latestForecast.confidence, values: JSON.parse(latestForecast.values) } : null,
      pendingRecommendations: openRecommendations,
      criticalInsights,
    })
  } catch (err) { next(err) }
})

export { router as financialAiRouter }
