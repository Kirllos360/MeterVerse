import { prisma } from "../db.js"

export async function evaluateAlerts(entityType, entityId, data) {
  const rules = await prisma.alertRule.findMany({ where: { entityType, enabled: true } })
  const alerts = []
  for (const rule of rules) {
    try {
      const condition = JSON.parse(rule.condition)
      const matches = Object.entries(condition).every(([key, val]) => data[key] === val)
      if (!matches) continue

      // Build a fingerprint for deduplication
      const fingerprint = `${entityType}:${entityId}:${rule.id}`
      
      // Check for existing open alert with same fingerprint
      const existing = await prisma.alert.findFirst({
        where: { fingerprint, status: "open", archivedAt: null },
      })
      if (existing) continue  // Skip deduplicated alert

      const alert = await prisma.alert.create({
        data: {
          alertRuleId: rule.id, entityType, entityId,
          fingerprint,
          message: rule.description || rule.name + " triggered",
          severity: rule.severity, status: "open",
        },
      })
      alerts.push(alert)

      // Escalation wiring (T03): Check escalation policy for high-severity alerts
      if (["P0", "P1", "P2"].includes(rule.severity)) {
        await escalateAlert(alert, rule)
      }
    } catch (e) { /* rule evaluation error — skip */ }
  }
  return alerts
}

async function escalateAlert(alert, rule) {
  try {
    const escalationPolicy = await prisma.escalationPolicy.findFirst({
      where: { archivedAt: null },
      include: { steps: { orderBy: { level: "asc" } } },
    })
    if (!escalationPolicy || !escalationPolicy.steps?.length) return

    // Create an incident for P0-P1 alerts
    if (["P0", "P1"].includes(rule.severity)) {
      const incident = await prisma.incident.upsert({
        where: { id: "" }, // Always create new
        create: {
          title: alert.message || rule.name,
          severity: rule.severity === "P0" ? "P0" : "P1",
          category: rule.entityType || "other",
          source: "auto_detected",
          status: "detected",
          fingerprint: alert.fingerprint,
        },
        update: {},
      })

      // Log the escalation step
      await prisma.activityStream.create({
        data: {
          action: "alert.escalated",
          resource: "Alert",
          resourceId: alert.id,
          details: JSON.stringify({
            severity: rule.severity,
            incidentId: incident.id,
            escalationPolicy: escalationPolicy.name,
          }),
          severity: rule.severity,
        },
      })
    }
  } catch (e) { /* escalation error — non-blocking */ }
}
