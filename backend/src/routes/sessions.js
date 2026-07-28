import { Router } from "express"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requirePermission, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

// GET /sessions — list active sessions for current user
router.get("/", async (req, res, next) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId: req.user.sub, isActive: true, archivedAt: null },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    res.json({ sessions: sessions.map(s => ({ id: s.id, createdAt: s.createdAt, lastActiveAt: s.lastActiveAt, ipAddress: s.ipAddress, userAgent: s.userAgent, isActive: s.isActive })) })
  } catch (err) { next(err) }
})

// GET /sessions/all — list all active sessions (admin only)
router.get("/all", requirePermission("admin.sessions"), async (req, res, next) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { isActive: true, archivedAt: null },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    res.json({ sessions })
  } catch (err) { next(err) }
})

// DELETE /sessions/:id — revoke a session
router.delete("/:id", async (req, res, next) => {
  try {
    const session = await prisma.session.findUnique({ where: { id: req.params.id } })
    if (!session) return res.status(404).json({ error: "Session not found" })
    if (session.userId !== req.user.sub && req.user.role !== "super_admin") return res.status(403).json({ error: "Cannot revoke another user's session" })
    await prisma.session.update({ where: { id: req.params.id }, data: { isActive: false } })
    auditLog(req, "session.revoked", { sessionId: req.params.id })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// DELETE /sessions/revoke-all — revoke all sessions except current
router.post("/revoke-all", async (req, res, next) => {
  try {
    const result = await prisma.session.updateMany({
      where: { userId: req.user.sub, isActive: true },
      data: { isActive: false },
    })
    auditLog(req, "session.revoke_all", { count: result.count })
    res.json({ ok: true, count: result.count })
  } catch (err) { next(err) }
})

export { router as sessionsRouter }
