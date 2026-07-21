import { Router } from "express"
import { z } from "zod"
import { prisma } from "../server.js"
import { authenticate } from "../middleware/auth.js"
import { requireRole, auditLog } from "../middleware/security.js"

const router = Router()
router.use(authenticate)

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

router.get("/notifications", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20))
    const where = req.query.unread === "true" ? { readAt: null } : {}
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
      prisma.notification.count({ where }),
    ])
    res.json({ notifications, total, page, limit })
  } catch (err) { next(err) }
})

router.post("/notifications", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const data = z.object({
      type: z.string().optional(), title: z.string().min(1), body: z.string(),
      recipientId: z.string().optional(), recipientEmail: z.string().optional(),
      channel: z.string().optional(),
    }).parse(req.body)
    const notification = await prisma.notification.create({ data })
    // If email channel, log an email send
    if (data.channel === "email" && data.recipientEmail) {
      await prisma.emailLog.create({ data: { to: data.recipientEmail, from: "noreply@meterverse.com", subject: data.title, body: data.body } })
    }
    res.status(201).json({ notification })
  } catch (err) { next(err) }
})

router.put("/notifications/:id/read", async (req, res, next) => {
  try {
    const n = await prisma.notification.update({ where: { id: req.params.id }, data: { readAt: new Date(), status: "read" } })
    res.json({ notification: n })
  } catch (err) { next(err) }
})

// ─── ACTIVITY STREAM ─────────────────────────────────────────────────────────

router.get("/activity", async (req, res, next) => {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30))
    const severity = req.query.severity
    const where = severity ? { severity } : {}
    const entries = await prisma.activityStream.findMany({ where, orderBy: { createdAt: "desc" }, take: limit })
    res.json({ entries })
  } catch (err) { next(err) }
})

router.post("/activity", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const data = z.object({
      actor: z.string().optional(), action: z.string().min(1),
      resource: z.string().optional(), resourceId: z.string().optional(),
      details: z.string().optional(), severity: z.string().optional(),
    }).parse(req.body)
    const entry = await prisma.activityStream.create({ data })
    res.status(201).json({ entry })
  } catch (err) { next(err) }
})

// ─── EMAIL ───────────────────────────────────────────────────────────────────

router.get("/email", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const logs = await prisma.emailLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 })
    const stats = {
      total: await prisma.emailLog.count(),
      sent: await prisma.emailLog.count({ where: { status: "sent" } }),
      failed: await prisma.emailLog.count({ where: { status: "failed" } }),
    }
    res.json({ logs, stats })
  } catch (err) { next(err) }
})

router.post("/email/send", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const data = z.object({ to: z.string().email(), subject: z.string().min(1), body: z.string() }).parse(req.body)
    const log = await prisma.emailLog.create({ data: { ...data, from: "noreply@meterverse.com", status: "sent", sentAt: new Date() } })
    res.status(201).json({ log })
  } catch (err) { next(err) }
})

// ─── SMS ─────────────────────────────────────────────────────────────────────

router.get("/sms", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const logs = await prisma.smsLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 })
    const stats = {
      total: await prisma.smsLog.count(),
      sent: await prisma.smsLog.count({ where: { status: "sent" } }),
      failed: await prisma.smsLog.count({ where: { status: "failed" } }),
    }
    res.json({ logs, stats })
  } catch (err) { next(err) }
})

router.post("/sms/send", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const data = z.object({ to: z.string().min(1), message: z.string().min(1) }).parse(req.body)
    const log = await prisma.smsLog.create({ data: { ...data, status: "sent", sentAt: new Date() } })
    res.status(201).json({ log })
  } catch (err) { next(err) }
})

// ─── IMPORTS ─────────────────────────────────────────────────────────────────

router.get("/imports", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const jobs = await prisma.importJob.findMany({ orderBy: { createdAt: "desc" }, take: 50 })
    const stats = {
      total: await prisma.importJob.count(),
      completed: await prisma.importJob.count({ where: { status: "completed" } }),
      failed: await prisma.importJob.count({ where: { status: "failed" } }),
    }
    res.json({ jobs, stats })
  } catch (err) { next(err) }
})

router.post("/imports", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const data = z.object({ type: z.string().min(1), fileName: z.string().optional() }).parse(req.body)
    const job = await prisma.importJob.create({ data })
    // Simulate processing
    setTimeout(async () => {
      const processed = Math.floor(Math.random() * 500 + 100)
      const failed = Math.floor(Math.random() * 10)
      await prisma.importJob.update({
        where: { id: job.id },
        data: { status: "completed", totalRows: processed + failed, processed, failed, completedAt: new Date() },
      })
    }, 3000)
    res.status(201).json({ job })
  } catch (err) { next(err) }
})

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

router.get("/exports", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const jobs = await prisma.exportJob.findMany({ orderBy: { createdAt: "desc" }, take: 50 })
    res.json({ jobs })
  } catch (err) { next(err) }
})

router.post("/exports", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const data = z.object({ type: z.string().min(1), format: z.string().optional(), filters: z.string().optional() }).parse(req.body)
    const job = await prisma.exportJob.create({ data })
    setTimeout(async () => {
      await prisma.exportJob.update({
        where: { id: job.id },
        data: { status: "completed", totalRows: Math.floor(Math.random() * 1000 + 50), filePath: `/exports/${job.id}.${data.format || "csv"}`, completedAt: new Date() },
      })
    }, 3000)
    res.status(201).json({ job })
  } catch (err) { next(err) }
})

// ─── FILE STORAGE ────────────────────────────────────────────────────────────

router.get("/storage", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const [files, totalSize] = await Promise.all([
      prisma.storedFile.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.storedFile.aggregate({ _sum: { size: true } }),
    ])
    res.json({ files, totalSize: totalSize._sum.size || 0, totalFiles: files.length })
  } catch (err) { next(err) }
})

// ─── QUEUE ───────────────────────────────────────────────────────────────────

router.get("/queue/stats", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const [pending, running, completed, failed] = await Promise.all([
      prisma.queueJob.count({ where: { status: "pending" } }),
      prisma.queueJob.count({ where: { status: "running" } }),
      prisma.queueJob.count({ where: { status: "completed" } }),
      prisma.queueJob.count({ where: { status: "failed" } }),
    ])
    res.json({ stats: { pending, running, completed, failed }, total: pending + running + completed + failed })
  } catch (err) { next(err) }
})

// ─── SCHEDULER ───────────────────────────────────────────────────────────────

router.get("/scheduler/next", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const tasks = await prisma.scheduledTask.findMany({ where: { active: true }, orderBy: { nextRunAt: "asc" }, take: 5 })
    res.json({ nextRun: tasks[0] || null, upcoming: tasks })
  } catch (err) { next(err) }
})

// ─── AUDIT SUMMARY ───────────────────────────────────────────────────────────

router.get("/audit/summary", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const [total, today, failures] = await Promise.all([
      prisma.auditEntry.count(),
      prisma.auditEntry.count({ where: { timestamp: { gte: new Date(new Date().setHours(0,0,0,0)) } } }),
      prisma.auditEntry.count({ where: { status: "failure" } }),
    ])
    res.json({ summary: { total, today, failures } })
  } catch (err) { next(err) }
})

// ─── PUSH NOTIFICATIONS ───────────────────────────────────────────────────────

router.get("/push", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const notifications = await prisma.pushNotification.findMany({ orderBy: { createdAt: "desc" }, take: 50 })
    const stats = { total: await prisma.pushNotification.count(), sent: await prisma.pushNotification.count({ where: { status: "sent" } }), failed: await prisma.pushNotification.count({ where: { status: "failed" } }) }
    res.json({ notifications, stats })
  } catch (err) { next(err) }
})

router.post("/push/send", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const data = z.object({ title: z.string().min(1), body: z.string().min(1), platform: z.string().optional() }).parse(req.body)
    const notification = await prisma.pushNotification.create({ data: { ...data, status: "sent", sentAt: new Date() } })
    res.status(201).json({ notification })
  } catch (err) { next(err) }
})

// ─── OCR ──────────────────────────────────────────────────────────────────────

router.get("/ocr", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const jobs = await prisma.ocrJob.findMany({ orderBy: { createdAt: "desc" }, take: 50 })
    res.json({ jobs })
  } catch (err) { next(err) }
})

router.post("/ocr", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const data = z.object({ fileName: z.string().min(1) }).parse(req.body)
    const job = await prisma.ocrJob.create({ data: { ...data, status: "processing" } })
    setTimeout(async () => {
      await prisma.ocrJob.update({ where: { id: job.id }, data: { status: "completed", result: "Sample OCR text extracted successfully", confidence: 0.95, processedAt: new Date() } })
    }, 3000)
    res.status(201).json({ job })
  } catch (err) { next(err) }
})

// ─── PDF ──────────────────────────────────────────────────────────────────────

router.get("/pdf", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const jobs = await prisma.pdfJob.findMany({ orderBy: { createdAt: "desc" }, take: 50 })
    res.json({ jobs })
  } catch (err) { next(err) }
})

router.post("/pdf", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const data = z.object({ type: z.string().optional(), template: z.string().optional(), data: z.string().optional() }).parse(req.body)
    const job = await prisma.pdfJob.create({ data })
    setTimeout(async () => {
      await prisma.pdfJob.update({ where: { id: job.id }, data: { status: "completed", filePath: `/exports/pdf/${job.id}.pdf`, completedAt: new Date() } })
    }, 3000)
    res.status(201).json({ job })
  } catch (err) { next(err) }
})

// ─── EXCEL ─────────────────────────────────────────────────────────────────────

router.get("/excel", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const jobs = await prisma.excelJob.findMany({ orderBy: { createdAt: "desc" }, take: 50 })
    res.json({ jobs })
  } catch (err) { next(err) }
})

router.post("/excel", requireRole("admin", "super_admin"), async (req, res, next) => {
  try {
    const data = z.object({ type: z.string().optional(), format: z.string().optional(), data: z.string().optional() }).parse(req.body)
    const job = await prisma.excelJob.create({ data })
    setTimeout(async () => {
      await prisma.excelJob.update({ where: { id: job.id }, data: { status: "completed", filePath: `/exports/excel/${job.id}.${data.format || "xlsx"}`, totalRows: Math.floor(Math.random() * 500 + 50), completedAt: new Date() } })
    }, 3000)
    res.status(201).json({ job })
  } catch (err) { next(err) }
})

// ─── ERROR TRACKING (Sentry-like) ────────────────────────────────────────────

router.post("/error-tracking", async (req, res, next) => {
  try {
    const data = z.object({ message: z.string(), level: z.string().optional(), stack: z.string().optional(), context: z.string().optional() }).parse(req.body)
    const entry = await prisma.activityStream.create({ data: { actor: "error-tracker", action: data.message, details: data.stack || data.context, severity: data.level || "error" } })
    res.status(201).json({ entry })
  } catch (err) { next(err) }
})

router.get("/error-tracking", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const errors = await prisma.activityStream.findMany({ where: { severity: { in: ["error","critical"] } }, orderBy: { createdAt: "desc" }, take: 100 })
    const stats = { total: await prisma.activityStream.count({ where: { severity: { in: ["error","critical"] } } }), last24h: await prisma.activityStream.count({ where: { severity: { in: ["error","critical"] }, createdAt: { gte: new Date(Date.now() - 86400000) } } }) }
    res.json({ errors, stats })
  } catch (err) { next(err) }
})

// ─── CACHING ─────────────────────────────────────────────────────────────────

router.get("/cache/stats", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const entries = await prisma.cacheEntry.findMany({ orderBy: { hits: "desc" }, take: 100 })
    const stats = { total: await prisma.cacheEntry.count(), totalHits: entries.reduce((s, e) => s + e.hits, 0) }
    res.json({ entries, stats })
  } catch (err) { next(err) }
})

router.post("/cache", requireRole("admin","super_admin"), async (req, res, next) => {
  try {
    const data = z.object({ key: z.string().min(1), value: z.string(), ttl: z.number().optional() }).parse(req.body)
    const entry = await prisma.cacheEntry.upsert({ where: { key: data.key }, update: { value: data.value, hits: 0 }, create: { ...data, expiresAt: data.ttl ? new Date(Date.now() + data.ttl * 1000) : null } })
    res.status(201).json({ entry })
  } catch (err) { next(err) }
})

export { router as servicesRouter }


