import { prisma } from "../db.js"

export async function trackRequest(req, res, next) {
  const start = Date.now()
  res.on("finish", async () => {
    const duration = Date.now() - start
    const entity = req.originalUrl?.split("/")[2] || "unknown"
    await prisma.activityStream.create({
      data: {
        actor: req.user?.email || "anonymous",
        actorId: req.user?.sub,
        action: req.method + " " + entity,
        resource: req.originalUrl,
        details: JSON.stringify({ duration: duration + "ms", status: res.statusCode }),
        ip: req.ip,
        severity: res.statusCode >= 400 ? "error" : "info",
      },
    }).catch(() => {})
  })
  next()
}
