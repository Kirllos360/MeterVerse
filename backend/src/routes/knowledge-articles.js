import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

router.get("/", requirePermission("knowledge.list"), async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, category, tag, search } = req.query
    const where = { archivedAt: null }
    if (category) where.category = category
    if (tag) where.tags = { contains: String(tag) }
    if (search) where.OR = [{ title: { contains: String(search) } }, { content: { contains: String(search) } }]
    const [articles, total] = await Promise.all([
      prisma.knowledgeArticle.findMany({ where, take: Number(limit), skip: Number(offset), orderBy: { createdAt: "desc" } }),
      prisma.knowledgeArticle.count({ where }),
    ])
    res.json({ articles, total })
  } catch (err) { next(err) }
})

router.get("/:id", requirePermission("knowledge.read"), async (req, res, next) => {
  try {
    const article = await prisma.knowledgeArticle.findUnique({ where: { id: req.params.id } })
    if (!article || article.archivedAt) return res.status(404).json({ error: "Article not found" })
    await prisma.knowledgeArticle.update({ where: { id: article.id }, data: { views: { increment: 1 } } })
    res.json({ article })
  } catch (err) { next(err) }
})

router.post("/", requirePermission("knowledge.create"), async (req, res, next) => {
  try {
    const data = z.object({ title: z.string().min(1).max(500), content: z.string().min(1), category: z.string().optional(), tags: z.string().optional(), areaId: z.string().optional(), meterType: z.string().optional(), source: z.string().optional() }).parse(req.body)
    const article = await prisma.knowledgeArticle.create({ data })
    auditLog(req, "knowledge.article_created", { articleId: article.id })
    res.status(201).json({ article })
  } catch (err) { next(err) }
})

router.post("/:id/helpful", async (req, res, next) => {
  try {
    const article = await prisma.knowledgeArticle.update({ where: { id: req.params.id }, data: { helpfulCount: { increment: 1 } } })
    res.json({ article })
  } catch (err) { next(err) }
})

export { router as knowledgeArticlesRouter }
