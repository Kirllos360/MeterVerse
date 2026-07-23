import { prisma } from "../db.js"

export async function evaluateAlerts(entityType, entityId, data) {
  const rules = await prisma.alertRule.findMany({ where: { entityType, enabled: true } })
  const alerts = []
  for (const rule of rules) {
    try {
      const condition = JSON.parse(rule.condition)
      const matches = Object.entries(condition).every(([key, val]) => data[key] === val)
      if (matches) {
        const alert = await prisma.alert.create({
          data: { alertRuleId: rule.id, entityType, entityId, message: rule.name + " triggered", severity: rule.severity, status: "open" },
        })
        alerts.push(alert)
      }
    } catch (e) {}
  }
  return alerts
}
