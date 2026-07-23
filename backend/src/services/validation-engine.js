import { prisma } from "../db.js"

export async function validateReading(readingData) {
  const rules = await prisma.validationRule.findMany({ where: { entityType: "reading", active: true } })
  const results = []
  for (const rule of rules) {
    try {
      const condition = JSON.parse(rule.condition)
      const passed = Object.entries(condition).every(([key, val]) => {
        if (key === "maxValue") return readingData.value <= val
        if (key === "minValue") return readingData.value >= val
        return readingData[key] === val
      })
      const status = passed ? "passed" : "failed"
      await prisma.validationResult.create({
        data: { validationRuleId: rule.id, entityType: "reading", entityId: readingData.id || "pending", status, message: passed ? "Passed" : "Failed: " + rule.name },
      })
      results.push({ rule: rule.name, passed })
    } catch (e) {}
  }
  return results
}
